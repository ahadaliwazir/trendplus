import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { authService, User } from '@/services/authService';

interface SignupResult {
    success: boolean;
    email?: string;
    requires_verification?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    showOnboarding: boolean;
    login: (email: string, password: string, skipAutoOnboarding?: boolean) => Promise<boolean>;
    signup: (username: string, email: string, password: string) => Promise<SignupResult>;
    logout: () => void;
    updateProfile: (updates: { avatar?: string; bio?: string }) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    refreshUser: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    triggerOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { toast } = useToast();

    // Load current user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const userData = await authService.getMe();
                    if (userData) {
                        setUser(userData);

                        // Check if new user needs onboarding (after OTP verification reload)
                        if (!userData.has_completed_onboarding) {
                            setShowOnboarding(true);
                        }
                    }
                } catch (error) {
                    // Token invalid, clear it
                    authService.logout();
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const refreshUser = async () => {
        try {
            const userData = await authService.getMe();
            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    const signup = async (username: string, email: string, password: string): Promise<SignupResult> => {
        try {
            const response = await authService.signup(username, email, password);

            // New signup with verification
            if (response.requires_verification) {
                toast({
                    title: "Check Your Email!",
                    description: "We've sent a verification code to your email.",
                });
                return { success: true, email: response.email || email, requires_verification: true };
            }

            if (response.data?.user) {
                toast({
                    title: "Account Created Successfully!",
                    description: `Welcome ${username}! Please log in to get started.`,
                });
                return { success: true, email };
            }
            return { success: false };
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create account.",
                variant: "destructive",
            });
            return { success: false };
        }
    };

    const login = async (email: string, password: string, skipAutoOnboarding: boolean = false): Promise<boolean> => {
        try {
            const response = await authService.login(email, password);

            if (response.data?.user) {
                setUser(response.data.user);

                // Check if user needs onboarding (unless skipAutoOnboarding is true - used in signup flow)
                if (!skipAutoOnboarding && !response.data.user.has_completed_onboarding) {
                    setShowOnboarding(true);
                }

                toast({
                    title: "Welcome back!",
                    description: `Good to see you again, ${response.data.user.username}.`,
                });
                return true;
            }
            return false;
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid email or password.",
                variant: "destructive",
            });
            return false;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
        });
    };

    const updateProfile = async (updates: { avatar?: string; bio?: string }) => {
        try {
            const updatedUser = await authService.updateProfile(updates);
            if (updatedUser) {
                setUser(updatedUser);
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been saved.",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile.",
                variant: "destructive",
            });
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            await authService.changePassword(currentPassword, newPassword);
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
            });
            return true;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to change password. Please check your current password.",
                variant: "destructive",
            });
            return false;
        }
    };

    const completeOnboarding = async () => {
        try {
            await authService.completeOnboarding();
            setShowOnboarding(false);
            if (user) {
                setUser({ ...user, has_completed_onboarding: true });
            }
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setShowOnboarding(false);
        }
    };

    // Manually trigger onboarding (used after genre selection in signup flow)
    const triggerOnboarding = () => {
        setShowOnboarding(true);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            showOnboarding,
            login,
            signup,
            logout,
            updateProfile,
            changePassword,
            refreshUser,
            completeOnboarding,
            triggerOnboarding,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export type { User };
