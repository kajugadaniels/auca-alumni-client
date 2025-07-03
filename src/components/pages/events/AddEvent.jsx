import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addEvent } from "../../../api";            // your existing helper
import "../../../styles/EventForm.css";             // optional – style as you like

const AddEvent = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        event_date: "",
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

        /* client-side guards ----------------------------------- */
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
        if (!form.photo) {
            toast.error("Please select an image to upload.");
            return;
        }

        /* API call -------------------------------------------- */
        try {
            setSubmitting(true);
            await addEvent(form);          // POST /event/add (FormData handled inside)
            toast.success("Event created successfully!");
            navigate("/events");           // back to the listing
        } catch (err) {
            // FastAPI returns { detail: { message: ... } } in many cases
            const msg =
                err?.detail?.message || err?.message || "Failed to create the event.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    /* ---------- render ---------- */
    return (
        <div className="event-form-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="event-form-title">Add New Event</h2>
                <button className="back-button" onClick={() => navigate("/events")}>
                    ← Back to Events
                </button>
            </div>

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
                        min={today}                 /* 🆕  block past days */
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
                        placeholder="What is this event about?"
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* PHOTO ---------------------------------------------- */}
                <div className="event-form-field">
                    <label htmlFor="photo">Event Image</label>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* SUBMIT --------------------------------------------- */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                >
                    {submitting ? "Saving…" : "Create Event"}
                </button>
            </form>
        </div>
    );
};

export default AddEvent;
