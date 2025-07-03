import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchProgramDetail } from "../../../api";
import { formatDate } from "../../../utils/date";
import "../../../styles/ProgramDetails.css";

const ProgramDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------- fetch on mount ---------- */
    useEffect(() => {
        const loadProgram = async () => {
            try {
                const data = await fetchProgramDetail(id);
                setProgram(data);
            } catch (_) {
                toast.error("Unable to load program details.");
                navigate("/programs");
            } finally {
                setLoading(false);
            }
        };
        loadProgram();
    }, [id, navigate]);

    /* ---------- states ---------- */
    if (loading) return <p style={{ textAlign: "center" }}>Loading program…</p>;
    if (!program) return null;

    /* ---------- render ---------- */
    return (
        <div className="program-details-container">
            <button className="back-button" onClick={() => navigate("/programs")}>
                ← Back to Programs
            </button>

            <div className="program-details-card">
                <img
                    src={program.photo}
                    alt={program.title}
                    className="program-details-image"
                />

                <div className="program-details-info">
                    <h2 className="program-details-title">{program.title}</h2>

                    <p className="program-details-description">{program.description}</p>

                    <p className="program-details-meta">
                        Created {formatDate(program.created_at)} | Updated{" "}
                        {formatDate(program.updated_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProgramDetails;
