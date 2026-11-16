const fs = require("fs");
(async () => {
  const hb = await import("harfbuzzjs");
  const [,, fontPath, text, sizePx, out] = process.argv;
  const face = new hb.Face(new hb.Blob(fs.readFileSync(fontPath)));
  const font = new hb.Font(face);
  const upem = face.upem, s = Number(sizePx) / upem;
  const buf = new hb.Buffer(); buf.addText(text); buf.guessSegmentProperties();
  hb.shape(font, buf);
  const glyphs = buf.getGlyphInfosAndPositions().map(g=>({g:g.codepoint,cl:g.cluster,ax:g.xAdvance,dx:g.xOffset||0,dy:g.yOffset||0})); // visual order, left to right
  let pen = 0; const outGlyphs = [];
  for (const g of glyphs) {
    const d = font.glyphToPath(g.g);
    const ox = pen + g.dx, oy = g.dy;
    if (d) {
      // transform absolute commands: x -> (x+ox)*s, y -> -(y+oy)*s
      const t = d.replace(/([MLQCZ])([^MLQCZ]*)/g, (_, c, args) => {
        const n = args.trim() ? args.trim().split(/[ ,]+/).map(Number) : [];
        const o = [];
        for (let i = 0; i < n.length; i += 2) o.push(((n[i] + ox) * s).toFixed(2), (-(n[i + 1] + oy) * s).toFixed(2));
        return c + o.join(" ") + " ";
      });
      outGlyphs.push({ cluster: g.cl, d: t.trim(), x: ox * s });
    }
    pen += g.ax;
  }
  const ext = font.hExtents ? font.hExtents() : null;
  fs.writeFileSync(out, JSON.stringify({ text, sizePx: Number(sizePx), width: pen * s, ascender: ext && ext.ascender * s, descender: ext && ext.descender * s, glyphs: outGlyphs }, null, 1));
  console.log(text, "width", (pen * s).toFixed(1), "glyphs", outGlyphs.length, ext);
})();
