window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
});

document.addEventListener("DOMContentLoaded", () => {
  const sliderList = document.querySelector('[data-slider="list"]');
  const slides = gsap.utils.toArray('[data-slider="slide"]');

  const nextButton = document.querySelector('[data-slider="button-next"]');
  const prevButton = document.querySelector('[data-slider="button-prev"]');

  const totalElement = document.querySelector('[data-slide-count="total"]');
  const stepElement = document.querySelector('[data-slide-count="step"]');
  const stepsParent = stepElement.parentElement;

  // Add a container for the blurred background
  const mainContainer = document.querySelector(".cloneable");
  let blurryBackground = document.createElement("div");
  blurryBackground.classList.add("slider-background");
  Object.assign(blurryBackground.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(40px)",
    zIndex: "0",
    transition: "background-image 1s ease-in-out",
  });
  mainContainer.insertBefore(blurryBackground, mainContainer.firstChild);

  if (!sliderList || !slides.length || !nextButton || !prevButton) return;

  const totalSlides = slides.length;
  totalElement.textContent = totalSlides < 10 ? `0${totalSlides}` : totalSlides;

  // Build step items
  stepsParent.innerHTML = "";
  const stepElements = [];
  slides.forEach((_, index) => {
    const clone = stepElement.cloneNode(true);
    clone.textContent = index + 1 < 10 ? `0${index + 1}` : index + 1;
    clone.setAttribute("data-slide-count", "step");
    stepsParent.appendChild(clone);
    stepElements.push(clone);
  });

  let currentIndex = slides.findIndex((s) => s.classList.contains("active"));
  if (currentIndex === -1) currentIndex = 0;

  // Smooth blurry background transition function
  function updateBlurryBackground(slide) {
    const img = slide.querySelector("img");
    if (!img) return;

    const newBg = document.createElement("div");
    Object.assign(newBg.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundImage: `url(${img.src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(40px)",
      opacity: "0",
      zIndex: "0",
      transition: "opacity 1s ease-in-out",
    });

    blurryBackground.appendChild(newBg);

    // Fade in new bg
    requestAnimationFrame(() => {
      newBg.style.opacity = "1";
    });

    // Remove old background after fade
    setTimeout(() => {
      const oldBg = blurryBackground.querySelectorAll("div");
      oldBg.forEach((bg) => {
        if (bg !== newBg) blurryBackground.removeChild(bg);
      });
    }, 1200);
  }

  function goToSlide(index, animate = true) {
    const max = totalSlides;
    currentIndex = (index + max) % max;

    const activeSlide = slides[currentIndex];

    // ACTIVE CLASS
    slides.forEach((s) => s.classList.remove("active"));
    activeSlide.classList.add("active");

    // UPDATE BLURRY BACKGROUND
    updateBlurryBackground(activeSlide);

    // POSITION SLIDE ON THE RIGHT SIDE OF SCREEN
    const containerWidth = sliderList.parentElement.offsetWidth;
    const slideWidth = activeSlide.offsetWidth;
    const offset = -activeSlide.offsetLeft + containerWidth - slideWidth;

    gsap.to(sliderList, {
      x: offset,
      duration: animate ? 0.7 : 0,
      ease: "power3.inOut",
    });

    // UPDATE COUNTER
    const y = -100 * currentIndex;
    gsap.to(stepElements, {
      y: `${y}%`,
      duration: animate ? 0.45 : 0,
      ease: "power3.out",
    });
  }

  // INIT
  goToSlide(currentIndex, false);

  nextButton.addEventListener("click", () => goToSlide(currentIndex + 1, true));
  prevButton.addEventListener("click", () => goToSlide(currentIndex - 1, true));

  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => goToSlide(i, true));
  });

  window.addEventListener("resize", () => goToSlide(currentIndex, false));
});
