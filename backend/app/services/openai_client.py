from app.models.search import SearchIntent


class OpenAIQueryParser:
    """
    Minimal parser scaffold.

    This intentionally provides deterministic local parsing so the API works
    before wiring real OpenAI calls.
    """

    def parse_query(self, query: str) -> SearchIntent:
        tokens = [token.strip().lower() for token in query.split() if token.strip()]
        return SearchIntent(keywords=tokens)
