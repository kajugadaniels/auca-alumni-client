import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchOpportunityDetail } from "../../../api";
import "../../../styles/OpportunityDetails.css";

const dummyImage =
    "https://www.testo.com/images/not-available.jpg";

const OpportunityDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [op, setOp] = useState(null);

    /* ---------- load ---------- */
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchOpportunityDetail(id);
                setOp(data);
            } catch {
                toast.error("Unable to load opportunity.");
                navigate("/jobs");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, navigate]);

    /* ---------- helpers ---------- */
    const handleImageError = (e) => {
        e.target.src = dummyImage;
    };

    /* ---------- render ---------- */
    if (loading) return <p style={{ textAlign: "center" }}>Loading…</p>;
    if (!op) return null;

    return (
        <div className="opp-detail-container">
            <button className="back-button" onClick={() => navigate("/jobs")}>
                ← Back to Board
            </button>

            <h1 className="opp-detail-title">{op.title}</h1>

            <div className="opp-detail-meta">
                <span>📅 {new Date(op.date).toLocaleDateString()}</span>
                {op.status && <span> • Status: {op.status}</span>}
                <span> • Posted by {op.user.first_name} {op.user.last_name}</span>
            </div>

            <img
                src={op.photo}
                alt={op.title}
                className="opp-detail-image"
                onError={handleImageError}
            />

            <p className="opp-detail-description">{op.description}</p>

            {op.link && (
                <p className="opp-detail-link">
                    <a href={op.link} target="_blank" rel="noopener noreferrer">
                        🔗 More information
                    </a>
                </p>
            )}

            <div className="opp-detail-actions">
                <Link to={`/opportunities/${op.id}/edit`} className="btn-primary">
                    Edit
                </Link>
            </div>
        </div>
    );
};

export default OpportunityDetails;
