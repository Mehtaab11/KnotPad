// client/src/components/Dashboard.js
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../utils/api";

const Dashboard = ({ setAuth }) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [activeNav, setActiveNav] = useState("all");
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      const data = await fetchAPI("/documents");
      setDocuments(data);
    } catch (err) {
      setError("Failed to load documents.");
      if (
        err.message.includes("Authentication") ||
        err.message.includes("token")
      ) {
        handleLogout();
      }
    }
  };

  const handleCreateDocument = async () => {
    try {
      const newDoc = await fetchAPI("/documents", {
        method: "POST",
        body: JSON.stringify({ title: "Untitled Document" }),
      });
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (e, docId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    setDeletingId(docId);
    try {
      await fetchAPI(`/documents/${docId}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
    } catch (err) {
      setError("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    navigate("/login");
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const navItems = [
    {
      id: "all",
      label: "All Documents",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
        </svg>
      ),
    },
    {
      id: "recent",
      label: "Recent",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      id: "starred",
      label: "Starred",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);
  const displayDocs = activeNav === "recent" ? recentDocs : documents;

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ background: "#fdf8f8" }}
    >
      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen"
        style={{ background: "#ffffff", borderRight: "1px solid #f0d0d4" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-6 py-5"
          style={{ borderBottom: "1px solid #f0d0d4" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #c41230, #6b0f1a)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="6" height="6" rx="1.5" fill="white" />
              <rect
                x="14"
                y="4"
                width="6"
                height="6"
                rx="1.5"
                fill="white"
                opacity="0.55"
              />
              <rect
                x="4"
                y="14"
                width="6"
                height="6"
                rx="1.5"
                fill="white"
                opacity="0.55"
              />
              <rect x="14" y="14" width="6" height="6" rx="1.5" fill="white" />
            </svg>
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ color: "#2a0a0f" }}
          >
            Knotpad
          </span>
        </div>

        {/* New doc button */}
        <div className="px-4 py-4">
          <button
            onClick={handleCreateDocument}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl text-white transition-all duration-150"
            style={{
              background: "linear-gradient(135deg, #c41230 0%, #6b0f1a 100%)",
              boxShadow: "0 2px 10px rgba(107,15,26,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(107,15,26,0.38)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(107,15,26,0.25)";
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            New Document
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 flex flex-col gap-0.5">
          <p
            className="text-[10px] font-bold tracking-widest uppercase px-3 mb-2 mt-1"
            style={{ color: "#e8c8cc" }}
          >
            Library
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={
                activeNav === item.id
                  ? {
                      background: "linear-gradient(135deg, #fff0f2, #fde8ea)",
                      color: "#c41230",
                      border: "1px solid #f5c0c8",
                    }
                  : {
                      color: "#8b4a50",
                      background: "transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (activeNav !== item.id)
                  e.currentTarget.style.background = "#fff5f6";
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item.id)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ opacity: activeNav === item.id ? 1 : 0.6 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Recent in sidebar */}
        {documents.length > 0 && (
          <div className="px-3 mt-6">
            <p
              className="text-[10px] font-bold tracking-widest uppercase px-3 mb-2"
              style={{ color: "#e8c8cc" }}
            >
              Recent
            </p>
            <div className="flex flex-col gap-0.5">
              {recentDocs.slice(0, 5).map((doc) => (
                <Link
                  key={doc._id}
                  to={`/document/${doc._id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 no-underline"
                  style={{ color: "#8b4a50" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff5f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c4a0a5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  <span className="truncate text-xs font-medium">
                    {doc.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom — sign out */}
        <div
          className="mt-auto px-4 py-4"
          style={{ borderTop: "1px solid #f0d0d4" }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: "#8b4a50" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff5f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-8 sticky top-0 z-20"
          style={{
            height: "60px",
            background: "rgba(253,248,248,0.90)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #f0d0d4",
          }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #c41230, #6b0f1a)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="6" height="6" rx="1.5" fill="white" />
                <rect
                  x="14"
                  y="4"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.55"
                />
                <rect
                  x="4"
                  y="14"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.55"
                />
                <rect
                  x="14"
                  y="14"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: "#2a0a0f" }}>
              Knotpad
            </span>
          </div>

          <div className="hidden lg:flex flex-col">
            <h1
              className="font-bold text-base tracking-tight"
              style={{ color: "#2a0a0f" }}
            >
              {activeNav === "all" && "All Documents"}
              {activeNav === "recent" && "Recent"}
              {activeNav === "starred" && "Starred"}
            </h1>
            <p className="text-xs" style={{ color: "#c4a0a5" }}>
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleCreateDocument}
              className="lg:hidden flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #c41230 0%, #6b0f1a 100%)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              New
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto">
          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-8"
              style={{ background: "#fff0f2", border: "1px solid #f5c0c8" }}
              role="alert"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#c41230"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#c41230"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-sm" style={{ color: "#8b1a1a" }}>
                {error}
              </p>
            </div>
          )}

          {/* ── RECENT STRIP (only on "all" view) ── */}
          {activeNav === "all" && recentDocs.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-semibold text-sm"
                  style={{ color: "#2a0a0f" }}
                >
                  Recently edited
                </h2>
                <button
                  onClick={() => setActiveNav("recent")}
                  className="text-xs font-medium transition-colors"
                  style={{ color: "#c41230" }}
                >
                  View all →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {recentDocs.map((doc) => (
                  <Link
                    key={doc._id}
                    to={`/document/${doc._id}`}
                    className="group relative flex flex-col justify-between p-5 rounded-2xl no-underline transition-all duration-200"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #f0d0d4",
                      minHeight: "130px",
                      boxShadow: "0 1px 4px rgba(107,15,26,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = "1.5px solid #c41230";
                      e.currentTarget.style.boxShadow =
                        "0 6px 24px rgba(107,15,26,0.10)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = "1.5px solid #f0d0d4";
                      e.currentTarget.style.boxShadow =
                        "0 1px 4px rgba(107,15,26,0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(e, doc._id)}
                      disabled={deletingId === doc._id}
                      className="absolute top-3 right-3 w-6 h-6 rounded-lg items-center justify-center hidden group-hover:flex transition-all duration-150"
                      style={{ background: "#fff0f2", color: "#c41230" }}
                      aria-label="Delete document"
                    >
                      {deletingId === doc._id ? (
                        <svg
                          className="animate-spin"
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeOpacity="0.3"
                          />
                          <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      )}
                    </button>

                    <div>
                      {/* Doc icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #fff0f2, #fde8ea)",
                          border: "1px solid #f5c0c8",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#c41230"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                          <path d="M14 2v6h6M16 13H8M16 17H8" />
                        </svg>
                      </div>
                      <h3
                        className="font-semibold text-sm leading-snug line-clamp-2"
                        style={{ color: "#2a0a0f" }}
                      >
                        {doc.title}
                      </h3>
                    </div>

                    <p className="text-xs mt-3" style={{ color: "#c4a0a5" }}>
                      {formatDate(doc.updatedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── ALL DOCUMENTS — vertical list ── */}
          <section>
            {activeNav === "all" && documents.length > 0 && (
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-semibold text-sm"
                  style={{ color: "#2a0a0f" }}
                >
                  All documents
                </h2>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: "#fff0f2",
                    color: "#c41230",
                    border: "1px solid #f5c0c8",
                  }}
                >
                  {documents.length} total
                </span>
              </div>
            )}

            {displayDocs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {displayDocs.map((doc, index) => (
                  <Link
                    to={`/document/${doc._id}`}
                    key={doc._id}
                    className="group flex items-center gap-5 w-full px-6 py-4 rounded-2xl no-underline transition-all duration-200"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #f0d0d4",
                      boxShadow: "0 1px 3px rgba(107,15,26,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = "1.5px solid #c41230";
                      e.currentTarget.style.boxShadow =
                        "0 4px 18px rgba(107,15,26,0.09)";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = "1.5px solid #f0d0d4";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(107,15,26,0.04)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #fff0f2, #fde8ea)",
                        border: "1px solid #f5c0c8",
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#c41230"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8" />
                      </svg>
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-sm truncate mb-0.5"
                        style={{ color: "#2a0a0f" }}
                      >
                        {doc.title}
                      </h3>
                      <p className="text-xs" style={{ color: "#c4a0a5" }}>
                        Edited {formatDate(doc.updatedAt)}
                      </p>
                    </div>

                    {/* Index */}
                    <span
                      className="text-xs font-medium tabular-nums shrink-0"
                      style={{ color: "#e8c8cc" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(e, doc._id)}
                      disabled={deletingId === doc._id}
                      className="w-8 h-8 rounded-xl items-center justify-center hidden group-hover:flex transition-all duration-150 shrink-0"
                      style={{
                        background: "#fff0f2",
                        color: "#c41230",
                        border: "1px solid #fdd0d8",
                      }}
                      aria-label="Delete document"
                    >
                      {deletingId === doc._id ? (
                        <svg
                          className="animate-spin"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeOpacity="0.3"
                          />
                          <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      )}
                    </button>

                    {/* Arrow */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ color: "#c41230", opacity: 0.25 }}
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty state */
              !error && (
                <div
                  className="flex flex-col items-center justify-center text-center py-24 rounded-2xl"
                  style={{
                    background: "#ffffff",
                    border: "1.5px dashed #f0d0d4",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      background: "linear-gradient(135deg, #fff0f2, #fde8ea)",
                      border: "1px solid #f5c0c8",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c41230"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <path d="M14 2v6h6M12 11v6M9 14h6" />
                    </svg>
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontSize: "16px", color: "#2a0a0f" }}
                  >
                    {activeNav === "starred"
                      ? "No starred documents"
                      : "No documents yet"}
                  </h3>
                  <p
                    className="text-sm mb-7"
                    style={{
                      color: "#c4a0a5",
                      maxWidth: "220px",
                      lineHeight: "1.6",
                    }}
                  >
                    {activeNav === "starred"
                      ? "Star documents to find them quickly later."
                      : "Create your first document and start building your knowledge base."}
                  </p>
                  {activeNav !== "starred" && (
                    <button
                      onClick={handleCreateDocument}
                      className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white transition-all duration-150"
                      style={{
                        background:
                          "linear-gradient(135deg, #c41230 0%, #6b0f1a 100%)",
                        boxShadow: "0 4px 16px rgba(107,15,26,0.28)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 6px 22px rgba(107,15,26,0.40)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(107,15,26,0.28)";
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Create your first document
                    </button>
                  )}
                </div>
              )
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
