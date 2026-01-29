// 1. Audio Pooling: Preload sounds to prevent lag on live servers
const audioSelect = new Audio("./public/menu-select.mp3");
const audioOpen = new Audio("./public/menu-open.mp3");
const audioClose = new Audio("./public/menu-close.mp3");

// Optimization: Play sound from memory instantly
function playSound(audio) {
  audio.pause();
  audio.currentTime = 0;
  audio.play().catch(() => {}); 
}

const menuItems = [
  { label: "Portfolio", href: "./cars/index.html" },
  { label: "Inventory", href: "./inventory/index.html" },
  { label: "Get In Touch", href: "./contact/index.html" },
  { label: "Studio", href: "./studio/index.html" },
  { label: "RoCars", href: "#RoCars" },
];

let isOpen = false;
let isMenuAnimating = false;
let responsiveConfig = {};

function getResponsiveConfig() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 1000;
  const maxSize = Math.min(viewportWidth * 0.9, viewportHeight * 0.9);
  const menuSize = isMobile ? Math.min(maxSize, 480) : 700;

  return {
    menuSize,
    center: menuSize / 2,
    innerRadius: menuSize * 0.08,
    outerRadius: menuSize * 0.42,
    contentRadius: menuSize * 0.28,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  responsiveConfig = getResponsiveConfig();
  const menu = document.querySelector(".circular-menu");
  const joystick = document.querySelector(".joystick");
  const menuOverlayNav = document.querySelector(".menu-overlay-nav");
  const menuOverlayFooter = document.querySelector(".menu-overlay-footer");

  menu.style.width = `${responsiveConfig.menuSize}px`;
  menu.style.height = `${responsiveConfig.menuSize}px`;

  gsap.set(joystick, { scale: 0 });
  gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 0 });

  menuItems.forEach((item, index) => {
    const segment = createSegment(item, index, menuItems.length);
    menu.appendChild(segment);
  });

  document.querySelector(".menu-toggle-btn").addEventListener("click", toggleMenu);
  document.querySelector(".close-btn").addEventListener("click", toggleMenu);

  initCenterDrag();
});

function createSegment(item, index, total) {
  const segment = document.createElement("a");
  segment.className = "menu-segment";
  segment.href = item.href;

  const { menuSize, center, innerRadius, outerRadius, contentRadius } = responsiveConfig;
  const anglePerSegment = 360 / total;
  const baseStartAngle = anglePerSegment * index;
  const centerAngle = baseStartAngle + anglePerSegment / 2;
  const startAngle = baseStartAngle + 1;
  const endAngle = baseStartAngle + anglePerSegment - 0;

  const polarToCartesian = (angle, radius) => ({
    x: center + radius * Math.cos(((angle - 90) * Math.PI) / 180),
    y: center + radius * Math.sin(((angle - 90) * Math.PI) / 180)
  });

  const iStart = polarToCartesian(startAngle, innerRadius);
  const oStart = polarToCartesian(startAngle, outerRadius);
  const iEnd = polarToCartesian(endAngle, innerRadius);
  const oEnd = polarToCartesian(endAngle, outerRadius);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  const pathData = [
    `M ${iStart.x} ${iStart.y}`, `L ${oStart.x} ${oStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${iStart.x} ${iStart.y}`, "Z"
  ].join(" ");

  segment.style.clipPath = `path('${pathData}')`;
  segment.style.width = `${menuSize}px`;
  segment.style.height = `${menuSize}px`;

  const contentPos = polarToCartesian(centerAngle, contentRadius);

  segment.innerHTML = `
    <div class="segment-content" style="left: ${contentPos.x}px; top: ${contentPos.y}px; transform: translate(-50%, -50%);">
      <div class="label">${item.label}</div>
      <div class="marquee-wrapper">
        <div class="marquee-content">
          ${Array(9).fill(`<span class="marquee-text">${item.label}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  const marqueeContent = segment.querySelector('.marquee-content');
  const scrollAnim = gsap.to(marqueeContent, {
    xPercent: -33.33, ease: "none", duration: 6, repeat: -1, paused: true
  });

  segment.scrollAnim = scrollAnim;

  segment.addEventListener("mouseenter", () => {
    if (isOpen) {
      playSound(audioSelect);
      segment.classList.add("active");
      scrollAnim.play();
    }
  });

  segment.addEventListener("mouseleave", () => {
    segment.classList.remove("active");
    scrollAnim.pause();
    gsap.set(marqueeContent, { xPercent: 0 });
  });

  return segment;
}

