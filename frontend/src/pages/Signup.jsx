import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import "./Auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "username") {
      setUsernameStatus(null);
    }
  };

  // Debounced username check
  const checkUsername = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const usernameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    try {
      const res = await API.get(
        `/auth/check-username?username=${username.toLowerCase()}`
      );
      setUsernameStatus(res.data.available ? "available" : "taken");
    } catch {
      setUsernameStatus(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsername(formData.username);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      toast.error("Please choose a valid, available username");
      return;
    }

    setIsLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.username
      );
      toast.success("Account created! 🚀");
      navigate("/dashboard");
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUsernameStatus = () => {
    switch (usernameStatus) {
      case "checking":
        return <span className="username-status checking">Checking...</span>;
      case "available":
        return (
          <span className="username-status available">✅ Available</span>
        );
      case "taken":
        return <span className="username-status taken">❌ Already taken</span>;
      case "invalid":
        return (
          <span className="username-status invalid">
            ⚠️ Only lowercase letters, numbers & hyphens
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow auth-bg-glow-1"></div>
      <div className="auth-bg-glow auth-bg-glow-2"></div>

      <div className="auth-card" id="signup-card">
        <div className="auth-header">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            Get your permanent resume link in seconds
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
          <div className="form-group">
            <label htmlFor="signup-name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="signup-name"
              name="name"
              className="form-input"
              placeholder="Shivraj Yadav"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="signup-email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-username" className="form-label">
              Username
            </label>
            <div className="username-input-wrapper">
              <span className="username-prefix">resumesync.com/</span>
              <input
                type="text"
                id="signup-username"
                name="username"
                className="form-input username-input"
                placeholder="shivraj-yadav"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                autoComplete="username"
              />
            </div>
            {renderUsernameStatus()}
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              name="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            id="signup-submit-btn"
            disabled={isLoading || usernameStatus === "taken" || usernameStatus === "invalid"}
          >
            {isLoading ? (
              <span className="btn-loader"></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link" id="signup-to-login-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
