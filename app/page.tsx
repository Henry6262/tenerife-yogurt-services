import { db } from "@/lib/db";
import { Hero } from "@/components/landing/hero";
import { AgentsShowcase } from "@/components/landing/agents-showcase";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { BusinessesShowcase } from "@/components/landing/businesses-showcase";
import { TrustMarquee } from "@/components/landing/trust-marquee";

export default async function HomePage() {
  const businesses = await db.business.findMany({
    where: { isActive: true },
    include: {
      services: { where: { isActive: true } },
      agentConfig: true,
    },
  });

  const agents = businesses
    .filter((b) => b.agentConfig)
    .map((b) => ({
      slug: b.slug,
      agentName: b.agentConfig!.agentName,
      businessName: b.name,
      tone: b.agentConfig!.tone,
      greeting: b.agentConfig!.greeting,
      primaryColor: b.agentConfig!.primaryColor,
    }));

  return (
    <>
      <Hero />
      <TrustMarquee />
      <AgentsShowcase agents={agents} />
      <HowItWorks />
      <Features />
      <BusinessesShowcase businesses={businesses} />
    </>
  );
}
