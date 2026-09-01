import re
from typing import List, Dict

from django.conf import settings

from .cleaning import clean_text


def chunk_text(pages: List[Dict], document) -> List[Dict]:
    chunk_size = getattr(settings, "CHUNK_SIZE", 800)
    chunk_overlap = getattr(settings, "CHUNK_OVERLAP", 150)

    all_chunks = []
    chunk_index = 0

    for page in pages:
        text = clean_text(page["content"])
        if not text:
            continue

        paragraphs = re.split(r"\n\n+", text)
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) + 1 <= chunk_size:
                current_chunk = f"{current_chunk}\n{para}".strip() if current_chunk else para
            else:
                if current_chunk:
                    all_chunks.append(_make_chunk(current_chunk, document, chunk_index, page))
                    chunk_index += 1
                if len(para) > chunk_size:
                    sub_chunks = _split_long_text(para, chunk_size, chunk_overlap)
                    for sc in sub_chunks[:-1]:
                        all_chunks.append(_make_chunk(sc, document, chunk_index, page))
                        chunk_index += 1
                    current_chunk = sub_chunks[-1] if sub_chunks else ""
                else:
                    current_chunk = para

        if current_chunk:
            all_chunks.append(_make_chunk(current_chunk, document, chunk_index, page))
            chunk_index += 1

    return all_chunks


def _make_chunk(content: str, document, chunk_index: int, page: Dict) -> Dict:
    return {
        "content": content,
        "chunk_index": chunk_index,
        "page_number": page["page_number"],
        "section_title": _extract_section_title(content),
        "token_count": len(content.split()),
    }


def _extract_section_title(text: str) -> str:
    lines = text.strip().split("\n")
    for line in lines[:3]:
        line = line.strip()
        if line.startswith("#"):
            return line.lstrip("#").strip()
        if len(line) < 100 and line.endswith(":"):
            return line[:-1].strip()
        if line and len(line) < 80:
            return line
    return ""


def _split_long_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) + 1 <= chunk_size:
            current = f"{current} {sentence}".strip() if current else sentence
        else:
            if current:
                chunks.append(current)
                if overlap > 0:
                    words = current.split()
                    overlap_words = words[-overlap // 4:] if len(words) > overlap // 4 else []
                    current = " ".join(overlap_words) + " " + sentence
                else:
                    current = sentence
            else:
                chunks.append(sentence[:chunk_size])
                current = sentence[chunk_size:]

    if current:
        chunks.append(current)
    return chunks if chunks else [text[:chunk_size]]
