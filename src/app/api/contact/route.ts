import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Saknar obligatoriska fält" }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fel vid skapande av kontaktmeddelande:", error);
    return NextResponse.json({ error: "Internt serverfel" }, { status: 500 });
  }
}
