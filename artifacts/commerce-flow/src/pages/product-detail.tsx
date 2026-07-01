import { useRoute } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey, useGetWishlist, getGetWishlistQueryKey, useAddToWishlist, useRemoveFromWishlist } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, Star, Package, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = parseInt(params?.id || "0");
  const { user } = useAuth();
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });
  
  const { data: wishlist } = useGetWishlist({ query: { enabled: !!user } });
  
  const [quantity, setQuantity] = useState(1);
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const queryClient = useQueryClient();

  const isWishlisted = wishlist?.some(item => item.productId === productId);

  const handleAddToCart = () => {
    addToCartMutation.mutate(
      { data: { productId, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
        },
        onError: () => toast.error("Failed to add to cart")
      }
    );
  };

  const toggleWishlist = () => {
    if (!user) {
      toast.error("Please log in to manage your wishlist");
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlistMutation.mutate(
        { productId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
            toast.success("Removed from wishlist");
          }
        }
      );
    } else {
      addToWishlistMutation.mutate(
        { data: { productId } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
            toast.success("Added to wishlist");
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/3" />
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border/50 relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image available</div>
            )}
          </div>
          {/* Thumbnail grid would go here if we had multiple images */}
        </div>
        
        <div className="flex flex-col">
          <div className="text-sm font-mono text-primary mb-2 uppercase tracking-wider">{product.categoryName || "Uncategorized"}</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-secondary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted stroke-current'}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating.toFixed(1)} / 5</span>
            <span className="text-sm text-muted-foreground border-l border-border pl-4">{product.reviewCount} reviews</span>
          </div>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="text-3xl font-mono font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xl text-muted-foreground line-through pb-1">${product.comparePrice.toFixed(2)}</span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-1 rounded pb-1 mb-1 ml-2">
                {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
              </span>
            )}
          </div>
          
          <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
            {product.description}
          </p>
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Quantity</span>
              {product.stock > 0 ? (
                <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full ml-2">In Stock ({product.stock})</span>
              ) : (
                <span className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-full ml-2">Out of Stock</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                <button 
                  className="px-4 py-2 hover:bg-muted text-lg disabled:opacity-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                >
                  -
                </button>
                <div className="w-12 text-center font-mono">{quantity}</div>
                <button 
                  className="px-4 py-2 hover:bg-muted text-lg disabled:opacity-50"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-8">
            <Button 
              size="lg" 
              className="flex-1 h-14 text-lg font-medium"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className={`h-14 w-14 ${isWishlisted ? 'text-primary border-primary/50 bg-primary/5' : ''}`}
              onClick={toggleWishlist}
            >
              <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border mt-auto">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1">Fast Delivery</h4>
                <p className="text-xs text-muted-foreground">Ships via Edge Network</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1">Secure Checkout</h4>
                <p className="text-xs text-muted-foreground">Idempotent API endpoints</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Code Snippet Example Section */}
      <div className="border border-border/50 rounded-2xl overflow-hidden bg-[#0A0A0A] shadow-lg mb-16">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/50">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-secondary" />
            API Response
          </h3>
          <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">GET /api/products/{productId}</div>
        </div>
        <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300">
          <pre>
            {JSON.stringify({
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              category: product.categoryName,
              createdAt: product.createdAt
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
