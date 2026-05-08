import json
import re
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
        scored_products: list[tuple[float, Product]] = []

        for product in products:
            score = self._score_product(product=product, intent=intent)
            if score is not None:
                scored_products.append((score, product))

        ranked = [product for _, product in sorted(scored_products, key=lambda item: (-item[0], item[1].price))]
        return intent, ranked

    def _load_products(self) -> list[Product]:
        if not self._data_path.exists():
            return []
        with self._data_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return [Product.model_validate(item) for item in payload]

    def _score_product(self, product: Product, intent: SearchIntent) -> float | None:
        fields = [product.name, product.description, product.category or "", product.color or "", " ".join(product.tags)]
        haystack = " ".join(fields).lower()
        tokenized_haystack = set(re.findall(r"[a-z0-9]+", haystack))

        if intent.max_price is not None and product.price > intent.max_price:
            return None
        if intent.color and intent.color.lower() not in tokenized_haystack:
            return None

        product_type_tokens = self._split_terms(intent.product_type)
        if product_type_tokens and not product_type_tokens.intersection(tokenized_haystack):
            return None

        score = 0.0

        for keyword in intent.keywords:
            if keyword in tokenized_haystack:
                score += 1.25

        for attr in intent.attributes:
            if attr in tokenized_haystack:
                score += 1.5

        if intent.style and intent.style in tokenized_haystack:
            score += 2.5
        if intent.color:
            score += 2.0
        if product_type_tokens:
            overlap = len(product_type_tokens.intersection(tokenized_haystack))
            score += 2.0 + overlap

        if intent.max_price is not None:
            # Slight preference for lower prices after relevance signals.
            score += max(0.0, (intent.max_price - product.price) / max(intent.max_price, 1.0))

        return score if score > 0 else None

    @staticmethod
    def _split_terms(value: str | None) -> set[str]:
        if not value:
            return set()
        return set(re.findall(r"[a-z0-9]+", value.lower()))
