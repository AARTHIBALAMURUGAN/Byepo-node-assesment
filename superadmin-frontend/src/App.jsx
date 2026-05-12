import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api, authConfig } from "./api";

const TOKEN_KEY = "super_admin_token";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;
const ORG_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s&'().,-]{1,58}[A-Za-z0-9]$/;

const successToast = (message) => toast.success(message);
const errorToast = (message) => toast.error(message);

function App() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [orgName, setOrgName] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const isValidEmail = (email) => EMAIL_REGEX.test(email.trim().toLowerCase());
  const isValidPassword = (password) => PASSWORD_REGEX.test(password);
  const isValidOrganizationName = (name) => ORG_NAME_REGEX.test(name.trim());

  const loadOrgs = async (activeToken) => {
    try {
      const res = await api.get("/organizations", authConfig(activeToken));
      if (res.status === 200) {
        setOrgs(res.data);
      } else {
        errorToast("Failed to fetch organizations");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to fetch organizations");
    }
  };

  useEffect(() => {
    if (token) {
      loadOrgs(token);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email.trim() || !loginData.password.trim()) return errorToast("All login fields are required");
    if (!isValidEmail(loginData.email)) return errorToast("Enter a valid email");
    if (!isValidPassword(loginData.password)) return errorToast("Password must include upper, lower, number, special char (8-64)");
    setLoading(true);
    try {
      const res = await api.post("/login", loginData);
      if (res.status === 200) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setToken(res.data.token);
        successToast("Super admin login successful");
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

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return errorToast("Organization name is required");
    if (!isValidOrganizationName(orgName)) return errorToast("Organization name format is invalid");
    setLoading(true);
    try {
      const res = await api.post("/organizations", { name: orgName }, authConfig(token));
      if (res.status === 200) {
        successToast("Organization created");
        setOrgName("");
        loadOrgs(token);
      } else {
        errorToast("Failed to create organization");
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOrgs([]);
    successToast("Logged out");
  };

  return (
    <div className="container">
      <h1>Super Admin Frontend</h1>
      {!token ? (
        <div className="card">
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
            <label>Password</label>
            <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            <button disabled={loading} type="submit">{loading ? "Please wait..." : "Login"}</button>
          </form>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="actions">
              <button className="secondary" type="button" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div className="card">
            <h3>Create Organization</h3>
            <form onSubmit={handleCreateOrg}>
              <label>Name</label>
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              <button disabled={loading} type="submit">{loading ? "Please wait..." : "Create"}</button>
            </form>
          </div>

          <div className="card">
            <h3>Organizations</h3>
            <table className="table">
              <thead>
                <tr><th>Name</th><th>ID</th></tr>
              </thead>
              <tbody>
                {orgs.length === 0 ? <tr><td colSpan="2">No organizations found</td></tr> : orgs.map((org) => (
                  <tr key={org._id}>
                    <td>{org.name}</td>
                    <td>{org._id}</td>
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

