"""Scrape player rosters from resultados-futbol.com for Tercera Federación Grupo 11 teams."""

import json
import re
import time
import logging
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

TEAM_SLUGS = {
    "R.C.D. MALLORCA SAD \"B\"": "Mallorca-B",
    "MANACOR": "Manacor",
    "SANTANYI": "Santanyi",
    "FELANITX": "Felanitx",
    "BINISSALEM": "Binissalem",
    "CARDASSAR": "Cardassar",
    "CE MERCADAL": "Mercadal",
    "COLLERENSE": "Collerense",
    "CONSTANCIA": "Constancia",
    "LLOSETENSE": "Llosetense",
    "INTER IBIZA": "Inter-Ibiza",
    "FORMENTERA": "Formentera",
    "ALCUDIA": "Alcudia",
    "SON CLADERA": "Son-Cladera",
    "ROTLET-MOLINAR": "Rotlet-Molinar",
    "PORTMANY": "Portmany",
    "PLATGES DE CALVIA": "Platges-de-Calvia",
}

RESULTS_URL = "https://www.resultados-futbol.com/plantilla/{slug}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.resultados-futbol.com/",
}

POSITION_KEYWORDS = {
    "Portero": "Portero",
    "Defensa": "Defensa",
    "Centrocampista": "Centrocampista",
    "Delantero": "Delantero",
}


def fetch_team_page(slug: str) -> Optional[str]:
    """Fetch a team's plantilla page."""
    url = RESULTS_URL.format(slug=slug)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        logger.error("Failed to fetch %s: %s", url, e)
        return None


def parse_players(html: str, team_name: str) -> List[Dict]:
    """Parse player data from resultados-futbol.com HTML."""
    soup = BeautifulSoup(html, 'lxml')
    players = []

    # Find the player table by looking for 'Jugador' in any header
    player_table = None
    for table in soup.find_all('table'):
        all_th_text = ' '.join(th.get_text(strip=True) for th in table.find_all('th'))
        if 'Jugador' in all_th_text:
            player_table = table
            break

    if not player_table:
        logger.warning("No player table found for %s", team_name)
        return players

    current_position = "Desconocido"

    for row in player_table.find_all('tr'):
        row_classes = row.get('class', [])

        # Position header row: class="first-child" with th.axis
        if 'first-child' in row_classes:
            axis_th = row.find('th', class_='axis')
            if axis_th:
                pos_text = axis_th.get_text(strip=True)
                if pos_text in POSITION_KEYWORDS:
                    current_position = POSITION_KEYWORDS[pos_text]
            continue

        # Player row: find by CSS classes
        num_td = row.find('td', class_='num')
        name_th = row.find('th', class_='sdata_player_name')
        birth_td = row.find('td', class_='birthdate')
        dat_tds = row.find_all('td', class_='dat')

        if not num_td or not name_th:
            continue

        number_str = num_td.get_text(strip=True)
        name = name_th.get_text(strip=True)

        if not re.match(r'^\d{1,2}$', number_str):
            continue
        number = int(number_str)
        if number < 1 or number > 99:
            continue

        if not name or name in ('', '-'):
            continue

        # Age from birthdate column
        age = None
        if birth_td:
            age_text = birth_td.get_text(strip=True)
            if re.match(r'^\d{1,2}$', age_text):
                age = int(age_text)
                if age < 16 or age > 45:
                    age = None

        # Height from first dat column (index 0)
        height = None
        if len(dat_tds) > 0:
            h_text = dat_tds[0].get_text(strip=True)
            if re.match(r'^\d{2,3}$', h_text):
                height = int(h_text)
                if height < 150 or height > 220:
                    height = None

        players.append({
            "team_name": team_name,
            "name": name,
            "number": number,
            "position": current_position,
            "age": age,
            "height": height,
        })

    return players


def scrape_all_teams(delay: float = 2.0) -> Dict[str, List[Dict]]:
    """Scrape all teams."""
    all_players = {}
    for team_name, slug in TEAM_SLUGS.items():
        logger.info("Scraping %s (slug: %s)...", team_name, slug)
        html = fetch_team_page(slug)
        if html:
            players = parse_players(html, team_name)
            all_players[team_name] = players
            logger.info("  Found %d players", len(players))
        else:
            logger.warning("  No data for %s", team_name)
            all_players[team_name] = []
        time.sleep(delay)
    return all_players


def save_to_json(data: Dict[str, List[Dict]], filepath: str):
    """Save scraped data to JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info("Saved data to %s", filepath)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    print("Scraping player rosters from resultados-futbol.com...")
    print(f"Teams to scrape: {len(TEAM_SLUGS)}")

    data = scrape_all_teams(delay=2.0)

    total = sum(len(v) for v in data.values())
    print(f"\nTotal players scraped: {total}")
    for team, players in data.items():
        print(f"  {team}: {len(players)} players")

    save_to_json(data, "players_seed.json")
