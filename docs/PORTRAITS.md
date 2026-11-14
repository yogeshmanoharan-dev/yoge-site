# Website portraits

Prepared on 2026-11-14 from images supplied by Yoge for this website design revision.
The supplied appearance is preserved: these files received local resizing and WebP
encoding only. No crop, retouching, background removal, or generated image changes
were applied. No image service, API, payment, or new dependency was used.

The original PNG files remain unchanged locally in `src/assets/portraits/` and
are git-ignored. Only optimized browser assets are versioned in
`public/images/portraits/`; these contain no EXIF, ICC, IPTC, or XMP metadata.
CSS fits each image to its responsive frame without changing its source file.

## Sources

| Supplied filename                      | Repository source                          | Dimensions  |     Bytes | SHA-256                                                            |
| -------------------------------------- | ------------------------------------------ | ----------- | --------: | ------------------------------------------------------------------ |
| Contemplative Monochrome Portrait.png  | `src/assets/portraits/yoge-monochrome.png` | 1122 × 1402 | 2,413,805 | `5ad48c9e45021398230dba72d8743c43669ec4e54117cd9145e51d4a56fad2a8` |
| Focused Work at a Warm Wooden Desk.png | `src/assets/portraits/yoge-at-work.png`    | 1024 × 1536 | 2,120,797 | `c565c446dd87abeb2110970a0dbe09616a323483c66b98dba0dbcd4427ee3c62` |

## Generated files

| File                                                | Actual dimensions |   Bytes | SHA-256                                                            |
| --------------------------------------------------- | ----------------- | ------: | ------------------------------------------------------------------ |
| `public/images/portraits/yoge-monochrome-480.webp`  | 480 × 600         |  23,376 | `a05cd8d00c116629e2cfc3375bbb8f15ec70eec2334cc131ac022ddb6e70d9ed` |
| `public/images/portraits/yoge-monochrome-800.webp`  | 800 × 1000        |  65,692 | `f04267bbfe1cee272ce081dceaac2cc7ff9dbadeb1324afa5f2b07a0668c7acc` |
| `public/images/portraits/yoge-monochrome-1120.webp` | 1120 × 1400       | 115,328 | `248c6348342acf233406f8066efa0e60d9b4ef16808b6439d55dcc286d48cff1` |
| `public/images/portraits/yoge-at-work-480.webp`     | 480 × 720         |  25,726 | `e46a867bcc6fb24809dd24d6e3901a918753eb0ad2c254f1e9b469edf7889a77` |
| `public/images/portraits/yoge-at-work-800.webp`     | 800 × 1200        |  64,072 | `092319406b5339ede4140438a711ba24e851ae4cc7716d1cecc338835b2c6aee` |
| `public/images/portraits/yoge-at-work-1120.webp`    | 1024 × 1536       |  98,144 | `006afbde1ace902efe4e0cf73a59c54f8f4fc82959756867bb4f0e60aa787126` |

Requested width variants are 480, 800, and 1120 pixels. Enlargement is disabled:
`yoge-at-work-1120.webp` retains the original 1024-pixel width. Its HTML `srcset`
descriptor must therefore be **1024w**, despite the requested-variant filename.

## Processing and verification

- Existing installed Sharp 0.35.5; local project Node v26.13.1.
- WebP quality 82, effort 6; aspect ratio preserved.
- Every encoded file was decoded with Sharp to verify its format, dimensions,
  and absence of embedded metadata.
- Source and output SHA-256 hashes are recorded above for provenance.
- Both largest variants were visually inspected after encoding; the supplied
  compositions and facial detail remain intact.
