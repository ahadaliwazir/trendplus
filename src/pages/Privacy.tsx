
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Lock, Eye, Database, Share2 } from "lucide-react";

const Privacy = () => {
    const sections = [
        {
            title: "1. Information We Collect",
            icon: Eye,
            content: "We only ask for personal information when we truly need it to provide a service to you. This includes basic account details and your drama preferences to enhance your tracking experience."
        },
        {
            title: "2. How We Use Information",
            icon: Database,
            content: "We use the information we collect to operate and maintain our website, to send you newsletters, and to respond to your comments and questions. Your data helps us personalize your feed."
        },
        {
            title: "3. Data Retention",
            icon: Lock,
            content: "We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss or theft."
        },
        {
            title: "4. Sharing of Information",
            icon: Share2,
            content: "We do not share any personally identifying information publicly or with third-parties, except when required to by law. Your privacy is our utmost priority in the MeriDramaList community."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                    <SectionHeader title="Privacy Policy" subtitle="How we handle your data with the highest security standards." showViewAll={false} />
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
                    <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Secure & Private</p>
                    <p className="text-white/80">Your data is safe with us.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Privacy;
