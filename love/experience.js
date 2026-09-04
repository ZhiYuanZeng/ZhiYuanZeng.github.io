import * as THREE from "./assets/vendor/three.module.min.js";
import chinaMap from "./assets/vendor/china-map.js";

const vaultUrl = (path) => window.Vault?.resolve(path) ?? path;

const embraceIllustration = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#120f2e"/><stop offset=".55" stop-color="#2f1a45"/><stop offset="1" stop-color="#6d3b57"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop stop-color="#ffe9b0" stop-opacity=".9"/>
        <stop offset=".5" stop-color="#ffb68f" stop-opacity=".28"/>
        <stop offset="1" stop-color="#ff9ec4" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#fdeaf4"/><stop offset="1" stop-color="#e3c2da"/>
      </linearGradient>
    </defs>

    <rect width="900" height="650" fill="url(#sky)"/>
    <circle cx="126" cy="108" r="40" fill="#fff5dc" opacity=".92"/>
    <circle cx="126" cy="108" r="96" fill="url(#glow)" opacity=".4"/>
    <g fill="#fff">
      <circle cx="248" cy="72" r="3.4" opacity=".8"/><circle cx="332" cy="140" r="2.6" opacity=".6"/>
      <circle cx="452" cy="60" r="3.6" opacity=".85"/><circle cx="560" cy="128" r="2.8" opacity=".6"/>
      <circle cx="636" cy="52" r="3.2" opacity=".75"/><circle cx="852" cy="96" r="3" opacity=".7"/>
      <circle cx="812" cy="300" r="2.6" opacity=".55"/><circle cx="196" cy="196" r="2.4" opacity=".5"/>
    </g>

    <g fill="#1b1339" opacity=".9">
      <path d="M22 372h74v130H22z"/><path d="M108 412h56v90h-56z"/><path d="M178 344h64v158h-64z"/>
      <path d="M256 400h44v102h-44z"/>
    </g>
    <g fill="#ffd98a" opacity=".55">
      <path d="M38 388h16v18H38z"/><path d="M64 424h16v18H64z"/><path d="M196 362h16v18h-16z"/>
      <path d="M218 400h16v18h-16z"/><path d="M124 448h14v16h-14z"/>
    </g>

    <circle cx="736" cy="196" r="196" fill="url(#glow)"/>
    <path d="M0 494Q226 462 452 492T900 482V650H0Z" fill="url(#snow)"/>

    <path d="M770 500h16V214h-16z" fill="#241a3a"/>
    <path d="M778 214q2-56-44-56" fill="none" stroke="#241a3a" stroke-width="13"/>
    <path d="M706 156h56l16 44h-88z" fill="#241a3a"/>
    <ellipse cx="734" cy="200" rx="34" ry="13" fill="#ffeab2"/>
    <ellipse cx="792" cy="504" rx="52" ry="11" fill="#c9a3c0" opacity=".55"/>

    <g fill="none" stroke="#fff" stroke-linecap="round" opacity=".26">
      <path d="M92 292q74-14 146 2" stroke-width="5"/>
      <path d="M56 340q84-16 164 6" stroke-width="4"/>
      <path d="M126 244q68-12 128 4" stroke-width="4"/>
    </g>

    <ellipse cx="430" cy="516" rx="150" ry="17" fill="#c9a3c0" opacity=".5"/>

    <path d="M322 356q6-38 46-44q44-4 52 38l16 162q-60 12-130 0z" fill="#55709e"/>
    <path d="M336 316q36 18 74 0l4 26q-38 18-78 0z" fill="#e05374"/>
    <path d="M452 372q8-32 42-36q36-2 44 30l18 148q-58 12-116 0z" fill="#d94b83"/>
    <path d="M458 344q36 16 74 0l4 24q-38 16-78 0z" fill="#f6e2ee"/>

    <g transform="rotate(-9 496 360)">
      <path d="M452 306q-4-56 42-62q46 0 46 60q6 68-16 92q-30-14-60 0q-20-24-12-90z" fill="#402438"/>
      <path d="M468 272q28-18 56 0" fill="none" stroke="#6b4059" stroke-width="9" opacity=".8"/>
      <g transform="translate(516 258)">
        <ellipse cx="-11" cy="0" rx="11" ry="8" fill="#ff9dc4"/>
        <ellipse cx="11" cy="0" rx="11" ry="8" fill="#ff9dc4"/>
        <circle r="4.5" fill="#ffd3e4"/>
      </g>
    </g>

    <g transform="rotate(10 380 330)">
      <circle cx="380" cy="292" r="46" fill="#2b1b35"/>
      <path d="M330 312q0-70 50-72q50 0 50 70q0 8-4 10q-46 12-92 0q-4-2-4-8z" fill="#4c6fa8"/>
      <path d="M331 298h98v14q-49 12-98 0z" fill="#3f6091"/>
      <circle cx="380" cy="238" r="14" fill="#dbe8ff"/>
    </g>

    <path d="M416 366q72-6 128 22" fill="none" stroke="#47608a" stroke-width="32" stroke-linecap="round"/>
    <circle cx="546" cy="392" r="16" fill="#f0b493"/>
    <path d="M456 404q-56 12-120 24" fill="none" stroke="#c43f76" stroke-width="30" stroke-linecap="round"/>
    <circle cx="334" cy="428" r="15" fill="#f0b493"/>

    <path d="M334 328q-42 2-72-22q26 42 70 44z" fill="#c8415f"/>

    <g fill="#ff6b9f">
      <path d="M438 214c-16-12-15-24-8-27c6-2 10 2 10 6c0-4 4-8 10-6c7 3 8 15-8 27z" opacity=".95"/>
      <path d="M492 178c-11-8-10-16-5-18c4-2 7 1 7 4c0-3 3-6 7-4c5 2 6 10-5 18z" opacity=".8"/>
      <path d="M366 186c-9-7-9-14-4-16c3-1 6 1 6 3c0-2 3-4 6-3c4 2 5 9-4 16z" opacity=".7"/>
    </g>

    <g fill="#fff">
      <circle cx="86" cy="120" r="4" opacity=".85"/><circle cx="176" cy="252" r="5" opacity=".8"/>
      <circle cx="268" cy="176" r="3.6" opacity=".7"/><circle cx="304" cy="404" r="4.4" opacity=".75"/>
      <circle cx="152" cy="424" r="5" opacity=".7"/><circle cx="228" cy="472" r="3.6" opacity=".65"/>
      <circle cx="596" cy="238" r="4.6" opacity=".8"/><circle cx="654" cy="352" r="5" opacity=".75"/>
      <circle cx="700" cy="286" r="3.4" opacity=".65"/><circle cx="836" cy="392" r="4.8" opacity=".7"/>
      <circle cx="596" cy="452" r="4" opacity=".6"/><circle cx="880" cy="222" r="3.6" opacity=".6"/>
      <circle cx="424" cy="120" r="4.2" opacity=".7"/><circle cx="500" cy="330" r="3.4" opacity=".55"/>
      <circle cx="62" cy="216" r="3.8" opacity=".6"/><circle cx="748" cy="466" r="4.2" opacity=".6"/>
    </g>

    <g fill="#d3aecb" opacity=".55">
      <ellipse cx="252" cy="556" rx="16" ry="7"/><ellipse cx="316" cy="590" rx="15" ry="6"/>
      <ellipse cx="590" cy="566" rx="16" ry="7"/><ellipse cx="656" cy="600" rx="15" ry="6"/>
    </g>
  </svg>
`)}`;

const memoryData = [
  {
    date: "2020.12.29 · 第一层",
    title: "寒风里的第一次拥抱",
    story: "我们从同一所学校走进同一个实验室，也走进了彼此的生活。那个冬夜，我说“好冷”，你紧紧抱住我。寒风没有停，我们却在第一次亲吻里拥有了故事的开场。",
    image: embraceIllustration,
    alt: "寒风中拥抱的卡通插画",
  },
  {
    date: "2021.05.20 · 第二层",
    title: "奶油味的第一次 520",
    story: "我们亲手做了一只奶油千层。它也许不够标准，却有世界上独一份的配方：一层笨拙，一层认真，还有好多好多喜欢。",
    image: "./assets/photos/2021-05-20.webp",
    alt: "第一次一起过 520 做蛋糕的照片",
  },
  {
    date: "2023.SPRING · 第三层",
    title: "春风、古城和绿色长裙",
    story: "一起毕业后，我们去了开封和洛阳。古城的春色里，你穿着绿色长裙，像从很远的故事里走来，却刚好走到了我的身边。",
    image: "./assets/photos/2023-04-luoyang.webp",
    alt: "河南旅行时穿绿色古装长裙的照片",
  },
  {
    date: "2026.05.16 · 最上层",
    title: "我们把以后写进了承诺",
    story: "订婚的过程一波三折，但那些波折没有把我们推远。我们牵着手坚持下来，从“我喜欢你”，走到了“往后余生都是你”。",
    image: "./assets/photos/2026-05-16.webp",
    alt: "订婚现场牵手的照片",
  },
];

