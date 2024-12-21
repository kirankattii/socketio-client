import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://socketoi-server.vercel.app/api",
  withCredentials: true,
})

