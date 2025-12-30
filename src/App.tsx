import React from "react";
import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SingleRoutes from "./pages/Home";
 import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import RouteViewPage from "./pages/RouteViewPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouterRoutes>
          <Route path="/" element={<SingleRoutes />} />
          <Route path="/route/:id" element={<RouteViewPage />} />
        </RouterRoutes>
      </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
