# Self-hosted font specimens

Retrieved 2026-11-14 from the official Google Fonts CSS API and its
`fonts.gstatic.com` font CDN. Font bytes are checked into `public/fonts/`; the
website makes no runtime requests to Google Fonts. No npm dependency was added.

All five candidates use the **SIL Open Font License 1.1**, which permits free
commercial use and redistribution with the license and copyright notices.
The original license files are preserved beside the fonts. The font binaries
were downloaded as supplied by Google Fonts, without local modification.

## Choices and budget

| Specimen | Families loaded when used                 | Font bytes | Budget              |
| -------- | ----------------------------------------- | ---------: | ------------------- |
| A        | Fraunces + Inter + JetBrains Mono         |    122,204 | Under 150,000 bytes |
| B        | Instrument Serif + Geist + JetBrains Mono |     90,836 | Under 150,000 bytes |

There are five candidates in the repository, but each specimen uses **three
families**. Declaring a font face does not itself request its file; only fonts
actually used by the page should load. Do not preload all five candidates.
Preload only the chosen specimen's display face where it is used above the fold.
`src/styles/fonts.css` declares `font-display: swap` for every face.

Instrument Serif is an explicit exception to the brief's variable-font wording:
the upstream family supplies static regular and italic cuts at weight 400.
This specimen uses the real regular 400 file, not a falsely declared variable
range or a synthetic bold face. [Official family metadata](https://github.com/google/fonts/blob/main/ofl/instrumentserif/METADATA.pb).

The initial Fraunces and Inter downloads included their optical-size axes and
took specimen A over budget. The final files retain variable weights but fix
Fraunces to optical size 144 for display and Inter to optical size 14 for body/UI.
That reduces the trio from 180,628 to 122,204 bytes. No italics or extra scripts
are included; add them only when real content needs them and recheck the budget.

## Font inventory

| Family           | Local file                     | Weight                    |  Bytes | Google Fonts CDN revision |
| ---------------- | ------------------------------ | ------------------------- | -----: | ------------------------- |
| Fraunces         | `fraunces-latin.woff2`         | 100–900, optical size 144 | 33,544 | v38                       |
| Inter            | `inter-latin.woff2`            | 100–900, optical size 14  | 48,256 | v20                       |
| Instrument Serif | `instrument-serif-latin.woff2` | 400, static               | 21,032 | v5                        |
| Geist            | `geist-latin.woff2`            | 100–900                   | 29,400 | v5                        |
| JetBrains Mono   | `jetbrains-mono-latin.woff2`   | 100–800                   | 40,404 | v24                       |

CDN revision labels are Google's delivery revisions, not upstream release
version numbers. Exact source URLs, byte counts, and SHA-256 digests are pinned in
[`public/fonts/manifest.json`](../public/fonts/manifest.json).

## Attribution and upstream sources

| Family           | Authors / upstream                                                                               | Preserved license                              |
| ---------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Fraunces         | [Undercase Type, Phaedra Charles, Flavia Zimbardi](https://github.com/undercasetype/Fraunces)    | [OFL](../public/fonts/fraunces-OFL.txt)        |
| Inter            | [Rasmus Andersson](https://github.com/rsms/inter)                                                | [OFL](../public/fonts/inter-OFL.txt)           |
| Instrument Serif | [Rodrigo Fuenzalida, Jordan Egstad / Instrument](https://github.com/Instrument/instrument-serif) | [OFL](../public/fonts/instrumentserif-OFL.txt) |
| Geist            | [The Geist Project Authors / Vercel](https://github.com/vercel/geist-font)                       | [OFL](../public/fonts/geist-OFL.txt)           |
| JetBrains Mono   | [JetBrains, Philipp Nurullin, Konstantin Bulenkov](https://github.com/JetBrains/JetBrainsMono)   | [OFL](../public/fonts/jetbrainsmono-OFL.txt)   |

The licenses were retrieved from the corresponding `ofl/<family>/OFL.txt` in
[Google's official font repository](https://github.com/google/fonts/tree/main/ofl).
Family metadata was checked there to verify styles and variable axes.
The Google Fonts request used the CSS2 API with `display=swap`, a current desktop
browser user agent, and the Latin block from each response. For the two fixed
optical sizes the requested families were
`Fraunces:opsz,wght@144,100..900` and `Inter:opsz,wght@14,100..900`.

## Validation

- All five license files identify SIL OFL 1.1.
- Each downloaded binary has the WOFF2 `wOF2` signature and matches its manifest
  size and SHA-256 digest.
- Each candidate trio is below the 150 KB font-transfer budget.
- Internal name and variation tables were inspected with fontTools 4.68.0 and
  Brotli 1.2.1, installed only in the ignored tooling cache. They identify
  Fraunces 144pt, Inter, Instrument Serif, Geist, and JetBrains Mono respectively.
  Fraunces, Inter, and Geist retain a 100–900 weight axis; JetBrains Mono retains
  100–800; Instrument Serif has no variation axis. The Fraunces axis defaults to
  900 internally, so the CSS font-face range and explicit weight are necessary
  to select the intended 400 display weight.
- Browser loading, layout, and font rendering are checked with the specimen pages
  in the Phase 2 report. File checks alone do not prove visual behavior or CLS.
