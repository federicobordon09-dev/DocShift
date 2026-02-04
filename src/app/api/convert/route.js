import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { randomUUID } from "crypto";

const TMP_DIR = "/tmp"; 
const UPLOADS_DIR = path.join(TMP_DIR, "uploads");
const OUTPUT_DIR = path.join(TMP_DIR, "output");

const SOFFICE_PATH = "/usr/bin/soffice";

// Limpiar directorios temporales
const cleanTmp = async () => {
  await fs.rm(UPLOADS_DIR, { recursive: true, force: true }).catch(() => {});
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true }).catch(() => {});
};

// Convertir Word a PDF
const convertToPdf = (inputPath, outputDir) =>
  new Promise((resolve, reject) => {
    const cmd = `"${SOFFICE_PATH}" --headless --nologo --nofirststartwizard --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("LibreOffice STDOUT:", stdout);
        console.error("LibreOffice STDERR:", stderr);
        return reject(new Error("LibreOffice no pudo procesar el archivo. Verificá que sea un Word válido."));
      }
      resolve();
    });
  });

export const POST = async (req) => {
  let inputPath, outputPath;

  try {
    // Limpiar cualquier tmp residual antes de trabajar
    await cleanTmp();

    // Crear directorios temporales
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
    inputPath = path.join(UPLOADS_DIR, uniqueName);
    outputPath = path.join(OUTPUT_DIR, uniqueName.replace(extension, ".pdf"));

    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // Verificar LibreOffice
    try {
      await fs.access(SOFFICE_PATH);
    } catch {
      return new Response(JSON.stringify({ error: "No se encontró LibreOffice (soffice). Instalalo en el servidor." }), { status: 500 });
    }

    await convertToPdf(inputPath, OUTPUT_DIR);

    const pdfBuffer = await fs.readFile(outputPath);

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
  } finally {
    // Limpiar archivos temporales al final
    await cleanTmp();
  }
};
