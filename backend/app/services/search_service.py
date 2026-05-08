import json
from pathlib import Path

from app.models.product import Product
from app.models.search import SearchIntent
from app.services.openai_client import OpenAIQueryParser


class SearchService:
    def __init__(self, data_path: str | None = None) -> None:
        self._query_parser = OpenAIQueryParser()
        default_path = Path(__file__).resolve().parents[2] / "data" / "products.json"
        self._data_path = Path(data_path) if data_path else default_path

    def parse_intent(self, query: str) -> SearchIntent:
        return self._query_parser.parse_query(query=query)

    def search(self, query: str) -> tuple[SearchIntent, list[Product]]:
        intent = self.parse_intent(query)
        products = self._load_products()

        if not intent.keywords:
            return intent, products

        def matches(product: Product) -> bool:
            haystack = f"{product.name} {product.description} {product.category or ''}".lower()
            return all(keyword in haystack for keyword in intent.keywords)

        filtered = [product for product in products if matches(product)]
        return intent, filtered

    def _load_products(self) -> list[Product]:
        if not self._data_path.exists():
            return []
        with self._data_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return [Product.model_validate(item) for item in payload]
