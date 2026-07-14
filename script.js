const slides = [...document.querySelectorAll(".slide")];
const slideControls = document.querySelector(".slider-controls");
const currentSlide = document.querySelector(".current-slide");
const totalSlides = document.querySelector(".total-slides");
let activeSlide = 0;
let timer;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === activeSlide));
  if (currentSlide) currentSlide.textContent = String(activeSlide + 1);
}

function startSlider() {
  clearInterval(timer);
  timer = setInterval(() => {
    showSlide((activeSlide + 1) % slides.length);
  }, 5000);
}

if (totalSlides) totalSlides.textContent = String(slides.length);

slideControls?.querySelectorAll(".slide-arrow").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction === "prev" ? -1 : 1;
    showSlide(activeSlide + direction);
    startSlider();
  });
});

if (slides.length > 1) startSlider();

const navLinks = [...document.querySelectorAll(".nav a")];
const navSections = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.replace("#", "");
    const section = id ? document.getElementById(id) : null;
    return section ? { id, link, section } : null;
  })
  .filter(Boolean);

function setActiveNavLink(activeLink) {
  navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveNav() {
  const hashId = window.location.hash.replace("#", "");
  const hashMatch = navSections.find((item) => item.id === hashId);
  if (hashMatch) {
    setActiveNavLink(hashMatch.link);
    return;
  }

  const headerOffset = document.querySelector(".shop-header")?.offsetHeight || 0;
  const activeSection =
    [...navSections]
      .reverse()
      .find((item) => item.section.getBoundingClientRect().top <= headerOffset + 72) || navSections[0];

  if (activeSection) setActiveNavLink(activeSection.link);
}

updateActiveNav();
window.addEventListener("hashchange", updateActiveNav);
window.addEventListener("scroll", updateActiveNav, { passive: true });

const loopingModeVideos = [...document.querySelectorAll(".multirow video")];

function playModeVideo(video) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      video.setAttribute("data-awaiting-play", "true");
    });
  }
}

loopingModeVideos.forEach((video) => {
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  video.addEventListener("loadeddata", () => playModeVideo(video), { once: true });
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    playModeVideo(video);
  });
  video.addEventListener("pause", () => {
    if (!video.closest(".video-placeholder")) playModeVideo(video);
  });
});

document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden) loopingModeVideos.forEach(playModeVideo);
  },
  false,
);

document.addEventListener(
  "click",
  () => {
    loopingModeVideos
      .filter((video) => video.dataset.awaitingPlay === "true")
      .forEach((video) => {
        delete video.dataset.awaitingPlay;
        playModeVideo(video);
      });
  },
  { once: true },
);

const teamStoryToggle = document.querySelector("[data-team-story-toggle]");
const teamStorySummary = document.querySelector(".team-story-summary");
const teamStoryFull = document.getElementById(teamStoryToggle?.getAttribute("aria-controls"));

teamStoryToggle?.addEventListener("click", () => {
  const isExpanded = teamStoryToggle.getAttribute("aria-expanded") === "true";
  teamStoryToggle.setAttribute("aria-expanded", String(!isExpanded));
  teamStoryToggle.textContent = isExpanded ? "READ FULL STORY" : "COLLAPSE STORY";
  if (teamStorySummary) teamStorySummary.hidden = !isExpanded;
  if (teamStoryFull) teamStoryFull.hidden = isExpanded;
});

const galleryLightbox = document.querySelector("[data-image-lightbox]");
const galleryLightboxImage = document.querySelector("[data-image-lightbox-img]");
const galleryLightboxClose = document.querySelector("[data-image-lightbox-close]");
let activeGalleryImage = null;

function openGalleryLightbox(image) {
  if (!galleryLightbox || !galleryLightboxImage) return;
  activeGalleryImage = image;
  galleryLightboxImage.src = image.currentSrc || image.src;
  galleryLightboxImage.alt = image.alt ? `${image.alt} enlarged` : "Expanded team image";
  galleryLightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
  galleryLightboxClose?.focus({ preventScroll: true });
}

function closeGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage || galleryLightbox.hidden) return;
  galleryLightbox.hidden = true;
  galleryLightboxImage.src = "";
  document.body.classList.remove("is-lightbox-open");
  activeGalleryImage?.focus?.({ preventScroll: true });
  activeGalleryImage = null;
}

document.querySelectorAll(".team-profile-gallery img, .member-media-grid img, .field-test-gallery img").forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", image.alt ? `Open full-size image: ${image.alt}` : "Open full-size team image");

  image.addEventListener("click", () => openGalleryLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openGalleryLightbox(image);
  });
});

galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) closeGalleryLightbox();
});

galleryLightboxClose?.addEventListener("click", closeGalleryLightbox);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeGalleryLightbox();
});

const evidenceCarouselTrack = document.querySelector(".evidence-carousel-track");
const evidenceReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
let evidenceAutoplayTimer = null;

