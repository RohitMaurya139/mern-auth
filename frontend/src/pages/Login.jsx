import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { backendUrl, setIsloggedin, getUserData } = useContext(AppContext);
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {

      if (state === "Sign Up") {
        setLoading(true)
        const res = await axios.post(
          backendUrl + "/api/auth/register",
          { name, email, password },
          { withCredentials: true }
        );

        if (res.data.success) {
          toast.success(res.data.message, {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          });
           setIsloggedin(true);
           await getUserData();
           navigate("/");
            setLoading(false);
        }
      } else {
        setLoading(true)
        const res = await axios.post(
          backendUrl + "/api/auth/login",
          { email, password },
          { withCredentials: true }
        );

        if (res.data.success) {
          toast.success(res.data.message, {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          });
        setIsloggedin(true);
        await getUserData();
          navigate("/");
          setLoading(false)

        }
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
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create Your account"
            : "Login to your account!"}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-transparent outline-none text-white"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent outline-none text-white"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent outline-none text-white"
            />
          </div>
          <p
            className="mb-4 text-indigo-500 cursor-pointer"
            onClick={() => navigate("/reset-password")}
          >
            Forgot Password
          </p>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 font-medium text-white cursor-pointer">
           {loading?"....": {state}}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4 ">
            Already have an account ?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login Here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4 ">
            Don't have an account ?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
