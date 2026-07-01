import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Category } from "@workspace/api-client-react";

type FormData = { name: string; description?: string | null; imageUrl?: string | null };

function CategoryForm({ initial, onSave, onClose }: { initial?: Category; onSave: (d: any) => void; onClose: () => void }) {
  const { register, handleSubmit } = useForm<FormData>({ defaultValues: initial ? { name: initial.name, description: initial.description, imageUrl: initial.imageUrl } : undefined });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div><label className="text-sm text-muted-foreground block mb-1">Name</label><Input {...register("name", { required: true })} /></div>
      <div><label className="text-sm text-muted-foreground block mb-1">Description</label><Textarea {...register("description")} /></div>
      <div><label className="text-sm text-muted-foreground block mb-1">Image URL</label><Input {...register("imageUrl")} placeholder="https://..." /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{initial ? "Save" : "Create"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminCategories() {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories?.length ?? 0} total</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map(cat => (
            <div key={cat.id} className="rounded-xl border border-border bg-card/40 p-5 hover:bg-card/70 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10"><Tag className="h-4 w-4 text-primary" /></div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => {
                    if (!confirm("Delete category?")) return;
                    deleteCategory.mutate({ id: cat.id }, { onSuccess: invalidate, onError: () => toast.error("Failed") });
                  }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-xs font-mono text-primary mt-2">{cat.productCount} products</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent><DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <CategoryForm onSave={data => createCategory.mutate({ data }, { onSuccess: () => { invalidate(); setCreating(false); toast.success("Created"); } })} onClose={() => setCreating(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent><DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          {editing && <CategoryForm initial={editing} onSave={data => updateCategory.mutate({ id: editing.id, data }, { onSuccess: () => { invalidate(); setEditing(null); toast.success("Updated"); } })} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
