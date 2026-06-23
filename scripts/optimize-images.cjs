/* One-off image optimizer: resizes oversized source images and re-compresses
 * them in place (same filenames → no code references change). Run: node scripts/optimize-images.cjs */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "public");
const MAX = 1600; // cap longest side (plenty for cards/previews)
const MIN_BYTES = 300 * 1024; // only touch files larger than this
const SCREENSHOT_DIRS = [
  "mobileprojects",
  "workprojects",
  "projectimages",
  "otherprojects",
  "myGroupProjects",
];

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.(png|jpe?g)$/i.test(e.name)) files.push(p);
  }
  return files;
}

(async () => {
  const files = walk(ROOT);
  let before = 0,
    after = 0,
    count = 0;
  for (const f of files) {
    const st = fs.statSync(f);
    if (st.size < MIN_BYTES) continue;
    const rel = path.relative(ROOT, f);
    const isScreenshot = SCREENSHOT_DIRS.some((d) => rel.startsWith(d));
    const buf = fs.readFileSync(f);
    let pipeline = sharp(buf, { failOn: "none" });
    const meta = await pipeline.metadata();
    if (Math.max(meta.width || 0, meta.height || 0) > MAX) {
      pipeline = pipeline.resize(MAX, MAX, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    let out;
    if (/\.png$/i.test(f)) {
      // Screenshots tolerate palette quantization; keep art (ironmanassets) lossless-ish.
      out = await pipeline
        .png(
          isScreenshot
            ? { compressionLevel: 9, effort: 9, quality: 82, palette: true }
            : { compressionLevel: 9, effort: 9 }
        )
        .toBuffer();
    } else {
      out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    }
    if (out.length < st.size * 0.97) {
      fs.writeFileSync(f, out);
      before += st.size;
      after += out.length;
      count++;
      console.log(
        `${rel}: ${(st.size / 1048576).toFixed(2)}MB -> ${(out.length / 1048576).toFixed(2)}MB`
      );
    }
  }
  console.log(
    `\nOptimized ${count} files. ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB (saved ${((before - after) / 1048576).toFixed(1)}MB)`
  );
})();
