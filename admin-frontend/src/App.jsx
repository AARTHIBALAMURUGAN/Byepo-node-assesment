import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api, authConfig } from "./api";

const TOKEN_KEY = "admin_token";
const NAME_REGEX = /^[A-Za-z]+(?:[A-Za-z\s'-]{1,48}[A-Za-z])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;
const FEATURE_KEY_REGEX = /^[a-z][a-z0-9._-]{2,49}$/;

const successToast = (message) => toast.success(message);
const errorToast = (message) => toast.error(message);

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", organizationId: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [flags, setFlags] = useState([]);
  const [newFlag, setNewFlag] = useState({ key: "", enabled: false });
  const [loading, setLoading] = useState(false);

  const isRequiredFilled = (obj) => Object.values(obj).every((v) => String(v).trim() !== "");
  const isValidName = (name) => NAME_REGEX.test(name.trim());
  const isValidEmail = (email) => EMAIL_REGEX.test(email.trim().toLowerCase());
  const isValidPassword = (password) => PASSWORD_REGEX.test(password);
  const isValidFeatureKey = (key) => FEATURE_KEY_REGEX.test(key.trim().toLowerCase());

  const loadFlags = async (activeToken) => {
    try {
      const res = await api.get("/flags", authConfig(activeToken));
      if (res.status === 200) {
        setFlags(res.data);
      } else {
        errorToast("Failed to fetch flags");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to fetch flags");
    }
  };

  useEffect(() => {
    if (token) {
      loadFlags(token);
    }
  }, [token]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isRequiredFilled(signupData)) return errorToast("All signup fields are required");
    if (!isValidName(signupData.name)) return errorToast("Name can contain letters and valid separators only");
    if (!isValidEmail(signupData.email)) return errorToast("Enter a valid email");
    if (!isValidPassword(signupData.password)) return errorToast("Password must include upper, lower, number, special char (8-64)");
    setLoading(true);
    try {
      const res = await api.post("/signup", signupData);
      if (res.status === 200) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setToken(res.data.token);
        successToast("Admin account created and logged in successfully.");
        setSignupData({ name: "", email: "", password: "", organizationId: "" });
        setAuthMode("login");
      } else {
        errorToast("Signup failed");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isRequiredFilled(loginData)) return errorToast("All login fields are required");
    if (!isValidEmail(loginData.email)) return errorToast("Enter a valid email");
    setLoading(true);
    try {
      const res = await api.post("/login", loginData);
      if (res.status === 200) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setToken(res.data.token);
        successToast("Admin login successful");
        setLoginData({ email: "", password: "" });
      } else {
        errorToast("Login failed");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async (e) => {
    e.preventDefault();
    if (!isValidFeatureKey(newFlag.key)) return errorToast("Feature key must start with a letter and be 3-50 chars");
    setLoading(true);
    try {
      const res = await api.post("/flags", newFlag, authConfig(token));
      if (res.status === 200) {
        successToast("Feature created");
        setNewFlag({ key: "", enabled: false });
        loadFlags(token);
      } else {
        errorToast("Failed to create feature");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to create feature");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flag) => {
    setLoading(true);
    try {
      const res = await api.put(`/flags/${flag._id}`, { enabled: !flag.enabled }, authConfig(token));
      if (res.status === 200) {
        successToast("Feature updated");
        loadFlags(token);
      } else {
        errorToast("Failed to update feature");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to update feature");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/flags/${id}`, authConfig(token));
      if (res.status === 200) {
        successToast("Feature deleted");
        loadFlags(token);
      } else {
        errorToast("Failed to delete feature");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to delete feature");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setFlags([]);
    successToast("Logged out");
  };

  return (
    <div className="container">
      <h1>Admin Frontend</h1>

      {!token ? (
        <div className="card">
          <h3>{authMode === "login" ? "Login" : "Signup"}</h3>
          {authMode === "signup" ? (
            <form onSubmit={handleSignup}>
              <label>Name</label>
              <input value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
              <label>Email</label>
              <input type="email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
              <label>Password</label>
              <input type="password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
              <label>Organization ID</label>
              <input value={signupData.organizationId} onChange={(e) => setSignupData({ ...signupData, organizationId: e.target.value })} />
              <button disabled={loading} type="submit">{loading ? "Please wait..." : "Signup"}</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
              <label>Password</label>
              <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
              <button disabled={loading} type="submit">{loading ? "Please wait..." : "Login"}</button>
            </form>
          )}
          <p className="auth-switch">
            {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              className="link-btn"
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            >
              {authMode === "login" ? "Signup" : "Login"}
            </button>
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="actions">
              <button className="secondary" type="button" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div className="card">
            <h3>Create Feature</h3>
            <form onSubmit={handleCreateFlag}>
              <label>Feature Key</label>
              <input value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })} />
              <label className="checkbox-row">
                <input
                  className="checkbox-input"
                  type="checkbox"
                  checked={newFlag.enabled}
                  onChange={(e) => setNewFlag({ ...newFlag, enabled: e.target.checked })}
                />
                <span>Enable</span>
              </label>
              <button disabled={loading} type="submit">{loading ? "Please wait..." : "Create"}</button>
            </form>
          </div>

          <div className="card">
            <h3>Feature Flags</h3>
            <table className="table">
              <thead>
                <tr><th>Key</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {flags.length === 0 ? <tr><td colSpan="3">No flags found</td></tr> : flags.map((f) => (
                  <tr key={f._id}>
                    <td>{f.key}</td>
                    <td><span className={`badge ${f.enabled ? "on" : "off"}`}>{f.enabled ? "Enabled" : "Disabled"}</span></td>
                    <td className="actions">
                      <button type="button" onClick={() => handleToggle(f)} disabled={loading}>{loading ? "..." : "Toggle"}</button>
                      <button className="danger" type="button" onClick={() => handleDelete(f._id)} disabled={loading}>{loading ? "..." : "Delete"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

