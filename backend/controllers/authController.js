import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user in database
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                profileImageUrl,
            }
        });

        const token = generateToken(user.id);

        return res.status(200).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
            }
        });
    } catch (error) {
        console.log("Error registering user:", error);
        return res.status(400).json({ message: "server error" });

    }

}


export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });

        }
        const token = generateToken(user.id);

        return res.status(200).json({
            message: "login successfull",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
            }
        });
    } catch (error) {
        console.log("error in logging:", error);
        return res.status(400).json({ message: "server error" });
    }
}

export const getUserInfo = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {

                id: true,
                fullName: true,
                email: true,
                profileImageUrl: true,
            }
        });
        if (!user) {
            return res.status(400).json({ message: "User not found" });

        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ message: "Server error" });
    }
}

