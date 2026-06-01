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
    tl.set(".marqueecontainer, .logo-glitch-wrapper, .tv-wrapper, .pulse-circles", { 
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
    
    tl.to(".hero-img",{
      opacity:1,
      y:0,
      scale:1,
      rotate:0,
      filter:"blur(0px)",
      duration:2,
      ease:"power4.out"
    },"-=1.8");
    
    tl.fromTo(".marqueecontainerII", 
        { x: 80, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" }, "-=1.5");

    tl.to(".hero-title",{
      opacity:1,
      y:0,
      scale:1,
      filter:"blur(0px)",
      duration:2.2
    },"-=2");

    tl.to(".htu",{
      filter:"drop-shadow(0px 0px 5px #fff)",
      duration:2.2
    },"-=2");

    tl.to(".hero-title span",{
      y:0,
      rotate:0,
      duration:2,
      stagger:.06,
      ease:"expo.out"
    },"-=2");

    tl.to(".mini",{
      opacity:1,
      y:0,
      duration:1.4,
      stagger:.1
    },"-=1.5");
    

    // Clean up
    tl.set(".loading", { display: "none" });
});

// BG points -----------------------------------------------------------------
const gridCanvas = document.getElementById("grid-bg");
const ctx = gridCanvas.getContext("2d");

// --- 1. Create a hidden noise buffer ---
const noiseCanvas = document.createElement('canvas');
const noiseCtx = noiseCanvas.getContext('2d');
noiseCanvas.width = 100;
noiseCanvas.height = 100;

function createNoise() {
    const imageData = noiseCtx.createImageData(100, 100);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = data[i+1] = data[i+2] = val; // RGB
        data[i+3] = 25; // Opacity of the grain (keep it low!)
    }
    noiseCtx.putImageData(imageData, 0, 0);
}
createNoise();

let time = 0;

function resize() {
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function draw() {
    time += 0.005;
    
    // Clear canvas
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    // 2. Draw the Gradient
    const centerX = gridCanvas.width / 2 + Math.cos(time) * (gridCanvas.width * 0.3);
    const centerY = gridCanvas.height / 2 + Math.sin(time * 0.8) * (gridCanvas.height * 0.2);
    const baseRadius = Math.max(gridCanvas.width, gridCanvas.height) * 5;
    const pulseRadius = baseRadius + Math.sin(time * 0.5) * 100;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, "#000"); 
    gradient.addColorStop(1, "#ffa666");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
    /*
    // 3. Layer the Noise on top
    // We use 'source-over' or 'overlay' to blend the grain
    ctx.globalCompositeOperation = "source-over"; 
    
    // To animate the noise, we draw the small noise tile at random offsets
    const noiseOffsetX = Math.random() * noiseCanvas.width;
    const noiseOffsetY = Math.random() * noiseCanvas.height;

    // Create a pattern from the noise tile
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.save();
    ctx.translate(noiseOffsetX, noiseOffsetY); // Shifts noise every frame
    ctx.fillStyle = pattern;
    ctx.fillRect(-noiseOffsetX, -noiseOffsetY, gridCanvas.width, gridCanvas.height);
    ctx.restore();
    */
    requestAnimationFrame(draw);
}

draw();


// HEADER
document.addEventListener("DOMContentLoaded", () => {

  function continuousFlicker(el) {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 1 });

    tl.to(el, {
      opacity: 0.25,
      duration: 0.04,
      ease: "none"
    })
    .to(el, {
      opacity: 1,
      duration: 0.12,
      ease: "power2.out"
    })
    // tiny micro-flickers
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
    // medium dip
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
    // strong ignition pop
    .to(el, {
      opacity: 1,
      duration: 0.05,
      ease: "power1.inOut"
    })
    .to(el, {
      duration: 0.2,
      ease: "power1.out"
    });

    return tl;
  }

  // 🔥 Apply to ALL hdr + subhdr in every .we container
  document.querySelectorAll(".hdr").forEach(el => continuousFlicker(el));
  document.querySelectorAll(".subhdr").forEach(el => continuousFlicker(el));
  
});

/* =========================================================
   LIVE MOUSE DEPTH
========================================================= */

window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5);
  const y = (e.clientY / window.innerHeight - 0.5);

  // Hero Image
  gsap.to(".hero-img", {
    xPercent: -50,
    x: x * 40,
    y: y * 25,
    rotate: y * 6,
    duration: 2,
    ease: "power3.out"
  });

  // Hero Title (Main Container)
  gsap.to(".hero-title", {
    xPercent: -50,
    yPercent: -50,
    x: x * 20,
    y: y * 10,
    duration: 2.5,
    ease: "power3.out"
  });

  // Hero Title Span (The Highlighted Text)
  gsap.to(".hero-title span", {
    xPercent: -50,
    yPercent: -50,
    x: x * 20,
    y: y * 10,
    duration: 2.5,
    ease: "power3.out"
  });
});

gsap.registerPlugin(ScrollTrigger);

const quoteTl = gsap.timeline({
  scrollTrigger:{
    trigger:".quote-section",
    start:"top 70%",
  }
});

quoteTl.to(".quote-text",{
  y:"0%",
  opacity:1,
  duration:1.6,
  stagger:0.18,
  ease:"expo.out"
});

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


// ======================= MARQUEES ============================== //

