import LandingFlow from "@/components/LandingFlow";

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return <LandingFlow searchParams={resolvedSearchParams} />;
}
