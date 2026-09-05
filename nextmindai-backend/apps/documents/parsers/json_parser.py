import json
from typing import List, Dict

from .base import BaseDocumentParser

MAX_TEXT_CHARS = 1_000_000


class JSONParser(BaseDocumentParser):
    def parse(self, file_path: str) -> List[Dict]:
        with open(file_path, "r", encoding="utf-8-sig", errors="replace") as f:
            raw = f.read()
        if not raw.strip():
            return []

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = self._try_json_lines(raw)

        if data is None:
            raise ValueError("Invalid JSON file")

        text = self._to_text(data).strip()
        if not text:
            return []
        return [{"page_number": 1, "content": text[:MAX_TEXT_CHARS]}]

    def _try_json_lines(self, raw: str):
        records = []
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                return None
        return records or None

    def _to_text(self, data, depth: int = 0) -> str:
        if isinstance(data, str):
            return data
        if isinstance(data, (int, float, bool)) or data is None:
            return str(data)
        if isinstance(data, list):
            return "\n".join(self._to_text(item, depth + 1) for item in data)
        if isinstance(data, dict):
            lines = []
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    lines.append(f"{key}:")
                    lines.append(self._to_text(value, depth + 1))
                else:
                    lines.append(f"{key}: {value}")
            return "\n".join(lines)
        return str(data)
