import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import "./HomeLayoutStyle.css";

function HomeLayout() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const handleSidebarChange = (isOpen) => {
     setIsSidebarOpen(isOpen);
   };
  return (
    <>
    <div className="layout-container">
      <SideBar onSidebarChange={handleSidebarChange} />
      <main className={`main-content ${isSidebarOpen ? 'shift' : ''}`}>
        <Outlet />
      </main>
    </div>
    </>
  );
}

export default HomeLayout;
