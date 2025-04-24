import hashlib

def hash_file(file_name):
    with open(file_name, "rb") as f:
        file_bytes = f.read()
        hex_hash = hashlib.sha256(file_bytes).hexdigest()
    return hex_hash

h = hash_file(file_name="db.json")

print(h, h[:6])