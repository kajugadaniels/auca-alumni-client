import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchNewsDetail } from "../../../api";
import { formatDate } from "../../../utils/date";
import "../../../styles/NewsDetails.css";

const NewsDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------- load on mount ---------- */
    useEffect(() => {
        const loadNews = async () => {
            try {
                const data = await fetchNewsDetail(id);
                setNews(data);
            } catch (_) {
                toast.error("Unable to load news item.");
                navigate("/news");
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, [id, navigate]);

    if (loading) return <p style={{ textAlign: "center" }}>Loading news…</p>;
    if (!news) return null; // safety

    return (
        <div className="news-details-container">
            <button className="back-button" onClick={() => navigate("/news")}>
                ← Back to News
            </button>

            <div className="news-details-card">
                <img
                    src={news.photo}
                    alt={news.title}
                    className="news-details-image"
                />

                <div className="news-details-info">
                    <h2 className="news-details-title">{news.title}</h2>
                    <p className="news-details-date">
                        <strong>Date:</strong> {formatDate(news.date)}
                    </p>

                    <p className="news-details-description">{news.description}</p>

                    <p className="news-details-meta">
                        Created {formatDate(news.created_at)} | Updated{" "}
                        {formatDate(news.updated_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NewsDetails;
