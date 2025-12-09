import Navbar from "../components/Navbar";

export default function Settings() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient" />

            {/* Subtle overlay for readability */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/30 via-white/20 to-white/40" />

            <Navbar />

            <main className="relative mx-auto max-w-4xl px-6 pt-12 pb-24">
                <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <svg 
                                className="w-8 h-8 text-gray-900" 
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
                            <h1 className="text-4xl font-bold text-gray-900 text-display">
                                Settings
                            </h1>
                        </div>
                        <p className="text-gray-600 text-body">
                            Configure your Prometheus agent preferences and system settings.
                        </p>
                    </div>

                    {/* Settings Sections */}
                    <div className="space-y-8">
                        {/* General Settings */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-display">
                                General
                            </h2>
                            <div className="space-y-4">
                                <div className="glass-input rounded-xl p-4">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                        Theme
                                    </label>
                                    <select className="w-full bg-transparent text-gray-900 text-sm font-medium cursor-pointer">
                                        <option>Light</option>
                                        <option>Dark</option>
                                        <option>System</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* API Settings */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-display">
                                API Configuration
                            </h2>
                            <div className="space-y-4">
                                <div className="glass-input rounded-xl p-4">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                        API Endpoint
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}
                                        className="w-full bg-transparent text-gray-900 text-sm font-mono"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Configured via environment variable
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Agent Settings */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-display">
                                Agent Preferences
                            </h2>
                            <div className="space-y-4">
                                <div className="glass-input rounded-xl p-4">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">
                                        Default Response Mode
                                    </label>
                                    <select className="w-full bg-transparent text-gray-900 text-sm font-medium cursor-pointer">
                                        <option>Auto</option>
                                        <option>Respond</option>
                                        <option>Act</option>
                                        <option>Plan</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* About Section */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-display">
                                About
                            </h2>
                            <div className="glass-input rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Version</span>
                                    <span className="text-sm text-gray-900 font-mono">1.0.0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Build</span>
                                    <span className="text-sm text-gray-900 font-mono">Development</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

