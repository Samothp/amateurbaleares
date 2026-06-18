import os
from dotenv import load_dotenv
from supabase import create_client
from pathlib import Path

load_dotenv(Path(".env"))
client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

teams = client.table("teams").select("name, liga").execute()
print(f"Total teams: {len(teams.data)}")
print()
for t in sorted(teams.data, key=lambda x: x["name"]):
    print(f"  {t['name']} ({t['liga']})")