window.addEventListener("load", () => {
  // 1. Existing Loading Logic
  document.body.classList.remove("before-load");

  // 2. Marquee Initialization
  const initMarquee = (element, duration = 60) => {
    if (!element) return;

    // Clone the items to ensure the screen is full
    const items = element.innerHTML;
    element.innerHTML = items + items + items;

    // Calculate the width of ONE set of items
    const scrollWidth = element.scrollWidth / 3;

    gsap.to(element, {
      x: -scrollWidth,
      duration: duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(
          (x) => parseFloat(x) % scrollWidth
        )
      }
    });
  };

  // Trigger ALL .cardmarqueecontent
  document.querySelectorAll(".cardmarqueecontent").forEach((el) => {
    initMarquee(el);
  });

  document.querySelectorAll(".cardmarqueecontentII").forEach((el) => {
    initMarquee(el);
  });
  /*
  document.querySelectorAll(".coremarqueecontent").forEach((el) => {
    initMarquee(el, 360);
  });
  */
  document.querySelectorAll(".quotemarqueecontent").forEach((el) => {
    initMarquee(el);
  });

  // Other marquees
  document.querySelectorAll(".marqueecontent").forEach((el) => {
    initMarquee(el);
  });

  document.querySelectorAll(".marqueecontentII").forEach((el) => {
    initMarquee(el, 45);
  });
});


// ========== VIDEO FORCE PLAY ========== //
document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll("video");

  videos.forEach(vid => {
    vid.muted = true; // Desktop browsers almost require this for autoplay
    vid.setAttribute('preload', 'metadata'); // Don't choke the network immediately
    
    // Delay play by 500ms to let the Canvas/GSAP settle
    setTimeout(() => {
      vid.play().catch(err => console.log("Autoplay blocked", err));
    }, 500);
  });
});

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

document.addEventListener("DOMContentLoaded", () => {
  // Register engine expansion plugins
  gsap.registerPlugin(ScrollTrigger);

  initTimelineSubsystem();
  initCinematicStream();
});

/**
 * Real-time Cursor Coordinates tracking globally mapped to CSS
 */
function initCoreIllumination() {
  window.addEventListener("mousemove", (e) => {
    const xPct = (e.clientX / window.innerWidth) * 100;
    const yPct = (e.clientY / window.innerHeight) * 100;
    
    document.body.style.setProperty("--mx", `${xPct}%`);
    document.body.style.setProperty("--my", `${yPct}%`);
  });
}
/**
 * Subsystem 05: Central Spine Mission Log Tracking Progress
 */
function initTimelineSubsystem() {
  // 1. Spine Progress Bar Animation
  gsap.to(".timeline-progress-bar", {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline-nodes-container", // Trigger based on container boundaries
      start: "top center",
      end: "bottom center",
      scrub: true
    }
  });

  // 2. Individual Node Revealing and State Toggling
  document.querySelectorAll(".timeline-block").forEach((node) => {
    gsap.from(node, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      scrollTrigger: {
        trigger: node,
        start: "top 75%",
        toggleActions: "play none none reverse"
      }
    });

    // Lights up the dot and year background right when the line hits it
    ScrollTrigger.create({
      trigger: node,
      start: "top center",
      end: "bottom center",
      toggleClass: { targets: node, className: "is-active" },
      once: false
    });
  });
}

/**
 * Subsystem 07: Deep Section Sequence Shift
 */
function initCinematicStream() {
  const panels = gsap.utils.toArray(".statement-frame");
  
  const masterTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".sys-statement",
      start: "top top",
      end: () => `+=${panels.length * 800}`, 
      pin: true,
      scrub: 1,
      anticipatePin: 1 
    }
  });

  panels.forEach((panel, i) => {
    // 1. Grab the line specifically for this panel
    const line = panel.querySelector('.strike-line');

    if (i === 0) {
      // First panel starts visible, just animate the line, then fade out
      if (line) {
        masterTimeline.to(line, { scaleX: 1, duration: 0.8, ease: "power2.out" }, "+=0.2");
      }
      masterTimeline.to(panel, { 
        autoAlpha: 0, scale: 1.15, filter: "blur(12px)", duration: 1, ease: "power2.in"
      }, "+=0.4"); 
      
    } else {
      // Subsequent panels: Fade in, strike through, fade out (if not the last one)
      masterTimeline.to(panel, {
        autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1, ease: "power2.out"
      });
      
      // Animate the line for this specific panel after it fades in
      if (line) {
        masterTimeline.to(line, { scaleX: 1, duration: 0.8, ease: "power2.out" }, "+=0.2");
      }
      
      // Only fade out if it's not the final panel
      if (i < panels.length - 1) {
        masterTimeline.to(panel, { 
          autoAlpha: 0, scale: 1.15, filter: "blur(12px)", duration: 1, ease: "power2.in"
        }, "+=0.4"); 
      }
    }
  });
}

/** ========== BRANDS MARQUEE ========== **/

const track = document.querySelector(".track");

// duplicate for seamless loop
track.innerHTML += track.innerHTML;

const distance = track.scrollWidth / 2;

// main animation
const tween = gsap.to(track, {
  x: -distance,
  duration: 60,
  ease: "none",
  repeat: -1
});

// smooth hover pause/resume (no snapping)
const speed = { value: 1 };

gsap.ticker.add(() => {
  tween.timeScale(speed.value);
});

// hover interactions
track.addEventListener("mouseenter", () => {
  gsap.to(speed, {
    value: 0,
    duration: 0.8,
    ease: "power3.out"
  });
});

track.addEventListener("mouseleave", () => {
  gsap.to(speed, {
    value: 1,
    duration: 1.2,
    ease: "power3.out"
  });
});
