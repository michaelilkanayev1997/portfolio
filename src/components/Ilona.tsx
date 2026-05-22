import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { FaFileSignature, FaStar } from "react-icons/fa";

const TRIGGER = "ilona";
const PARTICLE_COLORS = ["#ff6aa9", "#ffd1e4", "#a78bfa", "#67e8f9", "#fde68a"];

type Stage = {
  badge: string;
  title: string;
  question: string;
  note: string;
  correctAnswers: string[];
  wrongAnswers: string[];
  answerOrder?: string[];
  idleLine: string;
  successBadge: string;
  wrongBadges: string[];
  taunts: string[];
};

const STAGES: Stage[] = [
  {
    badge: "שאלה 1",
    title: "ועדת הילדים",
    question: "כמה ילדים אילונה רוצה?",
    note: "רמז: 4 זה לא מספר הגיוני.",
    correctAnswers: ["1", "2", "3"],
    wrongAnswers: ["4"],
    idleLine: "תשובה 4 יושבת רגוע כאילו אין לה חיתולים לממן.",
    successBadge: "אושר: פחות מגן ילדים פרטי",
    wrongBadges: [
      "ארבעה?!",
      "צריך אוטובוס",
      "לא בתקציב",
      "מיכאל נבהל",
      "מיניוואן בדרך",
      "זה כבר צוות כדורסל",
      "חיתולים על חשבונך",
    ],
    taunts: [
      "4 ילדים? אילונה, בואי ננשום רגע.",
      "המערכת זיהתה ניסיון לפתוח משפחתון.",
      "מיכאל כרגע מחשב כמה חיתולים זה.",
      "התשובה הזאת ברחה לקנות מיניוואן.",
      "ארבעה ילדים זה כבר subscription משפחתי.",
      "מיכאל ביקש להוסיף סעיף יציאה מהחוזה.",
      "כפתור 4 הועבר לבדיקת תקציב.",
      "האלגוריתם אמר: חמודה, לא להגזים.",
    ],
  },
  {
    badge: "שאלה 2",
    title: "מדד העצבים",
    question: "כמה מיכאל מעצבן מ-1 עד 10?",
    note: "שימי לב: יש תשובה אחת שהאמת המשפטית מחייבת.",
    correctAnswers: ["1"],
    wrongAnswers: ["2", "3", "4", "5", "6", "7", "8", "9", "10"],
    idleLine: "התשובה הלא נכונה מחייכת כאילו יש לה הוכחות.",
    successBadge: "הפרוטוקול תיקן את עצמו",
    wrongBadges: [
      "השמצה!",
      "אין הוכחות",
      "עורך דין!",
      "זה באג במערכת",
      "התנגדות!",
      "מחקנו מהפרוטוקול",
      "לא בבית ספרנו",
      "מיכאל נפגע קל",
    ],
    taunts: [
      "התשובה הזאת נמחקה מחוסר ראיות.",
      "מיכאל ביקש לערער, והערעור התקבל מיד.",
      "לא ניתן ללחוץ על שקרים כאלה.",
      "הכפתור ברח כי הוא יודע שהוא מגזים.",
      "אפילו המחשב אמר שזה לא יפה.",
      "זאת לא תשובה, זאת התקפה אישית.",
      "מיכאל מבקש חיבוק כפיצוי.",
    ],
  },
  {
    badge: "שאלה 3",
    title: "האמת הגדולה",
    question: "מתי מיכאל צודק?",
    note: "זאת שאלה קלה. ממש קלה. היסטורית אפילו.",
    correctAnswers: ["תמיד"],
    wrongAnswers: ["רק כשהוא ישן"],
    idleLine: "התשובה השנייה כבר יודעת שאין לה סיכוי.",
    successBadge: "סוף סוף אמת מוסכמת",
    wrongBadges: [
      "לא יפה",
      "כמעט",
      "תנסי שוב",
      "האמת בורחת ממך",
      "היסטורית לא מדויק",
      "שגיאה 404",
      "מיכאל ראה את זה",
      "זה יעלה לך בקפה",
    ],
    taunts: [
      "רק כשהוא ישן? אז למה הוא צודק גם עכשיו?",
      "התשובה הזאת נכנסה לפאניקה לוגית.",
      "אפילו הכפתור מתבייש בזה.",
      "האמת ביקשה: תלחצי על תמיד וזהו.",
      "מיכאל צודק גם כשהוא לא יודע למה.",
      "התשובה הזאת ברחה מהמציאות.",
      "זה לא שקר, זה פשוט לא נכון בכלל.",
      "היקום סימן את התשובה הזאת באדום.",
    ],
  },
  {
    badge: "שאלה 4",
    title: "ועדת הפלייליסט",
    question: "איזו מוזיקה הכי טובה בעולם?",
    note: "רמז: אם אין באס שגורם למוח לעשות ריסטארט, זה לא עובר ועדה.",
    correctAnswers: ["Infected Mushroom"],
    wrongAnswers: ["אושר כהן", "בן צור"],
    idleLine: "אושר כהן ובן צור עומדים פה בביטחון מוגזם. זה חמוד, אבל מסוכן.",
    successBadge: "אושר: באס עם אישור זוגי",
    wrongBadges: [
      "לא בפלייליסט",
      "הבאס נעלב",
      "הדיג'יי התפטר",
      "מיכאל חסם בספוטיפיי",
      "זה לא טראנס",
      "המערכת מבקשת דרופ",
      "השכנים דווקא בעד",
      "נשלח לוועדת סלסולים",
    ],
    taunts: [
      "אושר כהן? חמוד, אבל הכפתור הלך לחפש לייזרים.",
      "בן צור ניסה להיכנס, אבל הסאב וופר ביקש תעודת זהות.",
      "המערכת זיהתה מוזיקה בלי מספיק פסיכדליה וברחה לטבע.",
      "הכפתור הזה לא נגד מוזיקה ישראלית, הוא פשוט מפחד מבאס אמיתי.",
      "מיכאל שמע את זה ואמר: איפה הדרופ? הכפתור הסכים.",
      "זו לא תשובה, זו הצעת פשרה. והכפתור לא עושה פשרות.",
      "הפלייליסט הזוגי מחזיר את התשובה הזאת לבדיקה ביטחונית.",
    ],
  },
  {
    badge: "שאלה 5",
    title: "מחלקת חתונות",
    question: "עוד כמה שנים אילונה רוצה להתחתן?",
    note: "רמז: מספיק זמן בשביל שמיכאל יפתח אקסל, ייבהל, ויסגור אותו.",
    correctAnswers: ["4"],
    wrongAnswers: ["1", "2", "3"],
    answerOrder: ["1", "2", "3", "4"],
    idleLine: "המספרים הקטנים מתנהגים כאילו יש אולם פנוי מחר בבוקר. חשוד מאוד.",
    successBadge: "אושר: ארבע שנים, לחץ במינון זוגי",
    wrongBadges: [
      "מוקדם מדי!",
      "האולם בלחץ",
      "מיכאל הזיע",
      "שמלה בהולד",
      "רב לא נמצא",
      "תקציב בורח",
      "לא הספקנו לבחור שיר",
    ],
    taunts: [
      "שנה אחת? אפילו הכפתור אמר: וואו וואו, לאן רצים?",
      "שנתיים זה עדיין בתקופת ניסיון של המציאות.",
      "שלוש שנים? האקסל של מיכאל עדיין לא מוכן רגשית.",
      "הכפתור ברח כי הוא שמע את המילה חתונה וקיבל התראה מהבנק.",
      "פחות מארבע? אפילו היומן של מיכאל ביקש נשימה עמוקה.",
      "המספר הזה ניסה לעקוף בתור לאולם וברח מבושה.",
    ],
  },
];

