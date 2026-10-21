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
      "RRRRRRRRRRRR",
      "RRRRRRRRRRRR",
      "WWWWWWWWWWWW",
      "WWWWWWWWWWWW",
      "WWWWWWWWWWWW",
      "RRRRRRRRRRRR",
      "RRRRRRRRRRRR",
      "WWWWWWWWWWWW",
      "WWWWWWWWWWWW",
      "WWWWWWWWWWWW",
      "RRRRRRRRRRRR",
      "RRRRRRRRRRRR",
      "WWWWWWWWWWWW",
      "WWWWWWWWWWWW",
      "RRRRRRRRRRRR",
      "RRRRRRRRRRRR",
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
    return {
      jet: paint(SPRITE_ROWS.jet, (ch) => (ch === "#" ? COL.jet : ch === "+" ? "#8A7010" : null)),
      heliA: paint(SPRITE_ROWS.heliA, heliPaint),
      heliB: paint(SPRITE_ROWS.heliB, heliPaint),
      ship: paint(SPRITE_ROWS.ship, (ch) => (ch === "#" ? COL.ship : ch === "+" ? "#8A8680" : ch === "=" ? "#4A4844" : null)),
      fuel: paint(SPRITE_ROWS.fuel),
      ejet: paint(SPRITE_ROWS.ejet, (ch) => (ch === "#" ? COL.ejet : ch === "+" ? "#7E7E88" : null)),
      house: paint(SPRITE_ROWS.house, (ch) => (ch === "#" ? COL.white : null)),
      tree: paint(SPRITE_ROWS.tree, (ch) => (ch === "#" ? COL.tree : null)),
    };
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
    const y0 = playerWorldY - 48;
    const y1 = playerWorldY + 210;
    const s0 = Math.max(0, Math.floor(y0 / SECTION_H));
    const s1 = Math.floor(y1 / SECTION_H);
    for (let s = s0; s <= s1; s++) {
      const sec = getSection(s);
      for (const block of sec.blocks) {
        const obj = block.object;
        if (!obj || obj.dead) continue;
        if (obj.worldY < y0 || obj.worldY > y1) continue;
        if (obj.type === "house" || obj.type === "tree" || obj.type === "fuel") continue;
        if (!obj.moving && playerWorldY > obj.moveAt) obj.moving = true;
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
    const y0 = playerWorldY - 30;
    const y1 = playerWorldY + PLAY_H;
    const s0 = Math.max(0, Math.floor((playerWorldY - 20) / SECTION_H));
    const s1 = Math.floor((playerWorldY + 180) / SECTION_H);
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

    if (mode === "title" || mode === "over") {
      if (fireEdge || edge.enter) startGame();
      else updateAttract();
    } else if (mode === "paused") {
      /* frozen */
    } else if (mode === "dying") {
      deathT++;
      if (deathT > 56) finishDeath();
    } else {
      updatePlay();
    }
    edge.enter = false;
    padFireEdge = false;
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

    if (missile) {
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

    if (mode !== "dying" && mode !== "over") {
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
      if (Math.floor(tick / 30) % 2 === 0) drawCentered("PRESS FIRE", 30, 1, COL.white, true);
      drawCentered(guided ? "TIRO GUIADO" : "TIRO RETO", 42, 1, COL.white, true);
    } else if (mode === "paused") {
      drawCentered("PAUSA", 70, 2, COL.yellow, true);
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
    return {
      unlock,
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
    if (e.code === "Enter" && !e.repeat) {
      edge.enter = true;
      if (mode === "paused") mode = "playing";
    }
    if (e.code === "KeyP" && !e.repeat) {
      if (mode === "playing") mode = "paused";
      else if (mode === "paused") mode = "playing";
    }
    if (e.code === "KeyM" && !e.repeat) {
      muted = !muted;
      localStorage.setItem("riverraid-muted", muted ? "1" : "0");
      sfx.setMuted(muted);
      showToast(muted ? "SEM SOM" : "SOM");
    }
    if ((e.code === "KeyG" || e.code === "F4") && !e.repeat) {
      guided = !guided;
      localStorage.setItem("riverraid-guided", guided ? "1" : "0");
      showToast(guided ? "TIRO GUIADO" : "TIRO RETO");
    }
  });

  window.addEventListener("keyup", (e) => down.delete(e.code));
  window.addEventListener("blur", () => down.clear());

  canvas.addEventListener("pointerdown", (e) => {
    sfx.unlock();
    if (mode === "title" || mode === "over") {
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
      if (hold === "up") changeSpeed(1);
      else if (hold === "down") changeSpeed(-1);
      else touch[hold] = true;
      if ((mode === "title" || mode === "over") && hold === "fire") edge.enter = true;
    };
    const release = () => {
      if (hold === "left" || hold === "right" || hold === "fire") touch[hold] = false;
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
  }

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
