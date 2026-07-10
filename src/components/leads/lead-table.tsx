"use client";

import React from "react";
import { MoreHorizontal, Trash2, UserPlus, Eye, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { formatPrice, formatBHK, formatDate, formatLeadStatus } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants";

interface LeadTableProps {
  leads: any[];
  isAdmin: boolean;
  canUpdateStatus?: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onAssign: (id: string) => void;
}

export function LeadTable({ leads, isAdmin, canUpdateStatus = false, onStatusChange, onDelete, onAssign }: LeadTableProps) {
  const classVariant = (c: string) => {
    if (c === "HOT") return "hot" as const;
    if (c === "WARM") return "warm" as const;
    return "cold" as const;
  };

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lead</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Budget</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Intent</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Property Choice</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">BHK</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b data-table-row">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                    {lead.assignments?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {lead.assignments.map((a: any) => (
                          <Badge key={a.id} variant="outline" className="text-[10px] px-1.5">{a.user.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{lead.phone || "—"}</td>
                <td className="px-4 py-3">
                  {lead.budget ? (
                    <span className="font-semibold text-primary">{formatPrice(lead.budget)}</span>
                  ) : lead.budgetMin || lead.budgetMax ? (
                    <span className="text-xs">{lead.budgetMin ? formatPrice(lead.budgetMin) : "—"} - {lead.budgetMax ? formatPrice(lead.budgetMax) : "—"}</span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm">{lead.preferredLocality || lead.preferredCity || "—"}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {lead.transactionType ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      lead.transactionType === "PURCHASE"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}>
                      {lead.transactionType === "PURCHASE" ? "🏠 Buy" : "🔑 Rent"}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <span className="text-xs text-muted-foreground max-w-[140px] truncate block">
                    {lead.preferredPropertyType || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{lead.preferredBHK ? formatBHK(lead.preferredBHK) : "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={classVariant(lead.classification)} className="text-xs tabular-nums">
                    {lead.score} · {lead.classification}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">{formatLeadStatus(lead.status)}</Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="xs"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => onAssign(lead.id)}>
                            <UserPlus className="w-4 h-4 mr-2" /> Assign to Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {(isAdmin || canUpdateStatus) && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <ArrowRightLeft className="w-4 h-4 mr-2" /> Change Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {LEAD_STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s.value}
                                onClick={() => onStatusChange(lead.id, s.value)}
                                disabled={lead.status === s.value}
                              >
                                {s.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      {!isAdmin && !canUpdateStatus && (
                        <DropdownMenuItem disabled>
                          <Eye className="w-4 h-4 mr-2" /> View Only
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
