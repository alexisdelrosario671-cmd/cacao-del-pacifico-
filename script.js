/* ============================================================
   CACAO DEL PACÍFICO — script.js
   Vanilla JS, no dependencies. Organized by feature.
============================================================ */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shrink on scroll ---------- */
  const header = document.getElementById("header");
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll(".nav__link[href^='#']");
  const sections = [...navLinks].map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
  const setActiveLink = () => {
    let current = sections[0];
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => { if (sec.offsetTop <= scrollPos) current = sec; });
    navLinks.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === `#${current.id}`));
  };
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Mobile nav burger ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach(l => l.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
  }));

  /* ---------- Custom cursor ---------- */
  if (!isTouch) {
    const dot = document.querySelector(".cursor-dot");
    const glow = document.querySelector(".cursor-glow");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let gx = mx, gy = my;
    let dotScale = 1;
    window.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%) scale(${dotScale})`;
    });
    const animateGlow = () => {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();

    document.querySelectorAll("a, button, .float-card, .masonry__item").forEach(el => {
      el.addEventListener("mouseenter", () => { dotScale = 2.2; });
      el.addEventListener("mouseleave", () => { dotScale = 1; });
    });
  }

  /* ---------- Subtle particle background ---------- */
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let particles = [];
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  const initParticles = () => {
    const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.15 + 0.05,
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.5 + 0.15
    }));
  };
  const drawParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.vy; p.x += p.vx;
      if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224,190,120,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  };
  resizeCanvas(); initParticles();
  window.addEventListener("resize", () => { resizeCanvas(); initParticles(); });
  if (!prefersReducedMotion) drawParticles();

  /* ---------- Hero pod-glass parallax with cursor ---------- */
  const pod = document.getElementById("podGlass");
  if (pod && !isTouch && !prefersReducedMotion) {
    window.addEventListener("mousemove", e => {
      const relX = (e.clientX / window.innerWidth - 0.5) * 18;
      const relY = (e.clientY / window.innerHeight - 0.5) * 18;
      pod.style.transform = `translate(${relX}px, ${relY}px)`;
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Carousel ---------- */
  const track = document.getElementById("carouselTrack");
  const slides = track ? [...track.querySelectorAll(".carousel__slide")] : [];
  const dotsWrap = document.getElementById("carouselDots");
  let current = 0;
  let carouselTimer = null;

  if (slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Ir a la diapositiva ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.children];

    function goToSlide(i) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
      resetAutoplay();
    }
    function nextSlide() { goToSlide(current + 1); }
    function prevSlide() { goToSlide(current - 1); }
    function resetAutoplay() {
      clearInterval(carouselTimer);
      if (!prefersReducedMotion) carouselTimer = setInterval(nextSlide, 5500);
    }

    document.getElementById("nextArrow").addEventListener("click", nextSlide);
    document.getElementById("prevArrow").addEventListener("click", prevSlide);
    resetAutoplay();

    // Parallax on mousemove within carousel
    const carouselEl = document.getElementById("carousel");
    carouselEl.addEventListener("mousemove", e => {
      if (isTouch || prefersReducedMotion) return;
      const rect = carouselEl.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      track.style.transform = `rotateY(${px * 3}deg) rotateX(${-py * 3}deg)`;
    });
    carouselEl.addEventListener("mouseleave", () => { track.style.transform = ""; });

    // Swipe support
    let touchStartX = 0;
    track.addEventListener("touchstart", e => touchStartX = e.touches[0].clientX, { passive: true });
    track.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > 40) prevSlide(); else if (dx < -40) nextSlide();
    }, { passive: true });
  }

  /* ---------- Floating service cards — 3D tilt ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Stats counters ---------- */
  const statNumbers = document.querySelectorAll(".stat__number");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => statObserver.observe(el));

  /* ---------- Masonry lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  document.querySelectorAll(".masonry__item").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("is-open");
    });
  });
  const closeLightbox = () => lightbox.classList.remove("is-open");
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  /* ---------- Testimonials slider ---------- */
  const testiTrack = document.getElementById("testiTrack");
  const testiCards = testiTrack ? [...testiTrack.querySelectorAll(".testi__card")] : [];
  const testiDotsWrap = document.getElementById("testiDots");
  let testiCurrent = 0;

  if (testiCards.length) {
    testiCards.forEach((_, i) => {
      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("is-active");
      dot.setAttribute("aria-label", `Testimonio ${i + 1}`);
      dot.addEventListener("click", () => goToTesti(i));
      testiDotsWrap.appendChild(dot);
    });
    const testiDots = [...testiDotsWrap.children];

    function goToTesti(i) {
      testiCards[testiCurrent].classList.remove("is-active");
      testiDots[testiCurrent].classList.remove("is-active");
      testiCurrent = (i + testiCards.length) % testiCards.length;
      testiCards[testiCurrent].classList.add("is-active");
      testiDots[testiCurrent].classList.add("is-active");
    }
    if (!prefersReducedMotion) {
      setInterval(() => goToTesti(testiCurrent + 1), 6000);
    }
  }

  /* ---------- Contact form (FormSubmit AJAX, JSON, no redirect) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const toast = document.getElementById("toast");

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), 3800);
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      status.textContent = "";
      status.className = "form__status";

      const data = Object.fromEntries(new FormData(form).entries());

      try {
        // Replace with the destination email configured in FormSubmit:
        // https://formsubmit.co/tu-correo@dominio.com
        const response = await fetch("https://formsubmit.co/ajax/contacto@cacaodelpacifico.ec", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          status.textContent = "¡Mensaje enviado con éxito! Te responderemos pronto.";
          status.classList.add("is-success");
          showToast("Mensaje enviado ✔");
          form.reset();
        } else {
          throw new Error("Respuesta no válida del servidor");
        }
      } catch (err) {
        status.textContent = "No se pudo enviar el mensaje. Intenta nuevamente o escríbenos por correo.";
        status.classList.add("is-error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

})();
