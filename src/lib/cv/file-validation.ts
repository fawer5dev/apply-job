import { MAX_FILE_SIZE } from '@/config/constants';

export type CVFileKind = 'pdf' | 'docx' | 'txt';

/** Single source of truth for accepted uploads (MIME type per kind). */
export const CV_FILE_MIME_TYPES: Record<CVFileKind, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

/** Multipart overhead allowance on top of the file size limit. */
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
export const MAX_UPLOAD_REQUEST_BYTES = MAX_FILE_SIZE + MULTIPART_OVERHEAD_BYTES;

/** Upper bound on extracted text, to bound AI cost and prompt size. */
export const MAX_CV_TEXT_CHARS = 60_000;

/** Below this, the file most likely has no text layer (e.g. scanned PDF). */
export const MIN_CV_TEXT_CHARS = 50;

export class CVInputError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'CVInputError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Identify the real format from the file's leading bytes and make sure it
 * matches the declared MIME type. The browser-declared type alone is not trusted.
 */
export function detectCVFileKind(
  buffer: Buffer,
  declaredType: string
): CVFileKind | null {
  const declaredKind = (Object.keys(CV_FILE_MIME_TYPES) as CVFileKind[]).find(
    (kind) => CV_FILE_MIME_TYPES[kind] === declaredType
  );
  if (!declaredKind) return null;

  if (declaredKind === 'pdf') {
    return buffer.subarray(0, 5).toString('latin1') === '%PDF-' ? 'pdf' : null;
  }

  if (declaredKind === 'docx') {
    // DOCX is a ZIP container: local file header "PK\x03\x04" and a Word part.
    const isZip =
      buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
    return isZip && buffer.includes(Buffer.from('word/'), 0, 'latin1') ? 'docx' : null;
  }

  // Plain text: no NUL bytes in the sample and valid UTF-8.
  const sample = buffer.subarray(0, 8192);
  if (sample.includes(0)) return null;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return 'txt';
  } catch {
    return null;
  }
}

/**
 * Cheap check before reading the multipart body: rejects oversized requests
 * based on Content-Length so the whole upload is never buffered.
 */
export function checkUploadContentLength(request: Request): CVInputError | null {
  const header = request.headers.get('content-length');
  if (header && Number(header) > MAX_UPLOAD_REQUEST_BYTES) {
    return new CVInputError('File is too large. Maximum size is 10 MB.', 413, 'FILE_TOO_LARGE');
  }
  return null;
}

/** Validate an uploaded File and return its bytes and detected kind. */
export async function readValidatedCVFile(
  file: File
): Promise<{ buffer: Buffer; kind: CVFileKind }> {
  if (file.size === 0) {
    throw new CVInputError('The file is empty.', 400, 'FILE_EMPTY');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new CVInputError('File is too large. Maximum size is 10 MB.', 413, 'FILE_TOO_LARGE');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectCVFileKind(buffer, file.type);
  if (!kind) {
    throw new CVInputError(
      'File content does not match its type. Use a valid PDF, DOCX or TXT file.',
      400,
      'FILE_TYPE_MISMATCH'
    );
  }
  return { buffer, kind };
}
