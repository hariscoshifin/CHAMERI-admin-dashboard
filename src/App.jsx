import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import AdminOnlyRoute from "./components/AdminOnlyRoute";
import AboutMain from "./pages/AboutMain";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Placeholder pages for future sections
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-64 animate-fade-in">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">Coming soon — page under construction</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1f35",
                color: "#f3f4f6",
                border: "1px solid #2a3158",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#2952ff", secondary: "#fff" } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/home/hero" element={<Placeholder title="Home - Hero Section" />} />
                <Route path="/about/main" element={<AboutMain />} />
                <Route path="/projects" element={<Placeholder title="Projects" />} />
                <Route path="/services" element={<Placeholder title="Services" />} />
                <Route path="/blogs" element={<Placeholder title="Blogs" />} />
                <Route path="/testimonials" element={<Placeholder title="Testimonials" />} />
                <Route path="/contacts" element={<Placeholder title="Contacts" />} />
                {/* Admin-only routes */}
                <Route element={<AdminOnlyRoute />}>
                  <Route path="/users" element={<UserManagement />} />
                </Route>
                <Route path="/settings" element={<Placeholder title="Settings" />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
