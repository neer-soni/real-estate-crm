"use client";

import React from "react";
import Link from "next/link";
import { Eye, Star, Trash2, MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatPrice, formatBHK, formatPropertyType, formatDate } from "@/lib/utils";

interface PropertyTableProps {
  properties: any[];
  isAdmin?: boolean;
  onStatusChange: (id: string, availability: string) => void;
  onFeatureToggle: (id: string, isFeatured: boolean) => void;
  onDelete: (id: string) => void;
}

export function PropertyTable({ properties, isAdmin = true, onStatusChange, onFeatureToggle, onDelete }: PropertyTableProps) {
  const availabilityVariant = (a: string) => {
    if (a === "ACTIVE") return "success" as const;
    if (a === "SOLD") return "hot" as const;
    return "secondary" as const;
  };

  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Property</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">BHK</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              {isAdmin && (
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Owner</th>
              )}
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b data-table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {property.images?.[0]?.url ? (
                        <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[200px]">{property.name}</p>
                      {property.builderName && (
                        <p className="text-xs text-muted-foreground">{property.builderName}</p>
                      )}
                    </div>
                    {property.isFeatured && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs">{formatPropertyType(property.propertyType)}</span>
                    <Badge variant={property.transactionType === "RENT" ? "info" : "purple"} className="text-[10px] w-fit">
                      {property.transactionType === "RENT" ? "Rent" : "Sale"}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-primary">{formatPrice(property.price)}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm">{property.locality}, {property.city}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{formatBHK(property.bhk)}</td>
                <td className="px-4 py-3">
                  <Badge variant={availabilityVariant(property.availability)}>{property.availability}</Badge>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {property.createdBy?.name || "—"}
                  </td>
                )}
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{formatDate(property.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/dashboard/properties/${property.id}`}>
                      <Button variant="ghost" size="xs"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="xs"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onFeatureToggle(property.id, !property.isFeatured)}>
                          <Star className="w-4 h-4 mr-2" /> {property.isFeatured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        {property.availability !== "SOLD" && (
                          <DropdownMenuItem onClick={() => onStatusChange(property.id, "SOLD")}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Sold
                          </DropdownMenuItem>
                        )}
                        {property.availability === "ACTIVE" ? (
                          <DropdownMenuItem onClick={() => onStatusChange(property.id, "DISABLED")}>
                            <Ban className="w-4 h-4 mr-2" /> Disable
                          </DropdownMenuItem>
                        ) : property.availability === "DISABLED" ? (
                          <DropdownMenuItem onClick={() => onStatusChange(property.id, "ACTIVE")}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Enable
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(property.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
