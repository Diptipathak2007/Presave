import SuccessView from "@/components/SuccessView";

export default async function SuccessPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return <SuccessView searchParams={resolvedSearchParams} />;
}
