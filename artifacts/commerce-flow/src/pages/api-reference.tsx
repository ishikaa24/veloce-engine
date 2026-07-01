import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Endpoint {
  method: Method;
  path: string;
  description: string;
  auth?: boolean;
  admin?: boolean;
  requestBody?: string;
  response: string;
  statusCodes: { code: number; desc: string }[];
}

interface Section {
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const METHOD_COLORS: Record<Method, string> = {
  GET:    "bg-green-500/10 text-green-400 border-green-500/30",
  POST:   "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PUT:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/30",
  PATCH:  "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

const SECTIONS: Section[] = [
  {
    title: "Authentication",
    description: "All protected routes require a Bearer token. Obtain a token via POST /api/auth/login.",
    endpoints: [
      {
        method: "POST", path: "/api/auth/register", description: "Create a new customer account",
        requestBody: `{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword"
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "customer"
  }
}`,
        statusCodes: [{ code: 201, desc: "Account created" }, { code: 409, desc: "Email already exists" }, { code: 422, desc: "Validation error" }],
      },
      {
        method: "POST", path: "/api/auth/login", description: "Authenticate and receive a JWT token",
        requestBody: `{
  "email": "jane@example.com",
  "password": "securepassword"
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "customer" }
}`,
        statusCodes: [{ code: 200, desc: "Authenticated" }, { code: 401, desc: "Invalid credentials" }],
      },
      {
        method: "GET", path: "/api/auth/me", description: "Get the authenticated user's profile", auth: true,
        response: `{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "customer",
  "createdAt": "2025-01-15T10:23:00Z"
}`,
        statusCodes: [{ code: 200, desc: "Success" }, { code: 401, desc: "Unauthorized" }],
      },
    ],
  },
  {
    title: "Products",
    description: "Manage the product catalog. Listing and retrieval are public. Create, update, and delete require admin.",
    endpoints: [
      {
        method: "GET", path: "/api/products", description: "List products with optional filters",
        response: `{
  "products": [
    {
      "id": 1, "name": "MacBook Pro M3 Max",
      "price": 3499.99, "comparePrice": 3999.99,
      "stock": 12, "rating": 4.9, "reviewCount": 247,
      "categoryId": 1, "categoryName": "Electronics",
      "imageUrl": "https://...", "isFeatured": true
    }
  ],
  "total": 12, "page": 1, "totalPages": 1
}`,
        statusCodes: [{ code: 200, desc: "Success" }],
      },
      {
        method: "GET", path: "/api/products/:id", description: "Get a single product by ID",
        response: `{
  "id": 1, "name": "MacBook Pro M3 Max",
  "description": "The most powerful MacBook ever.",
  "price": 3499.99, "comparePrice": 3999.99,
  "stock": 12, "rating": 4.9, "reviewCount": 247,
  "images": ["https://..."], "isFeatured": true
}`,
        statusCodes: [{ code: 200, desc: "Success" }, { code: 404, desc: "Not found" }],
      },
      {
        method: "POST", path: "/api/products", description: "Create a new product", auth: true, admin: true,
        requestBody: `{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "categoryId": 1,
  "imageUrl": "https://..."
}`,
        response: `{ "id": 13, "name": "New Product", "price": 99.99, ... }`,
        statusCodes: [{ code: 201, desc: "Created" }, { code: 401, desc: "Unauthorized" }, { code: 403, desc: "Forbidden" }],
      },
    ],
  },
  {
    title: "Cart",
    description: "Shopping cart operations. All cart endpoints require authentication.",
    endpoints: [
      {
        method: "GET", path: "/api/cart", description: "Get the current user's cart", auth: true,
        response: `{
  "items": [
    { "productId": 1, "name": "MacBook Pro M3 Max",
      "price": 3499.99, "quantity": 1, "subtotal": 3499.99, "imageUrl": "https://..." }
  ],
  "itemCount": 1, "subtotal": 3499.99, "total": 3499.99
}`,
        statusCodes: [{ code: 200, desc: "Success" }, { code: 401, desc: "Unauthorized" }],
      },
      {
        method: "POST", path: "/api/cart", description: "Add an item to cart", auth: true,
        requestBody: `{ "productId": 1, "quantity": 2 }`,
        response: `{ "items": [...], "itemCount": 2, "total": 6999.98 }`,
        statusCodes: [{ code: 200, desc: "Item added" }, { code: 400, desc: "Insufficient stock" }, { code: 404, desc: "Product not found" }],
      },
      {
        method: "DELETE", path: "/api/cart", description: "Clear the entire cart", auth: true,
        response: `{ "message": "Cart cleared" }`,
        statusCodes: [{ code: 200, desc: "Cleared" }],
      },
    ],
  },
  {
    title: "Orders",
    description: "Order creation and lifecycle management. Customers see their own orders; admins see all.",
    endpoints: [
      {
        method: "GET", path: "/api/orders", description: "List orders (customer: own orders; admin: all orders)", auth: true,
        response: `{
  "orders": [
    { "id": 1, "status": "delivered", "total": 3499.99,
      "items": [...], "createdAt": "2025-01-15T10:00:00Z" }
  ],
  "total": 5, "page": 1, "totalPages": 1
}`,
        statusCodes: [{ code: 200, desc: "Success" }],
      },
      {
        method: "POST", path: "/api/orders", description: "Place a new order from the current cart", auth: true,
        requestBody: `{ "shippingAddress": "123 Main St, San Francisco, CA 94105" }`,
        response: `{ "id": 6, "status": "pending", "total": 3499.99, "items": [...] }`,
        statusCodes: [{ code: 201, desc: "Order placed" }, { code: 400, desc: "Cart empty or stock issue" }],
      },
      {
        method: "PATCH", path: "/api/orders/:id/status", description: "Update order status (admin only)", auth: true, admin: true,
        requestBody: `{ "status": "shipped" }`,
        response: `{ "id": 1, "status": "shipped", ... }`,
        statusCodes: [{ code: 200, desc: "Updated" }, { code: 403, desc: "Forbidden" }, { code: 404, desc: "Order not found" }],
      },
    ],
  },
  {
    title: "Categories",
    description: "Product category management. Listing is public; mutations require admin access.",
    endpoints: [
      {
        method: "GET", path: "/api/categories", description: "List all categories with product counts",
        response: `[
  { "id": 1, "name": "Electronics", "description": "...", "productCount": 5 },
  { "id": 2, "name": "Apparel", "description": "...", "productCount": 2 }
]`,
        statusCodes: [{ code: 200, desc: "Success" }],
      },
    ],
  },
  {
    title: "Users",
    description: "User management endpoints. All require admin access except profile update.",
    endpoints: [
      {
        method: "GET", path: "/api/users", description: "List all users (paginated)", auth: true, admin: true,
        response: `{
  "users": [
    { "id": 1, "name": "Admin User", "email": "admin@veloce.dev",
      "role": "admin", "createdAt": "2025-01-01T00:00:00Z" }
  ],
  "total": 3, "page": 1, "totalPages": 1
}`,
        statusCodes: [{ code: 200, desc: "Success" }, { code: 403, desc: "Forbidden" }],
      },
      {
        method: "PUT", path: "/api/users/profile", description: "Update the authenticated user's profile", auth: true,
        requestBody: `{ "name": "New Name" }`,
        response: `{ "id": 2, "name": "New Name", "email": "jane@example.com" }`,
        statusCodes: [{ code: 200, desc: "Updated" }],
      },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="absolute top-3 right-3 text-muted-foreground hover:text-white transition-colors p-1 rounded"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border border-border rounded-xl overflow-hidden transition-colors", open ? "bg-card/60" : "bg-card/30 hover:bg-card/50")}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setOpen(!open)}>
        <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded border font-mono flex-shrink-0", METHOD_COLORS[endpoint.method])}>
          {endpoint.method}
        </span>
        <span className="font-mono text-sm text-white flex-1 truncate">{endpoint.path}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {endpoint.auth && <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-mono">auth</span>}
          {endpoint.admin && <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded font-mono">admin</span>}
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-5">
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>

          {endpoint.requestBody && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Request Body</p>
              <div className="relative rounded-lg border border-border bg-[#060606] p-4">
                <CopyButton text={endpoint.requestBody} />
                <pre className="font-mono text-xs text-green-300 overflow-x-auto">{endpoint.requestBody}</pre>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Example Response</p>
            <div className="relative rounded-lg border border-border bg-[#060606] p-4">
              <CopyButton text={endpoint.response} />
              <pre className="font-mono text-xs text-blue-300 overflow-x-auto">{endpoint.response}</pre>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Status Codes</p>
            <div className="flex flex-wrap gap-2">
              {endpoint.statusCodes.map(s => (
                <div key={s.code} className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded border", s.code < 300 ? "bg-green-500/10 text-green-400 border-green-500/20" : s.code < 400 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                  <span className="font-mono font-bold">{s.code}</span>
                  <span className="text-muted-foreground">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiReference() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-6">
          API Reference
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">API Reference</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Veloce Engine REST API documentation. Base URL: <code className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">/api</code>
        </p>
        <div className="mt-4 p-4 rounded-xl border border-border bg-card/40 font-mono text-sm">
          <p className="text-muted-foreground mb-1"># Authentication</p>
          <p><span className="text-yellow-300">Authorization</span><span className="text-white">: Bearer </span><span className="text-orange-300">{"<your_jwt_token>"}</span></p>
        </div>
      </div>

      <div className="space-y-10">
        {SECTIONS.map(section => (
          <div key={section.title}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
            <div className="space-y-2">
              {section.endpoints.map((ep, i) => <EndpointCard key={i} endpoint={ep} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
