import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    backendUrl,
    isLoggedin,
    setIsloggedin,
    getUserData,
    userData,
    setUserData,
  } = useContext(AppContext);
const[loading,setLoading]=useState(false)
  const sendVerificationOtp = async () => {
    try {
        setLoading(true)
        const res = await axios.post(
          backendUrl + "/api/auth/send-verify-otp",
          {},
          { withCredentials: true }
        );
        if (res.data.success) {
         
          navigate("/email-verify");
          toast.success(res.data.message, { position: "top-right" });
          setLoading(false)
        } 
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });
      }
  }
  const logout = async () => {
    try {
      const res = await axios.post(
        backendUrl + "/api/auth/logout",
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsloggedin(false);
        setUserData(null);
        navigate("/");
        toast.success("Logged out successfully!", { position: "top-right" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="logo" className="w-28 sm:w-32" />

      {userData ? (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-gray-100 font-bold relative group">
          {userData.name?.[0]?.toUpperCase() || "U"}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 w-fit">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-200 cursor-pointer">
                  {loading ?"Sending..":"Verify Email"}
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100"
        >
          Login <img src={assets.arrow_icon} alt="arrowImg" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
