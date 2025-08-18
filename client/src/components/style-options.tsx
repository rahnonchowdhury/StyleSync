import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface StyleOptionsProps {
  options: {
    colorPalette: boolean;
    contrastBrightness: boolean;
    filmGrain: boolean;
    matchPacing: boolean;
    autoTransitions: boolean;
    speedAdjustments: boolean;
    audioNormalization: boolean;
    backgroundMusic: boolean;
    soundEffects: boolean;
  };
  onOptionChange: (key: string, value: boolean) => void;
}

export function StyleOptions({ options, onOptionChange }: StyleOptionsProps) {
  const optionGroups = [
    {
      title: "Color & Grading",
      options: [
        { key: 'colorPalette', label: 'Color palette matching', default: true },
        { key: 'contrastBrightness', label: 'Contrast & brightness', default: true },
        { key: 'filmGrain', label: 'Film grain effects', default: false },
      ]
    },
    {
      title: "Timing & Cuts",
      options: [
        { key: 'matchPacing', label: 'Match pacing', default: true },
        { key: 'autoTransitions', label: 'Auto transitions', default: false },
        { key: 'speedAdjustments', label: 'Speed adjustments', default: false },
      ]
    },
    {
      title: "Audio",
      options: [
        { key: 'audioNormalization', label: 'Audio normalization', default: true },
        { key: 'backgroundMusic', label: 'Background music', default: false },
        { key: 'soundEffects', label: 'Sound effects', default: false },
      ]
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Style Transfer Options</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {optionGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="font-medium text-slate-700">{group.title}</h4>
              {group.options.map((option) => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.key}
                    checked={options[option.key as keyof typeof options]}
                    onCheckedChange={(checked) => 
                      onOptionChange(option.key, checked as boolean)
                    }
                    data-testid={`checkbox-${option.key}`}
                  />
                  <label 
                    htmlFor={option.key}
                    className="text-sm text-slate-600 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
