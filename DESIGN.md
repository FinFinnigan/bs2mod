# DESIGN.md — Miski Kidswear Visual Reconstruction Specification

> **Status:** Canonical visual/design specification for OpenCode implementation.
> **Purpose:** Recreate the supplied Miski kidswear mockups as an actual responsive webshop UI with extremely high visual fidelity, without requiring OpenCode to see the reference images.
> **Priority:** Visual/layout fidelity first. Existing commerce behavior, data, routes, auth, cart, checkout, payment, inventory, and integrations must remain functionally intact unless a visual change absolutely requires a thin presentation-layer adapter.

---

## 0. OpenCode trigger prompt

Use this exact instruction to start the implementation session:

> Read `DESIGN.md` completely before changing any code. Treat it as the canonical visual source of truth for this UI overhaul. First inspect the existing repository and map the current routes/components/styles to the page and component structure in this document. Preserve existing business logic, data contracts, checkout/payment behavior, auth, cart state, APIs, integrations, and working routes. Then implement the design in small verifiable visual chunks, beginning with global tokens + shell/header, followed by Home, Shop/Category, Product, Cart, Checkout, and Order Confirmation. Do not invent a different visual direction. When an existing implementation conflicts with this specification, preserve functionality and refactor only the presentation layer needed to match the spec. Verify each page at desktop, tablet, and mobile widths before declaring it complete.

---

# 1. OUTCOME

Build a polished, premium kidswear webshop whose page structure, spacing, proportions, card shapes, hierarchy, navigation, product presentation, filters, checkout flow, and overall visual character match the supplied Miski mockups.

The finished result must feel like one coherent product, not a collection of unrelated templates. Every page must share the same design language:

- warm off-white canvas;
- bright, calm, editorial product imagery;
- soft rounded rectangles;
- subtle borders and soft shadows;
- restrained glass/frosting rather than loud glassmorphism;
- dark charcoal/navy text;
- theme-aware accent color;
- compact desktop navigation;
- generous whitespace;
- high-information-density ecommerce layouts that still feel airy;
- child-friendly without looking childish;
- editorial handwritten doodles used sparingly as personality accents;
- premium boutique presentation rather than marketplace/storefront clutter.

This is **not** a request for a loose interpretation. The goal is a near pixel-level reconstruction of the layout system represented by the references.

---

# 2. SOURCE INTERPRETATION

The references show the same core webshop system in several visual themes and content variations. Treat the repeated geometry and page composition as the actual specification, while treating color/image/copy differences as theme/content variants.

The recurring page set is:

1. Home / landing page.
2. Shop / category listing page.
3. Product detail page.
4. Shopping cart.
5. Checkout — shipping information.
6. Checkout — payment.
7. Checkout — review if present in the existing flow.
8. Thank-you / order confirmation / order tracking entry page.

The recurring primary navigation is:

- Home
- Shop
- New In
- Boys
- Girls
- Collections

The recurring utility actions are:

- Search
- Wishlist/heart where supported
- Cart/bag with badge count
- User/account/avatar

The recurring content language is calm and premium. Example phrases in the reference style include:

- “Little Fits, Big Stories”
- “Little People, Brighter Tomorrows”
- “Everyday Outfits for Brighter Days”
- “Built for Big Adventures”
- “Play · Explore · Grow”
- “Good Outfits, Happier Days”
- “Small Steps, Brighter Futures”
- “Good Things Ahead”

Do not hardcode those phrases if the site already has editable CMS/theme content. Recreate the **placement, style, scale, and hierarchy**, then bind to existing editable content.

---

# 3. NON-NEGOTIABLE VISUAL PRINCIPLES

## 3.1 Overall mood

The site must feel:

- clean;
- premium;
- gentle;
- modern;
- editorial;
- family-oriented;
- trustworthy;
- soft but not blurry;
- playful in details, not in the core UI architecture.

Avoid:

- loud gradients;
- neon colors;
- excessive transparency;
- strong drop shadows;
- oversized glass blobs;
- harsh black borders;
- tiny unreadable text;
- conventional ecommerce “boxed everything” styling;
- generic dashboard visuals;
- heavy animations;
- giant full-screen hero text that pushes products below the fold;
- excessive use of icons inside every button.

## 3.2 Visual hierarchy

The hierarchy is always:

1. Product/child editorial imagery.
2. Large headline or product title.
3. Primary conversion CTA.
4. Supporting copy / price / rating / variant controls.
5. Secondary navigation and supporting trust information.

## 3.3 Rounded geometry

Everything is based on nested rounded rectangles.

Use the following radius system as the baseline:

- Page/shell panel radius: **22–24 px**
- Hero / large image panel: **20–22 px**
- Medium content card: **16–18 px**
- Product image/card: **14–16 px**
- Form field: **9–12 px**
- Small chip/button: **999 px pill** or **10–12 px** depending on shape
- Circular icon button: fully circular

Never mix sharp 0 px corners with the soft system unless an existing browser control cannot be reasonably restyled.

## 3.4 Border system

Borders should almost disappear at first glance.

Recommended baseline:

```css
--border-subtle: rgba(27, 31, 35, 0.09);
--border-soft: rgba(27, 31, 35, 0.13);
--border-on-dark: rgba(255,255,255,0.15);
```

Use 1 px borders. Avoid 2 px borders except selection/focus states.

## 3.5 Shadow system

Shadows must be broad and soft.

```css
--shadow-xs: 0 2px 8px rgba(31, 26, 20, 0.04);
--shadow-sm: 0 5px 16px rgba(31, 26, 20, 0.06);
--shadow-md: 0 12px 30px rgba(31, 26, 20, 0.08);
--shadow-float: 0 16px 42px rgba(31, 26, 20, 0.10);
```

Do not use hard 0 8px 0 shadows or high-opacity black.

---

# 4. GLOBAL CANVAS AND LAYOUT GRID

## 4.1 Desktop page canvas

At desktop widths of approximately 1366–1600 px:

```css
body {
  background: #f3f0ea;
}

.app-shell {
  width: min(1440px, calc(100vw - 32px));
  margin: 16px auto 32px;
}
```

The page should visually read as a large soft white/cream application card floating above the warm outer background.

Use:

- 16 px outer margin at normal desktop;
- 20–24 px outer margin on very wide screens;
- 16–24 px page-internal padding depending on route;
- 14–18 px gaps between major cards;
- 10–14 px gaps between product cards and form controls.

## 4.2 Recommended desktop grid

