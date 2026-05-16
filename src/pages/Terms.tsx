
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ShieldCheck, FileText, Scale, AlertCircle } from "lucide-react";

const Terms = () => {
    const sections = [
        {
            title: "1. Acceptance of Terms",
            icon: ShieldCheck,
            content: "By accessing and using MeriDramaList, you accept and agree to be bound by the terms and provision of this agreement. Our platform is designed to provide a cinematic experience for tracking and exploring Pakistani dramas."
        },
        {
            title: "2. Use License",
            icon: FileText,
            content: "Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify the materials."
        },
        {
            title: "3. Disclaimer",
            icon: Scale,
            content: "The materials on MeriDramaList's website are provided 'as is'. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability."
        },
        {
            title: "4. Limitations",
            icon: AlertCircle,
            content: "In no event shall MeriDramaList or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                    <SectionHeader title="Terms of Service" subtitle="Please read these terms carefully before using our premium platform." showViewAll={false} />
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
                    <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Last Updated</p>
                    <p className="text-white/80">January 2026</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Terms;
