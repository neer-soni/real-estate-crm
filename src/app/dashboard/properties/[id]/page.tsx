"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Bed, Ruler, Building, Star, Calendar, Tag, ExternalLink, Loader2, Users, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatBHK, formatPropertyType, formatPropertyStatus, formatDate, formatLeadStatus } from "@/lib/utils";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return <div className="text-center py-20 text-muted-foreground">Property not found</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{property.name}</h1>
            {property.isFeatured && (
              <Badge className="bg-amber-500 text-white"><Star className="w-3 h-3 mr-1 fill-current" /> Featured</Badge>
            )}
            <Badge variant={property.availability === "ACTIVE" ? "success" : property.availability === "SOLD" ? "hot" : "secondary"}>
              {property.availability}
            </Badge>
          </div>
          {property.builderName && <p className="text-muted-foreground mt-1">by {property.builderName}</p>}
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span>{property.locality}, {property.city}, {property.state}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
          <Badge variant={property.transactionType === "RENT" ? "info" : "purple"} className="mt-1">
            {property.transactionType === "RENT" ? "For Rent" : "For Sale"}
          </Badge>
        </div>
      </div>

      {/* Image Gallery */}
      {property.images && property.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl overflow-hidden">
          <div className="md:col-span-2 h-64 md:h-80">
            <img src={property.images[0].url} alt={property.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {property.images.slice(1, 3).map((img: any) => (
              <div key={img.id} className="h-32 md:h-[calc(50%-6px)]">
                <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Gallery */}
      {property.videos && property.videos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.videos.map((vid: any) => (
              <video
                key={vid.id}
                controls
                className="w-full rounded-xl border bg-black"
                preload="metadata"
              >
                <source src={vid.url} />
                Your browser does not support the video tag.
              </video>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specs Grid */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Property Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium flex items-center gap-1.5"><Building className="w-4 h-4 text-primary" />{formatPropertyType(property.propertyType)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">BHK</p>
                  <p className="font-medium flex items-center gap-1.5"><Bed className="w-4 h-4 text-primary" />{formatBHK(property.bhk)}</p>
                </div>
                {property.area && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Area</p>
                    <p className="font-medium flex items-center gap-1.5"><Ruler className="w-4 h-4 text-primary" />{property.area} sq ft</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium">{formatPropertyStatus(property.propertyStatus)}</p>
                </div>
                {property.floorNumber && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="font-medium">{property.floorNumber} of {property.totalFloors || "N/A"}</p>
                  </div>
                )}
                {property.furnishedStatus && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Furnished</p>
                    <p className="font-medium">{property.furnishedStatus.replace(/_/g, " ")}</p>
                  </div>
                )}
                {property.parking && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Parking</p>
                    <p className="font-medium">{property.parking}</p>
                  </div>
                )}
                {property.reraNumber && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">RERA</p>
                    <p className="font-medium flex items-center gap-1.5"><Hash className="w-4 h-4 text-primary" />{property.reraNumber}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Added</p>
                  <p className="font-medium flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" />{formatDate(property.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {property.description && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p></CardContent>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Amenities</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string) => (
                    <Badge key={amenity} variant="secondary" className="px-3 py-1">{amenity}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {property.googleMapsUrl && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
              <CardContent>
                <a href={property.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" /> View on Google Maps
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Lead Requests */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Lead Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {property.leads && property.leads.length > 0 ? (
                <div className="space-y-3">
                  {property.leads.map((lead: any) => (
                    <div key={lead.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="font-medium text-sm">{lead.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={lead.classification === "HOT" ? "hot" : lead.classification === "WARM" ? "warm" : "cold"} className="text-[10px]">
                          {lead.classification} · {lead.score}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatLeadStatus(lead.status)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No lead requests yet</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Created By</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium">{property.createdBy?.name}</p>
              <p className="text-sm text-muted-foreground">{property.createdBy?.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
