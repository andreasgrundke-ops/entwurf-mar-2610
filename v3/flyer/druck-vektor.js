/* ==========================================================================
   Marion · Entwurf v3 · Druckflächen als Vektor
   v3.0.1 · 19.10.2026
   --------------------------------------------------------------------------
   Genutzt von flyer/index.html und visitenkarte/index.html.

   Warum: Chrome rastert beim PDF-Export drei Dinge zu Pixelbildern:
     1. CSS-Hintergründe mit Kachelgrafik (Gewebe, Karoband, Punkte),
     2. SVG-<pattern>-Füllungen (Teller, Tassen, Tisch),
     3. SVG-Filter (Schatten im Tisch-Bild).
   Dieses Skript ersetzt 1. und 2. durch echte Vektorgeometrie:
     - Muster in SVG-Grafiken werden zu Streifen, Linien und Punkten
       aufgelöst und auf die Form beschnitten (keine Kacheln, keine Nähte).
     - Tuchflächen bekommen im Druck eine durchgehende Grundfläche je Bogen
       (eine Fläche über mehrere Panele gleicher Farbe, darum keine Naht
       am Falz), Gewebe als feine Vektorlinien.
     - Karoband und Polaroid-Punkte werden als SVG gezeichnet.
   Am Bildschirm bleibt alles wie gestaltet; die Druckflächen sind nur in
   @media print sichtbar (siehe .druck-* in flyer.css / visitenkarte.css).
   Wenn alles fertig ist, steht <html data-druck-vektor="bereit">.
   ========================================================================== */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var BASIS = (document.currentScript && document.currentScript.src) || location.href;
  var SVG_ORDNER = new URL("../assets/svg/", BASIS).href;

  function el(name, attrs, eltern) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (eltern) eltern.appendChild(e);
    return e;
  }
  function zahl(v, std) { var n = parseFloat(v); return isNaN(n) ? std : n; }
  function r3(n) { return Math.round(n * 1000) / 1000; }

  /* ---------- 1. Muster in SVG auflösen -------------------------------- */
  var zaehler = 0;

  /* Winkel aus patternTransform="rotate(a)"; andere Transformationen gibt es in den Dateien nicht */
  function drehung(pt) {
    var m = /rotate\(\s*(-?[\d.]+)/.exec(pt || "");
    return m ? parseFloat(m[1]) : 0;
  }

  /* Bereich der Form im Musterraum (gedreht), mit Rand */
  function musterBereich(bb, winkel) {
    var a = -winkel * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]];
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(function (p) {
      var x = p[0] * c - p[1] * s, y = p[0] * s + p[1] * c;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    });
    return { x0: x0 - 2, y0: y0 - 2, x1: x1 + 2, y1: y1 + 2 };
  }

  /* Zeichnet den Inhalt eines <pattern> als durchgehende Geometrie in g */
  function musterZeichnen(pat, g, ber, defs, svg) {
    var w = zahl(pat.getAttribute("width"), 10), h = zahl(pat.getAttribute("height"), 10);
    var i0 = Math.floor(ber.x0 / w), i1 = Math.ceil(ber.x1 / w);
    var j0 = Math.floor(ber.y0 / h), j1 = Math.ceil(ber.y1 / h);
    var X0 = i0 * w, X1 = i1 * w, Y0 = j0 * h, Y1 = j1 * h;
    var motive = [];
    Array.prototype.forEach.call(pat.children, function (k) {
      var tag = k.localName, d;
      if (tag === "rect") {
        var x = zahl(k.getAttribute("x"), 0), y = zahl(k.getAttribute("y"), 0);
        var rw = zahl(k.getAttribute("width"), 0), rh = zahl(k.getAttribute("height"), 0);
        var fill = k.getAttribute("fill"), op = k.getAttribute("opacity");
        if (rw >= w && rh >= h) { /* Grundfarbe: eine Fläche */
          el("rect", { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: fill, opacity: op }, g);
        } else if (rh >= h) { /* senkrechter Streifen, durchgehend */
          for (var i = i0; i < i1; i++) el("rect", { x: r3(i * w + x), y: Y0, width: rw, height: Y1 - Y0, fill: fill, opacity: op }, g);
        } else if (rw >= w) { /* waagrechter Streifen, durchgehend */
          for (var j = j0; j < j1; j++) el("rect", { x: X0, y: r3(j * h + y), width: X1 - X0, height: rh, fill: fill, opacity: op }, g);
        } else motive.push(k);
        return;
      }
      if (tag === "path" && (d = /^M0 ([\d.]+) H([\d.]+) M([\d.]+) 0 V([\d.]+)$/.exec((k.getAttribute("d") || "").trim()))) {
        /* Kachelraster als lange Linien */
        var at = { stroke: k.getAttribute("stroke"), "stroke-width": k.getAttribute("stroke-width"), opacity: k.getAttribute("opacity"), fill: "none" };
        var pfad = "";
        for (var jj = j0; jj < j1; jj++) pfad += "M" + X0 + " " + r3(jj * h + +d[1]) + "H" + X1;
        for (var ii = i0; ii < i1; ii++) pfad += "M" + r3(ii * w + +d[3]) + " " + Y0 + "V" + Y1;
        at.d = pfad; el("path", at, g);
        return;
      }
      motive.push(k);
    });
    if (motive.length) { /* Einzelmotive (Punkte) je Kachel */
      var id = "dv-motiv-" + (++zaehler);
      var mg = el("g", { id: id }, defs);
      motive.forEach(function (m) { mg.appendChild(m.cloneNode(true)); });
      for (var a = i0; a < i1; a++) for (var b = j0; b < j1; b++) {
        var u = el("use", { x: r3(a * w), y: r3(b * h) }, g);
        u.setAttribute("href", "#" + id);
      }
    }
  }

  /* Ersetzt alle fill="url(#…)" mit <pattern> in einem SVG (muss im DOM hängen) */
  function musterAufloesen(svg) {
    var defs = svg.querySelector("defs") || el("defs", {}, null);
    if (!defs.parentNode) svg.insertBefore(defs, svg.firstChild);
    var formen = svg.querySelectorAll('[fill^="url(#"]');
    Array.prototype.forEach.call(formen, function (f) {
      var id = /url\(#([^)]+)\)/.exec(f.getAttribute("fill"))[1];
      var pat = svg.querySelector('pattern[id="' + id + '"]');
      if (!pat) return;
      var bb = f.getBBox();
      var winkel = drehung(pat.getAttribute("patternTransform"));
      var ber = musterBereich(bb, winkel);
      var cid = "dv-form-" + (++zaehler);
      var cp = el("clipPath", { id: cid }, defs);
      var form = f.cloneNode(false);
      ["fill", "stroke", "stroke-width", "clip-path", "transform", "opacity", "filter", "class", "style"].forEach(function (a) { form.removeAttribute(a); });
      if (f.getAttribute("fill-rule")) form.setAttribute("clip-rule", f.getAttribute("fill-rule"));
      cp.appendChild(form);
      var aussen = el("g", { transform: f.getAttribute("transform"), "clip-path": f.getAttribute("clip-path"), opacity: f.getAttribute("opacity") });
      var innen = el("g", { "clip-path": "url(#" + cid + ")" }, aussen);
      var gedreht = el("g", { transform: winkel ? "rotate(" + winkel + ")" : null }, innen);
      musterZeichnen(pat, gedreht, ber, defs, svg);
      f.parentNode.insertBefore(aussen, f);
      if (f.getAttribute("stroke") && f.getAttribute("stroke") !== "none") f.setAttribute("fill", "none");
      else f.parentNode.removeChild(f);
    });
    Array.prototype.forEach.call(svg.querySelectorAll("pattern"), function (p) { p.parentNode.removeChild(p); });
  }

  /* <img src="….svg"> mit Mustern: Datei laden, auflösen, als Blob zurücksetzen */
  var bildCache = {};
  function bildVektorisieren(img) {
    var url = img.src;
    if (!bildCache[url]) {
      bildCache[url] = fetch(url).then(function (r) { return r.text(); }).then(function (txt) {
        if (txt.indexOf("<pattern") < 0) return null;
        var doc = new DOMParser().parseFromString(txt, "image/svg+xml");
        var svg = document.importNode(doc.documentElement, true);
        var halter = document.createElement("div");
        halter.style.cssText = "position:absolute;left:-10000px;top:0;width:300px;height:300px;overflow:hidden";
        halter.appendChild(svg); document.body.appendChild(halter);
        musterAufloesen(svg);
        var aus = new XMLSerializer().serializeToString(svg);
        document.body.removeChild(halter);
        return URL.createObjectURL(new Blob([aus], { type: "image/svg+xml" }));
      });
    }
    return bildCache[url].then(function (blob) {
      if (!blob) return;
      img.setAttribute("data-original", url);
      img.src = blob;
      return img.decode ? img.decode().catch(function () {}) : null;
    });
  }

  /* ---------- 2. Gewebe und Grundflächen ------------------------------- */
  var gewebeCache = {};
  function gewebeLinien(name) {
    if (!gewebeCache[name]) {
      gewebeCache[name] = fetch(SVG_ORDNER + name + ".svg").then(function (r) { return r.text(); }).then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, "image/svg+xml");
        var linien = [];
        Array.prototype.forEach.call(doc.querySelectorAll("rect[fill]"), function (r) {
          var w = zahl(r.getAttribute("width"), 0), h = zahl(r.getAttribute("height"), 0);
          linien.push({ x: zahl(r.getAttribute("x"), 0), y: zahl(r.getAttribute("y"), 0), w: w, h: h,
            quer: w >= 160, fill: r.getAttribute("fill"), op: r.getAttribute("opacity") });
        });
        return linien;
      });
    }
    return gewebeCache[name];
  }

  /* Zeichnet eine Tuchfläche (x,y,w,h in mm) mit Gewebelinien, Kachel kachelMm */
  function tuchZeichnen(g, f, linien, kachelMm, cid, defs) {
    el("rect", { x: r3(f.x), y: r3(f.y), width: r3(f.w), height: r3(f.h), fill: f.farbe }, g);
    var cp = el("clipPath", { id: cid }, defs);
    el("rect", { x: r3(f.x), y: r3(f.y), width: r3(f.w), height: r3(f.h) }, cp);
    var lg = el("g", { "clip-path": "url(#" + cid + ")" }, g);
    var s = kachelMm / 160, pfade = {};
    var ty0 = Math.floor(f.y / kachelMm), ty1 = Math.ceil((f.y + f.h) / kachelMm);
    var tx0 = Math.floor(f.x / kachelMm), tx1 = Math.ceil((f.x + f.w) / kachelMm);
    linien.forEach(function (l) {
      /* gleiche Farbe und Deckkraft in einem Pfad sammeln */
      var key = l.fill + "|" + l.op, d = "";
      if (l.quer) for (var j = ty0; j < ty1; j++) {
        var y = j * kachelMm + l.y * s;
        d += "M" + r3(f.x) + " " + r3(y) + "h" + r3(f.w) + "v" + r3(l.h * s) + "h" + r3(-f.w) + "z";
      } else for (var i = tx0; i < tx1; i++) {
        var x = i * kachelMm + l.x * s;
        d += "M" + r3(x) + " " + r3(f.y) + "v" + r3(f.h) + "h" + r3(l.w * s) + "v" + r3(-f.h) + "z";
      }
      (pfade[key] = pfade[key] || { fill: l.fill, op: l.op, d: [] }).d.push(d);
    });
    Object.keys(pfade).forEach(function (k) {
      var p = pfade[k];
      el("path", { d: p.d.join(""), fill: p.fill, opacity: p.op }, lg);
    });
  }

  function istHell(e) { return /\btuch-(senf|rose|leinen)\b/.test(e.className); }

  /* Druck-Grundfläche für einen Bogen bzw. eine Karte.
     traeger: Element, über dessen Fläche gezeichnet wird; breiteMm/hoeheMm seine Maße.
     flaechen: Elemente mit Tuch; kachelMm: Gewebekachel. */
  function grundflaeche(traeger, breiteMm, hoeheMm, flaechen, kachelMm) {
    var tr = traeger.getBoundingClientRect(), mm = breiteMm / tr.width;
    var liste = flaechen.map(function (e) {
      var r = e.getBoundingClientRect();
      return { x: (r.left - tr.left) * mm, y: (r.top - tr.top) * mm, w: r.width * mm, h: r.height * mm,
        farbe: getComputedStyle(e).backgroundColor, hell: istHell(e) };
    });
    /* nebeneinander liegende Flächen gleicher Farbe zu einer zusammenfassen (keine Naht am Falz) */
    liste.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    var zusammen = [];
    liste.forEach(function (f) {
      var vorher = zusammen.filter(function (z) {
        return z.farbe === f.farbe && z.hell === f.hell && Math.abs(z.y - f.y) < 0.05 && Math.abs(z.h - f.h) < 0.05 && Math.abs(z.x + z.w - f.x) < 0.05;
      })[0];
      if (vorher) vorher.w = f.x + f.w - vorher.x; else zusammen.push(f);
    });
    /* winzige Spalten zwischen Flächen schließen: jede Fläche 0,05 mm größer */
    zusammen.forEach(function (f) { f.w += 0.05; f.h += 0.05; });
    return Promise.all([gewebeLinien("gewebe"), gewebeLinien("gewebe-hell")]).then(function (gw) {
      var svg = el("svg", { class: "druck-grund", viewBox: "0 0 " + breiteMm + " " + hoeheMm, preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false" });
      var defs = el("defs", {}, svg);
      zusammen.forEach(function (f, n) { tuchZeichnen(el("g", {}, svg), f, f.hell ? gw[1] : gw[0], kachelMm, "dv-tuch-" + (++zaehler), defs); });
      traeger.insertBefore(svg, traeger.firstChild);
    });
  }

  /* Karoband (borte.svg) als Vektor; Farben vorgemischt, ohne Transparenz */
  function karoband(e, kachelMm) {
    var r = e.getBoundingClientRect();
    var hoehe = parseFloat(getComputedStyle(e).height); /* CSS-Pixel ohne Zoom */
    var hMm = hoehe * 25.4 / 96, wMm = hMm * r.width / r.height;
    var svg = el("svg", { class: "druck-karo", viewBox: "0 0 " + r3(wMm) + " " + r3(hMm), preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false" });
    var k = kachelMm, halb = k / 2, d1 = "", d2 = "";
    el("rect", { width: r3(wMm), height: r3(hMm), fill: "#FFF6F7" }, svg);
    /* einfache Überdeckung (50 % Himbeer) als durchgehende Streifen, Kreuzungen doppelt */
    for (var x = 0; x < wMm; x += k) d1 += "M" + r3(x) + " 0h" + r3(halb) + "v" + r3(hMm) + "h" + r3(-halb) + "z";
    for (var y = 0; y < hMm; y += k) d1 += "M0 " + r3(y) + "h" + r3(wMm) + "v" + r3(Math.min(halb, hMm - y)) + "h" + r3(-wMm) + "z";
    el("path", { d: d1, fill: "#DC8EA3" }, svg);
    for (var xx = 0; xx < wMm; xx += k) for (var yy = 0; yy < hMm; yy += k)
      d2 += "M" + r3(xx) + " " + r3(yy) + "h" + r3(halb) + "v" + r3(Math.min(halb, hMm - yy)) + "h" + r3(-halb) + "z";
    el("path", { d: d2, fill: "#CA5978" }, svg);
    e.appendChild(svg);
  }

  /* Polaroid-Fläche: Punkteraster (radial-gradient) als Vektor */
  function punkteflaeche(e, abstandMm, radiusMm, grund, punkt) {
    var r = e.getBoundingClientRect();
    var wPx = parseFloat(getComputedStyle(e).width), hPx = parseFloat(getComputedStyle(e).height);
    var wMm = wPx * 25.4 / 96, hMm = hPx * 25.4 / 96;
    var svg = el("svg", { class: "druck-punkte", viewBox: "0 0 " + r3(wMm) + " " + r3(hMm), preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false" });
    el("rect", { width: r3(wMm), height: r3(hMm), fill: grund }, svg);
    var d = "", rr = radiusMm;
    for (var x = abstandMm / 2; x < wMm + rr; x += abstandMm) for (var y = abstandMm / 2; y < hMm + rr; y += abstandMm)
      d += "M" + r3(x - rr) + " " + r3(y) + "a" + rr + " " + rr + " 0 1 0 " + r3(2 * rr) + " 0a" + rr + " " + rr + " 0 1 0 " + r3(-2 * rr) + " 0z";
    el("path", { d: d, fill: punkt }, svg);
    e.insertBefore(svg, e.firstChild);
  }

  /* ---------- Ablauf ---------------------------------------------------- */
  function start() {
    var arbeit = [];
    /* Muster in eingebetteten SVGs (Tisch-Bild im Flyer) */
    Array.prototype.forEach.call(document.querySelectorAll("svg"), function (s) {
      if (s.querySelector("pattern")) musterAufloesen(s);
    });
    /* Muster in SVG-Bildern */
    Array.prototype.forEach.call(document.querySelectorAll('img[src$=".svg"]'), function (img) {
      arbeit.push(bildVektorisieren(img));
    });
    /* Flyer */
    Array.prototype.forEach.call(document.querySelectorAll(".fl-bogen"), function (b) {
      arbeit.push(grundflaeche(b, 303, 216, Array.prototype.slice.call(b.querySelectorAll(".tuch")), 42));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".fl-borte"), function (e) { karoband(e, 4.2); });
    Array.prototype.forEach.call(document.querySelectorAll(".fl-polaroid__flaeche"), function (e) {
      punkteflaeche(e, 4.6, 0.75, "#F1D3D8", "#E3B2BA");
    });
    /* Visitenkarte */
    Array.prototype.forEach.call(document.querySelectorAll(".vk-karte"), function (k) {
      arbeit.push(grundflaeche(k, 91, 61, [k], 28));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".vk-saum"), function (e) { karoband(e, 3); });

    Promise.all(arbeit).then(function () {
      document.documentElement.setAttribute("data-druck-vektor", "bereit");
    }, function (err) {
      document.documentElement.setAttribute("data-druck-vektor", "fehler");
      if (window.console) console.error("Druckflächen:", err);
    });
  }

  var schriften = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  function los() { schriften.then(start); }
  if (document.readyState === "complete") los(); else window.addEventListener("load", los);
})();
