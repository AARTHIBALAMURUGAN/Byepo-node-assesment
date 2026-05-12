import { useState } from "react";
import { toast } from "react-hot-toast";
import { api, authConfig } from "./api";

const TOKEN_KEY = "end_user_token";
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
  const [featureKey, setFeatureKey] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isRequiredFilled = (obj) => Object.values(obj).every((v) => String(v).trim() !== "");
  const isValidName = (name) => NAME_REGEX.test(name.trim());
  const isValidEmail = (email) => EMAIL_REGEX.test(email.trim().toLowerCase());
  const isValidPassword = (password) => PASSWORD_REGEX.test(password);
  const isValidFeatureKey = (key) => FEATURE_KEY_REGEX.test(key.trim().toLowerCase());

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
        successToast("User signup successful. Logged in.");
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
        successToast("User login successful");
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

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!isValidFeatureKey(featureKey)) return errorToast("Feature key must start with a letter and be 3-50 chars");
    setLoading(true);
    try {
      const res = await api.post("/flags/check", { featureKey }, authConfig(token));
      if (res.status === 200) {
        setResult(res.data);
        successToast("Feature status fetched");
      } else {
        errorToast("Failed to check feature");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to check feature");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setResult(null);
    setFeatureKey("");
    successToast("Logged out");
  };

  return (
    <div className="container">
      <h1>User Frontend</h1>

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
            <h3>Check Feature</h3>
            <form onSubmit={handleCheck}>
              <label>Feature Key</label>
              <input value={featureKey} onChange={(e) => setFeatureKey(e.target.value)} />
              <button disabled={loading} type="submit">{loading ? "Please wait..." : "Check"}</button>
            </form>
            {result && (
              <p>
                <strong>{result.featureKey}</strong> is{" "}
                <span className={`badge ${result.enabled ? "on" : "off"}`}>{result.enabled ? "Enabled" : "Disabled"}</span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;

