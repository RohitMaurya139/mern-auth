import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Not Authorized Login Again" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id) {
       req.body.userId=decoded.id
      } else {
          return res
            .status(401)
            .json({ message: "Not Authorized Login Again" });
   }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
};

export default userAuth;
