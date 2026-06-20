// client/src/components/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAPI } from "../utils/api";

/* ─── Design Tokens ───────────────────────────────────────────── */
const T = {
  bgBase:      "#0F0F0F",
  bgSurface:   "#171717",
  bgRaised:    "#1E1C1C",
  bgInput:     "#1A1A1A",
  borderDim:   "#252525",
  borderChip:  "#2E2E2E",
  textPrimary: "#EDEDED",
  textSec:     "#888888",
  textDim:     "#444444",
  accent:      "#C8102E",
  accentHover: "#E01030",
  accentGlow:  "rgba(200,16,46,0.11)",
};

const AVATAR_COLORS = ["#9B8EC4","#5BBFB5","#A8D4A0","#C4D480","#E07850","#7EB8D4","#D4A07E"];
const nameToColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 65) % AVATAR_COLORS.length];
const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

/* Icons */
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const LogoMark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="6" height="6" rx="1.5" fill="white" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" fill="white" opacity="0.45" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" fill="white" opacity="0.45" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" fill="white" />
  </svg>
);

/* ── Stat pill ── */
const StatCard = ({ label, value, sub }) => (
  <div style={{
    flex: 1, background: T.bgRaised, borderRadius: "12px",
    border: `1px solid ${T.borderDim}`, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: "4px",
  }}>
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "22px", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.5px" }}>
      {value}
    </span>
    <span style={{ fontSize: "11px", color: T.textDim, letterSpacing: "0.02em" }}>{label}</span>
    {sub && <span style={{ fontSize: "10px", color: T.accent, marginTop: "2px" }}>{sub}</span>}
  </div>
);

