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
      title: "520·DIY 奶油千层",
      tip: "还原那天一起做的蛋糕：每一层都是真实配方，叠稳才写进回忆。",
      help: "点击 / 空格落层 · 完美对齐会记下那一层的故事",
    },
    catch: {
      title: "异地车票接接乐",
      tip: "接车票奔赴丫头。连击狂热翻倍；台风天风雨交加，车票会被吹歪！",
      help: "←→ / A D / 鼠标换道 · 躲开加班堵车拖延台风 · 风雨里稳住",
    },
    hug: {
      title: "冬夜好冷·抱抱取暖",
      tip: "按住画布不放来抱抱！约 1 秒后寒潮来袭，把寒意压下去就记一次「好暖」。",
      help: "按住画布或空格拥抱 · 松手恢复体力 · 寒潮时抱紧才得分",
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
    const cleared = ["stack", "catch", "hug"].filter((id) => stats[`clear_${id}`] || (id === "hug" && stats.clear_blow)).length;
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
    const game = Games[id] || (id === "blow" ? Games.hug : null);
    if (!game) return;
    active = game === Games.hug ? "hug" : id;
    mode = "ready";
    running = false;
    score = 0;
    combo = 0;
    setHud();
    juice.particles = [];
    juice.floats = [];
    juice.banner = null;
    const meta = META[active] || META.hug;
    titleEl.textContent = meta.title;
    tip.textContent = meta.tip;
    helpEl.textContent = meta.help;
    actionBtn.textContent = "开始冒险";
    stage.hidden = false;
    document.body.style.overflow = "hidden";
    stats.plays = (stats.plays || 0) + 1;
    saveStats();
    renderHallStats();
    Games[active].reset();
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

  // ========== STACK (520 DIY recipe) ==========
  const Stack = (() => {
    const RECIPE = [
      { name: "一层笨拙", note: "手有点抖，笑容却很真", color: "#e85a95" },
      { name: "一层认真", note: "你盯着裱花袋，像在完成一件大事", color: "#ff9ec0" },
      { name: "好多喜欢", note: "世界上独一份的配方", color: "#f0c894" },
      { name: "520 糖霜", note: "第一次一起过的节日味道", color: "#ff7eb6" },
      { name: "DIY 奶油", note: "不够标准，却刚刚好", color: "#ffc2d8" },
      { name: "咖啡馆余温", note: "从冬夜聊到深夜的那种甜", color: "#f6a5c8" },
      { name: "丫头的微笑", note: "比任何裱花都好看", color: "#ff8fb8" },
      { name: "小胖哥的傻气", note: "愿意一直逗你笑", color: "#ffb4c8" },
      { name: "紧紧抱住", note: "从那句「好冷」开始延伸", color: "#e85a95" },
      { name: "永远爱你", note: "这只蛋糕，只为丫头", color: "#ff6a88" },
    ];
    const TARGET = RECIPE.length;
    let layers = [];
    let current = null;
    let crumbs = [];
    let dir = 1;
    let speed = 3.6;
    let bounce = 0;
    let guidePulse = 0;

    const makeLayer = (y, width, x, index = 0) => {
      const recipe = RECIPE[Math.min(index, RECIPE.length - 1)];
      return {
        x: x ?? (W - width) / 2,
        y,
        w: width,
        h: 38,
        color: recipe.color,
        name: recipe.name,
        note: recipe.note,
        berry: false,
        land: 0,
      };
    };

    const reset = () => {
      layers = [makeLayer(H - 78, 240, undefined, 0)];
      layers[0].name = "烤盘底";
      layers[0].note = "DIY 蛋糕店的起点";
      current = makeLayer(H - 78 - 46, 240, 30, 0);
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
        tip.textContent = "配方塌了…再一起做一次吧";
        endGame(false);
        return;
      }

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

      const recipeIndex = layers.length - 1;
      const recipe = RECIPE[Math.min(recipeIndex, RECIPE.length - 1)];
      const ratio = overlap / prev.w;
      const trimmed = {
        ...current,
        x: left,
        w: overlap,
        y: prev.y - 42,
        land: 1,
        berry: ratio > 0.92,
        name: recipe.name,
        note: recipe.note,
        color: recipe.color,
      };
      layers.push(trimmed);
      bounce = 1;

      if (ratio > 0.92) {
        bumpCombo(2);
        addScore(180 + combo * 12, trimmed.x + trimmed.w / 2, trimmed.y, recipe.name);
        tip.textContent = `完美！记下「${recipe.name}」——${recipe.note}`;
        burst(trimmed.x + trimmed.w / 2, trimmed.y, "#ffd84d", 16);
        burst(trimmed.x + trimmed.w / 2, trimmed.y, "#ff7eb6", 10);
        punch(5);
        flashScreen(0.12);
        blip(760, 0.07, "square");
        blip(980, 0.09, "triangle", 0.035);
        showBanner(recipe.name, "#ffd84d");
      } else if (ratio > 0.62) {
        bumpCombo(1);
        addScore(90 + combo * 6, trimmed.x + trimmed.w / 2, trimmed.y, recipe.name);
        tip.textContent = `第 ${layers.length - 1} 层「${recipe.name}」落稳了`;
        burst(trimmed.x + trimmed.w / 2, trimmed.y + 10, trimmed.color, 8);
        blip(520 + combo * 30, 0.05, "triangle");
      } else {
        resetCombo();
        setHud();
        addScore(40, trimmed.x + trimmed.w / 2, trimmed.y, "惊险");
        tip.textContent = `「${recipe.name}」差点塌掉，对准中间再试`;
        punch(8);
        blip(180, 0.08, "sawtooth");
      }

      if (layers.length - 1 >= TARGET) {
        tip.textContent = "独一份配方完成！只为丫头的 520";
        endGame(true);
        return;
      }

      speed = Math.min(8.2, 3.6 + (layers.length - 1) * 0.35);
      const nextIdx = layers.length - 1;
      current = makeLayer(trimmed.y - 46, trimmed.w, dir > 0 ? 24 : W - trimmed.w - 24, nextIdx);
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
      g.fillStyle = "rgba(0,0,0,0.18)";
      roundRect(g, layer.x + 4, y + 6, layer.w, layer.h, 10);
      g.fill();
      g.fillStyle = layer.color;
      roundRect(g, layer.x, y, layer.w, layer.h, 10);
      g.fill();
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
      if (layer.name && layer.w > 90) {
        g.fillStyle = "rgba(90,20,50,0.75)";
        g.font = "bold 11px Songti SC, serif";
        g.textAlign = "center";
        g.fillText(layer.name, layer.x + layer.w / 2, y + 24);
      }
      if (layer.berry) {
        g.fillStyle = "#e11d48";
        g.beginPath();
        g.arc(layer.x + layer.w / 2, y - 2, 8, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#22c55e";
        g.fillRect(layer.x + layer.w / 2 - 1, y - 14, 3, 8);
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

      // DIY shop cue
      g.fillStyle = "rgba(255,216,77,0.12)";
      roundRect(g, W / 2 - 150, 12, 300, 36, 12);
      g.fill();
      g.fillStyle = "#ffd84d";
      g.font = "bold 14px Songti SC, serif";
      g.textAlign = "center";
      g.fillText("520 · DIY 蛋糕店 · 独一份配方", W / 2, 36);

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
        g.fillStyle = "#ffe7f1";
        g.font = "12px sans-serif";
        g.textAlign = "center";
        g.fillText(current.name || "", current.x + current.w / 2, current.y - 10);
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
      g.fillText(`配方 ${Math.max(0, layers.length - 1)} / ${TARGET}`, 22, 70);
      g.fillText(`速度 ×${speed.toFixed(1)}`, 22, 92);
    };

    return { reset, update, draw, drop };
  })();

  // ========== CATCH (3 lanes + weather) ==========
  const Catch = (() => {
    const LANES = [W * 0.22, W * 0.5, W * 0.78];
    const CITIES = ["天津", "北京", "上海", "南昌"];
    const BAD = ["加班", "堵车", "拖延", "晚点", "停运"];
    const GOAL = 14;
    let lane = 1;
    let displayX = LANES[1];
    let items = [];
    let spawn = 0;
    let lives = 3;
    let caught = 0;
    let fever = 0;
    let bob = 0;
    // weather: 0 clear, 1 rain, 2 typhoon
    let weather = 0;
    let weatherTimer = 0;
    let weatherDur = 0;
    let windDir = 1;
    let rain = [];
    let gusts = [];
    let flashSky = 0;
    let umbrella = 0;

    const reset = () => {
      lane = 1;
      displayX = LANES[1];
      items = [];
      spawn = 0;
      lives = 3;
      caught = 0;
      fever = 0;
      bob = 0;
      weather = 0;
      weatherTimer = 2.2 + Math.random() * 1.2;
      weatherDur = 0;
      windDir = Math.random() > 0.5 ? 1 : -1;
      flashSky = 0;
      umbrella = 0;
      rain = Array.from({ length: 70 }, () => makeDrop());
      gusts = [];
    };

    const makeDrop = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 8 + Math.random() * 14,
      vy: 380 + Math.random() * 220,
      vx: -40 + Math.random() * 20,
    });

    const setWeather = (next) => {
      weather = next;
      weatherDur = next === 0 ? 0 : next === 1 ? 5.5 + Math.random() * 2 : 6.5 + Math.random() * 2.5;
      weatherTimer = next === 0 ? 3.5 + Math.random() * 2.5 : 0;
      windDir = Math.random() > 0.5 ? 1 : -1;
      if (next === 1) {
        tip.textContent = "起风下雨了…车票有点飘，小心接稳";
        showBanner("小雨 · 风雨兼程", "#8ec5ff");
        blip(300, 0.08, "sine", 0.03);
      } else if (next === 2) {
        tip.textContent = "台风来了！车票会被吹歪，躲开「台风」警报";
        showBanner("台风天 · 仍要奔赴", "#ff9f1c");
        punch(8);
        flashSky = 0.55;
        flashScreen(0.18);
        blip(120, 0.15, "sawtooth", 0.05);
        for (let i = 0; i < 4; i += 1) {
          gusts.push({ y: 40 + Math.random() * (H - 80), life: 0.8 + Math.random() * 0.6, dir: windDir });
        }
      } else {
        tip.textContent = "天晴了，继续接车票去见丫头";
        showBanner("天晴 · 路更稳", "#ffd84d");
      }
    };

    const spawnItem = () => {
      let kind = "ticket";
      const roll = Math.random();
      if (weather === 2 && roll < 0.18) kind = "typhoon";
      else if (roll < 0.28) kind = "bad";
      else if (weather >= 1 && roll < 0.36) kind = "bad";

      if (kind === "ticket") {
        items.push({
          type: "ticket",
          lane: Math.floor(Math.random() * 3),
          y: -40,
          vy: 210 + Math.random() * 90 + caught * 8 + (weather === 2 ? 60 : weather === 1 ? 25 : 0),
          label: CITIES[Math.floor(Math.random() * CITIES.length)],
          good: true,
          rot: Math.random() * 0.4 - 0.2,
          spin: (Math.random() - 0.5) * 2,
          drift: 0,
        });
      } else if (kind === "typhoon") {
        items.push({
          type: "typhoon",
          lane: Math.floor(Math.random() * 3),
          y: -50,
          vy: 160 + Math.random() * 40,
          label: "台风",
          good: false,
          rot: 0,
          spin: 4,
          drift: 0,
        });
      } else {
        items.push({
          type: "bad",
          lane: Math.floor(Math.random() * 3),
          y: -40,
          vy: 230 + Math.random() * 80 + caught * 6,
          label: BAD[Math.floor(Math.random() * BAD.length)],
          good: false,
          rot: Math.random() * 0.3 - 0.15,
          spin: (Math.random() - 0.5) * 2,
          drift: 0,
        });
      }
    };

    const moveLane = (delta) => {
      lane = Math.max(0, Math.min(2, lane + delta));
    };

    const hitHazard = (item) => {
      lives -= 1;
      resetCombo();
      fever = 0;
      setHud();
      tip.textContent = item.type === "typhoon" ? "被台风卷走了…抓紧栏杆！" : `糟糕，撞上「${item.label}」`;
      punch(item.type === "typhoon" ? 16 : 12);
      flashScreen(0.22);
      burst(LANES[item.lane], item.y, "#ff4d6d", 14);
      blip(140, 0.12, "sawtooth", 0.05);
      if (item.type === "typhoon") {
        weather = 2;
        weatherDur = Math.max(weatherDur, 3);
        flashSky = 0.4;
      }
      if (lives <= 0) endGame(false);
    };

    const update = (dt) => {
      bob += dt * 8;
      fever = Math.max(0, fever - dt);
      flashSky = Math.max(0, flashSky - dt * 1.4);
      umbrella = Math.max(0, umbrella - dt);

      if (weather > 0) {
        weatherDur -= dt;
        if (weatherDur <= 0) setWeather(weather === 2 ? 1 : 0);
      } else {
        weatherTimer -= dt;
        if (weatherTimer <= 0) setWeather(Math.random() > 0.45 ? 2 : 1);
      }

      // rain / wind particles
      const wind = weather === 2 ? windDir * 220 : weather === 1 ? windDir * 70 : 0;
      rain.forEach((d) => {
        d.vy = weather === 2 ? 560 + Math.random() * 80 : weather === 1 ? 420 : 200;
        d.vx = wind * 0.35 + (weather === 2 ? windDir * 80 : weather === 1 ? windDir * 25 : -10);
        d.y += d.vy * dt;
        d.x += d.vx * dt;
        if (d.y > H + 20) {
          d.y = -20;
          d.x = Math.random() * W;
        }
        if (d.x < -30) d.x = W + 20;
        if (d.x > W + 30) d.x = -20;
      });
      gusts = gusts.filter((g) => {
        g.life -= dt;
        g.y += Math.sin(bob + g.y) * 10 * dt;
        return g.life > 0;
      });
      if (weather === 2 && Math.random() < dt * 1.2) {
        gusts.push({ y: 30 + Math.random() * (H - 60), life: 0.5 + Math.random() * 0.5, dir: windDir });
        if (Math.random() < 0.25) flashSky = Math.max(flashSky, 0.35);
      }

      spawn -= dt;
      if (spawn <= 0) {
        spawnItem();
        const base = weather === 2 ? 0.55 : weather === 1 ? 0.72 : 0.95;
        spawn = Math.max(0.32, base - caught * 0.025);
      }
      displayX += (LANES[lane] - displayX) * Math.min(1, dt * 14);

      items.forEach((item) => {
        item.y += item.vy * dt;
        item.rot += item.spin * dt;
        // wind blows tickets across lanes gradually
        if (weather >= 1 && item.good) {
          item.drift += windDir * (weather === 2 ? 55 : 22) * dt;
          if (Math.abs(item.drift) > 55) {
            const next = Math.max(0, Math.min(2, item.lane + (item.drift > 0 ? 1 : -1)));
            if (next !== item.lane) {
              item.lane = next;
              item.drift = 0;
              floatText(LANES[item.lane], item.y, "被风吹偏", "#8ec5ff");
            } else {
              item.drift = Math.sign(item.drift) * 40;
            }
          }
        }
        if (item.type === "typhoon") {
          item.spin = 5;
          // slowly chase player lane
          if (Math.random() < dt * 1.5) {
            item.lane = Math.max(0, Math.min(2, item.lane + (lane > item.lane ? 1 : lane < item.lane ? -1 : 0)));
          }
        }
      });

      items = items.filter((item) => {
        const near = item.y > H - 150 && item.y < H - 70 && item.lane === lane;
        if (near) {
          if (item.good) {
            caught += 1;
            const multi = fever > 0 ? 2 : 1;
            const stormBonus = weather === 2 ? 40 : weather === 1 ? 15 : 0;
            bumpCombo(1);
            if (combo >= 5) fever = 3.2;
            addScore((70 + combo * 8 + stormBonus) * multi, LANES[item.lane], item.y, weather === 2 ? "风雨奔赴+" : multi > 1 ? "狂热×2" : "车票+");
            tip.textContent =
              fever > 0
                ? `奔赴狂热中！(${caught}/${GOAL})`
                : weather === 2
                  ? `台风里仍接到「${item.label}」· ${caught}/${GOAL}`
                  : `接到「${item.label}」· ${caught}/${GOAL}`;
            burst(LANES[item.lane], item.y, "#ffd84d", 12);
            blip(multi > 1 ? 920 : 640, 0.06, "square");
            umbrella = 0.8;
            if (caught >= GOAL) endGame(true);
          } else {
            hitHazard(item);
          }
          return false;
        }
        if (item.y > H + 20) {
          if (item.good) {
            lives -= 1;
            resetCombo();
            fever = 0;
            setHud();
            tip.textContent = weather >= 1 ? "车票被风雨卷走了…" : "车票飞出站台了…";
            punch(6);
            if (lives <= 0) endGame(false);
          }
          return false;
        }
        return true;
      });
    };

    const draw = (g) => {
      const storm = weather === 2;
      const rainy = weather >= 1;
      const grad = g.createLinearGradient(0, 0, 0, H);
      if (fever > 0 && !storm) {
        grad.addColorStop(0, "#3a2208");
        grad.addColorStop(0.55, "#5a2e08");
        grad.addColorStop(1, "#8a4a10");
      } else if (storm) {
        grad.addColorStop(0, "#0a1220");
        grad.addColorStop(0.5, "#1a2840");
        grad.addColorStop(1, "#24344a");
      } else if (rainy) {
        grad.addColorStop(0, "#0c1828");
        grad.addColorStop(1, "#1a3550");
      } else {
        grad.addColorStop(0, "#0c1c2e");
        grad.addColorStop(0.55, "#14324a");
        grad.addColorStop(1, "#1a4058");
      }
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      if (!rainy) drawStars(g, fever > 0 ? "rgba(255,216,77,0.45)" : "rgba(180,220,255,0.35)");

      // heavy clouds
      if (rainy) {
        g.fillStyle = storm ? "rgba(20,28,40,0.7)" : "rgba(40,55,75,0.45)";
        for (let i = 0; i < 6; i += 1) {
          const cx = ((i * 170 + bob * (storm ? 90 : 40) * windDir) % (W + 200)) - 100;
          g.beginPath();
          g.ellipse(cx, 36 + (i % 3) * 10, 90, 28, 0, 0, Math.PI * 2);
          g.ellipse(cx + 40, 28, 70, 24, 0, 0, Math.PI * 2);
          g.fill();
        }
      }

      // city skyline
      g.fillStyle = "rgba(0,0,0,0.32)";
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
      if (rainy) {
        g.fillStyle = "rgba(140,200,255,0.2)";
        g.fillRect(0, H - 48, W, 8);
      }

      // player
      const px = displayX;
      const py = H - 118 + Math.sin(bob) * 3 + (storm ? Math.sin(bob * 12) * 2 : 0);
      g.save();
      g.translate(px, py);
      g.fillStyle = fever > 0 ? "#ffd84d" : "#ffb703";
      roundRect(g, -34, 18, 68, 52, 20);
      g.fill();
      g.fillStyle = "#e85a95";
      roundRect(g, 22, 24, 18, 34, 6);
      g.fill();
      g.fillStyle = "#f6c7a1";
      g.beginPath();
      g.arc(0, 8, 22, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#3b2218";
      g.beginPath();
      g.ellipse(0, -6, 20, 12, 0, Math.PI, 0);
      g.fill();
      g.fillStyle = "#2a1200";
      g.beginPath();
      g.arc(-7, 8, 2.8, 0, Math.PI * 2);
      g.arc(7, 8, 2.8, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,120,150,0.45)";
      g.beginPath();
      g.ellipse(-12, 14, 5, 3, 0, 0, Math.PI * 2);
      g.ellipse(12, 14, 5, 3, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#2a1200";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, 12, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
      g.fillStyle = fever > 0 ? "#ffd84d" : "#ffb703";
      roundRect(g, -48, 28, 16, 28, 8);
      g.fill();
      roundRect(g, 32, 28, 16, 28, 8);
      g.fill();
      // umbrella in rain
      if (rainy) {
        g.fillStyle = "#e85a95";
        g.beginPath();
        g.ellipse(-8, -18, 34, 14, -0.2 * windDir, Math.PI, 0);
        g.fill();
        g.strokeStyle = "#5d1738";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(-8, -18);
        g.lineTo(-8, 20);
        g.stroke();
      }
      g.fillStyle = "#fff";
      g.font = "bold 12px sans-serif";
      g.textAlign = "center";
      g.fillText("小胖哥", 0, 88);
      g.restore();

      items.forEach((item) => {
        const x = LANES[item.lane] + (item.drift || 0) * 0.4;
        g.save();
        g.translate(x, item.y);
        g.rotate(item.rot);
        if (item.type === "typhoon") {
          g.strokeStyle = "rgba(255,180,80,0.85)";
          g.lineWidth = 3;
          for (let r = 10; r <= 36; r += 8) {
            g.beginPath();
            g.arc(0, 0, r, bob * 3, bob * 3 + Math.PI * 1.4);
            g.stroke();
          }
          g.fillStyle = "#ff9f1c";
          g.font = "bold 18px Songti SC, serif";
          g.textAlign = "center";
          g.fillText("台风", 0, 6);
          g.fillStyle = "#fff";
          g.font = "11px sans-serif";
          g.fillText("躲开！", 0, 24);
        } else if (item.good) {
          g.fillStyle = "#fff8ef";
          roundRect(g, -54, -26, 108, 52, 10);
          g.fill();
          g.strokeStyle = weather === 2 ? "#3aa0ff" : "#ff6a00";
          g.lineWidth = 3;
          g.stroke();
          g.fillStyle = weather === 2 ? "#3aa0ff" : "#ff6a00";
          g.fillRect(-54, -26, 108, 14);
          g.fillStyle = "#fff";
          g.font = "bold 11px sans-serif";
          g.textAlign = "center";
          g.fillText(weather >= 1 ? "风雨票 · 奔赴" : "高铁票 · 奔赴", 0, -15);
          g.fillStyle = "#2a1200";
          g.font = "bold 20px Songti SC, serif";
          g.fillText(item.label, 0, 12);
          g.fillStyle = "#8a4b1c";
          g.font = "10px monospace";
          g.fillText("→ 丫头", 0, 26);
        } else {
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

      // rain overlay
      if (rainy) {
        g.strokeStyle = storm ? "rgba(180,210,255,0.55)" : "rgba(170,200,240,0.4)";
        g.lineWidth = storm ? 1.6 : 1.1;
        rain.forEach((d) => {
          g.beginPath();
          g.moveTo(d.x, d.y);
          g.lineTo(d.x + d.vx * 0.04, d.y + d.len);
          g.stroke();
        });
      }
      // wind ribbons
      gusts.forEach((gust) => {
        g.globalAlpha = Math.max(0, gust.life);
        g.strokeStyle = "#b8d4ff";
        g.lineWidth = 2;
        g.beginPath();
        const gx = gust.dir > 0 ? -40 : W + 40;
        g.moveTo(gx, gust.y);
        g.bezierCurveTo(gx + gust.dir * 180, gust.y - 20, gx + gust.dir * 360, gust.y + 24, gx + gust.dir * 520, gust.y);
        g.stroke();
      });
      g.globalAlpha = 1;

      if (flashSky > 0) {
        g.fillStyle = `rgba(220,235,255,${flashSky * 0.55})`;
        g.fillRect(0, 0, W, H);
      }

      g.fillStyle = "#ffd84d";
      g.font = "bold 16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`命 ${"♥".repeat(lives)}${"♡".repeat(3 - lives)}`, 20, 30);
      g.fillText(`车票 ${caught}/${GOAL}`, 20, 54);
      const weatherLabel = storm ? "🌪 台风天" : rainy ? "🌧 风雨中" : "☀ 晴朗";
      g.fillStyle = storm ? "#ff9f1c" : rainy ? "#8ec5ff" : "#ffd84d";
      g.fillText(weatherLabel, 20, 78);
      if (fever > 0) {
        g.fillStyle = "#ff9f1c";
        g.font = "bold 18px Songti SC, serif";
        g.fillText(`✦ 奔赴狂热 ${fever.toFixed(1)}s`, 20, 104);
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

  // ========== HUG (winter warm) ==========
  const Hug = (() => {
    const GOAL = 7;
    let chill = 35;
    let stamina = 100;
    let hugging = false;
    let warm = 0;
    let wind = 0;
    let windCd = 2.5;
    let snow = [];
    let hearts = [];
    let bob = 0;
    let speech = { text: "好冷…", life: 0 };
    let needHug = false;
    let hugPulse = 0;
    let savedFromWind = false;

    const reset = () => {
      chill = 35;
      stamina = 100;
      hugging = false;
      warm = 0;
      wind = 0;
      windCd = 0.9;
      bob = 0;
      hugPulse = 0;
      needHug = false;
      savedFromWind = false;
      speech = { text: "好冷…快抱抱我", life: 1.8 };
      snow = Array.from({ length: 46 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 1.2 + Math.random() * 2.4,
        vy: 28 + Math.random() * 40,
        vx: -12 + Math.random() * 24,
      }));
      hearts = [];
    };

    const setHugging = (on) => {
      if (!running) return;
      if (on && stamina < 6) {
        tip.textContent = "体力空了，先松手回血再抱";
        blip(160, 0.06, "sawtooth", 0.04);
        hugging = false;
        return;
      }
      const was = hugging;
      hugging = !!(on && stamina > 0);
      if (hugging && !was) {
        speech = { text: "我抱着你", life: 1.4 };
        tip.textContent = needHug ? "寒潮里抱紧！把寒意压下去" : "紧紧抱住中…松手可恢复体力";
        blip(420, 0.05, "sine", 0.03);
        hugPulse = 0.6;
      }
    };

    const grantWarm = () => {
      warm += 1;
      bumpCombo(1);
      addScore(140 + combo * 15, W / 2, H * 0.42, "好暖");
      burst(W / 2, H * 0.5, "#ff7eb6", 16);
      burst(W / 2, H * 0.5, "#ffd84d", 10);
      punch(5);
      flashScreen(0.1);
      blip(720, 0.08, "triangle");
      showBanner(warm >= GOAL ? "这一晚被你暖住了" : `好暖 ×${warm}`, "#ffb4c8");
      tip.textContent = warm >= GOAL
        ? "从那句「好冷」开始的拥抱，一路延伸到今天"
        : `记下第 ${warm} 次「好暖」· 目标 ${GOAL}`;
      for (let i = 0; i < 5; i += 1) {
        hearts.push({
          x: W / 2 + (Math.random() - 0.5) * 80,
          y: H * 0.48,
          vy: -40 - Math.random() * 30,
          life: 1,
        });
      }
      if (warm >= GOAL) endGame(true);
    };

    const update = (dt) => {
      bob += dt * 5;
      hugPulse = Math.max(0, hugPulse - dt);
      wind = Math.max(0, wind - dt);
      windCd -= dt;
      speech.life = Math.max(0, speech.life - dt);

      // Sync hold input every frame (pointer capture + space)
      const held = pointerDown || keys.has(" ");
      if (held) setHugging(true);
      else if (hugging) setHugging(false);

      if (windCd <= 0) {
        wind = 1.8 + Math.random() * 0.7;
        windCd = 3.4 + Math.random() * 1.6;
        chill = Math.min(100, chill + 18 + Math.random() * 10);
        needHug = true;
        savedFromWind = false;
        speech = { text: Math.random() > 0.5 ? "好冷！" : "风好大…", life: 1.4 };
        tip.textContent = "寒潮来了！按住画布抱抱，把寒意压下去";
        punch(6);
        blip(180, 0.1, "sawtooth", 0.045);
      }

      const windBoost = wind > 0 ? 24 : 11;
      if (hugging && stamina > 0) {
        stamina = Math.max(0, stamina - 26 * dt);
        chill = Math.max(0, chill - (42 + (wind > 0 ? 14 : 0)) * dt);
        hugPulse = Math.max(hugPulse, 0.35);
        if (stamina <= 0) {
          hugging = false;
          tip.textContent = "抱抱太久也累，松手喘口气";
        }
        if (needHug && !savedFromWind && chill <= 42) {
          savedFromWind = true;
          needHug = false;
          grantWarm();
        }
        if (Math.random() < dt * 4) {
          hearts.push({
            x: W / 2 + (Math.random() - 0.5) * 40,
            y: H * 0.55,
            vy: -50,
            life: 0.7,
          });
        }
      } else {
        hugging = false;
        stamina = Math.min(100, stamina + 24 * dt);
        chill = Math.min(100, chill + windBoost * dt);
      }

      snow.forEach((f) => {
        f.y += f.vy * dt;
        f.x += f.vx * dt + (wind > 0 ? -60 * dt : 0);
        if (f.y > H) {
          f.y = -6;
          f.x = Math.random() * W;
        }
        if (f.x < -10) f.x = W + 5;
        if (f.x > W + 10) f.x = -5;
      });
      hearts = hearts.filter((h) => {
        h.y += h.vy * dt;
        h.life -= dt;
        return h.life > 0;
      });

      if (chill >= 100) {
        chill = 100;
        tip.textContent = "这一晚太冷了…再抱紧一点试试";
        endGame(false);
      }
    };

    const drawPerson = (g, x, y, opts) => {
      const { coat, hair, label, shiver } = opts;
      const sx = shiver ? Math.sin(bob * 18) * 2.5 : 0;
      g.save();
      g.translate(x + sx, y);
      // legs
      g.fillStyle = "#2a2030";
      g.fillRect(-12, 48, 10, 28);
      g.fillRect(4, 48, 10, 28);
      // body
      g.fillStyle = coat;
      roundRect(g, -22, 8, 44, 48, 14);
      g.fill();
      // head
      g.fillStyle = "#f3c7a5";
      g.beginPath();
      g.arc(0, 0, 18, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = hair;
      g.beginPath();
      g.ellipse(0, -10, 18, 12, 0, Math.PI, 0);
      g.fill();
      g.fillStyle = "#2a1200";
      g.beginPath();
      g.arc(-6, 0, 2.2, 0, Math.PI * 2);
      g.arc(6, 0, 2.2, 0, Math.PI * 2);
      g.fill();
      if (shiver) {
        g.strokeStyle = "#5b8def";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(16, -8);
        g.lineTo(24, -14);
        g.moveTo(16, 0);
        g.lineTo(26, -2);
        g.stroke();
      }
      g.fillStyle = "#fff";
      g.font = "bold 12px sans-serif";
      g.textAlign = "center";
      g.fillText(label, 0, 92);
      g.restore();
    };

    const draw = (g) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0b1730");
      grad.addColorStop(1, hugging ? "#3a2048" : "#152238");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);

      // cafe
      g.fillStyle = "#1a2233";
      g.fillRect(60, H * 0.38, 220, H * 0.4);
      g.fillStyle = "#f6c76e";
      g.globalAlpha = 0.35 + (hugging ? 0.25 : 0);
      g.fillRect(90, H * 0.46, 70, 50);
      g.fillRect(180, H * 0.46, 70, 50);
      g.globalAlpha = 1;
      g.fillStyle = "#2a3144";
      g.fillRect(0, H * 0.76, W, H * 0.24);
      g.fillStyle = "#3a455c";
      g.fillRect(0, H * 0.76, W, 10);

      snow.forEach((f) => {
        g.fillStyle = "rgba(255,255,255,0.75)";
        g.beginPath();
        g.arc(f.x, f.y, f.s, 0, Math.PI * 2);
        g.fill();
      });

      const mid = W / 2;
      const baseY = H * 0.58;
      if (hugging) {
        // shared glow
        g.fillStyle = `rgba(255,150,180,${0.15 + hugPulse * 0.25})`;
        g.beginPath();
        g.ellipse(mid, baseY + 20, 110, 70, 0, 0, Math.PI * 2);
        g.fill();
        drawPerson(g, mid - 18, baseY, { coat: "#e85a95", hair: "#3b2218", label: "丫头", shiver: false });
        drawPerson(g, mid + 22, baseY, { coat: "#ffb703", hair: "#2a1810", label: "小胖哥", shiver: false });
        // arms wrap cue
        g.strokeStyle = "rgba(255,216,77,0.7)";
        g.lineWidth = 4;
        g.beginPath();
        g.arc(mid, baseY + 28, 48, 0.15 * Math.PI, 0.85 * Math.PI);
        g.stroke();
      } else {
        drawPerson(g, mid - 70, baseY, { coat: "#e85a95", hair: "#3b2218", label: "丫头", shiver: false });
        drawPerson(g, mid + 70, baseY, { coat: "#ffb703", hair: "#2a1810", label: "小胖哥", shiver: true });
      }

      hearts.forEach((h) => {
        g.globalAlpha = Math.max(0, h.life);
        g.fillStyle = "#ff7eb6";
        g.font = "18px sans-serif";
        g.textAlign = "center";
        g.fillText("♥", h.x, h.y);
      });
      g.globalAlpha = 1;

      if (speech.life > 0) {
        const sx = hugging ? mid + 40 : mid + 100;
        g.fillStyle = "rgba(255,255,255,0.92)";
        roundRect(g, sx - 40, baseY - 70, 80, 32, 10);
        g.fill();
        g.fillStyle = "#5d1738";
        g.font = "bold 14px Songti SC, serif";
        g.textAlign = "center";
        g.fillText(speech.text, sx, baseY - 48);
      }

      // meters
      const drawMeter = (x, y, w, value, color, label) => {
        g.fillStyle = "rgba(0,0,0,0.35)";
        roundRect(g, x, y, w, 18, 9);
        g.fill();
        g.fillStyle = color;
        roundRect(g, x + 2, y + 2, Math.max(0, (w - 4) * (value / 100)), 14, 7);
        g.fill();
        g.fillStyle = "#ffd84d";
        g.font = "bold 12px sans-serif";
        g.textAlign = "left";
        g.fillText(label, x, y - 6);
      };
      drawMeter(24, 48, 220, chill, chill > 70 ? "#5b8def" : "#8ec5ff", `寒意 ${Math.floor(chill)}`);
      drawMeter(24, 92, 220, stamina, "#ffb703", `体力 ${Math.floor(stamina)}`);
      g.fillStyle = "#ffd84d";
      g.font = "bold 16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`好暖 ${warm} / ${GOAL}`, 24, 140);
      if (wind > 0) {
        g.fillStyle = "#8ec5ff";
        g.font = "bold 18px Songti SC, serif";
        g.fillText("寒潮中！快抱抱", 24, 168);
      }
      g.fillStyle = "#ffe7f1";
      g.font = "13px sans-serif";
      g.textAlign = "center";
      g.fillText(hugging ? "紧紧抱住中…" : "按住拥抱 · 松手恢复体力", W / 2, H - 24);
    };

    return { reset, update, draw, setHugging };
  })();

  const Games = { stack: Stack, catch: Catch, hug: Hug, blow: null };
  // alias in case old cards still say blow
  Games.blow = Games.hug;


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
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    if (mode === "ready" || mode === "over" || mode === "clear") {
      startOrRetry();
      if (active === "hug") Hug.setHugging(true);
      return;
    }
    if (!running) return;
    if (active === "stack") Stack.drop();
    if (active === "catch") Catch.pointerToLane(x);
    if (active === "hug") Hug.setHugging(true);
  });

  canvas.addEventListener("pointermove", (event) => {
    const { x, y } = canvasPos(event);
    pointerX = x;
    pointerY = y;
    if (active === "catch" && (running || mode === "play")) Catch.pointerToLane(x);
  });

  canvas.addEventListener("pointerup", (event) => {
    pointerDown = false;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    if (active === "hug" && running) Hug.setHugging(false);
  });
  canvas.addEventListener("pointercancel", () => {
    pointerDown = false;
    if (active === "hug" && running) Hug.setHugging(false);
  });
  // Do not cancel hug on pointerleave — scaled canvas easily loses hover while holding
  canvas.addEventListener("pointerleave", () => {
    if (active === "hug") return;
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
      else if (active === "hug" && running) Hug.setHugging(true);
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key);
    if (event.code === "Space" && active === "hug" && running) Hug.setHugging(false);
  });

  // Update hall card copy to match new mechanics
  const stackCard = document.querySelector('[data-game="stack"] em');
  const catchCard = document.querySelector('[data-game="catch"] em');
  const hugCard = document.querySelector('[data-game="hug"] em');
  const hugTitle = document.querySelector('[data-game="hug"] strong');
  if (stackCard) stackCard.textContent = "每一层都是 520 DIY 真实配方，叠稳才写进回忆";
  if (catchCard) catchCard.textContent = "风雨台风会吹歪车票，连击进入奔赴狂热";
  if (hugCard) hugCard.textContent = "按住画布抱抱扛寒潮，松手回血攒「好暖」";
  if (hugTitle) hugTitle.textContent = "冬夜好冷·抱抱取暖";
  const stackTitle = document.querySelector('[data-game="stack"] strong');
  if (stackTitle) stackTitle.textContent = "520·DIY 奶油千层";

  renderHallStats();
})();
