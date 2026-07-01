import { useState } from "react";
import { useListUsers, useDeleteUser, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, ShieldCheck, User, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListUsers({ page, search: search || undefined });
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const users = data?.users ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} total</p>
        </div>
      </div>

      <Input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="mb-4 max-w-xs" />

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Role</th>
              <th className="text-right p-3">Joined</th>
              <th className="text-right p-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-muted-foreground text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Select value={u.role} onValueChange={role => updateUser.mutate({ id: u.id, data: { role: role as any } }, { onSuccess: invalidate, onError: () => toast.error("Failed") })}>
                      <SelectTrigger className={`h-7 text-xs w-28 border-transparent ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted/30"}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer"><span className="flex items-center gap-1"><User className="h-3 w-3" /> Customer</span></SelectItem>
                        <SelectItem value="admin"><span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Admin</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => {
                      if (!confirm("Delete user?")) return;
                      deleteUser.mutate({ id: u.id }, { onSuccess: invalidate, onError: () => toast.error("Failed") });
                    }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
