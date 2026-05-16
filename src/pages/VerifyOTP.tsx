import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { authService } from '@/services/authService';
import SEO from '@/components/SEO';

const VerifyOTP = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const navigate = useNavigate();
    const { toast } = useToast();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Handle OTP input
    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const chars = value.slice(0, 6).split('');
            const newOtp = [...otp];
            chars.forEach((char, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = char;
                }
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + chars.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Auto-submit when all digits entered
    useEffect(() => {
        const otpString = otp.join('');
        if (otpString.length === 6) {
            handleVerify(otpString);
        }
    }, [otp]);

    const handleVerify = async (otpCode?: string) => {
        const code = otpCode || otp.join('');
        if (code.length !== 6) {
            toast({ title: 'Please enter the 6-digit code', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            console.log('Verifying OTP for email:', email, 'code:', code);
            const response = await api.post('/auth/verify-otp', { email, otp: code }) as any;
            console.log('Verify response:', response);

            // Backend returns { success: true, data: { user, token } }
            const token = response.data?.token || response.token;
            const user = response.data?.user || response.user;

            if (token) {
                // Save token and user
                localStorage.setItem('dramalist_token', token);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }

                toast({ title: 'Email verified!', description: 'Welcome to MeriDramaList!' });

                // Force full page reload to refresh auth context
                window.location.href = '/';
            } else if (response.success) {
                // Verified but no token - redirect to login
                toast({ title: 'Email verified!', description: 'Please log in to continue.' });
                navigate('/login');
            } else {
                toast({ title: 'Error', description: 'Verification failed', variant: 'destructive' });
            }
        } catch (error: any) {
            console.error('Verify error:', error);
            const message = error.message || 'Verification failed';
            toast({ title: 'Error', description: message, variant: 'destructive' });
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        try {
            console.log('Resending OTP for email:', email);
            await api.post('/auth/resend-otp', { email });
            toast({ title: 'Code sent!', description: 'Check your email for a new code.' });
            setResendCooldown(60);
        } catch (error: any) {
            console.error('Resend error:', error);
            const message = error.message || 'Failed to resend code';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setIsResending(false);
        }
    };

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">No email provided</p>
                    <Link to="/signup">
                        <Button variant="primary">Go to Signup</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Verify Your Email"
                description="Enter the verification code sent to your email."
                url="/verify-otp"
                noindex={true}
            />

            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
                {/* Background decorations */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

                <div className="w-full max-w-md px-6 relative z-10">
                    {/* Card */}
                    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>

                        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                            Verify Your Email
                        </h1>
                        <p className="text-muted-foreground mb-1">
                            We sent a 6-digit code to
                        </p>
                        <p className="text-primary font-medium mb-8">{email}</p>

                        {/* OTP Input */}
                        <div className="flex justify-center gap-2 mb-8">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-secondary/30 border-2 border-transparent focus:border-primary rounded-lg"
                                    disabled={isLoading}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <Button
                            variant="gold"
                            className="w-full h-12 text-base font-semibold gap-2 mb-4"
                            onClick={() => handleVerify()}
                            disabled={isLoading || otp.join('').length !== 6}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                            {!isLoading && <CheckCircle className="w-5 h-5" />}
                        </Button>

                        {/* Resend */}
                        <div className="text-sm text-muted-foreground">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                disabled={isResending || resendCooldown > 0}
                                className="text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResending ? (
                                    <span className="inline-flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                                    </span>
                                ) : resendCooldown > 0 ? (
                                    `Resend in ${resendCooldown}s`
                                ) : (
                                    'Resend Code'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Back to login */}
                    <div className="text-center mt-6">
                        <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyOTP;
