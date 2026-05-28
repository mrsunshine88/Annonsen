import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hämta alla användare
export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isRoot: true,
        isBlocked: true,
        createdAt: true,
        accountType: true,
        companyName: true,
        customCompanyAdPrice: true,
        customCompanySubscriptionPrice: true,
        _count: {
          select: { ads: true }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att hämta användare" }, { status: 500 });
  }
}

// Uppdatera användarstatus (blockera/admin)
export async function PUT(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { userId, action, value } = await req.json();

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Du kan inte ändra din egen status" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.isRoot) {
      return NextResponse.json({ error: "Root-kontot kan inte modifieras" }, { status: 403 });
    }

    let dataToUpdate = {};
    if (action === "toggleBlock") dataToUpdate = { isBlocked: value };
    else if (action === "toggleAdmin") dataToUpdate = { isAdmin: value };
    else return NextResponse.json({ error: "Ogiltig åtgärd" }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}

// Radera konto helt
export async function DELETE(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Obehörig" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "Saknar userId" }, { status: 400 });
    if (userId === session.user.id) return NextResponse.json({ error: "Du kan inte radera dig själv" }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.isRoot) {
      return NextResponse.json({ error: "Root-kontot kan inte raderas" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gick inte att radera" }, { status: 500 });
  }
}
