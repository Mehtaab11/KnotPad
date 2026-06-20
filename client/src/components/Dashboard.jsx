// client/src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../utils/api";
import { generateTitle } from "../constants/random";

/* ─── Design Tokens ─────────────────────────────────────────────
   Behance "Notes potepad and lists" · Knotpad crimson identity
   Space Mono for display text — the signature
──────────────────────────────────────────────────────────────── */
const T = {
  bgBase: "#0F0F0F",
  bgSurface: "#171717",
  bgRaised: "#1E1C1C",
  bgInput: "#1A1A1A",
  borderDim: "#252525",
  borderChip: "#2E2E2E",
  textPrimary: "#EDEDED",
  textSec: "#888888",
  textDim: "#444444",
  accent: "#C8102E",
  accentHover: "#E01030",
  accentGlow: "rgba(200,16,46,0.11)",
};

/* Folder-style avatar colours — mirrors the Behance coloured circles */
const AVATAR_COLORS = [
  "#9B8EC4",
  "#5BBFB5",
  "#A8D4A0",
  "#C4D480",
  "#E07850",
  "#7EB8D4",
  "#D4A07E",
];
const docColor = (id) =>
  AVATAR_COLORS[parseInt(id?.slice(-2) ?? "0", 16) % AVATAR_COLORS.length];

/* Shared SVG icons */
const IconDoc = ({ size = 14, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <path d="M14 2v6h6M16 13H8M16 17H8" />
  </svg>
);
const IconTrash = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
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
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const IconArrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconSpinner = ({ size = 12 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
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
);
const IconPlus = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
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
);
const IconLogout = () => (
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
);
const IconUser = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* Logo mark */
const LogoMark = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
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
      opacity="0.45"
    />
    <rect
      x="4"
      y="14"
      width="6"
      height="6"
      rx="1.5"
      fill="white"
      opacity="0.45"
    />
    <rect x="14" y="14" width="6" height="6" rx="1.5" fill="white" />
  </svg>
);

