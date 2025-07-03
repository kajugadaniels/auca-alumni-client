import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchEventDetail, updateEvent } from "../../../api";
import "../../../styles/EventForm.css";

const EditEvent = () => {
  const { id } = useParams();          // event ID from route
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState("");   // keep track of current photo URL
  const [form, setForm] = useState({
    event_date: "",
    description: "",
    photo: null,                       // new file (optional)
  });

  /* ---------- fetch event on mount ---------- */
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await fetchEventDetail(id);
        setForm({
          event_date: data.date,
          description: data.description,
          photo: null,
        });
        setOriginalPhoto(data.photo);
      } catch (err) {
        toast.error("Unable to load event details.");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id, navigate]);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "photo" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic client-side validation
    if (!form.event_date) {
      toast.error("Please choose an event date.");
      return;
    }
    if (new Date(form.event_date) < new Date().setHours(0, 0, 0, 0)) {
      toast.error("Event date can’t be in the past.");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await updateEvent(id, form);   // PUT /event/{id}/update/
      toast.success("Event updated successfully!");
      navigate("/events");
    } catch (err) {
      const msg =
        err?.detail?.message ||
        err?.message ||
        "Failed to update the event.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- render ---------- */
  if (loading) return <p style={{ textAlign: "center" }}>Loading event…</p>;

  return (
    <div className="event-form-container">
      <h2 className="event-form-title">Edit Event</h2>

      <form className="event-form" onSubmit={handleSubmit}>
        {/* DATE ------------------------------------------------ */}
        <div className="event-form-field">
          <label htmlFor="event_date">Event Date</label>
          <input
            type="date"
            id="event_date"
            name="event_date"
            value={form.event_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* DESCRIPTION ---------------------------------------- */}
        <div className="event-form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            minLength={10}
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* CURRENT PHOTO -------------------------------------- */}
        <div className="event-form-field">
          <label>Current Image</label>
          <img
            src={originalPhoto}
            alt="Current event"
            style={{ maxWidth: "100%", borderRadius: "4px" }}
          />
        </div>

        {/* OPTIONAL NEW PHOTO --------------------------------- */}
        <div className="event-form-field">
          <label htmlFor="photo">Replace Image (optional)</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* SUBMIT --------------------------------------------- */}
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditEvent;
