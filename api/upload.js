import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Pegamos o nome da pasta e do arquivo pelos cabeçalhos
  let folder = req.headers['x-folder-name'];
  const fileName = req.headers['x-file-name'] || 'file';

  if (!folder) {
    folder = 'outros';
  }

  const filePath = folder === 'root' ? fileName : `${folder}/${fileName}`;

  try {
    // Ler o stream manualmente para um Buffer (suporta envio cru)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    let fileData = Buffer.concat(chunks);

    // Se o stream estiver vazio, o Vercel ou o servidor de dev local (ex: express) 
    // já pode ter parseado o corpo automaticamente. Vamos tentar usar o req.body
    if (fileData.length === 0 && req.body) {
      if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        fileData = req.body;
      } else {
        // Se foi parseado como JSON ou objeto
        fileData = JSON.stringify(req.body);
        if (fileData === '{}') fileData = '';
      }
    }

    // Se ainda estiver vazio (mesmo após os fallbacks), em vez de falhar,
    // colocamos um texto de aviso para sabermos que chegou vazio.
    if (fileData.length === 0 || (typeof fileData === 'string' && fileData.trim() === '')) {
      fileData = Buffer.from("ERRO DIAGNÓSTICO: O Vercel recebeu um corpo vazio do formulário.", "utf-8");
    }

    // Para arquivos de texto (briefing.txt), convertemos o Buffer explicitamente
    // para String. Algumas versões internas do Vercel Blob (undici/fetch)
    // falham ao ler Buffers puros, resultando em uploads de 0 bytes.
    let finalBody = fileData;
    if (fileName.endsWith('.txt') || fileName.endsWith('.doc')) {
      finalBody = Buffer.isBuffer(fileData) ? fileData.toString('utf8') : String(fileData);
    }

    const blob = await put(filePath, finalBody, {
      access: 'public',
      contentType: req.headers['content-type'] || 'application/octet-stream',
      addRandomSuffix: false,
      allowOverwrite: true
    });

    return res.status(200).json({ ...blob, uploadedSize: finalBody.length });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
}
