import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AgentChat } from "./agent-chat";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgentPage({ params }: PageProps) {
  const { slug } = await params;

  const business = await db.business.findUnique({
    where: { slug },
    include: {
      agentConfig: true,
      services: { where: { isActive: true } },
    },
  });

  if (!business || !business.agentConfig) {
    notFound();
  }

  const cfg = business.agentConfig;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Agent header */}
      <div className="sticky top-0 z-50 border-b border-slate-200" style={{ backgroundColor: cfg.primaryColor }}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
            {cfg.agentName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm truncate">{cfg.agentName}</h1>
            <p className="text-white/70 text-xs truncate">{business.name} · AI Concierge</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <AgentChat
          businessSlug={slug}
          businessName={business.name}
          agentName={cfg.agentName}
          primaryColor={cfg.primaryColor}
          greeting={cfg.greeting}
        />
      </div>
    </div>
  );
}