const cakeCanvas = document.querySelector("#cake-canvas");
const cakeStage = document.querySelector(".cake-stage");
const cakeHint = document.querySelector("#cake-hint");
const cakeMemoryCount = document.querySelector("#cake-memory-count");
const candleCount = document.querySelector("#candle-count");
const candleWish = document.querySelector("#candle-wish");
const blowCandleButton = document.querySelector("#blow-candle");
const cakePanel = document.querySelector("#cake-memory-panel");
const cakePanelImage = document.querySelector("#cake-memory-image");
const cakePanelDate = document.querySelector("#cake-memory-date");
const cakePanelTitle = document.querySelector("#cake-memory-title");
const cakePanelStory = document.querySelector("#cake-memory-story");
const cakeLayerNav = document.querySelector("#cake-layer-nav");
const cakeNavButtons = [...document.querySelectorAll("[data-cake-memory]")];
const candleVision = document.querySelector("#candle-vision");
const candleVisionImage = document.querySelector("#candle-vision-image");
const candleVisionDate = document.querySelector("#candle-vision-date");
const candleVisionTitle = document.querySelector("#candle-vision-title");
const candleVisionCopy = document.querySelector("#candle-vision-copy");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const foundCakeMemories = new Set();
const extinguishedCandles = new Set();
let visionPlaying = false;

const candleMemories = [
  {
    date: "2020 · 故事开始",
    title: "那个冬夜，我们靠得很近",
    copy: "一句好冷，换来了第一次拥抱和亲吻。",
    image: embraceIllustration,
    alt: "寒风中拥抱的卡通插画",
  },
  {
    date: "2021 · 奶油味",
    title: "第一只属于我们的蛋糕",
    copy: "两个人一起完成的千层，是最甜的配方。",
    image: "./assets/photos/2021-05-20.webp",
    alt: "第一次一起做蛋糕的照片",
  },
  {
    date: "2023 · 古城春色",
    title: "绿色长裙从春风里走来",
    copy: "开封与洛阳，收藏了我们毕业后的春天。",
    image: "./assets/photos/2023-04-luoyang.webp",
    alt: "河南旅行时穿绿色古装长裙的照片",
  },
  {
    date: "2026 · 订婚",
    title: "把以后认真写进了承诺",
    copy: "经历波折，我们还是坚定地牵住了彼此。",
    image: "./assets/photos/2026-05-16.webp",
    alt: "订婚现场牵手的照片",
  },
  {
    date: "未来 · 未完待续",
    title: "往后的每一年，继续一起更新",
    copy: "故事没有结案日期，终点是白头。",
    image: "./assets/photos/gallery-formal.webp",
    alt: "我们牵手拍摄的正式合照",
  },
];

// The five candle visions retrace the four layers in short form and add one
// ending of their own, so layer i and candle i are the same moment: the readout
// counts distinct moments, and both indices land in the same set.
const totalMemories = candleMemories.length;

const updateMemoryCount = () => {
  const found = new Set([...foundCakeMemories, ...extinguishedCandles]).size;
  cakeMemoryCount.textContent = `${found} / ${totalMemories}`;
  return found;
};

updateMemoryCount();

// Reaching this total means every candle is out too, so the wish has already happened.
const allFoundHint = `${totalMemories} 段回忆全部找齐 · 愿望已经被星空听见了`;

const showCakeMemory = (index) => {
  const memory = memoryData[index];
  foundCakeMemories.add(index);
  const found = updateMemoryCount();
  cakeNavButtons[index].classList.add("is-found");
  cakePanelImage.src = vaultUrl(memory.image);
  cakePanelImage.alt = memory.alt;
  cakePanelDate.textContent = memory.date;
  cakePanelTitle.textContent = memory.title;
  cakePanelStory.textContent = memory.story;
  cakePanel.hidden = false;

  if (foundCakeMemories.size === memoryData.length) {
    cakeStage.classList.add("memories-complete");
    baseHint = found === totalMemories ? allFoundHint : "四层回忆已集齐 · 剩下的就交给蜡烛吧";
    cakeHint.textContent = baseHint;
  }
};

document.querySelector("#cake-memory-close").addEventListener("click", () => {
  cakePanel.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!cakePanel.hidden) cakePanel.hidden = true;
  if (!candleWish.hidden) closeCandleWish();
});

cakeNavButtons.forEach((button) => {
  button.addEventListener("click", () => showCakeMemory(Number(button.dataset.cakeMemory)));
});

let renderer;
let scene;
let camera;
let cakeGroup;
let raycaster;
let pointer;
let layerMeshes = [];
let flameMeshes = [];
let candleProxies = [];
let cakeParticles = [];
let dragging = false;
let moved = false;
let lastPointerX = 0;
let pointerStartX = 0;
let pointerStartY = 0;
let hoveredCandle = -1;
let hoveredLayer = null;
let windStrength = 0;
let cakeTouched = false;
let zoom = 1;
let updateCakeCamera = () => {};
let animationFrame;

const defaultHint = cakeHint.textContent;
let baseHint = defaultHint;

const fireworksCanvas = document.querySelector("#finale-fireworks");
const fireworksContext = fireworksCanvas.getContext("2d");
const fireworkColors = ["#ff8ec4", "#ed3b87", "#8de5e1", "#ffd79a", "#ffffff", "#c58bff"];
let fireworkSparks = [];
let fireworkShells = [];
let fireworkFlashes = [];
let fireworkCues = [];
let fireworksFrame = 0;
let fireworksStartedAt = 0;
let fireworksLastFrame = 0;
let fireworksEndsAt = 0;

const resizeFireworks = () => {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  fireworksCanvas.width = Math.round(window.innerWidth * ratio);
  fireworksCanvas.height = Math.round(window.innerHeight * ratio);
  fireworksContext.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const randomFireworkColor = () => fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

const addFireworkFlash = (x, y, radius, color) => {
  fireworkFlashes.push({ x, y, radius, color, age: 0, span: 460 });
};

const spawnSpark = (x, y, vx, vy, options = {}) => {
  fireworkSparks.push({
    x,
    y,
    vx,
    vy,
    color: options.color ?? randomFireworkColor(),
    size: options.size ?? 1.9,
    drag: options.drag ?? 0.976,
    gravity: options.gravity ?? 0.00019,
    age: 0,
    span: options.span ?? 900 + Math.random() * 800,
    twinkle: Math.random() * Math.PI * 2,
  });
};

const burstRing = (x, y, options = {}) => {
  const count = options.count ?? 110;
  const speed = options.speed ?? 0.34;
  const color = options.color ?? randomFireworkColor();
  const rings = options.rings ?? 2;

  for (let ring = 0; ring < rings; ring += 1) {
    const scale = 1 - ring * 0.34;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.08;
      const power = speed * scale * (0.62 + Math.random() * 0.5);
      spawnSpark(x, y, Math.cos(angle) * power, Math.sin(angle) * power, {
        color: options.multicolor ? randomFireworkColor() : color,
        size: 2.4 + Math.random() * 1.8,
        drag: options.drag ?? 0.978,
        gravity: options.gravity ?? 0.00019,
        span: options.span ?? 1000 + Math.random() * 900,
      });
    }
  }

  for (let index = 0; index < 26; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    spawnSpark(x, y, Math.cos(angle) * speed * 0.26, Math.sin(angle) * speed * 0.26, {
      color: "#ffffff",
      size: 3.4,
      span: 460 + Math.random() * 300,
    });
  }

  addFireworkFlash(x, y, 190, "rgba(255,214,232,.9)");
};

const burstWillow = (x, y, color) => {
  for (let index = 0; index < 78; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const power = 0.16 + Math.random() * 0.18;
    spawnSpark(x, y, Math.cos(angle) * power, Math.sin(angle) * power * 0.7, {
      color: color ?? "#ffd79a",
      size: 2.8 + Math.random() * 1.2,
      drag: 0.986,
      gravity: 0.00032,
      span: 2000 + Math.random() * 900,
    });
  }

  addFireworkFlash(x, y, 210, "rgba(255,216,170,.85)");
};

const burstHeart = (x, y, scale = 220) => {
  const count = 190;
  const power = scale / 16000;

  for (let index = 0; index < count; index += 1) {
    const t = (index / count) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const jitter = 0.94 + Math.random() * 0.12;
    spawnSpark(x, y, hx * power * jitter, -hy * power * jitter, {
      color: index % 7 === 0 ? "#ffffff" : index % 3 ? "#ff8ec4" : "#ed3b87",
      size: 2.8 + Math.random() * 1.2,
      drag: 0.972,
      gravity: 0.00007,
      span: 1900 + Math.random() * 700,
    });
  }

  addFireworkFlash(x, y, scale * 1.2, "rgba(255,150,196,.9)");
};

