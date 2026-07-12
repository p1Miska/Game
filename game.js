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
  vipSize: 24,          // размер шара-випа — как яблоко из кольца или чуть меньше
  aksiySpriteHeight: 170,
  blasterSpriteHeight: 140,
  blasterRotationOffset: Math.PI/2, // если бластер целится "спиной вперёд" — поставь -Math.PI/2

  // ---- 2-я фаза: синяя душа (гравитация, как в Undertale) ----
  blueSoulSpeed: 150,   // горизонтальная скорость души в синем режиме
  gravity: 900,         // ускорение падения
  jumpVelocity: -380,   // импульс прыжка (ArrowUp или Z, только когда стоишь на полу/платформе)
  fishSize: 30,
  frogSize: 50,
  tongueWidth: 34,      // ширина платформы-языка (розовый прямоугольник)
};

const STORY = {
  player: { name: "Чатикс", maxHp: 69, lv: 12 },
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

  // Фоновые реплики для меню боя ПОСЛЕ того, как Аксий ушёл (phase2Left).
  // Раньше тут ошибочно продолжали показываться обычные menuFlavors —
  // получалось странно ("Аксий попивает Псыж"), хотя его уже нет на арене.
  menuFlavorsAfterLeave: [
    "Тут никого нет.",
    "На арене пусто.",
    "Тишина.",
    "Аксий давно ушёл.",
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
    vipRelease: ["Выпускаю випов..."],
    generic: ["Аксий готовит новую атаку..."],
    // Показывается вместо обычной реплики, когда ближе к концу боя Аксий
    // запускает две атаки одновременно (см. COMBOABLE/difficultyStage в движке).
    comboWarning: ["Аксий мешает атаки друг с другом — так злее!", "Аксий психует и запускает всё разом!"],
  },

  // ACT-опции разные для фазы 1 / фазы 2 / того, что после ухода Аксия
  // (см. currentActOptions() в движке).
  actOptionsPhase1: [
    {
      name: "Задонатить",
      text: ["Ты закинул донат Аксию.", "Он выглядит слегка довольным."],
      isDonate: true
    },
    {
      name: "Осмотреть",
      text: ["Микрознаменитость интернета, АКСИЙ бэкфан.", "400 HP. Имеет комьюнити, во всех смыслах."]
    }
  ],
  actOptionsPhase2: [
    {
      name: "Осмотреть",
      text: ["АКСИЙ бэкфан, вторая фаза.", "Что-то в его взгляде изменилось."]
    },
    {
      name: "Молить",
      text: ["Ты умоляешь Аксия остановиться.", "Кажется, он тебя даже не слушает."]
    },
    {
      // запретная кнопка, за неё наказывают — теперь с открытым названием
      name: "бан-ворд",
      text: null, // особая логика — см. handlePress(actmenu)
      forbidden: true
    }
  ],
  actOptionsAfterLeave: [
    {
      name: "Оценить",
      text: ["Ты анализируешь состав воздуха на арене.", "Азот — 78%. Кислород — 21%.", "Формальдегид — почему-то тревожно много."]
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

  // ---- Фаза 1 -> Фаза 2: игрок думает, что пощадил и победил, но... ----
  mockRecoverLines: [
    "Ха...",
    "Ты правда подумал, что всё так просто?",
    "Ты просто глупец.",
    "На самом деле я просто немного отдохнул, пока ты нажимал на кнопочки...",
    "А теперь я ПОЛНОСТЬЮ восстановил силы!"
  ],
  // Разовая реплика сразу после перехода — объясняет игроку, почему первое
  // действие (еда/осмотр) в этот раз проходит "бесплатно", без ответной атаки.
  phase2GraceLine: ["Аксий ещё не отдышался и пока не атакует..."],

  // ---- Пасхалка: если задонатить Аксию несколько раз подряд в 1-й фазе,
  // а потом всё равно попытаться его пощадить — он просто сбегает ----
  concertFleeLines: [
    "Так... секунду...",
    "Ой, а я как раз насобирал донатов на билет...",
    "На концерт МАЗЕЛОВА в Санкт-Петербурге!",
    "Живи, я побежал собирать вещи!"
  ],

  // ---- Действие "бан-ворд" во 2-й фазе ----
  forbiddenBuildupLines: ["Вы произнесли слово, которое на этой платформе нельзя называть."],

  // ---- Конец 2-й фазы: Аксий не побеждён и не пощажён — он просто уходит ----
  phase2LeaveLines: ["Знаешь..."],
  phase2LeaveLines2: ["...забудь.", "Мне это всё надоело."],
  afterLeaveMissLine: ["Мимо."],
  afterLeaveBegLines: ["Ты умоляешь пустую стену.", "Стена, ожидаемо, не отвечает."],
  afterLeaveForbiddenLines: ["Ты кричишь в пустоту.", "Никто не откликается."],
  finalLeaveText: "Вы ушли ни с чем.",

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
  // Первые 4 хода после неё идут по обычному кругу яблоки -> бластеры ->
  // "ещё что-нибудь" (как раньше), а дальше (см. PHASE1_RANDOM_POOL в движке)
  // атака каждый раз выбирается случайно — у бутылок шанс чуть повыше.
  // Количество бластеров растёт каждый круг (2, 3, 4, 5... без потолка).
  firstAttack: "appleRing",
  attackCycle: ["randomApples", "blasterBottles", "extraAttack"],

  // Сколько раз нужно задонатить в 1-й фазе, чтобы при попытке пощады
  // Аксий вместо "восстановления сил" просто сбежал на концерт.
  donateFleeThreshold: 11,

  // ---- Список концовок для меню "КОНЦОВКИ" в главном меню ----
  // Пока концовка не открыта — в меню вместо name показывается "???", а
  // вместо desc — "?????????????". Открывается автоматически в движке
  // (см. unlockEnding() и вызовы в startKillSequence/triggerFinalLeave/
  // triggerConcertFlee/triggerForbiddenWord) и сохраняется между визитами.
  endings: [
    { id: "ban", name: "БАН", desc: "Добейте Аксия в момент, когда он почти-почти восстановился." },
    { id: "loneliness", name: "Одиночество", desc: "Почти добейте Аксия во второй фазе, но упустите его в конце." },
    { id: "donate", name: "Задобрил", desc: "Дайте в первой фазе 11 раз донат и тем самым задобрите стримера." },
    { id: "nword", name: "Н-ворд", desc: "Скажите плохое слово и умрите... Навсегда." },
  ],

  // ---- Реплика после смерти игрока: пусто, потом медленно печатается это,
  // потом выбор "Заново"/"Меню" (см. drawDeathMessage/state "death_message") ----
  deathEncourageLines: ["Не сдавайся....", "Ты ещё можешь победить..."],
};

// Атаки, из которых случайно выбирается "ещё что-нибудь" в цикле выше.
// Все четыре встречаются одинаково часто (включая новую атаку с випами).
const EXTRA_ATTACK_POOL = ["sunSpin", "sunHeat", "appleColumns", "vipRelease"];

// Фаза 1, после первых 4 ходов (см. startEnemyTurn): дальше атака выбирается
// случайно из этого взвешенного пула — у бутылок-бластеров шанс чуть выше.
const PHASE1_RANDOM_POOL = [
  { name: "randomApples", weight: 1 },
  { name: "blasterBottles", weight: 1.4 },
  { name: "extraAttack", weight: 1 },
];

// Фаза 2: раньше был жёсткий цикл, из-за которого казалось, что играют
// почти только новые атаки (язык лягушки/рыбы). Теперь выбор случайный —
// новые атаки чуть чаще (weight 2), старые реже (weight 1), но встречаются.
const PHASE2_ATTACK_POOL = [
  { name: "frogTongue", weight: 2 },
  { name: "fishSwarm", weight: 2 },
  { name: "blasterBottles", weight: 1 },
  { name: "extraAttack", weight: 1 },
];

// Взвешенный случайный выбор + мягкий анти-повтор (если выпало то же самое,
// что и в прошлый раз, перебрасываем один раз ещё).
function weightedPick(pool, avoid){
  const total = pool.reduce((s,o)=>s+o.weight, 0);
  function roll(){
    let r = Math.random()*total;
    for(const o of pool){ if(r < o.weight) return o.name; r -= o.weight; }
    return pool[pool.length-1].name;
  }
  let name = roll();
  if(avoid && name === avoid && pool.length > 1) name = roll();
  return name;
}
let lastEnemyRawName = null; // для анти-повтора выше (сбрасывается в startBattle)

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
    vip: "assets/vip.png",
    fish1: "assets/fish1.png",
    fish2: "assets/fish2.png",
    frog: "assets/frog.webp",
    aksiyLeft: "assets/aksiy_left.png",
    aksiyBack: "assets/aksiy_back.png",
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
    crack: "assets/crack.mp3",             // смерть игрока, шаг 1: треск сердца (~0.5с)
    heartBreak: "assets/heart_shatter.mp3",// смерть игрока, шаг 2: сердце разбивается и разлетается (~1.62с)
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

/* ---------- концовки: сохраняются между визитами через localStorage ---------- */
const ENDINGS_KEY = "backtailfan_endings_v1";
function loadEndings(){
  try { return JSON.parse(localStorage.getItem(ENDINGS_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveEndings(){
  try { localStorage.setItem(ENDINGS_KEY, JSON.stringify(unlockedEndings)); }
  catch(e){ /* localStorage недоступен (напр. приватный режим) — не страшно */ }
}
let unlockedEndings = loadEndings();
function unlockEnding(id){
  if(!unlockedEndings[id]){ unlockedEndings[id] = true; saveEndings(); }
}

/* ---------- состояние игры ---------- */
let state = "loading"; // loading -> gate -> mainmenu -> ...
let mainMenuIndex = 0;
let endingsIndex = 0;

let player = { hp: STORY.player.maxHp, maxHp: STORY.player.maxHp };
let enemy  = { hp: STORY.enemy.maxHp, maxHp: STORY.enemy.maxHp, spared:false };

let battleMenuIndex = 0;
let subMenuIndex = 0;

// Фоновая реплика в меню боя (висит рядом с кнопками, пока не сделан выбор)
let battleFlavorText = "";
let flavorChar = 0, flavorTimer = 0;
function pickFlavor(){
  const pool = phase2Left ? STORY.menuFlavorsAfterLeave : STORY.menuFlavors;
  let idx = Math.floor(Math.random()*pool.length);
  if(pool.length>1 && pool[idx]===battleFlavorText) idx = (idx+1)%pool.length;
  battleFlavorText = pool[idx];
  flavorChar = 0; flavorTimer = 0;
}

// Растёт на 1 за каждую неудачную попытку пощады — атаки после этого злее
let mercyPenalty = 0;

/* ---------- фазы боя / пасхалки / настройки из "ПОДРОБНЕЕ" ---------- */
let phase = 1;              // 1 или 2
let phase2Grace = false;    // первое ITEM/ACT сразу после перехода в фазу 2 не вызывает атаку (см. proceedAfterAction)
let phase2Left = false;     // Аксий уже развернулся и ушёл — бой окончен, доступен только "Уйти"
let donateCount = 0;        // сколько раз задонатили в 1-й фазе (для пасхалки с концертом)
let KIDS_MODE = false;      // "детский режим (для лохов)" — отключает миксование атак
let WASD_MODE = false;      // WASD вместо стрелок
let detailsIndex = 0;       // какой переключатель выбран на экране "ПОДРОБНЕЕ"

// анимация ухода Аксия (разворот + уход за кадр)
let enemyOffsetX = 0, enemyMirror = false, leavingTimer = 0;
const LEAVING_TURN_SECONDS = 0.5, LEAVING_WALK_SECONDS = 1.8;

// финальный экран "Вы ушли ни с чем" — печатает текст медленнее обычного
let finalChar = 0, finalTimer = 0;
const FINAL_CHAR_SECONDS = 0.07;

let forbiddenTimer = 0; // короткая анимация "кольца" перед смертью за бан-ворд
const FORBIDDEN_RING_SECONDS = 1.1;

// Таймер чёрного экрана после гибели Аксия (перед финальной картинкой)
let killTimer = 0;
const KILL_BLACKOUT_SECONDS = 3.0;

/* ---------- смерть игрока: экран чернеет, остаётся только сердце на месте
   гибели. Звук идёт в 2 шага, как просил пользователь: сначала треск
   (`crack.mp3`, ~0.5с), затем небольшая пауза, затем звук разбитого и
   разлетающегося сердца (`heart_shatter.mp3`, ~1.62с) — под него сердце
   разлетается на осколки. Спустя ещё чуть-чуть — снова главное меню. ---------- */
let deathTimer = 0;
let deathHeartX = 0, deathHeartY = 0;
let deathShards = null; // null, пока сердце ещё целое; массив осколков — после разлома
const DEATH_CRACK_SOUND_SECONDS = 0.5;   // длительность crack.mp3
const DEATH_DELAY_SECONDS = 0.4;         // пауза между треском и разломом
const DEATH_SHATTER_AT = DEATH_CRACK_SOUND_SECONDS + DEATH_DELAY_SECONDS; // момент разлома (0.9с)
const DEATH_SHATTER_SOUND_SECONDS = 1.62; // длительность heart_shatter.mp3
const DEATH_TAIL_SECONDS = 0.4;           // короткая пауза после звука, перед пустотой
const DEATH_TOTAL_SECONDS = DEATH_SHATTER_AT + DEATH_SHATTER_SOUND_SECONDS + DEATH_TAIL_SECONDS;

// После того как сердце разлетелось — не сразу меню: сначала пустой чёрный
// экран, потом медленно печатается ободряющая фраза, потом выбор
// "Заново"/"Меню" (см. state "death_empty" / "death_message" / "death_choice").
let deathEmptyTimer = 0;
const DEATH_EMPTY_SECONDS = 1.2;
let deathMsgLines = [], deathMsgLineIdx = 0, deathMsgChar = 0, deathMsgTimer = 0, deathMsgHoldTimer = 0;
const DEATH_MSG_CHAR_SECONDS = 0.09;   // печать заметно медленнее обычного текста
const DEATH_MSG_LINE_PAUSE = 0.3;      // пауза между двумя строками фразы
const DEATH_MSG_HOLD_SECONDS = 0.8;    // пауза после фразы, перед выбором
let deathChoiceIndex = 0;

function triggerPlayerDeath(x, y){
  stopMusic();
  deathHeartX = x;
  deathHeartY = y;
  deathTimer = 0;
  deathShards = null;
  state = "death_crack";
  sfx('crack'); // шаг 1: треск — сразу при входе в состояние
}

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
// Разрешённое описание текущей атаки (обычной или составной "combo:").
// Раньше везде брали ATTACKS[attackName] напрямую, но у составных атак такого
// ключа в ATTACKS нет — их описание собирается на лету и хранится тут.
let currentAttackDef = null;
let bullets = [];    // {kind:'sprite', x,y,vx,vy,size,img} или {kind:'beam', x,y,angle,length,width,active}
let attackCycleIndex = 0;
let blasterLevel = 2;  // сколько бластеров появится в след. blasterBottles (растёт каждый круг, макс. 7)
let itemUses = {};      // счётчик использований предметов за бой (для limit)

let fightBar = { pos:0, dir:1, speed:520, active:false };

/* ---------- ввод (клавиатура) ---------- */
const keysDown = {};
// WASD_MODE (переключатель на экране "ПОДРОБНЕЕ") подменяет коды WASD на
// коды стрелок ещё до обработки — так WASD работает и в меню, и в уворотах,
// без дублирования логики.
const WASD_MAP = { KeyW:"ArrowUp", KeyA:"ArrowLeft", KeyS:"ArrowDown", KeyD:"ArrowRight" };
function mapCode(code){ return (WASD_MODE && WASD_MAP[code]) ? WASD_MAP[code] : code; }
window.addEventListener("keydown", e=>{
  const k = mapCode(e.code);
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(k)) e.preventDefault();
  if(!keysDown[k]) handlePress(k);
  keysDown[k] = true;
});
window.addEventListener("keyup", e=>{ keysDown[mapCode(e.code)] = false; });
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
    if(UP){ mainMenuIndex = (mainMenuIndex+2)%3; sfx('move'); }
    if(DOWN){ mainMenuIndex = (mainMenuIndex+1)%3; sfx('move'); }
    if(Z){
      sfx('select');
      if(mainMenuIndex===0) startBattle();
      else if(mainMenuIndex===1) state="details";
      else { state="endings"; endingsIndex=0; }
    }
  }
  else if(state === "endings"){
    const n = STORY.endings.length;
    if(UP){ endingsIndex=(endingsIndex+n-1)%n; sfx('move'); }
    if(DOWN){ endingsIndex=(endingsIndex+1)%n; sfx('move'); }
    if(X){ sfx('select'); state="mainmenu"; }
  }
  else if(state === "details"){
    if(UP||DOWN){ detailsIndex = 1-detailsIndex; sfx('move'); }
    if(Z){
      sfx('select');
      if(detailsIndex===0) KIDS_MODE = !KIDS_MODE;
      else WASD_MODE = !WASD_MODE;
    }
    if(X){ sfx('select'); state = "mainmenu"; }
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
    const opts = currentActOptions();
    const n = opts.length;
    if(UP){ subMenuIndex=(subMenuIndex+n-1)%n; sfx('move'); }
    if(DOWN){ subMenuIndex=(subMenuIndex+1)%n; sfx('move'); }
    if(Z){
      sfx('select');
      const opt = opts[subMenuIndex];
      if(opt.forbidden){ triggerForbiddenWord(); return; }
      if(opt.isDonate) donateCount++;
      showText(opt.text, "system", ()=>{
        if(opt.isDonate){
          // "Мало..." — реакция Аксия только на донат, а не на любое действие
          showText(STORY.maloLine, "aksiy", ()=>{ proceedAfterAction(); });
        } else if(phase2Left){
          // Аксий уже ушёл — действие (напр. "Оценить") не вызывает ответный ход
          state="battlemenu"; pickFlavor();
        } else {
          // остальные действия (Осмотреть, Молить и т.д.) всё равно передают
          // ход Аксию, просто без реплики "Мало..."
          proceedAfterAction();
        }
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
      showText(it.text, "system", ()=>{
        if(phase2Left){ state="battlemenu"; pickFlavor(); }
        else proceedAfterAction();
      });
    }
    if(X){ sfx('select'); state="battlemenu"; pickFlavor(); }
  }
  else if(state === "mercymenu"){
    if(Z){
      sfx('select');
      if(phase2Left){
        // единственный вариант после ухода Аксия — "Уйти", финал боя
        triggerFinalLeave();
      } else if(enemy.hp<=0 || enemy.spared){
        if(phase===1){
          if(donateCount>=STORY.donateFleeThreshold) triggerConcertFlee();
          else triggerPhase2Recover();
        } else {
          triggerLeaveSequence();
        }
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
      if(enemy.hp<=0 && !enemy.spared){
        if(phase===2) triggerLeaveSequence();
        else startKillSequence();
        return;
      }
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
  else if(state === "victory"){
    if(Z){ sfx('select'); state="mainmenu"; }
  }
  else if(state === "kill_end"){
    if(Z){ sfx('select'); state="mainmenu"; }
  }
  else if(state === "final_leave_end"){
    if(Z){ sfx('select'); state="mainmenu"; }
  }
  else if(state === "death_message"){
    if(Z){
      const line = deathMsgLines[deathMsgLineIdx] || "";
      if(deathMsgChar < line.length){ deathMsgChar = line.length; } // проскочить печать
      else if(deathMsgLineIdx < deathMsgLines.length-1){ deathMsgLineIdx++; deathMsgChar=0; deathMsgHoldTimer=0; }
      else { state="death_choice"; deathChoiceIndex=0; }
    }
  }
  else if(state === "death_choice"){
    if(UP||DOWN){ deathChoiceIndex = 1-deathChoiceIndex; sfx('move'); }
    if(Z){
      sfx('select');
      if(deathChoiceIndex===0) startBattle();
      else { state="mainmenu"; playMusic('menuMusic'); }
    }
  }
}

/* ---------- ACT-опции зависят от фазы боя ---------- */
function currentActOptions(){
  if(phase2Left) return STORY.actOptionsAfterLeave;
  if(phase===2) return STORY.actOptionsPhase2;
  return STORY.actOptionsPhase1;
}

// После ITEM или "Осмотреть" — обычно сразу идёт ход врага, НО первое такое
// действие сразу после перехода в фазу 2 проходит бесплатно (Аксий "не
// отдышался"): раньше тут был баг — атака всё равно запускалась.
function proceedAfterAction(){
  if(phase2Grace){
    phase2Grace = false;
    showText(STORY.phase2GraceLine, "system", ()=>{ state="battlemenu"; pickFlavor(); });
  } else {
    startEnemyTurn();
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
  lastEnemyRawName = null;
  phase = 1;
  phase2Grace = false;
  phase2Left = false;
  donateCount = 0;
  enemyOffsetX = 0; enemyMirror = false;
  stopMusic(); // во вступлении и первой атаке музыки ещё нет
  showText(STORY.introLines, "aksiy", ()=>{
    runAttack(STORY.firstAttack, true);
  });
}

function chooseBattleAction(){
  if(battleMenuIndex===0){
    if(phase2Left){
      // Аксия больше нет на арене — удары уходят в пустоту
      showText(STORY.afterLeaveMissLine, "system", ()=>{ state="battlemenu"; pickFlavor(); });
    } else startFightBar();
  }
  else if(battleMenuIndex===1){ subMenuIndex=0; state="actmenu"; }
  else if(battleMenuIndex===2){ subMenuIndex=0; state="itemmenu"; }
  else if(battleMenuIndex===3){ subMenuIndex=0; state="mercymenu"; }
}
function startFightBar(){ fightBar.pos=0; fightBar.dir=1; fightBar.active=true; state="fightbar"; }

/* ---------- рост сложности к концу боя (по ХП Аксия) ----------
   0 — обычная фаза, 1 — Аксий начинает злиться (чуть больнее),
   2 — финальная фаза: атаки иногда накладываются друг на друга. */
function difficultyStage(){
  const frac = enemy.maxHp>0 ? enemy.hp/enemy.maxHp : 1;
  if(frac <= 0.12) return 3; // почти-почти добит — буквально пара ударов до конца
  if(frac <= 0.30) return 2;
  if(frac <= 0.55) return 1;
  return 0;
}
// Атаки, которые можно безопасно совмещать друг с другом на 2-й стадии.
// appleRing сюда не входит — она только вступительная.
const COMBOABLE = ["randomApples", "blasterBottles", "sunHeat", "sunSpin", "appleColumns", "vipRelease"];
// В фазе 2 миксуем ОСТОРОЖНО (сам просил не перегибать с бластерами) — синюю
// душу (frogTongue/fishSwarm) вообще не комбинируем ни с чем, чтобы гравитация
// и свободный уворот не накладывались друг на друга. Остальные (старые)
// атаки можно комбинировать — особенно под самый конец боя (stage 3).
const COMBOABLE_PHASE2 = ["blasterBottles", "randomApples", "sunSpin", "sunHeat", "appleColumns", "vipRelease"];

// Собирает "виртуальную" атаку из нескольких обычных: у неё нет ключа в
// ATTACKS, зато есть init/update/draw, которые просто вызывают все под-атаки
// по очереди на общем массиве bullets — так они честно накладываются друг на друга.
function buildComboAttack(names, presets){
  return {
    duration: Math.max(...names.map(n=>ATTACKS[n].duration)),
    init(data, box){
      data.subs = names.map(n=>{
        const sub = { name:n, data: Object.assign({}, (presets && presets[n]) || {}) };
        const def = ATTACKS[n];
        if(def.init) def.init(sub.data, box);
        return sub;
      });
    },
    update(dt, data, box, soul, dealHit){
      data.subs.forEach(s=>{
        const def = ATTACKS[s.name];
        if(def.update) def.update(dt, s.data, box, soul, dealHit);
      });
    },
    draw(ctx, data){
      data.subs.forEach(s=>{
        const def = ATTACKS[s.name];
        if(def.draw) def.draw(ctx, s.data);
      });
    }
  };
}

/* следующий ход врага: показываем краткую реплику-предупреждение о том,
   какая именно атака сейчас начнётся, затем запускаем её */
function startEnemyTurn(){
  let rawName;
  if(phase===2){
    // Фаза 2: атака выбирается случайно (новые атаки чуть чаще), а не по
    // жёсткому кругу — раньше из-за этого казалось, что играют только они.
    rawName = weightedPick(PHASE2_ATTACK_POOL, lastEnemyRawName);
  } else if(attackCycleIndex < 4){
    // Первые 4 хода фазы 1 — как раньше, по обычному кругу.
    const cycle = STORY.attackCycle;
    rawName = cycle[attackCycleIndex % cycle.length];
  } else {
    // Дальше в фазе 1 — тоже случайно, у бутылок шанс чуть повыше.
    rawName = weightedPick(PHASE1_RANDOM_POOL, lastEnemyRawName);
  }
  lastEnemyRawName = rawName;
  attackCycleIndex++;

  let baseName = rawName, preset = null;
  if(rawName === "extraAttack"){
    baseName = EXTRA_ATTACK_POOL[Math.floor(Math.random()*EXTRA_ATTACK_POOL.length)];
  } else if(rawName === "blasterBottles"){
    preset = { count: blasterLevel };
  }

  const stage = difficultyStage();
  let name = baseName;
  let comboPreset = null;
  const baseDef = ATTACKS[baseName];
  const comboPool = phase===2 ? COMBOABLE_PHASE2 : COMBOABLE;

  // На финальной стадии боя (мало ХП у Аксия) он иногда мешает две атаки
  // одновременно — например яблочный дождь вместе с бластерами.
  // "Детский режим" отключает это полностью. В фазе 2 миксуем реже (35%,
  // не 60%) и никогда не трогаем blueSoul-атаки — просить не миксовать
  // слишком жёстко было прямым пожеланием.
  let comboChance = phase===2 ? 0.35 : 0.6;
  // Буквально пара ударов до конца — возвращаем миксование атак понастойчивее.
  if(stage >= 3) comboChance = phase===2 ? 0.7 : 0.85;
  const canCombo = !KIDS_MODE && !baseDef.blueSoul && comboPool.indexOf(baseName)!==-1;
  if(stage >= 2 && canCombo && Math.random() < comboChance){
    const options = comboPool.filter(n=>n!==baseName);
    if(options.length){
      const partner = options[Math.floor(Math.random()*options.length)];
      name = "combo:" + baseName + "+" + partner;
      // бластеры в комбо намеренно послабее сольного залпа — иначе, как ты и
      // предупреждал, они слишком мощные и разбалансированные вдвоём с чем-то ещё
      comboPreset = { names: [baseName, partner], presets: { blasterBottles: { count: Math.min(blasterLevel, 4) } } };
    }
  }

  const isCombo = name.indexOf("combo:")===0;
  const intro = isCombo
    ? [STORY.attackIntros.comboWarning[Math.floor(Math.random()*STORY.attackIntros.comboWarning.length)]]
    : (STORY.attackIntros[baseName] || STORY.attackIntros.generic);

  showText(intro, "aksiy", ()=>{
    if(!currentMusic) playMusic('battleMusic');
    runAttack(name, false, isCombo ? comboPreset : preset);
  });
}

function resolveAttackDef(name, presetData){
  if(name.indexOf("combo:")===0){
    return buildComboAttack(presetData.names, presetData.presets||{});
  }
  return ATTACKS[name];
}

function runAttack(name, silent, presetData){
  attackName = name;
  bullets = [];
  attackData = {};
  soul.x = box.x+box.w/2; soul.y = box.y+box.h/2; soul.invul = 0;
  soul.vy = 0; soul.grounded = true; soul.onPlatform = false;
  const def = resolveAttackDef(name, presetData||{});
  currentAttackDef = def;
  // для обычных (не составных) атак сохраняем старое поведение — preset
  // кладётся прямо в attackData, чтобы init() мог его прочитать (напр. count)
  if(name.indexOf("combo:")!==0) attackData = Object.assign({}, presetData||{});
  attackDuration = def.duration;
  attackTimer = 0;
  if(def.init) def.init(attackData, box);
  state = "dodge";
}

/* ---------- добивающий удар: Аксий произносит последние слова и исчезает ---------- */
/* (только в 1-й фазе — во 2-й его больше не убить, см. triggerLeaveSequence) */
function startKillSequence(){
  unlockEnding('ban');
  stopMusic();
  showText(STORY.deathSpeech, "aksiy", ()=>{
    showText(STORY.deathCollapseLines, "system", ()=>{
      state = "kill_blackout";
      killTimer = 0;
    });
  });
}

/* ---------- Фаза 1 -> Фаза 2: "пощада", после которой Аксий обманывает ---------- */
function triggerPhase2Recover(){
  stopMusic();
  showText(STORY.mockRecoverLines, "aksiy", ()=>{
    phase = 2;
    phase2Grace = true;
    enemy.hp = enemy.maxHp;
    enemy.spared = false;
    attackCycleIndex = 0;
    state = "battlemenu";
    pickFlavor();
  });
}

/* ---------- Пасхалка: задонатил слишком много раз — Аксий сбегает на концерт ---------- */
function triggerConcertFlee(){
  unlockEnding('donate');
  stopMusic();
  showText(STORY.concertFleeLines, "aksiy", ()=>{
    state = "final_leave_end";
    finalChar = 0; finalTimer = 0;
    STORY._finalTextOverride = "Он убежал собирать вещи. Ты остался с этой мыслью один на один.";
  });
}

/* ---------- Действие "бан-ворд" во 2-й фазе: наказание за запретное слово ---------- */
function triggerForbiddenWord(){
  unlockEnding('nword');
  sfx('select');
  showText(STORY.forbiddenBuildupLines, "system", ()=>{
    stopMusic();
    state = "forbidden_ring";
    forbiddenTimer = 0;
  });
}

/* ---------- Конец 2-й фазы: Аксий не побеждён — просто разворачивается и уходит ---------- */
function triggerLeaveSequence(){
  stopMusic();
  showText(STORY.phase2LeaveLines, "aksiy", ()=>{
    showText(STORY.phase2LeaveLines2, "aksiy", ()=>{
      state = "leaving_anim";
      leavingTimer = 0;
      enemyOffsetX = 0;
    });
  });
}

/* ---------- Финал: игрок выбирает "Уйти" после того, как Аксий ушёл ---------- */
function triggerFinalLeave(){
  unlockEnding('loneliness');
  sfx('select');
  state = "final_leave_end";
  finalChar = 0; finalTimer = 0;
  STORY._finalTextOverride = null; // используем STORY.finalLeaveText по умолчанию
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

  // === Атака 6: яблоки падают колоннами сверху ===
  // Раньше был один и тот же ровный паттерн (фикс. 5 колонок, один прямой
  // проход) — из-за этого достаточно было один раз опознать "безопасную"
  // колонку и просто стоять в ней. Теперь: колонок то больше, то меньше,
  // столбцы "гуляют" по X (не идеальная сетка), иногда проход не один, а два,
  // но узких, часть волн сносит яблоки вбок, а скорость и интервал волн
  // не постоянны — так дождь остаётся читаемым, но привыкнуть к нему нельзя.
  appleColumns: {
    duration: 6.5,
    init(data, box){ data.timer = 0; },
    update(dt, data, box, soul, dealHit){
      data.timer -= dt;
      if(data.timer <= 0){
        const cols = 5 + Math.floor(Math.random()*3); // 5..7 колонок
        const gapCount = Math.random()<0.35 ? 2 : 1;   // иногда два узких прохода вместо одного
        const gapCols = new Set();
        while(gapCols.size < gapCount) gapCols.add(Math.floor(Math.random()*cols));
        const drift = Math.random()<0.5 ? (Math.random()<0.5?-1:1)*(20+Math.random()*30) : 0; // часть волн сносит вбок
        const speed = 145 + Math.random()*70;
        data.timer = 0.4 + Math.random()*0.3; // неровный интервал волн
        for(let c=0;c<cols;c++){
          if(gapCols.has(c)) continue;
          const jitter = (Math.random()-0.5)*18; // столбцы не идеально ровные
          const x = box.x + (c+0.5)*(box.w/cols) + jitter;
          bullets.push({ kind:"sprite", img: appleImgByRandom(), x, y: box.y-20,
            vx: drift, vy: speed, size: SETTINGS.appleSize });
        }
      }
      bullets.forEach(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; });
      bullets = bullets.filter(b=> b.y < box.y+box.h+40);
      // столкновение считает общий круговой чек в update() ниже
    },
    draw(){}
  },

  // === Атака 7: "выпускаю випов" — розовые шары-випы (по фото пользователя),
  // вылетают по одному с разной задержкой (всего 5 штук за атаку) и летают
  // по коробке, отталкиваясь от стен, постоянно меняя направление ===
  vipRelease: {
    duration: 9.5,
    init(data, box){
      data.t = 0;
      // 5 запусков в разное время, а не все разом
      data.releaseTimes = [0.15, 1.5, 2.9, 4.3, 5.7];
      data.released = [];
    },
    update(dt, data, box, soul, dealHit){
      data.t += dt;
      data.releaseTimes.forEach((rt,i)=>{
        if(!data.released[i] && data.t >= rt){
          data.released[i] = true;
          const margin = 24;
          const x = box.x + margin + Math.random()*(box.w-margin*2);
          const y = box.y + margin + Math.random()*(box.h-margin*2);
          const angle = Math.random()*Math.PI*2;
          const speed = 130 + Math.random()*50;
          bullets.push({
            kind:"sprite", tag:"vip", img: IMG.vip,
            x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
            size: SETTINGS.vipSize
          });
        }
      });
      const r = SETTINGS.vipSize*0.34;
      bullets.forEach(b=>{
        if(b.tag !== "vip") return; // не трогаем чужие снаряды при combo-атаках
        b.x += b.vx*dt; b.y += b.vy*dt;
        if(b.x-r < box.x){ b.x = box.x+r; b.vx = Math.abs(b.vx); }
        if(b.x+r > box.x+box.w){ b.x = box.x+box.w-r; b.vx = -Math.abs(b.vx); }
        if(b.y-r < box.y){ b.y = box.y+r; b.vy = Math.abs(b.vy); }
        if(b.y+r > box.y+box.h){ b.y = box.y+box.h-r; b.vy = -Math.abs(b.vy); }
      });
    },
    draw(){}
  },

  // === Атака 8 (фаза 2, синяя душа): лягушка на языках-платформах ===
  // Лягушка сидит наверху коробки. Периодически "выстреливает" языком —
  // розовой прямоугольной платформой — в случайную точку внизу; пока язык
  // держится (data: state 'hold'), на него можно запрыгнуть и постоять.
  // Одновременно пол коробки то и дело становится горячим — если в этот
  // момент стоишь не на языке, получаешь урон. Раз в несколько секунд
  // появляется 1-2 языка одновременно, но никогда больше — иначе прыгать
  // было бы невозможно.
  frogTongue: {
    duration: 11.0,
    blueSoul: true,
    init(data, box){
      data.t = 0;
      data.floorHot = false;
      data.floorToggleAt = 2.2;
      data.tongues = [];
      data.spawnTimer = 0.7;
      data.platforms = [];
      data.lastRetract = -999; // когда в последний раз убрался язык — не даём двум пропасть подряд
    },
    update(dt, data, box, soul, dealHit){
      data.t += dt;

      data.floorToggleAt -= dt;
      if(data.floorToggleAt <= 0){
        data.floorHot = !data.floorHot;
        data.floorToggleAt = data.floorHot ? 2.0 : 1.7;
      }
      if(data.floorHot && !soul.onPlatform && soul.y+soul.size >= box.y+box.h-6){
        dealHit(2);
      }

      data.spawnTimer -= dt;
      if(data.spawnTimer <= 0 && data.tongues.filter(t=>t.state!=='retract').length < 2){
        data.spawnTimer = 1.0 + Math.random()*0.6;
        const x = box.x + 36 + Math.random()*(box.w-72);
        const targetY = box.y + 34 + Math.random()*(box.h-64);
        data.tongues.push({ x, tipY: box.y+2, targetY, w: SETTINGS.tongueWidth, state:'extend', timer:0 });
      }

      data.tongues.forEach(tg=>{
        tg.timer += dt;
        if(tg.state==='extend'){
          const dur=0.22, p=Math.min(1, tg.timer/dur);
          tg.tipY = (box.y+2) + (tg.targetY-(box.y+2))*p;
          if(p>=1){ tg.state='hold'; tg.timer=0; tg.tipY=tg.targetY; }
        } else if(tg.state==='hold'){
          // ждём минимум 1.4с сам язык, и ещё минимум 3с с момента, когда
          // убрался предыдущий — иначе языки пропадают слишком близко друг
          // к другу и запрыгнуть на следующий физически не успеваешь
          if(tg.timer > 1.4 && (data.t - data.lastRetract) >= 3.0){
            tg.state='retract'; tg.timer=0; data.lastRetract = data.t;
          }
        } else if(tg.state==='retract'){
          const dur=0.18, p=Math.min(1, tg.timer/dur);
          tg.tipY = tg.targetY + ((box.y+2)-tg.targetY)*p;
          if(p>=1) tg.dead=true;
        }
      });
      data.tongues = data.tongues.filter(tg=>!tg.dead);
      data.platforms = data.tongues.filter(tg=>tg.state==='hold')
        .map(tg=>({x:tg.x, y:tg.targetY, w:tg.w, h:10}));
    },
    draw(ctx, data){
      const frogImg = IMG.frog;
      const frogCx = box.x+box.w/2;
      if(frogImg && frogImg.naturalWidth){
        const size = fitSize(frogImg, SETTINGS.frogSize);
        ctx.drawImage(frogImg, frogCx-size.w/2, box.y-size.h+8, size.w, size.h);
      }
      if(data.floorHot){
        ctx.save(); ctx.fillStyle="rgba(255,90,40,0.28)";
        ctx.fillRect(box.x, box.y+box.h-14, box.w, 14);
        ctx.restore();
      }
      ctx.fillStyle = "#e888b0";
      data.tongues.forEach(tg=>{
        // сама "нить" языка от лягушки вниз до текущего кончика
        ctx.fillRect(tg.x-4, box.y+4, 8, Math.max(0, tg.tipY-(box.y+4)));
        // сама платформа-язык — толще, розовая, только когда почти дошёл до цели
        if(tg.state!=='extend' || tg.tipY > box.y+30){
          ctx.fillRect(tg.x-tg.w/2, tg.tipY-5, tg.w, 10);
        }
      });
    }
  },

  // === Атака 9 (фаза 2, синяя душа): стая рыб ===
  // Рыбы (по твоим спрайтам) плывут горизонтально по двум "полосам": нижняя
  // (у пола — от неё нужно ПРЫГАТЬ) и средняя (выше — от неё, наоборот,
  // нужно НЕ прыгать и переждать на полу). Так уворот превращается в
  // простую, но не банальную игру на тайминг прыжка.
  fishSwarm: {
    duration: 9.5,
    blueSoul: true,
    init(data, box){
      data.spawnTimer = 0.8;
      data.fish = [];
      data.lowY = box.y+box.h-16;
      data.midY = box.y+box.h-56;
    },
    update(dt, data, box, soul, dealHit){
      data.spawnTimer -= dt;
      if(data.spawnTimer <= 0){
        data.spawnTimer = 0.5 + Math.random()*0.35;
        const lane = Math.random()<0.5 ? 'low' : 'mid';
        const fromLeft = Math.random()<0.5;
        const y = lane==='low' ? data.lowY : data.midY;
        const speed = (150+Math.random()*70) * (fromLeft?1:-1);
        const x = fromLeft ? box.x-20 : box.x+box.w+20;
        data.fish.push({ x, y, vx: speed, img: Math.random()<0.5?IMG.fish1:IMG.fish2, size: SETTINGS.fishSize });
      }
      data.fish.forEach(f=>{ f.x += f.vx*dt; });
      data.fish = data.fish.filter(f=> f.x>box.x-40 && f.x<box.x+box.w+40);
      const r = SETTINGS.fishSize*0.4;
      data.fish.forEach(f=>{
        if(Math.hypot(f.x-soul.x, f.y-soul.y) < r+soul.size*0.55) dealHit(3);
      });
    },
    draw(ctx, data){
      data.fish.forEach(f=>{
        if(f.img && f.img.naturalWidth){
          const s = fitSize(f.img, f.size);
          ctx.save();
          if(f.vx<0){ ctx.translate(f.x,f.y); ctx.scale(-1,1); ctx.drawImage(f.img,-s.w/2,-s.h/2,s.w,s.h); }
          else ctx.drawImage(f.img, f.x-s.w/2, f.y-s.h/2, s.w, s.h);
          ctx.restore();
        }
      });
    }
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
    const isBlue = currentAttackDef && currentAttackDef.blueSoul;
    if(isBlue){
      // ---- синяя душа: только влево/вправо + гравитация + прыжок ----
      const s = SETTINGS.blueSoulSpeed*dt;
      if(pressed("ArrowLeft")) soul.x -= s;
      if(pressed("ArrowRight")) soul.x += s;
      soul.x = Math.max(box.x+soul.size, Math.min(box.x+box.w-soul.size, soul.x));

      const prevBottom = soul.y + soul.size;
      soul.vy = (soul.vy||0) + SETTINGS.gravity*dt;
      if((pressed("ArrowUp")||pressed("KeyZ")) && soul.grounded){
        soul.vy = SETTINGS.jumpVelocity;
        soul.grounded = false;
      }
      soul.y += soul.vy*dt;
      const newBottom = soul.y + soul.size;

      // приземление: пол коробки по умолчанию, либо любая платформа-язык
      let landY = box.y+box.h - soul.size;
      soul.onPlatform = false;
      (attackData.platforms||[]).forEach(p=>{
        const left = p.x-p.w/2, right = p.x+p.w/2;
        if(soul.vy>=0 && soul.x>left && soul.x<right && prevBottom<=p.y+2 && newBottom>=p.y-2){
          const platTop = p.y - soul.size;
          if(platTop < landY){ landY = platTop; soul.onPlatform = true; }
        }
      });
      if(soul.y >= landY){ soul.y = landY; soul.vy = 0; soul.grounded = true; }
      else soul.grounded = false;
      // потолок коробки — не даём улететь выше верхней границы
      soul.y = Math.max(box.y+soul.size, soul.y);
    } else {
      const s = SETTINGS.soulSpeed*dt;
      if(pressed("ArrowLeft")) soul.x -= s;
      if(pressed("ArrowRight")) soul.x += s;
      if(pressed("ArrowUp")) soul.y -= s;
      if(pressed("ArrowDown")) soul.y += s;
      soul.x = Math.max(box.x+soul.size, Math.min(box.x+box.w-soul.size, soul.x));
      soul.y = Math.max(box.y+soul.size, Math.min(box.y+box.h-soul.size, soul.y));
    }
    if(soul.invul>0) soul.invul -= dt;

    // dmg — сколько ХП снять при попадании (по умолчанию 1, яблоки бьют на 5);
    // mercyPenalty добавляется сверху за каждую неудачную попытку пощады.
    // stageBonus — Аксий бьёт чуть больнее ближе к концу боя (см. difficultyStage).
    const dealHit = (dmg)=>{
      if(soul.invul>0) return; // ещё в неуязвимости — не бьём повторно
      const stage = difficultyStage();
      const stageBonus = stage>=2 ? 2 : (stage>=1 ? 1 : 0);
      player.hp = Math.max(0, player.hp-((dmg||1)+mercyPenalty+stageBonus));
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

    const def = currentAttackDef;
    if(def && def.update) def.update(dt, attackData, box, soul, dealHit);

    attackTimer += dt;
    if(attackTimer >= attackDuration || player.hp<=0){
      bullets = [];
      // бутылок в бластерной атаке с каждым разом больше — без потолка.
      // Работает и для составных атак (combo:...), если бластеры были одной из частей.
      const namesInPlay = attackName.indexOf("combo:")===0 ? attackName.slice(6).split("+") : [attackName];
      if(namesInPlay.indexOf("blasterBottles")!==-1) blasterLevel++;
      if(player.hp<=0){ triggerPlayerDeath(soul.x, soul.y); }
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
  else if(state === "leaving_anim"){
    leavingTimer += dt;
    if(leavingTimer > LEAVING_TURN_SECONDS){
      // после разворота (профиль влево) — медленно уходит спиной за левый край экрана
      const walkT = leavingTimer - LEAVING_TURN_SECONDS;
      enemyOffsetX = -Math.min(1, walkT/LEAVING_WALK_SECONDS) * 260;
    }
    if(leavingTimer >= LEAVING_TURN_SECONDS + LEAVING_WALK_SECONDS){
      phase2Left = true;
      state = "battlemenu";
      pickFlavor();
    }
  }
  else if(state === "forbidden_ring"){
    forbiddenTimer += dt;
    if(forbiddenTimer >= FORBIDDEN_RING_SECONDS){
      player.hp = 0;
      triggerPlayerDeath(box.x+box.w/2, box.y+box.h/2);
    }
  }
  else if(state === "death_crack"){
    deathTimer += dt;
    if(deathShards===null && deathTimer >= DEATH_SHATTER_AT){
      // шаг 2: сердце трескается и разлетается на осколки — со своим звуком
      sfx('heartBreak');
      deathShards = [];
      const n = 6;
      for(let i=0;i<n;i++){
        const a = (i/n)*Math.PI*2 + Math.random()*0.4;
        deathShards.push({
          dx:0, dy:0,
          vx: Math.cos(a)*(30+Math.random()*20),
          vy: Math.sin(a)*(30+Math.random()*20) - 15,
          rot: Math.random()*Math.PI*2, vr: (Math.random()-0.5)*5
        });
      }
    }
    if(deathShards){
      deathShards.forEach(s=>{
        s.dx += s.vx*dt; s.dy += s.vy*dt; s.vy += 50*dt; s.rot += s.vr*dt;
      });
    }
    if(deathTimer >= DEATH_TOTAL_SECONDS){
      state = "death_empty";
      deathEmptyTimer = 0;
    }
  }
  else if(state === "death_empty"){
    deathEmptyTimer += dt;
    if(deathEmptyTimer >= DEATH_EMPTY_SECONDS){
      state = "death_message";
      deathMsgLines = STORY.deathEncourageLines;
      deathMsgLineIdx = 0; deathMsgChar = 0; deathMsgTimer = 0; deathMsgHoldTimer = 0;
    }
  }
  else if(state === "death_message"){
    const line = deathMsgLines[deathMsgLineIdx] || "";
    if(deathMsgChar < line.length){
      deathMsgTimer += dt;
      if(deathMsgTimer > DEATH_MSG_CHAR_SECONDS){ deathMsgTimer=0; deathMsgChar++; }
    } else if(deathMsgLineIdx < deathMsgLines.length-1){
      deathMsgHoldTimer += dt;
      if(deathMsgHoldTimer > DEATH_MSG_LINE_PAUSE){ deathMsgHoldTimer=0; deathMsgLineIdx++; deathMsgChar=0; }
    } else {
      deathMsgHoldTimer += dt;
      if(deathMsgHoldTimer >= DEATH_MSG_HOLD_SECONDS){ state = "death_choice"; deathChoiceIndex = 0; }
    }
  }
  else if(state === "final_leave_end"){
    const text = STORY._finalTextOverride || STORY.finalLeaveText;
    if(finalChar < text.length){
      finalTimer += dt;
      if(finalTimer > FINAL_CHAR_SECONDS){ finalTimer=0; finalChar++; }
    }
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  if(state==="loading" || state==="gate") return; // оверлей рисует HTML
  if(state==="mainmenu") drawMainMenu();
  else if(state==="details") drawDetails();
  else if(state==="endings") drawEndings();
  else drawBattleScreen();
}

function drawMainMenu(){
  ctx.textAlign="center";
  ctx.fillStyle=WHITE;
  ctx.font="26px 'Press Start 2P'";
  ctx.fillText("БЕКТЕЙЛФАН", W/2, 130);
  const unlockedCount = STORY.endings.filter(e=>unlockedEndings[e.id]).length;
  const opts=["ИГРАТЬ","ПОДРОБНЕЕ","КОНЦОВКИ "+unlockedCount+"/"+STORY.endings.length];
  opts.forEach((o,i)=>{
    ctx.font="16px 'Press Start 2P'";
    ctx.fillStyle = i===mainMenuIndex ? ACCENT : WHITE;
    ctx.fillText((i===mainMenuIndex?"♥ ":"   ")+o, W/2, 250+i*46);
  });
  ctx.textAlign="left";
}

function drawEndings(){
  ctx.textAlign="center"; ctx.fillStyle=WHITE; ctx.font="20px 'Press Start 2P'";
  ctx.fillText("КОНЦОВКИ", W/2, 60);
  ctx.textAlign="left";
  STORY.endings.forEach((e,i)=>{
    const unlocked = !!unlockedEndings[e.id];
    ctx.font="14px 'Press Start 2P'";
    ctx.fillStyle = i===endingsIndex ? ACCENT : WHITE;
    ctx.fillText((i===endingsIndex?"♥ ":"   ")+(unlocked ? e.name : "???"), 90, 130+i*40);
  });
  const cur = STORY.endings[endingsIndex];
  const unlockedCur = !!unlockedEndings[cur.id];
  ctx.strokeStyle=WHITE; ctx.lineWidth=3; ctx.strokeRect(30,310,580,90);
  ctx.fillStyle=WHITE; ctx.font="11px 'Press Start 2P'";
  wrapText(unlockedCur ? cur.desc : "?????????????", 50,338,540,20);
  ctx.font="10px 'Press Start 2P'"; ctx.fillStyle=WHITE; ctx.textAlign="center";
  ctx.fillText("X — назад", W/2, 430);
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

  // ---- переключатели ----
  const toggleY = 130+lines.length*24+34;
  ctx.font="15px 'Press Start 2P'"; ctx.fillStyle=WHITE;
  ctx.fillText("НАСТРОЙКИ", 60, toggleY);
  ctx.font="11px 'Press Start 2P'";
  const rows = [
    { label: "ДЕТСКИЙ РЕЖИМ (ДЛЯ ЛОХОВ)", on: KIDS_MODE },
    { label: "WASD ВМЕСТО СТРЕЛОК", on: WASD_MODE },
  ];
  rows.forEach((r,i)=>{
    const y = toggleY+34+i*28;
    ctx.fillStyle = i===detailsIndex ? ACCENT : WHITE;
    ctx.fillText((i===detailsIndex?"♥ ":"   ")+r.label+": "+(r.on?"ВКЛ":"ВЫКЛ"), 60, y);
  });
  ctx.fillStyle=WHITE;
  ctx.fillText("Z — переключить · X — назад", 60, toggleY+34+rows.length*28+26);
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
  // после ухода Аксия сцена пуста — только одинокое сердце там, где он был
  if(phase2Left){
    drawHeart(W/2, 150, 10, "#ff0000");
    return;
  }

  const ex=W/2+enemyOffsetX, ey=120;
  // во время ухода — сначала кадр профиля (уже смотрит влево), потом спина
  const leaving = state==="leaving_anim";
  const img = leaving
    ? (leavingTimer <= LEAVING_TURN_SECONDS ? IMG.aksiyLeft : IMG.aksiyBack)
    : IMG.aksiy;
  let size = {w:0,h:SETTINGS.aksiySpriteHeight};
  if(img && img.naturalWidth){
    size = fitSize(img, SETTINGS.aksiySpriteHeight);
    ctx.drawImage(img, ex-size.w/2, ey-size.h/2+20, size.w, size.h);
  }
  // полоска ХП босса видна только несколько секунд после удара (не всегда),
  // и не во время анимации ухода
  if(enemyHpVisibleTimer<=0 || state==="leaving_anim") return;
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
  const def = currentAttackDef;
  if(def && def.draw) def.draw(ctx, attackData);

  const blinking = soul.invul>0 && Math.floor(soul.invul*12)%2===0;
  drawHeart(soul.x, soul.y, soul.size, blinking ? "#a33" : "#ff0000");
}

function drawBattleScreen(){
  if(state==="kill_blackout") return; // сплошной чёрный экран (уже залито в draw())
  if(state==="kill_end"){ drawKillEnd(); return; }
  if(state==="final_leave_end"){ drawFinalLeaveEnd(); return; }
  if(state==="death_crack"){ drawDeathCrack(); return; }
  if(state==="death_empty") return; // пустой чёрный экран (уже залито в draw())
  if(state==="death_message" || state==="death_choice"){ drawDeathMessage(); return; }

  drawEnemy();
  if(state!=="forbidden_ring") drawHUD();

  if(state==="textbox"){
    if(textMode==="aksiy") drawAksiySpeechBubble();
    else drawSystemTextBox();
  }
  else if(state==="battlemenu"){ drawBattleFlavorBox(); drawBattleMenu(); }
  else if(state==="actmenu") drawSubMenu("ACT", currentActOptions().map(o=>o.name), subMenuIndex);
  else if(state==="itemmenu") drawSubMenu("ITEM", STORY.items.map(i=>{
    if(!i.limit) return i.name;
    const left = Math.max(0, i.limit-(itemUses[i.name]||0));
    return i.name + " (" + left + "/" + i.limit + ")";
  }), subMenuIndex);
  else if(state==="mercymenu") drawSubMenu("MERCY", [phase2Left ? "Уйти" : "Пощадить"], subMenuIndex);
  else if(state==="fightbar") drawFightBar();
  else if(state==="dodge") drawDodgePhase();
  else if(state==="leaving_anim") drawHUD();
  else if(state==="forbidden_ring") drawForbiddenRing();
  else if(state==="victory"){
    ctx.textAlign="center"; ctx.fillStyle=WHITE; ctx.font="18px 'Press Start 2P'";
    ctx.fillText("ПОБЕДА!", W/2, 240);
    ctx.font="11px 'Press Start 2P'";
    ctx.fillText(IS_TOUCH?"OK — в меню":"Z — в главное меню", W/2, 270);
    ctx.textAlign="left";
  }
}

// Смерть игрока: экран чернеет, на месте гибели остаётся сердце — оно
// трескается (звук dead.ogg играет один раз при входе в состояние) и
// спустя ещё немного времени разлетается на осколки. Через
// DEATH_TOTAL_SECONDS автоматически возвращаемся в главное меню.
function drawDeathCrack(){
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,W,H);
  const p = Math.min(1, deathTimer/DEATH_SHATTER_AT);
  if(!deathShards){
    // сердце ещё целое, но по мере приближения к разлому — трясётся и
    // покрывается трещинами
    const shake = p>0.55 ? (Math.random()-0.5)*p*4 : 0;
    const hx = deathHeartX+shake, hy = deathHeartY+shake;
    const hsize = soul.size*1.7;
    drawHeart(hx, hy, hsize, "#ff0000");
    const crackCount = Math.floor(p*4);
    ctx.strokeStyle = "#200"; ctx.lineWidth = 2;
    for(let i=0;i<crackCount;i++){
      const ang = (i/4)*Math.PI*2 + i*1.7;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx+Math.cos(ang)*hsize*0.9, hy+Math.sin(ang)*hsize*0.9);
      ctx.stroke();
    }
  } else {
    // сердце разлетелось на осколки, которые постепенно гаснут
    const fade = Math.max(0, 1-(deathTimer-DEATH_SHATTER_AT)/(DEATH_TOTAL_SECONDS-DEATH_SHATTER_AT));
    ctx.globalAlpha = fade;
    const s = soul.size*1.3;
    deathShards.forEach(sh=>{
      ctx.save();
      ctx.translate(deathHeartX+sh.dx, deathHeartY+sh.dy);
      ctx.rotate(sh.rot);
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.moveTo(0,-s*0.3); ctx.lineTo(s*0.5,s*0.2); ctx.lineTo(-s*0.4,s*0.3); ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
}

// Экран после смерти игрока: сначала пустота (см. state "death_empty",
// нарисованный прямо в drawBattleScreen), затем сюда — медленно печатается
// ободряющая фраза, а когда она допечаталась — снизу появляется выбор
// "Заново" / "Меню" (state "death_choice").
function drawDeathMessage(){
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  ctx.textAlign="center"; ctx.fillStyle=WHITE; ctx.font="13px 'Press Start 2P'";
  const lineHeight = 34;
  const startY = H/2 - 30;
  for(let i=0;i<=deathMsgLineIdx && i<deathMsgLines.length;i++){
    const full = deathMsgLines[i];
    const shown = i<deathMsgLineIdx ? full : full.slice(0,deathMsgChar);
    ctx.fillText(shown, W/2, startY+i*lineHeight);
  }
  if(state==="death_choice"){
    const opts=["Заново","Меню"];
    const optY = startY + deathMsgLines.length*lineHeight + 46;
    ctx.font="14px 'Press Start 2P'";
    opts.forEach((o,i)=>{
      ctx.fillStyle = i===deathChoiceIndex ? ACCENT : WHITE;
      ctx.fillText((i===deathChoiceIndex?"♥ ":"   ")+o, W/2, optY+i*36);
    });
  }
  ctx.textAlign="left";
}

// Короткая (~1 сек) кинематографичная кара за "бан-ворд": кольцо бластеров
// (Псыж-бластеров) смыкается вокруг души, дальше — смерть игрока.
function drawForbiddenRing(){
  drawBox();
  const cx = box.x+box.w/2, cy = box.y+box.h/2;
  const p = Math.min(1, forbiddenTimer/FORBIDDEN_RING_SECONDS);
  const img = IMG.blaster;
  const N = 8;
  const startR = 200, endR = 18;
  const r = startR + (endR-startR)*p;
  for(let i=0;i<N;i++){
    const a = (i/N)*Math.PI*2 + p*2.2;
    const x = cx+Math.cos(a)*r, y = cy+Math.sin(a)*r;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(a+Math.PI+SETTINGS.blasterRotationOffset);
    if(img && img.naturalWidth){
      const s = fitSize(img, 70);
      ctx.drawImage(img, -s.w/2, -s.h/2, s.w, s.h);
    }
    ctx.restore();
  }
  drawHeart(cx, cy, soul.size, "#a33");
}

// Финальный экран "Вы ушли ни с чем" — тёмный экран, текст печатается заметно медленнее обычного
function drawFinalLeaveEnd(){
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  const text = STORY._finalTextOverride || STORY.finalLeaveText;
  ctx.textAlign="center"; ctx.fillStyle=WHITE; ctx.font="13px 'Press Start 2P'";
  ctx.fillText(text.slice(0,finalChar), W/2, H/2);
  if(finalChar>=text.length){
    ctx.font="11px 'Press Start 2P'";
    ctx.fillText(IS_TOUCH?"OK — в меню":"Z — в меню", W/2, H/2+40);
  }
  ctx.textAlign="left";
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
