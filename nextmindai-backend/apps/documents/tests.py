import os
import tempfile

from django.contrib.auth import get_user_model
from django.test import TestCase

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
