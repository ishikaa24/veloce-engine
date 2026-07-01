import { useState } from "react";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUSES = ["pending","confirmed","packed","shipped","delivered","cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  confirmed: "text-blue-400 bg-blue-400/10",
  packed: "text-purple-400 bg-purple-400/10",
  shipped: "text-cyan-400 bg-cyan-400/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { data, isLoading } = useListOrders({ page, status: filterStatus === "all" ? undefined : filterStatus });
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const orders = data?.orders ?? [];

  const handleStatus = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }); toast.success("Status updated"); },
      onError: () => toast.error("Failed to update status"),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} total</p>
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Date</th>
              <th className="text-right p-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border/50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono text-muted-foreground">#{o.id}</td>
                  <td className="p-3">{o.customerName ?? "Customer"}</td>
                  <td className="p-3 text-right font-mono text-primary">${o.total.toFixed(2)}</td>
                  <td className="p-3 text-right text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <Select value={o.status} onValueChange={v => handleStatus(o.id, v)}>
                      <SelectTrigger className={`h-7 text-xs w-32 ${STATUS_COLORS[o.status] ?? ""} border-transparent`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Page {page} of {data?.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
