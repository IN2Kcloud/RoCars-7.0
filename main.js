// LOADER ==============================
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    const counterDisplay = document.querySelector('.load-counter');
    let loadProgress = { value: 0 };

    // 1. Forced 5-Second "Heavy System Check" Sequence
    tl.to(loadProgress, {
        value: 100,
        duration: 5,
        // Using a "SlowMo" ease combined with steps makes it look like it's 
        // struggling at 20% and 80% (classic loading behavior)
        ease: "slow(0.1, 0.8, false)", 
        onUpdate: () => {
            // Randomly flicker the opacity slightly during update for realism
            if (Math.random() > 0.85) {
                counterDisplay.style.opacity = "0.5";
            } else {
                counterDisplay.style.opacity = "1";
            }
            
            const displayVal = Math.round(loadProgress.value).toString().padStart(2, '0');
            if(counterDisplay) counterDisplay.innerText = displayVal;
        }
    });

    // The bar mirrors the "struggle" of the counter
    tl.to(".load-bar", {
        width: "100%",
        duration: 5,
        ease: "slow(0.1, 0.8, false)"
    }, 0); 

    // 2. Flicker the status text near the end for a "glitch" effect
    tl.to(".load-status", {
        opacity: 0,
        repeat: 3,
        yoyo: true,
        duration: 0.1
    }, 4.5);

    // 3. Fade out the loader content
    tl.to(".loading-content", {
        opacity: 0,
        duration: 0.4,
        ease: "power4.inOut"
    });

    // 3. THE REVEAL: Snap open the shutters
    // Note: yPercent: -102/102 ensures no tiny slivers of black remain
    tl.to(".shutter-top", { yPercent: -102, duration: 1.5, ease: "expo.inOut" }, "+=0.2");
    tl.to(".shutter-bottom", { yPercent: 102, duration: 1.5, ease: "expo.inOut" }, "<");

    // 4. The "Ignition" Reveal (Page Elements)
    tl.set(".marqueecontainer, .logo-glitch-wrapper, .we, .tv-wrapper, .pulse-circles", { 
        visibility: "visible" 
    });

    tl.fromTo(".logo-glitch-wrapper", 
        { scale: 2, opacity: 0, filter: "blur(20px)" }, 
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 2.5, ease: "power4.out" }, "-=0.8");

    tl.fromTo(".marqueecontainer", 
        { y: -50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, ease: "back.out(1.2)" }, "-=1.8");

    tl.fromTo(".tv-wrapper, .pulse-circles", 
        { y: 80, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" }, "-=1.5");

    tl.to(".we", { opacity: 1, duration: 1.5 }, "-=1");

    // Clean up
    tl.set(".loading", { display: "none" });
});



/* -- Glow effect -- */

const blob = document.getElementById("blob");
window.onpointermove = event => { 
  const { clientX, clientY } = event;
 
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 3000, fill: "forwards" });
}
// JS to force remove scroll
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';

 
// SVG turbulence animation
const turbulencemax = document.getElementById("text-turbulence-max");
const turbulence = document.getElementById("text-turbulence");

let svgFrame = 0;
let lastSVGTime = 0;

function animateSVGFilter(time) {
  if (time - lastSVGTime > 100) {
    svgFrame += 0.02;
    const freq = 0.05 + Math.sin(svgFrame) * 0.01;
    turbulencemax?.setAttribute("baseFrequency", freq);
    turbulence?.setAttribute("baseFrequency", freq);
    lastSVGTime = time;
  }
  requestAnimationFrame(animateSVGFilter);
}
animateSVGFilter();

// Logo magnet + animation
const logo = document.querySelector('.logo-glitch-wrapper');
let logoBounds = null;
let logoTargetX = 0;
let logoTargetY = 0;
let logoCurrentX = 0;
let logoCurrentY = 0;
let logoGlitchTimeout;

