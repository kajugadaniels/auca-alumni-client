import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    fetchOpportunityDetail,
    updateOpportunity,
    verifyToken,
} from "../../../api";
import "../../../styles/OpportunityForm.css";

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ---------- auth check ---------- */
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    /* ---------- form state ---------- */
    const [originalPhoto, setOriginalPhoto] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        status: "",
        link: "",
        photo: null, // new file (optional)
    });

    /* ---------- load user + opportunity ---------- */
    useEffect(() => {
        const init = async () => {
            try {
                const { user } = await verifyToken();
                setUserId(user.id);

                const op = await fetchOpportunityDetail(id);
                setForm({
                    title: op.title,
                    description: op.description,
                    date: op.date,
                    status: op.status || "",
                    link: op.link || "",
                    photo: null,
                });
                setOriginalPhoto(op.photo);
            } catch {
                toast.error("Unable to load opportunity.");
                navigate("/jobs");
            } finally {
                setLoading(false);
            }
        };
        init();
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
        if (!userId) return;

        // simple validation
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

        try {
            setSubmitting(true);
            await updateOpportunity(id, {
                ...form,
                event_date: form.date, // backend accepts event_date alias
            });
            toast.success("Opportunity updated!");
            navigate("/jobs");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update opportunity.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- render ---------- */
    if (loading) return <p style={{ textAlign: "center" }}>Loading opportunity…</p>;

    return (
        <div className="opp-form-container">
            <div className="opp-form-header">
                <h2>Edit Opportunity</h2>
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

                {/* STATUS */}
                <div className="opp-form-field">
                    <label htmlFor="status">Status (optional)</label>
                    <input
                        id="status"
                        name="status"
                        type="text"
                        value={form.status}
                        onChange={handleChange}
                    />
                </div>

                {/* LINK */}
                <div className="opp-form-field">
                    <label htmlFor="link">External Link (optional)</label>
                    <input
                        id="link"
                        name="link"
                        type="url"
                        value={form.link}
                        onChange={handleChange}
                    />
                </div>

                {/* CURRENT IMAGE */}
                {originalPhoto && (
                    <div className="opp-form-field">
                        <label>Current Image</label>
                        <img
                            src={originalPhoto}
                            alt="Opportunity"
                            style={{ maxWidth: "100%", borderRadius: 4 }}
                        />
                    </div>
                )}

                {/* NEW IMAGE (optional) */}
                <div className="opp-form-field">
                    <label htmlFor="photo">Replace Image (optional)</label>
                    <input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>

                {/* SUBMIT */}
                <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Saving…" : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default EditOpportunity;