const launchShell = (options = {}) => {
  const startX = options.x ?? window.innerWidth * (0.14 + Math.random() * 0.72);
  const startY = window.innerHeight + 12;
  const peakY = options.y ?? window.innerHeight * (0.14 + Math.random() * 0.26);
  const fuse = options.fuse ?? 780 + Math.random() * 320;

  fireworkShells.push({
    x: startX,
    y: startY,
    px: startX,
    py: startY,
    vx: (Math.random() - 0.5) * 0.02,
    vy: -(startY - peakY) / fuse,
    fuse,
    color: options.color ?? randomFireworkColor(),
    burst: options.burst ?? ((x, y, color) => burstRing(x, y, { color, speed: 0.3 })),
  });
};

const buildFireworksShow = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cues = [];
  const add = (at, run) => cues.push({ at, run, done: false });

  // The wish card lives in the middle of the screen, so keep the volleys along
  // the top band and the two side columns where nothing covers them.
  const sideX = () => (Math.random() < 0.5 ? width * (0.05 + Math.random() * 0.17) : width * (0.78 + Math.random() * 0.17));
  const skyY = () => height * (0.08 + Math.random() * 0.16);

  add(0, () => launchShell({
    x: width * 0.16,
    y: height * 0.26,
    burst: (x, y) => burstRing(x, y, { color: "#ff8ec4", speed: 0.38 }),
  }));
  add(220, () => launchShell({
    x: width * 0.84,
    y: height * 0.22,
    burst: (x, y) => burstRing(x, y, { color: "#8de5e1", speed: 0.36 }),
  }));
  add(760, () => launchShell({
    x: width * 0.5,
    y: height * 0.16,
    fuse: 880,
    burst: (x, y) => {
      burstHeart(x, y, 260);
      burstRing(x, y, { color: "#ffffff", speed: 0.13, count: 32, rings: 1, span: 760 });
    },
  }));
  add(1800, () => launchShell({ x: width * 0.26, y: height * 0.34, burst: (x, y, color) => burstWillow(x, y, color) }));
  add(2100, () => launchShell({ x: width * 0.74, y: height * 0.14, burst: (x, y) => burstRing(x, y, { multicolor: true, speed: 0.4 }) }));

  for (let index = 0; index < 10; index += 1) {
    add(2600 + index * 380, () => {
      const roll = Math.random();
      launchShell({
        x: index % 3 === 2 ? width * (0.34 + Math.random() * 0.32) : sideX(),
        y: index % 3 === 2 ? skyY() : height * (0.1 + Math.random() * 0.34),
        burst: (x, y, color) => {
          if (roll > 0.74) burstWillow(x, y, color);
          else if (roll > 0.48) burstRing(x, y, { color, speed: 0.28, drag: 0.968, span: 820 });
          else burstRing(x, y, { multicolor: roll < 0.18, color, speed: 0.38 });
        },
      });
    });
  }

  add(6500, () => {
    burstHeart(width * 0.5, height * 0.17, 300);
    burstRing(width * 0.14, height * 0.28, { color: "#ffd79a", speed: 0.44 });
    burstRing(width * 0.86, height * 0.3, { color: "#8de5e1", speed: 0.44 });
  });
  add(6900, () => {
    burstRing(width * 0.28, height * 0.12, { multicolor: true, speed: 0.46 });
    burstRing(width * 0.72, height * 0.14, { multicolor: true, speed: 0.46 });
    burstWillow(width * 0.5, height * 0.1, "#ff8ec4");
  });
  add(7350, () => {
    burstWillow(width * 0.1, height * 0.3, "#ff8ec4");
    burstWillow(width * 0.9, height * 0.28, "#ffd79a");
    burstRing(width * 0.5, height * 0.08, { color: "#ffffff", speed: 0.34 });
  });
  add(7800, () => {
    burstHeart(width * 0.16, height * 0.34, 170);
    burstHeart(width * 0.84, height * 0.32, 170);
  });

  return cues;
};

const stopFireworks = () => {
  if (fireworksFrame) cancelAnimationFrame(fireworksFrame);
  fireworksFrame = 0;
  fireworkSparks = [];
  fireworkShells = [];
  fireworkFlashes = [];
  fireworkCues = [];
  fireworksContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fireworksCanvas.classList.remove("is-live");
};

const stepFireworks = (timestamp) => {
  const delta = Math.min(timestamp - fireworksLastFrame, 34) || 16;
  const elapsed = timestamp - fireworksStartedAt;
  fireworksLastFrame = timestamp;

  fireworkCues.forEach((cue) => {
    if (cue.done || elapsed < cue.at) return;
    cue.done = true;
    cue.run();
  });

  fireworksContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fireworksContext.globalCompositeOperation = "lighter";
  fireworksContext.lineCap = "round";

  fireworkFlashes = fireworkFlashes.filter((flash) => {
    flash.age += delta;
    if (flash.age > flash.span) return false;

    const progress = flash.age / flash.span;
    const radius = flash.radius * (0.45 + progress * 0.9);
    const gradient = fireworksContext.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, radius);
    gradient.addColorStop(0, flash.color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    fireworksContext.globalAlpha = (1 - progress) ** 2 * 0.55;
    fireworksContext.fillStyle = gradient;
    fireworksContext.beginPath();
    fireworksContext.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
    fireworksContext.fill();
    return true;
  });

  fireworkShells = fireworkShells.filter((shell) => {
    shell.px = shell.x;
    shell.py = shell.y;
    shell.x += shell.vx * delta;
    shell.y += shell.vy * delta;
    shell.fuse -= delta;

    fireworksContext.globalAlpha = 0.85;
    fireworksContext.strokeStyle = shell.color;
    fireworksContext.lineWidth = 2.4;
    fireworksContext.beginPath();
    fireworksContext.moveTo(shell.px, shell.py);
    fireworksContext.lineTo(shell.x, shell.y);
    fireworksContext.stroke();

    if (Math.random() > 0.4) {
      spawnSpark(shell.x, shell.y, (Math.random() - 0.5) * 0.03, 0.02 + Math.random() * 0.03, {
        color: "#ffd79a",
        size: 1.3,
        drag: 0.94,
        gravity: 0.00006,
        span: 260 + Math.random() * 200,
      });
    }

    if (shell.fuse > 0) return true;
    shell.burst(shell.x, shell.y, shell.color);
    return false;
  });

  fireworkSparks = fireworkSparks.filter((spark) => {
    spark.age += delta;
    if (spark.age > spark.span) return false;

    const decay = spark.drag ** (delta / 16.67);
    spark.vx *= decay;
    spark.vy = spark.vy * decay + spark.gravity * delta;
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;

    const progress = spark.age / spark.span;
    const fade = (1 - progress) ** 1.5;
    const flicker = 0.78 + Math.sin(spark.age * 0.03 + spark.twinkle) * 0.22;

    fireworksContext.globalAlpha = Math.max(fade * flicker, 0);
    fireworksContext.strokeStyle = spark.color;
    fireworksContext.lineWidth = spark.size * (1 - progress * 0.4);
    fireworksContext.beginPath();
    fireworksContext.moveTo(spark.x - spark.vx * delta * 2.4, spark.y - spark.vy * delta * 2.4);
    fireworksContext.lineTo(spark.x, spark.y);
    fireworksContext.stroke();

    fireworksContext.fillStyle = spark.color;
    fireworksContext.globalAlpha = Math.max(fade * 0.45, 0);
    fireworksContext.beginPath();
    fireworksContext.arc(spark.x, spark.y, spark.size * 1.6 * (1 - progress * 0.5), 0, Math.PI * 2);
    fireworksContext.fill();

    fireworksContext.globalAlpha = Math.max(fade * 0.1, 0);
    fireworksContext.beginPath();
    fireworksContext.arc(spark.x, spark.y, spark.size * 4.4 * (1 - progress * 0.4), 0, Math.PI * 2);
    fireworksContext.fill();

    return true;
  });

  fireworksContext.globalAlpha = 1;
  fireworksContext.globalCompositeOperation = "source-over";

  if (elapsed > fireworksEndsAt && !fireworkSparks.length && !fireworkShells.length) {
    stopFireworks();
    return;
  }

  fireworksFrame = requestAnimationFrame(stepFireworks);
};

const startFireworks = () => {
  if (reduceMotion.matches) return;
  stopFireworks();
  resizeFireworks();
  fireworkCues = buildFireworksShow();
  fireworksEndsAt = fireworkCues[fireworkCues.length - 1].at + 400;
  fireworksStartedAt = performance.now();
  fireworksLastFrame = fireworksStartedAt;
  fireworksCanvas.classList.add("is-live");
  fireworksFrame = requestAnimationFrame(stepFireworks);
};

window.addEventListener("resize", () => {
  if (fireworksFrame) resizeFireworks();
});

const closeCandleWish = () => {
  if (candleWish.hidden) return;
  candleWish.classList.remove("is-visible");
  candleWish.hidden = true;
  stopFireworks();
  // The four titles are a spoiler, so the index only shows up once the fireworks are done.
  cakeLayerNav.hidden = false;
};

candleWish.addEventListener("click", closeCandleWish);

const openCandleWish = () => {
  candleWish.hidden = false;
  candleWish.classList.remove("is-visible");
  void candleWish.offsetWidth;
  candleWish.classList.add("is-visible");
  startFireworks();
  window.setTimeout(closeCandleWish, reduceMotion.matches ? 4200 : 11000);
};

