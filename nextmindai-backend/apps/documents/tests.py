import io
import os
import tempfile
import zipfile
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from apps.core.constants import infer_file_type
from apps.documents.serializers import validate_uploaded_file
from apps.documents.services.cleaning import clean_text
from apps.documents.services.chunking import chunk_text

User = get_user_model()


class CleanTextTest(TestCase):
    def test_clean_basic(self):
        result = clean_text("Hello   world")
        self.assertEqual(result, "Hello world")

    def test_clean_newlines(self):
        result = clean_text("a\n\n\n\nb")
        self.assertEqual(result, "a\n\nb")

    def test_clean_null_bytes(self):
        result = clean_text("hello\x00world")
        self.assertEqual(result, "helloworld")

    def test_clean_whitespace(self):
        result = clean_text("  hello  ")
        self.assertEqual(result, "hello")


class ChunkTextTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="pass1234")
        from apps.documents.models import Document
        self.doc = Document.objects.create(
            user=self.user,
            name="test.txt",
            original_filename="test.txt",
            file_type="txt",
            file_size=100,
        )

    def test_chunk_single_page(self):
        pages = [{"page_number": 1, "content": "Short document."}]
        chunks = chunk_text(pages, self.doc)
        self.assertGreater(len(chunks), 0)
        self.assertEqual(chunks[0]["page_number"], 1)

    def test_chunk_preserves_page_number(self):
        pages = [
            {"page_number": 1, "content": "Page one content."},
            {"page_number": 2, "content": "Page two content."},
        ]
        chunks = chunk_text(pages, self.doc)
        page_numbers = {c["page_number"] for c in chunks}
        self.assertIn(1, page_numbers)
        self.assertIn(2, page_numbers)

    def test_chunk_empty_pages(self):
        pages = [{"page_number": 1, "content": ""}]
        chunks = chunk_text(pages, self.doc)
        self.assertEqual(len(chunks), 0)

    def test_chunk_metadata(self):
        pages = [{"page_number": 1, "content": "Some content here."}]
        chunks = chunk_text(pages, self.doc)
        for chunk in chunks:
            self.assertIn("content", chunk)
            self.assertIn("chunk_index", chunk)
            self.assertIn("token_count", chunk)
            self.assertIn("section_title", chunk)


class InferFileTypeTest(TestCase):
    def test_extension_wins_over_generic_mime(self):
        self.assertEqual(
            infer_file_type("data.csv", "application/octet-stream"), "csv"
        )
        self.assertEqual(infer_file_type("notes.md", "text/plain"), "md")
        self.assertEqual(infer_file_type("page.htm", "text/plain"), "html")

    def test_mime_fallback_without_extension(self):
        self.assertEqual(infer_file_type("noext", "application/json"), "json")
        self.assertEqual(
            infer_file_type(
                "noext",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ),
            "xlsx",
        )

    def test_unsupported_returns_none(self):
        self.assertIsNone(infer_file_type("malware.exe", "application/octet-stream"))
        self.assertIsNone(infer_file_type("archive.zip", "application/zip"))


