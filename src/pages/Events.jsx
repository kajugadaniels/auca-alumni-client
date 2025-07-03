import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../api';
import AddEventModal from '../components/pages/events/AddEventModal';
import EditEventModal from '../components/pages/events/EditEventModal';
import ViewEventModal from '../components/pages/events/ViewEventModal';
import DeleteEventModal from '../components/pages/events/DeleteEventModal';
import '../styles/Event.css';

const dummyImage = "https://www.testo.com/images/not-available.jpg";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getEvents = async () => {
    setLoading(true);
    setNoResults(false);
    try {
      const data = await fetchEvents({ page, page_size: pageSize, search, sort_by: sortBy, order });
      if (!data.items.length) setNoResults(true);
      setEvents(data.items);
      setTotalEvents(data.total);
    } catch {
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getEvents(); }, [page, search, sortBy, order]);

  const handleImageError = e => { e.target.src = dummyImage; };

  const openModal = (modal, event = null) => {
    setSelectedEvent(event);
    if (modal === 'add') setShowAdd(true);
    if (modal === 'edit') setShowEdit(true);
    if (modal === 'view') setShowView(true);
    if (modal === 'delete') setShowDelete(true);
  };
  const closeAll = () => {
    setShowAdd(false);
    setShowEdit(false);
    setShowView(false);
    setShowDelete(false);
    setSelectedEvent(null);
    getEvents();
  };

  return (
    <div className="event-container">
      <h1 className="event-title">Upcoming Alumni Events</h1>
      <p className="event-subtitle">Stay connected and engaged with our AUCA alumni network.</p>

      <div className="event-toolbar">
        <button className="btn btn-primary" onClick={() => openModal('add')}>
          + Add Event
        </button>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="event-search-input"
        />
        <select
          onChange={e => {
            const [newSort, newOrder] = e.target.value.split('_');
            setSortBy(newSort);
            setOrder(newOrder);
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
        <p>Loading events...</p>
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
                onError={handleImageError}
              />
              <div className="event-details">
                <h3>{ev.title}</h3>
                <p>{ev.date}</p>
                <div className="event-actions">
                  <button onClick={() => openModal('view', ev)}>View</button>
                  <button onClick={() => openModal('edit', ev)}>Edit</button>
                  <button onClick={() => openModal('delete', ev)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalEvents > pageSize && (
        <div className="event-pagination">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</button>
          <span>Page {page} of {Math.ceil(totalEvents / pageSize)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * pageSize >= totalEvents}
          >
            Next
          </button>
        </div>
      )}

      <AddEventModal isOpen={showAdd} onClose={closeAll} />
      {selectedEvent && (
        <>
          <EditEventModal isOpen={showEdit} onClose={closeAll} event={selectedEvent} />
          <ViewEventModal isOpen={showView} onClose={closeAll} event={selectedEvent} />
          <DeleteEventModal isOpen={showDelete} onClose={closeAll} event={selectedEvent} />
        </>
      )}
    </div>
  );
}
