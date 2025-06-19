import React, { useContext, useState } from "react";
import axios from "axios";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const { setIsAuthenticated, setDoctor } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:4000/api/v1/user/login", {
        email,
        password,
      }, { withCredentials: true });

      setIsAuthenticated(true);
      setDoctor(data.user);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <h2>Doctor Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
