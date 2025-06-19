import React, { useState, createContext } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Create the global context
export const Context = createContext();

const AppWrapper = () => {
  // 👇 Pretend the doctor is already logged in
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 👇 Mock doctor info
  const [doctor, setDoctor] = useState({
    fullName: "Dr. Test User",
    role: "Doctor",
    _id: "mock-doctor-id",
    email: "doctor@example.com",
  });

  return (
    <Context.Provider
      value={{ isAuthenticated, setIsAuthenticated, doctor, setDoctor }}
    >
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
