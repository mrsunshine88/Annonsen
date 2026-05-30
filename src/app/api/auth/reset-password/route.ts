import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Saknar fält" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Lösenordet måste vara minst 6 tecken" }, { status: 400 });
    }

    // Leta upp token i databasen
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: token }
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Ogiltig eller förfallen länk" }, { status: 400 });
    }

    // Kontrollera om den förfallit
    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({ where: { token: token } }); // Städa upp
      return NextResponse.json({ error: "Länken har förfallit" }, { status: 400 });
    }

    // Kryptera det nya lösenordet
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Databastransaktion för att uppdatera lösenord och radera token samtidigt
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: verificationToken.identifier },
        data: { password: hashedPassword }
      });

      await tx.verificationToken.delete({
        where: { token: token }
      });
    });

    return NextResponse.json({ success: true, message: "Lösenordet är uppdaterat" }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Ett internt fel uppstod" }, { status: 500 });
  }
}
