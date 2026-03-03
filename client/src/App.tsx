import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Sarees from "@/pages/category/Sarees";
import Lehengas from "@/pages/category/Lehengas";
import PakistaniDresses from "@/pages/category/PakistaniDresses";
import Login from "@/pages/Login";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import MessengerFloating from "@/components/MessengerFloating";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/shop" component={Shop} />
      <Route path="/sarees" component={Sarees} />
      <Route path="/lehengas" component={Lehengas} />
      <Route path="/pakistani-dresses" component={PakistaniDresses} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={OrderSuccess} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <MessengerFloating />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
