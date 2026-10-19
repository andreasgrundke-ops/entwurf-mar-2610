/* Marion · Entwurf v3.0.0 „Am Küchentisch“ – kleines Verhalten, ohne Abhängigkeiten.
   1. Menü mobil   2. Lade-Moment (Tisch wird aufgedeckt)   3. Sticky-Knopf mobil
   4. Musterformular (sendet nichts, zeigt nur Rückmeldung)
   Es werden keine Daten gesendet und keine externen Ressourcen geladen. */
(function () {
  "use strict";

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Menü ----------------------------------------------------------------
  var knopf = document.querySelector(".menue-knopf");
  var nav = document.getElementById("hauptnav");
  if (knopf && nav) {
    var schliessen = function (fokusZurueck) {
      nav.classList.remove("offen");
      knopf.setAttribute("aria-expanded", "false");
      if (fokusZurueck) { knopf.focus(); }
    };
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      if (offen) {
        var erster = nav.querySelector("a");
        if (erster) { erster.focus(); }
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { schliessen(false); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("offen")) { schliessen(true); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("offen") && !nav.contains(e.target) && !knopf.contains(e.target)) { schliessen(false); }
    });
  }

  // 2. Lade-Moment ---------------------------------------------------------
  // Die Animation selbst steht im CSS (Klasse .js am html, gesetzt im <head>).
  // Hier wird nur aufgeräumt: Ist der Tisch gedeckt, fallen die Animationen weg,
  // damit spätere Hover-Effekte und Druckansicht nicht mit ihnen kollidieren.
  var tisch = document.querySelector(".aufdecken");
  if (tisch && !ruhig) {
    var teile = tisch.querySelectorAll(".gedeck");
    var letztes = teile[teile.length - 1];
    if (letztes) {
      letztes.addEventListener("animationend", function () {
        tisch.classList.add("gedeckt");
      }, { once: true });
    }
  }

  // 3. Sticky-Knopf mobil: weg, solange der Hauptknopf oder der Kontakt sichtbar ist
  var sticky = document.querySelector(".sticky-platz");
  if (sticky && "IntersectionObserver" in window) {
    var sichtbar = new Set();
    var ziele = document.querySelectorAll("[data-hauptaktion], #kontakt, .platz-band");
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { sichtbar.add(e.target); } else { sichtbar.delete(e.target); }
      });
      sticky.classList.toggle("weg", sichtbar.size > 0);
    }, { threshold: 0 });
    ziele.forEach(function (z) { beobachter.observe(z); });
    if (!ziele.length) { sticky.classList.remove("weg"); }
  } else if (sticky) {
    sticky.classList.remove("weg");
  }

  // 4. Musterformular --------------------------------------------------------
  var formular = document.querySelector("[data-muster-formular]");
  if (formular) {
    var status = formular.querySelector(".formular__status");
    var pruefe = function (feld) {
      var fehler = document.getElementById(feld.getAttribute("aria-describedby"));
      var leer = !feld.value.trim();
      feld.setAttribute("aria-invalid", leer ? "true" : "false");
      if (fehler) {
        fehler.textContent = leer ? (feld.id === "f-name" ? "Ein Vorname reicht mir." : "Damit ich dir antworten kann, brauche ich eine E-Mail-Adresse oder Telefonnummer.") : "";
      }
      return !leer;
    };
    formular.querySelectorAll("[required]").forEach(function (feld) {
      feld.addEventListener("blur", function () { if (feld.getAttribute("aria-invalid")) { pruefe(feld); } });
    });
    formular.addEventListener("submit", function (e) {
      e.preventDefault();
      var felder = formular.querySelectorAll("[required]");
      var ok = true, erstesProblem = null;
      felder.forEach(function (feld) {
        if (!pruefe(feld)) { ok = false; if (!erstesProblem) { erstesProblem = feld; } }
      });
      if (!ok) {
        status.textContent = "";
        erstesProblem.focus();
        return;
      }
      status.textContent = "Danke! Das ist ein Muster, es wurde nichts gesendet.";
    });
  }
})();