Primary 12-column system:

```css
grid-template-columns: repeat(12, minmax(0, 1fr));
column-gap: 16px;
```

Use page-specific spans rather than arbitrary fixed pixel widths where possible.

## 4.3 Maximum content width

Do not stretch content indefinitely on ultrawide monitors.

- Normal cap: **1440 px**
- Optional shell cap if the current site is narrower: **1380–1440 px**
- Text measure for descriptions: **42–64 characters**
- Form measure: do not exceed **720 px** for the primary form column.

---

# 5. COLOR SYSTEM

The mockups repeat the same geometry in multiple palettes. Implement colors as semantic CSS variables so the entire visual system can be themed without changing components.

## 5.1 Base neutral palette

```css
--page-bg: #f3f0ea;
--surface: #fbfaf7;
--surface-strong: #ffffff;
--surface-muted: #f3f1ed;
--surface-warm: #f7f2eb;
--text: #161b1f;
--text-soft: #5f6468;
--text-faint: #8f9396;
--line: rgba(22, 27, 31, 0.09);
--line-strong: rgba(22, 27, 31, 0.14);
--ink: #10171c;
```

## 5.2 Default forest/sage accent

```css
--accent: #2f5746;
--accent-strong: #1e3f33;
--accent-soft: #dfe8e1;
--accent-pale: #edf2ee;
--accent-contrast: #ffffff;
```

## 5.3 Boys / adventure theme

```css
--accent: #173a5a;
--accent-strong: #102b44;
--accent-soft: #d8e4ee;
--accent-pale: #edf4f8;
--secondary: #6b7663;
--sand: #cbb69a;
```

## 5.4 Girls / soft botanical theme

```css
--accent: #416753;
--accent-strong: #2d5140;
--accent-soft: #dce8df;
--accent-pale: #f0f5f1;
--blush: #dca895;
--oat: #ddcdbb;
```

## 5.5 Warm terracotta variant

```css
--accent: #ad522f;
--accent-strong: #883d25;
--accent-soft: #ecd4c5;
--accent-pale: #f8eee7;
```

## 5.6 Playful pastel variant

```css
--accent: #df718b;
--accent-strong: #c95f78;
--accent-soft: #f7dbe2;
--accent-pale: #fff1f4;
--sky: #a9d4e8;
--mint: #a9d9c5;
--butter: #f4df9f;
```

## 5.7 Theme rule

The accent color may change across themed content, but the following must stay stable:

- text contrast;
- spacing;
- border radii;
- component geometry;
- card elevation;
- form behavior;
- responsive behavior.

The theme is a skin, not a different layout.

---

# 6. TYPOGRAPHY

## 6.1 Base UI font

Use the project’s existing clean grotesk/sans if it is close to the reference. Preferred characteristics:

- neutral;
- slightly rounded;
- compact;
- excellent small-size legibility;
- modern ecommerce feel.

Suitable equivalents include Inter, Manrope, Geist, or similar. Do not add a new font dependency if the current stack already has an appropriate equivalent.

## 6.2 Display font option

Some reference variants use an editorial serif for the home-page statement. If the project’s theme system supports multiple typographic presets, expose a display-family variable:

```css
--font-ui: Inter, system-ui, sans-serif;
--font-display: Georgia, "Times New Roman", serif;
```

The serif is used only for editorial hero statements, never for core product controls or checkout fields.

## 6.3 Handwritten accent font

Use a light handwritten font only for decorative phrases such as “Good Things Ahead”. It must look like marker/pen handwriting, not formal calligraphy.

Rules:

- decorative only;
- never required to understand a control;
- never used for price, product information, forms, or navigation;
- maximum 1–2 handwritten accents in the visible viewport;
- 18–32 px depending on placement.

## 6.4 Desktop type scale

Use approximately:

- Hero display: **52–72 px**, line-height 0.95–1.0, letter-spacing -0.035em
- Page H1: **30–38 px**, line-height 1.05–1.1
- Product H1: **28–34 px**
- Section heading: **24–30 px**
- Card heading: **15–18 px**, 600–700 weight
- Price large: **26–30 px**, 700
- Price normal: **14–16 px**, 600–700
- Body: **14–16 px**, line-height 1.45–1.6
- Navigation: **12–14 px**, 500
- Metadata: **11–13 px**, 400–500
- Micro labels: **10–12 px**, 500

## 6.5 Mobile type scale

- Hero: **40–52 px**
- Page H1: **28–34 px**
- Section: **22–26 px**
- Product H1: **26–30 px**
- Body: **14–16 px**

Do not shrink below readable sizes merely to fit desktop content into mobile.

---

# 7. GLOBAL HEADER / TOP NAVIGATION

The header is a key part of the identity and must remain consistent on every route.

## 7.1 Geometry

Desktop:

- height: **64–72 px**;
- white/off-white surface;
- rounded upper corners matching shell;
- bottom divider: subtle 1 px line;
- horizontal padding: **18–24 px**.

Layout:

```text
[ MISKI logo + tiny tagline ]  [ centered nav items ]  [ search ][ wishlist? ][ cart badge ][ avatar ]
```

## 7.2 Logo block

Left aligned.

- “Miski” wordmark: visually dominant, about 30–36 px high.
- Small leaf/feather brand mark aligned to wordmark.
- Tagline below at roughly 9–11 px: “Kids Wear · Bigger Tomorrow” or project-configured equivalent.
- Logo block total width: about 150–180 px.

Do not let the logo vertically center like plain text; it should feel like a small brand lockup.

## 7.3 Navigation

Desktop nav sits near the center and uses compact text labels.

- horizontal gap: **18–24 px**;
- inactive items: plain text;
- active item: small soft pill, not a big tab;
- active pill height: **32–36 px**;
- active pill background: white or `surface-muted` with light shadow;
- no underline.

## 7.4 Utility icons

Use circular ghost icon buttons:

- size: **38–42 px**;
- border: subtle;
- surface: `rgba(255,255,255,.65)`;
- optional 4–8 px backdrop blur;
- hover: slight lift and stronger border;
- icons: thin 1.5–2 px stroke.

Cart badge:

- 15–18 px diameter;
- positioned top-right of bag icon;
- filled with accent or deep blue;
- white 9–10 px numeral.

Avatar:

- 36–40 px circle;
- object-fit cover;
- 1–2 px white outline.

## 7.5 Sticky behavior

On scroll, header may become sticky if the existing project supports it, but keep it subtle:

