import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Vĩnh Khánh Food Map</h1>
      <Link href="/map" className="px-4 py-2 bg-black text-white rounded">Explore Map</Link>
      <Link href="/chat" className="px-4 py-2 border rounded">Ask AI</Link>
    </div>
  );
}