import { useState, useEffect } from 'react';
import { fetchEvents } from '../api';  // Import the fetchEvents function
import '../styles/Event.css';

const dummyImage = "https://www.testo.com/images/not-available.jpg";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  // Function to fetch events with pagination, search, and sorting
  const getEvents = async () => {
    setIsLoading(true);
    setNoResults(false);
    
    const params = {
      page,
      page_size: pageSize,
      search,
      sort_by: sortBy,
      order,
    };

    try {
      const data = await fetchEvents(params);
      if (data.items.length === 0) {
        setNoResults(true);
      }
      setEvents(data.items);
      setTotalEvents(data.total);
    } catch (error) {
      setNoResults(true);  // Show no results if API call fails
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEvents();  // Fetch events whenever page, search, or other params change
  }, [page, search, sortBy, order, pageSize]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);  // Reset to first page on search change
  };

  // Handle sorting change
  const handleSortChange = (e) => {
    const [newSortBy, newOrder] = e.target.value.split('_');
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);  // Reset to first page on sort change
  };

  // Handle image error (fallback to dummy image)
  const handleImageError = (e) => {
    e.target.src = dummyImage;  // Set fallback image if the original image fails
  };

  return (
    <div className="event-container">
      <h1 className="event-title">Upcoming Alumni Events</h1>
      <p className="event-subtitle">Stay connected and engaged with our AUCA alumni network.</p>

      {/* Search Box */}
      <div className="event-search">
        <input
          type="text"
          placeholder="Search for events..."
          value={search}
          onChange={handleSearchChange}
          className="event-search-input"
        />
      </div>

      {/* Sorting Options */}
      <div className="event-sort">
        <label htmlFor="sort" className="event-sort-label">
          Sort By:
        </label>
        <select id="sort" onChange={handleSortChange} className="event-sort-select">
          <option value="date_asc">Date (Oldest to Newest)</option>
          <option value="date_desc">Date (Newest to Oldest)</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>
      </div>

      {/* Event List */}
      <div className="event-list">
        {isLoading ? (
          <p>Loading events...</p>
        ) : noResults ? (
          <p>No events found. Please try a different search or check back later.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <img 
                src={event.photo} 
                alt={event.title} 
                className="event-image" 
                onError={handleImageError}  // Trigger fallback on error
              />
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
          ))
        )}
      </div>

      {/* Pagination */}
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
