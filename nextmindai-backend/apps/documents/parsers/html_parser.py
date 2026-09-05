import html as html_module
from html.parser import HTMLParser as _BaseHTMLParser
from typing import List, Dict

from .base import BaseDocumentParser

SKIP_TAGS = {"script", "style", "noscript", "template"}
BLOCK_TAGS = {
    "p", "div", "section", "article", "header", "footer", "main",
    "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "br",
    "blockquote", "pre", "hr", "table", "ul", "ol",
}


class _TextExtractor(_BaseHTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: List[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in SKIP_TAGS:
            self._skip_depth += 1
        elif tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in SKIP_TAGS and self._skip_depth:
            self._skip_depth -= 1
        elif tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self._skip_depth:
            return
        text = data.strip()
        if text:
            self.parts.append(text + " ")


class HTMLTextParser(BaseDocumentParser):
    """Extract readable text from .html/.htm files (stdlib only)."""

    def parse(self, file_path: str) -> List[Dict]:
        with open(file_path, "r", encoding="utf-8-sig", errors="replace") as f:
            raw = f.read()
        if not raw.strip():
            return []

        extractor = _TextExtractor()
        extractor.feed(raw)
        text = html_module.unescape("".join(extractor.parts))
        lines = [line.strip() for line in text.splitlines()]
        cleaned = "\n".join(line for line in lines if line).strip()
        if not cleaned:
            return []
        return [{"page_number": 1, "content": cleaned}]
