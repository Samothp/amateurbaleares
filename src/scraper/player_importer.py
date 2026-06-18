"""Import scraped player data into Supabase."""

import json
import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Dict, List, Optional

load_dotenv()

logger = logging.getLogger(__name__)


class PlayerImporter:
    """Import players from seed JSON into Supabase."""

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_SERVICE_KEY")
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")
        self.client: Client = create_client(self.url, self.key)
        self._team_cache: Dict[str, str] = {}

    def _get_team_id(self, team_name: str) -> Optional[str]:
        """Look up team_id by name (with caching)."""
        if team_name in self._team_cache:
            return self._team_cache[team_name]

        # Try exact match first
        result = self.client.table("teams").select("id").eq("name", team_name).execute()
        if result.data:
            tid = result.data[0]["id"]
            self._team_cache[team_name] = tid
            return tid

        # Try case-insensitive match
        result = self.client.table("teams").select("id,name").ilike("name", f"%{team_name}%").execute()
        if result.data:
            tid = result.data[0]["id"]
            self._team_cache[team_name] = tid
            logger.info("  Mapped '%s' -> '%s' (fuzzy)", team_name, result.data[0]["name"])
            return tid

        logger.warning("  Team not found: %s", team_name)
        return None

    def import_players(self, seed_data: Dict[str, List[Dict]]) -> int:
        """Import all players from seed data. Returns count imported."""
        total_imported = 0

        for team_name, players in seed_data.items():
            if not players:
                logger.info("Skipping %s (0 players)", team_name)
                continue

            team_id = self._get_team_id(team_name)
            if not team_id:
                logger.warning("Cannot import %s - team not in DB", team_name)
                continue

            logger.info("Importing %d players for %s...", len(players), team_name)

            for p in players:
                player_row = {
                    "team_id": team_id,
                    "name": p["name"],
                    "age": p.get("age"),
                    "position": p.get("position"),
                    "dorsal": p.get("number"),
                    "height": p.get("height"),
                }

                # Check if player already exists (by team_id + name + dorsal)
                existing = self.client.table("players").select("id").eq("team_id", team_id).eq("name", p["name"]).execute()
                if existing.data:
                    logger.debug("  Player %s already exists, updating...", p["name"])
                    self.client.table("players").update(player_row).eq("id", existing.data[0]["id"]).execute()
                else:
                    self.client.table("players").insert(player_row).execute()

                total_imported += 1

            logger.info("  Imported %d players for %s", len(players), team_name)

        return total_imported


def load_seed(filepath: str) -> Dict[str, List[Dict]]:
    """Load seed JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    seed_file = sys.argv[1] if len(sys.argv) > 1 else "players_seed.json"
    logger.info("Loading seed data from %s...", seed_file)
    seed_data = load_seed(seed_file)

    total = sum(len(v) for v in seed_data.values())
    logger.info("Found %d total players across %d teams", total, len(seed_data))

    importer = PlayerImporter()
    imported = importer.import_players(seed_data)
    logger.info("Import complete: %d players imported", imported)
