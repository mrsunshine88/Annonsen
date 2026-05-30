import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-post saknas" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    
    // Sök efter användaren
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // 💡 ANTI-USER-ENUMERATION:
    // Oavsett om användaren finns eller inte, svarar vi 200 OK.
    // Hackare ska inte kunna veta vilka e-postadresser som är registrerade.
    if (!user) {
      return NextResponse.json({ success: true, message: "Om e-postadressen finns i vårt system har instruktioner skickats." }, { status: 200 });
    }

    // Skapa kryptografisk token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 timme

    // Spara i databasen
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: token,
        expires: expiresAt
      }
    });

    // Skicka e-post
    await sendPasswordResetEmail(normalizedEmail, token);

    return NextResponse.json({ success: true, message: "Om e-postadressen finns i vårt system har instruktioner skickats." }, { status: 200 });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Ett internt fel uppstod" }, { status: 500 });
  }
}
