/* =========================================================================
   БЕКТЕЙЛФАН — бой в духе Undertale
   =========================================================================
   Всё, что касается СЮЖЕТА (реплики, атаки по порядку, предметы, ХП) —
   в объекте STORY чуть ниже. Настройки типа скорости/размеров — в SETTINGS.
   Движок (второй большой блок файла) трогать не обязательно.
========================================================================= */

const SETTINGS = {
  soulSpeed: 170,      // скорость души стрелками
  soulSize: 13,        // было 8 — сердце теперь заметно крупнее
  appleSize: 30,       // макс. сторона спрайта яблока в бою (px), атака 1 (кольцо)
  appleSizeBig: 42,    // размер яблок в атаке 2 (случайные яблоки) — покрупнее
  aksiySpriteHeight: 170,
  blasterSpriteHeight: 140,
  blasterRotationOffset: Math.PI/2, // если бластер целится "спиной вперёд" — поставь -Math.PI/2
};

const STORY = {
  player: { name: "ЧЕЛОВЕК", maxHp: 69, lv: 1 },
  enemy: { name: "АКСИЙ", maxHp: 400 },

  // Вступительные реплики самого Аксия — идут в облачке у его головы
  introLines: [
    "Ну что ж, ты не приходишь на стримы, не донатишь мне деньги...",
    "Мне что, по-твоему, надо на РАБОТУ идти?",
    "Мне, породистому контент-мейкеру...",
    "НА РАБОТУ??!!?!",
    "Давай сюда деньги..."
  ],

  // Реплика Аксия перед второй/следующими атаками, если был выбран ACT
  maloLine: ["Мало..."],

  // Фоновые реплики, которые висят в диалоговом окне рядом с кнопками
  // FIGHT/ACT/ITEM/MERCY, пока игрок не сделает выбор (как в оригинальном
  // Андертейле). Показываются в случайном порядке.
  menuFlavors: [
    "Аксий расслаблен.",
    "Аксий до сих пор спокоен.",
    "Аксий выжидает.",
    "Аксий попивает Псыж, который ему заказали за баллы.",
    "Бекфан даже не подозревает о существовании Гартика.",
    "Аксий Бекфан увлечённо читает чат.",
    "Аксий поправляет свет, чтобы ракурс был выгоднее.",
    "В чате снова спрашивают про донат-цели.",
    "Аксий незаметно проверяет количество зрителей.",
  ],

  // Реплика перед конкретной атакой — показывается один раз перед тем, как
  // атака начнётся (текстовое окно с "кликом"). Если для атаки нет своей
  // строки — используется generic.
  attackIntros: {
    appleRing: ["Яблоки смыкаются кольцом вокруг тебя..."],
    randomApples: ["Аксий разбрасывает яблоки во все стороны!"],
    appleColumns: ["Яблоки посыпались сверху дождём..."],
    blasterBottles: ["Аксий откупоривает бутылки..."],
    sunSpin: ["Солнце Аксия раскалено докрасна..."],
    sunHeat: ["Воздух над ареной дрожит от зноя..."],
    generic: ["Аксий готовит новую атаку..."],
  },

  actOptions: [
    {
      name: "Задонатить",
      text: ["Ты закинул донат Аксию.", "Он выглядит слегка довольным."],
      leadsToMalo: true
    },
    {
      name: "Осмотреть",
      text: ["Микрознаменитость интернета, АКСИЙ бэкфан.", "400 HP. Имеет комьюнити, во всех смыслах."],
      leadsToMalo: true
    }
  ],

  // limit — сколько раз можно использовать предмет за один бой (нет limit — без ограничений)
  items: [
    { name: "Псыж", heal: 25, limit: 5, text: ["Ты используешь Псыж.", "ХП восстановлено на 25."] },
    { name: "Ковёр синий", heal: 100, limit: 1, text: ["Ты укутался в синий ковёр.", "ХП восстановлено на 100."] }
  ],

  hurtLines: ["Аксий вздрагивает от удара.", "Прямое попадание!"],
  spareLines: ["Аксий больше не хочет драться.", "Ты пощадил АКСИЯ."],
  // Пощада, пока Аксий ещё не готов, злит его — атаки становятся сильнее,
  // так что щадить его просто так уже не выгодная стратегия.
  notReadyLines: ["Аксий ещё не готов к пощаде.", "Аксий недоволен: его атаки становятся злее!"],
  itemEmptyLines: ["У тебя больше не осталось этого предмета."],

  // Последние слова Аксия и его "гибель", если довести ХП до 0 и добить,
  // не пощадив (вместо этого выбрать FIGHT ещё раз).
  deathSpeech: [
    "Так... даже это не помогло...",
    "Ладно, признаю — стрим всё равно почти закончился.",
    "Не забудьте зайти в чат после того, как... а, неважно.",
    "GG."
  ],
  deathCollapseLines: [
    "Из АКСИЯ высыпаются сотни Псыжей.",
    "Он рассыпается на глазах, оставляя после себя лишь пустоту."
  ],

  // Порядок атак: первая идёт сразу после вступления (без меню и без музыки).
  // Дальше после каждого выбора игрока идёт следующая атака по кругу:
  // яблоки -> бластеры -> "ещё что-нибудь" (случайно: солнце/зной/новый узор
  // яблок) -> яблоки -> бластеры -> ... Количество бластеров растёт каждый
  // круг (2, 3, 4, 5... без потолка) — см. blasterLevel в движке.
  firstAttack: "appleRing",
  attackCycle: ["randomApples", "blasterBottles", "extraAttack"],
};

// Атаки, из которых случайно выбирается "ещё что-нибудь" в цикле выше.
// Солнечные атаки встречаются чаще (2 из 3), чтобы солнце не было редкостью.
const EXTRA_ATTACK_POOL = ["sunSpin", "sunHeat", "appleColumns"];

