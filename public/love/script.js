const introSequence = document.querySelector("#intro-sequence");
const introStatus = document.querySelector("#intro-status");
let introFinished = false;

const finishIntro = () => {
  if (introFinished) return;
  introFinished = true;
  introSequence.classList.add("is-finished");
  document.body.classList.remove("intro-active");
  sessionStorage.setItem("museum-intro-seen", "yes");
};

const forceIntro = new URLSearchParams(window.location.search).get("intro") === "1";

const startIntro = () => {
  if ((!forceIntro && sessionStorage.getItem("museum-intro-seen") === "yes") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishIntro();
    return;
  }

  window.setTimeout(() => {
    introStatus.textContent = "确认唯一访问者：丫头";
  }, 620);
  window.setTimeout(() => {
    introStatus.textContent = "连接成功";
  }, 1180);
  window.setTimeout(finishIntro, 1700);
};

// The intro only plays once the password gate is out of the way.
if (window.Vault) window.Vault.whenUnlocked(startIntro);
else startIntro();

document.querySelector("#skip-intro").addEventListener("click", finishIntro);

document.querySelectorAll(".evidence__photo img").forEach((image) => {
  const markMissing = () => image.classList.add("is-missing");
  image.addEventListener("error", markMissing);
  if (image.complete && image.naturalWidth === 0) markMissing();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const scrollProgressBar = document.querySelector("#scroll-progress-bar");
const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgressBar.style.width = `${Math.min(progress * 100, 100)}%`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const hero = document.querySelector(".hero");
const updateHeroDepth = (x, y) => {
  hero.style.setProperty("--hero-shift-x", `${x}px`);
  hero.style.setProperty("--hero-shift-y", `${y}px`);
};

hero.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch" || reduceMotion?.matches) return;
  const rect = hero.getBoundingClientRect();
  updateHeroDepth(((event.clientX - rect.left) / rect.width - 0.5) * 22, ((event.clientY - rect.top) / rect.height - 0.5) * 14);
});

hero.addEventListener("pointerleave", () => updateHeroDepth(0, 0));

const fxLayer = document.querySelector("#fx-layer");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const emitBurst = (source, count = 10) => {
  if (reduceMotion.matches) return;

  const rect = source.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const symbols = ["♡", "✦", "·"];
  const colors = ["#ff7eb6", "#8de5e1", "#fff3f8"];

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.45;
    const distance = 45 + Math.random() * (count > 14 ? 150 : 85);
    particle.className = "fx-particle";
    particle.textContent = symbols[index % symbols.length];
    particle.style.setProperty("--particle-x", `${centerX}px`);
    particle.style.setProperty("--particle-y", `${centerY}px`);
    particle.style.setProperty("--particle-dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--particle-dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--particle-rotate", `${Math.random() * 180 - 90}deg`);
    particle.style.setProperty("--particle-size", `${10 + Math.random() * 14}px`);
    particle.style.setProperty("--particle-color", colors[index % colors.length]);
    fxLayer.append(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }

  navigator.vibrate?.(12);
};

const embracePhoto = document.querySelector(".evidence__photo--illustration");
document.querySelector("#embrace-trigger").addEventListener("click", () => {
  embracePhoto.classList.remove("is-replaying");
  void embracePhoto.offsetWidth;
  embracePhoto.classList.add("is-replaying");
  emitBurst(embracePhoto, 18);
});

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(`#${button.dataset.scrollTo}`)?.scrollIntoView({ behavior: "smooth" });
  });
});

const countdown = document.querySelector("#countdown");

const updateCountdown = () => {
  const now = new Date();
  let birthday = new Date(now.getFullYear(), 8, 6);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today > birthday) {
    birthday = new Date(now.getFullYear() + 1, 8, 6);
  }

  const days = Math.round((birthday - today) / 86_400_000);

  if (days === 0) {
    countdown.textContent = "就是今天 · 生日快乐！";
  } else {
    countdown.textContent = `${String(days).padStart(3, "0")} DAYS · 等待信号抵达`;
  }
};

updateCountdown();

const finale = document.querySelector("#finale");
const finaleProgress = document.querySelector("#finale-progress");
const completionState = { stars: false, route: false };

const updateFinaleState = () => {
  if (completionState.stars && completionState.route) {
    if (!finale.classList.contains("is-unlocked")) {
      finale.classList.remove("is-locked");
      finale.classList.add("is-unlocked");
      window.setTimeout(() => {
        emitBurst(finale.querySelector(".finale__heart"), 30);
      }, 1200);
    }
    finaleProgress.textContent = "全部线索已确认";
    return;
  }

  const cakeStatus = completionState.stars ? "蛋糕愿望已完成" : "蛋糕愿望未完成";
  const routeStatus = completionState.route ? "城市旅程已完成" : "城市旅程未完成";
  finaleProgress.textContent = `${cakeStatus} · ${routeStatus}`;
};

