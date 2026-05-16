import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Compass, Heart, Star, Users, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    highlight?: string; // CSS selector for element to highlight
}

const tourSteps: OnboardingStep[] = [
    {
        id: 1,
        title: "Welcome to MeriDramaList! 🎉",
        description: "Your ultimate destination for Pakistani dramas. Let us show you around!",
        icon: <Sparkles className="w-12 h-12 text-primary" />,
    },
    {
        id: 2,
        title: "Explore Dramas",
        description: "Browse 300+ Pakistani dramas from Hum TV, ARY Digital, Geo, and more. Filter by genre, year, or rating.",
        icon: <Compass className="w-12 h-12 text-blue-400" />,
    },
    {
        id: 3,
        title: "Build Your Watchlist",
        description: "Add dramas to your watchlist and track what you're currently watching, completed, or planning to watch.",
        icon: <Heart className="w-12 h-12 text-red-400" />,
    },
    {
        id: 4,
        title: "Rate & Review",
        description: "Share your thoughts! Rate dramas, write reviews, and help others discover great shows.",
        icon: <Star className="w-12 h-12 text-yellow-400" />,
    },
    {
        id: 5,
        title: "Join the Community",
        description: "Connect with other drama fans, see what's trending, and discover hidden gems.",
        icon: <Users className="w-12 h-12 text-green-400" />,
    },
    {
        id: 6,
        title: "Your Profile",
        description: "Track your watching stats, manage your list, and share your drama journey with friends.",
        icon: <User className="w-12 h-12 text-purple-400" />,
    },
];

interface OnboardingTourProps {
    username: string;
    onComplete: () => void;
}

const OnboardingTour = ({ username, onComplete }: OnboardingTourProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();

    const step = tourSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tourSteps.length - 1;

    // Personalize welcome message
    const getTitle = () => {
        if (currentStep === 0) {
            return `Welcome, ${username}! 🎉`;
        }
        return step.title;
    };

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setIsVisible(false);
        onComplete();
        // Navigate to explore page after tour
        navigate('/top-rated');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none" />

            {/* Modal */}
            <div className="relative z-10 w-[90%] max-w-md mx-auto animate-in fade-in zoom-in duration-300 pointer-events-auto">
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                    {/* Skip Button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="p-8 text-center">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                                {step.icon}
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {getTitle()}
                        </h2>

                        {/* Description */}
                        <p className="text-white/70 text-base leading-relaxed mb-8">
                            {step.description}
                        </p>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 mb-6">
                            {tourSteps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                        ? 'bg-primary w-6'
                                        : index < currentStep
                                            ? 'bg-primary/50'
                                            : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            {!isFirstStep && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrev}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                            )}

                            <Button
                                variant="primary"
                                onClick={handleNext}
                                className="flex-1"
                            >
                                {isLastStep ? (
                                    <>
                                        Start Exploring
                                        <Sparkles className="w-4 h-4 ml-1" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Skip link */}
                        {!isLastStep && (
                            <button
                                onClick={handleSkip}
                                className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
                            >
                                Skip tour
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
