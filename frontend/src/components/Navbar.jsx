import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-50 glass-nav">
            <nav className="flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center group">
                    <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 uppercase" style={{fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "0.05em"}}>
                        Prometheus
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            pathname === "/"
                                ? "bg-white/50 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10"
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            pathname === "/dashboard"
                                ? "bg-white/50 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10"
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/settings"
                        className={`p-2 rounded-xl transition-all duration-200 ${
                            pathname === "/settings"
                                ? "bg-white/50 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10"
                        }`}
                        title="Settings"
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                            />
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                        </svg>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