const Dashboard = ({ setAuth }) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [activeNav, setActiveNav] = useState("all");
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [hoveredListId, setHoveredListId] = useState(null);
  const navigate = useNavigate();

  
  const loadDocuments = async () => {
    try {
      const data = await fetchAPI("/documents");
      setDocuments(data);
    } catch (err) {
      setError("Failed to load documents.");
      if (err.message.includes("jwt") || err.message.includes("expired"))
        handleLogout();
    }
  };
  
  const handleCreateDocument = async () => {
    const title = generateTitle();
    try {
      const newDoc = await fetchAPI("/documents", {
        method: "POST",
        body: JSON.stringify({ title: `${title}` }),
      });
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("jwt") || err.message.includes("expired"))
        handleLogout();
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
    } catch {
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
    const diffDays = Math.floor((Date.now() - date) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
  const recentDocs = sortedDocs.slice(0, 4);
  const displayDocs =
    activeNav === "recent"
      ? sortedDocs
      : activeNav === "starred"
        ? documents.filter((d) => d.isStarred)
        : documents;

  const navItems = [
    { id: "all", label: "All documents", count: documents.length },
    { id: "recent", label: "Recent", count: null },
    {
      id: "starred",
      label: "Starred",
      count: documents.filter((d) => d.isStarred).length || null,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: T.bgBase,
        fontFamily: "'Inter', sans-serif",
        color: T.textPrimary,
      }}
    >
      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex"
        style={{
          width: "224px",
          flexShrink: 0,
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          background: T.bgSurface,
          borderRight: `1px solid ${T.borderDim}`,
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            // todo : Discuss uneven fix with sir about what is better 316 & 600
            padding: "22px 20px 18px",
            borderBottom: `1px solid ${T.borderDim}`,
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "9px",
              background: T.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogoMark size={15} />
          </div>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "13px",
              fontWeight: 700,
              color: T.textPrimary,
              letterSpacing: "-0.3px",
            }}
          >
            Knotpad
          </span>
        </div>

        {/* New doc button */}
        <div style={{ padding: "16px 14px 12px" }}>
          <button
            onClick={handleCreateDocument}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 0",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = T.accentHover)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = T.accent)}
          >
            <IconPlus /> New document
          </button>
        </div>

        {/* Nav section */}
        <div style={{ padding: "8px 10px" }}>
          <p
            style={{
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: T.textDim,
              padding: "0 10px",
              marginBottom: "6px",
            }}
          >
            Library
          </p>
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: "9px",
                  border: "none",
                  background: active ? T.bgRaised : "transparent",
                  color: active ? T.textPrimary : T.textSec,
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  transition: "background 120ms ease, color 120ms ease",
                  textAlign: "left",
                  marginBottom: "2px",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = T.bgRaised;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {active && (
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: T.accent,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {item.label}
                </span>
                {item.count != null && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: T.textDim,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recent docs in sidebar */}
        {documents.length > 0 && (
          <div style={{ padding: "16px 10px 0" }}>
            <p
              style={{
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.textDim,
                padding: "0 10px",
                marginBottom: "6px",
              }}
            >
              Recent
            </p>
            {recentDocs.slice(0, 5).map((doc) => (
              <Link
                key={doc._id}
                to={`/document/${doc._id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "8px 10px",
                  borderRadius: "9px",
                  textDecoration: "none",
                  color: T.textSec,
                  fontSize: "12px",
                  transition: "background 120ms ease",
                  marginBottom: "1px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = T.bgRaised)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: docColor(doc._id),
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {doc.title}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom actions */}
        <div
          style={{
            marginTop: "auto",
            borderTop: `1px solid ${T.borderDim}`,
            padding: "12px 10px",
          }}
        >
          <button
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              width: "100%",
              padding: "9px 10px",
              borderRadius: "9px",
              border: "none",
              background: "transparent",
              color: T.textSec,
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "background 120ms ease",
              marginBottom: "2px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = T.bgRaised)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <IconUser /> Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              width: "100%",
              padding: "9px 10px",
              borderRadius: "9px",
              border: "none",
              background: "transparent",
              color: T.textSec,
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "background 120ms ease, color 120ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.bgRaised;
              e.currentTarget.style.color = T.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T.textSec;
            }}
          >
            <IconLogout /> Sign out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* ── TOP BAR ── */}
        <header
          style={{
            // Todo : discuss the fix about todo line 316 & 600
            height: "71px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            background: "rgba(15,15,15,0.88)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${T.borderDim}`,
            position: "sticky",
            top: 0,
            zIndex: 20,
            gap: "16px",
          }}
        >
          {/* Left — mobile logo OR page title */}
          <div
            className="flex lg:hidden"
            style={{ alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "8px",
                background: T.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogoMark size={13} />
            </div>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "12px",
                fontWeight: 700,
                color: T.textPrimary,
              }}
            >
              Knotpad
            </span>
          </div>

          <div className="hidden lg:flex" style={{ flexDirection: "column" }}>
            <h1
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "14px",
                fontWeight: 700,
                color: T.textPrimary,
                letterSpacing: "-0.3px",
                lineHeight: 1.2,
              }}
            >
              {activeNav === "all" && "All documents"}
              {activeNav === "recent" && "Recent"}
              {activeNav === "starred" && "Starred"}
            </h1>
            <p style={{ fontSize: "11px", color: T.textDim, marginTop: "1px" }}>
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Right — profile + new doc */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginLeft: "auto",
            }}
          >
            {/* Mobile new doc */}
            <button
              className="flex lg:hidden"
              onClick={handleCreateDocument}
              style={{
                alignItems: "center",
                gap: "6px",
                background: T.accent,
                color: "#fff",
                border: "none",
                borderRadius: "9px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = T.accentHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = T.accent)
              }
            >
              <IconPlus size={12} /> New
            </button>

            {/* Profile button — top right, always visible */}
            <button
              onClick={() => navigate("/profile")}
              title="Profile"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: `1px solid ${T.borderChip}`,
                background: T.bgSurface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: T.textSec,
                transition:
                  "border-color 150ms ease, color 150ms ease, background 150ms ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.accent;
                e.currentTarget.style.color = T.textPrimary;
                e.currentTarget.style.background = T.bgRaised;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.borderChip;
                e.currentTarget.style.color = T.textSec;
                e.currentTarget.style.background = T.bgSurface;
              }}
            >
              <IconUser />
            </button>
          </div>
        </header>

        {/* ── PAGE BODY ── */}
        <main
          style={{
            flex: 1,
            padding: "36px 32px",
            maxWidth: "960px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: "rgba(200,16,46,0.08)",
                border: "1px solid rgba(200,16,46,0.20)",
                borderRadius: "12px",
                padding: "12px 14px",
                marginBottom: "28px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginTop: "1px", flexShrink: 0 }}
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke={T.accent}
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke={T.accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p
                style={{ fontSize: "13px", color: "#E07070", lineHeight: 1.5 }}
              >
                {error}
              </p>
            </div>
          )}

          {/* ── RECENT STRIP (all view only) ── */}
          {activeNav === "all" && recentDocs.length > 0 && (
            <section style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  height: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: T.textDim,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  Recently edited
                </p>
                <button
                  onClick={() => setActiveNav("recent")}
                  style={{
                    fontSize: "11px",
                    color: T.accent,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    transition: "color 150ms ease",
                    lineHeight: 1,
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = T.accentHover)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.accent)}
                >
                  View all →
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: "10px",
                }}
              >
                {recentDocs.map((doc) => (
                  <Link
                    key={doc._id}
                    to={`/document/${doc._id}`}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "18px",
                      borderRadius: "14px",
                      border: `1px solid ${hoveredCardId === doc._id ? T.borderChip : T.borderDim}`,
                      background:
                        hoveredCardId === doc._id ? T.bgSurface : T.bgRaised,
                      minHeight: "128px",
                      textDecoration: "none",
                      transition:
                        "background 150ms ease, border-color 150ms ease, transform 150ms ease",
                      transform:
                        hoveredCardId === doc._id
                          ? "translateY(-2px)"
                          : "translateY(0)",
                    }}
                    onMouseEnter={() => setHoveredCardId(doc._id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                  >
                    {/* Coloured dot + delete */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: docColor(doc._id),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconDoc size={13} color="rgba(0,0,0,0.55)" />
                      </div>
                      {hoveredCardId === doc._id && (
                        <button
                          onClick={(e) => handleDelete(e, doc._id)}
                          disabled={deletingId === doc._id}
                          style={{
                            display: "flex",
                            width: "26px",
                            height: "26px",
                            borderRadius: "8px",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(200,16,46,0.12)",
                            border: "none",
                            cursor: "pointer",
                            color: T.accent,
                            transition: "background 150ms ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(200,16,46,0.24)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(200,16,46,0.12)")
                          }
                          aria-label="Delete document"
                        >
                          {deletingId === doc._id ? (
                            <IconSpinner size={11} />
                          ) : (
                            <IconTrash size={11} />
                          )}
                        </button>
                      )}
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: T.textPrimary,
                          lineHeight: 1.4,
                          marginBottom: "6px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {doc.title}
                      </h3>
                      <p style={{ fontSize: "11px", color: T.textDim }}>
                        {formatDate(doc.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── DOCUMENT LIST ── */}
          <section>
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: T.textDim,
                }}
              >
                {activeNav === "all"
                  ? "All documents"
                  : activeNav === "recent"
                    ? "Recent"
                    : "Starred"}
              </p>
              {displayDocs.length > 0 && (
                <span
                  style={{
                    fontSize: "10px",
                    color: T.textDim,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {displayDocs.length}
                </span>
              )}
            </div>

            {displayDocs.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {displayDocs.map((doc, index) => (
                  <Link
                    key={doc._id}
                    to={`/document/${doc._id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      border: `1px solid ${hoveredListId === doc._id ? T.borderChip : T.borderDim}`,
                      background:
                        hoveredListId === doc._id ? T.bgSurface : T.bgRaised,
                      textDecoration: "none",
                      transition:
                        "background 150ms ease, border-color 150ms ease, transform 150ms ease",
                      transform:
                        hoveredListId === doc._id
                          ? "translateX(3px)"
                          : "translateX(0)",
                    }}
                    onMouseEnter={() => setHoveredListId(doc._id)}
                    onMouseLeave={() => setHoveredListId(null)}
                  >
                    {/* Coloured circle avatar */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: docColor(doc._id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconDoc size={14} color="rgba(0,0,0,0.5)" />
                    </div>

                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: T.textPrimary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "2px",
                        }}
                      >
                        {doc.title}
                      </h3>
                      <p style={{ fontSize: "11px", color: T.textDim }}>
                        Edited {formatDate(doc.updatedAt)}
                      </p>
                    </div>

                    {/* Index number — Space Mono */}
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "11px",
                        color: T.textDim,
                        flexShrink: 0,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Delete — visible only when this row is hovered */}
                    {hoveredListId === doc._id && (
                      <button
                        onClick={(e) => handleDelete(e, doc._id)}
                        disabled={deletingId === doc._id}
                        style={{
                          display: "flex",
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(200,16,46,0.10)",
                          border: "none",
                          cursor: "pointer",
                          color: T.accent,
                          flexShrink: 0,
                          transition: "background 150ms ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(200,16,46,0.22)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(200,16,46,0.10)")
                        }
                        aria-label="Delete document"
                      >
                        {deletingId === doc._id ? (
                          <IconSpinner />
                        ) : (
                          <IconTrash />
                        )}
                      </button>
                    )}

                    {/* Chevron */}
                    <span
                      style={{
                        color: hoveredListId === doc._id ? T.accent : T.textDim,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        transition: "color 150ms ease",
                      }}
                    >
                      <IconArrow />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty state */
              !error && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "80px 24px",
                    borderRadius: "16px",
                    border: `1px dashed ${T.borderChip}`,
                    background: T.bgSurface,
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: T.bgRaised,
                      border: `1px solid ${T.borderDim}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <IconDoc size={22} color={T.textDim} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: T.textPrimary,
                      marginBottom: "10px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {activeNav === "starred"
                      ? "No starred documents"
                      : "Nothing here yet"}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: T.textSec,
                      maxWidth: "220px",
                      lineHeight: 1.6,
                      marginBottom: "28px",
                    }}
                  >
                    {activeNav === "starred"
                      ? "Star documents to find them quickly later."
                      : "Create your first document and start building your knowledge base."}
                  </p>
                  {activeNav !== "starred" && (
                    <button
                      onClick={handleCreateDocument}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: T.accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        padding: "11px 22px",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        cursor: "pointer",
                        transition: "background 150ms ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = T.accentHover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = T.accent)
                      }
                    >
                      <IconPlus /> Create your first document
                    </button>
                  )}
                </div>
              )
            )}
          </section>
        </main>
      </div>

      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default Dashboard;
