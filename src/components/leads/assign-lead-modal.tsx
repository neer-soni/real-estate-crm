"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssignLeadModalProps {
  open: boolean;
  leadId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignLeadModal({ open, leadId, onClose, onSuccess }: AssignLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    if (open) {
      setLoadingClients(true);
      fetch("/api/clients?role=CLIENT")
        .then((r) => r.json())
        .then((data) => {
          setClients(Array.isArray(data) ? data : []);
          setLoadingClients(false);
        })
        .catch(() => setLoadingClients(false));
    }
  }, [open]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/leads/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, userIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Failed to assign");
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead to Client</DialogTitle>
          <DialogDescription>Select one or more clients to assign this lead to.</DialogDescription>
        </DialogHeader>

        {loadingClients ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No clients found. Create a client account first.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {clients.map((client) => (
              <label
                key={client.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedIds.includes(client.id)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(client.id)}
                  onCheckedChange={() => toggle(client.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.email}</p>
                  {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                </div>
                {selectedIds.includes(client.id) && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={loading || selectedIds.length === 0}>
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</>) : `Assign to ${selectedIds.length} Client(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