const showCandleVision = (index) => {
  const memory = candleMemories[index];
  visionPlaying = true;
  blowCandleButton.disabled = true;
  candleVisionImage.src = vaultUrl(memory.image);
  candleVisionImage.alt = memory.alt;
  candleVisionDate.textContent = memory.date;
  candleVisionTitle.textContent = memory.title;
  candleVisionCopy.textContent = memory.copy;
  candleVision.classList.remove("is-visible");
  void candleVision.offsetWidth;
  candleVision.classList.add("is-visible");

  window.setTimeout(() => {
    candleVision.classList.remove("is-visible");
    visionPlaying = false;
    const allCandlesOut = extinguishedCandles.size === flameMeshes.length;
    blowCandleButton.disabled = allCandlesOut;

    if (allCandlesOut) {
      blowCandleButton.textContent = "蜡烛都吹灭啦";
      baseHint = updateMemoryCount() === totalMemories ? allFoundHint : "生日愿望已经被星空听见了";
      cakeHint.textContent = baseHint;
      openCandleWish();
      window.dispatchEvent(new CustomEvent("cake-complete"));
    }
  }, reduceMotion.matches ? 150 : 4250);
};

const spawnCandleParticles = (flame) => {
  const origin = cakeGroup.worldToLocal(flame.getWorldPosition(new THREE.Vector3()));

  for (let puffIndex = 0; puffIndex < 7; puffIndex += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + puffIndex * 0.012, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xd8c9d0, transparent: true, opacity: 0.38 }),
    );
    puff.position.copy(origin);
    puff.position.x += (Math.random() - 0.5) * 0.06;
    puff.position.y += puffIndex * 0.035;
    puff.userData = {
      kind: "smoke",
      startedAt: performance.now() + puffIndex * 80,
      life: 1.7,
      drift: (Math.random() - 0.5) * 0.18,
    };
    cakeGroup.add(puff);
    cakeParticles.push(puff);
  }

  for (let sparkIndex = 0; sparkIndex < 14; sparkIndex += 1) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 6, 5),
      new THREE.MeshBasicMaterial({ color: sparkIndex % 3 ? 0xffc45d : 0xff7eb6, transparent: true }),
    );
    spark.position.copy(origin);
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.9 + Math.random() * 1.5;
    spark.userData = {
      kind: "spark",
      startedAt: performance.now(),
      life: 0.9 + Math.random() * 0.5,
      velocity: new THREE.Vector3(Math.cos(angle) * speed * 0.5, 1.6 + Math.random() * 1.4, Math.sin(angle) * speed * 0.5),
    };
    cakeGroup.add(spark);
    cakeParticles.push(spark);
  }
};

const extinguishCandle = (index) => {
  if (visionPlaying) return;
  if (extinguishedCandles.has(index)) return;

  extinguishedCandles.add(index);
  const flame = flameMeshes[index];
  spawnCandleParticles(flame);
  flame.userData.extinguished = true;
  flame.scale.set(0.01, 0.01, 0.01);
  flame.userData.halo.visible = false;
  flame.userData.light.intensity = 0;
  flame.userData.wick.material.color.setHex(0x140b10);
  candleCount.textContent = String(flameMeshes.length - extinguishedCandles.size);
  updateMemoryCount();
  if (extinguishedCandles.size === flameMeshes.length) {
    window.dispatchEvent(new CustomEvent("cake-final-candle"));
  }
  showCandleVision(index);
};

const blowNextCandle = () => {
  const nextCandle = flameMeshes.findIndex((_, index) => !extinguishedCandles.has(index));
  if (nextCandle >= 0) extinguishCandle(nextCandle);
};

blowCandleButton.addEventListener("click", () => {
  blowNextCandle();
  if (extinguishedCandles.size === flameMeshes.length) blowCandleButton.disabled = true;
});

const micButton = document.querySelector("#mic-blow");

const startMicBlow = async () => {
  if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
    micButton.disabled = true;
    micButton.textContent = "此浏览器不支持吹气";
    return;
  }

  micButton.disabled = true;
  micButton.textContent = "正在打开麦克风…";

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  } catch {
    micButton.disabled = false;
    micButton.textContent = "麦克风被拒绝 · 直接点击烛光";
    return;
  }

  const audioContext = new AudioContext();
  await audioContext.resume();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;
  audioContext.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);

  micButton.classList.add("is-listening");
  micButton.textContent = "对着麦克风吹一口气";
  baseHint = "深吸一口气，对着麦克风吹 ——";
  cakeHint.textContent = baseHint;

  let blowingSince = 0;
  const listen = () => {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (let index = 0; index < samples.length; index += 1) {
      const value = (samples[index] - 128) / 128;
      sum += value * value;
    }
    const level = Math.sqrt(sum / samples.length);
    windStrength = Math.min(level * 7, 1.6);

    const now = performance.now();
    if (level > 0.14) {
      if (!blowingSince) blowingSince = now;
      if (now - blowingSince > 260 && !visionPlaying) {
        blowingSince = 0;
        blowNextCandle();
      }
    } else if (level < 0.06) {
      blowingSince = 0;
    }

    if (extinguishedCandles.size === flameMeshes.length) {
      stream.getTracks().forEach((track) => track.stop());
      audioContext.close();
      micButton.classList.remove("is-listening");
      micButton.hidden = true;
      windStrength = 0;
      return;
    }
    requestAnimationFrame(listen);
  };
  listen();
};

micButton.addEventListener("click", startMicBlow);

