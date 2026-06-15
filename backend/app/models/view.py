from pydantic import BaseModel

from app.models.product import Product


class ViewRecordRequest(BaseModel):
    product_id: str


class RecentViewsResponse(BaseModel):
    products: list[Product]
