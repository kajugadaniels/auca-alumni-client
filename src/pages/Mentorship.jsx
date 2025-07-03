import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { fetchPrograms, deleteProgram } from "../api";
import "../styles/Program.css";

const dummyImage = "https://www.testo.com/images/not-available.jpg";

const Mentorship = () => {
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [programs, setPrograms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  /* ---------- fetch list ---------- */
  const getPrograms = async () => {
    setIsLoading(true);
    setNoResults(false);

    const params = { page, page_size: pageSize, search, sort_by: sortBy, order };

    try {
      const data = await fetchPrograms(params);
      if (data.items.length === 0) setNoResults(true);
      setPrograms(data.items);
      setTotal(data.total);
    } catch (_) {
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPrograms();
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

  /* --- delete with confirmation --- */
  const handleDelete = (id) => {
    confirmAlert({
      title: "Delete Program",
      message: "Are you sure you want to permanently delete this program?",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              await deleteProgram(id);
              toast.success("Program deleted.");
              if (programs.length === 1 && page > 1) {
                setPage(page - 1);
              } else {
                getPrograms();
              }
            } catch (err) {
              const msg =
                err?.detail?.message || err?.message || "Failed to delete program.";
              toast.error(msg);
            }
          },
        },
        { label: "Cancel" },
      ],
    });
  };

  /* ---------- render ---------- */
  if (isLoading) return <div>Loading mentorship programs…</div>;

  return (
    <div className="program-section">
      <h1 className="program-title">Mentorship Programs</h1>

      {/* toolbar */}
      <div
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}
      >
        <button className="program-link" onClick={() => navigate("/programs/add")}>
          Add Program
        </button>

        {/* Search */}
        <div className="program-search">
          <input
            type="text"
            placeholder="Search for programs..."
            value={search}
            onChange={handleSearchChange}
            className="program-search-input"
          />
        </div>

        {/* Sort */}
        <div className="program-sort">
          <label htmlFor="sort" className="program-sort-label">
            Sort By:
          </label>
          <select id="sort" onChange={handleSortChange} className="program-sort-select">
            <option value="created_at_desc">Created (Newest → Oldest)</option>
            <option value="created_at_asc">Created (Oldest → Newest)</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* grid */}
      <div className="program-grid">
        {noResults ? (
          <p>No mentorship programs found. Please try a different search.</p>
        ) : (
          programs.map((p) => (
            <div key={p.id} className="program-card">
              <img
                src={p.photo}
                alt={p.title}
                className="program-image"
                onError={handleImageError}
              />

              <div className="program-content">
                <h2>{p.title}</h2>
                <p className="program-summary">{p.description}</p>

                <div
                  style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}
                >
                  <Link to={`/programs/${p.id}`} className="program-link">
                    Learn More
                  </Link>
                  <Link to={`/programs/${p.id}/edit`} className="program-link">
                    Edit
                  </Link>
                  <button
                    className="program-link"
                    onClick={() => handleDelete(p.id)}
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
        <div className="program-pagination">
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

export default Mentorship;
