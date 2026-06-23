// Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.0,
  smoothTouch: false,
  infinite: false,
});

// Update ScrollTrigger on Lenis Scroll
lenis.on('scroll', ScrollTrigger.update);

// Integrate Lenis with GSAP Ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Scroll Indicator Button click functionality
const scrollBtn = document.getElementById('scroll-btn');
if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    lenis.scrollTo('#encouragement');
  });
}

// ----------------------------------------------------
// CUSTOM MOUSE GLOW EFFECT
// ----------------------------------------------------
const cursorGlow = document.getElementById('custom-cursor-glow');
if (cursorGlow) {
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursorGlow, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.6,
      ease: 'power3.out'
    });
  });
}

// ----------------------------------------------------
// CANVAS PARTICLES (GOLD & LAVENDER DUST)
// ----------------------------------------------------
const canvas = document.getElementById('canvas-particles');
const ctx = canvas.getContext('2d');

let particles = [];
let particleCount = 80;
let mouse = { x: null, y: null, radius: 150 };

// Adjust particle count for mobile devices
if (window.innerWidth < 768) {
  particleCount = 35;
  mouse.radius = 80;
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * canvas.width;
    this.y = init ? Math.random() * canvas.height : canvas.height + 20;
    this.size = Math.random() * 2.2 + 0.6;
    this.speedY = -(Math.random() * 0.7 + 0.15); // slow upward drift
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.baseAlpha = Math.random() * 0.35 + 0.15;
    this.alpha = this.baseAlpha;
    // Choose gold or lavender
    this.color = Math.random() > 0.5 ? '#FFD700' : '#C8A2FF';
    
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    this.y += this.speedY + this.vy;
    this.x += this.speedX + this.vx;

    // Apply friction to mouse forces
    this.vx *= 0.93;
    this.vy *= 0.93;

    // Mouse magnetic push interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        
        // Gently push away
        this.vx += Math.cos(angle) * force * 1.2;
        this.vy += Math.sin(angle) * force * 1.2;
      }
    }

    // Reset particle if it drifts off the screen top or sides
    if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset(false);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    
    // Add glow for larger particles to feel cinematic
    if (this.size > 1.8) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
    } else {
      ctx.shadowBlur = 0;
    }
    
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 0; // reset shadow for baseline performance
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ----------------------------------------------------
// GSAP SCROLL-TRIGGERED ANIMATIONS
// ----------------------------------------------------

// Wait for resources/DOM to load fully
window.addEventListener('load', () => {
  
  // Register GSAP ScrollTrigger Plugin
  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Entrance Timeline
  const heroTl = gsap.timeline();
  
  heroTl.to('.hero-title', {
    opacity: 1,
    y: 0,
    duration: 1.8,
    ease: 'power4.out',
    delay: 0.3
  })
  .to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: 'power3.out'
  }, '-=1.2')
  .to('.scroll-indicator', {
    opacity: 1,
    duration: 1.0,
    ease: 'power2.out'
  }, '-=0.8');

  // 2. Section 2: Encouragement Message Text Reveal (Scrub)
  const cardLines = gsap.utils.toArray('.encouragement-line');
  cardLines.forEach((line) => {
    gsap.to(line, {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: line,
        start: 'top 85%',
        end: 'top 65%',
        scrub: 1,
        onEnter: () => line.classList.add('active'),
        onLeaveBack: () => line.classList.remove('active'),
        onEnterBack: () => line.classList.add('active')
      }
    });
  });

  // 3. Section 3: Poem Section Background Parallax
  gsap.to('#poem-parallax-bg', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.poem-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Poem Lines ScrollTrigger (Individual revealing)
  const poemLines = gsap.utils.toArray('.poem-line');
  poemLines.forEach((line) => {
    gsap.to(line, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 85%', // Fades in as it enters the 85% threshold of screen height
        end: 'top 60%',   // Fully visible by 60% of screen height
        scrub: 1.2,       // Follows scrolling momentum for smooth reverse
      }
    });
  });

  // 4. Section 4: Final Message Card Sentences
  const finalSentences = gsap.utils.toArray('.final-sentence');
  finalSentences.forEach((sentence) => {
    gsap.to(sentence, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sentence,
        start: 'top 85%',
        end: 'top 65%',
        scrub: 1.2,
      }
    });
  });

  // 5. Section 5: Ending Scene Wishes
  const endingPhrases = gsap.utils.toArray('.ending-phrase');
  endingPhrases.forEach((phrase) => {
    gsap.to(phrase, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: phrase,
        start: 'top 85%',
        end: 'top 60%',
        scrub: 1.2,
      }
    });
  });

  // Refresh ScrollTrigger to ensure all markers and scroll heights are correct
  ScrollTrigger.refresh();
});
