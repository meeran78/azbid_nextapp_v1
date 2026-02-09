"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Gavel, Target, Trophy, XCircle, Percent, TrendingDown } from "lucide-react";
import type { BuyerDashboardMetrics } from "@/actions/buyer-dashboard.action";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
  hover: {
    scale: 1.05,
    y: -5,
    transition: { duration: 0.2 },
  },
};

const cardStyles = [
  { borderColor: "border-blue-200 dark:border-blue-800", bgColor: "bg-blue-100 dark:bg-blue-900/20", color: "text-blue-600" },
  { borderColor: "border-green-200 dark:border-green-800", bgColor: "bg-green-100 dark:bg-green-900/20", color: "text-green-600" },
  { borderColor: "border-amber-200 dark:border-amber-800", bgColor: "bg-amber-100 dark:bg-amber-900/20", color: "text-amber-600" },
  { borderColor: "border-slate-200 dark:border-slate-800", bgColor: "bg-slate-100 dark:bg-slate-900/20", color: "text-slate-600" },
  { borderColor: "border-indigo-200 dark:border-indigo-800", bgColor: "bg-indigo-100 dark:bg-indigo-900/20", color: "text-indigo-600" },
  { borderColor: "border-rose-200 dark:border-rose-800", bgColor: "bg-rose-100 dark:bg-rose-900/20", color: "text-rose-600" },
];

/**
 * KPI cards: Total Bids Placed, Active Bids, Auctions Won, Auctions Lost, Win Rate (%), Outbid Count.
 * Won = highest bidder on CLOSED auction. Lost = participated but not winner.
 */
export function BuyerDashboardOverview({ m }: { m: BuyerDashboardMetrics }) {
  const cards = [
    { title: "Total Bids Placed", value: m.totalBidsPlaced, icon: Gavel, desc: "All time" },
    { title: "Active Bids (Live Auctions)", value: m.activeBidsCount, icon: Target, desc: `${m.leadingBidsCount} leading` },
    { title: "Auctions Won", value: m.winsCount, icon: Trophy, desc: "Highest bidder on closed lots" },
    { title: "Auctions Lost", value: m.lossesCount, icon: XCircle, desc: "Participated but not winner" },
    { title: "Win Rate (%)", value: `${m.winRatePct}%`, icon: Percent, desc: "Wins ÷ (wins + losses)" },
    { title: "Outbid Count", value: m.outbidCount, icon: TrendingDown, desc: "Lost to a higher bid" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, index) => {
        const style = cardStyles[index % cardStyles.length];
        const Icon = c.icon;
        return (
          <motion.div
            key={c.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover="hover"
          >
            <Card
              className={`hover:shadow-xl transition-all duration-300 border-2 ${style.borderColor} overflow-hidden relative group`}
            >
              <div
                className={`absolute inset-0 ${style.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.title}
                </CardTitle>
                <motion.div
                  className={`${style.bgColor} p-2 rounded-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`h-4 w-4 ${style.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  {c.value}
                </motion.div>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
