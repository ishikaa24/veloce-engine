import { useRoute, Link } from "wouter";
import { useGetOrder, useCancelOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const STATUS_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"];
const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  confirmed: "text-blue-400",
  packed: "text-purple-400",
  shipped: "text-cyan-400",
  delivered: "text-green-400",
  cancelled: "text-red-400",
};

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const orderId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { data: order, isLoading, refetch } = useGetOrder(orderId, { query: { enabled: !!orderId && !!user } });
  const cancelOrder = useCancelOrder();

  if (!user) return <div className="container mx-auto px-4 py-24 text-center"><p className="text-muted-foreground">Please sign in.</p></div>;

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!order) return <div className="container mx-auto px-4 py-24 text-center"><p className="text-muted-foreground">Order not found.</p></div>;

  const items = Array.isArray(order.items) ? order.items : [];
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  const handleCancel = () => {
    cancelOrder.mutate({ id: order.id }, {
      onSuccess: () => { toast.success("Order cancelled"); refetch(); },
      onError: () => toast.error("Failed to cancel order"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`font-semibold capitalize text-lg ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      {order.status !== "cancelled" && order.status !== "delivered" && (
        <div className="rounded-xl border border-border bg-card/40 p-5 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`flex flex-col items-center ${i <= stepIdx ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-3 h-3 rounded-full border-2 ${i <= stepIdx ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                  <span className="text-xs mt-1 capitalize hidden sm:block">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < stepIdx ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card/40 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Items</h3>
        </div>
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} &times; ${item.price.toFixed(2)}</p>
              </div>
              <span className="font-mono text-sm">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="font-mono text-primary">${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Shipping Address</h3>
        </div>
        <p className="text-muted-foreground text-sm">{order.shippingAddress}</p>
      </div>

      {order.status === "pending" && (
        <Button variant="destructive" onClick={handleCancel} disabled={cancelOrder.isPending} className="w-full">
          {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
        </Button>
      )}
    </div>
  );
}
