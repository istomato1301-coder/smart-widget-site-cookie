"use client";

import { motion } from "framer-motion";
import { FileText, Palette, Code } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Step = 1 | 2 | 3;

interface StepperProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
}

const steps = [
  {
    id: 1 as Step,
    label: "Политика Cookie",
    icon: FileText,
    tooltip: "Настройте параметры политики использования cookie",
  },
  {
    id: 2 as Step,
    label: "Дизайн Popup",
    icon: Palette,
    tooltip: "Выберите стиль и внешний вид всплывающего окна",
  },
  {
    id: 3 as Step,
    label: "Код и установка",
    icon: Code,
    tooltip: "Получите готовый код и инструкции по установке",
  },
];

export function Stepper({ currentStep, onStepChange }: StepperProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-2 py-8 sm:gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => onStepChange(step.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300 sm:p-4",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "cursor-pointer hover:scale-105 active:scale-95",
                      isActive &&
                        "bg-card/80 backdrop-blur-sm shadow-lg ring-2 ring-ring/20",
                      isCompleted &&
                        "bg-muted/50 backdrop-blur-sm hover:bg-muted/70 opacity-70"
                    )}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                  >
                    <div
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 sm:h-12 sm:w-12",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors sm:text-sm",
                        isActive
                          ? "text-foreground"
                          : isCompleted
                            ? "text-muted-foreground"
                            : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute inset-0 rounded-xl border-2 border-primary/30"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{step.tooltip}</p>
                </TooltipContent>
              </Tooltip>

              {index < steps.length - 1 && (
                <div className="mx-2 hidden h-0.5 w-8 items-center sm:mx-4 sm:flex sm:w-16">
                  <motion.div
                    className={cn(
                      "h-full w-full rounded-full transition-colors duration-300",
                      currentStep > step.id
                        ? "bg-primary"
                        : "bg-border"
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: currentStep > step.id ? 1 : 0.3,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

