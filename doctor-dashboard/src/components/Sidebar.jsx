import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Doctor Panel</h2>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/patients">Patients</Link>
        
      </nav>
    </aside>
  );
};

export default Sidebar;
