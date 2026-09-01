import logging
from typing import List, Dict, Optional

logger = logging.getLogger("apps")


def rewrite_query(message: str, history: List[Dict], use_llm: bool = False) -> str:
    if not use_llm or not history:
        return message

    history_text = "\n".join(
        f"{m['role']}: {m.content}" if hasattr(m, "content") else f"{m['role']}: {m.get('content', '')}"
        for m in history[-4:]
    )

    prompt = (
        f"Rewrite the following follow-up question as a standalone search query.\n\n"
        f"Conversation:\n{history_text}\n\n"
        f"Follow-up: {message}\n\n"
        f"Standalone query:"
    )

    try:
        from apps.ai.services.generation import get_llm_provider
        provider = get_llm_provider()
        result = provider.generate(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=100,
        )
        return result.strip() if result.strip() else message
    except Exception as e:
        logger.warning("Query rewrite failed: %s", e)
        return message
