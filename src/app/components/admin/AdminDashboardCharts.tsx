"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { TimeSeriesPoint } from "@/actions/admin-dashboard.action";

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
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
};

const bidsConfig = {
  bids: {
    label: "Bids",
    color: "var(--chart-2)",
  },
};

export function AdminDashboardCharts({ data }: { data: TimeSeriesPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover="hover"
      >
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
          <CardDescription>Daily revenue from paid invoices (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-[280px] w-full">
            <AreaChart data={formatted} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `$${v}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bids per day</CardTitle>
          <CardDescription>Daily bid count (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={bidsConfig} className="h-[280px] w-full">
            <BarChart data={formatted} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="bids"
                fill="var(--color-bids)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
