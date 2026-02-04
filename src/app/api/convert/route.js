import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { exec } from "child_process";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No se subió ningún archivo" }), { status: 400 });
    }

    const uploadDir = "/tmp/uploads";
    const outputDir = "/tmp/output";
    await mkdir(uploadDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    const inputPath = path.join(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    const cmd = `soffice --headless --nologo --nofirststartwizard --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

    await new Promise((resolve, reject) => {
      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const outputPath = path.join(outputDir, file.name.replace(/\.[^/.]+$/, ".pdf"));
    const pdfBuffer = await readFile(outputPath);

    return new Response(pdfBuffer, { headers: { "Content-Type": "application/pdf" } });

  } catch (err) {
    console.error("Error LibreOffice:", err);
    return new Response(JSON.stringify({ error: "No se pudo convertir el archivo. Intentá de nuevo." }), { status: 500 });
  }
}
