from typing import Optional


SUPPORTED_UPLOAD_TYPES_LABEL = "PDF, DOCX, TXT, CSV, MD, XLSX, JSON, HTML"

MAX_UPLOAD_BATCH_SIZE = 40

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/csv": "csv",
    "text/x-csv": "csv",
    "application/x-csv": "csv",
    "text/comma-separated-values": "csv",
    "text/markdown": "md",
    "text/x-markdown": "md",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/json": "json",
    "text/json": "json",
    "text/html": "html",
    "application/xhtml+xml": "html",
}

EXTENSION_TO_FILE_TYPE = {
    "pdf": "pdf",
    "docx": "docx",
    "txt": "txt",
    "csv": "csv",
    "md": "md",
    "markdown": "md",
    "xlsx": "xlsx",
    "json": "json",
    "html": "html",
    "htm": "html",
}

# Generic content types sent by some browsers — only trustworthy together
# with a matching supported file extension.
GENERIC_CONTENT_TYPES = {
    "application/octet-stream",
    "",
}

FILE_EXTENSION_MAP = {
    "pdf": "pdf",
    "docx": "docx",
    "txt": "txt",
    "csv": "csv",
    "md": "md",
    "markdown": "md",
    "xlsx": "xlsx",
    "json": "json",
    "html": "html",
    "htm": "html",
}

DOCUMENT_TYPE_CHOICES = [
    ("pdf", "PDF"),
    ("docx", "DOCX"),
    ("txt", "Text"),
    ("csv", "CSV"),
    ("md", "Markdown"),
    ("xlsx", "Excel"),
    ("json", "JSON"),
    ("html", "HTML"),
]

DOCUMENT_STATUS_CHOICES = [
    ("pending", "Pending"),
    ("processing", "Processing"),
    ("completed", "Completed"),
    ("failed", "Failed"),
]

MESSAGE_ROLE_CHOICES = [
    ("user", "User"),
    ("assistant", "Assistant"),
    ("system", "System"),
]

MAX_CHUNK_SIZE = 2000
MIN_CHUNK_SIZE = 100
DEFAULT_CHUNK_SIZE = 800
DEFAULT_CHUNK_OVERLAP = 150


def infer_file_type(filename: str, content_type: str = "") -> Optional[str]:
    """Infer the canonical file type from filename extension and MIME type.

    The extension is trusted first (browsers report inconsistent MIME types
    for csv/json/markdown/html). The MIME type is used as a fallback when the
    extension is missing or unsupported.
    """
    ext = ""
    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
    if ext in EXTENSION_TO_FILE_TYPE:
        return EXTENSION_TO_FILE_TYPE[ext]
    if content_type in ALLOWED_DOCUMENT_TYPES:
        return ALLOWED_DOCUMENT_TYPES[content_type]
    return None
