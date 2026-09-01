from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response


class StandardResultsPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100
    limit_query_param = "limit"
    offset_query_param = "offset"

    def get_paginated_response(self, data):
        has_next = (self.offset + self.limit) < self.count
        return Response(
            {
                "success": True,
                "data": data,
                "pagination": {
                    "count": self.count,
                    "limit": self.limit,
                    "offset": self.offset,
                    "has_next": has_next,
                },
            }
        )