- `position: sticky; top: 8px;`
- slightly stronger shadow only after scrolling;
- no large shrink animation.

---

# 8. HOME / LANDING PAGE

The home page is the most editorial route. It must feel immediately premium but still clearly like a shop.

## 8.1 Desktop composition

Main structure:

```text
HEADER
┌───────────────────────────────────────────────────────────────┐
│ HERO CONTENT + CHILD EDITORIAL IMAGE + HANDWRITTEN ACCENT     │
│                                                               │
│ [CTA] [secondary CTA]                                         │
│                                                               │
│ [category tile][tile][tile][tile][tile]                       │
└───────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────┐
│ trust benefit 1 | benefit 2 | benefit 3 | benefit 4          │
└───────────────────────────────────────────────────────────────┘
```

The hero is not a conventional left-text/right-photo split with a hard seam. The image and copy visually blend into a single editorial panel.

## 8.2 Hero dimensions

Desktop target:

- min-height: **560–650 px** depending on viewport;
- radius: **20–22 px**;
- overflow: hidden;
- background: warm cream / editorial photo;
- internal padding: **28–38 px**.

The image should occupy approximately 55–62% of the width visually, while text occupies 38–45%.

## 8.3 Hero copy position

Place the hero title left, about 5–8% in from the panel edge and 16–22% from the top.

Title layout should be multiline and intentionally broken, for example:

```text
Little
People
Brighter
Tomorrows
```

or

```text
Little Fits
Big Stories
```

The final line can use accent color in some theme presets.

Description sits 16–22 px below the title, max width 360–420 px.

CTA row sits 18–26 px below description.

## 8.4 Primary CTA

Pill button:

- height 46–50 px;
- padding 0 20–24 px;
- dark ink or theme accent background;
- white text;
- inline right arrow;
- border radius 999 px;
- 14–15 px medium/semi-bold text.

Hover:

- translateY(-1px);
- slight shadow increase;
- arrow shifts 2–3 px right.

## 8.5 Secondary CTA

Outlined/frosted pill:

- transparent warm-white surface;
- subtle border;
- same height as primary;
- no heavy shadow.

## 8.6 Main child image

Image direction:

- one child, waist-up or seated;
- natural smile/expression;
- high-end kids fashion editorial;
- soft natural light;
- shallow depth of field;
- neutral/sage/cream/navy clothing depending on theme;
- uncluttered background;
- eye line slightly off-camera;
- image must not look like a noisy marketplace thumbnail.

Use `object-fit: cover` and compose the crop so the face remains in a safe zone at desktop and tablet.

## 8.7 Decorative handwritten note

Position near the upper-right quadrant of the hero, floating on empty background space.

Examples:

- “Good Outfits Happier Days ♡”
- “Kind Kids Brighter Tomorrows ♡”
- “Play Explore Grow ♡”

Use slightly rotated handwriting, low visual weight, and enough contrast to read without becoming a heading.

## 8.8 Floating circular arrow

A white/frosted circular arrow can appear near the right edge of the hero.

- 40–46 px;
- 1 px border;
- soft shadow;
- centered arrow icon;
- acts as carousel/hero progression only if such behavior exists.

Do not add non-functional arrows.

## 8.9 Category tile dock

The most important home-page ecommerce cue is the row of category cards overlaid at the bottom of the hero.

Desktop:

- 5 tiles visible;
- each tile approximately 155–210 px wide depending on screen;
- height approximately 150–175 px;
- tile radius 14–18 px;
- white/translucent warm surface;
- image occupies 65–75% of tile height;
- label centered at bottom.

Typical categories:

- New In
- Boys
- Girls
- Shoes
- Accessories

or

- Hoodies
- Jackets
- T-Shirts
- Pants
- Shoes

Tiles should overlap the lower editorial imagery without obscuring faces or key content.

Hover:

- rise 3–5 px;
- image scale 1.02;
- border becomes slightly more visible;
- no dramatic spin/tilt.

## 8.10 Trust strip

Immediately beneath the hero, show four equal benefit cells:

1. Sustainable Choices
2. Fast & Reliable Shipping
3. Loved by Parents
4. Easy Returns

Each cell includes:

- line icon 28–34 px;
- short two-line label;
- generous horizontal spacing;
- vertical centering.

Recommended icons:

- leaf;
- delivery truck;
- heart;
- package/gift/return box.

The strip should be 76–96 px tall on desktop.

---

# 9. SHOP / CATEGORY LISTING PAGE

This page must look structured and highly shoppable while retaining the same soft editorial feel.

## 9.1 Desktop composition

Use a two-column layout:

