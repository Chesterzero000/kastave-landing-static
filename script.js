function scrollToHashTarget(targetId, behavior = "smooth") {
  if (!targetId || targetId === "#") return false;
  if (targetId === "#top") {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const target = document.querySelector(targetId);
  if (!target) return false;

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

function getResponsiveHashTarget(targetId) {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  if (isMobile && targetId === "#reserve" && document.querySelector("#payment")) {
    return "#payment";
  }
  return targetId;
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const originalTargetId = link.getAttribute("href");
    const targetId = getResponsiveHashTarget(originalTargetId);
    if (!targetId || targetId === "#" || !document.querySelector(targetId)) return;

    event.preventDefault();
    scrollToHashTarget(targetId);
    history.pushState(null, "", originalTargetId);
  });
});

function settleInitialHash() {
  if (!window.location.hash) return;
  requestAnimationFrame(() => {
    scrollToHashTarget(window.location.hash, "auto");
    setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 80);
    setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 240);
  });
}

window.addEventListener("load", settleInitialHash);
window.addEventListener("hashchange", settleInitialHash);

const mobileStickyCta = document.querySelector(".mobile-sticky-cta");
if (mobileStickyCta) {
  function updateMobileStickyCta() {
    const shouldShow = window.matchMedia("(max-width: 640px)").matches && window.scrollY > 520;
    mobileStickyCta.classList.toggle("is-visible", shouldShow);
  }

  updateMobileStickyCta();
  window.addEventListener("scroll", updateMobileStickyCta, { passive: true });
  window.addEventListener("resize", updateMobileStickyCta);
}

const mobileCompareSelect = document.getElementById("mobileCompareSelect");
if (mobileCompareSelect) {
  const mobileCompareData = {
    portable: {
      label: "Portable sonar",
      price: "From $209.99",
      cruise: "Manual cast and retrieve",
      ease: "Cast and retrieve",
      tech: "CHIRP sonar",
      visual: "App sonar + depth maps",
      image: "./assets/table-sonar-portable.webp",
      alt: "Portable sonar visualization with fish arches and bottom contour",
      productImage: "./assets/mobile-product-portable-clean.webp",
      productAlt: "Portable sonar product",
    },
    boat: {
      label: "Boat-mounted sonar",
      price: "$2,000+ setup",
      cruise: "Manual boat positioning",
      ease: "Boat install required",
      tech: "CHIRP + side imaging",
      visual: "Dedicated pro display",
      image: "./assets/table-sonar-boat.webp",
      alt: "Premium boat-mounted sonar side scan visualization",
      productImage: "./assets/mobile-product-boat-cutout.webp",
      productAlt: "Boat-mounted sonar display product",
    },
  };

  function updateMobileComparison() {
    const data = mobileCompareData[mobileCompareSelect.value] || mobileCompareData.portable;
    document.querySelectorAll("[data-mobile-compare-label]").forEach((node) => {
      node.textContent = data.label;
    });
    document.querySelectorAll("[data-mobile-compare-field]").forEach((node) => {
      const field = node.getAttribute("data-mobile-compare-field");
      if (field && data[field]) node.textContent = data[field];
    });

    const image = document.querySelector("[data-mobile-compare-image]");
    if (image) {
      image.src = data.image;
      image.alt = data.alt;
    }

    const productImage = document.querySelector("[data-mobile-compare-product-image]");
    if (productImage) {
      productImage.src = data.productImage;
      productImage.alt = data.productAlt;
    }
  }

  updateMobileComparison();
  mobileCompareSelect.addEventListener("change", updateMobileComparison);
}

const canvas = document.getElementById("terrainCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawTerrain(time = 0) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#effbf7");
  gradient.addColorStop(0.42, "#d8f4eb");
  gradient.addColorStop(1, "#72cbbb");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(7, 88, 91, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const horizon = height * 0.34;
  for (let layer = 0; layer < 7; layer += 1) {
    const offset = layer * 28;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 12) {
      const wave =
        Math.sin(x * 0.014 + layer * 0.8 + time * 0.0007) * 24 +
        Math.cos(x * 0.027 + layer * 0.55) * 14;
      const slope = (x / width) * 96;
      const y = horizon + offset + wave + slope;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = `rgba(${10 + layer * 9}, ${127 + layer * 6}, ${131 + layer * 2}, ${0.18 + layer * 0.055})`;
    ctx.fill();
  }

  const scanX = ((time * 0.05) % (width + 160)) - 80;
  const beam = ctx.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
  beam.addColorStop(0, "rgba(231, 173, 67, 0)");
  beam.addColorStop(0.5, "rgba(231, 173, 67, 0.28)");
  beam.addColorStop(1, "rgba(231, 173, 67, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(scanX - 80, 0, 160, height);

  const points = [
    [width * 0.62, height * 0.48],
    [width * 0.72, height * 0.56],
    [width * 0.42, height * 0.62],
    [width * 0.32, height * 0.5],
  ];
  points.forEach(([x, y], index) => {
    const pulse = 4 + Math.sin(time * 0.004 + index) * 2;
    ctx.beginPath();
    ctx.arc(x, y, pulse + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(239, 107, 82, 0.16)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#ef6b52";
    ctx.fill();
  });

    requestAnimationFrame(drawTerrain);
  }

  resizeCanvas();
  requestAnimationFrame(drawTerrain);
  window.addEventListener("resize", resizeCanvas);
}

// ---- mobile hero: static image instead of video (image set in CSS) ----
const heroVideo = document.querySelector(".hero-bg");
if (heroVideo && window.matchMedia("(max-width: 640px)").matches) {
  heroVideo.pause();
  heroVideo.removeAttribute("autoplay");
  const heroSource = heroVideo.querySelector("source");
  if (heroSource) heroSource.remove();
  heroVideo.load();
}

// ---- dark dive theme: header state, bubbles, depth meter ----
const diveHeader = document.querySelector(".site-header");
const depthMeterEl = document.getElementById("depthMeter");
const depthValEl = document.getElementById("depthVal");
const depthFillEl = document.getElementById("depthFill");

function updateDiveEffects() {
  const y = window.scrollY;

  if (diveHeader) {
    diveHeader.classList.toggle("scrolled", y > 40);
  }

  if (depthMeterEl && depthValEl && depthFillEl) {
    const start = window.innerHeight * 0.9;
    const total = document.body.scrollHeight - window.innerHeight - start;
    const p = Math.min(1, Math.max(0, (y - start) / Math.max(1, total)));
    depthMeterEl.classList.toggle("visible", y > start);
    depthValEl.textContent = Math.round(p * 52);
    depthFillEl.style.height = p * 100 + "%";
  }
}

window.addEventListener("scroll", updateDiveEffects, { passive: true });
window.addEventListener("resize", updateDiveEffects);
updateDiveEffects();

const bubblesHost = document.getElementById("bubbles");
if (bubblesHost) {
  for (let i = 0; i < 18; i += 1) {
    const b = document.createElement("i");
    const size = 4 + Math.random() * 14;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = Math.random() * 100 + "%";
    b.style.animationDuration = 4 + Math.random() * 6 + "s";
    b.style.animationDelay = Math.random() * 6 + "s";
    bubblesHost.appendChild(b);
  }
}
