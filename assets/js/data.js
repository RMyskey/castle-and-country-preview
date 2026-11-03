/* Castle and Country: shared data and helpers (plain JS, no build step).
   EVERYTHING marked PROPOSED / SAMPLE / TBD below is a placeholder for the owner to confirm. */
(function () {
  var CC = {};

  /* ---- Owner-confirmed facts ---- */
  CC.PRICE_REG = 5000;          // regular (non-Saturday) date, set by the owner
  CC.PRICE_SAT = 6500;          // Saturday, set by the owner
  CC.SEASON_OPEN = "2027-07-01"; // the first season cannot start before July 2027 (owner)
  CC.CAL_LAST = "2028-06-30";   // calendar runs Jul 2027 to Jun 2028

  /* ---- PROPOSED: Founding Couples offer (from the pre-launch plan; owner to approve) ---- */
  CC.OFFPEAK_MONTHS = ["07", "08", "01", "02"]; // PROPOSED off-peak months: Jul, Aug, Jan, Feb
  CC.FOUNDING_TIERS = [
    { id: "sat",     name: "Founding Saturday",             rule: "Any Saturday outside the off-peak months",        rack: 6500, disc: 0.20, dates: 10 },
    { id: "offsat",  name: "Off-peak Saturday",             rule: "Saturdays in July, August, January and February", rack: 6500, disc: 0.30, dates: 6 },
    { id: "frisun",  name: "Founding Friday or Sunday",     rule: "Regular (non-Saturday) rate",                      rack: 5000, disc: 0.25, dates: 8 },
    { id: "weekday", name: "Founding Weekday (Mon to Thu)", rule: "Regular (non-Saturday) rate, deepest discount",    rack: 5000, disc: 0.30, dates: 6 }
  ];
  CC.FOUNDING_TOTAL_DATES = 30; // PROPOSED limit (sum of tiers)

  /* ---- PROPOSED add-ons (placeholder prices) ---- */
  CC.ADDONS = [
    { id: "stay",      label: "Overnight cottage stay",                    price: 450 },
    { id: "rehearsal", label: "Rehearsal dinner on the porch (evening before)", price: 900 },
    { id: "brunch",    label: "Day-after brunch on the porch",             price: 500 }
  ];
  CC.DEPOSIT_PCT = 0.25; // PROPOSED retainer at contract signing

  /* ---- SAMPLE DATA ONLY: invented bookings so the calendar has something to show.
        Replace with a real feed from the booking backend (see README). ---- */
  CC.DEMO_MODE = true;
  CC.DEMO = [
    { date: "2027-07-17", status: "Held",   couple: "Daisy and Pete",  source: "Google search",            founding: true },
    { date: "2027-08-14", status: "Booked", couple: "Mia and Jake",    source: "Instagram and Pinterest",  founding: true },
    { date: "2027-09-12", status: "Booked", couple: "Cora and Wes",    source: "Vendor referrals" },
    { date: "2027-09-18", status: "Booked", couple: "Naomi and Eric",  source: "Instagram and Pinterest",  addons: 900 },
    { date: "2027-09-25", status: "Held",   couple: "Tessa and Ian",   source: "Wedding directories" },
    { date: "2027-10-02", status: "Booked", couple: "Lila and Gabe",   source: "Past couples and friends" },
    { date: "2027-10-09", status: "Booked", couple: "June and Cole",   source: "Wedding directories",      addons: 1350 },
    { date: "2027-10-15", status: "Booked", couple: "Ivy and Max",     source: "Google search" },
    { date: "2027-10-16", status: "Booked", couple: "Faith and Dean",  source: "Instagram and Pinterest",  addons: 450 },
    { date: "2027-10-30", status: "Booked", couple: "Wren and Jude",   source: "Vendor referrals" },
    { date: "2027-11-06", status: "Booked", couple: "Alma and Ross",   source: "Wedding directories" },
    { date: "2027-11-13", status: "Held",   couple: "Nell and Finn",   source: "Instagram and Pinterest" },
    { date: "2027-12-04", status: "Booked", couple: "Hope and Shane",  source: "Google search",            founding: true },
    { date: "2028-01-22", status: "Held",   couple: "Nora and Eli",    source: "Google search",            founding: true },
    { date: "2028-02-12", status: "Booked", couple: "Priya and Dev",   source: "Instagram and Pinterest",  founding: true, addons: 450 },
    { date: "2028-03-18", status: "Booked", couple: "Avery and Jordan",source: "Instagram and Pinterest",  addons: 900 },
    { date: "2028-03-25", status: "Held",   couple: "Maya and Chris",  source: "Wedding directories" },
    { date: "2028-04-08", status: "Booked", couple: "Taylor and Sam",  source: "Vendor referrals",         addons: 450 },
    { date: "2028-04-15", status: "Booked", couple: "Lena and Marcus", source: "Google search" },
    { date: "2028-04-21", status: "Booked", couple: "Grace and Owen",  source: "Wedding directories" },
    { date: "2028-04-22", status: "Held",   couple: "Hannah and Luke", source: "Instagram and Pinterest" },
    { date: "2028-05-05", status: "Held",   couple: "Ruth and Isaac",  source: "Vendor referrals" },
    { date: "2028-05-06", status: "Booked", couple: "Camila and Ben",  source: "Past couples and friends", addons: 1350 },
    { date: "2028-05-13", status: "Booked", couple: "Ella and Noah",   source: "Wedding directories" },
    { date: "2028-05-20", status: "Held",   couple: "Zoe and Caleb",   source: "Instagram and Pinterest" },
    { date: "2028-05-27", status: "Booked", couple: "Imani and Theo",  source: "Google search",            addons: 500 },
    { date: "2028-06-10", status: "Booked", couple: "Sloane and Reid", source: "Wedding directories" }
  ];

  /* ---- helpers ---- */
  CC.MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  CC.MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  CC.DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  CC.DOW_LONG = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  CC.pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
  CC.iso = function (y, m, d) { return y + "-" + CC.pad2(m) + "-" + CC.pad2(d); };
  CC.parts = function (iso) { var p = iso.split("-").map(Number); return { y: p[0], m: p[1], d: p[2] }; };
  CC.dow = function (iso) { var p = CC.parts(iso); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); };
  CC.daysIn = function (y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
  CC.longDate = function (iso) { var p = CC.parts(iso); return CC.DOW_LONG[CC.dow(iso)] + ", " + CC.MONTH_NAMES[p.m - 1] + " " + p.d + ", " + p.y; };
  CC.shortDate = function (iso) { var p = CC.parts(iso); return CC.DOW[CC.dow(iso)] + " " + CC.MONTH_SHORT[p.m - 1] + " " + p.d + ", " + p.y; };
  CC.inSeason = function (iso) { return iso >= CC.SEASON_OPEN && iso <= CC.CAL_LAST; };
  CC.fmt = function (n) { var r = Math.round(n); return (r < 0 ? "-$" : "$") + Math.abs(r).toLocaleString("en-US"); };
  CC.rackFor = function (iso) { return CC.dow(iso) === 6 ? CC.PRICE_SAT : CC.PRICE_REG; };
  /* Which proposed Founding tier a date falls in. */
  CC.tierFor = function (iso) {
    var d = CC.dow(iso), mm = iso.slice(5, 7), id;
    if (d === 6) id = CC.OFFPEAK_MONTHS.indexOf(mm) >= 0 ? "offsat" : "sat";
    else if (d === 0 || d === 5) id = "frisun";
    else id = "weekday";
    var t = CC.FOUNDING_TIERS.filter(function (x) { return x.id === id; })[0];
    return { id: t.id, name: t.name, rack: t.rack, disc: t.disc, price: t.rack * (1 - t.disc) };
  };
  CC.statusFor = function (iso) {
    var hit = CC.DEMO.filter(function (b) { return b.date === iso; })[0];
    return hit ? hit.status : "Open";
  };
  CC.demoValue = function (b) {
    return (b.founding ? CC.tierFor(b.date).price : CC.rackFor(b.date)) + (b.addons || 0);
  };
  CC.qs = function (k) { return new URLSearchParams(window.location.search).get(k); };
  window.CC = CC;
})();
