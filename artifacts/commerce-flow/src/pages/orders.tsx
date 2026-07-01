import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  packed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  shipped: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Orders() {
  const { user } = useAuth();
  const { data, isLoading } = useListOrders({}, { query: { enabled: !!user } });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your orders.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-8" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-36 w-full mb-4" />)}
      </div>
    );
  }

  const orders = data?.orders ?? [];

  if (!orders.length) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">Place your first order to see it here.</p>
        <Button asChild><Link href="/products">Browse Catalog</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="rounded-xl border border-border bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-muted-foreground">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[order.status] ?? ""}`}>{order.status}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {(Array.isArray(order.items) ? order.items : []).slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {(Array.isArray(order.items) ? order.items : []).length > 3 && (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    +{(Array.isArray(order.items) ? order.items : []).length - 3}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{(Array.isArray(order.items) ? order.items : []).length} items</span>
                <span className="font-mono font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
