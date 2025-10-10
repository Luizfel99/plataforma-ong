/**
 * ============================================================================
 * SISTEMA DE ANIMAÇÕES E MICRO-INTERAÇÕES - JAVASCRIPT
 * Atividade 2: CSS3 Avançado com Design System Profissional
 * ============================================================================
 */

class AnimationSystem {
  constructor() {
    this.observers = new Map();
    this.parallaxElements = [];
    this.morphingElements = [];
    this.rafId = null;
    this.lastScrollY = 0;
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupParallaxEffects();
    this.setupMorphingBorders();
    this.setupRippleEffects();
    this.setupMagneticEffects();
    this.setupStaggeredAnimations();
    this.setupProgressAnimations();
    this.bindEvents();
  }

  /**
   * ========== SCROLL ANIMATIONS ==========
   */
  
  setupScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      this.fallbackScrollAnimations();
      return;
    }

    const observerOptions = {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const animationType = element.dataset.scrollAnimation;
        
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          this.triggerScrollAnimation(element, animationType);
        } else if (element.dataset.scrollReverse === 'true') {
          this.reverseScrollAnimation(element, animationType);
        }
      });
    }, observerOptions);

    // Observe all scroll animation elements
    const scrollElements = document.querySelectorAll('[data-scroll-animation]');
    scrollElements.forEach(element => {
      observer.observe(element);
    });

    this.observers.set('scroll', observer);
  }

  triggerScrollAnimation(element, animationType) {
    if (element.classList.contains('animated')) return;

    const delay = parseInt(element.dataset.scrollDelay) || 0;
    
    setTimeout(() => {
      switch (animationType) {
        case 'fade-in':
          element.classList.add('scroll-fade-in', 'visible');
          break;
        case 'slide-left':
          element.classList.add('scroll-slide-left', 'visible');
          break;
        case 'slide-right':
          element.classList.add('scroll-slide-right', 'visible');
          break;
        case 'scale-in':
          element.classList.add('scroll-scale-in', 'visible');
          break;
        case 'bounce-in':
          element.classList.add('animate-bounce-in');
          break;
        case 'flip-in-x':
          element.classList.add('animate-flip-in-x');
          break;
        case 'flip-in-y':
          element.classList.add('animate-flip-in-y');
          break;
        case 'rotate-in':
          element.classList.add('animate-rotate-in');
          break;
        default:
          element.classList.add('animate-fade-in-up');
      }
      
      element.classList.add('animated');
      
      // Trigger custom event
      element.dispatchEvent(new CustomEvent('animationTriggered', {
        detail: { type: animationType }
      }));
    }, delay);
  }

  reverseScrollAnimation(element, animationType) {
    element.classList.remove('visible', 'animated');
    element.classList.remove(
      'animate-bounce-in', 'animate-flip-in-x', 'animate-flip-in-y', 
      'animate-rotate-in', 'animate-fade-in-up'
    );
  }

  fallbackScrollAnimations() {
    // Fallback for browsers without IntersectionObserver
    const scrollElements = document.querySelectorAll('[data-scroll-animation]');
    
    const checkScroll = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      scrollElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top + scrollY;
        if (scrollY + windowHeight > elementTop + 100) {
          const animationType = element.dataset.scrollAnimation;
          this.triggerScrollAnimation(element, animationType);
        }
      });
    };
    
    window.addEventListener('scroll', this.throttle(checkScroll, 100));
    checkScroll(); // Initial check
  }

  /**
   * ========== PARALLAX EFFECTS ==========
   */
  
  setupParallaxEffects() {
    this.parallaxElements = Array.from(document.querySelectorAll('[data-parallax]'));
    
    if (this.parallaxElements.length > 0) {
      this.updateParallax();
      window.addEventListener('scroll', this.throttle(() => this.updateParallax(), 16));
    }
  }

  updateParallax() {
    const scrollY = window.pageYOffset;
    
    this.parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5;
      const yPos = -(scrollY * speed);
      element.style.setProperty('--parallax-y', `${yPos}px`);
    });
  }

  /**
   * ========== MORPHING BORDERS ==========
   */
  
  setupMorphingBorders() {
    const morphingElements = document.querySelectorAll('.morphing-border');
    
    morphingElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.startMorphingAnimation(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.stopMorphingAnimation(element);
      });
    });
  }

  startMorphingAnimation(element) {
    element.style.backgroundSize = '100% 100%, 100% 100%';
  }

  stopMorphingAnimation(element) {
    element.style.backgroundSize = '100% 100%, 200% 200%';
  }

  /**
   * ========== RIPPLE EFFECTS ==========
   */
  
  setupRippleEffects() {
    const rippleElements = document.querySelectorAll('.ripple');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', (e) => {
        this.createRipple(e, element);
      });
    });
  }

  createRipple(event, element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
    
    // Add CSS for ripple animation if not exists
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple-animation {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * ========== MAGNETIC EFFECTS ==========
   */
  
  setupMagneticEffects() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        this.updateMagneticEffect(e, element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.resetMagneticEffect(element);
      });
    });
  }

  updateMagneticEffect(event, element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (event.clientX - centerX) * 0.15;
    const deltaY = (event.clientY - centerY) * 0.15;
    
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  resetMagneticEffect(element) {
    element.style.transform = 'translate(0px, 0px)';
  }

  /**
   * ========== STAGGERED ANIMATIONS ==========
   */
  
  setupStaggeredAnimations() {
    const staggerContainers = document.querySelectorAll('[data-stagger]');
    
    staggerContainers.forEach(container => {
      const children = container.children;
      const delay = parseInt(container.dataset.stagger) || 100;
      const animation = container.dataset.staggerAnimation || 'fade-in-up';
      
      Array.from(children).forEach((child, index) => {
        child.style.opacity = '0';
        child.style.transform = this.getInitialTransform(animation);
        
        setTimeout(() => {
          child.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          child.style.opacity = '1';
          child.style.transform = 'none';
        }, index * delay);
      });
    });
  }

  getInitialTransform(animation) {
    switch (animation) {
      case 'fade-in-up':
        return 'translateY(30px)';
      case 'fade-in-down':
        return 'translateY(-30px)';
      case 'fade-in-left':
        return 'translateX(-30px)';
      case 'fade-in-right':
        return 'translateX(30px)';
      case 'scale-in':
        return 'scale(0.8)';
      default:
        return 'translateY(30px)';
    }
  }

  /**
   * ========== PROGRESS ANIMATIONS ==========
   */
  
  setupProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-animated');
    
    progressBars.forEach(progressBar => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateProgress(progressBar);
            observer.unobserve(progressBar);
          }
        });
      });
      
      observer.observe(progressBar);
    });
  }

  animateProgress(progressBar) {
    const progressFill = progressBar.querySelector('.progress-bar');
    const targetWidth = progressFill.dataset.width || '100%';
    
    progressFill.style.setProperty('--progress-width', targetWidth);
    progressBar.classList.add('progress-animated');
  }

  /**
   * ========== LOADING ANIMATIONS ==========
   */
  
  showLoading(element, type = 'spinner') {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.disabled = true;
    
    let loadingHTML = '';
    
    switch (type) {
      case 'spinner':
        loadingHTML = '<div class="loading-spinner"></div>';
        break;
      case 'dots':
        loadingHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        break;
      case 'bars':
        loadingHTML = '<div class="loading-bars"><span></span><span></span><span></span><span></span><span></span></div>';
        break;
      case 'skeleton':
        element.classList.add('skeleton');
        return;
      default:
        loadingHTML = '<div class="loading-spinner"></div>';
    }
    
    element.innerHTML = loadingHTML;
  }

  hideLoading(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
      element.innerHTML = originalContent;
      element.disabled = false;
      element.classList.remove('skeleton');
      delete element.dataset.originalContent;
    }
  }

  /**
   * ========== ADVANCED EFFECTS ==========
   */
  
  // Typewriter effect
  typewriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        element.dispatchEvent(new CustomEvent('typewriterComplete'));
      }
    }, speed);
    
    return typeInterval;
  }

  // Count up animation
  countUp(element, start = 0, end = 100, duration = 2000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const updateCount = () => {
      current += increment;
      
      if (current >= end) {
        element.textContent = end.toLocaleString();
        element.dispatchEvent(new CustomEvent('countUpComplete'));
      } else {
        element.textContent = Math.round(current).toLocaleString();
        requestAnimationFrame(updateCount);
      }
    };
    
    updateCount();
  }

  // Morphing text effect
  morphText(element, texts, interval = 3000) {
    let currentIndex = 0;
    
    const morphNext = () => {
      element.style.opacity = '0';
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % texts.length;
        element.textContent = texts[currentIndex];
        element.style.opacity = '1';
      }, 300);
    };
    
    return setInterval(morphNext, interval);
  }

  // Particle explosion effect
  createParticleExplosion(x, y, count = 20) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 100 + Math.random() * 100;
      const size = 4 + Math.random() * 8;
      
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        animation: particle-explosion 1s ease-out forwards;
      `;
      
      particle.style.setProperty('--dx', `${Math.cos(angle) * velocity}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * velocity}px`);
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }
    
    // Add particle explosion CSS if not exists
    if (!document.getElementById('particle-styles')) {
      const style = document.createElement('style');
      style.id = 'particle-styles';
      style.textContent = `
        @keyframes particle-explosion {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * ========== EVENT BINDINGS ==========
   */
  
  bindEvents() {
    // Animate elements on page load
    window.addEventListener('load', () => {
      this.animateOnLoad();
    });

    // Handle hover animations
    document.addEventListener('mouseenter', (e) => {
      if (e.target.matches('.hover-lift, .hover-grow, .hover-shrink')) {
        e.target.style.willChange = 'transform';
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (e.target.matches('.hover-lift, .hover-grow, .hover-shrink')) {
        e.target.style.willChange = 'auto';
      }
    }, true);

    // Keyboard navigation animations
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Animation end cleanup
    document.addEventListener('animationend', (e) => {
      const element = e.target;
      element.style.willChange = 'auto';
    });
  }

  animateOnLoad() {
    // Animate elements that should appear on page load
    const loadAnimations = document.querySelectorAll('[data-load-animation]');
    
    loadAnimations.forEach((element, index) => {
      const animationType = element.dataset.loadAnimation;
      const delay = parseInt(element.dataset.loadDelay) || index * 100;
      
      setTimeout(() => {
        element.classList.add(`animate-${animationType}`);
      }, delay);
    });
  }

  /**
   * ========== UTILITY METHODS ==========
   */
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * ========== PUBLIC API ==========
   */
  
  // Trigger animation on specific element
  animate(element, animationType, options = {}) {
    const {
      delay = 0,
      duration = null,
      callback = null
    } = options;
    
    setTimeout(() => {
      element.classList.add(`animate-${animationType}`);
      
      if (duration) {
        element.style.animationDuration = `${duration}ms`;
      }
      
      if (callback) {
        const onAnimationEnd = () => {
          callback();
          element.removeEventListener('animationend', onAnimationEnd);
        };
        element.addEventListener('animationend', onAnimationEnd);
      }
    }, delay);
  }

  // Chain multiple animations
  chain(element, animations) {
    let currentIndex = 0;
    
    const runNext = () => {
      if (currentIndex >= animations.length) return;
      
      const anim = animations[currentIndex];
      this.animate(element, anim.type, {
        delay: anim.delay || 0,
        duration: anim.duration,
        callback: () => {
          currentIndex++;
          runNext();
        }
      });
    };
    
    runNext();
  }

  // Remove all animations from element
  removeAnimations(element) {
    const animationClasses = Array.from(element.classList).filter(cls => 
      cls.startsWith('animate-') || cls.includes('visible') || cls.includes('animated')
    );
    
    element.classList.remove(...animationClasses);
    element.style.animation = '';
    element.style.transform = '';
    element.style.opacity = '';
  }

  // Check if animations are supported
  supportsAnimations() {
    const element = document.createElement('div');
    return 'animation' in element.style;
  }

  // Performance monitor
  monitorPerformance() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 16.67) { // More than one frame at 60fps
            console.warn('Slow animation detected:', entry);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }
}

