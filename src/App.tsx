import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Solicitudes from "./pages/Solicitudes";
import Empresas from "./pages/Empresas";
import Colaboradores from "./pages/Colaboradores";
import CRM from "./pages/CRM";
import Insights from "./pages/Insights";
import Ajustes from "./pages/Ajustes";
import Auth from "./pages/Auth";
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
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/insights" element={
                <ProtectedRoute>
                  <Layout>
                    <Insights />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/solicitudes" element={
                <ProtectedRoute>
                  <Layout>
                    <Solicitudes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/empresas" element={
                <ProtectedRoute>
                  <Layout>
                    <Empresas />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/colaboradores" element={
                <ProtectedRoute>
                  <Layout>
                    <Colaboradores />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/crm" element={
                <ProtectedRoute>
                  <Layout>
                    <CRM />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/ajustes" element={
                <ProtectedRoute>
                  <Layout>
                    <Ajustes />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;