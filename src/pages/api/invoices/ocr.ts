import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Client, ClientCredentials } from '@lucidtech/las-sdk-node';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "No autenticado" });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { fileContent, fileName } = req.body;
    if (!fileContent || !fileName) {
      return res.status(400).json({ error: "Archivo no proporcionado" });
    }

    // Prepare credentials from environment variables
    const client = new Client(new ClientCredentials(
      'https://api.lucidtech.ai/v1',
      process.env.CRADL_CLIENT_ID!,
      process.env.CRADL_CLIENT_SECRET!,
      'auth.lucidtech.ai'
    ));

    // Decode base64 file content
    const buffer = Buffer.from(fileContent, 'base64');
    const contentType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

    // Upload document
    const documentResponse = await client.createDocument(buffer, contentType);

    // Predict using your model
    const prediction = await client.createPrediction(
      documentResponse.documentId,
      process.env.CRADL_MODEL_ID!
    );

    // Extract fields from prediction
    let authorization_code = "", name = "", nit = "", nit_ci_cex = "", number_receipt = "", purchase_date = "", total_amount = "", vendor = "";
    
    if (prediction.predictions) {
      for (const p of prediction.predictions) {
        switch(p.label) {
          case "authorization_code":
            authorization_code = p.value ? String(p.value) : "";
            break;
          case "name":
            name = p.value ? String(p.value) : "";
            break;
          case "nit":
            nit = p.value ? String(p.value) : "";
            break;
          case "nit_ci_cex":
            nit_ci_cex = p.value ? String(p.value) : "";
            break;
          case "number_receipt":
            number_receipt = p.value ? String(p.value) : "";
            break;
          case "purchase_date":
            purchase_date = p.value ? String(p.value) : "";
            break;
          case "total_amount":
            total_amount = p.value ? String(p.value) : "";
            break;
          case "vendor":
            vendor = p.value ? String(p.value) : "";
            break;
        }
      }
    }
    
    return res.status(200).json({ 
      authorization_code,
      name,
      nit,
      nit_ci_cex,
      number_receipt,
      purchase_date,
      total_amount,
      vendor
    });
  } catch (e: unknown) {
    console.error("OCR error:", e);
    return res.status(500).json({ error: "Error en OCR: " + (e instanceof Error ? e.message : String(e)) });
  }
}
