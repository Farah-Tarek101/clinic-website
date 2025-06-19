import React, { useContext } from "react";
import { Context } from "../main";

const Dashboard = () => {
  const { doctor } = useContext(Context);

  return (
    <div className="dashboard">
      <h1>Welcome Dr. {doctor.fullName}</h1>
      <p>Here’s a quick summary of your day.</p>
    </div>
  );
};

export default Dashboard;
