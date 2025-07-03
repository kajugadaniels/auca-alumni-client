import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addOpportunity, verifyToken } from "../../../api";
import "../../../styles/OpportunityForm.css";

const AddOpportunity = () => {
    const navigate = useNavigate();

    /* ---------- logged-in user ---------- */
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const { user } = await verifyToken();
                setUserId(user.id);
            } catch {
                toast.error("Please log in to post an opportunity.");
                navigate("/login");
            }
        };
        loadUser();
    }, [navigate]);

    /* ---------- form state ---------- */
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        status: "",
        link: "",
        photo: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "photo" ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        /* basic validation */
        if (form.title.trim().length < 5) {
            toast.error("Title must be at least 5 characters.");
            return;
        }
        if (form.description.trim().length < 10) {
            toast.error("Description must be at least 10 characters.");
            return;
        }
        if (!form.date) {
            toast.error("Please select a date.");
            return;
        }
        if (!form.photo) {
            toast.error("Please upload an image.");
            return;
        }

        try {
            setSubmitting(true);
            await addOpportunity({
                title: form.title.trim(),
                description: form.description.trim(),
                date: form.date,
                user_id: userId,
                status: form.status.trim() || undefined,
                link: form.link.trim() || undefined,
                photo: form.photo,
            });
            toast.success("Opportunity posted!");
            navigate("/jobs");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to post opportunity.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- render ---------- */
    return (
        <div className="opp-form-container">
            <div className="opp-form-header">
                <h2>Create Opportunity</h2>
                <button className="back-button" onClick={() => navigate("/jobs")}>
                    ← Back to Board
                </button>
            </div>

            <form className="opp-form" onSubmit={handleSubmit}>
                {/* TITLE */}
                <div className="opp-form-field">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        minLength={5}
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* DESCRIPTION */}
                <div className="opp-form-field">
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

                {/* DATE */}
                <div className="opp-form-field">
                    <label htmlFor="date">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* STATUS (optional) */}
                <div className="opp-form-field">
                    <label htmlFor="status">Status (optional)</label>
                    <input
                        id="status"
                        name="status"
                        type="text"
                        placeholder="e.g. Open, Closed"
                        value={form.status}
                        onChange={handleChange}
                    />
                </div>

                {/* LINK (optional) */}
                <div className="opp-form-field">
                    <label htmlFor="link">External Link (optional)</label>
                    <input
                        id="link"
                        name="link"
                        type="url"
                        placeholder="https://example.com"
                        value={form.link}
                        onChange={handleChange}
                    />
                </div>

                {/* PHOTO */}
                <div className="opp-form-field">
                    <label htmlFor="photo">Image</label>
                    <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* SUBMIT */}
                <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Posting…" : "Post Opportunity"}
                </button>
            </form>
        </div>
    );
};

export default AddOpportunity;
