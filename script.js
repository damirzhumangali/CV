// 1. Reveal on scroll
const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
  observer.observe(item);
});

// 2. Stat Counter Animation
const countElements = document.querySelectorAll("[data-count]");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10);
        const duration = 1200;
        const startTime = performance.now();

        const updateCounter = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(easeProgress * target);
          el.textContent = `${current}+`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = `${target}+`;
          }
        };

        requestAnimationFrame(updateCounter);
        countObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

countElements.forEach((el) => countObserver.observe(el));

// 3. Scroll Progress Bar
const scrollProgressBar = document.getElementById("scroll-progress");
const updateScrollProgress = () => {
  if (!scrollProgressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgressBar.style.width = `${scrollPercent}%`;
};

// 4. Cursor Glow Spotlight
const cursorGlow = document.getElementById("cursor-glow");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener("pointermove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const animateCursorGlow = () => {
  if (cursorGlow) {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
  }
  requestAnimationFrame(animateCursorGlow);
};
animateCursorGlow();

// 5. Card Spotlight & 3D Tilt Effect
const spotlightCards = document.querySelectorAll("[data-spotlight]");
spotlightCards.forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    if (card.classList.contains("tilt-card")) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    }
  });

  card.addEventListener("pointerleave", () => {
    if (card.classList.contains("tilt-card")) {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  });
});

