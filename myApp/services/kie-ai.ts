import { readAsStringAsync } from 'expo-file-system/legacy';

const KIE_API_BASE = 'https://api.kie.ai';
const KIE_UPLOAD_BASE = 'https://kieai.redpandaai.co';
const KIE_API_KEY = '0b15b757eba435178ae416758e4fb5c2';

const headers = {
  Authorization: `Bearer ${KIE_API_KEY}`,
  'Content-Type': 'application/json',
};

export async function uploadImageBase64(localUri: string): Promise<string> {
  const base64 = await readAsStringAsync(localUri, {
    encoding: 'base64',
  });

  const res = await fetch(`${KIE_UPLOAD_BASE}/api/file-base64-upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base64Data: `data:image/jpeg;base64,${base64}`,
      uploadPath: 'tryon/uploads',
      fileName: `photo_${Date.now()}.jpg`,
    }),
  });

  const json = await res.json();
  if (!json.success || json.code !== 200) {
    throw new Error(json.msg || 'Fotoğraf yüklenemedi.');
  }
  return json.data.downloadUrl;
}

export async function createTryOnTask(
  userPhotoUrl: string,
  productImageUrl: string,
  productName: string,
): Promise<string> {
  const prompt = `Edit the image to dress the person using the provided clothing image ("${productName}"). Preserve their exact likeness, face, expression, hairstyle, skin tone, body shape, and proportions. Replace only the clothing, fitting the garment naturally to their existing pose and body geometry with realistic fabric behavior. Match lighting, shadows, and color temperature to the original photo so the outfit integrates photorealistically, without looking pasted on.`;

  const res = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'gpt-image/1.5-image-to-image',
      input: {
        input_urls: [userPhotoUrl, productImageUrl],
        prompt,
        aspect_ratio: '2:3',
        quality: 'medium',
      },
    }),
  });

  const json = await res.json();
  if (json.code !== 200 || !json.data?.taskId) {
    throw new Error(json.msg || 'AI görevi oluşturulamadı.');
  }
  return json.data.taskId;
}

export type TaskState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';

export interface TaskResult {
  state: TaskState;
  resultUrl: string | null;
  failMsg: string | null;
}

async function getTaskStatus(taskId: string): Promise<TaskResult> {
  const res = await fetch(
    `${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { headers: { Authorization: `Bearer ${KIE_API_KEY}` } },
  );
  const json = await res.json();
  if (json.code !== 200) {
    throw new Error(json.msg || 'Görev durumu alınamadı.');
  }

  const data = json.data;
  let resultUrl: string | null = null;

  if (data.state === 'success' && data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson);
      resultUrl = parsed.resultUrls?.[0] ?? null;
    } catch { /* */ }
  }

  return {
    state: data.state as TaskState,
    resultUrl,
    failMsg: data.failMsg || null,
  };
}

const POLL_INTERVAL = 3000;
const MAX_POLLS = 60;

export async function pollTaskResult(
  taskId: string,
  onProgress?: (state: TaskState) => void,
): Promise<string> {
  for (let i = 0; i < MAX_POLLS; i++) {
    const result = await getTaskStatus(taskId);
    onProgress?.(result.state);

    if (result.state === 'success') {
      if (!result.resultUrl) throw new Error('Sonuç URL\'si alınamadı.');
      return result.resultUrl;
    }

    if (result.state === 'fail') {
      throw new Error(result.failMsg || 'AI görsel oluşturma başarısız oldu.');
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  throw new Error('Zaman aşımı: AI görseli oluşturulamadı. Lütfen tekrar dene.');
}
