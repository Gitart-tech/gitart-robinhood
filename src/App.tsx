import { useState } from 'react'
import { SplashScreen } from './components/SplashScreen'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { WorkflowSection } from './components/WorkflowSection'
import { FeaturesSection } from './components/FeaturesSection'
import { CommandsSection } from './components/CommandsSection'
import { ContractSection } from './components/ContractSection'
import { CTASection } from './components/CTASection'
import { Footer } from './components/Footer'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <main
        className={`min-h-screen bg-background transition-opacity duration-500 ${
          showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Navbar />
        <HeroSection />
        <WorkflowSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="commands">
          <CommandsSection />
        </section>
        <ContractSection />
        <CTASection />
        <Footer />
      </main>
    </>
  )
}
