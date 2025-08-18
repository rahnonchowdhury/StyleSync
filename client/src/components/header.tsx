import { Video } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-500 rounded-lg flex items-center justify-center">
                <Video className="text-white w-4 h-4" />
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">StyleSync</span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Examples</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">API</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Support</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-slate-600 hover:text-slate-900 transition-colors" data-testid="button-signin">
              Sign In
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors" data-testid="button-get-started">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
