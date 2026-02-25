import React from "react";
import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import "./App.css";
import SingleRoutes from "./pages/Home";
import RouteViewPage from "./pages/RouteViewPage";

function App() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<SingleRoutes />} />
        <Route path="/route/:id" element={<RouteViewPage />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}

export default App;