function getEvidenceScrollStep() {
  if (!evidenceCarouselTrack) return 0;
  const firstCard = evidenceCarouselTrack.querySelector(".evidence-card");
  const gap = parseFloat(getComputedStyle(evidenceCarouselTrack).gap) || 0;
  const cardWidth = firstCard?.getBoundingClientRect().width || evidenceCarouselTrack.clientWidth;
  return cardWidth + gap;
}

function scrollEvidenceCarousel(direction = 1) {
  if (!evidenceCarouselTrack) return;
  const maxScrollLeft = Math.max(0, evidenceCarouselTrack.scrollWidth - evidenceCarouselTrack.clientWidth);
  if (maxScrollLeft <= 1) return;

  if (direction > 0 && evidenceCarouselTrack.scrollLeft >= maxScrollLeft - 4) {
    evidenceCarouselTrack.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }

  if (direction < 0 && evidenceCarouselTrack.scrollLeft <= 4) {
    evidenceCarouselTrack.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
    return;
  }

  evidenceCarouselTrack.scrollBy({
    left: direction * getEvidenceScrollStep(),
    behavior: "smooth",
  });
}

function pauseEvidenceAutoplay() {
  window.clearInterval(evidenceAutoplayTimer);
  evidenceAutoplayTimer = null;
}

function startEvidenceAutoplay() {
  if (!evidenceCarouselTrack || evidenceCarouselTrack.dataset.evidenceAutoplay !== "true" || evidenceReducedMotion) return;
  pauseEvidenceAutoplay();
  evidenceAutoplayTimer = window.setInterval(() => scrollEvidenceCarousel(1), 3600);
}

document.querySelectorAll("[data-evidence-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.evidenceDirection === "prev" ? -1 : 1;
    scrollEvidenceCarousel(direction);
    startEvidenceAutoplay();
  });
});

if (evidenceCarouselTrack) {
  evidenceCarouselTrack.addEventListener("mouseenter", pauseEvidenceAutoplay);
  evidenceCarouselTrack.addEventListener("mouseleave", startEvidenceAutoplay);
  evidenceCarouselTrack.addEventListener("focusin", pauseEvidenceAutoplay);
  evidenceCarouselTrack.addEventListener("focusout", startEvidenceAutoplay);
  evidenceCarouselTrack.addEventListener("pointerdown", pauseEvidenceAutoplay);
  evidenceCarouselTrack.addEventListener("pointerup", startEvidenceAutoplay);
  evidenceCarouselTrack.addEventListener("pointercancel", startEvidenceAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseEvidenceAutoplay();
    } else {
      startEvidenceAutoplay();
    }
  });

  startEvidenceAutoplay();
}

function createMarketingEventId(prefix) {
  const cleanPrefix = prefix.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  if (window.crypto?.randomUUID) return `${cleanPrefix}_${window.crypto.randomUUID()}`;
  return `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function buildMarketingParams(link) {
  const params = {
    label: link.textContent.trim(),
    href: link.href,
  };

  if (link.dataset.paymentProvider) params.payment_provider = link.dataset.paymentProvider;
  if (link.dataset.trackValue) params.value = Number(link.dataset.trackValue);
  if (link.dataset.trackCurrency) params.currency = link.dataset.trackCurrency;
  if (link.dataset.trackContentName) params.content_name = link.dataset.trackContentName;
  if (link.dataset.trackContentId) {
    params.content_ids = [link.dataset.trackContentId];
    params.content_type = "product";
    params.num_items = 1;
  }

  return params;
}

function storeCheckoutContext(eventName, params, eventID) {
  if (!eventName.includes("checkout")) return;

  try {
    window.localStorage.setItem(
      "kastave_checkout_context",
      JSON.stringify({
        checkoutEventId: eventID,
        purchaseEventId: createMarketingEventId("purchase"),
        provider: params.payment_provider || "",
        value: params.value || 1.0,
        currency: params.currency || "USD",
        content_name: params.content_name || "Kastave $1 Reservation",
        content_ids: params.content_ids || ["kastave-reservation-1usd"],
        createdAt: Date.now(),
      }),
    );
  } catch {
    // localStorage can be unavailable in strict privacy contexts.
  }
}

function trackMarketingEvent(eventName, params = {}) {
  const eventID = createMarketingEventId(eventName);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, event_id: eventID, ...params });
  storeCheckoutContext(eventName, params, eventID);

  if (typeof window.fbq === "function") {
    if (eventName.includes("checkout")) {
      window.fbq("track", "InitiateCheckout", params, { eventID });
    } else if (eventName.includes("waitlist") || eventName.includes("lead")) {
      window.fbq("track", "Lead", params, { eventID });
    } else {
      window.fbq("trackCustom", eventName, params, { eventID });
    }
  }
}

document.querySelectorAll("[data-track]").forEach((link) => {
  link.addEventListener("click", () => {
    trackMarketingEvent(link.dataset.track, buildMarketingParams(link));
  });
});
