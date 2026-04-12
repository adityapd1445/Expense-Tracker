"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, formatCurrency, formatDisplayDate } from "@/lib/formatters";

const defaultDate = new Date().toISOString().slice(0, 10);
const availableCategories = categories.filter((item) => item !== "All");

export default function HomePage() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(defaultDate);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const totalAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [expenses]
  );

  const monthlyAmount = useMemo(() => {
    const now = new Date();
    return expenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.date);
      if (
        expenseDate.getFullYear() === now.getFullYear() &&
        expenseDate.getMonth() === now.getMonth()
      ) {
        return sum + Number(expense.amount);
      }
      return sum;
    }, 0);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return selectedCategory === "All"
      ? expenses
      : expenses.filter((expense) => expense.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const categorySummary = useMemo(() => {
    return availableCategories.map((item) => {
      const total = expenses
        .filter((expense) => expense.category === item)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      return { category: item, total };
    });
  }, [expenses]);

  useEffect(() => {
    async function loadExpenses() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/expenses");
        console.log("GET /api/expenses status", response.status);

        if (!response.ok) {
          const errorResponse = await response.json().catch(() => null);
          throw new Error(
            errorResponse?.error || `Unable to fetch expenses (${response.status}).`
          );
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format from server.");
        }

        setExpenses(data);
      } catch (err) {
        console.error("loadExpenses error:", err);
        setError(err.message || "Failed to load expenses.");
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  const handleResetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("Food");
    setDate(defaultDate);
  };

  async function parseJsonResponse(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  }

  async function handleAddExpense(event) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);
    if (!description.trim() || numericAmount <= 0 || !category || !date) {
      setError("Please complete all fields and enter a valid amount.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: numericAmount,
          category,
          date,
        }),
      });

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "Unable to add expense.");
      }

      setExpenses((current) => [data, ...current]);
      handleResetForm();
    } catch (err) {
      setError(err.message || "Failed to add expense.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteExpense(id) {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "Unable to delete expense.");
      }

      setExpenses((current) => current.filter((expense) => expense.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete expense.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col gap-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur-xl">
          <div className="mb-8 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">
                Expense Tracker
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl">
                Digital Expense Tracker
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Track daily spending with category filters, date entry, and fast MongoDB persistence.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 text-slate-900 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total spent</p>
                <p className="mt-3 text-3xl font-semibold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-slate-900 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">This month</p>
                <p className="mt-3 text-3xl font-semibold">{formatCurrency(monthlyAmount)}</p>
              </div>
            </div>
          </div>

          <form className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_1.1fr_0.9fr]" onSubmit={handleAddExpense}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Amount</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-150 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="₹500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-150 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Coffee, groceries, subscription..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-150 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                {availableCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-150 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-3xl bg-sky-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/10 transition duration-150 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? "Saving..." : "Add Expense"}
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          ) : null}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-200/30">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Expenses</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Filter by category and manage your entries.
                </p>
              </div>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-150 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                Loading expenses...
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                No expenses found. Add a new expense or select a different category.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-slate-500">
                          <span>{formatDisplayDate(expense.date)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-400" />
                          <span>{expense.category || "Other"}</span>
                        </div>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{expense.description}</p>
                      </div>
                      <div className="flex flex-col gap-3 sm:items-end">
                        <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <button
                          type="button"
                          disabled={deletingId === expense.id}
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === expense.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-200/30">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Category Breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">A quick view of spending by category.</p>
            </div>

            <div className="space-y-4">
              {categorySummary.map((item) => {
                const percent = totalAmount ? (item.total / totalAmount) * 100 : 0;
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                      <span>{item.category}</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${Math.round(percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
