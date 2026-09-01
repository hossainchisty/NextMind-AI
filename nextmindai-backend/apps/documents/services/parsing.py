from typing import List, Dict

from apps.documents.parsers.pdf import PDFParser
from apps.documents.parsers.docx_parser import DocxParser
from apps.documents.parsers.txt import TXTParser
from apps.documents.parsers.markdown import MarkdownParser

PARSER_MAP = {
    "pdf": PDFParser(),
    "docx": DocxParser(),
    "txt": TXTParser(),
    "md": MarkdownParser(),
}


def parse_document(document) -> List[Dict]:
    parser = PARSER_MAP.get(document.file_type)
    if not parser:
        raise ValueError(f"No parser for file type: {document.file_type}")
    return parser.parse(document.file.path)
