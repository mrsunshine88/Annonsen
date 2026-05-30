import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Funktion för att verifiera magic numbers (filsignaturer) för bilder
function isValidImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) return true;

  // WEBP: RIFF .... WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;

  return false;
}

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

    const urls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `Filen ${file.name} är för stor. Max 5 MB tillåtet.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (!isValidImage(buffer)) {
        return NextResponse.json({ error: `Filen ${file.name} är inte en giltig bild (endast JPG, PNG, WEBP).` }, { status: 400 });
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${uuidv4()}.${extension}`;

      // Ladda upp till Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: file.type || undefined,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      urls.push(blob.url);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: `Kunde inte ladda upp filerna: ${error.message}` }, { status: 500 });
  }
}
