import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { randomUUID } from "crypto";

const TMP_DIR = "/tmp"; // Directorio temporal seguro en Render
const UPLOADS_DIR = path.join(TMP_DIR, "uploads");
const OUTPUT_DIR = path.join(TMP_DIR, "output");

// En Docker con LibreOffice instalado, soffice siempre estará aquí
const SOFFICE_PATH = "/usr/bin/soffice";

// Función para convertir Word a PDF
const convertToPdf = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
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
};

export const POST = async (req) => {
  let inputPath, outputPath;

  try {
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

    // Guardar archivo temporal
    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // Verificar LibreOffice
    try {
      await fs.access(SOFFICE_PATH);
    } catch {
      return new Response(
        JSON.stringify({ error: "No se encontró LibreOffice (soffice). Instalalo en el servidor." }),
        { status: 500 }
      );
    }

    // Convertir a PDF
    await convertToPdf(inputPath, OUTPUT_DIR);

    // Leer PDF generado
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
    // Limpiar archivos temporales aunque haya error
    if (inputPath) await fs.rm(inputPath, { force: true }).catch(() => {});
    if (outputPath) await fs.rm(outputPath, { force: true }).catch(() => {});
  }
};
