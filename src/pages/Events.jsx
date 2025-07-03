import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { fetchEvents, deleteEvent } from "../api";
import "../styles/Event.css";

const dummyImage = "https://www.testo.com/images/not-available.jpg";

const Events = () => {
  const navigate = useNavigate();

  // ───────── state ─────────
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  /* ---------- fetch list ---------- */
  const getEvents = async () => {
    setIsLoading(true);
    setNoResults(false);

    const params = { page, page_size: pageSize, search, sort_by: sortBy, order };

    try {
      const data = await fetchEvents(params);
      if (data.items.length === 0) setNoResults(true);
      setEvents(data.items);
      setTotalEvents(data.total);
    } catch (_) {
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
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

  const handleImageError = (e) => {
    e.target.src = dummyImage;
  };

  /* --- NEW: delete with confirmation --- */
  const handleDelete = (id) => {
    confirmAlert({
      title: "Delete Event",
      message: "Are you sure you want to permanently delete this event?",
      buttons: [
        {
          label: "Yes, Delete",
          onClick: async () => {
            try {
              await deleteEvent(id);
              toast.success("Event deleted.");
              // refresh current page – if last item removed, go back a page
              if (events.length === 1 && page > 1) {
                setPage(page - 1);
              } else {
                getEvents();
              }
            } catch (err) {
              const msg =
                err?.detail?.message || err?.message || "Failed to delete event.";
              toast.error(msg);
            }
          },
        },
        { label: "Cancel" },
      ],
    });
  };

  /* ---------- render ---------- */
  return (
    <div className="event-container">
      <h1 className="event-title">Upcoming Alumni Events</h1>
      <p className="event-subtitle">
        Stay connected and engaged with our AUCA alumni network.
      </p>

      {/* toolbar */}
      <div
        style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}
      >
        <button className="btn-primary" onClick={() => navigate("/events/add")}>
          Add New Event
        </button>

        {/* Search */}
        <div className="event-search">
          <input
            type="text"
            placeholder="Search for events..."
            value={search}
            onChange={handleSearchChange}
            className="event-search-input"
          />
        </div>

        {/* Sort */}
        <div className="event-sort">
          <label htmlFor="sort" className="event-sort-label">
            Sort By:
          </label>
          <select id="sort" onChange={handleSortChange} className="event-sort-select">
            <option value="date_asc">Date (Oldest → Newest)</option>
            <option value="date_desc">Date (Newest → Oldest)</option>
            <option value="description_asc">Description (A-Z)</option>
            <option value="description_desc">Description (Z-A)</option>
          </select>
        </div>
      </div>

      {/* list */}
      <div className="event-list">
        {isLoading ? (
          <p>Loading events…</p>
        ) : noResults ? (
          <p>No events found. Please try a different search or check back later.</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="event-card">
              <img
                src={ev.photo}
                alt={ev.description}
                className="event-image"
                onError={handleImageError}
              />

              <div className="event-details">
                <h3 className="event-card-title">{ev.description.slice(0, 60)}…</h3>
                <p className="event-card-date">{ev.date}</p>
                <p className="event-card-description">{ev.description}</p>

                <div
                  style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}
                >
                  <Link to={`/events/${ev.id}`} className="event-link">
                    Learn More
                  </Link>
                  <Link to={`/events/${ev.id}/edit`} className="event-link">
                    Edit
                  </Link>
                  <button
                    className="event-link"
                    onClick={() => handleDelete(ev.id)}
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
      {totalEvents > pageSize && (
        <div className="event-pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {page} of {Math.ceil(totalEvents / pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page * pageSize >= totalEvents}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;
