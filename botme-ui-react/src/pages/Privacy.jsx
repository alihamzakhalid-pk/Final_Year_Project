import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react'
import UICard from '../components/ui/Card'

export default function Privacy() {
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
              <Shield className="h-8 w-8 text-[#5B7FFF]" />
            </div>
            <h1 className="text-4xl font-bold text-[#1F2937] mb-4">Privacy Policy</h1>
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
                  Introduction
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Welcome to BotMe. We are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-[#5B7FFF]" />
                  Information We Collect
                </h2>
                <div className="space-y-4 text-[#6B7280]">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Personal Information</h3>
                    <p className="leading-relaxed">
                      When you create an account, we collect:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Full name</li>
                      <li>Email address</li>
                      <li>Password (encrypted and hashed)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Chat Data</h3>
                    <p className="leading-relaxed">
                      When you upload chat transcripts:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Chat messages and conversations</li>
                      <li>Persona information extracted from chats</li>
                      <li>Metadata associated with your uploads</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Usage Data</h3>
                    <p className="leading-relaxed">
                      We automatically collect information about how you use our service, including:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Device information</li>
                      <li>IP address</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-[#5B7FFF]" />
                  How We Use Your Information
                </h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-[#6B7280]">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your account registration and manage your account</li>
                  <li>Extract personas from your chat transcripts</li>
                  <li>Enable AI-powered conversations with extracted personas</li>
                  <li>Send you verification codes and important account notifications</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Detect, prevent, and address technical issues and security threats</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-[#5B7FFF]" />
                  Data Security
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside ml-4 mt-4 space-y-2 text-[#6B7280]">
                  <li>All passwords are encrypted using secure hashing algorithms</li>
                  <li>Data transmission is encrypted using SSL/TLS protocols</li>
                  <li>Access to your data is restricted to authorized personnel only</li>
                  <li>Regular security audits and updates to our systems</li>
                  <li>Your chat data is stored securely and is only accessible to you</li>
                </ul>
              </section>

              {/* Data Storage and Retention */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Data Storage and Retention</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Your data is stored on secure servers. We retain your personal information and chat data for as long as 
                  your account is active or as needed to provide you services. You can delete your account and all 
                  associated data at any time through your account settings.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Your Rights</h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-[#6B7280]">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt-out of non-essential communications</li>
                </ul>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Third-Party Services</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  We may use third-party services (such as AI providers) to process your chat data and generate responses. 
                  These services are bound by strict confidentiality agreements and are only used to provide the core functionality 
                  of BotMe. We do not sell or share your personal information with third parties for marketing purposes.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Children's Privacy</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  BotMe is not intended for users under the age of 13. We do not knowingly collect personal information 
                  from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              {/* Changes to This Policy */}
              <section>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Changes to This Policy</h2>
                <p className="text-[#6B7280] leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                  Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
                  Policy periodically for any changes.
                </p>
              </section>

              {/* Contact Us */}
              <section className="bg-[#F8FAFC] rounded-lg p-6 border border-[#E5E7EB]">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-[#5B7FFF]" />
                  Contact Us
                </h2>
                <p className="text-[#6B7280] leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-[#6B7280]">
                  <p>
                    <strong className="text-[#1F2937]">Email:</strong>{' '}
                    <a href="mailto:privacy@botme.ai" className="text-[#5B7FFF] hover:underline">
                      privacy@botme.ai
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

