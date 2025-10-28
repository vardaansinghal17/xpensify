import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardData = async (req, res) => {
    const userId = req.user.id;
    try {
        const totalIncomeResult = await prisma.income.aggregate({
            where: { userId },
            _sum: {
                amount: true
            }
        });
        const totalExpenseResult = await prisma.expense.aggregate({
            where: { userId },
            _sum: {
                amount: true
            }
        });

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        //income transcation from last 60 days
        const last60DaysIncomeTranscations = await prisma.income.findMany({
            where: {
                userId,
                date: {
                    gte: sixtyDaysAgo
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        //60 DAYS TOTAL INCOME
        const incomeLast60Days = last60DaysIncomeTranscations.reduce((sum, transcation) => sum + transcation.amount, 0);

        //expense transaction in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const last30DaysExpenseTranscation = await prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: thirtyDaysAgo,
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        //total expense for last 30 days
        const expenseLast30Days = last30DaysExpenseTranscation.reduce((sum, transcation) => sum + transcation.amount, 0);

        
        //last 5 transcations of income+ expense
        const incomeTranscations = await prisma.income.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 5,
        });
        const expenseTranscations = await prisma.expense.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 5,
        });
        const taggedIncome = incomeTranscations.map((txn) => ({
            ...txn,
            type: 'income',
        }));
        const taggedExpense = expenseTranscations.map((txn) => ({
            ...txn,
            type: 'expense',
        }));
        const lastTransactions = [...taggedIncome, ...taggedExpense].sort(
            (a, b) => b.date - a.date
        );


        return res.json({
            totalBalance: (totalIncomeResult._sum.amount || 0) - (totalExpenseResult._sum.amount || 0),
            totalIncome: totalIncomeResult._sum.amount || 0,
            totalExpense: totalExpenseResult._sum.amount || 0,
            last30DaysExpenses: {
                total: expenseLast30Days,
                transactions: last30DaysExpenseTranscation,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTranscations,
            },
            recentTransactions: lastTransactions,
        });


    }

    catch (error) {
        console.error("Error fetching dashboard data", error);
        return res.status(500).json({ error: "Server Error" });

    }
}