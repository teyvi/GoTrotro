import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SingleRoutes from "./pages/Home";
import RouteDetails from "./pages/RouteDetails";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouterRoutes>
          <Route path="/" element={<SingleRoutes />} />
          <Route path="/route/:id" element={<RouteDetails />} />
        </RouterRoutes>
      </BrowserRouter>
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
