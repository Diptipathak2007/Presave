import LandingFlow from "@/components/LandingFlow";

export default async function PresavePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return <LandingFlow searchParams={resolvedSearchParams} />;
}