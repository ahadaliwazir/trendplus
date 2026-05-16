import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AuthModalProps {
    trigger: React.ReactNode;
    onSuccess?: () => void;
}

const AuthModal = ({ trigger, onSuccess }: AuthModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (onSuccess) onSuccess();
        toast({
            title: "Success",
            description: "Welcome to MeriDramaList! You have been successfully signed in.",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-border rounded-2xl shadow-2xl">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg animate-float">
                            <Heart className="w-6 h-6 text-accent-foreground fill-current" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-display text-center">Welcome Back</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Join the community of Pakistani drama lovers.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="login" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-lg p-1">
                        <TabsTrigger value="login" className="rounded-md transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-md transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={handleAuth} className="space-y-4 mt-4 animate-fade-in">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="name@example.com" className="pl-10 bg-secondary/30 border-none focus-visible:ring-accent h-11" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="password" type="password" className="pl-10 bg-secondary/30 border-none focus-visible:ring-accent h-11" required />
                                </div>
                            </div>
                            <Button type="submit" variant="gold" className="w-full h-11 text-base font-semibold">Sign In</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="signup">
                        <form onSubmit={handleAuth} className="space-y-4 mt-4 animate-fade-in">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="fullname" placeholder="Ahmad Khan" className="pl-10 bg-secondary/30 border-none focus-visible:ring-accent h-11" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email-signup">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="email-signup" type="email" placeholder="name@example.com" className="pl-10 bg-secondary/30 border-none focus-visible:ring-accent h-11" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password-signup">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input id="password-signup" type="password" className="pl-10 bg-secondary/30 border-none focus-visible:ring-accent h-11" required />
                                </div>
                            </div>
                            <Button type="submit" variant="gold" className="w-full h-11 text-base font-semibold">Create Account</Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="relative mt-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <Button variant="outline" className="gap-2 border-border hover:bg-secondary/50 h-10">
                        <Chrome className="w-4 h-4" />
                        Google
                    </Button>
                    <Button variant="outline" className="gap-2 border-border hover:bg-secondary/50 h-10">
                        <Github className="w-4 h-4" />
                        Github
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
