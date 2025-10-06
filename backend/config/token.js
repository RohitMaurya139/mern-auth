import jwt from "jsonwebtoken";
const generateToken = async (userId) => {
  try {
    const token = await jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

export default generateToken;
