/**
 * Represents a contiguous segment of text and whether it matched the query.
 */
export interface TextSegment {
  text: string;
  highlight: boolean;
}

/**
 * Splits `text` into an array of {@link TextSegment}s by locating every
 * case-insensitive occurrence of `query` within `text`.
 *
 * Unmatched regions have `highlight: false`; matched regions have
 * `highlight: true`.
 *
 * If `query` is empty or blank the entire string is returned as a single
 * un-highlighted segment.
 *
 * @example
 * highlightText('Implement authentication', 'auth')
 * // → [
 * //     { text: 'Implement ', highlight: false },
 * //     { text: 'auth',       highlight: true  },
 * //     { text: 'entication', highlight: false },
 * //   ]
 */
export function highlightText(text: string, query: string): TextSegment[] {
  const trimmed = query.trim();

  // No query → return the full text as a single non-highlighted segment.
  if (!trimmed) {
    return [{ text, highlight: false }];
  }

  const segments: TextSegment[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const queryLen = lowerQuery.length;
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);

    if (matchIndex === -1) {
      // No more matches — push the remaining text and stop.
      segments.push({ text: text.slice(cursor), highlight: false });
      break;
    }

    // Push any text before this match as un-highlighted.
    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlight: false });
    }

    // Push the matched portion (preserving original casing) as highlighted.
    segments.push({
      text: text.slice(matchIndex, matchIndex + queryLen),
      highlight: true,
    });

    cursor = matchIndex + queryLen;
  }

  return segments;
}
