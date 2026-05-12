import axios from "axios";

export const api = axios.create({
  baseURL: "https://byepo-node-assesment-1-n97j.onrender.com/api/superadmin",
});

export const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