/* ── Info row ── */
const InfoRow = ({ icon, label, value, locked }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "14px",
    padding: "16px 0", borderBottom: `1px solid ${T.borderDim}`,
  }}>
    <div style={{
      width: "34px", height: "34px", borderRadius: "9px",
      background: T.bgRaised, border: `1px solid ${T.borderDim}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, color: T.textDim,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: "3px" }}>{label}</p>
      <p style={{ fontSize: "13px", color: T.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
    </div>
    {locked && (
      <span style={{ fontSize: "10px", color: T.textDim, background: T.bgRaised, border: `1px solid ${T.borderDim}`, borderRadius: "6px", padding: "3px 8px", flexShrink: 0 }}>
        locked
      </span>
    )}
  </div>
);

const Profile = ({ setAuth }) => {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [joinedAt, setJoinedAt]   = useState("");
  const [docCount, setDocCount]   = useState("—");
  const [status, setStatus]       = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAPI("/user/profile");
        setName(data.name || "");
        setNameInput(data.name || "");
        setEmail(data.email || "");
        if (data.createdAt) setJoinedAt(new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }));
      } catch (err) {
        setStatus({ type: "error", text: "Failed to load profile." });
        if (err.message.includes("Authentication") || err.message.includes("token")) handleLogout();
      }
      // try to get doc count
      try {
        const docs = await fetchAPI("/documents");
        setDocCount(docs.length);
      } catch {/* silent */}
    };
    load();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "info", text: "Saving..." });
    try {
      await fetchAPI("/user/profile", { method: "PUT", body: JSON.stringify({ name: nameInput }) });
      setName(nameInput);
      setEditingName(false);
      setStatus({ type: "success", text: "Name updated successfully." });
      setTimeout(() => setStatus({ type: "", text: "" }), 3000);
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Failed to update." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    navigate("/login");
  };

  const avatarColor = nameToColor(name);
  const memberSince = joinedAt || "—";

  const inputStyle = {
    width: "100%",
    background: T.bgInput,
    border: `1px solid ${T.borderDim}`,
    color: T.textPrimary,
    borderRadius: "12px",
    padding: "13px 16px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border 150ms ease, box-shadow 150ms ease",
    caretColor: T.accent,
    boxSizing: "border-box",
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: T.bgBase, fontFamily: "'Inter', sans-serif", color: T.textPrimary }}>

        {/* ── TOP NAV ── */}
        <header style={{
          height: "58px", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 32px",
          background: "rgba(15,15,15,0.88)", backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.borderDim}`,
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: T.textSec, fontSize: "13px", fontFamily: "'Inter', sans-serif",
              transition: "color 150ms ease", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.textPrimary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textSec)}
          >
            <IconBack /> Dashboard
          </button>

          {/* Logo centre */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogoMark />
            </div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color: T.textPrimary }}>Knotpad</span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: "none", border: "none", cursor: "pointer",
              color: T.textDim, fontSize: "13px", fontFamily: "'Inter', sans-serif",
              transition: "color 150ms ease", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textDim)}
          >
            <IconLogout /> Sign out
          </button>
        </header>

        {/* ── BODY ── */}
        <main style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* ── PROFILE HERO ── */}
          <div style={{
            background: T.bgSurface,
            borderRadius: "20px",
            border: `1px solid ${T.borderDim}`,
            overflow: "hidden",
            marginBottom: "16px",
          }}>
            {/* Banner strip */}
            <div style={{
              height: "90px",
              background: `linear-gradient(135deg, ${avatarColor}22 0%, rgba(200,16,46,0.08) 100%)`,
              borderBottom: `1px solid ${T.borderDim}`,
              position: "relative",
            }}>
              {/* Decorative circles */}
              <div aria-hidden="true" style={{ position: "absolute", top: "-20px", right: "40px", width: "100px", height: "100px", borderRadius: "50%", background: `${avatarColor}18`, filter: "blur(20px)" }} />
              <div aria-hidden="true" style={{ position: "absolute", bottom: "-10px", left: "60px", width: "60px", height: "60px", borderRadius: "50%", background: "rgba(200,16,46,0.10)", filter: "blur(16px)" }} />
            </div>

            {/* Avatar + name */}
            <div style={{ padding: "0 32px 28px" }}>
              {/* Avatar — floats over the banner */}
              <div style={{ marginTop: "-36px", marginBottom: "16px" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: avatarColor,
                  border: `3px solid ${T.bgSurface}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 0 1px ${T.borderDim}`,
                }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "22px", fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>
                    {initials(name)}
                  </span>
                </div>
              </div>

              {/* Name + email */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: "20px", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.4px", marginBottom: "4px" }}>
                    {name || "—"}
                  </h1>
                  <p style={{ fontSize: "13px", color: T.textSec }}>{email}</p>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "rgba(200,16,46,0.08)", border: "1px solid rgba(200,16,46,0.18)",
                  borderRadius: "20px", padding: "5px 12px",
                  fontSize: "11px", color: T.accent, flexShrink: 0,
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.accent }} />
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <StatCard label="Documents" value={docCount} sub={docCount !== "—" && docCount > 0 ? "in your library" : null} />
            <StatCard label="Member since" value={memberSince.split(" ")[0]} sub={memberSince.split(" ")[1]} />
            <StatCard label="Plan" value="Free" sub="Knotpad v2.0" />
          </div>

          {/* ── ACCOUNT INFO ── */}
          <div style={{
            background: T.bgSurface, borderRadius: "16px",
            border: `1px solid ${T.borderDim}`, padding: "8px 24px",
            marginBottom: "16px",
          }}>
            <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textDim, padding: "16px 0 4px", lineHeight: 1 }}>
              Account info
            </p>
            <InfoRow icon={<IconMail />} label="Email address" value={email || "—"} locked />
            <InfoRow icon={<IconUser />} label="Display name" value={name || "—"} />
            <div style={{ padding: "16px 0 8px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px",
                background: T.bgRaised, border: `1px solid ${T.borderDim}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: T.textDim,
              }}>
                <IconLock />
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textDim, marginBottom: "3px" }}>Password</p>
                <p style={{ fontSize: "13px", color: T.textDim }}>••••••••••••</p>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "10px", color: T.textDim, background: T.bgRaised, border: `1px solid ${T.borderDim}`, borderRadius: "6px", padding: "3px 8px" }}>
                locked
              </span>
            </div>
          </div>

          {/* ── EDIT PROFILE CARD ── */}
          <div style={{
            background: T.bgSurface, borderRadius: "16px",
            border: `1px solid ${T.borderDim}`, padding: "24px",
            marginBottom: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textDim, lineHeight: 1, marginBottom: "6px" }}>
                  Edit profile
                </p>
                <p style={{ fontSize: "12px", color: T.textSec }}>Update your display name</p>
              </div>
              {!editingName && (
                <button
                  onClick={() => setEditingName(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: T.bgRaised, border: `1px solid ${T.borderChip}`,
                    color: T.textSec, borderRadius: "9px", padding: "8px 14px",
                    fontSize: "12px", fontFamily: "'Inter', sans-serif",
                    cursor: "pointer", transition: "border-color 150ms ease, color 150ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.textPrimary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderChip; e.currentTarget.style.color = T.textSec; }}
                >
                  <IconEdit /> Edit
                </button>
              )}
            </div>

            {/* Status message */}
            {status.text && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: status.type === "error" ? "rgba(200,16,46,0.08)"
                          : status.type === "success" ? "rgba(91,191,181,0.10)" : T.bgRaised,
                border: `1px solid ${status.type === "error" ? "rgba(200,16,46,0.22)" : status.type === "success" ? "rgba(91,191,181,0.25)" : T.borderDim}`,
                borderRadius: "10px", padding: "11px 14px", marginBottom: "16px",
              }}>
                {status.type === "success" && (
                  <span style={{ color: "#5BBFB5", display: "flex" }}><IconCheck /></span>
                )}
                <p style={{ fontSize: "13px", color: status.type === "error" ? "#E07070" : status.type === "success" ? "#5BBFB5" : T.textSec }}>
                  {status.text}
                </p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name field */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim, marginBottom: "8px" }}>
                  Display name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mehtaab"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={!editingName || isLoading}
                  style={{
                    ...inputStyle,
                    opacity: !editingName ? 0.45 : 1,
                    cursor: !editingName ? "not-allowed" : "text",
                  }}
                  onFocus={(e) => { e.target.style.border = `1px solid ${T.accent}`; e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}`; }}
                  onBlur={(e) => { e.target.style.border = `1px solid ${T.borderDim}`; e.target.style.boxShadow = "none"; }}
                />
                <p style={{ fontSize: "11px", color: T.textDim, marginTop: "7px" }}>
                  Visible to collaborators in shared documents.
                </p>
              </div>

              {/* Email (read only) */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim, marginBottom: "8px" }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  style={{ ...inputStyle, opacity: 0.35, cursor: "not-allowed" }}
                />
                <p style={{ fontSize: "11px", color: T.textDim, marginTop: "7px" }}>
                  Email address cannot be changed.
                </p>
              </div>

              {/* Actions */}
              {editingName && (
                <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1, background: T.accent, color: "#fff",
                      border: "none", borderRadius: "12px",
                      padding: "13px 20px", fontSize: "13px",
                      fontWeight: 600, fontFamily: "'Inter', sans-serif",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.6 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      transition: "background 150ms ease",
                    }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = T.accentHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = T.accent; }}
                  >
                    {isLoading ? (
                      <svg className="animate-spin" style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    ) : <IconCheck />}
                    {isLoading ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingName(false); setNameInput(name); setStatus({ type: "", text: "" }); }}
                    style={{
                      background: T.bgRaised, color: T.textSec,
                      border: `1px solid ${T.borderChip}`,
                      borderRadius: "12px", padding: "13px 20px",
                      fontSize: "13px", fontFamily: "'Inter', sans-serif",
                      cursor: "pointer", transition: "background 150ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.borderDim)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = T.bgRaised)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* ── DANGER ZONE ── */}
          <div style={{
            background: T.bgSurface, borderRadius: "16px",
            border: `1px solid ${T.borderDim}`,
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.borderDim}` }}>
              <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textDim, lineHeight: 1, marginBottom: "6px" }}>
                Session
              </p>
              <p style={{ fontSize: "12px", color: T.textSec }}>Manage your active session</p>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "13px", color: T.textPrimary, fontWeight: 500, marginBottom: "4px" }}>Sign out of Knotpad</p>
                <p style={{ fontSize: "12px", color: T.textDim }}>You'll need to log back in to access your documents.</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  background: "rgba(200,16,46,0.08)", border: "1px solid rgba(200,16,46,0.20)",
                  color: T.accent, borderRadius: "10px", padding: "10px 18px",
                  fontSize: "13px", fontWeight: 500, fontFamily: "'Inter', sans-serif",
                  cursor: "pointer", flexShrink: 0,
                  transition: "background 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,16,46,0.16)"; e.currentTarget.style.borderColor = "rgba(200,16,46,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,16,46,0.08)"; e.currentTarget.style.borderColor = "rgba(200,16,46,0.20)"; }}
              >
                <IconLogout /> Sign out
              </button>
            </div>
          </div>

          {/* Footer */}
          <p style={{ fontSize: "11px", color: "#2A2A2A", marginTop: "40px", textAlign: "center", letterSpacing: "0.02em" }}>
            © 2026 Knotpad · Mehtaab. All rights reserved.
          </p>
        </main>
      </div>
    </>
  );
};

export default Profile;
