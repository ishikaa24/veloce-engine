import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, User, LogOut, Package, ShieldCheck, Heart, Zap, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGetCart } from "@workspace/api-client-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Catalog", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "Architecture", href: "/architecture" },
  { label: "Docs", href: "/docs" },
  { label: "API Reference", href: "/api-reference" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: cart } = useGetCart({ query: { enabled: !!user } });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="h-3.5 w-3.5 text-white fill-white" />
              </div>
              <span className="font-bold text-base tracking-tight">Veloce Engine</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "text-sm transition-colors",
                    location === l.href ? "text-white font-medium" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
                {cart?.itemCount ? (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary border-0">
                    {cart.itemCount}
                  </Badge>
                ) : null}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border hover:border-primary/50 transition-colors">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/orders"><Package className="mr-2 h-4 w-4" />Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/wishlist"><Heart className="mr-2 h-4 w-4" />Wishlist</Link></DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin Dashboard</Link></DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { logout(); setLocation("/"); }}>
                    <LogOut className="mr-2 h-4 w-4" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="h-8 text-sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
                <div className={cn("px-3 py-2 rounded-lg text-sm transition-colors", location === l.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white hover:bg-muted/50")}>
                  {l.label}
                </div>
              </Link>
            ))}
            {!user && (
              <div className="pt-3 flex gap-2 border-t border-border mt-3">
                <Button variant="outline" size="sm" className="flex-1" asChild><Link href="/login">Sign In</Link></Button>
                <Button size="sm" className="flex-1" asChild><Link href="/register">Get Started</Link></Button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
