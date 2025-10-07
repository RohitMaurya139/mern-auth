import React, { useRef, useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext"; // <-- import context
import { toast } from "react-toastify"; // <-- import toast
import "react-toastify/dist/ReactToastify.css";

const EmailVerify = () => {
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const {
    backendUrl,
    isLoggedin,
    setIsloggedin,
    getUserData,
    userData,
    setUserData,
  } = useContext(AppContext);
const [loading, setLoading] = useState(false);

  const handelInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handelPaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const handelKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((input) => input.value);
      const otp = otpArray.join("");
      setLoading(true)
      const res = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp, userId: userData._id },
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };
  useEffect(() => {
  isLoggedin && userData && userData.isAccountVerified&& navigate("/")
},[isLoggedin,userData])
  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        onSubmit={onSubmitHandler}
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your Email ID
        </p>
        <div className="flex justify-between mb-8" onPaste={handelPaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength={1}
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handelInput(e, index)}
                onKeyDown={(e) => handelKeyDown(e, index)}
              />
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer">
          {loading ? "Sending.." : "Verify Email"}
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
