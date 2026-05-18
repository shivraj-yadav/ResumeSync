import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <span className="brand-icon">📄</span>
          <span className="brand-text">ResumeSync</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" id="nav-dashboard">
                Dashboard
              </Link>
              <span className="nav-user" id="nav-user-greeting">
                Hey, {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="nav-btn nav-btn-logout"
                id="nav-logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link"
                id="nav-login-link"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="nav-btn nav-btn-primary"
                id="nav-signup-link"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
