import Link from "next/link";
import { Suspense } from "react";

// Placeholder until the bus details screen (Figma S2) is built.
// `params` is only known at request time, so it is read inside a Suspense.
const BusId = async ({ params }) => {
  const { id } = await params;
  return <p className="mt-2 text-sm text-muted">Coming soon. Bus id: {id}</p>;
};

export default function BusDetailsPage({ params }) {
  return (
    <main className="p-6">
      <Link href="/home" className="text-sm font-bold text-primary">
        Back
      </Link>
      <h1 className="mt-4 font-display text-2xl text-ink">Bus details</h1>
      <Suspense fallback={<p className="mt-2 text-sm text-muted">Loading...</p>}>
        <BusId params={params} />
      </Suspense>
    </main>
  );
}
