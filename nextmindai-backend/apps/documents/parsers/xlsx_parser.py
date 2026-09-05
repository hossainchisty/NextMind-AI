import zipfile
import xml.etree.ElementTree as ET
from typing import List, Dict

from .base import BaseDocumentParser

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
ROWS_PER_PAGE = 50


class XLSXParser(BaseDocumentParser):
    """Extract text from .xlsx workbooks using only the standard library."""

    def parse(self, file_path: str) -> List[Dict]:
        try:
            archive = zipfile.ZipFile(file_path)
        except zipfile.BadZipFile:
            raise ValueError("Invalid .xlsx file")
        with archive:
            shared = self._read_shared_strings(archive)
            sheets = self._read_sheet_names(archive)
            pages = []
            for index, (name, path) in enumerate(sheets, start=1):
                try:
                    rows = self._read_sheet(archive, path, shared)
                except KeyError:
                    continue
                if not rows:
                    continue
                header = rows[0]
                body = rows[1:] if len(rows) > 1 else rows
                for start in range(0, len(body), ROWS_PER_PAGE):
                    block = [f"Sheet: {name}"]
                    for row in body[start:start + ROWS_PER_PAGE]:
                        cells = [f"{col}: {val}" for col, val in zip(header, row) if val]
                        if cells:
                            block.append(" | ".join(cells))
                    if len(block) > 1:
                        pages.append({
                            "page_number": index if len(sheets) == 1 else len(pages) + 1,
                            "content": "\n".join(block),
                        })
        return pages

    def _read_shared_strings(self, archive: zipfile.ZipFile) -> List[str]:
        try:
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        except KeyError:
            return []
        strings = []
        for si in root.findall(f"{NS}si"):
            text = "".join(t.text or "" for t in si.iter(f"{NS}t"))
            strings.append(text)
        return strings

    def _read_sheet_names(self, archive: zipfile.ZipFile) -> List[tuple]:
        try:
            root = ET.fromstring(archive.read("xl/workbook.xml"))
        except KeyError:
            return [("Sheet1", "xl/worksheets/sheet1.xml")]
        targets = {}
        try:
            rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
            for rel in rels.iter():
                rid = rel.get("Id")
                target = rel.get("Target")
                if rid and target:
                    targets[rid] = target if target.startswith("xl/") else f"xl/{target.lstrip('/')}"
        except KeyError:
            targets = {}
        sheets = []
        for i, sheet in enumerate(root.iter(f"{NS}sheet"), start=1):
            name = sheet.get("name") or f"Sheet{i}"
            rid = sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            path = targets.get(rid, f"xl/worksheets/sheet{i}.xml")
            sheets.append((name, path))
        return sheets or [("Sheet1", "xl/worksheets/sheet1.xml")]

    def _read_sheet(self, archive: zipfile.ZipFile, path: str, shared: List[str]) -> List[List[str]]:
        root = ET.fromstring(archive.read(path))
        rows = []
        for row in root.iter(f"{NS}row"):
            cells = []
            for cell in row.findall(f"{NS}c"):
                cells.append(self._cell_text(cell, shared).strip())
            while cells and not cells[-1]:
                cells.pop()
            if any(cells):
                rows.append(cells)
        if not rows:
            return []
        width = max(len(r) for r in rows)
        header = [c or f"Column {i + 1}" for i, c in enumerate(rows[0] + [""] * (width - len(rows[0])))]
        body = [r + [""] * (width - len(r)) for r in rows[1:]]
        return [header] + body

    def _cell_text(self, cell: ET.Element, shared: List[str]) -> str:
        cell_type = cell.get("t")
        if cell_type == "inlineStr":
            return "".join(t.text or "" for t in cell.iter(f"{NS}t"))
        value_el = cell.find(f"{NS}v")
        value = value_el.text if value_el is not None and value_el.text else ""
        if cell_type == "s":
            try:
                return shared[int(value)]
            except (ValueError, IndexError):
                return ""
        return value or ""
