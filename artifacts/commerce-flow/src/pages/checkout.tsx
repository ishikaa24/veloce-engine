import { useLocation } from "wouter";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ShieldCheck, CreditCard, MapPin } from "lucide-react";

const schema = z.object({ shippingAddress: z.string().min(10, "Please enter a full address") });
type FormData = z.infer<typeof schema>;

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart({ query: { enabled: !!user } });
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to checkout.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-96 w-full" /></div>;

  const items = cart?.items ?? [];
  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild><Link href="/products">Browse Catalog</Link></Button>
      </div>
    );
  }

  const onSubmit = (data: FormData) => {
    createOrder.mutate({ data }, {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Order placed successfully!");
        setLocation(`/orders/${order.id}`);
      },
      onError: () => toast.error("Failed to place order. Please try again."),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Shipping Address</h2>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Full Address</label>
              <Input {...register("shippingAddress")} placeholder="123 Main St, City, State, ZIP" className="h-11" />
              {errors.shippingAddress && <p className="text-destructive text-sm mt-1">{errors.shippingAddress.message}</p>}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Payment</h2>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 text-sm text-muted-foreground font-mono">
              <p className="text-green-400 mb-1">// Demo mode</p>
              <p>No real payment required.</p>
              <p>Order will be placed immediately.</p>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Placing Order..." : `Place Order — $${cart?.total.toFixed(2)}`}
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> SSL secured. 256-bit encryption.
          </div>
        </form>

        <div>
          <div className="rounded-xl border border-border bg-card/40 p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-sm">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">${cart?.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-400 font-mono">Free</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="font-mono text-primary">${cart?.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