// Initialize the animation system
const animationSystem = new AnimationSystem();

// Export for modules
if (typeof window !== 'undefined') {
  window.AnimationSystem = AnimationSystem;
  window.animationSystem = animationSystem;
}

/**
 * ========== EXEMPLOS DE USO ==========
 */

/*
// Animar elemento específico
animationSystem.animate(document.getElementById('myElement'), 'bounce-in', {
  delay: 500,
  callback: () => console.log('Animation complete!')
});

// Chain de animações
animationSystem.chain(document.getElementById('myElement'), [
  { type: 'fade-in', delay: 0 },
  { type: 'bounce', delay: 500 },
  { type: 'pulse', delay: 1000 }
]);

// Efeito typewriter
animationSystem.typewriter(
  document.getElementById('typewriter-text'),
  'Este texto será digitado automaticamente!',
  100
);

// Count up
animationSystem.countUp(
  document.getElementById('counter'),
  0,
  1000,
  2000
);

// HTML de exemplo:
<div data-scroll-animation="fade-in" data-scroll-delay="200">
  Conteúdo que aparece ao fazer scroll
</div>

<div data-parallax="0.5">
  Elemento com efeito parallax
</div>

<button class="btn ripple magnetic">
  Botão com efeitos interativos
</button>

<div data-stagger="100" data-stagger-animation="fade-in-up">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
*/