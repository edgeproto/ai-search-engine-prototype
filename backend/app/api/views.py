from fastapi import APIRouter, Header, HTTPException

from app.models.view import RecentViewsResponse, ViewRecordRequest
from app.services.view_service import ViewService

router = APIRouter(prefix="/views", tags=["views"])
view_service = ViewService()


def _require_session_id(x_session_id: str | None) -> str:
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-Id header is required")
    return x_session_id


@router.post("")
def record_view(
    request: ViewRecordRequest,
    x_session_id: str | None = Header(default=None, alias="X-Session-Id"),
) -> dict[str, str]:
    session_id = _require_session_id(x_session_id)
    try:
        view_service.record_view(session_id=session_id, product_id=request.product_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return {"status": "ok"}


@router.get("/recent", response_model=RecentViewsResponse)
def get_recent_views(
    x_session_id: str | None = Header(default=None, alias="X-Session-Id"),
) -> RecentViewsResponse:
    session_id = _require_session_id(x_session_id)
    products = view_service.get_recent_views(session_id=session_id)
    return RecentViewsResponse(products=products)
