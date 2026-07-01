import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Globe, ShieldCheck, Zap, GitBranch, Server, Code2, Layers } from "lucide-react";

const LAYERS = [
  {
    icon: Globe,
    label: "Frontend Layer",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    items: ["React + Vite (Storefront)", "Admin Dashboard", "Mobile (React Native)", "Any HTTP client"],
  },
  {
    icon: Server,
    label: "API Layer",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    items: ["Express 5 REST API", "JWT Auth Middleware", "Zod Schema Validation", "OpenAPI 3.1 Spec"],
  },
  {
    icon: GitBranch,
    label: "Business Logic",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/20",
    items: ["Order State Machine", "Inventory Reservations", "Cart Session Logic", "Analytics Aggregation"],
  },
  {
    icon: Database,
    label: "Data Layer",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    items: ["PostgreSQL + Drizzle ORM", "Type-safe queries", "Migrations via drizzle-kit", "Connection pooling"],
  },
];

const STACK = [
  { cat: "Runtime", items: ["Node.js 24", "TypeScript 5.9", "ES Modules"] },
  { cat: "API", items: ["Express 5", "Zod validation", "jsonwebtoken", "bcryptjs"] },
  { cat: "Database", items: ["PostgreSQL 16", "Drizzle ORM", "drizzle-zod", "drizzle-kit"] },
  { cat: "Frontend", items: ["React 18", "Vite 7", "Tailwind CSS v4", "shadcn/ui"] },
  { cat: "State", items: ["TanStack Query v5", "Orval codegen", "Wouter router"] },
  { cat: "Build", items: ["esbuild", "pnpm workspaces", "TypeScript project refs"] },
];

export default function Architecture() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(225,29,72,0.08),transparent)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-8">
            <Layers className="h-3 w-3" /> System Architecture
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Built on solid<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">foundations.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veloce Engine uses a layered, contract-first architecture. OpenAPI spec defines the surface. Codegen generates the client. PostgreSQL stores the truth.
          </p>
        </div>
      </section>

      {/* Layer diagram */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">System Layers</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {LAYERS.map((layer, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-xl border ${layer.bg} group`}>
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${layer.bg}`}>
                  <layer.icon className={`h-5 w-5 ${layer.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold mb-1 ${layer.color}`}>{layer.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map(item => (
                      <span key={item} className="text-xs bg-background/50 border border-border px-2 py-0.5 rounded font-mono text-muted-foreground">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* Arrows between layers */}
          </div>
        </div>
      </section>

      {/* Request flow */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-4">Request Flow</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Every API request goes through a consistent pipeline: authentication middleware validates the JWT, Zod schemas validate the request body, business logic executes, Drizzle queries PostgreSQL, and a typed response is returned.
              </p>
              <div className="space-y-3">
                {[
                  { step: "1", label: "Client Request", desc: "Any HTTP client sends a request to /api/..." },
                  { step: "2", label: "Auth Middleware", desc: "JWT is verified. User role is attached to req.user." },
                  { step: "3", label: "Zod Validation", desc: "Request body/params are parsed and validated." },
                  { step: "4", label: "Route Handler", desc: "Business logic executes with typed DB access." },
                  { step: "5", label: "Drizzle ORM", desc: "Type-safe SQL query is executed against PostgreSQL." },
                  { step: "6", label: "JSON Response", desc: "Validated response shape is returned to the client." },
                ].map(s => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">{s.step}</div>
                    <div>
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract-first diagram */}
            <div className="rounded-xl border border-border bg-[#060606] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#0a0a0a]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">Contract-first workflow</span>
              </div>
              <div className="p-6 font-mono text-xs space-y-4 leading-relaxed">
                <div>
                  <p className="text-[#6b7280] mb-1"># 1. Define the OpenAPI contract</p>
                  <p className="text-green-400">lib/api-spec/openapi.yaml</p>
                  <p className="text-muted-foreground ml-2">→ paths, schemas, auth, responses</p>
                </div>
                <div>
                  <p className="text-[#6b7280] mb-1"># 2. Run codegen</p>
                  <p className="text-yellow-300">pnpm --filter @workspace/api-spec run codegen</p>
                  <p className="text-muted-foreground ml-2">→ generates React Query hooks + Zod schemas</p>
                </div>
                <div>
                  <p className="text-[#6b7280] mb-1"># 3. Implement the API server</p>
                  <p className="text-blue-400">artifacts/api-server/src/routes/</p>
                  <p className="text-muted-foreground ml-2">→ Express handlers with Drizzle queries</p>
                </div>
                <div>
                  <p className="text-[#6b7280] mb-1"># 4. Consume in the frontend</p>
                  <p className="text-purple-400">import {"{ useListProducts }"} from "@workspace/api-client-react"</p>
                  <p className="text-muted-foreground ml-2">→ fully typed, cached, auto-invalidating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STACK.map(s => (
              <div key={s.cat} className="rounded-xl border border-border bg-card/40 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{s.cat}</p>
                <ul className="space-y-1.5">
                  {s.items.map(item => (
                    <li key={item} className="text-xs text-foreground/80 font-mono">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Folder structure */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Monorepo Structure</h2>
            <div className="rounded-xl border border-border bg-[#060606] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#0a0a0a]">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">workspace root</span>
              </div>
              <div className="p-6 font-mono text-xs leading-7 text-muted-foreground">
                <p><span className="text-blue-400">artifacts/</span></p>
                <p className="pl-4"><span className="text-green-400">api-server/</span>        <span className="text-[#6b7280]"># Express REST API (port 5000)</span></p>
                <p className="pl-4"><span className="text-green-400">commerce-flow/</span>      <span className="text-[#6b7280]"># React + Vite storefront</span></p>
                <p><span className="text-blue-400">lib/</span></p>
                <p className="pl-4"><span className="text-yellow-400">api-client-react/</span>  <span className="text-[#6b7280]"># Generated React Query hooks</span></p>
                <p className="pl-4"><span className="text-yellow-400">api-spec/</span>          <span className="text-[#6b7280]"># OpenAPI spec + Orval config</span></p>
                <p className="pl-4"><span className="text-yellow-400">db/</span>                <span className="text-[#6b7280]"># Drizzle ORM schema + config</span></p>
                <p><span className="text-purple-400">pnpm-workspace.yaml</span>               <span className="text-[#6b7280]"># Workspace config</span></p>
                <p><span className="text-purple-400">tsconfig.base.json</span>                 <span className="text-[#6b7280]"># Shared TS config</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore further</h2>
          <p className="text-muted-foreground mb-8">Read the full API reference or dive into the documentation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild><Link href="/api-reference">API Reference <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button variant="outline" asChild><Link href="/docs">Documentation</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
