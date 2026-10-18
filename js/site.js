/* Marion · Website-Entwurf v2.1.0 – kleines Verhalten, ohne Abhängigkeiten.
   1. Menü-Knopf (mobil)  2. Signatur-Faden im Hero  3. Sticky-Aktion mobil ein-/ausblenden
   Es werden keine Daten gesendet und keine externen Ressourcen geladen. */
(function () {
  "use strict";

  // 1. Menü
  var knopf = document.querySelector(".menue-knopf");
  var nav = document.getElementById("hauptnav");
  if (knopf && nav) {
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("offen");
        knopf.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("offen")) {
        nav.classList.remove("offen");
        knopf.setAttribute("aria-expanded", "false");
        knopf.focus();
      }
    });
  }

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kannBeobachten = "IntersectionObserver" in window;

  // 2. Signatur: eine Reihe mit hellerem Faden geht vom Schild aus – sie beginnt an der
  //    rechten Schildkante, liegt auf Höhe der Schildmitte und ist auf das Kachelraster gerastet.
  //    Ohne JS gilt die CSS-Näherung; bei reduzierter Bewegung steht die Reihe sofort da.
  var faden = document.querySelector("[data-signatur]");
  if (faden) {
    var flaeche = faden.parentElement;
    var schild = flaeche.parentElement.querySelector(".schild");
    var legeFaden = function () {
      if (!schild) { return; }
      var f = flaeche.getBoundingClientRect();
      var s = schild.getBoundingClientRect();
      var groesse = getComputedStyle(flaeche).backgroundSize.split(" ");
      var tw = parseFloat(groesse[0]) || 48;
      var th = parseFloat(groesse[1]) || tw;
      var mitte = s.top + s.height / 2 - f.top;
      var maxReihe = Math.max(0, Math.floor(f.height / th) - 1);
      var reihe = Math.min(maxReihe, Math.max(0, Math.round((mitte - th / 2) / th)));
      var links = Math.max(0, s.right - f.left);
      var versatz = (tw - (links % tw)) % tw + tw / 2;
      // Rest rechts vom Schild zu schmal (unter zwei Kacheln): lieber gar kein Faden als ein Stummel.
      faden.hidden = (f.right - s.right) < 2 * tw;
      faden.style.top = (reihe * th) + "px";
      faden.style.left = links + "px";
      faden.style.backgroundPosition = versatz + "px 0";
    };
    legeFaden();
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(legeFaden); }
    var rahmen = 0;
    window.addEventListener("resize", function () {
      cancelAnimationFrame(rahmen);
      rahmen = requestAnimationFrame(legeFaden);
    });
    if (!ruhig && kannBeobachten) {
      faden.classList.add("wartet");
      var io = new IntersectionObserver(function (eintraege) {
        eintraege.forEach(function (e) {
          if (e.isIntersecting) {
            setTimeout(function () { faden.classList.remove("wartet"); }, 300);
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(flaeche);
    }
  }

  // 3. Sticky-Aktion: nur zeigen, wenn die Hauptaktion nicht ohnehin sichtbar ist.
  var sticky = document.querySelector(".sticky");
  var ziele = document.querySelectorAll("[data-hauptaktion]");
  if (sticky && ziele.length && kannBeobachten) {
    var sichtbar = new Set();
    var beob = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { sichtbar.add(e.target); } else { sichtbar.delete(e.target); }
      });
      sticky.classList.toggle("weg", sichtbar.size > 0);
      sticky.setAttribute("aria-hidden", sichtbar.size > 0 ? "true" : "false");
      sticky.tabIndex = sichtbar.size > 0 ? -1 : 0;
    }, { threshold: 0 });
    ziele.forEach(function (z) { beob.observe(z); });
  }
})();
