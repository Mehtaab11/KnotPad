// client/src/components/Editor.js
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { fetchAPI } from "../utils/api";

const SAVE_INTERVAL_MS = 2000;
const TITLE_DEBOUNCE_MS = 800;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

const Editor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();

  // ── Refs (stable across renders, no closure staleness) ──────────────────
  const quillRef = useRef(null); // the Quill instance
  const socketRef = useRef(null); // the socket instance
  const titleDebounce = useRef(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [quillReady, setQuillReady] = useState(false); // signals effects to run
  const [socketReady, setSocketReady] = useState(false);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved"|"saving"|"error"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState({ type: "", text: "" });
  const [wordCount, setWordCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);

  // ── 1. Quill init via callback ref ───────────────────────────────────────
  // Called once when the wrapper div mounts. We never re-run this.
  const wrapperRef = useCallback((wrapper) => {
    if (!wrapper || quillRef.current) return; // already initialized
    wrapper.innerHTML = "";

    // Quill needs a child div to attach to
    const editorDiv = document.createElement("div");
    wrapper.append(editorDiv);

    const q = new Quill(editorDiv, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: "Start writing…",
    });

    q.disable();
    quillRef.current = q;
    setQuillReady(true); // ← tells effects "quill is live"
  }, []);

  // ── 2. Fetch document title ──────────────────────────────────────────────
  // Understood
  useEffect(() => {
    const load = async () => {
      try {
        const doc = await fetchAPI(`/documents/${documentId}`);
        setTitle(doc.title ?? "Untitled Document");
      } catch (e) {
        console.error("Could not fetch document metadata", e);
      }
    };
    load();
  }, [documentId]);

  // ── 3. Socket connection ─────────────────────────────────────────────────

  // This useEffect is uderstandable
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const s = io("http://localhost:5000", { auth: { token } });
    s.on("connect", () => {
      console.log("✅ Socket:", s.id);
      setSocketReady(true);
    });
    s.on("connect_error", (err) =>
      console.error("❌ Socket error:", err.message),
    );
    s.on("presence-updates", (users) => {
      setActiveUsers(users);
    });
    s.on("error", (msg) => {
      alert(msg);
      navigate("/dashboard");
    });

    socketRef.current = s;
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [navigate]);

  // ── 4. Load document content ─────────────────────────────────────────────
  // Only runs when BOTH quill and socket are confirmed ready
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current;
    const s = socketRef.current;
    if (!q || !s) return;

    const onLoad = (content) => {
      console.log("📥 load-document received:", content);
      // console.log("📥 load-document received:", content.content.ops[0].insert);
      if (content && content.ops && content.ops.length > 0) {
        q.setContents(content);
      } else {
        q.setContents([{ insert: "\n " }]);
      }
      q.enable();
      q.focus();
      setSaveStatus("saved");
      // Initial word count
      setWordCount(q.getText().trim().split(/\s+/).filter(Boolean).length);
    };

    // Use `once` so it doesn't double-fire on reconnect
    s.once("load-document", onLoad);
    s.emit("get-document", documentId);

    return () => s.off("load-document", onLoad);
  }, [quillReady, socketReady, documentId]);

  // ── 5. Send local changes → collaborators ────────────────────────────────
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current;
    const s = socketRef.current;

    const onTextChange = (delta, _old, source) => {
      if (source !== "user") return;
      setSaveStatus("saving");
      s.emit("send-changes", delta);
      // Update word count
      setWordCount(q.getText().trim().split(/\s+/).filter(Boolean).length);
    };

    q.on("text-change", onTextChange);
    return () => q.off("text-change", onTextChange);
  }, [quillReady, socketReady]);

  // ── 6. Receive changes from collaborators ────────────────────────────────
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current;
    const s = socketRef.current;

    const onReceive = (delta) => q.updateContents(delta);
    s.on("receive-changes", onReceive);
    return () => s.off("receive-changes", onReceive);
  }, [quillReady, socketReady]);

  // ── 7. Auto-save loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current;
    const s = socketRef.current;

    const interval = setInterval(() => {
      const contents = q.getContents();
      s.emit("save-changes", contents);
      setSaveStatus((prev) => (prev === "saving" ? "saved" : prev));
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [quillReady, socketReady]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleBack = () => {
    const q = quillRef.current;
    const s = socketRef.current;
    if (q && s) s.emit("save-changes", q.getContents());
    navigate("/dashboard");
  };

  // This is also clear
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    setSaveStatus("saving");
    if (titleDebounce.current) clearTimeout(titleDebounce.current);
    titleDebounce.current = setTimeout(async () => {
      try {
        await fetchAPI(`/documents/${documentId}`, {
          method: "PUT",
          body: JSON.stringify({ title: val }),
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, TITLE_DEBOUNCE_MS);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteMsg({ type: "", text: "" });
    try {
      await fetchAPI(`/documents/${documentId}/collaborators`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteMsg({ type: "success", text: "Collaborator added!" });
      setInviteEmail("");
      setTimeout(() => setIsModalOpen(false), 1800);
    } catch (err) {
      setInviteMsg({ type: "error", text: err.message });
    }
  };

  const statusMap = {
    saved: { label: "Saved", dot: "#a3b18a" },
    saving: { label: "Saving…", dot: "#f59e0b" },
    error: { label: "Save failed", dot: "#c41230" },
  };
  const st = statusMap[saveStatus] ?? statusMap.saved;

  // Extracts initials (e.g., "John Doe" -> "JD")
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Generates a consistent background color based on the username string
  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 40%)`; // Dark, readable colors that fit the minimal theme
  };

  return (
    <>
      <style>{`
        /* ── Reset & shell ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdf8f8; font-family: Inter, sans-serif; }

        /* ── Quill toolbar ── */
        .ql-toolbar.ql-snow {
          border: none !important;
          padding: 8px 20px !important;
          background: transparent;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2px;
        }
        .ql-toolbar.ql-snow .ql-formats { margin-right: 8px; }
        .ql-toolbar.ql-snow .ql-stroke  { stroke: #8b4a50 !important; transition: stroke .15s; }
        .ql-toolbar.ql-snow .ql-fill    { fill:  #8b4a50 !important; transition: fill  .15s; }
        .ql-toolbar.ql-snow button:hover .ql-stroke,
        .ql-toolbar.ql-snow button.ql-active .ql-stroke { stroke: #c41230 !important; }
        .ql-toolbar.ql-snow button:hover .ql-fill,
        .ql-toolbar.ql-snow button.ql-active .ql-fill   { fill:  #c41230 !important; }
        .ql-toolbar.ql-snow .ql-picker-label { color: #8b4a50 !important; border: none !important; }
        .ql-toolbar.ql-snow .ql-picker-label:hover { color: #c41230 !important; }
        .ql-toolbar.ql-snow .ql-picker-options {
          background: #fff !important;
          border: 1px solid #f0d0d4 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(107,15,26,.12) !important;
          padding: 4px !important;
        }
        .ql-toolbar.ql-snow .ql-picker-item:hover { color: #c41230 !important; }

        /* ── Quill container ── */
        .ql-container.ql-snow {
          border: none !important;
          font-family: "Georgia", "Times New Roman", serif;
          font-size: 16.5px;
          flex: 1;
        }

        /* ── Editor content ── */
        .ql-editor {
          padding: 56px 72px 80px !important;
          min-height: 70vh;
          line-height: 1.9;
          color: #2a0a0f;
          caret-color: #c41230;
        }
        @media (max-width: 640px) {
          .ql-editor { padding: 32px 24px 60px !important; }
        }
        .ql-editor.ql-blank::before {
          color: #d4a8ae !important;
          font-style: italic;
          left: 72px !important;
        }
        .ql-editor ::selection { background: rgba(196,18,48,.10); }
        .ql-editor h1 { font-size: 2rem;   font-weight: 700; color: #1a0508; margin-bottom: .4em; line-height: 1.25; }
        .ql-editor h2 { font-size: 1.5rem; font-weight: 600; color: #2a0a0f; margin-bottom: .3em; }
        .ql-editor h3 { font-size: 1.2rem; font-weight: 600; color: #3d1015; margin-bottom: .25em; }
        .ql-editor p  { margin-bottom: .55em; }
        .ql-editor a  { color: #c41230; }
        .ql-editor blockquote {
          border-left: 3px solid #c41230 !important;
          background: #fff5f6;
          padding: 12px 20px !important;
          margin: 16px 0 !important;
          border-radius: 0 8px 8px 0;
          color: #6b0f1a;
          font-style: italic;
        }
        .ql-editor pre.ql-syntax {
          background: #1e0a0f !important;
          color: #f5c0c8 !important;
          border-radius: 10px;
          padding: 16px 20px !important;
          font-size: 13.5px;
        }
        .ql-editor code {
          background: #fff0f2;
          color: #8b1a1a;
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 14px;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #f0d0d4; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #c41230; }

        /* ── Pulse animation ── */
        @keyframes kp-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .kp-pulse { animation: kp-pulse 1.2s ease-in-out infinite; }

        /* ── Title input ── */
        .doc-title-input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-family: Inter, sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 700;
          color: #1a0508;
          letter-spacing: -0.03em;
          line-height: 1.15;
          caret-color: #c41230;
        }
        .doc-title-input::placeholder { color: #d4a8ae; }

        /* ── Toolbar divider ── */
        .ql-formats + .ql-formats { border-left: 1px solid #f0d0d4; padding-left: 8px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#fdf8f8",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ════════════════════════════════════════
            TOP NAV BAR — minimal: back, logo, status, share
        ════════════════════════════════════════ */}
        <header
          style={{
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(253,248,248,0.94)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #f0d0d4",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleBack}
              aria-label="Back to dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#8b4a50",
                fontSize: "13px",
                fontWeight: 500,
                padding: "6px 10px",
                borderRadius: "8px",
                transition: "background .15s, color .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff0f2";
                e.currentTarget.style.color = "#c41230";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8b4a50";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Knotpad
            </button>

            <span
              style={{ color: "#f0d0d4", fontSize: "16px", userSelect: "none" }}
            >
              ·
            </span>

            {/* Breadcrumb title (short, truncated) */}
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#c4a0a5",
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title || "Untitled"}
            </span>
          </div>

          {/* Center — save status */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              className={saveStatus === "saving" ? "kp-pulse" : ""}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: st.dot,
                display: "inline-block",
              }}
            />
            <span
              style={{ fontSize: "12px", color: "#c4a0a5", fontWeight: 500 }}
            >
              {st.label}
            </span>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Word count chip */}
            <span
              style={{
                fontSize: "11px",
                color: "#c4a0a5",
                fontWeight: 500,
                background: "#fff5f6",
                border: "1px solid #f0d0d4",
                padding: "4px 10px",
                borderRadius: "99px",
              }}
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {activeUsers.map((user) => (
                <div
                  key={user.socketId}
                  title={user.name} // Shows full name on hover
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: getAvatarColor(user.name),
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    boxShadow: "0 0 0 2px #fff", // Clean white border separation
                  }}
                >
                  {getInitials(user.name)}
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg,#c41230 0%,#6b0f1a 100%)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                padding: "7px 16px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(107,15,26,.28)",
                transition: "box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(107,15,26,.42)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 10px rgba(107,15,26,.28)";
              }}
            >
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
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
              Share
            </button>

            {/* Active collaborators */}
          </div>
        </header>

        {/* ════════════════════════════════════════
            EDITOR AREA — title + toolbar + paper
        ════════════════════════════════════════ */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 24px 80px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "760px" }}>
            {/* ── Document title (above the paper) ── */}
            <div style={{ marginBottom: "28px", paddingLeft: "4px" }}>
              <input
                className="doc-title-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Document"
                aria-label="Document title"
              />
              {/* Thin accent rule below title */}
              <div
                style={{
                  marginTop: "12px",
                  height: "2px",
                  width: "48px",
                  background: "linear-gradient(90deg,#c41230,#8b1a1a)",
                  borderRadius: "99px",
                }}
                aria-hidden="true"
              />
            </div>

            {/* ── Paper card — toolbar + editor ── */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #f0d0d4",
                borderRadius: "16px",
                boxShadow:
                  "0 8px 40px rgba(107,15,26,.08), 0 1px 4px rgba(107,15,26,.04)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Toolbar strip — themed maroon line on top */}
              <div
                style={{
                  borderBottom: "1px solid #f5e8ea",
                  background: "#fffafb",
                  position: "sticky",
                  top: "52px",
                  zIndex: 20,
                }}
              >
                {/* Quill injects .ql-toolbar here via wrapperRef */}
              </div>

              {/* Quill mounts here — toolbar + editor combined */}
              <div
                ref={wrapperRef}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              />
            </div>

            {/* ── Footer meta ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "16px",
                padding: "0 4px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#d4b8bc" }}>
                Knotpad · Auto-saves every {SAVE_INTERVAL_MS / 1000}s
              </span>
              <span style={{ fontSize: "11px", color: "#d4b8bc" }}>
                {wordCount} words
              </span>
            </div>
          </div>
        </main>

        {/* ════════════════════════════════════════
            SHARE MODAL
        ════════════════════════════════════════ */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(42,10,15,.48)",
              backdropFilter: "blur(5px)",
              padding: "16px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "380px",
                background: "#ffffff",
                border: "1.5px solid #f0d0d4",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 28px 72px rgba(107,15,26,.20)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#2a0a0f",
                      marginBottom: "4px",
                    }}
                  >
                    Share document
                  </h3>
                  <p style={{ fontSize: "12px", color: "#c4a0a5" }}>
                    Invite a collaborator by email
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "#fff5f6",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b4a50",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fde8ea";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff5f6";
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Feedback */}
              {inviteMsg.text && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                    ...(inviteMsg.type === "success"
                      ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
                      : { background: "#fff0f2", border: "1px solid #f5c0c8" }),
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    {inviteMsg.type === "success" ? (
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <>
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
                      </>
                    )}
                  </svg>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color:
                        inviteMsg.type === "success" ? "#16a34a" : "#8b1a1a",
                    }}
                  >
                    {inviteMsg.text}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleInvite} noValidate>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#5a1520",
                    marginBottom: "6px",
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    background: "#fff5f6",
                    border: "1.5px solid #f0d0d4",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#2a0a0f",
                    outline: "none",
                    marginBottom: "20px",
                    fontFamily: "Inter, sans-serif",
                    transition: "border .15s, box-shadow .15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1.5px solid #c41230";
                    e.target.style.boxShadow = "0 0 0 3px rgba(196,18,48,.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1.5px solid #f0d0d4";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "12px",
                      background: "#fff5f6",
                      border: "1px solid #f0d0d4",
                      color: "#8b4a50",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fde8ea";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff5f6";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg,#c41230 0%,#6b0f1a 100%)",
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(107,15,26,.28)",
                      transition: "box-shadow .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(107,15,26,.42)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 10px rgba(107,15,26,.28)";
                    }}
                  >
                    Send invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Editor;
