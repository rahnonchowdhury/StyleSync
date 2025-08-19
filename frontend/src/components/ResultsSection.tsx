import { Download, Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Job, getDownloadUrl } from '@/api/video'

interface ResultsSectionProps {
  job: Job
}

export function ResultsSection({ job }: ResultsSectionProps) {
  if (!job.outputPath) {
    return null
  }

  const downloadUrl = getDownloadUrl(job.outputPath)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `styled-video-${job.id}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="p-6" data-testid="results-section">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Your Styled Video is Ready! 🎉
        </h3>
        <p className="text-slate-600">
          Your video has been successfully transformed with AI style transfer
        </p>
      </div>

      <div className="space-y-4">
        {/* Video Preview */}
        <div className="bg-black rounded-lg overflow-hidden">
          <video 
            controls 
            className="w-full h-auto"
            data-testid="video-preview"
          >
            <source src={downloadUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Download Button */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleDownload}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-download"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Video
          </Button>
        </div>

        {/* Processing Summary */}
        {job.metrics && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Processing Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{job.metrics.style_match}%</p>
                <p className="text-sm text-slate-600">Style Match</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{job.metrics.colors_analyzed.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Colors Analyzed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{job.metrics.processing_time}</p>
                <p className="text-sm text-slate-600">Processing Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{job.metrics.output_size}</p>
                <p className="text-sm text-slate-600">File Size</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}