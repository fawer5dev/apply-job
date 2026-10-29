/**
 * @jest-environment node
 */
import {
  CV_FILE_MIME_TYPES,
  detectCVFileKind,
  checkUploadContentLength,
  MAX_UPLOAD_REQUEST_BYTES,
} from '../file-validation';

const PDF = CV_FILE_MIME_TYPES.pdf;
const DOCX = CV_FILE_MIME_TYPES.docx;
const TXT = CV_FILE_MIME_TYPES.txt;

describe('detectCVFileKind', () => {
  it('accepts a PDF with the %PDF- signature', () => {
    expect(detectCVFileKind(Buffer.from('%PDF-1.7\n...'), PDF)).toBe('pdf');
  });

  it('rejects a PDF declared type with non-PDF bytes', () => {
    expect(detectCVFileKind(Buffer.from('just text'), PDF)).toBeNull();
  });

  it('accepts a DOCX (zip container with word/ parts)', () => {
    const zip = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from('....word/document.xml....'),
    ]);
    expect(detectCVFileKind(zip, DOCX)).toBe('docx');
  });

  it('rejects a zip that is not a Word document', () => {
    const zip = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from('....xl/workbook.xml....'),
    ]);
    expect(detectCVFileKind(zip, DOCX)).toBeNull();
  });

  it('accepts UTF-8 text', () => {
    expect(detectCVFileKind(Buffer.from('Jane Doe — Engineer', 'utf8'), TXT)).toBe('txt');
  });

  it('rejects binary data declared as text', () => {
    const binary = Buffer.from([0x89, 0x50, 0x00, 0x47, 0x0d]);
    expect(detectCVFileKind(binary, TXT)).toBeNull();
  });

  it('rejects unsupported declared types such as .doc', () => {
    expect(
      detectCVFileKind(Buffer.from('anything'), 'application/msword')
    ).toBeNull();
  });
});

describe('checkUploadContentLength', () => {
  it('rejects requests larger than the upload limit', () => {
    const request = new Request('http://localhost/api/cv/parse', {
      method: 'POST',
      headers: { 'content-length': String(MAX_UPLOAD_REQUEST_BYTES + 1) },
    });
    expect(checkUploadContentLength(request)?.status).toBe(413);
  });

  it('allows requests within the limit or without a header', () => {
    const small = new Request('http://localhost/api/cv/parse', {
      method: 'POST',
      headers: { 'content-length': '1024' },
    });
    expect(checkUploadContentLength(small)).toBeNull();
  });
});
