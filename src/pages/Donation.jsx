// Donation.jsx
import { useState } from "react";
import { toast } from "react-toastify";

import { addDonation } from "../api";
import "../styles/Donate.css";

const Donation = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (form.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (Number(form.amount) <= 0) {
      toast.error("Donation amount must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      await addDonation({
        name: form.name.trim(),
        email: form.email.trim(),
        amount: Number(form.amount),
        message: form.message.trim() || undefined,
      });
      toast.success("Thank you for your donation!");
      setForm({ name: "", email: "", amount: "", message: "" }); // reset
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to process donation.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="donate-page">
      <div className="donate-header">
        <h1>Support AUCA Alumni Programs</h1>
        <p>Your generosity empowers alumni engagement and future generations.</p>
      </div>

      <div className="donate-section">
        <div className="donate-info">
          <h2>Why Donate?</h2>
          <p>
            Donations help us organize mentorship programs, alumni reunions,
            professional workshops, and support current students through scholarships.
          </p>

          <h2>How Your Donation Helps</h2>
          <ul>
            <li>🎓 Alumni scholarships &amp; grants</li>
            <li>📚 Career guidance &amp; mentorship</li>
            <li>🤝 Networking events and reunions</li>
            <li>🏫 Campus development &amp; community outreach</li>
          </ul>
        </div>

        <div className="donate-form">
          <h2>Make a Donation</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your email address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="amount">Amount (USD)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              placeholder="e.g. 50"
              min="1"
              value={form.amount}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              name="message"
              placeholder="Leave a message..."
              rows="3"
              value={form.message}
              onChange={handleChange}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Processing…" : "Donate Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Donation;
