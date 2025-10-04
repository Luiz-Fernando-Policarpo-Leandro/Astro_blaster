import { getMeteor } from "@/lib/api";

export default async function MeteorDetail({ params }: { params: { id: string } }) {
  const data = await getMeteor(params.id);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {data.name} (ID {data.id})
      </h1>
      <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(
          {
            absolute_magnitude_h: data.absolute_magnitude_h,
            is_potentially_hazardous_asteroid: data.is_potentially_hazardous_asteroid,
            nasa_jpl_url: data.nasa_jpl_url,
            close_approach_data: data.close_approach_data?.slice(0, 2),
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}
