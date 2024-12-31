import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaHome, FaLocationArrow, FaRoute } from "react-icons/fa";
import { FaBarsStaggered } from "react-icons/fa6";
import { RiFeedbackLine, RiRouteFill } from "react-icons/ri";
import { IoShareSocial } from "react-icons/io5";
import "../styles/SideBar.css";
import { IconContext } from "react-icons/lib";
import { MdOutlineAccountCircle } from "react-icons/md";

function SideBar({ onSidebarChange }) {
  const [sideBar, setSideBar] = useState(false);

  const showSideBar = () => {
    const newState = !sideBar;
    setSideBar(newState);
    onSidebarChange(newState);
  };

  return (
    <>
      <IconContext.Provider value={{ color: "red" }}>
        <div className="sidebar-toggle">
          <Link to="#" className="menu-bars">
            <FaBars onClick={showSideBar} />
          </Link>
        </div>
        <nav className={sideBar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSideBar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars"></Link>
            </li>
            <li className="nav-text">
              <FaHome />
              <Link to="/">Home</Link>
            </li>
            <li className="nav-text">
              <FaRoute />
              <Link to="/route/routeplanner">Route Planner</Link>
            </li>
            <li className="nav-text">
              <FaBarsStaggered />
              <Link to="/route/showroutes">Show Routes</Link>
            </li>
            <li className="nav-text">
              <RiRouteFill />
              <Link to="/route/traceroute">Trace Route</Link>
            </li>
            <li className="nav-text">
              <FaLocationArrow />
              <Link to="/route/yourplace">Your Places</Link>
            </li>
            <li className="nav-text">
              <RiFeedbackLine />
              <Link to="/sendfeedback">Send Feedback</Link>
            </li>
            <li className="nav-text">
              <IoShareSocial />
              <Link to="/socialmedia">Social Media</Link>
            </li>
            <li className="nav-text">
              <MdOutlineAccountCircle />
              <Link to="/login">Account</Link>
            </li>
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default SideBar;
