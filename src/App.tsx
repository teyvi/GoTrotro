import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import React from "react";
import SingleRoutes from "./pages/Routes";
import RouteDetails from "./pages/RouteDetails";

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
    </QueryClientProvider>
  );
}

export default App;