const createCakeTexture = (asBump = false) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  context.fillStyle = asBump ? "#7f7f7f" : "#f8f1f4";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 2600; index += 1) {
    const lightness = 105 + Math.floor(Math.random() * 65);
    const alpha = 0.08 + Math.random() * 0.16;
    context.fillStyle = asBump
      ? `rgba(${lightness},${lightness},${lightness},${alpha + 0.18})`
      : `rgba(104,38,68,${alpha})`;
    const size = 0.5 + Math.random() * 2.2;
    context.beginPath();
    context.arc(Math.random() * 256, Math.random() * 256, size, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = asBump ? 0.38 : 0.07;
  context.strokeStyle = asBump ? "#dadada" : "#ffffff";
  for (let line = 0; line < 18; line += 1) {
    context.beginPath();
    context.moveTo(0, line * 15 + Math.random() * 5);
    context.bezierCurveTo(70, line * 15 - 8, 170, line * 15 + 12, 256, line * 15);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.5, 1.2);
  texture.colorSpace = asBump ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  return texture;
};

const initCake = () => {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cakeCanvas, antialias: true, alpha: true });
  } catch {
    cakeHint.textContent = "当前浏览器无法显示 3D 蛋糕，请使用下方按钮打开回忆";
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 3.5, 11.2);
  camera.lookAt(0, 0.6, 0);
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  cakeGroup = new THREE.Group();
  cakeGroup.rotation.x = -0.08;
  scene.add(cakeGroup);

  scene.add(new THREE.HemisphereLight(0xffe5f2, 0x251025, 1.9));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const pinkLight = new THREE.PointLight(0xff5fa4, 18, 16);
  pinkLight.position.set(-4, 2, 3);
  scene.add(pinkLight);
  const cyanLight = new THREE.PointLight(0x8de5e1, 10, 12);
  cyanLight.position.set(4, 1, -2);
  scene.add(cyanLight);

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(2.72, 2.95, 0.18, 72),
    new THREE.MeshPhysicalMaterial({ color: 0xfff5fa, roughness: 0.2, metalness: 0.05 }),
  );
  plate.position.y = -1.68;
  plate.receiveShadow = true;
  cakeGroup.add(plate);

  const colors = [0xd94d85, 0xffadc9, 0xf3d2a8, 0xf58db5];
  const radii = [2.3, 2.12, 1.9, 1.68];
  const layerHeight = 0.7;
  const crumbTexture = createCakeTexture(false);
  const crumbBump = createCakeTexture(true);
  crumbTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const creamMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfff6fa,
    roughness: 0.34,
    clearcoat: 0.28,
    clearcoatRoughness: 0.38,
  });

  for (let index = 0; index < 4; index += 1) {
    const material = new THREE.MeshPhysicalMaterial({
      color: colors[index],
      map: crumbTexture,
      bumpMap: crumbBump,
      bumpScale: 0.055,
      roughness: 0.54,
      clearcoat: 0.16,
      clearcoatRoughness: 0.55,
      sheen: 0.34,
      sheenColor: new THREE.Color(0xffd9e7),
      emissive: 0x2c0618,
      emissiveIntensity: 0.15,
    });
    const layer = new THREE.Mesh(new THREE.CylinderGeometry(radii[index], radii[index], layerHeight, 72), material);
    layer.position.y = -1.2 + index * 0.72;
    layer.castShadow = true;
    layer.receiveShadow = true;
    layer.userData.memoryIndex = index;
    layerMeshes.push(layer);
    cakeGroup.add(layer);

    const cream = new THREE.Mesh(
      new THREE.TorusGeometry(radii[index] - 0.04, 0.09, 12, 72),
      creamMaterial,
    );
    cream.rotation.x = Math.PI / 2;
    cream.position.y = layer.position.y + layerHeight / 2;
    cakeGroup.add(cream);

    for (let dot = 0; dot < 20; dot += 1) {
      const angle = (dot / 20) * Math.PI * 2;
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 8),
        new THREE.MeshStandardMaterial({
          color: index % 2 ? 0xffffff : 0xffd6e6,
          roughness: 0.3,
          metalness: 0.2,
        }),
      );
      berry.position.set(
        Math.cos(angle) * (radii[index] - 0.1),
        layer.position.y + layerHeight / 2 + 0.05,
        Math.sin(angle) * (radii[index] - 0.1),
      );
      cakeGroup.add(berry);
    }

    for (let drip = 0; drip < 16; drip += 1) {
      const angle = (drip / 16) * Math.PI * 2 + index * 0.17;
      const length = 0.1 + ((drip * 7 + index * 3) % 5) * 0.038;
      const creamDrip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), creamMaterial);
      creamDrip.scale.set(0.78, 1 + length * 5.5, 0.55);
      creamDrip.position.set(
        Math.cos(angle) * (radii[index] - 0.03),
        layer.position.y + layerHeight / 2 - length * 0.45,
        Math.sin(angle) * (radii[index] - 0.03),
      );
      cakeGroup.add(creamDrip);
    }
  }

  const topCream = new THREE.Mesh(
    new THREE.CylinderGeometry(1.66, 1.66, 0.08, 72),
    new THREE.MeshPhysicalMaterial({ color: 0xfff2f7, roughness: 0.28 }),
  );
  topCream.position.y = 1.35;
  cakeGroup.add(topCream);

  const darkChocolate = new THREE.MeshPhysicalMaterial({
    color: 0x4d2517,
    roughness: 0.3,
    clearcoat: 0.6,
    clearcoatRoughness: 0.26,
  });
  const milkChocolate = new THREE.MeshPhysicalMaterial({ color: 0x7d4426, roughness: 0.38, clearcoat: 0.42 });
  const whiteChocolate = new THREE.MeshPhysicalMaterial({ color: 0xf7e5c8, roughness: 0.36, clearcoat: 0.4 });
  const strawberryMaterial = new THREE.MeshPhysicalMaterial({ color: 0xc91548, roughness: 0.44, clearcoat: 0.36 });
  const blueberryMaterial = new THREE.MeshPhysicalMaterial({ color: 0x40509b, roughness: 0.42, clearcoat: 0.4 });
  const raspberryMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd8406f, roughness: 0.52 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x3f8c58, roughness: 0.7 });
  const pearlMaterial = new THREE.MeshStandardMaterial({ color: 0xffd9a6, roughness: 0.22, metalness: 0.8 });
  const sprinkleColors = [0xff6ca9, 0x8de5e1, 0xffe08a, 0xffffff, 0xb98cff];

  const blueberryGeometry = new THREE.SphereGeometry(0.115, 12, 10);
  const pearlGeometry = new THREE.SphereGeometry(0.05, 8, 6);
  const berryLobeGeometry = new THREE.SphereGeometry(0.055, 8, 6);
  const sprinkleGeometry = THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.02, 0.08, 3, 6)
    : new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6);

  const ganache = new THREE.Mesh(new THREE.CylinderGeometry(1.44, 1.44, 0.1, 64), darkChocolate);
  ganache.position.y = 1.4;
  ganache.receiveShadow = true;
  cakeGroup.add(ganache);

  for (let drip = 0; drip < 14; drip += 1) {
    const angle = (drip / 14) * Math.PI * 2;
    const length = 0.16 + ((drip * 5) % 4) * 0.07;
    const chocolateDrip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), darkChocolate);
    chocolateDrip.scale.set(1, 1 + length * 5, 0.7);
    chocolateDrip.position.set(Math.cos(angle) * 1.42, 1.4 - length, Math.sin(angle) * 1.42);
    cakeGroup.add(chocolateDrip);
  }

  const makeStrawberry = (scale = 1) => {
    const strawberry = new THREE.Group();
    const fruit = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.36, 18), strawberryMaterial);
    fruit.rotation.x = Math.PI;
    fruit.position.y = 0.02;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), strawberryMaterial);
    tip.scale.set(1, 0.6, 1);
    tip.position.y = 0.2;
    strawberry.add(fruit, tip);
    for (let petal = 0; petal < 5; petal += 1) {
      const angle = (petal / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.17, 5), leafMaterial);
      leaf.position.set(Math.cos(angle) * 0.1, 0.26, Math.sin(angle) * 0.1);
      leaf.rotation.set(-0.75 * Math.cos(angle) * -1, 0, 0.75 * Math.sin(angle));
      strawberry.add(leaf);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 6), leafMaterial);
    stem.position.y = 0.33;
    strawberry.add(stem);
    for (let seed = 0; seed < 6; seed += 1) {
      const angle = (seed / 6) * Math.PI * 2;
      const pearl = new THREE.Mesh(pearlGeometry, pearlMaterial);
      pearl.scale.setScalar(0.34);
      pearl.position.set(Math.cos(angle) * 0.16, 0.02 + (seed % 3) * 0.08, Math.sin(angle) * 0.16);
      strawberry.add(pearl);
    }
    strawberry.scale.setScalar(scale);
    return strawberry;
  };

  const makeRaspberry = () => {
    const raspberry = new THREE.Group();
    for (let lobe = 0; lobe < 9; lobe += 1) {
      const angle = (lobe / 8) * Math.PI * 2;
      const ring = lobe === 8 ? 0 : 0.09;
      const bead = new THREE.Mesh(berryLobeGeometry, raspberryMaterial);
      bead.position.set(Math.cos(angle) * ring, lobe === 8 ? 0.06 : 0, Math.sin(angle) * ring);
      raspberry.add(bead);
    }
    return raspberry;
  };

  const makeMacaron = (shellColor, fillingColor) => {
    const macaron = new THREE.Group();
    const shellMaterial = new THREE.MeshPhysicalMaterial({ color: shellColor, roughness: 0.62, sheen: 0.4 });
    const shellGeometry = new THREE.CylinderGeometry(0.28, 0.25, 0.14, 24);
    const bottom = new THREE.Mesh(shellGeometry, shellMaterial);
    const top = new THREE.Mesh(shellGeometry, shellMaterial);
    bottom.position.y = -0.11;
    bottom.rotation.x = Math.PI;
    top.position.y = 0.11;
    const filling = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: fillingColor, roughness: 0.5 }),
    );
    macaron.add(bottom, top, filling);
    return macaron;
  };

  const strawberryLayout = [
    { x: -1.06, z: 0.48, tilt: 0.22 },
    { x: 1.04, z: 0.42, tilt: -0.2 },
    { x: 0.02, z: -1.08, tilt: 0.12 },
  ];
  strawberryLayout.forEach((spot) => {
    const strawberry = makeStrawberry(0.92);
    strawberry.position.set(spot.x, 1.62, spot.z);
    strawberry.rotation.z = spot.tilt;
    strawberry.castShadow = true;
    cakeGroup.add(strawberry);
  });

  const blueberryLayout = [
    { x: -0.66, z: -0.86 },
    { x: -0.42, z: -1.06 },
    { x: 0.7, z: 0.78 },
    { x: 0.94, z: 0.46 },
    { x: -1.14, z: -0.1 },
  ];
  blueberryLayout.forEach((spot) => {
    const blueberry = new THREE.Mesh(blueberryGeometry, blueberryMaterial);
    blueberry.scale.set(1, 0.86, 1);
    blueberry.position.set(spot.x, 1.53, spot.z);
    blueberry.castShadow = true;
    cakeGroup.add(blueberry);
  });

  [
    { x: 0.56, z: 0.96 },
    { x: -0.88, z: 0.22 },
  ].forEach((spot) => {
    const raspberry = makeRaspberry();
    raspberry.position.set(spot.x, 1.52, spot.z);
    cakeGroup.add(raspberry);
  });

  for (let curl = 0; curl < 5; curl += 1) {
    const angle = (curl / 5) * Math.PI * 2 + 0.6;
    const chocolateCurl = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.045, 8, 18, Math.PI * 1.45),
      curl % 2 ? whiteChocolate : milkChocolate,
    );
    chocolateCurl.position.set(Math.cos(angle) * 1.16, 1.52, Math.sin(angle) * 1.16);
    chocolateCurl.rotation.set(Math.PI / 2.4, angle, 0.5);
    cakeGroup.add(chocolateCurl);
  }

  [-1.24, -0.62, 0.62, 1.24].forEach((x, shard) => {
    const chocolateShard = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.48, 0.045),
      shard % 2 ? darkChocolate : milkChocolate,
    );
    chocolateShard.position.set(x, 1.65, -0.82 - (shard % 2) * 0.14);
    chocolateShard.rotation.set(0.16, shard % 2 ? 0.3 : -0.28, shard % 2 ? 0.2 : -0.18);
    chocolateShard.castShadow = true;
    cakeGroup.add(chocolateShard);
  });

  for (let stick = 0; stick < 3; stick += 1) {
    const angle = 3.62 + stick * 0.3;
    const pocky = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 1.24, 10), milkChocolate);
    pocky.position.set(Math.cos(angle) * 2.4, -1.55, Math.sin(angle) * 2.4);
    pocky.rotation.set(Math.PI / 2, angle + 0.55, 0);
    cakeGroup.add(pocky);
  }

  for (let sprinkle = 0; sprinkle < 26; sprinkle += 1) {
    const angle = (sprinkle / 26) * Math.PI * 2 * 3;
    const radius = 0.82 + ((sprinkle * 7) % 5) * 0.09;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (z > 0.68 && Math.abs(x) < 0.85) continue;
    const piece = new THREE.Mesh(
      sprinkleGeometry,
      new THREE.MeshStandardMaterial({ color: sprinkleColors[sprinkle % sprinkleColors.length], roughness: 0.45 }),
    );
    piece.position.set(x, 1.46, z);
    piece.rotation.set(Math.PI / 2, angle * 1.7, angle);
    cakeGroup.add(piece);
  }

  [
    { x: -1.5, z: 1.8, colors: [0xffb3d1, 0xfff0f5], tilt: -0.3 },
    { x: 1.45, z: 1.85, colors: [0xffe1a8, 0xfff6e4], tilt: 0.26 },
    { x: 0.05, z: 2.4, colors: [0xc9a2f5, 0xf6ecff], tilt: 0.1 },
  ].forEach((spot) => {
    const macaron = makeMacaron(spot.colors[0], spot.colors[1]);
    macaron.position.set(spot.x, -1.31, spot.z);
    macaron.rotation.z = Math.PI / 2;
    macaron.rotation.y = spot.tilt;
    macaron.castShadow = true;
    cakeGroup.add(macaron);
  });

  [
    { x: -0.9, z: 2.2 },
    { x: 0.95, z: 2.15 },
    { x: -2.3, z: 0.6 },
  ].forEach((spot, index) => {
    const truffle = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), index % 2 ? darkChocolate : whiteChocolate);
    truffle.position.set(spot.x, -1.4, spot.z);
    truffle.castShadow = true;
    cakeGroup.add(truffle);
    const dust = new THREE.Mesh(pearlGeometry, pearlMaterial);
    dust.position.set(spot.x + 0.28, -1.55, spot.z - 0.2);
    cakeGroup.add(dust);
  });

  const plaqueCanvas = document.createElement("canvas");
  plaqueCanvas.width = 512;
  plaqueCanvas.height = 256;
  const plaqueContext = plaqueCanvas.getContext("2d");
  plaqueContext.fillStyle = "#3d1c11";
  plaqueContext.fillRect(0, 0, 512, 256);
  plaqueContext.strokeStyle = "rgba(255,214,160,.75)";
  plaqueContext.lineWidth = 6;
  plaqueContext.strokeRect(18, 18, 476, 220);
  plaqueContext.fillStyle = "#ffe2b0";
  plaqueContext.textAlign = "center";
  plaqueContext.textBaseline = "middle";
  plaqueContext.font = "600 78px 'Songti SC', serif";
  plaqueContext.fillText("生日快乐", 256, 108);
  plaqueContext.font = "600 48px 'Songti SC', serif";
  plaqueContext.fillStyle = "#ffdbe8";
  plaqueContext.fillText("丫头 · 07.25", 256, 188);
  const plaqueTexture = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTexture.colorSpace = THREE.SRGBColorSpace;
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.67, 0.06), [
    darkChocolate,
    darkChocolate,
    darkChocolate,
    darkChocolate,
    new THREE.MeshBasicMaterial({ map: plaqueTexture, toneMapped: false }),
    darkChocolate,
  ]);
  plaque.position.set(0, 1.72, 1.44);
  plaque.rotation.x = -0.52;
  plaque.castShadow = true;
  cakeGroup.add(plaque);

  const candlePositions = [-1.05, -0.52, 0, 0.52, 1.05];
  candlePositions.forEach((x, index) => {
    const candleGroup = new THREE.Group();
    candleGroup.position.set(x, 1.78, index % 2 ? -0.55 : -0.25);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.08, 0.7, 20),
      new THREE.MeshPhysicalMaterial({
        color: index % 2 ? 0xff6ca9 : 0x8de5e1,
        roughness: 0.42,
        clearcoat: 0.5,
        sheen: 0.5,
      }),
    );
    candle.castShadow = true;
    candleGroup.add(candle);

    for (let stripe = 0; stripe < 5; stripe += 1) {
      const swirl = new THREE.Mesh(
        new THREE.TorusGeometry(0.079, 0.014, 6, 20),
        new THREE.MeshStandardMaterial({ color: 0xfff4fa, roughness: 0.4 }),
      );
      swirl.rotation.set(Math.PI / 2, 0, 0.35);
      swirl.position.y = -0.28 + stripe * 0.14;
      candleGroup.add(swirl);
    }

    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: 0x2c1c22, roughness: 0.9 }),
    );
    wick.position.y = 0.4;
    candleGroup.add(wick);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), new THREE.MeshBasicMaterial({ color: 0xffc45d }));
    flame.scale.set(0.72, 1.45, 0.72);
    flame.position.y = 0.52;
    flame.userData.candleIndex = index;
    flame.userData.phase = index * 0.9;
    flame.userData.basePosition = flame.position.clone();
    candleGroup.add(flame);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xffb45f, transparent: true, opacity: 0.16 }),
    );
    halo.position.y = 0.52;
    candleGroup.add(halo);

    const candleLight = new THREE.PointLight(0xffb162, 1.5, 2.6);
    candleLight.position.y = 0.56;
    candleGroup.add(candleLight);

    const hitProxy = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 1.5, 10),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitProxy.position.y = 0.2;
    hitProxy.userData.candleIndex = index;
    candleGroup.add(hitProxy);

    flame.userData.halo = halo;
    flame.userData.light = candleLight;
    flame.userData.wick = wick;
    flameMeshes.push(flame);
    candleProxies.push(hitProxy);
    cakeGroup.add(candleGroup);
  });

  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  for (let index = 0; index < 150; index += 1) {
    const radius = 4 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    starPositions.push(Math.cos(angle) * radius, -1 + Math.random() * 6, Math.sin(angle) * radius - 2);
  }
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffb4d0, size: 0.035, transparent: true, opacity: 0.7 }),
    ),
  );

  const resize = () => {
    const rect = cakeStage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    updateCakeCamera();
  };

  updateCakeCamera = () => {
    const halfFov = Math.tan((camera.fov * Math.PI) / 360);
    const fitted = Math.min(Math.max(2.62 / (halfFov * camera.aspect), 10.6), 15);
    const distance = fitted * zoom;
    camera.position.set(0, 0.6 + distance * 0.2507, distance * 0.968);
    camera.lookAt(0, 0.6, 0);
    camera.updateProjectionMatrix();
  };

  new ResizeObserver(resize).observe(cakeStage);
  resize();

  const castAt = (event) => {
    const rect = cakeCanvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([...candleProxies, ...layerMeshes], false);
  };

  const pick = (event) => {
    const hits = castAt(event);
    if (!hits.length) return;
    const candleHit = hits.find((hit) => Number.isInteger(hit.object.userData.candleIndex));
    if (candleHit) {
      extinguishCandle(candleHit.object.userData.candleIndex);
      return;
    }
    const layerHit = hits.find((hit) => Number.isInteger(hit.object.userData.memoryIndex));
    if (!layerHit) return;
    const target = layerHit.object;
    target.material.emissive.setHex(0x7b1847);
    target.material.emissiveIntensity = 0.55;
    showCakeMemory(target.userData.memoryIndex);
  };

  const updateHover = (event) => {
    const hits = castAt(event);
    const candleHit = hits.find((hit) => Number.isInteger(hit.object.userData.candleIndex));
    const overCandle = Boolean(candleHit) && !extinguishedCandles.has(candleHit.object.userData.candleIndex);
    hoveredCandle = overCandle ? candleHit.object.userData.candleIndex : -1;

    const layerHit = hits.find((hit) => Number.isInteger(hit.object.userData.memoryIndex));
    const layer = overCandle ? null : layerHit?.object;
    if (layer !== hoveredLayer) {
      if (hoveredLayer && !foundCakeMemories.has(hoveredLayer.userData.memoryIndex)) {
        hoveredLayer.material.emissiveIntensity = 0.15;
      }
      hoveredLayer = layer ?? null;
      if (hoveredLayer) hoveredLayer.material.emissiveIntensity = 0.5;
    }

    if (hoveredLayer) {
      const index = hoveredLayer.userData.memoryIndex;
      cakeHint.textContent = `第 ${index + 1} 层 · ${memoryData[index].title}`;
    } else if (hoveredCandle >= 0) {
      cakeHint.textContent = `点一下这根烛光，替丫头许个愿`;
    } else {
      cakeHint.textContent = baseHint;
    }

    cakeCanvas.style.cursor = hoveredCandle >= 0 || hoveredLayer ? "pointer" : "grab";
  };

  cakeCanvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    moved = false;
    cakeTouched = true;
    lastPointerX = event.clientX;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    cakeCanvas.setPointerCapture?.(event.pointerId);
  });

  cakeCanvas.addEventListener("pointermove", (event) => {
    if (!dragging) {
      if (event.pointerType === "mouse") updateHover(event);
      return;
    }
    const distance = Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY);
    if (distance > 12) moved = true;
    if (moved) {
      cakeGroup.rotation.y += (event.clientX - lastPointerX) * 0.009;
      windStrength = Math.min(Math.abs(event.clientX - lastPointerX) * 0.05, 1.1);
    }
    lastPointerX = event.clientX;
  });

  cakeCanvas.addEventListener("pointerup", (event) => {
    dragging = false;
    cakeCanvas.releasePointerCapture?.(event.pointerId);
    if (!moved) pick(event);
  });

  cakeCanvas.addEventListener("pointercancel", () => {
    dragging = false;
  });

  cakeCanvas.addEventListener("pointerleave", () => {
    hoveredCandle = -1;
    if (hoveredLayer && !foundCakeMemories.has(hoveredLayer.userData.memoryIndex)) {
      hoveredLayer.material.emissiveIntensity = 0.15;
    }
    hoveredLayer = null;
    cakeCanvas.style.cursor = "grab";
  });

  cakeCanvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      cakeTouched = true;
      zoom = Math.min(Math.max(zoom + Math.sign(event.deltaY) * 0.06, 0.62), 1.35);
      updateCakeCamera();
    },
    { passive: false },
  );

  cakeCanvas.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 0.22 : 0.09;
    if (event.key === "ArrowLeft") cakeGroup.rotation.y -= step;
    else if (event.key === "ArrowRight") cakeGroup.rotation.y += step;
    else if (event.key === "+" || event.key === "=") zoom = Math.max(zoom - 0.08, 0.62);
    else if (event.key === "-" || event.key === "_") zoom = Math.min(zoom + 0.08, 1.35);
    else return;
    event.preventDefault();
    cakeTouched = true;
    updateCakeCamera();
  });

  const clock = new THREE.Clock();
  const showcaseUntil = performance.now() + 7000;
  const render = () => {
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    const now = performance.now();

    if (!cakeTouched && !reduceMotion.matches) {
      if (now < showcaseUntil) {
        cakeGroup.rotation.y += 0.0022;
      } else {
        const front = Math.round(cakeGroup.rotation.y / (Math.PI * 2)) * Math.PI * 2;
        cakeGroup.rotation.y += (front - cakeGroup.rotation.y) * 0.05;
      }
    }

    windStrength = Math.max(0, windStrength - delta * 1.4);

    const layerGlow = reduceMotion.matches ? 0.2 : 0.16 + Math.abs(Math.sin(elapsed * 1.7)) * 0.2;
    layerMeshes.forEach((layer) => {
      if (foundCakeMemories.has(layer.userData.memoryIndex) || layer === hoveredLayer) return;
      layer.material.emissiveIntensity = layerGlow;
    });

    flameMeshes.forEach((flame, index) => {
      if (flame.userData.extinguished) return;
      const focused = hoveredCandle === index;
      const pulse = 1 + Math.sin(elapsed * 8 + flame.userData.phase) * 0.09 + (focused ? 0.22 : 0);
      const gust = windStrength * (0.9 + Math.sin(elapsed * 14 + flame.userData.phase) * 0.35);
      flame.scale.set(0.72 * pulse, 1.45 * pulse * (1 - gust * 0.25), 0.72 * pulse);
      flame.position.set(
        flame.userData.basePosition.x + gust * 0.16,
        flame.userData.basePosition.y - gust * 0.04,
        flame.userData.basePosition.z + Math.sin(elapsed * 6 + index) * 0.012,
      );
      flame.rotation.z = -gust * 0.7;
      flame.material.color.setHSL(0.09 + Math.sin(elapsed * 5) * 0.01, 1, focused ? 0.72 : 0.63);
      flame.userData.halo.scale.setScalar(pulse * (focused ? 1.35 : 1));
      flame.userData.halo.material.opacity = focused ? 0.3 : 0.16;
      flame.userData.light.intensity = (focused ? 2.6 : 1.5) * pulse;
    });

    cakeParticles = cakeParticles.filter((particle) => {
      const age = (now - particle.userData.startedAt) / 1000;
      if (age < 0) return true;
      if (age > particle.userData.life) {
        cakeGroup.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        return false;
      }
      const progress = age / particle.userData.life;
      if (particle.userData.kind === "smoke") {
        particle.position.y += 0.008;
        particle.position.x += particle.userData.drift * 0.003;
        particle.scale.setScalar(1 + age * 1.8);
        particle.material.opacity = Math.max(0, 0.38 * (1 - progress));
      } else {
        particle.userData.velocity.y -= delta * 4.2;
        particle.position.addScaledVector(particle.userData.velocity, delta);
        particle.material.opacity = Math.max(0, 1 - progress);
        particle.scale.setScalar(Math.max(0.2, 1 - progress * 0.6));
      }
      return true;
    });

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };
  render();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      render();
    }
  });
};

