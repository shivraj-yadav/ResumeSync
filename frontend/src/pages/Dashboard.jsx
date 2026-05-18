import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB");
      return;
    }

    setFile(selected);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    validateAndSetFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeUrl(res.data.resumeUrl);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Resume uploaded successfully! 🎉");
    } catch (error) {
      const msg = error.response?.data?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container" id="dashboard-container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">
            Welcome, <span className="highlight">{user?.name}</span>
          </h1>
          <p className="dashboard-subtitle">
            Manage your resume and share your permanent link
          </p>
        </div>

        {/* Public Link Card */}
        <div className="link-card" id="public-link-card">
          <div className="link-card-label">Your public resume link</div>
          {resumeUrl ? (
            <div className="link-card-url">
              <span className="link-icon">🔗</span>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-text"
                id="public-resume-link"
              >
                {resumeUrl}
              </a>
              <button
                className="copy-btn"
                id="copy-link-btn"
                onClick={() => {
                  navigator.clipboard.writeText(resumeUrl);
                  toast.success("Link copied!");
                }}
              >
                Copy
              </button>
            </div>
          ) : (
            <p className="link-card-hint">
              Upload your resume below to get your shareable link
            </p>
          )}
        </div>

        {/* Upload Card */}
        <div className="upload-card" id="upload-section">
          <h2 className="upload-card-title">
            {resumeUrl ? "Replace Resume" : "Upload Resume"}
          </h2>
          <p className="upload-card-desc">
            {resumeUrl
              ? "Upload a new PDF to replace your current resume. Same link, latest version."
              : "Upload your resume as a PDF (max 5 MB). You'll get a permanent shareable link."}
          </p>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
            id="drop-zone"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-input-hidden"
              id="resume-file-input"
            />

            {file ? (
              <div className="file-selected">
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  className="file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="drop-zone-content">
                <span className="drop-icon">☁️</span>
                <p className="drop-text">
                  Drag & drop your PDF here, or <span className="browse-text">browse</span>
                </p>
                <p className="drop-hint">PDF only · Max 5 MB</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            className="upload-btn"
            id="upload-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <span className="btn-loader"></span>
                Uploading...
              </>
            ) : resumeUrl ? (
              "Replace Resume"
            ) : (
              "Upload Resume"
            )}
          </button>

          {/* Current Resume Preview */}
          {resumeUrl && (
            <div className="current-resume" id="current-resume-section">
              <div className="current-resume-header">
                <span className="current-resume-icon">✅</span>
                <span>Resume is live</span>
              </div>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-resume-link"
                id="view-resume-link"
              >
                View current resume ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
