const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const starfield = document.querySelector('.starfield');
const starContext = starfield?.getContext('2d');

if (starfield && starContext) {
  const stars = Array.from({ length: 105 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.25 + 0.25,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.0008 + 0.00025,
  }));
  let fieldWidth = 0;
  let fieldHeight = 0;
  let fieldScale = 1;
  let starFrame = 0;
  let lastStreak = 0;
  let streak = null;

  const resizeStarfield = () => {
    fieldScale = Math.min(window.devicePixelRatio || 1, 1.5);
    fieldWidth = window.innerWidth;
    fieldHeight = window.innerHeight;
    starfield.width = Math.round(fieldWidth * fieldScale);
    starfield.height = Math.round(fieldHeight * fieldScale);
    starContext.setTransform(fieldScale, 0, 0, fieldScale, 0, 0);
  };

  const drawStarfield = (time) => {
    starContext.clearRect(0, 0, fieldWidth, fieldHeight);
    stars.forEach((star) => {
      const opacity = 0.2 + (Math.sin(time * star.speed + star.phase) + 1) * 0.28;
      starContext.beginPath();
      starContext.fillStyle = `rgba(184, 205, 255, ${opacity})`;
      starContext.arc(star.x * fieldWidth, star.y * fieldHeight, star.size, 0, Math.PI * 2);
      starContext.fill();
    });

    if (!reduceMotion && time - lastStreak > 6200) {
      streak = { x: Math.random() * fieldWidth * 0.75, y: Math.random() * fieldHeight * 0.38, start: time };
      lastStreak = time;
    }
    if (streak) {
      const progress = (time - streak.start) / 720;
      if (progress < 1) {
        const x = streak.x + progress * 190;
        const y = streak.y + progress * 105;
        const trail = starContext.createLinearGradient(x - 90, y - 50, x, y);
        trail.addColorStop(0, 'rgba(117, 226, 248, 0)');
        trail.addColorStop(1, `rgba(160, 194, 255, ${Math.sin(progress * Math.PI) * 0.8})`);
        starContext.strokeStyle = trail;
        starContext.lineWidth = 1.2;
        starContext.beginPath();
        starContext.moveTo(x - 90, y - 50);
        starContext.lineTo(x, y);
        starContext.stroke();
      } else streak = null;
    }
    if (!reduceMotion) starFrame = window.requestAnimationFrame(drawStarfield);
  };

  window.addEventListener('resize', resizeStarfield, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(starFrame);
      starFrame = 0;
    } else if (!reduceMotion && !starFrame) {
      starFrame = window.requestAnimationFrame(drawStarfield);
    }
  });
  resizeStarfield();
  drawStarfield(0);
}

const progressBar = document.querySelector('.scroll-progress span');
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!progressBar || scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
    scrollTicking = false;
  });
}, { passive: true });

const hero = document.querySelector('.hero');
hero?.addEventListener('pointermove', (event) => {
  const bounds = hero.getBoundingClientRect();
  hero.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`);
  hero.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`);
});

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.add('is-tilting');
    panel.addEventListener('pointermove', (event) => {
      const bounds = panel.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      panel.style.setProperty('--pointer-x', `${x * 100}%`);
      panel.style.setProperty('--pointer-y', `${y * 100}%`);
      panel.style.setProperty('--tilt-x', `${(x - 0.5) * 3}deg`);
      panel.style.setProperty('--tilt-y', `${(0.5 - y) * 3}deg`);
    });
    panel.addEventListener('pointerleave', () => {
      panel.style.setProperty('--tilt-x', '0deg');
      panel.style.setProperty('--tilt-y', '0deg');
      panel.style.setProperty('--pointer-x', '50%');
      panel.style.setProperty('--pointer-y', '50%');
    });
  });
}

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const copyButton = document.querySelector('[data-copy-email]');
const copyLabel = document.querySelector('[data-copy-label]');

copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('wenshunze@gmail.com');
  } catch {
    const fallback = document.createElement('textarea');
    fallback.value = 'wenshunze@gmail.com';
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.opacity = '0';
    document.body.append(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
  }
  copyLabel.textContent = '已复制';
  copyButton.classList.add('is-copied');
  window.setTimeout(() => {
    copyLabel.textContent = '复制邮箱';
    copyButton.classList.remove('is-copied');
  }, 1800);
});

const canvas = document.querySelector('#globe');
const context = canvas?.getContext('2d');

if (canvas && context) {
  const points = [];
  const pointCount = 620;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < pointCount; index += 1) {
    const y = 1 - (index / (pointCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    points.push({ x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius });
  }

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let isInView = true;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const drawGlobe = (time) => {
    if (!isInView && !reduceMotion) {
      frame = 0;
      return;
    }
    context.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2 - 1;
    const radius = Math.min(width * 0.34, height * 0.43, 91);
    const rotation = (reduceMotion ? 0 : time * 0.00016) + pointerX * 0.22;
    const tilt = -0.28 + pointerY * 0.12;
    const sinRotation = Math.sin(rotation);
    const cosRotation = Math.cos(rotation);
    const sinTilt = Math.sin(tilt);
    const cosTilt = Math.cos(tilt);

    const atmosphere = context.createRadialGradient(centerX, centerY, radius * 0.25, centerX, centerY, radius * 1.28);
    atmosphere.addColorStop(0, 'rgba(53, 124, 255, 0.20)');
    atmosphere.addColorStop(0.72, 'rgba(68, 92, 220, 0.09)');
    atmosphere.addColorStop(1, 'rgba(81, 111, 255, 0)');
    context.fillStyle = atmosphere;
    context.beginPath();
    context.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
    context.fill();

    const projected = points.map((point) => {
      const x = point.x * cosRotation - point.z * sinRotation;
      const z = point.x * sinRotation + point.z * cosRotation;
      const y = point.y * cosTilt - z * sinTilt;
      const depth = point.y * sinTilt + z * cosTilt;
      const perspective = 1 / (1.22 - depth * 0.17);
      return { x: centerX + x * radius * perspective, y: centerY + y * radius * perspective, depth };
    }).sort((a, b) => a.depth - b.depth);

    projected.forEach((point) => {
      const front = (point.depth + 1) / 2;
      const dotRadius = 0.45 + front * 0.85;
      context.beginPath();
      context.fillStyle = `rgba(${Math.round(93 + front * 39)}, ${Math.round(137 + front * 85)}, 255, ${0.12 + front * 0.76})`;
      context.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
      context.fill();
    });

    context.save();
    context.translate(centerX, centerY);
    context.rotate(tilt);
    context.strokeStyle = 'rgba(135, 164, 255, 0.16)';
    context.lineWidth = 0.7;
    for (const scale of [0.34, 0.68, 1]) {
      context.beginPath();
      context.ellipse(0, 0, radius * scale, radius, 0, 0, Math.PI * 2);
      context.stroke();
    }
    context.beginPath();
    context.ellipse(0, 0, radius, radius * 0.37, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    if (!reduceMotion) frame = window.requestAnimationFrame(drawGlobe);
  };

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  canvas.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
  });
  window.addEventListener('resize', resizeCanvas, { passive: true });

  if ('IntersectionObserver' in window) {
    const globeObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      if (isInView && !frame) frame = window.requestAnimationFrame(drawGlobe);
    }, { threshold: 0.05 });
    globeObserver.observe(canvas);
  }

  resizeCanvas();
  frame = window.requestAnimationFrame(drawGlobe);
}
