/* ═══════════════════════════════════════════════
   TEETH CARE DENTAL CLINIC – JAVASCRIPT
═══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Helpers ──────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ════════════════════════════════════════════
     ENQUIRY MODAL
  ════════════════════════════════════════════ */
  const modal = $("#enquiryModal");
  const modalClose = $("#modalClose");
  const openBtns = [
    "#heroEnquiryBtn",
    "#headerApptBtn",
    "#whyUsEnquiryBtn",
    "#ctaEnquiryBtn",
  ]
    .map((id) => $(id))
    .filter(Boolean);

  function openModal() {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    modal.querySelector("input, textarea") &&
      modal.querySelector("input").focus();
  }

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  // Open on page load after short delay
  window.addEventListener("load", () => {
    setTimeout(openModal, 800);
  });

  openBtns.forEach((btn) => btn.addEventListener("click", openModal));
  modalClose.addEventListener("click", closeModal);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });

  /* ── Form Validation & Submission ─────────── */
  const form = $("#enquiryForm");
  const successMsg = $("#formSuccess");
  const errorMsg = $("#formError");
  const submitBtn = $("#enquirySubmit");

  function showFieldError(fieldId, errId, message) {
    const field = $("#" + fieldId);
    const err = $("#" + errId);
    field.classList.add("invalid");
    err.textContent = message;
  }

  function clearFieldError(fieldId, errId) {
    const field = $("#" + fieldId);
    const err = $("#" + errId);
    field.classList.remove("invalid");
    err.textContent = "";
  }

  // Live validation on blur
  $("#eName").addEventListener("blur", function () {
    if (!this.value.trim()) {
      showFieldError("eName", "eNameErr", "Please enter your full name.");
    } else {
      clearFieldError("eName", "eNameErr");
    }
  });

  $("#ePhone").addEventListener("blur", function () {
    const phone = this.value.trim();
    if (!phone) {
      showFieldError("ePhone", "ePhoneErr", "Please enter your phone number.");
    } else if (!/^[+\d\s\-()]{7,15}$/.test(phone)) {
      showFieldError(
        "ePhone",
        "ePhoneErr",
        "Please enter a valid phone number.",
      );
    } else {
      clearFieldError("ePhone", "ePhoneErr");
    }
  });

  $("#eEmail").addEventListener("blur", function () {
    const email = this.value.trim();
    if (!email) {
      showFieldError("eEmail", "eEmailErr", "Please enter your email address.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(
        "eEmail",
        "eEmailErr",
        "Please enter a valid email address.",
      );
    } else {
      clearFieldError("eEmail", "eEmailErr");
    }
  });

  function validateForm() {
    let valid = true;

    const name = $("#eName").value.trim();
    const phone = $("#ePhone").value.trim();
    const email = $("#eEmail").value.trim();

    if (!name) {
      showFieldError("eName", "eNameErr", "Please enter your full name.");
      valid = false;
    } else {
      clearFieldError("eName", "eNameErr");
    }

    if (!phone) {
      showFieldError("ePhone", "ePhoneErr", "Please enter your phone number.");
      valid = false;
    } else if (!/^[+\d\s\-()]{7,15}$/.test(phone)) {
      showFieldError(
        "ePhone",
        "ePhoneErr",
        "Please enter a valid phone number.",
      );
      valid = false;
    } else {
      clearFieldError("ePhone", "ePhoneErr");
    }

    if (!email) {
      showFieldError("eEmail", "eEmailErr", "Please enter your email address.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(
        "eEmail",
        "eEmailErr",
        "Please enter a valid email address.",
      );
      valid = false;
    } else {
      clearFieldError("eEmail", "eEmailErr");
    }

    return valid;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    successMsg.classList.add("hidden");
    errorMsg.classList.add("hidden");

    if (!validateForm()) return;

    // Disable button while submitting
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    const formData = new FormData(form);
    formData.set("form-name", form.getAttribute("name") || "enquiry");

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        form.reset();
        successMsg.classList.remove("hidden");
        // Auto-close modal after success
        setTimeout(closeModal, 3500);
      } else {
        errorMsg.classList.remove("hidden");
      }
    } catch (err) {
      console.warn("Enquiry form submission failed.", err);
      errorMsg.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Enquiry';
    }
  });

  /* ════════════════════════════════════════════
     STICKY HEADER
  ════════════════════════════════════════════ */
  const header = $("#mainHeader");

  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll-to-top button
    const scrollBtn = $("#scrollTopBtn");
    if (window.scrollY > 400) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // run once on load

  /* ════════════════════════════════════════════
     HAMBURGER MENU
  ════════════════════════════════════════════ */
  const hamburger = $("#hamburger");
  const mainNav = $("#mainNav");

  hamburger.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  // Close nav when a link is clicked
  $$("#mainNav a").forEach((link) => {
    link.addEventListener("click", () => mainNav.classList.remove("open"));
  });

  /* ════════════════════════════════════════════
     SCROLL TO TOP
  ════════════════════════════════════════════ */
  $("#scrollTopBtn").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ════════════════════════════════════════════
     ANIMATED COUNTERS (hero stats)
  ════════════════════════════════════════════ */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString();
    }, 16);
  }

  // Trigger when hero section enters viewport
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$(".stat-num").forEach(animateCounter);
          heroObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 },
  );

  const heroSection = $("#home");
  if (heroSection) heroObserver.observe(heroSection);

  /* ════════════════════════════════════════════
     TESTIMONIALS SLIDER (auto-play)
  ════════════════════════════════════════════ */
  const track = $("#testimonialsTrack");
  const dotsWrap = $("#testimonialDots");

  if (track && dotsWrap) {
    const cards = $$(".testimonial-card", track);
    let currentIdx = 0;
    let autoPlayTimer;

    // How many cards visible at once based on viewport
    function visibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    const totalSlides = Math.ceil(cards.length / visibleCount());

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = "";
      const count = Math.ceil(cards.length / visibleCount());
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("button");
        dot.className = "dot" + (i === currentIdx ? " active" : "");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function goTo(idx) {
      const count = Math.ceil(cards.length / visibleCount());
      currentIdx = (idx + count) % count;
      const cardWidth = cards[0].getBoundingClientRect().width + 24; // gap
      track.style.transform = `translateX(-${currentIdx * cardWidth * visibleCount()}px)`;
      $$(".dot", dotsWrap).forEach((d, i) =>
        d.classList.toggle("active", i === currentIdx),
      );
    }

    function next() {
      const count = Math.ceil(cards.length / visibleCount());
      goTo((currentIdx + 1) % count);
    }

    function startAutoPlay() {
      autoPlayTimer = setInterval(next, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayTimer);
    }

    buildDots();
    startAutoPlay();

    track
      .closest(".testimonials-track-wrap")
      .addEventListener("mouseenter", stopAutoPlay);
    track
      .closest(".testimonials-track-wrap")
      .addEventListener("mouseleave", startAutoPlay);

    // Touch swipe support
    let touchStartX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        const count = Math.ceil(cards.length / visibleCount());
        goTo(
          diff > 0
            ? (currentIdx + 1) % count
            : (currentIdx - 1 + count) % count,
        );
      }
    });

    window.addEventListener("resize", () => {
      buildDots();
      goTo(0);
    });
  }

  /* ════════════════════════════════════════════
     FAQ ACCORDION
  ════════════════════════════════════════════ */
  $$(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      // Close all
      $$(".faq-item.open").forEach((openItem) =>
        openItem.classList.remove("open"),
      );

      // Open clicked if it wasn't already open
      if (!isOpen) item.classList.add("open");
    });
  });

  /* ════════════════════════════════════════════
     SERVICE CARDS — SCROLL REVEAL
  ════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, parseInt(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  $$("[data-aos]").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity .6s ease, transform .6s ease";
    revealObserver.observe(el);
  });

  /* ════════════════════════════════════════════
     ACTIVE NAV LINK ON SCROLL
  ════════════════════════════════════════════ */
  const sections = $$("section[id]");
  const navLinks = $$("#mainNav a");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id,
            );
          });
        }
      });
    },
    { threshold: 0.4 },
  );

  sections.forEach((s) => sectionObserver.observe(s));
})();
