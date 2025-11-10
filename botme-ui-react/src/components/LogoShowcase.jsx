import { useState } from 'react'
import Logo from './Logo'

/**
 * Logo Showcase Component
 * Demonstrates all logo variants and use cases
 */
export default function LogoShowcase() {
  const [selectedVariant, setSelectedVariant] = useState('memory')
  const variants = ['memory', 'warm', 'typography']

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1F2937] mb-2 text-center">
          BotMe Logo Redesign
        </h1>
        <p className="text-center text-[#6B7280] mb-12">
          Three distinct concepts for a memorable, warm, and unique brand identity
        </p>

        {/* Variant Selector */}
        <div className="flex justify-center gap-4 mb-12">
          {variants.map((variant) => (
            <button
              key={variant}
              onClick={() => setSelectedVariant(variant)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedVariant === variant
                  ? 'bg-[#C77DFF] text-white shadow-lg'
                  : 'bg-white text-[#1F2937] border-2 border-[#E5E7EB] hover:border-[#C77DFF]'
              }`}
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </button>
          ))}
        </div>

        {/* Current Variant Showcase */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-12">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">
            {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Concept
          </h2>

          {/* Large Display */}
          <div className="flex flex-col items-center mb-12 p-8 bg-gradient-to-br from-[#F8FAFC] to-white rounded-xl">
            <Logo 
              size={120} 
              variant={selectedVariant}
              showText={true}
              animated={true}
            />
            <p className="mt-4 text-sm text-[#6B7280]">Large Display (Hero)</p>
          </div>

          {/* Different Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center p-6 bg-[#F8FAFC] rounded-xl">
              <Logo size={48} variant={selectedVariant} showText={true} />
              <p className="mt-4 text-sm text-[#6B7280]">Standard (Navbar)</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-[#F8FAFC] rounded-xl">
              <Logo size={32} variant={selectedVariant} showText={true} />
              <p className="mt-4 text-sm text-[#6B7280]">Small (Mobile)</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-[#F8FAFC] rounded-xl">
              <Logo size={24} variant={selectedVariant} showText={false} />
              <p className="mt-4 text-sm text-[#6B7280]">Icon Only (Favicon)</p>
            </div>
          </div>

          {/* Text Only Variant */}
          <div className="flex flex-col items-center p-6 bg-[#F8FAFC] rounded-xl mb-12">
            <Logo size={64} variant={selectedVariant} showText={true} textOnly={true} />
            <p className="mt-4 text-sm text-[#6B7280]">Wordmark Only</p>
          </div>

          {/* Dark Mode */}
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-xl">
            <Logo 
              size={80} 
              variant={selectedVariant}
              showText={true}
              dark={true}
            />
            <p className="mt-4 text-sm text-white/70">Dark Mode</p>
          </div>
        </div>

        {/* Concept Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">Memory Stack</h3>
            <p className="text-[#6B7280] mb-4">
              Stacked chat bubbles represent conversation history and memories. The layered effect shows depth and the passage of time.
            </p>
            <ul className="text-sm text-[#6B7280] space-y-2">
              <li>✓ Conveys conversation history</li>
              <li>✓ Unique visual metaphor</li>
              <li>✓ Scalable and clean</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">Warm Heart</h3>
            <p className="text-[#6B7280] mb-4">
              A friendly chat bubble with a heart inside emphasizes human connection and emotional warmth. Warmer color palette.
            </p>
            <ul className="text-sm text-[#6B7280] space-y-2">
              <li>✓ Emphasizes human connection</li>
              <li>✓ Warm, inviting colors</li>
              <li>✓ Instantly recognizable</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">Typography-Led</h3>
            <p className="text-[#6B7280] mb-4">
              Custom wordmark takes center stage with a subtle icon. Modern, clean, and focuses on brand name recognition.
            </p>
            <ul className="text-sm text-[#6B7280] space-y-2">
              <li>✓ Strong brand recognition</li>
              <li>✓ Minimal and modern</li>
              <li>✓ Works everywhere</li>
            </ul>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#1F2937] mb-3">Recommended Sizes</h3>
              <ul className="text-sm text-[#6B7280] space-y-2">
                <li>• App Icon: 1024×1024px</li>
                <li>• Social Media: 1200×630px</li>
                <li>• Favicon: 32×32px</li>
                <li>• Navbar: 48×48px</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#1F2937] mb-3">Color Palette</h3>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#FF6B9D]"></div>
                <div className="w-12 h-12 rounded-lg bg-[#FF8E53]"></div>
                <div className="w-12 h-12 rounded-lg bg-[#C77DFF]"></div>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">Warm Pink • Warm Orange • Soft Purple</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

