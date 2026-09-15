// SimplyClean — PowerPoint remodel of the Remotion promo video.
// Every scene of simplyclean-video/src/scenes/*.tsx becomes one slide.
// Coordinates are ported from the 1920×1080 video canvas: 144 px = 1 inch on a 13.33" wide slide.

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaRegCalendarAlt, FaLink, FaRegClock, FaMapMarkerAlt, FaCamera, FaHome,
  FaCheck, FaTimes, FaSyncAlt,
} = require("react-icons/fa");

// ---------- palette (from Background.tsx and the scenes) ----------
const C = {
  ground: "F3F6F5",
  blob: "D9ECEA",
  blobPeach: "FBE6D9",
  navy: "12303F",
  navyBlob: "1B4A55",
  navyBlobSmall: "0F3A44",
  teal: "157A78",
  teal2: "1F9490",
  teal3: "4FB3AE",
  teal4: "8FD0CC",
  tealLight: "7FD1CD",
  tealPale: "BFE7E4",
  orange: "D9622B",
  orangeDark: "8A3C14",
  peach: "F0A07A",
  gray: "5B6B72",
  grayNavy: "9FB3BA",
  track: "E3EAE8",
  cell: "EEF2F1",
  white: "FFFFFF",
};

const FONT = "Arial";
const px = (n) => n / 144; // video px → inches
const pt = (n) => n / 2; // video font px → points (1px = 0.5pt at this scale)

// ---------- icons ----------
async function icon(Component, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Component, { color: `#${color}`, size }),
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- shared helpers ----------
function shadow(color = "12303F", opacity = 0.1) {
  return { type: "outer", color, blur: 14, offset: 5, angle: 90, opacity };
}

function background(slide, variant = "light") {
  const navy = variant === "navy";
  slide.background = { color: navy ? C.navy : C.ground };
  // big blob, top-right (1100px circle, right:-350 top:-450)
  slide.addShape("ellipse", {
    x: px(1920 - 1100 + 350), y: px(-450), w: px(1100), h: px(1100),
    fill: { color: navy ? C.navyBlob : C.blob, transparency: 10 }, line: { color: navy ? C.navyBlob : C.blob, transparency: 100 },
  });
  // small blob, bottom-left (520px circle, left:-200 bottom:-260)
  slide.addShape("ellipse", {
    x: px(-200), y: px(1080 - 520 + 260), w: px(520), h: px(520),
    fill: { color: navy ? C.navyBlobSmall : C.blobPeach, transparency: 20 }, line: { color: navy ? C.navyBlobSmall : C.blobPeach, transparency: 100 },
  });
}

function kicker(slide, text, color) {
  slide.addText(text.toUpperCase(), {
    x: px(120), y: px(100), w: px(1680), h: px(40),
    fontFace: FONT, fontSize: pt(30), bold: true, color, charSpacing: 2, margin: 0, valign: "middle",
  });
}

function headline(slide, text, color, opts = {}) {
  slide.addText(text, {
    x: px(120), y: px(150), w: px(opts.w || 1680), h: px(opts.h || 100),
    fontFace: FONT, fontSize: pt(opts.size || 84), bold: true, color, margin: 0, valign: "top",
    charSpacing: -1,
  });
}

function logoMark(slide, x, y, size, starRatio = 0.55) {
  slide.addShape("roundRect", {
    x, y, w: size, h: size, rectRadius: size * 0.28,
    fill: { color: C.teal }, line: { color: C.teal, transparency: 100 },
    shadow: shadow(C.teal, 0.3),
  });
  const s = size * starRatio;
  slide.addShape("star4", {
    x: x + (size - s) / 2, y: y + (size - s) / 2, w: s, h: s,
    fill: { color: C.white }, line: { color: C.white, transparency: 100 },
  });
}

