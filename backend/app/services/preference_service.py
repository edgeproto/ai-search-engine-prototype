import json
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

from app.models.product import Product
from app.services.view_service import ViewService

MAX_BOOST = 5.0
VIEWED_PRODUCT_BOOST = 2.0
CATEGORY_MATCH_BOOST = 1.5
COLOR_MATCH_BOOST = 1.0
TAG_OVERLAP_BOOST_PER_TAG = 0.5
MAX_TAG_OVERLAP_BOOST = 2.0


@dataclass
class PreferenceSignals:
    viewed_product_ids: set[str] = field(default_factory=set)
    preferred_category: str | None = None
    preferred_color: str | None = None
    preferred_tags: set[str] = field(default_factory=set)


class PreferenceService:
    def __init__(self, view_service: ViewService | None = None) -> None:
        self._view_service = view_service or ViewService()

    def get_signals(self, session_id: str | None) -> PreferenceSignals:
        if not session_id:
            return PreferenceSignals()

        viewed_products = self._get_viewed_products(session_id)
        if not viewed_products:
            return PreferenceSignals()

        return PreferenceSignals(
            viewed_product_ids={product.id for product in viewed_products},
            preferred_category=self._most_common([product.category for product in viewed_products]),
            preferred_color=self._most_common([product.color for product in viewed_products]),
            preferred_tags=self._collect_viewed_tags(viewed_products),
        )

    def boost(self, product: Product, signals: PreferenceSignals) -> float:
        if not signals.viewed_product_ids and not signals.preferred_category and not signals.preferred_color and not signals.preferred_tags:
            return 0.0

        total = 0.0

        if product.id in signals.viewed_product_ids:
            total += VIEWED_PRODUCT_BOOST

        if signals.preferred_category and product.category == signals.preferred_category:
            total += CATEGORY_MATCH_BOOST

        if signals.preferred_color and product.color == signals.preferred_color:
            total += COLOR_MATCH_BOOST

        if signals.preferred_tags and product.tags:
            overlap = signals.preferred_tags.intersection(product.tags)
            total += min(len(overlap) * TAG_OVERLAP_BOOST_PER_TAG, MAX_TAG_OVERLAP_BOOST)

        return min(total, MAX_BOOST)

    def _get_viewed_products(self, session_id: str) -> list[Product]:
        product_ids = self._view_service.get_viewed_product_ids(session_id)
        products_by_id = self._load_products_by_id()
        return [products_by_id[product_id] for product_id in product_ids if product_id in products_by_id]

    def _load_products_by_id(self) -> dict[str, Product]:
        products_path = Path(__file__).resolve().parents[2] / "data" / "products.json"
        if not products_path.exists():
            return {}
        with products_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return {item["id"]: Product.model_validate(item) for item in payload}

    @staticmethod
    def _most_common(values: list[str | None]) -> str | None:
        filtered = [value for value in values if value]
        if not filtered:
            return None

        counts = Counter(filtered)
        max_count = max(counts.values())
        top_values = {value for value, count in counts.items() if count == max_count}

        for value in values:
            if value in top_values:
                return value

        return None

    @staticmethod
    def _collect_viewed_tags(viewed_products: list[Product]) -> set[str]:
        tags: set[str] = set()
        for product in viewed_products:
            tags.update(product.tags)
        return tags
