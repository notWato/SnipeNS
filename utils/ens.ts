const ENS_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

// 90 days in seconds
const GRACE_PERIOD_SECONDS = 90 * 24 * 60 * 60;
// 28 days in seconds
const DECAY_PERIOD_SECONDS = 28 * 24 * 60 * 60;

export type DomainState = "grace" | "decay";

export interface EnsDomain {
  id: string;
  name: string;
  labelName: string | null;
  labelhash: string;
  expiryDate: number;
  gracePeriodEndDate: number;
  decayPeriodEndDate: number;
  state: DomainState;
}

export async function getExpiredDomains(): Promise<EnsDomain[]> {
  const now = Math.floor(Date.now() / 1000);
  const queryStartTime = now - (GRACE_PERIOD_SECONDS + DECAY_PERIOD_SECONDS);

  const query = `
    query GetExpiredDomains($startTime: Int!, $now: Int!) {
      domains(
        first: 100,
        orderBy: expiryDate,
        orderDirection: asc,
        where: { expiryDate_gt: $startTime, expiryDate_lt: $now }
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
          startTime: queryStartTime,
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

    const domains = json.data.domains.map((domain: any): EnsDomain => {
      const expiryDate = Number(domain.expiryDate);
      const gracePeriodEndDate = expiryDate + GRACE_PERIOD_SECONDS;
      const decayPeriodEndDate = gracePeriodEndDate + DECAY_PERIOD_SECONDS;
      
      const state: DomainState = now > gracePeriodEndDate ? "decay" : "grace";

      return {
        ...domain,
        expiryDate,
        gracePeriodEndDate,
        decayPeriodEndDate,
        state,
      };
    });

    return domains;
  } catch (error) {
    console.error("Failed to fetch domains from ENS subgraph:", error);
    return [];
  }
}
