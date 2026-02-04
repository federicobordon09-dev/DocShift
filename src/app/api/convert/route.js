import { NextResponse } from "next/server";
import {
  writeFile,
  readFile,
  unlink,
  mkdir,
  access
} from "fs/promises";
import { execFile } from "child_process";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json(
      { error: "No se recibió archivo" },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const uploadsDir = path.join(process.cwd(), "tmp", "uploads");
  const outputDir = path.join(process.cwd(), "tmp", "output");

  // Detectar extensión del archivo (.doc o .docx)
  const fileExtension = file.name.endsWith(".doc") && !file.name.endsWith(".docx") ? "doc" : "docx";
  const inputPath = path.join(uploadsDir, `${id}.${fileExtension}`);
  const outputPath = path.join(outputDir, `${id}.pdf`);

  try {
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    const sofficeExe =
      process.platform === "win32"
        ? "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
        : "soffice";

    const args = [
      "--headless",
      "--nologo",
      "--nofirststartwizard",
      "--convert-to",
      "pdf",
      inputPath,
      "--outdir",
      outputDir,
    ];

    await new Promise((resolve, reject) => {
      execFile(
        sofficeExe,
        args,
        { timeout: 60000 }, // 60 segundos reales
        (error) => {
          if (error) {
            if (error.killed) {
              reject({ type: "TIMEOUT" });
            } else {
              reject({ type: "EXEC_ERROR", error });
            }
          } else {
            resolve();
          }
        }
      );
    });

    // verificar que el PDF exista
    try {
      await access(outputPath);
    } catch {
      throw { type: "NO_OUTPUT" };
    }

    const pdf = await readFile(outputPath);

    await unlink(inputPath);
    await unlink(outputPath);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="docshift.pdf"',
      },
    });
  } catch (err) {
    console.error("Error LibreOffice:", err);

    try { await unlink(inputPath); } catch {}
    try { await unlink(outputPath); } catch {}

    let message = "Error desconocido al convertir el documento";

    if (err.type === "TIMEOUT") {
      message = "La conversión tardó demasiado. Probá con otro archivo.";
    } else if (err.type === "EXEC_ERROR") {
      message = "LibreOffice no pudo procesar el archivo.";
    } else if (err.type === "NO_OUTPUT") {
      message = "No se pudo generar el PDF.";
    }

    return NextResponse.json(
      { error: message },
      { status: 422 }
    );
  }
}
