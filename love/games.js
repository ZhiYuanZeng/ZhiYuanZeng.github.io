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
  const STORAGE = "museum-arcade-stats-v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const META = {
    stack: {
      title: "奶油千层叠叠乐",
      tip: "在粉色条对准时点击或按空格，把饼皮稳稳叠上去。叠到 8 层通关！",
      help: "操作：鼠标点击 / 空格键放下当前层",
    },
    catch: {
      title: "异地车票接接乐",
      tip: "接住天津·北京·上海·南昌车票，躲开「加班」「拖延」干扰项。",
      help: "操作：← → 或 A D 移动小胖哥 · 鼠标也可左右移动",
    },
    blow: {
      title: "吹蜡烛大作战",
      tip: "限时内点灭全部蜡烛。连击越多分越高！",
      help: "操作：鼠标点击烛火 · 或按 1–5 对应蜡烛",
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

  // shared input
  const keys = new Set();
  let pointerX = W / 2;

  const setHud = () => {
    scoreEl.textContent = String(score);
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
  };

  const resetCombo = () => {
    combo = 0;
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

  function openGame(id) {
    active = id;
    mode = "ready";
    running = false;
    score = 0;
    combo = 0;
    setHud();
    titleEl.textContent = META[id].title;
    tip.textContent = META[id].tip;
    helpEl.textContent = META[id].help;
    actionBtn.textContent = "开始";
    stage.hidden = false;
    document.body.style.overflow = "hidden";
    stats.plays = (stats.plays || 0) + 1;
    saveStats();
    renderHallStats();
    Games[id].reset();
    drawFrame();
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
    if (mode === "ready" || mode === "over" || mode === "clear") {
      mode = "play";
      running = true;
      score = 0;
      combo = 0;
      setHud();
      tip.textContent = META[active].tip;
      actionBtn.textContent = "重新开始";
      Games[active].reset();
      loop();
    } else if (mode === "play") {
      mode = "play";
      running = true;
      score = 0;
      combo = 0;
      setHud();
      Games[active].reset();
    }
  }

  function endGame(cleared) {
    running = false;
    mode = cleared ? "clear" : "over";
    if (cleared) {
      tip.textContent = `通关！得分 ${score} · 最高连击 ${bestCombo}`;
      stats[`clear_${active}`] = true;
      saveStats();
      renderHallStats();
    } else {
      tip.textContent = `结束啦 · 得分 ${score}。再来一局？`;
    }
    actionBtn.textContent = "再玩一次";
    drawFrame();
  }

  function loop() {
    cancelAnimationFrame(raf);
    const step = () => {
      if (!running || !active) return;
      Games[active].update();
      drawFrame();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    if (!active) return;
    Games[active].draw(ctx);
    if (mode === "ready") banner("点击下方开始");
    if (mode === "clear") banner("通关！心动加倍");
    if (mode === "over") banner("再试一次");
  }

  function banner(text) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, H / 2 - 40, W, 80);
    ctx.fillStyle = "#ffd84d";
    ctx.font = "bold 36px Songti SC, serif";
    ctx.textAlign = "center";
    ctx.fillText(text, W / 2, H / 2 + 12);
  }

  // ——— Game 1: stack cake ———
  const Stack = (() => {
    const TARGET = 8;
    let layers = [];
    let current = null;
    let dir = 1;
    let speed = 4.2;
    let perfect = 0;

    const colors = ["#d94d85", "#ffadc9", "#f3d2a8", "#f58db5", "#ff7eb6", "#ffc2d8"];

    const makeLayer = (y, width, x) => ({
      x: x ?? (W - width) / 2,
      y,
      w: width,
      color: colors[layers.length % colors.length],
    });

    const reset = () => {
      layers = [makeLayer(H - 70, 220)];
      current = makeLayer(H - 70 - 44, 220, 40);
      dir = 1;
      speed = 4.2;
      perfect = 0;
    };

    const drop = () => {
      if (!running || !current) return;
      const prev = layers[layers.length - 1];
      const left = Math.max(current.x, prev.x);
      const right = Math.min(current.x + current.w, prev.x + prev.w);
      const overlap = right - left;
      if (overlap < 28) {
        endGame(false);
        return;
      }
      const trimmed = { ...current, x: left, w: overlap, y: prev.y - 44 };
      layers.push(trimmed);
      const centered = Math.abs(trimmed.x + trimmed.w / 2 - (prev.x + prev.w / 2)) < 10;
      if (centered) {
        perfect += 1;
        bumpCombo(2);
        score += 120 + perfect * 20;
        tip.textContent = "完美对齐！奶油更稳了";
      } else {
        bumpCombo(1);
        score += 60;
        tip.textContent = `叠好第 ${layers.length - 1} 层 · 继续！`;
      }
      setHud();
      if (layers.length - 1 >= TARGET) {
        endGame(true);
        return;
      }
      speed = Math.min(7.5, speed + 0.28);
      current = makeLayer(trimmed.y - 44, trimmed.w, dir > 0 ? 20 : W - trimmed.w - 20);
    };

    const update = () => {
      if (!current) return;
      current.x += dir * speed;
      if (current.x <= 20) dir = 1;
      if (current.x + current.w >= W - 20) dir = -1;
    };

    const draw = (g) => {
      // sky
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#2a1030");
      grad.addColorStop(1, "#5a2048");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 30; i += 1) {
        g.beginPath();
        g.arc((i * 97) % W, (i * 53) % (H * 0.55), 1.5, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#fff6fa";
      g.fillRect(W / 2 - 140, H - 36, 280, 16);
      layers.forEach((layer) => {
        g.fillStyle = layer.color;
        roundRect(g, layer.x, layer.y, layer.w, 40, 8);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.45)";
        roundRect(g, layer.x + 8, layer.y + 6, layer.w - 16, 10, 6);
        g.fill();
      });
      if (current) {
        g.fillStyle = current.color;
        roundRect(g, current.x, current.y, current.w, 40, 8);
        g.fill();
        g.strokeStyle = "#ffd84d";
        g.lineWidth = 3;
        g.strokeRect(current.x - 2, current.y - 2, current.w + 4, 44);
      }
      g.fillStyle = "#ffd84d";
      g.font = "16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`层数 ${Math.max(0, layers.length - 1)} / ${TARGET}`, 24, 32);
    };

    return { reset, update, draw, drop };
  })();

  // ——— Game 2: catch tickets ———
  const Catch = (() => {
    const CITIES = ["天津", "北京", "上海", "南昌"];
    const BAD = ["加班", "堵车", "拖延"];
    let player = { x: W / 2, w: 110, h: 28 };
    let items = [];
    let spawn = 0;
    let lives = 3;
    let elapsed = 0;
    let caught = 0;
    const GOAL = 12;

    const reset = () => {
      player.x = W / 2;
      items = [];
      spawn = 0;
      lives = 3;
      elapsed = 0;
      caught = 0;
    };

    const spawnItem = () => {
      const good = Math.random() > 0.28;
      const label = good
        ? CITIES[Math.floor(Math.random() * CITIES.length)]
        : BAD[Math.floor(Math.random() * BAD.length)];
      items.push({
        x: 60 + Math.random() * (W - 120),
        y: -30,
        vy: 2.6 + Math.random() * 2.2 + elapsed * 0.0004,
        label,
        good,
        w: 86,
        h: 34,
      });
    };

    const update = () => {
      elapsed += 16;
      spawn -= 16;
      if (spawn <= 0) {
        spawnItem();
        spawn = Math.max(420, 900 - elapsed * 0.02);
      }
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) player.x -= 7;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) player.x += 7;
      player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));

      items.forEach((item) => {
        item.y += item.vy;
      });

      items = items.filter((item) => {
        const hit =
          item.y + item.h > H - 58 &&
          item.x < player.x + player.w / 2 &&
          item.x + item.w > player.x - player.w / 2;
        if (hit) {
          if (item.good) {
            caught += 1;
            score += 50 + combo * 5;
            bumpCombo(1);
            tip.textContent = `接到「${item.label}」车票！(${caught}/${GOAL})`;
            setHud();
            if (caught >= GOAL) endGame(true);
          } else {
            lives -= 1;
            resetCombo();
            setHud();
            tip.textContent = `哎呀，接到「${item.label}」了`;
            if (lives <= 0) endGame(false);
          }
          return false;
        }
        if (item.y > H) {
          if (item.good) {
            lives -= 1;
            resetCombo();
            setHud();
            tip.textContent = "车票飞走了…";
            if (lives <= 0) endGame(false);
          }
          return false;
        }
        return true;
      });
    };

    const draw = (g) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#10243a");
      grad.addColorStop(1, "#1b3d5c");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#2f5f7f";
      g.fillRect(0, H - 40, W, 40);
      // player
      g.fillStyle = "#ffd84d";
      roundRect(g, player.x - player.w / 2, H - 62, player.w, player.h, 10);
      g.fill();
      g.fillStyle = "#5d1738";
      g.font = "bold 14px sans-serif";
      g.textAlign = "center";
      g.fillText("小胖哥", player.x, H - 43);
      items.forEach((item) => {
        g.fillStyle = item.good ? "#fff8ef" : "#ffb4b4";
        roundRect(g, item.x, item.y, item.w, item.h, 6);
        g.fill();
        g.strokeStyle = item.good ? "#ff6a00" : "#c41e5a";
        g.strokeRect(item.x, item.y, item.w, item.h);
        g.fillStyle = "#2a1200";
        g.font = "bold 14px Songti SC, serif";
        g.fillText(item.label, item.x + item.w / 2, item.y + 22);
      });
      g.fillStyle = "#ffd84d";
      g.font = "16px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`命 ${"♥".repeat(Math.max(0, lives))}${"♡".repeat(Math.max(0, 3 - lives))}`, 24, 32);
    };

    const onPointer = (x) => {
      player.x = x;
    };

    return { reset, update, draw, onPointer };
  })();

  // ——— Game 3: blow candles ———
  const Blow = (() => {
    let candles = [];
    let timeLeft = 12;
    let last = 0;

    const reset = () => {
      candles = Array.from({ length: 5 }, (_, index) => ({
        x: 140 + index * 150,
        y: H * 0.55,
        lit: true,
        wobble: Math.random() * Math.PI * 2,
      }));
      timeLeft = 12;
      last = performance.now();
    };

    const extinguish = (index) => {
      if (!running || !candles[index]?.lit) return;
      candles[index].lit = false;
      bumpCombo(1);
      score += 80 + combo * 15;
      setHud();
      tip.textContent = `吹灭第 ${index + 1} 根！`;
      if (candles.every((c) => !c.lit)) endGame(true);
    };

    const update = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      timeLeft -= dt;
      candles.forEach((c) => {
        c.wobble += dt * 8;
      });
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame(candles.every((c) => !c.lit));
      }
    };

    const draw = (g) => {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#16081a");
      grad.addColorStop(1, "#3a1530");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      // cake base
      g.fillStyle = "#f3d2a8";
      roundRect(g, 120, H * 0.62, W - 240, 90, 16);
      g.fill();
      g.fillStyle = "#ffadc9";
      roundRect(g, 170, H * 0.55, W - 340, 70, 14);
      g.fill();
      candles.forEach((c, index) => {
        g.fillStyle = "#fff6fa";
        g.fillRect(c.x - 6, c.y - 70, 12, 70);
        g.fillStyle = "#8de5e1";
        g.fillRect(c.x - 6, c.y - 40, 12, 8);
        if (c.lit) {
          const flicker = Math.sin(c.wobble) * 3;
          g.fillStyle = "#ffd84d";
          g.beginPath();
          g.ellipse(c.x + flicker * 0.2, c.y - 88, 8, 14, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#ff6a00";
          g.beginPath();
          g.ellipse(c.x, c.y - 84, 4, 7, 0, 0, Math.PI * 2);
          g.fill();
        } else {
          g.fillStyle = "rgba(255,255,255,0.25)";
          g.beginPath();
          g.arc(c.x, c.y - 90, 10, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = "#ffd84d";
        g.font = "12px monospace";
        g.textAlign = "center";
        g.fillText(String(index + 1), c.x, c.y + 24);
      });
      g.fillStyle = "#ffd84d";
      g.font = "18px SFMono-Regular, monospace";
      g.textAlign = "left";
      g.fillText(`倒计时 ${timeLeft.toFixed(1)}s`, 24, 34);
    };

    const hit = (x, y) => {
      candles.forEach((c, index) => {
        if (!c.lit) return;
        const dx = x - c.x;
        const dy = y - (c.y - 88);
        if (dx * dx + dy * dy < 40 * 40) extinguish(index);
      });
    };

    return { reset, update, draw, hit, extinguish };
  })();

  const Games = {
    stack: Stack,
    catch: Catch,
    blow: Blow,
  };

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
    if (mode === "ready") {
      startOrRetry();
      return;
    }
    if (!running) return;
    if (active === "stack") Stack.drop();
    if (active === "blow") Blow.hit(x, y);
  });

  canvas.addEventListener("pointermove", (event) => {
    const { x } = canvasPos(event);
    pointerX = x;
    if (active === "catch" && running) Catch.onPointer(x);
  });

  window.addEventListener("keydown", (event) => {
    if (stage.hidden) return;
    keys.add(event.key);
    if (event.key === "Escape") {
      closeGame();
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      if (mode === "ready" || mode === "over" || mode === "clear") startOrRetry();
      else if (active === "stack" && running) Stack.drop();
    }
    if (active === "blow" && running && /^[1-5]$/.test(event.key)) {
      Blow.extinguish(Number(event.key) - 1);
    }
  });

  window.addEventListener("keyup", (event) => keys.delete(event.key));

  renderHallStats();
  if (reduceMotion.matches) {
    // still playable; no extra ambient animation beyond rAF games
  }
})();
