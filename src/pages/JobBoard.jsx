import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { fetchOpportunities, deleteOpportunity } from "../api";
import "../styles/JobBoard.css";

const dummyImage = "https://www.testo.com/images/not-available.jpg";

const JobBoard = () => {
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  /* ---------- fetch list ---------- */
  const load = async () => {
    setIsLoading(true);
    setNoResults(false);
    const params = { page, page_size: pageSize, search, sort_by: sortBy, order };

    try {
      const data = await fetchOpportunities(params); // helper already exists
      if (data.items.length === 0) setNoResults(true);
      setItems(data.items);
      setTotal(data.total);
    } catch (_) {
      toast.error("Unable to load opportunities.");
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search, sortBy, order, pageSize]);

  /* ---------- handlers ---------- */
  const handlePageChange = (newPage) => setPage(newPage);
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleSortChange = (e) => {
    const [sb, ord] = e.target.value.split("_");
    setSortBy(sb);
    setOrder(ord);
    setPage(1);
  };
  const handleImageError = (e) => {
    e.target.src = dummyImage;
  };

  /* ----- optional delete (if user is admin) ---- */
  const handleDelete = (id) => {
    confirmAlert({
      title: "Delete Opportunity",
      message: "Are you sure you want to remove this opportunity?",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              await deleteOpportunity(id);
              toast.success("Deleted.");
              if (items.length === 1 && page > 1) setPage(page - 1);
              else load();
            } catch {
              toast.error("Delete failed.");
            }
          },
        },
        { label: "Cancel" },
      ],
    });
  };

  /* ---------- render ---------- */
  if (isLoading) return <div className="jobboard-loading">Loading jobs…</div>;

  return (
    <div className="jobboard-section">
      <h1 className="jobboard-title">Latest Opportunities</h1>

      {/* toolbar */}
      <div className="jobboard-toolbar">
        <button
          className="job-link"
          onClick={() => navigate("/opportunities/add")}
        >
          Post Opportunity
        </button>

        <input
          className="jobboard-search"
          placeholder="Search…"
          value={search}
          onChange={handleSearchChange}
        />

        <select className="jobboard-sort" onChange={handleSortChange}>
          <option value="created_at_desc">Posted (Newest → Oldest)</option>
          <option value="created_at_asc">Posted (Oldest → Newest)</option>
          <option value="date_asc">Event Date (Earliest)</option>
          <option value="date_desc">Event Date (Latest)</option>
        </select>
      </div>

      {/* grid */}
      <div className="jobboard-grid">
        {noResults ? (
          <p>No opportunities found.</p>
        ) : (
          items.map((op) => (
            <div key={op.id} className="job-card">
              <img
                src={op.photo}
                alt={op.title}
                className="job-image"
                onError={handleImageError}
              />
              <div className="job-content">
                <h2>{op.title}</h2>
                <p className="job-date">
                  {new Date(op.date).toLocaleDateString()}
                </p>
                <p className="job-desc">{op.description}</p>

                <div className="job-links">
                  <Link to={`/opportunities/${op.id}`} className="job-link">
                    Learn More
                  </Link>
                  <Link
                    to={`/opportunities/${op.id}/edit`}
                    className="job-link"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(op.id)}
                    className="job-link"
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
      {total > pageSize && (
        <div className="jobboard-pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page * pageSize >= total}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
