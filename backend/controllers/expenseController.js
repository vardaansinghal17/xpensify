import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();


export const addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, amount, category, date } = req.body;

    
    if (!amount || !category || !date || !icon) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    
    const newExpense = await prisma.expense.create({
      data: {
        userId,
        icon,
        category,
        amount: numericAmount,
        date: parsedDate,
      },
    });

    return res
      .status(200)
      .json({ message: "Expense added successfully", data: newExpense });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const getAllExpenses = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const deleteExpense = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.expense.delete({
      where: { id },
    });

    return res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    
    const data = expenses.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Icon: item.icon || "-",
      Date: item.date,
    }));

    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    
    const filePath = path.join(process.cwd(), "expense_details.xlsx");
    XLSX.writeFile(wb, filePath);

    
    res.download(filePath);
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