```text
┌───────────────┬──────────────────────────────────────────────┐
│ LEFT SIDEBAR  │ Search / sort                                │
│               │ Editorial category banner                    │
│ Categories    │ Product count + sort                         │
│ Filters       │ Product grid                                 │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

Suggested grid:

```css
grid-template-columns: 190px minmax(0, 1fr);
gap: 16px;
```

At very wide desktop, sidebar can be 210–220 px.

## 9.2 Sidebar

The sidebar is visually light, not a boxed dashboard.

Top heading:

- “Shop”, “Boys”, or “Girls”
- 22–28 px semi-bold.

Category list:

- vertical;
- 34–40 px row height;
- active category sits in a pale rounded rectangle;
- no heavy separators.

Filter group heading:

- 14–16 px 600;
- 14–18 px top margin.

## 9.3 Size chips

Sizes shown as small rounded chips, for example:

- 92
- 98
- 104
- 110
- 116
- 122
- 128
- 134
- 140
- 146
- 152
- 158

Chip dimensions roughly 30–38 px wide × 28–32 px high.

Selected state:

- accent-pale background;
- accent border;
- strong text.

## 9.4 Color swatches

Use 16–20 px circles with 2 px selected ring.

Swatches should correspond to actual available variant data.

## 9.5 Price filter

Use a minimal horizontal range slider.

- thin 2–3 px track;
- round handles;
- numeric min/max labels below;
- do not make the component visually dominant.

## 9.6 Collapsible filters

Groups such as:

- Brand
- Material
- Availability

use compact row + chevron. Maintain current filter functionality.

## 9.7 Search bar

Top of main content:

- width: 55–70% of row;
- height: 42–46 px;
- pill-ish rounded rectangle;
- search icon on left;
- pale surface;
- placeholder “Search for clothes…”;
- no strong box shadow.

## 9.8 Sort control

Place to the right of search or product count depending on space.

- “Newest First” / “Popular” etc.;
- 42–46 px high;
- compact dropdown;
- no huge native select styling.

## 9.9 Editorial banner

Place a wide, shallow banner at the top of the product area.

Desktop target:

- width: full main column;
- height: 130–170 px;
- radius: 16–18 px;
- child image on right half;
- headline on left;
- one compact pill CTA;
- handwritten phrase near the child if space allows.

Example boys banner:

- “Built for Big Adventures”
- navy/sage palette.

Example girls banner:

- “Everyday Outfits for Brighter Days”
- cream/sage/blush palette.

## 9.10 Product grid

Desktop product grid:

- 3 columns in medium content width;
- 4 columns only if the main content area is sufficiently wide and card width remains at least 220–240 px;
- gap 12–16 px.

The reference strongly favors 3 columns at ~1440-wide composite proportions.

## 9.11 Product card anatomy

Each product card contains:

1. Image panel.
2. Heart/wishlist button at image top-right.
3. Product name.
4. Price.
5. Optional color dots.
6. Optional badge (“New”, “Sale”).

Image panel:

- nearly square, slight portrait bias;
- background warm neutral;
- radius 14–16 px;
- object-fit contain or cover based on asset type;
- product centered with generous breathing room.

Card itself should mostly be visually flat: image + text, not a shadowed white box inside a white page.

Product name:

- 13–15 px, 500–600;
- single line where possible;
- 2-line clamp maximum.

Price:

- 13–15 px, 600–700;
- directly below product name.

Wishlist:

- 30–34 px circular white/frosted button;
- top-right 8–10 px inset.

## 9.12 Hover behavior

On product-card hover:

- image scale 1.015–1.03;
- wishlist button becomes slightly more opaque;
- text does not jump;
- card may lift 2 px but should remain subtle.

---

# 10. PRODUCT DETAIL PAGE

The product page is a restrained three-zone composition with a strong visual product image.

## 10.1 Desktop structure

```text
Breadcrumb
┌─────────┬──────────────────────────────┬───────────────────────┐
│ Thumb   │ Main image                  │ Product info          │
│ rail    │                              │ title                 │
│         │                              │ price / rating        │
│         │                              │ description           │
│         │                              │ color                 │
│         │                              │ size                  │
│         │                              │ size guide            │
│         │                              │ qty + add to cart     │
└─────────┴──────────────────────────────┴───────────────────────┘
Trust strip
```

Recommended desktop columns:

```css
grid-template-columns: 74px minmax(480px, 1fr) minmax(330px, 390px);
gap: 14px 18px;
```

## 10.2 Breadcrumb

Top-left, compact:

`← Back to Shop / Boys / Hoodies`

- 12–13 px;
- 42–50 px height zone;
- arrow icon separated from text;
- text-soft color.

## 10.3 Thumbnail rail

Vertical thumbnail stack:

- width 60–74 px;
- 4–6 thumbnails visible;
- each thumbnail 58–70 px square/portrait;
- 8–10 px gap;
- radius 10–12 px;
- selected thumbnail gets accent border or stronger shadow.

One thumbnail may represent video using a centered play icon overlay.

## 10.4 Main image panel

This is the visual anchor.

- surface: soft warm gray/cream;
- radius: 18–22 px;
- min-height: 520–620 px desktop;
- product centered;
- 12–18% internal breathing room around product;
- wishlist button top-right;
- previous/next circular arrows at bottom corners if gallery navigation exists.

Do not crop the clothing item aggressively.

## 10.5 Product info panel

Top alignment must match main image top.

Product title:

- 28–34 px;
- 700 weight;
- max 2 lines.

Price:

- 26–30 px;
- 700;
- close to title.

Rating row:

- gold/orange stars;
- rating number and review count in muted text;
- compact single line.

Description:

- 13–15 px;
- line-height 1.55;
- max width ~360 px.

## 10.6 Color controls

Label: `Color: Sand` / `Color: Navy` etc.

Swatch circles:

- 30–34 px;
- 8–10 px gap;
- selected: double ring or 2 px dark/contrast border;
- accessible text/aria label required.

## 10.7 Size controls

Grid of compact size chips.

- 6–7 chips per row depending on width;
- 34–42 px × 32–36 px;
- rounded 8–10 px;
- disabled sizes visibly muted;
- selected size gets high-contrast accent state.

## 10.8 Size guide

Inline icon + “Size guide” text beneath size chips.

Do not style it as a large button.

## 10.9 Quantity + add to cart row

Desktop:

- quantity control width 130–160 px;
- add-to-cart fills remaining width;
- gap 12–16 px.

Quantity control:

```text
[ − ]   1   [ + ]
```

- 48–52 px height;
- bordered pill;
- centered number.

Add to cart:

- 52–56 px height;
- full-width pill;
- dark ink or theme accent;
- shopping bag icon;
- text 15–17 px medium/semi-bold.

## 10.10 Product trust row

Below main product section show 3–4 horizontally arranged benefits:

- Free shipping over €75
- 30 days return
- Secure payment
- Soft & Comfortable / Sustainable Materials depending on context

Use small line icons and 11–13 px text.

---

# 11. SHOPPING CART PAGE

The cart must feel calm and obvious, with the order summary clearly dominant on the right but not detached from the rest of the design.

## 11.1 Desktop structure

```text
HEADER
┌──────────────────────────────────┬────────────────────────────┐
│ Your Cart                        │ Order Summary              │
│ 3 items                          │ Subtotal                   │
│                                  │ Shipping                   │
│ item 1                           │ Total                      │
│ item 2                           │ CTA                        │
│ item 3                           │ shipping/return/security   │
│                                  │ decorative handwriting     │
│ Continue Shopping                │                            │
└──────────────────────────────────┴────────────────────────────┘
```

Recommended columns:

```css
grid-template-columns: minmax(0, 1fr) 360px;
gap: 18px;
```

## 11.2 Page title

- 30–36 px;
- `Your Cart`;
- item count immediately below in 13–15 px muted text.

Optional `Clear All` action aligns near the upper-right of the item column.

## 11.3 Cart item row

Each item row is a soft outlined card.

Desktop target height: **92–112 px**.

Structure:

```text
[thumbnail] [name + metadata]              [price]
                                      [ −  1  + ] [trash]
