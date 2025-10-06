import User from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const  userId  = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }


    res
      .status(201)
      .json({ success: true, data:user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};