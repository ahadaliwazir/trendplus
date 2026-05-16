
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Cookie, Settings, Info } from "lucide-react";

const CookiePolicy = () => {
    const sections = [
        {
            title: "1. What Are Cookies",
            icon: Cookie,
            content: "As is common practice with almost all professional websites, this site uses cookies—tiny files downloaded to your computer—to improve your experience and remember your preferences."
        },
        {
            title: "2. How We Use Cookies",
            icon: Info,
            content: "We use cookies to maintain your login session, remember your dark mode settings, and analyze site traffic to improve our cinematic interface for all drama lovers."
        },
        {
            title: "3. Disabling Cookies",
            icon: Settings,
            content: "You can prevent the setting of cookies by adjusting the settings on your browser. Be aware that disabling cookies will affect the functionality and features you enjoy on MeriDramaList."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                    <SectionHeader title="Cookie Policy" subtitle="Understanding how we utilize cookies to enhance your journey." showViewAll={false} />
                </div>

                <div className="grid gap-8">
                    {sections.map((section, idx) => (
                        <div
                            key={idx}
                            className="glass border border-white/5 rounded-3xl p-8 hover:border-primary/50 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-4 font-display tracking-tight group-hover:text-primary transition-colors">{section.title}</h3>
                                    <p className="text-white/60 leading-relaxed italic">
                                        "{section.content}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-3xl bg-primary/5 border border-primary/20 text-center animate-in fade-in duration-1000">
                    <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Premium Experience</p>
                    <p className="text-white/80">Cookies enabled for your convenience.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CookiePolicy;
