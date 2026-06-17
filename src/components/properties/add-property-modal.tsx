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
import { PROPERTY_TYPES, TRANSACTION_TYPES, BHK_OPTIONS, FURNISHED_STATUS, PROPERTY_STATUS, COMMON_AMENITIES } from "@/lib/constants";
import { supabase } from "@/lib/supabase-client";
import { Upload, X } from "lucide-react";

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPropertyModal({ open, onClose, onSuccess }: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "", description: "", builderName: "",
    propertyType: "APARTMENT", transactionType: "PURCHASE",
    price: "", priceRangeMin: "", priceRangeMax: "",
    area: "", bhk: "TWO_BHK",
    locality: "", city: "", state: "", pinCode: "",
    googleMapsUrl: "", amenities: [] as string[],
    floorNumber: "", totalFloors: "", parking: "",
    furnishedStatus: "", propertyStatus: "READY_TO_MOVE",
    availability: "ACTIVE", virtualTourLink: "", reraNumber: "",
    isFeatured: false,
  });

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const ext = file.name.split('.').pop() || "jpg";
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(filename, file);
          
          if (uploadError) throw new Error("Image Upload failed: " + uploadError.message);
          
          const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(filename);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      const payload = {
        ...form,
        images: uploadedUrls,
        price: parseFloat(form.price) || 0,
        priceRangeMin: form.priceRangeMin ? parseFloat(form.priceRangeMin) : undefined,
        priceRangeMax: form.priceRangeMax ? parseFloat(form.priceRangeMax) : undefined,
        area: form.area ? parseFloat(form.area) : undefined,
        floorNumber: form.floorNumber ? parseInt(form.floorNumber) : undefined,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
        furnishedStatus: form.furnishedStatus || undefined,
        googleMapsUrl: form.googleMapsUrl || undefined,
        virtualTourLink: form.virtualTourLink || undefined,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create property");
      }

      onSuccess();
      // Reset form
      setFiles([]);
      setForm({
        name: "", description: "", builderName: "",
        propertyType: "APARTMENT", transactionType: "PURCHASE",
        price: "", priceRangeMin: "", priceRangeMax: "",
        area: "", bhk: "TWO_BHK",
        locality: "", city: "", state: "", pinCode: "",
        googleMapsUrl: "", amenities: [],
        floorNumber: "", totalFloors: "", parking: "",
        furnishedStatus: "", propertyStatus: "READY_TO_MOVE",
        availability: "ACTIVE", virtualTourLink: "", reraNumber: "",
        isFeatured: false,
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
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>Fill in the property details below.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Property Name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Sunrise Heights 3BHK" required />
              </div>
              <div className="space-y-1.5">
                <Label>Builder Name</Label>
                <Input value={form.builderName} onChange={(e) => update("builderName", e.target.value)} placeholder="e.g. DLF" />
              </div>
              <div className="space-y-1.5">
                <Label>RERA Number</Label>
                <Input value={form.reraNumber} onChange={(e) => update("reraNumber", e.target.value)} placeholder="RERA Reg. No." />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Property description..." rows={3} />
              </div>
            </div>
          </div>

          {/* Type & Price */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Type & Pricing</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Property Type *</Label>
                <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Transaction *</Label>
                <Select value={form.transactionType} onValueChange={(v) => update("transactionType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>BHK *</Label>
                <Select value={form.bhk} onValueChange={(v) => update("bhk", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BHK_OPTIONS.map((b) => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="e.g. 15000000" required />
              </div>
              <div className="space-y-1.5">
                <Label>Area (sq ft)</Label>
                <Input type="number" value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="e.g. 1200" />
              </div>
              <div className="space-y-1.5">
                <Label>Furnished Status</Label>
                <Select value={form.furnishedStatus} onValueChange={(v) => update("furnishedStatus", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {FURNISHED_STATUS.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Locality *</Label>
                <Input value={form.locality} onChange={(e) => update("locality", e.target.value)} placeholder="e.g. Sector 54" required />
              </div>
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Gurgaon" required />
              </div>
              <div className="space-y-1.5">
                <Label>State *</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="e.g. Haryana" required />
              </div>
              <div className="space-y-1.5">
                <Label>Pin Code</Label>
                <Input value={form.pinCode} onChange={(e) => update("pinCode", e.target.value)} placeholder="e.g. 122011" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Google Maps URL</Label>
                <Input value={form.googleMapsUrl} onChange={(e) => update("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>

          {/* Building Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Building Details</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Floor No.</Label>
                <Input type="number" value={form.floorNumber} onChange={(e) => update("floorNumber", e.target.value)} placeholder="e.g. 5" />
              </div>
              <div className="space-y-1.5">
                <Label>Total Floors</Label>
                <Input type="number" value={form.totalFloors} onChange={(e) => update("totalFloors", e.target.value)} placeholder="e.g. 20" />
              </div>
              <div className="space-y-1.5">
                <Label>Parking</Label>
                <Input value={form.parking} onChange={(e) => update("parking", e.target.value)} placeholder="e.g. 1 Covered" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status & Links</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Property Status</Label>
                <Select value={form.propertyStatus} onValueChange={(v) => update("propertyStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_STATUS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Virtual Tour Link</Label>
                <Input value={form.virtualTourLink} onChange={(e) => update("virtualTourLink", e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isFeatured} onCheckedChange={(c) => update("isFeatured", c)} />
              <Label>Featured Property</Label>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Media</h4>
            <div className="space-y-1.5">
              <Label>Property Photos</Label>
              <div className="flex flex-col gap-2">
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                />
                {files.length > 0 && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {files.map((file, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden bg-muted border flex items-center justify-center">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFiles(files.filter((_, index) => index !== i))}
                          className="absolute top-0 right-0 bg-black/60 p-1 text-white rounded-bl-md hover:bg-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                    form.amenities.includes(amenity)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="shadow-lg shadow-primary/20">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) : "Save Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
