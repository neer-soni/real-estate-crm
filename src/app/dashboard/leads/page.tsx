"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Plus, Search, Loader2, X, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadTable } from "@/components/leads/lead-table";
import { AddLeadModal } from "@/components/leads/add-lead-modal";
import { AssignLeadModal } from "@/components/leads/assign-lead-modal";
import { LEAD_STATUSES } from "@/lib/constants";

export default function LeadsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState("");

  useEffect(() => {
    const assignedTo = searchParams.get("assignedTo");
    if (assignedTo && isAdmin) setClientFilter(assignedTo);
  }, [searchParams, isAdmin]);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients?role=CLIENT");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, search, statusFilter, classFilter, sortBy, clientFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      params.set("sortBy", sortBy);
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (classFilter) params.set("classification", classFilter);
      if (isAdmin && clientFilter) params.set("assignedTo", clientFilter);
      const res = await fetch(`/api/leads?${params}`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/leads/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const leads = data?.leads || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Leads
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? "Manage all leads" : "Your assigned leads"} ({pagination.total} total)
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => setShowAddModal(true)} className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Lead
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, phone, city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <Select value={clientFilter} onValueChange={(v) => { setClientFilter(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {(clients || []).map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {LEAD_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={(v) => { setClassFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Leads" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="HOT">🔥 Hot</SelectItem>
              <SelectItem value="WARM">🌤 Warm</SelectItem>
              <SelectItem value="COLD">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="scoreDesc">Score: High</SelectItem>
              <SelectItem value="scoreAsc">Score: Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lead Status Summary */}
      <div className="flex gap-2 flex-wrap">
        {LEAD_STATUSES.map((s) => {
          const count = leads.filter((l: any) => l.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(statusFilter === s.value ? "" : s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"
              }`}
            >
              {s.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No leads found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search || statusFilter ? "Try adjusting your filters" : "Leads will appear here when created"}
          </p>
        </motion.div>
      ) : (
        <LeadTable
          leads={leads}
          isAdmin={isAdmin}
          canUpdateStatus={!isAdmin}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
          onDelete={(id) => { if (confirm("Delete this lead?")) deleteMutation.mutate(id); }}
          onAssign={(id) => setAssignLeadId(id)}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
          <span className="text-sm text-muted-foreground px-3">Page {page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</Button>
        </div>
      )}

      {/* Modals */}
      {isAdmin && (
        <>
          <AddLeadModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { setShowAddModal(false); queryClient.invalidateQueries({ queryKey: ["leads"] }); }}
          />
          <AssignLeadModal
            open={!!assignLeadId}
            leadId={assignLeadId || ""}
            onClose={() => setAssignLeadId(null)}
            onSuccess={() => { setAssignLeadId(null); queryClient.invalidateQueries({ queryKey: ["leads"] }); }}
          />
        </>
      )}
    </div>
  );
}
