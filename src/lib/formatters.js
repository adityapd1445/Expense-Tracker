export const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Health", "Other"];

export const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};
