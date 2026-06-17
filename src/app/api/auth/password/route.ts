import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId, oldPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Changing another user's password
    if (targetUserId) {
      if ((session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: targetUserId },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Client password updated successfully" }, { status: 200 });
    } 
    
    // Changing own password
    else {
      if (!oldPassword) {
        return NextResponse.json({ error: "Old password is required to change your own password" }, { status: 400 });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(oldPassword, currentUser.password);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect old password" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Your password updated successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