initCake();

const svgNamespace = "http://www.w3.org/2000/svg";
const provinceGroup = document.querySelector("#china-provinces");
const routeProvinces = new Set(["Beijing", "Tianjin", "Henan", "Shanghai", "Jiangxi", "Hebei"]);

chinaMap.locations.forEach((location) => {
  const path = document.createElementNS(svgNamespace, "path");
  path.setAttribute("d", location.path);
  path.dataset.province = location.name;
  if (routeProvinces.has(location.name)) path.setAttribute("class", "is-route");
  provinceGroup.append(path);
});

const journeyStops = [
  {
    city: "天津",
    route: "起点 · 天津",
    title: "第一段异地，从天津开始",
    copy: "手机里第一批车票，是北京和天津之间的。距离不算太远，想念却总让列车显得太慢。",
    image: "./assets/photos/city-tianjin.webp",
    alt: "在天津拍的写真",
  },
  {
    city: "北京",
    route: "天津 → 北京",
    title: "同一座城，也要跨过半个北京",
    copy: "后来我们都到了北京，从海淀到石景山，地铁换了一趟又一趟。原来在同一座城市里，也可以是异地。",
    image: "./assets/photos/city-beijing-start.webp",
    alt: "我们在北京拍的合照",
  },
  {
    city: "洛阳",
    route: "毕业旅行 · 开封洛阳",
    title: "毕业那年，我们把春天走了一遍",
    copy: "2023 年 4 月，我们一起毕业，去了开封和洛阳。你穿上古装长裙站在灯笼下，那天的阳光刚好落在你身上。",
    image: "./assets/photos/city-luoyang.webp",
    alt: "在洛阳穿古装站在灯笼下的照片",
  },
  {
    city: "上海",
    route: "北京 → 上海",
    title: "我们在城堡下看过的那场烟花",
    copy: "工作把我带到了上海，你也来过。我们一起去了迪士尼，在城堡下看烟花升起来的时候，我偷偷想：以后每一年都要这样。相册里偏偏没留下那天的合照，所以我把那座城堡画了下来。",
    image: "./assets/shanghai-castle.svg",
    alt: "手绘的童话城堡与烟花插画，两个人牵着手站在广场上",
  },
  {
    city: "南昌",
    route: "上海 ⇄ 南昌 · 往返",
    title: "你去了南昌，我把车票买成了往返",
    copy: "从上海到南昌，一张接一张的高铁票几乎都是往返：周五出发，周日回程，只为在一起待上两天。",
    image: "./assets/photos/city-nanchang.webp",
    alt: "在南昌拍的古装合照",
  },
  {
    city: "北京",
    route: "北京 ⇄ 南昌 · 往返",
    title: "起点换成北京，终点还是你",
    copy: "后来我回到北京，往返的两端从上海换成了北京。路更长了，但每一次落地，等着我的还是同一个拥抱。",
    image: "./assets/photos/city-beijing-return.webp",
    alt: "我们在北京牵手的合照",
  },
];

