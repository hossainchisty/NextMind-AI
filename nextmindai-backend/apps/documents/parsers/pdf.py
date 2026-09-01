from typing import List, Dict

import fitz  # PyMuPDF

from .base import BaseDocumentParser


class PDFParser(BaseDocumentParser):
    def parse(self, file_path: str) -> List[Dict]:
        pages = []
        doc = fitz.open(file_path)
        for page_num, page in enumerate(doc, start=1):
            text = page.get_text()
            if text.strip():
                pages.append({
                    "page_number": page_num,
                    "content": text.strip(),
                })
        doc.close()
        return pages
