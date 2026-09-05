export const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "csv", "md", "markdown", "xlsx", "json", "html", "htm"] as const;

export const SUPPORTED_TYPES_LABEL = "PDF, DOCX, TXT, CSV, MD, XLSX, JSON, HTML";

export const UPLOAD_ACCEPT = ".pdf,.docx,.txt,.csv,.md,.markdown,.xlsx,.json,.html,.htm";

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB per file
export const MAX_BATCH_SIZE = 40; // files per upload

export const UPLOAD_LIMITS_TEXT =
  `Supported file types: ${SUPPORTED_TYPES_LABEL}. Maximum file size: 100 MB per file. ` +
  `Maximum batch size: ${MAX_BATCH_SIZE} files per upload. ` +
  `If the source file changes, you need to re-upload it.`;

export interface FileIssue {
  filename: string;
  error: string;
}

export function getExtension(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

export function isSupportedFile(filename: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(getExtension(filename));
}

/** Client-side validation mirroring backend limits. Returns per-file issues. */
export function validateFiles(files: File[]): FileIssue[] {
  const issues: FileIssue[] = [];
  if (files.length > MAX_BATCH_SIZE) {
    issues.push({
      filename: "",
      error: `Too many files. Maximum batch size: ${MAX_BATCH_SIZE} files per upload.`,
    });
  }
  for (const f of files) {
    if (!isSupportedFile(f.name)) {
      issues.push({ filename: f.name, error: `Unsupported file type. Supported file types: ${SUPPORTED_TYPES_LABEL}.` });
    } else if (f.size > MAX_FILE_SIZE) {
      issues.push({ filename: f.name, error: "File too large. Maximum file size: 100 MB per file." });
    }
  }
  return issues;
}
