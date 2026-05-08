from pydantic import BaseModel, Field


class Product(BaseModel):
    id: str
    name: str
    description: str
    color: str | None = None
    price: float = Field(ge=0)
    image_url: str | None = None
    category: str | None = None
    tags: list[str] = Field(default_factory=list)
