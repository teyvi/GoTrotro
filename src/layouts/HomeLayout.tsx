import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { FaHome, FaRoute, FaLocationArrow } from "react-icons/fa";
import { RiRouteFill, RiFeedbackLine } from "react-icons/ri";
import { IoShareSocial } from "react-icons/io5";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaBarsStaggered } from "react-icons/fa6";
import { Link } from "react-router-dom";

const HomeLayout = ({ children, pageTitle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigationItems = [
    { title: "Home", path: "/", icon: FaHome },
    { title: "Route Planner", path: "/route/routeplanner", icon: FaRoute },
    { title: "Show Routes", path: "/route/showroutes", icon: FaBarsStaggered },
    { title: "Trace Route", path: "/route/traceroute", icon: RiRouteFill },
    { title: "Your Places", path: "/route/yourplace", icon: FaLocationArrow },
    { title: "Send Feedback", path: "/sendfeedback", icon: RiFeedbackLine },
    { title: "Social Media", path: "/socialmedia", icon: IoShareSocial },
    { title: "Account", path: "/login", icon: MdOutlineAccountCircle },
  ];

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 bg-white shadow-md z-20 transition-all duration-300 ${
          isSidebarOpen ? "md:pl-64 lg:pl-64" : "pl-0"
        }`}
      >
        <div className="p-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg shrink-0"
            title="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-grow px-4">
            {typeof pageTitle === "string" ? (
              <h1 className="text-xl font-semibold truncate">{pageTitle}</h1>
            ) : (
              <div className="w-full">{pageTitle}</div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 h-full bg-white shadow-lg z-30 w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="text-3xl font-bold">Gotrotro</span>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Close Sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-2 flex-grow">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">© 2024 Gotrotro</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "md:pl-64 lg:pl-64" : "pl-0"
        }`}
      >
        <div>{children}</div>
      </main>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default HomeLayout;
