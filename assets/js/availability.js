/* Availability calendar, Jul 2027 to Jun 2028. SAMPLE DATA ONLY (see data.js).
   BACKEND HOOK: replace CC.DEMO with a fetch() to your booking system's availability endpoint. */
(function () {
  var CC = window.CC;
  var grid = document.getElementById("cal-grid");
  if (!grid) return;
  var title = document.getElementById("cal-title");
  var sel = document.getElementById("cal-month");
  var prev = document.getElementById("cal-prev");
  var next = document.getElementById("cal-next");
  var summary = document.getElementById("cal-summary");
  var panel = document.getElementById("daypanel");

  var months = [];
  for (var i = 0; i < 12; i++) { var m = ((6 + i) % 12) + 1, y = i < 6 ? 2027 : 2028; months.push({ y: y, m: m }); }
  months.forEach(function (mm, i) {
    var o = document.createElement("option"); o.value = i; o.textContent = CC.MONTH_NAMES[mm.m - 1] + " " + mm.y; sel.appendChild(o);
  });
  var cur = 0, selected = null;

  function render() {
    var mm = months[cur], first = new Date(Date.UTC(mm.y, mm.m - 1, 1)).getUTCDay(), n = CC.daysIn(mm.y, mm.m);
    title.textContent = CC.MONTH_NAMES[mm.m - 1] + " " + mm.y;
    sel.value = cur; prev.disabled = cur === 0; next.disabled = cur === months.length - 1;
    var html = CC.DOW.map(function (d) { return '<div class="dow">' + d + "</div>"; }).join("");
    for (var b = 0; b < first; b++) html += '<div class="blank"></div>';
    var booked = 0, held = 0, open = 0;
    for (var d = 1; d <= n; d++) {
      var iso = CC.iso(mm.y, mm.m, d), st = CC.statusFor(iso), dw = CC.dow(iso);
      if (st === "Booked") booked++; else if (st === "Held") held++; else open++;
      var cls = "day " + (st === "Booked" ? "booked" : st === "Held" ? "held" : "free") + (dw === 6 ? " sat" : "") + (iso === selected ? " sel" : "");
      var label = st === "Open" ? CC.fmt(CC.rackFor(iso)) : "Sample " + st.toLowerCase();
      html += '<button type="button" class="' + cls + '" data-date="' + iso + '" aria-label="' + CC.longDate(iso) + ", " + (st === "Open" ? "open" : "sample " + st.toLowerCase()) + '">' +
        '<span class="n">' + d + '</span><span class="s">' + label + "</span></button>";
    }
    grid.innerHTML = html;
    summary.textContent = booked + " sample booked, " + held + " sample held, " + open + " open (sample data)";
  }

  function showDay(iso) {
    selected = iso; render();
    var st = CC.statusFor(iso), rack = CC.rackFor(iso), t = CC.tierFor(iso), hit = CC.DEMO.filter(function (b) { return b.date === iso; })[0];
    var pill = st === "Open" ? '<span class="pill ok">Open (sample data)</span>' : st === "Held" ? '<span class="pill warn">Sample hold</span>' : '<span class="pill bad">Sample booked</span>';
    var h = "<h4>" + CC.longDate(iso) + "</h4><p>" + pill + "</p>";
    h += "<p>Venue fee: <strong>" + CC.fmt(rack) + "</strong> (" + (CC.dow(iso) === 6 ? "Saturday" : "regular date") + "). ";
    h += 'Proposed Founding Couples price: <strong>' + CC.fmt(t.price) + "</strong> (" + t.name + ", " + Math.round(t.disc * 100) + "% off, <span class=\"proposed\">proposed</span>).</p>";
    if (hit) h += '<p class="note">This is invented sample data for the draft site; it does not reflect any real booking.</p>';
    else {
      h += '<div class="btn-row"><a class="btn" href="../quote/index.html?date=' + iso + '">Price this date</a>' +
        '<a class="btn ghost" href="../book/index.html?date=' + iso + '">Join the list for this date</a></div>';
    }
    panel.innerHTML = h; panel.hidden = false;
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest("button.day"); if (b) showDay(b.getAttribute("data-date"));
  });
  prev.addEventListener("click", function () { if (cur > 0) { cur--; render(); } });
  next.addEventListener("click", function () { if (cur < months.length - 1) { cur++; render(); } });
  sel.addEventListener("change", function () { cur = parseInt(sel.value, 10); render(); });
  render();
})();
