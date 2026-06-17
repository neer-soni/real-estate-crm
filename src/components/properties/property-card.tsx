"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Bed, Ruler, Star, MoreVertical, Eye, Pencil, Trash2, Ban, CheckCircle, Copy, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatPrice, formatBHK, formatPropertyType, formatDate } from "@/lib/utils";

interface PropertyCardProps {
  property: any;
  onStatusChange: (availability: string) => void;
  onFeatureToggle: () => void;
  onDelete: () => void;
}

export function PropertyCard({ property, onStatusChange, onFeatureToggle, onDelete }: PropertyCardProps) {
  const mainImage = property.images?.[0]?.url || null;

  const availabilityVariant = (a: string) => {
    if (a === "ACTIVE") return "success";
    if (a === "SOLD") return "hot";
    return "secondary";
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <Tag className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant={availabilityVariant(property.availability)} className="text-[10px] shadow-sm">
            {property.availability}
          </Badge>
          {property.isFeatured && (
            <Badge className="bg-amber-500 text-white text-[10px] shadow-sm">
              <Star className="w-3 h-3 mr-0.5 fill-current" /> Featured
            </Badge>
          )}
        </div>

        {/* Transaction type badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={property.transactionType === "RENT" ? "info" : "purple"} className="text-[10px] shadow-sm">
            {property.transactionType === "RENT" ? "For Rent" : "For Sale"}
          </Badge>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
          <p className="text-white font-bold text-lg">{formatPrice(property.price)}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title & Builder */}
        <div>
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          {property.builderName && (
            <p className="text-xs text-muted-foreground mt-0.5">by {property.builderName}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{property.locality}, {property.city}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Bed className="w-3.5 h-3.5" /> {formatBHK(property.bhk)}
          </span>
          {property.area && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Ruler className="w-3.5 h-3.5" /> {property.area} sq ft
            </span>
          )}
          <Badge variant="outline" className="text-[10px] ml-auto">
            {formatPropertyType(property.propertyType)}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-[11px] text-muted-foreground">{formatDate(property.createdAt)}</span>
          <div className="flex items-center gap-1">
            <Link href={`/dashboard/properties/${property.id}`}>
              <Button variant="ghost" size="xs" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="xs" className="h-7 px-1.5"><MoreVertical className="w-3.5 h-3.5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <Link href={`/dashboard/properties/${property.id}`}>
                  <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={onFeatureToggle}>
                  <Star className="w-4 h-4 mr-2" /> {property.isFeatured ? "Unfeature" : "Feature"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {property.availability !== "SOLD" && (
                  <DropdownMenuItem onClick={() => onStatusChange("SOLD")}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark as Sold
                  </DropdownMenuItem>
                )}
                {property.availability === "ACTIVE" && (
                  <DropdownMenuItem onClick={() => onStatusChange("DISABLED")}>
                    <Ban className="w-4 h-4 mr-2" /> Disable
                  </DropdownMenuItem>
                )}
                {property.availability === "DISABLED" && (
                  <DropdownMenuItem onClick={() => onStatusChange("ACTIVE")}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Enable
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
