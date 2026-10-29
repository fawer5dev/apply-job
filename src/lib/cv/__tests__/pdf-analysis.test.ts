/**
 * @jest-environment node
 */
import { classifyPages, MIN_CHARS_PER_TEXT_PAGE } from '../pdf-analysis';

const LONG = MIN_CHARS_PER_TEXT_PAGE + 10;

describe('classifyPages', () => {
  it('classifies a document where every page has text as text', () => {
    expect(classifyPages([LONG, LONG, LONG])).toBe('text');
  });

  it('classifies a document without text on any page as scanned', () => {
    expect(classifyPages([0, 0, 3])).toBe('scanned');
  });

  it('classifies a document with some text pages as mixed', () => {
    expect(classifyPages([LONG, 0, LONG])).toBe('mixed');
  });

  it('treats a page with only a few characters as image-only', () => {
    // A stray page number or logo should not count as a text page.
    expect(classifyPages([LONG, MIN_CHARS_PER_TEXT_PAGE - 1])).toBe('mixed');
  });

  it('treats a PDF with no pages as scanned', () => {
    expect(classifyPages([])).toBe('scanned');
  });
});
