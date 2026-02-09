"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Store,
  Gavel,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type { AdminDashboardKPIs } from "@/actions/admin-dashboard.action";

export function AdminDashboardKPICards({ kpis }: { kpis: AdminDashboardKPIs }) {
  const cards = [
    {
      title: "Active users",
      value: kpis.activeUsers,
      icon: Users,
      desc: "Registered (non-banned)",
    },
    {
      title: "Stores",
      value: `${kpis.activeStores} / ${kpis.totalStores}`,
      icon: Store,
      desc: "Active / total",
    },
    {
      title: "Auctions",
      value: `${kpis.activeAuctions} active, ${kpis.closedAuctions} closed`,
      icon: Gavel,
      desc: "Live vs completed",
    },
    {
      title: "Lots",
      value: `${kpis.activeLots} active, ${kpis.closedLots} closed`,
      icon: Package,
      desc: "Live/Scheduled vs Sold/Unsold",
    },
    {
      title: "Total GMV",
      value: `$${kpis.totalGMV.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      desc: "Gross merchandise value (paid invoices)",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {c.title}
            </CardTitle>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
