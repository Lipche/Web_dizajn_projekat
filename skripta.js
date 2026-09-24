var jezik = localStorage.getItem("tocak-jezik") || "sr";
var tema = localStorage.getItem("tocak-tema") || "svetla";
var velicinaFonta = parseInt(localStorage.getItem("tocak-font") || "16", 10);
var recnik = null;

function prevedi(kljuc) {
    return recnik && recnik[jezik] && recnik[jezik][kljuc] ? recnik[jezik][kljuc] : "";
}

function osveziDugmad() {
    var dugmeTema = document.getElementById("btn-tema");
    var dugmeJezik = document.getElementById("btn-jezik");
    if (dugmeTema && prevedi("tema_" + tema)) dugmeTema.textContent = prevedi("tema_" + tema);
    if (dugmeJezik) dugmeJezik.textContent = jezik === "sr" ? "English" : "Srpski";
}

function primeniTemu() {
    document.documentElement.setAttribute("data-tema", tema);
    document.documentElement.setAttribute("data-bs-theme", tema === "tamna" ? "dark" : "light");
    localStorage.setItem("tocak-tema", tema);
    osveziDugmad();
}

function primeniFont() {
    document.documentElement.style.fontSize = velicinaFonta + "px";
    localStorage.setItem("tocak-font", velicinaFonta);
    var veci = document.getElementById("btn-font-veci");
    var manji = document.getElementById("btn-font-manji");
    if (veci) veci.disabled = velicinaFonta >= 22;
    if (manji) manji.disabled = velicinaFonta <= 12;
}

function primeniJezik() {
    if (!recnik || !recnik[jezik]) return;
    document.querySelectorAll("[data-prevod]").forEach(function (el) {
        var t = recnik[jezik][el.getAttribute("data-prevod")];
        if (t !== undefined) el.textContent = t;
    });
    document.querySelectorAll("[data-prevod-ph]").forEach(function (el) {
        var t = recnik[jezik][el.getAttribute("data-prevod-ph")];
        if (t !== undefined) el.placeholder = t;
    });
    document.documentElement.setAttribute("lang", jezik);
    localStorage.setItem("tocak-jezik", jezik);
    osveziDugmad();
}

function ucitajRecnik() {
    fetch("js/prevod.json")
        .then(function (o) { return o.json(); })
        .then(function (d) { recnik = d; })
        .catch(function () { recnik = window.PREVOD_REZERVA || null; })
        .then(primeniJezik);
}

primeniTemu();
primeniFont();
ucitajRecnik();

document.getElementById("btn-tema").addEventListener("click", function () {
    tema = tema === "tamna" ? "svetla" : "tamna";
    primeniTemu();
});
document.getElementById("btn-font-veci").addEventListener("click", function () {
    if (velicinaFonta < 22) { velicinaFonta += 2; primeniFont(); }
});
document.getElementById("btn-font-manji").addEventListener("click", function () {
    if (velicinaFonta > 12) { velicinaFonta -= 2; primeniFont(); }
});
document.getElementById("btn-jezik").addEventListener("click", function () {
    jezik = jezik === "sr" ? "en" : "sr";
    primeniJezik();
});

var hamburger = document.getElementById("hamburger");
var meni = document.getElementById("meni");
if (hamburger && meni) {
    hamburger.addEventListener("click", function () {
        var otvoren = meni.classList.toggle("otvorena");
        hamburger.classList.toggle("otvoren", otvoren);
        hamburger.setAttribute("aria-expanded", otvoren);
    });
}

