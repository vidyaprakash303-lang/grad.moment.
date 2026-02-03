const CONTENT_KEY = "gm_content_v1";

function $(s){ return document.querySelector(s); }

function download(filename, text){
  const a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function loadLocal(){
  const raw = localStorage.getItem(CONTENT_KEY);
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}
async function loadDefault(){
  const res = await fetch("data/content.json", { cache:"no-store" });
  return await res.json();
}
function pretty(obj){ return JSON.stringify(obj, null, 2); }
function setStatus(msg, cls="notice"){
  const el = $("#adminStatus");
  if(!el) return;
  el.className = cls;
  el.textContent = msg;
}
function requireLogin(){
  if(sessionStorage.getItem("gm_admin_ok")==="1") return true;
  const pass = prompt("Admin password (demo): gm-admin");
  if(pass === "gm-admin"){ sessionStorage.setItem("gm_admin_ok","1"); return true; }
  alert("Incorrect password.");
  return false;
}

function fill(content){
  $("#brandName").value = content.brand?.name || "";
  $("#tagline").value = content.brand?.tagline || "";
  $("#ctaText").value = content.brand?.primaryCta || "";
  $("#phone").value = content.brand?.phone || "";
  $("#email").value = content.brand?.contactEmail || "";
  $("#address").value = content.brand?.address || "";
  $("#mapEmbed").value = content.brand?.mapEmbedUrl || "";
  $("#whatsapp").value = content.brand?.whatsappNumber || "";

  $("#heroPrefix").value = content.hero?.headlinePrefix || "";
  $("#heroSubcopy").value = content.hero?.subcopy || "";
  $("#rotatingWords").value = (content.hero?.rotatingWords || []).join(", ");

  $("#formsubmit").value = localStorage.getItem("gm_formsubmit_endpoint") || "";
  $("#rawJson").value = pretty(content);
}
function read(content){
  content.brand = content.brand || {};
  content.hero = content.hero || {};

  content.brand.name = $("#brandName").value.trim();
  content.brand.tagline = $("#tagline").value.trim();
  content.brand.primaryCta = $("#ctaText").value.trim();
  content.brand.phone = $("#phone").value.trim();
  content.brand.contactEmail = $("#email").value.trim();
  content.brand.address = $("#address").value.trim();
  content.brand.mapEmbedUrl = $("#mapEmbed").value.trim();
  content.brand.whatsappNumber = $("#whatsapp").value.trim();

  content.hero.headlinePrefix = $("#heroPrefix").value.trim();
  content.hero.subcopy = $("#heroSubcopy").value.trim();
  content.hero.rotatingWords = $("#rotatingWords").value.split(",").map(s=>s.trim()).filter(Boolean);

  const endpoint = $("#formsubmit").value.trim();
  if(endpoint) localStorage.setItem("gm_formsubmit_endpoint", endpoint);
  else localStorage.removeItem("gm_formsubmit_endpoint");

  return content;
}
function applyJson(){
  try{
    const obj = JSON.parse($("#rawJson").value);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(obj));
    setStatus("Saved JSON to localStorage. Refresh site pages to see changes.", "notice success");
  }catch(e){
    setStatus("JSON is invalid. Fix the formatting and try again.", "notice error");
  }
}

(async function(){
  if(!requireLogin()) return;
  const local = loadLocal();
  const base = local || await loadDefault();
  fill(base);

  $("#saveBtn").addEventListener("click", () => {
    const current = loadLocal() || base;
    const updated = read(current);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(updated));
    $("#rawJson").value = pretty(updated);
    setStatus("Saved. Refresh site pages to apply changes.", "notice success");
  });
  $("#downloadBtn").addEventListener("click", () => {
    download("content.json", pretty(loadLocal() || base));
    setStatus("Downloaded content.json. Replace /data/content.json to permanently publish.", "notice");
  });
  $("#resetBtn").addEventListener("click", async () => {
    localStorage.removeItem(CONTENT_KEY);
    localStorage.removeItem("gm_formsubmit_endpoint");
    const def = await loadDefault();
    fill(def);
    setStatus("Reset to default content (removed local overrides).", "notice");
  });
  $("#applyJsonBtn").addEventListener("click", applyJson);
})();
