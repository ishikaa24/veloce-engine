import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  Zap, LayoutDashboard, ShoppingBag, FolderTree, 
  ShoppingCart, Users, BarChart3, LogOut, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  if (user?.role !== 'admin') {
    setLocation("/login");
    return null;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 border-r border-border bg-card/30 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Veloce Engine</span>
          </Link>
        </div>
        <div className="flex-1 py-4 px-3 space-y-0.5">
          <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-9 text-sm font-normal",
                  location === item.href
                    ? "bg-primary/10 text-primary hover:bg-primary/15 font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="mr-2.5 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="p-3 border-t border-border space-y-0.5">
          <Button variant="ghost" className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground font-normal" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2.5 h-4 w-4" />
              Storefront
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground font-normal" onClick={() => { logout(); setLocation("/login"); }}>
            <LogOut className="mr-2.5 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/20 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-sm">Veloce Engine</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
