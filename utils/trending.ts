import { EnsDomain, getExpiredDomains } from "./ens.ts";

export interface TrendingDomain extends EnsDomain {
  score: number;
}

// A simple scoring function. Shorter names get higher scores.
// We can make this much more complex later.
function calculateScore(domain: EnsDomain): number {
  // Remove the ".eth" part before calculating length
  const nameOnly = domain.name.replace(".eth", "");
  const lengthScore = 100 - nameOnly.length;

  // Add other scoring metrics here in the future
  // e.g., isNumeric, isDictionaryWord, etc.

  return lengthScore;
}

export async function getTrendingDomains(): Promise<TrendingDomain[]> {
  const domains = await getExpiredDomains();

  const scoredDomains = domains.map((domain) => ({
    ...domain,
    score: calculateScore(domain),
  }));

  // Sort by score in descending order
  scoredDomains.sort((a, b) => b.score - a.score);

  return scoredDomains;
}
