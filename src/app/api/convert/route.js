import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { randomUUID } from "crypto";

const TMP_DIR = "/tmp"; // Usar directorio temporal de Render
const UPLOADS_DIR = path.join(TMP_DIR, "uploads");
const OUTPUT_DIR = path.join(TMP_DIR, "output");
const DEFAULT_SOFFICE_CANDIDATES = [
  process.env.LIBREOFFICE_PATH,
  "/usr/bin/soffice", // path típico en Render
].filter(Boolean);

const resolveSofficePath = async () => {
  for (const candidate of DEFAULT_SOFFICE_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch (error) {
      // Ignorar
    }
  }
  return null;
};

export const POST = async (req) => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) return new Response(JSON.stringify({ error: "No se recibió ningún archivo" }), { status: 400 });

    const filename = file.name;
    const extension = path.extname(filename).toLowerCase();
    if (![".docx", ".doc"].includes(extension))
      return new Response(JSON.stringify({ error: "Solo se permiten archivos Word (.docx, .doc)" }), { status: 422 });

    const uniqueName = `${randomUUID()}${extension}`;
    const inputPath = path.join(UPLOADS_DIR, uniqueName);
    const outputPath = path.join(OUTPUT_DIR, uniqueName.replace(extension, ".pdf"));

    // Guardar archivo
    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // Verificar LibreOffice
    const sofficePath = await resolveSofficePath();
    if (!sofficePath)
      return new Response(
        JSON.stringify({ error: "No se encontró LibreOffice (soffice). Instalalo en el servidor." }),
        { status: 500 }
      );

    // Comando de conversión
    const libreCmd = `"${sofficePath}" --headless --nologo --nofirststartwizard --convert-to pdf "${inputPath}" --outdir "${OUTPUT_DIR}"`;

    await new Promise((resolve, reject) => {
      exec(libreCmd, (err, stdout, stderr) => {
        if (err) {
          console.error("LibreOffice STDOUT:", stdout);
          console.error("LibreOffice STDERR:", stderr);
          return reject(new Error("LibreOffice no pudo procesar el archivo. Verificá que sea un Word válido."));
        }
        resolve();
      });
    });

    const pdfBuffer = await fs.readFile(outputPath);

    // Limpiar archivos temporales
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="docshift.pdf"`,
      },
    });
  } catch (err) {
    console.error("Error en conversión:", err);
    return new Response(JSON.stringify({ error: err.message || "Error desconocido en la conversión" }), { status: 422 });
  }
};
