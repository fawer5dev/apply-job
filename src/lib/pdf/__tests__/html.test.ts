/**
 * @jest-environment node
 */
import { escapeDeep, escapeHtml } from '../html';

describe('escapeHtml', () => {
  it('escapes markup-significant characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml(`Tom & Jerry's`)).toBe('Tom &amp; Jerry&#39;s');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Senior Engineer 2020-2024')).toBe(
      'Senior Engineer 2020-2024'
    );
  });
});

describe('escapeDeep', () => {
  it('escapes nested strings and keeps non-string values', () => {
    const input = {
      personalInfo: { name: '<img src=x onerror=alert(1)>', email: 'a@b.co' },
      experience: [{ title: '<b>Dev</b>', current: true, achievements: ['a & b'] }],
      count: 3,
      missing: null,
    };

    const output = escapeDeep(input);

    expect(output.personalInfo.name).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
    expect(output.experience[0].title).toBe('&lt;b&gt;Dev&lt;/b&gt;');
    expect(output.experience[0].achievements[0]).toBe('a &amp; b');
    expect(output.experience[0].current).toBe(true);
    expect(output.count).toBe(3);
    expect(output.missing).toBeNull();
  });

  it('does not mutate the original object', () => {
    const input = { name: '<x>' };
    escapeDeep(input);
    expect(input.name).toBe('<x>');
  });
});
