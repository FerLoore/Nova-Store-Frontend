import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 segundos
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1a1919",
                color: "#ffffff",
                borderRadius: "10px",
                border: "none",
                fontSize: "13px",
                letterSpacing: "0em",
                boxShadow: "none",
                fontFamily: "inherit",
                padding: "12px 16px",
              },
              success: {
                iconTheme: {
                  primary: "#e4f222",
                  secondary: "#1a1919",
                },
              },
              error: {
                style: {
                  background: "#1a1919",
                  color: "#ffffff",
                  borderRadius: "10px",
                },
                iconTheme: {
                  primary: "#b42318",
                  secondary: "#1a1919",
                },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
