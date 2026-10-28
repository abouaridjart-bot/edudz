"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { db } from "@/lib/db";
import { formatPeriod, periodBounds } from "@/lib/dates";
import { computeFinancialSummary } from "@/lib/reports";

interface FinancialData {
  period: string;
  expenses: number;
  payouts: number;
}

export function FinancialSummary() {
  const [data, setData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const periods = [
          `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`,
          currentPeriod,
        ];

        const results = await Promise.all(
          periods.map(async (period) => {
            const bounds = periodBounds(period);
            if (!bounds) return { period, expenses: 0, payouts: 0 };

            const [expenses, payouts] = await Promise.all([
              db.expense.aggregate({
                where: { date: { gte: bounds.start, lte: bounds.end } },
                _sum: { amount: true },
              }),
              db.payout.aggregate({
                where: { period },
                _sum: { net: true },
              }),
            ]);

            return {
              period,
              expenses: expenses._sum.amount ?? 0,
              payouts: payouts._sum.net ?? 0,
            };
          })
        );

        setData(results);
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const summary = data.length > 0 ? computeFinancialSummary({
    expenses: data.reduce((sum, d) => sum + d.expenses, 0),
    payouts: data.reduce((sum, d) => sum + d.payouts, 0),
  }) : null;

  return (
    <div className="panel p-4">
      <h3 className="mb-4 font-semibold">ملخص المركز</h3>

      {loading ? (
        <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
      ) : summary ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
              <p className="font-mono font-semibold text-danger">{summary.totalExpenses} د.ج</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأجور</p>
              <p className="font-mono font-semibold text-primary">{summary.totalPayouts} د.ج</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">صافي الربح</p>
              <p className={`font-mono font-semibold ${summary.netProfit >= 0 ? "text-success" : "text-danger"}`}>{summary.netProfit} د.ج</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>              <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tickFormatter={(period) => formatPeriod(period)} />
                <YAxis />
                <Tooltip formatter={(value) => `${value} د.ج`} />
                <Bar dataKey="expenses" name="مصاريف" fill="#ef4444" />
                <Bar dataKey="payouts" name="أجور" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">لا توجد بيانات مالية متاحة.</p>
      )}
    </div>
  );
}
