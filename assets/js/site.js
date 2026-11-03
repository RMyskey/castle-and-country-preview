/* Castle and Country: site-wide behaviour: mobile nav, scroll reveal, gallery lightbox. */
(function () {
  // mobile nav
  var btn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // scroll reveal
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // gallery lightbox
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  var dlg = document.getElementById("lightbox");
  if (items.length && dlg && typeof dlg.showModal === "function") {
    var img = dlg.querySelector("img"), cap = dlg.querySelector("figcaption"), idx = 0;
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      img.src = it.getAttribute("data-full");
      img.alt = it.getAttribute("data-alt") || "";
      cap.textContent = it.getAttribute("data-caption") || "";
    };
    items.forEach(function (it, i) {
      it.addEventListener("click", function () { show(i); dlg.showModal(); });
    });
    dlg.querySelector("[data-prev]").addEventListener("click", function () { show(idx - 1); });
    dlg.querySelector("[data-next]").addEventListener("click", function () { show(idx + 1); });
    dlg.querySelector("[data-close]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }
})();
