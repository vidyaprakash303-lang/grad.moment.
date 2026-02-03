const CONTENT_KEY = "gm_content_v1";

async function loadContent() {
  const local = localStorage.getItem(CONTENT_KEY);
  if (local) { try { return JSON.parse(local); } catch(e) {} }
  const res = await fetch("data/content.json", { cache: "no-store" });
  return await res.json();
}

function $(sel) { return document.querySelector(sel); }
function setText(sel, value) { const el = $(sel); if (el) el.textContent = value ?? ""; }

function formatDateISO(iso){
  try{ return new Date(iso).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"2-digit"}); }
  catch(e){ return iso; }
}

function buildTickIcon(){
  return `<span class="tick" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </span>`;
}

function initRotatingWord(words){
  const el = document.getElementById("changing-text");
  if (!el || !Array.isArray(words) || !words.length) return;
  let i = 0;
  el.textContent = words[0];
  setInterval(() => {
    el.style.opacity = 0;
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.style.opacity = 1;
    }, 350);
  }, 2100);
}

function mountWhatsApp(number){
  const btn = document.getElementById("whatsappFab");
  if(!btn || !number) return;
  btn.addEventListener("click", () => {
    const msg = encodeURIComponent("Hi Grand Moments! I want to enquire about availability and packages.");
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank", "noopener,noreferrer");
  });
}

function hydrateCommon(content){
  const brand = content.brand || {};
  setText("#brandName", brand.name || "Grand Moments");
  setText("#brandName2", brand.name || "Grand Moments");
  setText("#tagline", brand.tagline || "");
  setText("#contactPhone", brand.phone || "");
  setText("#contactEmail", brand.contactEmail || "");
  setText("#contactAddress", brand.address || "");
  const map = document.getElementById("mapEmbed");
  if(map && brand.mapEmbedUrl) map.src = brand.mapEmbedUrl;
  mountWhatsApp(brand.whatsappNumber);
}

function hydrateAmenities(content){
  const ul = document.getElementById("amenitiesList");
  if(ul && Array.isArray(content.amenities)){
    ul.innerHTML = content.amenities.map(a => `<li>${buildTickIcon()}<span>${a}</span></li>`).join("");
  }
}

function hydrateHome(content){
  const hero = content.hero || {};
  setText("#heroPrefix", hero.headlinePrefix || "Celebrating");
  setText("#heroSubcopy", hero.subcopy || "");
  setText("#primaryCtaText", content.brand?.primaryCta || "Reserve Your Date");
  initRotatingWord(hero.rotatingWords || []);
  hydrateAmenities(content);

  const wrap = document.getElementById("packagesPreview");
  if(wrap && Array.isArray(content.packages)){
    wrap.innerHTML = content.packages.slice(0,3).map(p => `
      <div class="card soft">
        <div class="package-name"><h3>${p.name}</h3><span class="pill">Popular</span></div>
        <div class="price">${p.price}</div>
        <div class="small">${p.notes || ""}</div>
        <ul class="amenities">
          ${(p.includes || []).slice(0,4).map(x => `<li>${buildTickIcon()}<span>${x}</span></li>`).join("")}
        </ul>
        <div class="btn-row">
          <a class="btn-outline" href="packages.html">View details</a>
          <a class="btn-outline" href="booking.html">Enquire</a>
        </div>
      </div>
    `).join("");
  }

  const t = document.getElementById("testimonialCards");
  if(t && Array.isArray(content.testimonials)){
    t.innerHTML = content.testimonials.slice(0,3).map(x => `
      <div class="card">
        <div class="pill">★ Review</div>
        <p style="margin:12px 0 0; color:var(--muted)">“${x.text}”</p>
        <div style="margin-top:12px; font-weight:700">${x.name}</div>
      </div>
    `).join("");
  }
}

function hydratePackages(content){
  const wrap = document.getElementById("packagesFull");
  if(wrap && Array.isArray(content.packages)){
    wrap.innerHTML = content.packages.map(p => `
      <div class="card soft">
        <div class="package-name"><h3>${p.name}</h3><span class="pill">Package</span></div>
        <div class="price">${p.price}</div>
        <div class="small">${p.notes || ""}</div>
        <ul class="amenities">
          ${(p.includes || []).map(x => `<li>${buildTickIcon()}<span>${x}</span></li>`).join("")}
        </ul>
        <div class="btn-row">
          <a class="primary-btn" href="booking.html">Book / Enquire</a>
          <a class="btn-outline" href="contact.html">Talk to us</a>
        </div>
      </div>
    `).join("");
  }
}

