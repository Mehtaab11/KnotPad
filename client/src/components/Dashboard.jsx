// client/src/components/Dashboard.js
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../utils/api";

const Dashboard = ({ setAuth }) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      const data = await fetchAPI("/documents");
      setDocuments(data);
    } catch (err) {
      setError("Failed to load documents.");
      // If token is invalid/expired, log them out
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
      // Navigate straight to the new editor
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      setError(err.message);
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
  
  const styles = {
    layout: {
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
      color: "#111",
    },
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.5rem 3rem",
      borderBottom: "1px solid #eaeaea",
    },
    logo: {
      fontSize: "1.25rem",
      fontWeight: "600",
      letterSpacing: "-0.02em",
      margin: 0,
    },
    logoutBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "0.875rem",
      color: "#666",
    },
    main: { padding: "3rem", maxWidth: "1200px", margin: "0 auto" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "3rem",
    },
    title: { fontSize: "2rem", fontWeight: "300", margin: 0 },
    createBtn: {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#111",
      color: "#fff",
      border: "none",
      fontSize: "0.875rem",
      cursor: "pointer",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "2rem",
    },
    card: {
      padding: "2rem",
      border: "1px solid #eaeaea",
      textDecoration: "none",
      color: "inherit",
      display: "flex",
      flexDirection: "column",
      height: "150px",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
    },
    cardTitle: {
      fontSize: "1.125rem",
      fontWeight: "400",
      margin: "0 0 auto 0",
    },
    cardDate: { fontSize: "0.75rem", color: "#888" },
    error: {
      padding: "1rem",
      backgroundColor: "#fee",
      color: "#c00",
      border: "1px solid #fcc",
      marginBottom: "2rem",
    },
  };

  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>DOC_OS</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.title}>Your Documents</h2>
          <button onClick={handleCreateDocument} style={styles.createBtn}>
            + New Document
          </button>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {documents.map((doc) => (
            <Link
              to={`/document/${doc._id}`}
              key={doc._id}
              style={styles.card}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#111")}
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = "#eaeaea")
              }
            >
              <h3 style={styles.cardTitle}>{doc.title}</h3>
              <span style={styles.cardDate}>
                Last updated {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
          {documents.length === 0 && !error && (
            <p style={{ color: "#666" }}>
              No documents found. Create one to get started.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
