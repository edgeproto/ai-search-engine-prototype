import json
import re

from openai import OpenAI

from app.core.config import get_settings
from app.models.search import SearchIntent


class OpenAIQueryParser:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = OpenAI(api_key=self._settings.openai_api_key) if self._settings.openai_api_key else None

    def parse_query(self, query: str) -> SearchIntent:
        if self._client is not None:
            intent = self._parse_with_openai(query=query)
            if intent is not None:
                return intent
        return self._parse_locally(query=query)

    def _parse_with_openai(self, query: str) -> SearchIntent | None:
        try:
            response = self._client.responses.create(
                model=self._settings.openai_model,
                input=[
                    {
                        "role": "system",
                        "content": (
                            "Extract structured shopping intent from user search queries. "
                            "Return strict JSON with keys: keywords (string[]), color (string|null), "
                            "max_price (number|null), product_type (string|null), style (string|null), "
                            "attributes (string[]). Only return JSON."
                        ),
                    },
                    {"role": "user", "content": query},
                ],
            )
            parsed = json.loads(response.output_text.strip())
            return SearchIntent.model_validate(parsed)
        except Exception:
            # Intentionally fail open so local parsing still works.
            return None

    def _parse_locally(self, query: str) -> SearchIntent:
        lowered = query.lower()
        tokens = [token for token in re.findall(r"[a-z0-9]+", lowered) if token]

        color = None
        known_colors = {
            "black",
            "white",
            "grey",
            "gray",
            "navy",
            "red",
            "pink",
            "yellow",
            "olive",
            "cream",
            "beige",
            "charcoal",
        }
        for token in tokens:
            if token in known_colors:
                color = "grey" if token == "gray" else token
                break

        max_price = None
        under_match = re.search(r"(?:under|below|less than)\s*\$?\s*(\d+(?:\.\d+)?)", lowered)
        if under_match:
            max_price = float(under_match.group(1))
        else:
            explicit_price = re.search(r"\$\s*(\d+(?:\.\d+)?)", lowered)
            if explicit_price:
                max_price = float(explicit_price.group(1))

        phrase_rules = {
            "running shoes": "running shoes",
            "gaming mouse": "gaming mouse",
            "wireless mouse": "gaming mouse",
            "hoodie": "hoodie",
            "hoodies": "hoodie",
        }
        product_type = None
        for phrase, mapped in phrase_rules.items():
            if phrase in lowered:
                product_type = mapped
                break

        known_styles = {"minimalist", "oversized", "cropped", "wireless", "wired", "trail", "cushioned"}
        style = next((token for token in tokens if token in known_styles), None)

        stopwords = {
            "a",
            "an",
            "and",
            "for",
            "the",
            "to",
            "of",
            "with",
            "under",
            "below",
            "less",
            "than",
        }
        keywords = [token for token in tokens if token not in stopwords and not token.isdigit()]
        attributes = [token for token in keywords if token not in {product_type or "", color or "", style or ""}]

        return SearchIntent(
            keywords=keywords,
            color=color,
            max_price=max_price,
            product_type=product_type,
            style=style,
            attributes=attributes,
        )