function updateLogoBounds() {
  logoBounds = logo.getBoundingClientRect();
}
function applyLogoMagnet(x, y) {
  if (!logoBounds) return;
  const centerX = logoBounds.left + logoBounds.width / 2;
  const centerY = logoBounds.top + logoBounds.height / 2;
  const offsetX = x - centerX;
  const offsetY = y - centerY;
  logoTargetX = offsetX * 0.2;
  logoTargetY = offsetY * 0.2;
  const distance = Math.hypot(offsetX, offsetY);
}
function resetLogoMagnet() {
  logoTargetX = 0;
  logoTargetY = 0;
  logo.classList.remove('glitching');
}
function animateLogo() {
  logoCurrentX += (logoTargetX - logoCurrentX) * 0.1;
  logoCurrentY += (logoTargetY - logoCurrentY) * 0.1;
  logo.style.transform = `translate(calc(-50% + ${logoCurrentX}px), calc(-50% + ${logoCurrentY}px)) rotate(-20deg)`;
  requestAnimationFrame(animateLogo);
}
animateLogo();
logo.addEventListener('mouseenter', updateLogoBounds);
logo.addEventListener('mousemove', (e) => applyLogoMagnet(e.clientX, e.clientY));
logo.addEventListener('mouseleave', resetLogoMagnet);
logo.addEventListener('touchstart', (e) => {
  updateLogoBounds();
  applyLogoMagnet(e.touches[0].clientX, e.touches[0].clientY);
});
logo.addEventListener('touchmove', (e) => applyLogoMagnet(e.touches[0].clientX, e.touches[0].clientY));
logo.addEventListener('touchend', resetLogoMagnet);
logo.addEventListener('touchcancel', resetLogoMagnet);


