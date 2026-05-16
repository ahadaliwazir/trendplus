import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Share2, RotateCcw, Sparkles, Zap, Heart, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { mbtiQuestions, dramaCharacters, calculateMbti, getCharacterByMbti, DramaCharacter } from '@/data/mbtiData';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const MbtiQuiz = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const sharedResult = searchParams.get('result');

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<DramaCharacter | null>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (sharedResult && dramaCharacters.find(c => c.mbtiType === sharedResult)) {
            const character = getCharacterByMbti(sharedResult);
            if (character) {
                setResult(character);
                setShowResult(true);
                setIsStarted(true);
            }
        }
    }, [sharedResult]);

    const handleAnswer = (answer: 'A' | 'B') => {
        if (isAnimating) return;

        setSelectedAnswer(answer);
        setIsAnimating(true);

        const questionId = mbtiQuestions[currentQuestion].id;
        setAnswers(prev => ({ ...prev, [questionId]: answer }));

        setTimeout(() => {
            if (currentQuestion < mbtiQuestions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setSelectedAnswer(null);
                setIsAnimating(false);
            } else {
                const newAnswers = { ...answers, [questionId]: answer };
                const mbtiType = calculateMbti(newAnswers);
                const character = getCharacterByMbti(mbtiType);
                setResult(character || null);
                setShowResult(true);
                setIsAnimating(false);
            }
        }, 400);
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            setSelectedAnswer(null);
        }
    };

    const handleShare = async () => {
        if (!result) return;

        const shareUrl = `${window.location.origin}/personality-quiz?result=${result.mbtiType}`;
        const shareText = `I got ${result.character} from ${result.drama}! 🎭 My MBTI is ${result.mbtiType} (${result.typeName}). Take the quiz to find out which Pakistani drama character you are!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Drama Character Result',
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            toast({
                title: "Link Copied! 🎉",
                description: "Share your result with friends!",
            });
        }
    };

    const handleRetake = () => {
        setAnswers({});
        setCurrentQuestion(0);
        setShowResult(false);
        setResult(null);
        setSelectedAnswer(null);
        navigate('/personality-quiz', { replace: true });
    };

    const progress = ((currentQuestion + 1) / mbtiQuestions.length) * 100;

    // Animated confetti for results
    const Confetti = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                >
                    {['✨', '🌟', '💫', '⭐', '🎭', '💕'][Math.floor(Math.random() * 6)]}
                </div>
            ))}
        </div>
    );

    // Start Screen
    if (!isStarted) {
        return (
            <>
                <SEO
                    title="Which Drama Character Are You? | MBTI Quiz"
                    description="Take our personality quiz to discover which iconic Pakistani drama character matches your MBTI type!"
                    keywords="MBTI quiz, Pakistani drama characters, personality test, drama quiz"
                    url="/personality-quiz"
                />
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                    @keyframes pulse-glow {
                        0%, 100% { box-shadow: 0 0 20px rgba(255, 200, 87, 0.3); }
                        50% { box-shadow: 0 0 40px rgba(255, 200, 87, 0.6), 0 0 60px rgba(255, 200, 87, 0.3); }
                    }
                    @keyframes gradient-shift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes confetti {
                        0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                    }
                    .animate-float { animation: float 3s ease-in-out infinite; }
                    .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
                    .animate-gradient { 
                        background-size: 200% 200%;
                        animation: gradient-shift 3s ease infinite;
                    }
                    .animate-confetti { animation: confetti 3s linear infinite; }
                `}</style>
                <div className="min-h-screen bg-background text-foreground overflow-hidden">
                    <Navbar />

                    {/* Animated background elements */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
                    </div>

                    <main className="container mx-auto px-4 py-8 md:py-16 relative">
                        <div className="max-w-2xl mx-auto text-center">
                            {/* Glowing Icon */}
                            <div className="relative mb-8">
                                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
                                    <Sparkles className="w-14 h-14 text-white drop-shadow-lg" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-bounce">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            {/* Title with gradient */}
                            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                                Which Drama Character Are You?
                            </h1>

                            <p className="text-xl text-white/80 mb-3 font-medium">
                                ✨ Discover your dramatic alter ego! ✨
                            </p>
                            <p className="text-white/60 mb-8">
                                Answer 12 fun questions and find out which iconic Pakistani drama character matches your personality!
                            </p>

                            {/* Feature badges */}
                            <div className="flex flex-wrap justify-center gap-3 mb-10">
                                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-sm font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Quick & Fun
                                </span>
                                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium flex items-center gap-2">
                                    <Star className="w-4 h-4" /> 16 Characters
                                </span>
                                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium flex items-center gap-2">
                                    <Share2 className="w-4 h-4" /> Share Results
                                </span>
                            </div>

                            {/* Character Preview - Animated */}
                            <div className="grid grid-cols-4 gap-3 mb-10 max-w-md mx-auto">
                                {dramaCharacters.slice(0, 8).map((char, i) => (
                                    <div
                                        key={char.mbtiType}
                                        className="aspect-square rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-2xl hover:scale-110 hover:border-amber-500/50 transition-all duration-300 cursor-default"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        {['👸', '🤵', '💃', '🎭', '🌟', '💫', '✨', '🔥'][i]}
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Button
                                size="lg"
                                onClick={() => setIsStarted(true)}
                                className="text-xl px-12 py-7 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-white font-bold shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 animate-pulse-glow"
                            >
                                Start the Quiz
                                <ChevronRight className="w-6 h-6 ml-2" />
                            </Button>

                            <p className="text-white/40 text-sm mt-6">
                                🔒 No signup required • Takes ~3 minutes
                            </p>
                        </div>
                    </main>
                    <Footer />
                </div>
            </>
        );
    }

    // Result Screen
    if (showResult && result) {
        return (
            <>
                <SEO
                    title={`You are ${result.character}! | MBTI Quiz Result`}
                    description={`Your MBTI type is ${result.mbtiType} (${result.typeName}), matching ${result.character} from ${result.drama}!`}
                    url={`/personality-quiz?result=${result.mbtiType}`}
                />
                <style>{`
                    @keyframes confetti {
                        0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                    }
                    @keyframes reveal {
                        0% { transform: scale(0.5); opacity: 0; }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes glow {
                        0%, 100% { box-shadow: 0 0 30px rgba(255, 200, 87, 0.4); }
                        50% { box-shadow: 0 0 60px rgba(255, 200, 87, 0.8), 0 0 80px rgba(255, 170, 50, 0.4); }
                    }
                    .animate-confetti { animation: confetti 3s linear infinite; }
                    .animate-reveal { animation: reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                    .animate-glow { animation: glow 2s ease-in-out infinite; }
                `}</style>
                <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
                    <Confetti />
                    <Navbar />
                    <main className="container mx-auto px-4 py-8 relative">
                        <div className="max-w-2xl mx-auto">
                            {/* Result Card */}
                            <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl p-6 md:p-10 border border-purple-500/20 shadow-2xl animate-reveal relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-full blur-3xl" />

                                {/* Trophy */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-glow">
                                        <Trophy className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                {/* MBTI Type Badge */}
                                <div className="text-center mb-8">
                                    <span className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/30 text-white font-bold text-lg mb-4">
                                        {result.mbtiType}
                                    </span>
                                    <p className="text-purple-300 text-lg font-medium">{result.typeName}</p>
                                </div>

                                {/* Character Reveal */}
                                <div className="text-center mb-8">
                                    <p className="text-white/60 text-lg mb-3">You are...</p>
                                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-3">
                                        {result.character}
                                    </h1>
                                    <p className="text-xl text-amber-400/80 font-medium">from {result.drama}</p>
                                </div>

                                {/* Traits - Colorful pills */}
                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    {result.traits.map((trait, i) => (
                                        <span
                                            key={trait}
                                            className={cn(
                                                "px-4 py-2 rounded-full font-medium text-sm",
                                                i % 4 === 0 && "bg-pink-500/20 text-pink-300 border border-pink-500/30",
                                                i % 4 === 1 && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                                                i % 4 === 2 && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
                                                i % 4 === 3 && "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                            )}
                                        >
                                            {trait}
                                        </span>
                                    ))}
                                </div>

                                {/* Description Box */}
                                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
                                    <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-amber-400" />
                                        About {result.character}
                                    </h3>
                                    <p className="text-white/70 leading-relaxed">
                                        {result.description}
                                    </p>
                                </div>

                                {/* Why You Match */}
                                <div className="bg-gradient-to-r from-amber-500/10 to-pink-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                                    <h3 className="font-bold text-amber-400 text-lg mb-3 flex items-center gap-2">
                                        <Heart className="w-5 h-5" />
                                        Why You Match 💫
                                    </h3>
                                    <p className="text-white/80 leading-relaxed">
                                        {result.whyYouMatch}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        onClick={handleShare}
                                        className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 rounded-xl"
                                    >
                                        <Share2 className="w-5 h-5 mr-2" />
                                        Share Result
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRetake}
                                        className="flex-1 h-14 text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 rounded-xl"
                                    >
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        Try Again
                                    </Button>
                                </div>
                            </div>

                            {/* Other Characters */}
                            <div className="mt-10 text-center">
                                <p className="text-white/50 mb-4">Other possible results:</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {dramaCharacters
                                        .filter(c => c.mbtiType !== result.mbtiType)
                                        .slice(0, 6)
                                        .map((char) => (
                                            <span
                                                key={char.mbtiType}
                                                className="px-4 py-2 rounded-full bg-white/5 text-white/50 text-sm hover:bg-white/10 hover:text-white/70 transition-colors cursor-default"
                                            >
                                                {char.character}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </>
        );
    }

    // Quiz Screen
    const question = mbtiQuestions[currentQuestion];

    return (
        <>
            <SEO
                title="MBTI Personality Quiz | MeriDramaList"
                description="Take our personality quiz to discover which iconic Pakistani drama character you are!"
                url="/personality-quiz"
            />
            <style>{`
                @keyframes slide-in {
                    0% { transform: translateX(20px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                    100% { transform: scale(1); }
                }
                .animate-slide-in { animation: slide-in 0.4s ease-out; }
                .animate-pop { animation: pop 0.3s ease-out; }
            `}</style>
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />

                {/* Background decoration */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
                </div>

                <main className="container mx-auto px-4 py-8 relative">
                    <div className="max-w-xl mx-auto">
                        {/* Progress Section */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-white/60">Question {currentQuestion + 1} of {mbtiQuestions.length}</span>
                                <span className="text-amber-400 font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-pink-500 transition-all duration-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Card */}
                        <div
                            key={currentQuestion}
                            className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-3xl p-6 md:p-8 border border-purple-500/20 shadow-xl animate-slide-in"
                        >
                            {/* Question Number Badge */}
                            <div className="flex justify-center mb-6">
                                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm">
                                    Question {currentQuestion + 1}
                                </span>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-white mb-8 text-center leading-relaxed">
                                {question.question}
                            </h2>

                            {/* Answer Options */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => handleAnswer('A')}
                                    disabled={isAnimating}
                                    className={cn(
                                        "w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group",
                                        selectedAnswer === 'A'
                                            ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white scale-[0.98] animate-pop'
                                            : 'border-white/20 hover:border-amber-400/50 hover:bg-white/5 text-white/80 hover:text-white',
                                        isAnimating && 'pointer-events-none'
                                    )}
                                >
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold mr-3 group-hover:bg-amber-500/30 transition-colors">
                                        A
                                    </span>
                                    {question.optionA}
                                </button>

                                <button
                                    onClick={() => handleAnswer('B')}
                                    disabled={isAnimating}
                                    className={cn(
                                        "w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 group",
                                        selectedAnswer === 'B'
                                            ? 'border-pink-400 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white scale-[0.98] animate-pop'
                                            : 'border-white/20 hover:border-pink-400/50 hover:bg-white/5 text-white/80 hover:text-white',
                                        isAnimating && 'pointer-events-none'
                                    )}
                                >
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 font-bold mr-3 group-hover:bg-pink-500/30 transition-colors">
                                        B
                                    </span>
                                    {question.optionB}
                                </button>
                            </div>

                            {/* Navigation */}
                            {currentQuestion > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrevious}
                                        className="text-white/60 hover:text-white hover:bg-white/10"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Question dots indicator */}
                        <div className="flex justify-center gap-1.5 mt-6">
                            {mbtiQuestions.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        i === currentQuestion
                                            ? "w-6 bg-gradient-to-r from-amber-400 to-pink-400"
                                            : i < currentQuestion
                                                ? "bg-amber-500/50"
                                                : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default MbtiQuiz;
