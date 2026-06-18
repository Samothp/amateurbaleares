"""CLI for scraping ffib.es and importing data into Supabase."""

import argparse
import json
import logging
import sys
import io
from pathlib import Path

# Ensure UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from dotenv import load_dotenv

# Load .env from project root
project_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(project_root / ".env")

from src.scraper.ffib_client import FFIBClient
from src.scraper.ffib_parser import parse_club_page
from src.scraper.ffib_importer import FFIBImporter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def scrape_clubs(client: FFIBClient, output_file: str = "clubs.json", max_empty: int = 30) -> list[dict]:
    """Scrape clubs from ffib.es and save to JSON."""
    all_clubs = []
    empty_count = 0
    start_id = 1
    end_id = 500

    for club_id in range(start_id, end_id + 1):
        url = f"/Fed/NPcd/NFG_VerClub?cod_primaria=1000108&codigo_club={club_id}"
        html = client.get(url)

        if not html or len(html) < 500:
            empty_count += 1
            if empty_count >= max_empty:
                logger.info("Too many empty responses (%d), stopping at club_id=%d", empty_count, club_id)
                break
            continue

        club = parse_club_page(html)
        if club and club.get("name"):
            club["ffib_id"] = club_id
            all_clubs.append(club)
            logger.info(
                "Club %d: %s (code=%s, teams=%d)",
                club_id,
                club["name"],
                club.get("ffib_code", "?"),
                len(club.get("teams", [])),
            )
            empty_count = 0
        else:
            empty_count += 1

    # Save to JSON
    output_path = project_root / output_file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_clubs, f, ensure_ascii=False, indent=2)

    logger.info("Scraped %d clubs, saved to %s", len(all_clubs), output_path)
    return all_clubs


def import_clubs(clubs_file: str = "clubs.json") -> int:
    """Import clubs from JSON file into Supabase."""
    importer = FFIBImporter()

    json_path = project_root / clubs_file
    if not json_path.exists():
        logger.error("File not found: %s", json_path)
        return 0

    with open(json_path, "r", encoding="utf-8") as f:
        clubs = json.load(f)

    logger.info("Importing %d clubs from %s", len(clubs), json_path)
    count = importer.import_clubs(clubs)
    logger.info("Import complete: %d items imported", count)
    return count


def test_parse() -> None:
    """Test parsing with saved HTML file."""
    html_path = project_root / "debug_club.html"
    if not html_path.exists():
        logger.error("No debug_club.html found. Run scrape first.")
        return

    with open(html_path, "r", encoding="iso-8859-15") as f:
        html = f.read()

    club = parse_club_page(html)
    if club:
        print(f"Name: {club.get('name')}")
        print(f"Code: {club.get('ffib_code')}")
        print(f"Delegation: {club.get('delegation')}")
        print(f"City: {club.get('city')}")
        print(f"Teams: {len(club.get('teams', []))}")
        for t in club.get("teams", []):
            print(f"  - {t['name']} ({t['category']})")
    else:
        print("No club parsed")


def main():
    parser = argparse.ArgumentParser(
        prog="ffib-scraper",
        description="Scrape ffib.es and import data into Supabase",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # scrape-clubs command
    scrape_parser = subparsers.add_parser("scrape-clubs", help="Scrape all clubs from ffib.es")
    scrape_parser.add_argument("-o", "--output", default="clubs.json", help="Output JSON file")
    scrape_parser.add_argument("--max-empty", type=int, default=30, help="Stop after N empty responses")

    # import-clubs command
    import_parser = subparsers.add_parser("import-clubs", help="Import clubs from JSON into Supabase")
    import_parser.add_argument("-f", "--file", default="clubs.json", help="Input JSON file")

    # test command
    subparsers.add_parser("test", help="Test parsing with saved HTML")

    args = parser.parse_args()

    if args.command == "scrape-clubs":
        client = FFIBClient(delay=2.0)
        scrape_clubs(client, args.output, args.max_empty)
    elif args.command == "import-clubs":
        import_clubs(args.file)
    elif args.command == "test":
        test_parse()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
