import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share, CheckCircle } from "lucide-react";
import { getDownloadUrl } from "@/lib/api";

interface ResultsSectionProps {
  jobId: string;
  originalVideoUrl?: string;
  isVisible: boolean;
  metrics?: {
    processing_time?: string;
    style_match?: number;
    colors_analyzed?: number;
    output_size?: string;
  };
}

export function ResultsSection({ jobId, originalVideoUrl, isVisible, metrics }: ResultsSectionProps) {
  if (!isVisible) return null;

  const handleDownload = (quality: 'hd' | 'sd') => {
    const url = getDownloadUrl(jobId);
    const link = document.createElement('a');
    link.href = url;
    link.download = `styled_video_${jobId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'My Styled Video',
        text: 'Check out my video styled with AI!',
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 ml-3">Your Video is Ready!</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {originalVideoUrl && (
            <div>
              <h4 className="font-medium text-slate-700 mb-3">Original Video</h4>
              <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden">
                <video 
                  className="w-full h-full object-cover" 
                  controls
                  src={originalVideoUrl}
                  data-testid="video-original"
                />
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-slate-700 mb-3">Styled Video</h4>
            <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden">
              <video 
                className="w-full h-full object-cover" 
                controls
                src={getDownloadUrl(jobId)}
                data-testid="video-styled"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-medium">
                  NEW
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => handleDownload('hd')}
            className="bg-primary text-white hover:bg-primary/90"
            data-testid="button-download-hd"
          >
            <Download className="w-4 h-4 mr-2" />
            Download HD (1080p)
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleDownload('sd')}
            data-testid="button-download-sd"
          >
            <Download className="w-4 h-4 mr-2" />
            Download SD (720p)
          </Button>
          <Button 
            variant="outline"
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>

        <div className="mt-6 bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900" data-testid="stat-processing-time">
                {metrics?.processing_time || '0:00'}
              </div>
              <div className="text-sm text-slate-600">Processing Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900" data-testid="stat-style-match">
                {metrics?.style_match || 0}%
              </div>
              <div className="text-sm text-slate-600">Style Match</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900" data-testid="stat-colors-analyzed">
                {metrics?.colors_analyzed?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-slate-600">Colors Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900" data-testid="stat-output-size">
                {metrics?.output_size || '0MB'}
              </div>
              <div className="text-sm text-slate-600">Output Size</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