window.addEventListener("cake-complete", () => {
  completionState.stars = true;
  updateFinaleState();
});

window.addEventListener("journey-complete", () => {
  completionState.route = true;
  updateFinaleState();
});

const memories = [
  {
    title: "2020.12.29 · 寒风里的拥抱",
    story: "一句“好冷”，换来了第一次紧紧拥抱，也让两颗心从此有了共同轨道。",
  },
  {
    title: "2021.05.20 · 奶油味的喜欢",
    story: "第一次一起过 520。我们做了一只不够标准，却独一无二的奶油千层。",
  },
  {
    title: "2023.SPRING · 古城春色",
    story: "我们一起毕业，在开封和洛阳的春风里，收藏下绿色长裙与古城的光。",
  },
  {
    title: "2026.05.16 · 约定白头",
    story: "经历一波三折，我们依然牵着手，把“以后”认真写进了订婚的承诺。",
  },
];

const memoryStars = [...document.querySelectorAll(".memory-star")];
const foundMemories = new Set();
const starConsole = document.querySelector(".star-map__console");
const starTitle = document.querySelector("#star-title");
const starStory = document.querySelector("#star-story");
const starProgressBar = document.querySelector("#star-progress-bar");
const starCount = document.querySelector("#star-count");
const starBeam = document.querySelector("#star-beam");
const starSky = document.querySelector(".star-map__sky");

memoryStars.forEach((star) => {
  star.addEventListener("click", () => {
    const memoryIndex = Number(star.dataset.memory);
    const memory = memories[memoryIndex];
    const wasFound = foundMemories.has(memoryIndex);
    foundMemories.add(memoryIndex);
    star.classList.add("is-found");
    const starRect = star.getBoundingClientRect();
    const skyRect = starSky.getBoundingClientRect();
    starBeam.style.setProperty("--beam-x", `${starRect.left + starRect.width / 2 - skyRect.left}px`);
    starBeam.style.setProperty("--beam-y", `${starRect.top + starRect.height / 2 - skyRect.top}px`);
    starBeam.classList.remove("is-scanning");
    star.classList.remove("is-scanning");
    void starBeam.offsetWidth;
    starBeam.classList.add("is-scanning");
    star.classList.add("is-scanning");
    if (!wasFound) emitBurst(star, 9);
    starTitle.textContent = memory.title;
    starStory.textContent = memory.story;
    starProgressBar.style.width = `${(foundMemories.size / memories.length) * 100}%`;
    starCount.textContent = `${foundMemories.size} / ${memories.length} MEMORIES FOUND`;

    if (foundMemories.size === memories.length) {
      starConsole.classList.add("is-complete");
      completionState.stars = true;
      updateFinaleState();
      if (!starConsole.dataset.celebrated) {
        starConsole.dataset.celebrated = "yes";
        window.setTimeout(() => emitBurst(starConsole, 26), 450);
      }
      window.setTimeout(() => {
        starTitle.textContent = "星图解析完成：是一颗心";
        starStory.textContent = "原来散落在时间里的每一个坐标，一直都在指向同一个人。";
      }, 700);
    }
  });
});

const reasonMessages = {
  美丽: "美丽，不只是第一眼，也是看了很多年仍会心动。",
  善良: "善良，是你对世界最温柔的回应。",
  可爱: "可爱，是你不经意间就能让我笑起来。",
  大方: "大方，是你从容又明亮的样子。",
  知性: "知性，是藏在谈吐和眼睛里的光。",
  温柔: "温柔，是那个寒冷冬夜里紧紧的拥抱。",
  温婉: "温婉，是安静时也让人舍不得移开目光。",
  明艳: "明艳，是你走进人群时自带的光。",
  俏丽: "俏丽，是绿色长裙掠过洛阳春风的样子。",
  机敏: "机敏，是推理迷总能先发现关键线索。",
  体贴: "体贴，是你记得那些我自己都会忽略的小事。",
  聪明: "聪明，是我永远愿意甘拜下风。",
  勇敢: "勇敢，是我们经历波折后依然选择彼此。",
  贤惠: "贤惠，是你让平凡生活变得温暖。",
  果敢: "果敢，是认定之后便坚定地一起走。",
};

const reasonButtons = [...document.querySelectorAll("#reason-cloud button")];
const reasonMessage = document.querySelector("#reason-message");
const selectedReasons = new Set();

reasonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");

    if (button.classList.contains("is-active")) {
      selectedReasons.add(button.textContent);
      reasonMessage.textContent = reasonMessages[button.textContent];
    } else {
      selectedReasons.delete(button.textContent);
      reasonMessage.textContent = "每去掉一个词，都还是喜欢你。";
    }

    if (selectedReasons.size === reasonButtons.length) {
      reasonMessage.textContent = "全部线索已确认：她就是世界上最好的女孩子。";
    }
  });
});

const openLetterButton = document.querySelector("#open-letter");
const letterPreview = document.querySelector("#letter-preview");
const letterFull = document.querySelector("#letter-full");
const letterEnvelope = document.querySelector(".letter__envelope");

openLetterButton.addEventListener("click", () => {
  const isOpen = !letterFull.hidden;
  letterFull.hidden = isOpen;
  letterPreview.hidden = !isOpen;
  letterEnvelope.classList.toggle("is-open", !isOpen);
  openLetterButton.textContent = isOpen ? "拆开这封信" : "轻轻收好";

  if (!isOpen) {
    letterFull.scrollIntoView({ behavior: "smooth", block: "nearest" });
    emitBurst(openLetterButton, 18);
  }
});

document.querySelector("#replay").addEventListener("click", () => {
  document.querySelector("#cake-world").scrollIntoView({ behavior: "smooth" });
});

const route = ["北京", "天津", "上海", "南昌", "北京"];
const routeHints = [
  "从北京出发，下一站是第一次异地的另一端。",
  "北京 → 天津。后来，工作的列车又把我们带向更远的南方。",
  "天津之后，我们的故事在上海和南昌之间继续。",
  "上海 → 南昌。最后，再从南昌一路奔向北京。",
  "南昌 → 北京。所有车票都已核验。",
];
let routeStep = 0;
let routeBusy = false;
const cityButtons = [...document.querySelectorAll(".city[data-city]")];
const routeLegs = [...document.querySelectorAll(".route-leg")];
const routeMessage = document.querySelector("#route-message");
const routeStamps = document.querySelector("#route-stamps");
const routeTrain = document.querySelector("#route-train");
const routeTicket = document.querySelector("#route-ticket");

const animateTrain = (path) =>
  new Promise((resolve) => {
    const duration = reduceMotion.matches ? 1 : 1050;
    const length = path.getTotalLength();
    const startedAt = performance.now();
    routeTrain.classList.add("is-visible");

    const frame = (now) => {
      const elapsed = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const point = path.getPointAtLength(length * eased);
      routeTrain.setAttribute("transform", `translate(${point.x} ${point.y})`);

      if (elapsed < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(frame);
  });

const resetRoute = () => {
  routeStep = 0;
  routeBusy = false;
  routeMessage.textContent = "第一站：我们最初跨越的那段距离，从北京出发。";
  routeStamps.replaceChildren();
  routeTicket.hidden = true;
  routeTrain.classList.remove("is-visible");
  routeTrain.setAttribute("transform", "translate(220 62)");
  cityButtons.forEach((button) => button.classList.remove("is-visited", "is-wrong"));
  routeLegs.forEach((leg) => leg.classList.remove("is-traveled"));
};

cityButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (routeBusy) return;
    const selectedCity = button.dataset.city;

    if (selectedCity !== route[routeStep]) {
      button.classList.remove("is-wrong");
      void button.offsetWidth;
      button.classList.add("is-wrong");
      routeMessage.textContent = `这张票暂时对不上。第 ${routeStep + 1} 站不是${selectedCity}。`;
      return;
    }

    routeBusy = true;
    if (routeStep === 0) {
      routeTrain.classList.add("is-visible");
    } else {
      const traveledLeg = routeLegs[routeStep - 1];
      traveledLeg.classList.add("is-traveled");
      await animateTrain(traveledLeg);
    }

    const stamp = document.createElement("span");
    stamp.textContent = `${String(routeStep + 1).padStart(2, "0")} ${selectedCity}`;
    routeStamps.append(stamp);
    button.classList.add("is-visited");
    emitBurst(button, 8);
    routeMessage.textContent = routeHints[routeStep];
    routeStep += 1;
    routeBusy = false;

    if (routeStep === route.length) {
      routeMessage.textContent = "路线解锁：距离从来没有让我们停止相爱，只让每次见面变得更加珍贵。";
      cityButtons.forEach((city) => city.classList.add("is-visited"));
      routeTicket.hidden = false;
      completionState.route = true;
      updateFinaleState();
      window.setTimeout(() => emitBurst(document.querySelector(".distance__map"), 24), 300);
    }
  });
});

