# Family Archive Check — visual thesis

## Direction

The interface borrows the confidence and geometry of a 1930s art-deco transit poster. A family archive is treated as precious cargo moving between two stations: the main collection and its independent copy. Bold rails, stepped corners, ticket-like labels, and a sunburst communicate routes and readiness without making the app feel like a photo manager.

## Palette

- `ink` `#172A2A`: near-black green for body text and deep panels.
- `paper` `#F4EBD8`: warm archival paper for the main background.
- `paper-raised` `#FFF9EA`: readable raised surfaces.
- `teal` `#0E5D5E`: primary controls and route lines.
- `gold` `#D49B2A`: ticket accents and focus rings.
- `coral` `#842D27`: warnings and unmatched items.
- `green` `#26734D`: complete and readable states.
- `muted` `#414A46`: secondary text, checked at 4.5:1 on paper.

This is an intentionally single-mode, paper-and-ink treatment. The dark sections provide contrast and visual rest instead of a separate dark theme.

## Type

- Display: `Arial Narrow`, `Aptos Narrow`, then system sans-serif. Tall uppercase headlines echo destination boards without adding a font download.
- Body: `Georgia`, `Times New Roman`, then serif. It reads like a durable printed catalog and remains familiar at small sizes.
- Labels and file data return to the narrow sans stack with tabular figures.

No fonts load from a third party. The system stacks keep the first visit small and offline-safe.

## Space and shape

Spacing follows an 8 px base: 8, 16, 24, 32, 48, 64, and 96 px. Content measures at most 70 characters. Cards use clipped or stepped corners, 2 px ink borders, and offset shadows. Route lines join related checks; isolated features do not become generic cards. Controls are at least 44 px tall.

## Interaction grammar

The archive check reads from left to right as a route: choose the main folder, choose an independent copy, check, then export. A moving gold marker crosses that route during a scan. State labels always pair color with words and symbols. File paths stay visible and can wrap.

## Motion policy

The signature motion is one 600 ms route-marker trip when a check begins. Results rise by 8 px over 220 ms. Nothing loops. With `prefers-reduced-motion: reduce`, both changes become instant opacity changes and smooth scrolling is disabled.

## Asset plan and provenance

The hero is an original generated illustration: an art-deco railway inspection hall where two labeled-in-shape archive trunks follow parallel rails toward a glowing verification gate. It contains no people, brands, logos, or text. The empty side of the composition leaves room for interface copy. The app uses hand-authored SVG marks for functional icons and a CSS route diagram for live state.

Prompt sheet:

> Use case: stylized-concept. Asset type: wide landing hero and social preview source. Scene: an imagined 1930s art-deco railway inspection hall for preserving family photographs. Subject: two sturdy archival cases traveling on parallel brass rails through a precise circular verification gate, with small abstract photo sleeves and film reels visible, but no readable text. Style: refined screen-printed transit poster, crisp geometric shapes, subtle paper grain, flat layered perspective. Composition: wide landscape, major scene on the right, calm negative space on the left, strong diagonal route toward the gate. Light: warm sunrise behind the gate, trustworthy and calm. Palette: parchment, deep bottle green, oxidized teal, muted coral, brass gold. Avoid: people, faces, brands, logos, legible text, watermarks, gradients, glossy 3D, generic cloud symbols, damaged media, clutter.

Generation: Azure AI Foundry factory image deployment through `/opt/fleet/lib/gen-image.sh`, 2026-08-28. Generated work is original for this product. Source PNG and prompt sidecar live in `assets/src/`; optimized WebP derivatives ship in `public/assets/`.
