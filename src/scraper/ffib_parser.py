"""HTML parser for ffib.es pages."""

import re
import logging
from bs4 import BeautifulSoup
from typing import Optional

logger = logging.getLogger(__name__)


def parse_club_page(html: str) -> Optional[dict]:
    """Parse a club page to extract club info and its teams.

    Returns dict with keys:
        ffib_code, name, delegation, city, teams: list of {name, category}
    """
    soup = BeautifulSoup(html, "lxml")
    club = {}

    # Club name from h2
    h2 = soup.find("h2")
    if h2:
        club["name"] = h2.get_text(strip=True)

    # Extract data from h5 elements
    for h5 in soup.find_all("h5"):
        text = h5.get_text(strip=True)
        match = re.match(r"([^:]+):\s*(.*)", text)
        if not match:
            continue

        label = match.group(1).strip()
        value = match.group(2).strip()

        if label in ("Código", "Codi"):
            club["ffib_code"] = value
        elif label in ("Delegación", "Delegació"):
            club["delegation"] = value
        elif label in ("Localidad", "Localitat"):
            club["city"] = value

    # Parse teams table - find the h4 inside a th, then get the parent table
    teams = []
    for h4 in soup.find_all("h4"):
        header_text = h4.get_text(strip=True)
        if "Equipos del Club" in header_text or "Equips del Club" in header_text:
            # The h4 is inside a th, which is inside a tr, which is inside a table
            table = h4.find_parent("table")
            if table:
                rows = table.find_all("tr")
                for row in rows[1:]:  # Skip header row
                    cells = row.find_all(["td", "th"])
                    if len(cells) >= 2:
                        team_name = cells[0].get_text(strip=True)
                        category = cells[1].get_text(strip=True)
                        # Clean up team name - remove trailing asterisk
                        team_name = team_name.rstrip("*").strip()
                        if team_name and category:
                            teams.append({"name": team_name, "category": category})
            break

    club["teams"] = teams
    return club if club.get("name") else None


def parse_match_page(html: str) -> list[dict]:
    """Parse a match results page.

    Returns list of dicts with keys: home_team, away_team, home_score, away_score
    """
    soup = BeautifulSoup(html, "lxml")
    matches = []

    text = soup.get_text(separator="|")
    # Look for score patterns like "2 - 1" or "2-1"
    for match in re.finditer(r"(\w[^|]{2,30})\s*\|\s*(\d+)\s*[-–]\s*(\d+)\s*\|\s*(\w[^|]{2,30})", text):
        home = match.group(1).strip()
        home_score = int(match.group(2))
        away_score = int(match.group(3))
        away = match.group(4).strip()
        if home and away:
            matches.append({
                "home_team": home,
                "away_team": away,
                "home_score": home_score,
                "away_score": away_score,
            })

    return matches
