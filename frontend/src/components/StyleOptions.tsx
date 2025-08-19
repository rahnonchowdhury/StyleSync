import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface StyleOptionsProps {
  options: Record<string, boolean>
  onOptionChange: (key: string, value: boolean) => void
}

export function StyleOptions({ options, onOptionChange }: StyleOptionsProps) {
  const optionConfig = [
    {
      key: 'colorPalette',
      label: 'Color Palette Matching',
      description: 'Extract and apply color schemes from reference video'
    },
    {
      key: 'contrastBrightness',
      label: 'Contrast & Brightness',
      description: 'Adjust contrast and brightness to match reference'
    },
    {
      key: 'filmGrain',
      label: 'Film Grain Effect',
      description: 'Add cinematic film grain texture'
    },
    {
      key: 'audioNormalization',
      label: 'Audio Normalization',
      description: 'Normalize audio levels for consistent playback'
    },
    {
      key: 'matchPacing',
      label: 'Match Pacing',
      description: 'Analyze and match the timing patterns of reference video'
    },
    {
      key: 'autoTransitions',
      label: 'Auto Transitions',
      description: 'Add smooth transitions between scenes'
    }
  ]

  return (
    <Card className="p-6 mb-8" data-testid="style-options">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Style Options</h3>
      <p className="text-slate-600 mb-6">
        Customize which aspects of the reference style to apply to your video
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {optionConfig.map((option) => (
          <div key={option.key} className="flex items-start space-x-3">
            <Switch
              id={option.key}
              checked={options[option.key] || false}
              onCheckedChange={(checked) => onOptionChange(option.key, checked)}
              data-testid={`switch-${option.key}`}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={option.key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </Label>
              <p className="text-xs text-slate-600">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}