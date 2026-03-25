import { NextRequest, NextResponse } from 'next/server';

const KIE_UPLOAD_BASE = 'https://kieai.redpandaai.co';
const KIE_API_KEY = '0b15b757eba435178ae416758e4fb5c2';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB allowed.' },
        { status: 400 },
      );
    }

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('uploadPath', 'products');
    uploadForm.append('fileName', `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);

    const res = await fetch(`${KIE_UPLOAD_BASE}/api/file-stream-upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KIE_API_KEY}`,
      },
      body: uploadForm,
    });

    const json = await res.json();

    if (json.code !== 200) {
      throw new Error(json.msg || `Upload failed (code: ${json.code})`);
    }

    const downloadUrl = json.data?.downloadUrl || json.data?.fileUrl;
    if (!downloadUrl) {
      throw new Error('No download URL in response');
    }

    return NextResponse.json({ url: downloadUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 },
    );
  }
}
