import logging
from typing import List, Dict

logger = logging.getLogger("apps")


def build_context(chunks: List[Dict], max_tokens: int = 3000) -> str:
    if not chunks:
        return "No relevant context found."

    parts = []
    total_tokens = 0

    for i, chunk in enumerate(chunks, start=1):
        section = (
            f"[SOURCE: {i}]\n"
            f"Document: {chunk['document']['name']}\n"
            f"Page: {chunk['page_number']}\n"
        )
        if chunk.get("section_title"):
            section += f"Section: {chunk['section_title']}\n"
        section += f"\n{chunk['content']}\n"

        est_tokens = len(section.split())
        if total_tokens + est_tokens > max_tokens:
            break

        parts.append(section)
        total_tokens += est_tokens

    return "\n---\n".join(parts)
