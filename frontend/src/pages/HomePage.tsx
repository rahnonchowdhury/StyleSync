import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { VideoUploadCard } from '@/components/VideoUploadCard'
import { ProcessingStatus } from '@/components/ProcessingStatus'
import { ResultsSection } from '@/components/ResultsSection'
import { StyleOptions } from '@/components/StyleOptions'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getStyleTemplates, uploadVideos, getJobStatus } from '@/api/video'

export function HomePage() {
  const { toast } = useToast()
  
  // State for uploaded videos
  const [userVideo, setUserVideo] = useState<File | null>(null)
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>()
  
  // State for processing
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Style options
  const [styleOptions, setStyleOptions] = useState({
    colorPalette: true,
    contrastBrightness: true,
    filmGrain: false,
    matchPacing: true,
    autoTransitions: false,
    speedAdjustments: false,
    audioNormalization: true,
    backgroundMusic: false,
    soundEffects: false,
  })

  // Fetch style templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/style-templates'],
    queryFn: getStyleTemplates,
  })

  // Poll job status
  const { data: currentJob } = useQuery({
    queryKey: ['/api/jobs', currentJobId],
    queryFn: () => currentJobId ? getJobStatus(currentJobId) : null,
    enabled: !!currentJobId,
    refetchInterval: (query) => {
      // Stop polling when job is completed or failed
      const data = query?.state?.data
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      return 2000 // Poll every 2 seconds
    },
  })

  // Show success/error toast when job completes
  useEffect(() => {
    if (currentJob?.status === 'completed') {
      toast({
        title: "Video processing completed!",
        description: "Your styled video is ready for download.",
      })
    } else if (currentJob?.status === 'failed') {
      toast({
        title: "Processing failed",
        description: currentJob.errorMessage || "Something went wrong during processing.",
        variant: "destructive",
      })
    }
  }, [currentJob?.status, toast])

  const handleStyleOptionChange = (key: string, value: boolean) => {
    setStyleOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleProcessVideo = async () => {
    if (!userVideo) {
      toast({
        title: "User video required",
        description: "Please upload your video first.",
        variant: "destructive",
      })
      return
    }

    if (!referenceVideo && !selectedTemplate) {
      toast({
        title: "Reference required",
        description: "Please upload a reference video or select a style template.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('userVideo', userVideo)
      if (referenceVideo) {
        formData.append('referenceVideo', referenceVideo)
      }
      if (selectedTemplate) {
        formData.append('styleTemplate', selectedTemplate)
      }
      formData.append('options', JSON.stringify(styleOptions))

      const response = await uploadVideos(formData)
      setCurrentJobId(response.jobId)
      
      toast({
        title: "Upload successful!",
        description: "Your videos are being processed. This may take a few minutes.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getCurrentStep = () => {
    if (!currentJob) return 1
    if (currentJob.status === 'processing') return 2
    if (currentJob.status === 'completed') return 3
    return 1
  }

  const stepClasses = (step: number) => {
    const currentStep = getCurrentStep()
    if (step <= currentStep) {
      return "w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold"
    }
    return "w-10 h-10 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center font-semibold"
  }

  const stepTextClasses = (step: number) => {
    const currentStep = getCurrentStep()
    if (step <= currentStep) {
      return "ml-2 font-medium text-slate-900"
    }
    return "ml-2 font-medium text-slate-400"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Transform Your Videos with{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              AI Style Transfer
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Upload a reference video and we'll analyze its actual style characteristics - color temperature, contrast, 
            saturation, and brightness patterns. Your video will be transformed to match the specific look of your reference.
          </p>
        </div>
      </section>

      {/* Main Application */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className={stepClasses(1)} data-testid="step-indicator-1">1</div>
              <span className={stepTextClasses(1)}>Upload Videos</span>
            </div>
            <div className="w-16 h-1 bg-slate-200 rounded"></div>
            <div className="flex items-center">
              <div className={stepClasses(2)} data-testid="step-indicator-2">2</div>
              <span className={stepTextClasses(2)}>Processing</span>
            </div>
            <div className="w-16 h-1 bg-slate-200 rounded"></div>
            <div className="flex items-center">
              <div className={stepClasses(3)} data-testid="step-indicator-3">3</div>
              <span className={stepTextClasses(3)}>Download</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <VideoUploadCard 
            title="Your Video"
            description="Upload the video you want to transform"
            video={userVideo}
            onVideoChange={setUserVideo}
            required
            data-testid="user-video-upload"
          />
          <VideoUploadCard 
            title="Reference Video (Optional)"
            description="Upload a reference video to extract style from, or select a template below"
            video={referenceVideo}
            onVideoChange={setReferenceVideo}
            data-testid="reference-video-upload"
          />
        </div>

        {/* Template Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Style Templates</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
                data-testid={`template-${template.id}`}
              >
                <h4 className="font-medium text-slate-900 mb-2">{template.name}</h4>
                <p className="text-sm text-slate-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Style Options */}
        <StyleOptions 
          options={styleOptions}
          onOptionChange={handleStyleOptionChange}
        />

        {/* Process Button */}
        <div className="text-center mb-12">
          <Button 
            onClick={handleProcessVideo}
            disabled={isUploading || currentJob?.status === 'processing'}
            size="lg"
            className="bg-primary text-white hover:bg-primary/90"
            data-testid="button-process-video"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Transform Video'}
          </Button>
        </div>

        {/* Processing Status */}
        {currentJob && (
          <ProcessingStatus job={currentJob} />
        )}

        {/* Results */}
        {currentJob?.status === 'completed' && (
          <ResultsSection job={currentJob} />
        )}
      </main>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Advanced AI analyzes and applies video characteristics with precision</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Color Analysis</h3>
              <p className="text-slate-600">Advanced computer vision extracts and maps color palettes, gradients, and lighting patterns with precision.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-emerald-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Editing</h3>
              <p className="text-slate-600">Machine learning identifies optimal cut points, transitions, and pacing to match reference videos.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Audio Enhancement</h3>
              <p className="text-slate-600">Automatic audio normalization, noise reduction, and soundtrack synchronization for professional results.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}