window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
});

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
  
  document.querySelectorAll(".hdrII").forEach(el => continuousFlicker(el));
  document.querySelectorAll(".subhdrII").forEach(el => continuousFlicker(el));

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

