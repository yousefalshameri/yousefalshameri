/**
 * «نبض الجهراء» — The Jahra Pulse.
 *
 * Art direction
 *   Mode      tiled system: a dot matrix (one dot per employee) is the whole frame
 *   Verb      pulse — an ECG trace runs across the matrix right to left; its
 *             QRS spike *becomes* the medical cross, which then beats (lub-dub)
 *             and sends the beat through every dot
 *   Geometry  dots on a 48 px lattice; the cross is the same dots, grown
 *   Palette   monitor black #0A0A0C · rest grey #34343C · ECG green #1BD660 ·
 *             cross red #FF3B3B · white for the word
 *   Words     one: «الجهراء», written by the trace as its head passes
 *   Loop      starts and ends on the resting matrix
 *
 * Run: npx tsx animations/jahra-pulse/author.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ANIMATION_DOCUMENT_VERSION, assertValidAnimationDocument, base, constant, fill, hex,
  keyed, marker, parseSvgPath, withComputedRevision, type Color, type SceneNode,
} from "@clayzo/animation/authoring";

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1920, H = 1080, END = 1008; // 4.2 s at 240 tps, 60 fps (4 ticks a frame)
const snap = (t: number) => Math.round(t / 4) * 4;

const FIELD = hex("#0A0A0C"), REST = hex("#34343C"), GREEN = hex("#1BD660"),
      RED = hex("#FF3B3B"), WHITE = hex("#FFFFFF");
const mix = (a: Color, b: Color, k: number): Color =>
  ({ ...a, r: a.r + (b.r - a.r) * k, g: a.g + (b.g - a.g) * k, b: a.b + (b.b - a.b) * k });

const OUT = { x1: 0.2, y1: 0.45, x2: 0.45, y2: 1 };
const DRAIN = { x1: 0.5, y1: 0, x2: 0.7, y2: 0.7 };
const POP = { x1: 0.1, y1: 0.9, x2: 0.3, y2: 1 };
const SNAP = { x1: 0.45, y1: 0, x2: 0.55, y2: 1 };
const SETTLE = { x1: 0.25, y1: 0.5, x2: 0.45, y2: 1 };
const s3 = (k: number) => ({ x: k, y: k, z: 1 });

// ── Lattice ────────────────────────────────────────────────────────────
const P = 48, DOT = 12;
const COLS = 40, ROWS = 11; // columns x = 24 + 48i; rows y = 540 + 48j, j ∈ [-11, 11]
const CI = 28, CX = 24 + P * CI, CY = H / 2; // cross centre on a lattice point
const ARM = 5; // cells from the centre to the arm tip; arms 3 cells thick
const inCross = (u: number, v: number) =>
  (Math.abs(u) <= 1 && Math.abs(v) <= ARM) || (Math.abs(v) <= 1 && Math.abs(u) <= ARM);

// ── The trace: head runs right → left (the Arabic direction) ───────────
const T0 = 16, SPEED = 5.75; // px per tick; head reaches the cross centre at ≈ t 112
const headTick = (x: number) => T0 + (W + 24 - x) / SPEED;
// ECG row offset per column (u = columns from the cross centre, + is right = earlier):
// P wave before the cross, T wave after it, the QRS spike *is* the cross.
const bumpH = (u: number) => ({ 9: 1, 8: 2, 7: 1, [-7]: 1, [-8]: 2, [-9]: 2, [-10]: 1 } as Record<number, number>)[u] ?? 0;
const ecgRows = (u: number): number[] => {
  if (Math.abs(u) <= ARM) return [];
  // each column lights from its own height down to its lowest neighbour, so the trace stays joined
  const h = bumpH(u), lo = Math.min(h, bumpH(u - 1), bumpH(u + 1));
  const rows: number[] = [];
  for (let k = lo; k <= h; k++) rows.push(-k);
  return rows;
};

// ── Heartbeat waves ────────────────────────────────────────────────────
const LUB = 424, DUB = 496, WAVE_SPEED = 8.5; // px per tick, outward from the cross

type Key = [number, { x: number; y: number; z: number }, Color, any];
const nodes: Record<string, SceneNode> = {};
const add = (n: SceneNode) => { nodes[n.id] = n; return n.id; };

function dotNode(id: string, x: number, y: number, keys: Key[]): SceneNode {
  // keys must strictly increase; nudge collisions forward on the frame grid
  const clean: Key[] = [];
  for (const k of keys.sort((a, b) => a[0] - b[0])) {
    const t = snap(k[0]);
    const last = clean[clean.length - 1];
    clean.push([last && t <= last[0] ? last[0] + 4 : t, k[1], k[2], k[3]]);
  }
  const animated = clean.length > 1;
  return {
    ...base(id, { outTick: END, x, y,
      ...(animated ? { scale: keyed(`${id}.s`, clean.map((k) => [k[0], k[1], k[3]] as const)) } : {}) }),
    type: "ellipse", size: constant({ width: DOT, height: DOT }),
    style: { fill: animated ? { color: keyed(`${id}.c`, clean.map((k) => [k[0], k[2], k[3]] as const)), opacity: constant(1) }
                            : fill(REST) },
  } as SceneNode;
}

// a bump: rest → peak → rest, coloured on the way
const bump = (t: number, peak: number, tint: Color, rise = 12, fall = 44): Key[] => [
  [t, s3(1), REST, OUT], [t + rise, s3(peak), tint, SETTLE], [t + rise + fall, s3(1), REST, "linear"],
];

// ── Backdrop dots (everything not in the cross) ────────────────────────
add({ ...base("field", { outTick: END, x: W / 2, y: H / 2 }), type: "rect",
      size: constant({ width: W, height: H }), cornerRadius: constant(0), style: { fill: fill(FIELD) } });

const gridIds: string[] = [];
for (let i = 0; i < COLS; i++) for (let j = -ROWS; j <= ROWS; j++) {
  const u = i - CI, v = j;
  if (inCross(u, v)) continue;
  const x = 24 + P * i, y = CY + P * j;
  const keys: Key[] = [[0, s3(1), REST, "hold"]];
  // the trace
  if (ecgRows(u).includes(v)) {
    const th = headTick(x);
    keys.push([th, s3(1), REST, POP], [th + 8, s3(2.6), GREEN, SETTLE], [th + 48, s3(1.7), GREEN, "linear"],
              [th + 72, s3(1.7), GREEN, DRAIN], [th + 200, s3(1), REST, "hold"]);
  }
  // lub, then dub
  const d = Math.hypot(x - CX, y - CY);
  keys.push(...bump(LUB + d / WAVE_SPEED, 2.1, mix(REST, GREEN, 0.85)));
  keys.push(...bump(DUB + d / WAVE_SPEED, 1.5, mix(REST, GREEN, 0.45), 12, 36));
  gridIds.push(add(dotNode(`d${i}_${j + ROWS}`, x, y, keys)));
}
add({ ...base("grid", { outTick: END }), type: "group", children: gridIds } as SceneNode);

// ── Hero: the cross, grown from the QRS spike ──────────────────────────
const CROSS_K = 3.6; // dot × 3.6 ≈ 43 px on a 48 px pitch: a solid cross that is still dots
const EXIT = 736;
const crossIds: string[] = [];
for (let u = -ARM; u <= ARM; u++) for (let v = -ARM; v <= ARM; v++) {
  if (!inCross(u, v)) continue;
  // horizontal: as the head passes; vertical: the spike shoots out from the centre row
  const tc = headTick(CX + P * u) + Math.max(0, Math.abs(v) - 1) * 5;
  const out = EXIT + (ARM * 2 - (Math.abs(u) + Math.abs(v))) * 6; // outer dots leave first
  const keys: Key[] = [[0, s3(1), REST, "hold"],
    [tc, s3(1), REST, POP], [tc + 12, s3(CROSS_K * 1.14), RED, SNAP], [tc + 28, s3(CROSS_K), RED, "hold"],
    [out, s3(CROSS_K), RED, DRAIN], [out + 40, s3(1), REST, "hold"]];
  crossIds.push(add(dotNode(`x${u + ARM}_${v + ARM}`, P * u, P * v, keys)));
}
const beat = (t: number, k: number): [number, any, any][] =>
  [[t, s3(1), OUT], [t + 12, s3(k), SNAP], [t + 48, s3(1), "hold"]];
add({ ...base("cross", { outTick: END, x: CX, y: CY,
    scale: keyed("cross.beat", [[0, s3(1), "hold"], ...beat(LUB - 8, 1.07), ...beat(DUB - 8, 1.035)]) }),
  type: "group", children: crossIds } as SceneNode);

// ── Title: «الجهراء», written by the passing trace ─────────────────────
const shaped = JSON.parse(readFileSync(join(HERE, "../jahra-intro/glyphs/jahra.json"), "utf8")) as
  { width: number; glyphs: { d: string }[] };
const word = parseSvgPath(shaped.glyphs.map((g) => g.d).join(" "));
const ys = word.path.contours.flatMap((c) => c.vertices.map((v) => v.point.y));
const top = Math.min(...ys), bottom = Math.max(...ys);
const WORD_W = 760, WS = WORD_W / shaped.width;
const WORD_RIGHT = CX - (ARM + 1) * P - 40;
const WORD_CY = CY - 185;
const wordIn = snap(headTick(WORD_RIGHT)), wordDone = snap(headTick(WORD_RIGHT - WORD_W));

add({ ...base("word.glyphs", { outTick: END, x: -shaped.width / 2, y: -(top + bottom) / 2 }), type: "path",
      path: constant(word.path), style: { fill: fill(WHITE) } });
const clipX = shaped.width / 2 + 30;
add({ ...base("word.wipe", { outTick: END, x: clipX, y: 0, anchor: { x: clipX, y: 0 },
    scale: keyed("word.wipe.scale", [[wordIn, { x: 0.001, y: 1, z: 1 }, "linear"], [wordDone, s3(1), "hold"],
                                     [EXIT + 16, s3(1), DRAIN], [EXIT + 104, { x: 0.001, y: 1, z: 1 }]]) }),
  type: "rect", size: constant({ width: shaped.width + 60, height: bottom - top + 160 }), cornerRadius: constant(0),
  style: { fill: fill(WHITE) } });
add({ ...base("word", { inTick: wordIn, outTick: EXIT + 104, x: WORD_RIGHT - WORD_W / 2, y: WORD_CY, scale: WS }),
  type: "group", children: ["word.glyphs"], clipPathId: "word.wipe" } as SceneNode);

// ── Assemble ───────────────────────────────────────────────────────────
const document = withComputedRevision({
  version: ANIMATION_DOCUMENT_VERSION, id: "jahra-pulse", name: "نبض الجهراء — The Jahra Pulse",
  canvas: { width: W, height: H, pixelAspectRatio: 1, backgroundColor: FIELD },
  timing: { ticksPerSecond: 240, frameRate: { numerator: 60, denominator: 1 }, durationTicks: END, displayStartTick: 0 },
  assets: {}, rootCompositionId: "main", components: {},
  compositions: { main: { id: "main", name: "Main", width: W, height: H, durationTicks: END, nodes,
                          rootNodeIds: ["field", "grid", "cross", "word"] } },
  markers: [marker("trace", T0), marker("spike", snap(headTick(CX))), marker("word", wordDone),
            marker("lub", LUB), marker("dub", DUB), marker("exit", EXIT)],
  design: { tokens: { looping: true } },
  capabilities: { required: [], optional: [], unsupportedPolicy: "warn" },
});
assertValidAnimationDocument(document);
writeFileSync(join(HERE, "jahra-pulse.json"), JSON.stringify(document));
console.log("wrote jahra-pulse.json —", Object.keys(nodes).length, "nodes; spike", snap(headTick(CX)),
            "word", wordIn, "→", wordDone);
