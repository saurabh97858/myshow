import React from 'react';
import { assets } from '../assets/assets';
import { Facebook, Twitter, Instagram, Youtube, Mail, ArrowRight, Video, Clapperboard, Film } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative w-full bg-[#050505] text-gray-400 pt-24 pb-12 overflow-hidden border-t border-white/5 font-sans">
            {/* Subtle Cinematic Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0A0A0A] to-transparent pointer-events-none"></div>

            {/* Ambient Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-900/5 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">

                    {/* Brand & Vision (Col 1-4) */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-8">
                        <img
                            src={assets.logo}
                            alt="MyShow Cinema"
                            className="h-12 w-auto opacity-100 mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                        <p className="text-lg text-gray-400 leading-relaxed max-w-md font-light">
                            Redefining the cinematic experience. From state-of-the-art projection to luxury seating, we bring the magic of movies to life.
                            <span className="block mt-4 text-primary font-medium">Immerse yourself.</span>
                        </p>
                        <div className="flex gap-4 pt-4">
                            {[
                                { Icon: Facebook, href: '#' },
                                { Icon: Twitter, href: '#' },
                                { Icon: Instagram, href: '#' },
                                { Icon: Youtube, href: '#' }
                            ].map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.href}
                                    className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 group"
                                >
                                    <item.Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links (Movies) */}
                    <div className="md:col-span-3 lg:col-span-2">
                        <h3 className="text-white font-bold text-lg mb-8 tracking-wider uppercase border-l-2 border-primary pl-4">Movies</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'Now Showing', icon: Film },
                                { label: 'Coming Soon', icon: Clapperboard },
                                { label: 'Cinemas', icon: Video },
                                { label: 'Experiences', icon: null },
                                { label: 'Movie News', icon: null }
                            ].map((item, idx) => (
                                <li key={idx}>
                                    <a href="#" className="flex items-center gap-2 hover:text-white transition-colors group text-base font-light">
                                        {item.icon ? <item.icon className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" /> : <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-primary transition-colors"></span>}
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h3 className="text-white font-bold text-lg mb-8 tracking-wider uppercase border-l-2 border-white/20 pl-4">Support</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                            {['Help Center', 'Privacy Policy', 'Terms of Use', 'Corporate', 'Careers', 'Contact Us'].map((item) => (
                                <a key={item} href="#" className="hover:text-white transition-colors text-base font-light block">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-12 lg:col-span-3 bg-white/5 rounded-3xl p-8 border border-white/5 backdrop-blur-sm self-start">
                        <div className="flex items-center gap-3 text-white mb-4">
                            <Mail className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg">Stay Updated</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            Get the latest movie updates, exclusive screenings, and offers delivered to your inbox.
                        </p>
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <span>Subscribe</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-600 font-medium">
                    <p>Copyright © {new Date().getFullYear()} MyShow Entertainment. All Rights Reserved.</p>
                    <div className="flex items-center gap-8">
                        <img src={assets.googlePlay} alt="Google Play" className="h-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer" />
                        <img src={assets.appStore} alt="App Store" className="h-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