function toggleMenu() {
  if (isMenuAnimating) return;
  const menuOverlay = document.querySelector(".menu-overlay");
  const menuSegments = document.querySelectorAll(".menu-segment");
  const joystick = document.querySelector(".joystick");
  const menuContainer = document.querySelector(".circular-menu");
  const [nav, footer] = [document.querySelector(".menu-overlay-nav"), document.querySelector(".menu-overlay-footer")];

  isMenuAnimating = true;

  if (!isOpen) {
    isOpen = true;
    playSound(audioOpen);
    gsap.to(menuOverlay, { opacity: 1, duration: 0.4, onStart: () => (menuOverlay.style.pointerEvents = "all") });
    gsap.fromTo([nav, footer], { opacity: 0, y: (i) => i === 0 ? -20 : 20 }, { opacity: 1, y: 0, duration: 0.5 });
    gsap.fromTo(menuContainer, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });

    menuSegments.forEach((seg, i) => {
      gsap.set(seg, { opacity: 0, rotation: -20 });
      gsap.to(seg, { opacity: 1, rotation: 0, duration: 0.4, delay: 0.15 + (i * 0.07), onComplete: () => { if (i === menuSegments.length - 1) isMenuAnimating = false; } });
    });
    gsap.to(joystick, { scale: 1, duration: 0.5, delay: 0.4, ease: "elastic.out(1, 0.75)" });
  } else {
    isOpen = false;
    playSound(audioClose);
    gsap.to([nav, footer], { opacity: 0, duration: 0.2 });
    gsap.to(menuSegments, { opacity: 0, scale: 0.9, duration: 0.2, stagger: 0.05 });
    gsap.to(joystick, { scale: 0, duration: 0.2 });
    gsap.to(menuOverlay, { opacity: 0, duration: 0.4, delay: 0.3, onComplete: () => { menuOverlay.style.pointerEvents = "none"; isMenuAnimating = false; } });
  }
}

function initCenterDrag() {
  const joystick = document.querySelector(".joystick");
  let isDragging = false, currentX = 0, currentY = 0, targetX = 0, targetY = 0, activeSegment = null;

  function deactivateSegment(segment) {
    if (!segment) return;
    segment.classList.remove("active");
    const content = segment.querySelector(".segment-content");
    gsap.killTweensOf([segment, content]);
    gsap.to(segment, { scale: 1, filter: "brightness(1)", duration: 0.3, onComplete: () => { segment.style.scale = ""; segment.style.filter = ""; segment.style.animation = ""; segment.style.zIndex = ""; } });
    gsap.to(content, { scale: 1, opacity: 1, duration: 0.3, onComplete: () => { content.style.animation = ""; } });
    if (segment.scrollAnim) { segment.scrollAnim.pause(); gsap.to(segment.querySelector('.marquee-content'), { xPercent: 0, duration: 0.3 }); }
  }

  function animate() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;
    gsap.set(joystick, { x: currentX, y: currentY });

    if (isDragging && Math.sqrt(currentX ** 2 + currentY ** 2) > 20) {
      const angle = Math.atan2(currentY, currentX) * (180 / Math.PI);
      const idx = Math.floor(((angle + 90 + 360) % 360) / (360 / menuItems.length)) % menuItems.length;
      const seg = document.querySelectorAll(".menu-segment")[idx];

      if (seg !== activeSegment) {
        if (activeSegment) deactivateSegment(activeSegment);
        activeSegment = seg;
        seg.classList.add("active");
        seg.style.zIndex = "10";
        seg.style.animation = "flickerHover 350ms ease-in-out forwards";
        seg.querySelector(".segment-content").style.animation = "contentFlickerHover 350ms ease-in-out forwards";
        gsap.to(seg, { scale: 1.08, duration: 0.4, ease: "back.out(2)" });
        if (seg.scrollAnim) seg.scrollAnim.play();
        if (isOpen) playSound(audioSelect);
      }
    } else if (activeSegment) { deactivateSegment(activeSegment); activeSegment = null; }
    requestAnimationFrame(animate);
  }

  const handleStart = (e) => {
    isDragging = true;
    const rect = joystick.getBoundingClientRect();
    const [cX, cY] = [rect.left + rect.width / 2, rect.top + rect.height / 2];

    const move = (ev) => {
      if (!isDragging) return;
      const [mX, mY] = ev.touches ? [ev.touches[0].clientX, ev.touches[0].clientY] : [ev.clientX, ev.clientY];
      const [dX, dY] = [mX - cX, mY - cY];
      const dist = Math.sqrt(dX ** 2 + dY ** 2);
      const max = 25; // maxDrag

      if (dist <= 10) { targetX = targetY = 0; }
      else {
        const ratio = dist > max ? max / dist : 1;
        targetX = dX * ratio; targetY = dY * ratio;
      }
      if (ev.cancelable) ev.preventDefault();
    };

    const stop = () => {
      if (isDragging && activeSegment) {
        const url = activeSegment.getAttribute("href");
        if (url && url !== "#") window.open(url, "_blank");
      }
      isDragging = false; targetX = targetY = 0;
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move); window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", move); window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", stop);
  };

  joystick.addEventListener("mousedown", handleStart);
  joystick.addEventListener("touchstart", handleStart, { passive: false });
  animate();
}
