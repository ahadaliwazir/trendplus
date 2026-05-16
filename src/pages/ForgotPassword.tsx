import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [devToken, setDevToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean; message: string; devToken?: string }>(
                '/auth/forgot-password',
                { email }
            );

            setIsSubmitted(true);
            toast.success('Check your email for reset instructions');

            // DEV ONLY - Show token for testing
            if (response.data?.devToken) {
                setDevToken(response.data.devToken);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SEO
                title="Forgot Password"
                description="Reset your MeriDramaList password. Enter your email to receive a password reset link."
                url="/forgot-password"
                noindex={true}
            />
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Forgot Password</CardTitle>
                        <CardDescription>
                            {isSubmitted
                                ? 'Check your email for reset instructions'
                                : 'Enter your email to receive a password reset link'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <div className="text-center space-y-4">
                                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                                <p className="text-muted-foreground">
                                    If an account exists with <strong>{email}</strong>, you will receive a password reset link.
                                </p>

                                {/* DEV ONLY - Show reset link for testing */}
                                {devToken && (
                                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <p className="text-sm text-yellow-500 font-semibold">DEV MODE - Reset Link:</p>
                                        <Link
                                            to={`/reset-password?token=${devToken}`}
                                            className="text-sm text-primary hover:underline break-all"
                                        >
                                            /reset-password?token={devToken}
                                        </Link>
                                    </div>
                                )}

                                <Button variant="outline" asChild className="mt-4">
                                    <Link to="/login">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Login
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default ForgotPassword;
