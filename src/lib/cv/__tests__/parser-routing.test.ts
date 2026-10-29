/**
 * @jest-environment node
 */
import { parseCV } from '../parser';
import { analyzePdf } from '../pdf-analysis';
import * as googleAI from '@/lib/ai/google-ai';
import { MAX_VISUAL_PDF_PAGES } from '../file-validation';

jest.mock('../pdf-analysis', () => ({
  analyzePdf: jest.fn(),
  MIN_CHARS_PER_TEXT_PAGE: 40,
  classifyPages: jest.fn(),
}));

jest.mock('@/lib/ai/google-ai', () => ({
  generateContent: jest.fn(),
}));

const mockAnalyze = analyzePdf as jest.Mock;
const mockGenerate = googleAI.generateContent as jest.Mock;

const cvJSON = JSON.stringify({
  personalInfo: { name: 'Jane Doe', email: 'jane@example.com' },
  experience: [
    {
      title: 'Engineer',
      company: 'Acme',
      startDate: '2020',
      achievements: ['Built things'],
    },
  ],
  education: [],
  skills: [{ category: 'Technical Skills', items: ['TypeScript'] }],
});

const pdfBuffer = Buffer.from('%PDF-1.7 fake');
const longText = 'Jane Doe engineer with experience in many systems. '.repeat(5);

describe('parseCV routing for PDFs', () => {
  beforeEach(() => {
    mockAnalyze.mockReset();
    mockGenerate.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses extracted text for PDFs with a text layer and sends no attachment', async () => {
    mockAnalyze.mockResolvedValueOnce({ kind: 'text', pageCount: 1, text: longText });
    mockGenerate.mockResolvedValueOnce(cvJSON);

    const result = await parseCV(pdfBuffer, 'pdf');

    expect(result.extractionMethod).toBe('text');
    expect(result.cv.personalInfo.name).toBe('Jane Doe');
    const options = mockGenerate.mock.calls[0][2];
    expect(options.attachments).toBeUndefined();
  });

  it('reads scanned PDFs visually, sending the PDF bytes to Gemini', async () => {
    mockAnalyze.mockResolvedValueOnce({ kind: 'scanned', pageCount: 2, text: '' });
    mockGenerate.mockResolvedValueOnce(cvJSON);

    const result = await parseCV(pdfBuffer, 'pdf');

    expect(result.extractionMethod).toBe('visual');
    expect(result.cv.experience[0].company).toBe('Acme');
    const options = mockGenerate.mock.calls[0][2];
    expect(options.attachments).toEqual([
      { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') },
    ]);
  });

  it('reads mixed PDFs visually as a whole document', async () => {
    mockAnalyze.mockResolvedValueOnce({ kind: 'mixed', pageCount: 3, text: longText });
    mockGenerate.mockResolvedValueOnce(cvJSON);

    const result = await parseCV(pdfBuffer, 'pdf');

    expect(result.extractionMethod).toBe('visual');
    expect(mockGenerate.mock.calls[0][2].attachments).toHaveLength(1);
  });

  it('rejects scanned PDFs above the visual page limit before calling AI', async () => {
    mockAnalyze.mockResolvedValueOnce({
      kind: 'scanned',
      pageCount: MAX_VISUAL_PDF_PAGES + 1,
      text: '',
    });

    await expect(parseCV(pdfBuffer, 'pdf')).rejects.toMatchObject({
      code: 'PDF_TOO_MANY_PAGES',
      status: 422,
    });
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('does not apply the visual page limit to text PDFs', async () => {
    mockAnalyze.mockResolvedValueOnce({
      kind: 'text',
      pageCount: MAX_VISUAL_PDF_PAGES + 5,
      text: longText,
    });
    mockGenerate.mockResolvedValueOnce(cvJSON);

    await expect(parseCV(pdfBuffer, 'pdf')).resolves.toMatchObject({
      extractionMethod: 'text',
    });
  });

  it('reports unreadable PDFs with a controlled error', async () => {
    mockAnalyze.mockRejectedValueOnce(new Error('Invalid PDF structure'));

    await expect(parseCV(pdfBuffer, 'pdf')).rejects.toMatchObject({
      code: 'FILE_UNREADABLE',
      status: 422,
    });
  });
});
