import { galleryItems } from "./data.js";

document.addEventListener("DOMContentLoaded", function () {
  const gallery = document.querySelector(".gallery");
  const blurryPrev = document.querySelector(".blurry-prev");
  const projectPreview = document.querySelector(".project-preview");
  const itemCount = galleryItems.length;

  let activeItemIndex = 0;
  let isAnimating = false;

  // Get the gallery button
  const btn = document.querySelector(".open-gallery");
  btn.addEventListener("click", () => {
    const car = galleryItems[activeItemIndex];
    window.open(car.href, "_blank"); // <-- open in new tab
  });

  function createSplitText(element) {
    const splitText = new SplitType(element, { types: "lines" });
    element.innerHTML = "";
    splitText.lines.forEach((line) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "line";
      const lineSpan = document.createElement("span");
      lineSpan.textContent = line.textContent;
      lineDiv.appendChild(lineSpan);
      element.appendChild(lineDiv);
    });
  }

  const initialInfoText = document.querySelector(".info p");
  if (initialInfoText) {
    createSplitText(initialInfoText);
  }

  const elementsToAnimate = document.querySelectorAll(
    ".title h1, .car-year p, .car-price p, .car-specs p, .car-services p, .car-highlight p"
  );
  gsap.set(elementsToAnimate, { y: 0 });

  // Create gallery thumbnails
  for (let i = 0; i < itemCount; i++) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    if (i === 0) itemDiv.classList.add("active");

    const img = document.createElement("img");
    img.src = `./assets/img${i + 1}.jpeg`;
    img.alt = galleryItems[i].title;

    itemDiv.appendChild(img);
    itemDiv.dataset.index = i;
    itemDiv.addEventListener("click", () => handleItemClick(i));
    gallery.appendChild(itemDiv);
  }

  function createElementWithClass(tag, className) {
    const element = document.createElement(tag);
    element.classList.add(className);
    return element;
  }

  function createProjectDetails(activeItem, index) {
    const newProjectDetails = createElementWithClass("div", "project-details");

    const detailsStructure = [
      { className: "title", tag: "h1", content: activeItem.title },
      { className: "car-year", tag: "p", content: `Year: ${activeItem.carYear}` },
      { className: "car-price", tag: "p", content: `Price: ${activeItem.carPrice}` },
      { className: "car-specs", tag: "p", content: activeItem.carSpecs },
      { className: "car-services", tag: "p", content: activeItem.carServices },
      { className: "car-highlight", tag: "p", content: activeItem.carHighlight },
    ];

    detailsStructure.forEach(({ className, tag, content }) => {
      const div = createElementWithClass("div", className);
      const element = document.createElement(tag);
      element.innerHTML = content.replace(/\n/g, "<br>");
      div.appendChild(element);
      newProjectDetails.appendChild(div);
    });

    const newProjectImg = createElementWithClass("div", "project-img");

    const newImg = document.createElement("img");
    newImg.src = `./assets/img${index + 1}.jpeg`;
    newImg.alt = activeItem.title;
    
    const newBtn = document.createElement("a");
    newBtn.classList.add("open-gallery");
    newBtn.textContent = "View Full Gallery";
    newBtn.target = "_blank";
    newBtn.href = activeItem.href;   // <--- direct link, no JS needed
    
    newProjectImg.appendChild(newImg);
    newProjectImg.appendChild(newBtn);


    return { newProjectDetails, newProjectImg, infoP: newProjectDetails.querySelector(".car-highlight p") };
  }

  function handleItemClick(index) {
    if (index === activeItemIndex || isAnimating) return;
    isAnimating = true;

    const activeItem = galleryItems[index];

    // Update gallery selection
    gallery.children[activeItemIndex].classList.remove("active");
    gallery.children[index].classList.add("active");
    activeItemIndex = index;

    // Update button link immediately
    btn.onclick = () => {
      const activeItem = galleryItems[activeItemIndex];
      window.open(activeItem.href, "_blank"); // <-- open in new tab
    };


    const elementsToAnimate = document.querySelectorAll(
      ".title h1, .car-year p, .car-price p, .car-specs p, .car-services p, .car-highlight p"
    );

    const currentProjectImg = document.querySelector(".project-img");
    const currentProjectImgElem = currentProjectImg.querySelector("img");

    // Blurry background transition
    const newBlurryImg = document.createElement("img");
    newBlurryImg.src = `./assets/img${index + 1}.jpeg`;
    newBlurryImg.alt = activeItem.title;
    gsap.set(newBlurryImg, { opacity: 0, position: "absolute", top: 0, right: 0, width: "100%", height: "100%", objectFit: "cover" });
    blurryPrev.insertBefore(newBlurryImg, blurryPrev.firstChild);

    const currentBlurryImg = blurryPrev.querySelector("img:nth-child(2)");
    if (currentBlurryImg) {
      gsap.to(currentBlurryImg, {
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.inOut",
        onComplete: () => blurryPrev.removeChild(currentBlurryImg),
      });
    }

    gsap.to(newBlurryImg, { delay: 0.5, opacity: .2, duration: 1, ease: "power2.inOut" });
    gsap.to(elementsToAnimate, { y: -60, duration: 1, ease: "power4.in", stagger: 0.05 });

    // Animate project image out
    gsap.to(currentProjectImg, {
      onStart: () => {
        gsap.to(currentProjectImgElem, { scale: 2, duration: 1, ease: "power4.in" });
      },
      scale: 0,
      bottom: "10em",
      duration: 1,
      ease: "power4.in",
      onComplete: function () {
        document.querySelector(".project-details")?.remove();
        currentProjectImg.remove();

        const { newProjectDetails, newProjectImg } = createProjectDetails(activeItem, index);

        projectPreview.appendChild(newProjectDetails);
        projectPreview.appendChild(newProjectImg);

        // Split text
        newProjectDetails.querySelectorAll("p").forEach((p) => createSplitText(p));

        const elementsToAnimate = document.querySelectorAll(
          ".title h1, .car-year p, .car-price p, .car-specs p, .car-services p, .car-highlight p"
        );

        gsap.fromTo(elementsToAnimate, { y: 40 }, { y: 0, duration: 1, ease: "power4.out", stagger: 0.05 });
        gsap.fromTo(newProjectImg, { scale: 0, bottom: "-10em" }, { scale: 1, bottom: "1em", duration: 1, ease: "power4.out" });
        gsap.fromTo(newProjectImg.querySelector("img"), { scale: 2 }, { scale: 1, duration: 1, ease: "power4.out", onComplete: () => { isAnimating = false; } });
      },
    });
  }
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

