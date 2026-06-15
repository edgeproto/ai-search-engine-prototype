from fastapi import APIRouter, Header, Query

from app.models.search import SearchResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["search"])
search_service = SearchService()


@router.get("", response_model=SearchResponse)
def search_products(
    q: str = Query(..., min_length=1),
    x_session_id: str | None = Header(default=None, alias="X-Session-Id"),
) -> SearchResponse:
    intent, results = search_service.search(query=q, session_id=x_session_id)
    return SearchResponse(query=q, intent=intent, results=results, total=len(results))
