import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import os from "os";

const getSofficePath = () => {
  const platform = os.platform();
  if (platform === "win32") return `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;
  if (platform === "darwin") return "/Applications/LibreOffice.app/Contents/MacOS/soffice";
  return "/usr/bin/soffice";
};

const SOFFICE_PATH = getSofficePath();

export const POST = async (req) => {
  const requestId = randomUUID();
  const workDir = path.join(os.tmpdir(), `docshift-${requestId}`);

  try {
    await fs.mkdir(workDir, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file");
    const inputPath = path.join(workDir, "document.docx");
    
    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // Ejecutar conversión con Timeout de 30 segundos
    await new Promise((resolve, reject) => {
      const cmd = `${SOFFICE_PATH} --headless --convert-to pdf "${inputPath}" --outdir "${workDir}"`;
      
      const childProcess = exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });

      // Si tarda más de 30 seg, cancelamos para no saturar Render
      const timeout = setTimeout(() => {
        childProcess.kill();
        reject(new Error("La conversión tardó demasiado tiempo."));
      }, 30000);

      childProcess.on('exit', () => clearTimeout(timeout));
    });

    const outputPath = path.join(workDir, "document.pdf");
    const pdfBuffer = await fs.readFile(outputPath);

    return new Response(pdfBuffer, {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    });

  } catch (err) {
    console.error("--- ERROR EN EL SERVIDOR ---", err);
    return new Response(JSON.stringify({ error: "Fallo en la conversión" }), { status: 500 });
  } finally {
    fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
};