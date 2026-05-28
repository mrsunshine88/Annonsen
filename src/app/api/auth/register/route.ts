import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      name, 
      accountType, 
      companyName, 
      companyOrgNr, 
      companyAddress, 
      companyZipCode, 
      companyCity, 
      companyWebsite,
      companyOpeningHours,
      companyDescription 
    } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "E-post och lösenord krävs" }, { status: 400 });
    }

    // Kolla om e-post redan finns
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-postadressen används redan" }, { status: 400 });
    }

    // Kryptera lösenord
    const hashedPassword = await bcrypt.hash(password, 10);

    // Skapa användare
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        accountType: accountType || "Privat",
        companyName: accountType === "Företag" ? companyName : null,
        companyOrgNr: accountType === "Företag" ? companyOrgNr : null,
        companyAddress: accountType === "Företag" ? companyAddress : null,
        companyZipCode: accountType === "Företag" ? companyZipCode : null,
        companyCity: accountType === "Företag" ? companyCity : null,
        companyWebsite: accountType === "Företag" ? companyWebsite : null,
        companyOpeningHours: accountType === "Företag" ? companyOpeningHours : null,
        companyDescription: accountType === "Företag" ? companyDescription : null,
      }
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Kunde inte registrera kontot" }, { status: 500 });
  }
}
