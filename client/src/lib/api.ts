import { apiRequest } from "./queryClient";

export async function uploadVideos(formData: FormData) {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }
  
  return response.json();
}

export async function getJobStatus(jobId: string) {
  const response = await fetch(`/api/jobs/${jobId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch job status');
  }
  
  return response.json();
}

export async function getStyleTemplates() {
  const response = await fetch('/api/style-templates');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch style templates');
  }
  
  return response.json();
}

export function getDownloadUrl(jobId: string) {
  return `/api/download/${jobId}`;
}

export function getVideoPreviewUrl(filename: string) {
  return `/api/video/${filename}`;
}
