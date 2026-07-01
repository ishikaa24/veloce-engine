import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Public pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Wishlist from "@/pages/wishlist";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Features from "@/pages/features";
import Architecture from "@/pages/architecture";
import ApiReference from "@/pages/api-reference";
import Docs from "@/pages/docs";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import AdminAnalytics from "@/pages/admin/analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteWrapper() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout><AdminProducts /></AdminLayout>
      </Route>
      <Route path="/admin/categories">
        <AdminLayout><AdminCategories /></AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout><AdminOrders /></AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout><AdminAnalytics /></AdminLayout>
      </Route>

      {/* Public Routes */}
      <Route>
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/products/:id" component={ProductDetail} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/orders" component={Orders} />
            <Route path="/orders/:id" component={OrderDetail} />
            <Route path="/wishlist" component={Wishlist} />
            <Route path="/profile" component={Profile} />
            <Route path="/settings" component={Settings} />
            <Route path="/features" component={Features} />
            <Route path="/architecture" component={Architecture} />
            <Route path="/api-reference" component={ApiReference} />
            <Route path="/docs" component={Docs} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <RouteWrapper />
          </WouterRouter>
          <Toaster theme="dark" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
