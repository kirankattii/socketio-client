import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "https://socketoi-server.vercel.app"

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggeingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const responce = await axiosInstance.get("/auth/check")
      console.log(responce);

      set({ authUser: responce.data })
      get().connectSocket()
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })

    try {
      const res = await axiosInstance.post("/auth/signup", data)
      set({ authUser: res.data })
      toast.success("Account created successfully")
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isSigningUp: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      set({ authUser: null })
      toast.error("Logged out successfully")
      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },


  login: async (data) => {
    set({ isLoggeingIn: true })
    try {
      const res = await axiosInstance.post('/auth/login', data)
      console.log(res);

      set({ authUser: res.data })
      toast.success("Logged in successfully")
      get().connectSocket()

    } catch (error) {
      toast.error(error.res.data.message)
    } finally {
      set({ isLoggeingIn: false })
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true })
    try {
      const res = await axiosInstance.put('/auth/update-profile', data)
      // set({ authUser: res.data })
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error.response.data.message)
    }
    finally {
      set({ isUpdatingProfile: false })
    }
  },

  connectSocket: () => {
    const { authUser } = get()
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    })
    socket.connect()
    set({ socket: socket })

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect()
  }



}))