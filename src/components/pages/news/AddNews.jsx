import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addNews } from "../../../api";
import "../../../styles/NewsForm.css";           // optional – style as you like

const AddNews = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    date: "",
    description: "",
    photo: null,
  });
  const [submitting, setSubmitting] = useState(false);

  /* ---------- input handlers ---------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "photo" ? files[0] : value,
    }));
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* client-side validation */
    if (form.title.trim().length < 5) {
      toast.error("Title must be at least 5 characters.");
      return;
    }
    if (!form.date) {
      toast.error("Please choose a date.");
      return;
    }
    if (new Date(form.date) > new Date()) {
      toast.error("News date cannot be in the future.");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }
    if (!form.photo) {
      toast.error("Please select an image to upload.");
      return;
    }

    try {
      setSubmitting(true);
      await addNews(form);          // POST /news/add (FormData handled inside)
      toast.success("News item created successfully!");
      navigate("/news");
    } catch (err) {
      const msg =
        err?.detail?.message || err?.message || "Failed to create the news item.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="news-form-container">
      <h2 className="news-form-title">Add News</h2>

      <form className="news-form" onSubmit={handleSubmit}>
        {/* TITLE ------------------------------------------------ */}
        <div className="news-form-field">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            minLength={5}
          />
        </div>

        {/* DATE ------------------------------------------------- */}
        <div className="news-form-field">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* DESCRIPTION ----------------------------------------- */}
        <div className="news-form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
            minLength={10}
          />
        </div>

        {/* PHOTO ----------------------------------------------- */}
        <div className="news-form-field">
          <label htmlFor="photo">News Image</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            required
          />
        </div>

        {/* SUBMIT ---------------------------------------------- */}
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Create News"}
        </button>
      </form>
    </div>
  );
};

export default AddNews;
