import pandas as pd
import glob
from supabase import create_client

# config

URL = "https://yzhcrthlbybrgrnnimcl.supabase.co"
KEY = "sb_publishable_9WkfCngLH9J0AztIwJA0PQ_FvLP7ihi"
TABLE = "MasterContacts"

HO_DEPTS = [
    "Accounting",
    "Branch Banking Group",
    "Compliance Monitoring Office",
    "Credit",
    "Digital Banking",
    "Human Resource",
    "Information Technology",
    "Internal Audit",
    "Legal",
    "Loans and Assets Management",
    "Marketing",
    "Office of the Executive",
    "Risk Management Office",
    "Security  and Safety Department",
    "Treasury",
]

supabase = create_client(URL, KEY)

# load file

file_path = glob.glob('Employee List*.xls')

if file_path:
    df = pd.read_excel(file_path[0], skiprows=4)
    print(f"Loaded {len(df)} rows from {file_path[0]}")
else:
    print("Employee List not found")
    exit()


# rename columns
df = df.rename(columns={
    "Deparment":   "department",
    "Employee ID": "id",
    "Full Name":   "name",
    "Position":    "position",
    "Contact No":  "number",
    "Status":      "status",
    "Level":       "level",
})

# clean employee id
df["id"] = (
    df["id"]
    .astype(str)
    .str.replace(r"\.0$", "", regex=True)
    .str.strip()
)

# filter inactive employees just in case
df = df[~df["status"].astype(str).str.lower().isin(["resigned", "terminated"])]

# normalize phone numbers
df["number"] = df["number"].astype(str).str.replace(".0", "", regex=False)
df["number"] = df["number"].apply(
    lambda x: "" if x.lower() == "nan"
    else "639" + x[1:]  if x.startswith("09")
    else "63"  + x if (x.startswith("9") and len(x) == 10)
    else x
)

# split department into department and location (for branches)
df["location"] = df["department"]
is_ho = df["department"].isin(HO_DEPTS)
df.loc[is_ho,  "location"]   = "Head Office"
df.loc[~is_ho, "department"] = "Branch"

# remove random chars in name
df["name"] = df["name"].str.replace(" - ", " ", regex=False)

# deduplicate just in case
before = len(df)
df = df.drop_duplicates(subset=["id"], keep="last")
dupes = before - len(df)
if dupes:
    print(f"Warning: Removed {dupes} duplicate Employee ID(s) from source data.")

# save a copy as csv
df.to_csv("mastercontacts.csv", index=False)
print(f"Local copy saved as 'mastercontacts.csv' ({len(df)} records).")

# replace NaN with None for Supabase compatibility
df = df.where(pd.notnull(df), None)
data = df.to_dict(orient="records")

# upsert active employees
print("Upserting active employees...")
supabase.table(TABLE).upsert(data, on_conflict="id").execute()
print(f"Upserted {len(data)} records.")

# count all ids in database
print("Checking number of employees in database...")
db_ids = []
page = 0
page_size = 1000

while True:
    response = (
        supabase.table(TABLE)
        .select("id")
        .range(page * page_size, (page + 1) * page_size - 1)
        .execute()
    )
    batch = [row["id"] for row in response.data]
    db_ids.extend(batch)
    if len(batch) < page_size:
        break
    page += 1

print(f"Employees in database: {len(db_ids)}")

# check and delete resigned/inactive employees
active_ids = df["id"].tolist()
ids_to_remove = [id for id in db_ids if id not in active_ids]

if ids_to_remove:
    print(f"Found {len(ids_to_remove)} stale record(s). Deleting...")
    supabase.table(TABLE).delete().in_("id", ids_to_remove).execute()
else:
    print("No stale records found.")

print("Sync complete.")
