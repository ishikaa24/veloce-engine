import { useState } from "react";
import { useListProducts, useListCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Product } from "@workspace/api-client-react";

type FormData = { name: string; description: string; price: number; stock: number; categoryId: number; imageUrl: string; isFeatured: boolean };

function ProductForm({ initial, categories, onSave, onClose }: { initial?: Product; categories: any[]; onSave: (data: any) => void; onClose: () => void }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: initial ? {
      name: initial.name, description: initial.description, price: initial.price,
      stock: initial.stock, categoryId: initial.categoryId, imageUrl: initial.imageUrl, isFeatured: initial.isFeatured,
    } : undefined,
  });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div><label className="text-sm text-muted-foreground block mb-1">Name</label><Input {...register("name", { required: true })} /></div>
      <div><label className="text-sm text-muted-foreground block mb-1">Description</label><Textarea {...register("description", { required: true })} className="min-h-20" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm text-muted-foreground block mb-1">Price ($)</label><Input type="number" step="0.01" {...register("price", { required: true, valueAsNumber: true })} /></div>
        <div><label className="text-sm text-muted-foreground block mb-1">Stock</label><Input type="number" {...register("stock", { required: true, valueAsNumber: true })} /></div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Category</label>
        <Controller name="categoryId" control={control} rules={{ required: true }} render={({ field }) => (
          <Select value={String(field.value || "")} onValueChange={v => field.onChange(parseInt(v))}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </div>
      <div><label className="text-sm text-muted-foreground block mb-1">Image URL</label><Input {...register("imageUrl", { required: true })} placeholder="https://..." /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Create Product"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminProducts() {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const { data: productsData, isLoading } = useListProducts({ search: search || undefined, limit: 50 });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const products = productsData?.products ?? [];
  const cats = categories ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const handleCreate = (data: FormData) => {
    createProduct.mutate({ data }, {
      onSuccess: () => { invalidate(); setCreating(false); toast.success("Product created"); },
      onError: () => toast.error("Failed to create product"),
    });
  };

  const handleUpdate = (data: FormData) => {
    if (!editProduct) return;
    updateProduct.mutate({ id: editProduct.id, data }, {
      onSuccess: () => { invalidate(); setEditProduct(null); toast.success("Product updated"); },
      onError: () => toast.error("Failed to update product"),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => { invalidate(); toast.success("Product deleted"); },
      onError: () => toast.error("Failed to delete product"),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{productsData?.total ?? 0} total</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>

      <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-xs" />

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left p-3">Product</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-right p-3">Rating</th>
              <th className="text-right p-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border/50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-muted-foreground text-xs">{p.categoryName}</p>
                      </div>
                      {p.isFeatured && <Star className="h-3 w-3 text-secondary fill-current" />}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">
                    <span className={p.stock <= 5 ? "text-destructive" : p.stock <= 10 ? "text-secondary" : ""}>{p.stock}</span>
                  </td>
                  <td className="p-3 text-right font-mono">{p.rating.toFixed(1)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProduct(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
          <ProductForm categories={cats} onSave={handleCreate} onClose={() => setCreating(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduct} onOpenChange={v => !v && setEditProduct(null)}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          {editProduct && <ProductForm initial={editProduct} categories={cats} onSave={handleUpdate} onClose={() => setEditProduct(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
