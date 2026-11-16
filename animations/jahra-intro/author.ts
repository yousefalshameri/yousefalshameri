/**
 * Jahra Health Region — intro ident.
 *
 * Art direction
 *   Mode      one object (the lockup alone on a flat field)
 *   Verb      extend — a medical cross grows out of its own centre, arm by arm
 *   Geometry  rounded bars (the cross arms, the underline)
 *   Palette   cobalt field #1F4FBF · white #FFFFFF · yellow #F2B705
 *   Words     one: «الجهراء», shaped with HarfBuzz from Cairo ExtraBold
 *             (Clayzo text nodes do not shape Arabic, so the word is paths)
 *   Loop      starts and ends on the empty field, so it cuts to itself
 *
 * Run: npx tsx animations/jahra-intro/author.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ANIMATION_DOCUMENT_VERSION, assertValidAnimationDocument, base, constant, fill, hex,
  keyed, marker, parseSvgPath, withComputedRevision, type SceneNode,
} from "@clayzo/animation/authoring";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1920, H = 1080;
const END = 960; // 4.0 s at 240 ticks/s, 60 fps → 4 ticks a frame

const FIELD = hex("#1F4FBF");
const WHITE = hex("#FFFFFF");
const YELLOW = hex("#F2B705");

const OUT = { x1: 0.2, y1: 0.45, x2: 0.45, y2: 1 };
const DRAIN = { x1: 0.5, y1: 0, x2: 0.7, y2: 0.7 };
const POP = { x1: 0.1, y1: 0.9, x2: 0.3, y2: 1 };
const SETTLE = { x1: 0.25, y1: 0.5, x2: 0.45, y2: 1 };
const SNAP = { x1: 0.45, y1: 0, x2: 0.55, y2: 1 };

const s3 = (x: number, y = x) => ({ x, y, z: 1 });
const nodes: Record<string, SceneNode> = {};
const add = (n: SceneNode) => { nodes[n.id] = n; return n.id; };

// ── Backdrop: the field ────────────────────────────────────────────────
add({ ...base("field", { outTick: END, x: W / 2, y: H / 2 }), type: "rect",
      size: constant({ width: W, height: H }), cornerRadius: constant(0), style: { fill: fill(FIELD) } });

// ── Hero: the cross ────────────────────────────────────────────────────
const CROSS = 500, BAR = 164, R = 44;
const ARM = (CROSS - BAR) / 2 + R; // arm reaches R into the centre so its inner rounding is hidden
const CX = 1400, CY = H / 2;

const centre = add({ ...base("cross.centre", { outTick: END,
    scale: keyed("cross.centre.scale", [[24, s3(0), POP], [48, s3(1)], [880, s3(1), DRAIN], [904, s3(0)]]) }),
  type: "rect", size: constant({ width: BAR, height: BAR }), cornerRadius: constant(10), style: { fill: fill(WHITE) } });

// each arm: [id, rotation, in-start, out-start]; drawn pointing up from the centre, then rotated
const arms: [string, number, number, number][] = [
  ["up", 0, 48, 848], ["down", 180, 72, 832], ["right", 90, 96, 816], ["left", 270, 120, 800],
];
// The arm points up from its base, R inside the centre square, and grows from it
// (an anchor lands on the node's position);
// a pivot group at the cross centre rotates it into place.
const armGroups = arms.map(([name, rot, tin, tout]) => {
  const arm = add({
    ...base(`cross.${name}`, { inTick: tin, outTick: tout + 32, x: 0, y: -(BAR / 2 - R), anchor: { x: 0, y: ARM / 2 },
      scale: keyed(`cross.${name}.scale`, [[tin, s3(1, 0.001), OUT], [tin + 48, s3(1)],
                                            [tout, s3(1), DRAIN], [tout + 32, s3(1, 0.001)]]) }),
    type: "rect", size: constant({ width: BAR, height: ARM }), cornerRadius: constant(R),
    style: { fill: fill(WHITE) },
  });
  return add({ ...base(`cross.${name}.pivot`, { outTick: END, rotation: rot }),
               type: "group", children: [arm] } as SceneNode);
});
add({ ...base("cross", { outTick: END, x: CX, y: CY,
    scale: keyed("cross.scale", [[168, s3(1), OUT], [196, s3(1.06), "linear"], [208, s3(1.06), SNAP], [228, s3(1)]]) }),
  type: "group", children: [...armGroups, centre] } as SceneNode);

// ── Title: «الجهراء» from shaped glyph outlines ────────────────────────
const shaped = JSON.parse(readFileSync(join(HERE, "glyphs/jahra.json"), "utf8")) as
  { width: number; glyphs: { d: string }[] };
const word = parseSvgPath(shaped.glyphs.map((g) => g.d).join(" "));
if (word.diagnostics.length) console.warn(word.diagnostics);
const ys = word.path.contours.flatMap((c) => c.vertices.map((v) => v.point.y));
const top = Math.min(...ys), bottom = Math.max(...ys);
const WORD_W = 800, WS = WORD_W / shaped.width;
const WORD_RIGHT = 1060; // gap to the cross
const wordH = bottom - top;

add({ ...base("word.glyphs", { outTick: END, x: -shaped.width / 2, y: -(top + bottom) / 2 }), type: "path",
      path: constant(word.path), style: { fill: fill(WHITE) } });
// wipe from the right edge (Arabic reading direction)
add({ ...base("word.wipe", { outTick: END, x: shaped.width / 2 + 40, y: 0, anchor: { x: shaped.width / 2 + 40, y: 0 },
    scale: keyed("word.wipe.scale", [[0, s3(0.001, 1), "hold"], [176, s3(0.001, 1), OUT], [320, s3(1)],
                                     [736, s3(1), DRAIN], [820, s3(0.001, 1)]]) }),
  type: "rect", size: constant({ width: shaped.width + 80, height: wordH + 120 }), cornerRadius: constant(0),
  style: { fill: fill(WHITE) } });
add({ ...base("word", { inTick: 176, outTick: 820, x: WORD_RIGHT - WORD_W / 2, y: CY - 10,
    scale: keyed("word.scale", [[176, s3(WS * 1.04), SETTLE], [272, s3(WS)]]) }),
  type: "group", children: ["word.glyphs"], clipPathId: "word.wipe" } as SceneNode);

// ── Punctuation: yellow underline, drawn right to left ─────────────────
const UL_W = WORD_W, UL_H = 16;
add({ ...base("underline", { inTick: 300, outTick: 748, x: WORD_RIGHT, y: CY + (wordH * WS) / 2 + 52,
    anchor: { x: UL_W / 2, y: 0 },
    scale: keyed("underline.scale", [[0, s3(0.001, 1), "hold"], [300, s3(0.001, 1), OUT], [356, s3(1)],
                                     [720, s3(1), DRAIN], [748, s3(0.001, 1)]]) }),
  type: "rect", size: constant({ width: UL_W, height: UL_H }), cornerRadius: constant(UL_H / 2),
  style: { fill: fill(YELLOW) } });

// ── Assemble ───────────────────────────────────────────────────────────
const rootNodeIds = ["field", "cross", "word", "underline"];
const document = withComputedRevision({
  version: ANIMATION_DOCUMENT_VERSION, id: "jahra-intro", name: "Jahra Health Region — Intro",
  canvas: { width: W, height: H, pixelAspectRatio: 1, backgroundColor: FIELD },
  timing: { ticksPerSecond: 240, frameRate: { numerator: 60, denominator: 1 }, durationTicks: END, displayStartTick: 0 },
  assets: {}, rootCompositionId: "main", components: {},
  compositions: { main: { id: "main", name: "Main", width: W, height: H, durationTicks: END, nodes, rootNodeIds } },
  markers: [marker("cross", 48), marker("lock", 228), marker("word", 320), marker("hold", 360),
            marker("exit", 720), marker("empty", 904)],
  design: { tokens: { looping: true } },
  capabilities: { required: [], optional: [], unsupportedPolicy: "warn" },
});
assertValidAnimationDocument(document);
writeFileSync(join(HERE, "jahra-intro.json"), JSON.stringify(document, null, 1));
console.log("wrote jahra-intro.json", Object.keys(nodes).length, "nodes");
