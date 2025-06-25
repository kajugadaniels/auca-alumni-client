import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../api'; // Import the API function for fetching events
import '../styles/Event.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');  // Sort by 'date' or 'title'

  // Function to fetch events based on page, search, and sorting
  const fetchEventData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total: totalCount, page: currentPage, pageSize: currentPageSize } = await fetchEvents({
        page,
        page_size: pageSize,
        search: searchQuery,
        sort_by: sortBy,
        order: 'asc', // You can toggle between 'asc' and 'desc' for sorting order
      });

      setEvents(data);
      setTotal(totalCount);
      setPage(currentPage);
      setPageSize(currentPageSize);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount or when page, searchQuery, or sortBy changes
  useEffect(() => {
    fetchEventData();
  }, [page, searchQuery, sortBy]);

  // Handle Search Query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when search changes
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle sorting
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="event-container">
      <h1 className="event-title">Upcoming Alumni Events</h1>
      <p className="event-subtitle">Stay connected and engaged with our AUCA alumni network.</p>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select onChange={handleSortChange} value={sortBy} className="sort-select">
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      {/* Events List */}
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>{error}</p>
      ) : events.length === 0 ? (
        <p>No events available. Please check back later.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <img src={event.image} alt={event.title} className="event-image" />
              <div className="event-details">
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-date">{event.date}</p>
                <p className="event-card-location">{event.location}</p>
                <p className="event-card-description">{event.description}</p>
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="pagination-button"
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          <button
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => handlePageChange(page + 1)}
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
