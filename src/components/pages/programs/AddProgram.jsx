import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addProgram } from "../../../api";           // helper already in api.js
import "../../../styles/ProgramForm.css";

const AddProgram = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        photo: null,
    });
    const [submitting, setSubmitting] = useState(false);

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

        // client-side validation
        if (form.title.trim().length < 5) {
            toast.error("Title must be at least 5 characters.");
            return;
        }
        if (form.description.trim().length < 10) {
            toast.error("Description must be at least 10 characters.");
            return;
        }
        if (!form.photo) {
            toast.error("Please select an image.");
            return;
        }

        try {
            setSubmitting(true);
            await addProgram(form);           // POST /program/add/
            toast.success("Program created!");
            navigate("/mentorship");            // back to list (update route if different)
        } catch (err) {
            const msg =
                err?.detail?.message || err?.message || "Failed to create program.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- ui ---------- */
    return (
        <div className="program-form-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="program-form-title">Add Mentorship Program</h2>
                <button className="back-button" onClick={() => navigate("/mentorship")}>
                    ← Back to Programs
                </button>
            </div>

            <form className="program-form" onSubmit={handleSubmit}>
                {/* title */}
                <div className="program-form-field">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        minLength={5}
                        placeholder="Program title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* description */}
                <div className="program-form-field">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        minLength={10}
                        placeholder="Brief description of the program"
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* photo */}
                <div className="program-form-field">
                    <label htmlFor="photo">Image</label>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* submit */}
                <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Saving…" : "Create Program"}
                </button>
            </form>
        </div>
    );
};

export default AddProgram;
