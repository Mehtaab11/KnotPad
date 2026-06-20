import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAPI } from "../utils/api.js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

/* ─── Design Tokens ──────────────────────────────────────────────
   Based on Behance "Notes potepad and lists" by Vera Vasileva
   Adapted with Knotpad's crimson identity (#C8102E)
   Signature: Space Mono monospace for all display text
─────────────────────────────────────────────────────────────────── */
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

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await fetchAPI("/user/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      setAuth(true);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  const onFocus = (e) => {
    e.target.style.border = `1px solid ${T.accent}`;
    e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}`;
  };
  const onBlur = (e) => {
    e.target.style.border = `1px solid ${T.borderDim}`;
    e.target.style.boxShadow = "none";
  };

  return (
    <>
      {/* Google Fonts — Space Mono for display, Inter for UI */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          minHeight: "100vh",
          background: T.bgBase,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            display: "flex",
            borderRadius: "20px",
            overflow: "hidden",
            border: `1px solid ${T.borderDim}`,
          }}
        >
          {/* ── LEFT PANEL ─────────────────────────────────────────── */}
          <div
            className="hidden md:flex"
            style={{
              width: "44%",
              background: T.bgSurface,
              padding: "52px 44px",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRight: `1px solid ${T.borderDim}`,
            }}
          >
            {/* Top */}
            <div>
              {/* Logo mark */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "60px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "9px",
                    background: T.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="6"
                      height="6"
                      rx="1.5"
                      fill="white"
                    />
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
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: T.textDim,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Knotpad
                </span>
              </div>

              {/* Hero headline — Space Mono, the design's signature */}
              <h2
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "34px",
                  fontWeight: 700,
                  color: T.textPrimary,
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                  marginBottom: "20px",
                }}
              >
                Welcome
                <br />
                back.
              </h2>

              <div
                aria-hidden="true"
                style={{
                  width: "28px",
                  height: "2px",
                  background: T.accent,
                  borderRadius: "2px",
                  marginBottom: "20px",
                }}
              />

              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: T.textSec,
                  maxWidth: "210px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Your notes are safe and waiting. Log in to pick up where you
                left off.
              </p>
            </div>

            {/* Bottom — folder-style feature list (mirrors the Behance folder rows) */}
            <div>
              

              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: T.textDim,
                  marginTop: "28px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Knotpad · v2.0
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL ────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              background: T.bgBase,
              padding: "52px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Mobile logo */}
            <div
              className="flex md:hidden"
              style={{ alignItems: "center", gap: "8px", marginBottom: "36px" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="4"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="white"
                  />
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
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: T.textDim,
                }}
              >
                Knotpad
              </span>
            </div>

            {/* Section label — exactly like "FIXED" / "LABELS" in Behance */}
            <p
              style={{
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: T.textDim,
                marginBottom: "12px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Account
            </p>

            {/* Display heading — Space Mono */}
            <h1
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "-0.4px",
                color: T.textPrimary,
                marginBottom: "6px",
                lineHeight: 1.2,
              }}
            >
              Log in
            </h1>

            <div
              aria-hidden="true"
              style={{
                width: "24px",
                height: "2px",
                background: T.accent,
                borderRadius: "2px",
                marginBottom: "36px",
              }}
            />

            {/* Error */}
            <div role="alert" aria-live="polite">
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    background: "rgba(200,16,46,0.08)",
                    border: "1px solid rgba(200,16,46,0.20)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "24px",
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
                    style={{
                      fontSize: "13px",
                      color: "#E07070",
                      lineHeight: 1.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Form */}
            <form
              onSubmit={handleLogin}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.textDim,
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  style={{ ...inputStyle, opacity: isLoading ? 0.5 : 1 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.textDim,
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    style={{
                      ...inputStyle,
                      paddingRight: "48px",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.textDim,
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = T.textSec)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = T.textDim)
                    }
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={18} />
                    ) : (
                      <AiOutlineEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div style={{ paddingTop: "4px" }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    background: T.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    fontFamily: "'Inter', sans-serif",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.55 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background 150ms ease, transform 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading)
                      e.currentTarget.style.background = T.accentHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.accent;
                  }}
                  onMouseDown={(e) => {
                    if (!isLoading)
                      e.currentTarget.style.transform = "scale(0.985)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin"
                        style={{ width: "14px", height: "14px", opacity: 0.8 }}
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
                      Signing in…
                    </>
                  ) : (
                    <>
                      Continue
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
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
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Register link */}
            <p
              style={{
                fontSize: "13px",
                color: T.textDim,
                marginTop: "28px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: T.accent,
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = T.accentHover)
                }
                onMouseLeave={(e) => (e.currentTarget.style.color = T.accent)}
              >
                Create account
              </Link>
            </p>

            {/* Footer */}
            <p
              style={{
                fontSize: "11px",
                color: "#2A2A2A",
                marginTop: "36px",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              © 2026 Knotpad · Mehtaab. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
