import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, Circle, Info } from "lucide-react";

interface ProcessingStatusProps {
  progress: number;
  isVisible: boolean;
}

export function ProcessingStatus({ progress, isVisible }: ProcessingStatusProps) {
  if (!isVisible) return null;

  const steps = [
    { key: 'analyze', label: 'Analyzing reference video', threshold: 25 },
    { key: 'extract', label: 'Extracting color palette', threshold: 40 },
    { key: 'apply', label: 'Applying style transfer', threshold: 80 },
    { key: 'finalize', label: 'Finalizing video', threshold: 100 },
  ];

  const getStepIcon = (step: typeof steps[0]) => {
    if (progress > step.threshold) {
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    } else if (progress > (step.threshold - 25)) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    } else {
      return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 ml-3">Processing Your Video</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Overall Progress</span>
            <span className="text-slate-900 font-medium" data-testid="text-progress">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {steps.map((step) => (
              <div key={step.key} className="flex items-center" data-testid={`status-step-${step.key}`}>
                {getStepIcon(step)}
                <span className="text-sm text-slate-600 ml-2">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mt-4">
            <p className="text-sm text-slate-600">
              <Info className="w-4 h-4 text-blue-500 inline mr-1" />
              Your video is being processed using advanced AI algorithms. You can leave this page and we'll email you when it's ready.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
