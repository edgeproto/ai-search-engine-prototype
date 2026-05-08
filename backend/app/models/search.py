from pydantic import BaseModel, Field

from app.models.product import Product


class SearchIntent(BaseModel):
    keywords: list[str] = Field(default_factory=list)
    color: str | None = None
    max_price: float | None = Field(default=None, ge=0)
    product_type: str | None = None
    style: str | None = None
    attributes: list[str] = Field(default_factory=list)


class SearchResponse(BaseModel):
    query: str
    intent: SearchIntent
    results: list[Product]
    total: int
