
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-32 max-w-6xl">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                    <SectionHeader title="Contact Us" subtitle="Get in touch with the MeriDramaList team for support or feedback." showViewAll={false} />
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="glass border border-white/5 rounded-3xl p-8 space-y-6">
                            <h3 className="text-2xl font-bold font-display tracking-tight flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-primary" />
                                Reach Out
                            </h3>
                            <p className="text-white/60 leading-relaxed italic">
                                "Have questions, feedback, or just want to discuss your favorite dramas? We'd love to hear from you. Our team is dedicated to providing the best cinematic experience for the Pakistani drama community."
                            </p>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Email Us</p>
                                        <span className="text-white font-bold">support@meridramalist.com</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Location</p>
                                        <span className="text-white font-bold uppercase italic">Karachi, Pakistan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center">
                            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Join the Community</p>
                            <p className="text-white/60 text-sm">Follow us on social media for latest updates.</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass border border-white/5 rounded-3xl p-8 animate-in fade-in slide-in-from-right-8 duration-700">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-white/40 tracking-widest ml-1">First Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-white/40 tracking-widest ml-1">Last Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/40 tracking-widest ml-1">Email Address</label>
                                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="kindness@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/40 tracking-widest ml-1">Your Message</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-colors min-h-[160px] resize-none" placeholder="Share your thoughts with us..." />
                            </div>
                            <Button className="w-full bg-primary text-white font-black py-8 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
                                <Send className="w-5 h-5" />
                                SEND MESSAGE
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ContactUs;
