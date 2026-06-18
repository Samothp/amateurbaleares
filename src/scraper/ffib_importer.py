"""Import scraped FFIB data into Supabase."""

import os
import logging
from supabase import create_client, Client
from typing import Optional

logger = logging.getLogger(__name__)

# Mapping from FFIB category names to our LIGAS
CATEGORY_MAP = {
    "TERCERA FEDERACION": "Tercera Federación",
    "SEGUNDA FEDERACION": "Tercera Federación",
    "DIVISIÓN DE HONOR MALLORCA": "División de Honor Mallorca",
    "DIVISIÓN DE HONOR MENORCA": "División de Honor Menorca",
    "PREFERENTE REGIONAL MALLORCA": "Preferente Regional Mallorca",
    "PRIMERA REGIONAL MALLORCA": "Primera Regional Mallorca (Grupo A)",
    "SEGUNDA REGIONAL MALLORCA": "Segunda Regional Mallorca (Grupo A)",
}

# Delegation to city mapping
DELEGATION_CITY = {
    "Mallorca": "Palma",
    "Mallorca (Delegación Principal)": "Palma",
    "Mallorca (Delegació Principal)": "Palma",
    "Menorca": "Maó",
    "Ibiza - Formentera": "Eivissa",
    "Ibiza-Formentera": "Eivissa",
}


class FFIBImporter:
    """Import FFIB scraped data into Supabase."""

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_SERVICE_KEY")

        if not self.url or not self.key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. "
                "Add them to .env or pass as arguments."
            )

        self.client: Client = create_client(self.url, self.key)
        logger.info("Connected to Supabase: %s", self.url)

    def _map_category(self, ffib_category: str) -> str:
        """Map FFIB category name to our liga list."""
        upper = ffib_category.upper().strip()
        return CATEGORY_MAP.get(upper, ffib_category)

    def _map_delegation(self, delegation: str) -> str:
        """Map FFIB delegation to a city."""
        return DELEGATION_CITY.get(delegation, "Palma")

    def upsert_club(self, club: dict) -> Optional[str]:
        """Insert or update a club. Returns the club ID."""
        ffib_code = club.get("ffib_code")
        if not ffib_code:
            logger.warning("Club without ffib_code, skipping: %s", club.get("name"))
            return None

        data = {
            "ffib_code": str(ffib_code),
            "name": club.get("name", ""),
            "city": club.get("city", "") or self._map_delegation(club.get("delegation", "")),
        }

        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}

        try:
            result = (
                self.client.table("clubs")
                .upsert(data, on_conflict="ffib_code")
                .execute()
            )
            if result.data:
                club_id = result.data[0].get("id")
                logger.info("Upserted club: %s (id=%s)", data["name"], club_id)
                return club_id
        except Exception as e:
            logger.error("Failed to upsert club %s: %s", data.get("name"), e)
        return None

    def upsert_team(self, team: dict, club_id: str) -> Optional[str]:
        """Insert or update a team. Returns the team ID."""
        name = team.get("name", "")
        category = team.get("category", "")
        liga = self._map_category(category)

        data = {
            "ffib_code": team.get("ffib_code"),
            "name": name,
            "club_id": club_id,
            "category": "Senior",
            "liga": liga,
        }

        data = {k: v for k, v in data.items() if v is not None}

        try:
            result = (
                self.client.table("teams")
                .upsert(data, on_conflict="ffib_code")
                .execute()
            )
            if result.data:
                team_id = result.data[0].get("id")
                logger.info("Upserted team: %s (id=%s)", name, team_id)
                return team_id
        except Exception as e:
            logger.error("Failed to upsert team %s: %s", name, e)
        return None

    def insert_match(self, match: dict, team_id: str) -> Optional[str]:
        """Insert a match. Returns the match ID."""
        data = {
            "team_id": team_id,
            "opponent": match.get("opponent", ""),
            "date": match.get("date"),
            "result": match.get("result", ""),
        }

        data = {k: v for k, v in data.items() if v is not None}

        try:
            result = self.client.table("matches").insert(data).execute()
            if result.data:
                match_id = result.data[0].get("id")
                logger.info("Inserted match: vs %s (id=%s)", data.get("opponent"), match_id)
                return match_id
        except Exception as e:
            logger.error("Failed to insert match: %s", e)
        return None

    def import_clubs(self, clubs: list[dict]) -> int:
        """Import a list of clubs. Returns count of imported clubs."""
        count = 0
        for club in clubs:
            club_id = self.upsert_club(club)
            if club_id:
                count += 1
                # Import teams for this club
                for team in club.get("teams", []):
                    team_id = self.upsert_team(team, club_id)
                    if team_id:
                        count += 1
        logger.info("Imported %d clubs", count)
        return count

    def import_teams(self, teams: list[dict], club_id: str) -> int:
        """Import a list of teams for a club. Returns count."""
        count = 0
        for team in teams:
            team_id = self.upsert_team(team, club_id)
            if team_id:
                count += 1
        return count

    def import_matches(self, matches: list[dict], team_id: str) -> int:
        """Import matches for a team. Returns count."""
        count = 0
        for match in matches:
            match_id = self.insert_match(match, team_id)
            if match_id:
                count += 1
        return count
