const WHATSAPP_NUMBER = "256727440898";
const BOOKING_EMAIL = "gabrielmukamba7@gmail.com";

// Curated text for the first reels; any extra video gets an automatic title
const REEL_INFO = {
  "featured-1.mp4": ["SIGNATURE RUNWAY", "Main Stage Walk & Posture", "Captured during live runway presentation. Highlights measured pacing, shoulder alignment, eye-line focus, and confident turns at the end of the catwalk."],
  "featured-2.mp4": ["COMMERCIAL MOTION", "Editorial & Tailored Menswear Reel", "Demonstrates natural movement in formalwear and sharp transitions suited for luxury menswear lookbooks and brand commercials."],
  "video-01.mp4": ["MR. IUEA 2026", "Stage Leadership & Introduction", "Combining modeling poise with public speaking clarity, reflecting my background as a communication instructor and Candidate #8 at Mr. IUEA 2026."],
  "video-02.mp4": ["CONTEMPORARY STYLE", "Urban & Lifestyle Showcase", "Versatile casual and contemporary styling aimed at youth culture, lifestyle brands, and digital campaigns."],
  "video-03.mp4": ["BEHIND THE SCENES", "Preparation, Discipline & Backstage Focus", "A look into rehearsal discipline, fitting precision, and readiness before stepping under stage lights."],
  "video-04.mp4": ["EXPRESSIVE PORTRAIT", "Close-Up Camera Presence", "Focused facial angles, strong jawline framing, and calm intensity designed for beauty, eyewear, and portrait campaigns."]
};

let MEDIA = null;   // filled from media.json (made by build_media.py)
const hasMedia = () => MEDIA && Array.isArray(MEDIA.photos) && MEDIA.photos.length > 0;
const hasVideos = () => MEDIA && Array.isArray(MEDIA.videos) && MEDIA.videos.length > 0;

// Replace the first number inside matching elements, e.g. "Lookbook (24)" -> "Lookbook (48)"
function setCount(selector, n) {
  document.querySelectorAll(selector).forEach((el) => {
    if (/\d+/.test(el.textContent)) el.textContent = el.textContent.replace(/\d+/, n);
  });
}

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const body = document.getElementById("lightboxBody");
  if (lightbox) lightbox.classList.remove("open");
  if (body) body.innerHTML = "";
}

function openMedia(type, src, caption) {
  const lightbox = document.getElementById("lightbox");
  const body = document.getElementById("lightboxBody");
  const cap = document.getElementById("lightboxCaption");
  if (!lightbox || !body) return;

  body.innerHTML =
    type === "video"
      ? `<video src="${src}" controls autoplay playsinline></video>`
      : `<img src="${src}" alt="${esc(caption)}">`;
  if (cap) cap.textContent = caption;
  lightbox.classList.add("open");
}

