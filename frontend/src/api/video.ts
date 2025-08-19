const API_BASE = '/api'

export interface StyleTemplate {
  id: string
  name: string
  description: string
  previewUrl?: string | null
}

export interface Job {
  id: string
  userVideoPath: string
  referenceVideoPath?: string | null
  styleTemplate?: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  outputPath?: string | null
  errorMessage?: string | null
  metrics?: {
    processing_time: string
    style_match: number
    colors_analyzed: number
    output_size: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface UploadResponse {
  success: boolean
  jobId: string
  message: string
}

export async function getStyleTemplates(): Promise<StyleTemplate[]> {
  const response = await fetch(`${API_BASE}/style-templates`)
  if (!response.ok) {
    throw new Error('Failed to fetch style templates')
  }
  return response.json()
}

export async function uploadVideos(formData: FormData): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE}/videos/upload`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Upload failed')
  }
  
  return response.json()
}

export async function getJobStatus(jobId: string): Promise<Job> {
  const response = await fetch(`${API_BASE}/jobs/${jobId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch job status')
  }
  
  return response.json()
}

export function getDownloadUrl(outputPath: string): string {
  return `${window.location.origin}/${outputPath}`
}