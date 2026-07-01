import { Link, useLocation } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function Cart() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart({ query: { enabled: !!user } });
  const queryClient = useQueryClient();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Sign in to view your cart</h2>
        <p className="text-muted-foreground mb-6">Your cart items will be saved for you.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-8" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full mb-4" />)}
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to get started.</p>
        <Button asChild><Link href="/products">Browse Catalog</Link></Button>
      </div>
    );
  }

  const handleQty = (productId: number, qty: number) => {
    updateItem.mutate({ productId, data: { quantity: qty } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
      onError: () => toast.error("Failed to update quantity"),
    });
  };

  const handleRemove = (productId: number) => {
    removeItem.mutate({ productId }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast.success("Item removed"); },
      onError: () => toast.error("Failed to remove item"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Cart <span className="text-muted-foreground font-mono text-lg">({cart?.itemCount} items)</span></h1>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => clearCart.mutate(undefined, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) })}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear All
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="flex gap-4 p-4 rounded-xl border border-border bg-card/40 hover:bg-card/60 transition-colors">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-semibold hover:text-primary transition-colors truncate">{item.name}</h3>
                </Link>
                <p className="text-primary font-mono font-bold text-lg">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => handleRemove(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQty(item.productId, Math.max(1, item.quantity - 1))}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-mono w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQty(item.productId, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-mono text-sm text-muted-foreground">${item.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="sticky top-24 rounded-xl border border-border bg-card/40 p-6">
            <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">${cart?.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-400 font-mono">Free</span></div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="font-mono text-primary">${cart?.total.toFixed(2)}</span></div>
            </div>
            <Button className="w-full mt-6 h-11" onClick={() => setLocation("/checkout")}>
              Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
