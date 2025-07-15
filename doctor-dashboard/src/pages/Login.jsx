import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Doctor"); // force doctor role

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/login`,
        {
          email,
          password,
          role, // Must be "Doctor"
        },
        {
          withCredentials: true, // ✅ This sends the cookie to the browser
        }
      );

      console.log("✅ Login success", res.data);
      navigate("/my-patients"); // ✅ Redirect after successful login
    } catch (err) {
      console.error("❌ Login error", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };
  

  return (
    <form onSubmit={handleLogin} style={{ padding: "2rem" }}>
      <h2>Doctor Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