```

Thumbnail:

- 64–78 px;
- soft neutral background;
- radius 10–12 px.

Name:

- 14–16 px, 600.

Metadata:

- `Color: Sand | Size: 110`
- 11–13 px muted.

Price:

- 14–16 px, 700;
- right aligned.

Quantity:

- small pill control;
- 96–116 px wide;
- 32–36 px high.

Delete:

- icon only;
- 32–36 px hit target minimum 40 px through invisible padding;
- no red background by default.

## 11.4 Continue shopping

Bottom-left inline action with left arrow.

- not a giant button;
- 14–15 px semi-bold;
- 44 px hit target.

## 11.5 Order summary panel

Surface:

- white/warm surface;
- radius 16–18 px;
- subtle border;
- 18–24 px padding.

Rows:

- Subtotal
- Shipping
- divider
- Total

Total must be visually strong:

- label 20–24 px 600–700;
- price 22–26 px 700.

CTA:

- full width;
- 48–52 px;
- accent/dark pill;
- `Proceed to Checkout →`.

Trust bullets below:

- Free shipping over €75
- 30 days return
- Secure payment

Use 12–14 px text + 20–24 px icons.

## 11.6 Decorative note

A small handwritten phrase such as `Good Choices, Bright Futures ♡` may appear in the unused lower-right corner of the cart page. It is decorative and must not reduce readability.

---

# 12. CHECKOUT — CORE STRUCTURE

Checkout must feel secure, spacious, and editorial without looking like a marketing page.

The reference uses a multi-column desktop checkout combining:

- stepper;
- central form;
- order summary;
- decorative illustration or child image.

## 12.1 Desktop shell

At 1366–1600 px, target:

```text
┌──────────────┬──────────────────────────┬─────────────────┬─────────────────────┐
│ stepper /    │ shipping/payment form    │ order summary   │ editorial image     │
│ decoration   │                          │                 │ / note              │
└──────────────┴──────────────────────────┴─────────────────┴─────────────────────┘
```

Recommended columns:

```css
grid-template-columns: 140px minmax(520px, 1fr) 250px 300px;
gap: 14px;
```

If viewport cannot fit this comfortably, collapse to 3 columns by moving decorative content into the stepper column or beneath the summary.

## 12.2 Checkout stepper

Three steps:

1. Shipping
2. Payment
3. Review

Desktop vertical or horizontal depending on route width, but the reference frequently uses a compact vertical stack on the left.

Each row:

- numbered 28–32 px circle;
- step label 13–15 px;
- active row in white/soft card;
- completed step uses accent fill/check;
- inactive steps gray.

No oversized progress bar.

## 12.3 Decorative side note

On wide layouts the left rail can include leaf illustration + handwritten note:

`Small Steps Brighter Futures ♡`

This is purely decorative and disappears before critical form content on narrower screens.

---

# 13. CHECKOUT — SHIPPING INFORMATION

## 13.1 Form card

Central form lives inside a white surface card:

- radius 16–18 px;
- padding 22–28 px;
- border 1 px subtle;
- no heavy shadow.

Heading:

`Shipping Information`

- 22–26 px;
- 650–700 weight.

## 13.2 Field layout

Desktop:

```text
First Name            Last Name
Address
Postal Code           City
Country ▼
☑ Save this address for next time

                         [ Continue to Payment → ]