window.addEventListener('load', () => {
  // 1. Existing Loading Logic
  document.body.classList.remove('before-load');
  
  // 2. Marquee Initialization
  const initMarquee = (selector, duration = 60) => {
    const wrapper = document.querySelector(selector);
    if (!wrapper) return;
  
    // Clone the items to ensure the screen is full
    const items = wrapper.innerHTML;
    wrapper.innerHTML = items + items + items; 
  
    // Calculate the width of ONE set of items
    const scrollWidth = wrapper.scrollWidth / 3;
  
    gsap.to(wrapper, {
      x: -scrollWidth,
      duration: duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % scrollWidth)
      }
    });
  };
  
  // Initialize both marquees
  initMarquee(".marqueecontent");
  initMarquee(".marqueecontentII", 45); // You can even give them different speeds!
});
/*
// ========== WORD MORPHING ========== //

const el = document.querySelector("#rocars-text");
const glowColor = "#fff";
const fonts = ["'Aero'", "'sickcapital'", "'SterousDemoRegular'", "'Street'", "'Wall'"];

// Track the current font to prevent repeats
let currentFont = "";

function getNextFont() {
    // Filter out the current font from the list of choices
    const availableFonts = fonts.filter(f => f !== currentFont);
    // Pick a random one from the remaining options
    const nextFont = gsap.utils.random(availableFonts);
    // Update the tracker
    currentFont = nextFont;
    return nextFont;
}

const decoLayer = document.querySelector("#decorations-layer");
const charsLayer = document.querySelector("#glitch-chars");
const symbols = ["X", "+", "?", "!", "0", "1", "#", "$", "//"];

function spawnDecorations() {
    // Clear old junk
    decoLayer.innerHTML = '';
    charsLayer.innerHTML = '';

    // Create 5-8 random shards and symbols
    for (let i = 0; i < 8; i++) {
        // Create a Shape Shard
        const shard = document.createElement('div');
        shard.className = 'shard';
        const size = gsap.utils.random(10, 60);
        gsap.set(shard, {
            width: size,
            height: size / gsap.utils.random(1, 4),
            x: gsap.utils.random(-200, 200),
            y: gsap.utils.random(-100, 100),
            rotation: gsap.utils.random(0, 360),
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" // Triangle/Shard look
        });
        decoLayer.appendChild(shard);

        // Create a flickering symbol
        const char = document.createElement('div');
        char.className = 'glitch-char';
        char.innerText = gsap.utils.random(symbols);
        gsap.set(char, {
            x: gsap.utils.random(-150, 150),
            y: gsap.utils.random(-80, 80),
            rotation: gsap.utils.random(-30, 30)
        });
        charsLayer.appendChild(char);
    }
}

// Inside your triggerAdvancedGlitch function:
function triggerAdvancedGlitch() {
    gsap.killTweensOf(el);
    spawnDecorations(); // Add the junk!

    const tl = gsap.timeline({
        onComplete: () => {
            // Hide the junk when glitch ends
            gsap.set(".shard, .glitch-char", { opacity: 0 });
            triggerAmbientChaos();
            gsap.delayedCall(gsap.utils.random(1, 4), triggerAdvancedGlitch);
        }
    });

    // 1. FLASH THE DECORATIONS
    tl.set(".shard, .glitch-char", { 
        opacity: () => Math.random() > 0.3 ? 0.7 : 0 
    }, 0);

    // Your existing SHOCK logic...
    tl.to("#rocars-glitch-filter feTurbulence", { attr: { baseFrequency: "0.08 0.4" }, duration: 0.04 }, 0);
    tl.to("#rocars-glitch-filter feDisplacementMap", { attr: { scale: 60 }, duration: 0.04 }, 0);

    // FONT SWAP
    tl.set(el, {
        fontFamily: getNextFont(),
        color: Math.random() > 0.5 ? "#ffa666" : "#fff"
    }, 0.04);

    // 2. THE JOLT (Move shapes with the word)
    tl.to(".shard, .glitch-char", {
        x: "+=" + gsap.utils.random(-20, 20),
        y: "+=" + gsap.utils.random(-20, 20),
        duration: 0.07,
        textShadow: `-8px 0 #ffa666, 8px 0 #000, 0 0 20px ${glowColor}`,
        duration: 0.07,
        ease: "power4.inOut"
    }, 0);

    // 3. RECOVERY (Everything disappears)
    tl.to("#rocars-glitch-filter feTurbulence", { attr: { baseFrequency: "0.00001" }, duration: 0.02 });
    tl.to("#rocars-glitch-filter feDisplacementMap", { attr: { scale: 0 }, duration: 0.02 });
    tl.to(".shard, .glitch-char", { opacity: 0, duration: 0.02 }, "<");
    
    // Reset word
    tl.to(el, { opacity: 1, x: 0, y: 0, skewX: 0, color: "#000", textShadow: `0px 0px 3px ${glowColor}, 0px 0px 6px ${glowColor}`, duration: 0.05 }, ">");
}

function triggerAmbientChaos() {
    const intensity = Math.random() > 0.8 ? 5 : 2; 
    
    gsap.to(el, {
        x: gsap.utils.random(-intensity, intensity),
        y: gsap.utils.random(-intensity, intensity),
        rotation: gsap.utils.random(-intensity * 0.5, intensity * 0.5),
        skewX: gsap.utils.random(-intensity, intensity),
        duration: 0.03,
        ease: "power2.out",
        onComplete: () => {
            gsap.delayedCall(gsap.utils.random(0.05, 0.2), triggerAmbientChaos);
        }
    });
}

// Initial Call
triggerAmbientChaos();
triggerAdvancedGlitch();
*/
/*
// ========== NEON ========== //
document.addEventListener("DOMContentLoaded", () => {
    const targets = document.querySelectorAll(".hdr");

    // At the start of your script, set the base centering
    gsap.set(".hdr", { 
        x: 0, // Explicitly start at 0
        xPercent: -50, 
        yPercent: -50 
    });

    targets.forEach(el => {
        // Apply the SVG filter to the element
        gsap.set(el, { filter: "url(#glitch-filter)" });
        
        const isSub = el.classList.contains('subhdr') || el.classList.contains('subhdrII');
        const glowColor = isSub ? "rgba(255, 166, 102, 0.7)" : "rgba(255, 255, 255, 0.7)";

        function triggerAdvancedGlitch() {
            const tl = gsap.timeline({
                onComplete: () => gsap.delayedCall(gsap.utils.random(0.5, 3), triggerAdvancedGlitch)
            });

            // 1. The "Signal Tear" (The physical distortion)
            tl.to("#glitch-filter feTurbulence", {
                attr: { baseFrequency: "0.05 0.5" }, // Creates horizontal tearing
                duration: 0.05
            }, 0);

            tl.to("#glitch-filter feDisplacementMap", {
                attr: { scale: 30 }, // How far the pixels "jump"
                duration: 0.05
            }, 0);

            // 2. The "Voltage Drop" (Color & Brightness)
            tl.to(el, {
                opacity: 0.3,
                x: gsap.utils.random(-10, 10),
                skewX: gsap.utils.random(-20, 20),
                textShadow: `-5px 0 red, 5px 0 blue, 0 0 15px ${glowColor}`,
                duration: 0.08,
                ease: "power4.inOut"
            }, 0);

            // 3. The Recovery (Snap back to perfection)
            tl.to("#glitch-filter feTurbulence", { attr: { baseFrequency: "0.00001" }, duration: 0.02 });
            tl.to("#glitch-filter feDisplacementMap", { attr: { scale: 0 }, duration: 0.02 });
            
            tl.to(el, {
                opacity: 1,
                x: 0,
                skewX: 0,
                textShadow: `0px 0px 3px ${glowColor}, 0px 0px 6px ${glowColor}, 0px 0px 9px ${glowColor}`,
                duration: 0.05,
                ease: "none"
            }, ">");

            // 4. Randomized "Micro-Echo" (A ghosting effect)
            if (Math.random() > 0.6) {
                tl.to(el, { opacity: 0.5, duration: 0.03, yoyo: true, repeat: 3 });
            }
        }

        // Initialize with staggered starts
        gsap.delayedCall(gsap.utils.random(0, 2), triggerAdvancedGlitch);
    });
});
*//*
// HEADER
document.addEventListener("DOMContentLoaded", () => {

  function continuousFlicker(el) {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 1 });

    tl.to(el, {
      opacity: 0, // Replaced 0.25 with 0
      duration: 0.04,
      ease: "none"
    })
    .to(el, {
      opacity: 1,
      duration: 0.12,
      ease: "power2.out"
    })
    // Tiny micro-flickers
    .to(el, {
      opacity: 0.8,
      duration: 0.03,
      ease: "none"
    })
    .to(el, {
      opacity: 1,
      duration: 0.05,
      ease: "none"
    })
    // Added: Fast Double-Stutter
    .to(el, {
      opacity: 0,
      duration: 0.02,
      ease: "none"
    })
    .to(el, {
      opacity: 0.6,
      duration: 0.02,
      ease: "none"
    })
    .to(el, {
      opacity: 0,
      duration: 0.02,
      ease: "none"
    })
    .to(el, {
      opacity: 1,
      duration: 0.04,
      ease: "none"
    })
    // Medium dip
    .to(el, {
      opacity: 0.4,
      duration: 0.07,
      ease: "none",
      delay: Math.random() * 0.3
    })
    .to(el, {
      opacity: 1,
      duration: 0.18,
      ease: "power4.out",
      delay: Math.random() * 0.4
    })
    // Added: Deep Glitch Drop
    .to(el, {
      opacity: 0,
      duration: 0.08,
      ease: "steps(1)", // Instant off
      delay: 0.1
    })
    .to(el, {
      opacity: 1,
      duration: 0.03,
      ease: "none"
    })
    // Strong ignition pop
    .to(el, {
      opacity: 1,
      duration: 0.05,
      ease: "power1.inOut"
    })
    .to(el, {
      opacity: 1, // Explicitly set to ensure it ends visible
      duration: 0.2,
      ease: "power1.out"
    });

    return tl;
  }

  // 🔥 Apply to ALL hdr + subhdr in every .we container
  document.querySelectorAll(".hdrII").forEach(el => continuousFlicker(el));
  document.querySelectorAll(".subhdrII").forEach(el => continuousFlicker(el));

});
*/
// ========== TURBULENCE ========== //

  const textTurbulence = document.querySelector('#text-turbulence');
  let distortionFrame = 0;

  function animateTextDistortion() {
    distortionFrame += 0.01;
    const freqX = 0.015 + Math.sin(distortionFrame) * 0.005;
    const freqY = 0.02 + Math.cos(distortionFrame) * 0.005;

    textTurbulence.setAttribute('baseFrequency', `${freqX} ${freqY}`);
    requestAnimationFrame(animateTextDistortion);
  }

  // Start immediately
  animateTextDistortion();

