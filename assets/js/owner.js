/* Owner dashboard MOCK. Ported from the Castle and Country prototype.
   DEMO ONLY: the passcode gate below is NOT real security. Anyone can read this file.
   A real owner portal needs server-side authentication (see README). All numbers are adjustable
   assumptions or sample data, not real financials.

   Venue fees ($5,000 regular / $6,500 Saturday) are the owner's. Software ~$300/mo and processing ~3% came from the brief.
   Everything else is a PROTOTYPE ASSUMPTION; the property tax / mortgage line is a placeholder at 0. */
(function () {
  var CC = window.CC;

  /* ---------------- passcode gate (demo only) ---------------- */
  var DEMO_PASSCODE_SHA256 = "f9018a20ee27e5efdbf694632d6ed0c5b5a9577ca7385b28fc1049731b093e37"; // sha-256 of the demo passcode shown on the page
  var gate = document.getElementById("gate"), dash = document.getElementById("dash");
  var codeEl = document.getElementById("gate-code"), gerr = document.getElementById("gate-err");
  function unlock() { gate.hidden = true; dash.hidden = false; try { sessionStorage.setItem("cc-owner-demo", "1"); } catch (e) {} render(); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function check() {
    var v = codeEl.value.trim();
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)).then(function (h) {
        if (hex(h) === DEMO_PASSCODE_SHA256) unlock(); else gerr.textContent = "That passcode is not right. (Demo passcode shown above.)";
      });
    } else if (v === "castle2027") unlock(); else gerr.textContent = "That passcode is not right. (Demo passcode shown above.)";
  }
  document.getElementById("gate-btn").addEventListener("click", check);
  codeEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } });

  /* ---------------- model ---------------- */
  var SEASON = [3, 4, 8, 11, 12, 8, 4, 5, 12, 16, 12, 5]; // PROTOTYPE seasonality (% of weddings by month, Jan..Dec; sums to 100)
  var LEADS = [ // PROTOTYPE lead-source mix (% of inquiries), sample only
    { label: "Instagram and Pinterest", share: 26 }, { label: "Wedding directories", share: 24 }, { label: "Vendor referrals", share: 20 },
    { label: "Google search", share: 18 }, { label: "Past couples and friends", share: 12 }
  ];
  var DEFAULTS = {
    weddings: 30, satShare: 70, bookableSat: 44, foundShare: 20, foundPct: 20, ramp: 70,
    stayPrice: 450, stayAttach: 35, rehearsalPrice: 900, rehearsalAttach: 25, brunchPrice: 500, brunchAttach: 15,
    staff: 1500, clean: 450, processing: 3,
    utilities: 450, insurance: 350, marketing: 900, software: 300, maintenance: 800, propertyTax: 0,
    tourRate: 40, holdRate: 45, bookRate: 75
  };
  var GROUPS = [
    { title: "Volume and pricing mix", fields: [
      ["weddings", "Weddings in a full year (2028)"], ["ramp", "First-season pace vs a full year (%)"], ["satShare", "Share on Saturdays (%)"],
      ["bookableSat", "Bookable Saturdays per year"], ["foundShare", "Share booked with Founding offer (%)"], ["foundPct", "Founding discount (%)"] ] },
    { title: "Add-ons: price and attach rate (proposed)", fields: [
      ["stayPrice", "Overnight cottage stay price ($)"], ["stayAttach", "Overnight stay attach rate (%)"],
      ["rehearsalPrice", "Rehearsal dinner price ($)"], ["rehearsalAttach", "Rehearsal dinner attach rate (%)"],
      ["brunchPrice", "Day-after brunch price ($)"], ["brunchAttach", "Brunch attach rate (%)"] ] },
    { title: "Costs per wedding", fields: [
      ["staff", "Staffing and coordinator ($ per wedding)"], ["clean", "Cleaning ($ per wedding)"], ["processing", "Payment processing (% of revenue)"] ] },
    { title: "Fixed costs per month", fields: [
      ["utilities", "Utilities ($)"], ["insurance", "Insurance ($)"], ["marketing", "Marketing and ads ($)"], ["software", "Software ($)"],
      ["maintenance", "Maintenance and grounds ($)"], ["propertyTax", "Property tax or mortgage placeholder ($)"] ] }
  ];
  var A = {}, period = "full", filter = "All", booted = false;
  Object.keys(DEFAULTS).forEach(function (k) { A[k] = String(DEFAULTS[k]); });

  function n(k, max) { var v = parseFloat(A[k]); v = isNaN(v) ? 0 : Math.max(0, v); return Math.min(max === undefined ? 1e9 : max, v); }
  function fmt(x) { return CC.fmt(x); }
  function pct(x, d) { return x.toFixed(d || 0) + "%"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function compute() {
    var partial = period === "partial";
    var idx = partial ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    var scopeSum = idx.reduce(function (s, i) { return s + SEASON[i]; }, 0);
    var seasonShare = scopeSum / 100, pace = partial ? n("ramp", 100) / 100 : 1;
    var W = n("weddings", 120) * seasonShare * pace, months = idx.length;
    var satShare = n("satShare", 100) / 100, sat = W * satShare, reg = W - sat;
    var fShare = n("foundShare", 100) / 100, fPct = n("foundPct", 100) / 100;
    var satNet = sat * CC.PRICE_SAT * (1 - fShare * fPct), regNet = reg * CC.PRICE_REG * (1 - fShare * fPct);
    var discountGiven = (sat * CC.PRICE_SAT + reg * CC.PRICE_REG) * fShare * fPct;
    var addonPer = n("stayAttach", 100) / 100 * n("stayPrice") + n("rehearsalAttach", 100) / 100 * n("rehearsalPrice") + n("brunchAttach", 100) / 100 * n("brunchPrice");
    var addonRev = W * addonPer, revenue = satNet + regNet + addonRev;
    var procRate = n("processing", 100) / 100, processing = revenue * procRate;
    var staffCost = W * n("staff"), cleanCost = W * n("clean");
    var monthlyFixed = n("utilities") + n("insurance") + n("marketing") + n("software") + n("maintenance") + n("propertyTax");
    var fixed = monthlyFixed * months, variable = staffCost + cleanCost, totalCost = fixed + variable + processing, net = revenue - totalCost;
    var avgPer = (satShare * CC.PRICE_SAT + (1 - satShare) * CC.PRICE_REG) * (1 - fShare * fPct) + addonPer;
    var contribution = avgPer * (1 - procRate) - n("staff") - n("clean");
    var breakEven = contribution > 0 ? Math.ceil(fixed / contribution) : -1;
    var bookableSat = Math.max(1, n("bookableSat", 52) * seasonShare), satOcc = sat / bookableSat * 100;
    var costs = [
      ["Staffing and coordinator", staffCost], ["Cleaning", cleanCost], ["Marketing and ads", n("marketing") * months], ["Maintenance and grounds", n("maintenance") * months],
      ["Utilities", n("utilities") * months], ["Insurance", n("insurance") * months], ["Software", n("software") * months],
      ["Property tax or mortgage", n("propertyTax") * months], ["Payment processing", processing]
    ].filter(function (c) { return c[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; });
    var scopeW = idx.map(function (i) { return SEASON[i]; });
    var mRev = scopeW.map(function (w) { return revenue * w / scopeSum; });
    var mCost = scopeW.map(function (w) { return monthlyFixed + (variable + processing) * w / scopeSum; });
    var run = 0, cum = mRev.map(function (r, i) { run += r - mCost[i]; return run; });
    var tourRate = n("tourRate", 100) / 100, holdRate = n("holdRate", 100) / 100, bookRate = n("bookRate", 100) / 100, conv = tourRate * holdRate * bookRate;
    var inquiries = conv > 0 ? Math.round(W / conv) : 0, tours = Math.round(inquiries * tourRate), holds = Math.round(tours * holdRate), booked = Math.round(W);
    return { partial: partial, idx: idx, W: W, sat: sat, revenue: revenue, totalCost: totalCost, net: net, breakEven: breakEven, discountGiven: discountGiven,
      satNet: satNet, regNet: regNet, addonRev: addonRev, satOcc: satOcc, bookableSat: bookableSat, costs: costs, mRev: mRev, mCost: mCost, cum: cum, labels: idx.map(function (i) { return CC.MONTH_SHORT[i]; }),
      conv: conv, inquiries: inquiries, tours: tours, holds: holds, booked: booked, tourRate: tourRate, holdRate: holdRate, bookRate: bookRate, avgPer: avgPer, fixed: fixed, months: months };
  }

  /* ---------------- small render helpers ---------------- */
  function hbars(rows, cls) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; }).concat([1]));
    return rows.map(function (r) {
      return '<div class="hbar"><div>' + esc(r.l) + (r.meta ? '<span class="meta">' + esc(r.meta) + "</span>" : "") + '</div><div class="tr"><span class="fl ' + (cls || "") + '" style="width:' + Math.max(1, r.v / max * 100).toFixed(1) + '%"></span></div><div class="val">' + esc(r.d) + "</div></div>";
    }).join("");
  }
  function niceMax(v) { if (v <= 0) return 1000; var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  function k(v) { var r = Math.round(v / 1000); return (r < 0 ? "-$" : "$") + Math.abs(r) + "k"; }
  function columnChart(labels, a, b) {
    var W = 640, H = 270, L = 46, R = 8, T = 10, B = 28, max = niceMax(Math.max.apply(null, a.concat(b))), pw = W - L - R, ph = H - T - B, g = pw / labels.length, bw = Math.min(18, g / 2.6);
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Monthly revenue and costs">';
    for (var i = 0; i <= 4; i++) { var y = T + ph - ph * i / 4; s += '<line class="gridline" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + k(max * i / 4) + "</text>"; }
    labels.forEach(function (lab, j) {
      var cx = L + g * j + g / 2, ha = a[j] / max * ph, hb = b[j] / max * ph;
      s += '<rect x="' + (cx - bw - 1) + '" y="' + (T + ph - ha) + '" width="' + bw + '" height="' + ha + '" fill="#7a4b2d"><title>' + lab + " revenue " + fmt(a[j]) + "</title></rect>";
      s += '<rect x="' + (cx + 1) + '" y="' + (T + ph - hb) + '" width="' + bw + '" height="' + hb + '" fill="#4f7f72"><title>' + lab + " costs " + fmt(b[j]) + "</title></rect>";
      s += '<text x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle">' + lab + "</text>";
    });
    return s + "</svg>";
  }
  function lineChart(labels, vals) {
    var W = 640, H = 270, L = 52, R = 14, T = 12, B = 28, mx = Math.max.apply(null, vals.concat([0])), mn = Math.min.apply(null, vals.concat([0]));
    var top = niceMax(mx || 1000), bot = mn < 0 ? -niceMax(-mn) : 0, pw = W - L - R, ph = H - T - B;
    var X = function (i) { return L + (labels.length === 1 ? pw / 2 : pw * i / (labels.length - 1)); }, Y = function (v) { return T + ph * (top - v) / (top - bot); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Cumulative net income">';
    for (var i = 0; i <= 4; i++) { var v = bot + (top - bot) * i / 4, y = Y(v); s += '<line class="gridline" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + k(v) + "</text>"; }
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#6f675c" stroke-width="1.2"/>';
    var pts = vals.map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ");
    s += '<polyline fill="none" stroke="#7a4b2d" stroke-width="2.5" points="' + pts + '"/>';
    vals.forEach(function (v, i) { s += '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="3.5" fill="#7a4b2d"><title>' + labels[i] + ": " + fmt(v) + "</title></circle><text x=\"" + X(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + labels[i] + "</text>"; });
    return s + "</svg>";
  }
  function donut(parts) {
    var tot = parts.reduce(function (s, p) { return s + p.v; }, 0) || 1, off = 25, cols = ["#7a4b2d", "#4f7f72", "#b08a3e"], s = '<svg viewBox="0 0 42 42" role="img" aria-label="Revenue split" style="max-width:220px;margin:0 auto"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="#eee4d0" stroke-width="6"/>';
    parts.forEach(function (p, i) { var len = p.v / tot * 100; s += '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="' + cols[i % 3] + '" stroke-width="6" stroke-dasharray="' + len + " " + (100 - len) + '" stroke-dashoffset="' + off + '"/>'; off -= len; });
    s += "</svg>";
    return s + '<div class="key" style="margin-top:.8rem">' + parts.map(function (p, i) { return '<span><i style="background:' + cols[i % 3] + '"></i>' + esc(p.l) + ": " + fmt(p.v) + "</span>"; }).join("") + "</div>";
  }
  function table(cols, rows, numCols) {
    return '<div class="tablewrap"><table class="t"><thead><tr>' + cols.map(function (c, i) { return "<th" + (numCols.indexOf(i) >= 0 ? ' class="num"' : "") + ">" + c + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (numCols.indexOf(i) >= 0 ? ' class="num"' : "") + ">" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function $(id) { return document.getElementById(id); }

  /* ---------------- build inputs once ---------------- */
  function buildInputs() {
    $("assump").innerHTML = GROUPS.map(function (g) {
      return '<div class="panel"><h4>' + g.title + "</h4>" + g.fields.map(function (f) {
        return '<div class="field"><label for="a-' + f[0] + '">' + f[1] + '</label><input type="number" inputmode="decimal" min="0" id="a-' + f[0] + '" data-k="' + f[0] + '" value="' + A[f[0]] + '"></div>';
      }).join("") + "</div>";
    }).join("");
    $("pipe-rates").innerHTML = [["tourRate", "Inquiry to tour (%)"], ["holdRate", "Tour to hold (%)"], ["bookRate", "Hold to booked (%)"]].map(function (f) {
      return '<div class="field"><label for="a-' + f[0] + '">' + f[1] + '</label><input type="number" inputmode="decimal" min="0" id="a-' + f[0] + '" data-k="' + f[0] + '" value="' + A[f[0]] + '"></div>';
    }).join("");
    document.querySelectorAll("input[data-k]").forEach(function (el) {
      el.addEventListener("input", function () { A[el.getAttribute("data-k")] = el.value; render(); });
    });
    $("presets").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-w]"); if (!b) return; A.weddings = b.getAttribute("data-w"); $("a-weddings").value = A.weddings; render();
    });
    $("period").addEventListener("click", function (e) { var b = e.target.closest("button[data-p]"); if (!b) return; period = b.getAttribute("data-p"); render(); });
    $("bk-filter").addEventListener("click", function (e) { var b = e.target.closest("button[data-f]"); if (!b) return; filter = b.getAttribute("data-f"); render(); });
    $("reset").addEventListener("click", function () {
      Object.keys(DEFAULTS).forEach(function (kk) { A[kk] = String(DEFAULTS[kk]); var el = $("a-" + kk); if (el) el.value = A[kk]; });
      period = "full"; render();
    });
  }

  function render() {
    if (dash.hidden) return;
    if (!booted) { buildInputs(); booted = true; }
    var m = compute();
    document.querySelectorAll("#presets button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-w") === A.weddings ? "true" : "false"); });
    document.querySelectorAll("#period button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-p") === period ? "true" : "false"); });
    document.querySelectorAll("#bk-filter button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-f") === filter ? "true" : "false"); });

    var metric = function (v, l, d, neg) { return '<div class="metric"><div class="v' + (neg ? " neg" : "") + '">' + v + '</div><div class="l">' + l + '</div><div class="d">' + d + "</div></div>"; };
    $("metrics").innerHTML =
      metric(fmt(m.revenue), "Projected revenue", Math.round(m.W) + " weddings, " + (m.partial ? "Jul to Dec 2027" : "calendar 2028")) +
      metric(fmt(m.totalCost), "Projected costs", fmt(m.fixed) + " fixed") +
      metric(fmt(m.net), "Net income", m.net >= 0 ? "Before owner pay and income tax" : "Loss at these assumptions", m.net < 0) +
      metric(m.breakEven > 0 ? m.breakEven + " weddings" : "Not reachable", "Break-even", "Weddings in this period to cover fixed costs");
    $("period-note").textContent = m.partial
      ? "The first season covers six months of fixed costs (Jul to Dec 2027). Pre-opening costs before July 2027 are not modeled. Jul to Dec carries 54% of a year in the seasonality assumption, scaled by the first-season pace."
      : "The first full year is calendar 2028, using the full-year wedding count above.";
    $("disc-note").textContent = "The founding discount gives up " + fmt(m.discountGiven) + " in this period. Saturday weddings use " + pct(m.satOcc) + " of the " + Math.round(m.bookableSat) + " bookable Saturdays in the period." + (m.satOcc > 100 ? " Warning: this exceeds the bookable Saturdays; lower the Saturday share or raise the bookable count." : "");

    $("cost-bars").innerHTML = hbars(m.costs.map(function (c) { return { l: c[0], v: c[1], d: fmt(c[1]) }; }));
    $("rev-donut").innerHTML = donut([{ l: "Saturday venue fees", v: m.satNet }, { l: "Regular-date venue fees", v: m.regNet }, { l: "Add-ons", v: m.addonRev }].filter(function (p) { return p.v > 0; }));
    $("month-chart").innerHTML = columnChart(m.labels, m.mRev, m.mCost);
    $("cum-chart").innerHTML = lineChart(m.labels, m.cum);

    $("funnel").innerHTML = hbars([
      { l: "Inquiries", v: m.inquiries, d: String(m.inquiries), meta: "sample" },
      { l: "Tours", v: m.tours, d: String(m.tours), meta: pct(m.tourRate * 100) + " of inquiries" },
      { l: "Holds", v: m.holds, d: String(m.holds), meta: pct(m.holdRate * 100) + " of tours" },
      { l: "Booked", v: m.booked, d: String(m.booked), meta: pct(m.bookRate * 100) + " of holds" }
    ], "b");
    $("leads").innerHTML = hbars(LEADS.map(function (l) { var c = Math.round(m.inquiries * l.share / 100); return { l: l.label, v: c, d: String(c), meta: l.share + "%" }; }), "v");

    var rows = CC.DEMO.filter(function (b) { return filter === "All" || b.status === filter; });
    $("bk-table").innerHTML = table(["Date", "Couple", "Type", "Status", "Value", "Source"], rows.slice(0, 10).map(function (b) {
      return [CC.shortDate(b.date), esc(b.couple), (CC.dow(b.date) === 6 ? "Saturday" : "Regular") + (b.founding ? ", founding" : ""), b.status, fmt(CC.demoValue(b)), esc(b.source)];
    }), [4]);
    var booked = CC.DEMO.filter(function (b) { return b.status === "Booked"; });
    $("bk-note").textContent = "Showing the next " + Math.min(10, rows.length) + " of " + rows.length + ". The sample couples are invented; the " + booked.length + " booked sample dates add up to " + fmt(booked.reduce(function (s, b) { return s + CC.demoValue(b); }, 0)) + ".";

    var top = LEADS[0];
    $("kpis").innerHTML = table(["KPI", "Value", "Basis"], [
      ["Occupancy of available Saturdays", pct(m.satOcc), m.sat.toFixed(1) + " Saturday weddings of " + Math.round(m.bookableSat) + " bookable (assumption)"],
      ["Average booking value", fmt(m.W > 0 ? m.revenue / m.W : m.avgPer), "Revenue per wedding, including add-ons"],
      ["Inquiry-to-booking conversion", pct(m.conv * 100, 1), "Product of the three stage rates"],
      ["Top lead source (sample)", top.label, top.share + "% of inquiries, sample split"],
      ["Net margin", m.revenue > 0 ? pct(m.net / m.revenue * 100) : "n/a", "Net income over revenue"]
    ], [1]);
  }

  var already = false; try { already = sessionStorage.getItem("cc-owner-demo") === "1"; } catch (e) {}
  if (already) unlock();
})();
