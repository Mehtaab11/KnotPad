import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Editor from "./components/Editor.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSetAuth = (value) => {
    setIsAuthenticated(value);
    if (!value) {
      localStorage.removeItem("token");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login setAuth={handleSetAuth} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        ></Route>

        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <Register setAuth={handleSetAuth} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        ></Route>
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard setAuth={handleSetAuth} />
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>

        <Route
          path="/document/:id"
          element={isAuthenticated ? <Editor /> : <Navigate to="/login" />}
        />

        <Route
          path="/document/:id"
          element={isAuthenticated ? <Editor /> : <Navigate to="/login" />}
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        ></Route>
      </Routes>
    </Router>
  );
}
export default App;
