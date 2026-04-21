import zipfile
import pandas as pd
import requests
import sys
import os
import uuid

SUPABASE_URL = "https://yzhcrthlbybrgrnnimcl.supabase.co"
SUPABASE_KEY = "sb_publishable_9WkfCngLH9J0AztIwJA0PQ_FvLP7ihi"
TABLE = "Responses"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

if len(sys.argv) > 1:
    file_path = sys.argv[1]
else:
    file_path = input("Enter path to .zip or .csv file: ").strip()

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

if file_path.endswith(".csv"):
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} rows from {file_path}")

elif file_path.endswith(".zip"):
    with zipfile.ZipFile(file_path, "r") as z:
        csv_files = [f for f in z.namelist() if f.endswith(".csv")]

        if not csv_files:
            print("No CSV found in zip.")
            sys.exit(1)

        if len(csv_files) > 1:
            print(f"Multiple CSVs found: {csv_files}")
            print(f"Using: {csv_files[0]}")

        with z.open(csv_files[0]) as f:
            df = pd.read_csv(f)

    print(f"Loaded {len(df)} rows from {csv_files[0]}")

else:
    print("Unsupported file type. Please provide a .zip or .csv file.")
    sys.exit(1)

required_cols = ["From Presentation", "Client Submit Time", "Message"]
missing = [c for c in required_cols if c not in df.columns]
if missing:
    print(f"Missing columns in CSV: {missing}")
    print(f"Available columns: {list(df.columns)}")
    sys.exit(1)

df = df[required_cols].copy()

df["From Presentation"] = (
    df["From Presentation"]
    .astype(str)
    .apply(lambda x: x if x.startswith("+") else "+" + x)
)

df.insert(0, "uid", [str(uuid.uuid4()) for _ in range(len(df))])

records = df.rename(
    columns={
        "From Presentation": "contact",
        "Client Submit Time": "datetime",
        "Message": "contents",
    }
).to_dict(orient="records")

print(f"Inserting {len(records)} rows into '{TABLE}'...")

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/{TABLE}", headers=HEADERS, json=records
)

if response.status_code in (200, 201):
    print("Done. All rows inserted.")
else:
    print(f"Supabase error {response.status_code}: {response.text}")
    sys.exit(1)