function init() {
  // 1. Mobile navigation toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // 2. Live counts (photos / videos) from media.json
  if (hasMedia()) {
    const p = MEDIA.photos.length;
    setCount('.links a[href="lookbook.html"]', p);
    setCount('.hero-actions a[href="lookbook.html"]', p);
    setCount('.explore-card[href="lookbook.html"] p', p);
    setCount('.filter-btn[data-filter="all"]', p);
    if (document.getElementById("fullPhotoGrid")) setCount(".page-banner .lead", p);
  }
  if (hasVideos()) {
    const v = MEDIA.videos.length;
    setCount('.links a[href="reels.html"]', v);
    setCount('.hero-actions a[href="reels.html"]', v);
    setCount(".center-cta a", v);
    if (document.querySelector(".reels-showcase-list")) setCount(".page-banner .lead", v);
  }

  // 3. Metric / Imperial switcher (comp card)
  const unitButtons = document.querySelectorAll(".unit-btn");
  const statValues = document.querySelectorAll(".stat-val[data-metric]");
  unitButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      unitButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const unit = btn.dataset.unit;
      statValues.forEach((val) => {
        val.textContent = unit === "imperial" ? val.dataset.imperial : val.dataset.metric;
      });
    });
  });

  // 4. Comp card photo carousel (swipe + dots)
  const carousel = document.getElementById("photoCarousel");
  const dots = document.querySelectorAll("#carouselDots .dot");
  if (carousel && dots.length) {
    carousel.addEventListener("scroll", () => {
      const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    });
    dots.forEach((d, i) =>
      d.addEventListener("click", () =>
        carousel.scrollTo({ left: i * carousel.clientWidth, behavior: "smooth" })
      )
    );
  }

  // 5. Lookbook gallery (lookbook.html) - every picture listed in media.js
  const fullPhotoGrid = document.getElementById("fullPhotoGrid");
  if (fullPhotoGrid) {
    let photos;
    if (hasMedia()) {
      photos = MEDIA.photos;
    } else {
      photos = [
        { src: "images/hero-1.jpg", cat: "featured", tag: "SIGNATURE HERO 01", title: "Main Editorial Frame" },
        { src: "images/hero-2.jpg", cat: "featured", tag: "SIGNATURE HERO 02", title: "Comp Card Portrait" },
        { src: "images/logo.png", cat: "branding", tag: "BRAND IDENTITY", title: "Gabriel Mukamba Official Logo" }
      ];
      for (let i = 1; i <= 22; i++) {
        const num = String(i).padStart(2, "0");
        const category = i <= 11 ? "runway" : "editorial";
        photos.push({
          src: `images/photo-${num}.jpg`, cat: category,
          tag: category === "runway" ? "MR. IUEA & STAGE" : "EDITORIAL & COMMERCIAL",
          title: `Portfolio Frame ${num}`
        });
      }
    }

    fullPhotoGrid.innerHTML = "";
    photos.forEach((item) => {
      const card = document.createElement("div");
      card.className = "media-card";
      card.dataset.category = item.cat;
      card.innerHTML = `
        <img src="${item.src}" alt="${esc(item.title)}" loading="lazy">
        <div class="media-overlay"><span>${esc(item.tag)}</span><h4>${esc(item.title)}</h4></div>`;
      card.querySelector("img").addEventListener("error", () => card.remove());
      card.addEventListener("click", () => openMedia("image", item.src, item.title));
      fullPhotoGrid.appendChild(card);
    });

    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        fullPhotoGrid.querySelectorAll(".media-card").forEach((card) => {
          card.style.display = filter === "all" || card.dataset.category === filter ? "block" : "none";
        });
      });
    });
  }

  // 6. Reels page (reels.html) - every video listed in media.js
  const reelsList = document.querySelector(".reels-showcase-list");
  if (reelsList && hasVideos()) {
    reelsList.innerHTML = MEDIA.videos
      .map((v, i) => {
        const num = String(i + 1).padStart(2, "0");
        const info = REEL_INFO[v.name] || [
          "RUNWAY & MOTION",
          `Runway & Motion Reel ${num}`,
          "More runway, editorial and campaign footage from my portfolio."
        ];
        return `
        <article class="reel-row">
          <video controls playsinline preload="metadata" src="${v.src}#t=0.1"></video>
          <div class="reel-text">
            <span class="kicker">REEL ${num} &bull; ${esc(info[0])}</span>
            <h3>${esc(info[1])}</h3>
            <p>${esc(info[2])}</p>
          </div>
        </article>`;
      })
      .join("");
  }

  // 7. Lightbox close handlers
  const lightbox = document.getElementById("lightbox");
  const lightboxClose = document.getElementById("lightboxClose");
  if (lightbox && lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  // 8. Booking form: WhatsApp & Email (contact.html)
  const bookingForm = document.getElementById("bookingForm");
  const emailBtn = document.getElementById("emailBtn");
  if (bookingForm) {
    const buildInquiry = () => {
      const name = document.getElementById("clientName").value.trim();
      const type = document.getElementById("bookingType").value;
      const details = document.getElementById("bookingDetails").value.trim();
      return {
        type,
        text: `Hello Gabriel Mukamba,\n\nName / Agency / Brand: ${name}\nInquiry Type: ${type}\nDetails: ${details}`
      };
    };

    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = buildInquiry();
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg.text)}`, "_blank", "noopener");
    });

    if (emailBtn) {
      emailBtn.addEventListener("click", () => {
        if (!bookingForm.reportValidity()) return;
        const msg = buildInquiry();
        window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent("Booking Inquiry: " + msg.type)}&body=${encodeURIComponent(msg.text)}`;
      });
    }
  }
}

// Load the media list first (if media.json exists), then build the pages
fetch("media.json", { cache: "no-store" })
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null)
  .then((data) => {
    MEDIA = data;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  });