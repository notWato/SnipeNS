const ENS_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

// 90 days in seconds
const GRACE_PERIOD_SECONDS = 90 * 24 * 60 * 60;

export interface EnsDomain {
  id: string;
  name: string;
  labelName: string | null;
  labelhash: string;
  expiryDate: number;
  gracePeriodEndDate: number;
}

export async function getGracePeriodDomains(): Promise<EnsDomain[]> {
  const now = Math.floor(Date.now() / 1000);
  const gracePeriodStart = now - GRACE_PERIOD_SECONDS;

  const query = `
    query GetGracePeriodDomains($gracePeriodStart: Int!, $now: Int!) {
      domains(
        first: 100,
        orderBy: expiryDate,
        orderDirection: asc,
        where: { expiryDate_gt: $gracePeriodStart, expiryDate_lt: $now }
      ) {
        id
        name
        labelName
        labelhash
        expiryDate
      }
    }
  `;

  try {
    const response = await fetch(ENS_SUBGRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          gracePeriodStart,
          now,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    const domains = json.data.domains.map((domain: any) => ({
      ...domain,
      expiryDate: Number(domain.expiryDate),
      gracePeriodEndDate: Number(domain.expiryDate) + GRACE_PERIOD_SECONDS,
    }));

    return domains;
  } catch (error) {
    console.error("Failed to fetch domains from ENS subgraph:", error);
    return [];
  }
}
