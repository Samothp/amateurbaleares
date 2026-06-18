"""Import match data from resultados-futbol.com into Supabase."""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import os
import json
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client

project_root = Path(__file__).resolve().parent
load_dotenv(project_root / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

client = create_client(url, key)

# Match data from Tercera Federación Grupo 11 - Jornada 34 (May 2026)
matches_data = [
    {
        "home": "Manacor",
        "away": "Mallorca B",
        "home_score": 1,
        "away_score": 1,
        "date": "2026-05-09",
        "goals": [
            {"team": "away", "scorer": "N. Espinós", "minute": 54},
            {"team": "home", "scorer": "F. Expósito", "minute": 88},
        ]
    },
    {
        "home": "Penya Deportiva",
        "away": "UD Collerense",
        "home_score": 2,
        "away_score": 0,
        "date": "2026-05-10",
        "goals": [
            {"team": "home", "scorer": "Santi Rosa", "minute": 53},
            {"team": "home", "scorer": "Nico Ortiz", "minute": 55},
        ]
    },
    {
        "home": "Felanitx",
        "away": "Santanyi",
        "home_score": 2,
        "away_score": 1,
        "date": "2026-05-10",
        "goals": [
            {"team": "home", "scorer": "T. Nebot", "minute": 53},
            {"team": "home", "scorer": "Vinicius", "minute": 82},
            {"team": "away", "scorer": "Javier Nebot", "minute": 86},
        ]
    },
    {
        "home": "Binissalem",
        "away": "CD Son Cladera",
        "home_score": 2,
        "away_score": 0,
        "date": "2026-05-10",
        "goals": [
            {"team": "home", "scorer": "Sergi", "minute": 56},
            {"team": "home", "scorer": "J. Oliver", "minute": 96},
        ]
    },
    {
        "home": "Mercadal",
        "away": "UE Alcudia",
        "home_score": 3,
        "away_score": 2,
        "date": "2026-05-10",
        "goals": [
            {"team": "away", "scorer": "Ripoll", "minute": 33},
            {"team": "away", "scorer": "Ruben", "minute": 75},
            {"team": "home", "scorer": "A. Martinez", "minute": 79},
            {"team": "home", "scorer": "Javier Ortiz", "minute": 83},
            {"team": "home", "scorer": "I. Rodriguez", "minute": 85},
            {"team": "away", "scorer": "Ripoll", "minute": 90},
        ]
    },
    {
        "home": "Cardassar",
        "away": "Platges de Calvià",
        "home_score": 3,
        "away_score": 1,
        "date": "2026-05-10",
        "goals": [
            {"team": "home", "scorer": "Tià Sastre", "minute": 15},
            {"team": "home", "scorer": "Joan", "minute": 18},
            {"team": "away", "scorer": "C. Garcia", "minute": 28},
            {"team": "home", "scorer": "Josemi", "minute": 65},
            {"team": "home", "scorer": "Jandro", "minute": 85},
        ]
    },
    {
        "home": "Llosetense",
        "away": "SD Formentera",
        "home_score": 2,
        "away_score": 2,
        "date": "2026-05-10",
        "goals": [
            {"team": "away", "scorer": "D. Sanz", "minute": 1},
            {"team": "away", "scorer": "A. Górriz", "minute": 17},
            {"team": "home", "scorer": "Kike", "minute": 59},
            {"team": "home", "scorer": "Socias", "minute": 75},
            {"team": "home", "scorer": "James Davis", "minute": 80},
        ]
    },
    {
        "home": "Constància",
        "away": "Inter Ibiza",
        "home_score": 3,
        "away_score": 0,
        "date": "2026-05-10",
        "goals": [
            {"team": "home", "scorer": "G. González", "minute": 38},
            {"team": "home", "scorer": "J. Socias", "minute": 62},
            {"team": "home", "scorer": "Miquel Llabrés", "minute": 65},
        ]
    },
    {
        "home": "SD Portmany",
        "away": "Rotlet Molinar",
        "home_score": 0,
        "away_score": 1,
        "date": "2026-05-10",
        "goals": [
            {"team": "away", "scorer": "A. Segovia", "minute": 21},
        ]
    },
]

# Scraped name -> actual DB name
TEAM_NAME_MAP = {
    "Manacor": "MANACOR",
    "Mallorca B": "R.C.D. MALLORCA SAD \"B\"",
    "Penya Deportiva": "PEÑA DEPORTIVA \"A\"",
    "UD Collerense": "COLLERENSE",
    "Felanitx": "FELANITX",
    "Santanyi": "SANTANYI",
    "Binissalem": "BINISSALEM",
    "CD Son Cladera": "SON CLADERA",
    "Mercadal": "CE MERCADAL",
    "UE Alcudia": "ALCUDIA",
    "Cardassar": "CARDASSAR",
    "Platges de Calvià": "PLATGES DE CALVIA",
    "Llosetense": "LLOSETENSE",
    "SD Formentera": "FORMENTERA",
    "Constància": "CONSTANCIA",
    "Inter Ibiza": "INTER IBIZA",
    "SD Portmany": "PORTMANY",
    "Rotlet Molinar": "ROTLET-MOLINAR",
}

print(f"Importing {len(matches_data)} matches from Tercera Federación Grupo 11...")

# Get all teams from database
teams_result = client.table("teams").select("id, name, liga, club_id").execute()
teams = {t["name"]: t for t in teams_result.data}

# Also get club names
clubs_result = client.table("clubs").select("id, name, ffib_code").execute()
clubs = {c["ffib_code"]: c for c in clubs_result.data}

matches_imported = 0
goals_created = 0

for match in matches_data:
    home_name = TEAM_NAME_MAP.get(match["home"], match["home"])
    away_name = TEAM_NAME_MAP.get(match["away"], match["away"])
    
    # Find teams in database
    home_team = teams.get(home_name)
    away_team = teams.get(away_name)
    
    if not home_team:
        print(f"  WARNING: Team '{home_name}' not found in database")
        continue
    if not away_team:
        print(f"  WARNING: Team '{away_name}' not found in database")
        continue
    
    # Create match
    result_text = f"{match['home_score']}-{match['away_score']}"
    
    match_data = {
        "team_id": home_team["id"],
        "opponent": away_name,
        "date": f"{match['date']}T12:00:00",
        "result": result_text,
    }
    
    try:
        result = client.table("matches").insert(match_data).execute()
        match_id = result.data[0]["id"]
        matches_imported += 1
        
        # Create goal events
        for goal in match.get("goals", []):
            minute = goal["minute"]
            scorer = goal["scorer"]
            
            event_data = {
                "match_id": match_id,
                "event_type": "gol",
                "minute": minute,
                "metadata": {"scorer": scorer},
            }
            
            client.table("match_events").insert(event_data).execute()
            goals_created += 1
            
    except Exception as e:
        print(f"  Error importing match {home_name} vs {away_name}: {e}")

print(f"\nImport complete:")
print(f"  Matches: {matches_imported}")
print(f"  Goals: {goals_created}")

# Verify
matches_count = client.table("matches").select("*", count="exact").execute()
events_count = client.table("match_events").select("*", count="exact").execute()
print(f"\nTotal in database:")
print(f"  Matches: {matches_count.count}")
print(f"  Events: {events_count.count}")
