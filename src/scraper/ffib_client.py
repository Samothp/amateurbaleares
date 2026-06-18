"""HTTP client for ffib.es with cookie handling."""

import time
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

BASE_URL = "https://www.ffib.es"

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ca,es;q=0.9,en;q=0.8",
}


class FFIBClient:
    """HTTP client that handles ffib.es cookie consent."""

    def __init__(self, delay: float = 1.5):
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        self.delay = delay
        self._cookies_ready = False

    def _ensure_cookies(self) -> None:
        """Visit base URL to get session cookies."""
        if self._cookies_ready:
            return
        try:
            resp = self.session.get(BASE_URL, timeout=15)
            logger.info("Base URL status: %d, cookies: %s", resp.status_code, dict(self.session.cookies))
            self._cookies_ready = True
        except requests.RequestException as e:
            logger.warning("Failed to initialize cookies: %s", e)

    def get(self, url: str, retries: int = 3) -> Optional[str]:
        """GET a page from ffib.es with retries and rate limiting."""
        self._ensure_cookies()

        if not url.startswith("http"):
            url = BASE_URL + url

        for attempt in range(retries):
            try:
                time.sleep(self.delay)
                resp = self.session.get(url, timeout=20)

                if resp.status_code != 200:
                    logger.warning("HTTP %d for %s (attempt %d)", resp.status_code, url, attempt + 1)
                    continue

                text = resp.text
                if "No se ha aceptado el cookie" in text or len(text.strip()) < 100:
                    logger.warning("Cookie not accepted, retrying with fresh session (attempt %d)", attempt + 1)
                    self.session.cookies.clear()
                    self._cookies_ready = False
                    self._ensure_cookies()
                    continue

                return text

            except requests.RequestException as e:
                logger.warning("Request error for %s (attempt %d): %s", url, attempt + 1, e)
                time.sleep(2)

        logger.error("Failed to fetch %s after %d attempts", url, retries)
        return None