```

Use a 2-column field grid with 12–14 px gaps.

Address spans both columns.

Country can span full width or 50–60% if the existing layout supports it.

## 13.3 Inputs

- height 42–46 px;
- radius 8–10 px;
- border subtle;
- pale neutral fill rather than stark white;
- labels 10–12 px muted;
- input text 13–15 px;
- focus ring 2 px accent at 25–35% opacity.

## 13.4 Checkbox

Small squared checkbox with accent fill when checked.

Text: 11–13 px.

## 13.5 Continue button

Align to lower-right or full width on narrow form cards.

- 50–54 px tall;
- dark/accent pill;
- text 14–16 px;
- arrow right.

---

# 14. CHECKOUT — PAYMENT

Payment should use the exact same shell, stepper, card radius, spacing, and typography as shipping.

## 14.1 Payment method card

Heading: `Payment Method`

Stack payment methods as selectable rows:

- iDEAL
- Credit Card
- PayPal
- Klarna
- Gift Card / Voucher

Only show providers actually supported by the project. Do not add fake functional methods just to match the mockup.

Each method row:

- height 48–54 px;
- radio control left;
- method label;
- provider/logo mark right;
- 1 px divider between rows or individual soft cards;
- selected row gets pale accent background and accent radio.

## 14.2 Billing checkbox

`Billing address same as shipping`

Place below payment options.

## 14.3 Continue to review

Same CTA geometry as shipping.

---

# 15. ORDER SUMMARY DURING CHECKOUT

The summary is a narrow but readable card.

## 15.1 Anatomy

Header:

- `Order Summary`
- item count beneath or next to it;
- compact `Edit` action on top-right.

Line items:

- thumbnail 42–54 px;
- product name 12–14 px, 600;
- size/qty metadata 10–12 px;
- price right aligned 12–14 px, 700.

Totals:

- subtotal;
- shipping;
- total.

Total uses 20–24 px type.

## 15.2 Checkout editorial image

On wide desktop, place a tall child image immediately to the right of the order summary.

Direction:

- child shown from rear or three-quarter angle with backpack/jacket;
- warm outdoor bokeh;
- rounded top/right edges;
- decorative handwritten message placed over negative space;
- never cover the child’s face if visible.

A small value strip can sit at the bottom of the image:

- Kind Kids / Brighter Planet
- Happy Families
- A Kinder Tomorrow

Use line icons and short phrases.

---

# 16. ORDER CONFIRMATION / THANK-YOU PAGE

The completion page must feel celebratory without becoming a confetti screen.

## 16.1 Desktop composition

Use a large white/cream card with generous center whitespace.

Primary content center-left or center:

- large check icon in filled dark/accent circle;
- `Thank You!`
- `Your order has been placed.`
- confirmation email line;
- order number;
- `Track Your Order →` outlined pill.

Editorial image sits on the right third.

## 16.2 Check icon

- 58–72 px circle;
- deep accent/ink fill;
- white checkmark;
- centered.

## 16.3 Title

`Thank You!`

- 36–46 px;
- 700;
- line-height 1.0–1.1.

Supporting text:

- 14–16 px;
- centered;
- muted.

## 16.4 Tracking timeline

At the bottom, use a horizontal four-stage progress strip:

1. Order Confirmed — Just now
2. Packed — 1–2 days
3. On The Way — 2–4 days
4. Delivered — Enjoy!

Each stage:

- 38–46 px circle icon;
- horizontal connector line;
- label 11–13 px 600;
- metadata 10–12 px muted.

Only first stage is active immediately after purchase.

On mobile this becomes a vertical timeline or horizontally scrollable stepper if required.

---

# 17. BUTTON SYSTEM

Buttons must be consistent across all pages.

## 17.1 Primary

```css
height: 48-54px;
border-radius: 999px;
background: var(--accent-strong) or var(--ink);
color: white;
font-weight: 600;
padding-inline: 20-26px;
```

Hover:

- translateY(-1px);
- brightness +2–4% or shadow increase;
- 140–180 ms ease-out.

## 17.2 Secondary

- transparent/white surface;
- 1 px subtle border;
- dark text;
- same height as primary where paired.

## 17.3 Icon button

- circle 38–44 px;
- soft white surface;
- 1 px border;
- centered 18–20 px icon.

## 17.4 Destructive action

Do not use a giant red destructive button in cart. Trash remains minimal. Confirmation modal/toast can use semantic destructive styling.

---

# 18. FORM SYSTEM

Use one consistent form system across login/account/checkout if those screens exist.

- field height 42–46 px;
- label above;
- light neutral fill;
- radius 9–10 px;
- compact helper/error text;
- no floating labels unless the existing component library already uses them;
- focus ring accent with adequate contrast;
- error border in muted red, not fluorescent red.

Dropdown chevrons should be custom/simple and visually match the thin icon set.

---

# 19. ICONOGRAPHY

Use one line-icon family throughout.

Target characteristics:

- 1.5–2 px stroke;
- rounded caps/joins;
- simple geometric forms;
- no mixed filled Material icons alongside thin line icons.

Core icons:

- search;
- shopping bag;
- heart;
- user/avatar fallback;
- arrow left/right;
- truck;
- leaf;
- return/package;
- gift/box;
- lock;
- shield;
- clock;
- star;
- plus/minus;
- trash;
- play;
- chevron.

---

# 20. IMAGE TREATMENT

## 20.1 Product photography

Product images should appear on a soft neutral background with even studio lighting.

Rules:

- no hard rectangular stock-photo borders;
- image background should harmonize with `surface-muted`;
- consistent crop and scale across the product grid;
- no random aspect ratios in a single row;
- maintain product color accuracy.

## 20.2 Editorial children imagery

Editorial images carry much of the emotional feel.

Characteristics:

- natural expressions;
- neutral/outdoor/soft-studio environment;
- shallow depth of field;
- warm natural light;
- muted wardrobe palette;
- premium campaign-photo styling;
- child occupies 45–70% of frame depending on route;
- retain negative space for headline or doodle placement.

## 20.3 Focal-point handling

Where possible, store an `object-position` or image focal point in theme/CMS data so desktop and mobile crops preserve faces.

---

# 21. HANDWRITTEN DOODLES AND BOTANICAL ELEMENTS

These details are part of the reference’s personality but must remain secondary.

Use:

- simple leaves;
- thin hearts;
- hand-drawn arrows;
- small rainbow/cloud/flower doodles in playful theme only;
- hand-written short phrases.

Do not use more than 2–3 decorative motifs per major screen.

Botanical elements should be low-saturation and partially cropped by container edges so they feel editorial rather than like clip art pasted in the center.

Decorations must use `pointer-events: none` and must not participate in tab order.

---

# 22. SUBTLE GLASS / LIQUID SURFACES

The references support a very restrained frosted look.

Use glass only for:

- header icon buttons;
- active nav pill;
- floating arrow buttons;
- category cards overlaying an image;
- some badges.

Suggested treatment:

```css
background: rgba(255,255,255,.72);
backdrop-filter: blur(10px) saturate(110%);
border: 1px solid rgba(255,255,255,.58);
box-shadow: 0 6px 20px rgba(28,24,20,.06);
```

Do not apply heavy glass to entire pages or form surfaces.

---

# 23. MOTION AND MICROINTERACTIONS

Motion should imply premium tactility.

## 23.1 Timing

- micro hover: 120–180 ms;
- card/image transition: 180–240 ms;
- drawer/modal: 220–320 ms;
- carousel slide: 320–450 ms.

Use ease-out or cubic-bezier close to `(0.22, 1, 0.36, 1)`.

## 23.2 Hover

Cards:

- translateY -2 to -4 px maximum;
- shadow increases slightly;
- image scale no more than 1.03.

Buttons:

- arrow translates 2–3 px;
- button rises 1 px.

## 23.3 Reduced motion

Respect `prefers-reduced-motion` and disable non-essential translations/scales.

---

# 24. RESPONSIVE BEHAVIOR

Do not merely shrink desktop. Recompose deliberately.

## 24.1 Breakpoint guidance

Use the project’s existing breakpoint system if present. Equivalent intent:

- Large desktop: `>= 1440`
- Desktop: `1200–1439`
- Tablet landscape: `900–1199`
- Tablet portrait: `768–899`
- Mobile: `< 768`
- Small mobile: `< 420`

## 24.2 Header on tablet/mobile

At <= 900 px:

- keep logo left;
- keep search/cart/account utilities right;
- collapse central nav behind a menu or horizontal drawer;
- preserve cart badge;
- header height 58–64 px;
- avoid two-row header unless current UX requires it.

## 24.3 Home mobile

The hero becomes a vertical card:

1. headline and copy;
2. CTA row;
3. child image;
4. horizontal category scroller overlapping lower image edge.

Target hero height should be content-driven, roughly 720–860 px depending on viewport.

Category cards become horizontally scrollable:

- 140–160 px wide;
- `scroll-snap-type: x mandatory`;
- hide scrollbar visually but preserve scrolling.

Trust strip becomes 2×2 grid.

## 24.4 Shop mobile

- filters move into a slide-over drawer or bottom sheet;
- search and sort remain visible;
- product grid = 2 columns on normal mobile, 1 column only on very narrow devices;
- category editorial banner becomes compact and 16:9-ish;
- product card text remains 13–15 px.

## 24.5 Product mobile

Order:

1. breadcrumb;
2. horizontal image gallery;
3. product title + price + rating;
4. description;
5. color;
6. size;
7. sticky add-to-cart area near viewport bottom if current architecture supports it;
8. trust benefits.

Do not keep thumbnail rail vertical on mobile.

## 24.6 Cart mobile

Single column.

- cart items first;
- order summary second;
- summary CTA may be sticky at bottom only if it does not obscure item controls;
- item rows may use 2-row layout;
- price stays easily visible.

## 24.7 Checkout mobile

Single column.

Order:

1. compact horizontal stepper;
2. form;
3. order summary accordion or full card;
4. editorial image hidden or moved to completion page.

No four-column checkout on tablet/mobile.

## 24.8 Order confirmation mobile

- image moves beneath main confirmation or becomes a cropped banner;
- tracking timeline becomes vertical;
- CTA full width.

---

# 25. ACCESSIBILITY

Visual fidelity must not reduce accessibility.

Required:

- text contrast at least WCAG AA;
- focus-visible state on every interactive control;
- 44×44 px effective hit target for touch controls;
- alt text for editorial/product images;
- color swatches also expose text labels;
- selected size/color not communicated by color alone;
- form errors associated with fields;
- semantic heading order;
- correct button vs link semantics;
- wishlist/cart badge readable to screen readers;
- keyboard navigation through carousel/category rail;
- reduced-motion support.

---

# 26. IMPLEMENTATION GUARDRAILS

This file defines a **visual overhaul**, not a backend rewrite.

## 26.1 Preserve existing functional systems

Unless the repository itself proves a component is dead/unused, do not replace or remove working:

- route structure;
- authentication;
- catalog API/data source;
- inventory logic;
- variant selection logic;
- pricing/tax calculations;
- discount logic;
- cart persistence;
- checkout state;
- payment provider integration;
- shipping integration;
- order creation;
- account/customer data;
- analytics/consent;
- CMS/no-code configuration;
- accessibility behavior;
- tests.

## 26.2 Presentation-layer strategy

Prefer:

1. existing components + new tokens/styles;
2. component composition changes;
3. new presentational wrapper/components;
4. only then minimal refactors needed to support layout.

Do not re-platform the app to match the mockup.

## 26.3 No hardcoded demo data in production paths

The mockup names/prices are examples.

Use live/existing catalog data. Hardcoded placeholder data is allowed only in Storybook/dev fixture/demo routes already intended for that purpose.

## 26.4 Theme/no-code compatibility

If the project already supports configurable themes or a no-code builder:

- expose colors, hero copy, hero image, category tiles, trust-strip copy, editorial banner, doodle text, and decorative assets through the existing configuration model;
- do not hardwire them into JSX/templates unless the architecture already does so;
- keep the reference layout as a reusable theme/template preset rather than destroying existing templates.

---

# 27. PAGE-SPECIFIC PROPORTION TARGETS

These are visual targets, not absolute hardcoded sizes.

| Area | Desktop target proportion |
|---|---:|
| Global shell width | 1380–1440 px max |
| Header height | 64–72 px |
| Home hero height | 560–650 px |
| Home text zone | 38–45% |
| Home image zone | 55–62% |
| Category dock tile height | 150–175 px |
| Shop sidebar | 190–220 px |
| Shop editorial banner | 130–170 px high |
| Shop product grid | 3 cols preferred |
| Product thumb rail | 60–74 px |
| Product main image | 520–620 px high |
| Product info column | 330–390 px |
| Cart summary | 340–380 px |
| Checkout form | 520–700 px |
| Checkout summary | 230–290 px |
| Checkout editorial image | 280–340 px |

The final implementation should visually match these ratios across responsive widths, not mechanically use every pixel value.

---

# 28. COMPONENT INVENTORY

OpenCode should map or create presentational equivalents for the following component set.

## Shell

- `SiteShell`
- `SiteHeader`
- `BrandLockup`
- `PrimaryNav`
- `HeaderActions`
- `IconButton`
- `CartBadge`

## Home

- `EditorialHero`
- `HeroCopy`
- `HeroDoodle`
- `HeroArrow`
- `CategoryDock`
- `CategoryTile`
- `TrustStrip`
- `TrustItem`

## Shop

- `ShopSidebar`
- `CategoryList`
- `FilterGroup`
- `SizeFilter`
- `ColorFilter`
- `PriceFilter`
- `ShopSearch`
- `SortControl`
- `CategoryBanner`
- `ProductGrid`
- `ProductCard`
- `WishlistButton`
- `ColorDots`

## Product

- `Breadcrumb`
- `ProductGallery`
- `ThumbnailRail`
- `ProductHeroImage`
- `ProductInfo`
- `RatingRow`
- `ColorSelector`
- `SizeSelector`
- `QuantitySelector`
- `AddToCartButton`
- `ProductTrustRow`

## Cart

- `CartList`
- `CartItem`
- `OrderSummaryCard`
- `CartTrustList`

## Checkout

- `CheckoutShell`
- `CheckoutStepper`
- `CheckoutFormCard`
- `ShippingForm`
- `PaymentMethodList`
- `CheckoutOrderSummary`
- `CheckoutEditorialPanel`

## Confirmation

- `OrderSuccessHero`
- `OrderTrackingTimeline`

If equivalents already exist, style/refactor those rather than duplicating functionality.

---

# 29. DETAILED SPACING RHYTHM

Use an 8 px base with occasional 4 px micro-spacing.

Recommended tokens:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
```

