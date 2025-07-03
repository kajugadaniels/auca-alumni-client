import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchNewsDetail, updateNews } from "../../../api";
import "../../../styles/NewsForm.css";

const EditNews = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [originalPhoto, setOriginalPhoto] = useState("");
    const [form, setForm] = useState({
        title: "",
        date: "",
        description: "",
        photo: null,       // new file (optional)
    });

    /* ---------- fetch on mount ---------- */
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchNewsDetail(id);
                setForm({
                    title: data.title,
                    date: data.date,
                    description: data.description,
                    photo: null,
                });
                setOriginalPhoto(data.photo);
            } catch (_) {
                toast.error("Unable to load news item.");
                navigate("/news");
            } finally {
                setLoading(false);
            }
        };
        load();
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

        // validation
        if (form.title.trim().length < 5) {
            toast.error("Title must be at least 5 characters.");
            return;
        }
        if (!form.date) {
            toast.error("Please choose a date.");
            return;
        }
        if (form.description.trim().length < 10) {
            toast.error("Description must be at least 10 characters.");
            return;
        }

        try {
            setSubmitting(true);
            await updateNews(id, form);        // PUT /news/{id}/update
            toast.success("News item updated!");
            navigate("/news");
        } catch (err) {
            const msg =
                err?.detail?.message || err?.message || "Failed to update news item.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- ui ---------- */
    if (loading) return <p style={{ textAlign: "center" }}>Loading news…</p>;

    return (
        <div className="news-form-container">
            <h2 className="news-form-title">Edit News</h2>

            <form className="news-form" onSubmit={handleSubmit}>
                {/* TITLE ------------------------------------------------ */}
                <div className="news-form-field">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        minLength={5}
                        value={form.title}
                        onChange={handleChange}
                        required
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
                        minLength={10}
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* CURRENT PHOTO --------------------------------------- */}
                <div className="news-form-field">
                    <label>Current Image</label>
                    <img
                        src={originalPhoto}
                        alt="Current news"
                        style={{ maxWidth: "100%", borderRadius: 4 }}
                    />
                </div>

                {/* NEW PHOTO (optional) -------------------------------- */}
                <div className="news-form-field">
                    <label htmlFor="photo">Replace Image (optional)</label>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </div>

                {/* SUBMIT ---------------------------------------------- */}
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

export default EditNews;
