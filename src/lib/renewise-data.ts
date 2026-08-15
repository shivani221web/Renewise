export type Frequency = "monthly" | "quarterly" | "yearly";

export type Category =
  | "Entertainment"
  | "Software"
  | "Cloud Storage"
  | "Insurance"
  | "Fitness"
  | "Education"
  | "Gaming";

export type Subscription = {
  id: string;
  merchant: string;
  amount: number;
  currency: "INR";
  frequency: Frequency;
  renewalDate: string; // ISO
  category: Category;
  trial: boolean;
  active: boolean;
  usageMinutesPerWeek: number;
  manageUrl: string;
  accent: string; // token name for chart color
  gmailSnippet: string;
};

const today = new Date();
const inDays = (d: number) => {
  const t = new Date(today);
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

export const seedSubscriptions: Subscription[] = [
  {
    id: "netflix",
    merchant: "Netflix",
    amount: 649,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(2),
    category: "Entertainment",
    trial: false,
    active: true,
    usageMinutesPerWeek: 320,
    manageUrl: "https://www.netflix.com/youraccount",
    accent: "var(--chart-5)",
    gmailSnippet: "Your Netflix membership payment of ₹649 was successful.",
  },
  {
    id: "spotify",
    merchant: "Spotify",
    amount: 119,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(5),
    category: "Entertainment",
    trial: false,
    active: true,
    usageMinutesPerWeek: 640,
    manageUrl: "https://www.spotify.com/account/subscription/",
    accent: "var(--chart-1)",
    gmailSnippet: "Receipt for Spotify Premium Individual — ₹119 / month.",
  },
  {
    id: "prime",
    merchant: "Amazon Prime",
    amount: 1499,
    currency: "INR",
    frequency: "yearly",
    renewalDate: inDays(23),
    category: "Entertainment",
    trial: false,
    active: true,
    usageMinutesPerWeek: 90,
    manageUrl: "https://www.amazon.in/gp/primecentral",
    accent: "var(--chart-2)",
    gmailSnippet: "Your Prime membership renews on the invoice date shown.",
  },
  {
    id: "googleone",
    merchant: "Google One",
    amount: 130,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(9),
    category: "Cloud Storage",
    trial: false,
    active: true,
    usageMinutesPerWeek: 15,
    manageUrl: "https://one.google.com/settings",
    accent: "var(--chart-6)",
    gmailSnippet: "Google One 100 GB — auto debit ₹130.",
  },
  {
    id: "adobe",
    merchant: "Adobe Creative Cloud",
    amount: 1675,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(12),
    category: "Software",
    trial: false,
    active: true,
    usageMinutesPerWeek: 25,
    manageUrl: "https://account.adobe.com/plans",
    accent: "var(--chart-4)",
    gmailSnippet: "Invoice: Creative Cloud All Apps subscription renewal.",
  },
  {
    id: "canva",
    merchant: "Canva Pro",
    amount: 500,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(3),
    category: "Software",
    trial: true,
    active: true,
    usageMinutesPerWeek: 40,
    manageUrl: "https://www.canva.com/settings/billing-and-plans",
    accent: "var(--chart-2)",
    gmailSnippet: "Enjoy 30 days free — your Canva Pro trial ends soon.",
  },
  {
    id: "hdfc-term",
    merchant: "HDFC Term Insurance",
    amount: 14200,
    currency: "INR",
    frequency: "yearly",
    renewalDate: inDays(41),
    category: "Insurance",
    trial: false,
    active: true,
    usageMinutesPerWeek: 0,
    manageUrl: "https://www.hdfclife.com/customer-service",
    accent: "var(--chart-3)",
    gmailSnippet: "Policy renewal notice — premium due for the coming year.",
  },
  {
    id: "cult",
    merchant: "Cult.fit Gym",
    amount: 2199,
    currency: "INR",
    frequency: "quarterly",
    renewalDate: inDays(7),
    category: "Fitness",
    trial: false,
    active: true,
    usageMinutesPerWeek: 0,
    manageUrl: "https://www.cult.fit/",
    accent: "var(--chart-1)",
    gmailSnippet: "Membership auto debit scheduled for your gym pack.",
  },
  {
    id: "disney",
    merchant: "Disney+ Hotstar",
    amount: 1499,
    currency: "INR",
    frequency: "yearly",
    renewalDate: inDays(58),
    category: "Entertainment",
    trial: false,
    active: true,
    usageMinutesPerWeek: 30,
    manageUrl: "https://www.hotstar.com/in/subscribe/my-account",
    accent: "var(--chart-4)",
    gmailSnippet: "Payment successful for Hotstar Super annual plan.",
  },
  {
    id: "ytpremium",
    merchant: "YouTube Premium",
    amount: 149,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(15),
    category: "Entertainment",
    trial: false,
    active: true,
    usageMinutesPerWeek: 410,
    manageUrl: "https://www.youtube.com/paid_memberships",
    accent: "var(--chart-5)",
    gmailSnippet: "Your YouTube Premium payment was successful.",
  },
  {
    id: "coursera",
    merchant: "Coursera Plus",
    amount: 3999,
    currency: "INR",
    frequency: "yearly",
    renewalDate: inDays(88),
    category: "Education",
    trial: true,
    active: true,
    usageMinutesPerWeek: 55,
    manageUrl: "https://www.coursera.org/account-profile",
    accent: "var(--chart-6)",
    gmailSnippet: "Start your free month of Coursera Plus — trial ends soon.",
  },
  {
    id: "xbox",
    merchant: "Xbox Game Pass",
    amount: 499,
    currency: "INR",
    frequency: "monthly",
    renewalDate: inDays(19),
    category: "Gaming",
    trial: false,
    active: false,
    usageMinutesPerWeek: 0,
    manageUrl: "https://account.microsoft.com/services",
    accent: "var(--chart-2)",
    gmailSnippet: "Subscription cancelled — access until period end.",
  },
];

export const monthlyEquivalent = (s: Subscription) =>
  s.frequency === "monthly" ? s.amount : s.frequency === "quarterly" ? s.amount / 3 : s.amount / 12;

export const yearlyEquivalent = (s: Subscription) => monthlyEquivalent(s) * 12;

export const daysUntil = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - n.getTime()) / 86400000);
};

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/** Value score: how much you use it vs what it costs (0-100). */
export const valueScore = (s: Subscription) => {
  const cost = monthlyEquivalent(s);
  if (s.category === "Insurance") return 92;
  const minutes = s.usageMinutesPerWeek * 4.3;
  const costPerHour = minutes > 0 ? cost / (minutes / 60) : 999;
  const score = Math.max(2, Math.min(100, Math.round(100 / (1 + costPerHour / 25))));
  return score;
};

export const categoryColor: Record<Category, string> = {
  Entertainment: "var(--chart-5)",
  Software: "var(--chart-4)",
  "Cloud Storage": "var(--chart-6)",
  Insurance: "var(--chart-3)",
  Fitness: "var(--chart-1)",
  Education: "var(--chart-2)",
  Gaming: "var(--chart-2)",
};

export const scanKeywords = [
  "receipt",
  "invoice",
  "subscription",
  "renewal",
  "payment successful",
  "auto debit",
  "membership",
  "trial",
];
