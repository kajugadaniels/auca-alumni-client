import { useState, useEffect } from 'react';
import { fetchNews } from '../api'; // Import the fetchNews function
import '../styles/News.css';

const dummyImage = "https://www.testo.com/images/not-available.jpg";

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [totalNews, setTotalNews] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  // Fetch the news data
  const getNews = async () => {
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
      const data = await fetchNews(params);
      if (data.items.length === 0) {
        setNoResults(true);  // Set noResults to true if no items are found
      }
      setNewsItems(data.items);
      setTotalNews(data.total);
    } catch (error) {
      setNoResults(true);  // Set noResults to true if there's an error fetching data
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to the first page when search is updated
  };

  // Handle sorting change
  const handleSortChange = (e) => {
    const [newSortBy, newOrder] = e.target.value.split('_');
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);  // Reset to the first page when sort is updated
  };

  // Handle image error (fallback to dummy image)
  const handleImageError = (e) => {
    e.target.src = dummyImage;  // Set fallback image if the original image fails
  };

  useEffect(() => {
    getNews();  // Fetch news when page, search, or other parameters change
  }, [page, search, sortBy, order, pageSize]);

  // Loading state UI
  if (isLoading) {
    return <div>Loading news...</div>;
  }

  return (
    <div className="news-section">
      <h1 className="news-title">Latest Alumni News</h1>
      
      {/* Search Box */}
      <div className="news-search">
        <input
          type="text"
          placeholder="Search for news..."
          value={search}
          onChange={handleSearchChange}
          className="news-search-input"
        />
      </div>

      {/* Sorting Options */}
      <div className="news-sort">
        <label htmlFor="sort" className="news-sort-label">
          Sort By:
        </label>
        <select id="sort" onChange={handleSortChange} className="news-sort-select">
          <option value="date_desc">Date (Newest to Oldest)</option>
          <option value="date_asc">Date (Oldest to Newest)</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>
      </div>

      {/* News Grid */}
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
                onError={handleImageError} // Trigger fallback on error
              />
              <div className="news-content">
                <h2>{item.title}</h2>
                <p className="news-date">{item.date}</p>
                <p className="news-summary">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
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