const ASSETS = {
  images: {
    aksiy: "assets/aksiy.png",
    blaster: "assets/blaster.png",
    apple1: "assets/apple1.png",
    apple2: "assets/apple2.png",
    apple3: "assets/apple3.png",
    btnFightNormal: "assets/btn_fight_normal.png",
    btnFightSelected: "assets/btn_fight_selected.png",
    btnActNormal: "assets/btn_act_normal.png",
    btnActSelected: "assets/btn_act_selected.png",
    btnItemNormal: "assets/btn_item_normal.png",
    btnItemSelected: "assets/btn_item_selected.png",
    btnMercyNormal: "assets/btn_mercy_normal.png",
    btnMercySelected: "assets/btn_mercy_selected.png",
    sun: "assets/sun.png",
    channelBanned: "assets/channel_banned.jpg",
  },
  audio: {
    menuMusic: "assets/menu_music.mp3",
    battleMusic: "assets/battle_music.mp3",
    select: "assets/select.mp3",
    move: "assets/menu_move.mp3",
    // были .m4a (AAC) — в части браузеров (напр. Firefox на Linux без
    // системного кодека) такой файл тихо не проигрывался, отсюда "нет звука
    // текста". Перегнали в mp3 для стабильной поддержки везде.
    textBlip: "assets/text_blip.mp3",
    voiceAksiy: "assets/voice_aksiy.mp3",
    blaster1: "assets/blaster1.ogg",
    blaster2: "assets/blaster2.ogg",
    hurt: "assets/damage_taken.mp3",       // получение урона ИГРОКОМ (от пуль)
    bossHit: "assets/boss_hit.mp3",              // звук УДАРА по боссу
    bossDamageTaken: "assets/boss_damage_taken.mp3", // звук получения урона БОССОМ
  }
};

/* =========================================================================
   ==========================  ДВИЖОК  =====================================
========================================================================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const ACCENT = "#8fd2ea", WHITE = "#ffffff"; // голубой стиль вместо жёлтого — везде, где раньше был жёлтый акцент

/* ---------- детект тач-устройства: показываем кнопки только там ---------- */
const IS_TOUCH = ('ontouchstart' in window) || matchMedia('(pointer:coarse)').matches;
if (IS_TOUCH) document.body.classList.add('touch');

/* ---------- загрузка ассетов ---------- */
const IMG = {}, AUD = {};
let assetsToLoad = 0, assetsLoaded = 0;

function preload(cb){
  const imgKeys = Object.keys(ASSETS.images);
  const audKeys = Object.keys(ASSETS.audio);
  assetsToLoad = imgKeys.length + audKeys.length;
  let done = false; // защита: cb() должен выполниться ровно один раз

  imgKeys.forEach(k=>{
    const im = new Image();
    im.onload = ()=>{ im.onload=null; im.onerror=null; tick(); };
    im.onerror = ()=>{ im.onload=null; im.onerror=null; tick(); };
    im.src = ASSETS.images[k];
    IMG[k] = im;
  });
  audKeys.forEach(k=>{
    const a = new Audio();
    // canplaythrough может сработать повторно (например, при перезапуске
    // музыки/звука в бою через currentTime=0+play), поэтому обязательно
    // снимаем обработчики сразу после первого срабатывания
    const onReady = ()=>{ a.oncanplaythrough=null; a.onerror=null; tick(); };
    a.oncanplaythrough = onReady; a.onerror = onReady;
    a.src = ASSETS.audio[k];
    a.preload = "auto";
    AUD[k] = a;
  });
  function tick(){
    assetsLoaded++;
    const pct = Math.round(Math.min(100, assetsLoaded/assetsToLoad*100));
    const gateEl = document.getElementById('gate');
    if(gateEl && !gateEl.dataset.ready) gateEl.firstElementChild.textContent = "ЗАГРУЗКА... " + pct + "%";
    if(!done && assetsLoaded >= assetsToLoad){ done = true; cb(); }
  }
}

/* ---------- звук: коротко один раз (клоны, чтобы не резать друг друга) ---------- */
function sfx(key){
  const src = AUD[key];
  if(!src) return;
  try { const c = src.cloneNode(); c.volume = src.volume; c.play().catch(()=>{}); } catch(e){}
}
let currentMusic = null;
function playMusic(key){
  stopMusic();
  const a = AUD[key];
  if(!a) return;
  a.loop = true; a.currentTime = 0;
  a.play().catch(()=>{});
  currentMusic = a;
}
function stopMusic(){ if(currentMusic){ currentMusic.pause(); currentMusic = null; } }

let currentTypeAudio = null;
function startTypeSound(mode){
  stopTypeSound();
  const a = AUD[mode === 'aksiy' ? 'voiceAksiy' : 'textBlip'];
  if(!a) return;
  a.loop = true; a.currentTime = 0;
  a.play().catch(()=>{});
  currentTypeAudio = a;
}
function stopTypeSound(){ if(currentTypeAudio){ currentTypeAudio.pause(); currentTypeAudio = null; } }

function unlockAudio(){
  // требуется жест пользователя, иначе браузер блокирует звук.
  // Возвращаем promise и ждём его перед реальным playMusic(), иначе
  // отложенный .pause()/.currentTime=0 из этой разблокировки может
  // заглушить музыку, которую мы запускаем сразу следом.
  return Promise.all(Object.values(AUD).map(a=>{
    return a.play().then(()=>{ a.pause(); a.currentTime = 0; }).catch(()=>{});
  }));
}

/* ---------- состояние игры ---------- */
let state = "loading"; // loading -> gate -> mainmenu -> ...
let mainMenuIndex = 0;

let player = { hp: STORY.player.maxHp, maxHp: STORY.player.maxHp };
let enemy  = { hp: STORY.enemy.maxHp, maxHp: STORY.enemy.maxHp, spared:false };

let battleMenuIndex = 0;
let subMenuIndex = 0;

// Фоновая реплика в меню боя (висит рядом с кнопками, пока не сделан выбор)
let battleFlavorText = "";
let flavorChar = 0, flavorTimer = 0;
function pickFlavor(){
  const pool = STORY.menuFlavors;
  let idx = Math.floor(Math.random()*pool.length);
  if(pool.length>1 && pool[idx]===battleFlavorText) idx = (idx+1)%pool.length;
  battleFlavorText = pool[idx];
  flavorChar = 0; flavorTimer = 0;
}

// Растёт на 1 за каждую неудачную попытку пощады — атаки после этого злее
let mercyPenalty = 0;

// Таймер чёрного экрана после гибели Аксия (перед финальной картинкой)
let killTimer = 0;
const KILL_BLACKOUT_SECONDS = 3.0;

let textLines = [], textIdx = 0, textChar = 0, textTimer = 0, textMode = "system", textCb = null;

// Область уворота выровнена по нижнему краю с текстовым окном (y+h=410),
// чтобы полоса ХП игрока (теперь ниже, см. drawHUD) никогда не наслаивалась.
let box = { x: 190, y: 280, w: 260, h: 130 };
let soul = { x:0, y:0, size: SETTINGS.soulSize, invul: 0 };

