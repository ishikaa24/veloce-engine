import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    content: `
Veloce Engine is an **API-first headless commerce platform** built for developers and modern businesses. It provides a complete backend for commerce operations — products, inventory, orders, cart, authentication, analytics, and more — all accessible via a clean REST API.

**Why Veloce Engine?**

Most commerce platforms lock you into their frontend. Veloce Engine gives you only what you actually need: a rock-solid backend API that powers any frontend you choose — Next.js, React Native, Vue, or plain HTTP.

**Key principles:**
- **API-first**: Every feature is a typed REST endpoint
- **Contract-first**: OpenAPI spec defines the surface before code is written  
- **Type-safe**: Zod schemas validate every input and output
- **Developer-first**: Codegen produces React Query hooks automatically
    `,
  },
  {
    id: "getting-started",
    title: "Getting Started",
    content: `
**Prerequisites**
- Node.js 20+
- pnpm 9+
- PostgreSQL 16+

**1. Clone and install**

\`\`\`bash
git clone <repository-url>
cd veloce-engine
pnpm install
\`\`\`

**2. Configure environment**

\`\`\`bash
# .env (api-server)
DATABASE_URL=postgresql://user:pass@localhost:5432/veloce
SESSION_SECRET=your-secret-here
PORT=5000
\`\`\`

**3. Push database schema**

\`\`\`bash
pnpm --filter @workspace/db run push
\`\`\`

**4. Start development**

\`\`\`bash
# API server
pnpm --filter @workspace/api-server run dev

# Storefront
pnpm --filter @workspace/commerce-flow run dev
\`\`\`

**Default credentials**
- Admin: \`admin@veloce.dev\` / \`admin123\`
- Customer: \`jane@example.com\` / \`admin123\`
    `,
  },
  {
    id: "authentication",
    title: "Authentication",
    content: `
Veloce Engine uses **JWT (JSON Web Tokens)** for stateless authentication.

**Login flow**

\`\`\`bash
curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@veloce.dev","password":"admin123"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "role": "admin" }
}
\`\`\`

**Using the token**

Include the token in every protected request:

\`\`\`bash
curl /api/cart \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

**In the frontend (automatic)**

The \`setAuthTokenGetter\` function wires JWT into every API call automatically:

\`\`\`ts
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("token"));
\`\`\`

**Roles**
- \`customer\` — can browse, cart, order, wishlist
- \`admin\` — full access including user management, analytics, product CRUD
    `,
  },
  {
    id: "api-design",
    title: "API Design",
    content: `
**Base URL**

All endpoints are prefixed with \`/api\`.

**Response format**

Success responses return JSON with the resource data. Error responses follow a consistent shape:

\`\`\`json
{
  "error": "Validation failed",
  "details": [{ "field": "email", "message": "Invalid email" }]
}
\`\`\`

**Pagination**

List endpoints support \`page\` and \`limit\` query params:

\`\`\`bash
GET /api/products?page=2&limit=12&sort=price_asc&categoryId=1
\`\`\`

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| \`page\` | number | Page number (default: 1) |
| \`limit\` | number | Items per page (default: 12) |
| \`search\` | string | Full-text search |
| \`sort\` | string | newest, price_asc, price_desc, rating |
| \`categoryId\` | number | Filter by category |
| \`featured\` | boolean | Featured products only |
    `,
  },
  {
    id: "database",
    title: "Database",
    content: `
Veloce Engine uses **PostgreSQL** with **Drizzle ORM** for type-safe queries.

**Schema location:** \`lib/db/src/schema/\`

**Tables**

| Table | Description |
|-------|-------------|
| \`users\` | Customer and admin accounts |
| \`categories\` | Product categories |
| \`products\` | Product catalog |
| \`carts\` | Per-user cart (JSONB items) |
| \`orders\` | Order records with JSONB items |
| \`reviews\` | Product reviews with ratings |
| \`wishlists\` | User wishlist items |

**Running migrations**

\`\`\`bash
# Push schema changes to database
pnpm --filter @workspace/db run push

# Generate migration files
pnpm --filter @workspace/db run generate
\`\`\`

**Adding a new table**

1. Add the schema to \`lib/db/src/schema/\`
2. Export it from \`lib/db/src/index.ts\`
3. Run \`pnpm --filter @workspace/db run push\`
4. Add routes in \`artifacts/api-server/src/routes/\`
    `,
  },
  {
    id: "deployment",
    title: "Deployment",
    content: `
Veloce Engine runs on Replit with automated deployment via the Replit Deploy button.

**Production environment**

The API server builds to a single esbuild bundle (\`dist/index.mjs\`). The frontend builds to static assets served by Vite's preview server.

**Environment variables (production)**

\`\`\`
DATABASE_URL     # PostgreSQL connection string
SESSION_SECRET   # JWT signing secret (min 32 chars)
PORT             # Auto-assigned by Replit
NODE_ENV         # Set to "production"
\`\`\`

**Build commands**

\`\`\`bash
# Build API server
pnpm --filter @workspace/api-server run build

# Build frontend
pnpm --filter @workspace/commerce-flow run build

# Full project typecheck
pnpm run typecheck
\`\`\`

**Health check**

\`\`\`bash
curl /api/health
# → { "status": "ok", "uptime": 12345 }
\`\`\`
    `,
  },
  {
    id: "roadmap",
    title: "Roadmap",
    content: `
**Coming soon**

- **Stripe Payments** — Real checkout with payment intent lifecycle
- **Webhooks** — Event delivery for order status changes
- **Product Variants** — Size, color, and SKU management
- **Discount Codes** — Percentage and fixed-amount coupons
- **Multi-currency** — Localized pricing and currency conversion
- **Email Notifications** — Transactional emails via Resend
- **GraphQL API** — Alternative to REST for complex queries
- **Image CDN** — Optimized image delivery with transformations
- **Audit Logs** — Full admin action history

**Contributing**

Open an issue or PR on GitHub. All contributions welcome.
    `,
  },
];

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-semibold text-white mt-5 mb-2">{line.replace(/\*\*/g, "")}</p>;
    }
    if (line.startsWith("```")) {
      return null;
    }
    if (line.startsWith("| ")) {
      return <p key={i} className="font-mono text-xs text-muted-foreground border-b border-border py-1">{line}</p>;
    }
    if (line.startsWith("- ")) {
      return <li key={i} className="text-muted-foreground text-sm ml-4 list-disc">{line.slice(2).replace(/\*\*/g, "")}</li>;
    }
    if (line.startsWith("`") && line.endsWith("`")) {
      return <code key={i} className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{line.slice(1, -1)}</code>;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="text-muted-foreground text-sm leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
  });
}