// 6. Magnetic Elements
const magneticItems = document.querySelectorAll(".magnetic");
magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    item.style.transform = `translate3d(${offsetX * 0.12}px, ${offsetY * 0.12}px, 0)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});

// 7. Golden Particle Canvas
const canvas = document.getElementById("ambient-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 20000), 55);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 1.8 + 0.6;
      this.alpha = Math.random() * 0.5 + 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (140 - dist) / 140;
        this.x -= (dx / dist) * force * 0.6;
        this.y -= (dy / dist) * force * 0.6;
      }

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animateCanvas = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          const lineAlpha = (1 - dist / 125) * 0.16;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(249, 115, 22, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateCanvas);
  };
  animateCanvas();
}

// 8. Motion Scroll Showcase
// 8. Motion Scroll Showcase (JS-driven pinning + smooth easing + cards drop from top)
const motionSafe = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
const projectShowcase = document.querySelector("[data-project-showcase]");
const showcaseTrack = projectShowcase?.querySelector("[data-project-track]");
const showcaseCards = showcaseTrack ? [...showcaseTrack.querySelectorAll("[data-showcase-card]")] : [];
const showcaseSticky = projectShowcase?.querySelector(".project-showcase-sticky");

let showcaseMetrics = null;
let motionFrame = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

const PIN_OFFSET = 96;

// целевой прогресс (от скролла) и сглаженный прогресс (то, что реально рисуем)
let targetProgress = 0;
let smoothProgress = 0;
let showcaseActive = false;

const resetShowcasePosition = () => {
  if (!showcaseSticky) return;
  showcaseSticky.style.position = "";
  showcaseSticky.style.top = "";
  showcaseSticky.style.left = "";
  showcaseSticky.style.width = "";
  showcaseSticky.style.bottom = "";
  showcaseTrack.style.transform = "";
  showcaseCards.forEach((card) => {
    card.style.opacity = "";
    if (!card.matches(":hover")) card.style.transform = "";
  });
};

const applyShowcaseFrame = (progress) => {
  const { startOffset, totalTravel } = showcaseMetrics;
  const translateX = startOffset - totalTravel * progress;
  showcaseTrack.style.transform = `translate3d(${translateX}px, 0, 0)`;

  showcaseCards.forEach((card, index) => {
    const stagger = index * 0.05;
    const cardProgress = clamp((progress - stagger) / 0.32, 0, 1);
    const opacity = 0.4 + cardProgress * 0.6;
    const scale = 0.94 + cardProgress * 0.06;

    // появление СВЕРХУ: карточка стартует выше своей позиции и опускается на место
    const translateY = (1 - cardProgress) * -32;

    card.style.opacity = opacity.toFixed(3);
    if (!card.matches(":hover")) {
      card.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    }
  });
};

const updateShowcasePinning = () => {
  if (!projectShowcase || !showcaseSticky) return false;

  const rect = projectShowcase.getBoundingClientRect();
  const stickyHeight = showcaseSticky.offsetHeight;

  if (rect.top > PIN_OFFSET) {
    showcaseSticky.style.position = "";
    showcaseSticky.style.top = "";
    showcaseSticky.style.left = "";
    showcaseSticky.style.width = "";
    showcaseSticky.style.bottom = "";
  } else if (rect.bottom < stickyHeight + PIN_OFFSET) {
    showcaseSticky.style.position = "absolute";
    showcaseSticky.style.top = "auto";
    showcaseSticky.style.bottom = "0";
    showcaseSticky.style.left = "0";
    showcaseSticky.style.width = "100%";
  } else {
    showcaseSticky.style.position = "fixed";
    showcaseSticky.style.top = `${PIN_OFFSET}px`;
    showcaseSticky.style.left = `${rect.left}px`;
    showcaseSticky.style.width = `${rect.width}px`;
    showcaseSticky.style.bottom = "auto";
  }

  const scrollRange = Math.max(projectShowcase.offsetHeight - stickyHeight - PIN_OFFSET, 1);
  const current = PIN_OFFSET - rect.top;
  targetProgress = clamp(current / scrollRange, 0, 1);

  return true;
};

const updateProjectShowcase = () => {
  if (!projectShowcase || !showcaseTrack || !showcaseSticky) return;

  if (!showcaseMetrics || window.innerWidth <= 1080 || !motionSafe) {
    showcaseActive = false;
    resetShowcasePosition();
    return;
  }

  showcaseActive = updateShowcasePinning();
};

// непрерывный rAF-цикл сглаживания — карточки "догоняют" целевой прогресс плавно,
// вместо того чтобы дёргано прыгать к значению скролла
const smoothShowcaseLoop = () => {
  if (showcaseActive && showcaseMetrics) {
    smoothProgress = lerp(smoothProgress, targetProgress, 0.12);
    if (Math.abs(smoothProgress - targetProgress) < 0.0005) {
      smoothProgress = targetProgress;
    }
    applyShowcaseFrame(smoothProgress);
  }
  requestAnimationFrame(smoothShowcaseLoop);
};
requestAnimationFrame(smoothShowcaseLoop);

const measureProjectShowcase = () => {
  if (!projectShowcase || !showcaseTrack || !showcaseSticky) return;

  if (window.innerWidth <= 1080 || !motionSafe) {
    projectShowcase.style.height = "auto";
    showcaseMetrics = null;
    showcaseActive = false;
    resetShowcasePosition();
    return;
  }

  const distance = Math.max(showcaseTrack.scrollWidth - showcaseSticky.clientWidth, 0);
  const startOffset = Math.min(showcaseSticky.clientWidth * 0.22, 220);
  const totalTravel = distance + startOffset;
  const shellHeight = window.innerHeight + totalTravel + 180;

  projectShowcase.style.height = `${Math.max(shellHeight, 1200)}px`;
  showcaseMetrics = { distance, startOffset, totalTravel };
  updateProjectShowcase();
};

const runMotionUpdates = () => {
  motionFrame = null;
  updateScrollProgress();
  updateProjectShowcase();
};

const scheduleMotionUpdates = () => {
  if (motionFrame !== null) return;
  motionFrame = window.requestAnimationFrame(runMotionUpdates);
};

window.addEventListener("scroll", scheduleMotionUpdates, { passive: true });
window.addEventListener("resize", () => {
  measureProjectShowcase();
  scheduleMotionUpdates();
});

measureProjectShowcase();
scheduleMotionUpdates();




const portrait = document.getElementById("portrait");
const future = document.getElementById("future");

let portraitRect = portrait.getBoundingClientRect();
let targetX = portraitRect.width / 2;
let targetY = portraitRect.height / 2;
let currentX = targetX;
let currentY = targetY;

let targetScale = 0;
let currentScale = 0;

const baseRadius = 180;
const segments = 28;

function blobPath(cx, cy, radius, time) {
  let d = "";
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wobble =
      Math.sin(angle * 3 + time * 0.0016) * 10 +
      Math.sin(angle * 5 - time * 0.0021) * 6 +
      Math.sin(angle * 2 + time * 0.0009) * 8;
    const r = radius + wobble * (radius / baseRadius);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += i === 0 ? `M${x},${y} ` : `L${x},${y} `;
  }
  return d + "Z";
}

function tick(time) {
  currentX += (targetX - currentX) * 0.15;
  currentY += (targetY - currentY) * 0.15;
  currentScale += (targetScale - currentScale) * 0.12;

  const radius = baseRadius * currentScale;

  if (radius > 1) {
    future.style.clipPath = `path('${blobPath(currentX, currentY, radius, time)}')`;
  } else {
    future.style.clipPath = "circle(0px at 50% 50%)";
  }

  requestAnimationFrame(tick);
}

portrait.addEventListener("pointermove", (e) => {
  targetX = e.clientX - portraitRect.left;
  targetY = e.clientY - portraitRect.top;
  targetScale = 1;
}, { passive: true });

portrait.addEventListener("pointerleave", () => {
  targetScale = 0;
});

window.addEventListener("resize", () => {
  portraitRect = portrait.getBoundingClientRect();
}, { passive: true });

requestAnimationFrame(tick);

// 9. Hero → следующая секция: плавный fade при скролле
const heroSection = document.querySelector(".hero");

const updateHeroFade = () => {
  if (!heroSection) return;

  const heroHeight = heroSection.offsetHeight;
  const scrollTop = window.scrollY;

  // fade начинается сразу и полностью завершается к 65% высоты hero
  const progress = clamp(scrollTop / (heroHeight * 0.65), 0, 1);

  heroSection.style.setProperty("--hero-fade", progress.toFixed(3));
};

window.addEventListener("scroll", () => {
  scheduleMotionUpdates();
  updateHeroFade();
}, { passive: true });

window.addEventListener("resize", () => {
  updateHeroFade();
}, { passive: true });

updateHeroFade();


// 10. Живое северное сияние (canvas)
// 10. Живое северное сияние (canvas)
const auroraCanvas = document.getElementById("aurora-canvas");

if (auroraCanvas) {
  const auroraCtx = auroraCanvas.getContext("2d");
  const pageContent = document.querySelector(".page-content");

  let auroraWidth = 0;
  let auroraHeight = 0;

  const resizeAurora = () => {
    auroraWidth = window.innerWidth;
    auroraHeight = pageContent ? pageContent.scrollHeight : window.innerHeight;
    auroraCanvas.width = auroraWidth;
    auroraCanvas.height = auroraHeight;
  };

  window.addEventListener("resize", resizeAurora, { passive: true });
  window.addEventListener("load", resizeAurora);

  if (pageContent && "ResizeObserver" in window) {
    const ro = new ResizeObserver(() => resizeAurora());
    ro.observe(pageContent);
  }

  resizeAurora();

  const auroraBands = [
    { hue: 155, baseY: 0.08, amp: 160, speed: 0.0009, freq: 0.0022, alpha: 0.6, thickness: 220 },
    { hue: 165, baseY: 0.32, amp: 190, speed: -0.0007, freq: 0.0016, alpha: 0.5, thickness: 250 },
    { hue: 145, baseY: 0.58, amp: 170, speed: 0.0008, freq: 0.0024, alpha: 0.52, thickness: 230 },
    { hue: 170, baseY: 0.82, amp: 150, speed: -0.0006, freq: 0.0018, alpha: 0.45, thickness: 200 },
  ];

  const drawAurora = (time) => {
    auroraCtx.clearRect(0, 0, auroraWidth, auroraHeight);

    const globalHueShift = Math.sin(time * 0.0002) * 15;

    auroraBands.forEach((band, bi) => {
      const step = 24;
      const points = [];

      for (let x = -step; x <= auroraWidth + step; x += step) {
        const wave =
          Math.sin(x * band.freq + time * band.speed + bi * 10) * band.amp +
          Math.sin(x * band.freq * 2.3 - time * band.speed * 1.7 + bi) * band.amp * 0.4;
        points.push({ x, y: band.baseY * auroraHeight + wave });
      }

      const yCenter = band.baseY * auroraHeight;
      const hue = band.hue + globalHueShift;
      const gradient = auroraCtx.createLinearGradient(
        0, yCenter - band.thickness / 2,
        0, yCenter + band.thickness / 2
      );
      gradient.addColorStop(0, `hsla(${hue}, 85%, 55%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 85%, 58%, ${band.alpha})`);
      gradient.addColorStop(1, `hsla(${hue}, 85%, 55%, 0)`);

      auroraCtx.beginPath();
      auroraCtx.moveTo(points[0].x, points[0].y - band.thickness / 2);
      points.forEach((p) => auroraCtx.lineTo(p.x, p.y - band.thickness / 2));
      for (let i = points.length - 1; i >= 0; i--) {
        auroraCtx.lineTo(points[i].x, points[i].y + band.thickness / 2);
      }
      auroraCtx.closePath();
      auroraCtx.fillStyle = gradient;
      auroraCtx.fill();
    });

    requestAnimationFrame(drawAurora);
  };

  requestAnimationFrame(drawAurora);
}