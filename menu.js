// GSAP is now global (because we used the CDN)
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
    segment.addEventListener("mouseenter", () => {
      if (isOpen) {
        new Audio("./public/menu-select.mp3").play().catch(() => {});
      }
    });
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

  const innerStartX = center + innerRadius * Math.cos(((startAngle - 90) * Math.PI) / 180);
  const innerStartY = center + innerRadius * Math.sin(((startAngle - 90) * Math.PI) / 180);
  const outerStartX = center + outerRadius * Math.cos(((startAngle - 90) * Math.PI) / 180);
  const outerStartY = center + outerRadius * Math.sin(((startAngle - 90) * Math.PI) / 180);
  const innerEndX = center + innerRadius * Math.cos(((endAngle - 90) * Math.PI) / 180);
  const innerEndY = center + innerRadius * Math.sin(((endAngle - 90) * Math.PI) / 180);
  const outerEndX = center + outerRadius * Math.cos(((endAngle - 90) * Math.PI) / 180);
  const outerEndY = center + outerRadius * Math.sin(((endAngle - 90) * Math.PI) / 180);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  const pathData = [`M ${innerStartX} ${innerStartY}`, `L ${outerStartX} ${outerStartY}`, `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`, `L ${innerEndX} ${innerEndY}`, `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`, "Z"].join(" ");

  segment.style.clipPath = `path('${pathData}')`;
  segment.style.width = `${menuSize}px`;
  segment.style.height = `${menuSize}px`;

  const contentX = center + contentRadius * Math.cos(((centerAngle - 90) * Math.PI) / 180);
  const contentY = center + contentRadius * Math.sin(((centerAngle - 90) * Math.PI) / 180);

  segment.innerHTML = `
    <div class="segment-content" style="left: ${contentX}px; top: ${contentY}px; transform: translate(-50%, -50%);">
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
    xPercent: -33.33,
    ease: "none",
    duration: 6,
    repeat: -1,
    paused: true
  });

  // Attach the animation to the element so initCenterDrag can find it
  segment.scrollAnim = scrollAnim;

  // Keep mouse hover support just in case
  segment.addEventListener("mouseenter", () => {
    segment.classList.add("active");
    scrollAnim.play();
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
  const menuOverlayNav = document.querySelector(".menu-overlay-nav");
  const menuOverlayFooter = document.querySelector(".menu-overlay-footer");

  isMenuAnimating = true;

  if (!isOpen) {
    isOpen = true;
    new Audio("./public/menu-open.mp3").play().catch(() => {});

    // 1. Background "Windshield" Dimming
    gsap.to(menuOverlay, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
      onStart: () => (menuOverlay.style.pointerEvents = "all"),
    });

    // 2. HUD Power-On (Nav & Footer)
    // We use a flicker effect to mimic digital displays booting up
    gsap.fromTo([menuOverlayNav, menuOverlayFooter], 
      { opacity: 0, y: (i) => i === 0 ? -20 : 20 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        delay: 0.1, 
        ease: "power3.out",
        onStart: () => {
          // Rapid glitch/flicker
          gsap.to([menuOverlayNav, menuOverlayFooter], {
            opacity: 0.4,
            repeat: 5,
            yoyo: true,
            duration: 0.04,
            onComplete: () => gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 1 })
          });
        }
      }
    );

    // 3. Central Wheel "Ignition"
    gsap.fromTo(menuContainer, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
    );

    // 4. Tachometer Sweep (Sequential segment reveal)
    menuSegments.forEach((segment, index) => {
      gsap.set(segment, { opacity: 0, rotation: -20, transformOrigin: "50% 50%" });
      
      gsap.to(segment, {
        opacity: 1,
        rotation: 0,
        duration: 0.4,
        delay: 0.15 + (index * 0.07), // Clockwise sweep
        ease: "power4.out",
        onComplete: () => {
          if (index === menuSegments.length - 1) isMenuAnimating = false;
        }
      });
    });

    // 5. Joystick Engagement
    gsap.to(joystick, {
      scale: 1,
      duration: 0.5,
      delay: 0.4,
      ease: "elastic.out(1, 0.75)",
    });

  } else {
    // SHUTDOWN SEQUENCE
    isOpen = false;
    new Audio("./public/menu-close.mp3").play().catch(() => {});

    // Quick HUD fade out
    gsap.to([menuOverlayNav, menuOverlayFooter], {
      opacity: 0,
      y: (i) => i === 0 ? -10 : 10,
      duration: 0.2
    });

    // Reverse sweep collapse
    gsap.to(menuSegments, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      stagger: 0.05,
      ease: "power2.in",
    });

    // Fade out joystick and overlay
    gsap.to(joystick, { scale: 0, duration: 0.2 });

    gsap.to(menuOverlay, {
      opacity: 0,
      duration: 0.4,
      delay: 0.3,
      onComplete: () => {
        menuOverlay.style.pointerEvents = "none";
        isMenuAnimating = false;
      },
    });
  }
}

function initCenterDrag() {
  const joystick = document.querySelector(".joystick");
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let activeSegment = null;

  function deactivateSegment(segment) {
    if (!segment) return;
    segment.classList.remove("active");
    const content = segment.querySelector(".segment-content");
    gsap.killTweensOf([segment, content]);

    gsap.to(segment, {
      scale: 1,
      filter: "brightness(1) blur(0px)",
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        segment.style.scale = "";
        segment.style.filter = "";
        segment.style.animation = "";
        segment.style.zIndex = "";
      }
    });

    gsap.to(content, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      onComplete: () => {
        content.style.animation = "";
        content.style.scale = "";
      }
    });

    if (segment.scrollAnim) {
      segment.scrollAnim.pause();
      gsap.to(segment.querySelector('.marquee-content'), { xPercent: 0, duration: 0.3 });
    }
  }

  function animate() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;
    gsap.set(joystick, { x: currentX, y: currentY });

    if (isDragging && Math.sqrt(currentX * currentX + currentY * currentY) > 20) {
      const angle = Math.atan2(currentY, currentX) * (180 / Math.PI);
      const segmentIndex = Math.floor(((angle + 90 + 360) % 360) / (360 / menuItems.length)) % menuItems.length;
      const allSegments = document.querySelectorAll(".menu-segment");
      const segment = allSegments[segmentIndex];

      if (segment !== activeSegment) {
        if (activeSegment) deactivateSegment(activeSegment);
        activeSegment = segment;
        segment.classList.add("active");
        segment.style.zIndex = "10";
        segment.style.animation = "flickerHover 350ms ease-in-out forwards";
        segment.querySelector(".segment-content").style.animation = "contentFlickerHover 350ms ease-in-out forwards";
        gsap.to(segment, { scale: 1.08, duration: 0.4, ease: "back.out(2)" });
        if (segment.scrollAnim) segment.scrollAnim.play();
        if (isOpen) new Audio("./public/menu-select.mp3").play().catch(() => {});
      }
    } else {
      if (activeSegment) {
        deactivateSegment(activeSegment);
        activeSegment = null;
      }
    }
    requestAnimationFrame(animate);
  }

  const startDrag = (e) => {
    isDragging = true;
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const move = (event) => {
      if (!isDragging) return;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDrag = 100 * 0.25;

      if (distance <= 10) {
        targetX = targetY = 0;
      } else if (distance > maxDrag) {
        const ratio = maxDrag / distance;
        targetX = deltaX * ratio;
        targetY = deltaY * ratio;
      } else {
        targetX = deltaX;
        targetY = deltaY;
      }
      
      if (event.cancelable) event.preventDefault();
    };

    const stopDrag = () => {
      // NAVIGATION LOGIC: If a segment is active when releasing, open the link
      if (isDragging && activeSegment) {
        const url = activeSegment.getAttribute("href");
        if (url && url !== "#") {
          window.open(url, "_blank");
        }
      }

      isDragging = false;
      targetX = targetY = 0;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stopDrag);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", stopDrag);
  };

  joystick.addEventListener("mousedown", startDrag);
  joystick.addEventListener("touchstart", startDrag, { passive: false });

  animate();
}