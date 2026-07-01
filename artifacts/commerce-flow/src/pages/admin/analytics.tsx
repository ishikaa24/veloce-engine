import { useGetRevenueChart, useGetTopProducts, useGetCategoryDistribution, useGetInventoryAlerts, useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const COLORS = ["#E11D48","#F59E0B","#3B82F6","#8B5CF6","#10B981"];

export default function AdminAnalytics() {
  const { user } = useAuth();
  const { data: revenue, isLoading: revLoading } = useGetRevenueChart({ query: { enabled: user?.role === "admin" } });
  const { data: topProducts } = useGetTopProducts({ query: { enabled: user?.role === "admin" } });
  const { data: catDist } = useGetCategoryDistribution({ query: { enabled: user?.role === "admin" } });
  const { data: alerts } = useGetInventoryAlerts({ query: { enabled: user?.role === "admin" } });
  const { data: stats } = useGetDashboardStats({ query: { enabled: user?.role === "admin" } });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Sales trends and performance metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString("en",{minimumFractionDigits:2})}` },
          { label: "Total Orders", value: String(stats?.totalOrders ?? 0) },
          { label: "Pending Orders", value: String(stats?.pendingOrders ?? 0) },
          { label: "Low Stock Items", value: String(stats?.lowStockCount ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card/40 p-4">
            <p className="text-muted-foreground text-xs mb-1">{label}</p>
            <p className="text-xl font-display font-bold font-mono">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="font-display font-semibold mb-4">Monthly Revenue</h3>
          {revLoading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenue ?? []}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #262626", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="revenue" stroke="#E11D48" fill="url(#aGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="font-display font-semibold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catDist ?? []} dataKey="count" nameKey="categoryName" cx="50%" cy="50%" outerRadius={80} label={({ categoryName, percentage }) => `${categoryName} ${percentage}%`} labelLine={false}>
                {(catDist ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #262626", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topProducts && topProducts.length > 0 && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="font-display font-semibold mb-4">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #262626", borderRadius: "8px" }} />
              <Bar dataKey="revenue" fill="#E11D48" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {alerts && alerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="font-display font-semibold mb-4 text-secondary">Inventory Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map(a => (
              <div key={a.productId} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className={`text-xs font-mono font-bold ${a.stock <= 5 ? "text-destructive" : "text-secondary"}`}>{a.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
