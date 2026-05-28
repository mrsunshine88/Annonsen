import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Inga filer uppladdade" }, { status: 400 });
    }

    if (files.length > 3) {
      return NextResponse.json({ error: "Max 3 filer tillåtna" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // Skapa mappen om den inte finns
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignorera fel om den redan finns
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Skapa ett unikt filnamn för att undvika krockar
      const extension = file.name.split(".").pop();
      const filename = `${uuidv4()}.${extension}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      
      // Sökvägen som kan användas i <img> tags
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Kunde inte ladda upp filerna" }, { status: 500 });
  }
}