document.querySelector("#route-reset").addEventListener("click", resetRoute);

const photoCards = [...document.querySelectorAll(".snapshot")];
const photoStage = document.querySelector("#photo-deck-stage");
const photoCurrent = document.querySelector("#photo-current");
let activePhoto = 0;
let dragStartX = 0;
let deckWasDragged = false;
let deckAnimating = false;
let deckPointerActive = false;

const updatePhotoDeck = (direction = 1) => {
  photoCards.forEach((card, index) => {
    const offset = (index - activePhoto + photoCards.length) % photoCards.length;
    card.classList.remove("is-active", "is-next", "is-back");
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");

    if (offset === 0) card.classList.add("is-active");
    else if (offset === 1) card.classList.add("is-next");
    else card.classList.add("is-back");
  });

  photoCurrent.textContent = String(activePhoto + 1).padStart(2, "0");
  emitBurst(direction > 0 ? document.querySelector("#photo-next") : document.querySelector("#photo-prev"), 6);
};

const changePhoto = (direction) => {
  if (deckAnimating) return;

  if (reduceMotion.matches) {
    activePhoto = (activePhoto + direction + photoCards.length) % photoCards.length;
    updatePhotoDeck(direction);
    return;
  }

  deckAnimating = true;
  const outgoing = photoCards[activePhoto];
  outgoing.classList.add(direction > 0 ? "is-dealing-left" : "is-dealing-right");
  window.setTimeout(() => {
    outgoing.classList.remove("is-dealing-left", "is-dealing-right");
    activePhoto = (activePhoto + direction + photoCards.length) % photoCards.length;
    updatePhotoDeck(direction);
    deckAnimating = false;
  }, 360);
};

document.querySelector("#photo-prev").addEventListener("click", () => changePhoto(-1));
document.querySelector("#photo-next").addEventListener("click", () => changePhoto(1));

photoStage.addEventListener("pointerdown", (event) => {
  dragStartX = event.clientX;
  deckWasDragged = false;
  deckPointerActive = true;
});

photoStage.addEventListener("pointermove", (event) => {
  if (!deckPointerActive) return;
  if (Math.abs(event.clientX - dragStartX) > 8) deckWasDragged = true;
});

photoStage.addEventListener("pointerup", (event) => {
  if (!deckPointerActive) return;
  deckPointerActive = false;
  const distance = event.clientX - dragStartX;
  deckWasDragged = Math.abs(distance) > 45;
  if (Math.abs(distance) > 45) {
    changePhoto(distance < 0 ? 1 : -1);
  } else if (deckWasDragged) {
    photoStage.classList.remove("is-bouncing");
    void photoStage.offsetWidth;
    photoStage.classList.add("is-bouncing");
  }
  window.setTimeout(() => {
    deckWasDragged = false;
  }, 80);
});

photoStage.addEventListener("pointercancel", () => {
  deckPointerActive = false;
  deckWasDragged = false;
});

photoStage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  const activeCard = photoCards[activePhoto];
  const rect = activeCard.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  activeCard.style.setProperty("--tilt-x", `${x * 7}deg`);
  activeCard.style.setProperty("--tilt-y", `${y * -5}deg`);
});

photoStage.addEventListener("pointerleave", () => {
  photoCards[activePhoto].style.removeProperty("--tilt-x");
  photoCards[activePhoto].style.removeProperty("--tilt-y");
});

const lightbox = document.querySelector("#photo-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const zoomableImages = document.querySelectorAll(".hero__portrait img, .evidence__photo img, .snapshot img");

zoomableImages.forEach((image) => {
  image.addEventListener("click", () => {
    if (image.classList.contains("is-missing") || deckWasDragged) return;

    const figureCaption = image.closest("figure")?.querySelector("figcaption");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = figureCaption?.textContent.trim() || image.alt;
    lightbox.style.setProperty("--lightbox-bg", `url("${image.currentSrc || image.src}")`);
    lightbox.showModal();
  });
});

document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const musicPlayer = document.querySelector("#music-player");
const themeMusic = document.querySelector("#theme-music");
const musicToggle = document.querySelector("#music-toggle");
const musicAction = document.querySelector("#music-action");
const musicProgress = document.querySelector("#music-progress");
const musicTime = document.querySelector("#music-time");
const musicLyric = document.querySelector("#music-lyric");
const musicCollapse = document.querySelector("#music-collapse");
let lyrics = [];
let activeLyricIndex = -1;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const parseLyrics = (source) =>
  source
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/);
      if (!match || !match[4].trim()) return null;
      const fraction = Number(`0.${match[3]}`);
      return {
        time: Number(match[1]) * 60 + Number(match[2]) + fraction,
        text: match[4].trim(),
      };
    })
    .filter(Boolean);

