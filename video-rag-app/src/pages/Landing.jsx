import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTheme } from '../context'

const floatingElements = [
  { emoji: '🚀', x: '10%', y: '20%', delay: 0 },
  { emoji: '📚', x: '85%', y: '15%', delay: 0.2 },
  { emoji: '🧠', x: '15%', y: '70%', delay: 0.4 },
  { emoji: '✨', x: '80%', y: '65%', delay: 0.6 },
  { emoji: '💡', x: '70%', y: '30%', delay: 0.8 },
  { emoji: '🎮', x: '5%', y: '45%', delay: 1.0 },
]

const features = [
  {
    icon: 'smart_display',
    title: 'Watch & Discover',
    description: 'Upload any video! Our super smart AI will break it down into easy, bite-sized pieces.',
    color: '#FF6B6B',
    bgColor: 'rgba(255, 107, 107, 0.1)',
  },
  {
    icon: 'forum',
    title: 'Ask Your Buddy',
    description: 'Got questions? Chat with your AI Study Buddy anytime. It is like a fun tutor in your pocket!',
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.1)',
  },
  {
    icon: 'sports_esports',
    title: 'Play & Learn',
    description: 'Take fun quizzes, earn cool badges, and level up your brain power!',
    color: '#FFE66D',
    bgColor: 'rgba(255, 230, 109, 0.15)',
  },
]

const steps = [
  { number: '1', title: 'Bring a Video', description: 'Paste a YouTube link or upload your own video.' },
  { number: '2', title: 'AI Magic', description: 'Watch as AI reads the video and creates a summary just for you.' },
  { number: '3', title: 'Chat & Ask', description: 'Talk to the AI to understand anything you find tricky.' },
  { number: '4', title: 'Level Up!', description: 'Play quizzes to see how much your amazing brain learned!' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? 'var(--bg)' : '#FFFFFF',
      color: isDarkMode ? '#FFFFFF' : '#1A1B2E',
      overflowX: 'hidden',
      transition: 'background-color 0.3s ease',
      position: 'relative'
    }}>
      
      {/* Playful Background Shapes */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(124, 77, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '-5%', width: '30%', height: '50%',
        background: 'radial-gradient(circle, rgba(23, 222, 202, 0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: isScrolled ? '1rem 2rem' : '1.5rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: isScrolled ? (isDarkMode ? 'rgba(10, 14, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)') : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => window.scrollTo(0,0)}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7C4DFF 0%, #17DECA 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 77, 255, 0.3)'
          }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '24px' }}>menu_book</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>StudyaVerse</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
        >
          <button
            onClick={toggleDarkMode}
            style={{
              background: isDarkMode ? '#222B45' : '#F0F2F8',
              border: 'none', borderRadius: '50%',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="material-symbols-outlined" style={{ color: isDarkMode ? '#FFC563' : '#7C4DFF', fontSize: '20px' }}>
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            style={{
              background: 'var(--primary)',
              color: 'white', border: 'none', borderRadius: '14px',
              padding: '0.6rem 1.25rem', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(124, 77, 255, 0.3)'
            }}
          >
            Play Now
          </motion.button>
        </motion.div>
      </nav>

      {/* Floating Emojis */}
      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            left: el.x,
            top: el.y,
            fontSize: '3rem',
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0.8
          }}
        >
          {el.emoji}
        </motion.div>
      ))}

      {/* Hero Section */}
      <motion.section 
        style={{ 
          minHeight: '100vh', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          padding: '8rem 2rem 4rem', position: 'relative', zIndex: 2,
          opacity: heroOpacity, scale: heroScale, y: heroY
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          style={{
            background: 'var(--primary)', color: 'white',
            padding: '0.5rem 1.25rem', borderRadius: '20px',
            fontWeight: 700, fontSize: '1rem', marginBottom: '2rem',
            display: 'inline-block', boxShadow: '0 4px 14px rgba(124, 77, 255, 0.3)'
          }}
        >
          🎉 The fun way to learn!
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 900,
            lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1.5px',
            maxWidth: '1000px'
          }}
        >
          Make Learning <br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #7C4DFF, #17DECA)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Super Awesome</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: 'var(--text-secondary)',
            maxWidth: '650px', marginBottom: '3rem', lineHeight: 1.6, fontWeight: 500
          }}
        >
          Welcome to StudyaVerse! Upload any video, chat with your AI buddy, play quizzes, and become a genius while having fun.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            style={{
              background: 'linear-gradient(135deg, #7C4DFF 0%, #17DECA 100%)',
              color: 'white', border: 'none', borderRadius: '16px',
              padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 8px 25px rgba(124, 77, 255, 0.4)'
            }}
          >
            Start Your Adventure <span className="material-symbols-outlined">rocket_launch</span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section style={{ padding: '6rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
              Your <span style={{ color: 'var(--primary)' }}>Superpowers</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Look at all the cool things you can do!
            </p>
          </motion.div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'
          }}>
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -10, scale: 1.02 }}
                style={{
                  background: isDarkMode ? '#1D253C' : '#FFFFFF',
                  padding: '2.5rem', borderRadius: '24px',
                  boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
                  border: `2px solid ${isDarkMode ? '#2D3548' : '#F0F2F8'}`,
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 1.5rem',
                  background: feature.bgColor, borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: 'rotate(-5deg)'
                }}>
                  <span className="material-symbols-outlined fill-icon" style={{ fontSize: '40px', color: feature.color }}>
                    {feature.icon}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '6rem 2rem', background: isDarkMode ? '#111827' : '#F8F9FC', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
              How To <span style={{ color: '#17DECA' }}>Play</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Four simple steps to brainy greatness!
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '2rem',
                  background: isDarkMode ? '#1D253C' : '#FFFFFF',
                  padding: '1.5rem 2rem', borderRadius: '20px',
                  boxShadow: isDarkMode ? '0 5px 15px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.03)',
                  border: `1px solid ${isDarkMode ? '#2D3548' : '#F0F2F8'}`
                }}
              >
                <div style={{
                  width: '60px', height: '60px', flexShrink: 0,
                  background: 'var(--primary)', color: 'white',
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(124, 77, 255, 0.3)',
                  transform: 'rotate(5deg)'
                }}>
                  {step.number}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '8rem 2rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: '800px', margin: '0 auto',
            background: 'linear-gradient(135deg, #7C4DFF 0%, #17DECA 100%)',
            borderRadius: '32px', padding: '4rem 2rem', color: 'white',
            boxShadow: '0 20px 40px rgba(124, 77, 255, 0.3)'
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.5rem' }}>
            Ready to become a genius? 🌟
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9, fontWeight: 500 }}>
            Join StudyaVerse now and make studying your fun superpower!
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            style={{
              background: 'white', color: '#7C4DFF',
              border: 'none', borderRadius: '16px',
              padding: '1.2rem 2.5rem', fontSize: '1.2rem', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            Let's Go! 🚀
          </motion.button>
        </motion.div>
      </section>

      <footer style={{
        padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)',
        borderTop: `1px solid ${isDarkMode ? '#2D3548' : '#F0F2F8'}`
      }}>
        <p style={{ fontWeight: 600 }}>🌟 Made for amazing kids &nbsp;·&nbsp; © 2026 StudyaVerse</p>
      </footer>
    </div>
  )
}
