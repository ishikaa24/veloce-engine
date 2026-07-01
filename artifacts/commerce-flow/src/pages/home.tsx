import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Database, Code2, GitBranch, ShieldCheck, BarChart3, Globe, Webhook, CheckCircle2, ChevronRight } from "lucide-react";

const METRICS = [
  { value: "<50ms", label: "API response time" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "150+", label: "Webhook events" },
  { value: "∞", label: "Scalability" },
];

const FEATURES = [
  { icon: Code2, title: "API-First Architecture", desc: "Every capability exposed as a REST endpoint. Build any frontend — Next.js, Nuxt, React Native, or raw HTTP." },
  { icon: Database, title: "Product Management", desc: "Flexible catalog with variants, metadata, rich media, categories, and real-time inventory tracking." },
  { icon: Zap, title: "Inventory Engine", desc: "Reservation-based stock, backorder support, warehouse multi-location, and low-stock alerts." },
  { icon: ShieldCheck, title: "Authentication", desc: "JWT-based auth with role management. Admin and customer roles with middleware-level enforcement." },
  { icon: GitBranch, title: "Order Processing", desc: "Full order lifecycle — pending, confirmed, packed, shipped, delivered, cancelled. Built-in state machine." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Revenue trends, top products, category distribution, inventory alerts, and customer growth metrics." },
  { icon: Webhook, title: "Webhooks", desc: "Subscribe to 150+ events. Idempotent delivery, retry logic, and event replay for reliability." },
  { icon: Globe, title: "Multi-channel Commerce", desc: "One backend, infinite frontends. Web, mobile, kiosk, voice — the same API powers every channel." },
];

const TERMINAL_LINES = [
  { type: "comment", text: "// Fetch featured products from Veloce Engine" },
  { type: "code", text: `const { data } = await veloce.products.list({` },
  { type: "indent", text: `  featured: true, limit: 10, sort: "rating"` },
  { type: "code", text: `});` },
  { type: "blank" },
  { type: "comment", text: "// Response: HTTP 200 — 47ms" },
  { type: "json", text: `{` },
  { type: "json-indent", key: `  "products"`, value: `: [{ "id": "prod_9x8f2", "name": "MacBook Pro M3",` },
  { type: "json-indent", key: `             `, value: `  "price": 3499.99, "stock": 12 }],` },
  { type: "json-indent", key: `  "total"`, value: `: 47, "page": 1` },
  { type: "json", text: `}` },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full">

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-36 md:pt-36 md:pb-48 grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(225,29,72,0.12),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-10 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium">v2.0 API — Now in Early Access</span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.02]">
              Veloce{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-400 to-secondary">
                Engine
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
              Build Commerce at the Speed of Scale.
            </p>

            <p className="text-base md:text-lg text-muted-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              A modern API-first commerce engine that powers storefronts, mobile apps, and enterprise commerce through a scalable, composable backend.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button size="lg" className="h-12 px-8 text-base glow-red-sm hover:glow-red transition-all" asChild>
                <Link href="/register">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border hover:border-primary/50 transition-colors" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-border rounded-2xl overflow-hidden bg-border">
              {METRICS.map(m => (
                <div key={m.label} className="bg-background px-6 py-5 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white font-mono mb-1">{m.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terminal + API demo */}
      <section className="py-28 bg-card/20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                REST API
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Everything is just<br />an API call away.
              </h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Stop fighting monolithic platforms. Veloce Engine's composable architecture lets you build any frontend while we handle the complex backend state machine, inventory logic, and order orchestration.
              </p>

              <ul className="space-y-4">
                {[
                  "Typed SDKs for React, Next.js, Vue, and React Native",
                  "Idempotent operations for safe retries",
                  "Webhooks for 150+ commerce events",
                  "Global edge caching with sub-50ms reads",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/api-reference">
                  <Button variant="outline" className="border-border hover:border-primary/50">
                    Explore API Reference <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Terminal */}
            <div className="rounded-xl border border-border bg-[#060606] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#0a0a0a]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">GET /api/products?featured=true</span>
              </div>
              <div className="p-6 font-mono text-sm leading-7 overflow-x-auto">
                <p className="text-[#6b7280]">{"// Fetch featured products from Veloce Engine"}</p>
                <p><span className="text-blue-400">const</span> <span className="text-white">{"{ data }"}</span> <span className="text-white">=</span> <span className="text-blue-400">await</span> <span className="text-green-400">veloce</span><span className="text-white">.products.</span><span className="text-yellow-200">list</span><span className="text-white">{"({"}</span></p>
                <p className="pl-4"><span className="text-purple-400">featured</span><span className="text-white">: </span><span className="text-blue-300">true</span><span className="text-white">, </span><span className="text-purple-400">limit</span><span className="text-white">: </span><span className="text-blue-300">10</span><span className="text-white">, </span><span className="text-purple-400">sort</span><span className="text-white">: </span><span className="text-orange-300">"rating"</span></p>
                <p><span className="text-white">{"});"}</span></p>
                <p>&nbsp;</p>
                <p className="text-[#6b7280]">{"// ✓ HTTP 200 — 43ms"}</p>
                <p><span className="text-white">{"{"}</span></p>
                <p className="pl-4"><span className="text-green-300">"products"</span><span className="text-white">: [{"{"}</span></p>
                <p className="pl-8"><span className="text-green-300">"id"</span><span className="text-white">: </span><span className="text-orange-300">"prod_9x8f2"</span><span className="text-white">,</span></p>
                <p className="pl-8"><span className="text-green-300">"name"</span><span className="text-white">: </span><span className="text-orange-300">"MacBook Pro M3 Max"</span><span className="text-white">,</span></p>
                <p className="pl-8"><span className="text-green-300">"price"</span><span className="text-white">: </span><span className="text-blue-300">3499.99</span><span className="text-white">, </span><span className="text-green-300">"stock"</span><span className="text-white">: </span><span className="text-blue-300">12</span></p>
                <p className="pl-4"><span className="text-white">{"}],"}</span></p>
                <p className="pl-4"><span className="text-green-300">"total"</span><span className="text-white">: </span><span className="text-blue-300">47</span><span className="text-white">, </span><span className="text-green-300">"page"</span><span className="text-white">: </span><span className="text-blue-300">1</span></p>
                <p><span className="text-white">{"}"}</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-secondary bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full mb-6">
              <Zap className="h-3 w-3" /> Platform Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Infrastructure, not just a storefront.</h2>
            <p className="text-muted-foreground text-lg">Designed for scale from day one, built on composable primitives.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all cursor-default">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture callout */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(225,29,72,0.08),transparent_60%)]" />
            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build at scale?</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Veloce Engine powers production commerce across web, mobile, and enterprise. Start with the API, ship in hours.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <Button size="lg" className="h-12 px-8 glow-red-sm" asChild>
                  <Link href="/register">Start Building <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 border-border hover:border-primary/40" asChild>
                  <Link href="/architecture">View Architecture</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="font-bold text-lg">Veloce Engine</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Powering the next generation of headless commerce. API-first, developer-first, always.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Platform</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Documentation", href: "/docs" },
                  { label: "API Reference", href: "/api-reference" },
                  { label: "Architecture", href: "/architecture" },
                  { label: "Features", href: "/features" },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className="text-muted-foreground hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Account</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Dashboard", href: "/admin" },
                  { label: "Products", href: "/products" },
                  { label: "Sign In", href: "/login" },
                  { label: "Register", href: "/register" },
                ].map(l => (
                  <li key={l.href}><Link href={l.href} className="text-muted-foreground hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} Veloce Engine. MIT Licensed.</p>
            <p className="text-muted-foreground text-xs">Build Commerce at the Speed of Scale.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
