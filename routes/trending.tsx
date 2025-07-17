import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { TrendingDomain, getTrendingDomains } from "../utils/trending.ts";

interface Data {
  domains: TrendingDomain[];
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const domains = await getTrendingDomains();
    return ctx.render({ domains });
  },
};

export default function TrendingPage({ data }: PageProps<Data>) {
  const { domains } = data;

  return (
    <>
      <Head>
        <title>Trending Domains | SnipeNS</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-2xl font-bold mb-4">Trending Domains</h1>
        <p class="mb-4">
          This page ranks expiring domains by a "trending" score. Currently, shorter names get a higher score.
        </p>
        {domains.length > 0 ? (
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th class="py-2 px-4 border-b">Rank</th>
                  <th class="py-2 px-4 border-b">Domain</th>
                  <th class="py-2 px-4 border-b">Score</th>
                  <th class="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain, index) => (
                  <tr key={domain.id} class={domain.state === 'decay' ? 'bg-yellow-100' : ''}>
                    <td class="py-2 px-4 border-b font-bold">{index + 1}</td>
                    <td class="py-2 px-4 border-b">{domain.name}</td>
                    <td class="py-2 px-4 border-b">{domain.score}</td>
                    <td class="py-2 px-4 border-b">
                      {domain.state === 'grace' ? 'In Grace Period' : 'In Decay (Auction Live)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No expired domains found to rank.</p>
        )}
      </div>
    </>
  );
}
