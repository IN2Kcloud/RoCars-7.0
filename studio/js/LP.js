import collection from "./collection.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";

document.addEventListener("DOMContentLoaded", () => {

  const gallery = document.querySelector(".gallery");
  const galleryContainer = document.querySelector(".gallery-container");
  const titleContainer = document.querySelector(".title-container");

  function revealIntro() {
  const logo = document.querySelector(".logo");
  const cards = document.querySelectorAll(".card");

  // Initial state
  gsap.set(logo, { scale: 5, opacity: 0 });
  gsap.set(cards, {
    scale: 0,
    opacity: 0,
    transformOrigin: "center center",
  });

  // Animate logo reveal
  gsap.to(logo, {
    scale: 1,
    opacity: 1,
    duration: 3,
    ease: "power4.out",
    delay: 0.2,
  });

  // Animate cards with staggering for more drama
  gsap.to(cards, {
    scale: 1,
    opacity: 1,
    stagger: {
      amount: 1.5,
      from: "random",
    },
    ease: "expo.out",
    delay: 3,
    duration: 2,
  });
}

  const cards = [];
  const transformState = [];

  let currentTitle = null;
  let isPreviewActive = false;
  let isTransitioning = false;

  const config = {
    imageCount: 25,
    radius: 275,
    sensitivity: 500,
    effectFalloff: 250,
    cardMoveAmount: 50,
    lerpFactor: 0.15,
    isMobile: window.innerWidth < 1000,
  };

  const parallaxState = {
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    currentX: 0,
    currentY: 0,
    currentZ: 0,
  };

  for (let i = 0; i < config.imageCount; i++) {
    const angle = (i / config.imageCount) * Math.PI * 2;
    const x = config.radius * Math.cos(angle);
    const y = config.radius * Math.sin(angle);
    const cardIndex = i % 20;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.dataset.title = collection[cardIndex].title;

    const img = document.createElement("img");
    img.src = collection[cardIndex].img;
    card.appendChild(img);

    gsap.set(card, {
      x,
      y,
      rotation: (angle * 180) / Math.PI + 90,
      transformPerspective: 800,
      transformOrigin: "center center",
    });

    gallery.appendChild(card);
    cards.push(card);
    transformState.push({
      currentRotation: 0,
      targetRotation: 0,
      currentX: 0,
      targetX: 0,
      currentY: 0,
      targetY: 0,
      currentScale: 1,
      targetScale: 1,
      angle,
    });

    card.addEventListener("click", (e) => {
      if (!isPreviewActive && !isTransitioning) {
        togglePreview(parseInt(card.dataset.index));
        e.stopPropagation();
      }
    });
  }

  /* LOADER */

  // after card generation loop


  revealIntro();

  function togglePreview(index) {
    if (isTransitioning) return;
  
    isPreviewActive = true;
    isTransitioning = true;
  
    const angle = transformState[index].angle;
    const targetPosition = (Math.PI * 3) / 2;
    let rotationRadians = targetPosition - angle;
  
    if (rotationRadians > Math.PI) rotationRadians -= Math.PI * 2;
    else if (rotationRadians < -Math.PI) rotationRadians += Math.PI * 2;
  
    transformState.forEach((state) => {
      state.currentRotation = state.targetRotation = 0;
      state.currentScale = state.targetScale = 1;
      state.currentX = state.targetX = state.currentY = state.targetY = 0;
    });
  
    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioning = false;
      },
    });
  
    // Animate cards inside gallery to standard positions
    cards.forEach((card, i) => {
      tl.to(
        card,
        {
          x: config.radius * Math.cos(transformState[i].angle),
          y: config.radius * Math.sin(transformState[i].angle),
          rotationY: 0,
          scale: 1,
          duration: 1.25,
          ease: "power4.out",
        },
        0 // start all at the same time
      );
    });
  
    // Animate gallery + logo off-screen together
    tl.to(
      [gallery, ".logo"],
      {
        y: window.innerHeight + 1000,
        scale: 5,
        rotation: (rotationRadians * 180) / Math.PI + 360,
        duration: 2,
        ease: "power4.inOut",
      },
      0.3 // slight delay so cards first adjust before flying
    );
  
    // Smoothly reveal marquee + title after gallery is mostly gone
    tl.add(() => {
      const marquee = document.getElementById("marquee");
      const marqueeContent = document.getElementById("marqueeContent");
      marqueeContent.textContent = collection[index].text || "";
      marquee.style.display = "block";
  
      const titleText = cards[index].dataset.title;
      const p = document.createElement("p");
      p.textContent = titleText;
      titleContainer.appendChild(p);
      currentTitle = p;
  
      gsap.fromTo(
        p,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 1.25, ease: "power4.out" }
      );
    }, ">.5"); // ">1.5" = 1.5s after previous animation starts
  }

  function resetGallery() {
    if (isTransitioning) return;
    isTransitioning = true;
  
    const tl = gsap.timeline({
      onComplete: () => {
        isPreviewActive = isTransitioning = false;
        Object.assign(parallaxState, {
          targetX: 0,
          targetY: 0,
          targetZ: 0,
          currentX: 0,
          currentY: 0,
          currentZ: 0,
        });
      },
    });
  
    // Animate marquee out smoothly
    const marquee = document.getElementById("marquee");
    tl.to(marquee, {
      opacity: 0,
      y: -50,
      duration: 0.75,
      ease: "power4.in",
      onComplete: () => {
        marquee.style.display = "none";
        marquee.style.opacity = 1;
        marquee.style.transform = "";
      },
    });
  
    // Animate title out
    if (currentTitle) {
      const words = currentTitle.querySelectorAll(".word");
      if (words.length) {
        tl.to(
          words,
          {
            y: "-125%",
            opacity: 0,
            stagger: 0.1,
            duration: 0.75,
            ease: "power4.in",
          },
          "<" // start at the same time as marquee animation
        );
      } else {
        tl.to(currentTitle, {
          y: "-125%",
          opacity: 0,
          duration: 0.75,
          ease: "power4.in",
        }, "<");
      }
  
      tl.add(() => {
        currentTitle.remove();
        currentTitle = null;
      });
    }
  
    // Animate gallery + logo back to original position
    const viewportWidth = window.innerWidth;
    let galleryScale = viewportWidth < 768 ? 0.6 : viewportWidth < 1200 ? 0.8 : 1;
  
    tl.to(
      gallery,
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: galleryScale,
        duration: 2.5,
        ease: "power4.inOut",
      },
      ">0.1"
    );
  
    tl.to(
      ".logo",
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 2.5,
        ease: "power4.inOut",
        clearProps: "transform",
      },
      "<"
    );
  }


  function handleResize() {
    const viewportWidth = window.innerWidth;
    config.isMobile = viewportWidth < 1000;

    let galleryScale = 1;

    if (viewportWidth < 768) {
      galleryScale = 0.6;
    } else if (viewportWidth < 1200) {
      galleryScale = 0.8;
    }

    gsap.set(gallery, {
      scale: galleryScale,
    });

    if (!isPreviewActive) {
      parallaxState.targetX = 0;
      parallaxState.targetY = 0;
      parallaxState.targetZ = 0;
      parallaxState.currentX = 0;
      parallaxState.currentY = 0;
      parallaxState.currentZ = 0;

      transformState.forEach((state) => {
        state.targetRotation = 0;
        state.currentRotation = 0;
        state.targetScale = 1;
        state.currentScale = 1;
        state.targetX = 0;
        state.currentX = 0;
        state.targetY = 0;
        state.currentY = 0;
      });
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize();

  document.addEventListener("click", () => {
    if (isPreviewActive && !isTransitioning) resetGallery();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPreviewActive && !isTransitioning)
      resetGallery();
  });

  /* ---------------- MAGNETIC REPEL ---------------- */

  document.addEventListener("mousemove", (e) => {
    if (isPreviewActive || isTransitioning || config.isMobile) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    parallaxState.targetY = ((e.clientX - cx) / cx) * 15;
    parallaxState.targetX = (-(e.clientY - cy) / cy) * 15;
    parallaxState.targetZ = ((e.clientX - cx) / cx) * 6;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
    
      const dx = cardX - e.clientX;
      const dy = cardY - e.clientY;
      const dist = Math.hypot(dx, dy);
    
      const innerAttract = 70;   // 👈 CLICK ZONE
      const outerRepel = 260;    // 👈 EFFECT ZONE
    
      if (dist < innerAttract) {
        // 🧲 SOFT ATTRACTION
        const force = 1 - dist / innerAttract;
    
        transformState[i].targetX = -dx * force * 0.15;
        transformState[i].targetY = -dy * force * 0.15;
        transformState[i].targetScale = 1.1;
        transformState[i].targetRotation = -force * 10;
      } 
      else if (dist < outerRepel) {
        // 💥 REPEL ZONE
        const force = 1 - dist / outerRepel;
        const nx = dx / dist;
        const ny = dy / dist;
    
        transformState[i].targetX = nx * force * config.cardMoveAmount;
        transformState[i].targetY = ny * force * config.cardMoveAmount;
        transformState[i].targetScale = 1 + force * 0.12;
        transformState[i].targetRotation = force * 25;
      } 
      else {
        // 😌 REST
        transformState[i].targetX = 0;
        transformState[i].targetY = 0;
        transformState[i].targetScale = 1;
        transformState[i].targetRotation = 0;
      }
    });
  });

  document.addEventListener("mouseout", (e) => {
    if (
      (e.relatedTarget === null || e.relatedTarget.nodeName === "HTML") &&
      !isPreviewActive &&
      !isTransitioning
    ) {
      transformState.forEach((state) => {
        state.targetRotation = 0;
        state.targetScale = 1;
        state.targetX = 0;
        state.targetY = 0;
      });
      parallaxState.targetX = 0;
      parallaxState.targetY = 0;
      parallaxState.targetZ = 0;
    }
  });

  function animate() {
    if (!isPreviewActive && !isTransitioning) {
      parallaxState.currentX +=
        (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
      parallaxState.currentY +=
        (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
      parallaxState.currentZ +=
        (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;

      gsap.set(galleryContainer, {
        rotateX: parallaxState.currentX,
        rotateY: parallaxState.currentY,
        rotation: parallaxState.currentZ,
        transformOrigin: "center center",
      });

      /* ----------- LOGO ---------- */
      if (!config.isMobile && !isPreviewActive && !isTransitioning) {
        gsap.set(document.querySelector(".logo"), {
          rotateX: parallaxState.currentX,
          rotateY: parallaxState.currentY,
          rotation: parallaxState.currentZ,
          transformOrigin: "center center",
        });
      }

      cards.forEach((card, index) => {
        const state = transformState[index];

        state.currentRotation +=
          (state.targetRotation - state.currentRotation) * config.lerpFactor;
        state.currentScale +=
          (state.targetScale - state.currentScale) * config.lerpFactor;
        state.currentX += (state.targetX - state.currentX) * config.lerpFactor;
        state.currentY += (state.targetY - state.currentY) * config.lerpFactor;

        const angle = state.angle;
        const x = config.radius * Math.cos(angle);
        const y = config.radius * Math.sin(angle);

        gsap.set(card, {
          x: x + state.currentX,
          y: y + state.currentY,
          rotationY: state.currentRotation,
          scale: state.currentScale,
          rotation: (angle * 180) / Math.PI + 90,
          transformOrigin: "center center",
          transformPerspective: 1000,
        });
      });
    }
    requestAnimationFrame(animate);
  }

  animate();
});
