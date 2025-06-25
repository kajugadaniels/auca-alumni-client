import React, { useState } from "react";
import { login } from "../api"; // Import the login function from api.js
import { useNavigate } from "react-router-dom"; // For redirecting after login
import '../styles/auth.css';
import { ToastContainer, toast } from "react-toastify";  // Import Toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS for Toastify

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // To navigate upon successful login

  // Handle login logic
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({ username: email, password });
      localStorage.setItem("token", response.access_token); // Store token
      toast.success("Login successful!");
      navigate("/dashboard"); // Redirect to dashboard or homepage
      window.location.reload();  // Reload the page after successful login
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">AUCA Alumni Login</h2>
        
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            placeholder="paccyandbertrard@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <button 
          className="auth-button" 
          onClick={handleLogin} 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <p className="auth-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}
