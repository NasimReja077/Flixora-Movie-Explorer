import { Clapperboard, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-100 dark:bg-bg-dark border-t border-gray-200 dark:border-white/5 pt-16 pb-8 text-sm transition-colors duration-300">
            <div className="max-w-360 mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">

                    {/* Brand & Description */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <Clapperboard className="w-8 h-8 text-brand-red" />
                            <span className="text-brand-red font-black text-2xl tracking-wider">FLIX</span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-sm">
                            The ultimate destination for movie lovers. Discover, track, and enjoy the best cinema has to offer.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors text-gray-500 dark:text-gray-400">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors text-gray-500 dark:text-gray-400">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors text-gray-500 dark:text-gray-400">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Browse Links */}
                    <div className="space-y-6">
                        <h4 className="text-gray-900 dark:text-white font-bold text-base">Browse</h4>
                        <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-medium">
                            <li><Link to="/movies" className="hover:text-gray-900 dark:hover:text-white transition-colors">Movies</Link></li>
                            <li><Link to="/tv" className="hover:text-gray-900 dark:hover:text-white transition-colors">TV Shows</Link></li>
                            <li><Link to="/live" className="hover:text-gray-900 dark:hover:text-white transition-colors">Live TV</Link></li>
                            <li><Link to="/awards" className="hover:text-gray-900 dark:hover:text-white transition-colors">Award Winners</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-6">
                        <h4 className="text-gray-900 dark:text-white font-bold text-base">Support</h4>
                        <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-medium">
                            <li><Link to="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link to="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Subscribe */}
                    <div className="space-y-6">
                        <h4 className="text-gray-900 dark:text-white font-bold text-base">Subscribe</h4>
                        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                            Get the latest news and updates directly in your inbox.
                        </p>
                        <form className="flex mt-4" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-l-full px-5 py-3 xl:py-2.5 outline-none text-gray-900 dark:text-white placeholder-gray-500 w-full focus:border-gray-400 dark:focus:border-white/30 transition-colors"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-brand-red hover:bg-red-700 text-white px-6 xl:px-5 py-3 xl:py-2.5 rounded-r-full font-bold transition-colors"
                            >
                                Join
                            </button>
                        </form>
                    </div>

                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-gray-200 dark:border-white/5 text-center text-gray-500 font-medium">
                    <p>© {new Date().getFullYear()} FLIX Media Streaming Service. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};


export default Footer;