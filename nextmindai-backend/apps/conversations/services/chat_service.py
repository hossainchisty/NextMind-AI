import logging
import time
from typing import Dict, Optional
from uuid import UUID

from apps.conversations.models import Conversation, Message
from apps.retrieval.services.pipeline import hybrid_search
from apps.retrieval.services.reranker import get_reranker
from apps.ai.services.context_builder import build_context
from apps.ai.services.generation import get_llm_provider
from apps.ai.services.query_rewriter import rewrite_query

logger = logging.getLogger("apps")


class ChatService:
    def __init__(self, user):
        self.user = user

    def chat(
        self,
        message: str,
        conversation_id: Optional[UUID] = None,
        collection_id: Optional[UUID] = None,
    ) -> Dict:
        conversation = self._get_or_create_conversation(conversation_id, collection_id)

        Message.objects.create(
            conversation=conversation,
            role="user",
            content=message,
        )

        history = self._get_history(conversation)
        search_query = rewrite_query(message, history, user=self.user)

        retrieval_start = time.time()
        candidates = hybrid_search(
            query=search_query,
            user_id=self.user.id,
            collection_id=collection_id,
            top_k=30,
        )
        retrieval_time = time.time() - retrieval_start

        reranker = get_reranker()
        context_chunks = reranker.rerank(search_query, candidates, top_k=5)

        context = build_context(context_chunks)

        provider = get_llm_provider(user=self.user)
        answer = provider.generate(
            messages=self._build_messages(message, context),
        )

        citations = self._extract_citations(answer, context_chunks)

        assistant_msg = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=answer,
            metadata={
                "citations": citations,
                "retrieval_time": retrieval_time,
                "chunks_used": len(context_chunks),
            },
        )

        if conversation.title == "New Conversation":
            conversation.title = message[:100]
            conversation.save(update_fields=["title"])

        return {
            "conversation_id": str(conversation.id),
            "message": {
                "id": str(assistant_msg.id),
                "role": "assistant",
                "content": answer,
                "citations": citations,
            },
        }

    def _get_or_create_conversation(self, conversation_id, collection_id):
        if conversation_id:
            try:
                return Conversation.objects.get(id=conversation_id, user=self.user)
            except Conversation.DoesNotExist:
                pass
        return Conversation.objects.create(
            user=self.user,
            collection_id=collection_id,
        )

    def _get_history(self, conversation):
        return list(
            Message.objects.filter(conversation=conversation)
            .order_by("-created_at")[:10]
        )

    def _build_messages(self, user_message, context):
        messages = [
            {"role": "system", "content": self._system_prompt(context)},
        ]
        messages.append({"role": "user", "content": user_message})
        return messages

    def _system_prompt(self, context):
        return (
            "You are a helpful AI assistant. Answer based on the provided context. "
            "Cite sources using [1], [2], etc. If the context doesn't contain the answer, "
            "say so honestly.\n\n"
            f"CONTEXT:\n{context}"
        )

    def _extract_citations(self, answer, context_chunks):
        import re
        citations = []
        pattern = re.compile(r"\[(\d+)\]")
        used = set(pattern.findall(answer))

        for num_str in used:
            try:
                idx = int(num_str) - 1
                if 0 <= idx < len(context_chunks):
                    chunk = context_chunks[idx]
                    citations.append({
                        "source_id": int(num_str),
                        "document_id": chunk["document"]["id"],
                        "document_name": chunk["document"]["name"],
                        "page_number": chunk["page_number"],
                        "section_title": chunk.get("section_title", ""),
                    })
            except (ValueError, IndexError):
                continue
        return citations
