/**
 * Password gate for static hosting.
 *
 * Photos and audio are shipped as AES-256-GCM blobs (see tools/build-vault.mjs),
 * so a direct URL only yields ciphertext. The key is derived from the password
 * with PBKDF2, never stored on the server, and the decrypted files only ever
 * exist as in-memory blob URLs.
 *
 * The gate only engages when the build marked the page with data-vault="on";
 * locally, where the plain files sit next to the page, every path resolves to
 * itself and the overlay never appears.
 */
(() => {
  const MANIFEST_URL = "./assets/vault/manifest.json";
  const SESSION_KEY = "museum-vault-pass";
  const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  const gate = document.querySelector("#vault-gate");
  const form = document.querySelector("#vault-form");
  const input = document.querySelector("#vault-pass");
  const note = document.querySelector("#vault-note");
  const defaultNote = note.textContent;

  const urls = new Map();
  const waiting = [];
  let manifest = null;
  let key = null;
  let unlocked = false;

  const normalize = (path) => String(path).replace(/^\.?\//, "");

  const fromBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

  const resolve = (path) => {
    if (!path || /^(data:|blob:|https?:)/.test(path)) return path;
    return urls.get(normalize(path)) ?? path;
  };

  const decryptFile = async (entry) => {
    const response = await fetch(`./assets/vault/${entry.id}.bin`, { cache: "force-cache" });
    if (!response.ok) throw new Error(`vault: cannot load ${entry.id}`);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(entry.iv) },
      key,
      await response.arrayBuffer(),
    );
    return URL.createObjectURL(new Blob([plain], { type: entry.type }));
  };

  const applyToDocument = () => {
    document.querySelectorAll("[data-vault-src]").forEach((element) => {
      element.src = resolve(element.dataset.vaultSrc);
    });

    document.querySelectorAll("[data-vault-bg]").forEach((element) => {
      element.style.backgroundImage = `url("${resolve(element.dataset.vaultBg)}")`;
    });

    document.querySelectorAll("[data-vault-audio]").forEach((element) => {
      element.src = resolve(element.dataset.vaultAudio);
      element.load();
    });
  };

  const finishUnlock = () => {
    unlocked = true;
    applyToDocument();
    document.body.classList.remove("is-locked");
    gate.hidden = true;
    while (waiting.length) waiting.shift()();
    window.dispatchEvent(new CustomEvent("vault-unlocked"));
  };

  const deriveKey = async (password) => {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: fromBase64(manifest.kdf.salt),
        iterations: manifest.kdf.iterations,
        hash: manifest.kdf.hash,
      },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  };

  const tryPassword = async (password) => {
    key = await deriveKey(password);
    try {
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromBase64(manifest.check.iv) },
        key,
        fromBase64(manifest.check.data),
      );
    } catch {
      key = null;
      return false;
    }
    return true;
  };

  const decryptEverything = async () => {
    const entries = Object.entries(manifest.files);
    let done = 0;

    await Promise.all(
      entries.map(async ([path, entry]) => {
        urls.set(normalize(path), await decryptFile(entry));
        done += 1;
        note.textContent = `正在解密回忆… ${done} / ${entries.length}`;
      }),
    );
  };

  const openWith = async (password, { fromSession = false } = {}) => {
    form.classList.remove("is-wrong");
    input.disabled = true;
    note.textContent = "正在验证…";

    if (!(await tryPassword(password))) {
      input.disabled = false;
      sessionStorage.removeItem(SESSION_KEY);
      if (fromSession) {
        note.textContent = defaultNote;
        return;
      }
      form.classList.add("is-wrong");
      note.textContent = "密码不对，再想一想。";
      input.value = "";
      input.focus();
      return;
    }

    try {
      await decryptEverything();
    } catch {
      input.disabled = false;
      note.textContent = "解密失败，刷新页面再试一次。";
      return;
    }

    sessionStorage.setItem(SESSION_KEY, password);
    finishUnlock();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = input.value.trim();
    if (password) openWith(password);
  });

  window.Vault = {
    resolve,
    get isUnlocked() {
      return unlocked;
    },
    whenUnlocked(callback) {
      if (unlocked) callback();
      else waiting.push(callback);
    },
  };

  if (document.body.dataset.vault !== "on") {
    // Unbuilt copy: the plain assets sit next to the page.
    finishUnlock();
    return;
  }

  document.querySelectorAll("[data-vault-src]").forEach((element) => {
    element.src = PLACEHOLDER;
  });

  fetch(MANIFEST_URL, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("vault: missing manifest");
      return response.json();
    })
    .then((data) => {
      manifest = data;
      const remembered = sessionStorage.getItem(SESSION_KEY);
      if (remembered) {
        openWith(remembered, { fromSession: true });
        return;
      }
      gate.classList.add("is-ready");
      input.focus();
    })
    .catch(() => {
      gate.classList.add("is-ready");
      note.textContent = "档案索引加载失败，刷新页面再试一次。";
    });
})();
