import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MathStep {
  step: string;
  calculation: string;
  result: string | number;
}

interface MathVisualizerProps {
  steps: MathStep[];
}

export function MathVisualizer({ steps }: MathVisualizerProps) {
  return (
    <div className="space-y-4 font-mono text-sm">
      {steps.map((step, index) => (
        <div key={index} className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted-foreground text-xs">
              Step {index + 1}: {step.step}
            </div>
            <Badge variant="secondary" className="text-xs">
              {typeof step.result === 'number' ? step.result : 'Complete'}
            </Badge>
          </div>
          <div className="text-foreground">{step.calculation}</div>
          {typeof step.result === 'number' && (
            <div className="text-primary font-semibold mt-2">
              Result: {step.result}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
