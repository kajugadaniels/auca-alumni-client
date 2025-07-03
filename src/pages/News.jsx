// src/pages/News.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { fetchNews, deleteNews } from "../api";
import "../styles/News.css";

const dummyImage = "https://www.testo.com/images/not-available.jpg";

const News = () => {
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [newsItems, setNewsItems] = useState([]);
  const [totalNews, setTotalNews] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  /* ---------- fetch list ---------- */
  const getNews = async () => {
    setIsLoading(true);
    setNoResults(false);

    const params = { page, page_size: pageSize, search, sort_by: sortBy, order };

    try {
      const data = await fetchNews(params);
      if (data.items.length === 0) setNoResults(true);
      setNewsItems(data.items);
      setTotalNews(data.total);
    } catch (_) {
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, [page, search, sortBy, order, pageSize]);

  /* ---------- handlers ---------- */
  const handlePageChange = (newPage) => setPage(newPage);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newOrder] = e.target.value.split("_");
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);
  };

  const handleImageError = (e) => (e.target.src = dummyImage);

  /* --- NEW: delete with confirmation --- */
  const handleDelete = (id) => {
    confirmAlert({
      title: "Delete News",
      message: "Are you sure you want to permanently delete this news item?",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              await deleteNews(id);
              toast.success("News item deleted.");
              // refresh current page – if last item removed, go back a page
              if (newsItems.length === 1 && page > 1) {
                setPage(page - 1);
              } else {
                getNews();
              }
            } catch (err) {
              const msg =
                err?.detail?.message || err?.message || "Failed to delete news item.";
              toast.error(msg);
            }
          },
        },
        { label: "Cancel" },
      ],
    });
  };

  /* ---------- render ---------- */
  if (isLoading) return <div>Loading news…</div>;

  return (
    <div className="news-section">
      <h1 className="news-title">Latest Alumni News</h1>

      {/* toolbar */}
      <div
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}
      >
        <button className="news-link" onClick={() => navigate("/news/add")}>
          Add News
        </button>

        {/* Search */}
        <div className="news-search">
          <input
            type="text"
            placeholder="Search for news..."
            value={search}
            onChange={handleSearchChange}
            className="news-search-input"
          />
        </div>

        {/* Sort */}
        <div className="news-sort">
          <label htmlFor="sort" className="news-sort-label">
            Sort By:
          </label>
          <select id="sort" onChange={handleSortChange} className="news-sort-select">
            <option value="date_desc">Date (Newest → Oldest)</option>
            <option value="date_asc">Date (Oldest → Newest)</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* grid */}
      <div className="news-grid">
        {noResults ? (
          <p>No news articles found. Please try a different search or check back later.</p>
        ) : (
          newsItems.map((item) => (
            <div key={item.id} className="news-card">
              <img
                src={item.photo}
                alt={item.title}
                className="news-image"
                onError={handleImageError}
              />

              <div className="news-content">
                <h2>{item.title}</h2>
                <p className="news-date">{item.date}</p>
                <p className="news-summary">{item.description}</p>

                <div
                  style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}
                >
                  <Link to={`/news/${item.id}`} className="news-link">
                    Learn More
                  </Link>
                  <Link to={`/news/${item.id}/edit`} className="news-link">
                    Edit
                  </Link>
                  <button
                    className="news-link"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* pagination */}
      {totalNews > pageSize && (
        <div className="news-pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {page} of {Math.ceil(totalNews / pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page * pageSize >= totalNews}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default News;
