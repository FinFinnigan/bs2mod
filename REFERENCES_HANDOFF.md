# Reference Images Handoff

This document is for the next coding session. The reference images are stored in
the shared project folder and must be used as the visual source of truth when
building or adjusting the pages.

## Source Folder

`C:\dev\BS2Mod-site\references\`

Open the images directly from that folder. Do not replace them with guessed
layouts, generic page designs, or remembered descriptions.

## Reference Set

The current reference set contains these 11 images:

1. `ChatGPT Image Sep 23, 2026, 02_38_46 AM.png`
2. `ChatGPT Image Sep 23, 2026, 02_44_54 AM.png`
3. `ChatGPT Image Sep 23, 2026, 02_44_57 AM.png`
4. `ChatGPT Image Sep 23, 2026, 02_45_00 AM.png`
5. `ChatGPT Image Sep 23, 2026, 02_45_03 AM.png`
6. `ChatGPT Image Sep 23, 2026, 02_48_37 AM.png`
7. `ChatGPT Image Sep 23, 2026, 02_50_46 AM.png`
8. `ChatGPT Image Sep 23, 2026, 02_53_44 AM-1.png`
9. `ChatGPT Image Sep 23, 2026, 02_53_44 AM-2.png`
10. `ChatGPT Image Sep 23, 2026, 02_53_45 AM-3.png`
11. `ChatGPT Image Sep 23, 2026, 02_53_46 AM-4.png`

## Required Reading Order

Inspect every image before making visual changes. Group images that show the
same page at different states or viewport sizes. Record which image maps to
which route or page before implementing.

For each page, match:

- Overall page structure and section order.
- Header, navigation, logo, and menu behaviour.
- Exact visible wording, labels, headings, and button text.
- Typography hierarchy, weight, alignment, and line spacing.
- Background colours, borders, shadows, gradients, and corner radii.
- Image crops, aspect ratios, overlays, and focal points.
- Card, grid, list, form, and table dimensions.
- Desktop/mobile differences and responsive breakpoints.
- Hover, selected, disabled, expanded, loading, and empty states shown.
- Spacing between sections and alignment with the page edges.

## Implementation Rules

- The screenshots take priority over assumptions about the existing design.
- Reuse existing project components and styles where they already match the
  references; change only what is needed to reproduce the references.
- Keep the same visual hierarchy and proportions before adding any polish.
- Do not add new sections, controls, animations, colours, or copy that are not
  present in the references unless the existing application requires them to
  function.
- Use the actual reference images while checking the result at the same page
  size shown in each image.
- Check both wide and narrow layouts if the reference set contains both.

## Verification Checklist

Before considering a page complete:

- Every visible section from its reference is present and in the same order.
- Text is readable and matches the reference exactly.
- Main edges, columns, cards, buttons, and images align with the reference.
- Colours, contrast, borders, shadows, and radii are visually close.
- Images use the same crop and approximate visual emphasis.
- The page still works at the reference viewport sizes.
- No unrelated pages or shared components were changed accidentally.

## Important Note

This file is a handoff index, not a substitute for viewing the images. The
next session has access to the same files through the shared workspace and
should inspect them before coding or reviewing the pages.
