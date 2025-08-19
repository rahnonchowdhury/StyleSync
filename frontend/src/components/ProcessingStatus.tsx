import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Job } from '@/api/video'

interface ProcessingStatusProps {
  job: Job
}

export function ProcessingStatus({ job }: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'processing':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <Loader2 className="w-6 h-6 text-slate-400" />
    }
  }

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return 'Preparing to process...'
      case 'processing':
        return 'Processing your video...'
      case 'completed':
        return 'Video processing completed!'
      case 'failed':
        return 'Processing failed'
      default:
        return 'Unknown status'
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case 'processing':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  return (
    <Card className="p-6 mb-8" data-testid="processing-status">
      <div className="flex items-center space-x-4 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </h3>
          {job.errorMessage && (
            <p className="text-red-600 text-sm mt-1">{job.errorMessage}</p>
          )}
        </div>
      </div>
      
      {job.status === 'processing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="w-full" />
        </div>
      )}

      {job.status === 'completed' && job.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-slate-600">Processing Time</p>
            <p className="font-semibold text-slate-900">{job.metrics.processing_time}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Style Match</p>
            <p className="font-semibold text-slate-900">{job.metrics.style_match}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Colors Analyzed</p>
            <p className="font-semibold text-slate-900">{job.metrics.colors_analyzed.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600">Output Size</p>
            <p className="font-semibold text-slate-900">{job.metrics.output_size}</p>
          </div>
        </div>
      )}
    </Card>
  )
}