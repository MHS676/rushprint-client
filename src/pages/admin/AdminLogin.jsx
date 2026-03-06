import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPrinter, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.email);
        navigate("/admin");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <FiPrinter />
          print<span>Ngo</span>
        </div>
        <p className="admin-login-sub">Admin Dashboard</p>

        {error && (
          <div className="admin-alert error">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label>Email</label>
            <div className="admin-input-wrap">
              <FiMail />
              <input
                type="email"
                placeholder="admin@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Password</label>
            <div className="admin-input-wrap">
              <FiLock />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary admin-login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
