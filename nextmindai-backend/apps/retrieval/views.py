import logging
import time

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.retrieval.services.pipeline import hybrid_search
from apps.retrieval.services.reranker import get_reranker
from apps.core.utils import success_response


class SearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "").strip()
        collection_id = request.data.get("collection_id")
        top_k = request.data.get("top_k", 20)

        if not query:
            return Response(
                {"success": False, "message": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        candidates = hybrid_search(
            query=query,
            user_id=request.user.id,
            collection_id=collection_id,
            top_k=top_k,
        )

        reranker = get_reranker()
        results = reranker.rerank(query, candidates, top_k=5)

        return Response(success_response(data={"results": results}))
