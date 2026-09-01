from typing import List, Dict

from docx import Document as DocxDocument

from .base import BaseDocumentParser


class DocxParser(BaseDocumentParser):
    def parse(self, file_path: str) -> List[Dict]:
        doc = DocxDocument(file_path)
        full_text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
        if not full_text.strip():
            return []
        return [{"page_number": 1, "content": full_text.strip()}]
