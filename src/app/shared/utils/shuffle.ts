// Fisher-Yates: walk from the end and swap each item with a random one at or before it.
// Every ordering is equally likely, unlike sorting with a random comparator. Returns a copy.
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
