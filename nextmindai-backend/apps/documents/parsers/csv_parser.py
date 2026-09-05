import csv
from typing import List, Dict

from .base import BaseDocumentParser

ROWS_PER_PAGE = 50


class CSVParser(BaseDocumentParser):
    def parse(self, file_path: str) -> List[Dict]:
        with open(file_path, "r", encoding="utf-8-sig", errors="replace", newline="") as f:
            sample = f.read(8192)
            f.seek(0)
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=[",", ";", "\t", "|"])
            except csv.Error:
                dialect = csv.excel
            reader = csv.reader(f, dialect)
            rows = [[cell.strip() for cell in row] for row in reader if any(c.strip() for c in row)]

        if not rows:
            return []

        header = rows[0]
        has_header = any(not _looks_numeric(cell) for cell in header)
        if has_header and len(rows) == 1:
            return []
        body = rows[1:] if has_header and len(rows) > 1 else rows
        columns = header if has_header else [f"Column {i + 1}" for i in range(len(rows[0]))]

        pages = []
        for start in range(0, len(body), ROWS_PER_PAGE):
            block = []
            for row in body[start:start + ROWS_PER_PAGE]:
                cells = [f"{col}: {val}" for col, val in zip(columns, row) if val]
                if cells:
                    block.append(" | ".join(cells))
            if block:
                pages.append({
                    "page_number": len(pages) + 1,
                    "content": "\n".join(block),
                })
        return pages


def _looks_numeric(value: str) -> bool:
    try:
        float(value.replace(",", ""))
        return True
    except (ValueError, AttributeError):
        return False
