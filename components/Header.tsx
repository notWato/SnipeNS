export default function Header() {
  return (
    <header class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <a href="/" class="text-xl font-bold">SnipeNS</a>
        <nav>
          <a href="/ens" class="px-4 hover:underline">Expiring</a>
          <a href="/trending" class="px-4 hover:underline">Trending</a>
        </nav>
      </div>
    </header>
  );
}
