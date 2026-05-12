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

    if (fileData.length === 0) {
      console.error('O corpo da requisição está vazio.');
      return res.status(400).json({ error: 'Empty request body' });
    }

    const blob = await put(filePath, fileData, {
      access: 'private',
      contentType: req.headers['content-type'] || 'application/octet-stream',
      addRandomSuffix: false
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
}
