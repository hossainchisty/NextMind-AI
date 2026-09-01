from typing import List, Dict

from .base import BaseDocumentParser


class MarkdownParser(BaseDocumentParser):
    def parse(self, file_path: str) -> List[Dict]:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
        if not text.strip():
            return []
        return [{"page_number": 1, "content": text.strip()}]
