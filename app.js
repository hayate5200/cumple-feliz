(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mainGift = document.getElementById('mainGift');
  const welcome = document.querySelector('.welcome');
  const giftModal = document.getElementById('giftModal');
  const modalPanel = giftModal.querySelector('.modal__panel');
  const birthdaySong = document.getElementById('birthdaySong');
  const musicToggle = document.getElementById('musicToggle');
  const musicLabel = document.getElementById('musicLabel');
  const statusMessage = document.getElementById('statusMessage');
  const closeTargets = giftModal.querySelectorAll('[data-close="true"]');
  let lastFocusedElement = null;

  function announce(message) {
    statusMessage.textContent = '';
    window.setTimeout(() => { statusMessage.textContent = message; }, 30);
  }

  function updateMusicControl(isPlaying) {
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicLabel.textContent = isPlaying ? 'Pausar canción' : 'Reproducir canción';
  }

  async function playSong() {
    try {
      await birthdaySong.play();
      updateMusicControl(true);
    } catch {
      updateMusicControl(false);
      announce('Puedes iniciar la canción con el botón de música.');
    }
  }

  function pauseSong() {
    birthdaySong.pause();
    updateMusicControl(false);
  }

  function launchSparkles() {
    if (reducedMotion.matches) return;
    const colors = ['#d85482', '#f3a7c4', '#fff7d8', '#ffffff', '#b55c82'];
    for (let index = 0; index < 42; index += 1) {
      const spark = document.createElement('i');
      spark.className = 'spark';
      spark.style.left = `${Math.random() * 100}vw`;
      spark.style.top = `${-10 - Math.random() * 25}px`;
      spark.style.background = colors[index % colors.length];
      spark.style.setProperty('--drift', `${Math.random() * 140 - 70}px`);
      spark.style.animationDelay = `${Math.random() * .35}s`;
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 2000);
    }
  }

  function openModal() {
    lastFocusedElement = document.activeElement;
    giftModal.setAttribute('aria-hidden', 'false');
    welcome.inert = true;
    document.body.classList.add('modal-open');
    modalPanel.focus({ preventScroll: true });
    launchSparkles();
    birthdaySong.currentTime = 0;
    playSong();
    announce('Sorpresa abierta.');
  }

  function closeModal() {
    pauseSong();
    giftModal.setAttribute('aria-hidden', 'true');
    welcome.inert = false;
    document.body.classList.remove('modal-open');
    if (lastFocusedElement) lastFocusedElement.focus({ preventScroll: true });
    lastFocusedElement = null;
    announce('Sorpresa cerrada.');
  }

  function toggleMusic() {
    if (birthdaySong.paused) playSong();
    else pauseSong();
  }

  function keepFocusInModal(event) {
    if (event.key !== 'Tab' || giftModal.getAttribute('aria-hidden') === 'true') return;
    const focusable = [...giftModal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!focusable.includes(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  mainGift.addEventListener('click', openModal);
  musicToggle.addEventListener('click', toggleMusic);
  birthdaySong.addEventListener('play', () => updateMusicControl(true));
  birthdaySong.addEventListener('pause', () => updateMusicControl(false));
  birthdaySong.addEventListener('error', () => {
    updateMusicControl(false);
    announce('No se pudo cargar la canción. Revisa tu conexión a Internet.');
  });
  birthdaySong.addEventListener('ended', () => updateMusicControl(false));
  closeTargets.forEach((target) => target.addEventListener('click', closeModal));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && giftModal.getAttribute('aria-hidden') === 'false') closeModal();
    keepFocusInModal(event);
  });

  const canvas = document.getElementById('stars');
  const context = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = 0;
  const random = (min, max) => min + Math.random() * (max - min);

  function createParticle() {
    return {
      x: random(0, width), y: random(0, height), radius: random(.7, 2.2),
      phase: random(0, Math.PI * 2), speed: random(.7, 1.8),
      vx: random(-.06, .06), vy: random(-.05, .05)
    };
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(55, Math.min(150, Math.floor((width * height) / 13500)));
    particles = Array.from({ length: count }, createParticle);
  }

  function drawParticles(time) {
    context.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.x = (particle.x + particle.vx + width) % width;
      particle.y = (particle.y + particle.vy + height) % height;
      const glow = (Math.sin(time / 1000 * particle.speed + particle.phase) + 1) / 2;
      const alpha = .18 + glow * .55;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(190, 70, 115, ${alpha})`;
      context.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      context.shadowBlur = 9;
      context.fill();
    });
    animationId = window.requestAnimationFrame(drawParticles);
  }

  function setMotion() {
    window.cancelAnimationFrame(animationId);
    context.clearRect(0, 0, width, height);
    if (!reducedMotion.matches) animationId = window.requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  setMotion();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  reducedMotion.addEventListener?.('change', setMotion);
})();