var slike = document.querySelectorAll(".slajder-slika");
var tacke = document.querySelectorAll(".slajder-tacka");
if (slike.length) {
    var trenutna = 0;
    var timer;
    var prikazi = function (n) {
        slike[trenutna].classList.remove("aktivna");
        tacke[trenutna].classList.remove("aktivna");
        trenutna = (n + slike.length) % slike.length;
        slike[trenutna].classList.add("aktivna");
        tacke[trenutna].classList.add("aktivna");
    };
    var pokreni = function () {
        clearInterval(timer);
        timer = setInterval(function () { prikazi(trenutna + 1); }, 4500);
    };
    document.getElementById("slajder-levo").addEventListener("click", function () { prikazi(trenutna - 1); pokreni(); });
    document.getElementById("slajder-desno").addEventListener("click", function () { prikazi(trenutna + 1); pokreni(); });
    tacke.forEach(function (t, i) {
        t.addEventListener("click", function () { prikazi(i); pokreni(); });
    });
    pokreni();
}

$(function () {
    $(window).on("scroll", function () {
        $(".zaglavlje").toggleClass("senka", $(this).scrollTop() > 40);
    });

    var gore = $('<button id="dugme-gore" aria-label="Na vrh">&#8593;</button>')
        .addClass($(".navbar").length ? "btn btn-warning position-fixed bottom-0 end-0 m-3" : "dugme-gore")
        .hide()
        .appendTo("body");
    $(window).on("scroll", function () {
        if ($(this).scrollTop() > 300) gore.fadeIn(300); else gore.fadeOut(300);
    });
    gore.on("click", function () { $("html, body").animate({ scrollTop: 0 }, 500); });

    function pojava() {
        $(".animiraj").each(function () {
            if ($(window).scrollTop() + $(window).height() > $(this).offset().top + 40) {
                $(this).animate({ opacity: 1 }, 700);
            }
        });
    }
    $(window).on("scroll", pojava);
    pojava();

    var brojeviPokrenuti = false;
    function brojaci() {
        var prvi = $(".brojac").first();
        if (brojeviPokrenuti || !prvi.length) return;
        if ($(window).scrollTop() + $(window).height() > prvi.offset().top) {
            brojeviPokrenuti = true;
            $(".brojac").each(function () {
                var el = $(this);
                $({ n: 0 }).animate({ n: el.data("cilj") }, {
                    duration: 1800,
                    step: function () { el.text(Math.floor(this.n)); },
                    complete: function () { el.text(el.data("cilj")); }
                });
            });
        }
    }
    $(window).on("scroll", brojaci);
    brojaci();
});

var forma = document.getElementById("forma-kontakt");
if (forma) {
    var stanje = function (id, ispravno) {
        var polje = document.getElementById(id);
        var greska = document.getElementById(id + "-greska");
        polje.classList.toggle("greska", !ispravno);
        polje.classList.toggle("ispravno", ispravno);
        if (greska) greska.classList.toggle("vidljiva", !ispravno);
        return ispravno;
    };
    var vrednost = function (id) { return document.getElementById(id).value.trim(); };

    forma.addEventListener("submit", function (e) {
        e.preventDefault();
        var uspeh = document.getElementById("uspeh");
        var danas = new Date();
        danas.setHours(0, 0, 0, 0);
        var provere = [
            stanje("ime", vrednost("ime").length >= 3),
            stanje("telefon", /^[0-9+\-\s()]{7,18}$/.test(vrednost("telefon"))),
            stanje("email", vrednost("email") === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vrednost("email"))),
            stanje("usluga", vrednost("usluga") !== ""),
            stanje("datum", vrednost("datum") !== "" && new Date(vrednost("datum")) >= danas),
            stanje("poruka", vrednost("poruka").length >= 10)
        ];
        var saglasan = document.getElementById("saglasnost");
        document.getElementById("saglasnost-greska").classList.toggle("vidljiva", !saglasan.checked);
        provere.push(saglasan.checked);
        var ispravno = provere.every(function (p) { return p; });
        uspeh.classList.toggle("vidljiva", ispravno);
        if (ispravno) {
            forma.reset();
            forma.querySelectorAll(".ispravno").forEach(function (p) { p.classList.remove("ispravno"); });
        }
    });
}