Rules:

- 8–12 px between label and field.
- 12–16 px between related controls.
- 16–24 px between component groups.
- 24–32 px between major sections inside a card.
- 32–48 px around hero content blocks.

Avoid arbitrary values such as 17, 23, 31 px unless required for actual optical alignment.

---

# 30. VISUAL STATES

Every interactive element needs these states:

- default;
- hover;
- focus-visible;
- active/pressed;
- selected;
- disabled;
- loading where relevant;
- error where relevant.

## 30.1 Selected states

Selected chips/swatches should be obvious but restrained:

- 2 px accent ring;
- pale accent fill;
- stronger text.

## 30.2 Loading states

Use skeletons with the same rounded geometry as final content.

Avoid spinners in every product card.

## 30.3 Empty states

Cart/wishlist/search empty states must remain in this visual language:

- centered simple line illustration/icon;
- short heading;
- one action;
- no giant cartoon illustration unless already part of the brand assets.

---

# 31. VISUAL QA / ACCEPTANCE CRITERIA

The page is **not complete** merely because the same sections exist. It is complete when the visual hierarchy and proportions also match.

OpenCode must verify:

## 31.1 Global

- [ ] Shell uses warm outer canvas and off-white inner surfaces.
- [ ] Header is compact and visually identical across routes.
- [ ] Radius hierarchy is consistent.
- [ ] Shadows are soft and low-opacity.
- [ ] Typography uses the stated hierarchy.
- [ ] No random component-library defaults remain visible.
- [ ] Buttons share one coherent geometry.
- [ ] Icons share one stroke style.

