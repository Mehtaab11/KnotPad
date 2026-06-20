// client/src/components/Editor.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { fetchAPI } from "../utils/api";
import QuillCursors from "quill-cursors";

Quill.register("modules/cursors", QuillCursors);

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
];

/* ─── Design Tokens ───────────────────────────────────────────── */
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
  /* Editor paper — slightly warmer than base so it reads as a card */
  paper: "#141414",
  paperBorder: "#222222",
};

/* ─── Cursor palette — vivid, distinct, fun to watch ─────────── */
const CURSOR_PALETTE = [
  { bg: "#9B8EC4", label: "Lavender" },
  { bg: "#5BBFB5", label: "Teal" },
  { bg: "#E07850", label: "Coral" },
  { bg: "#C4D480", label: "Lime" },
  { bg: "#7EB8D4", label: "Sky" },
  { bg: "#D4A07E", label: "Sand" },
  { bg: "#E8C547", label: "Yellow" },
  { bg: "#C47EB8", label: "Mauve" },
];

const getCursorColor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return CURSOR_PALETTE[Math.abs(h) % CURSOR_PALETTE.length].bg;
};

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

/* ─── LogoMark ────────────────────────────────────────────────── */
const LogoMark = () => (
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

const Editor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();

  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const titleDebounce = useRef(null);

  const [quillReady, setQuillReady] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState({ type: "", text: "" });
  const [wordCount, setWordCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);

  /* ── 1. Quill init ─────────────────────────────────────────── */
  const wrapperRef = useCallback((wrapper) => {
    if (!wrapper || quillRef.current) return;
    wrapper.innerHTML = "";
    const editorDiv = document.createElement("div");
    wrapper.append(editorDiv);
    const q = new Quill(editorDiv, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: {
          transformOnTextChange: true, // keeps remote cursors glued as text shifts
        },
      },
      placeholder: "Start writing…",
    });
    q.disable();
    quillRef.current = q;
    setQuillReady(true);
  }, []);

  /* ── 2. Fetch title ────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const doc = await fetchAPI(`/documents/${documentId}`);
        setTitle(doc.title ?? "Untitled Document");
      } catch (e) {
        console.error("title fetch", e);
      }
    };
    load();
  }, [documentId]);

  /* ── 3. Socket ─────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { auth: { token } });
    s.on("connect", () => setSocketReady(true));
    s.on("connect_error", (err) => console.error("socket:", err.message));
    s.on("presence-updates", setActiveUsers);
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

  /* ── 4. Load document content ──────────────────────────────── */
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current,
      s = socketRef.current;
    if (!q || !s) return;
    const onLoad = (content) => {
      q.setContents(content?.ops?.length ? content : [{ insert: "\n" }]);
      q.enable();
      q.focus();
      setSaveStatus("saved");
      setWordCount(q.getText().trim().split(/\s+/).filter(Boolean).length);
    };
    s.once("load-document", onLoad);
    s.emit("get-document", documentId);
    return () => s.off("load-document", onLoad);
  }, [quillReady, socketReady, documentId]);

  /* ── 5. Send changes ───────────────────────────────────────── */
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current,
      s = socketRef.current;
    const onTextChange = (delta, _old, source) => {
      if (source !== "user") return;
      setSaveStatus("saving");
      s.emit("send-changes", delta);
      const sel = q.getSelection();
      if (sel) s.emit("send-cursor", sel);
      setWordCount(q.getText().trim().split(/\s+/).filter(Boolean).length);
    };
    q.on("text-change", onTextChange);
    return () => q.off("text-change", onTextChange);
  }, [quillReady, socketReady]);

  /* ── 6. Receive changes ────────────────────────────────────── */
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current,
      s = socketRef.current;
    const onReceive = (delta) => q.updateContents(delta);
    s.on("receive-changes", onReceive);
    return () => s.off("receive-changes", onReceive);
  }, [quillReady, socketReady]);

  /* ── 7. Send selection / cursor ────────────────────────────── */
  useEffect(() => {
    if (!socketReady || !quillReady) return;
    const q = quillRef.current,
      s = socketRef.current;
    const handler = (range, _old, source) => {
      if (source === "user") s.emit("send-cursor", range);
    };
    q.on("selection-change", handler);
    return () => q.off("selection-change", handler);
  }, [socketReady, quillReady]);

  /* ── 8. Receive remote cursors ─────────────────────────────── */
  useEffect(() => {
    if (!socketReady || !quillReady) return;
    const s = socketRef.current,
      q = quillRef.current;
    const cursors = q.getModule("cursors");
    const handler = ({ userId, name, range }) => {
      const color = getCursorColor(name);
      if (!cursors.cursors()[userId]) {
        cursors.createCursor(userId, name, color);
      }
      range ? cursors.moveCursor(userId, range) : cursors.removeCursor(userId);
    };
    s.on("receive-cursor", handler);
    return () => s.off("receive-cursor", handler);
  }, [socketReady, quillReady]);

  /* ── 9. Auto-save ──────────────────────────────────────────── */
  useEffect(() => {
    if (!quillReady || !socketReady) return;
    const q = quillRef.current,
      s = socketRef.current;
    const interval = setInterval(() => {
      s.emit("save-changes", q.getContents());
      setSaveStatus((p) => (p === "saving" ? "saved" : p));
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [quillReady, socketReady]);

  /* ── Actions ───────────────────────────────────────────────── */
  const handleBack = () => {
    const q = quillRef.current,
      s = socketRef.current;
    if (q && s) s.emit("save-changes", q.getContents());
    navigate("/dashboard");
  };

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

  const saveMap = {
    saved: { label: "Saved", color: "#5BBFB5" },
    saving: { label: "Saving…", color: "#E8C547" },
    error: { label: "Save failed", color: T.accent },
  };
  const st = saveMap[saveStatus] ?? saveMap.saved;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap"
        rel="stylesheet"
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Quill toolbar ── */
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid ${T.borderDim} !important;
          padding: 10px 20px !important;
          background: ${T.bgSurface};
          display: flex; flex-wrap: wrap; align-items: center; gap: 2px;
        }
        .ql-toolbar.ql-snow .ql-formats { margin-right: 8px; }
        .ql-toolbar.ql-snow .ql-stroke  { stroke: ${T.textDim} !important; transition: stroke .15s; }
        .ql-toolbar.ql-snow .ql-fill    { fill:  ${T.textDim} !important; transition: fill .15s;   }
        .ql-toolbar.ql-snow button:hover .ql-stroke,
        .ql-toolbar.ql-snow button.ql-active .ql-stroke { stroke: ${T.accent} !important; }
        .ql-toolbar.ql-snow button:hover .ql-fill,
        .ql-toolbar.ql-snow button.ql-active .ql-fill   { fill:  ${T.accent} !important; }
        .ql-toolbar.ql-snow .ql-picker-label             { color: ${T.textDim} !important; border: none !important; }
        .ql-toolbar.ql-snow .ql-picker-label:hover       { color: ${T.accent}  !important; }
        .ql-toolbar.ql-snow .ql-picker-label .ql-stroke  { stroke: ${T.textDim} !important; }
        .ql-toolbar.ql-snow .ql-picker-options {
          background: ${T.bgSurface} !important;
          border: 1px solid ${T.borderChip} !important;
          border-radius: 10px !important;
          box-shadow: 0 12px 32px rgba(0,0,0,0.40) !important;
          padding: 4px !important;
        }
        .ql-toolbar.ql-snow .ql-picker-item { color: ${T.textSec} !important; }
        .ql-toolbar.ql-snow .ql-picker-item:hover { color: ${T.accent} !important; }
        .ql-toolbar.ql-snow .ql-formats + .ql-formats {
          border-left: 1px solid ${T.borderDim};
          padding-left: 8px;
        }

        /* ── Quill container ── */
        .ql-container.ql-snow {
          border: none !important;
          font-family: "Lora", Georgia, "Times New Roman", serif;
          font-size: 17px;
          flex: 1;
          background: ${T.paper};
        }

        /* ── Editor content ── */
        .ql-editor {
          padding: 60px 80px 100px !important;
          min-height: 72vh;
          line-height: 1.95;
          color: #D8D0C8;
          caret-color: ${T.accent};
        }
        @media (max-width: 640px) {
          .ql-editor { padding: 32px 24px 60px !important; }
        }
        .ql-editor.ql-blank::before {
          color: ${T.textDim} !important;
          font-style: italic;
          left: 80px !important;
        }
        .ql-editor ::selection { background: rgba(200,16,46,0.18); }

        .ql-editor h1 { font-family: 'Space Mono', monospace; font-size: 2rem; font-weight: 700; color: ${T.textPrimary}; margin-bottom: .4em; line-height: 1.2; letter-spacing: -0.04em; }
        .ql-editor h2 { font-family: 'Space Mono', monospace; font-size: 1.45rem; font-weight: 700; color: ${T.textPrimary}; margin-bottom: .3em; letter-spacing: -0.03em; }
        .ql-editor h3 { font-size: 1.2rem; font-weight: 600; color: #C8C0B8; margin-bottom: .25em; }
        .ql-editor p  { margin-bottom: .6em; }
        .ql-editor a  { color: ${T.accent}; }

        .ql-editor blockquote {
          border-left: 3px solid ${T.accent} !important;
          background: rgba(200,16,46,0.05);
          padding: 14px 22px !important;
          margin: 18px 0 !important;
          border-radius: 0 10px 10px 0;
          color: #A89888;
          font-style: italic;
        }
        .ql-editor pre.ql-syntax {
          background: #0A0A0A !important;
          color: #A8D4A0 !important;
          border: 1px solid ${T.borderDim};
          border-radius: 10px;
          padding: 18px 22px !important;
          font-size: 13px;
          font-family: 'Space Mono', monospace;
        }
        .ql-editor code {
          background: rgba(200,16,46,0.10);
          color: #E07878;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 14px;
          font-family: 'Space Mono', monospace;
        }
        .ql-editor li { color: #C0B8B0; }
        .ql-editor .ql-indent-1 { padding-left: 2em; }

        /* ── Remote cursor labels — the fun part ── */
        .ql-cursor-name {
          font-family: 'Inter', sans-serif !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 2px 8px !important;
          border-radius: 0 6px 6px 6px !important;
          white-space: nowrap !important;
          letter-spacing: 0.02em !important;
          opacity: 1 !important;
          top: -22px !important;
        }
        .ql-cursor-caret {
          width: 2px !important;
        }
        .ql-cursor-flag {
          bottom: unset !important;
          top: 0 !important;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.borderChip}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.accent}; }

        /* ── Pulse ── */
        @keyframes kp-pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
        .kp-pulse { animation: kp-pulse 1.1s ease-in-out infinite; }

        /* ── Cursor avatar pulse on join ── */
        @keyframes avatar-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .avatar-pop { animation: avatar-pop 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }

        /* ── Title input ── */
        .doc-title-input {
          background: transparent; border: none; outline: none;
          width: 100%;
          font-family: 'Space Mono', monospace;
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 700; color: ${T.textPrimary};
          letter-spacing: -0.04em; line-height: 1.15;
          caret-color: ${T.accent};
        }
        .doc-title-input::placeholder { color: ${T.textDim}; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: T.bgBase,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ══ TOP NAV ═══════════════════════════════════════════ */}
        <header
          style={{
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "rgba(15,15,15,0.92)",
            backdropFilter: "blur(14px)",
            borderBottom: `1px solid ${T.borderDim}`,
            position: "sticky",
            top: 0,
            zIndex: 30,
            gap: "12px",
          }}
        >
          {/* Left — back + breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <button
              onClick={handleBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: T.bgSurface,
                border: `1px solid ${T.borderDim}`,
                borderRadius: "9px",
                padding: "6px 12px",
                color: T.textSec,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 150ms, color 150ms",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.accent;
                e.currentTarget.style.color = T.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.borderDim;
                e.currentTarget.style.color = T.textSec;
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogoMark />
              </div>
              Knotpad
            </button>

            <span
              style={{
                color: T.borderChip,
                fontSize: "14px",
                userSelect: "none",
              }}
            >
              ›
            </span>

            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "12px",
                fontWeight: 700,
                color: T.textSec,
                maxWidth: "160px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title || "Untitled"}
            </span>
          </div>

          {/* Centre — save status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              flexShrink: 0,
            }}
          >
            <span
              className={saveStatus === "saving" ? "kp-pulse" : ""}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: st.color,
                display: "inline-block",
                transition: "background 300ms",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: T.textDim,
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              {st.label}
            </span>
          </div>

          {/* Right — words · avatars · share */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {/* Word count */}
            <span
              style={{
                fontSize: "11px",
                color: T.textDim,
                background: T.bgSurface,
                border: `1px solid ${T.borderDim}`,
                padding: "4px 10px",
                borderRadius: "99px",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {wordCount}
              {wordCount === 1 || wordCount === 0 ? " word " : " words"}
            </span>

            {/* ── Active user avatars ── */}
            {activeUsers.length > 0 && (
              <div style={{ display: "flex", alignItems: "center" }}>
                {activeUsers.map((user, i) => {
                  const color = getCursorColor(user.name);
                  return (
                    <div
                      key={user.socketId}
                      className="avatar-pop"
                      title={user.name}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: color,
                        border: `2px solid ${T.bgBase}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "rgba(0,0,0,0.65)",
                        fontFamily: "'Space Mono', monospace",
                        marginLeft: i === 0 ? 0 : "-8px",
                        zIndex: activeUsers.length - i,
                        position: "relative",
                        cursor: "default",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                  );
                })}
                {/* Live indicator */}
                <div
                  style={{
                    marginLeft: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(91,191,181,0.10)",
                    border: "1px solid rgba(91,191,181,0.22)",
                    borderRadius: "99px",
                    padding: "3px 9px",
                  }}
                >
                  <span
                    className="kp-pulse"
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#5BBFB5",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#5BBFB5",
                      fontWeight: 600,
                    }}
                  >
                    {activeUsers.length} live
                  </span>
                </div>
              </div>
            )}

            {/* Share button */}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: T.accent,
                color: "#fff",
                border: "none",
                borderRadius: "9px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 150ms",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = T.accentHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = T.accent)
              }
            >
              <svg
                width="12"
                height="12"
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
          </div>
        </header>

        {/* ══ EDITOR AREA ═══════════════════════════════════════ */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "44px 24px 80px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "780px" }}>
            {/* Document title */}
            <div style={{ marginBottom: "24px", paddingLeft: "2px" }}>
              <input
                className="doc-title-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Document"
                aria-label="Document title"
              />
              <div
                aria-hidden="true"
                style={{
                  marginTop: "10px",
                  height: "2px",
                  width: "40px",
                  background: T.accent,
                  borderRadius: "99px",
                }}
              />
            </div>

            {/* Paper card */}
            <div
              style={{
                background: T.paper,
                border: `1px solid ${T.paperBorder}`,
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Quill mounts here — toolbar + editor */}
              <div
                ref={wrapperRef}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              />
            </div>

            {/* Footer meta */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "14px",
                padding: "0 2px",
              }}
            >
              <span style={{ fontSize: "10px", color: T.textDim }}>
                Knotpad · auto-saves every {SAVE_INTERVAL_MS / 1000}s
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "10px",
                  color: T.textDim,
                }}
              >
                {wordCount} words
              </span>
            </div>
          </div>
        </main>

        {/* ══ SHARE MODAL ═══════════════════════════════════════ */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.70)",
              backdropFilter: "blur(6px)",
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
                background: T.bgSurface,
                border: `1px solid ${T.borderChip}`,
                borderRadius: "20px",
                padding: "28px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: T.textDim,
                      marginBottom: "6px",
                      lineHeight: 1,
                    }}
                  >
                    Collaboration
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: T.textPrimary,
                      letterSpacing: "-0.3px",
                      marginBottom: "4px",
                    }}
                  >
                    Share document
                  </h3>
                  <p style={{ fontSize: "12px", color: T.textSec }}>
                    Invite a collaborator by email
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: T.bgRaised,
                    border: `1px solid ${T.borderDim}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: T.textSec,
                    transition: "border-color 150ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = T.accent)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = T.borderDim)
                  }
                  aria-label="Close"
                >
                  <svg
                    width="11"
                    height="11"
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

              {/* Currently online */}
              {activeUsers.length > 0 && (
                <div
                  style={{
                    background: T.bgRaised,
                    border: `1px solid ${T.borderDim}`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: T.textDim,
                      marginBottom: "10px",
                      lineHeight: 1,
                    }}
                  >
                    Currently editing
                  </p>
                  {activeUsers.map((user) => {
                    const color = getCursorColor(user.name);
                    return (
                      <div
                        key={user.socketId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "9px",
                            fontWeight: 700,
                            color: "rgba(0,0,0,0.65)",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flex: 1,
                          }}
                        >
                          <span style={{ fontSize: "12px", color: T.textSec }}>
                            {user.name}
                          </span>
                          <span
                            className="kp-pulse"
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: color,
                              display: "inline-block",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feedback */}
              {inviteMsg.text && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    marginBottom: "14px",
                    background:
                      inviteMsg.type === "success"
                        ? "rgba(91,191,181,0.10)"
                        : "rgba(200,16,46,0.08)",
                    border: `1px solid ${inviteMsg.type === "success" ? "rgba(91,191,181,0.25)" : "rgba(200,16,46,0.22)"}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color:
                        inviteMsg.type === "success" ? "#5BBFB5" : "#E07070",
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
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.textDim,
                    marginBottom: "8px",
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
                    padding: "12px 16px",
                    background: T.bgInput,
                    border: `1px solid ${T.borderDim}`,
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: T.textPrimary,
                    outline: "none",
                    marginBottom: "16px",
                    fontFamily: "'Inter', sans-serif",
                    transition: "border 150ms, box-shadow 150ms",
                    caretColor: T.accent,
                  }}
                  onFocus={(e) => {
                    e.target.style.border = `1px solid ${T.accent}`;
                    e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.border = `1px solid ${T.borderDim}`;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      background: T.bgRaised,
                      border: `1px solid ${T.borderChip}`,
                      color: T.textSec,
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                      cursor: "pointer",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = T.borderDim)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = T.bgRaised)
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      background: T.accent,
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      cursor: "pointer",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = T.accentHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = T.accent)
                    }
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
