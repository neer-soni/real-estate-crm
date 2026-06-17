"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PROPERTY_TYPES, BHK_OPTIONS, TRANSACTION_TYPES, PROPERTY_STATUS, AVAILABILITY_OPTIONS } from "@/lib/constants";

interface PropertyFiltersProps {
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
  onClear: () => void;
}

export function PropertyFilters({ filters, onChange, onClear }: PropertyFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="xs" onClick={onClear} className="text-muted-foreground gap-1">
            <X className="w-3 h-3" /> Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Property Type</Label>
          <Select value={filters.propertyType || ""} onValueChange={(v) => updateFilter("propertyType", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Transaction</Label>
          <Select value={filters.transactionType || ""} onValueChange={(v) => updateFilter("transactionType", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Rent/Sale" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {TRANSACTION_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">BHK</Label>
          <Select value={filters.bhk || ""} onValueChange={(v) => updateFilter("bhk", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All BHK" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All BHK</SelectItem>
              {BHK_OPTIONS.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={filters.propertyStatus || ""} onValueChange={(v) => updateFilter("propertyStatus", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {PROPERTY_STATUS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Availability</Label>
          <Select value={filters.availability || ""} onValueChange={(v) => updateFilter("availability", v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {AVAILABILITY_OPTIONS.map((a) => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Featured Only</Label>
          <div className="flex items-center h-9 gap-2">
            <Switch
              checked={filters.isFeatured === "true"}
              onCheckedChange={(c) => updateFilter("isFeatured", c ? "true" : "")}
            />
            <span className="text-xs text-muted-foreground">{filters.isFeatured === "true" ? "Yes" : "All"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Min Price (₹)</Label>
          <Input type="number" placeholder="0" value={filters.priceMin || ""} onChange={(e) => updateFilter("priceMin", e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Max Price (₹)</Label>
          <Input type="number" placeholder="No limit" value={filters.priceMax || ""} onChange={(e) => updateFilter("priceMax", e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">City</Label>
          <Input placeholder="e.g. Gurgaon" value={filters.city || ""} onChange={(e) => updateFilter("city", e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Builder</Label>
          <Input placeholder="Builder name" value={filters.builderName || ""} onChange={(e) => updateFilter("builderName", e.target.value)} className="h-9" />
        </div>
      </div>
    </div>
  );
}
