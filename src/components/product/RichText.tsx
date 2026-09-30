import React from 'react';

/**
 * Renders product copy that may be stored as HTML (imported catalog data) or as
 * plain text (typed in the admin product form).
 *
 * The markup is converted to React elements from a small allow-list
 * (paragraphs, headings, lists, bold, italic, line breaks) instead of being
 * injected with dangerouslySetInnerHTML, so pasted scripts or styles can never
 * run on the storefront.
 */

type Inline = { text: string; bold?: boolean; italic?: boolean };
type Block =
  | { kind: 'p'; content: Inline[] }
  | { kind: 'h'; content: Inline[] }
  | { kind: 'ul' | 'ol'; items: Inline[][] };

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', bull: '•', deg: '°', reg: '®', trade: '™', copy: '©',
};

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Strips tags and decodes entities, collapsing whitespace but keeping edge spaces. */
function toText(html: string) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t\r]+/g, ' ')
    .replace(/ *\n */g, '\n');
}

function toInline(html: string): Inline[] {
  const parts: Inline[] = [];
  const re = /<(strong|b|em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match.index > last) parts.push({ text: toText(html.slice(last, match.index)) });
    const tag = match[1].toLowerCase();
    parts.push({ text: toText(match[2]), bold: tag === 'strong' || tag === 'b', italic: tag === 'em' || tag === 'i' });
    last = re.lastIndex;
  }
  if (last < html.length) parts.push({ text: toText(html.slice(last)) });

  // Trim only the outer edges so spaces between bold and normal text survive
  if (parts.length) {
    parts[0] = { ...parts[0], text: parts[0].text.replace(/^\s+/, '') };
    const end = parts.length - 1;
    parts[end] = { ...parts[end], text: parts[end].text.replace(/\s+$/, '') };
  }
  return parts.filter((p) => p.text.length > 0);
}

function parseHtml(html: string): Block[] {
  const blocks: Block[] = [];
  const re = /<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>|<(h[1-6])\b[^>]*>([\s\S]*?)<\/\3>|<(p|div)\b[^>]*>([\s\S]*?)<\/\5>/gi;
  const pushLoose = (chunk: string) => {
    for (const para of chunk.split(/(?:<br\s*\/?>\s*){2,}|\n{2,}/i)) {
      const content = toInline(para);
      if (content.length) blocks.push({ kind: 'p', content });
    }
  };

  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match.index > last) pushLoose(html.slice(last, match.index));
    if (match[1]) {
      const items = [...match[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => toInline(li[1]))
        .filter((i) => i.length);
      if (items.length) blocks.push({ kind: match[1].toLowerCase() as 'ul' | 'ol', items });
    } else if (match[3]) {
      const content = toInline(match[4]);
      if (content.length) blocks.push({ kind: 'h', content });
    } else {
      pushLoose(match[6]);
    }
    last = re.lastIndex;
  }
  if (last < html.length) pushLoose(html.slice(last));
  return blocks;
}

function parsePlain(text: string): Block[] {
  const blocks: Block[] = [];
  for (const para of text.trim().split(/\n\s*\n/)) {
    const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^[-•*]\s+/.test(l));
    const numbered = lines.filter((l) => /^\d+[.)]\s+/.test(l));
    if (lines.length > 0 && bullets.length === lines.length) {
      blocks.push({ kind: 'ul', items: lines.map((l) => [{ text: l.replace(/^[-•*]\s+/, '') }]) });
    } else if (lines.length > 0 && numbered.length === lines.length) {
      blocks.push({ kind: 'ol', items: lines.map((l) => [{ text: l.replace(/^\d+[.)]\s+/, '') }]) });
    } else if (lines.length) {
      blocks.push({ kind: 'p', content: [{ text: lines.join('\n') }] });
    }
  }
  return blocks;
}

export function parseRichText(value: string | undefined | null): Block[] {
  if (!value?.trim()) return [];
  return /<\/?[a-z][^>]*>/i.test(value) ? parseHtml(value) : parsePlain(value);
}

function renderInline(parts: Inline[]) {
  return parts.map((part, i) => {
    let node: React.ReactNode = part.text.split('\n').flatMap((line, j) => (j === 0 ? [line] : [<br key={j} />, line]));
    if (part.italic) node = <em>{node}</em>;
    if (part.bold) node = <strong className="font-semibold text-sg-black">{node}</strong>;
    return <React.Fragment key={i}>{node}</React.Fragment>;
  });
}

export default function RichText({ value, fallback, className = '' }: { value?: string | null; fallback?: React.ReactNode; className?: string }) {
  const blocks = parseRichText(value);
  if (blocks.length === 0) return <>{fallback ?? null}</>;

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, i) => {
        if (block.kind === 'h') {
          return <h3 key={i} className="text-sm font-bold text-sg-black pt-1">{renderInline(block.content)}</h3>;
        }
        if (block.kind === 'p') {
          return <p key={i}>{renderInline(block.content)}</p>;
        }
        const List = block.kind;
        return (
          <List key={i} className={`${List === 'ul' ? 'list-disc' : 'list-decimal'} pl-5 space-y-1.5 marker:text-sg-pink`}>
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">{renderInline(item)}</li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

/** Plain-text version for meta descriptions and search snippets. */
export function richTextToPlain(value: string | undefined | null, maxLength = 160) {
  const text = parseRichText(value)
    .flatMap((b) => ('items' in b ? b.items.flat() : b.content))
    .map((p) => p.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}
