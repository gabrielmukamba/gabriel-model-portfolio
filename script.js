const WHATSAPP_NUMBER = "256727440898";
const BOOKING_EMAIL = "gabrielmukamba7@gmail.com";

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
      : `<img src="${src}" alt="${caption}">`;
  if (cap) cap.textContent = caption;
  lightbox.classList.add("open");
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile navigation toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // 2. Metric / Imperial switcher (comp card)
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

  // 2b. Comp card photo carousel (swipe + dots)
  const carousel = document.getElementById("photoCarousel");
  const dots = document.querySelectorAll("#carouselDots .dot");
  if (carousel && dots.length) {
    carousel.addEventListener("scroll", () => {
      const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    });
    dots.forEach((d, i) => d.addEventListener("click", () => {
      carousel.scrollTo({ left: i * carousel.clientWidth, behavior: "smooth" });
    }));
  }

  // 3. Lookbook gallery (lookbook.html)
  const fullPhotoGrid = document.getElementById("fullPhotoGrid");
  if (fullPhotoGrid) {
    const photos = [
      { src: "images/hero-1.jpg", cat: "featured", tag: "SIGNATURE HERO 01", title: "Main Editorial Frame" },
      { src: "images/hero-2.jpg", cat: "featured", tag: "SIGNATURE HERO 02", title: "Comp Card Portrait" },
      { src: "images/logo.png", cat: "branding", tag: "BRAND IDENTITY", title: "Gabriel Mukamba Official Logo" }
    ];

    for (let i = 1; i <= 22; i++) {
      const num = String(i).padStart(2, "0");
      const category = i <= 11 ? "runway" : "editorial";
      const label = category === "runway" ? "MR. IUEA & STAGE" : "EDITORIAL & COMMERCIAL";
      photos.push({ src: `images/photo-${num}.jpg`, cat: category, tag: label, title: `Portfolio Frame ${num}` });
    }

    fullPhotoGrid.innerHTML = "";
    photos.forEach((item) => {
      const card = document.createElement("div");
      card.className = "media-card";
      card.dataset.category = item.cat;
      card.innerHTML = `
        <img src="${item.src}" alt="${item.title}" loading="lazy">
        <div class="media-overlay"><span>${item.tag}</span><h4>${item.title}</h4></div>`;
      // If a photo file is missing, remove its card instead of showing a broken image
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

  // 4. Lightbox close handlers
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

  // 5. Booking form: WhatsApp & Email (contact.html)
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
});