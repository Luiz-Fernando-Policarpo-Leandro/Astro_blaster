const API = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5000";

export type MeteorItem = { id: string; name: string; link: { self: string } };

export async function getMeteors(): Promise<MeteorItem[]> {
  const res = await fetch(`${API}/api/meteors`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meteors");
  const data = await res.json();
  return data.items as MeteorItem[];
}

export async function getMeteor(id: string | number) {
  const res = await fetch(`${API}/api/meteors/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meteor detail");
  return res.json();
}
