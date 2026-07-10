"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, TrendingDown, Flame, Snowflake, Sun,
  BarChart3, Loader2, Target, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatLeadStatus } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#ec4899"];

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

function StatsCard({ title, value, subtitle, icon, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                  {subtitle}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [leadStats, setLeadStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/leads/analytics");
        const data = await res.json();
        setLeadStats(data);
      } catch (err) {
        console.error("Error fetching lead analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sourceData = leadStats?.sourceBreakdown?.map((s: any) => ({
    name: s.source.replace(/_/g, " "),
    value: s.count,
  })) || [];

  const statusData = leadStats?.statusBreakdown?.map((s: any) => ({
    name: formatLeadStatus(s.status),
    value: s.count,
  })) || [];

  const monthlyData = leadStats?.monthlyLeads || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          Lead Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your lead qualification performance</p>
      </div>

      {/* Lead Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Leads" value={leadStats?.totalLeads || 0} icon={<Users className="w-5 h-5" />} delay={0} />
        <StatsCard title="Hot Leads" value={leadStats?.hotLeads || 0} subtitle="Score 61–100" icon={<Flame className="w-5 h-5" />} trend="up" delay={0.05} />
        <StatsCard title="Warm Leads" value={leadStats?.warmLeads || 0} subtitle="Score 31–60" icon={<Sun className="w-5 h-5" />} delay={0.1} />
        <StatsCard title="Cold Leads" value={leadStats?.coldLeads || 0} subtitle="Score 0–30" icon={<Snowflake className="w-5 h-5" />} delay={0.15} />
        <StatsCard title="Conversion Rate" value={`${leadStats?.conversionRate || 0}%`} subtitle="Closed Won" icon={<TrendingUp className="w-5 h-5" />} trend="up" delay={0.2} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg">Lead Pipeline</CardTitle></CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10 text-sm">No lead data yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Lead Sources Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg">Lead Sources</CardTitle></CardHeader>
            <CardContent>
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={(props: any) => `${props.name || ''} ${((props.percent || 0) * 100).toFixed(0)}%`}>
                      {sourceData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10 text-sm">No source data yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Leads Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Monthly Lead Growth</CardTitle></CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-10 text-sm">No monthly data yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Leads</CardTitle></CardHeader>
          <CardContent>
            {leadStats?.recentLeads?.length > 0 ? (
              <div className="space-y-3">
                {leadStats.recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                        {lead.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={lead.classification === "HOT" ? "hot" : lead.classification === "WARM" ? "warm" : "cold"} className="text-xs">
                        {lead.score} · {lead.classification}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{formatLeadStatus(lead.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6 text-sm">No recent leads</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
