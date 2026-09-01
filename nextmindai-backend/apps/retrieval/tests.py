from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.retrieval.services.fusion import reciprocal_rank_fusion

User = get_user_model()


class RRFFusionTest(TestCase):
    def _make_result(self, chunk_id, **kwargs):
        base = {
            "chunk_id": chunk_id,
            "content": f"Content {chunk_id}",
            "document": {"id": "doc1", "name": "test.pdf"},
            "page_number": 1,
            "section_title": "",
            "chunk_index": 0,
            "dense_score": 0.0,
            "bm25_score": 0.0,
        }
        base.update(kwargs)
        return base

    def test_fusion_combines_results(self):
        dense = [
            self._make_result("c1", dense_score=0.9),
            self._make_result("c2", dense_score=0.8),
        ]
        bm25 = [
            self._make_result("c2", bm25_score=5.0),
            self._make_result("c3", bm25_score=3.0),
        ]
        result = reciprocal_rank_fusion(dense, bm25)
        chunk_ids = [r["chunk_id"] for r in result]
        self.assertIn("c1", chunk_ids)
        self.assertIn("c2", chunk_ids)
        self.assertIn("c3", chunk_ids)

    def test_fusion_ranks_overlap_highest(self):
        dense = [
            self._make_result("c1", dense_score=0.9),
            self._make_result("c2", dense_score=0.7),
        ]
        bm25 = [
            self._make_result("c1", bm25_score=5.0),
            self._make_result("c3", bm25_score=3.0),
        ]
        result = reciprocal_rank_fusion(dense, bm25)
        self.assertEqual(result[0]["chunk_id"], "c1")

    def test_fusion_empty_inputs(self):
        result = reciprocal_rank_fusion([], [])
        self.assertEqual(len(result), 0)

    def test_fusion_single_source(self):
        dense = [self._make_result("c1", dense_score=0.9)]
        result = reciprocal_rank_fusion(dense, [])
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["chunk_id"], "c1")


class DenseSearchTest(TestCase):
    def test_empty_search(self):
        from apps.retrieval.services.dense import dense_search
        self.user = User.objects.create_user(email="test@test.com", password="pass1234")
        results = dense_search("test query", self.user.id)
        self.assertEqual(len(results), 0)
