import React, { useState } from "react";
import "../styles/auth.css";
import { ToastContainer, toast } from "react-toastify";  // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS for Toastify
import { initiateRegistration, completeRegistration } from "../api";  // Import API functions

export default function Register() {
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerifyStudentId = async () => {
    try {
      const data = await initiateRegistration({
        student_id: studentId,
        email: email,
        phone_number: phoneNumber
      });
      setName(data.name);
      setIsVerified(true);
      toast.success(data.message); // Display success message
    } catch (err) {
      toast.error(err.message || "Student ID verification failed"); // Handle errors
    }
  };

  const handleCompleteRegistration = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const data = await completeRegistration({
        student_id: studentId,
        otp: otp,
        password: password,
        confirm_password: confirmPassword
      });
      toast.success(data.message); // Display success message
      // Redirect to login page or automatically log the user in
    } catch (err) {
      toast.error(err.message || "Registration failed"); // Handle errors
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">AUCA Alumni Register</h2>

        {/* Step 1: Student ID, Email, Phone */}
        {!isVerified ? (
          <>
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

            <button className="auth-button" onClick={handleVerifyStudentId}>
              Verify Student ID
            </button>
          </>
        ) : (
          // Step 2: OTP, Password and Confirm Password
          <>
            <div className="auth-field">
              <label htmlFor="otp">Enter OTP</label>
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
                placeholder="Enter your password"
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

            <button className="auth-button" onClick={handleCompleteRegistration}>
              Complete Registration
            </button>
          </>
        )}

        <p className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
      <ToastContainer />  {/* Add ToastContainer here to render notifications */}
    </div>
  );
}
