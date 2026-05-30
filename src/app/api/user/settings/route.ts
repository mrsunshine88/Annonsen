import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        autoLocation: true, 
        defaultLocation: true,
        accountType: true,
        companyName: true,
        companyOrgNr: true,
        companyAddress: true,
        companyZipCode: true,
        companyCity: true,
        companyWebsite: true,
        companyOpeningHours: true,
        companyDescription: true,
        companyLogoUrl: true,
        companyPhone: true,
        canPublishAds: true,
        hasActiveSubscription: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Obehörig" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      autoLocation, defaultLocation,
      companyName, companyOrgNr, companyAddress, companyZipCode, companyCity,
      companyWebsite, companyOpeningHours, companyDescription, companyLogoUrl, companyPhone
    } = body;

    const updateData: any = {};
    if (typeof autoLocation === 'boolean') updateData.autoLocation = autoLocation;
    if (defaultLocation !== undefined) updateData.defaultLocation = defaultLocation === "" ? null : defaultLocation;
    
    // Företagsfält
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyOrgNr !== undefined) updateData.companyOrgNr = companyOrgNr;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (companyZipCode !== undefined) updateData.companyZipCode = companyZipCode;
    if (companyCity !== undefined) updateData.companyCity = companyCity;
    if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
    if (companyOpeningHours !== undefined) updateData.companyOpeningHours = companyOpeningHours;
    if (companyDescription !== undefined) updateData.companyDescription = companyDescription;
    if (companyLogoUrl !== undefined) updateData.companyLogoUrl = companyLogoUrl;
    if (companyPhone !== undefined) updateData.companyPhone = companyPhone;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: { 
        autoLocation: true, defaultLocation: true,
        accountType: true, companyName: true, companyOpeningHours: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Kunde inte spara inställningar" }, { status: 500 });
  }
}
