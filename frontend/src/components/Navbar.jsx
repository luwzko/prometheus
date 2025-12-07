import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-50 glass-nav">
            <nav className="flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center group">
                    <span className="text-xl font-semibold tracking-tight text-gray-900" style={{fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"}}>
                        Prometheus
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            pathname === "/"
                                ? "bg-white/50 text-gray-900 shadow-sm"
                                : "text-gray-700 hover:bg-white/30"
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/dashboard"
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            pathname === "/dashboard"
                                ? "bg-white/50 text-gray-900 shadow-sm"
                                : "text-gray-700 hover:bg-white/30"
                        }`}
                    >
                        Dashboard
                    </Link>
                </div>
            </nav>
        </header>
    );
}
