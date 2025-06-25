import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../../styles/Navbar.css'; // Import the CSS file
import { verifyToken } from '../../api';  // Import API function to verify token

const Navbar = ({ toggleSidebar, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);  // For loading state on token verification
  const navigate = useNavigate();

  // Function to verify if the user is logged in
  const checkLoginStatus = async () => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage

    if (!token) {
      setIsLoggedIn(false);  // No token found, user is not logged in
      setIsLoading(false);   // Stop loading
      return;
    }

    try {
      await verifyToken();  // Call the API to verify the token
      setIsLoggedIn(true);   // If token is valid, user is logged in
    } catch (error) {
      setIsLoggedIn(false);  // If token verification fails, user is logged out
      localStorage.removeItem("token"); // Clear invalid token
      navigate('/login');    // Redirect to login if not logged in
    } finally {
      setIsLoading(false);   // Stop loading after the verification is done
    }
  };

  useEffect(() => {
    checkLoginStatus();  // Check login status when the component mounts
  }, []);

  // Loading state UI
  if (isLoading) {
    return <div>Loading...</div>;  // Display a loading state while checking the login status
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {/* Only show the menu button if the user is logged in */}
          {isLoggedIn && (
            <button onClick={toggleSidebar} className="menu-button">
              <Menu size={24} />
            </button>
          )}
          <Link to="/" className="brand">AUCA Alumni</Link>
        </div>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search alumni, events, news..."
            className="search-input"
            disabled={isLoading} // Disable search while loading
          />
        </div>

        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              <button className="notification-button">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
              <div className="profile-dropdown">
                <button
                  className="profile-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen ? "true" : "false"}
                >
                  <User size={20} />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile">My Profile</Link>
                    <Link to="/settings">Settings</Link>
                    <button onClick={handleLogout} className="logout-button">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="home-link">Home</Link>
              <Link to="/login" className="login-button">Login</Link>
              <Link to="/register" className="register-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