// ========== TV window magnet ========== //
const tv = document.getElementById('window');
let tvBounds = null;
function applyTVMagnet(x, y) {
  if (!tvBounds) return;
  const offsetX = x - (tvBounds.left + tvBounds.width / 2);
  const offsetY = y - (tvBounds.top + tvBounds.height / 2);
  tv.style.transform = `translate(${offsetX * 0.2}px, ${offsetY * 0.2}px)`;
}
function resetTVMagnet() {
  tv.style.transform = 'translate(0, 0)';
}
tv.addEventListener('mouseenter', () => {
  tvBounds = tv.getBoundingClientRect();
});
tv.addEventListener('mousemove', (e) => applyTVMagnet(e.clientX, e.clientY));
tv.addEventListener('mouseleave', resetTVMagnet);
tv.addEventListener('touchstart', (e) => {
  tvBounds = tv.getBoundingClientRect();
  applyTVMagnet(e.touches[0].clientX, e.touches[0].clientY);
});
tv.addEventListener('touchmove', (e) => applyTVMagnet(e.touches[0].clientX, e.touches[0].clientY));
tv.addEventListener('touchend', resetTVMagnet);
tv.addEventListener('touchcancel', resetTVMagnet);



document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll("video");

  videos.forEach(vid => {
    vid.play().catch(() => {
      vid.muted = true; // force mute if needed
      vid.play().catch(() => {});
    });
  });
});
