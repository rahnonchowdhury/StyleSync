import { Video } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-500 rounded-lg flex items-center justify-center">
                <Video className="text-white w-4 h-4" />
              </div>
              <span className="ml-2 text-xl font-bold">VideoSync</span>
            </div>
            <p className="text-slate-400 text-sm">
              Transform your videos with AI-powered style transfer technology.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 VideoSync. All rights reserved. Built with React, Express.js, and advanced AI.
          </p>
        </div>
      </div>
    </footer>
  )
}