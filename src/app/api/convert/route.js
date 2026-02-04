import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

const TMP_DIR = path.join(process.cwd(), "tmp");
const UPLOADS_DIR = path.join(TMP_DIR, "uploads");
const OUTPUT_DIR = path.join(TMP_DIR, "output");

export const POST = async (req) => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No se recibió ningún archivo" }), { status: 400 });
    }

    const filename = file.name;
    const extension = path.extname(filename).toLowerCase();

    if (extension !== ".docx" && extension !== ".doc") {
      return new Response(JSON.stringify({ error: "Solo se permiten archivos Word (.docx, .doc)" }), { status: 422 });
    }

    const uniqueName = uuidv4() + extension;
    const inputPath = path.join(UPLOADS_DIR, uniqueName);
    const outputPath = path.join(OUTPUT_DIR, uniqueName.replace(extension, ".pdf"));

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    // Comando Linux
    const libreCmd = `soffice --headless --nologo --nofirststartwizard --convert-to pdf "${inputPath}" --outdir "${OUTPUT_DIR}"`;

    // Ejecutar LibreOffice
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

    // Leer PDF generado
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
