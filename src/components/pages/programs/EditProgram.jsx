import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchProgramDetail, updateProgram } from "../api";
import "../styles/ProgramForm.css";

const EditProgram = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [originalPhoto, setOriginalPhoto] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        photo: null, // new file (optional)
    });

    /* ---------- load program ---------- */
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchProgramDetail(id);
                setForm({
                    title: data.title,
                    description: data.description,
                    photo: null,
                });
                setOriginalPhoto(data.photo);
            } catch (_) {
                toast.error("Unable to load program details.");
                navigate("/programs");
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

        // basic validation
        if (form.title.trim().length < 5) {
            toast.error("Title must be at least 5 characters.");
            return;
        }
        if (form.description.trim().length < 10) {
            toast.error("Description must be at least 10 characters.");
            return;
        }

        try {
            setSubmitting(true);
            await updateProgram(id, form); // PUT /program/{id}/update/
            toast.success("Program updated!");
            navigate("/programs");
        } catch (err) {
            const msg =
                err?.detail?.message || err?.message || "Failed to update program.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- render ---------- */
    if (loading) return <p style={{ textAlign: "center" }}>Loading program…</p>;

    return (
        <div className="program-form-container">
            <h2 className="program-form-title">Edit Mentorship Program</h2>

            <form className="program-form" onSubmit={handleSubmit}>
                {/* TITLE */}
                <div className="program-form-field">
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

                {/* DESCRIPTION */}
                <div className="program-form-field">
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

                {/* CURRENT IMAGE */}
                <div className="program-form-field">
                    <label>Current Image</label>
                    <img
                        src={originalPhoto}
                        alt="Program"
                        style={{ maxWidth: "100%", borderRadius: 4 }}
                    />
                </div>

                {/* OPTIONAL NEW IMAGE */}
                <div className="program-form-field">
                    <label htmlFor="photo">Replace Image (optional)</label>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
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

export default EditProgram;
