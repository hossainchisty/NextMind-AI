ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "text/markdown": "md",
    "text/x-markdown": "md",
}

FILE_EXTENSION_MAP = {
    "pdf": "pdf",
    "docx": "docx",
    "doc": "docx",
    "txt": "txt",
    "md": "md",
    "markdown": "md",
}

DOCUMENT_TYPE_CHOICES = [
    ("pdf", "PDF"),
    ("docx", "DOCX"),
    ("txt", "Text"),
    ("md", "Markdown"),
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
