import React, { useState } from 'react';
import { ChevronRight, PieChart, Target, Plane } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: PieChart,
      title: 'Track Spending Easily',
      description: 'Monitor your expenses effortlessly with smart categorization and beautiful visualizations.',
      image: '📊',
    },
    {
      icon: Target,
      title: 'Set Savings Goals',
      description: 'Define your financial goals and track progress towards achieving your dreams.',
      image: '🎯',
    },
    {
      icon: Plane,
      title: 'Plan Your Future',
      description: 'Simulate different scenarios and plan for major purchases like trips, gadgets, and courses.',
      image: '✈️',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="mb-8">
          <div className="text-6xl mb-4">{currentStepData.image}</div>
          <currentStepData.icon size={48} className="text-primary mx-auto mb-6" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {currentStepData.title}
        </h2>
        
        <p className="text-gray-300 text-lg mb-12 leading-relaxed">
          {currentStepData.description}
        </p>
        
        <div className="flex justify-center mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 mx-1 rounded-full transition-colors duration-300 ${
                index === currentStep ? 'bg-primary' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center mx-auto transition-all duration-200 transform hover:scale-105"
        >
          {currentStep === steps.length - 1 ? 'Start Using DuitCerdik' : 'Next'}
          <ChevronRight size={20} className="ml-2" />
        </button>
        
        {currentStep < steps.length - 1 && (
          <button
            onClick={onComplete}
            className="text-gray-400 hover:text-white mt-4 transition-colors duration-200"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;