import os
from typing import List, Dict

from apps.documents.parsers.pdf import PDFParser
from apps.documents.parsers.docx_parser import DocxParser
from apps.documents.parsers.txt import TXTParser
from apps.documents.parsers.markdown import MarkdownParser
from apps.documents.parsers.csv_parser import CSVParser
from apps.documents.parsers.xlsx_parser import XLSXParser
from apps.documents.parsers.json_parser import JSONParser
from apps.documents.parsers.html_parser import HTMLTextParser

PARSER_MAP = {
    "pdf": PDFParser(),
    "docx": DocxParser(),
    "txt": TXTParser(),
    "md": MarkdownParser(),
    "csv": CSVParser(),
    "xlsx": XLSXParser(),
    "json": JSONParser(),
    "html": HTMLTextParser(),
}


def parse_document(document) -> List[Dict]:
    parser = PARSER_MAP.get(document.file_type)
    if not parser:
        raise ValueError(f"No parser for file type: {document.file_type}")

    from apps.documents.services.storage import download_from_r2

    tmp_path = None
    try:
        tmp_path = download_from_r2(document.file_key)
        pages = parser.parse(tmp_path)
        return pages
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
