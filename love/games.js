(() => {
  const stage = document.querySelector("#arcade-stage");
  const canvas = document.querySelector("#arcade-canvas");
  const tip = document.querySelector("#arcade-tip");
  const titleEl = document.querySelector("#arcade-title");
  const scoreEl = document.querySelector("#arcade-score");
  const comboEl = document.querySelector("#arcade-combo");
  const helpEl = document.querySelector("#arcade-help");
  const actionBtn = document.querySelector("#arcade-action");
  const backBtn = document.querySelector("#arcade-back");
  const playCountEl = document.querySelector("#hall-play-count");
  const bestComboEl = document.querySelector("#hall-best-combo");
  const clearCountEl = document.querySelector("#hall-clear-count");
  if (!stage || !canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const STORAGE = "museum-arcade-stats-v2";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const META = {
    stack: {
      title: "奶油千层叠叠乐",
      tip: "在最稳的一刻落层！完美对齐会掉草莓加分，切到太窄就倒塔。",
      help: "点击画布 / 空格落层 · 越叠越快，对准中间最甜",
    },
    catch: {
      title: "异地车票接接乐",
      tip: "三车道接车票。连击进入「奔赴狂热」后分数翻倍！",
      help: "←→ / A D / 鼠标切换车道 · 躲开加班堵车拖延",
    },
    blow: {
      title: "吹蜡烛大作战",
      tip: "按住蓄力，松手吹气。蓄得越满，能吹灭的烛火越多。",
      help: "按住空格或按住鼠标蓄力，松开吹气 · 顽固蜡烛要大力",
    },
  };

  let stats = loadStats();
  let active = null;
  let running = false;
  let score = 0;
  let combo = 0;
  let bestCombo = stats.bestCombo || 0;
  let raf = 0;
  let mode = "idle";
  let lastTs = 0;

  const keys = new Set();
  let pointerDown = false;
  let pointerX = W / 2;
  let pointerY = H / 2;

  // —— Juice layer ——
  const juice = {
    particles: [],
    floats: [],
    shake: 0,
    flash: 0,
    banner: null,
    stars: Array.from({ length: 48 }, (_, i) => ({
      x: (i * 137) % W,
      y: (i * 89) % H,
      r: 0.6 + (i % 3) * 0.5,
      tw: Math.random() * Math.PI * 2,
    })),
  };

  const setHud = () => {
    scoreEl.textContent = String(Math.floor(score));
    comboEl.textContent = String(combo);
  };

  const bumpCombo = (amount = 1) => {
    combo += amount;
    if (combo > bestCombo) {
      bestCombo = combo;
      stats.bestCombo = bestCombo;
      saveStats();
      renderHallStats();
    }
    if (combo > 0 && combo % 5 === 0) {
      showBanner(`${combo} 连击！`, "#ffd84d");
      burst(W / 2, 120, "#ffd84d", 18);
    }
  };

  const resetCombo = () => {
    combo = 0;
  };

  const addScore = (amount, x, y, label) => {
    score += amount;
    setHud();
    if (x != null) floatText(x, y, label || `+${amount}`, "#ffd84d");
  };

  const floatText = (x, y, text, color) => {
    juice.floats.push({ x, y, text, color, life: 1, vy: -1.2 });
  };

  const burst = (x, y, color, count = 12) => {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3.5;
      juice.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 0.7 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  let audioCtx = null;
  const ensureAudio = () => {
    if (reduceMotion.matches) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  };

  const blip = (freq = 520, dur = 0.08, type = "square", gain = 0.045) => {
    const ac = ensureAudio();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur);
  };

  const showBanner = (text, color = "#fff") => {
    juice.banner = { text, color, life: 1.1 };
    blip(880, 0.1, "triangle", 0.05);
  };

  const punch = (amount = 6) => {
    if (!reduceMotion.matches) juice.shake = Math.max(juice.shake, amount);
  };

  const flashScreen = (amount = 0.35) => {
    juice.flash = Math.max(juice.flash, amount);
  };

  const stepJuice = (dt) => {
    juice.shake = Math.max(0, juice.shake - dt * 28);
    juice.flash = Math.max(0, juice.flash - dt * 1.6);
    juice.particles = juice.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= dt;
      return p.life > 0;
    });
    juice.floats = juice.floats.filter((f) => {
      f.y += f.vy;
      f.life -= dt * 0.9;
      return f.life > 0;
    });
    if (juice.banner) {
      juice.banner.life -= dt;
      if (juice.banner.life <= 0) juice.banner = null;
    }
    juice.stars.forEach((s) => {
      s.tw += dt * 3;
    });
  };

  const drawJuice = (g) => {
    juice.particles.forEach((p) => {
      g.globalAlpha = Math.max(0, p.life);
      g.fillStyle = p.color;
      g.beginPath();
      g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      g.fill();
    });
    g.globalAlpha = 1;
    juice.floats.forEach((f) => {
      g.globalAlpha = Math.max(0, f.life);
      g.fillStyle = f.color;
      g.font = "bold 22px Songti SC, serif";
      g.textAlign = "center";
      g.fillText(f.text, f.x, f.y);
    });
    g.globalAlpha = 1;
    if (juice.banner) {
      const alpha = Math.min(1, juice.banner.life * 2);
      g.fillStyle = `rgba(0,0,0,${0.35 * alpha})`;
      g.fillRect(0, 90, W, 64);
      g.fillStyle = juice.banner.color;
      g.globalAlpha = alpha;
      g.font = "bold 34px Songti SC, serif";
      g.textAlign = "center";
      g.fillText(juice.banner.text, W / 2, 132);
      g.globalAlpha = 1;
    }
    if (juice.flash > 0) {
      g.fillStyle = `rgba(255,255,255,${juice.flash})`;
      g.fillRect(0, 0, W, H);
    }
  };

  const drawStars = (g, color = "rgba(255,255,255,0.35)") => {
    g.fillStyle = color;
    juice.stars.forEach((s) => {
      const a = 0.25 + Math.abs(Math.sin(s.tw)) * 0.55;
      g.globalAlpha = a;
      g.beginPath();
      g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      g.fill();
    });
    g.globalAlpha = 1;
  };

  function loadStats() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE) || "{}");
    } catch {
      return {};
    }
  }

  function saveStats() {
    sessionStorage.setItem(STORAGE, JSON.stringify(stats));
  }

  function renderHallStats() {
    playCountEl.textContent = String(stats.plays || 0);
    bestComboEl.textContent = String(stats.bestCombo || 0);
    const cleared = ["stack", "catch", "blow"].filter((id) => stats[`clear_${id}`]).length;
    clearCountEl.textContent = String(cleared);
  }

  function roundRect(g, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + radius, y);
    g.arcTo(x + w, y, x + w, y + h, radius);
    g.arcTo(x + w, y + h, x, y + h, radius);
    g.arcTo(x, y + h, x, y, radius);
    g.arcTo(x, y, x + w, y, radius);
    g.closePath();
  }

  function openGame(id) {
    active = id;
    mode = "ready";
    running = false;
    score = 0;
    combo = 0;
    setHud();
    juice.particles = [];
    juice.floats = [];
    juice.banner = null;
    titleEl.textContent = META[id].title;
    tip.textContent = META[id].tip;
    helpEl.textContent = META[id].help;
    actionBtn.textContent = "开始冒险";
    stage.hidden = false;
    document.body.style.overflow = "hidden";
    stats.plays = (stats.plays || 0) + 1;
    saveStats();
    renderHallStats();
    Games[id].reset();
    drawFrame(0);
  }

  function closeGame() {
    running = false;
    mode = "idle";
    active = null;
    cancelAnimationFrame(raf);
    stage.hidden = true;
    document.body.style.overflow = "";
  }

  function startOrRetry() {
    if (!active) return;
    mode = "play";
    running = true;
    score = 0;
    combo = 0;
    setHud();
    tip.textContent = META[active].tip;
    actionBtn.textContent = "重新开始";
    juice.particles = [];
    juice.floats = [];
    juice.banner = null;
    Games[active].reset();
    lastTs = performance.now();
    loop();
  }

  function endGame(cleared) {
    running = false;
    mode = cleared ? "clear" : "over";
    punch(10);
    flashScreen(0.25);
    if (cleared) {
      tip.textContent = `通关成功！得分 ${Math.floor(score)} · 本局最高连击已记入大厅`;
      showBanner("通关！丫头会喜欢这一关", "#ffd84d");
      burst(W / 2, H / 2, "#ff7eb6", 28);
      burst(W / 2, H / 2, "#ffd84d", 18);
      stats[`clear_${active}`] = true;
      saveStats();
      renderHallStats();
    } else {
      tip.textContent = `差一点！得分 ${Math.floor(score)} · 再来会更稳`;
      showBanner("再试一次，小胖哥加油", "#ffb4c8");
    }
    actionBtn.textContent = "再玩一局";
    drawFrame(0);
  }

  function loop() {
    cancelAnimationFrame(raf);
    const step = (ts) => {
      if (!running || !active) return;
      const dt = Math.min(0.033, (ts - lastTs) / 1000 || 0.016);
      lastTs = ts;
      Games[active].update(dt);
      stepJuice(dt);
      drawFrame(dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function drawFrame() {
    ctx.save();
    if (juice.shake > 0) {
      ctx.translate((Math.random() - 0.5) * juice.shake, (Math.random() - 0.5) * juice.shake);
    }
    ctx.clearRect(-10, -10, W + 20, H + 20);
    if (active) Games[active].draw(ctx);
    drawJuice(ctx);
    if (mode === "ready") overlayTitle("准备好了吗？", "点「开始冒险」或按空格");
    if (mode === "clear") overlayTitle("通关！", `得分 ${Math.floor(score)}`);
    if (mode === "over") overlayTitle("再来一局", `得分 ${Math.floor(score)}`);
    ctx.restore();
  }

  function overlayTitle(main, sub) {
    ctx.fillStyle = "rgba(10,4,8,0.5)";
    ctx.fillRect(0, H / 2 - 70, W, 120);
    ctx.fillStyle = "#ffd84d";
    ctx.font = "bold 42px Songti SC, serif";
    ctx.textAlign = "center";
    ctx.fillText(main, W / 2, H / 2 - 8);
    ctx.fillStyle = "#ffe7f1";
    ctx.font = "18px sans-serif";
    ctx.fillText(sub, W / 2, H / 2 + 28);
  }

  // ========== STACK ==========
  const Stack = (() => {
    const TARGET = 10;
    const colors = ["#e85a95", "#ff9ec0", "#f0c894", "#ff7eb6", "#ffc2d8", "#f6a5c8"];
    let layers = [];
    let current = null;
    let crumbs = [];
    let dir = 1;
    let speed = 3.6;
    let bounce = 0;
    let guidePulse = 0;

    const makeLayer = (y, width, x) => ({
      x: x ?? (W - width) / 2,
      y,
      w: width,
      h: 38,
      color: colors[layers.length % colors.length],
      berry: false,
      land: 0,
    });

    const reset = () => {
      layers = [makeLayer(H - 78, 240)];
      current = makeLayer(H - 78 - 46, 240, 30);
      crumbs = [];
      dir = 1;
      speed = 3.6;
      bounce = 0;
      guidePulse = 0;
    };

    const drop = () => {
      if (!running || !current) return;
      const prev = layers[layers.length - 1];
      const left = Math.max(current.x, prev.x);
      const right = Math.min(current.x + current.w, prev.x + prev.w);
      const overlap = right - left;
      if (overlap < 26) {
        burst(current.x + current.w / 2, current.y, "#ffb4c8", 20);
        punch(14);
        blip(110, 0.18, "sawtooth", 0.06);
        endGame(false);
        return;
      }

      // falling overhang crumbs
      if (current.x < left) {
        crumbs.push({ x: current.x, y: current.y, w: left - current.x, vy: 0, life: 1, color: current.color });
      }
      if (current.x + current.w > right) {
        crumbs.push({
          x: right,
          y: current.y,
          w: current.x + current.w - right,
          vy: 0,
          life: 1,
          color: current.color,
        });
      }

      const ratio = overlap / prev.w;
      const trimmed = {
        ...current,
        x: left,
        w: overlap,
        y: prev.y - 42,
        land: 1,
        berry: ratio > 0.92,
      };
      layers.push(trimmed);
      bounce = 1;

      if (ratio > 0.92) {
        bumpCombo(2);
        addScore(180 + combo * 12, trimmed.x + trimmed.w / 2, trimmed.y, "完美 +草莓");
        tip.textContent = "完美对齐！奶油塔稳到发光";
        burst(trimmed.x + trimmed.w / 2, trimmed.y, "#ffd84d", 16);
        burst(trimmed.x + trimmed.w / 2, trimmed.y, "#ff7eb6", 10);
        punch(5);
        flashScreen(0.12);
        blip(760, 0.07, "square");
        blip(980, 0.09, "triangle", 0.035);
      } else if (ratio > 0.62) {
        bumpCombo(1);
        addScore(90 + combo * 6, trimmed.x + trimmed.w / 2, trimmed.y, "不错");
        tip.textContent = `第 ${layers.length - 1} 层落稳了 · 目标 ${TARGET} 层`;
        burst(trimmed.x + trimmed.w / 2, trimmed.y + 10, trimmed.color, 8);
        blip(520 + combo * 30, 0.05, "triangle");
      } else {
        resetCombo();
        setHud();
        addScore(40, trimmed.x + trimmed.w / 2, trimmed.y, "惊险");
        tip.textContent = "差一点就塌！对准中间再试";
        punch(8);
        blip(180, 0.08, "sawtooth");
      }

      if (layers.length - 1 >= TARGET) {
        endGame(true);
        return;
      }

      speed = Math.min(8.2, 3.6 + (layers.length - 1) * 0.35);
      current = makeLayer(trimmed.y - 46, trimmed.w, dir > 0 ? 24 : W - trimmed.w - 24);
    };

    const update = (dt) => {
      guidePulse += dt * 6;
      bounce = Math.max(0, bounce - dt * 4);
      if (current) {
        current.x += dir * speed * (dt * 60);
        if (current.x <= 24) dir = 1;
        if (current.x + current.w >= W - 24) dir = -1;
      }
      crumbs = crumbs.filter((c) => {
        c.vy += 18 * dt;
        c.y += c.vy;
        c.life -= dt * 1.3;
        return c.life > 0 && c.y < H + 40;
      });
      layers.forEach((layer) => {
        layer.land = Math.max(0, layer.land - dt * 3);
      });
    };

    const drawCakeLayer = (g, layer, yOffset = 0) => {
      const y = layer.y + yOffset + layer.land * -6;
      // side shadow
      g.fillStyle = "rgba(0,0,0,0.18)";
      roundRect(g, layer.x + 4, y + 6, layer.w, layer.h, 10);
      g.fill();
      g.fillStyle = layer.color;
      roundRect(g, layer.x, y, layer.w, layer.h, 10);
      g.fill();
      // cream swirl
      g.fillStyle = "rgba(255,255,255,0.55)";
      roundRect(g, layer.x + 10, y + 7, layer.w - 20, 11, 6);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(layer.x + 16, y + 22);
      g.quadraticCurveTo(layer.x + layer.w / 2, y + 30, layer.x + layer.w - 16, y + 22);
      g.stroke();
      g.fillStyle = "rgba(90,20,50,0.12)";
      g.fillRect(layer.x + 4, y + layer.h - 8, layer.w - 8, 5);
      if (layer.berry) {
        g.fillStyle = "#e11d48";
        g.beginPath();
        g.arc(layer.x + layer.w / 2, y - 2, 8, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#22c55e";
        g.fillRect(layer.x + layer.w / 2 - 1, y - 14, 3, 8);
        // sparkle
        g.fillStyle = "#ffd84d";
        g.beginPath();
        g.arc(layer.x + layer.w / 2 + 10, y - 8, 2, 0, Math.PI * 2);
        g.fill();
      }
    };

    const draw = (g) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#241028");
      grad.addColorStop(1, "#4a1840");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      drawStars(g, "rgba(255,200,220,0.4)");

      // plate
      g.fillStyle = "#fff6fa";
      g.beginPath();
      g.ellipse(W / 2, H - 42, 160, 18, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(0,0,0,0.15)";
      g.beginPath();
      g.ellipse(W / 2, H - 36, 130, 10, 0, 0, Math.PI * 2);
      g.fill();

      const yBounce = bounce * Math.sin(bounce * Math.PI) * 8;
      layers.forEach((layer) => drawCakeLayer(g, layer, yBounce));

      // ghost guide under moving piece
      if (current && layers.length) {
        const prev = layers[layers.length - 1];
        g.strokeStyle = `rgba(255,216,77,${0.25 + Math.sin(guidePulse) * 0.2})`;
        g.setLineDash([6, 6]);
        g.strokeRect(prev.x, current.y, prev.w, current.h);
        g.setLineDash([]);
        drawCakeLayer(g, current, 0);
        g.strokeStyle = "#ffd84d";
        g.lineWidth = 2;
        g.strokeRect(current.x - 1, current.y - 1, current.w + 2, current.h + 2);
      }

      crumbs.forEach((c) => {
        g.globalAlpha = Math.max(0, c.life);
        g.fillStyle = c.color;
        g.fillRect(c.x, c.y, c.w, 28);
      });
      g.globalAlpha = 1;

      g.fillStyle = "#ffd84d";
      g.font = "bold 16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`层数 ${Math.max(0, layers.length - 1)} / ${TARGET}`, 22, 30);
      g.fillText(`速度 ×${speed.toFixed(1)}`, 22, 52);
    };

    return { reset, update, draw, drop };
  })();

  // ========== CATCH (3 lanes) ==========
  const Catch = (() => {
    const LANES = [W * 0.22, W * 0.5, W * 0.78];
    const CITIES = ["天津", "北京", "上海", "南昌"];
    const BAD = ["加班", "堵车", "拖延"];
    let lane = 1;
    let displayX = LANES[1];
    let items = [];
    let spawn = 0;
    let lives = 3;
    let caught = 0;
    let fever = 0;
    let bob = 0;
    const GOAL = 14;

    const reset = () => {
      lane = 1;
      displayX = LANES[1];
      items = [];
      spawn = 0;
      lives = 3;
      caught = 0;
      fever = 0;
      bob = 0;
    };

    const spawnItem = () => {
      const good = Math.random() > 0.3;
      items.push({
        lane: Math.floor(Math.random() * 3),
        y: -40,
        vy: 220 + Math.random() * 90 + caught * 8,
        label: good ? CITIES[Math.floor(Math.random() * CITIES.length)] : BAD[Math.floor(Math.random() * BAD.length)],
        good,
        rot: Math.random() * 0.4 - 0.2,
        spin: (Math.random() - 0.5) * 2,
      });
    };

    const moveLane = (delta) => {
      lane = Math.max(0, Math.min(2, lane + delta));
    };

    const update = (dt) => {
      bob += dt * 8;
      fever = Math.max(0, fever - dt);
      spawn -= dt;
      if (spawn <= 0) {
        spawnItem();
        spawn = Math.max(0.38, 0.95 - caught * 0.025);
      }
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) {
        // handled on keydown for discrete lanes
      }
      displayX += (LANES[lane] - displayX) * Math.min(1, dt * 14);

      items.forEach((item) => {
        item.y += item.vy * dt;
        item.rot += item.spin * dt;
      });

      items = items.filter((item) => {
        const near = item.y > H - 150 && item.y < H - 70 && item.lane === lane;
        if (near) {
          if (item.good) {
            caught += 1;
            const multi = fever > 0 ? 2 : 1;
            bumpCombo(1);
            if (combo >= 5) fever = 3.2;
            addScore((70 + combo * 8) * multi, LANES[item.lane], item.y, multi > 1 ? "狂热×2" : `车票+`);
            tip.textContent =
              fever > 0
                ? `奔赴狂热中！(${caught}/${GOAL})`
                : `接到「${item.label}」· ${caught}/${GOAL}`;
            burst(LANES[item.lane], item.y, "#ffd84d", 12);
            blip(multi > 1 ? 920 : 640, 0.06, "square");
            if (caught >= GOAL) endGame(true);
          } else {
            lives -= 1;
            resetCombo();
            fever = 0;
            setHud();
            tip.textContent = `糟糕，撞上「${item.label}」`;
            punch(12);
            flashScreen(0.2);
            burst(LANES[item.lane], item.y, "#ff4d6d", 14);
            blip(140, 0.12, "sawtooth", 0.05);
            if (lives <= 0) endGame(false);
          }
          return false;
        }
        if (item.y > H + 20) {
          if (item.good) {
            lives -= 1;
            resetCombo();
            fever = 0;
            setHud();
            tip.textContent = "车票飞出站台了…";
            punch(6);
            if (lives <= 0) endGame(false);
          }
          return false;
        }
        return true;
      });
    };

    const draw = (g) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, fever > 0 ? "#3a2208" : "#0c1c2e");
      grad.addColorStop(0.55, fever > 0 ? "#5a2e08" : "#14324a");
      grad.addColorStop(1, fever > 0 ? "#8a4a10" : "#1a4058");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      drawStars(g, fever > 0 ? "rgba(255,216,77,0.45)" : "rgba(180,220,255,0.35)");

      // city skyline silhouette
      g.fillStyle = "rgba(0,0,0,0.28)";
      [40, 90, 150, 210, 280, 340, 420, 500, 580, 660, 740, 820].forEach((x, i) => {
        const h = 40 + ((i * 37) % 90);
        g.fillRect(x, H - 56 - h, 48, h);
      });

      // tracks
      LANES.forEach((x, index) => {
        g.fillStyle = index === lane ? "rgba(255,216,77,0.16)" : "rgba(255,255,255,0.05)";
        g.fillRect(x - 72, 0, 144, H);
        g.strokeStyle = "rgba(255,255,255,0.18)";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x - 72, 0);
        g.lineTo(x - 72, H);
        g.moveTo(x + 72, 0);
        g.lineTo(x + 72, H);
        g.stroke();
        // rails
        g.strokeStyle = "rgba(180,210,230,0.25)";
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x - 28, 0);
        g.lineTo(x - 28, H);
        g.moveTo(x + 28, 0);
        g.lineTo(x + 28, H);
        g.stroke();
        for (let y = (bob * 40) % 36; y < H; y += 36) {
          g.fillStyle = "rgba(180,210,230,0.2)";
          g.fillRect(x - 34, y, 68, 5);
        }
      });

      // platform
      g.fillStyle = "#2f556f";
      g.fillRect(0, H - 58, W, 58);
      g.fillStyle = "#3f6f8c";
      g.fillRect(0, H - 58, W, 10);
      g.fillStyle = "#ffd84d";
      g.fillRect(0, H - 50, W, 3);

      // player — chubby traveler
      const px = displayX;
      const py = H - 118 + Math.sin(bob) * 3;
      g.save();
      g.translate(px, py);
      // body
      g.fillStyle = fever > 0 ? "#ffd84d" : "#ffb703";
      roundRect(g, -34, 18, 68, 52, 20);
      g.fill();
      // backpack
      g.fillStyle = "#e85a95";
      roundRect(g, 22, 24, 18, 34, 6);
      g.fill();
      // head
      g.fillStyle = "#f6c7a1";
      g.beginPath();
      g.arc(0, 8, 22, 0, Math.PI * 2);
      g.fill();
      // hair
      g.fillStyle = "#3b2218";
      g.beginPath();
      g.ellipse(0, -6, 20, 12, 0, Math.PI, 0);
      g.fill();
      // eyes
      g.fillStyle = "#2a1200";
      g.beginPath();
      g.arc(-7, 8, 2.8, 0, Math.PI * 2);
      g.arc(7, 8, 2.8, 0, Math.PI * 2);
      g.fill();
      // blush
      g.fillStyle = "rgba(255,120,150,0.45)";
      g.beginPath();
      g.ellipse(-12, 14, 5, 3, 0, 0, Math.PI * 2);
      g.ellipse(12, 14, 5, 3, 0, 0, Math.PI * 2);
      g.fill();
      // smile
      g.strokeStyle = "#2a1200";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, 12, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
      // arms
      g.fillStyle = fever > 0 ? "#ffd84d" : "#ffb703";
      roundRect(g, -48, 28, 16, 28, 8);
      g.fill();
      roundRect(g, 32, 28, 16, 28, 8);
      g.fill();
      g.fillStyle = "#fff";
      g.font = "bold 12px sans-serif";
      g.textAlign = "center";
      g.fillText("小胖哥", 0, 88);
      g.restore();

      items.forEach((item) => {
        const x = LANES[item.lane];
        g.save();
        g.translate(x, item.y);
        g.rotate(item.rot);
        if (item.good) {
          // ticket card
          g.fillStyle = "#fff8ef";
          roundRect(g, -54, -26, 108, 52, 10);
          g.fill();
          g.strokeStyle = "#ff6a00";
          g.lineWidth = 3;
          g.stroke();
          g.fillStyle = "#ff6a00";
          g.fillRect(-54, -26, 108, 14);
          g.fillStyle = "#fff";
          g.font = "bold 11px sans-serif";
          g.textAlign = "center";
          g.fillText("高铁票 · 奔赴", 0, -15);
          g.fillStyle = "#2a1200";
          g.font = "bold 20px Songti SC, serif";
          g.fillText(item.label, 0, 12);
          g.fillStyle = "#8a4b1c";
          g.font = "10px monospace";
          g.fillText("→ 丫头", 0, 26);
        } else {
          // hazard sign
          g.fillStyle = "#ff4d6d";
          roundRect(g, -46, -24, 92, 48, 10);
          g.fill();
          g.strokeStyle = "#fff";
          g.lineWidth = 3;
          g.stroke();
          g.fillStyle = "#fff";
          g.font = "bold 18px Songti SC, serif";
          g.textAlign = "center";
          g.fillText(item.label, 0, 6);
          g.font = "11px sans-serif";
          g.fillText("躲开！", 0, 22);
        }
        g.restore();
      });

      g.fillStyle = "#ffd84d";
      g.font = "bold 16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`命 ${"♥".repeat(lives)}${"♡".repeat(3 - lives)}`, 20, 30);
      g.fillText(`车票 ${caught}/${GOAL}`, 20, 54);
      if (fever > 0) {
        g.fillStyle = "#ff9f1c";
        g.font = "bold 18px Songti SC, serif";
        g.fillText(`✦ 奔赴狂热 ${fever.toFixed(1)}s`, 20, 80);
      }
    };

    const pointerToLane = (x) => {
      let best = 0;
      let dist = Infinity;
      LANES.forEach((laneX, index) => {
        const d = Math.abs(laneX - x);
        if (d < dist) {
          dist = d;
          best = index;
        }
      });
      lane = best;
    };

    return { reset, update, draw, moveLane, pointerToLane };
  })();

  // ========== BLOW (charge wind) ==========
  const Blow = (() => {
    let candles = [];
    let timeLeft = 16;
    let charge = 0;
    let charging = false;
    let gusts = [];
    let smoke = [];

    const reset = () => {
      candles = Array.from({ length: 5 }, (_, index) => ({
        x: 150 + index * 150,
        y: H * 0.58,
        lit: true,
        stubborn: index === 1 || index === 3,
        lean: 0,
        reignite: 0,
        wobble: Math.random() * 10,
      }));
      timeLeft = 16;
      charge = 0;
      charging = false;
      gusts = [];
      smoke = [];
    };

    const setCharging = (on) => {
      charging = on && running;
      if (!on && charge > 0.12 && running) release();
    };

    const release = () => {
      const power = charge;
      charge = 0;
      charging = false;
      punch(4 + power * 10);
      gusts.push({ life: 0.55, power, x: W / 2, y: H - 40 });
      flashScreen(0.08 + power * 0.15);
      blip(220 + power * 400, 0.12, "sine", 0.05);

      let blown = 0;
      candles.forEach((c, index) => {
        if (!c.lit) return;
        const need = c.stubborn ? 0.55 : 0.28;
        // stronger blow reaches more candles / stubborn ones
        const reach = power > 0.75 ? true : Math.abs(index - 2) <= (power > 0.45 ? 2 : 1);
        if (reach && power >= need) {
          c.lit = false;
          blown += 1;
          bumpCombo(1);
          addScore(100 + Math.floor(power * 80) + combo * 10, c.x, c.y - 90, c.stubborn ? "顽固灭了" : "呼—");
          burst(c.x, c.y - 90, "#9ca3af", 10);
          burst(c.x, c.y - 90, "#ffd84d", 6);
          for (let i = 0; i < 6; i += 1) {
            smoke.push({
              x: c.x + (Math.random() - 0.5) * 10,
              y: c.y - 90,
              vy: -20 - Math.random() * 20,
              life: 0.8,
            });
          }
        } else if (reach) {
          c.lean = 0.9;
          tip.textContent = c.stubborn ? "这根比较顽固，再蓄久一点" : "风不够大，再蓄力！";
        }
      });

      if (blown > 0) tip.textContent = blown > 1 ? `一口气吹灭 ${blown} 根！` : "吹灭了一根";
      if (candles.every((c) => !c.lit)) endGame(true);
    };

    const update = (dt) => {
      timeLeft -= dt;
      if (charging) charge = Math.min(1, charge + dt * 0.85);
      candles.forEach((c) => {
        c.wobble += dt * 7;
        c.lean = Math.max(0, c.lean - dt * 1.8);
        // rare reignite tease when almost done? skip for fairness
      });
      gusts = gusts.filter((g) => {
        g.life -= dt;
        return g.life > 0;
      });
      smoke = smoke.filter((s) => {
        s.y += s.vy * dt;
        s.life -= dt;
        return s.life > 0;
      });
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame(candles.every((c) => !c.lit));
      }
    };

    const draw = (g) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#120814");
      grad.addColorStop(1, "#3a1632");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      drawStars(g);

      // table
      g.fillStyle = "#4a2a20";
      g.fillRect(0, H * 0.78, W, H * 0.22);
      g.fillStyle = "#6b3d2e";
      g.fillRect(0, H * 0.78, W, 14);

      // cake body
      g.fillStyle = "#f3d2a8";
      roundRect(g, 120, H * 0.6, W - 240, 110, 20);
      g.fill();
      g.fillStyle = "#ff9ec0";
      roundRect(g, 170, H * 0.5, W - 340, 90, 18);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.55)";
      roundRect(g, 190, H * 0.53, W - 380, 18, 9);
      g.fill();
      // strawberries on cake
      for (let i = 0; i < 5; i += 1) {
        const sx = 220 + i * 110;
        g.fillStyle = "#e11d48";
        g.beginPath();
        g.arc(sx, H * 0.52, 8, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#22c55e";
        g.fillRect(sx - 1, H * 0.52 - 14, 3, 7);
      }

      candles.forEach((c, index) => {
        const lean = Math.sin(c.wobble) * 2 + c.lean * 10;
        g.save();
        g.translate(c.x + lean, 0);
        // candle body
        const body = g.createLinearGradient(-10, c.y - 90, 10, c.y);
        body.addColorStop(0, "#fffaf5");
        body.addColorStop(1, c.stubborn ? "#e9d5ff" : "#d8f5f3");
        g.fillStyle = body;
        roundRect(g, -10, c.y - 90, 20, 96, 6);
        g.fill();
        g.fillStyle = c.stubborn ? "#a855f7" : "#2dd4bf";
        g.fillRect(-10, c.y - 52, 20, 8);
        // wick
        g.strokeStyle = "#444";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(0, c.y - 90);
        g.lineTo(0, c.y - 102);
        g.stroke();
        if (c.lit) {
          const flicker = Math.sin(c.wobble * 1.7) * 3;
          // glow
          g.fillStyle = "rgba(255,180,40,0.25)";
          g.beginPath();
          g.arc(flicker * 0.2, c.y - 118, 22, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#ffd84d";
          g.beginPath();
          g.moveTo(0, c.y - 102);
          g.quadraticCurveTo(12 + flicker, c.y - 122, 0, c.y - 138);
          g.quadraticCurveTo(-12 - flicker, c.y - 122, 0, c.y - 102);
          g.fill();
          g.fillStyle = "#ff6a00";
          g.beginPath();
          g.moveTo(0, c.y - 104);
          g.quadraticCurveTo(6, c.y - 116, 0, c.y - 126);
          g.quadraticCurveTo(-6, c.y - 116, 0, c.y - 104);
          g.fill();
          if (c.stubborn) {
            g.fillStyle = "#e9d5ff";
            g.font = "bold 11px sans-serif";
            g.textAlign = "center";
            g.fillText("顽固", 0, c.y - 148);
          }
        }
        g.restore();
        g.fillStyle = "#ffd84d";
        g.font = "12px monospace";
        g.textAlign = "center";
        g.fillText(String(index + 1), c.x, c.y + 28);
      });

      smoke.forEach((s) => {
        g.globalAlpha = Math.max(0, s.life);
        g.fillStyle = "#9ca3af";
        g.beginPath();
        g.arc(s.x, s.y, 8 + (1 - s.life) * 6, 0, Math.PI * 2);
        g.fill();
      });
      g.globalAlpha = 1;

      gusts.forEach((gust) => {
        g.strokeStyle = `rgba(141,229,225,${gust.life})`;
        g.lineWidth = 3 + gust.power * 8;
        g.beginPath();
        g.ellipse(W / 2, H - 30, 80 + (1 - gust.life) * 200, 30 + gust.power * 40, 0, Math.PI, 0);
        g.stroke();
      });

      // charge meter
      g.fillStyle = "rgba(0,0,0,0.35)";
      roundRect(g, W / 2 - 130, H - 42, 260, 24, 12);
      g.fill();
      g.fillStyle = charge > 0.55 ? "#c084fc" : "#8de5e1";
      roundRect(g, W / 2 - 126, H - 38, 252 * charge, 16, 8);
      g.fill();
      g.fillStyle = "#ffd84d";
      g.font = "bold 13px sans-serif";
      g.textAlign = "center";
      g.fillText(charge > 0.55 ? "大力吹！" : "蓄力条", W / 2, H - 26);

      g.fillStyle = "#ffd84d";
      g.font = "bold 16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`倒计时 ${timeLeft.toFixed(1)}s`, 20, 30);
      g.fillText(charging ? "蓄力中…" : "按住蓄力，松手吹气", 20, 54);
    };

    return { reset, update, draw, setCharging };
  })();

  const Games = { stack: Stack, catch: Catch, blow: Blow };

  function canvasPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  document.querySelectorAll("[data-game]").forEach((card) => {
    card.addEventListener("click", () => openGame(card.dataset.game));
  });
  actionBtn.addEventListener("click", startOrRetry);
  backBtn.addEventListener("click", closeGame);

  canvas.addEventListener("pointerdown", (event) => {
    const { x, y } = canvasPos(event);
    pointerDown = true;
    pointerX = x;
    pointerY = y;
    if (mode === "ready" || mode === "over" || mode === "clear") {
      startOrRetry();
      return;
    }
    if (!running) return;
    if (active === "stack") Stack.drop();
    if (active === "catch") Catch.pointerToLane(x);
    if (active === "blow") Blow.setCharging(true);
  });

  canvas.addEventListener("pointermove", (event) => {
    const { x, y } = canvasPos(event);
    pointerX = x;
    pointerY = y;
    if (active === "catch" && (running || mode === "play")) Catch.pointerToLane(x);
  });

  canvas.addEventListener("pointerup", () => {
    pointerDown = false;
    if (active === "blow" && running) Blow.setCharging(false);
  });
  canvas.addEventListener("pointerleave", () => {
    if (active === "blow" && running && pointerDown) Blow.setCharging(false);
    pointerDown = false;
  });

  window.addEventListener("keydown", (event) => {
    if (stage.hidden) return;
    if (!keys.has(event.key)) {
      if (active === "catch" && running) {
        if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") Catch.moveLane(-1);
        if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") Catch.moveLane(1);
      }
    }
    keys.add(event.key);
    if (event.key === "Escape") {
      closeGame();
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      if (mode === "ready" || mode === "over" || mode === "clear") startOrRetry();
      else if (active === "stack" && running) Stack.drop();
      else if (active === "blow" && running) Blow.setCharging(true);
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key);
    if (event.code === "Space" && active === "blow" && running) Blow.setCharging(false);
  });

  // Update hall card copy to match new mechanics
  const stackCard = document.querySelector('[data-game="stack"] em');
  const catchCard = document.querySelector('[data-game="catch"] em');
  const blowCard = document.querySelector('[data-game="blow"] em');
  if (stackCard) stackCard.textContent = "完美对齐掉草莓，切歪就塌塔，越叠越刺激";
  if (catchCard) catchCard.textContent = "三车道接车票，连击触发奔赴狂热翻倍分";
  if (blowCard) blowCard.textContent = "按住蓄力松手吹气，顽固蜡烛要吹更久";

  renderHallStats();
})();