// ХП босса показываем только на несколько секунд после удара, а не всегда
let enemyHpVisibleTimer = 0;
const ENEMY_HP_VISIBLE_SECONDS = 4.0;

let attackName = null;
let attackTimer = 0;
let attackDuration = 0;
let attackData = {}; // произвольные данные текущей атаки
let bullets = [];    // {kind:'sprite', x,y,vx,vy,size,img} или {kind:'beam', x,y,angle,length,width,active}
let attackCycleIndex = 0;
let blasterLevel = 2;  // сколько бластеров появится в след. blasterBottles (растёт каждый круг, макс. 7)
let itemUses = {};      // счётчик использований предметов за бой (для limit)

let fightBar = { pos:0, dir:1, speed:520, active:false };

/* ---------- ввод (клавиатура) ---------- */
const keysDown = {};
window.addEventListener("keydown", e=>{
  const k = e.code;
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(k)) e.preventDefault();
  if(!keysDown[k]) handlePress(k);
  keysDown[k] = true;
});
window.addEventListener("keyup", e=>{ keysDown[e.code] = false; });
function pressed(k){ return !!keysDown[k]; }

/* ---------- ввод (тач-кнопки) ---------- */
function bindTouch(id, code){
  const el = document.getElementById(id);
  if(!el) return;
  const start = ev=>{ ev.preventDefault(); if(!keysDown[code]) handlePress(code); keysDown[code]=true; el.classList.add('active'); };
  const end   = ev=>{ ev.preventDefault(); keysDown[code]=false; el.classList.remove('active'); };
  el.addEventListener('touchstart', start, {passive:false});
  el.addEventListener('touchend', end, {passive:false});
  el.addEventListener('touchcancel', end, {passive:false});
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', end);
  el.addEventListener('mouseleave', end);
}
bindTouch('dUp','ArrowUp'); bindTouch('dDown','ArrowDown');
bindTouch('dLeft','ArrowLeft'); bindTouch('dRight','ArrowRight');
bindTouch('btnZ','KeyZ'); bindTouch('btnX','KeyX');

/* ---------- обработка "нажатий" (разово, не удержание) ---------- */
function handlePress(k){
  const Z = k === "KeyZ" || k === "Enter";
  const X = k === "KeyX" || k === "Escape";
  const UP=k==="ArrowUp", DOWN=k==="ArrowDown", LEFT=k==="ArrowLeft", RIGHT=k==="ArrowRight";

  if(state === "gate"){
    document.getElementById('gate').classList.add('hidden');
    state = "mainmenu";
    unlockAudio().then(()=>{ playMusic('menuMusic'); });
    return;
  }

  if(state === "mainmenu"){
    if(UP||DOWN){ mainMenuIndex = 1-mainMenuIndex; sfx('move'); }
    if(Z){ sfx('select'); if(mainMenuIndex===0) startBattle(); else state="details"; }
  }
  else if(state === "details"){
    if(Z||X){ sfx('select'); state = "mainmenu"; }
  }
  else if(state === "textbox"){
    if(Z) advanceText();
  }
  else if(state === "battlemenu"){
    if(LEFT){ battleMenuIndex=(battleMenuIndex+3)%4; sfx('move'); }
    if(RIGHT){ battleMenuIndex=(battleMenuIndex+1)%4; sfx('move'); }
    if(Z){ sfx('select'); chooseBattleAction(); }
  }
  else if(state === "actmenu"){
    const n = STORY.actOptions.length;
    if(UP){ subMenuIndex=(subMenuIndex+n-1)%n; sfx('move'); }
    if(DOWN){ subMenuIndex=(subMenuIndex+1)%n; sfx('move'); }
    if(Z){
      sfx('select');
      const opt = STORY.actOptions[subMenuIndex];
      showText(opt.text, "system", ()=>{
        if(opt.leadsToMalo){
          showText(STORY.maloLine, "aksiy", ()=>{ startEnemyTurn(); });
        } else { startEnemyTurn(); }
      });
    }
    if(X){ sfx('select'); state="battlemenu"; pickFlavor(); }
  }
  else if(state === "itemmenu"){
    const n = STORY.items.length;
    if(UP){ subMenuIndex=(subMenuIndex+n-1)%n; sfx('move'); }
    if(DOWN){ subMenuIndex=(subMenuIndex+1)%n; sfx('move'); }
    if(Z){
      sfx('select');
      const it = STORY.items[subMenuIndex];
      const used = itemUses[it.name]||0;
      if(it.limit && used>=it.limit){
        showText(STORY.itemEmptyLines, "system", ()=>{ state="itemmenu"; });
        return;
      }
      itemUses[it.name] = used+1;
      player.hp = Math.min(player.maxHp, player.hp+it.heal);
      showText(it.text, "system", ()=>{ startEnemyTurn(); });
    }
    if(X){ sfx('select'); state="battlemenu"; pickFlavor(); }
  }
  else if(state === "mercymenu"){
    // побег убран — единственный вариант тут "Пощадить"
    if(Z){
      sfx('select');
      if(enemy.hp<=0 || enemy.spared){
        showText(STORY.spareLines, "system", ()=>{ stopMusic(); state="victory"; });
      } else {
        mercyPenalty++;
        showText(STORY.notReadyLines, "system", ()=>{ startEnemyTurn(); });
      }
    }
    if(X){ sfx('select'); state="battlemenu"; pickFlavor(); }
  }
  else if(state === "fightbar"){
    if(Z && fightBar.active){
      fightBar.active = false;
      // Аксий уже повержен — этот удар не бой, а добивающий (без миниигры урона)
      if(enemy.hp<=0 && !enemy.spared){ startKillSequence(); return; }
      const dist = Math.abs(fightBar.pos - W/2);
      const acc = Math.max(0, 1-dist/260);
      const dmg = Math.round(4+acc*22);
      // сперва звук самого удара, затем (с небольшой задержкой) звук
      // получения урона боссом — и уже тогда применяем урон и текст
      sfx('bossHit');
      setTimeout(()=>{
        sfx('bossDamageTaken');
        enemy.hp = Math.max(0, enemy.hp-dmg);
        enemyHpVisibleTimer = ENEMY_HP_VISIBLE_SECONDS;
        const line = STORY.hurtLines[Math.floor(Math.random()*STORY.hurtLines.length)];
        showText([line + "  (-" + dmg + " HP)"], "system", ()=>{
          if(enemy.hp<=0){ showText(["АКСИЙ едва держится на ногах."], "system", ()=>{ state="battlemenu"; pickFlavor(); }); }
          else { startEnemyTurn(); }
        });
      }, 300);
    }
  }
  else if(state === "victory" || state === "gameover"){
    if(Z){
      sfx('select');
      if(state==="victory"){ state="mainmenu"; }
      else { startBattle(); }
    }
  }
  else if(state === "kill_end"){
    if(Z){ sfx('select'); state="mainmenu"; }
  }
}

