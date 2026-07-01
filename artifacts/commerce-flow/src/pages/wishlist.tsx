import { Link } from "wouter";
import { useGetWishlist, useRemoveFromWishlist, useAddToCart, getGetWishlistQueryKey, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function Wishlist() {
  const { user } = useAuth();
  const { data: items, isLoading } = useGetWishlist({ query: { enabled: !!user } });
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Sign in to view your wishlist.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Save products you love for later.</p>
        <Button asChild><Link href="/products">Browse Catalog</Link></Button>
      </div>
    );
  }

  const handleRemove = (productId: number) => {
    removeFromWishlist.mutate({ productId }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() }); toast.success("Removed from wishlist"); },
    });
  };

  const handleAddToCart = (productId: number) => {
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }); toast.success("Added to cart"); },
      onError: () => toast.error("Failed to add to cart"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Wishlist <span className="text-muted-foreground font-mono text-lg">({items.length})</span></h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="rounded-xl border border-border bg-card/40 hover:bg-card/70 transition-colors overflow-hidden group">
            <Link href={`/products/${item.productId}`}>
              <div className="aspect-square overflow-hidden bg-muted">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/products/${item.productId}`}>
                <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2 mb-1">{item.product.name}</h3>
              </Link>
              <p className="font-mono font-bold text-primary mb-3">${item.product.price.toFixed(2)}</p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => handleAddToCart(item.productId)}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
                </Button>
                <Button size="sm" variant="outline" className="hover:text-destructive hover:border-destructive" onClick={() => handleRemove(item.productId)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
