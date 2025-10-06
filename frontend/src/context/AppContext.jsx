import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsloggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    try {
        const res = await axios.get(backendUrl + "/api/auth/is-auth", {
          withCredentials: true,
        });
      if (res.data.success) {
        setIsloggedin(true)
        getUserData();
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Something went wrong!", {
         position: "top-right",
         autoClose: 2000,
         theme: "colored",
       });
    }
  }
  const getUserData = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });
      setUserData(res?.data?.data);
      return res?.data?.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  useEffect(() => {
    getUserData();
    getAuthState()
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsloggedin,
    getUserData,
    userData,
    setUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
