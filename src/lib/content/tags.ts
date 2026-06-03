export function slugifyTag(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTags(tags: string[]) {
  const seen = new Set<string>();

  return tags
    .map((name) => ({ name: name.trim(), slug: slugifyTag(name) }))
    .filter((tag) => tag.name && tag.slug)
    .filter((tag) => {
      if (seen.has(tag.slug)) {
        return false;
      }

      seen.add(tag.slug);
      return true;
    });
}
