import { TagType } from '@/entities/mongo/social-post-tag.mongo-entity';

/**
 * Normalizes hashtags to a stable slug (lowercase) for indexing and trending.
 */
export function normalizeHashtagSlug(raw: string): string {
  const trimmed = raw.trim().replace(/^#+/, '').toLowerCase();
  return trimmed.normalize('NFKC').slice(0, 120);
}

/**
 * Finds unique hashtag slugs inside post content (Markdown-style #keyword).
 */
export function extractHashtagsFromContent(content: string | null | undefined): string[] {
  if (!content) return [];

  const seen = new Set<string>();
  const out: string[] = [];

  const re = /(^|[^\p{L}\p{N}_])(#([\p{L}\p{N}_]+))/gu;

  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const slug = normalizeHashtagSlug(m[3] ?? '');
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }

  return out;
}

export function hashtagsFromManualTags(
  tags: ReadonlyArray<{ target_id?: string; target_name?: string; type: TagType | string }>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of tags) {
    if (t.type !== TagType.HASHTAG) continue;
    const raw =
      (t.target_id && t.target_id.trim()) ||
      normalizeHashtagSlug(t.target_name?.replace(/^#+/, '') || '');
    const slug = normalizeHashtagSlug(raw);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}
