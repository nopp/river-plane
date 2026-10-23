/* River Plane — web homage of the 1982 river shooter.
   Original pixel art and river generator. Not the Activision ROM. */
(function () {
  "use strict";

  const W = 160;
  const H = 192;
  const PLAY_H = 160;
  const BLOCK = 32;
  const SECTION_BLOCKS = 32;
  const SECTION_H = BLOCK * SECTION_BLOCKS;
  const SPEEDS = [0.5, 1.05, 1.8];
  const FUEL_FRAMES = 35 * 60;
  const JET_W = 10;
  const JET_H = 11;

  const COL = {
    water: "#3A40AC",
    land: "#6E944B",
    landDark: "#5C823C",
    landEdge: "#3E5C28",
    tree: "#9DC86C",
    trunk: "#5A3A16",
    jet: "#E8E230",
    white: "#E8E6D8",
    red: "#DF685A",
    roof: "#101208",
    heli: "#9AA6D0",
    heliDark: "#1A1C24",
    ship: "#E4E2D4",
    shipDark: "#8E8C80",
    ejet: "#F4F4F0",
    bridge: "#B8B8C0",
    bridgeDark: "#5A5A64",
    road: "#6E6E74",
    hud: "#8A8A8A",
    yellow: "#E8E230",
    black: "#000000",
    needle: "#F4F060",
  };

  const FONT = {
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    C: ["111", "100", "100", "100", "111"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    F: ["111", "100", "110", "100", "100"],
    G: ["111", "100", "101", "101", "111"],
    I: ["111", "010", "010", "010", "111"],
    J: ["001", "001", "001", "101", "010"],
    L: ["100", "100", "100", "100", "111"],
    M: ["101", "111", "101", "101", "101"],
    N: ["101", "111", "111", "101", "101"],
    O: ["111", "101", "101", "101", "111"],
    P: ["111", "101", "111", "100", "100"],
    R: ["110", "101", "110", "101", "101"],
    S: ["111", "100", "111", "001", "111"],
    T: ["111", "010", "010", "010", "010"],
    U: ["101", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"],
    W: ["101", "101", "101", "111", "101"],
    "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "001", "001", "001"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"],
    " ": ["000", "000", "000", "000", "000"],
    "-": ["000", "000", "111", "000", "000"],
    ".": ["000", "000", "000", "000", "010"],
  };

  const SPRITE_ROWS = {
    jet: [
      "......##......",
      ".....####.....",
      "......##......",
      "......##......",
      ".############.",
      "##############",
      "######++######",
      "##############",
      ".############.",
      "......##......",
      "......##......",
      "....######....",
      "....##..##....",
      "......##......",
    ],
    heliA: [
      "..DDDDDDDDDDDD..",
      "..DDDDDDDDDDDD..",
      "........HH......",
      "......HHHHHH....",
      ".....H++++HHH...",
      "....HHHHHHHHHH..",
      ".D..HHHHHHHH....",
      "DDDHHHH.........",
      ".D..............",
    ],
    heliB: [
      "D..............D",
      ".DDDDDDDDDDDDDD.",
      "........HH......",
      "......HHHHHH....",
      ".....H++++HHH...",
      "....HHHHHHHHHH..",
      ".D..HHHHHHHH....",
      "DDDHHHH.........",
      ".D..............",
    ],
    ship: [
      "......#.........",
      "....###.........",
      "...#####........",
      "..##+++##.......",
      ".#########......",
      "##############..",
      "################",
      ".##############.",
      "..============..",
    ],
    fuel: [
      "RRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRRR",
      "WWWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWWW",
      "RRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRRR",
      "WWWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWWW",
      "RRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRRR",
      "WWWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWWW",
      "RRRRRRRRRRRRRRRRR",
      "RRRRRRRRRRRRRRRRR",
    ],
    ejet: [
      "....##....",
      "...####...",
      "....##....",
      "....##....",
      "##########",
      "####++####",
      "##########",
      "....##....",
      "...####...",
      "..##..##..",
      "....##....",
    ],
    house: [
      "..######..",
      ".########.",
      "##########",
      "##..##..##",
      "##..##..##",
      "##########",
      ".########.",
    ],
    tree: [
      "...###...",
      "..#####..",
      ".#######.",
      "#########",
      ".#######..",
      "...###...",
      "....#....",
      "....#....",
    ],
  };

  const POINTS = { ship: 30, heli: 60, fuel: 80, ejet: 100, bridge: 500 };

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = false;

  const down = new Set();
  const touch = { left: false, right: false, up: false, down: false, fire: false };
  let padFireEdge = false;

  const sfx = createSfx();
  const sprites = buildSprites();

  const sectionCache = new Map();
  const destroyedBridges = new Set();

  let mode = "title";
  let player = { x: 80 };
  let playerWorldY = 48;
  let speed = 1;
  let fuel = 1;
  let lives = 3;
  let score = 0;
  let best = Number(localStorage.getItem("riverraid-best") || 0);
  let guided = localStorage.getItem("riverraid-guided") === "1";
  let muted = localStorage.getItem("riverraid-muted") === "1";
  let checkpoint = 0;
  let missile = null;
  let explosions = [];
  let tick = 0;
  let deathT = 0;
  let toast = "";
  let toastT = 0;
  let wasFire = false;
  let sirenFlip = false;
  let bridgeFlash = 0;
  let padUpHeld = false;
  let padDownHeld = false;
  let touchUpPulse = false;
  let touchDownPulse = false;

  const PILOT_COLOR = ["#E8E230", "#5EE7F5", "#F2A24A"];
  const PILOT_NAME = ["Yellow", "Blue", "Orange"];
  const mp = {
    phase: "off",
    role: "",
    code: "",
    password: "",
    me: "",
    hostId: "",
    topic: "",
    clients: [],
    mqtt: null,
    seq: 0,
    lastN: new Map(),
    seen: new Map(),
    hostSeen: 0,
    heart: null,
    beat: 0,
    inSig: -1,
    connToken: null,
    inputAction: null,
    stateAction: null,
    startAction: null,
    rosterAction: null,
    pilots: [],
    self: null,
    rosterIds: [],
    rosterColors: [],
    auth: null,
    authTick: 0,
    hadState: false,
    waitToken: null,
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sectionRng(index) {
    const seed = (0xa814 ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
    return mulberry32(seed || 1);
  }

  function buildSprites() {
    const map = {
      "#": COL.jet,
      R: COL.red,
      W: COL.white,
      H: COL.heli,
      D: COL.heliDark,
      S: COL.ship,
      K: COL.roof,
      T: COL.tree,
      B: COL.trunk,
    };
    function paint(rows, recolor) {
      const h = rows.length;
      const w = Math.max(...rows.map((r) => r.length));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      const img = g.createImageData(w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
          const ch = row[x];
          if (ch === "." || ch === " ") continue;
          const hex = recolor ? recolor(ch) : map[ch];
          if (!hex) continue;
          const i = (y * w + x) * 4;
          d[i] = parseInt(hex.slice(1, 3), 16);
          d[i + 1] = parseInt(hex.slice(3, 5), 16);
          d[i + 2] = parseInt(hex.slice(5, 7), 16);
          d[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      return c;
    }
    const heliPaint = (ch) => (ch === "D" ? COL.heliDark : ch === "H" ? "#F4F4F8" : ch === "+" ? "#242C44" : null);
    function stampFuel(c) {
      const g = c.getContext("2d");
      const img = g.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      const word = "FUEL";
      const tw = word.length * 4 - 1;
      const ox = Math.round((c.width - tw) / 2);
      const oy = Math.round((c.height - 5) / 2);
      function put(x, y, hex) {
        const i = (y * c.width + x) * 4;
        d[i] = parseInt(hex.slice(1, 3), 16);
        d[i + 1] = parseInt(hex.slice(3, 5), 16);
        d[i + 2] = parseInt(hex.slice(5, 7), 16);
        d[i + 3] = 255;
      }
      for (let y = oy - 1; y <= oy + 5; y++) {
        for (let x = 0; x < c.width; x++) put(x, y, COL.roof);
      }
      let cx = ox;
      for (const ch of word) {
        const rows = FONT[ch];
        for (let yy = 0; yy < rows.length; yy++) {
          for (let xx = 0; xx < rows[yy].length; xx++) {
            if (rows[yy][xx] === "1") put(cx + xx, oy + yy, COL.yellow);
          }
        }
        cx += 4;
      }
      g.putImageData(img, 0, 0);
    }
    const out = {
      jet: paint(SPRITE_ROWS.jet, (ch) => (ch === "#" ? COL.jet : ch === "+" ? "#8A7010" : null)),
      heliA: paint(SPRITE_ROWS.heliA, heliPaint),
      heliB: paint(SPRITE_ROWS.heliB, heliPaint),
      ship: paint(SPRITE_ROWS.ship, (ch) => (ch === "#" ? COL.ship : ch === "+" ? "#8A8680" : ch === "=" ? "#4A4844" : null)),
      fuel: paint(SPRITE_ROWS.fuel),
      ejet: paint(SPRITE_ROWS.ejet, (ch) => (ch === "#" ? COL.ejet : ch === "+" ? "#7E7E88" : null)),
      house: paint(SPRITE_ROWS.house, (ch) => (ch === "#" ? COL.white : null)),
      tree: paint(SPRITE_ROWS.tree, (ch) => (ch === "#" ? COL.tree : null)),
    };
    stampFuel(out.fuel);
    return out;
  }

  // House needs a black roof. Repaint properly after the generic builder.
  sprites.house = (function () {
    const rows = SPRITE_ROWS.house;
    const h = rows.length;
    const w = rows[0].length;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const img = g.createImageData(w, h);
    const d = img.data;
    function put(x, y, hex) {
      const i = (y * w + x) * 4;
      d[i] = parseInt(hex.slice(1, 3), 16);
      d[i + 1] = parseInt(hex.slice(3, 5), 16);
      d[i + 2] = parseInt(hex.slice(5, 7), 16);
      d[i + 3] = 255;
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (rows[y][x] !== "#") continue;
        put(x, y, y < 3 ? COL.roof : COL.white);
      }
    }
    // windows
    put(2, 3, COL.roof); put(3, 3, COL.roof);
    put(6, 3, COL.roof); put(7, 3, COL.roof);
    put(2, 4, COL.roof); put(3, 4, COL.roof);
    put(6, 4, COL.roof); put(7, 4, COL.roof);
    g.putImageData(img, 0, 0);
    return c;
  })();

  sprites.tree = (function () {
    const rows = SPRITE_ROWS.tree;
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const img = g.createImageData(w, h);
    const d = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        if (rows[y][x] !== "#") continue;
        const hex = y >= 6 ? COL.trunk : COL.tree;
        const i = (y * w + x) * 4;
        d[i] = parseInt(hex.slice(1, 3), 16);
        d[i + 1] = parseInt(hex.slice(3, 5), 16);
        d[i + 2] = parseInt(hex.slice(5, 7), 16);
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  })();

  function flipCanvas(src) {
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.translate(src.width, 0);
    g.scale(-1, 1);
    g.drawImage(src, 0, 0);
    return c;
  }
  sprites.shipLeft = flipCanvas(sprites.ship);
  sprites.heliALeft = flipCanvas(sprites.heliA);
  sprites.heliBLeft = flipCanvas(sprites.heliB);
  sprites.jetAlt = [sprites.jet, tintJet("#5EE7F5"), tintJet("#F2A24A")];

  function tintJet(hex) {
    const src = sprites.jet;
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext("2d");
    g.drawImage(src, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    const r = parseInt(hex.slice(1, 3), 16);
    const gg = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      if (d[i] > 180 && d[i + 1] > 150) {
        d[i] = r;
        d[i + 1] = gg;
        d[i + 2] = b;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function spriteFor(type) {
    if (type === "heli") return tick % 16 < 8 ? sprites.heliA : sprites.heliB;
    if (type === "ship") return sprites.ship;
    if (type === "fuel") return sprites.fuel;
    if (type === "ejet") return sprites.ejet;
    if (type === "house") return sprites.house;
    if (type === "tree") return sprites.tree;
    return sprites.jet;
  }

  function sizeOf(type) {
    const s = spriteFor(type);
    return { w: s.width, h: s.height };
  }

  function getSection(index) {
    if (index < 0) index = 0;
    const hit = sectionCache.get(index);
    if (hit) return hit;
    const rng = sectionRng(index);
    const straight = index % 2 === 0;
    const diff = Math.min(index, 47) / 47;
    const blocks = [];
    let cx = 80;
    let half = straight ? 42 : 36;
    let islandRun = 0;

    for (let i = 0; i < SECTION_BLOCKS; i++) {
      const isBridge = i === SECTION_BLOCKS - 1;
      const isRoad = i >= SECTION_BLOCKS - 2;
      if (i >= SECTION_BLOCKS - 3) {
        cx = Math.round(cx * 0.45 + 80 * 0.55);
        half = Math.max(half, 32);
        islandRun = 0;
      } else if (straight) {
        if (rng() < 0.55) half += rng() < 0.5 ? -1 : 1;
        if (rng() < 0.06) half -= 5;
        cx += rng() < 0.15 ? (rng() < 0.5 ? -1 : 1) : 0;
      } else {
        const turn = rng();
        if (turn < 0.38) cx -= 3;
        else if (turn < 0.76) cx += 3;
        if (rng() < 0.5) half += rng() < 0.5 ? -2 : 2;
        if (rng() < 0.07) half += 8;
        if (rng() < 0.07) half -= 6;
      }
      const minHalf = Math.round(lerp(30, 18, diff));
      const maxHalf = straight ? 50 : 46;
      half = clamp(half, minHalf, maxHalf);
      cx = clamp(cx, half + 2, W - half - 2);

      let island = 0;
      if (!straight && !isBridge && !isRoad && i > 2 && i < SECTION_BLOCKS - 4) {
        const maxIsland = half - 16;
        if (maxIsland >= 10) {
          if (islandRun > 0) {
            islandRun--;
            island = Math.min(maxIsland, 12 + Math.floor(diff * 6));
          } else if (rng() < 0.2) {
            islandRun = 3 + Math.floor(rng() * 6);
            island = Math.min(maxIsland, 10 + Math.floor(rng() * 8));
          }
        } else islandRun = 0;
      }
      if (isBridge || isRoad || i >= SECTION_BLOCKS - 3) island = 0;
      blocks.push({ cx, half, island, isBridge, isRoad, object: null });
    }

    if (!straight && !blocks.some((b) => b.island > 0)) {
      for (let i = 8; i <= 16; i++) {
        const b = blocks[i];
        b.island = b.half - 16 >= 10 ? Math.min(12, b.half - 16) : 0;
      }
    }

    for (let i = 0; i < SECTION_BLOCKS; i++) {
      const b = blocks[i];
      if (b.isBridge) continue;
      b.object = makeObject(rng, index, diff, b, i);
    }

    const section = { index, blocks };
    sectionCache.set(index, section);
    return section;
  }

  function makeObject(rng, section, diff, block, blockIndex) {
    const fuelP = lerp(0.28, 0.07, diff);
    const sceneryP = 0.2;
    const roll = rng();
    let type;
    if (block.isRoad) {
      type = rng() < 0.65 ? (rng() < 0.5 ? "house" : "tree") : null;
      if (!type) return null;
    } else if (roll < sceneryP) {
      type = rng() < 0.55 ? "house" : "tree";
    } else if (roll < sceneryP + fuelP) {
      type = "fuel";
    } else if (section >= 2 && rng() < lerp(0.18, 0.42, diff)) {
      type = "ejet";
    } else {
      type = rng() < 0.55 ? "ship" : "heli";
    }

    const worldY = section * SECTION_H + blockIndex * BLOCK + 8;
    const ch = channelsOf(block);
    const widest = ch.slice().sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0];
    const channelW = widest[1] - widest[0];

    let sceneryX = null;
    if (type === "house" || type === "tree") {
      sceneryX = placeScenery(block, rng);
      if (sceneryX == null) type = channelW < 18 ? "heli" : "ship";
    }
    if (type === "ship" && channelW < 20) type = "heli";

    const dim = sizeOf(type);
    let x;
    let channel = 0;
    if (type === "house" || type === "tree") {
      x = sceneryX;
    } else if (type === "ejet") {
      x = 8 + rng() * (W - 16);
    } else {
      channel = Math.floor(rng() * ch.length);
      const c = ch[channel];
      const room = c[1] - c[0] - dim.w - 2;
      if (room < 2) {
        if (type === "ship") type = "heli";
        const dim2 = sizeOf(type);
        const room2 = c[1] - c[0] - dim2.w - 2;
        if (room2 < 2) return null;
        x = (c[0] + c[1]) / 2;
      } else if (type === "fuel") {
        const span = Math.min(room, 16);
        x = (c[0] + c[1]) / 2 + (rng() - 0.5) * span;
      } else {
        x = c[0] + dim.w / 2 + 1 + rng() * room;
      }
    }

    const dir = rng() < 0.5 ? -1 : 1;
    const spd =
      type === "ejet"
        ? lerp(0.85, 1.45, diff)
        : type === "heli"
          ? lerp(0.45, 0.95, diff)
          : lerp(0.28, 0.6, diff);
    return {
      type,
      worldY,
      x,
      spawnX: x,
      vx: dir * spd,
      spawnVx: dir * spd,
      moving: rng() < lerp(0.2, 0.8, diff),
      spawnMoving: false,
      moveAt: worldY + 20 + rng() * 220,
      channel,
      dead: false,
      section,
    };
  }

  function placeScenery(block, rng) {
    const sprW = 10;
    const left = block.cx - block.half;
    const right = block.cx + block.half;
    const choices = [];
    if (left > sprW + 4) choices.push((2 + rng() * (left - sprW - 4)) + sprW / 2);
    if (W - right > sprW + 4) choices.push(right + sprW / 2 + 2 + rng() * (W - right - sprW - 4));
    if (block.island >= 14) choices.push(block.cx);
    if (!choices.length) return null;
    return choices[Math.floor(rng() * choices.length)];
  }

  function channelsOf(g) {
    const left = g.cx - g.half;
    const right = g.cx + g.half;
    if (g.island > 2) {
      return [
        [left, g.cx - g.island],
        [g.cx + g.island, right],
      ];
    }
    return [[left, right]];
  }

  function geometryAt(worldY) {
    if (worldY < 0) worldY = 0;
    const sectionIndex = Math.floor(worldY / SECTION_H);
    const local = worldY - sectionIndex * SECTION_H;
    const sec = getSection(sectionIndex);
    const bi = clamp(Math.floor(local / BLOCK), 0, SECTION_BLOCKS - 1);
    const t = Math.floor(((local - bi * BLOCK) / BLOCK) * 8) / 8;
    const a = sec.blocks[bi];
    const b = sec.blocks[Math.min(SECTION_BLOCKS - 1, bi + 1)];
    const cx = a.cx + (b.cx - a.cx) * t;
    const half = a.half + (b.half - a.half) * t;
    let island = 0;
    if (a.island > 0 && b.island > 0) island = a.island + (b.island - a.island) * t;
    else if (t < 0.35) island = a.island;
    else if (t > 0.65) island = b.island;
    return { cx, half, island, sectionIndex, blockIndex: bi, block: a };
  }

  function channelCenter(g) {
    const ch = channelsOf(g);
    let best = ch[0];
    let width = -1;
    for (const c of ch) {
      const ww = c[1] - c[0];
      if (ww > width) {
        width = ww;
        best = c;
      }
    }
    return (best[0] + best[1]) / 2;
  }

  function worldToScreen(worldY) {
    return playerScreenTop() - (worldY - playerWorldY);
  }

  function playerScreenTop() { return 130; }

  function showToast(text) {
    toast = text;
    toastT = 90;
  }

  function startGame() {
    sfx.unlock();
    sectionCache.clear();
    destroyedBridges.clear();
    explosions = [];
    missile = null;
    score = 0;
    lives = 3;
    fuel = 1;
    speed = 1;
    checkpoint = 0;
    playerWorldY = 40;
    const g = geometryAt(playerWorldY + 4);
    player.x = channelCenter(g);
    mode = "playing";
    deathT = 0;
  }

  function addScore(n) {
    const before = Math.floor(score / 10000);
    score += n;
    const after = Math.floor(score / 10000);
    if (after > before && lives < 9) {
      lives = Math.min(9, lives + (after - before));
      sfx.extra();
    }
  }

  function kill(reasonObject) {
    if (mode !== "playing") return;
    if (reasonObject && POINTS[reasonObject.type]) addScore(POINTS[reasonObject.type]);
    mode = "dying";
    deathT = 0;
    explosions.push({ x: player.x, worldY: playerWorldY + 4, t: 0, big: true });
    sfx.explode();
    missile = null;
  }

  function finishDeath() {
    lives -= 1;
    if (lives <= 0) {
      mode = "over";
      if (score > best) {
        best = score;
        localStorage.setItem("riverraid-best", String(best));
      }
      return;
    }
    sectionCache.delete(checkpoint);
    playerWorldY = checkpoint * SECTION_H + 36;
    fuel = 1;
    speed = 1;
    missile = null;
    explosions = [];
    const g = geometryAt(playerWorldY + 4);
    player.x = channelCenter(g);
    mode = "playing";
  }

  function rects(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function playerRect() {
    return { x: player.x - 4, y: playerWorldY + 1, w: 8, h: 12 };
  }

  function objectRect(obj) {
    const dim = sizeOf(obj.type);
    return { x: obj.x - dim.w / 2, y: obj.worldY, w: dim.w, h: dim.h };
  }

  function updateObjects() {
    let yMin = playerWorldY;
    let yMax = playerWorldY;
    if (mp.phase === "play" && mp.role === "host") {
      let any = false;
      for (const p of mp.pilots) {
        if (p.mode === "over") continue;
        if (!any) {
          yMin = p.worldY;
          yMax = p.worldY;
          any = true;
        } else {
          if (p.worldY < yMin) yMin = p.worldY;
          if (p.worldY > yMax) yMax = p.worldY;
        }
      }
    }
    const y0 = yMin - 48;
    const y1 = yMax + 210;
    const s0 = Math.max(0, Math.floor(y0 / SECTION_H));
    const s1 = Math.floor(y1 / SECTION_H);
    for (let s = s0; s <= s1; s++) {
      const sec = getSection(s);
      for (const block of sec.blocks) {
        const obj = block.object;
        if (!obj || obj.dead) continue;
        if (obj.worldY < y0 || obj.worldY > y1) continue;
        if (obj.type === "house" || obj.type === "tree" || obj.type === "fuel") continue;
        if (!obj.moving && yMax > obj.moveAt) obj.moving = true;
        if (!obj.moving && obj.type !== "ejet") continue;
        if (obj.type === "ejet") {
          obj.x += obj.vx;
          if (obj.x < -8) obj.x = W + 8;
          if (obj.x > W + 8) obj.x = -8;
          continue;
        }
        obj.x += obj.vx;
        const g = geometryAt(obj.worldY + 4);
        const ch = channelsOf(g);
        const c = ch[Math.min(obj.channel, ch.length - 1)];
        const dim = sizeOf(obj.type);
        const left = c[0] + dim.w / 2;
        const right = c[1] - dim.w / 2;
        if (right <= left) continue;
        if (obj.x < left) {
          obj.x = left;
          obj.vx = Math.abs(obj.vx);
        } else if (obj.x > right) {
          obj.x = right;
          obj.vx = -Math.abs(obj.vx);
        }
      }
    }
  }

  function eachNear(cb) {
    eachNearY(playerWorldY, cb);
  }

  function eachNearY(worldY, cb) {
    const y0 = worldY - 30;
    const y1 = worldY + PLAY_H;
    const s0 = Math.max(0, Math.floor((worldY - 20) / SECTION_H));
    const s1 = Math.floor((worldY + 180) / SECTION_H);
    for (let s = s0; s <= s1; s++) {
      const sec = getSection(s);
      for (let i = 0; i < sec.blocks.length; i++) {
        const block = sec.blocks[i];
        if (block.isBridge) {
          const worldY = s * SECTION_H + i * BLOCK + 10;
          if (worldY > y0 && worldY < y1) cb({ kind: "bridge", section: s, block, worldY });
        }
        const obj = block.object;
        if (!obj || obj.dead) continue;
        if (obj.worldY > y0 && obj.worldY < y1) cb({ kind: "obj", obj });
      }
    }
  }

  function fireMissile() {
    if (missile) return;
    const top = playerWorldY + 2;
    missile = { x: player.x, worldY: top, fromY: top };
    sfx.shot();
  }

  function updateMissile() {
    if (!missile) return;
    const scroll = SPEEDS[speed];
    missile.worldY += scroll + 3.1;
    if (guided) missile.x = player.x;
    if (missile.worldY > playerWorldY + playerScreenTop() + 8) {
      missile = null;
      return;
    }
    const mw = 2;
    const mh = 5;
    eachNear((item) => {
      if (!missile) return;
      if (item.kind === "bridge") {
        if (destroyedBridges.has(item.section)) return;
        const g = geometryAt(item.worldY + 6);
        const left = g.cx - g.half;
        const bw = g.half * 2;
        if (rects(missile.x - 1, missile.worldY, mw, mh, left, item.worldY, bw, 12)) {
          destroyedBridges.add(item.section);
          checkpoint = item.section + 1;
          addScore(500);
          explosions.push({ x: missile.x, worldY: item.worldY + 4, t: 0, big: true });
          sfx.bridge();
          bridgeFlash = 8;
          missile = null;
        }
        return;
      }
      const obj = item.obj;
      if (obj.type === "house" || obj.type === "tree") return;
      const r = objectRect(obj);
      if (rects(missile.x - 1, missile.worldY, mw, mh, r.x, r.y, r.w, r.h)) {
        obj.dead = true;
        addScore(POINTS[obj.type] || 0);
        explosions.push({ x: obj.x, worldY: obj.worldY + r.h / 2, t: 0, big: obj.type === "fuel" });
        sfx.explodeSmall();
        missile = null;
      }
    });
  }

  function hitsBank() {
    const samples = [
      [player.x, playerWorldY + 1],
      [player.x - 4, playerWorldY + 6],
      [player.x + 4, playerWorldY + 6],
      [player.x, playerWorldY + 12],
    ];
    for (const [x, y] of samples) {
      const g = geometryAt(y);
      const left = g.cx - g.half;
      const right = g.cx + g.half;
      if (x < left || x > right) return true;
      if (g.island > 1 && x > g.cx - g.island && x < g.cx + g.island) return true;
    }
    return false;
  }

  function updatePlay() {
    const left = down.has("ArrowLeft") || down.has("KeyA") || down.has("PadLeft") || touch.left;
    const right = down.has("ArrowRight") || down.has("KeyD") || down.has("PadRight") || touch.right;
    if (left) player.x -= 1.55;
    if (right) player.x += 1.55;
    player.x = clamp(player.x, 4, W - 4);

    const scroll = SPEEDS[speed];
    playerWorldY += scroll;
    fuel = Math.max(0, fuel - 1 / FUEL_FRAMES);
    if (fuel <= 0) {
      kill(null);
      return;
    }
    if (fuel < 0.25 && tick % (fuel < 0.1 ? 10 : 16) === 0) {
      sirenFlip = !sirenFlip;
      sfx.siren(sirenFlip, fuel < 0.1);
    }

    updateObjects();
    updateMissile();
    if (mode !== "playing") return;

    const prect = playerRect();
    let refueling = false;
    eachNear((item) => {
      if (mode !== "playing") return;
      if (item.kind === "bridge") {
        if (destroyedBridges.has(item.section)) return;
        const g = geometryAt(item.worldY + 6);
        const leftB = g.cx - g.half;
        if (rects(prect.x, prect.y, prect.w, prect.h, leftB, item.worldY, g.half * 2, 12)) {
          kill(null);
        }
        return;
      }
      const obj = item.obj;
      const r = objectRect(obj);
      if (!rects(prect.x, prect.y, prect.w, prect.h, r.x, r.y, r.w, r.h)) return;
      if (obj.type === "fuel") {
        refueling = true;
        fuel = Math.min(1, fuel + 0.02);
      } else if (obj.type === "house" || obj.type === "tree") {
        return;
      } else {
        obj.dead = true;
        kill(obj);
      }
    });
    if (mode !== "playing") return;
    if (refueling && tick % 8 === 0) sfx.refuel(fuel >= 1);
    if (hitsBank()) kill(null);

    const fireNow = down.has("Space") || down.has("KeyZ") || down.has("KeyX") || touch.fire;
    if (fireNow) fireMissile();
  }

  function updateAttract() {
    playerWorldY += SPEEDS[0];
    const g = geometryAt(playerWorldY + 6);
    const target = channelCenter(g);
    player.x += clamp(target - player.x, -1.4, 1.4);
    updateObjects();
    if (playerWorldY > 4000) {
      playerWorldY = 40;
      sectionCache.clear();
    }
  }

  function makePilot(id, color) {
    return {
      id,
      color,
      x: 80,
      worldY: 40,
      speed: 1,
      fuel: 1,
      lives: 3,
      score: 0,
      checkpoint: 0,
      missile: null,
      mode: "lobby",
      deathT: 0,
      guided: false,
      input: { left: false, right: false, up: false, down: false, fire: false },
      prevUp: false,
      prevDown: false,
      refuel: false,
      synced: false,
    };
  }

  function readInput() {
    return {
      left: down.has("ArrowLeft") || down.has("KeyA") || down.has("PadLeft") || touch.left,
      right: down.has("ArrowRight") || down.has("KeyD") || down.has("PadRight") || touch.right,
      up: down.has("ArrowUp") || down.has("KeyW") || padUpHeld || touchUpPulse,
      down: down.has("ArrowDown") || down.has("KeyS") || padDownHeld || touchDownPulse,
      fire: down.has("Space") || down.has("KeyZ") || down.has("KeyX") || touch.fire || padHeld,
    };
  }

  function scorePilot(p, n) {
    const before = Math.floor(p.score / 10000);
    p.score += n;
    const after = Math.floor(p.score / 10000);
    if (after > before && p.lives < 9) {
      p.lives = Math.min(9, p.lives + (after - before));
      if (p === mp.self) sfx.extra();
    }
  }

  function killPilot(p, reasonObject) {
    if (p.mode !== "playing") return;
    if (reasonObject && POINTS[reasonObject.type]) scorePilot(p, POINTS[reasonObject.type]);
    p.mode = "dying";
    p.deathT = 0;
    p.missile = null;
    explosions.push({ x: p.x, worldY: p.worldY + 4, t: 0, big: true });
    if (p === mp.self) sfx.explode();
  }

  function finishPilotDeath(p) {
    p.lives -= 1;
    p.missile = null;
    if (p.lives <= 0) {
      p.mode = "over";
      if (p === mp.self && p.score > best) {
        best = p.score;
        localStorage.setItem("riverraid-best", String(best));
      }
      return;
    }
    p.worldY = p.checkpoint * SECTION_H + 36;
    p.fuel = 1;
    p.speed = 1;
    const g = geometryAt(p.worldY + 4);
    p.x = channelCenter(g);
    p.mode = "playing";
    p.deathT = 0;
  }

  function placePilot(p, index, n) {
    p.worldY = 40;
    p.fuel = 1;
    p.lives = 3;
    p.score = 0;
    p.speed = 1;
    p.checkpoint = 0;
    p.missile = null;
    p.mode = "playing";
    p.deathT = 0;
    p.prevUp = false;
    p.prevDown = false;
    const g = geometryAt(p.worldY + 4);
    const mid = (n - 1) / 2;
    p.x = clamp(channelCenter(g) + (index - mid) * 16, 8, W - 8);
  }

  function pilotHitsBank(p) {
    const samples = [
      [p.x, p.worldY + 1],
      [p.x - 4, p.worldY + 6],
      [p.x + 4, p.worldY + 6],
      [p.x, p.worldY + 12],
    ];
    for (const [x, y] of samples) {
      const g = geometryAt(y);
      const left = g.cx - g.half;
      const right = g.cx + g.half;
      if (x < left || x > right) return true;
      if (g.island > 1 && x > g.cx - g.island && x < g.cx + g.island) return true;
    }
    return false;
  }

  function stepPilotMove(p) {
    if (p.mode === "dying") {
      p.deathT++;
      if (p.deathT > 56) finishPilotDeath(p);
      return;
    }
    if (p.mode !== "playing") return;
    const input = p.input || {};
    if (input.up && !p.prevUp) p.speed = clamp(p.speed + 1, 0, 2);
    if (input.down && !p.prevDown) p.speed = clamp(p.speed - 1, 0, 2);
    p.prevUp = !!input.up;
    p.prevDown = !!input.down;
    if (input.left) p.x -= 1.55;
    if (input.right) p.x += 1.55;
    p.x = clamp(p.x, 4, W - 4);
    p.worldY += SPEEDS[p.speed];
    p.fuel = Math.max(0, p.fuel - 1 / FUEL_FRAMES);
    if (p.fuel <= 0) killPilot(p, null);
  }

  function stepPilotFight(p) {
    if (p.mode !== "playing") return;
    const input = p.input || {};
    if (p.missile) {
      p.missile.worldY += SPEEDS[p.speed] + 3.1;
      if (p.guided) p.missile.x = p.x;
      if (p.missile.worldY > p.worldY + playerScreenTop() + 8) p.missile = null;
    }
    if (p.missile) {
      const shot = p.missile;
      eachNearY(p.worldY, (item) => {
        if (!p.missile) return;
        if (item.kind === "bridge") {
          if (destroyedBridges.has(item.section)) return;
          const g = geometryAt(item.worldY + 6);
          const left = g.cx - g.half;
          if (rects(shot.x - 1, shot.worldY, 2, 5, left, item.worldY, g.half * 2, 12)) {
            destroyedBridges.add(item.section);
            for (const other of mp.pilots) other.checkpoint = Math.max(other.checkpoint, item.section + 1);
            scorePilot(p, 500);
            explosions.push({ x: shot.x, worldY: item.worldY + 4, t: 0, big: true });
            if (p === mp.self) sfx.bridge();
            bridgeFlash = 8;
            p.missile = null;
          }
          return;
        }
        const obj = item.obj;
        if (obj.type === "house" || obj.type === "tree") return;
        const r = objectRect(obj);
        if (rects(shot.x - 1, shot.worldY, 2, 5, r.x, r.y, r.w, r.h)) {
          obj.dead = true;
          scorePilot(p, POINTS[obj.type] || 0);
          explosions.push({ x: obj.x, worldY: obj.worldY + r.h / 2, t: 0, big: obj.type === "fuel" });
          if (p === mp.self) sfx.explodeSmall();
          p.missile = null;
        }
      });
    }
    if (p.mode !== "playing") return;
    const prect = { x: p.x - 4, y: p.worldY + 1, w: 8, h: 12 };
    let refueling = false;
    eachNearY(p.worldY, (item) => {
      if (p.mode !== "playing") return;
      if (item.kind === "bridge") {
        if (destroyedBridges.has(item.section)) return;
        const g = geometryAt(item.worldY + 6);
        if (rects(prect.x, prect.y, prect.w, prect.h, g.cx - g.half, item.worldY, g.half * 2, 12)) killPilot(p, null);
        return;
      }
      const obj = item.obj;
      const r = objectRect(obj);
      if (!rects(prect.x, prect.y, prect.w, prect.h, r.x, r.y, r.w, r.h)) return;
      if (obj.type === "fuel") {
        refueling = true;
        p.fuel = Math.min(1, p.fuel + 0.02);
      } else if (obj.type === "house" || obj.type === "tree") {
        return;
      } else {
        obj.dead = true;
        killPilot(p, obj);
      }
    });
    p.refuel = refueling;
    if (p.mode !== "playing") return;
    if (refueling && p === mp.self && tick % 8 === 0) sfx.refuel(p.fuel >= 1);
    if (pilotHitsBank(p)) killPilot(p, null);
    if (p.mode === "playing" && input.fire && !p.missile) {
      const top = p.worldY + 2;
      p.missile = { x: p.x, worldY: top };
      if (p === mp.self) sfx.shot();
    }
  }

  function syncView() {
    const self = mp.self;
    if (!self) return;
    fuel = self.fuel;
    lives = self.lives;
    score = self.score;
    speed = self.speed;
    checkpoint = self.checkpoint;
    missile = self.missile;
    if (self.mode !== "over") {
      player.x = self.x;
      playerWorldY = self.worldY;
      return;
    }
    let lead = null;
    for (const p of mp.pilots) {
      if (p.mode === "over") continue;
      if (!lead || p.worldY > lead.worldY) lead = p;
    }
    if (lead) {
      player.x = lead.x;
      playerWorldY = lead.worldY;
    }
  }

  function maybeSiren() {
    if (mp.phase !== "play" || !mp.self || mp.self.mode !== "playing") return;
    if (fuel < 0.25 && tick % (fuel < 0.1 ? 10 : 16) === 0) {
      sirenFlip = !sirenFlip;
      sfx.siren(sirenFlip, fuel < 0.1);
    }
  }

  function packState() {
    const r1 = (n) => Math.round(n * 10) / 10;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const p of mp.pilots) {
      if (p.mode === "over") continue;
      if (p.worldY < yMin) yMin = p.worldY;
      if (p.worldY > yMax) yMax = p.worldY;
    }
    if (yMin === Infinity) {
      yMin = playerWorldY;
      yMax = playerWorldY;
    }
    const objects = [];
    const s0 = Math.max(0, Math.floor((yMin - 40) / SECTION_H));
    const s1 = Math.floor((yMax + 200) / SECTION_H);
    for (let s = s0; s <= s1; s++) {
      const sec = getSection(s);
      for (let i = 0; i < sec.blocks.length; i++) {
        const obj = sec.blocks[i].object;
        if (!obj || obj.type === "house" || obj.type === "tree") continue;
        if (obj.worldY < yMin - 40 || obj.worldY > yMax + 220) continue;
        objects.push({
          id: s * 32 + i,
          x: r1(obj.x),
          vx: Math.round(obj.vx * 100) / 100,
          d: obj.dead ? 1 : 0,
        });
      }
    }
    return {
      br: Array.from(destroyedBridges),
      fl: bridgeFlash,
      e: explosions.slice(-8).map((ex) => ({
        x: Math.round(ex.x),
        y: Math.round(ex.worldY),
        t: ex.t,
        b: ex.big ? 1 : 0,
      })),
      p: mp.pilots.map((p) => ({
        id: p.id,
        c: p.color,
        x: r1(p.x),
        y: r1(p.worldY),
        sp: p.speed,
        fu: Math.round(p.fuel * 1000) / 1000,
        lv: p.lives,
        sc: Math.floor(p.score),
        md: p.mode,
        rf: p.refuel ? 1 : 0,
        mx: p.missile ? r1(p.missile.x) : null,
        my: p.missile ? r1(p.missile.worldY) : null,
      })),
      o: objects,
    };
  }

  function applyState(data) {
    if (!data) return;
    const known = mp.hadState;
    const grew = known && (data.br || []).length > destroyedBridges.size;
    destroyedBridges.clear();
    for (const section of data.br || []) destroyedBridges.add(section);
    bridgeFlash = data.fl || 0;
    explosions = (data.e || []).map((ex) => ({ x: ex.x, worldY: ex.y, t: ex.t, big: !!ex.b }));
    for (const raw of data.o || []) {
      const s = Math.floor(raw.id / 32);
      const i = raw.id % 32;
      const sec = getSection(s);
      const obj = sec.blocks[i] && sec.blocks[i].object;
      if (!obj) continue;
      obj.x = raw.x;
      obj.vx = raw.vx;
      obj.dead = !!raw.d;
      obj.moving = true;
    }
    const prev = mp.self;
    const prevMode = prev ? prev.mode : "";
    const prevLives = prev ? prev.lives : 0;
    const prevScore = prev ? prev.score : 0;
    const prevMissile = !!(prev && prev.missile);
    mp.pilots = (data.p || []).map((raw) => {
      let p = mp.pilots.find((item) => item.id === raw.id);
      if (!p) p = makePilot(raw.id, raw.c || 0);
      p.color = raw.c || 0;
      p.speed = raw.sp;
      p.fuel = raw.fu;
      p.lives = raw.lv;
      p.score = raw.sc;
      p.mode = raw.md;
      p.refuel = !!raw.rf;
      p.authX = raw.x;
      p.authY = raw.y;
      p.missile = raw.mx == null ? null : { x: raw.mx, worldY: raw.my };
      if (!p.synced) {
        p.x = raw.x;
        p.worldY = raw.y;
        p.synced = true;
      }
      return p;
    });
    mp.auth = data;
    mp.authTick = tick;
    mp.hadState = true;
    mp.self = mp.pilots.find((p) => p.id === mp.me) || null;
    syncView();
    if (grew) sfx.bridge();
    if (!known || !mp.self) return;
    const died = prevMode === "playing" && mp.self.mode === "dying";
    if (died) sfx.explode();
    if (mp.self.lives > prevLives) sfx.extra();
    if (!died && mp.self.mode === "playing" && mp.self.missile && !prevMissile) sfx.shot();
    const gained = mp.self.score - prevScore;
    if (!died && gained > 0 && !(grew && gained === 500)) sfx.explodeSmall();
  }

  function updateMatch() {
    if (!mp.self) return;
    mp.self.input = readInput();
    mp.self.guided = guided;
    for (const p of mp.pilots) stepPilotMove(p);
    updateObjects();
    for (const p of mp.pilots) stepPilotFight(p);
    syncView();
    maybeSiren();
    if (tick % 6 === 0) sendSafe(mp.stateAction, packState());
  }

  function updateGuest() {
    const input = readInput();
    const sig = (input.left ? 1 : 0) | (input.right ? 2 : 0) | (input.up ? 4 : 0) | (input.down ? 8 : 0) | (input.fire ? 16 : 0) | (guided ? 32 : 0);
    if (sig !== mp.inSig || tick % 6 === 0) {
      mp.inSig = sig;
      sendSafe(mp.inputAction, {
        left: input.left,
        right: input.right,
        up: input.up,
        down: input.down,
        fire: input.fire,
        g: guided ? 1 : 0,
      });
    }
    const dt = Math.min(20, Math.max(0, tick - mp.authTick));
    for (const p of mp.pilots) {
      if (!p.synced || p.authY == null) continue;
      const targetY = p.authY + (p.mode === "playing" ? SPEEDS[p.speed] * dt : 0);
      if (Math.abs(targetY - p.worldY) > 48 || Math.abs(p.authX - p.x) > 24) {
        p.x = p.authX;
        p.worldY = targetY;
      } else {
        p.x += (p.authX - p.x) * 0.5;
        p.worldY += (targetY - p.worldY) * 0.5;
      }
    }
    syncView();
    if (mp.self && mp.self.refuel && mp.self.mode === "playing" && tick % 8 === 0) sfx.refuel(fuel >= 1);
    maybeSiren();
  }

  function update() {
    tick++;
    if (toastT > 0) toastT--;
    if (bridgeFlash > 0) bridgeFlash--;
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].t++;
      const limit = explosions[i].big ? 54 : 24;
      if (explosions[i].t > limit) explosions.splice(i, 1);
    }

    pollPad();
    const fireHeld = down.has("Space") || down.has("KeyZ") || down.has("KeyX") || touch.fire || padHeld;
    const startHeld = fireHeld || down.has("Enter") || padFireEdge;
    const fireEdge = startHeld && !wasFire;
    wasFire = startHeld;

    if (mp.phase === "play" && mp.role === "host") {
      updateMatch();
    } else if (mp.phase === "play" && mp.role === "guest") {
      updateGuest();
    } else if ((mode === "title" || mode === "over") && mp.phase !== "lobby") {
      if (fireEdge || edge.enter) startGame();
      else updateAttract();
    } else if (mp.phase === "lobby") {
      updateAttract();
    } else if (mode === "paused") {
      /* frozen */
    } else if (mode === "dying") {
      deathT++;
      if (deathT > 56) finishDeath();
    } else {
      updatePlay();
    }
    const turnLeft = down.has("ArrowLeft") || down.has("KeyA") || down.has("PadLeft") || touch.left;
    const turnRight = down.has("ArrowRight") || down.has("KeyD") || down.has("PadRight") || touch.right;
    const turn = turnLeft === turnRight ? 0 : turnLeft ? -1 : 1;
    const flying = mp.phase === "play" ? !!(mp.self && mp.self.mode === "playing") : mode === "playing";
    sfx.engine(flying, speed, turn);
    edge.enter = false;
    padFireEdge = false;
    touchUpPulse = false;
    touchDownPulse = false;
  }

  let padHeld = false;
  function pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let fire = false;
    let left = false;
    let right = false;
    let up = false;
    let downAxis = false;
    for (const p of pads) {
      if (!p) continue;
      const ax = p.axes[0] || 0;
      const ay = p.axes[1] || 0;
      if (ax < -0.4) left = true;
      if (ax > 0.4) right = true;
      if (ay < -0.55) up = true;
      if (ay > 0.55) downAxis = true;
      for (const b of p.buttons) if (b.pressed) fire = true;
    }
    padUpHeld = up;
    padDownHeld = downAxis;
    if (left) down.add("PadLeft");
    else down.delete("PadLeft");
    if (right) down.add("PadRight");
    else down.delete("PadRight");
    if (up && !edge.padUp) changeSpeed(1);
    if (downAxis && !edge.padDown) changeSpeed(-1);
    edge.padUp = up;
    edge.padDown = downAxis;
    if (fire && !padHeld) padFireEdge = true;
    padHeld = fire;
  }

  const edge = { enter: false, padUp: false, padDown: false };

  function changeSpeed(dir) {
    if (mp.phase === "play") return;
    if (mode !== "playing") return;
    speed = clamp(speed + dir, 0, 2);
  }

  function drawText(str, x, y, scale, color) {
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of str) {
      const rows = FONT[ch] || FONT[" "];
      for (let yy = 0; yy < rows.length; yy++) {
        for (let xx = 0; xx < rows[yy].length; xx++) {
          if (rows[yy][xx] === "1") ctx.fillRect(cx + xx * scale, y + yy * scale, scale, scale);
        }
      }
      cx += 4 * scale;
    }
  }

  function textWidth(str, scale) {
    return str.length * 4 * scale - scale;
  }

  function drawTextOutlined(str, x, y, scale, color) {
    drawText(str, x + 1, y, scale, COL.black);
    drawText(str, x - 1, y, scale, COL.black);
    drawText(str, x, y + 1, scale, COL.black);
    drawText(str, x, y - 1, scale, COL.black);
    drawText(str, x, y, scale, color);
  }

  function drawCentered(str, y, scale, color, outline) {
    const x = Math.round((W - textWidth(str, scale)) / 2);
    if (outline) drawTextOutlined(str, x, y, scale, color);
    else drawText(str, x, y, scale, color);
  }

  function renderRiver() {
    for (let sy = 0; sy < PLAY_H; sy++) {
      const worldY = playerWorldY + (playerScreenTop() - sy);
      const g = geometryAt(worldY);
      const band = (g.sectionIndex + g.blockIndex) % 2 === 0;
      ctx.fillStyle = band ? COL.land : COL.landDark;
      ctx.fillRect(0, sy, W, 1);
      const left = Math.round(g.cx - g.half);
      const right = Math.round(g.cx + g.half);
      ctx.fillStyle = COL.water;
      ctx.fillRect(left, sy, Math.max(0, right - left), 1);
      ctx.fillStyle = COL.landEdge;
      ctx.fillRect(left - 1, sy, 1, 1);
      ctx.fillRect(right, sy, 1, 1);
      if (g.island > 1) {
        const il = Math.round(g.cx - g.island);
        const ir = Math.round(g.cx + g.island);
        ctx.fillStyle = band ? COL.land : COL.landDark;
        ctx.fillRect(il, sy, Math.max(0, ir - il), 1);
        ctx.fillStyle = COL.landEdge;
        ctx.fillRect(il, sy, 1, 1);
        ctx.fillRect(ir - 1, sy, 1, 1);
      }
    }
  }

  function blit(sprite, x, worldY) {
    const sy = Math.round(worldToScreen(worldY));
    const sx = Math.round(x - sprite.width / 2);
    if (sy > PLAY_H || sy + sprite.height < 0) return;
    ctx.drawImage(sprite, sx, sy);
  }

  function renderWorld() {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, PLAY_H);
    ctx.clip();

    const y0 = playerWorldY - 40;
    const y1 = playerWorldY + 190;
    const s0 = Math.max(0, Math.floor(y0 / SECTION_H));
    const s1 = Math.floor(y1 / SECTION_H);
    const roads = [];
    const scenery = [];
    const craft = [];
    const jets = [];
    const bridges = [];

    for (let s = s0; s <= s1; s++) {
      const sec = getSection(s);
      for (let i = 0; i < sec.blocks.length; i++) {
        const block = sec.blocks[i];
        if (block.isRoad || block.isBridge) {
          roads.push({ s, i, block });
        }
        if (block.isBridge && !destroyedBridges.has(s)) {
          bridges.push({ s, i, block, worldY: s * SECTION_H + i * BLOCK + 10 });
        }
        const obj = block.object;
        if (!obj || obj.dead) continue;
        if (obj.type === "house" || obj.type === "tree") scenery.push(obj);
        else if (obj.type === "ejet") jets.push(obj);
        else craft.push(obj);
      }
    }

    for (const road of roads) {
      const worldY = road.s * SECTION_H + road.i * BLOCK + 12;
      const sy = Math.round(worldToScreen(worldY));
      if (sy < -8 || sy > PLAY_H) continue;
      const left = Math.round(road.block.cx - road.block.half);
      const right = Math.round(road.block.cx + road.block.half);
      ctx.fillStyle = COL.road;
      ctx.fillRect(0, sy, left, 6);
      ctx.fillRect(right, sy, W - right, 6);
      ctx.fillStyle = "#8A8A90";
      ctx.fillRect(0, sy + 2, left, 1);
      ctx.fillRect(right, sy + 2, W - right, 1);
    }
    for (const obj of scenery) blit(spriteFor(obj.type), obj.x, obj.worldY);
    for (const obj of craft) {
      let spr = spriteFor(obj.type);
      if (obj.vx < 0 && obj.type === "ship") spr = sprites.shipLeft;
      else if (obj.vx < 0 && obj.type === "heli") spr = spr === sprites.heliA ? sprites.heliALeft : sprites.heliBLeft;
      blit(spr, obj.x, obj.worldY);
    }
    for (const br of bridges) {
      const sy = Math.round(worldToScreen(br.worldY));
      const g = geometryAt(br.worldY + 6);
      const left = Math.round(g.cx - g.half);
      const bw = Math.round(g.half * 2);
      ctx.fillStyle = COL.bridgeDark;
      ctx.fillRect(left, sy, bw, 12);
      ctx.fillStyle = COL.bridge;
      ctx.fillRect(left, sy, bw, 3);
      ctx.fillRect(left, sy + 9, bw, 3);
      ctx.fillStyle = "#E4E4EA";
      for (let x = left + 2; x < left + bw - 2; x += 4) {
        ctx.fillRect(x, sy + 4, 2, 4);
      }
    }
    for (const obj of jets) blit(spriteFor(obj.type), obj.x, obj.worldY);

    if (mp.phase !== "play" && missile) {
      const sy = Math.round(worldToScreen(missile.worldY));
      ctx.fillStyle = COL.needle;
      ctx.fillRect(Math.round(missile.x) - 0, sy, 1, 5);
    }

    for (const ex of explosions) {
      const sy = Math.round(worldToScreen(ex.worldY));
      const frame = Math.floor(ex.t / 4) % 6;
      const rad = [2, 5, 8, 7, 4, 2][frame] + (ex.big ? 2 : 0);
      const colors = ["#FFF6A0", "#FFD040", "#F07820", "#E04018", "#F4F4F0", "#A02810"];
      ctx.fillStyle = colors[Math.min(colors.length - 1, frame)];
      ctx.fillRect(Math.round(ex.x) - rad, sy - rad, rad * 2, rad * 2);
      ctx.fillStyle = frame % 2 === 0 ? "#FFF6A0" : "#FFFFFF";
      ctx.fillRect(Math.round(ex.x) - 1, sy - 1, 3, 3);
    }

    if (mp.phase === "play") {
      for (const p of mp.pilots) {
        if (p.mode === "dying" || p.mode === "over") continue;
        blit(sprites.jetAlt[p.color] || sprites.jet, p.x, p.worldY);
        if (!p.missile) continue;
        const sy = Math.round(worldToScreen(p.missile.worldY));
        ctx.fillStyle = COL.needle;
        ctx.fillRect(Math.round(p.missile.x), sy, 1, 5);
      }
    } else if (mode !== "dying" && mode !== "over") {
      blit(sprites.jet, player.x, playerWorldY);
    }
    ctx.restore();
  }

  function renderHud() {
    ctx.fillStyle = COL.black;
    ctx.fillRect(0, PLAY_H, W, 1);
    ctx.fillStyle = COL.hud;
    ctx.fillRect(0, PLAY_H + 1, W, H - PLAY_H - 1);

    const scoreStr = String(Math.floor(score)).padStart(6, "0");
    drawCentered(scoreStr, 162, 1, COL.yellow, false);

    const boxX = 30;
    const boxY = 169;
    const boxW = 100;
    const boxH = 11;
    ctx.fillStyle = COL.black;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    drawText("E", boxX + 3, boxY + 3, 1, COL.white);
    drawText("F", boxX + boxW - 8, boxY + 3, 1, COL.white);
    const innerL = boxX + 16;
    const innerR = boxX + boxW - 16;
    const nx = Math.round(innerL + (innerR - innerL) * fuel);
    const flash = fuel < 0.25 && Math.floor(tick / 8) % 2 === 0;
    if (!flash) {
      ctx.fillStyle = fuel < 0.25 ? "#F0A020" : COL.needle;
      ctx.fillRect(nx, boxY + 2, 2, boxH - 4);
    }

    drawText(String(lives), 6, 182, 2, COL.yellow);
    for (let i = 0; i < 3; i++) {
      const on = i <= speed;
      ctx.fillStyle = on ? COL.yellow : "#5A5A5A";
      const bh = 3 + i * 2;
      ctx.fillRect(132 + i * 8, 190 - bh, 6, bh);
    }
  }

  function renderOverlay() {
    if (bridgeFlash > 0 && mode === "playing") {
      ctx.fillStyle = "rgba(255,255,255," + (bridgeFlash / 16) + ")";
      ctx.fillRect(0, 0, W, PLAY_H);
    }
    if (toastT > 0) {
      drawCentered(toast, 48, 1, COL.yellow, true);
    }
    if (mode === "title") {
      drawCentered("RIVER PLANE", 8, 2, COL.yellow, true);
      if (mp.phase === "lobby") drawCentered("IN ROOM", 30, 1, COL.white, true);
      else if (Math.floor(tick / 30) % 2 === 0) drawCentered("PRESS FIRE", 30, 1, COL.white, true);
      drawCentered(guided ? "GUIDED" : "DIRECT", 42, 1, COL.white, true);
    } else if (mp.phase === "play" && mp.self && mp.self.mode === "over") {
      drawCentered("DOWNED", 58, 1, COL.yellow, true);
    } else if (mode === "paused") {
      drawCentered("PAUSED", 70, 2, COL.yellow, true);
    } else if (mode === "over") {
      drawCentered("GAME OVER", 58, 2, COL.yellow, true);
      drawCentered("SCORE " + String(score).padStart(6, "0"), 80, 1, COL.white, true);
      drawCentered("BEST  " + String(best).padStart(6, "0"), 90, 1, COL.white, true);
      if (Math.floor(tick / 30) % 2 === 0) drawCentered("PRESS FIRE", 108, 1, COL.white, true);
    }
  }

  function render() {
    renderRiver();
    renderWorld();
    renderHud();
    renderOverlay();
  }

  function createSfx() {
    let actx = null;
    let master = null;
    function unlock() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) {
        actx = new AC();
        master = actx.createGain();
        master.gain.value = 0.18;
        master.connect(actx.destination);
      }
      if (actx.state === "suspended") actx.resume();
      master.gain.value = muted ? 0 : 0.18;
    }
    function tone(freq, dur, type, gain) {
      if (!actx || muted) return;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.25, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
      o.connect(g);
      g.connect(master);
      o.start();
      o.stop(actx.currentTime + dur);
    }
    function noise(dur) {
      if (!actx || muted) return;
      const n = Math.floor(actx.sampleRate * dur);
      const buf = actx.createBuffer(1, n, actx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = actx.createBufferSource();
      const g = actx.createGain();
      g.gain.value = 0.45;
      src.buffer = buf;
      src.connect(g);
      g.connect(master);
      src.start();
    }

    // Continuous jet buzz, the 2600 engine: a thin square plus a little grit.
    // Pitch steps with the three speeds. Gain stays under shots and the siren.
    const ENGINE_HZ = [132, 176, 236];
    let engine = null;
    let engineOn = false;
    let engineBank = 0;
    let engineOsc = null;
    let engineHigh = null;
    let engineNoise = null;
    function ensureEngine() {
      if (engine || !actx) return;
      engine = actx.createGain();
      engine.gain.value = 0;
      engine.connect(master);

      engineOsc = actx.createOscillator();
      engineOsc.type = "square";
      engineOsc.frequency.value = ENGINE_HZ[1];
      const body = actx.createGain();
      body.gain.value = 0.16;
      engineOsc.connect(body);
      body.connect(engine);

      engineHigh = actx.createOscillator();
      engineHigh.type = "square";
      engineHigh.frequency.value = ENGINE_HZ[1] * 2;
      const bite = actx.createGain();
      bite.gain.value = 0.045;
      engineHigh.connect(bite);
      bite.connect(engine);

      const len = Math.floor(actx.sampleRate * 0.09);
      const buf = actx.createBuffer(1, len, actx.sampleRate);
      const data = buf.getChannelData(0);
      let lfsr = 0x13;
      for (let i = 0; i < len; i++) {
        const bit = ((lfsr >> 0) ^ (lfsr >> 2)) & 1;
        lfsr = ((lfsr >> 1) | (bit << 4)) & 0x1f;
        data[i] = lfsr & 1 ? 0.45 : -0.45;
      }
      engineNoise = actx.createBufferSource();
      engineNoise.buffer = buf;
      engineNoise.loop = true;
      engineNoise.playbackRate.value = 1;
      const grit = actx.createGain();
      grit.gain.value = 0.05;
      const band = actx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 640;
      band.Q.value = 0.6;
      engineNoise.connect(band);
      band.connect(grit);
      grit.connect(engine);

      engineOsc.start();
      engineHigh.start();
      engineNoise.start();
    }
    function engineFly(on, speedIndex, turn) {
      if (!actx) return;
      ensureEngine();
      const now = actx.currentTime;
      if (on !== engineOn) {
        engineOn = on;
        engine.gain.cancelScheduledValues(now);
        engine.gain.setTargetAtTime(on ? 0.58 : 0, now, on ? 0.05 : 0.03);
      }
      if (!on) {
        engineBank = 0;
        return;
      }
      const stick = turn || 0;
      engineBank += (stick - engineBank) * 0.12;
      const mag = Math.abs(engineBank);
      const base = ENGINE_HZ[speedIndex] || ENGINE_HZ[1];
      const hz = base * (1 + mag * 0.18) + engineBank * base * 0.05;
      const flutter = Math.sin(now * (28 + mag * 26)) * (2.2 + speedIndex + mag * 10);
      engineOsc.frequency.setTargetAtTime(hz + flutter, now, 0.02);
      engineHigh.frequency.setTargetAtTime((hz + flutter) * 2, now, 0.02);
      engineNoise.playbackRate.setTargetAtTime((hz / ENGINE_HZ[1]) * (1 + mag * 0.25), now, 0.04);
    }
    return {
      unlock,
      engine: engineFly,
      shot() { tone(880, 0.07, "square", 0.18); tone(420, 0.09, "square", 0.12); },
      explode() { noise(0.22); tone(140, 0.18, "sawtooth", 0.2); },
      explodeSmall() { noise(0.12); },
      bridge() { noise(0.2); tone(523, 0.12, "square", 0.2); tone(784, 0.16, "square", 0.16); },
      siren(high, urgent) { tone(high ? 520 : 340, urgent ? 0.07 : 0.09, "square", 0.12); },
      refuel(full) { tone(full ? 1040 : 760, 0.05, "square", 0.1); },
      extra() { tone(523, 0.08, "square", 0.16); tone(659, 0.08, "square", 0.16); tone(784, 0.12, "square", 0.16); },
      setMuted(v) { muted = v; if (master) master.gain.value = v ? 0 : 0.18; },
    };
  }

  window.addEventListener("keydown", (e) => {
    const controls = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyZ", "KeyX"];
    if (controls.includes(e.code)) e.preventDefault();
    if (e.repeat && (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "KeyW" || e.code === "KeyS")) return;
    down.add(e.code);
    sfx.unlock();
    if (e.code === "ArrowUp" || e.code === "KeyW") changeSpeed(1);
    if (e.code === "ArrowDown" || e.code === "KeyS") changeSpeed(-1);
    if (e.code === "Enter" && !e.repeat && !(e.target && e.target.closest && e.target.closest("#room"))) {
      if (mp.phase === "off") {
        edge.enter = true;
        if (mode === "paused") mode = "playing";
      }
    }
    if (e.code === "KeyP" && !e.repeat) {
      if (mp.phase === "play") showToast("NO PAUSE");
      else if (mode === "playing") mode = "paused";
      else if (mode === "paused") mode = "playing";
    }
    if (e.code === "KeyM" && !e.repeat) {
      muted = !muted;
      localStorage.setItem("riverraid-muted", muted ? "1" : "0");
      sfx.setMuted(muted);
      showToast(muted ? "MUTED" : "SOUND");
    }
    if ((e.code === "KeyG" || e.code === "F4") && !e.repeat) {
      guided = !guided;
      localStorage.setItem("riverraid-guided", guided ? "1" : "0");
      showToast(guided ? "GUIDED" : "DIRECT");
    }
  });

  window.addEventListener("keyup", (e) => down.delete(e.code));
  window.addEventListener("blur", () => down.clear());

  canvas.addEventListener("pointerdown", (e) => {
    sfx.unlock();
    if ((mode === "title" || mode === "over") && mp.phase === "off") {
      edge.enter = true;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    if (mode === "playing") {
      if (x < player.x) touch.left = true;
      else touch.right = true;
      touch.fire = true;
    }
  });
  canvas.addEventListener("pointerup", () => {
    touch.left = false;
    touch.right = false;
    touch.fire = false;
  });
  canvas.addEventListener("pointerleave", () => {
    touch.left = false;
    touch.right = false;
    touch.fire = false;
  });

  for (const button of document.querySelectorAll(".pad button")) {
    const hold = button.dataset.hold;
    const press = (ev) => {
      ev.preventDefault();
      sfx.unlock();
      if (hold === "up") {
        if (mp.phase === "play") touchUpPulse = true;
        else changeSpeed(1);
      } else if (hold === "down") {
        if (mp.phase === "play") touchDownPulse = true;
        else changeSpeed(-1);
      } else touch[hold] = true;
      if ((mode === "title" || mode === "over") && mp.phase === "off" && hold === "fire") edge.enter = true;
    };
    const release = () => {
      if (hold === "left" || hold === "right" || hold === "fire") touch[hold] = false;
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
  }

  let roomForm = "setup";
  let roomBusy = false;
  let mqttLoading = null;

  function roomError(text) {
    const el = document.getElementById("room-msg");
    el.hidden = !text;
    el.textContent = text || "";
  }

  function rosterRows() {
    if (mp.pilots.length) {
      return mp.pilots.map((p) => ({ id: p.id, color: p.color }));
    }
    const ids = mp.rosterIds || [];
    const colors = mp.rosterColors || [];
    return ids.map((id, i) => ({ id, color: colors[i] ?? i }));
  }

  function showPanels() {
    const inRoom = mp.phase === "lobby" || mp.phase === "play";
    document.getElementById("room-setup").hidden = inRoom || roomForm !== "setup";
    document.getElementById("room-create").hidden = inRoom || roomForm !== "create";
    document.getElementById("room-join").hidden = inRoom || roomForm !== "join";
    document.getElementById("room-lobby").hidden = !inRoom;
    if (!inRoom) return;
    document.getElementById("room-code-show").textContent = mp.code;
    const rows = rosterRows();
    const list = document.getElementById("room-list");
    list.replaceChildren();
    for (const row of rows) {
      const li = document.createElement("li");
      const name = PILOT_NAME[row.color] || PILOT_NAME[0];
      li.textContent = name + (row.id === mp.me ? " (you)" : "");
      list.appendChild(li);
    }
    const me = rows.find((row) => row.id === mp.me);
    const you = document.getElementById("room-you");
    you.textContent = me ? "You are the " + (PILOT_NAME[me.color] || PILOT_NAME[0]).toLowerCase() + " plane." : "Connecting…";
    if (mp.phase === "play") you.textContent += " In play.";
    const start = document.getElementById("room-start");
    start.hidden = mp.role !== "host" || mp.phase === "play";
    start.disabled = mp.pilots.length < 2 || !mp.clients.some((client) => client.connected);
  }

  function sendSafe(action, data) {
    if (!action) return;
    try { action.send(data); } catch (err) { /* broker not connected yet */ }
  }

  function sendRoster() {
    if (mp.role !== "host" || !mp.rosterAction) return;
    sendSafe(mp.rosterAction, {
      ids: mp.pilots.map((p) => p.id),
      colors: mp.pilots.map((p) => p.color),
      phase: mp.phase,
    });
  }

  function resetTitle() {
    mode = "title";
    score = 0;
    lives = 3;
    fuel = 1;
    speed = 1;
    checkpoint = 0;
    missile = null;
    explosions = [];
    deathT = 0;
    sectionCache.clear();
    destroyedBridges.clear();
    playerWorldY = 48;
    player.x = 80;
  }

  function beginMatchLocal() {
    if (mp.phase === "play") return;
    if (!mp.hadState) {
      sectionCache.clear();
      destroyedBridges.clear();
      explosions = [];
      missile = null;
    }
    mode = "playing";
    mp.phase = "play";
    showPanels();
  }

  function beginMatchHost() {
    if (mp.role !== "host" || mp.pilots.length < 2) return;
    sectionCache.clear();
    destroyedBridges.clear();
    explosions = [];
    missile = null;
    const n = mp.pilots.length;
    mp.pilots.forEach((p, i) => placePilot(p, i, n));
    mp.phase = "play";
    mode = "playing";
    syncView();
    sendSafe(mp.startAction, { go: 1 });
    sendSafe(mp.stateAction, packState());
    sendRoster();
    showPanels();
  }

  function leaveRoom() {
    const wasMatch = mp.phase === "play";
    const clients = mp.clients;
    const topic = mp.topic;
    if (mp.heart) {
      clearInterval(mp.heart);
      mp.heart = null;
    }
    mp.waitToken = null;
    mp.connToken = null;
    mp.phase = "off";
    mp.role = "";
    mp.topic = "";
    mp.clients = [];
    mp.pilots = [];
    mp.self = null;
    mp.hostId = "";
    mp.auth = null;
    mp.hostSeen = 0;
    mp.inSig = -1;
    mp.rosterIds = [];
    mp.rosterColors = [];
    mp.seen = new Map();
    mp.inputAction = null;
    mp.stateAction = null;
    mp.startAction = null;
    mp.rosterAction = null;
    if (topic && mp.me) {
      const body = JSON.stringify({ k: "bye", id: mp.me, n: ++mp.seq });
      for (const client of clients) {
        try {
          if (client.connected) {
            client.publish(topic, body, () => {
              try { client.end(true); } catch (err) { /* already gone */ }
            });
          } else {
            client.end(true);
          }
        } catch (err) {
          try { client.end(true); } catch (e) { /* already gone */ }
        }
      }
    }
    if (wasMatch || mode !== "title") resetTitle();
    roomForm = "setup";
    roomError("");
    showPanels();
  }

  function roomCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  // Plain HTTP has no crypto.subtle, and WebRTC between two networks stalls without TURN.
  // The broker only delivers messages. The match stays in the browser that opened the room.
  const ROOM_BROKERS = [
    "wss://broker.hivemq.com:8884/mqtt",
    "wss://broker.emqx.io:8084/mqtt",
  ];

  function sha256Hex(text) {
    function rotr(n, x) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ]);
    const bytes = new TextEncoder().encode(text);
    const bitLen = bytes.length * 8;
    const extra = (56 - ((bytes.length + 1) % 64) + 64) % 64;
    const buf = new Uint8Array(bytes.length + 1 + extra + 8);
    buf.set(bytes);
    buf[bytes.length] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(buf.length - 8, Math.floor(bitLen / 0x100000000));
    view.setUint32(buf.length - 4, bitLen >>> 0);
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    const w = new Uint32Array(64);
    for (let i = 0; i < buf.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
        const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;
      for (let t = 0; t < 64; t++) {
        const s1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + s1 + ch + K[t] + w[t]) >>> 0;
        const s0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (s0 + maj) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + t1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
      h5 = (h5 + f) >>> 0;
      h6 = (h6 + g) >>> 0;
      h7 = (h7 + h) >>> 0;
    }
    return [h0, h1, h2, h3, h4, h5, h6, h7].map((v) => v.toString(16).padStart(8, "0")).join("");
  }

  function topicFor(code, password) {
    return "riverplane/" + code + "/" + sha256Hex(password).slice(0, 16);
  }

  function payloadText(buf) {
    if (typeof buf === "string") return buf;
    return new TextDecoder().decode(buf);
  }

  function publish(msg) {
    if (mp.phase === "off" || !mp.clients.length) return;
    msg.id = mp.me;
    msg.n = ++mp.seq;
    const body = JSON.stringify(msg);
    for (const client of mp.clients) {
      if (!client.connected) continue;
      try { client.publish(mp.topic, body); } catch (err) { /* socket dropped */ }
    }
  }

  function makeActions() {
    mp.inputAction = { send(data) { publish(Object.assign({ k: "in" }, data)); } };
    mp.stateAction = { send(data) { publish(Object.assign({ k: "st" }, data)); } };
    mp.startAction = { send() { publish({ k: "go" }); } };
    mp.rosterAction = { send(data) { publish(Object.assign({ k: "ls" }, data)); } };
  }

  function noteGuest(id) {
    if (mp.pilots.some((p) => p.id === id)) {
      mp.seen.set(id, Date.now());
      return;
    }
    if (mp.pilots.length >= 3) {
      publish({ k: "full", to: id });
      return;
    }
    mp.seen.set(id, Date.now());
    const p = makePilot(id, freeColor());
    if (mp.phase === "play") {
      p.checkpoint = mp.self ? mp.self.checkpoint : 0;
      p.worldY = mp.self ? Math.max(40, mp.self.worldY - 48) : 40;
      p.fuel = 1;
      p.lives = 3;
      p.score = 0;
      p.speed = 1;
      p.mode = "playing";
      p.x = channelCenter(geometryAt(p.worldY + 4));
    }
    mp.pilots.push(p);
    sendRoster();
    showPanels();
  }

  function onPeerGone(peerId) {
    mp.seen.delete(peerId);
    const wasHere = mp.pilots.some((p) => p.id === peerId);
    mp.pilots = mp.pilots.filter((p) => p.id !== peerId);
    if (mp.role === "guest" && peerId === mp.hostId && mp.phase !== "off") {
      showToast("ROOM GONE");
      leaveRoom();
      return;
    }
    if (mp.role === "host" && wasHere) sendRoster();
    showPanels();
  }

  function onRoomMessage(msg) {
    if (!msg || typeof msg.id !== "string" || msg.id === mp.me || msg.id.length > 32) return;
    if (typeof msg.n !== "number" || !Number.isFinite(msg.n)) return;
    if (mp.phase !== "lobby" && mp.phase !== "play") return;
    const prev = mp.lastN.get(msg.id) || 0;
    if (msg.n <= prev) return;
    mp.lastN.set(msg.id, msg.n);
    if (msg.k === "full" && msg.to === mp.me && mp.role === "guest") {
      if (rosterRows().some((row) => row.id === mp.me)) return;
      leaveRoom();
      roomError("Room is full.");
      return;
    }
    if (msg.k === "bye") {
      onPeerGone(msg.id);
      return;
    }
    if (msg.k === "hi") {
      if (msg.role === "host" && mp.role === "guest") {
        mp.hostId = msg.id;
        mp.hostSeen = Date.now();
        showPanels();
      } else if (msg.role === "guest" && mp.role === "host") {
        noteGuest(msg.id);
      }
      return;
    }
    if (msg.k === "ls" && mp.role === "guest") {
      mp.hostId = msg.id;
      mp.hostSeen = Date.now();
      mp.rosterIds = (msg.ids || []).slice(0, 3);
      mp.rosterColors = (msg.colors || []).slice(0, 3);
      if (msg.phase === "play") beginMatchLocal();
      showPanels();
      return;
    }
    if (msg.k === "go" && mp.role === "guest") {
      mp.hostId = msg.id;
      mp.hostSeen = Date.now();
      beginMatchLocal();
      return;
    }
    if (msg.k === "st" && mp.role === "guest") {
      mp.hostId = msg.id;
      mp.hostSeen = Date.now();
      if (mp.phase !== "play" && (msg.p || []).some((p) => p.id === mp.me)) beginMatchLocal();
      applyState(msg);
      return;
    }
    if (msg.k === "in" && mp.role === "host") {
      const p = mp.pilots.find((item) => item.id === msg.id);
      if (!p) return;
      mp.seen.set(msg.id, Date.now());
      p.input = {
        left: !!msg.left,
        right: !!msg.right,
        up: !!msg.up,
        down: !!msg.down,
        fire: !!msg.fire,
      };
      p.guided = !!msg.g;
    }
  }

  function connectBroker(url, token) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let client;
      const fail = (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { if (client) client.end(true); } catch (e) { /* already closed */ }
        reject(err instanceof Error ? err : new Error("mqtt"));
      };
      const timer = setTimeout(() => fail(new Error("timeout")), 8000);
      try {
        client = mp.mqtt.connect(url, {
          clientId: "rp" + mp.me.slice(0, 15) + (url.indexOf("emqx") >= 0 ? "e" : "h"),
          clean: true,
          reconnectPeriod: 3000,
          connectTimeout: 7000,
          keepalive: 25,
          protocolVersion: 4,
          resubscribe: true,
        });
      } catch (err) {
        fail(err);
        return;
      }
      client.on("error", () => {
        /* The wait covers a broker that does not answer. */
      });
      client.on("message", (_topic, buf) => {
        let parsed;
        try { parsed = JSON.parse(payloadText(buf)); } catch (e) { return; }
        try { onRoomMessage(parsed); } catch (e) { /* message in the wrong shape */ }
      });
      client.once("connect", () => {
        client.subscribe(mp.topic, { qos: 0 }, (err) => {
          if (err) return fail(err);
          if (settled) return;
          if (mp.connToken !== token) return fail(new Error("left"));
          settled = true;
          clearTimeout(timer);
          mp.clients.push(client);
          resolve(client);
        });
      });
    });
  }

  function connectBrokers(token) {
    return new Promise((resolve, reject) => {
      let left = ROOM_BROKERS.length;
      let opened = false;
      for (const url of ROOM_BROKERS) {
        connectBroker(url, token).then(() => {
          left--;
          if (!opened) {
            opened = true;
            resolve();
          }
        }).catch(() => {
          left--;
          if (!opened && left === 0) reject(new Error("net"));
        });
      }
    });
  }

  function startHeart() {
    if (mp.heart) clearInterval(mp.heart);
    mp.beat = 0;
    const beat = () => {
      if (mp.phase === "off") return;
      publish({ k: "hi", role: mp.role });
      mp.beat++;
      const now = Date.now();
      if (mp.role === "host") {
        if (mp.beat % 2 === 0) sendRoster();
        const gone = [];
        for (const [id, seenAt] of mp.seen) {
          if (now - seenAt > 12000) gone.push(id);
        }
        if (!gone.length) return;
        for (const id of gone) mp.seen.delete(id);
        mp.pilots = mp.pilots.filter((p) => !gone.includes(p.id));
        sendRoster();
        showPanels();
        return;
      }
      const inRoom = rosterRows().some((row) => row.id === mp.me);
      if (mp.hostSeen && inRoom && now - mp.hostSeen > 12000) {
        showToast("ROOM GONE");
        leaveRoom();
      }
    };
    beat();
    mp.heart = setInterval(beat, 1000);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        reject(new Error("mqtt"));
      };
      document.head.appendChild(script);
    });
  }

  async function loadNet() {
    if (mp.mqtt && mp.me) return;
    if (!mqttLoading) {
      mqttLoading = (async () => {
        const srcs = [
          "https://cdn.jsdelivr.net/npm/mqtt@5.16.0/dist/mqtt.min.js",
          "https://unpkg.com/mqtt@5.16.0/dist/mqtt.min.js",
        ];
        let last = new Error("mqtt");
        for (const src of srcs) {
          try {
            await loadScript(src);
            const lib = window.mqtt && (window.mqtt.connect ? window.mqtt : window.mqtt.default);
            if (lib && lib.connect) return lib;
          } catch (err) {
            last = err;
          }
        }
        throw last;
      })();
    }
    try {
      mp.mqtt = await mqttLoading;
    } catch (err) {
      mqttLoading = null;
      throw err;
    }
    if (!mp.me) {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      mp.me = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
  }

  function freeColor() {
    const used = new Set(mp.pilots.map((p) => p.color));
    for (let c = 0; c < PILOT_NAME.length; c++) if (!used.has(c)) return c;
    return 0;
  }

  async function openRoom(role, code, password) {
    if (roomBusy || mp.phase !== "off") return;
    roomBusy = true;
    roomError("");
    const token = {};
    try {
      await loadNet();
      password = password.trim();
      resetTitle();
      mp.connToken = token;
      mp.role = role;
      mp.code = code;
      mp.password = password;
      mp.topic = topicFor(code, password);
      mp.hostId = role === "host" ? mp.me : "";
      mp.hadState = false;
      mp.hostSeen = 0;
      mp.inSig = -1;
      mp.rosterIds = [];
      mp.rosterColors = [];
      mp.seen = new Map();
      mp.lastN = new Map();
      mp.clients = [];
      mp.pilots = role === "host" ? [makePilot(mp.me, 0)] : [];
      mp.self = role === "host" ? mp.pilots[0] : null;
      mp.phase = "lobby";
      makeActions();
      showPanels();
      roomError("Connecting…");
      try {
        await connectBrokers(token);
      } catch (err) {
        if (mp.connToken !== token || mp.phase === "off") return;
        throw err;
      }
      if (mp.connToken !== token || mp.phase === "off") return;
      roomError("");
      showPanels();
      startHeart();
      if (role === "guest") {
        const wait = {};
        mp.waitToken = wait;
        setTimeout(() => {
          if (mp.waitToken !== wait || mp.phase === "off") return;
          if (rosterRows().some((row) => row.id === mp.me)) return;
          leaveRoom();
          roomError("Wrong password, or the room has already closed.");
        }, 12000);
      }
    } finally {
      roomBusy = false;
    }
  }

  document.getElementById("room-open").addEventListener("click", () => {
    roomForm = "create";
    roomError("");
    showPanels();
  });
  document.getElementById("room-join-show").addEventListener("click", () => {
    roomForm = "join";
    roomError("");
    showPanels();
  });
  for (const button of document.querySelectorAll("[data-room-cancel]")) {
    button.addEventListener("click", () => {
      roomForm = "setup";
      roomError("");
      showPanels();
    });
  }
  document.getElementById("room-create").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const password = document.getElementById("room-pass").value.trim();
    if (!password) {
      roomError("Enter a password.");
      return;
    }
    openRoom("host", roomCode(), password).catch(() => {
      leaveRoom();
      roomError("No network to open the room.");
    });
  });
  document.getElementById("room-join").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const code = document.getElementById("room-code").value.trim().toUpperCase();
    const password = document.getElementById("room-pass-join").value.trim();
    if (!/^[A-Z0-9]{4}$/.test(code) || !password) {
      roomError("A 4-letter code and the password.");
      return;
    }
    openRoom("guest", code, password).catch(() => {
      leaveRoom();
      roomError("No network to join the room.");
    });
  });
  document.getElementById("room-start").addEventListener("click", beginMatchHost);
  document.getElementById("room-leave").addEventListener("click", leaveRoom);
  showPanels();

  let last = performance.now();
  let acc = 0;

  function loop(now) {
    acc += Math.min(80, now - last);
    last = now;
    let steps = 0;
    while (acc >= 1000 / 60 && steps < 3) {
      const prevL = touch.left;
      const prevR = touch.right;
      if (down.has("PadLeft")) touch.left = true;
      if (down.has("PadRight")) touch.right = true;
      update();
      touch.left = prevL;
      touch.right = prevR;
      acc -= 1000 / 60;
      steps++;
    }
    render();
    requestAnimationFrame(loop);
  }

  sfx.setMuted(muted);
  requestAnimationFrame(loop);
})();
