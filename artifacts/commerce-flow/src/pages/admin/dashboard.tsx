import { useGetDashboardStats, useGetRevenueChart, useGetRecentActivity, useGetInventoryAlerts, useGetTopProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ShoppingBag, Package, Users, DollarSign, AlertTriangle, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function StatCard({ label, value, growth, icon: Icon, prefix = "" }: { label: string; value: string | number; growth?: number; icon: any; prefix?: string }) {
  const isPositive = (growth ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold font-mono">{prefix}{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-muted-foreground text-sm mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { enabled: user?.role === "admin" } });
  const { data: revenue, isLoading: revLoading } = useGetRevenueChart({ query: { enabled: user?.role === "admin" } });
  const { data: activity } = useGetRecentActivity({ query: { enabled: user?.role === "admin" } });
  const { data: alerts } = useGetInventoryAlerts({ query: { enabled: user?.role === "admin" } });
  const { data: topProducts } = useGetTopProducts({ query: { enabled: user?.role === "admin" } });

  if (!user || user.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Admin access required.</p>
        <Button asChild><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">CommerceFlow overview and metrics</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`$${stats?.totalRevenue.toLocaleString("en", {minimumFractionDigits:2,maximumFractionDigits:2})}`} growth={stats?.revenueGrowth} icon={DollarSign} />
          <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} growth={stats?.orderGrowth} icon={ShoppingBag} />
          <StatCard label="Products" value={stats?.totalProducts ?? 0} icon={Package} />
          <StatCard label="Customers" value={stats?.totalCustomers ?? 0} icon={Users} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/40 p-5">
          <h3 className="font-display font-semibold mb-4">Revenue Trend</h3>
          {revLoading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenue ?? []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #262626", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} />
                <Area type="monotone" dataKey="revenue" stroke="#E11D48" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card/40 p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-secondary" /> Low Stock
            </h3>
            <div className="space-y-2">
              {!alerts?.length && <p className="text-muted-foreground text-sm">All products well-stocked.</p>}
              {alerts?.slice(0, 4).map(a => (
                <div key={a.productId} className="flex items-center justify-between text-sm">
                  <span className="truncate text-muted-foreground">{a.name}</span>
                  <span className={`font-mono font-bold ml-2 ${a.stock <= 5 ? "text-destructive" : "text-secondary"}`}>{a.stock}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-2">
              {activity?.slice(0, 4).map(a => (
                <div key={a.id} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 py-1">
                  {a.description}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {topProducts && topProducts.length > 0 && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="font-display font-semibold mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-3">Product</th>
                  <th className="text-right pb-3">Sold</th>
                  <th className="text-right pb-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {topProducts.map(p => (
                  <tr key={p.productId} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{p.name}</span>
                    </td>
                    <td className="py-3 text-right font-mono">{p.totalSold}</td>
                    <td className="py-3 text-right font-mono text-primary">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
