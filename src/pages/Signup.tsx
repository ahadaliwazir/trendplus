import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { User, Mail, Lock, Eye, EyeOff, Heart, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/auth-context';
import OnboardingModal from '@/components/OnboardingModal';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { signup, login, triggerOnboarding } = useAuth();
    const navigate = useNavigate();

    const passwordRequirements = [
        { text: 'At least 8 characters', met: password.length >= 8 },
        { text: 'Passwords match', met: password === confirmPassword && confirmPassword.length > 0 },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        }

        setIsLoading(true);

        try {
            console.log('Starting signup...');
            const result = await signup(username, email, password);
            console.log('Signup result:', result);

            if (result && result.success) {
                // Redirect to OTP verification page
                if (result.requires_verification) {
                    console.log('Redirecting to OTP page...');
                    navigate(`/verify-otp?email=${encodeURIComponent(result.email || email)}`);
                } else {
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        triggerOnboarding();
        navigate('/');
    };

    return (
        <>
            <SEO
                title="Create Account"
                description="Join MeriDramaList - the ultimate platform for Pakistani drama fans. Track your watched dramas, create watchlists, and connect with the community."
                url="/signup"
                noindex={true}
            />

            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
                {/* Background decorations */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

                <div className="w-full max-w-md px-6 relative z-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Heart className="w-6 h-6 text-accent-foreground fill-current" />
                            </div>
                            <span className="font-display text-2xl font-bold text-foreground">MeriDramaList</span>
                        </Link>
                    </div>

                    {/* Signup Card */}
                    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-display font-bold text-foreground">Create Account</h1>
                            <p className="text-muted-foreground mt-1">Join the community of drama lovers</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="dramafan123"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-11 h-12 bg-secondary/30 border-none focus-visible:ring-accent"
                                        required
                                        minLength={3}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-11 h-12 bg-secondary/30 border-none focus-visible:ring-accent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-11 pr-11 h-12 bg-secondary/30 border-none focus-visible:ring-accent"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-11 h-12 bg-secondary/30 border-none focus-visible:ring-accent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="space-y-2 pt-1">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald text-white' : 'bg-secondary'}`}>
                                            {req.met && <Check className="w-3 h-3" />}
                                        </div>
                                        <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                                            {req.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                variant="gold"
                                className="w-full h-12 text-base font-semibold gap-2 mt-2"
                                disabled={isLoading || !passwordRequirements.every(r => r.met)}
                            >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                                {!isLoading && <ArrowRight className="w-5 h-5" />}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="text-accent font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to home */}
                    <div className="text-center mt-6">
                        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Onboarding Modal */}
            <OnboardingModal
                open={showOnboarding}
                onComplete={handleOnboardingComplete}
            />
        </>
    );
};

export default Signup;

