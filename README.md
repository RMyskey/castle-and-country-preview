# Castle and Country: draft website

A static, mobile-first draft site for **Castle and Country**, 4592 Wrightsboro Rd, Thomson, GA 30824.
Plain HTML, CSS and JavaScript. **No build step, no dependencies.** The only external request is the Google Fonts
stylesheet (Cormorant Garamond and Lora); the site falls back to system serif fonts without it. The contact page embeds a Google Map.

## Run it locally

    cd castle-and-country-site
    python3 -m http.server 8000      # then open http://localhost:8000

(Opening `index.html` directly from disk also works; all links are relative and use explicit `index.html` paths.
The owner passcode check uses the Web Crypto API and falls back automatically where it is unavailable.)

## Deploy

Upload the folder as-is to any static host: Netlify (drag and drop the folder), Vercel, Cloudflare Pages, GitHub Pages, S3 + CloudFront.
Before launch, search for `example.com` and set the real domain in `sitemap.xml`, `robots.txt` and the `og:image` tag (generated pages use `https://www.example.com`).

## Pages

| Path | What it is |
|---|---|
| `/` | Home: hero (barn doors photo), the Russian horse barn story, three spaces, pricing, list signup |
| `/estate/` | The barn, cottage, lawns and gate; a table of what is confirmed and what is still TBD |
| `/gallery/` | 9 photos with a keyboard-accessible lightbox |
| `/pricing/` | $5,000 regular / $6,500 Saturday; Founding Couples tiers (PROPOSED); add-ons (PROPOSED); how booking could work (PROPOSED) |
| `/availability/` | Calendar Jul 2027 to Jun 2028, no dates before July 2027. **Booked/held dates are invented SAMPLE data.** |
| `/quote/` | Local price estimate: date, guests, Founding toggle, add-ons. Nothing is saved or sent. |
| `/book/` | Join the Founding Couples list / request a tour. Front-end only, shows a thank-you state. |
| `/faq/` | 13 questions, with honest TBDs |
| `/contact/` | Address, distances, map embed |
| `/owner/` | Owner dashboard mock (presets 12/30/50, adjustable costs, first season Jul to Dec 2027 vs 2028, pipeline, KPIs) behind a **demo-only** passcode |

## Photos

All 10 images in `images/` are real photographs of the property, resized to about 1600px on the long side:
`hero.jpg` (barn doors open, string lights inside) and `gallery-01.jpg` to `gallery-09.jpg`.
To swap one, replace the file with a JPEG of the same name (about 1600px wide, under about 350KB) and, if the subject changes,
update the `alt` text and captions in the HTML (search for the filename; the gallery captions live in `gallery/index.html`).
Some photos show work in progress (for example the hero shows a wheelbarrow at the bottom edge on tall screens).
Photo rights and any people appearing in photos have not been confirmed; photos showing people were deliberately left out.

## Placeholders the owners need to fill

Search the HTML for `class="tbd"` or the text `TBD`:

- Guest capacity (ceremony, reception, total), acreage, cottage bedrooms and bathrooms
- Which interior rooms are in the barn versus the cottage
- Restrooms, kitchen and bridal facilities; parking plan; accessibility; rain plan
- Catering, vendor and alcohol policy; hours, sound limits and curfew (subject to county conditions)
- What the venue fee includes
- Contact email and phone (contact page)
- Real domain (see Deploy)

## Proposed, not confirmed (labeled "Proposed" on the site)

These come from the pre-launch plan and the prototype and need owner approval:

- Founding Couples tiers: Saturday 20% off ($5,200), off-peak Saturday 30% off ($4,550; off-peak = Jul, Aug, Jan, Feb), Friday/Sunday 25% off ($3,750), Mon to Thu 30% off ($3,500); 30 dates in total
- Add-ons: overnight cottage stay $450, rehearsal dinner $900, day-after brunch $500
- $50 refundable hold (only after county approval), 25% retainer at signing, balance 60 days before the date
- Owner-view assumptions: 70% Saturday share, 44 bookable Saturdays, 20% founding share, add-on attach rates, $1,500 staffing and $450 cleaning per wedding, monthly fixed costs, seasonality weights, lead-source mix, funnel rates

The venue fees ($5,000 regular, $6,500 Saturday) and the July 2027 earliest opening are the owners' own.
The site states that opening depends on county approval, permits and inspections, per the pre-launch plan.

## Where backends hook in

- **Forms** (`assets/js/book.js`): set `CONFIG.formEndpoint` to a Formspree URL (or your own endpoint) to POST the request as JSON.
  Until then the form only shows a "nothing was sent" thank-you.
- **Stripe** (`assets/js/book.js`): after county approval and attorney review, set `CONFIG.holdPaymentLink` to a Stripe Payment Link for the $50 hold.
  Do not collect card details on these pages yourself, and do not take payments before approval.
- **Availability** (`assets/js/data.js`, `assets/js/availability.js`): replace `CC.DEMO` with a fetch to the booking system's availability endpoint.
- **Owner portal** (`owner/`, `assets/js/owner.js`): the passcode (`castle2027`) is **demo only and not security**: the check runs in the browser and the page source is public.
  A real portal needs server-side authentication and data. The page is `noindex` and disallowed in `robots.txt`.
- **Map** (`contact/index.html`): uses Google's keyless embed; swap for the Maps Embed API or OpenStreetMap if preferred.

## Files

    index.html, 404.html, favicon.svg, robots.txt, sitemap.xml
    estate/ gallery/ pricing/ availability/ quote/ book/ faq/ contact/ owner/   (each an index.html)
    assets/css/styles.css
    assets/js/data.js        shared prices, tiers, sample data, helpers
    assets/js/site.js        nav, reveal, lightbox
    assets/js/availability.js, quote.js, book.js, owner.js
    images/                  hero.jpg, gallery-01.jpg ... gallery-09.jpg
