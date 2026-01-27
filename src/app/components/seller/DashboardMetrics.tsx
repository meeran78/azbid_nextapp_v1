"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Gavel,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Target,
  Package,
  Clock,
  ShoppingCart,
  Layers,
} from "lucide-react";

interface DashboardMetricsProps {
  metrics: {
    totalAuctions: number;
    activeAuctions: number;
    completedAuctions: number;
    totalRevenue: number;
    averageBidsPerAuction: number;
    totalLots: number;
    liveLots: number;
    scheduledLots: number;
    totalLotValue: number;
    totalItems: number;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const metricCards = [
    {
      title: "Total Auctions",
      value: metrics.totalAuctions,
      icon: Gavel,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Active Auctions",
      value: metrics.activeAuctions,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Completed Auctions",
      value: metrics.completedAuctions,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      title: "Avg Bids per Auction",
      value: metrics.averageBidsPerAuction.toFixed(1),
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
    {
      title: "Total Lots",
      value: metrics.totalLots,
      icon: Package,
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      title: "Live Lots",
      value: metrics.liveLots,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      title: "Scheduled Lots",
      value: metrics.scheduledLots,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: "Total Lot Value",
      value: `$${metrics.totalLotValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: ShoppingCart,
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
      borderColor: "border-teal-200 dark:border-teal-800",
    },
    {
      title: "Total Items",
      value: metrics.totalItems,
      icon: Layers,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover="hover"
          >
            <Card
              className={`hover:shadow-xl transition-all duration-300 border-2 ${card.borderColor} overflow-hidden relative group`}
            >
              <div
                className={`absolute inset-0 ${card.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <motion.div
                  className={`${card.bgColor} p-2 rounded-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  {card.value}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}