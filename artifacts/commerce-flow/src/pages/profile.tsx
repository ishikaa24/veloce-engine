import { useGetMe, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { User, ShieldCheck, Package } from "lucide-react";
import { useEffect } from "react";

const schema = z.object({ name: z.string().min(2) });
type FormData = z.infer<typeof schema>;

export default function Profile() {
  const { user: authUser } = useAuth();
  const { data: user, isLoading } = useGetMe({ query: { enabled: !!authUser } });
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  if (!authUser) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8 max-w-lg"><Skeleton className="h-96 w-full" /></div>;

  const onSubmit = (data: FormData) => {
    updateProfile.mutate({ data }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }); toast.success("Profile updated"); },
      onError: () => toast.error("Failed to update profile"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-display font-bold mb-8">Profile</h1>

      <div className="rounded-xl border border-border bg-card/40 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">{user?.name}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              <span className="text-xs text-secondary capitalize font-medium">{user?.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Display Name</label>
            <Input {...register("name")} className="h-11" />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input value={user?.email} disabled className="h-11 opacity-60" />
          </div>
          <Button type="submit" disabled={updateProfile.isPending} className="w-full">
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Quick Actions</h3>
        <div className="space-y-2">
          <Link href="/orders"><Button variant="outline" className="w-full justify-start">View My Orders</Button></Link>
          <Link href="/wishlist"><Button variant="outline" className="w-full justify-start">View Wishlist</Button></Link>
        </div>
      </div>
    </div>
  );
}
