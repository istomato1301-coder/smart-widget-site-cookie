"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Stepper, type Step } from "@/components/tools/cookie-popup/Stepper";
import { Step1Policy } from "@/components/tools/cookie-popup/steps/Step1Policy";
import { Step2Design } from "@/components/tools/cookie-popup/steps/Step2Design";
import { Step3Code } from "@/components/tools/cookie-popup/steps/Step3Code";

const STORAGE_KEY_STEP = "cookie-popup-generator-current-step";

function loadStepFromStorage(): Step {
  if (typeof window === "undefined") {
    return 1;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_STEP);
    if (stored) {
      const step = parseInt(stored, 10);
      if (step >= 1 && step <= 3) {
        return step as Step;
      }
    }
  } catch (error) {
    console.error("Failed to load step from localStorage:", error);
  }

  return 1;
}

function saveStepToStorage(step: Step): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY_STEP, step.toString());
  } catch (error) {
    console.error("Failed to save step to localStorage:", error);
  }
}

export default function CookiePopupGeneratorPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Загружаем шаг из localStorage при монтировании
  useEffect(() => {
    const loadedStep = loadStepFromStorage();
    setCurrentStep(loadedStep);
  }, []);

  // Сохраняем шаг в localStorage при изменении
  useEffect(() => {
    saveStepToStorage(currentStep);
  }, [currentStep]);

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Policy key="step1" onNextStep={handleNextStep} />;
      case 2:
        return <Step2Design key="step2" />;
      case 3:
        return <Step3Code key="step3" onBack={handleBackStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Cookie Popup Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Создайте профессиональное всплывающее окно для cookie за несколько
              простых шагов
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-12">
            <Stepper
              currentStep={currentStep}
              onStepChange={handleStepChange}
            />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

