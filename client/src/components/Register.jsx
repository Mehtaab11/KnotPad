// client/src/components/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAPI } from "../utils/api.js";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await fetchAPI("/user/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
    },
    formBox: {
      width: "100%",
      maxWidth: "400px",
      padding: "3rem",
      border: "1px solid #eaeaea",
    },
    header: {
      fontSize: "1.5rem",
      fontWeight: "400",
      marginBottom: "2rem",
      color: "#111",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      marginBottom: "1.5rem",
      border: "1px solid #ccc",
      outline: "none",
      fontSize: "1rem",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "0.75rem",
      backgroundColor: "#111",
      color: "#fff",
      border: "none",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "opacity 0.2s",
    },
    error: { color: "#d32f2f", fontSize: "0.875rem", marginBottom: "1rem" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.header}>Sign Up for DOC_OS</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
