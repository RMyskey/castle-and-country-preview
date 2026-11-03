/* Book a tour / Join the Founding Couples list: FRONT-END ONLY. Nothing is sent or saved by default.

   BACKEND HOOKS (pick one and fill in CONFIG below):
   1) Formspree (simplest): create a form at formspree.io, set CONFIG.formEndpoint = "https://formspree.io/f/XXXXXXXX".
      The payload below is POSTed as JSON and a real thank-you shows only after a successful response.
   2) QXi booking backend: POST the same payload to your own endpoint (CRM, email notification, owner dashboard).
   3) Stripe: AFTER county approval (see the pre-launch plan) the $50 refundable date hold could be a Stripe Payment Link:
      set CONFIG.holdPaymentLink = "https://buy.stripe.com/..." and the thank-you panel will show a "Hold my date" button.
      Do NOT take payments before zoning approval and counsel review. Never collect card data on this page yourself.
*/
(function () {
  var CC = window.CC;
  var form = document.getElementById("book-form");
  if (!form) return;
  var CONFIG = { formEndpoint: "", holdPaymentLink: "" };

  var pre = CC.qs("date"), g = CC.qs("guests"), type = CC.qs("type");
  if (pre && CC.inSeason(pre)) document.getElementById("b-date").value = pre;
  if (g && g !== "0") document.getElementById("b-guests").value = g;
  if (type === "tour") document.getElementById("b-type-tour").checked = true;
  document.getElementById("b-date").min = CC.SEASON_OPEN;
  document.getElementById("b-date").max = CC.CAL_LAST;

  function setErr(id, msg) { document.getElementById(id).textContent = msg || ""; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form), bad = false;
    if (f.get("company")) return; // honeypot
    var name = (f.get("name") || "").trim(), email = (f.get("email") || "").trim(), date = f.get("date") || "";
    setErr("e-name", name.length < 2 ? "Please enter your name." : ""); if (name.length < 2) bad = true;
    var okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    setErr("e-email", okEmail ? "" : "Please enter a valid email."); if (!okEmail) bad = true;
    var okDate = !date || CC.inSeason(date);
    setErr("e-date", okDate ? "" : "Dates run from July 1, 2027 to June 30, 2028."); if (!okDate) bad = true;
    var okConsent = !!f.get("consent");
    setErr("e-consent", okConsent ? "" : "Please confirm so we can contact you."); if (!okConsent) bad = true;
    if (bad) return;

    var payload = {};
    f.forEach(function (v, k) { if (k !== "company") payload[k] = v; });
    var btn = form.querySelector("button[type=submit]");

    var finish = function (live) {
      document.getElementById("t-name").textContent = name.split(" ")[0];
      document.getElementById("t-kind").textContent = payload.type === "tour" ? "tour request" : "Founding Couples list signup";
      document.getElementById("t-demo").hidden = !!live;
      var hold = document.getElementById("t-hold");
      if (CONFIG.holdPaymentLink) { hold.href = CONFIG.holdPaymentLink; hold.hidden = false; }
      form.hidden = true;
      var th = document.getElementById("thanks"); th.classList.add("show"); th.setAttribute("tabindex", "-1"); th.focus();
      th.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    if (CONFIG.formEndpoint) {
      btn.disabled = true;
      fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error("bad"); finish(true); })
        .catch(function () { btn.disabled = false; setErr("e-form", "Sorry, something went wrong. Please try again or use the contact page."); });
    } else {
      finish(false); // DEMO: nothing is sent or stored
    }
  });
})();
