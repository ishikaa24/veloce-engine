import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Database, Zap, GitBranch, ShieldCheck, BarChart3, Globe, Webhook, CheckCircle2, Package, CreditCard, Search } from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    title: "API-First Architecture",
    badge: "Core",
    desc: "Every capability is a REST endpoint. Products, orders, inventory, auth — all accessible via typed, versioned API with full OpenAPI documentation.",
    bullets: ["OpenAPI 3.1 spec", "Typed React Query hooks", "Zod-validated schemas", "Sub-50ms p99 response time"],
  },
  {
    icon: Database,
    title: "Product Management",
    badge: "Catalog",
    desc: "Build rich product catalogs with variants, custom metadata, multi-image galleries, categories, and real-time availability.",
    bullets: ["Flexible category tree", "Variant + SKU support", "Custom metadata fields", "Bulk import/export"],
  },
  {
    icon: Package,
    title: "Inventory Engine",
    badge: "Operations",
    desc: "Reservation-based stock management prevents overselling. Low-stock alerts, backorder support, and warehouse-level tracking.",
    bullets: ["Atomic stock reservations", "Backorder queuing", "Low-stock webhooks", "Multi-warehouse ready"],
  },
  {
    icon: ShieldCheck,
    title: "Authentication",
    badge: "Security",
    desc: "JWT-based stateless auth with role-based access control. Admin and customer roles enforced at middleware level.",
    bullets: ["JWT RS256 tokens", "Role-based access (RBAC)", "Secure password hashing", "Session invalidation"],
  },
  {
    icon: GitBranch,
    title: "Order Processing",
    badge: "Commerce",
    desc: "Full order lifecycle management with a built-in state machine: pending → confirmed → packed → shipped → delivered → cancelled.",
    bullets: ["State machine enforcement", "Admin status override", "Customer cancellation", "Order history tracking"],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    badge: "Insights",
    desc: "Revenue trends, top products, category distribution, customer growth, and inventory alerts — all from the admin dashboard.",
    bullets: ["Monthly revenue charts", "Top products by revenue", "Category distribution", "Inventory health alerts"],
  },
  {
    icon: Webhook,
    title: "Webhooks",
    badge: "Integrations",
    desc: "Subscribe to 150+ commerce events. Idempotent delivery with retry logic and event replay for downstream reliability.",
    bullets: ["150+ event types", "Retry with backoff", "Event replay", "HMAC signature verification"],
  },
  {
    icon: Globe,
    title: "Multi-channel Commerce",
    badge: "Scale",
    desc: "One unified backend, infinite frontend surfaces. Web storefronts, mobile apps, kiosks, voice assistants — one API.",
    bullets: ["Framework agnostic", "React Native support", "Edge-cacheable responses", "CORS configurable"],
  },
  {
    icon: Search,
    title: "Product Search & Filtering",
    badge: "Discovery",
    desc: "Full-text search, category filtering, price ranges, sorting by rating, price, or recency — all via query parameters.",
    bullets: ["Full-text search", "Multi-filter support", "Sort by rating/price/date", "Paginated results"],
  },
];

const BADGE_COLORS: Record<string, string> = {
  Core: "bg-primary/10 text-primary border-primary/20",
  Catalog: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Operations: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Security: "bg-green-500/10 text-green-400 border-green-500/20",
  Commerce: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Insights: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Integrations: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Scale: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Discovery: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function Features() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(225,29,72,0.1),transparent)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-8">
            <Zap className="h-3 w-3 fill-current" /> Platform Features
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Everything you need to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">power commerce.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Veloce Engine ships with a complete suite of commerce primitives. Build any experience without reinventing the backend.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild><Link href="/register">Start Building <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/api-reference">API Reference</Link></Button>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="pb-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-border bg-card/40 hover:bg-card/70 hover:border-primary/25 transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${BADGE_COLORS[f.badge]}`}>{f.badge}</span>
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-secondary flex-shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ship faster?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Start with the catalog, add authentication, wire up orders. Everything just works out of the box.</p>
          <Button size="lg" asChild><Link href="/register">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </section>
    </div>
  );
}
