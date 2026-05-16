import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Mail, Lock, Eye, EyeOff, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/auth-context';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await login(email, password);

        if (success) {
            navigate('/dashboard');
        }

        setIsLoading(false);
    };

    return (
        <>
            <SEO
                title="Login"
                description="Sign in to MeriDramaList to track your watched Pakistani dramas, manage your watchlist, and connect with other drama fans."
                url="/login"
                noindex={true}
            />

            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
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

                    {/* Login Card */}
                    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-display font-bold text-foreground">Welcome Back</h1>
                            <p className="text-muted-foreground mt-1">Sign in to continue tracking your dramas</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-11 pr-11 h-12 bg-secondary/30 border-none focus-visible:ring-accent"
                                        required
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

                            <Button
                                type="submit"
                                variant="gold"
                                className="w-full h-12 text-base font-semibold gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                                {!isLoading && <ArrowRight className="w-5 h-5" />}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-accent font-medium hover:underline">
                                    Sign up
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
        </>
    );
};

export default Login;
