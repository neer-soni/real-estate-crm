"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Settings, Shield, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/providers/theme-provider";
import { useQuery } from "@tanstack/react-query";

function SecuritySettings({ user }: { user: any }) {
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    targetUserId: "",
    oldPassword: "",
    newPassword: "",
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      
      setSuccess(data.message);
      setForm({ targetUserId: "", oldPassword: "", newPassword: "" });
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Security & Passwords
        </CardTitle>
        <CardDescription>Manage your password or reset client passwords.</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <Label>Account to Update</Label>
              <Select 
                value={form.targetUserId} 
                onValueChange={(v) => setForm({ ...form, targetUserId: v === "self" ? "" : v, oldPassword: "" })}
              >
                <SelectTrigger><SelectValue placeholder="My Account (Self)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">My Account (Self)</SelectItem>
                  {clients?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!form.targetUserId && (
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input 
                type="password" 
                required 
                value={form.oldPassword} 
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} 
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input 
              type="password" 
              required 
              minLength={6}
              value={form.newPassword} 
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const user = session?.user;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                </div>
                <Badge variant={(user as any)?.role === "SUPER_ADMIN" ? "default" : "secondary"} className="mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  {(user as any)?.role === "SUPER_ADMIN" ? "Super Admin" : "Client"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {user && <SecuritySettings user={user} />}
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Switch between dark and light mode</p>
              </div>
              <Button variant="outline" onClick={toggleTheme} className="gap-2">
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">RealEstateAI CRM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
