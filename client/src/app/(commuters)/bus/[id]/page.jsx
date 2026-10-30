import { Suspense } from "react";
import BusDetails from "@/components/bus/BusDetails";

// `params` is only known at request time, so it is read inside a Suspense.
const Details = async ({ params }) => {
  const { id } = await params;
  return <BusDetails id={id} />;
};

export default function BusDetailsPage({ params }) {
  return (
    <Suspense fallback={null}>
      <Details params={params} />
    </Suspense>
  );
}
