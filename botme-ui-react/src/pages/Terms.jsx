import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'
import UICard from '../components/ui/Card'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EFF6FF] mb-6">
              <Scale className="h-8 w-8 text-[#5B7FFF]" />
            </div>
            <h1 className="text-4xl font-bold text-[#1F2937] mb-4">Terms & Conditions</h1>
            <p className="text-lg text-[#6B7280]">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <UICard className="rounded-xl bg-white p-8 shadow-sm border border-[#E5E7EB]">
            <div className="prose prose-slate max-w-none space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-[#5B7FFF]" />
                  Agreement to Terms
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  By accessing and using BotMe, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              {/* Use License */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-[#5B7FFF]" />
                  Use License
                </h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  Permission is granted to temporarily use BotMe for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-[#6B7280]">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained in BotMe</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">User Accounts</h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-[#6B7280]">
                  <li>Maintaining the security of your account and password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                  <li>Ensuring that you exit from your account at the end of each session</li>
                </ul>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Acceptable Use</h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  You agree not to use BotMe to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-[#6B7280]">
                  <li>Upload any content that is illegal, harmful, or violates any laws</li>
                  <li>Impersonate any person or entity</li>
                  <li>Upload content that infringes on intellectual property rights</li>
                  <li>Transmit any viruses, malware, or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the service for any fraudulent or illegal purpose</li>
                </ul>
              </section>

              {/* Content Ownership */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Content Ownership</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  You retain ownership of all content you upload to BotMe, including chat transcripts and conversations. 
                  By uploading content, you grant us a license to use, process, and store your content solely for the purpose 
                  of providing the BotMe service. We do not claim ownership of your content.
                </p>
              </section>

              {/* Service Availability */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Service Availability</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  We strive to provide continuous access to BotMe, but we do not guarantee that the service will be available 
                  at all times. We reserve the right to modify, suspend, or discontinue the service at any time without notice.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-[#5B7FFF]" />
                  Limitation of Liability
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  In no event shall BotMe or its suppliers be liable for any damages (including, without limitation, damages 
                  for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
                  materials on BotMe, even if BotMe or a BotMe authorized representative has been notified orally or in writing 
                  of the possibility of such damage.
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Termination</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, without prior notice or 
                  liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, 
                  your right to use the service will immediately cease.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Changes to Terms</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
                  material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes 
                  a material change will be determined at our sole discretion.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-[#F8FAFC] rounded-lg p-6 border border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Contact Us</h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  If you have any questions about these Terms & Conditions, please contact us:
                </p>
                <div className="space-y-2 text-[#6B7280]">
                  <p>
                    <strong className="text-[#1F2937]">Email:</strong>{' '}
                    <a href="mailto:legal@botme.ai" className="text-[#5B7FFF] hover:underline">
                      legal@botme.ai
                    </a>
                  </p>
                  <p>
                    <strong className="text-[#1F2937]">Support:</strong>{' '}
                    <a href="mailto:support@botme.ai" className="text-[#5B7FFF] hover:underline">
                      support@botme.ai
                    </a>
                  </p>
                </div>
              </section>
            </div>

            {/* Back Link */}
            <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
              <Link
                to="/"
                className="text-[#5B7FFF] hover:text-[#4A6AD9] font-medium transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </UICard>
        </motion.div>
      </div>
    </div>
  )
}

