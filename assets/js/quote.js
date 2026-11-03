/* Quote tool: computes an estimate locally. Nothing is saved or sent.
   Venue fees are the owner's; Founding tiers, add-ons and the retainer are PROPOSED (see data.js). */
(function () {
  var CC = window.CC;
  var dateEl = document.getElementById("q-date");
  if (!dateEl) return;
  var guestsEl = document.getElementById("q-guests");
  var foundEl = document.getElementById("q-founding");
  var out = document.getElementById("q-out");
  var addWrap = document.getElementById("q-addons");
  var errEl = document.getElementById("q-err");

  dateEl.min = CC.SEASON_OPEN; dateEl.max = CC.CAL_LAST;
  addWrap.innerHTML = CC.ADDONS.map(function (a) {
    return '<label class="check"><input type="checkbox" data-addon="' + a.id + '"> <span>' + a.label + " &mdash; " + CC.fmt(a.price) + ' <span class="proposed">proposed</span></span></label>';
  }).join("");

  var pre = CC.qs("date");
  if (pre && CC.inSeason(pre)) dateEl.value = pre; else dateEl.value = "2027-10-23";
  var g = CC.qs("guests"); if (g) guestsEl.value = g;

  function calc() {
    var iso = dateEl.value;
    if (!iso || !CC.inSeason(iso)) {
      errEl.textContent = "Please choose a date between July 1, 2027 and June 30, 2028. The season cannot start before July 2027.";
      out.innerHTML = ""; return;
    }
    errEl.textContent = "";
    var rack = CC.rackFor(iso), tier = CC.tierFor(iso), status = CC.statusFor(iso);
    var useF = foundEl.checked, fee = useF ? tier.price : rack, disc = rack - fee;
    var add = 0, lines = "";
    CC.ADDONS.forEach(function (a) {
      var cb = addWrap.querySelector('[data-addon="' + a.id + '"]');
      if (cb && cb.checked) { add += a.price; lines += "<tr><td>" + a.label + ' <span class="proposed">proposed</span></td><td class="num">' + CC.fmt(a.price) + "</td></tr>"; }
    });
    var total = fee + add, guests = Math.max(0, parseInt(guestsEl.value, 10) || 0);
    var pill = status === "Open" ? '<span class="pill ok">Open (sample data)</span>' : status === "Held" ? '<span class="pill warn">Sample hold</span>' : '<span class="pill bad">Sample booked</span>';
    var html = "<h3>" + CC.longDate(iso) + "</h3><p>" + pill + "</p>";
    html += '<div class="tablewrap"><table class="t"><tbody>';
    html += "<tr><td>Venue fee, " + (CC.dow(iso) === 6 ? "Saturday" : "regular date") + '</td><td class="num">' + CC.fmt(rack) + "</td></tr>";
    if (useF) html += "<tr><td>Founding Couples: " + tier.name + " (" + Math.round(tier.disc * 100) + '% off) <span class="proposed">proposed</span></td><td class="num">-' + CC.fmt(disc) + "</td></tr>";
    html += lines;
    html += '<tr class="total-row"><td>Estimated total</td><td class="num">' + CC.fmt(total) + "</td></tr>";
    html += '<tr><td>Proposed retainer at signing (' + Math.round(CC.DEPOSIT_PCT * 100) + '%) <span class="proposed">proposed</span></td><td class="num">' + CC.fmt(total * CC.DEPOSIT_PCT) + "</td></tr>";
    html += "</tbody></table></div>";
    html += '<p class="hint">' + (guests ? "About " + CC.fmt(fee / guests) + " of venue fee per guest, for reference only. " : "") + 'The guest count does not change the venue fee. Guest capacity is <span class="tbd">[Capacity TBD]</span>.</p>';
    if (status !== "Open") html += '<p class="hint">This date shows as ' + status.toLowerCase() + " in the invented sample calendar data.</p>";
    html += '<div class="btn-row"><a class="btn" href="../book/index.html?date=' + iso + "&guests=" + guests + '">Join the list with this date</a><button type="button" class="btn ghost" id="q-copy">Copy summary</button></div><p class="hint" id="q-copied"></p>';
    out.innerHTML = html;
    document.getElementById("q-copy").addEventListener("click", function () {
      var txt = "Castle and Country estimate for " + CC.longDate(iso) + ": venue fee " + CC.fmt(fee) + (add ? ", add-ons " + CC.fmt(add) : "") + ", estimated total " + CC.fmt(total) + " (draft, proposed pricing; not an offer).";
      var done = function () { document.getElementById("q-copied").textContent = "Copied."; };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { document.getElementById("q-copied").textContent = txt; });
      else document.getElementById("q-copied").textContent = txt;
    });
  }
  [dateEl, guestsEl, foundEl].forEach(function (el) { el.addEventListener("input", calc); el.addEventListener("change", calc); });
  addWrap.addEventListener("change", calc);
  calc();
})();
