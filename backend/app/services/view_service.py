import json
from pathlib import Path

from app.models.product import Product


class ViewService:
    MAX_HISTORY = 20
    RECENT_LIMIT = 8

    def __init__(self, views_path: str | None = None, products_path: str | None = None) -> None:
        data_dir = Path(__file__).resolve().parents[2] / "data"
        self._views_path = Path(views_path) if views_path else data_dir / "views.json"
        self._products_path = Path(products_path) if products_path else data_dir / "products.json"

    def record_view(self, session_id: str, product_id: str) -> None:
        products_by_id = self._load_products_by_id()
        if product_id not in products_by_id:
            raise ValueError(f"Product not found: {product_id}")

        views = self._load_views()
        history = views.get(session_id, [])

        history = [pid for pid in history if pid != product_id]
        history.insert(0, product_id)
        views[session_id] = history[: self.MAX_HISTORY]

        self._save_views(views)

    def get_recent_views(self, session_id: str) -> list[Product]:
        views = self._load_views()
        history = views.get(session_id, [])[: self.RECENT_LIMIT]
        products_by_id = self._load_products_by_id()

        return [products_by_id[product_id] for product_id in history if product_id in products_by_id]

    def get_viewed_product_ids(self, session_id: str) -> list[str]:
        views = self._load_views()
        return views.get(session_id, [])

    def _load_views(self) -> dict[str, list[str]]:
        if not self._views_path.exists():
            return {}
        with self._views_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return {session_id: list(product_ids) for session_id, product_ids in payload.items()}

    def _save_views(self, views: dict[str, list[str]]) -> None:
        self._views_path.parent.mkdir(parents=True, exist_ok=True)
        with self._views_path.open("w", encoding="utf-8") as file:
            json.dump(views, file, indent=2)
            file.write("\n")

    def _load_products_by_id(self) -> dict[str, Product]:
        if not self._products_path.exists():
            return {}
        with self._products_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return {item["id"]: Product.model_validate(item) for item in payload}