const journeyStations = [
  { city: "北京", x: 542, y: 246, label: { x: 452, y: 188 }, landmark: "gate" },
  { city: "天津", x: 554, y: 260, label: { x: 658, y: 258 }, landmark: "wheel" },
  { city: "洛阳", x: 487, y: 347, label: { x: 384, y: 372 }, landmark: "peony" },
  { city: "上海", x: 609, y: 386, label: { x: 694, y: 404 }, landmark: "pearl" },
  { city: "南昌", x: 533, y: 421, label: { x: 440, y: 478 }, landmark: "pavilion" },
];

const journeyPositions = Object.fromEntries(
  journeyStations.map((station) => [station.city, { x: station.x, y: station.y }]),
);

// One entry per leg of journeyStops. The last two legs are commutes, so they
// get a mirrored return curve and read as a round trip on the map.
const journeyLegs = [
  { control: { x: 543, y: 256 } },
  { control: { x: 497, y: 287 } },
  { control: { x: 548, y: 334 } },
  { control: { x: 578, y: 420 }, shuttle: true },
  { control: { x: 516, y: 332 }, shuttle: true },
];

const landmarkPaths = {
  gate: "M-11 7h22M-8 7V0h16v7M-13 0l13-7 13 7M-3-11h6v4h-6z",
  wheel: "M0 12v-4M-5 12h10M0-11a8 8 0 1 1 0 16 8 8 0 0 1 0-16M0-11v16M-8-3h16M-6-8l12 10M6-8L-6 2",
  peony: "M0-2v-6M0-2l6-4M0-2l6 4M0-2l-6 4M0-2l-6-4M-9 8h18M0 0a2.6 2.6 0 1 1 0 .1",
  pearl: "M0 12V-12M-6 12l6-5 6 5M0-11a3.2 3.2 0 1 1 0 .1M0-1a5 5 0 1 1 0 .1",
  pavilion: "M-12-4l12-8 12 8M-9 3l9-7 9 7M-7 3v7M7 3v7M-11 10h22M0-12v-3",
};

