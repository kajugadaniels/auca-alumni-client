import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchEventDetail } from "../../../api";
import { formatDate } from "../../../utils/date";
import "../../../styles/EventDetails.css";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------- fetch on mount ---------- */
    useEffect(() => {
        const loadEvent = async () => {
            try {
                const data = await fetchEventDetail(id);
                setEvent(data);
            } catch (_) {
                toast.error("Unable to load event details.");
                navigate("/events");
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [id, navigate]);

    /* ---------- fallback while loading ---------- */
    if (loading) {
        return <p style={{ textAlign: "center" }}>Loading event…</p>;
    }
    if (!event) return null; // safety

    /* ---------- render ---------- */
    return (
        <div className="event-details-container">
            <button className="back-button" onClick={() => navigate("/events")}>
                ← Back to Events
            </button>

            <div className="event-details-card">
                <img
                    src={event.photo}
                    alt={event.description}
                    className="event-details-image"
                />

                <div className="event-details-info">
                    <p className="event-details-date">
                        <strong>Date:</strong> {formatDate(event.date)}
                    </p>
                    <p className="event-details-status">
                        <strong>Status:</strong> {event.status}
                    </p>
                    <p className="event-details-description">{event.description}</p>
                    <p className="event-details-meta">
                        Created {formatDate(event.created_at)} | Updated {formatDate(event.updated_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
