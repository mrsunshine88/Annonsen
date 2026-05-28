import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

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
    const useVercelBlob = process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== "ersätt_mig_med_din_riktiga_token_från_vercel";

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const extension = file.name.split(".").pop();
      const filename = `${uuidv4()}.${extension}`;

      if (useVercelBlob) {
        // Ladda upp till Vercel Blob
        const blob = await put(filename, buffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN // Valfritt, Vercel plockar den från env, men bra att vara explicit
        });
        urls.push(blob.url);
      } else {
        // Lokal fallback (fs)
        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {
          // Ignorera fel om den redan finns
        }
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        urls.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Kunde inte ladda upp filerna" }, { status: 500 });
  }
}