// TYPES LIST -----------------------------------------------------------------

document.querySelectorAll('.types-list li').forEach(li => {
  const text = li.textContent.trim();
  const phrases = li.dataset.phrases.split(',');
  li.innerHTML = `<div class="marquee-wrapper"><div class="marquee-inner">${text}</div></div>`;

  const wrapper = li.querySelector('.marquee-wrapper');
  const inner = li.querySelector('.marquee-inner');

  // Force wrapper width to li width and hide overflow
  wrapper.style.width = li.offsetWidth + 'px';
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = 'inline-block';

  let tween = null;

  li.addEventListener('mouseenter', () => {
    inner.innerHTML = ''; // clear previous content
    let fullText = phrases.map(p => `• ${p} •`).join('   ');
    inner.innerHTML = fullText;

    // Duplicate enough so scrolling looks smooth
    while (inner.offsetWidth < li.offsetWidth * 2) {
      inner.innerHTML += '   ' + fullText;
    }

    inner.style.whiteSpace = 'nowrap';
    inner.style.display = 'inline-block';

    // Animate only within wrapper
    tween = gsap.to(inner, {
      x: -inner.offsetWidth / 2, // move half of inner width
      ease: 'none',
      repeat: -1,
      duration: 20
    });
  });

  li.addEventListener('mouseleave', () => {
    if (tween) tween.kill();
    inner.style.transform = 'translateX(0)';
    inner.innerHTML = text;
  });

  // Update wrapper width on window resize
  window.addEventListener('resize', () => {
    wrapper.style.width = li.offsetWidth + 'px';
  });
});