type PixelPosition = {
  x: number;
  y: number;
};

type PointerPosition = PixelPosition & {
  xPercent: number;
  yPercent: number;
};

type ForbiddenRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const correctButtonClass =
  "rounded-lg bg-gradient-to-r from-pink-300 to-cyan-200 px-2.5 py-2 text-base font-black text-[#23091f] shadow-[0_14px_40px_rgba(255,143,189,0.32)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(103,232,249,0.26)] focus:outline-none focus:ring-2 focus:ring-white sm:px-5 sm:py-4 sm:text-xl";

const runawayButtonClass =
  "absolute left-0 top-0 z-[1200] min-w-16 rounded-lg border border-white/20 bg-white/12 px-3 py-2 text-center text-base font-black text-pink-50 shadow-[0_18px_50px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-colors will-change-transform hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-pink-200 sm:min-w-20 sm:px-5 sm:py-3 sm:text-xl";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
};

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const heartSvg = (color: string) => `
  <svg viewBox="0 0 32 29" width="100%" height="100%" aria-hidden="true">
    <path fill="${color}" d="M23.7 0C20.4 0 17.8 1.9 16 4.4 14.2 1.9 11.6 0 8.3 0 3.7 0 0 3.7 0 8.3c0 9.1 14.8 19.5 15.4 19.9.4.3.9.3 1.2 0C17.2 27.8 32 17.4 32 8.3 32 3.7 28.3 0 23.7 0Z"/>
  </svg>
`;

const overlapsRect = (
  position: PixelPosition,
  width: number,
  height: number,
  rect: ForbiddenRect,
) =>
  position.x < rect.right &&
  position.x + width > rect.left &&
  position.y < rect.bottom &&
  position.y + height > rect.top;

const spawnHeart = (
  container: HTMLDivElement,
  originX = 50,
  originY = 82,
  burst = false,
) => {
  const el = document.createElement("span");
  const size = Math.random() * 18 + 12;
  const color =
    PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

  el.innerHTML = heartSvg(color);
  el.style.cssText = [
    "position:absolute",
    `left:${originX}%`,
    `top:${originY}%`,
    `width:${size}px`,
    `height:${size}px`,
    "pointer-events:none",
    "opacity:0",
    "filter:drop-shadow(0 0 10px rgba(255,120,180,0.45))",
  ].join(";");

  container.appendChild(el);

  const drift = (Math.random() - 0.5) * (burst ? 360 : 170);
  const rise = burst
    ? -(Math.random() * 250 + 150)
    : -(window.innerHeight * 0.72 + Math.random() * 160);
  const duration = burst ? Math.random() * 1.1 + 1.4 : Math.random() * 2.5 + 3;

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { opacity: 0, scale: 0.35, rotation: Math.random() * 60 - 30 },
      { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" },
    )
    .to(
      el,
      {
        x: drift,
        y: rise,
        rotation: Math.random() * 260 - 130,
        duration,
        ease: "power1.out",
      },
      0,
    )
    .to(el, { opacity: 0, duration: 0.45 }, "-=0.45");
};

const spawnConfetti = (container: HTMLDivElement) => {
  const el = document.createElement("span");
  const color =
    PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

  el.style.cssText = [
    "position:absolute",
    "left:50%",
    "top:48%",
    "width:7px",
    "height:14px",
    `background:${color}`,
    "border-radius:2px",
    "pointer-events:none",
    "opacity:0",
  ].join(";");

  container.appendChild(el);

  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 260 + 110;

  gsap
    .timeline({ onComplete: () => el.remove() })
    .to(el, { opacity: 1, duration: 0.08 })
    .to(
      el,
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance + Math.random() * 80,
        rotation: Math.random() * 720 - 360,
        duration: Math.random() * 1.1 + 1.1,
        ease: "power3.out",
      },
      0,
    )
    .to(el, { opacity: 0, duration: 0.35 }, "-=0.35");
};

const spawnBadge = (
  container: HTMLDivElement,
  text: string,
  originX = 50,
  originY = 50,
) => {
  const el = document.createElement("span");
  el.textContent = text;
  el.dir = "rtl";
  el.style.cssText = [
    "position:absolute",
    `left:${originX}%`,
    `top:${originY}%`,
    "transform:translate(-50%,-50%)",
    "padding:7px 10px",
    "border-radius:999px",
    "background:rgba(255,255,255,0.12)",
    "border:1px solid rgba(255,255,255,0.18)",
    "color:#ffe4f1",
    "font-size:12px",
    "font-weight:800",
    "letter-spacing:0",
    "pointer-events:none",
    "white-space:nowrap",
    "box-shadow:0 12px 30px rgba(0,0,0,0.28)",
    "backdrop-filter:blur(12px)",
  ].join(";");

  container.appendChild(el);

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { opacity: 0, y: 8, scale: 0.78 },
      { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "back.out(2)" },
    )
    .to(el, { y: -46, rotation: Math.random() * 10 - 5, duration: 0.9 })
    .to(el, { opacity: 0, scale: 0.88, duration: 0.25 }, "-=0.25");
};

