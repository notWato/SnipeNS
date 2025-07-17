import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { EnsDomain, getExpiredDomains } from "../utils/ens.ts";

interface Data {
  domains: EnsDomain[];
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const domains = await getExpiredDomains();
    return ctx.render({ domains });
  },
};

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) {
    return "Expired";
  }
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  return `${days}d ${hours}h ${minutes}m remaining`;
}

export default function EnsPage({ data }: PageProps<Data>) {
  const { domains } = data;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  return (
    <>
      <Head>
        <title>Expired & Expiring ENS Domains | SnipeNS</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-2xl font-bold mb-4">Expired & Expiring Domains</h1>
        {domains.length > 0 ? (
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th class="py-2 px-4 border-b">Domain</th>
                  <th class="py-2 px-4 border-b">Status</th>
                  <th class="py-2 px-4 border-b">Time Remaining</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id} class={domain.state === 'decay' ? 'bg-yellow-100' : ''}>
                    <td class="py-2 px-4 border-b">{domain.name}</td>
                    <td class="py-2 px-4 border-b">
                      {domain.state === 'grace' ? 'In Grace Period' : 'In Decay (Auction Live)'}
                    </td>
                    <td class="py-2 px-4 border-b">
                      {domain.state === 'grace'
                        ? formatTimeRemaining(domain.gracePeriodEndDate - nowInSeconds)
                        : formatTimeRemaining(domain.decayPeriodEndDate - nowInSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No expired domains found.</p>
        )}
      </div>
    </>
  );
}
