from fastapi import APIRouter, Query

from app.models.search import SearchResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["search"])
search_service = SearchService()


@router.get("", response_model=SearchResponse)
def search_products(q: str = Query(..., min_length=1)) -> SearchResponse:
    intent, results = search_service.search(query=q)
    return SearchResponse(query=q, intent=intent, results=results, total=len(results))
