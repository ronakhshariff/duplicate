import React, { useState, useEffect } from 'react'
import './App.css'
import burrowlyLogo from './burrowly_logo.PNG?url'
import binooLogo from './binoo.PNG?url'
import BackendTest from './components/BackendTest'

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showA11ySettings, setShowA11ySettings] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Binoo the Beacon, your beacon of hope. How can I help you today?",
      sender: "binoo",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  
  // Accessibility preferences
  const [a11yPrefs, setA11yPrefs] = useState(() => {
    const saved = localStorage.getItem('a11yPrefs')
    return saved ? JSON.parse(saved) : {
      fontSize: 1,
      highContrast: false,
      colorBlind: 'none',
      adhdMode: false,
      sensoryFriendly: false,
      ttsEnabled: false,
      highlightText: false,
      reduceMotion: false,
      zoom: 1
    }
  })

  useEffect(() => {
    localStorage.setItem('a11yPrefs', JSON.stringify(a11yPrefs))
    
    // Apply CSS variables and classes
    const root = document.documentElement
    root.style.setProperty('--font-size-multiplier', a11yPrefs.fontSize)
    root.style.setProperty('--zoom-level', a11yPrefs.zoom)
    root.classList.toggle('high-contrast', a11yPrefs.highContrast)
    root.classList.toggle('color-blind-protanopia', a11yPrefs.colorBlind === 'protanopia')
    root.classList.toggle('color-blind-deuteranopia', a11yPrefs.colorBlind === 'deuteranopia')
    root.classList.toggle('color-blind-tritanopia', a11yPrefs.colorBlind === 'tritanopia')
    root.classList.toggle('adhd-mode', a11yPrefs.adhdMode)
    root.classList.toggle('sensory-friendly', a11yPrefs.sensoryFriendly)
    root.classList.toggle('highlight-text', a11yPrefs.highlightText)
    root.classList.toggle('reduce-motion', a11yPrefs.reduceMotion)
  }, [a11yPrefs])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showA11ySettings && !e.target.closest('.nav-actions') && !e.target.closest('.a11y-dropdown')) {
        setShowA11ySettings(false)
      }
    }
    if (showA11ySettings) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showA11ySettings])

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLearnMore = () => {
    setShowLearnMore(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseModal = () => {
    setShowLearnMore(false)
    setShowSignup(false)
    document.body.style.overflow = 'unset'
  }

  const handleCloseLearnMore = () => {
    setShowLearnMore(false)
    document.body.style.overflow = 'unset'
  }

  const handleGetStarted = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (showLearnMore) {
      setShowLearnMore(false)
      setTimeout(() => {
        setShowSignup(true)
        document.body.style.overflow = 'hidden'
      }, 200)
    } else {
      setShowSignup(true)
      document.body.style.overflow = 'hidden'
    }
  }

  const handleChatToggle = () => {
    setShowChat(!showChat)
    if (!showChat) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const newMessage = {
      id: chatMessages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    }

    setChatMessages([...chatMessages, newMessage])
    setInputMessage("")

    setTimeout(() => {
      const binooResponse = {
        id: chatMessages.length + 2,
        text: "Thanks for reaching out! I'm here to help connect you with neighbors or answer questions about Burrowly. What would you like to know?",
        sender: "binoo",
        timestamp: new Date()
      }
      setChatMessages(prev => {
        const next = [...prev, binooResponse]
        if (a11yPrefs.ttsEnabled && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(binooResponse.text)
          utterance.lang = 'en'
          window.speechSynthesis.speak(utterance)
        }
        return next
      })
    }, 1000)
  }

  const handleQuickAction = (action) => {
    if (action === 'learn-more') {
      setShowChat(false)
      document.body.style.overflow = 'unset'
      setTimeout(() => {
        handleLearnMore()
      }, 200)
    } else if (action === 'sign-up' || action === 'get-started') {
      setShowChat(false)
      document.body.style.overflow = 'unset'
      setTimeout(() => {
        handleGetStarted()
      }, 200)
    }
  }

  return (
    <div className="app">
      {/* SVG Filters for Color Blindness */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/>
          </filter>
        </defs>
      </svg>
      <section className="hero-section">
        <div 
          className="hero-background"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="gradient-orb orb-4"></div>
          <div className="gradient-orb orb-5"></div>
          <div className="gradient-orb orb-6"></div>
          <div className="gradient-orb orb-7"></div>
          <div className="gradient-orb orb-8"></div>
        </div>

        <header className="navbar">
          <div className="nav-container">
            <div className="logo">
              <div className="logo-icon">
                <img src={burrowlyLogo} alt="Burrowly Logo" />
              </div>
              <span className="logo-text">BURROWLY</span>
            </div>

            <nav className="nav-links">
              <a href="#home" className="nav-link">HOME</a>
              <a href="#about" className="nav-link">ABOUT</a>
              <a href="#how-it-works" className="nav-link">HOW IT WORKS</a>
              <a href="#community" className="nav-link">COMMUNITY</a>
              <a href="#contact" className="nav-link">CONTACT</a>
            </nav>

            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search for help or volunteers..."
              />
              <button className="search-button" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>

            <div className="nav-actions" style={{ position: 'relative' }}>
              <button className="login-button">Log In</button>
              <button className="join-button">Join Now</button>
              <button 
                className="settings-button" 
                onClick={() => setShowA11ySettings(!showA11ySettings)}
                aria-label="Accessibility settings"
                aria-expanded={showA11ySettings}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                </svg>
              </button>
              
              {showA11ySettings && (
                <div className="a11y-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="a11y-dropdown-header">
                    <h3>Accessibility Settings</h3>
                    <button 
                      className="a11y-close-btn" 
                      onClick={() => setShowA11ySettings(false)}
                      aria-label="Close settings"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="a11y-dropdown-content">
                    <section className="a11y-section">
                      <h4>Text & Size</h4>
                      <div className="a11y-option">
                        <label>
                          <span>Font Size</span>
                          <div className="a11y-control-group">
                            <button 
                              onClick={() => setA11yPrefs(prev => ({...prev, fontSize: Math.max(0.8, prev.fontSize - 0.1)}))}
                              className="a11y-control-btn"
                            >
                              A−
                            </button>
                            <span className="a11y-value">{a11yPrefs.fontSize.toFixed(1)}x</span>
                            <button 
                              onClick={() => setA11yPrefs(prev => ({...prev, fontSize: Math.min(2, prev.fontSize + 0.1)}))}
                              className="a11y-control-btn"
                            >
                              A+
                            </button>
                          </div>
                        </label>
                      </div>
                      <div className="a11y-option">
                        <label>
                          <span>Zoom Level</span>
                          <div className="a11y-control-group">
                            <button 
                              onClick={() => setA11yPrefs(prev => ({...prev, zoom: Math.max(0.5, prev.zoom - 0.1)}))}
                              className="a11y-control-btn"
                            >
                              −
                            </button>
                            <span className="a11y-value">{Math.round(a11yPrefs.zoom * 100)}%</span>
                            <button 
                              onClick={() => setA11yPrefs(prev => ({...prev, zoom: Math.min(2, prev.zoom + 0.1)}))}
                              className="a11y-control-btn"
                            >
                              +
                            </button>
                          </div>
                        </label>
                      </div>
                    </section>

                    <section className="a11y-section">
                      <h4>Visual</h4>
                      <div className="a11y-option">
                        <label className="a11y-toggle">
                          <input 
                            type="checkbox" 
                            checked={a11yPrefs.highContrast}
                            onChange={e => setA11yPrefs(prev => ({...prev, highContrast: e.target.checked}))}
                          />
                          <span>High Contrast Mode</span>
                        </label>
                      </div>
                      <div className="a11y-option">
                        <label className="a11y-toggle">
                          <input 
                            type="checkbox" 
                            checked={a11yPrefs.highlightText}
                            onChange={e => setA11yPrefs(prev => ({...prev, highlightText: e.target.checked}))}
                          />
                          <span>Text Highlighting</span>
                        </label>
                      </div>
                      <div className="a11y-option">
                        <label>
                          <span>Color Blindness</span>
                          <select 
                            value={a11yPrefs.colorBlind}
                            onChange={e => setA11yPrefs(prev => ({...prev, colorBlind: e.target.value}))}
                            className="a11y-select"
                          >
                            <option value="none">None</option>
                            <option value="protanopia">Protanopia (Red-Blind)</option>
                            <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                            <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                          </select>
                        </label>
                      </div>
                    </section>

                    <section className="a11y-section">
                      <h4>Focus & Attention</h4>
                      <div className="a11y-option">
                        <label className="a11y-toggle">
                          <input 
                            type="checkbox" 
                            checked={a11yPrefs.adhdMode}
                            onChange={e => setA11yPrefs(prev => ({...prev, adhdMode: e.target.checked}))}
                          />
                          <span>ADHD Focus Mode</span>
                        </label>
                      </div>
                      <div className="a11y-option">
                        <label className="a11y-toggle">
                          <input 
                            type="checkbox" 
                            checked={a11yPrefs.sensoryFriendly}
                            onChange={e => setA11yPrefs(prev => ({...prev, sensoryFriendly: e.target.checked}))}
                          />
                          <span>Sensory-Friendly Mode</span>
                        </label>
                      </div>
                    </section>

                    <section className="a11y-section">
                      <h4>Motion & Audio</h4>
                      <div className="a11y-option">
                        <label className="a11y-toggle">
                          <input 
                            type="checkbox" 
                            checked={a11yPrefs.reduceMotion}
                            onChange={e => setA11yPrefs(prev => ({...prev, reduceMotion: e.target.checked}))}
                          />
                          <span>Reduce Motion</span>
                        </label>
                      </div>
                      <div className="a11y-option">
                        <label className="a11y-toggle">
                          <input 
                            type="checkbox" 
                            checked={a11yPrefs.ttsEnabled}
                            onChange={e => setA11yPrefs(prev => ({...prev, ttsEnabled: e.target.checked}))}
                          />
                          <span>Text-to-Speech</span>
                        </label>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <h1 className="welcome-heading">WELCOME</h1>
          
          <p className="body-text">
            Connecting neighbors in need with nearby helpers. 
            Building stronger, more resilient communities together.
          </p>

          <button className="learn-more-button" onClick={handleLearnMore}>
            <span>LEARN MORE</span>
            <div className="button-glow"></div>
          </button>
        </div>
      </section>

      {showLearnMore && (
        <div className="modal-overlay" onClick={handleCloseLearnMore}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-bg-orb modal-orb-1"></div>
            <div className="modal-bg-orb modal-orb-2"></div>
            <div className="modal-bg-orb modal-orb-3"></div>

            <button className="modal-close" onClick={handleCloseLearnMore} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="modal-header">
              <div className="modal-header-glow"></div>
              <h2 className="modal-title">About Burrowly</h2>
              <p className="modal-subtitle">AI-Powered Neighborhood Resilience Network</p>
              <div className="modal-badge">
                <span className="badge-dot"></span>
                <span>Building Stronger Communities</span>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <h3 className="section-title">Our Mission</h3>
                </div>
                <p className="section-text">
                  Burrowly brings neighbors together when it matters most. When someone needs help, 
                  we connect them with people nearby who can lend a hand. Whether it's shoveling a 
                  sidewalk, checking on an elderly neighbor, or responding during an emergency, we're 
                  building communities where everyone looks out for each other. No one should have to 
                  face challenges alone, and that's what Burrowly is all about.
                </p>
              </div>

              <div className="modal-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h3 className="section-title">The Challenge</h3>
                </div>
                <p className="section-text">
                  More than half of us live in cities now, and that number keeps growing. But here's the thing: 
                  our cities are struggling. Transportation is getting harder, housing costs are out of reach, 
                  pollution is everywhere, and our infrastructure just can't keep up. The truth is, when 
                  emergencies happen or someone needs help, official services can't always get there in time. 
                  That's where neighbors step in. Research shows that when disasters strike, neighbors are 
                  the ones who save lives, not just first responders.
                </p>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">50%+</div>
                    <div className="stat-label">Live in Cities</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">70%</div>
                    <div className="stat-label">By 2050</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">∞</div>
                    <div className="stat-label">Possibilities</div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <h3 className="section-title">How It Works</h3>
                </div>
                <div className="features-list">
                  <div className="feature-item feature-pink">
                    <div className="feature-icon-wrapper">
                      <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                      <div className="feature-icon-glow"></div>
                    </div>
                    <div className="feature-content">
                      <h4>Request Help</h4>
                      <p>Need something? Just ask. Use your voice, type a message, or snap a photo. We'll figure out 
                      what you need and how urgent it is, so the right people can help you quickly.</p>
                    </div>
                  </div>
                  <div className="feature-item feature-purple">
                    <div className="feature-icon-wrapper">
                      <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="10" r="3"/>
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
                      </svg>
                      <div className="feature-icon-glow"></div>
                    </div>
                    <div className="feature-content">
                      <h4>Real-Time Feed</h4>
                      <p>See who needs help right around you. Our map shows requests nearby, and if someone wrote 
                      in a different language, we'll translate it so you can understand and help.</p>
                    </div>
                  </div>
                  <div className="feature-item feature-green">
                    <div className="feature-icon-wrapper">
                      <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        <line x1="8" y1="9" x2="16" y2="9"/>
                        <line x1="8" y1="13" x2="14" y2="13"/>
                      </svg>
                      <div className="feature-icon-glow"></div>
                    </div>
                    <div className="feature-content">
                      <h4>Connect & Help</h4>
                      <p>See a request you can help with? Just tap accept and start chatting. Don't worry about 
                      language barriers, we'll translate everything so you can communicate easily.</p>
                    </div>
                  </div>
                  <div className="feature-item feature-blue">
                    <div className="feature-icon-wrapper">
                      <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                      <div className="feature-icon-glow"></div>
                    </div>
                    <div className="feature-content">
                      <h4>AI Insights</h4>
                      <p>City leaders can see where help is needed most. Our dashboards highlight areas that need 
                      attention, so resources can go where they'll make the biggest difference.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  </div>
                  <h3 className="section-title">Key Features</h3>
                </div>
                <div className="features-grid-modal">
                  <div className="feature-tag tag-1">
                    <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span>Multi-language support</span>
                  </div>
                  <div className="feature-tag tag-2">
                    <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span>AI-powered matching</span>
                  </div>
                  <div className="feature-tag tag-3">
                    <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>Location-based discovery</span>
                  </div>
                  <div className="feature-tag tag-4">
                    <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Voice, text & photo</span>
                  </div>
                  <div className="feature-tag tag-5">
                    <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Secure network</span>
                  </div>
                  <div className="feature-tag tag-6">
                    <svg className="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <span>Real-time analytics</span>
                  </div>
                </div>
              </div>

              <div className="modal-cta-section">
                <button 
                  type="button"
                  className="modal-cta-button" 
                  onClick={handleGetStarted}
                >
                  <span>Join Burrowly Now</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                  <div className="cta-button-glow"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content signup-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="signup-header">
              <div className="signup-header-glow"></div>
              <h2 className="signup-title">Join Burrowly</h2>
              <p className="signup-subtitle">Start building stronger communities today</p>
            </div>

            <div className="signup-body">
              <form className="signup-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="john@example.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    placeholder="City, State"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">I want to</label>
                  <select id="role" name="role" className="form-select">
                    <option value="">Select an option</option>
                    <option value="help">Offer help to neighbors</option>
                    <option value="need">Request help when needed</option>
                    <option value="both">Both - help and be helped</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="terms" className="form-checkbox"/>
                    <span>I agree to the Terms of Service and Privacy Policy</span>
                  </label>
                </div>

                <button type="submit" className="signup-submit-button">
                  <span>Create Account</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  <div className="submit-button-glow"></div>
                </button>
              </form>

              <div className="signup-divider">
                <span>or</span>
              </div>

              <div className="social-signup">
                <button className="social-button google-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <button className="social-button apple-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="about" className="content-section">
        <div className="section-container">
          <h2 className="section-heading">About Burrowly</h2>
          <p className="section-text">
            More than half of us live in cities now, and that number keeps growing. But our cities are 
            struggling with transportation, housing costs, pollution, and infrastructure that can't keep up. 
            When emergencies happen or someone needs help, official services can't always get there in time. 
            That's where Burrowly comes in. We connect neighbors who need help with neighbors who can 
            help, using smart technology to make sure no one gets left behind.
          </p>
        </div>
      </section>

      <section className="content-section alt">
        <div className="section-container">
          <h2 className="section-heading">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Request Help</h3>
              <p>Need something? Just ask. Use your voice, type a message, or snap a photo. We'll figure out 
              what you need and how urgent it is, so the right people can help you quickly.</p>
            </div>
            <div className="feature-card">
              <h3>Real-Time Feed</h3>
              <p>See who needs help right around you. Our map shows requests nearby, and if someone wrote 
              in a different language, we'll translate it so you can understand and help.</p>
            </div>
            <div className="feature-card">
              <h3>Connect & Help</h3>
              <p>See a request you can help with? Just tap accept and start chatting. Don't worry about 
              language barriers, we'll translate everything so you can communicate easily.</p>
            </div>
            <div className="feature-card">
              <h3>AI Insights</h3>
              <p>City leaders can see where help is needed most. Our dashboards highlight areas that need 
              attention, so resources can go where they'll make the biggest difference.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="content-section">
        <div className="section-container">
          <h2 className="section-heading">Get In Touch</h2>
          <p className="section-text">
            Ready to build a stronger community? Join Burrowly today and be part of creating 
            safer, more inclusive, and resilient neighborhoods.
          </p>
          <button className="cta-button" onClick={handleGetStarted}>Get Started</button>
        </div>
      </section>

      {/* Backend Connection Test - Remove this after testing */}
      <BackendTest />

      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2025 Burrowly. All rights reserved.</p>
        </div>
      </footer>

      <button className="chat-button" onClick={handleChatToggle} aria-label="Open chat">
        <div className="chat-button-icon">
          <img src={binooLogo} alt="Binoo" />
        </div>
        <span className="chat-button-text">Get Help</span>
      </button>

      {showChat && (
        <div className="chat-overlay">
          <div className="chat-container">
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="binoo-avatar">
                  <img src={binooLogo} alt="Binoo the Beacon" />
                </div>
                <div>
                  <h3 className="chat-title">Binoo the Beacon</h3>
                  <p className="chat-subtitle">Your beacon of hope</p>
                </div>
              </div>
              <button className="chat-close" onClick={handleChatToggle} aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`chat-message ${message.sender === 'user' ? 'user-message' : 'binoo-message'}`}>
                  {message.sender === 'binoo' && (
                    <div className="message-avatar">
                      <img src={binooLogo} alt="Binoo" />
                    </div>
                  )}
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {chatMessages.length === 1 && (
                <div className="quick-actions">
                  <button 
                    className="quick-action-btn" 
                    onClick={() => handleQuickAction('learn-more')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Learn More
                  </button>
                  <button 
                    className="quick-action-btn" 
                    onClick={() => handleQuickAction('get-started')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Get Started
                  </button>
                  <button 
                    className="quick-action-btn" 
                    onClick={() => handleQuickAction('sign-up')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            <form className="chat-input-container" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" className="chat-send-button" aria-label="Send message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
