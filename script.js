/**
 * 宝宝起名向导 —— 起名算法 + 交互逻辑
 *
 * 算法团队：generateNames() 负责候选生成与打分排序
 * 工程团队：表单读取、卡片渲染、收藏、复制、本地存储
 */

(function () {
  "use strict";

  /* ----------------------------- 工具函数 ----------------------------- */

  // 取拼音声调（1-4，轻声记为 0），用于声调搭配评分
  function getTone(pinyin) {
    const toneMap = {
      ā: 1, ē: 1, ī: 1, ō: 1, ū: 1, ǖ: 1,
      á: 2, é: 2, í: 2, ó: 2, ú: 2, ǘ: 2,
      ǎ: 3, ě: 3, ǐ: 3, ǒ: 3, ǔ: 3, ǚ: 3,
      à: 4, è: 4, ì: 4, ò: 4, ù: 4, ǜ: 4,
    };
    for (const ch of pinyin) {
      if (toneMap[ch]) return toneMap[ch];
    }
    return 0;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* --------------------------- 核心起名算法 --------------------------- */

  /**
   * @param {Object} opts
   * @param {string} opts.surname    姓氏
   * @param {string} opts.gender     male | female | neutral
   * @param {number} opts.length     名字字数：1 或 2
   * @param {string[]} opts.tags     期望寓意标签
   * @param {string} opts.element    期望五行：'' 表示不限，否则 metal/wood/water/fire/earth
   * @param {string} opts.avoid      需要避免的字（连写）
   * @param {number} opts.count      返回数量
   * @returns {Array} 排序后的候选名字
   */
  function generateNames(opts) {
    const { surname, gender, length, tags, element, avoid, count } = opts;
    const avoidSet = new Set((avoid || "").split(""));
    const surnameTone = surname ? getTone((CHAR_BY_NAME[surname[0]] || {}).pinyin || "") : 0;

    // 候选字：性别匹配（中性字始终可用）且不在避免集合内
    const pool = CHAR_LIBRARY.filter((c) => {
      if (avoidSet.has(c.char)) return false;
      if (gender === "neutral") return true;
      return c.gender === gender || c.gender === "neutral";
    });

    const combos = [];

    if (length === 1) {
      for (const c of pool) combos.push([c]);
    } else {
      for (let i = 0; i < pool.length; i++) {
        for (let j = 0; j < pool.length; j++) {
          if (i === j) continue;
          combos.push([pool[i], pool[j]]);
        }
      }
    }

    const scored = combos.map((chars) => {
      const detail = scoreCombo(chars, { tags, element, gender, surnameTone });
      return {
        given: chars.map((c) => c.char).join(""),
        fullName: surname + chars.map((c) => c.char).join(""),
        chars,
        score: detail.score,
        reasons: detail.reasons,
      };
    });

    // 高分优先；同分内引入随机，保证每次生成有新鲜感
    scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);

    // 去重
    const seen = new Set();
    const unique = [];
    for (const item of scored) {
      if (seen.has(item.given)) continue;
      seen.add(item.given);
      unique.push(item);
    }
    if (!unique.length) return [];

    // 仅在“接近最高分”的优质候选中随机抽取：兼顾质量与多样性，
    // 同时避免把明显低分的名字混进结果里。
    const topScore = unique[0].score;
    const threshold = Math.max(topScore * 0.7, topScore - 12);
    let goodPool = unique.filter((it) => it.score >= threshold);
    if (goodPool.length < count) goodPool = unique.slice(0, count);

    return shuffle(goodPool).slice(0, count);
  }

  /** 对一个名字组合打分，并产出可读的推荐理由 */
  function scoreCombo(chars, ctx) {
    const { tags, element, gender, surnameTone } = ctx;
    let score = 0;
    const reasons = [];

    // 1) 寓意匹配：命中越多分越高
    if (tags && tags.length) {
      let hits = 0;
      const matchedTags = new Set();
      for (const c of chars) {
        for (const t of c.tags) {
          if (tags.includes(t)) {
            hits++;
            matchedTags.add(t);
          }
        }
      }
      score += hits * 14;
      if (matchedTags.size) {
        reasons.push(
          "契合「" +
            [...matchedTags].map((t) => TAG_LABELS[t]).join("、") +
            "」的期望"
        );
      }
    } else {
      score += 6; // 不限寓意时给基础分
    }

    // 2) 五行匹配 / 相生
    const elements = chars.map((c) => c.element);
    if (element) {
      const matched = elements.filter((e) => e === element).length;
      score += matched * 12;
      if (matched) {
        reasons.push("含五行属「" + ELEMENT_LABELS[element] + "」之字，补益命理");
      }
    }
    if (chars.length === 2) {
      const [a, b] = elements;
      if (ELEMENT_GENERATES[a] === b || ELEMENT_GENERATES[b] === a) {
        score += 10;
        reasons.push(
          "两字五行「" +
            ELEMENT_LABELS[a] +
            "、" +
            ELEMENT_LABELS[b] +
            "」相生，流通和谐"
        );
      } else if (a === b) {
        score += 3;
      }
    }

    // 3) 声调搭配：避免与姓氏及彼此同调，读起来更有抑扬
    const tones = chars.map((c) => getTone(c.pinyin));
    if (chars.length === 2 && tones[0] !== tones[1]) {
      score += 6;
      reasons.push("声调起伏有致，朗朗上口");
    }
    if (surnameTone && tones[0] && surnameTone !== tones[0]) {
      score += 3;
    }

    // 4) 性别贴合度：精确匹配性别的字略加分
    for (const c of chars) {
      if (gender !== "neutral" && c.gender === gender) score += 2;
    }

    // 5) 轻微随机扰动，避免结果过于死板
    score += Math.random() * 4;

    return { score, reasons };
  }

  /* ----------------------------- 数据索引 ----------------------------- */
  const CHAR_BY_NAME = {};
  for (const c of CHAR_LIBRARY) CHAR_BY_NAME[c.char] = c;

  /* ----------------------------- 收藏管理 ----------------------------- */
  const FAV_KEY = "baby_name_favorites";

  function loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveFavorites(list) {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  }
  function isFavorited(fullName) {
    return loadFavorites().some((f) => f.fullName === fullName);
  }
  function toggleFavorite(item) {
    const list = loadFavorites();
    const idx = list.findIndex((f) => f.fullName === item.fullName);
    if (idx >= 0) list.splice(idx, 1);
    else list.unshift({ fullName: item.fullName, given: item.given, pinyin: item.pinyin });
    saveFavorites(list);
    return idx < 0; // true 表示新增收藏
  }

  /* ----------------------------- 视图渲染 ----------------------------- */

  const $ = (sel) => document.querySelector(sel);

  function selectedTags() {
    return [...document.querySelectorAll('input[name="tag"]:checked')].map((el) => el.value);
  }

  function buildNamePinyin(chars) {
    return chars.map((c) => c.pinyin).join(" ");
  }

  function nameCard(item) {
    const pinyin = buildNamePinyin(item.chars);
    item.pinyin = pinyin;
    const fav = isFavorited(item.fullName);

    const charBlocks = item.chars
      .map(
        (c) => `
        <div class="char-block">
          <span class="char-text">${c.char}</span>
          <span class="char-pinyin">${c.pinyin}</span>
          <span class="char-tag">${ELEMENT_LABELS[c.element]}</span>
          <span class="char-meaning">${c.meaning}</span>
          <span class="char-source">${c.source}</span>
        </div>`
      )
      .join("");

    const reasons = item.reasons.length
      ? `<ul class="reasons">${item.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>`
      : "";

    const card = document.createElement("div");
    card.className = "name-card";
    card.innerHTML = `
      <div class="card-head">
        <div class="name-main">
          <span class="full-name">${item.fullName}</span>
          <span class="full-pinyin">${pinyin}</span>
        </div>
        <div class="card-actions">
          <button class="icon-btn copy-btn" title="复制名字" aria-label="复制名字">⧉</button>
          <button class="icon-btn fav-btn ${fav ? "active" : ""}" title="收藏" aria-label="收藏">${fav ? "♥" : "♡"}</button>
        </div>
      </div>
      <div class="char-grid">${charBlocks}</div>
      ${reasons}
    `;

    card.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard?.writeText(item.fullName);
      toast("已复制「" + item.fullName + "」");
    });
    const favBtn = card.querySelector(".fav-btn");
    favBtn.addEventListener("click", () => {
      const added = toggleFavorite(item);
      favBtn.classList.toggle("active", added);
      favBtn.textContent = added ? "♥" : "♡";
      toast(added ? "已加入收藏" : "已取消收藏");
      renderFavorites();
    });

    return card;
  }

  function renderResults(items) {
    const wrap = $("#result");
    wrap.innerHTML = "";
    if (!items.length) {
      wrap.innerHTML = `<p class="empty">没有符合条件的名字，试着放宽寓意或五行偏好～</p>`;
      return;
    }
    const grid = document.createElement("div");
    grid.className = "result-grid";
    items.forEach((it, i) => {
      const card = nameCard(it);
      card.style.animationDelay = i * 60 + "ms";
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  }

  function renderFavorites() {
    const list = loadFavorites();
    const box = $("#favorites");
    const section = $("#favSection");
    if (!list.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    box.innerHTML = "";
    list.forEach((f) => {
      const chip = document.createElement("div");
      chip.className = "fav-chip";
      chip.innerHTML = `<span>${f.fullName}</span><span class="fav-py">${f.pinyin || ""}</span><button class="chip-x" title="移除">×</button>`;
      chip.querySelector(".chip-x").addEventListener("click", () => {
        toggleFavorite({ fullName: f.fullName });
        renderFavorites();
      });
      box.appendChild(chip);
    });
  }

  let toastTimer;
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  /* ----------------------------- 事件绑定 ----------------------------- */

  function handleSubmit(e) {
    e.preventDefault();
    const surname = $("#surname").value.trim();
    if (!surname) {
      toast("请先输入姓氏");
      return;
    }
    const opts = {
      surname,
      gender: $("#gender").value,
      length: parseInt($("#length").value, 10),
      tags: selectedTags(),
      element: $("#element").value,
      avoid: $("#avoid").value.trim(),
      count: 6,
    };
    const names = generateNames(opts);
    renderResults(names);
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#nameForm").addEventListener("submit", handleSubmit);
    $("#regenerate").addEventListener("click", () => handleSubmit(new Event("submit")));
    renderFavorites();
  });

  // 便于将来做单元测试
  if (typeof window !== "undefined") {
    window.__nameEngine = { generateNames, scoreCombo, getTone };
  }
})();
