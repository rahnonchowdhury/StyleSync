import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VideoUploadCard } from "@/components/video-upload-card";
import { StyleOptions } from "@/components/style-options";
import { ProcessingStatus } from "@/components/processing-status";
import { ResultsSection } from "@/components/results-section";
import { uploadVideos, getJobStatus, getStyleTemplates } from "@/lib/api";
import { Sparkles, Play } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  
  // State for uploads
  const [userVideo, setUserVideo] = useState<File | null>(null);
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  
  // State for processing
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
  });

  // Fetch style templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/style-templates'],
    queryFn: getStyleTemplates,
  });

  // Poll job status
  const { data: currentJob } = useQuery({
    queryKey: ['/api/jobs', currentJobId],
    queryFn: () => currentJobId ? getJobStatus(currentJobId) : null,
    enabled: !!currentJobId,
    refetchInterval: (query) => {
      // Stop polling when job is completed or failed
      const data = query?.state?.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Show success/error toast when job completes
  useEffect(() => {
    if (currentJob?.status === 'completed') {
      toast({
        title: "Video processing completed!",
        description: "Your styled video is ready for download.",
      });
    } else if (currentJob?.status === 'failed') {
      toast({
        title: "Processing failed",
        description: currentJob.errorMessage || "Something went wrong during processing.",
        variant: "destructive",
      });
    }
  }, [currentJob?.status, toast]);

  const handleStyleOptionChange = (key: string, value: boolean) => {
    setStyleOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleProcessVideo = async () => {
    if (!userVideo) {
      toast({
        title: "User video required",
        description: "Please upload your video first.",
        variant: "destructive",
      });
      return;
    }

    if (!referenceVideo && !selectedTemplate) {
      toast({
        title: "Reference required",
        description: "Please upload a reference video or select a style template.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('userVideo', userVideo);
      if (referenceVideo) {
        formData.append('referenceVideo', referenceVideo);
      }
      if (selectedTemplate) {
        formData.append('styleTemplate', selectedTemplate);
      }
      formData.append('options', JSON.stringify(styleOptions));

      const response = await uploadVideos(formData);
      setCurrentJobId(response.jobId);
      
      toast({
        title: "Upload successful!",
        description: "Your videos are being processed. This may take a few minutes.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getCurrentStep = () => {
    if (!currentJob) return 1;
    if (currentJob.status === 'processing') return 2;
    if (currentJob.status === 'completed') return 3;
    return 1;
  };

  const stepClasses = (step: number) => {
    const currentStep = getCurrentStep();
    if (step <= currentStep) {
      return "w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold";
    }
    return "w-10 h-10 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center font-semibold";
  };

  const stepTextClasses = (step: number) => {
    const currentStep = getCurrentStep();
    if (step <= currentStep) {
      return "ml-2 font-medium text-slate-900";
    }
    return "ml-2 font-medium text-slate-400";
  };

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
            Upload your video and match it to any influencer's style. Automatic color grading, transitions, pacing, and audio enhancements powered by advanced AI.
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
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <VideoUploadCard
            type="user"
            selectedFile={userVideo}
            onFileSelect={setUserVideo}
            onFileRemove={() => setUserVideo(null)}
          />
          
          <VideoUploadCard
            type="reference"
            selectedFile={referenceVideo}
            onFileSelect={(file) => {
              setReferenceVideo(file);
              setSelectedTemplate(undefined);
            }}
            onFileRemove={() => setReferenceVideo(null)}
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={(templateId) => {
              setSelectedTemplate(templateId);
              setReferenceVideo(null);
            }}
          />
        </div>

        {/* Style Options */}
        <div className="mb-8">
          <StyleOptions
            options={styleOptions}
            onOptionChange={handleStyleOptionChange}
          />
        </div>

        {/* Process Button */}
        {!currentJob && (
          <div className="text-center mb-12">
            <Button
              size="lg"
              onClick={handleProcessVideo}
              disabled={isUploading}
              className="bg-gradient-to-r from-primary to-emerald-500 text-white hover:from-primary/90 hover:to-emerald-500/90 px-12 py-4 text-lg shadow-lg"
              data-testid="button-apply-style-transfer"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isUploading ? "Uploading..." : "Apply Style Transfer"}
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              Processing typically takes 2-5 minutes depending on video length
            </p>
          </div>
        )}

        {/* Processing Status */}
        <div className="mb-8">
          <ProcessingStatus
            progress={currentJob?.progress || 0}
            isVisible={currentJob?.status === 'processing'}
          />
        </div>

        {/* Results */}
        <ResultsSection
          jobId={currentJob?.id || ''}
          originalVideoUrl={userVideo ? URL.createObjectURL(userVideo) : undefined}
          isVisible={currentJob?.status === 'completed'}
          metrics={currentJob?.metadata}
        />
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our cutting-edge algorithms analyze and replicate video styles with unprecedented accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-palette text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Color Analysis</h3>
              <p className="text-slate-600">Advanced computer vision extracts and maps color palettes, gradients, and lighting patterns with precision.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cut text-2xl text-emerald-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Editing</h3>
              <p className="text-slate-600">Machine learning identifies optimal cut points, transitions, and pacing to match reference videos.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-waveform-lines text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Audio Enhancement</h3>
              <p className="text-slate-600">Automatic audio normalization, noise reduction, and soundtrack synchronization for professional results.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
