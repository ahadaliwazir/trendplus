import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsVerifying(false);
                return;
            }

            try {
                const response = await api.get<{ success: boolean; email: string }>(
                    `/auth/verify-reset-token/${token}`
                );
                setIsValid(true);
                setMaskedEmail(response.data.email);
            } catch (error) {
                setIsValid(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                password,
                confirmPassword
            });

            setIsSuccess(true);
            toast.success('Password reset successfully!');

            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isVerifying) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Invalid token state
    if (!token || !isValid) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <XCircle className="w-16 h-16 text-red-500" />
                        <h2 className="mt-4 text-xl font-bold">Invalid or Expired Link</h2>
                        <p className="mt-2 text-muted-foreground">
                            This password reset link is invalid or has expired.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" asChild>
                                <Link to="/login">Back to Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/forgot-password">Request New Link</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h2 className="mt-4 text-xl font-bold">Password Reset Successful!</h2>
                        <p className="mt-2 text-muted-foreground">
                            Your password has been reset. Redirecting to login...
                        </p>
                        <Button asChild className="mt-6">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Reset form
    return (
        <>
            <SEO
                title="Reset Password"
                description="Set a new password for your MeriDramaList account."
                url="/reset-password"
                noindex={true}
            />
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            Enter a new password for <strong>{maskedEmail}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>

                            <div className="text-center">
                                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default ResetPassword;
