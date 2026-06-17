"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PROPERTY_TYPES, TRANSACTION_TYPES, BHK_OPTIONS, LEAD_SOURCES, URGENCY_LEVELS } from "@/lib/constants";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLeadModal({ open, onClose, onSuccess }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", whatsapp: "",
    source: "AI_AGENT",
    budget: "", budgetMin: "", budgetMax: "",
    transactionType: "", preferredLocality: "", preferredCity: "",
    preferredBHK: "", preferredPropertyType: "",
    readyToMoveRequired: false, possessionTimeline: "",
    minArea: "", maxArea: "",
    urgencyLevel: "", moveInDate: "",
    investmentPurpose: false, additionalNotes: "",
  });

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        budgetMin: form.budgetMin ? parseFloat(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : undefined,
        minArea: form.minArea ? parseFloat(form.minArea) : undefined,
        maxArea: form.maxArea ? parseFloat(form.maxArea) : undefined,
        transactionType: form.transactionType || undefined,
        preferredBHK: form.preferredBHK || undefined,
        preferredPropertyType: form.preferredPropertyType || undefined,
        urgencyLevel: form.urgencyLevel || undefined,
        moveInDate: form.moveInDate || undefined,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create lead");
      }

      onSuccess();
      setForm({
        name: "", phone: "", email: "", whatsapp: "",
        source: "AI_AGENT",
        budget: "", budgetMin: "", budgetMax: "",
        transactionType: "", preferredLocality: "", preferredCity: "",
        preferredBHK: "", preferredPropertyType: "",
        readyToMoveRequired: false, possessionTimeline: "",
        minArea: "", maxArea: "",
        urgencyLevel: "", moveInDate: "",
        investmentPurpose: false, additionalNotes: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Enter lead contact info and property requirements. Score is calculated automatically.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Lead name" required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label>Lead Source</Label>
                <Select value={form.source} onValueChange={(v) => update("source", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Property Requirements</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Budget (₹)</Label>
                <Input type="number" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. 15000000" />
              </div>
              <div className="space-y-1.5">
                <Label>Transaction</Label>
                <Select value={form.transactionType} onValueChange={(v) => update("transactionType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Property Type</Label>
                <Select value={form.preferredPropertyType} onValueChange={(v) => update("preferredPropertyType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>BHK</Label>
                <Select value={form.preferredBHK} onValueChange={(v) => update("preferredBHK", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BHK_OPTIONS.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Locality</Label>
                <Input value={form.preferredLocality} onChange={(e) => update("preferredLocality", e.target.value)} placeholder="e.g. Sector 54" />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.preferredCity} onChange={(e) => update("preferredCity", e.target.value)} placeholder="e.g. Gurgaon" />
              </div>
            </div>
          </div>

          {/* Timeline & Urgency */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timeline & Urgency</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Urgency Level</Label>
                <Select value={form.urgencyLevel} onValueChange={(v) => update("urgencyLevel", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((u) => (<SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Move-in Date</Label>
                <Input type="date" value={form.moveInDate} onChange={(e) => update("moveInDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Possession Timeline</Label>
                <Input value={form.possessionTimeline} onChange={(e) => update("possessionTimeline", e.target.value)} placeholder="e.g. 6 months" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.readyToMoveRequired} onCheckedChange={(c) => update("readyToMoveRequired", c)} />
                <Label className="text-sm font-normal">Ready to Move Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.investmentPurpose} onCheckedChange={(c) => update("investmentPurpose", c)} />
                <Label className="text-sm font-normal">Investment Purpose</Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Additional Notes</Label>
            <Textarea value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} placeholder="Any additional requirements..." rows={3} />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="shadow-lg shadow-primary/20">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : "Save Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