function hydrateFAQ(content){
  const wrap = document.getElementById("faqList");
  if(wrap && Array.isArray(content.faq)){
    wrap.innerHTML = content.faq.map((x, idx) => `
      <details class="card" ${idx===0 ? "open" : ""} style="padding:18px 18px;">
        <summary style="cursor:pointer; font-weight:700">${x.q}</summary>
        <div style="margin-top:10px; color:var(--muted)">${x.a}</div>
      </details>
    `).join("");
  }
}

function hydrateBlog(content){
  const grid = document.getElementById("blogGrid");
  const posts = content.blog?.posts || [];
  if(grid && Array.isArray(posts)){
    grid.innerHTML = posts.map(p => `
      <article class="card blog-card">
        <div class="blog-meta">${formatDateISO(p.date)}</div>
        <h3><a href="post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a></h3>
        <p>${p.excerpt || ""}</p>
        <div class="btn-row" style="margin-top:16px">
          <a class="btn-outline" href="post.html?slug=${encodeURIComponent(p.slug)}">Read</a>
        </div>
      </article>
    `).join("");
  }
}

async function hydratePost(content){
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  if(!slug) return;
  const post = (content.blog?.posts || []).find(p => p.slug === slug);
  setText("#postTitle", post ? post.title : "Post not found");
  setText("#postDate", post ? formatDateISO(post.date) : "");
  const body = document.getElementById("postBody");
  if(!body) return;
  if(!post){
    body.innerHTML = `<div class="notice error">This post was not found. Go back to <a href="blog.html">Blog</a>.</div>`;
    return;
  }
  body.innerHTML = `
    <div class="notice">Tip: You can edit blog content in <b>Admin</b> and publish via local storage (demo CMS).</div>
    <p style="color:var(--muted); margin-top:14px">${post.excerpt}</p>
    <h3 style="margin-top:18px">Highlights</h3>
    <ul class="amenities">
      <li>${buildTickIcon()}<span>Premium planning reduces stress and improves guest experience.</span></li>
      <li>${buildTickIcon()}<span>Lighting + décor choices look cinematic in photos & video.</span></li>
      <li>${buildTickIcon()}<span>Small details (lounges, signage, timing) feel luxury.</span></li>
    </ul>
    <div class="btn-row" style="margin-top:18px">
      <a class="primary-btn" href="booking.html">Enquire for your date</a>
      <a class="btn-outline" href="blog.html">Back to Blog</a>
    </div>
  `;
}

function initBookingForm(content){
  const form = document.getElementById("bookingForm");
  const out = document.getElementById("bookingStatus");
  if(!form) return;
  const endpoint = localStorage.getItem("gm_formsubmit_endpoint") || "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(out){ out.className="notice"; out.textContent="Sending enquiry…"; }
    const data = Object.fromEntries(new FormData(form).entries());

    if(!endpoint){
      const brandEmail = content.brand?.contactEmail || "";
      const subject = encodeURIComponent("Grand Moments — Booking Enquiry");
      const body = encodeURIComponent(
        `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nEvent Type: ${data.eventType}\nGuests: ${data.guests}\nDate: ${data.date}\nMessage: ${data.message}`
      );
      if(brandEmail){
        window.location.href = `mailto:${brandEmail}?subject=${subject}&body=${body}`;
        if(out){ out.className="notice success"; out.textContent="Opening your email app…"; }
      }else{
        if(out){ out.className="notice error"; out.textContent="No email configured. Open Admin and set contact email."; }
      }
      return;
    }

    try{
      const res = await fetch(endpoint, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({ ...data, _subject:"Grand Moments — Booking Enquiry", _template:"table" })
      });
      if(!res.ok) throw new Error("Request failed");
      if(out){ out.className="notice success"; out.textContent="Enquiry sent successfully! We’ll contact you soon."; }
      form.reset();
    }catch(err){
      if(out){ out.className="notice error"; out.textContent="Could not send right now. Please try WhatsApp or call."; }
    }
  });
}

(async function(){
  const content = await loadContent();
  hydrateCommon(content);

  const page = document.body.getAttribute("data-page");
  if(page === "home") hydrateHome(content);
  if(page === "packages") hydratePackages(content);
  if(page === "faq") hydrateFAQ(content);
  if(page === "blog") hydrateBlog(content);
  if(page === "post") hydratePost(content);
  if(page === "booking") initBookingForm(content);

  // other pages that reuse amenities list
  if(document.getElementById("amenitiesList") && page !== "home") hydrateAmenities(content);
})();