/* ---------- текстовые окна (обычный текст + реплики Аксия) ---------- */
function showText(lines, mode, cb){
  textLines = lines; textIdx=0; textChar=0; textTimer=0;
  textMode = mode; textCb = cb;
  state = "textbox";
  startTypeSound(mode);
}
function advanceText(){
  const line = textLines[textIdx] || "";
  if(textChar < line.length){ textChar = line.length; stopTypeSound(); return; }
  textIdx++; textChar = 0;
  if(textIdx >= textLines.length){
    stopTypeSound();
    const cb = textCb; textCb = null;
    if(cb) cb();
  } else {
    startTypeSound(textMode);
  }
}

/* ---------- запуск боя ---------- */
function startBattle(){
  player.hp = STORY.player.maxHp;
  enemy.hp = STORY.enemy.maxHp;
  enemy.spared = false;
  battleMenuIndex = 0;
  attackCycleIndex = 0;
  blasterLevel = 2;
  itemUses = {};
  mercyPenalty = 0;
  stopMusic(); // во вступлении и первой атаке музыки ещё нет
  showText(STORY.introLines, "aksiy", ()=>{
    runAttack(STORY.firstAttack, true);
  });
}

function chooseBattleAction(){
  if(battleMenuIndex===0) startFightBar();
  else if(battleMenuIndex===1){ subMenuIndex=0; state="actmenu"; }
  else if(battleMenuIndex===2){ subMenuIndex=0; state="itemmenu"; }
  else if(battleMenuIndex===3){ subMenuIndex=0; state="mercymenu"; }
}
function startFightBar(){ fightBar.pos=0; fightBar.dir=1; fightBar.active=true; state="fightbar"; }

/* следующий ход врага: показываем краткую реплику-предупреждение о том,
   какая именно атака сейчас начнётся, затем запускаем её */
function startEnemyTurn(){
  const rawName = STORY.attackCycle[attackCycleIndex % STORY.attackCycle.length];
  attackCycleIndex++;

  let name = rawName, preset = null;
  if(rawName === "extraAttack"){
    name = EXTRA_ATTACK_POOL[Math.floor(Math.random()*EXTRA_ATTACK_POOL.length)];
  } else if(rawName === "blasterBottles"){
    preset = { count: blasterLevel };
  }

  const intro = STORY.attackIntros[name] || STORY.attackIntros.generic;
  showText(intro, "aksiy", ()=>{
    if(!currentMusic) playMusic('battleMusic');
    runAttack(name, false, preset);
  });
}

function runAttack(name, silent, presetData){
  attackName = name;
  bullets = [];
  attackData = Object.assign({}, presetData||{});
  soul.x = box.x+box.w/2; soul.y = box.y+box.h/2; soul.invul = 0;
  const def = ATTACKS[name];
  attackDuration = def.duration;
  attackTimer = 0;
  if(def.init) def.init(attackData, box);
  state = "dodge";
}

/* ---------- добивающий удар: Аксий произносит последние слова и исчезает ---------- */
function startKillSequence(){
  stopMusic();
  showText(STORY.deathSpeech, "aksiy", ()=>{
    showText(STORY.deathCollapseLines, "system", ()=>{
      state = "kill_blackout";
      killTimer = 0;
    });
  });
}

/* =========================================================================
   ==================  ОПИСАНИЯ АТАК  ======================================
   Хочешь свою атаку — добавь сюда объект { duration, init(data,box),
   update(dt, data, box, soul, dealHit), draw(ctx, data) } и впиши имя
   в STORY.firstAttack или STORY.attackCycle.
========================================================================= */
function appleImgByRandom(){
  const keys = ["apple1","apple2","apple3"];
  return IMG[keys[Math.floor(Math.random()*keys.length)]];
}
function fitSize(img, maxSide){
  if(!img || !img.naturalWidth) return {w:maxSide,h:maxSide};
  const r = img.naturalWidth/img.naturalHeight;
  return r>=1 ? {w:maxSide, h:maxSide/r} : {w:maxSide*r, h:maxSide};
}