// ---------- build ----------
(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in — same 16:9 as the video
  pres.title = "SimplyClean";
  pres.author = "Tým č. 3 „Mladé svaly“";
  pres.lang = "cs-CZ";

  const ic = {
    calendar: await icon(FaRegCalendarAlt, C.white),
    link: await icon(FaLink, C.white),
    clock: await icon(FaRegClock, C.white),
    pin: await icon(FaMapMarkerAlt, C.white),
    camera: await icon(FaCamera, C.white),
    home: await icon(FaHome, C.white),
    check: await icon(FaCheck, C.tealLight),
    times: await icon(FaTimes, C.peach),
    sync: await icon(FaSyncAlt, C.orangeDark),
  };

  // ===================================================== 1 · Intro
  {
    const s = pres.addSlide();
    background(s, "light");

    // course badge pill
    const badge = "Metadovednosti pro praxi I · Projektová dokumentace".toUpperCase();
    s.addShape("roundRect", {
      x: px(360), y: px(250), w: px(1200), h: px(64), rectRadius: px(32),
      fill: { color: C.white }, line: { color: C.white, transparency: 100 },
    });
    s.addText(badge, {
      x: px(360), y: px(250), w: px(1200), h: px(64),
      fontFace: FONT, fontSize: pt(26), bold: true, color: C.teal, charSpacing: 2, align: "center", valign: "middle", margin: 0,
    });

    // logo + wordmark, centered as a group (icon 140 + gap 36 + text ≈ 830)
    const groupW = 140 + 36 + 960;
    const gx = (1920 - groupW) / 2;
    logoMark(s, px(gx), px(380), px(140));
    s.addText("SimplyClean", {
      x: px(gx + 176), y: px(350), w: px(1000), h: px(200),
      fontFace: FONT, fontSize: pt(150), bold: true, color: C.navy, charSpacing: -4, margin: 0, valign: "middle",
    });

    s.addText("Automatické objednávání úklidu krátkodobých pronájmů", {
      x: px(260), y: px(590), w: px(1400), h: px(80),
      fontFace: FONT, fontSize: pt(52), color: C.gray, align: "center", valign: "middle", margin: 0,
    });

    s.addText("Tým č. 3 „Mladé svaly“ · Skupina S4 · Mentor prof. Josef Hynek", {
      x: px(120), y: px(940), w: px(1680), h: px(44),
      fontFace: FONT, fontSize: pt(30), bold: true, color: C.teal, align: "center", valign: "middle", margin: 0,
    });

    s.addNotes(
      "SimplyClean je digitální pracovní platforma, která majitelům krátkodobých pronájmů v Praze automaticky objednává úklid mezi hosty. " +
      "Majitel jednou připojí rezervační kalendář; od té chvíle systém při každé rezervaci sám vytvoří úklidový slot a nabídne ho uklízečkám v okolí. " +
      "Tým: Michael Černý, Jakub Lisý, Anna Štefanková, Oliver Slivka, Martin Růžek.",
    );
  }

  // ===================================================== 2 · Problem
  {
    const s = pres.addSlide();
    background(s, "light");
    kicker(s, "Problém", C.orange);
    headline(s, "Každá rezervace = ruční objednávka úklidu", C.navy, { size: 76 });

    // --- calendar card (left)
    const cx = 120, cy = 300, cw = 700;
    s.addShape("roundRect", {
      x: px(cx), y: px(cy), w: px(cw), h: px(560), rectRadius: px(32),
      fill: { color: C.white }, line: { color: C.white, transparency: 100 }, shadow: shadow(),
    });
    s.addText("Rezervační kalendář · Byt Vinohrady", {
      x: px(cx + 40), y: px(cy + 36), w: px(cw - 80), h: px(40),
      fontFace: FONT, fontSize: pt(30), bold: true, color: C.gray, margin: 0, valign: "middle",
    });
    const booked = [1, 2, 3, 5, 6, 8, 9, 10, 11, 13, 14, 16, 17, 18, 20, 21, 22, 24, 25, 27];
    const cont = [2, 3, 6, 9, 10, 11, 14, 17, 18, 21, 22, 25];
    for (let i = 0; i < 28; i++) {
      const col = i % 7, row = Math.floor(i / 7);
      const isBooked = booked.includes(i);
      const isStart = isBooked && !cont.includes(i);
      const x = cx + 40 + col * 84, y = cy + 96 + row * 84;
      s.addShape("roundRect", {
        x: px(x), y: px(y), w: px(72), h: px(72), rectRadius: px(14),
        fill: { color: isBooked ? C.teal : C.cell },
        line: isStart ? { color: C.orange, width: 2 } : { color: C.cell, transparency: 100 },
      });
      s.addText(String(i + 1), {
        x: px(x), y: px(y), w: px(72), h: px(72),
        fontFace: FONT, fontSize: pt(26), bold: true, color: isBooked ? C.white : C.gray, align: "center", valign: "middle", margin: 0,
      });
    }
    s.addText(
      [
        { text: "▢ oranžově", options: { color: C.orange, bold: true } },
        { text: " = nový příjezd → je potřeba objednat úklid", options: { color: C.gray } },
      ],
      { x: px(cx + 40), y: px(cy + 440), w: px(cw - 80), h: px(80), fontFace: FONT, fontSize: pt(26), margin: 0, valign: "middle" },
    );

    // --- chat bubbles (right)
    const bubbles = [
      { text: "Ahoj, můžeš v úterý ve 13:00?", mine: true, w: 470 },
      { text: "Jo, ale jen do 15. Kde je klíč?", mine: false, w: 480 },
      { text: "Host se posunul, změna na 16:00 😩", mine: true, w: 560 },
      { text: "To už nestíhám, sorry", mine: false, w: 360 },
      { text: "Zrušeno. Sobota? Prosím…", mine: true, w: 480 },
    ];
    const bx = 1040, bw = 760;
    let by = 300;
    for (const b of bubbles) {
      const h = 78;
      const x = b.mine ? bx + bw - b.w : bx;
      s.addShape("roundRect", {
        x: px(x), y: px(by), w: px(b.w), h: px(h), rectRadius: px(28),
        fill: { color: b.mine ? C.teal : C.white }, line: { color: b.mine ? C.teal : C.white, transparency: 100 }, shadow: shadow(C.navy, 0.08),
      });
      s.addText(b.text, {
        x: px(x + 30), y: px(by), w: px(b.w - 60), h: px(h),
        fontFace: FONT, fontSize: pt(30), color: b.mine ? C.white : C.navy, valign: "middle", margin: 0,
      });
      by += h + 18;
    }

    // --- bottom stat
    s.addText("7–9×", {
      x: px(120), y: px(900), w: px(330), h: px(120),
      fontFace: FONT, fontSize: pt(104), bold: true, color: C.orange, charSpacing: -2, margin: 0, valign: "middle",
    });
    s.addText("měsíčně na jeden byt. Desítky minut u každé rezervace.", {
      x: px(460), y: px(900), w: px(1340), h: px(120),
      fontFace: FONT, fontSize: pt(40), bold: true, color: C.navy, margin: 0, valign: "middle",
    });

    s.addNotes(
      "Rezervační kalendář a uklízečka spolu nekomunikují. Každou změnu musí majitel ručně přeložit na objednávku a odeslat přes WhatsApp. " +
      "Při 70% obsazenosti a průměrné délce pobytu 2,5–3 noci vychází 7 až 9 výměn hostů měsíčně na jeden byt. " +
      "Důsledky: desítky minut u každé rezervace, změny se k uklízečce nedostanou včas, úklid propadne a host to napíše do recenze.",
    );
  }

  // ===================================================== 3 · Root cause
  {
    const s = pres.addSlide();
    background(s, "navy");
    kicker(s, "5 Whys · Ishikawa", C.tealLight);
    headline(s, "Proč se úklid objednává ručně?", C.white);

    const causes = [
      { title: "Kalendář nikam nevede", sub: "systémová příčina" },
      { title: "7–9 úklidů měsíčně na byt", sub: "chybí měřítko pro vlastní nástroj" },
      { title: "Každý majitel to dělá jinak", sub: "behaviorální příčina" },
    ];
    const cardW = (1680 - 2 * 32) / 3, cardY = 320, cardH = 330;
    causes.forEach((c, i) => {
      const x = 120 + i * (cardW + 32);
      s.addShape("roundRect", {
        x: px(x), y: px(cardY), w: px(cardW), h: px(cardH), rectRadius: px(32),
        fill: { color: C.white, transparency: 94 }, line: { color: C.white, transparency: 86, width: 1.5 },
      });
      s.addShape("ellipse", {
        x: px(x + 40), y: px(cardY + 40), w: px(64), h: px(64),
        fill: { color: C.navy, transparency: 100 }, line: { color: C.orange, width: 3.5 },
      });
      s.addText(String(i + 1), {
        x: px(x + 40), y: px(cardY + 40), w: px(64), h: px(64),
        fontFace: FONT, fontSize: pt(30), bold: true, color: C.orange, align: "center", valign: "middle", margin: 0,
      });
      s.addText(c.title, {
        x: px(x + 40), y: px(cardY + 130), w: px(cardW - 80), h: px(110),
        fontFace: FONT, fontSize: pt(44), bold: true, color: C.white, margin: 0, valign: "top",
      });
      s.addText(c.sub, {
        x: px(x + 40), y: px(cardY + 250), w: px(cardW - 80), h: px(40),
        fontFace: FONT, fontSize: pt(28), color: C.grayNavy, margin: 0, valign: "middle",
      });
    });

    s.addShape("roundRect", {
      x: px(120), y: px(760), w: px(1680), h: px(220), rectRadius: px(32),
      fill: { color: C.teal }, line: { color: C.teal, transparency: 100 },
    });
    s.addText(
      [
        { text: "Kořenová příčina: ", options: { color: C.tealLight, bold: true } },
        { text: "úklid mezi hosty je častý, ale roztříštěný proces bez sdílené infrastruktury. Vyplatí se až při agregaci mnoha majitelů.", options: { color: C.white, bold: true } },
      ],
      { x: px(176), y: px(760), w: px(1568), h: px(220), fontFace: FONT, fontSize: pt(44), margin: 0, valign: "middle", lineSpacingMultiple: 1.15 },
    );

    s.addNotes(
      "5 Whys: 1) majitel tráví čas objednáváním, protože každou rezervaci musí ručně převést na objednávku; 2) ručně, protože kalendář a uklízečka jsou dva oddělené světy; " +
      "3) nejsou propojené, protože platformy provoz neřeší a uklízečka žádný systém nemá; 4) systém si nikdo nepořídí, protože ani jedna strana nemá objem; " +
      "5) objem nemá, protože jeden byt vyprodukuje 7–9 úklidů měsíčně a jedna uklízečka obsluhuje několik klientů. " +
      "Ishikawa: kategorie Informace, Procesy, Lidé, Měřítko, Čas, Trh. Sdílená vrstva mezi kalendářem a uklízečkou se vyplatí až při agregaci mnoha majitelů — to jednotlivec neudělá.",
    );
  }

  // ===================================================== 4 · Flow
  {
    const s = pres.addSlide();
    background(s, "light");
    kicker(s, "Řešení · bez ručních objednávek", C.teal);
    headline(s, "Od rezervace k uklizenému bytu", C.navy);

    const steps = [
      { icon: ic.calendar, title: "Nová rezervace", sub: "host rezervuje termín" },
      { icon: ic.link, title: "Kalendář (iCal)", sub: "připojen jednorázově" },
      { icon: ic.clock, title: "Úklidový slot", sub: "okno mezi odjezdem a příjezdem" },
      { icon: ic.pin, title: "Nabídka & přijetí", sub: "uklízečka v okolí, první bere" },
      { icon: ic.camera, title: "Úklid + fotoprotokol", sub: "majitel dostane jen potvrzení" },
    ];
    const gap = 56, cardW = (1680 - 4 * gap) / 5, cardY = 340, cardH = 380;
    steps.forEach((st, i) => {
      const x = 120 + i * (cardW + gap);
      s.addShape("roundRect", {
        x: px(x), y: px(cardY), w: px(cardW), h: px(cardH), rectRadius: px(28),
        fill: { color: C.white }, line: { color: C.white, transparency: 100 }, shadow: shadow(C.navy, 0.08),
      });
      s.addShape("ellipse", {
        x: px(x + 28), y: px(cardY + 30), w: px(76), h: px(76),
        fill: { color: C.teal }, line: { color: C.teal, transparency: 100 },
      });
      s.addImage({ data: st.icon, x: px(x + 28 + 19), y: px(cardY + 30 + 19), w: px(38), h: px(38) });
      s.addText(st.title, {
        x: px(x + 28), y: px(cardY + 130), w: px(cardW - 56), h: px(95),
        fontFace: FONT, fontSize: pt(36), bold: true, color: C.navy, margin: 0, valign: "top",
      });
      s.addText(st.sub, {
        x: px(x + 28), y: px(cardY + 230), w: px(cardW - 56), h: px(80),
        fontFace: FONT, fontSize: pt(26), color: C.gray, margin: 0, valign: "top",
      });
      if (i < steps.length - 1) {
        s.addText("→", {
          x: px(x + cardW), y: px(cardY + cardH / 2 - 40), w: px(gap), h: px(80),
          fontFace: FONT, fontSize: pt(40), bold: true, color: C.teal, align: "center", valign: "middle", margin: 0,
        });
      }
    });

    // exception note (peach, dashed orange)
    s.addShape("roundRect", {
      x: px(120), y: px(840), w: px(1120), h: px(150), rectRadius: px(24),
      fill: { color: C.blobPeach }, line: { color: C.orange, width: 2, dashType: "dash" },
    });
    s.addImage({ data: ic.sync, x: px(152), y: px(893), w: px(44), h: px(44) });
    s.addText(
      [
        { text: "Změna nebo zrušení rezervace → slot se přeplánuje sám.", options: { breakLine: true } },
        { text: "Výpadek uklízečky → záskok na jedno kliknutí." },
      ],
      { x: px(220), y: px(840), w: px(1000), h: px(150), fontFace: FONT, fontSize: pt(28), bold: true, color: C.orangeDark, margin: 0, valign: "middle" },
    );

    // owner effort
    s.addText("ZÁSAH MAJITELE", {
      x: px(1280), y: px(860), w: px(520), h: px(40),
      fontFace: FONT, fontSize: pt(24), bold: true, color: C.gray, charSpacing: 1.5, align: "right", valign: "middle", margin: 0,
    });
    s.addText("1× při registraci · dál žádný", {
      x: px(1200), y: px(905), w: px(600), h: px(70),
      fontFace: FONT, fontSize: pt(40), bold: true, color: C.teal, align: "right", valign: "middle", margin: 0,
    });

    s.addNotes(
      "Pohled majitele: 1) registrace a připojení kalendáře přes iCal — jednorázový úkon, cca 5 minut; 2) automatický provoz — při každé rezervaci vznikne úklidový slot v okně mezi odjezdem a příjezdem (rezerva 30 minut na obou koncích); " +
      "3) změny — při posunu nebo zrušení se slot automaticky přeplánuje; 4) kontrola — fotoprotokol z předem definovaných míst; 5) platba — souhrnná měsíční faktura. " +
      "Záskok při výpadku: u rizikových slotů (okno pod 4 h, víkend, sezóna) systém označí záložní uklízečku, která už ten den uklízí do 2 km. Role je dobrovolná a odměna náleží i bez zásahu.",
    );
  }

  // ===================================================== 5 · Algorithm
  {
    const s = pres.addSlide();
    background(s, "light");
    kicker(s, "Automatizace", C.teal);
    headline(s, "Komu se úklid nabídne? Rozhoduje vážené skóre", C.navy, { h: 200, w: 1500 });

    const weights = [
      { label: "Vzdálenost od ostatních zakázek téhož dne", pct: 40 },
      { label: "Historická spolehlivost (dokončeno včas)", pct: 30 },
      { label: "Hodnocení kvality od majitelů", pct: 20 },
      { label: "Doba od poslední zakázky (rovnoměrnost)", pct: 10 },
    ];
    // native horizontal bar chart, styled like the video's progress bars
    s.addChart(
      "bar",
      [{ name: "Váha", labels: weights.map((w) => w.label), values: weights.map((w) => w.pct) }],
      {
        x: px(120), y: px(370), w: px(1100), h: px(560),
        barDir: "bar",
        barGapWidthPct: 60,
        chartColors: [C.teal, C.teal2, C.teal3, C.teal4],
        showLegend: false,
        showTitle: false,
        showValue: true,
        dataLabelPosition: "outEnd",
        dataLabelFormatCode: '0" %"',
        dataLabelColor: C.navy,
        dataLabelFontFace: FONT,
        dataLabelFontSize: pt(30),
        dataLabelFontBold: true,
        catAxisLabelColor: C.navy,
        catAxisLabelFontFace: FONT,
        catAxisLabelFontSize: pt(27),
        catAxisLabelFontBold: true,
        catAxisOrientation: "maxMin",
        catAxisLineShow: false,
        catGridLine: { style: "none" },
        valAxisHidden: true,
        valAxisMaxVal: 48,
        valAxisMinVal: 0,
        valGridLine: { style: "none" },
        plotArea: { fill: { color: C.ground, transparency: 100 } },
        chartArea: { fill: { color: C.ground, transparency: 100 } },
      },
    );

    // routing card
    const rx = 1280, ry = 380, rw = 520, rh = 480;
    s.addShape("roundRect", {
      x: px(rx), y: px(ry), w: px(rw), h: px(rh), rectRadius: px(32),
      fill: { color: C.navy }, line: { color: C.navy, transparency: 100 },
    });
    s.addText("TRASOVÁNÍ", {
      x: px(rx + 44), y: px(ry + 40), w: px(rw - 88), h: px(36),
      fontFace: FONT, fontSize: pt(26), bold: true, color: C.tealLight, charSpacing: 1.5, margin: 0, valign: "middle",
    });
    s.addText("Čtyři byty vedle sebe místo čtyř rozesetých po Praze", {
      x: px(rx + 44), y: px(ry + 86), w: px(rw - 88), h: px(150),
      fontFace: FONT, fontSize: pt(40), bold: true, color: C.white, margin: 0, valign: "top",
    });
    for (let i = 0; i < 4; i++) {
      const hx = rx + 44 + i * 114, hy = ry + 260;
      s.addShape("roundRect", {
        x: px(hx), y: px(hy), w: px(100), h: px(100), rectRadius: px(20),
        fill: { color: C.teal }, line: { color: C.teal, transparency: 100 },
      });
      s.addImage({ data: ic.home, x: px(hx + 26), y: px(hy + 26), w: px(48), h: px(48) });
    }
    s.addText("Uklízečka: 2 600 Kč denně místo 1 950 Kč. Majitel: nižší cena.", {
      x: px(rx + 44), y: px(ry + 386), w: px(rw - 88), h: px(140),
      fontFace: FONT, fontSize: pt(28), color: C.grayNavy, margin: 0, valign: "top",
    });

    s.addNotes(
      "Platforma provozuje čtyři automatizované funkce: a) generování slotu, b) skóre přiřazení (vzdálenost 40 %, spolehlivost 30 %, kvalita 20 %, rovnoměrnost 10 %), " +
      "c) dynamickou tvorbu ceny (příplatky za krátké okno, víkend, sezónu, expresní obsazení — sazbu si ale uklízečka stanovuje sama v pásmu), d) hodnocení kvality z fotoprotokolu. " +
      "Trasování je ekonomickým jádrem: uklízečka dnes zvládne 2–3 byty denně kvůli přejezdům; se 4 byty v okolí vydělá 2 600 Kč hrubého za den místo 1 950 Kč. " +
      "Každé automatizované rozhodnutí je vysvětlitelné a přezkoumatelné člověkem.",
    );
  }

  // ===================================================== 6 · Market
  {
    const s = pres.addSlide();
    background(s, "light");
    kicker(s, "Velikost trhu · Praha", C.teal);
    headline(s, "Malí hostitelé, které nikdo neobsluhuje", C.navy);

    const stats = [
      { label: "TAM", value: "7 878", unit: "aktivních bytů na Airbnb", note: "≈ 1,1 % bytového fondu (IPR, 6/2026)", dark: false, valueColor: C.navy },
      { label: "SAM · NÁŠ TRH", value: "3 900", unit: "bytů majitelů 1–5 jednotek", note: "≈ 1 400 hostitelů bez profesionální správy", dark: true, valueColor: C.white },
      { label: "POPTÁVKA 2025", value: "8,27", unit: "milionu hostů v Praze", note: "nejvíce v historii (ČSÚ)", dark: false, valueColor: C.orange },
    ];
    const cardW = (1680 - 64) / 3, cardY = 330, cardH = 420;
    stats.forEach((st, i) => {
      const x = 120 + i * (cardW + 32);
      s.addShape("roundRect", {
        x: px(x), y: px(cardY), w: px(cardW), h: px(cardH), rectRadius: px(32),
        fill: { color: st.dark ? C.teal : C.white }, line: { color: st.dark ? C.teal : C.white, transparency: 100 },
        shadow: st.dark ? shadow(C.teal, 0.3) : shadow(),
      });
      s.addText(st.label, {
        x: px(x + 44), y: px(cardY + 40), w: px(cardW - 88), h: px(36),
        fontFace: FONT, fontSize: pt(26), bold: true, color: st.dark ? C.tealPale : C.gray, charSpacing: 1.5, margin: 0, valign: "middle",
      });
      s.addText(st.value, {
        x: px(x + 44), y: px(cardY + 84), w: px(cardW - 88), h: px(140),
        fontFace: FONT, fontSize: pt(112), bold: true, color: st.valueColor, charSpacing: -2, margin: 0, valign: "middle",
      });
      s.addText(st.unit, {
        x: px(x + 44), y: px(cardY + 236), w: px(cardW - 88), h: px(50),
        fontFace: FONT, fontSize: pt(32), bold: true, color: st.dark ? C.white : C.navy, margin: 0, valign: "middle",
      });
      s.addText(st.note, {
        x: px(x + 44), y: px(cardY + 296), w: px(cardW - 88), h: px(80),
        fontFace: FONT, fontSize: pt(26), color: st.dark ? C.tealPale : C.gray, margin: 0, valign: "top",
      });
    });

    s.addText(
      [
        { text: "Full-service správci berou 15–20 % výnosu a kontrolu nad bytem. Úklidové firmy neznají kalendář. ", options: { color: C.gray } },
        { text: "Mezi tím chybí samoobslužná vrstva — to je SimplyClean.", options: { color: C.teal } },
      ],
      { x: px(120), y: px(830), w: px(1680), h: px(150), fontFace: FONT, fontSize: pt(34), bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.15 },
    );

    s.addNotes(
      "TAM: v červnu 2026 bylo v Praze evidováno 7 878 aktivních celých bytů nebo domů na Airbnb, tj. ≈ 1,1 % bytového fondu (IPR Praha). " +
      "SAM: na jednoho hostitele připadá 2,8 jednotky, téměř 80 % nabídky provozují multihostitelé; zhruba polovinu spravují firmy s 10+ jednotkami. Majitelé 1–5 bytů bez profesionální správy = cca 3 900 bytů a 1 400 hostitelů. " +
      "Poptávka: v roce 2025 se v Praze ubytovalo 8,27 milionu hostů, nejvíce v historii (ČSÚ). " +
      "Konkurence: full-service správci (Hostly, BnB Plus, Seven Keys), úklidové firmy (Ukliď mi, Úklid SOS) bez napojení na kalendář, zahraniční nástroje (Turno) bez české sítě uklízeček.",
    );
  }

  // ===================================================== 7 · Economics
  {
    const s = pres.addSlide();
    background(s, "light");
    kicker(s, "Byznys model", C.teal);
    headline(s, "Provize 18 %. Žádné předplatné.", C.navy);

    s.addText("Jeden úklid · 800 Kč (2,5 h × 300 Kč + materiál)", {
      x: px(120), y: px(324), w: px(1680), h: px(40),
      fontFace: FONT, fontSize: pt(30), bold: true, color: C.gray, margin: 0, valign: "middle",
    });

    // split bar (rounded ends, square seam between the two parts)
    const sbY = 380, sbH = 110, sbW = 1680, tealW = Math.round(sbW * 0.82), r = 30;
    s.addShape("roundRect", {
      x: px(120), y: px(sbY), w: px(tealW + r), h: px(sbH), rectRadius: px(r),
      fill: { color: C.teal }, line: { color: C.teal, transparency: 100 },
    });
    s.addShape("roundRect", {
      x: px(120 + tealW), y: px(sbY), w: px(sbW - tealW), h: px(sbH), rectRadius: px(r),
      fill: { color: C.orange }, line: { color: C.orange, transparency: 100 },
    });
    s.addShape("rect", {
      x: px(120 + tealW), y: px(sbY), w: px(r), h: px(sbH),
      fill: { color: C.orange }, line: { color: C.orange, transparency: 100 },
    });
    s.addText("Uklízečka · 82 %", {
      x: px(164), y: px(sbY), w: px(700), h: px(sbH),
      fontFace: FONT, fontSize: pt(40), bold: true, color: C.white, margin: 0, valign: "middle",
    });
    s.addText("656 Kč", {
      x: px(120 + tealW - 744), y: px(sbY), w: px(700), h: px(sbH),
      fontFace: FONT, fontSize: pt(40), bold: true, color: C.white, align: "right", margin: 0, valign: "middle",
    });
    s.addText("18 % · 144 Kč", {
      x: px(120 + tealW), y: px(sbY), w: px(sbW - tealW), h: px(sbH),
      fontFace: FONT, fontSize: pt(32), bold: true, color: C.white, align: "center", margin: 0, valign: "middle",
    });

    // margin chain
    const chainY = 570, chainH = 190, opW = 90, cardW = (1680 - 2 * opW - 4 * 24) / 3;
    const chain = [
      { label: "Marže na úklid (po platební bráně)", value: "180 Kč", bg: C.white, fg: C.navy, lab: C.gray, sh: shadow() },
      { label: "Marže na byt měsíčně (8 úklidů)", value: "1 440 Kč", bg: C.teal, fg: C.white, lab: C.tealPale, sh: shadow(C.teal, 0.3) },
      { label: "Návratnost akvizice (800–1 500 Kč)", value: "< 1 měsíc", bg: C.navy, fg: C.white, lab: C.grayNavy, sh: null },
    ];
    const ops = ["× 8", "→"];
    chain.forEach((c, i) => {
      const x = 120 + i * (cardW + 2 * 24 + opW);
      const o = { x: px(x), y: px(chainY), w: px(cardW), h: px(chainH), rectRadius: px(28), fill: { color: c.bg }, line: { color: c.bg, transparency: 100 } };
      if (c.sh) o.shadow = c.sh;
      s.addShape("roundRect", o);
      s.addText(c.label, {
        x: px(x + 32), y: px(chainY + 26), w: px(cardW - 64), h: px(36),
        fontFace: FONT, fontSize: pt(24), bold: true, color: c.lab, margin: 0, valign: "middle",
      });
      s.addText(c.value, {
        x: px(x + 32), y: px(chainY + 68), w: px(cardW - 64), h: px(100),
        fontFace: FONT, fontSize: pt(72), bold: true, color: c.fg, charSpacing: -1, margin: 0, valign: "middle",
      });
      if (i < 2) {
        s.addText(ops[i], {
          x: px(x + cardW + 24), y: px(chainY), w: px(opW), h: px(chainH),
          fontFace: FONT, fontSize: pt(60), bold: true, color: C.teal, align: "center", valign: "middle", margin: 0,
        });
      }
    });

    // breakeven row
    const be = [
      ["Fixní náklady: ", "260 tis. Kč / měsíc"],
      ["Bod zvratu: ", "180–220 bytů (≈ 5 % SAM)"],
      ["Strop SAM: ", "56–67 mil. Kč ročně"],
    ];
    be.forEach(([k, v], i) => {
      s.addText(
        [
          { text: k, options: { color: C.navy, bold: true } },
          { text: v, options: { color: C.gray, bold: true } },
        ],
        { x: px(120 + i * 560), y: px(840), w: px(560), h: px(120), fontFace: FONT, fontSize: pt(30), align: i === 0 ? "left" : i === 1 ? "center" : "right", margin: 0, valign: "middle" },
      );
    });

    s.addNotes(
      "Zdroje příjmů: provize 18 % z ceny úklidu (hlavní), volitelný příplatek za garanci záskoku 49 Kč, výhledově B2B licence pro menší správcovské firmy. Žádný vstupní poplatek ani předplatné — bariéra vstupu je nulová. " +
      "Jednotková ekonomika: cena úklidu 800 Kč, výplata uklízečce 656 Kč (82 %), provize 144 Kč + garance 49 Kč = 193 Kč hrubého, minus platební brána 1,5 % = 180 Kč marže na úklid; × 8 úklidů = 1 440 Kč na byt měsíčně. " +
      "Akvizice majitele 800–1 500 Kč → návratnost do jednoho měsíce (u marketplaců obvykle 6+ měsíců). Konzervativní scénář se 40% využitím garance: 1 205 Kč. " +
      "Fixní náklady 260 tis. Kč/měsíc (vývoj 88, provoz 70, marketing 55, právní 22, finance 10, rezerva 15). Bod zvratu 180–220 bytů ≈ 5 % SAM. Strop SAM 56–67 mil. Kč ročně.",
    );
  }

  // ===================================================== 8 · Legal
  {
    const s = pres.addSlide();
    background(s, "navy");
    kicker(s, "Etika a legislativa · zákon o platformové práci (účinnost 12/2026)", C.tealLight);
    headline(s, "Uklízečky zůstávají nezávislé", C.white);

    const rows = [
      { risk: "Platforma určuje odměnu", ours: "Sazbu si uklízečka stanovuje sama v doporučeném pásmu" },
      { risk: "Sankce za odmítnutí zakázky", ours: "Odmítnutí nemá žádný dopad na skóre ani přístup" },
      { risk: "Exkluzivita a povinná dostupnost", ours: "Žádná — čas, oblast i další klienty volí sama" },
      { risk: "Rozhoduje algoritmus", ours: "Vysvětlitelné skóre, lidský přezkum, jmenovitá kontaktní osoba" },
    ];
    const leftW = 640, gapW = 32, rightW = 1680 - 72 - leftW - gapW;
    s.addText("RIZIKOVÁ PRAXE", {
      x: px(156), y: px(290), w: px(leftW), h: px(36),
      fontFace: FONT, fontSize: pt(26), bold: true, color: C.grayNavy, charSpacing: 1.5, margin: 0, valign: "middle",
    });
    s.addText("NAŠE ŘEŠENÍ", {
      x: px(156 + leftW + gapW), y: px(290), w: px(rightW), h: px(36),
      fontFace: FONT, fontSize: pt(26), bold: true, color: C.grayNavy, charSpacing: 1.5, margin: 0, valign: "middle",
    });
    const rowH = 100, rowGap = 16;
    rows.forEach((r, i) => {
      const y = 340 + i * (rowH + rowGap);
      s.addShape("roundRect", {
        x: px(120), y: px(y), w: px(1680), h: px(rowH), rectRadius: px(22),
        fill: { color: C.white, transparency: 94 }, line: { color: C.white, transparency: 88, width: 1.5 },
      });
      s.addImage({ data: ic.times, x: px(156), y: px(y + rowH / 2 - 15), w: px(30), h: px(30) });
      s.addText(r.risk, {
        x: px(206), y: px(y), w: px(leftW - 50), h: px(rowH),
        fontFace: FONT, fontSize: pt(30), bold: true, color: C.peach, margin: 0, valign: "middle",
      });
      const ox = 156 + leftW + gapW;
      s.addImage({ data: ic.check, x: px(ox), y: px(y + rowH / 2 - 15), w: px(30), h: px(30) });
      s.addText(r.ours, {
        x: px(ox + 50), y: px(y), w: px(rightW - 50), h: px(rowH),
        fontFace: FONT, fontSize: pt(30), bold: true, color: C.white, margin: 0, valign: "middle",
      });
    });

    const chips = ["Transparentní cena", "Výplata každý týden", "Žádné soutěžení cenou dolů", "CZ · UA · EN rozhraní"];
    const chipW = (1680 - 3 * 20) / 4;
    chips.forEach((t, i) => {
      const x = 120 + i * (chipW + 20);
      s.addShape("roundRect", {
        x: px(x), y: px(850), w: px(chipW), h: px(120), rectRadius: px(18),
        fill: { color: C.teal }, line: { color: C.teal, transparency: 100 },
      });
      s.addText(t, {
        x: px(x + 16), y: px(850), w: px(chipW - 32), h: px(120),
        fontFace: FONT, fontSize: pt(27), bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
      });
    });

    s.addNotes(
      "Směrnice (EU) 2024/2831 o platformové práci — transpozice do 2. 12. 2026. MPSV předložilo v březnu 2026 návrh zákona o platformové práci, účinnost plánována na 1. 12. 2026. " +
      "Naše služba organizuje práci uklízeček, a proto pod zákon spadá v plném rozsahu (na rozdíl od Airbnb, které zprostředkovává ubytování). " +
      "Jádrem návrhu je vyvratitelná domněnka pracovněprávního vztahu: pokud platforma pracovníka řídí a kontroluje (určuje odměnu, sankcionuje odmítnutí, vyžaduje exkluzivitu), má se za to, že jde o zaměstnání. " +
      "Služba je navržena tak, aby domněnku ustála: vlastní sazba, žádné sankce, žádná exkluzivita, dobrovolný záskok, lidský přezkum algoritmických rozhodnutí. " +
      "Etické zásady nad rámec zákona: transparentní cena, týdenní výplata bez ohledu na platební morálku majitele, žádné veřejné srovnávání sazeb, rozhraní v češtině, ukrajinštině a angličtině.",
    );
  }

  // ===================================================== 9 · Goal
  {
    const s = pres.addSlide();
    background(s, "light");
    kicker(s, "SMART cíl · 6 měsíců od spuštění v Praze", C.teal);
    headline(s, "Co budeme měřit", C.navy);

    const goals = [
      { value: "150", unit: "aktivních bytů", color: C.navy },
      { value: "95 %", unit: "úklidů objednaných bez zásahu majitele", color: C.navy },
      { value: "< 1 min", unit: "času majitele na jeden úklid", color: C.orange, size: 100 },
    ];
    const cardW = (1680 - 64) / 3, cardY = 340, cardH = 400;
    goals.forEach((g, i) => {
      const x = 120 + i * (cardW + 32);
      s.addShape("roundRect", {
        x: px(x), y: px(cardY), w: px(cardW), h: px(cardH), rectRadius: px(32),
        fill: { color: C.white }, line: { color: C.white, transparency: 100 }, shadow: shadow(),
      });
      s.addText(g.value, {
        x: px(x + 48), y: px(cardY + 48), w: px(cardW - 96), h: px(160),
        fontFace: FONT, fontSize: pt(g.size || 140), bold: true, color: g.color, charSpacing: -3, margin: 0, valign: "middle",
      });
      s.addText(g.unit, {
        x: px(x + 48), y: px(cardY + 228), w: px(cardW - 96), h: px(120),
        fontFace: FONT, fontSize: pt(40), bold: true, color: C.navy, margin: 0, valign: "top",
      });
    });

    s.addText(
      [
        { text: "Hlavní riziko: ", options: { color: C.navy, bold: true } },
        { text: "málo uklízeček na startu → spouštíme v jedné části města s hustou nabídkou bytů. ", options: { color: C.gray, bold: true } },
        { text: "Záloha: ", options: { color: C.navy, bold: true } },
        { text: "iCal jako nezávislý kanál, ruční fallback.", options: { color: C.gray, bold: true } },
      ],
      { x: px(120), y: px(830), w: px(1680), h: px(150), fontFace: FONT, fontSize: pt(32), margin: 0, valign: "middle", lineSpacingMultiple: 1.2 },
    );

    s.addNotes(
      "SMART cíl: do šesti měsíců od spuštění v Praze dosáhnout 150 aktivních bytů, 95 % úklidů objednaných bez zásahu majitele a průměrně méně než jedné minuty jeho času na jeden úklid. " +
      "Matice rizik: málo uklízeček na startu (vysoká/vysoký) → spustit v jedné části města; změna API/iCal (nízká/vysoký) → dva nezávislé kanály, ruční fallback; " +
      "regulace krátkodobých pronájmů (střední/vysoký) → služba funguje pro jakýkoli opakovaný úklid; překlasifikace uklízeček (střední/vysoký) → vlastní cenotvorba, dobrovolnost, žádné sankce; " +
      "majitel po nalezení uklízečky odejde (vysoká/střední) → hodnota je v automatice a záskoku; vstup Turna na český trh (nízká/střední) → lokální síť jako bariéra vstupu.",
    );
  }

  // ===================================================== 10 · Outro
  {
    const s = pres.addSlide();
    background(s, "navy");

    s.addText(
      [
        { text: "„Nula zpráv měsíčně.", options: { color: C.white, breakLine: true } },
        { text: "Kalendář připojíte jednou.“", options: { color: C.tealLight } },
      ],
      { x: px(210), y: px(300), w: px(1500), h: px(300), fontFace: FONT, fontSize: pt(96), bold: true, charSpacing: -2, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.1 },
    );

    // logo row (72px mark + 22 gap + wordmark ≈ 400)
    const rowW = 72 + 22 + 400, rx = (1920 - rowW) / 2;
    logoMark(s, px(rx), px(660), px(72));
    s.addText("SimplyClean", {
      x: px(rx + 94), y: px(646), w: px(420), h: px(100),
      fontFace: FONT, fontSize: pt(64), bold: true, color: C.white, charSpacing: -1, margin: 0, valign: "middle",
    });

    s.addText(
      [
        { text: "Michael Černý · Jakub Lisý · Anna Štefanková · Oliver Slivka · Martin Růžek", options: { color: C.white, bold: true, breakLine: true } },
        { text: "Tým č. 3 „Mladé svaly“ · Skupina S4 · Mentor prof. Josef Hynek · VŠE", options: { color: C.grayNavy } },
      ],
      { x: px(120), y: px(880), w: px(1680), h: px(110), fontFace: FONT, fontSize: pt(30), align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.4 },
    );

    s.addNotes(
      "Klíčové sdělení pro majitele: „Nula zpráv měsíčně. Kalendář připojíte jednou.“ Pro uklízečku: „Čtyři byty vedle sebe místo přes celou Prahu. Sazbu si určujete sami.“ " +
      "Deklarace GenAI: rešerše a ověřování zdrojů s pomocí AI, všechny údaje ověřeny proti primárním zdrojům; analytické metodiky (5 Whys, Ishikawa, FrED, SWOT, stakeholder matice) zpracoval tým.",
    );
  }

  const out = "SimplyClean.pptx";
  await pres.writeFile({ fileName: out });
  console.log("wrote", out);
})();
