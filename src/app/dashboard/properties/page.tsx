"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Grid3X3, List, SlidersHorizontal, Building2, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyTable } from "@/components/properties/property-table";
import { AddPropertyModal } from "@/components/properties/add-property-modal";
import { PropertyFilters } from "@/components/properties/property-filters";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function PropertiesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN";
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("newest");
  const [clientFilter, setClientFilter] = useState("");

  useEffect(() => {
    const clientId = searchParams.get("clientId");
    if (clientId && isAdmin) setClientFilter(clientId);
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

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");
    params.set("sortBy", sortBy);
    if (search) params.set("search", search);
    if (isAdmin && clientFilter) params.set("createdById", clientFilter);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [page, sortBy, search, filters, isAdmin, clientFilter]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", page, search, sortBy, filters, clientFilter, isAdmin],
    queryFn: async () => {
      const res = await fetch(`/api/properties?${buildQueryString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, availability }: { id: string; availability: string }) => {
      const res = await fetch("/api/properties/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, availability }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const res = await fetch("/api/properties/feature", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeatured }),
      });
      if (!res.ok) throw new Error("Failed to toggle feature");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });

  const properties = data?.properties || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Properties
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? `All client properties (${pagination.total} total)`
              : `Your property listings (${pagination.total} total)`}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      </div>

      {/* Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {(clients || []).map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="priceAsc">Price: Low → High</SelectItem>
              <SelectItem value="priceDesc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{activeFilterCount}</Badge>
            )}
          </Button>

          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="px-2.5"><Grid3X3 className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="table" className="px-2.5"><List className="w-4 h-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <PropertyFilters
              filters={filters}
              onChange={(newFilters) => { setFilters(newFilters); setPage(1); }}
              onClear={() => { setFilters({}); setPage(1); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive">
          <p>Failed to load properties. Please try again.</p>
        </div>
      ) : properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No properties found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search || activeFilterCount > 0
              ? "Try adjusting your search or filters"
              : "Add your first property to get started"}
          </p>
          {!search && activeFilterCount === 0 && (
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          )}
        </motion.div>
      ) : view === "grid" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {properties.map((property: any, i: number) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PropertyCard
                property={property}
                isAdmin={isAdmin}
                onStatusChange={(availability) => statusMutation.mutate({ id: property.id, availability })}
                onFeatureToggle={() => featureMutation.mutate({ id: property.id, isFeatured: !property.isFeatured })}
                onDelete={() => { if (confirm("Delete this property?")) deleteMutation.mutate(property.id); }}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <PropertyTable
          properties={properties}
          isAdmin={isAdmin}
          onStatusChange={(id, availability) => statusMutation.mutate({ id, availability })}
          onFeatureToggle={(id, isFeatured) => featureMutation.mutate({ id, isFeatured })}
          onDelete={(id) => { if (confirm("Delete this property?")) deleteMutation.mutate(id); }}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          queryClient.invalidateQueries({ queryKey: ["properties"] });
        }}
      />
    </div>
  );
}
