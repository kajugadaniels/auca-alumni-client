import { useState, useEffect } from 'react';
import {
  fetchEvents,
  fetchEventDetail,
} from '../api';
import '../styles/Event.css';

import EventFormModal from '../components/pages/events/EventFormModal.jsx';
import EventDetailModal from '../components/pages/events/EventDetailModal.jsx';
import ConfirmDeleteModal from '../components/pages/events/ConfirmDeleteModal.jsx';

const dummyImage = 'https://www.testo.com/images/not-available.jpg';

export default function Events() {
  /* ─────────────────────────────────── State */
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('asc');

  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  /* modal state */
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ─────────────────────────────────── Fetch */
  const load = async () => {
    setLoading(true);
    const params = { page, page_size: pageSize, search, sort_by: sortBy, order };
    try {
      const { items, total } = await fetchEvents(params);
      setNoResults(!items.length);
      setEvents(items);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search, sortBy, order]);

  /* ─────────────────────────────────── Helpers */
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const openAdd = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = async ({ id }) => {
    // fetch full record so the detail modal can show the live photo
    const data = await fetchEventDetail(id);
    setEditTarget({
      id: data.id,
      date: data.date,
      description: data.description,
      photoUrl: data.photo,    // for preview only
    });
    setShowForm(true);
  };
  const openDetail = async id => {
    const data = await fetchEventDetail(id);
    setDetailTarget(data);
    setShowDetail(true);
  };

  /* ─────────────────────────────────── UI */
  return (
    <div className="event-container">
      <h1 className="event-title">Upcoming Alumni Events</h1>
      <p className="event-subtitle">
        Stay connected and engaged with our AUCA alumni community.
      </p>

      {/* floating add-button */}
      <button className="fab-add" onClick={openAdd} title="Add new event">
        +
      </button>

      {/* toolbar */}
      <div className="event-toolbar">
        <input
          type="text"
          placeholder="Search events…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="event-search-input"
        />
        <select
          value={`${sortBy}_${order}`}
          onChange={e => {
            const [s, o] = e.target.value.split('_');
            setSortBy(s); setOrder(o); setPage(1);
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
                alt={ev.description}
                className="event-image"
                onError={e => (e.target.src = dummyImage)}
              />
              <div className="event-details">
                <h3
                  className="event-card-title clickable"
                  onClick={() => openDetail(ev.id)}
                >
                  {ev.description.slice(0, 60)}
                </h3>
                <p className="event-card-date">{ev.date}</p>
                <p className="event-card-description">
                  {ev.description.slice(0, 120)}…
                </p>
                <div className="card-actions">
                  <button className="btn-secondary tiny" onClick={() => openDetail(ev.id)}>View</button>
                  <button className="btn-secondary tiny" onClick={() => openEdit(ev)}>Edit</button>
                  <button className="btn-primary   tiny" onClick={() => setDeleteTarget(ev.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* pagination */}
      {pages > 1 && (
        <div className="event-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="pagination-button"
          >
            ‹ Prev
          </button>
          <span>Page {page} / {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(p => p + 1)}
            className="pagination-button"
          >
            Next ›
          </button>
        </div>
      )}

      {/* ──────────────────────── Modals */}
      <EventFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        initial={editTarget}
        onSuccess={load}
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
        onSuccess={load}
      />
    </div>
  );
}