export default function Docs() {
  const [active, setActive] = useState("introduction");
  const current = SECTIONS.find(s => s.id === active)!;

  const isCode = (text: string) => {
    const lines = text.split("\n");
    const inBlock: string[] = [];
    let insideBlock = false;
    for (const line of lines) {
      if (line.startsWith("```")) { insideBlock = !insideBlock; continue; }
      if (insideBlock) inBlock.push(line);
    }
    return inBlock;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
          <BookOpen className="h-3 w-3" /> Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Veloce Engine Docs</h1>
        <p className="text-muted-foreground text-lg">Everything you need to build, deploy, and scale commerce.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-3">Contents</p>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                  active === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-white hover:bg-muted/40"
                )}
                onClick={() => setActive(s.id)}
              >
                {active === s.id && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
                {s.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card/30 p-8">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-border">{current.title}</h2>

            <div className="space-y-1 prose-sm max-w-none">
              {current.content.split("```").map((segment, i) => {
                if (i % 2 === 1) {
                  const lines = segment.split("\n");
                  const lang = lines[0];
                  const code = lines.slice(1).join("\n");
                  return (
                    <div key={i} className="my-4 rounded-lg border border-border bg-[#060606] overflow-hidden">
                      {lang && <div className="px-4 py-1.5 border-b border-border bg-[#0a0a0a] text-[11px] font-mono text-muted-foreground">{lang}</div>}
                      <pre className="p-4 text-xs font-mono text-green-300 overflow-x-auto whitespace-pre">{code}</pre>
                    </div>
                  );
                }
                return <div key={i}>{renderContent(segment)}</div>;
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {SECTIONS.findIndex(s => s.id === active) > 0 && (
                <Button variant="outline" size="sm" onClick={() => setActive(SECTIONS[SECTIONS.findIndex(s => s.id === active) - 1].id)}>
                  ← Previous
                </Button>
              )}
              {SECTIONS.findIndex(s => s.id === active) < SECTIONS.length - 1 && (
                <Button size="sm" className="ml-auto" onClick={() => setActive(SECTIONS[SECTIONS.findIndex(s => s.id === active) + 1].id)}>
                  Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
