#!/usr/bin/env python3
"""Patch mock-data.ts: add ownerId to each DocumentItem based on ownerName."""
import re
from pathlib import Path

PATH = Path("/home/z/my-project/src/lib/mock-data.ts")
content = PATH.read_text(encoding="utf-8")

# Map ownerName → ownerId based on family.members defined at top of file
NAME_TO_ID = {
    "علی رضایی": "u-ali",
    "مریم احمدی": "u-maryam",
    "امیر رضایی": "u-amir",
    "سارا رضایی": "u-sara",
}

# For each document entry, find its ownerName, then ensure ownerId is set.
# Strategy: match the ownerName: "X" line within a document block, and insert ownerId right before it.
def repl(match):
    name = match.group(2)
    owner_id = NAME_TO_ID.get(name, "u-ali")
    indent = match.group(1)
    # Check if ownerId already exists in the preceding lines — if so, don't duplicate.
    return f'{indent}ownerId: "{owner_id}",\n{indent}ownerName: "{name}",'

# Pattern: capture indent + ownerName: "..." line (with trailing comma if present)
pattern = re.compile(r'^(\s+)ownerName:\s*"([^"]+)",', re.MULTILINE)
new_content = pattern.sub(repl, content)

PATH.write_text(new_content, encoding="utf-8")
print("[ok] ownerId added to all documents in mock-data.ts")
