import logging
import os
import tempfile
from typing import Optional

import boto3
from botocore.config import Config

logger = logging.getLogger("apps")

_client = None


def get_r2_client():
    """Lazy singleton R2 client (S3-compatible)."""
    global _client
    if _client is None:
        import django.conf as conf
        _client = boto3.client(
            "s3",
            endpoint_url=conf.settings.R2_ENDPOINT_URL,
            aws_access_key_id=conf.settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=conf.settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _client


def upload_to_r2(file_obj, key: str, content_type: str = "application/octet-stream") -> str:
    """Upload a file-like object to R2. Returns the object key."""
    import django.conf as conf
    client = get_r2_client()
    bucket = conf.settings.R2_BUCKET_NAME
    client.upload_fileobj(file_obj, bucket, key, ExtraArgs={"ContentType": content_type})
    logger.info("Uploaded to R2: %s/%s", bucket, key)
    return key


def download_from_r2(key: str) -> str:
    """Download a file from R2 to a temp file. Returns the temp file path."""
    import django.conf as conf
    client = get_r2_client()
    bucket = conf.settings.R2_BUCKET_NAME

    suffix = os.path.splitext(key)[-1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.close()

    client.download_fileobj(bucket, key, tmp.name)
    logger.info("Downloaded from R2: %s → %s", key, tmp.name)
    return tmp.name


def delete_from_r2(key: str) -> None:
    """Delete a file from R2."""
    import django.conf as conf
    client = get_r2_client()
    bucket = conf.settings.R2_BUCKET_NAME
    client.delete_object(Bucket=bucket, Key=key)
    logger.info("Deleted from R2: %s/%s", bucket, key)


def get_signed_url(key: str, expires_in: int = 3600) -> Optional[str]:
    """Generate a presigned URL for reading a file from R2."""
    import django.conf as conf
    client = get_r2_client()
    bucket = conf.settings.R2_BUCKET_NAME
    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires_in,
        )
        return url
    except Exception as e:
        logger.error("Failed to generate signed URL for %s: %s", key, e)
        return None


def build_r2_key(user_id: str, filename: str) -> str:
    """Build an R2 object key from user ID and filename."""
    from django.utils import timezone
    now = timezone.now()
    safe_name = filename.replace(" ", "_").replace("/", "_")
    return f"documents/{now.year}/{now.month:02d}/{now.day:02d}/{user_id}/{safe_name}"
