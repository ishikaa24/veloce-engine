import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { ShoppingCart, Star, StarHalf } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function ProductCard({ product }: { product: Product }) {
  const addToCartMutation = useAddToCart();
  const queryClient = useQueryClient();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCartMutation.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast.success(`Added ${product.name} to cart`);
        },
        onError: () => {
          toast.error("Failed to add to cart. Please try again.");
        }
      }
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden group h-full flex flex-col bg-card/40 hover:bg-card/80 transition-colors border-border/50 hover:border-primary/30">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md">
              Sale
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground mb-1 font-mono uppercase tracking-wider">{product.categoryName || "Uncategorized"}</div>
          <h3 className="font-display font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          
          <div className="flex items-center gap-1 mt-auto">
            <div className="flex items-center text-secondary">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-bold ml-1 text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/10">
          <div className="flex flex-col">
            <span className="font-mono font-bold text-lg text-primary">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