const ATTACKS = {

  // === Атака 1: кольцо из яблок, которое быстро схлопывается ===
  appleRing: {
    duration: 5.2,
    init(data, box){
      data.bursts = [0.15, 1.7, 3.25]; // моменты запуска новых колец (сек)
      data.done = [];
    },
    update(dt, data, box, soul, dealHit){
      const cx = box.x+box.w/2, cy = box.y+box.h/2;
      data.t = (data.t||0) + dt;
      data.bursts.forEach((tBurst, i)=>{
        if(!data.done[i] && data.t >= tBurst){
          data.done[i] = true;
          const N = 10, R = 175, travel = 0.85;
          for(let j=0;j<N;j++){
            const a = (j/N)*Math.PI*2;
            const sx = cx+Math.cos(a)*R, sy = cy+Math.sin(a)*R;
            const speed = R/travel;
            bullets.push({
              kind:"sprite", img: appleImgByRandom(),
              x:sx, y:sy, vx:(cx-sx)/travel*dt*0, // заполним ниже
              size: SETTINGS.appleSize
            });
            const b = bullets[bullets.length-1];
            b.vx = (cx-sx)/R*speed;
            b.vy = (cy-sy)/R*speed;
          }
        }
      });
      bullets.forEach(b=>{ b.x += b.vx*dt; b.y += b.vy*dt; });
      bullets = bullets.filter(b => Math.hypot(b.x-cx,b.y-cy) < 260);
      // столкновение с яблоками считает общий круговой чек в update() ниже —
      // раньше тут был лишний безусловный вызов dealHit(), из-за которого
      // игрок получал урон каждый кадр, даже стоя на месте, не касаясь яблок.
    },
    draw(){}
  },

  // === Атака 2: яблоки летят в случайных направлениях со всех сторон ===
  randomApples: {
    duration: 6.5,
    init(data, box){ data.timer = 0; },
    update(dt, data, box, soul, dealHit){
      data.timer -= dt;
      if(data.timer <= 0){
        data.timer = 0.26 + Math.random()*0.14; // чуть чаще, чем было (0.32-0.5 -> 0.26-0.4)
        const cx = box.x+box.w/2, cy = box.y+box.h/2;
        const side = Math.floor(Math.random()*4);
        let x,y;
        if(side===0){ x=box.x-15; y=box.y+Math.random()*box.h; }
        else if(side===1){ x=box.x+box.w+15; y=box.y+Math.random()*box.h; }
        else if(side===2){ x=box.x+Math.random()*box.w; y=box.y-15; }
        else { x=box.x+Math.random()*box.w; y=box.y+box.h+15; }
        // общее направление внутрь коробки + случайный разброс
        const baseAngle = Math.atan2(cy-y, cx-x);
        const spread = (Math.random()-0.5) * Math.PI*0.9;
        const ang = baseAngle + spread;
        const speed = 100 + Math.random()*90;
        bullets.push({ kind:"sprite", img: appleImgByRandom(), x, y,
          vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed, size: SETTINGS.appleSizeBig });
      }
      bullets.forEach(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; });
      bullets = bullets.filter(b=> b.x>-40 && b.x<W+40 && b.y>-40 && b.y<H+40);
      // см. комментарий в appleRing — тот же лишний вызов был и тут.
    },
    draw(){}
  },

  // === Атака 3 (N бутылок-бластеров, N растёт с каждым кругом) ===
  // Фазы: 5 сек наводятся на душу -> 1 сек замирают (короткая пауза без
  // предупреждающего огонька) -> 2 сек стреляют лучом. Расставлены равномерно
  // по кругу вокруг коробки уворота.
  blasterBottles: {
    duration: 8.0, // 5 (наведение) + 1 (пауза) + 2 (выстрел)
    init(data, box){
      data.appeared = false;
      data.trackSeconds = 5.0;
      data.waitSeconds = 1.0;   // было 3.0 — слишком долгое ожидание после прицела
      data.fireSeconds = 2.0;

      const count = Math.max(2, data.count || 2); // сколько бластеров в этот раз
      const m = 90; // отступ от коробки наружу
      const cx = box.x+box.w/2, cy = box.y+box.h/2;
      const rx = box.w/2 + m, ry = box.h/2 + m;
      const baseAngle = Math.random()*Math.PI*2;
      data.blasters = [];
      for(let i=0;i<count;i++){
        const a = baseAngle + (i/count)*Math.PI*2;
        data.blasters.push({ x: cx+Math.cos(a)*rx, y: cy+Math.sin(a)*ry, angle:0, locked:false, alpha:0 });
      }
    },
    update(dt, data, box, soul, dealHit){
      data.t = (data.t||0)+dt;
      const fireStart = data.trackSeconds + data.waitSeconds;
      if(!data.appeared){
        data.appeared = true;
        sfx('blaster1');
      }
      data.blasters.forEach(b=>{
        b.alpha = Math.min(1, b.alpha + dt/0.4);
        if(data.t < data.trackSeconds){
          b.angle = Math.atan2(soul.y-b.y, soul.x-b.x); // следят за душой
        } else if(!b.locked){
          b.locked = true; // после 5 сек — замирают, дальше не двигаются
        }
      });
      if(data.t >= fireStart && !data.firedSound){
        data.firedSound = true;
        sfx('blaster2');
      }
      // урон от струи — только во время фазы выстрела
      if(data.t >= fireStart){
        data.blasters.forEach(b=>{
          const len = 650, width = 22;
          const dx = soul.x-b.x, dy = soul.y-b.y;
          const local_x = dx*Math.cos(-b.angle) - dy*Math.sin(-b.angle);
          const local_y = dx*Math.sin(-b.angle) + dy*Math.cos(-b.angle);
          if(local_x>=0 && local_x<=len && Math.abs(local_y)<=width/2){
            dealHit(1);
          }
        });
      }
    },
    draw(ctx, data){
      const img = IMG.blaster;
      const size = fitSize(img, SETTINGS.blasterSpriteHeight);
      const fireStart = data.trackSeconds + data.waitSeconds;
      data.blasters.forEach(b=>{
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle + SETTINGS.blasterRotationOffset);
        if(img && img.naturalWidth) ctx.drawImage(img, -size.w/2, -size.h/2, size.w, size.h);
        ctx.restore();

        if(data.t >= fireStart){
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.translate(b.x,b.y);
          ctx.rotate(b.angle);
          ctx.fillStyle = "#6fd6ff";
          ctx.fillRect(0,-11,650,22);
          ctx.restore();
        }
      });
    }
  },

  // === Атака 4: вращающееся солнце с лучами (крутится, лучи задевают уворот) ===
  sunSpin: {
    duration: 7.0,
    init(data, box){
      data.cx = box.x+box.w/2; data.cy = box.y+box.h/2;
      data.angle = Math.random()*Math.PI*2;
      data.rayCount = 3;
      data.rotSpeed = 1.7;      // рад/сек
      data.rayLength = 300;     // не на всю карту, но длиннее коробки
      data.rayWidth = 20;
      data.alpha = 0;
    },
    update(dt, data, box, soul, dealHit){
      data.alpha = Math.min(1, data.alpha + dt/0.4);
      data.angle += data.rotSpeed*dt;
      for(let i=0;i<data.rayCount;i++){
        const a = data.angle + (i/data.rayCount)*Math.PI*2;
        const dx = soul.x-data.cx, dy = soul.y-data.cy;
        const lx = dx*Math.cos(-a) - dy*Math.sin(-a);
        const ly = dx*Math.sin(-a) + dy*Math.cos(-a);
        if(lx>=0 && lx<=data.rayLength && Math.abs(ly)<=data.rayWidth/2){
          dealHit(1);
        }
      }
    },
    draw(ctx, data){
      ctx.save();
      ctx.globalAlpha = data.alpha;
      for(let i=0;i<data.rayCount;i++){
        const a = data.angle + (i/data.rayCount)*Math.PI*2;
        ctx.save();
        ctx.translate(data.cx, data.cy);
        ctx.rotate(a);
        const grad = ctx.createLinearGradient(0,0,data.rayLength,0);
        grad.addColorStop(0, "rgba(255,224,130,0.95)");
        grad.addColorStop(1, "rgba(255,224,130,0.12)");
        ctx.fillStyle = grad;
        ctx.fillRect(0,-data.rayWidth/2,data.rayLength,data.rayWidth);
        ctx.restore();
      }
      const img = IMG.sun;
      if(img && img.naturalWidth){
        const size = fitSize(img, 74);
        ctx.save();
        ctx.translate(data.cx, data.cy);
        ctx.rotate(data.angle*0.6);
        ctx.drawImage(img, -size.w/2, -size.h/2, size.w, size.h);
        ctx.restore();
      }
      ctx.restore();
    }
  },

  // === Атака 5: раскалённое солнце — вся коробка "печёт", кроме плавающего
  // прохладного пятна тени, за которым нужно успевать (другой тип уворота —
  // не снаряды, а позиционирование) ===
  sunHeat: {
    duration: 7.5,
    init(data, box){
      data.cx = box.x+box.w/2; data.cy = box.y+box.h/2;
      data.shadowR = 46;
      data.t = 0;
      data.phase = Math.random()*Math.PI*2;
    },
    update(dt, data, box, soul, dealHit){
      data.t += dt;
      const rx = box.w/2-40, ry = box.h/2-30;
      data.shadowX = data.cx + Math.sin(data.t*0.9+data.phase)*rx;
      data.shadowY = data.cy + Math.sin(data.t*1.4+data.phase*1.7)*ry;
      const dist = Math.hypot(soul.x-data.shadowX, soul.y-data.shadowY);
      // урон идёт тиками — dealHit сам не даст бить чаще раза в ~0.9с (invul)
      if(dist > data.shadowR) dealHit(2);
    },
    draw(ctx, data){
      ctx.save();
      ctx.fillStyle = "rgba(255,140,40,0.16)";
      ctx.fillRect(box.x, box.y, box.w, box.h);
      const grad = ctx.createRadialGradient(data.shadowX,data.shadowY,4,data.shadowX,data.shadowY,data.shadowR);
      grad.addColorStop(0,"rgba(90,120,150,0.92)");
      grad.addColorStop(1,"rgba(90,120,150,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(data.shadowX,data.shadowY,data.shadowR,0,Math.PI*2); ctx.fill();
      const img = IMG.sun;
      if(img && img.naturalWidth){
        const size = fitSize(img, 46);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(img, data.cx-size.w/2, box.y-size.h/2-14, size.w, size.h);
      }
      ctx.restore();
    }
  },

  // === Атака 6: яблоки падают колоннами сверху, с одним безопасным проходом ===
  appleColumns: {
    duration: 6.0,
    init(data, box){ data.timer = 0; data.spawnEvery = 0.55; },
    update(dt, data, box, soul, dealHit){
      data.timer -= dt;
      if(data.timer <= 0){
        data.timer = data.spawnEvery;
        const cols = 5;
        const gapCol = Math.floor(Math.random()*cols);
        for(let c=0;c<cols;c++){
          if(c===gapCol) continue; // безопасный проход
          const x = box.x + (c+0.5)*(box.w/cols);
          bullets.push({ kind:"sprite", img: appleImgByRandom(), x, y: box.y-20,
            vx:0, vy: 150+Math.random()*40, size: SETTINGS.appleSize });
        }
      }
      bullets.forEach(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; });
      bullets = bullets.filter(b=> b.y < box.y+box.h+40);
      // столкновение считает общий круговой чек в update() ниже
    },
    draw(){}
  },
};

