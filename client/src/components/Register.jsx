// client/src/components/Register.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAPI } from "../utils/api.js";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await fetchAPI("/user/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: "#fff5f6",
    border: "1.5px solid #f0d0d4",
    color: "#2a0a0f",
  };

  const handleFocus = (e) => {
    e.target.style.border = "1.5px solid #c41230";
    e.target.style.boxShadow = "0 0 0 3px rgba(196,18,48,0.10)";
  };

  const handleBlur = (e) => {
    e.target.style.border = "1.5px solid #f0d0d4";
    e.target.style.boxShadow = "none";
  };

  const passwordToggle = (e) => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 font-sans"
      style={{
        background:
          "linear-gradient(135deg, #f9eaea 0%, #fdf8f8 55%, #fef4f4 100%)",
      }}
    >
      <div
        className="w-full max-w-[880px] flex rounded-3xl overflow-hidden"
        style={{
          boxShadow:
            "0 32px 80px rgba(107,15,26,0.18), 0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* ── LEFT PANEL — maroon / dark red (30%) ── */}
        <div
          className="relative hidden md:flex flex-col justify-between w-[44%] overflow-hidden px-10 py-12"
          style={{
            background:
              "linear-gradient(160deg, #4a0010 0%, #6b0f1a 40%, #8b1a1a 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-14 -left-14 w-52 h-52 rounded-full"
            style={{ border: "30px solid rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          />
          <div
            className="absolute top-20 -left-4 w-16 h-16 rounded-full"
            style={{ border: "10px solid rgba(255,255,255,0.05)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full"
            style={{ border: "44px solid rgba(255,255,255,0.06)" }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-16 right-8 w-12 h-12 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 -right-6 w-20 h-20 rounded-full"
            style={{ background: "rgba(196,18,48,0.25)" }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/3 left-1/2 w-32 h-32 rounded-full"
            style={{
              background: "rgba(196,18,48,0.18)",
              filter: "blur(32px)",
              transform: "translateX(-50%)",
            }}
            aria-hidden="true"
          />

          {/* Top content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-14">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <svg
                  width="18"
                  height="18"
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
                className="text-sm font-semibold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Knotpad
              </span>
            </div>

            {/* Headline */}
            <h2
              className="text-white font-bold leading-tight tracking-tight mb-4"
              style={{ fontSize: "30px" }}
            >
              Start your
              <br />
              journey.
            </h2>

            <div
              className="w-10 h-[2.5px] rounded-full mb-5"
              style={{ background: "rgba(255,255,255,0.35)" }}
              aria-hidden="true"
            />

            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.58)", maxWidth: "210px" }}
            >
              Join thousands of people who manage their documents smarter with
              Knotpad.
            </p>
          </div>

          {/* Bottom tagline */}
          <p
            className="relative z-10 text-[11px] tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Knotpad · v2.0
          </p>
        </div>

        {/* ── RIGHT PANEL — warm white form (60%) ── */}
        <div
          className="flex-1 flex flex-col justify-center px-10 py-12 md:px-14"
          style={{ background: "#fdf8f8" }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 md:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6b0f1a, #8b1a1a)",
              }}
            >
              <svg
                width="15"
                height="15"
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
                  opacity="0.6"
                />
                <rect
                  x="4"
                  y="14"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                  opacity="0.6"
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
              className="text-sm font-semibold tracking-wide"
              style={{ color: "#6b0f1a" }}
            >
              Knotpad
            </span>
          </div>

          {/* Heading */}

          <h1
            className="font-bold tracking-tight mb-1"
            style={{ fontSize: "26px", color: "#2a0a0f" }}
          >
            Sign Up{" "}
          </h1>
          <div
            className="w-8 h-[3px] rounded-full mb-8"
            style={{ background: "linear-gradient(90deg, #c41230, #8b1a1a)" }}
            aria-hidden="true"
          />

          {/* Error */}
          <div role="alert" aria-live="polite">
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5"
                style={{ background: "#fff0f2", border: "1px solid #f5c0c8" }}
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
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} noValidate className="space-y-4">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[13px] font-semibold mb-1.5"
                style={{ color: "#5a1520" }}
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-semibold mb-1.5"
                style={{ color: "#5a1520" }}
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
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-semibold mb-1.5"
                style={{ color: "#5a1520" }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                <button
                  type="button"
                  onClick={passwordToggle}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-semibold mb-1.5"
                style={{ color: "#5a1520" }}
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-150 disabled:opacity-50"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <div onClick={passwordToggle}>
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </div>
            </div> */}
            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white text-sm font-semibold rounded-xl py-3.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background:
                    "linear-gradient(135deg, #c41230 0%, #6b0f1a 100%)",
                  boxShadow: "0 4px 18px rgba(107,15,26,0.32)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #d41535 0%, #7a1020 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 22px rgba(107,15,26,0.42)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #c41230 0%, #6b0f1a 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 18px rgba(107,15,26,0.32)";
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 opacity-80"
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <svg
                      width="14"
                      height="14"
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

          {/* Sign in link */}
          <p className="text-[13px] mt-6" style={{ color: "#a87493 " }}>
            Already have an account?{" "}
            <Link to="/login">
              <span className="hover:underline text-red-800">Log In</span>{" "}
            </Link>
          </p>

          {/* Footer */}
          <p
            className="text-[12px] mt-2 leading-relaxed"
            style={{ color: "#a87493 " }}
          >
            &copy; 2026 Knotpad: Mehtaab. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
