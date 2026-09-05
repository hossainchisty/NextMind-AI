"""Fernet vault for provider API keys stored in the database.

Keys are encrypted with a key derived from Django's SECRET_KEY, so no
additional secret needs to be provisioned. Note: rotating SECRET_KEY
invalidates previously encrypted values — back up keys before rotating.

Values created before encryption was introduced are stored as plaintext.
``decrypt_api_key`` passes those through untouched so the data migration
(and any missed rows) keep working; use ``is_encrypted`` to tell them apart.
"""

import base64
import hashlib

FERNET_PREFIX = "gAAAAA"


def _fernet():
    from django.conf import settings
    from cryptography.fernet import Fernet

    digest = hashlib.sha256(
        f"nextmind-api-key-vault:{settings.SECRET_KEY}".encode()
    ).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def is_encrypted(value: str) -> bool:
    return bool(value) and value.startswith(FERNET_PREFIX)


def encrypt_api_key(plaintext: str) -> str:
    if not plaintext:
        return ""
    if is_encrypted(plaintext):
        return plaintext
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt_api_key(value: str) -> str:
    if not value or not is_encrypted(value):
        return value or ""
    from cryptography.fernet import InvalidToken

    try:
        return _fernet().decrypt(value.encode()).decode()
    except InvalidToken:
        raise ValueError("Cannot decrypt API key")
