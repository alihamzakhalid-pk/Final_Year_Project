import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-[#1F2937] dark:bg-slate-900 py-10 text-base text-slate-300 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 mb-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo size={40} showText={true} dark={true} />
            <p className="text-slate-200 dark:text-slate-300 text-sm leading-relaxed font-medium">
              Transform your WhatsApp chats into AI companions that remember every conversation.
            </p>
          </div>

          {/* Essential Links - Privacy */}
          <div>
            <h3 className="font-semibold text-white dark:text-slate-100 mb-6 text-lg">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors text-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors text-base">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Essential Links - Contact */}
          <div>
            <h3 className="font-semibold text-white dark:text-slate-100 mb-6 text-lg">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors text-base">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Spacer for grid alignment */}
          <div></div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-base">© {new Date().getFullYear()} BotMe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