## 31.2 Home

- [ ] Hero feels like one editorial composition rather than two disconnected columns.
- [ ] Large child image has correct visual dominance.
- [ ] Headline occupies the left editorial zone.
- [ ] Primary + secondary CTA row matches reference scale.
- [ ] Five category tiles are visible on normal desktop.
- [ ] Category dock visually overlaps/anchors the lower hero.
- [ ] Trust strip contains four evenly weighted items.
- [ ] Decorative handwriting is present but subordinate.

## 31.3 Shop

- [ ] Left sidebar is narrow and light.
- [ ] Banner sits above products and matches shallow editorial proportions.
- [ ] Product cards are image-led and mostly flat.
- [ ] Wishlist buttons sit inside image corners.
- [ ] Product grid density matches a premium boutique, not a marketplace.
- [ ] Filters are usable and compact.

## 31.4 Product

- [ ] Thumbnail rail is visibly separate from main image.
- [ ] Main image is large and uncluttered.
- [ ] Product information aligns to top of image.
- [ ] Price and title are immediately visible.
- [ ] Color and size controls resemble the reference chips/swatches.
- [ ] Add-to-cart is a large dark/accent pill.
- [ ] Trust row sits below main interaction area.

## 31.5 Cart

- [ ] Cart items are calm outlined rows, not giant cards.
- [ ] Thumbnail/name/meta/price/quantity hierarchy is clear.
- [ ] Summary card is narrow and prominent.
- [ ] Total is visually stronger than subtotal/shipping.
- [ ] Checkout CTA is full-width within summary.

## 31.6 Checkout

- [ ] Stepper, form, summary, and editorial content align as one desktop composition.
- [ ] Form fields are compact, soft, and consistent.
- [ ] Payment method rows match the same card language.
- [ ] Decorative artwork never competes with form completion.
- [ ] Mobile layout becomes single-column cleanly.

## 31.7 Confirmation

- [ ] Large checkmark and thank-you title dominate the content.
- [ ] Order details are easy to scan.
- [ ] Tracking CTA is visible.
- [ ] Right-side editorial image feels integrated.
- [ ] Progress timeline has four stages and clear active state.

---

# 32. RESPONSIVE QA WIDTHS

Test at minimum:

- 1600 × 1000
- 1440 × 900
- 1280 × 800
- 1024 × 768
- 834 × 1194
- 768 × 1024
- 430 × 932
- 390 × 844
- 360 × 800

For each width verify:

- no accidental horizontal scrolling;
- no clipped text;
- no overlapping controls;
- correct image focal point;
- correct navigation collapse;
- cart/checkout remain fully operable;
- tap targets remain >= 44 px effective size;
- cards do not become excessively narrow;
- product grid does not create unreadable labels.

---

# 33. IMPLEMENTATION ORDER

Execute in small, testable chunks.

## Chunk 1 — Audit and mapping

- map existing routes/components/styles;
- identify current token/theme system;
- identify business-logic boundaries that must not be changed;
- identify reusable components.

No visual rewrite yet except harmless token scaffolding.

## Chunk 2 — Global tokens + shell

- color variables;
- typography;
- spacing;
- radii;
- shadows;
- shell canvas;
- header/navigation/icon buttons.

Verify across all existing pages.

## Chunk 3 — Home

- editorial hero;
- category dock;
- trust strip;
- responsive home composition.

## Chunk 4 — Shop/category

- sidebar;
- filter controls;
- search/sort;
- editorial banner;
- product grid/cards.

## Chunk 5 — Product detail

- gallery;
- info panel;
- swatches/sizes;
- quantity;
- add-to-cart;
- trust row.

## Chunk 6 — Cart

- cart rows;
- summary;
- responsive cart.

## Chunk 7 — Checkout

- stepper;
- shipping form;
- payment method presentation;
- order summary;
- editorial side panel;
- responsive checkout.

## Chunk 8 — Confirmation

- thank-you composition;
- timeline;
- responsive confirmation.

## Chunk 9 — Motion/accessibility polish

- hover/focus states;
- reduced motion;
- accessible labels;
- loading/empty states.

## Chunk 10 — Visual regression pass

- compare each page against this document section-by-section;
- fix spacing, scale, radius, typography, and proportion drift;
- do not accept “close enough” if the layout hierarchy is visibly different.

---

# 34. FINAL VERIFICATION CONTRACT

Before considering this design implementation complete, OpenCode must produce evidence that:

1. Every named route/page in this document is implemented or mapped to the corresponding existing route.
2. Existing functional behavior still passes current automated tests.
3. No checkout/payment/catalog/cart behavior was silently replaced by mock behavior.
4. Desktop and mobile screenshots or browser captures exist for visual inspection.
5. Header, home hero, shop layout, product layout, cart, checkout, and confirmation visually conform to the proportions defined here.
6. No obvious generic component-library defaults remain.
7. No hardcoded mock products replaced live catalog data.
8. Theme colors can change without breaking geometry.
9. Focus, keyboard, contrast, and reduced-motion requirements are preserved.
10. The implementation is visually cohesive across the entire customer shopping journey.

---

# 35. STRICT DO-NOT-DRIFT RULES

OpenCode must not reinterpret this design into:

- a dark-first ecommerce theme;
- a dashboard with sidebar navigation on every route;
- a flat square-cornered store;
- a neon/glassmorphism showcase;
- a minimalist store with no editorial imagery;
- a marketplace with dense price badges and promotional ribbons;
- a generic Tailwind/shadcn default UI;
- a mobile-first layout simply stretched to desktop;
- a desktop grid simply squeezed onto mobile;
- a completely different checkout structure;
- a different typography hierarchy;
- a different visual navigation paradigm.

If a detail is unspecified, choose the option that best preserves the core reference language: warm, rounded, editorial, premium, spacious, and conversion-focused.

---

# 36. ONE-SENTENCE NORTH STAR

**The finished Miski experience should look like a premium Scandinavian-style kidswear boutique blended with a soft editorial campaign: warm off-white surfaces, large natural child photography, quiet rounded commerce controls, compact navigation, refined product grids, subtle frosted details, and a frictionless shopping journey from hero to confirmation.**

