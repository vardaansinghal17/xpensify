import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";
const prisma = new PrismaClient();

export const addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, amount, source, date } = req.body;

        if (!amount || !source || !date || !icon) {
            return res.status(400).json({ message: 'All fields are required.' });

        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            return res.status(400).json({ message: "Amount must be a number" });
        }
        const newIncome = await prisma.income.create({
            data: {
                userId,
                icon,
                source,
                amount: numericAmount,
                date: parsedDate,
            }
        });
        return res.status(200).json({ message: "Income added successfully", data: newIncome });
    } catch (error) {
        console.error("Error adding income:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}


export const getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await prisma.income.findMany({
            where: { userId },
            orderBy: { date: "desc" }
        });
        return res.json(income);
    } catch (error) {
        console.log("error fetching Income", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const deleteIncome = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.income.delete({
            where: { id: id }
        });
        return res.json({ message: "Income deleted successfully" });
    } catch (error) {
        console.error("Error deleting income:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await prisma.income.findMany({
            where: { userId: userId },
            orderBy: { date: "desc" },
        });
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,

        }))

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Income");

        const filePath = path.join(process.cwd(), "income_details.xlsx");
        XLSX.writeFile(wb, filePath);
        res.download(filePath);
    } catch (error) {
        console.error("Error generating Excel:", error);
        res.status(500).json({ message: "Server Error" });

    }
}