fetch("./assets/audio/love-is-simple.lrc")
  .then((response) => {
    if (!response.ok) throw new Error("歌词加载失败");
    return response.text();
  })
  .then((source) => {
    lyrics = parseLyrics(source);
  })
  .catch(() => {
    musicLyric.textContent = "爱很简单 · 陶喆";
  });

themeMusic.volume = 0.52;

const updateMusicUI = () => {
  const progress = themeMusic.duration ? themeMusic.currentTime / themeMusic.duration : 0;
  const progressValue = Math.round(progress * 1000);
  musicProgress.value = String(progressValue);
  musicProgress.style.setProperty("--music-progress", `${progress * 100}%`);
  musicTime.textContent = formatTime(themeMusic.currentTime);

  let nextLyricIndex = -1;
  for (let index = lyrics.length - 1; index >= 0; index -= 1) {
    if (themeMusic.currentTime >= lyrics[index].time) {
      nextLyricIndex = index;
      break;
    }
  }

  if (nextLyricIndex !== activeLyricIndex && nextLyricIndex >= 0) {
    activeLyricIndex = nextLyricIndex;
    musicLyric.classList.remove("is-changing");
    void musicLyric.offsetWidth;
    musicLyric.textContent = lyrics[nextLyricIndex].text;
    musicLyric.classList.add("is-changing");
  }
};

themeMusic.addEventListener("timeupdate", updateMusicUI);
themeMusic.addEventListener("play", () => {
  musicPlayer.classList.add("is-playing");
  musicToggle.setAttribute("aria-pressed", "true");
  musicAction.textContent = "暂停";
});
themeMusic.addEventListener("pause", () => {
  musicPlayer.classList.remove("is-playing");
  musicToggle.setAttribute("aria-pressed", "false");
  musicAction.textContent = "播放";
});

let musicStoppedByUser = false;

// The song finishes decrypting after the gate opens, so anything that starts
// playback has to wait for its blob URL first. The unbuilt copy points at the
// plain file through a <source> child instead, which leaves .src empty.
const hasSource = () =>
  Boolean(themeMusic.currentSrc || themeMusic.src || themeMusic.querySelector("source"));

const readyToPlay = async () => {
  await window.Vault?.audioReady;
  return hasSource();
};

musicToggle.addEventListener("click", async () => {
  if (musicPlayer.classList.contains("is-collapsed")) {
    musicPlayer.classList.remove("is-collapsed");
  }

  if (themeMusic.paused) {
    musicStoppedByUser = false;
    themeMusic.volume = 0.52;
    if (!hasSource()) musicLyric.textContent = "正在准备这首歌…";
    if (!(await readyToPlay())) {
      musicLyric.textContent = "这首歌没能解密出来，刷新一下再试。";
      return;
    }
    try {
      await themeMusic.play();
    } catch {
      musicLyric.textContent = "浏览器暂时无法播放，请再点一次。";
    }
  } else {
    musicStoppedByUser = true;
    themeMusic.pause();
  }
});

// The last candle is the cue for the song: it should already be playing while
// the fireworks go up.
window.addEventListener("cake-final-candle", async () => {
  if (!themeMusic.paused || musicStoppedByUser) return;

  themeMusic.volume = 0;
  if (!(await readyToPlay()) || !themeMusic.paused || musicStoppedByUser) return;
  try {
    await themeMusic.play();
  } catch {
    themeMusic.volume = 0.52;
    musicPlayer.classList.remove("is-collapsed");
    musicLyric.textContent = "点一下播放，让《爱很简单》陪着这场烟花。";
    return;
  }

  musicPlayer.classList.remove("is-collapsed");
  const startedAt = performance.now();
  const fadeIn = () => {
    const progress = Math.min((performance.now() - startedAt) / 2600, 1);
    themeMusic.volume = 0.52 * progress;
    if (progress < 1 && !themeMusic.paused) requestAnimationFrame(fadeIn);
  };
  fadeIn();
});

musicProgress.addEventListener("input", () => {
  if (!themeMusic.duration) return;
  themeMusic.currentTime = (Number(musicProgress.value) / 1000) * themeMusic.duration;
  updateMusicUI();
});

musicCollapse.addEventListener("click", () => {
  musicPlayer.classList.add("is-collapsed");
});

window.setTimeout(() => musicPlayer.classList.add("is-ready"), 120);
