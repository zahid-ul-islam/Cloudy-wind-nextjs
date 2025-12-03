import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Users,
  Kanban,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between glass rounded-2xl px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl">
              <Kanban className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">
              Cloudy Wind
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-violet-600 font-semibold transition-colors"
            >
              Login
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-100 border border-violet-200 rounded-full mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700">
              Modern Project Management
            </span>
          </div>

          <h1 className="text-7xl font-bold text-slate-900 mb-6 animate-slide-up leading-tight">
            Manage Your Projects
            <span className="block gradient-text mt-2">Like Never Before</span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto animate-slide-up leading-relaxed">
            A powerful task management platform designed for teams. Collaborate
            seamlessly, track progress effortlessly, and deliver projects on
            time with our modern, intuitive interface.
          </p>

          <div className="flex items-center justify-center space-x-4 animate-scale-in">
            <Link
              href="/register"
              className="btn btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="btn btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">10K+</div>
              <div className="text-slate-600 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
              <div className="text-slate-600 font-medium">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-slate-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="card relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl mb-6 shadow-lg shadow-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/40 transition-all">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Team Collaboration
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Create teams, invite members, and collaborate in real-time on
                your projects with powerful communication tools.
              </p>
            </div>
          </div>

          <div className="card relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-lg shadow-green-500/30 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all">
                <Kanban className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Kanban Boards
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Visualize your workflow with intuitive drag-and-drop Kanban
                boards and customize them to fit your needs.
              </p>
            </div>
          </div>

          <div className="card relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Task Management
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Create, assign, and track tasks with priorities, labels, and due
                dates for complete project visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="card-glass relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4 shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Lightning Fast
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Built with modern technology for blazing-fast performance.
              </p>
            </div>
          </div>

          <div className="card-glass relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl mb-4 shadow-md shadow-pink-500/20 group-hover:shadow-lg group-hover:shadow-pink-500/30 transition-all">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Secure & Private
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Enterprise-grade security to keep your data safe and protected.
              </p>
            </div>
          </div>

          <div className="card-glass relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl mb-4 shadow-md shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Smart Features
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                AI-powered insights and automation to boost productivity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20">
        <div className="glass rounded-2xl px-8 py-6">
          <div className="text-center text-slate-600">
            <p className="font-medium">
              © 2025 Antorikkho. All rights reserved.
              
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
