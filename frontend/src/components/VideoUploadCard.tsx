import { Upload, Video, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface VideoUploadCardProps {
  title: string
  description: string
  video: File | null
  onVideoChange: (video: File | null) => void
  required?: boolean
  'data-testid'?: string
}

export function VideoUploadCard({ 
  title, 
  description, 
  video, 
  onVideoChange, 
  required = false,
  'data-testid': testId
}: VideoUploadCardProps) {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    onVideoChange(file)
  }

  const handleRemove = () => {
    onVideoChange(null)
  }

  return (
    <Card className="p-6" data-testid={testId}>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      <p className="text-slate-600 mb-4">{description}</p>
      
      {!video ? (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">
            Choose a video file or drag and drop
          </p>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            id={`video-upload-${title}`}
            data-testid={`${testId}-input`}
          />
          <Button 
            variant="outline" 
            asChild
            data-testid={`${testId}-button`}
          >
            <label htmlFor={`video-upload-${title}`} className="cursor-pointer">
              Select Video
            </label>
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="w-6 h-6 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">{video.name}</p>
                <p className="text-sm text-slate-600">
                  {(video.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemove}
              data-testid={`${testId}-remove`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}