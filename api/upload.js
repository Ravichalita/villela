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
  const folder = req.headers['x-folder-name'] || 'outros';
  const fileName = req.headers['x-file-name'] || 'file';

  try {
    const blob = await put(`${folder}/${fileName}`, req, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
}