const journeyRouteGroup = document.querySelector("#journey-routes");
const journeyStationGroup = document.querySelector("#journey-stations");

const quadPath = (from, control, to) => `M${from.x} ${from.y} Q${control.x} ${control.y} ${to.x} ${to.y}`;

const mirrorControl = (from, to, control) => ({ x: from.x + to.x - control.x, y: from.y + to.y - control.y });

const journeyLegPaths = journeyStops.slice(1).map((stop, index) => {
  const leg = journeyLegs[index];
  const from = journeyPositions[journeyStops[index].city];
  const to = journeyPositions[stop.city];
  const controls = leg.shuttle ? [leg.control, mirrorControl(from, to, leg.control)] : [leg.control];

  return controls.map((control) => {
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("class", leg.shuttle ? "journey-route is-shuttle" : "journey-route");
    path.setAttribute("d", quadPath(from, control, to));
    journeyRouteGroup.append(path);
    return path;
  });
});

journeyStations.forEach((station) => {
  const group = document.createElementNS(svgNamespace, "g");
  group.setAttribute("class", "journey-city");
  group.setAttribute("tabindex", "0");
  group.setAttribute("role", "button");
  group.setAttribute("aria-label", `${station.city}站`);
  group.dataset.journeyCity = station.city;

  const leader = document.createElementNS(svgNamespace, "path");
  leader.setAttribute("class", "journey-leader");
  leader.setAttribute("d", `M${station.x} ${station.y}L${station.label.x} ${station.label.y}`);

  const halo = document.createElementNS(svgNamespace, "circle");
  halo.setAttribute("class", "journey-halo");
  halo.setAttribute("cx", String(station.x));
  halo.setAttribute("cy", String(station.y));
  halo.setAttribute("r", "10");

  const ring = document.createElementNS(svgNamespace, "circle");
  ring.setAttribute("class", "journey-ring");
  ring.setAttribute("cx", String(station.x));
  ring.setAttribute("cy", String(station.y));
  ring.setAttribute("r", "14");

  const dot = document.createElementNS(svgNamespace, "circle");
  dot.setAttribute("class", "journey-dot");
  dot.setAttribute("cx", String(station.x));
  dot.setAttribute("cy", String(station.y));
  dot.setAttribute("r", "4.6");

  const pill = document.createElementNS(svgNamespace, "g");
  pill.setAttribute("class", "journey-pill");
  pill.setAttribute("transform", `translate(${station.label.x} ${station.label.y})`);

  const plate = document.createElementNS(svgNamespace, "rect");
  plate.setAttribute("x", "-50");
  plate.setAttribute("y", "-19");
  plate.setAttribute("width", "100");
  plate.setAttribute("height", "38");
  plate.setAttribute("rx", "19");

  const icon = document.createElementNS(svgNamespace, "path");
  icon.setAttribute("class", "journey-landmark");
  icon.setAttribute("transform", "translate(-28 0) scale(.8)");
  icon.setAttribute("d", landmarkPaths[station.landmark]);

  const label = document.createElementNS(svgNamespace, "text");
  label.setAttribute("x", "10");
  label.setAttribute("y", "6");
  label.textContent = station.city;

  pill.append(plate, icon, label);
  group.append(leader, halo, ring, dot, pill);
  journeyStationGroup.append(group);
});

const journeyCities = [...document.querySelectorAll("[data-journey-city]")];
const journeyTrain = document.querySelector("#journey-train");
const journeyStep = document.querySelector("#journey-step");
const journeyGuideTitle = document.querySelector("#journey-guide-title");
const journeyGuideCopy = document.querySelector("#journey-guide-copy");
const cityMemory = document.querySelector("#city-memory");
const cityMemoryImage = document.querySelector("#city-memory-image");
const cityMemoryRoute = document.querySelector("#city-memory-route");
const cityMemoryTitle = document.querySelector("#city-memory-title");
const cityMemoryCopy = document.querySelector("#city-memory-copy");
let journeyIndex = 0;
let journeyMoving = false;

new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) document.querySelector("#music-player")?.classList.add("is-collapsed");
  },
  { threshold: 0.3 },
).observe(document.querySelector("#china-journey"));

const quadraticPoint = (from, control, to, amount) => {
  const inverse = 1 - amount;
  return {
    x: inverse * inverse * from.x + 2 * inverse * amount * control.x + amount * amount * to.x,
    y: inverse * inverse * from.y + 2 * inverse * amount * control.y + amount * amount * to.y,
  };
};

const moveJourneyTrain = (from, to, control) =>
  new Promise((resolve) => {
    const started = performance.now();
    const duration = reduceMotion.matches ? 1 : 1250;
    journeyTrain.classList.add("is-visible");
    const frame = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const point = quadraticPoint(from, control, to, eased);
      journeyTrain.setAttribute("transform", `translate(${point.x} ${point.y})`);
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });

const showCityMemory = (stop) => {
  cityMemoryImage.src = vaultUrl(stop.image);
  cityMemoryImage.alt = stop.alt ?? `${stop.city}阶段的回忆照片`;
  cityMemoryRoute.textContent = stop.route;
  cityMemoryTitle.textContent = stop.title;
  cityMemoryCopy.textContent = stop.copy;
  cityMemory.hidden = false;
};

const visitCity = async (cityElement) => {
  if (journeyMoving || !cityMemory.hidden) return;
  const expectedStop = journeyStops[journeyIndex];
  const city = cityElement.dataset.journeyCity;
  if (city !== expectedStop.city) {
    cityElement.classList.remove("is-wrong");
    void cityElement.getBoundingClientRect();
    cityElement.classList.add("is-wrong");
    journeyGuideTitle.textContent = `还没到${city}`;
    journeyGuideCopy.textContent = `下一张车票的目的地是${expectedStop.city}。`;
    return;
  }

  journeyMoving = true;
  if (journeyIndex === 0) {
    journeyTrain.classList.add("is-visible");
  } else {
    const leg = journeyLegs[journeyIndex - 1];
    const previous = journeyPositions[journeyStops[journeyIndex - 1].city];
    const next = journeyPositions[city];
    await moveJourneyTrain(previous, next, leg.control);
    journeyLegPaths[journeyIndex - 1].forEach((path) => path.classList.add("is-active"));
  }
  cityElement.classList.add("is-visited");
  showCityMemory(expectedStop);
  journeyGuideTitle.textContent = `${city}站已抵达`;
  journeyGuideCopy.textContent = expectedStop.copy;
  journeyMoving = false;
};

journeyCities.forEach((city) => {
  city.addEventListener("click", () => visitCity(city));
  city.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      visitCity(city);
    }
  });
});

const journeyTotal = String(journeyStops.length).padStart(2, "0");

const markNextStation = () => {
  const nextCity = journeyStops[journeyIndex]?.city;
  journeyCities.forEach((city) => {
    city.classList.toggle("is-next", city.dataset.journeyCity === nextCity);
  });
};

markNextStation();

const advanceJourney = () => {
  if (cityMemory.hidden) return;
  cityMemory.hidden = true;
  journeyIndex += 1;
  markNextStation();

  if (journeyIndex === journeyStops.length) {
    journeyStep.textContent = `${journeyTotal} / ${journeyTotal}`;
    journeyGuideTitle.textContent = "全部车票已经抵达";
    journeyGuideCopy.textContent = "地图上的每一条线，都在证明我们从未停止奔向彼此。";
    window.dispatchEvent(new CustomEvent("journey-complete"));
    return;
  }

  journeyStep.textContent = `${String(journeyIndex + 1).padStart(2, "0")} / ${journeyTotal}`;
  journeyGuideTitle.textContent = `下一站：${journeyStops[journeyIndex].city}`;
  journeyGuideCopy.textContent = "在地图上点击对应的城市地标，继续这趟旅程。";
};

document.querySelector("#city-memory-continue").addEventListener("click", advanceJourney);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" || event.key === "Enter") advanceJourney();
});
