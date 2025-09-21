import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Solicitudes from "./pages/Solicitudes";
import Empresas from "./pages/Empresas";
import Colaboradores from "./pages/Colaboradores";
import CRM from "./pages/CRM";
import Insights from "./pages/Insights";
import Ajustes from "./pages/Ajustes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/solicitudes" element={<Solicitudes />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/colaboradores" element={<Colaboradores />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/ajustes" element={<Ajustes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
