import re

with open("src/App_updates.tsx", "r") as f:
    updates = f.read()

with open("src/App.tsx", "r") as f:
    app = f.read()

# Extract from updates
def extract(tag_start, tag_end):
    start = updates.find(tag_start)
    end = updates.find(tag_end)
    return updates[start+len(tag_start):end].strip()

salon_card_new = extract("// [SALON_CARD_START]", "// [SALON_CARD_END]")
find_salon_new = extract("// [FIND_SALON_START]", "// [FIND_SALON_END]")
client_profile_new = extract("// [CLIENT_PROFILE_START]", "// [CLIENT_PROFILE_END]")

# Replace in app
# 1. SalonCard (from "function SalonCard({" to "/* ═══════... FIND A SALON")
app = re.sub(
    r"function SalonCard\(\{.*?\} \)\n.*?/* ══════════════════════════════════════════════════════════\n   FIND A SALON",
    salon_card_new + "\n\n/* ══════════════════════════════════════════════════════════\n   FIND A SALON",
    app,
    flags=re.DOTALL
)

# 2. FindSalonPage (from "function FindSalonPage({" to "/* ═══════... SERVICES PAGE")
app = re.sub(
    r"function FindSalonPage\(\{.*?\} \)\n.*?/* ══════════════════════════════════════════════════════════\n   SERVICES PAGE",
    find_salon_new + "\n\n/* ══════════════════════════════════════════════════════════\n   SERVICES PAGE",
    app,
    flags=re.DOTALL
)

# 3. ClientProfilePage (from "function ClientProfilePage({" to "/* ═══════... REVIEWS PAGE")
app = re.sub(
    r"function ClientProfilePage\(\{.*?\} \)\n.*?/* ══════════════════════════════════════════════════════════\n   REVIEWS PAGE",
    client_profile_new + "\n\n/* ══════════════════════════════════════════════════════════\n   REVIEWS PAGE",
    app,
    flags=re.DOTALL
)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("Splice complete!")
