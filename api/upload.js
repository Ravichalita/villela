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
    const blob = await put(filePath, req, {
      access: 'private',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
}
