import { useState } from 'react';
import SEO from '@/components/SEO';
import { Link, Navigate } from 'react-router-dom';
import { Camera, Save, ArrowLeft, Calendar, Star, Film, Clock, Loader2, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth-context';
import { useList } from '@/hooks/use-list';
import Navbar from '@/components/Navbar';

const avatarStyles = [
    'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'notionists', 'open-peeps', 'personas'
];

const Profile = () => {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile, changePassword } = useAuth();
    const { userStats } = useList();

    const [bio, setBio] = useState(user?.bio || '');
    const [selectedStyle, setSelectedStyle] = useState('avataaars');
    const [avatarSeed, setAvatarSeed] = useState(user?.username || 'user');
    const [isSaving, setIsSaving] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Use stats from API
    const stats = {
        total: userStats?.total || 0,
        meanScore: userStats?.mean_score || '0.0',
        daysWatched: userStats?.days_watched?.toFixed(1) || '0.0',
        totalEpisodes: userStats?.total_episodes || 0,
    };

    const generateAvatarUrl = (style: string, seed: string) => {
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateProfile({
            bio,
            avatar: generateAvatarUrl(selectedStyle, avatarSeed),
        });
        setIsSaving(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return;
        }

        if (newPassword.length < 6) {
            return;
        }

        setIsChangingPassword(true);
        const success = await changePassword(currentPassword, newPassword);

        if (success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsChangingPassword(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <SEO
                title="Edit Profile"
                description="Customize your MeriDramaList profile, update your avatar, and manage your account settings."
                url="/profile"
                noindex={true}
            />

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Edit Profile</h1>
                            <p className="text-muted-foreground">Customize your profile and avatar</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left Column - Avatar */}
                        <div className="md:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                                <div className="text-center">
                                    <div className="relative inline-block mb-4">
                                        <Avatar className="w-32 h-32 border-4 border-accent">
                                            <AvatarImage src={generateAvatarUrl(selectedStyle, avatarSeed)} />
                                            <AvatarFallback className="text-4xl">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg">
                                            <Camera className="w-5 h-5 text-accent-foreground" />
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">{user?.username}</h2>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                                        <Film className="w-5 h-5 mx-auto text-accent mb-1" />
                                        <p className="text-lg font-bold text-foreground">{stats.total}</p>
                                        <p className="text-xs text-muted-foreground">Dramas</p>
                                    </div>
                                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                                        <Star className="w-5 h-5 mx-auto text-accent mb-1" />
                                        <p className="text-lg font-bold text-foreground">{stats.meanScore}</p>
                                        <p className="text-xs text-muted-foreground">Mean Score</p>
                                    </div>
                                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                                        <Clock className="w-5 h-5 mx-auto text-accent mb-1" />
                                        <p className="text-lg font-bold text-foreground">{stats.daysWatched}</p>
                                        <p className="text-xs text-muted-foreground">Days</p>
                                    </div>
                                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-foreground">{stats.totalEpisodes}</p>
                                        <p className="text-xs text-muted-foreground">Episodes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Avatar Style Selection */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Choose Avatar Style</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {avatarStyles.map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => setSelectedStyle(style)}
                                            className={`relative p-2 rounded-lg border-2 transition-all ${selectedStyle === style
                                                ? 'border-accent bg-accent/10'
                                                : 'border-border hover:border-accent/50'
                                                }`}
                                        >
                                            <img
                                                src={generateAvatarUrl(style, avatarSeed)}
                                                alt={style}
                                                className="w-full aspect-square rounded-lg"
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <Label htmlFor="seed">Avatar Seed</Label>
                                    <Input
                                        id="seed"
                                        value={avatarSeed}
                                        onChange={(e) => setAvatarSeed(e.target.value)}
                                        placeholder="Enter any text to generate a unique avatar"
                                        className="mt-2 bg-secondary/30 border-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Change this to get a different avatar look
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">About You</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={user?.username || ''}
                                            disabled
                                            className="mt-2 bg-secondary/30 border-none opacity-60"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Username cannot be changed
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell others about yourself and your favorite dramas..."
                                            className="mt-2 bg-secondary/30 border-none min-h-[120px] resize-none"
                                            maxLength={300}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1 text-right">
                                            {bio.length}/300 characters
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="gold"
                                    className="w-full mt-6 h-12 text-base font-semibold gap-2"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Password Change */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-accent" />
                                    <h3 className="text-lg font-semibold text-foreground">Security & Password</h3>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="pl-10 bg-secondary/30 border-none"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="pl-10 bg-secondary/30 border-none"
                                                    minLength={6}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className={`pl-10 bg-secondary/30 border-none ${confirmPassword && newPassword !== confirmPassword ? 'ring-2 ring-red-500' : ''}`}
                                                    minLength={6}
                                                    required
                                                />
                                            </div>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="mt-2 w-full h-12"
                                        disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                    >
                                        {isChangingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating Password...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Profile;
