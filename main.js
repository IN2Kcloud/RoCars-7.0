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
  initMarquee(".screen-marqueecontent");
  initMarquee(".marqueecontent");
  initMarquee(".marqueecontentII", 45); // You can even give them different speeds!
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

// ========== SQUARED MARQUEE ========== //

// Target all text paths
const allMarquees = document.querySelectorAll(".marquee-path");

allMarquees.forEach(path => {
    // Repeat text to fill the square
    const text = path.textContent;
    path.textContent = (text + " ").repeat(4);

    gsap.to(path, {
        attr: { startOffset: "-100%" },
        duration: 30, // Slowed down for luxury feel
        repeat: -1,
        ease: "none"
    });
});

// ========== SCREEN VIEW ========== //

const screenElement = document.querySelector('.screen-view');
const dtls = document.querySelector('.triangle-up');

function hyperMotion3D() {
  const isSpinning = Math.random() > 0.8; 
  
  const randomX = (Math.random() - 0.5) * 100;   
  const randomY = (Math.random() - 0.5) * 80;   
  const randomZ = isSpinning ? 120 : (Math.random() * 40); 
  
  const rotX = (Math.random() - 0.5) * 30; 
  const rotY = (Math.random() - 0.5) * 30; 
  
  // FIX: Use relative rotation so it never "unwinds"
  const rotZ = isSpinning ? (Math.random() > 0.5 ? "+=360" : "-=360") : (Math.random() - 0.5) * 20;

  gsap.to(screenElement, {
    duration: isSpinning ? 1.0 : 1.5,
    xPercent: -50,
    yPercent: -50,
    x: randomX,
    y: randomY,
    z: randomZ,
    rotationX: rotX,
    rotationY: rotY,
    rotationZ: rotZ, // Moves from current position forward
    transformPerspective: 1200,
    // force3D: true, Forces hardware acceleration
    ease: "expo.inOut",
    onComplete: () => {
        // After a big spin, we normalize the value to keep numbers small 
        // without the user seeing a jump.
        if (isSpinning) {
            const currentRot = gsap.getProperty(screenElement, "rotationZ");
            gsap.set(screenElement, { rotationZ: currentRot % 360 });
        }
        hyperMotion3D();
    }
  });
}

hyperMotion3D();

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
