const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape text so it can be placed in HTML content or attributes. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Escape every string inside a value (deep). Used on user/AI data before it is
 * interpolated into a template, so CV content can never inject markup.
 */
export function escapeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    return escapeHtml(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => escapeDeep(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, escapeDeep(item)])
    ) as T;
  }
  return value;
}
