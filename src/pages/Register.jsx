import React, { useState } from "react";
import "../styles/auth.css";
import { ToastContainer, toast } from "react-toastify";
import { initiateRegistration, completeRegistration } from "../api";

export default function Register() {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Verify Student ID
  const handleVerify = async () => {
    try {
      const response = await initiateRegistration({ student_id: studentId, email, phone_number: phoneNumber });
      setName(response.first_name + " " + response.last_name);
      setIsVerified(true);
      toast.success("Student ID verified successfully! Please check your email for the OTP.");
    } catch (err) {
      toast.error("Error verifying student ID: " + err.message);
    }
  };

  // Step 2: Complete Registration
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const response = await completeRegistration({ student_id: studentId, otp, password, confirm_password: password });
      toast.success("Registration complete! You can now log in.");
      // Optionally, redirect to login page
      window.location.href = "/login";
    } catch (err) {
      toast.error("Error completing registration: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">AUCA Alumni Register</h2>

        <div className="auth-field">
          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your AUCA Student ID"
          />
        </div>

        {!isVerified ? (
          <>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <button className="auth-button" onClick={handleVerify}>
              Verify Student ID
            </button>
          </>
        ) : (
          <>
            {/* <div className="auth-field">
              <label>Full Name</label>
              <input type="text" value={name} readOnly />
            </div> */}

            <div className="auth-field">
              <label htmlFor="otp">OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP sent to your email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            <button className="auth-button" onClick={handleRegister}>
              Complete Registration
            </button>
          </>
        )}

        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}