/* =========================================================================
   ==========================  ЦИКЛ И ОТРИСОВКА  ============================
========================================================================= */
let last = performance.now();
function loop(now){
  const dt = Math.min(0.033, (now-last)/1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt){
  if(enemyHpVisibleTimer>0) enemyHpVisibleTimer = Math.max(0, enemyHpVisibleTimer-dt);

  if(state === "dodge"){
    const s = SETTINGS.soulSpeed*dt;
    if(pressed("ArrowLeft")) soul.x -= s;
    if(pressed("ArrowRight")) soul.x += s;
    if(pressed("ArrowUp")) soul.y -= s;
    if(pressed("ArrowDown")) soul.y += s;
    soul.x = Math.max(box.x+soul.size, Math.min(box.x+box.w-soul.size, soul.x));
    soul.y = Math.max(box.y+soul.size, Math.min(box.y+box.h-soul.size, soul.y));
    if(soul.invul>0) soul.invul -= dt;

    // dmg — сколько ХП снять при попадании (по умолчанию 1, яблоки бьют на 5);
    // mercyPenalty добавляется сверху за каждую неудачную попытку пощады
    const dealHit = (dmg)=>{
      if(soul.invul>0) return; // ещё в неуязвимости — не бьём повторно
      player.hp = Math.max(0, player.hp-((dmg||1)+mercyPenalty));
      soul.invul = 0.9;
      sfx('hurt');
    };
    // круговая проверка по расстоянию — соответствует форме яблока
    // (раньше была квадратная и задевала пустые прозрачные углы спрайта)
    if(soul.invul<=0){
      for(const b of bullets){
        if(b.kind==="sprite"){
          const rApple = b.size*0.34, rSoul = soul.size*0.55;
          if(Math.hypot(b.x-soul.x, b.y-soul.y) < rApple+rSoul){
            dealHit(5); break;
          }
        }
      }
    }

    const def = ATTACKS[attackName];
    if(def && def.update) def.update(dt, attackData, box, soul, dealHit);

    attackTimer += dt;
    if(attackTimer >= attackDuration || player.hp<=0){
      bullets = [];
      // бутылок в бластерной атаке с каждым разом больше — без потолка
      if(attackName === "blasterBottles") blasterLevel++;
      if(player.hp<=0){ stopMusic(); state="gameover"; }
      else { state = "battlemenu"; pickFlavor(); }
    }
  }
  else if(state === "fightbar" && fightBar.active){
    fightBar.pos += fightBar.dir*fightBar.speed*dt;
    const left=W/2-260, right=W/2+260;
    if(fightBar.pos>right){ fightBar.pos=right; fightBar.dir=-1; }
    if(fightBar.pos<left){ fightBar.pos=left; fightBar.dir=1; }
  }
  else if(state === "textbox"){
    const line = textLines[textIdx] || "";
    if(textChar < line.length){
      textTimer += dt;
      if(textTimer > 0.022){ textTimer=0; textChar++; if(textChar>=line.length) stopTypeSound(); }
    }
  }
  else if(state === "battlemenu"){
    // печатаем фоновую реплику рядом с кнопками, пока игрок не выберет действие
    if(flavorChar < battleFlavorText.length){
      flavorTimer += dt;
      if(flavorTimer > 0.022){ flavorTimer=0; flavorChar++; }
    }
  }
  else if(state === "kill_blackout"){
    killTimer += dt;
    if(killTimer >= KILL_BLACKOUT_SECONDS) state = "kill_end";
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  if(state==="loading" || state==="gate") return; // оверлей рисует HTML
  if(state==="mainmenu") drawMainMenu();
  else if(state==="details") drawDetails();
  else drawBattleScreen();
}

function drawMainMenu(){
  ctx.textAlign="center";
  ctx.fillStyle=WHITE;
  ctx.font="26px 'Press Start 2P'";
  ctx.fillText("БЕКТЕЙЛФАН", W/2, 150);
  const opts=["ИГРАТЬ","ПОДРОБНЕЕ"];
  opts.forEach((o,i)=>{
    ctx.font="16px 'Press Start 2P'";
    ctx.fillStyle = i===mainMenuIndex ? ACCENT : WHITE;
    ctx.fillText((i===mainMenuIndex?"♥ ":"   ")+o, W/2, 270+i*46);
  });
  ctx.textAlign="left";
}

function drawDetails(){
  ctx.fillStyle=WHITE; ctx.font="15px 'Press Start 2P'";
  ctx.fillText("УПРАВЛЕНИЕ", 60, 90);
  ctx.font="11px 'Press Start 2P'";
  const lines = IS_TOUCH ? [
    "Стрелки слева — движение/выбор",
    "OK — подтвердить / атаковать",
    "НАЗАД — отмена",
  ] : [
    "Стрелки — навигация / движение души",
    "Z (Enter) — подтвердить / атаковать",
    "X (Esc) — назад",
  ];
  lines.forEach((l,i)=> ctx.fillText(l, 60, 130+i*24));
  ctx.fillText("Z / X — назад в меню", 60, 130+lines.length*24+30);
}

function drawBox(){ ctx.strokeStyle=WHITE; ctx.lineWidth=4; ctx.strokeRect(box.x,box.y,box.w,box.h); }

function drawHUD(){
  // Опущено ниже (y=445+), чтобы никогда не наслаиваться с областью уворота/
  // текстовым окном/полосой FIGHT — все они заканчиваются на y=410.
  ctx.font="13px 'Press Start 2P'"; ctx.fillStyle=WHITE;
  ctx.fillText(STORY.player.name, 40, 445);
  ctx.font="11px 'Press Start 2P'";
  ctx.fillText("LV "+STORY.player.lv, 190, 445);
  ctx.fillText("HP", 250, 445);
  const bx=290, by=435, bw=100, bh=16;
  ctx.fillStyle="#600"; ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle="#0e0"; ctx.fillRect(bx,by,bw*(player.hp/player.maxHp),bh);
  ctx.strokeStyle=WHITE; ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle=WHITE; ctx.fillText(player.hp+"/"+player.maxHp, bx+bw+10, by+13);
}

function drawEnemy(){
  const ex=W/2, ey=120;
  const img = IMG.aksiy;
  let size = {w:0,h:SETTINGS.aksiySpriteHeight};
  if(img && img.naturalWidth){
    size = fitSize(img, SETTINGS.aksiySpriteHeight);
    ctx.drawImage(img, ex-size.w/2, ey-size.h/2+20, size.w, size.h);
  }
  // полоска ХП босса видна только несколько секунд после удара (не всегда)
  if(enemyHpVisibleTimer<=0) return;
  const alpha = Math.min(1, enemyHpVisibleTimer/0.6); // мягкое исчезновение под конец
  const barW=140, barH=10;
  const barX = ex-barW/2;
  const spriteTop = ey-size.h/2+20;
  const barY = Math.max(6, spriteTop-22); // над головой Аксия, с небольшим зазором
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle="#243c46"; ctx.fillRect(barX,barY,barW,barH);
  ctx.fillStyle=ACCENT; ctx.fillRect(barX,barY,barW*(enemy.hp/enemy.maxHp),barH);
  ctx.strokeStyle=WHITE; ctx.strokeRect(barX,barY,barW,barH);
  ctx.restore();
}

// облачко реплики самого Аксия — сбоку от него, а не поверх лица
function drawAksiySpeechBubble(){
  const ex=W/2, ey=120;
  const bw=260, bh=140;
  let bx = ex + 65;           // справа от спрайта
  let by = 18;                // у самого верха, не перекрывает лицо
  bx = Math.max(10, Math.min(W-bw-10, bx));

  ctx.fillStyle="rgba(255,255,255,0.95)";
  ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle="#000"; ctx.lineWidth=3; ctx.strokeRect(bx,by,bw,bh);

  // хвостик сбоку, указывает на голову Аксия
  const tailY = by+bh-30;
  ctx.beginPath();
  ctx.moveTo(bx, tailY-16);
  ctx.lineTo(bx, tailY+16);
  ctx.lineTo(ex+22, ey-30);
  ctx.closePath();
  ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.fill();
  ctx.strokeStyle="#000"; ctx.stroke();

  ctx.fillStyle="#000"; ctx.font="12px 'Press Start 2P'";
  const line = textLines[textIdx] || "";
  wrapText(line.slice(0,textChar), bx+16, by+26, bw-32, 20);
}

function drawSystemTextBox(){
  ctx.strokeStyle=WHITE; ctx.lineWidth=4;
  ctx.strokeRect(30,300,580,110);
  ctx.fillStyle=WHITE; ctx.font="13px 'Press Start 2P'";
  const line = textLines[textIdx] || "";
  wrapText(line.slice(0,textChar), 55,335,530,22);
}

function wrapText(text,x,y,maxWidth,lh){
  const words=text.split(" "); let line="", cy=y;
  ctx.font="13px 'Press Start 2P'";
  for(const w of words){
    const test=line+w+" ";
    if(ctx.measureText(test).width>maxWidth && line){ ctx.fillText(line,x,cy); line=w+" "; cy+=lh; }
    else line=test;
  }
  ctx.fillText(line,x,cy);
}

function drawBattleMenu(){
  const names=["Fight","Act","Item","Mercy"];
  const bw=88,gap=10,startX=(W-(bw*4+gap*3))/2,y=372,bh=34;
  names.forEach((n,i)=>{
    const x=startX+i*(bw+gap);
    const sel = battleMenuIndex===i;
    const img = IMG["btn"+n+(sel?"Selected":"Normal")];
    if(img && img.naturalWidth){
      const ratio = img.naturalWidth/img.naturalHeight;
      const dh = bh, dw = bh*ratio;
      ctx.drawImage(img, x+(bw-dw)/2, y+(bh-dh)/2, dw, dh);
    }
  });
}

// Диалоговое окно с фоновой репликой над кнопками (в духе оригинального
// Андертейла) — висит, пока игрок не сделает выбор
function drawBattleFlavorBox(){
  ctx.strokeStyle=WHITE; ctx.lineWidth=4;
  ctx.strokeRect(30,288,580,72);
  ctx.fillStyle=WHITE; ctx.font="12px 'Press Start 2P'";
  wrapText(battleFlavorText.slice(0,flavorChar), 50,316,540,20);
}

function drawSubMenu(title, options, sel){
  ctx.strokeStyle=WHITE; ctx.lineWidth=4; ctx.strokeRect(30,300,580,110);
  ctx.font="14px 'Press Start 2P'"; ctx.fillStyle=WHITE; ctx.fillText(title,55,325);
  options.forEach((o,i)=>{
    ctx.font="13px 'Press Start 2P'";
    ctx.fillStyle = i===sel ? ACCENT : WHITE;
    ctx.fillText((i===sel?"♥ ":"   ")+o, 70, 355+i*24);
  });
}

function drawFightBar(){
  const y=378,left=W/2-260,right=W/2+260;
  ctx.strokeStyle=WHITE; ctx.lineWidth=3; ctx.strokeRect(left,y,right-left,24);
  ctx.fillStyle="#fff2"; ctx.fillRect(W/2-14,y,28,24);
  ctx.fillStyle=ACCENT; ctx.fillRect(fightBar.pos-4,y-4,8,32);
  ctx.font="11px 'Press Start 2P'"; ctx.fillStyle=WHITE; ctx.textAlign="center";
  ctx.fillText(IS_TOUCH ? "OK — ударить!" : "Z — ударить!", W/2, y-16);
  ctx.textAlign="left";
}

function drawHeart(cx,cy,size,color){
  ctx.save(); ctx.translate(cx,cy); ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(0,size*0.6);
  ctx.bezierCurveTo(size,-size*0.4,size*0.2,-size*1.1,0,-size*0.2);
  ctx.bezierCurveTo(-size*0.2,-size*1.1,-size,-size*0.4,0,size*0.6);
  ctx.fill(); ctx.restore();
}

function drawDodgePhase(){
  drawBox();
  bullets.forEach(b=>{
    if(b.kind==="sprite" && b.img && b.img.naturalWidth){
      // сохраняем пропорции спрайта, а не сжимаем его в квадрат —
      // иначе визуальный размер яблока не совпадает с зоной столкновения
      const s = fitSize(b.img, b.size);
      ctx.drawImage(b.img, b.x-s.w/2, b.y-s.h/2, s.w, s.h);
    }
  });
  const def = ATTACKS[attackName];
  if(def && def.draw) def.draw(ctx, attackData);

  const blinking = soul.invul>0 && Math.floor(soul.invul*12)%2===0;
  drawHeart(soul.x, soul.y, soul.size, blinking ? "#a33" : "#ff0000");
}

function drawBattleScreen(){
  if(state==="kill_blackout") return; // сплошной чёрный экран (уже залито в draw())
  if(state==="kill_end"){ drawKillEnd(); return; }

  drawEnemy();
  drawHUD();

  if(state==="textbox"){
    if(textMode==="aksiy") drawAksiySpeechBubble();
    else drawSystemTextBox();
  }
  else if(state==="battlemenu"){ drawBattleFlavorBox(); drawBattleMenu(); }
  else if(state==="actmenu") drawSubMenu("ACT", STORY.actOptions.map(o=>o.name), subMenuIndex);
  else if(state==="itemmenu") drawSubMenu("ITEM", STORY.items.map(i=>{
    if(!i.limit) return i.name;
    const left = Math.max(0, i.limit-(itemUses[i.name]||0));
    return i.name + " (" + left + "/" + i.limit + ")";
  }), subMenuIndex);
  else if(state==="mercymenu") drawSubMenu("MERCY", ["Пощадить"], subMenuIndex);
  else if(state==="fightbar") drawFightBar();
  else if(state==="dodge") drawDodgePhase();
  else if(state==="victory"){
    ctx.textAlign="center"; ctx.fillStyle=WHITE; ctx.font="18px 'Press Start 2P'";
    ctx.fillText("ПОБЕДА!", W/2, 240);
    ctx.font="11px 'Press Start 2P'";
    ctx.fillText(IS_TOUCH?"OK — в меню":"Z — в главное меню", W/2, 270);
    ctx.textAlign="left";
  }
  else if(state==="gameover"){
    ctx.textAlign="center"; ctx.fillStyle="#f33"; ctx.font="20px 'Press Start 2P'";
    ctx.fillText("ИГРА ОКОНЧЕНА", W/2, 240);
    ctx.font="11px 'Press Start 2P'"; ctx.fillStyle=WHITE;
    ctx.fillText(IS_TOUCH?"OK — заново":"Z — заново", W/2, 270);
    ctx.textAlign="left";
  }
}

// Финальный экран после гибели Аксия — картинка на весь экран
function drawKillEnd(){
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  const img = IMG.channelBanned;
  if(img && img.naturalWidth){
    const maxW=W-60, maxH=H-110;
    let dw=img.naturalWidth, dh=img.naturalHeight;
    const scale = Math.min(maxW/dw, maxH/dh, 1);
    dw*=scale; dh*=scale;
    ctx.drawImage(img, W/2-dw/2, 30, dw, dh);
  }
  ctx.textAlign="center"; ctx.fillStyle=WHITE; ctx.font="11px 'Press Start 2P'";
  ctx.fillText(IS_TOUCH?"OK — в меню":"Z — в меню", W/2, H-24);
  ctx.textAlign="left";
}

/* ---------- старт ---------- */
let loopStarted = false;
preload(()=>{
  const gateEl = document.getElementById('gate');
  if(!gateEl.dataset.ready){
    gateEl.dataset.ready = "1";
    gateEl.innerHTML = "<div>БЕКТЕЙЛФАН</div><div class='blink'>" + (IS_TOUCH?"НАЖМИ, ЧТОБЫ НАЧАТЬ":"НАЖМИ ЛЮБУЮ КЛАВИШУ") + "</div>";
    gateEl.addEventListener('click', ()=>handlePress('KeyZ'));
    state = "gate";
  }
  if(!loopStarted){ loopStarted = true; requestAnimationFrame(loop); }
});
