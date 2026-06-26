import { useState } from "react";
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
import Profile from "./components/Profile.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const handleSetAuth = (value) => {
    setIsAuthenticated(value);
    if (!value) {
      localStorage.removeItem("token");
    }
  };

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
          path="/profile"
          element={
            isAuthenticated ? (
              <Profile setAuth={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" />
            )
          }
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