class UploadValidationTest(TestCase):
    def test_supported_types_pass(self):
        for filename, content_type in [
            ("a.pdf", "application/pdf"),
            ("a.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            ("a.txt", "text/plain"),
            ("a.csv", "application/octet-stream"),
            ("a.md", "text/plain"),
            ("a.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            ("a.json", "application/octet-stream"),
            ("a.html", "text/html"),
        ]:
            upload = SimpleUploadedFile(filename, b"hello", content_type=content_type)
            self.assertEqual(validate_uploaded_file(upload), upload)

    def test_unsupported_type_rejected(self):
        from rest_framework import serializers

        upload = SimpleUploadedFile("a.exe", b"x", content_type="application/octet-stream")
        with self.assertRaises(serializers.ValidationError):
            validate_uploaded_file(upload)

    @override_settings(MAX_UPLOAD_SIZE=10)
    def test_oversize_rejected(self):
        from rest_framework import serializers

        upload = SimpleUploadedFile("a.txt", b"0123456789!", content_type="text/plain")
        with self.assertRaises(serializers.ValidationError):
            validate_uploaded_file(upload)


class NewParserTest(TestCase):
    def _temp_path(self, suffix, content):
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode="w", encoding="utf-8")
        tmp.write(content)
        tmp.close()
        self.addCleanup(os.unlink, tmp.name)
        return tmp.name

    def test_csv_parser(self):
        from apps.documents.parsers.csv_parser import CSVParser

        path = self._temp_path(".csv", "name,age\nAna,30\nBo,25\n")
        pages = CSVParser().parse(path)
        self.assertEqual(len(pages), 1)
        self.assertIn("name: Ana", pages[0]["content"])
        self.assertIn("age: 30", pages[0]["content"])

    def test_json_parser(self):
        from apps.documents.parsers.json_parser import JSONParser

        path = self._temp_path(".json", '{"title": "Report", "total": 3}')
        pages = JSONParser().parse(path)
        self.assertEqual(len(pages), 1)
        self.assertIn("title: Report", pages[0]["content"])

    def test_json_lines_parser(self):
        from apps.documents.parsers.json_parser import JSONParser

        path = self._temp_path(".json", '{"a": 1}\n{"a": 2}\n')
        pages = JSONParser().parse(path)
        self.assertEqual(len(pages), 1)
        self.assertIn("a: 1", pages[0]["content"])

    def test_html_parser_skips_scripts(self):
        from apps.documents.parsers.html_parser import HTMLTextParser

        path = self._temp_path(
            ".html",
            "<html><head><style>.x{color:red}</style></head>"
            "<body><h1>Title</h1><p>Hello world</p>"
            "<script>alert(1)</script></body></html>",
        )
        pages = HTMLTextParser().parse(path)
        self.assertEqual(len(pages), 1)
        self.assertIn("Title", pages[0]["content"])
        self.assertIn("Hello world", pages[0]["content"])
        self.assertNotIn("alert", pages[0]["content"])

    def test_xlsx_parser(self):
        from apps.documents.parsers.xlsx_parser import XLSXParser

        buffer = io.BytesIO()
        ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
        with zipfile.ZipFile(buffer, "w") as archive:
            archive.writestr(
                "xl/workbook.xml",
                f'<workbook xmlns="{ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
                '<sheets><sheet name="People" sheetId="1" r:id="rId1"/></sheets></workbook>',
            )
            archive.writestr(
                "xl/_rels/workbook.xml.rels",
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"'
                ' Target="worksheets/sheet1.xml"/></Relationships>',
            )
            archive.writestr(
                "xl/sharedStrings.xml",
                f'<sst xmlns="{ns}"><si><t>Name</t></si><si><t>Age</t></si><si><t>Ana</t></si></sst>',
            )
            archive.writestr(
                "xl/worksheets/sheet1.xml",
                f'<worksheet xmlns="{ns}"><sheetData>'
                '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>'
                '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>30</v></c></row>'
                "</sheetData></worksheet>",
            )
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
        tmp.write(buffer.getvalue())
        tmp.close()
        self.addCleanup(os.unlink, tmp.name)

        pages = XLSXParser().parse(tmp.name)
        self.assertEqual(len(pages), 1)
        self.assertIn("Sheet: People", pages[0]["content"])
        self.assertIn("Name: Ana", pages[0]["content"])
        self.assertIn("Age: 30", pages[0]["content"])


class DocumentUploadAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="uploader@test.com", password="pass1234")
        self.other = User.objects.create_user(email="other@test.com", password="pass1234")
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token = str(RefreshToken.for_user(self.user).access_token)
        from apps.knowledge.models import Collection
        self.collection = Collection.objects.create(user=self.user, name="Mine")
        self.other_collection = Collection.objects.create(user=self.other, name="Theirs")

    def _auth(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    @patch("apps.documents.tasks.process_document_task.delay")
    @patch("apps.documents.services.storage.upload_to_r2")
    def test_batch_upload_two_files(self, mock_upload, mock_delay):
        from apps.documents.models import Document

        files = [
            SimpleUploadedFile("one.txt", b"hello one", content_type="text/plain"),
            SimpleUploadedFile("two.md", b"# Title\nbody", content_type="text/markdown"),
        ]
        response = self.client.post(
            "/api/v1/documents/",
            {"files": files, "collection": str(self.collection.id)},
            **self._auth(),
        )
        self.assertEqual(response.status_code, 201)
        payload = response.json()["data"]
        self.assertEqual(len(payload["documents"]), 2)
        self.assertEqual(payload["errors"], [])
        self.assertEqual(mock_upload.call_count, 2)
        self.assertEqual(mock_delay.call_count, 2)
        types = {doc["file_type"] for doc in payload["documents"]}
        self.assertEqual(types, {"txt", "md"})
        self.assertEqual(
            Document.objects.filter(user=self.user).count(), 2
        )

    def test_batch_limit_rejected(self):
        from apps.documents.models import Document

        files = [
            SimpleUploadedFile(f"f{i}.txt", b"x", content_type="text/plain")
            for i in range(41)
        ]
        response = self.client.post(
            "/api/v1/documents/", {"files": files}, **self._auth()
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Maximum batch size", response.json()["message"])
        self.assertEqual(Document.objects.filter(user=self.user).count(), 0)

    @patch("apps.documents.tasks.process_document_task.delay")
    @patch("apps.documents.services.storage.upload_to_r2")
    def test_batch_rejects_other_users_collection(self, mock_upload, mock_delay):
        from apps.documents.models import Document

        response = self.client.post(
            "/api/v1/documents/",
            {
                "files": [SimpleUploadedFile("one.txt", b"hi", content_type="text/plain")],
                "collection": str(self.other_collection.id),
            },
            **self._auth(),
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Document.objects.filter(user=self.user).count(), 0)
        mock_upload.assert_not_called()
        mock_delay.assert_not_called()

    @patch("apps.documents.tasks.process_document_task.delay")
    @patch("apps.documents.services.storage.delete_from_r2")
    @patch("apps.documents.services.storage.upload_to_r2")
    def test_reupload_replaces_file(self, mock_upload, mock_delete, mock_delay):
        from rest_framework.test import APIClient

        from apps.documents.models import Document
        from apps.knowledge.models import DocumentChunk

        doc = Document.objects.create(
            user=self.user,
            name="report.csv",
            original_filename="report.csv",
            file_key="old/key.csv",
            file_type="csv",
            file_size=10,
            status="completed",
            page_count=2,
        )
        DocumentChunk.objects.create(document=doc, content="old", chunk_index=0)

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        response = client.patch(
            f"/api/v1/documents/{doc.id}/",
            {"file": SimpleUploadedFile("report-v2.csv", b"a,b\n1,2\n", content_type="text/csv")},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        doc.refresh_from_db()
        self.assertEqual(doc.original_filename, "report-v2.csv")
        self.assertEqual(doc.file_type, "csv")
        self.assertEqual(doc.status, "pending")
        self.assertEqual(doc.page_count, 0)
        self.assertEqual(DocumentChunk.objects.filter(document=doc).count(), 0)
        mock_upload.assert_called_once()
        mock_delete.assert_called_once_with("old/key.csv")
        mock_delay.assert_called_once()

