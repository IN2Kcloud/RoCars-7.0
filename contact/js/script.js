window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
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

// ========== GET IN TOUCH MOBILE ========== //

document.querySelectorAll('.types-list li').forEach(li => {
  const text = li.textContent.trim();
  const phrases = li.dataset.phrases.split(',');
  const linkUrl = li.dataset.link;
  
  // Wrap content in an anchor tag
  li.innerHTML = `
    <a href="${linkUrl}" class="marquee-anchor">
      <div class="marquee-wrapper">
        <div class="marquee-inner">${text}</div>
      </div>
    </a>`;

  const inner = li.querySelector('.marquee-inner');
  const anchor = li.querySelector('.marquee-anchor');
  let tween = null;
  let isActive = false; // Track if the marquee is running

  const startMarquee = () => {
    if (isActive) return;
    isActive = true;
    
    inner.innerHTML = '';
    let fullText = phrases.join('   ');
    inner.innerHTML = fullText;

    while (inner.offsetWidth < li.offsetWidth * 2) {
      inner.innerHTML += '   ' + fullText;
    }

    tween = gsap.to(inner, {
      x: -inner.offsetWidth / 2,
      ease: 'none',
      repeat: -1,
      duration: 10 // Sped up slightly for better mobile feel
    });
  };

  const stopMarquee = () => {
    isActive = false;
    if (tween) tween.kill();
    inner.style.transform = 'translateX(0)';
    inner.innerHTML = text;
  };

  // DESKTOP: Hover behavior
  li.addEventListener('mouseenter', startMarquee);
  li.addEventListener('mouseleave', stopMarquee);

  // MOBILE: Logic for first tap vs second tap
  anchor.addEventListener('click', (e) => {
    if (!isActive) {
      // First tap: Start marquee and stop the link
      e.preventDefault();
      startMarquee();
      
      // Optional: Stop other active marquees if one is clicked
      document.querySelectorAll('.types-list li').forEach(otherLi => {
        if(otherLi !== li) { /* you could trigger a reset here */ }
      });
    } 
    // Second tap: No e.preventDefault(), so the href link fires naturally
  });
});

// ========== HDR MARQUEE ========== //

// Marquee Initialization
const initMarquees = (selector, duration = 60) => {
  // Select ALL elements matching the class
  const wrappers = document.querySelectorAll(selector);
  
  wrappers.forEach(wrapper => {
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
  });
};

// ========== FORCE VIDEO PLAY ========== //

// Initialize all marquees at once
initMarquees(".marqueecontent");
  
document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll("video");

  videos.forEach(vid => {
    vid.play().catch(() => {
      vid.muted = true; // force mute if needed
      vid.play().catch(() => {});
    });
  });
});