const spawnHitRings = (container: HTMLDivElement, origin: PixelPosition) => {
  if (prefersReducedMotion()) return;

  const fragment = document.createDocumentFragment();
  const rings = Array.from({ length: 3 }, (_, index) => {
    const el = document.createElement("span");
    const size = 34 + index * 10;

    el.style.cssText = [
      "position:absolute",
      `left:${origin.x}px`,
      `top:${origin.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      "z-index:1300",
      "border-radius:999px",
      "border:2px solid rgba(255,255,255,0.82)",
      "box-shadow:0 0 16px rgba(103,232,249,0.58), inset 0 0 16px rgba(255,106,169,0.28)",
      "pointer-events:none",
      "opacity:0",
      "will-change:transform,opacity",
      "contain:paint",
    ].join(";");

    fragment.appendChild(el);
    return el;
  });

  container.appendChild(fragment);

  gsap.fromTo(
    rings,
    { xPercent: -50, yPercent: -50, opacity: 0.86, scale: 0.28 },
    {
      opacity: 0,
      scale: (index: number) => 2.2 + index * 0.34,
      duration: 0.68,
      ease: "power2.out",
      stagger: 0.07,
      onComplete: () => rings.forEach((ring) => ring.remove()),
    },
  );
};

const spawnStagePraise = (container: HTMLDivElement) => {
  const el = document.createElement("span");
  el.textContent = "יופי, חמודה";
  el.dir = "rtl";
  el.style.cssText = [
    "position:absolute",
    "left:50%",
    "top:50%",
    "z-index:1290",
    "padding:14px 22px",
    "border-radius:999px",
    "background:rgba(255,228,241,0.18)",
    "border:1px solid rgba(255,255,255,0.24)",
    "color:#fff1f8",
    "font-size:clamp(24px,7vw,54px)",
    "font-weight:1000",
    "letter-spacing:0",
    "line-height:1",
    "white-space:nowrap",
    "pointer-events:none",
    "opacity:0",
    "text-shadow:0 0 24px rgba(255,106,169,0.42)",
    "box-shadow:0 22px 54px rgba(0,0,0,0.34), 0 0 36px rgba(255,106,169,0.28)",
    "backdrop-filter:blur(16px)",
    "will-change:transform,opacity",
    "contain:paint",
  ].join(";");

  container.appendChild(el);

  if (prefersReducedMotion()) {
    gsap
      .timeline({ onComplete: () => el.remove() })
      .set(el, { xPercent: -50, yPercent: -50, opacity: 1 })
      .to(el, { opacity: 0, duration: 0.2 }, 0.9);
    return;
  }

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      {
        xPercent: -50,
        yPercent: -50,
        y: 26,
        scale: 0.68,
        opacity: 0,
        rotation: -3,
      },
      {
        xPercent: -50,
        yPercent: -50,
        y: 0,
        scale: 1.08,
        opacity: 1,
        rotation: 0,
        duration: 0.28,
        ease: "back.out(1.9)",
      },
    )
    .to(el, { scale: 1, duration: 0.18, ease: "power2.out" })
    .to(
      el,
      {
        y: -30,
        scale: 0.94,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      },
      0.72,
    );
};

const spawnStardust = (
  container: HTMLDivElement,
  origin: PixelPosition,
  target: PixelPosition | null = null,
  intensity = 1,
) => {
  if (prefersReducedMotion()) return;

  const fragment = document.createDocumentFragment();
  const nodes: HTMLSpanElement[] = [];
  const motion = target
    ? { x: target.x - origin.x, y: target.y - origin.y }
    : { x: 0, y: 0 };
  const length = Math.hypot(motion.x, motion.y) || 1;
  const normal = { x: -motion.y / length, y: motion.x / length };
  const count = Math.round(clamp((target ? 12 : 7) * intensity, 4, 18));
  const particleData: Array<{
    x: number;
    y: number;
    rotation: number;
    duration: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const size = Math.random() * 3.5 + 2.5;
    const color =
      PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const along = target ? Math.random() * 0.82 : 0;
    const side = (Math.random() - 0.5) * (target ? 36 : 20);
    const baseX = origin.x + motion.x * along + normal.x * side;
    const baseY = origin.y + motion.y * along + normal.y * side;
    const angle =
      (target
        ? Math.atan2(motion.y, motion.x) + Math.PI
        : Math.random() * 6.28) +
      (Math.random() - 0.5) * 1.35;
    const distance = Math.random() * (target ? 44 : 54) + 18;

    el.style.cssText = [
      "position:absolute",
      `left:${baseX}px`,
      `top:${baseY}px`,
      `width:${size}px`,
      `height:${size}px`,
      "z-index:1250",
      `background:${color}`,
      `box-shadow:0 0 ${Math.round(size * 4)}px ${color}`,
      "border-radius:2px",
      "pointer-events:none",
      "opacity:0",
      "will-change:transform,opacity",
      "contain:paint",
    ].join(";");

    particleData.push({
      x: Math.cos(angle) * distance - motion.x * 0.035,
      y: Math.sin(angle) * distance - motion.y * 0.035,
      rotation: Math.random() * 250 - 125,
      duration: Math.random() * 0.28 + 0.34,
    });
    nodes.push(el);
    fragment.appendChild(el);
  }

  container.appendChild(fragment);

  gsap
    .timeline({ onComplete: () => nodes.forEach((node) => node.remove()) })
    .fromTo(
      nodes,
      { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.25, rotation: 45 },
      {
        opacity: 0.95,
        scale: 1,
        duration: 0.08,
        stagger: { each: 0.006, from: "random" },
        ease: "power2.out",
      },
    )
    .to(
      nodes,
      {
        x: (index: number) => particleData[index].x,
        y: (index: number) => particleData[index].y,
        opacity: 0,
        scale: 0,
        rotation: (index: number) => particleData[index].rotation,
        duration: (index: number) => particleData[index].duration,
        ease: "power2.out",
      },
      0.04,
    );
};

const FlowerGift = memo(() => (
  <div
    aria-hidden
    className="ilona-flower-gift pointer-events-none mx-auto h-28 w-40 shrink-0 sm:mx-0 sm:h-36 sm:w-48"
  >
    <svg
      className="h-full w-full overflow-visible drop-shadow-[0_22px_34px_rgba(255,106,169,0.22)]"
      viewBox="0 0 220 160"
    >
      <defs>
        <linearGradient
          id="ilonaStemGradient"
          x1="98"
          x2="128"
          y1="142"
          y2="52"
        >
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
        <radialGradient id="ilonaPetalGradient" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="46%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
        <linearGradient
          id="ilonaHandGradient"
          x1="55"
          x2="164"
          y1="131"
          y2="145"
        >
          <stop offset="0%" stopColor="#ffe4e6" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>

      <path
        d="M102 139C111 112 116 84 119 55"
        fill="none"
        stroke="url(#ilonaStemGradient)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        className="ilona-flower-leaf"
        d="M107 103C84 92 73 76 78 61C98 63 109 76 107 103Z"
        fill="#5eead4"
        opacity="0.88"
      />
      <path
        className="ilona-flower-leaf"
        d="M112 97C135 84 147 69 143 54C123 56 112 72 112 97Z"
        fill="#bef264"
        opacity="0.82"
      />

      <g className="ilona-flower-bloom" transform="translate(121 48)">
        {[
          "M0 -36C13 -28 16 -10 3 2C-12 -9 -12 -27 0 -36Z",
          "M28 -19C31 -4 19 10 2 4C4 -15 16 -25 28 -19Z",
          "M26 16C13 25 -5 19 -4 2C12 -4 27 1 26 16Z",
          "M-1 34C-15 25 -17 7 -3 0C9 12 10 27 -1 34Z",
          "M-29 15C-31 0 -17 -10 -3 -3C-8 14 -20 22 -29 15Z",
          "M-27 -20C-15 -28 1 -18 2 -2C-15 3 -29 -5 -27 -20Z",
        ].map((d, index) => (
          <path
            key={d}
            d={d}
            fill="url(#ilonaPetalGradient)"
            opacity={index % 2 === 0 ? 0.96 : 0.88}
          />
        ))}
        <circle r="11" fill="#fde68a" />
        <circle r="5" fill="#f472b6" />
      </g>

      <path
        d="M58 133C76 125 92 126 106 136C115 142 129 144 147 139C156 137 163 142 160 149C141 158 112 157 87 149L55 143C50 141 51 135 58 133Z"
        fill="url(#ilonaHandGradient)"
        opacity="0.96"
      />
      <path
        d="M79 130C91 128 101 132 109 139"
        fill="none"
        stroke="#fecdd3"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path d="M93 123L114 139L101 147L82 132Z" fill="#f9a8d4" opacity="0.82" />
      <path
        d="M96 127L111 139"
        stroke="#fff1f2"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  </div>
));

const Ilona = () => {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongEscaped, setWrongEscaped] = useState(false);
  const [activeWrongAnswer, setActiveWrongAnswer] = useState("");
  const [secretRevealed, setSecretRevealed] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const wrongButtonRef = useRef<HTMLButtonElement>(null);
  const activeRef = useRef(false);
  const stageRef = useRef(0);
  const wrongEscapedRef = useRef(false);
  const keyBufferRef = useRef("");
  const wrongPositionRef = useRef<PixelPosition>({ x: 0, y: 0 });
  const lastMoveRef = useRef(0);
  const lastDustRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  const completed = stage >= STAGES.length;
  const currentStage = STAGES[Math.min(stage, STAGES.length - 1)];
  const answers = useMemo(() => {
    const correctAnswerSet = new Set(currentStage.correctAnswers);
    const answerOrder = currentStage.answerOrder ?? [
      ...currentStage.correctAnswers,
      ...currentStage.wrongAnswers,
    ];

    return answerOrder.map((answer) => ({
      answer,
      correct: correctAnswerSet.has(answer),
    }));
  }, [currentStage]);
  const reaction = useMemo(
    () =>
      attempts === 0
        ? currentStage.idleLine
        : currentStage.taunts[(attempts - 1) % currentStage.taunts.length],
    [attempts, currentStage],
  );
  const answerGridClass =
    answers.length >= 8
      ? "grid-cols-5"
      : answers.length >= 4
        ? "grid-cols-4"
        : answers.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2";

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    wrongEscapedRef.current = wrongEscaped;
  }, [wrongEscaped]);

  useEffect(() => {
    if (!active) return undefined;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;

    body.classList.add("ilona-game-open");
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.touchAction = "none";

    return () => {
      body.classList.remove("ilona-game-open");
      html.style.overflow = previousHtmlOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;
      window.scrollTo(0, scrollY);
    };
  }, [active]);

  const clearFloating = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
    timeoutRefs.current = [];
    lastDustRef.current = 0;

    const field = fieldRef.current;
    if (field) {
      gsap.killTweensOf(Array.from(field.children));
      field.replaceChildren();
    }
  }, []);

  const getPointInOverlay = useCallback(
    (clientX: number, clientY: number): PointerPosition | null => {
      const overlay = overlayRef.current;
      if (!overlay) return null;

      const rect = overlay.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const y = clamp(clientY - rect.top, 0, rect.height);

      return {
        x,
        y,
        xPercent: clamp((x / rect.width) * 100, 0, 100),
        yPercent: clamp((y / rect.height) * 100, 0, 100),
      };
    },
    [],
  );

  const getPointerInOverlay = useCallback(
    (event: ReactPointerEvent<HTMLElement>): PointerPosition | null =>
      getPointInOverlay(event.clientX, event.clientY),
    [getPointInOverlay],
  );

  const getElementCenterInOverlay = useCallback(
    (element: HTMLElement | null): PointerPosition | null => {
      const overlay = overlayRef.current;
      if (!overlay || !element) return null;

      const rect = element.getBoundingClientRect();
      return getPointInOverlay(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
    },
    [getPointInOverlay],
  );

  const emitRunawayDust = useCallback(
    (
      origin: PixelPosition | null,
      target: PixelPosition | null = null,
      force = false,
      intensity = 1,
    ) => {
      const field = fieldRef.current;
      if (!field || !origin || prefersReducedMotion()) return;

      const now = performance.now();
      if (!force && now - lastDustRef.current < 125) return;

      lastDustRef.current = now;
      spawnStardust(field, origin, target, intensity);
    },
    [],
  );

  const getOverlayMetrics = useCallback(() => {
    const overlay = overlayRef.current;
    const button = wrongButtonRef.current;
    if (!overlay || !button) return null;

    const overlayRect = overlay.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const forbiddenRects = Array.from(
      overlay.querySelectorAll<HTMLButtonElement>(
        "[data-ilona-correct='true']",
      ),
    ).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - overlayRect.left - 18,
        right: rect.right - overlayRect.left + 18,
        top: rect.top - overlayRect.top - 18,
        bottom: rect.bottom - overlayRect.top + 18,
      };
    });

    return {
      overlayRect,
      buttonRect,
      forbiddenRects,
      maxX: Math.max(0, overlayRect.width - buttonRect.width),
      maxY: Math.max(0, overlayRect.height - buttonRect.height),
    };
  }, []);

  const isSafePosition = useCallback(
    (
      position: PixelPosition,
      width: number,
      height: number,
      forbiddenRects: ForbiddenRect[],
    ) =>
      !forbiddenRects.some((rect) =>
        overlapsRect(position, width, height, rect),
      ),
    [],
  );

  const setWrongButtonPosition = useCallback(
    (position: PixelPosition, animated = true, dramatic = false) => {
      const button = wrongButtonRef.current;
      if (!button) return;

      wrongPositionRef.current = position;

      if (!animated || prefersReducedMotion()) {
        gsap.set(button, {
          x: position.x,
          y: position.y,
          opacity: 1,
          scale: 1,
          rotation: 0,
        });
        return;
      }

      gsap.to(button, {
        x: position.x,
        y: position.y,
        opacity: 1,
        scale: 1,
        rotation: dramatic ? Math.random() * 16 - 8 : Math.random() * 7 - 3.5,
        duration: dramatic ? 0.66 : 0.46,
        ease: dramatic ? "elastic.out(1, 0.55)" : "power3.out",
        overwrite: "auto",
      });
    },
    [],
  );

  const pickRandomSafePosition = useCallback(
    (pointer: PixelPosition | null = null) => {
      const metrics = getOverlayMetrics();
      if (!metrics) return wrongPositionRef.current;

      const { buttonRect, forbiddenRects, maxX, maxY } = metrics;
      const current = wrongPositionRef.current;
      const minTravel = Math.min(
        140,
        Math.max(60, Math.hypot(maxX, maxY) * 0.22),
      );
      let best = wrongPositionRef.current;
      let bestScore = -Infinity;

      for (let i = 0; i < 48; i++) {
        const candidate = {
          x: Math.random() * Math.max(1, maxX - 20) + 10,
          y: Math.random() * Math.max(1, maxY - 96) + 84,
        };

        if (
          !isSafePosition(
            candidate,
            buttonRect.width,
            buttonRect.height,
            forbiddenRects,
          )
        ) {
          continue;
        }

        const distanceFromPointer = pointer
          ? Math.hypot(candidate.x - pointer.x, candidate.y - pointer.y)
          : 0;
        const distanceFromCurrent = Math.hypot(
          candidate.x - current.x,
          candidate.y - current.y,
        );
        if (i < 40 && distanceFromCurrent < minTravel) continue;

        const score = distanceFromCurrent + distanceFromPointer * 1.4;

        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }

      if (bestScore > -Infinity) return best;

      const lanes = [
        { x: maxX - 12, y: 92 },
        { x: 12, y: Math.max(92, maxY - 18) },
        { x: maxX - 12, y: Math.max(92, maxY - 18) },
        { x: 12, y: 92 },
      ];

      const safeLane =
        lanes
          .filter((position) =>
            isSafePosition(
              position,
              buttonRect.width,
              buttonRect.height,
              forbiddenRects,
            ),
          )
          .sort((a, b) => {
            const scoreA =
              Math.hypot(a.x - current.x, a.y - current.y) +
              (pointer ? Math.hypot(a.x - pointer.x, a.y - pointer.y) : 0);
            const scoreB =
              Math.hypot(b.x - current.x, b.y - current.y) +
              (pointer ? Math.hypot(b.x - pointer.x, b.y - pointer.y) : 0);

            return scoreB - scoreA;
          })[0] ?? lanes[0];

      return safeLane;
    },
    [getOverlayMetrics, isSafePosition],
  );

  const pickEscapePosition = useCallback(
    (pointer: PixelPosition | null, dramatic: boolean) => {
      const metrics = getOverlayMetrics();
      if (!metrics) return wrongPositionRef.current;

      const { overlayRect, buttonRect, forbiddenRects, maxX, maxY } = metrics;
      const current = {
        x: buttonRect.left - overlayRect.left,
        y: buttonRect.top - overlayRect.top,
      };
      const center = {
        x: current.x + buttonRect.width / 2,
        y: current.y + buttonRect.height / 2,
      };
      const origin =
        pointer ??
        ({
          x: center.x + (Math.random() - 0.5) * 160,
          y: center.y + (Math.random() - 0.5) * 160,
        } satisfies PixelPosition);
      const dx = center.x - origin.x;
      const dy = center.y - origin.y;
      const length = Math.hypot(dx, dy) || 1;
      const step = dramatic ? 330 : 265;
      const away = {
        x: current.x + (dx / length) * step,
        y: current.y + (dy / length) * step,
      };
      let best = wrongPositionRef.current;
      let bestScore = -Infinity;

      for (let i = 0; i < 24; i++) {
        const candidate = {
          x: clamp(
            away.x + (Math.random() - 0.5) * (dramatic ? 440 : 320),
            10,
            Math.max(10, maxX - 10),
          ),
          y: clamp(
            away.y + (Math.random() - 0.5) * (dramatic ? 330 : 250),
            84,
            Math.max(84, maxY - 12),
          ),
        };

        if (
          !isSafePosition(
            candidate,
            buttonRect.width,
            buttonRect.height,
            forbiddenRects,
          )
        ) {
          continue;
        }

        const candidateCenter = {
          x: candidate.x + buttonRect.width / 2,
          y: candidate.y + buttonRect.height / 2,
        };
        const pointerDistance = Math.hypot(
          candidateCenter.x - origin.x,
          candidateCenter.y - origin.y,
        );
        const travelDistance = Math.hypot(
          candidate.x - current.x,
          candidate.y - current.y,
        );
        const edgeBonus =
          Math.abs(candidate.x - maxX / 2) * 0.5 +
          Math.abs(candidate.y - maxY / 2) * 0.35;
        const score = pointerDistance * 1.5 + travelDistance * 0.55 + edgeBonus;

        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }

      return bestScore > -Infinity ? best : pickRandomSafePosition(pointer);
    },
    [getOverlayMetrics, isSafePosition, pickRandomSafePosition],
  );

  const moveWrongAnswer = useCallback(
    (pointer: PixelPosition | null, dramatic = false, force = false) => {
      const now = performance.now();
      if (!force && now - lastMoveRef.current < 70) return;
      lastMoveRef.current = now;

      const button = wrongButtonRef.current;
      const origin = getElementCenterInOverlay(button);
      const next = pickEscapePosition(pointer, dramatic);
      if (button && origin) {
        const rect = button.getBoundingClientRect();
        emitRunawayDust(
          origin,
          { x: next.x + rect.width / 2, y: next.y + rect.height / 2 },
          dramatic || force,
          dramatic ? 1.25 : 0.9,
        );
      }
      setWrongButtonPosition(next, true, dramatic);
    },
    [
      emitRunawayDust,
      getElementCenterInOverlay,
      pickEscapePosition,
      setWrongButtonPosition,
    ],
  );

  const teleportWrongAnswer = useCallback(
    (pointer: PixelPosition | null = null) => {
      const button = wrongButtonRef.current;
      if (!button) return;

      gsap.killTweensOf(button);
      const origin = getElementCenterInOverlay(button);
      const next = pickRandomSafePosition(pointer);
      if (origin) {
        const rect = button.getBoundingClientRect();
        emitRunawayDust(
          origin,
          { x: next.x + rect.width / 2, y: next.y + rect.height / 2 },
          true,
          1.25,
        );
      }
      wrongPositionRef.current = next;

      if (prefersReducedMotion()) {
        gsap.set(button, {
          x: next.x,
          y: next.y,
          opacity: 1,
          pointerEvents: "auto",
          scale: 1,
        });
        return;
      }

      gsap
        .timeline({
          overwrite: true,
          onComplete: () => {
            gsap.set(button, { pointerEvents: "auto" });
          },
        })
        .set(button, { pointerEvents: "none" })
        .to(button, {
          opacity: 0,
          scale: 0.55,
          rotation: Math.random() > 0.5 ? 24 : -24,
          duration: 0.08,
          ease: "power2.in",
        })
        .set(button, {
          x: next.x,
          y: next.y,
          rotation: Math.random() * 14 - 7,
        })
        .to(button, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.22,
          ease: "back.out(1.9)",
        });
    },
    [emitRunawayDust, getElementCenterInOverlay, pickRandomSafePosition],
  );

  const activateRunaway = useCallback(
    (
      sourceElement?: HTMLElement,
      pointer: PixelPosition | null = null,
      action: "escape" | "teleport" = "escape",
      answer = currentStage.wrongAnswers[0] ?? "",
    ) => {
      const overlay = overlayRef.current;

      if (!overlay || !sourceElement) {
        if (answer) setActiveWrongAnswer(answer);
        if (!wrongEscapedRef.current) {
          flushSync(() => {
            setActiveWrongAnswer(answer);
            setWrongEscaped(true);
          });
        }
        if (action === "teleport") teleportWrongAnswer(pointer);
        else moveWrongAnswer(pointer, false, true);
        return;
      }

      const overlayRect = overlay.getBoundingClientRect();
      const inlineRect = sourceElement.getBoundingClientRect();
      const start = {
        x: inlineRect.left - overlayRect.left,
        y: inlineRect.top - overlayRect.top,
      };

      flushSync(() => {
        setActiveWrongAnswer(answer);
        setWrongEscaped(true);
      });

      const button = wrongButtonRef.current;
      if (!button) return;

      wrongPositionRef.current = start;
      gsap.set(button, {
        x: start.x,
        y: start.y,
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      if (action === "teleport") {
        teleportWrongAnswer(pointer);
      } else {
        moveWrongAnswer(pointer, false, true);
      }
    },
    [currentStage.wrongAnswers, moveWrongAnswer, teleportWrongAnswer],
  );

  const close = useCallback(() => {
    clearFloating();

    const overlay = overlayRef.current;
    const card = cardRef.current;

    if (!overlay || !card || prefersReducedMotion()) {
      setActive(false);
      setStage(0);
      setWrongEscaped(false);
      setActiveWrongAnswer("");
      setSecretRevealed(false);
      return;
    }

    gsap
      .timeline({
        onComplete: () => {
          setActive(false);
          setStage(0);
          setWrongEscaped(false);
          setActiveWrongAnswer("");
          setSecretRevealed(false);
        },
      })
      .to(card, { y: 34, scale: 0.96, opacity: 0, duration: 0.28 })
      .to(overlay, { opacity: 0, duration: 0.25 }, "-=0.12");
  }, [clearFloating]);

  const playWrongJoke = useCallback(
    (event?: ReactPointerEvent<HTMLElement>, answer = activeWrongAnswer) => {
      const stageIndex = stageRef.current;
      const field = fieldRef.current;
      const pointer = event ? getPointerInOverlay(event) : null;
      const impact =
        pointer ??
        getElementCenterInOverlay(
          event?.currentTarget ?? wrongButtonRef.current,
        );
      const stageData = STAGES[Math.min(stageIndex, STAGES.length - 1)];

      if (field) {
        if (impact) {
          spawnHitRings(field, impact);
          spawnStardust(field, impact, null, 0.85);
        }

        const badge =
          stageData.wrongBadges[
            Math.floor(Math.random() * stageData.wrongBadges.length)
          ];
        spawnBadge(
          field,
          badge,
          pointer?.xPercent ?? 58,
          pointer?.yPercent ?? 54,
        );
      }

      setAttempts((current) => current + 1);
      if (event?.currentTarget === wrongButtonRef.current) {
        teleportWrongAnswer(pointer);
        return;
      }
      activateRunaway(event?.currentTarget, pointer, "teleport", answer);
    },
    [
      activateRunaway,
      activeWrongAnswer,
      getElementCenterInOverlay,
      getPointerInOverlay,
      teleportWrongAnswer,
    ],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeRef.current) {
        close();
        return;
      }

      if (isTypingTarget(document.activeElement)) {
        keyBufferRef.current = "";
        return;
      }

      if (event.key.length !== 1) return;

      keyBufferRef.current = (
        keyBufferRef.current + event.key.toLowerCase()
      ).slice(-TRIGGER.length);

      if (keyBufferRef.current === TRIGGER) {
        keyBufferRef.current = "";
        setActive(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!active) return undefined;

    setStage(0);
    setAttempts(0);
    setWrongEscaped(false);
    setActiveWrongAnswer("");
    setSecretRevealed(false);
    clearFloating();

    const field = fieldRef.current;
    const overlay = overlayRef.current;
    const card = cardRef.current;

    if (!field || !overlay || !card) return undefined;

    if (!prefersReducedMotion()) {
      gsap.set(overlay, { opacity: 0 });
      gsap.set(card, { y: 54, scale: 0.96, opacity: 0 });

      gsap
        .timeline()
        .to(overlay, { opacity: 1, duration: 0.35, ease: "power2.out" })
        .to(
          card,
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.58,
            ease: "back.out(1.45)",
          },
          "-=0.16",
        );
    }

    for (let i = 0; i < 14; i++) {
      const timeout = window.setTimeout(
        () => spawnHeart(field, Math.random() * 100, 96, true),
        i * 95,
      );
      timeoutRefs.current.push(timeout);
    }

    intervalRef.current = window.setInterval(() => {
      if (fieldRef.current) spawnHeart(fieldRef.current);
    }, 850);

    return clearFloating;
  }, [active, clearFloating]);

  useEffect(() => {
    if (!active || completed) return undefined;

    setWrongEscaped(false);
    setActiveWrongAnswer("");
    const frame = window.requestAnimationFrame(() => {
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          ".ilona-stage-panel",
          { y: 18, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.42,
            stagger: 0.05,
            ease: "power2.out",
          },
        );
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active, completed, stage]);

  useEffect(() => {
    if (!active || !completed) return undefined;

    setWrongEscaped(false);
    setActiveWrongAnswer("");
    const field = fieldRef.current;
    if (!field) return undefined;

    if (!prefersReducedMotion()) {
      gsap.fromTo(
        ".ilona-success-pop",
        { y: 20, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.52,
          stagger: 0.08,
          ease: "back.out(1.5)",
        },
      );
    }

    for (let i = 0; i < 42; i++) {
      const timeout = window.setTimeout(() => {
        if (!fieldRef.current) return;
        spawnConfetti(fieldRef.current);
        spawnHeart(fieldRef.current, 50, 52, true);
      }, i * 30);
      timeoutRefs.current.push(timeout);
    }

    return undefined;
  }, [active, completed]);

  useEffect(() => {
    if (!active || !completed || !secretRevealed) return undefined;

    const field = fieldRef.current;
    if (field) {
      spawnBadge(field, "החלק האמיתי נפתח", 50, 42);
    }

    if (prefersReducedMotion()) return undefined;

    gsap.fromTo(
      ".ilona-secret-pop",
      { y: 22, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "back.out(1.35)",
      },
    );

    const secretIconTween = gsap.fromTo(
      ".ilona-secret-icon",
      { y: 8, scale: 0.78, rotation: -10 },
      {
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.62,
        ease: "back.out(1.8)",
      },
    );
    const flowerGiftTween = gsap
      .timeline()
      .fromTo(
        ".ilona-flower-gift",
        { x: -42, y: 18, opacity: 0, scale: 0.82, rotation: -9 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.72,
          ease: "back.out(1.7)",
        },
      )
      .fromTo(
        ".ilona-flower-bloom",
        { scale: 0.65, rotation: -16, transformOrigin: "50% 90%" },
        {
          scale: 1,
          rotation: 0,
          duration: 0.58,
          ease: "back.out(2)",
        },
        "-=0.36",
      )
      .fromTo(
        ".ilona-flower-leaf",
        {
          scale: 0.75,
          rotation: (index: number) => (index === 0 ? 12 : -12),
          transformOrigin: "50% 100%",
        },
        {
          scale: 1,
          rotation: 0,
          duration: 0.46,
          stagger: 0.06,
          ease: "back.out(1.8)",
        },
        "-=0.42",
      );

    return () => {
      secretIconTween.kill();
      flowerGiftTween.kill();
    };
  }, [active, completed, secretRevealed]);

  const handleOverlayPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const wrongButton = wrongButtonRef.current;
      if (!wrongButton || completed || !wrongEscaped) return;

      const rect = wrongButton.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY,
      );

      if (distance < 190) {
        moveWrongAnswer(getPointerInOverlay(event), false);
      }
    },
    [completed, getPointerInOverlay, moveWrongAnswer, wrongEscaped],
  );

  const handleWrongInlinePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, answer: string) => {
      activateRunaway(
        event.currentTarget,
        getPointerInOverlay(event),
        "escape",
        answer,
      );
    },
    [activateRunaway, getPointerInOverlay],
  );

  const handleWrongInlinePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, answer: string) => {
      event.preventDefault();
      event.stopPropagation();
      playWrongJoke(event, answer);
    },
    [playWrongJoke],
  );

  const handleWrongInlineKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, answer: string) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateRunaway(event.currentTarget, null, "teleport", answer);
      setAttempts((current) => current + 1);
    },
    [activateRunaway],
  );

  const handleWrongPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      playWrongJoke(event);
    },
    [playWrongJoke],
  );

  const handleWrongKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      playWrongJoke();
    },
    [playWrongJoke],
  );

  const handleRevealSecret = useCallback(() => {
    const field = fieldRef.current;

    setSecretRevealed(true);

    if (!field) return;

    for (let i = 0; i < 28; i++) {
      const timeout = window.setTimeout(() => {
        if (!fieldRef.current) return;
        spawnConfetti(fieldRef.current);
        spawnHeart(fieldRef.current, 50 + Math.random() * 16 - 8, 48, true);
      }, i * 34);
      timeoutRefs.current.push(timeout);
    }
  }, []);

  const handleCorrectAnswer = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      const currentStage = stageRef.current;
      const field = fieldRef.current;
      const stageData = STAGES[Math.min(currentStage, STAGES.length - 1)];
      const pointer =
        event.clientX || event.clientY
          ? getPointInOverlay(event.clientX, event.clientY)
          : null;
      const impact = pointer ?? getElementCenterInOverlay(event.currentTarget);

      if (field) {
        if (impact) {
          spawnHitRings(field, impact);
          spawnStardust(field, impact, null, 0.85);
        }

        if (currentStage < STAGES.length - 1) {
          spawnStagePraise(field);
        }

        spawnBadge(field, stageData.successBadge, 50, 50);
        for (let i = 0; i < 12; i++) {
          const timeout = window.setTimeout(
            () => spawnHeart(field, 25 + i * 4.5, 63, true),
            i * 32,
          );
          timeoutRefs.current.push(timeout);
        }
      }

      if (currentStage < STAGES.length - 1) {
        setAttempts(0);
        setWrongEscaped(false);
        setActiveWrongAnswer("");
        setSecretRevealed(false);
        setStage(currentStage + 1);
        return;
      }

      setAttempts(0);
      setWrongEscaped(false);
      setActiveWrongAnswer("");
      setSecretRevealed(false);
      setStage(STAGES.length);
    },
    [getElementCenterInOverlay, getPointInOverlay],
  );

  if (!active) return null;

  return (
    <div
      ref={overlayRef}
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#100716] p-1.5 text-white sm:p-4"
      dir="rtl"
      onPointerMove={handleOverlayPointerMove}
      role="dialog"
      style={{
        background:
          "radial-gradient(circle at 18% 18%, rgba(255,106,169,0.24), transparent 33%), radial-gradient(circle at 84% 18%, rgba(103,232,249,0.15), transparent 30%), radial-gradient(circle at 60% 88%, rgba(253,230,138,0.11), transparent 28%), linear-gradient(135deg, #120714 0%, #2d0b28 46%, #0b1024 100%)",
      }}
    >
      <div
        ref={fieldRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />

      {wrongEscaped && !completed && (
        <button
          key={`runaway-${stage}`}
          ref={wrongButtonRef}
          type="button"
          onFocus={() => moveWrongAnswer(null, false, true)}
          onKeyDown={handleWrongKeyDown}
          onPointerDown={handleWrongPointerDown}
          onPointerEnter={(event) =>
            moveWrongAnswer(getPointerInOverlay(event), false, true)
          }
          style={{ opacity: 0 }}
          className={runawayButtonClass}
        >
          {activeWrongAnswer}
        </button>
      )}

      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-pink-200/20 bg-white/[0.075] p-3 text-right shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:max-w-2xl sm:p-6"
      >
        <button
          type="button"
          onClick={close}
          className="absolute left-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-pink-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink-200/60 sm:left-4 sm:top-4 sm:h-9 sm:w-9"
          aria-label="סגירת המשחק של אילונה"
        >
          <span aria-hidden className="text-xl leading-none">
            x
          </span>
        </button>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />

        {completed ? (
          secretRevealed ? (
            <div className="py-2 text-center sm:py-4">
              <div className="ilona-secret-pop relative mx-auto mb-3 grid h-12 w-12 place-items-center sm:mb-4 sm:h-16 sm:w-16">
                <span className="absolute inset-0 rounded-full bg-cyan-200/20 blur-sm" />
                <span className="absolute inset-3 rounded-full border border-pink-200/25 bg-white/10" />
                <FaStar
                  aria-hidden
                  className="ilona-secret-icon relative text-2xl text-pink-100 drop-shadow-[0_0_26px_rgba(255,143,189,0.65)] sm:text-3xl"
                />
              </div>

              <p className="ilona-secret-pop mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70 sm:text-xs">
                החלק האמיתי
              </p>
              <h2 className="ilona-secret-pop text-2xl font-black text-pink-100 drop-shadow-[0_0_28px_rgba(255,143,189,0.45)] sm:text-4xl">
                כל זה היה רק הדרך להגיע לכאן
              </h2>

              <div className="ilona-secret-pop mx-auto mt-3 flex max-w-xl flex-col items-center gap-3 rounded-lg border border-pink-200/15 bg-black/20 p-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:mt-4 sm:flex-row sm:justify-between sm:gap-4 sm:p-4">
                <p className="w-full text-sm leading-6 text-pink-50/90 sm:flex-1 sm:text-base sm:leading-7">
                  כל זה היה רק כדי להצחיק אותך קצת,
                  <br />
                  אבל גם להשאיר לך משהו קטן ואמיתי.
                  <br />
                  <br />
                  יש לך לב טוב, רגיש ומיוחד,
                  <br />
                  ואני באמת שמח שאת בחיים שלי.
                </p>
                <FlowerGift />
              </div>

              <button
                type="button"
                onClick={close}
                className="ilona-secret-pop mt-4 rounded-lg bg-pink-200 px-5 py-2.5 text-sm font-bold text-[#2d0b28] shadow-[0_12px_34px_rgba(255,143,189,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 sm:mt-5 sm:py-3"
              >
                סגור
              </button>
            </div>
          ) : (
            <div className="py-1 text-center sm:py-3">
              <div className="ilona-success-pop relative mx-auto mb-2 grid h-12 w-12 place-items-center sm:mb-3 sm:h-16 sm:w-16">
                <span className="absolute inset-0 rounded-full bg-pink-300/25 animate-ping" />
                <span className="absolute inset-3 rounded-full bg-cyan-300/10" />
                <svg
                  aria-hidden
                  className="relative h-8 w-8 drop-shadow-[0_0_24px_rgba(255,106,169,0.65)] sm:h-10 sm:w-10"
                  viewBox="0 0 32 29"
                >
                  <path
                    fill="#ff8fbd"
                    d="M23.7 0C20.4 0 17.8 1.9 16 4.4 14.2 1.9 11.6 0 8.3 0 3.7 0 0 3.7 0 8.3c0 9.1 14.8 19.5 15.4 19.9.4.3.9.3 1.2 0C17.2 27.8 32 17.4 32 8.3 32 3.7 28.3 0 23.7 0Z"
                  />
                </svg>
              </div>

              <p className="ilona-success-pop mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/70 sm:text-xs">
                relationship agreement signed
              </p>
              <h2 className="ilona-success-pop text-xl font-black text-pink-100 drop-shadow-[0_0_28px_rgba(255,143,189,0.45)] sm:text-3xl">
                אני שמח שאנחנו מבינים אחת את השנייה
              </h2>
              <p className="ilona-success-pop mx-auto mt-2 max-w-lg text-xs leading-5 text-pink-50/85 sm:mt-3 sm:text-sm sm:leading-6">
                היה שאלון הוגן לחלוטין !
              </p>

              <div className="ilona-success-pop mx-auto mt-2 max-w-lg rounded-lg border border-white/10 bg-black/20 p-2.5 text-center sm:mt-3 sm:p-3">
                <p className="text-xs font-bold leading-5 text-cyan-50/85 sm:text-sm sm:leading-6">
                  נשאר רק סעיף אחד שלא נכנס לפרוטוקול.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRevealSecret}
                className="ilona-success-pop mx-auto mt-3 flex items-center justify-center gap-2 rounded-lg bg-pink-200 px-5 py-2.5 text-sm font-bold text-[#2d0b28] shadow-[0_12px_34px_rgba(255,143,189,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 sm:mt-4 sm:py-3"
              >
                <FaFileSignature aria-hidden />
                פתחי את הסעיף הסודי
              </button>
            </div>
          )
        ) : (
          <div className="text-center">
            <div className="ilona-stage-panel mb-2 flex items-center justify-center gap-1.5 sm:mb-4 sm:gap-2">
              {STAGES.map((item, index) => (
                <span
                  key={item.badge}
                  className={`h-2 rounded-full transition-all sm:h-2.5 ${
                    index === stage
                      ? "w-7 bg-pink-200 sm:w-9"
                      : "w-2 bg-white/25 sm:w-2.5"
                  }`}
                />
              ))}
            </div>

            <p className="ilona-stage-panel mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70 sm:mb-3 sm:text-xs sm:tracking-[0.24em]">
              {currentStage.badge}
            </p>
            <h1 className="ilona-stage-panel text-2xl font-black text-pink-100 drop-shadow-[0_0_28px_rgba(255,143,189,0.45)] sm:text-4xl">
              {currentStage.title}
            </h1>

            <div className="ilona-stage-panel mx-auto mt-3 max-w-xl rounded-lg border border-white/10 bg-black/20 p-3 text-right sm:mt-5 sm:p-5">
              <p className="text-xs font-bold text-pink-100/55 sm:text-sm">
                בחרי בזהירות
              </p>
              <p className="mt-2 text-lg font-bold leading-snug text-white sm:mt-3 sm:text-2xl">
                {currentStage.question}
              </p>
              <p className="mt-2 text-xs font-semibold leading-5 text-cyan-100/70 sm:mt-3 sm:text-sm">
                {currentStage.note}
              </p>
            </div>

            <div
              className={`ilona-stage-panel mx-auto mt-3 grid max-w-xl gap-2 sm:mt-6 sm:gap-3 ${answerGridClass}`}
            >
              {answers.map(({ answer, correct }) =>
                correct ? (
                  <button
                    key={answer}
                    type="button"
                    data-ilona-correct="true"
                    onClick={handleCorrectAnswer}
                    className={correctButtonClass}
                  >
                    {answer}
                  </button>
                ) : wrongEscaped && activeWrongAnswer === answer ? (
                  <span
                    key={answer}
                    aria-hidden
                    className={`${correctButtonClass} invisible block`}
                  >
                    {answer}
                  </span>
                ) : (
                  <button
                    key={answer}
                    type="button"
                    onFocus={(event) =>
                      activateRunaway(
                        event.currentTarget,
                        null,
                        "escape",
                        answer,
                      )
                    }
                    onKeyDown={(event) =>
                      handleWrongInlineKeyDown(event, answer)
                    }
                    onPointerDown={(event) =>
                      handleWrongInlinePointerDown(event, answer)
                    }
                    onPointerEnter={(event) =>
                      handleWrongInlinePointerEnter(event, answer)
                    }
                    className={correctButtonClass}
                  >
                    {answer}
                  </button>
                ),
              )}
            </div>

            <p className="ilona-stage-panel mt-3 min-h-5 text-xs font-bold leading-5 text-pink-100/70 sm:mt-5 sm:min-h-6 sm:text-sm">
              {reaction}
            </p>

            <p className="ilona-stage-panel mt-1.5 text-[10px] font-semibold text-white/35 sm:mt-3 sm:text-xs">
              אזהרת מערכת: תשובות מוגזמות נלחצות ומאבדות כיוון, עדיין ניתן לנסות
              ללחוץ עליהם.
            </p>
          </div>
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_130px_rgba(0,0,0,0.58)]"
      />
    </div>
  );
};

export default memo(Ilona);
