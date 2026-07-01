import { useGetMe, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { User, ShieldCheck, Bell, Key, Palette, LogOut } from "lucide-react";
import { useEffect } from "react";

const schema = z.object({ name: z.string().min(2, "Name must be at least 2 characters") });
type FormData = z.infer<typeof schema>;

export default function Settings() {
  const { user: authUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({ query: { enabled: !!authUser } });
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  if (!authUser) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to access settings.</p>
        <Button asChild><Link href="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8 max-w-2xl"><Skeleton className="h-96 w-full" /></div>;

  const onSubmit = (data: FormData) => {
    updateProfile.mutate({ data }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }); toast.success("Settings saved"); },
      onError: () => toast.error("Failed to save settings"),
    });
  };

  const SECTIONS = [
    { icon: User, label: "Profile", id: "profile" },
    { icon: Key, label: "Security", id: "security" },
    { icon: Bell, label: "Notifications", id: "notifications" },
    { icon: Palette, label: "Appearance", id: "appearance" },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="space-y-1">
            {SECTIONS.map(s => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-muted/40 transition-colors cursor-default">
                <s.icon className="h-4 w-4" />{s.label}
              </div>
            ))}
            <Separator className="my-3" />
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="h-4 w-4" />Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile */}
          <div className="rounded-xl border border-border bg-card/40 p-6">
            <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><User className="h-4 w-4 text-primary" />Profile</h2>
            <p className="text-muted-foreground text-sm mb-5">Manage your display name and account information.</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                  <span className="text-xs text-secondary capitalize font-medium">{user?.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Display Name</label>
                <Input {...register("name")} className="h-10 max-w-sm" />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Email Address</label>
                <Input value={user?.email} disabled className="h-10 max-w-sm opacity-50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
              </div>
              <Button type="submit" disabled={updateProfile.isPending || !isDirty} size="sm">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-border bg-card/40 p-6">
            <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Key className="h-4 w-4 text-primary" />Security</h2>
            <p className="text-muted-foreground text-sm mb-5">Authentication and access settings.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed: never</p>
                </div>
                <Button variant="outline" size="sm" disabled>Change Password</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm" disabled>Enable 2FA</Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-card/40 p-6">
            <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Notifications</h2>
            <p className="text-muted-foreground text-sm mb-5">Control which notifications you receive.</p>
            <div className="space-y-3">
              {["Order status updates", "Promotional emails", "Security alerts"].map(item => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <p className="text-sm">{item}</p>
                  <div className="w-9 h-5 rounded-full bg-primary cursor-pointer opacity-50" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Notification preferences coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
