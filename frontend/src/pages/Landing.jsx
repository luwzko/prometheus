import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient" />

            {/* Subtle overlay for readability */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/30 via-white/20 to-white/40" />

            <Navbar />

            <main className="relative mx-auto max-w-7xl px-6 pt-32 pb-24">
                {/* Hero Section */}
                <section className="mb-32 animate-fade-in-up">
                    <div className="glass-card rounded-[2rem] p-12 md:p-16 text-center" style={{backdropFilter: 'blur(100px)', WebkitBackdropFilter: 'blur(100px)', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                        {/* Headline */}
                        <h1 className="text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1] text-display">
                            AI that thinks,<br />plans, and executes
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed font-light text-body">
                            Build intelligent agents that work autonomously. From simple automation to complex business processes, Prometheus handles it all.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Link
                                to="/dashboard"
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gray-900 rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300"
                            >
                                Open Dashboard
                                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2.5">
                                <div className="status-indicator status-online w-2.5 h-2.5"></div>
                                <span className="font-medium">Live monitoring</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-medium">Secure & private</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="font-medium">Start instantly</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Cards */}
                <section className="grid md:grid-cols-3 gap-8 mb-24">
                    {[
                        {
                            title: "Agent-First Architecture",
                            description: "Build flexible agents with composable tools and seamless orchestration",
                            icon: "⚡",
                            gradient: "from-blue-500 to-cyan-500"
                        },
                        {
                            title: "Transparent Execution",
                            description: "Inspect every step with detailed traces and real-time monitoring",
                            icon: "👝︝",
                            gradient: "from-purple-500 to-pink-500"
                        },
                        {
                            title: "Built for Teams",
                            description: "Collaborate with shared workspaces, version control, and permissions",
                            icon: "🤝",
                            gradient: "from-orange-500 to-red-500"
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="glass-card glass-hover rounded-2xl p-8 space-component"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-display">
                                {feature.title}
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-body">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Large CTA Section - Distinct Design */}
                <section className="mb-24 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        {/* Left: Text Content */}
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight text-display">
                                Ready to transform your AI workflow?
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed text-body">
                                Join thousands of developers building the next generation of AI-powered applications. Start free, scale as you grow.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>No credit card</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Start instantly</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Free forever plan</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: CTA Card */}
                        <div className="glass-card rounded-2xl p-8 md:p-10 text-center shadow-sm">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Get started today
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Everything you need to build production-ready AI agents
                                    </p>
                                </div>
                                
                                <Link
                                    to="/dashboard"
                                    className="group inline-flex items-center justify-center w-full px-6 py-4 text-base font-semibold text-white bg-gray-900 rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300"
                                >
                                    <span>Get Started Free</span>
                                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>

                                <p className="text-xs text-gray-500">
                                    By continuing, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer spacer */}
            <div className="h-24" />
        </div>
    );
}
