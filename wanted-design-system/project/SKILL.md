---
name: wanted-design
description: Use this skill to generate well-branded interfaces and assets for Wanted (원티드, Wanted Lab), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, icons, and UI kit components for prototyping Wanted's recruitment/career product.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (tokens in `tokens/`, components in `components/`, foundation specimens in `guidelines/`, the interactive UI kit in `ui_kits/wanted/`, and brand assets in `assets/logos/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view — link `styles.css` for tokens/fonts, reuse the `.wt-*` type classes, and pull the Wanted wordmark/symbol from `assets/logos/`. If working on production code, copy assets and read the rules here to become an expert in designing with this brand: Wanted Blue `#0066FF`, Pretendard JP, cool-grey neutrals, hairline borders over shadows, generous rounded corners, and 해요체 Korean copy.

The reusable React components live in `components/<group>/<Name>.jsx` and are bundled onto `window.WantedDesignSystem_3ed5bb` (see each directory's `.card.html` for usage and the `.prompt.md` for guidance). Compose them rather than re-implementing primitives.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few focused questions (surface, audience, light/dark, Korean/English copy), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
