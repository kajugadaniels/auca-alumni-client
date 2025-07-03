import { useState, useEffect } from 'react';
import {
  fetchEvents,
  fetchEventDetail,
} from '../api';
import '../styles/Event.css';

import EventFormModal from "../components/pages/events/EventFormModal.jsx";
import EventDetailModal from "../components/pages/events/EventDetailModal.jsx";
import ConfirmDeleteModal from "../components/pages/events/ConfirmDeleteModal.jsx";

const dummyImage = 'https://www.testo.com/images/not-available.jpg';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('asc');

  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  // modal states
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getEvents = async () => {
    setLoading(true);
    const params = {
      page,
      page_size: pageSize,
      search,
      sort_by: sortBy,
      order,
    };
    try {
      const data = await fetchEvents(params);
      setNoResults(!data.items.length);
      setEvents(data.items);
      setTotal(data.total);
    } catch {
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, [page, search, sortBy, order]);

  const openAdd = () => {
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = ev => {
    setEditTarget({
      id: ev.id,
      date: ev.date,
      description: ev.description,
    });
    setShowForm(true);
  };

  const openDetail = async id => {
    try {
      const data = await fetchEventDetail(id);
      setDetailTarget(data);
      setShowDetail(true);
    } catch (e) {
      alert(e.message || 'Could not load details.');
    }
  };

  // UI helpers
  const pages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="event-container">
      <h1 className="event-title">Upcoming Alumni Events</h1>
      <p className="event-subtitle">
        Stay connected and engaged with our AUCA alumni network.
      </p>

      <div className="event-toolbar">
        <button className="btn-primary" onClick={openAdd}>
          + Add Event
        </button>
        <input
          type="text"
          placeholder="Search events…"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="event-search-input"
        />
        <select
          onChange={e => {
            const [s, o] = e.target.value.split('_');
            setSortBy(s);
            setOrder(o);
            setPage(1);
          }}
          className="event-sort-select"
        >
          <option value="date_asc">Date ↑</option>
          <option value="date_desc">Date ↓</option>
          <option value="title_asc">Title A-Z</option>
          <option value="title_desc">Title Z-A</option>
        </select>
      </div>

      {loading ? (
        <p>Loading events…</p>
      ) : noResults ? (
        <p>No events found.</p>
      ) : (
        <div className="event-list">
          {events.map(ev => (
            <div key={ev.id} className="event-card">
              <img
                src={ev.photo || dummyImage}
                alt={ev.title}
                className="event-image"
                onError={e => (e.target.src = dummyImage)}
              />
              <div className="event-details">
                <h3
                  className="event-card-title clickable"
                  onClick={() => openDetail(ev.id)}
                >
                  {ev.title || ev.description.slice(0, 40)}
                </h3>
                <p className="event-card-date">{ev.date}</p>
                <p className="event-card-description">
                  {ev.description.slice(0, 100)}…
                </p>
                <div className="card-actions">
                  <button
                    className="btn-secondary tiny"
                    onClick={() => openDetail(ev.id)}
                  >
                    Learn More
                  </button>
                  <button
                    className="btn-secondary tiny"
                    onClick={() => openEdit(ev)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-primary tiny"
                    onClick={() => setDeleteTarget(ev.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="event-pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-button"
          >
            ‹ Prev
          </button>
          <span>
            Page {page} / {pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="pagination-button"
          >
            Next ›
          </button>
        </div>
      )}

      {/* Modals */}
      <EventFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        initial={editTarget}
        onSuccess={getEvents}
      />
      <EventDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        event={detailTarget}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        eventId={deleteTarget}
        onSuccess={getEvents}
      />
    </div>
  );
}
