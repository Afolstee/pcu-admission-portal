import hashlib

password = "AdminPass123"
hashed = hashlib.sha256(password.encode()).hexdigest()
print(hashed)