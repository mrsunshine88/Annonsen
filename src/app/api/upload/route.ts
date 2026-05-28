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

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const extension = file.name.split(".").pop();
      const filename = `${uuidv4()}.${extension}`;

      // Ladda upp till Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN // Valfritt men bra för Vercel
      });
      urls.push(blob.url);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Kunde inte ladda upp filerna" }, { status: 500 });
  }
}
