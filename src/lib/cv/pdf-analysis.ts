import pdf from 'pdf-parse';

/**
 * - text:    every page has a usable text layer -> normal text extraction.
 * - scanned: no page has a usable text layer -> visual reading with Gemini.
 * - mixed:   some pages have text and some do not -> visual reading of the
 *            whole document, so no page is silently skipped.
 */
export type PdfKind = 'text' | 'scanned' | 'mixed';

/** A page with fewer non-space characters than this is treated as image-only. */
export const MIN_CHARS_PER_TEXT_PAGE = 40;

export interface PdfAnalysis {
  kind: PdfKind;
  pageCount: number;
  /** Text from the PDF text layer (may be empty for scanned documents). */
  text: string;
}

/** Pure classification from the non-space character count of each page. */
export function classifyPages(charCountsPerPage: number[]): PdfKind {
  if (charCountsPerPage.length === 0) return 'scanned';

  const textPages = charCountsPerPage.filter(
    (count) => count >= MIN_CHARS_PER_TEXT_PAGE
  ).length;

  if (textPages === charCountsPerPage.length) return 'text';
  if (textPages === 0) return 'scanned';
  return 'mixed';
}

/**
 * Same line-joining logic as pdf-parse's default page renderer, but it also
 * records how many characters each page contributed.
 */
async function renderPage(
  pageData: {
    getTextContent: (options: object) => Promise<{
      items: Array<{ str: string; transform: number[] }>;
    }>;
  },
  charCounts: number[]
): Promise<string> {
  const textContent = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  });

  let lastY: number | undefined;
  let text = '';
  for (const item of textContent.items) {
    if (lastY === item.transform[5] || lastY === undefined) {
      text += item.str;
    } else {
      text += '\n' + item.str;
    }
    lastY = item.transform[5];
  }

  charCounts.push(text.replace(/\s/g, '').length);
  return text;
}

export async function analyzePdf(buffer: Buffer): Promise<PdfAnalysis> {
  const charCounts: number[] = [];

  const data = await pdf(buffer, {
    pagerender: (pageData: Parameters<typeof renderPage>[0]) =>
      renderPage(pageData, charCounts),
  });

  return {
    kind: classifyPages(charCounts),
    pageCount: data.numpages,
    text: data.text,
  };
}
