function getSplitWaterHeroMetrics(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  return {
    dpr,
    width,
    height,
    originX: width * (width < 700 ? 0.5 : 0.64),
    originY: height * (width < 700 ? 0.48 : 0.43),
    waterlineY: height * (width < 700 ? 0.48 : 0.43),
  };
}

function drawSplitWaterHeroContours(ctx, metrics, scanProgress) {
  const { width, height, originX, waterlineY } = metrics;
  const underwaterTop = waterlineY + height * 0.04;
  const reveal = Math.min(1, Math.max(0, scanProgress * 1.35));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, waterlineY, width, height - waterlineY);
  ctx.clip();

  for (let i = 0; i < 5; i += 1) {
    const y = underwaterTop + height * (0.18 + i * 0.075);
    const alpha = (0.12 + i * 0.035) * reveal;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(193, 229, 78, ${alpha})`;
    ctx.lineWidth = 1;

    for (let x = width * 0.28; x <= width * 1.02; x += 18) {
      const wave = Math.sin(x * 0.014 + i * 1.7) * (10 + i * 3);
      const slope = (x - originX) * 0.05;
      const pointY = y + wave + slope;
      if (x === width * 0.28) {
        ctx.moveTo(x, pointY);
      } else {
        ctx.lineTo(x, pointY);
      }
    }

    ctx.stroke();
  }

  ctx.restore();
}

function drawSplitWaterHeroFrame(ctx, metrics, elapsed) {
  const { width, height, originX, originY, waterlineY } = metrics;
  const cycle = 4200;
  const progress = (elapsed % cycle) / cycle;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, waterlineY, width, height - waterlineY);
  ctx.clip();

  const maxRadius = Math.max(width, height) * 0.52;
  for (let i = 0; i < 3; i += 1) {
    const pulseProgress = (progress + i / 3) % 1;
    const radius = maxRadius * pulseProgress;
    const alpha = Math.max(0, 0.34 * (1 - pulseProgress));

    ctx.beginPath();
    ctx.arc(originX, originY, radius, 0.18 * Math.PI, 0.86 * Math.PI);
    ctx.strokeStyle = `rgba(193, 229, 78, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + Math.cos(0.28 * Math.PI) * radius, originY + Math.sin(0.28 * Math.PI) * radius);
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + Math.cos(0.78 * Math.PI) * radius, originY + Math.sin(0.78 * Math.PI) * radius);
    ctx.strokeStyle = `rgba(62, 215, 232, ${alpha * 0.56})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const beam = ctx.createRadialGradient(originX, originY, 0, originX, originY, maxRadius * 0.82);
  beam.addColorStop(0, "rgba(193, 229, 78, 0.16)");
  beam.addColorStop(0.42, "rgba(62, 215, 232, 0.07)");
  beam.addColorStop(1, "rgba(193, 229, 78, 0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.arc(originX, originY, maxRadius * 0.82, 0.22 * Math.PI, 0.82 * Math.PI);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  drawSplitWaterHeroContours(ctx, metrics, progress);
}

function initSplitWaterHero(root = document) {
  const heroes = [...root.querySelectorAll("[data-split-water-hero]")];
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
  if (!heroes.length || reducedMotion) return;

  heroes.forEach((hero) => {
    const canvas = hero.querySelector("[data-split-water-canvas]");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let metrics = getSplitWaterHeroMetrics(canvas);
    let animationFrame = 0;
    let running = true;
    let startedAt = performance.now();

    function resizeCanvas() {
      metrics = getSplitWaterHeroMetrics(canvas);
      ctx.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
    }

    function frame(now) {
      if (!running) return;
      drawSplitWaterHeroFrame(ctx, metrics, now - startedAt);
      animationFrame = window.requestAnimationFrame(frame);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          startedAt = performance.now();
          window.cancelAnimationFrame(animationFrame);
          animationFrame = window.requestAnimationFrame(frame);
        } else {
          window.cancelAnimationFrame(animationFrame);
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(hero);
    animationFrame = window.requestAnimationFrame(frame);
  });
}

initSplitWaterHero();

window.KastaveSplitWaterHero = {
  initSplitWaterHero,
  drawSplitWaterHeroFrame,
};
