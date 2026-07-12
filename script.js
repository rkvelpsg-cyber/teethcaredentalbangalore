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

  const whatsappNumber = "919663252315";

  function buildWhatsAppUrl() {
    const name = $("#eName").value.trim();
    const phone = $("#ePhone").value.trim();
    const email = $("#eEmail").value.trim();
    const message = $("#eMessage").value.trim();

    const whatsappMessage = [
      "Hello ASIAN DENTAL CLINIC,",
      "I would like to book a consultation.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      message ? `Message: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage,
    )}`;
  }

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
    submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Opening WhatsApp…';

    try {
      const whatsappUrl = buildWhatsAppUrl();
      const whatsappWindow = window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );
      if (!whatsappWindow) {
        errorMsg.textContent =
          "Your browser blocked the WhatsApp tab. Please allow pop-ups and try again.";
        errorMsg.classList.remove("hidden");
        return;
      }
      form.reset();
      successMsg.innerHTML =
        '<i class="fab fa-whatsapp"></i> WhatsApp opened in a new tab. Please send the message to complete the enquiry.';
      successMsg.classList.remove("hidden");
      setTimeout(closeModal, 3500);
    } catch (err) {
      console.warn("WhatsApp enquiry handoff failed.", err);
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

  // Close menu when tapping outside on mobile/tablet
  document.addEventListener("click", (event) => {
    const clickedInsideNav = mainNav.contains(event.target);
    const clickedHamburger = hamburger.contains(event.target);

    if (!clickedInsideNav && !clickedHamburger) {
      mainNav.classList.remove("open");
    }
  });

  // Ensure nav resets to desktop state after orientation or width changes
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      mainNav.classList.remove("open");
    }
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
     BIO EXPAND / COLLAPSE
  ════════════════════════════════════════════ */
  $$("[data-target]").forEach((btn) => {
    if (!btn.classList.contains("bio-expand-btn")) return;
    btn.addEventListener("click", () => {
      const bio = document.getElementById(btn.dataset.target);
      if (!bio) return;
      const isOpen = bio.classList.toggle("expanded");
      btn.classList.toggle("open", isOpen);
      btn.innerHTML = isOpen
        ? 'Show Less <i class="fas fa-chevron-up"></i>'
        : 'Explore More <i class="fas fa-chevron-down"></i>';
    });
  });

  /* ════════════════════════════════════════════
     GALLERY CAROUSEL AUTO-SCROLL (Parabolic)
  ════════════════════════════════════════════ */
  const galleryTrack = $("#galleryTrack");
  const galleryWrap = $("#galleryCarousel");

  if (galleryTrack && galleryWrap) {
    const items = $$(".gallery-item", galleryTrack);
    const total = items.length;

    if (total > 0) {
      let activeIndex = 0;
      let autoTimer = null;

      function normalize(index) {
        return (index + total) % total;
      }

      function paintPositions() {
        items.forEach((item) => {
          item.classList.remove(
            "is-center",
            "is-left",
            "is-right",
            "is-far-left",
            "is-far-right",
            "is-hidden",
          );
          item.classList.add("is-hidden");
        });

        const applyRole = (idx, roleClass) => {
          const item = items[normalize(idx)];
          if (!item) return;
          item.classList.remove("is-hidden");
          item.classList.add(roleClass);
        };

        applyRole(activeIndex, "is-center");
        applyRole(activeIndex - 1, "is-left");
        applyRole(activeIndex + 1, "is-right");
        applyRole(activeIndex - 2, "is-far-left");
        applyRole(activeIndex + 2, "is-far-right");
      }

      function nextSlide() {
        activeIndex = normalize(activeIndex + 1);
        paintPositions();
      }

      function prevSlide() {
        activeIndex = normalize(activeIndex - 1);
        paintPositions();
      }

      function startAuto() {
        if (autoTimer) return;
        autoTimer = setInterval(nextSlide, 2600);
      }

      function stopAuto() {
        if (!autoTimer) return;
        clearInterval(autoTimer);
        autoTimer = null;
      }

      items.forEach((item, idx) => {
        item.addEventListener("click", () => {
          if (
            item.classList.contains("is-left") ||
            item.classList.contains("is-far-left")
          ) {
            prevSlide();
            return;
          }
          if (
            item.classList.contains("is-right") ||
            item.classList.contains("is-far-right")
          ) {
            nextSlide();
            return;
          }
          activeIndex = idx;
          paintPositions();
        });
      });

      galleryWrap.addEventListener("mouseenter", stopAuto);
      galleryWrap.addEventListener("mouseleave", startAuto);

      paintPositions();
      startAuto();
    }
  }

  /* ════════════════════════════════════════════
     TESTIMONIALS SLIDER (auto-play)
  ════════════════════════════════════════════ */
  const track = $("#testimonialsTrack");
  const dotsWrap = $("#testimonialDots");

  if (track && dotsWrap) {
    const cards = $$(".testimonial-card", track);
    let currentIdx = 0;
    let autoPlayTimer;

    const total = cards.length;

    function setCardWidths() {
      const wrapWidth = track.parentElement.offsetWidth;
      cards.forEach((card) => {
        card.style.width = wrapWidth + "px";
      });
    }

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const dot = document.createElement("button");
        dot.className = "dot" + (i === currentIdx ? " active" : "");
        dot.setAttribute("aria-label", `Go to review ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function goTo(idx) {
      currentIdx = (idx + total) % total;
      const wrapWidth = track.parentElement.offsetWidth;
      track.style.transform = `translateX(-${currentIdx * wrapWidth}px)`;
      $$(".dot", dotsWrap).forEach((d, i) =>
        d.classList.toggle("active", i === currentIdx),
      );
    }

    function next() {
      goTo(currentIdx + 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(next, 5000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayTimer);
    }

    setCardWidths();
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
        goTo(diff > 0 ? currentIdx + 1 : currentIdx - 1);
      }
    });

    window.addEventListener("resize", () => {
      setCardWidths();
      goTo(currentIdx);
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
