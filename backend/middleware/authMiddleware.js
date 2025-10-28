import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  let token;

 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2️⃣ Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // 3️⃣ Verify the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Find the user based on token payload (id)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImageUrl: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 5️⃣ Attach the user info to req for next middleware/controller
      req.user = user;

      // 6️⃣ Continue to next middleware/controller
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  // 7️⃣ If no token provided at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};