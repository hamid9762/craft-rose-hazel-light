import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as useThree, c as CanvasTexture, d as SRGBColorSpace, f as require_jsx_runtime, i as useFrame, l as Object3D, n as useTexture, r as Canvas, t as Sky, u as RepeatWrapping } from "../_libs/@react-three/drei+[...].mjs";
import { a as Play, c as ChevronUp, d as ChevronDown, i as RotateCcw, l as ChevronRight, n as Volume2, o as Pause, s as MapPin, t as VolumeX, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Game-BLxj-7xK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var master = null;
var sfxBus = null;
var musicBus = null;
var musicNodes = [];
var musicTimer = null;
var muted = false;
var musicBase = .2;
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
		master = ctx.createGain();
		sfxBus = ctx.createGain();
		musicBus = ctx.createGain();
		sfxBus.gain.value = .7;
		musicBus.gain.value = musicBase;
		master.gain.value = muted ? 0 : 1;
		sfxBus.connect(master);
		musicBus.connect(master);
		master.connect(ctx.destination);
	}
	return ctx;
}
function warmVoices() {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.getVoices();
}
function unlockAudio() {
	const c = ac();
	if (!c) return;
	if (c.state === "suspended") c.resume();
	warmVoices();
}
function setMuted(next) {
	muted = next;
	if (master && ctx) master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, .03);
	if (next) cancelAnnounce();
}
function isMuted() {
	return muted;
}
function envGain(duration, peak, bus) {
	const c = ac();
	if (!c) return null;
	const g = c.createGain();
	g.gain.setValueAtTime(1e-4, c.currentTime);
	g.gain.exponentialRampToValueAtTime(peak, c.currentTime + .018);
	g.gain.exponentialRampToValueAtTime(1e-4, c.currentTime + duration);
	g.connect(bus);
	return g;
}
function playCoin() {
	const c = ac();
	if (!c || !sfxBus) return;
	[
		880,
		1174,
		1568
	].forEach((f, i) => {
		const o = c.createOscillator();
		o.type = "triangle";
		o.frequency.value = f;
		const g = envGain(.18, .12, sfxBus);
		if (!g) return;
		o.connect(g);
		o.start(c.currentTime + i * .04);
		o.stop(c.currentTime + .2 + i * .04);
	});
}
function playJump() {
	const c = ac();
	if (!c || !sfxBus) return;
	const o = c.createOscillator();
	o.type = "sine";
	o.frequency.setValueAtTime(240, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(520, c.currentTime + .12);
	const g = envGain(.16, .18, sfxBus);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .18);
}
function playSlide() {
	const c = ac();
	if (!c || !sfxBus) return;
	const o = c.createOscillator();
	o.type = "sawtooth";
	o.frequency.setValueAtTime(180, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(70, c.currentTime + .2);
	const g = envGain(.22, .08, sfxBus);
	if (!g) return;
	o.connect(g);
	o.start();
	o.stop(c.currentTime + .22);
}
function playHit() {
	const c = ac();
	if (!c || !sfxBus) return;
	cancelAnnounce();
	const buffer = c.createBuffer(1, c.sampleRate * .25, c.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
	const src = c.createBufferSource();
	src.buffer = buffer;
	const filter = c.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 420;
	const g = envGain(.3, .55, sfxBus);
	if (!g) return;
	src.connect(filter);
	filter.connect(g);
	src.start();
	const o = c.createOscillator();
	o.type = "sine";
	o.frequency.setValueAtTime(110, c.currentTime);
	o.frequency.exponentialRampToValueAtTime(40, c.currentTime + .28);
	const g2 = envGain(.32, .35, sfxBus);
	if (!g2) return;
	o.connect(g2);
	o.start();
	o.stop(c.currentTime + .32);
}
function pickVoice() {
	if (typeof window === "undefined" || !window.speechSynthesis) return null;
	const voices = window.speechSynthesis.getVoices();
	const score = (v) => {
		const lang = v.lang.toLowerCase();
		if (lang.startsWith("ur")) return 5;
		if (lang.startsWith("hi")) return 4;
		if (lang.startsWith("pa")) return 3;
		if (lang.startsWith("en-in") || lang.startsWith("en-pk")) return 2;
		if (lang.startsWith("en")) return 1;
		return 0;
	};
	let best = null;
	let bestScore = -1;
	for (const v of voices) {
		const s = score(v);
		if (s > bestScore) {
			best = v;
			bestScore = s;
		}
	}
	return best;
}
function duckMusic(seconds = 2.1) {
	if (!musicBus || !ctx) return;
	const now = ctx.currentTime;
	musicBus.gain.cancelScheduledValues(now);
	musicBus.gain.setTargetAtTime(.07, now, .06);
	musicBus.gain.setTargetAtTime(musicBase, now + seconds, .25);
}
function cancelAnnounce() {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.cancel();
}
function pauseAnnounce() {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.pause();
}
function resumeAnnounce() {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.resume();
}
function whenVoicesReady(cb) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	const synth = window.speechSynthesis;
	if (synth.getVoices().length > 0) {
		cb();
		return;
	}
	let done = false;
	const run = () => {
		if (done) return;
		done = true;
		synth.removeEventListener("voiceschanged", run);
		cb();
	};
	synth.addEventListener("voiceschanged", run);
	window.setTimeout(run, 450);
}
function announceLine(line, cancel = true) {
	if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
	duckMusic(Math.min(4.2, 1.4 + line.length * .035));
	const speak = () => {
		if (muted) return;
		const utter = new SpeechSynthesisUtterance(line);
		const voice = pickVoice();
		if (voice) {
			utter.voice = voice;
			utter.lang = voice.lang;
		} else utter.lang = "hi-IN";
		utter.rate = .88;
		utter.pitch = 1;
		utter.volume = 1;
		if (cancel) window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utter);
	};
	whenVoicesReady(speak);
}
function announceVillage(name, start = false) {
	announceLine(start ? `${name} gaon se game start ho rahi hai` : `${name} aa gaya`, true);
}
function playVillage(name, start = false) {
	const c = ac();
	if (c && sfxBus) [
		392,
		494,
		587
	].forEach((f, i) => {
		const o = c.createOscillator();
		o.type = "triangle";
		o.frequency.value = f;
		const g = envGain(.28, .08, sfxBus);
		if (!g) return;
		o.connect(g);
		o.start(c.currentTime + i * .08);
		o.stop(c.currentTime + .32 + i * .08);
	});
	if (name) announceVillage(name, start);
}
function stopMusicNodes() {
	for (const n of musicNodes) try {
		if ("stop" in n && typeof n.stop === "function") n.stop();
		n.disconnect();
	} catch {}
	musicNodes = [];
	if (musicTimer != null) {
		window.clearInterval(musicTimer);
		musicTimer = null;
	}
}
function startMusic() {
	const c = ac();
	if (!c || !musicBus) return;
	stopMusicNodes();
	musicBus.gain.setTargetAtTime(musicBase, c.currentTime, .05);
	for (const [freq, vol] of [
		[73, .18],
		[110, .1],
		[147, .06]
	]) {
		const o = c.createOscillator();
		o.type = "sine";
		o.frequency.value = freq;
		const g = c.createGain();
		g.gain.value = vol;
		o.connect(g);
		g.connect(musicBus);
		o.start();
		musicNodes.push(o, g);
	}
	const scale = [
		196,
		220,
		262,
		294,
		330,
		294,
		262,
		220
	];
	let step = 0;
	const tick = () => {
		if (!ctx || !musicBus) return;
		const f = scale[step % scale.length];
		step += 1;
		const o = ctx.createOscillator();
		o.type = "triangle";
		o.frequency.value = f;
		const pg = envGain(.62, .16, musicBus);
		if (!pg) return;
		o.connect(pg);
		o.start();
		o.stop(ctx.currentTime + .65);
	};
	tick();
	musicTimer = window.setInterval(tick, 720);
}
function resumeAudio() {
	const c = ac();
	if (c && c.state === "suspended") c.resume();
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-(--motion-fast) ease-(--ease-smooth-out) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:bg-primary/90",
			secondary: "bg-surface text-fg border border-border hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2"
		},
		size: {
			default: "h-12 rounded-md px-6 text-base",
			lg: "h-14 rounded-lg px-8 text-lg",
			icon: "size-12 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function L(name, urdu, voice) {
	return voice ? {
		name,
		urdu,
		voice
	} : {
		name,
		urdu
	};
}
function usual(name, urdu, extra = []) {
	return [
		L(`Jamia Masjid ${name}`, `جامع مسجد ${urdu}`),
		L(`${name} Bazaar`, `بازار ${urdu}`),
		L(`${name} Adda`, `اڈا ${urdu}`),
		...extra,
		L(`${name} School`, `سکول ${urdu}`)
	].slice(0, 4);
}
var VILLAGES = [
	{
		name: "Shinka",
		urdu: "شینکا",
		major: true,
		landmarks: [
			L("Shinka Welfare Society", "شینکا ویلفیئر سوسائٹی"),
			L("Union Council Shinka", "یونین کونسل شینکا"),
			L("Hamid House", "حمید ہاؤس"),
			L("Chhach Interchange", "چاچ انٹرچینج")
		]
	},
	{
		name: "Yaseen",
		urdu: "یاسین",
		major: false,
		landmarks: usual("Yaseen", "یاسین")
	},
	{
		name: "Malak Mala",
		urdu: "ملک ملا",
		major: true,
		landmarks: usual("Malak Mala", "ملک ملا", [L("Garhi Site", "گڑھی سائٹ")])
	},
	{
		name: "Behboodi",
		urdu: "بہبودی",
		major: false,
		landmarks: usual("Behboodi", "بہبودی")
	},
	{
		name: "Nartopa",
		urdu: "نرٹوپا",
		major: true,
		landmarks: usual("Nartopa", "نرٹوپا")
	},
	{
		name: "Jalalia",
		urdu: "جلالیہ",
		major: true,
		landmarks: usual("Jalalia", "جلالیہ")
	},
	{
		name: "Ghorghushti",
		urdu: "غورغشتی",
		major: true,
		landmarks: usual("Ghorghushti", "غورغشتی", [L("Ghorghushti Mandi", "غورغشتی منڈی")])
	},
	{
		name: "Momenpur",
		urdu: "مومن پور",
		major: false,
		landmarks: usual("Momenpur", "مومن پور")
	},
	{
		name: "Hameed",
		urdu: "حمید",
		major: true,
		landmarks: usual("Hameed", "حمید")
	},
	{
		name: "Pirdad",
		urdu: "پیر داد",
		major: false,
		landmarks: usual("Pirdad", "پیر داد")
	},
	{
		name: "Khagwani",
		urdu: "کھاگوانی",
		major: false,
		landmarks: usual("Khagwani", "کھاگوانی")
	},
	{
		name: "Kalu Kalan",
		urdu: "کالو کلاں",
		major: false,
		landmarks: usual("Kalu Kalan", "کالو کلاں")
	},
	{
		name: "Ababakar",
		urdu: "ابابکر",
		major: false,
		landmarks: usual("Ababakar", "ابابکر")
	},
	{
		name: "Barazai",
		urdu: "برازئی",
		major: true,
		landmarks: usual("Barazai", "برازئی")
	},
	{
		name: "Daman",
		urdu: "دامن",
		major: false,
		landmarks: usual("Daman", "دامن")
	},
	{
		name: "Painda",
		urdu: "پینڈا",
		major: false,
		landmarks: usual("Painda", "پینڈا")
	},
	{
		name: "Kamalpur Musa",
		urdu: "کمال پور موسیٰ",
		major: false,
		landmarks: usual("Kamalpur Musa", "کمال پور موسیٰ")
	},
	{
		name: "Mosa",
		urdu: "موسیٰ",
		major: false,
		landmarks: usual("Mosa", "موسیٰ")
	},
	{
		name: "Malhoo",
		urdu: "ملو",
		major: false,
		landmarks: usual("Malhoo", "ملو")
	},
	{
		name: "Tajak",
		urdu: "تاجک",
		major: true,
		landmarks: usual("Tajak", "تاجک")
	},
	{
		name: "Rangoo",
		urdu: "رنگو",
		major: false,
		landmarks: usual("Rangoo", "رنگو")
	},
	{
		name: "Veero",
		urdu: "ویرو",
		major: false,
		landmarks: usual("Veero", "ویرو")
	},
	{
		name: "Taja Baja",
		urdu: "تاجا باجا",
		major: false,
		landmarks: usual("Taja Baja", "تاجا باجا")
	},
	{
		name: "Mansar",
		urdu: "منسر",
		major: true,
		landmarks: usual("Mansar", "منسر", [L("Mansar Lake Road", "منسر جھیل روڈ")])
	},
	{
		name: "Haji Shah",
		urdu: "حاجی شاہ",
		major: false,
		landmarks: usual("Haji Shah", "حاجی شاہ", [L("GT Road Stop", "جی ٹی روڈ سٹاپ")])
	},
	{
		name: "Mullan Mansoor",
		urdu: "ملا منصور",
		major: false,
		landmarks: usual("Mullan Mansoor", "ملا منصور")
	},
	{
		name: "Khura Khail",
		urdu: "خورا خیل",
		major: false,
		landmarks: usual("Khura Khail", "خورا خیل")
	},
	{
		name: "Formuli",
		urdu: "فارمولی",
		major: false,
		landmarks: usual("Formuli", "فارمولی")
	},
	{
		name: "Mallaah",
		urdu: "ملاح",
		major: false,
		landmarks: usual("Mallaah", "ملاح")
	},
	{
		name: "Shadi Khan",
		urdu: "شادی خان",
		major: true,
		landmarks: usual("Shadi Khan", "شادی خان", [L("Shadi Khan Chowk", "شادی خان چوک")])
	},
	{
		name: "Sirka",
		urdu: "سرکہ",
		major: false,
		landmarks: usual("Sirka", "سرکہ")
	},
	{
		name: "Waisa",
		urdu: "ویسہ",
		major: true,
		landmarks: usual("Waisa", "ویسہ")
	},
	{
		name: "Waisa Kasi",
		urdu: "ویسہ کاسی",
		major: false,
		landmarks: usual("Waisa Kasi", "ویسہ کاسی")
	},
	{
		name: "Shamsabad",
		urdu: "شمس آباد",
		major: true,
		landmarks: usual("Shamsabad", "شمس آباد")
	},
	{
		name: "Walia",
		urdu: "والیہ",
		major: false,
		landmarks: usual("Walia", "والیہ")
	},
	{
		name: "Kalu Khurd",
		urdu: "کالو خورد",
		major: false,
		landmarks: usual("Kalu Khurd", "کالو خورد")
	},
	{
		name: "Basia",
		urdu: "بسیہ",
		major: false,
		landmarks: usual("Basia", "بسیہ")
	},
	{
		name: "Noor Pur",
		urdu: "نور پور",
		major: false,
		landmarks: usual("Noor Pur", "نور پور")
	},
	{
		name: "Saleem Khan",
		urdu: "سلیم خان",
		major: false,
		landmarks: usual("Saleem Khan", "سلیم خان")
	},
	{
		name: "Adal Zai",
		urdu: "عدل زئی",
		major: false,
		landmarks: usual("Adal Zai", "عدل زئی")
	},
	{
		name: "Kudlathi",
		urdu: "کدلتھی",
		major: false,
		landmarks: usual("Kudlathi", "کدلتھی")
	},
	{
		name: "Musa Kudlathi",
		urdu: "موسیٰ کدلتھی",
		major: false,
		landmarks: usual("Musa Kudlathi", "موسیٰ کدلتھی")
	},
	{
		name: "Bahadur Khan",
		urdu: "بہادر خان",
		major: false,
		landmarks: usual("Bahadur Khan", "بہادر خان")
	},
	{
		name: "Sarwana",
		urdu: "سروانہ",
		major: false,
		landmarks: usual("Sarwana", "سروانہ")
	},
	{
		name: "Shah Dher",
		urdu: "شاہ ڈھیر",
		major: false,
		landmarks: usual("Shah Dher", "شاہ ڈھیر")
	},
	{
		name: "Jatial",
		urdu: "جٹیال",
		major: false,
		landmarks: usual("Jatial", "جٹیال")
	},
	{
		name: "Hattian",
		urdu: "ہٹیاں",
		major: false,
		landmarks: usual("Hattian", "ہٹیاں")
	},
	{
		name: "Chachian",
		urdu: "چاچیاں",
		major: false,
		landmarks: usual("Chachian", "چاچیاں")
	},
	{
		name: "Darya Sharif",
		urdu: "دریا شریف",
		major: true,
		landmarks: [
			L("Darya Sharif Darbar", "دربار دریا شریف"),
			L("Riverbank", "دریا کنارہ"),
			L("Jamia Masjid", "جامع مسجد"),
			L("Darya Sharif Adda", "اڈا دریا شریف")
		]
	},
	{
		name: "Hassanpur",
		urdu: "حسن پور",
		major: false,
		landmarks: usual("Hassanpur", "حسن پور")
	},
	{
		name: "Fateh Chak",
		urdu: "فتح چک",
		major: false,
		landmarks: usual("Fateh Chak", "فتح چک")
	},
	{
		name: "Delawarabad",
		urdu: "دلاور آباد",
		major: false,
		landmarks: usual("Delawarabad", "دلاور آباد")
	},
	{
		name: "Samaan",
		urdu: "سامان",
		major: false,
		landmarks: usual("Samaan", "سامان")
	},
	{
		name: "Ghondal",
		urdu: "گھونڈل",
		major: false,
		landmarks: usual("Ghondal", "گھونڈل")
	},
	{
		name: "Madrota",
		urdu: "مدرٹا",
		major: false,
		landmarks: usual("Madrota", "مدرٹا")
	},
	{
		name: "Lundi",
		urdu: "لنڈی",
		major: false,
		landmarks: usual("Lundi", "لنڈی")
	},
	{
		name: "Lakori",
		urdu: "لاکوری",
		major: false,
		landmarks: usual("Lakori", "لاکوری")
	},
	{
		name: "Bara",
		urdu: "باڑہ",
		major: false,
		landmarks: usual("Bara", "باڑہ")
	},
	{
		name: "Rahmo Mararya",
		urdu: "رحمو مراریہ",
		major: false,
		landmarks: usual("Rahmo Mararya", "رحمو مراریہ")
	},
	{
		name: "Pinjwana",
		urdu: "پنجوانہ",
		major: false,
		landmarks: usual("Pinjwana", "پنجوانہ")
	},
	{
		name: "Daghra",
		urdu: "داغرہ",
		major: false,
		landmarks: usual("Daghra", "داغرہ")
	},
	{
		name: "Dhrabi",
		urdu: "دھرابی",
		major: false,
		landmarks: usual("Dhrabi", "دھرابی")
	},
	{
		name: "Shagai",
		urdu: "شگئی",
		major: false,
		landmarks: usual("Shagai", "شگئی")
	},
	{
		name: "ThiKrian",
		urdu: "ٹھکریاں",
		major: false,
		landmarks: usual("ThiKrian", "ٹھکریاں")
	},
	{
		name: "Shah Por",
		urdu: "شاہ پور",
		major: false,
		landmarks: usual("Shah Por", "شاہ پور")
	},
	{
		name: "Raitla Mandi",
		urdu: "ریتلہ منڈی",
		major: false,
		landmarks: usual("Raitla Mandi", "ریتلہ منڈی", [L("Grain Mandi", "اناج منڈی")])
	},
	{
		name: "Kalu Dabb",
		urdu: "کالو ڈب",
		major: false,
		landmarks: usual("Kalu Dabb", "کالو ڈب")
	},
	{
		name: "Pehti",
		urdu: "پہٹی",
		major: false,
		landmarks: usual("Pehti", "پہٹی")
	},
	{
		name: "Haroon",
		urdu: "ہارون",
		major: false,
		landmarks: usual("Haroon", "ہارون")
	},
	{
		name: "Nasozai",
		urdu: "ناسوزئی",
		major: false,
		landmarks: usual("Nasozai", "ناسوزئی")
	},
	{
		name: "Said Khail",
		urdu: "سید خیل",
		major: false,
		landmarks: usual("Said Khail", "سید خیل")
	},
	{
		name: "Hazro",
		urdu: "حضرو",
		major: true,
		landmarks: [
			L("Meena Bazaar", "مینا بازار"),
			L("People's Colony Chowk", "پیپلز کالونی چوک"),
			L("Hari Mandir", "ہری مندر"),
			L("Ghora Chowk", "گھوڑا چوک")
		]
	}
];
function villageAt(index) {
	return VILLAGES[index % VILLAGES.length] ?? VILLAGES[0];
}
function landmarkAt(villageIndex, variant) {
	const v = villageAt(villageIndex);
	const list = v.landmarks;
	if (list.length === 0) return {
		name: v.name,
		urdu: v.urdu
	};
	return list[variant % list.length] ?? list[0];
}
function Hud(props) {
	const { screen, score, coins, distance, highScore, village, villageUrdu, entering, villagesRun, muted, onPlay, onPause, onResume, onMute, onLeft, onRight, onJump, onSlide } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("pointer-events-none absolute right-3 z-20 font-display text-sm tracking-wide text-fg/80 drop-shadow-sm", screen === "playing" || screen === "paused" ? "bottom-24 md:bottom-3" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]"),
				children: "@hamid"
			}),
			screen === "playing" || screen === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-bg/70 px-3 py-2 text-fg shadow-sm backdrop-blur-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl leading-tight tracking-wide tabular-nums",
							children: score.toLocaleString()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								Math.floor(distance),
								" m · ",
								coins,
								" coins"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-[55%] text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg tracking-wide text-fg drop-shadow-sm",
							children: village
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-urdu text-sm text-fg/90",
							children: villageUrdu
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							onClick: onMute,
							"aria-label": muted ? "Unmute" : "Mute",
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							onClick: screen === "paused" ? onResume : onPause,
							"aria-label": screen === "paused" ? "Resume" : "Pause",
							children: screen === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {})
						})]
					})
				]
			}) : null,
			entering && screen === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto mt-2 rounded-md bg-primary px-4 py-2 text-primary-fg shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm tracking-widest",
					children: "NOW ENTERING"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl leading-tight",
					children: entering
				})]
			}) : null,
			screen === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto mt-auto flex items-end justify-between gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
						onPress: onLeft,
						label: "Left",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
						onPress: onRight,
						label: "Right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
						onPress: onSlide,
						label: "Slide",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
						onPress: onJump,
						label: "Jump",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {})
					})]
				})]
			}) : null,
			screen === "start" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartCard, {
				highScore,
				onPlay,
				muted,
				onMute
			}) : null,
			screen === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl tracking-wide",
					children: "Paused"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-muted",
					children: "Hazro Tehsil is waiting."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						onClick: onResume,
						children: "Resume"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: onPlay,
						children: "Restart"
					})]
				})
			] }) : null,
			screen === "dead" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.2em] text-muted",
					children: "RUN OVER"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-4xl tracking-wide",
					children: score.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-muted",
					children: [
						Math.floor(distance),
						" m · ",
						coins,
						" coins"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex items-center justify-center gap-2 text-sm text-fg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-primary" }),
						"Last village: ",
						village
					]
				}),
				highScore > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: ["Best ", highScore.toLocaleString()]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 max-h-28 overflow-y-auto text-center text-xs leading-relaxed text-muted",
					children: villagesRun.join(" → ")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					className: "mt-6 w-full",
					onClick: onPlay,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), " Run again"]
				})
			] }) : null
		]
	});
}
function StartCard({ highScore, onPlay, muted, onMute }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto flex flex-1 flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-transparent p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-center sm:bg-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-md rounded-xl border border-border bg-bg/80 p-6 shadow-sm backdrop-blur-md sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.28em] text-muted",
					children: "SHINKA · CHHACHH"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-5xl leading-none tracking-wide text-fg sm:text-6xl",
					children: "HAZRO RUN"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-sm tracking-[0.18em] text-primary",
					children: "BY HAMID"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-sm text-sm leading-relaxed text-muted",
					children: "Start pe voice: “Shinka gaon se game start ho rahi hai”. Har gaon pe naam bolega — “Yaseen aa gaya”. Welfare board silent."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-urdu mt-2 text-base text-fg/90",
					children: "شینکا سے دوڑ شروع کرو"
				}),
				highScore > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted",
					children: ["Best ", highScore.toLocaleString()]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						onClick: onPlay,
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), " Start run"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: onMute,
						className: "w-full",
						children: [
							muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {}),
							" ",
							muted ? "Sound off" : "Sound on"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-xs leading-relaxed text-muted",
					children: "A / D or arrows to switch lanes · Space / swipe up to jump · S / swipe down to slide"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-h-16 overflow-hidden text-[11px] leading-5 text-muted/80",
					children: VILLAGES.map((v) => v.name).join(" · ")
				})
			]
		})
	});
}
function Modal({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 flex items-center justify-center bg-bg/55 p-5 backdrop-blur-[2px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center shadow-sm",
			children
		})
	});
}
function PadBtn({ onPress, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: cn("flex size-14 items-center justify-center rounded-lg border border-border bg-bg/70 text-fg shadow-sm backdrop-blur-sm", "active:scale-[0.98]"),
		onPointerDown: (e) => {
			e.preventDefault();
			onPress();
		},
		children
	});
}
var LANE_X = [
	-2.45,
	0,
	2.45
];
var START_SPEED = 8.8;
var JUMP_V = 9.4;
var LANE_TIME = .16;
var HS_KEY = "hazro-run-best-v1";
function makePool(n, kind) {
	return Array.from({ length: n }, () => ({
		active: false,
		kind,
		x: 0,
		y: 0,
		z: 0,
		hw: .5,
		hh: .5,
		hd: .5,
		lane: 1,
		scale: 1,
		rot: 0,
		variant: 0,
		village: 0,
		passed: false
	}));
}
function grab(pool) {
	for (const e of pool) if (!e.active) return e;
	return null;
}
function aabbOverlap(ax, ay, az, ahx, ahy, ahz, bx, by, bz, bhx, bhy, bhz) {
	return Math.abs(ax - bx) < ahx + bhx && Math.abs(ay - by) < ahy + bhy && Math.abs(az - bz) < ahz + bhz;
}
var RunnerSim = class {
	running = false;
	paused = false;
	dead = false;
	distance = 0;
	speed = START_SPEED;
	coins = 0;
	score = 0;
	highScore = 0;
	lane = 1;
	targetLane = 1;
	x = 0;
	y = 0;
	vy = 0;
	grounded = true;
	coyote = 0;
	jumpBuf = 0;
	sliding = 0;
	laneT = 1;
	laneFrom = 0;
	laneTo = 0;
	villageIndex = 0;
	currentVillage = 0;
	nextVillageAt = 48;
	villagesRun = [0];
	enterPulse = 0;
	enteringName = null;
	spokenLandmarks = /* @__PURE__ */ new Set();
	nextPatternAt = 22;
	nextTreeAt = 4;
	nextHouseAt = 10;
	nextFenceAt = 2;
	nextWalkerAt = 6;
	shake = 0;
	hitstop = 0;
	lastStep = 0;
	keys = /* @__PURE__ */ new Set();
	injected = /* @__PURE__ */ new Set();
	obstacles = makePool(22, "rock");
	coinsP = makePool(28, "coin");
	gates = makePool(4, "gate");
	stones = makePool(6, "stone");
	trees = makePool(56, "tree");
	houses = makePool(36, "house");
	mosques = makePool(6, "mosque");
	fences = makePool(48, "fence");
	hills = makePool(10, "hill");
	boards = makePool(20, "board");
	walkers = makePool(16, "walker");
	constructor() {
		if (typeof window !== "undefined") {
			const raw = window.localStorage.getItem(HS_KEY);
			const n = raw ? Number(raw) : 0;
			this.highScore = Number.isFinite(n) ? n : 0;
		}
		this.seedHills();
		this.seedPreview();
	}
	setInjected(codes) {
		this.injected = new Set(codes);
	}
	reset() {
		this.running = true;
		this.paused = false;
		this.dead = false;
		this.distance = 0;
		this.speed = START_SPEED;
		this.coins = 0;
		this.score = 0;
		this.lane = 1;
		this.targetLane = 1;
		this.x = 0;
		this.y = 0;
		this.vy = 0;
		this.grounded = true;
		this.coyote = 0;
		this.jumpBuf = 0;
		this.sliding = 0;
		this.laneT = 1;
		this.laneFrom = 0;
		this.laneTo = 0;
		this.villageIndex = 0;
		this.currentVillage = 0;
		this.nextVillageAt = 110;
		this.villagesRun = [0];
		this.enterPulse = 2.2;
		this.enteringName = villageAt(0).name;
		this.spokenLandmarks.clear();
		this.nextPatternAt = 32;
		this.nextTreeAt = 3;
		this.nextHouseAt = 8;
		this.nextFenceAt = 1;
		this.nextWalkerAt = 4;
		this.shake = 0;
		this.hitstop = 0;
		this.lastStep = 0;
		for (const pool of [
			this.obstacles,
			this.coinsP,
			this.gates,
			this.stones,
			this.trees,
			this.houses,
			this.mosques,
			this.fences,
			this.hills,
			this.boards,
			this.walkers
		]) for (const e of pool) e.active = false;
		this.seedHills();
		this.spawnVillage(-30);
		playVillage(villageAt(0).name, true);
	}
	seedHills() {
		for (let i = 0; i < 8; i++) {
			const e = grab(this.hills);
			if (!e) break;
			e.active = true;
			e.kind = "hill";
			e.x = (i % 2 === 0 ? -1 : 1) * (34 + i % 3 * 5);
			e.y = 0;
			e.z = -20 - i * 22;
			e.scale = 5 + i % 4 * 2;
			e.rot = .2 * i;
			e.variant = i % 3;
		}
	}
	seedPreview() {
		for (let i = 0; i < 18; i++) {
			const t = grab(this.trees);
			if (!t) break;
			const side = i % 2 === 0 ? -1 : 1;
			this.occupy(t, "tree", side * (8.4 + i % 5 * 2.2), 0, -12 - i * 7, .6, 2, .6);
			t.scale = .9 + i % 4 * .18;
			t.rot = i * .4;
		}
		for (let i = 0; i < 8; i++) {
			const h = grab(this.houses);
			if (!h) break;
			const side = i % 2 === 0 ? -1 : 1;
			this.occupy(h, "house", side * (8.5 + i % 3), 0, -16 - i * 11, 1.2, 1.3, 1.2);
			h.scale = .95 + i % 3 * .12;
			h.rot = i % 2 === 0 ? -.1 : .12;
			h.variant = i % 4;
		}
		const gate = grab(this.gates);
		if (gate) {
			this.occupy(gate, "gate", 0, 0, -22, .4, 2, .4);
			gate.village = 0;
		}
		const m = grab(this.mosques);
		if (m) {
			this.occupy(m, "mosque", -10.5, 0, -28, 1.4, 3, 1.4);
			m.scale = 1.15;
		}
		const previewSpots = villageAt(0).landmarks;
		for (let i = 0; i < previewSpots.length; i++) {
			const b = grab(this.boards);
			if (!b) break;
			const side = i % 2 === 0 ? 1 : -1;
			this.occupy(b, "board", side * (i === 0 ? 6.55 : 6.05), 0, -8 - i * 16, .6, 1.4, .12);
			b.village = 0;
			b.variant = i;
			b.scale = i === 0 ? 1.28 : 1.12;
		}
		for (let i = 0; i < 6; i++) {
			const w = grab(this.walkers);
			if (!w) break;
			this.occupy(w, "walker", 6.45 + i % 3 * .35, 0, -10 - i * 9, .25, .8, .25);
			w.scale = .88 + i % 3 * .1;
			w.variant = i % 4;
		}
	}
	held(code) {
		return this.keys.has(code) || this.injected.has(code);
	}
	spawnZ() {
		return -(38 + this.speed * 1.25);
	}
	occupy(e, kind, x, y, z, hw, hh, hd) {
		e.active = true;
		e.kind = kind;
		e.x = x;
		e.y = y;
		e.z = z;
		e.hw = hw;
		e.hh = hh;
		e.hd = hd;
		e.passed = false;
	}
	spawnObstacle(kind, lane, z) {
		const e = grab(this.obstacles);
		if (!e) return;
		const x = LANE_X[lane] ?? 0;
		e.lane = lane;
		e.variant = Math.random() * 3 | 0;
		e.rot = Math.random() * Math.PI;
		e.scale = 1;
		if (kind === "hay") this.occupy(e, kind, x, .62, z, .62, .62, .62);
		else if (kind === "cart") this.occupy(e, kind, x, .7, z, .78, .7, .95);
		else if (kind === "rock") this.occupy(e, kind, x, .48, z, .58, .48, .58);
		else if (kind === "bar") this.occupy(e, kind, 0, 1.28, z, 4.4, .22, .22);
		else this.occupy(e, kind, 0, .38, z, 4.4, .38, .4);
	}
	spawnCoins(lane, z, count, arc = false) {
		for (let i = 0; i < count; i++) {
			const e = grab(this.coinsP);
			if (!e) return;
			const x = LANE_X[lane] ?? 0;
			const y = arc ? 1.15 + Math.sin(i / (count - 1) * Math.PI) * 1.1 : .95;
			this.occupy(e, "coin", x, y, z - i * 2.1, .32, .32, .32);
			e.lane = lane;
		}
	}
	spawnPattern() {
		const z = this.spawnZ();
		const t = Math.random();
		const dens = Math.min(1, this.distance / 1600);
		const block = [
			"hay",
			"cart",
			"rock"
		][Math.random() * 3 | 0] ?? "hay";
		if (t < .3) {
			const lane = Math.random() * 3 | 0;
			this.spawnObstacle(block, lane, z);
			const coinLane = (lane + 1 + (Math.random() * 2 | 0)) % 3;
			if (Math.random() < .7) this.spawnCoins(coinLane, z + 2, 4);
		} else if (t < .52 + dens * .08) {
			const safe = Math.random() * 3 | 0;
			for (let l = 0; l < 3; l++) if (l !== safe) this.spawnObstacle(block, l, z);
			this.spawnCoins(safe, z + 1, 3);
		} else if (t < .7) {
			this.spawnObstacle("log", 1, z);
			const lane = Math.random() * 3 | 0;
			this.spawnCoins(lane, z + 1.2, 5, true);
		} else if (t < .86) {
			this.spawnObstacle("bar", 1, z);
			this.spawnCoins(Math.random() * 3 | 0, z + 2, 4);
		} else this.spawnCoins(Math.random() * 3 | 0, z, 6);
	}
	spawnVillage(atZ) {
		const idx = this.villageIndex % VILLAGES.length;
		const v = villageAt(idx);
		const z = atZ ?? this.spawnZ();
		this.villageIndex += 1;
		if (v.major) {
			const g = grab(this.gates);
			if (g) {
				this.occupy(g, "gate", 0, 0, z - 6, .4, 2, .4);
				g.village = idx;
			}
			const m = grab(this.mosques);
			if (m) {
				const side = Math.random() < .5 ? -1 : 1;
				this.occupy(m, "mosque", side * (9.5 + Math.random() * 2), 0, z - 14, 1.4, 3, 1.4);
				m.scale = 1.1 + Math.random() * .3;
				m.rot = Math.random() * .4;
			}
		}
		const houseCount = v.major ? 8 : 5;
		for (let i = 0; i < houseCount; i++) {
			const h = grab(this.houses);
			if (!h) break;
			const x = (i % 2 === 0 ? -1 : 1) * (8.4 + i % 3 * 2.2 + Math.random());
			this.occupy(h, "house", x, 0, z - 8 - i * 5.5, 1.2, 1.3, 1.2);
			h.scale = .9 + Math.random() * .45;
			h.rot = (Math.random() - .5) * .25;
			h.variant = Math.random() * 4 | 0;
		}
		const spots = v.landmarks;
		const boardGap = idx === 0 ? 18 : 13;
		const boardBase = atZ !== void 0 ? -12 : z - 4;
		for (let i = 0; i < spots.length; i++) {
			const b = grab(this.boards);
			if (!b) break;
			const side = i % 2 === 0 ? 1 : -1;
			const big = idx === 0 && i === 0;
			this.occupy(b, "board", side * (big ? 6.55 : 6.05), 0, boardBase - i * boardGap, .6, 1.4, .12);
			b.village = idx;
			b.variant = i;
			b.scale = big ? 1.28 : 1.12;
		}
	}
	spawnAmbience() {
		const z = this.spawnZ() - 8;
		while (this.distance > this.nextTreeAt) {
			this.nextTreeAt += 5 + Math.random() * 6;
			const t = grab(this.trees);
			if (!t) break;
			const side = Math.random() < .5 ? -1 : 1;
			this.occupy(t, "tree", side * (6.8 + Math.random() * 10), 0, z - Math.random() * 20, .6, 2, .6);
			t.scale = .85 + Math.random() * .7;
			t.rot = Math.random() * Math.PI;
			t.variant = Math.random() * 3 | 0;
		}
		while (this.distance > this.nextHouseAt) {
			this.nextHouseAt += 18 + Math.random() * 22;
			if (this.distance + 20 > this.nextVillageAt) continue;
			const h = grab(this.houses);
			if (!h) break;
			const side = Math.random() < .5 ? -1 : 1;
			this.occupy(h, "house", side * (8 + Math.random() * 4), 0, z, 1.2, 1.3, 1.2);
			h.scale = .85 + Math.random() * .4;
			h.rot = (Math.random() - .5) * .3;
			h.variant = Math.random() * 4 | 0;
		}
		while (this.distance > this.nextFenceAt) {
			this.nextFenceAt += 5.5;
			for (const side of [-1, 1]) {
				const f = grab(this.fences);
				if (!f) continue;
				this.occupy(f, "fence", side * 4.65, 0, z + Math.random() * 4, .08, .55, .08);
				f.variant = side > 0 ? 1 : 0;
			}
		}
		while (this.distance > this.nextWalkerAt) {
			this.nextWalkerAt += 7 + Math.random() * 8;
			const w = grab(this.walkers);
			if (!w) break;
			this.occupy(w, "walker", 6.35 + Math.random() * .7, 0, z - Math.random() * 12, .25, .8, .25);
			w.scale = .85 + Math.random() * .25;
			w.variant = Math.random() * 4 | 0;
		}
	}
	die() {
		if (this.dead) return;
		this.dead = true;
		this.running = false;
		this.shake = 1;
		this.hitstop = .14;
		playHit();
		if (this.score > this.highScore) {
			this.highScore = this.score;
			try {
				window.localStorage.setItem(HS_KEY, String(this.highScore));
			} catch {}
		}
	}
	playerBox() {
		const hh = this.sliding > 0 ? .36 : .82;
		const cy = this.y + hh;
		return {
			x: this.x,
			y: cy,
			z: 0,
			hx: .32,
			hy: hh,
			hz: .3
		};
	}
	collideHazards() {
		const p = this.playerBox();
		const dz = this.speed * (1 / 60) + .15;
		for (const e of this.obstacles) {
			if (!e.active) continue;
			if (e.z > 8) continue;
			const hz = e.hd + dz;
			if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz, e.x, e.y, e.z, e.hw, e.hh, hz)) continue;
			this.die();
			return;
		}
		for (const e of this.coinsP) {
			if (!e.active) continue;
			if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz + .2, e.x, e.y, e.z, e.hw, e.hh, e.hd)) continue;
			e.active = false;
			this.coins += 1;
			playCoin();
		}
	}
	markPassed(pool) {
		for (const e of pool) {
			if (!e.active || e.passed) continue;
			if (e.z < .6) continue;
			e.passed = true;
			const v = villageAt(e.village);
			if (this.currentVillage !== e.village) {
				this.currentVillage = e.village;
				if (!this.villagesRun.includes(e.village)) this.villagesRun.push(e.village);
				this.enterPulse = 1.8;
				this.enteringName = v.name;
				playVillage(v.name);
			}
		}
	}
	step(dt) {
		const d = Math.min(dt, .08);
		this.shake = Math.max(0, this.shake - d * 2.4);
		if (this.enterPulse > 0) this.enterPulse = Math.max(0, this.enterPulse - d);
		if (this.enterPulse <= 0) this.enteringName = null;
		if (this.hitstop > 0) {
			this.hitstop -= d;
			return;
		}
		if (!this.running || this.paused || this.dead) return;
		const left = this.held("KeyA") || this.held("ArrowLeft");
		const right = this.held("KeyD") || this.held("ArrowRight");
		const jump = this.held("Space") || this.held("ArrowUp") || this.held("KeyW");
		const slide = this.held("KeyS") || this.held("ArrowDown") || this.held("ControlLeft");
		if (left && this.laneT >= 1 && this.targetLane > 0) {
			this.laneFrom = LANE_X[this.targetLane] ?? this.x;
			this.targetLane -= 1;
			this.laneTo = LANE_X[this.targetLane] ?? this.x;
			this.laneT = 0;
		} else if (right && this.laneT >= 1 && this.targetLane < 2) {
			this.laneFrom = LANE_X[this.targetLane] ?? this.x;
			this.targetLane += 1;
			this.laneTo = LANE_X[this.targetLane] ?? this.x;
			this.laneT = 0;
		}
		if (jump) this.jumpBuf = .13;
		this.jumpBuf -= d;
		if (slide && this.grounded) {
			if (this.sliding <= 0) playSlide();
			this.sliding = .62;
		}
		if (this.jumpBuf > 0 && (this.grounded || this.coyote > 0)) {
			this.vy = JUMP_V;
			this.grounded = false;
			this.coyote = 0;
			this.jumpBuf = 0;
			this.sliding = 0;
			playJump();
		}
		if (this.laneT < 1) {
			this.laneT = Math.min(1, this.laneT + d / LANE_TIME);
			const t = 1 - Math.pow(1 - this.laneT, 3);
			this.x = this.laneFrom + (this.laneTo - this.laneFrom) * t;
			if (this.laneT >= 1) this.lane = this.targetLane;
		}
		if (this.grounded) this.coyote = .09;
		else this.coyote -= d;
		if (!this.grounded || this.vy > 0) {
			this.vy -= 26 * d;
			this.y += this.vy * d;
			if (this.y <= 0) {
				this.y = 0;
				this.vy = 0;
				this.grounded = true;
			} else this.grounded = false;
		}
		if (this.sliding > 0) this.sliding -= d;
		const n = this.villagesRun.length;
		const base = n >= 6 ? 16.2 : n >= 3 ? 12.4 : START_SPEED;
		const ramp = n >= 6 ? .0052 : n >= 3 ? .0038 : .0026;
		this.speed = Math.min(26, base + this.distance * ramp);
		this.distance += this.speed * d;
		this.score = Math.floor(this.distance) + this.coins * 12;
		const move = this.speed * d;
		const recycle = (e) => {
			if (!e.active) return;
			e.z += move;
			if (e.z > 16) e.active = false;
		};
		for (const pool of [
			this.obstacles,
			this.coinsP,
			this.gates,
			this.trees,
			this.houses,
			this.mosques,
			this.fences,
			this.boards
		]) for (const e of pool) recycle(e);
		for (const e of this.walkers) {
			if (!e.active) continue;
			e.z += move + 2.6 * d;
			if (e.z > 16) e.active = false;
		}
		for (const e of this.hills) {
			if (!e.active) continue;
			e.z += move * .22;
			if (e.z > 30) e.z -= 180;
		}
		if (this.distance >= this.nextPatternAt) {
			this.spawnPattern();
			const gap = Math.max(13.5, 17 + this.speed * .55 - Math.min(5.5, this.distance / 900));
			this.nextPatternAt = this.distance + gap;
		}
		if (this.distance >= this.nextVillageAt) {
			this.spawnVillage();
			this.nextVillageAt = this.distance + 88 + Math.random() * 22;
		}
		this.spawnAmbience();
		this.markPassed(this.boards);
		this.markPassed(this.gates);
		this.collideHazards();
	}
	snap() {
		return {
			score: this.score,
			coins: this.coins,
			distance: this.distance,
			speed: this.speed,
			village: villageAt(this.currentVillage),
			villagesRun: this.villagesRun.map((i) => villageAt(i).name),
			entering: this.enteringName,
			dead: this.dead,
			shake: this.shake
		};
	}
};
function loadHighScore() {
	if (typeof window === "undefined") return 0;
	const n = Number(window.localStorage.getItem("hazro-run-best-v1") ?? 0);
	return Number.isFinite(n) ? n : 0;
}
var useHud = create((set) => ({
	screen: "start",
	score: 0,
	coins: 0,
	distance: 0,
	highScore: 0,
	village: "Shinka",
	villageUrdu: "شینکا",
	entering: null,
	villagesRun: ["Shinka"],
	muted: false,
	setScreen: (screen) => set({ screen }),
	patch: (p) => set(p)
}));
var dummy = new Object3D();
var signCache = /* @__PURE__ */ new Map();
function parkInstances(mesh, max) {
	dummy.position.set(0, -400, 0);
	dummy.scale.set(0, 0, 0);
	dummy.rotation.set(0, 0, 0);
	dummy.updateMatrix();
	for (let i = 0; i < max; i++) mesh.setMatrixAt(i, dummy.matrix);
}
function makeSign(name, urdu, major) {
	const key = `${name}|${urdu}|${major ? 1 : 0}`;
	const hit = signCache.get(key);
	if (hit) return hit;
	const c = document.createElement("canvas");
	c.width = 1024;
	c.height = 256;
	const ctx = c.getContext("2d");
	ctx.fillStyle = major ? "#5c2414" : "#1f3d28";
	ctx.fillRect(0, 0, 1024, 256);
	ctx.strokeStyle = "#e8d5a8";
	ctx.lineWidth = 14;
	ctx.strokeRect(18, 18, 988, 220);
	ctx.fillStyle = "#f4ead4";
	ctx.textAlign = "center";
	ctx.font = "700 88px Oswald, sans-serif";
	ctx.fillText(name.toUpperCase(), 512, 128);
	ctx.font = "600 42px 'Noto Nastaliq Urdu', serif";
	ctx.fillText(urdu, 512, 200);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	signCache.set(key, tex);
	return tex;
}
function wrapLines(ctx, text, maxW) {
	const words = text.split(" ");
	const lines = [];
	let cur = "";
	for (const w of words) {
		const test = cur ? `${cur} ${w}` : w;
		if (cur && ctx.measureText(test).width > maxW) {
			lines.push(cur);
			cur = w;
		} else cur = test;
	}
	if (cur) lines.push(cur);
	return lines.slice(0, 3);
}
function makeBoard(village, spot, urdu) {
	const key = `board3:${village}|${spot}|${urdu}`;
	const hit = signCache.get(key);
	if (hit) return hit;
	const c = document.createElement("canvas");
	c.width = 1024;
	c.height = 512;
	const ctx = c.getContext("2d");
	ctx.fillStyle = "#146c38";
	ctx.fillRect(0, 0, 1024, 512);
	ctx.fillStyle = "#efc453";
	ctx.fillRect(0, 0, 1024, 92);
	ctx.strokeStyle = "#f8f1e6";
	ctx.lineWidth = 18;
	ctx.strokeRect(16, 16, 992, 480);
	ctx.fillStyle = "#1a1712";
	ctx.textAlign = "center";
	ctx.font = "700 40px Oswald, sans-serif";
	ctx.fillText(village.toUpperCase(), 512, 64);
	ctx.fillStyle = "#ffffff";
	ctx.font = "700 76px Oswald, sans-serif";
	const lines = wrapLines(ctx, spot.toUpperCase(), 920);
	const startY = lines.length === 1 ? 255 : 215;
	lines.forEach((line, i) => ctx.fillText(line, 512, startY + i * 82));
	ctx.font = "600 50px 'Noto Nastaliq Urdu', serif";
	ctx.fillText(urdu, 512, 418);
	ctx.fillStyle = "#efe4d2";
	ctx.font = "700 22px Figtree, sans-serif";
	ctx.fillText("POPULAR PLACE", 512, 470);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	signCache.set(key, tex);
	return tex;
}
function wrapMap(tex, rx, ry) {
	tex.wrapS = tex.wrapT = RepeatWrapping;
	tex.repeat.set(rx, ry);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
}
function Ground({ sim }) {
	const road = useTexture("/textures/road.jpg");
	const field = useTexture("/textures/field.jpg");
	const roadRef = (0, import_react.useRef)(null);
	const fieldL = (0, import_react.useRef)(null);
	const fieldR = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		wrapMap(road, 1.15, 18);
		wrapMap(field, 4, 14);
	}, [road, field]);
	useFrame(() => {
		const v = sim.distance * .042;
		if (roadRef.current?.map) roadRef.current.map.offset.y = -v;
		if (fieldL.current?.map) fieldL.current.map.offset.y = -v * .92;
		if (fieldR.current?.map) fieldR.current.map.offset.y = -v * .92;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				0,
				-50
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [9.2, 180] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				ref: roadRef,
				map: road,
				roughness: .92
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				-16.5,
				-.04,
				-50
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [24, 180] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				ref: fieldL,
				map: field,
				color: "#c9c46a",
				roughness: .88
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				16.5,
				-.04,
				-50
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [24, 180] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				ref: fieldR,
				map: field,
				color: "#c9c46a",
				roughness: .88
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				-11.8,
				.02,
				-50
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [2.4, 180] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#3d6d7a",
				roughness: .18,
				metalness: .2,
				transparent: true,
				opacity: .85
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				6.5,
				.03,
				-50
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [2.3, 180] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#c4a06a",
				roughness: .95
			})]
		})
	] });
}
function LaneMarks({ sim }) {
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		const mesh = ref.current;
		if (!mesh) return;
		parkInstances(mesh, 56);
		let i = 0;
		for (let n = 0; n < 28; n++) {
			const z = -n * 6.5 + sim.distance * 1 % 6.5;
			for (const x of [-1.22, 1.22]) {
				dummy.position.set(x, .03, z);
				dummy.scale.set(.08, 1, 1.6);
				dummy.rotation.set(0, 0, 0);
				dummy.updateMatrix();
				mesh.setMatrixAt(i++, dummy.matrix);
			}
		}
		mesh.count = i;
		mesh.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			56
		],
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			1,
			.02,
			1
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#e8dcc0",
			roughness: .8
		})]
	});
}
function Player({ sim }) {
	const group = (0, import_react.useRef)(null);
	const lLeg = (0, import_react.useRef)(null);
	const rLeg = (0, import_react.useRef)(null);
	const lArm = (0, import_react.useRef)(null);
	const rArm = (0, import_react.useRef)(null);
	const torso = (0, import_react.useRef)(null);
	useFrame((_, dt) => {
		const g = group.current;
		if (!g) return;
		g.position.set(sim.x, sim.y, 0);
		const crouch = sim.sliding > 0 ? .58 : 1;
		const k = 1 - Math.exp(-18 * dt);
		g.scale.y += (crouch - g.scale.y) * k;
		g.scale.x += (1 / Math.sqrt(crouch) - g.scale.x) * k;
		g.scale.z += (1 / Math.sqrt(crouch) - g.scale.z) * k;
		const run = sim.running && !sim.dead && sim.grounded && sim.sliding <= 0 ? 1 : 0;
		const swing = Math.sin(sim.distance * 2.05) * 1.05 * run;
		if (lLeg.current) lLeg.current.rotation.x = swing;
		if (rLeg.current) rLeg.current.rotation.x = -swing;
		if (lArm.current) lArm.current.rotation.x = -swing * .75;
		if (rArm.current) rArm.current.rotation.x = swing * .75;
		if (torso.current) torso.current.rotation.z = -sim.x * .04;
		if (!sim.grounded) {
			if (lLeg.current) lLeg.current.rotation.x = .55;
			if (rLeg.current) rLeg.current.rotation.x = -.35;
			if (lArm.current) lArm.current.rotation.x = -.8;
			if (rArm.current) rArm.current.rotation.x = .5;
		}
	});
	const skin = "#c9956c";
	const kameez = "#efe4d2";
	const sadri = "#8b3d24";
	const shalwar = "#e8dcc6";
	const kufi = "#f8f1e6";
	const hair = "#1a1410";
	const chappal = "#3a2c22";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: group,
		rotation: [
			0,
			Math.PI,
			0
		],
		castShadow: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: torso,
				position: [
					0,
					1.02,
					0
				],
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.02,
							0
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
							.3,
							.78,
							6,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: kameez,
							roughness: .78
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							-.38,
							0
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.36,
							.3,
							.38,
							10
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: kameez,
							roughness: .8
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.18,
							.05
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.48,
							.58,
							.16
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: sadri,
							roughness: .68
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.18,
							.13
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.06,
							.5,
							.02
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d8c4a0" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.52,
							0
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.09,
							.11,
							.16,
							8
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: skin,
							roughness: .55
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.78,
							0
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.22,
							14,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: skin,
							roughness: .55
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.9,
							0
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.23,
							12,
							10,
							0,
							Math.PI * 2,
							0,
							Math.PI * .45
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: hair,
							roughness: .9
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							1,
							0
						],
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.2,
							.21,
							.12,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: kufi,
							roughness: .7
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							1.07,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
							.2,
							.2,
							.04,
							12
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: kufi,
							roughness: .65
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: lArm,
				position: [
					-.4,
					1.32,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.3,
						0
					],
					rotation: [
						0,
						0,
						.2
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.075,
						.52,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: kameez })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						-.04,
						-.58,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.055,
						8,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: skin })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: rArm,
				position: [
					.4,
					1.32,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.3,
						0
					],
					rotation: [
						0,
						0,
						-.2
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.075,
						.52,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: kameez })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						.04,
						-.58,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.055,
						8,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: skin })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: lLeg,
				position: [
					-.16,
					.62,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.28,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.14,
						.42,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: shalwar,
						roughness: .82
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.62,
						.07
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.18,
						.07,
						.32
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: chappal })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: rLeg,
				position: [
					.16,
					.62,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.28,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.14,
						.42,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: shalwar,
						roughness: .82
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.62,
						.07
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.18,
						.07,
						.32
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: chappal })]
				})]
			})
		]
	});
}
function Hay() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.55,
			0
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.7,
			.78,
			1.1,
			10
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c9a44a",
			roughness: .95
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			1.12,
			0
		],
		rotation: [
			0,
			.4,
			0
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
			.52,
			.05,
			6,
			10
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#8a6230" })]
	})] });
}
function Cart() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.72,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				1.15,
				.55,
				1.55
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#6b3e22",
				roughness: .8
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-.55,
				.32,
				.45
			],
			rotation: [
				0,
				0,
				Math.PI / 2
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.28,
				.28,
				.12,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#2c241c" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.55,
				.32,
				.45
			],
			rotation: [
				0,
				0,
				Math.PI / 2
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.28,
				.28,
				.12,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#2c241c" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-.55,
				.32,
				-.45
			],
			rotation: [
				0,
				0,
				Math.PI / 2
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.28,
				.28,
				.12,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#2c241c" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				.55,
				.32,
				-.45
			],
			rotation: [
				0,
				0,
				Math.PI / 2
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.28,
				.28,
				.12,
				10
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#2c241c" })]
		})
	] });
}
function Rock() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.42,
			0
		],
		rotation: [
			.3,
			.5,
			.1
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.62, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#7a6a58",
			roughness: .95
		})]
	});
}
function Bar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-4.2,
				.7,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.18,
				1.4,
				.18
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c4030" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				4.2,
				.7,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.18,
				1.4,
				.18
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c4030" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.28,
				0
			],
			castShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				8.5,
				.16,
				.16
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c45c32" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				1.42,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				8.5,
				.55,
				.04
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#d8c49a",
				transparent: true,
				opacity: .7
			})]
		})
	] });
}
function Log() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.38,
			0
		],
		rotation: [
			0,
			0,
			Math.PI / 2
		],
		castShadow: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.38,
			.4,
			8.6,
			8
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#5a3a22",
			roughness: .9
		})]
	});
}
function ObstacleSlot({ ent }) {
	const g = (0, import_react.useRef)(null);
	const hay = (0, import_react.useRef)(null);
	const cart = (0, import_react.useRef)(null);
	const rock = (0, import_react.useRef)(null);
	const bar = (0, import_react.useRef)(null);
	const log = (0, import_react.useRef)(null);
	useFrame(() => {
		const n = g.current;
		if (!n) return;
		n.visible = ent.active;
		if (!ent.active) return;
		n.position.set(ent.kind === "bar" || ent.kind === "log" ? 0 : ent.x, 0, ent.z);
		if (hay.current) hay.current.visible = ent.kind === "hay";
		if (cart.current) cart.current.visible = ent.kind === "cart";
		if (rock.current) rock.current.visible = ent.kind === "rock";
		if (bar.current) bar.current.visible = ent.kind === "bar";
		if (log.current) log.current.visible = ent.kind === "log";
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: g,
		visible: false,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: hay,
				visible: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hay, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: cart,
				visible: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cart, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: rock,
				visible: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rock, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: bar,
				visible: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: log,
				visible: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Log, {})
			})
		]
	});
}
function Coins({ sim }) {
	const ref = (0, import_react.useRef)(null);
	useFrame(({ clock }) => {
		const mesh = ref.current;
		if (!mesh) return;
		parkInstances(mesh, 28);
		let i = 0;
		const t = clock.elapsedTime;
		for (const e of sim.coinsP) {
			if (!e.active) continue;
			dummy.position.set(e.x, e.y, e.z);
			dummy.rotation.set(0, t * 3 + i, .4);
			dummy.scale.set(1, 1, 1);
			dummy.updateMatrix();
			mesh.setMatrixAt(i++, dummy.matrix);
		}
		mesh.count = i;
		mesh.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			28
		],
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.28,
			.28,
			.06,
			12
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c9a15b",
			metalness: .7,
			roughness: .28
		})]
	});
}
function Trees({ sim }) {
	const trunk = (0, import_react.useRef)(null);
	const leaf = (0, import_react.useRef)(null);
	useFrame(({ clock }) => {
		const sway = Math.sin(clock.elapsedTime * .7) * .04;
		if (trunk.current) parkInstances(trunk.current, 56);
		if (leaf.current) parkInstances(leaf.current, 56);
		let i = 0;
		for (const e of sim.trees) {
			if (!e.active) continue;
			dummy.position.set(e.x, 1.55 * e.scale, e.z);
			dummy.scale.set(.12 * e.scale, 3.1 * e.scale, .12 * e.scale);
			dummy.rotation.set(0, e.rot, sway);
			dummy.updateMatrix();
			trunk.current?.setMatrixAt(i, dummy.matrix);
			dummy.position.set(e.x, 3.85 * e.scale, e.z);
			dummy.scale.set(.72 * e.scale, 2.15 * e.scale, .72 * e.scale);
			dummy.rotation.set(0, e.rot + .4, sway);
			dummy.updateMatrix();
			leaf.current?.setMatrixAt(i, dummy.matrix);
			i++;
		}
		if (trunk.current) {
			trunk.current.count = i;
			trunk.current.instanceMatrix.needsUpdate = true;
		}
		if (leaf.current) {
			leaf.current.count = i;
			leaf.current.instanceMatrix.needsUpdate = true;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: trunk,
		args: [
			void 0,
			void 0,
			56
		],
		castShadow: true,
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			1,
			1.15,
			1,
			5
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#4a3424" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: leaf,
		args: [
			void 0,
			void 0,
			56
		],
		castShadow: true,
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			8,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#4a6b38" })]
	})] });
}
function Houses({ sim }) {
	const brick = useTexture("/textures/brick.jpg");
	const body = (0, import_react.useRef)(null);
	const roof = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		brick.colorSpace = SRGBColorSpace;
		brick.wrapS = brick.wrapT = RepeatWrapping;
		brick.repeat.set(1.4, 1.1);
	}, [brick]);
	useFrame(() => {
		if (body.current) parkInstances(body.current, 36);
		if (roof.current) parkInstances(roof.current, 36);
		let i = 0;
		for (const e of sim.houses) {
			if (!e.active) continue;
			dummy.position.set(e.x, 1.05 * e.scale, e.z);
			dummy.scale.set(2.35 * e.scale, 2.1 * e.scale, 2.5 * e.scale);
			dummy.rotation.set(0, e.rot, 0);
			dummy.updateMatrix();
			body.current?.setMatrixAt(i, dummy.matrix);
			dummy.position.set(e.x, 2.18 * e.scale, e.z);
			dummy.scale.set(2.55 * e.scale, .18 * e.scale, 2.7 * e.scale);
			dummy.rotation.set(0, e.rot, 0);
			dummy.updateMatrix();
			roof.current?.setMatrixAt(i, dummy.matrix);
			i++;
		}
		if (body.current) {
			body.current.count = i;
			body.current.instanceMatrix.needsUpdate = true;
		}
		if (roof.current) {
			roof.current.count = i;
			roof.current.instanceMatrix.needsUpdate = true;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: body,
		args: [
			void 0,
			void 0,
			36
		],
		castShadow: true,
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			1,
			1,
			1
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			map: brick,
			roughness: .9
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref: roof,
		args: [
			void 0,
			void 0,
			36
		],
		castShadow: true,
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			1,
			1,
			1
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#b88968",
			roughness: .92
		})]
	})] });
}
function Fences({ sim }) {
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		const mesh = ref.current;
		if (!mesh) return;
		parkInstances(mesh, 48);
		let i = 0;
		for (const e of sim.fences) {
			if (!e.active) continue;
			dummy.position.set(e.x, .55, e.z);
			dummy.scale.set(1, 1, 1);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			mesh.setMatrixAt(i++, dummy.matrix);
		}
		mesh.count = i;
		mesh.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			48
		],
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.1,
			1.1,
			.1
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#8a6a44" })]
	});
}
function Hills({ sim }) {
	const ref = (0, import_react.useRef)(null);
	useFrame(() => {
		const mesh = ref.current;
		if (!mesh) return;
		parkInstances(mesh, 10);
		let i = 0;
		for (const e of sim.hills) {
			if (!e.active) continue;
			dummy.position.set(e.x, e.scale * .35, e.z);
			dummy.scale.set(e.scale * 1.6, e.scale * .7, e.scale * 1.1);
			dummy.rotation.set(0, e.rot, 0);
			dummy.updateMatrix();
			mesh.setMatrixAt(i++, dummy.matrix);
		}
		mesh.count = i;
		mesh.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			10
		],
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			8,
			6
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#7a8a6a",
			roughness: 1
		})]
	});
}
function Mosques({ sim }) {
	const refs = (0, import_react.useRef)([]);
	useFrame(() => {
		sim.mosques.forEach((e, i) => {
			const g = refs.current[i];
			if (!g) return;
			g.visible = e.active;
			if (!e.active) return;
			g.position.set(e.x, 0, e.z);
			g.scale.setScalar(e.scale);
			g.rotation.y = e.rot;
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: sim.mosques.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: (el) => {
			refs.current[i] = el;
		},
		visible: false,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.4,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					2.4,
					2.8,
					2.4
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d8c4a0" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					3.15,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1.05,
					12,
					10
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#c45c32",
					roughness: .45
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					1.35,
					2.6,
					1.35
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.16,
					.2,
					3.4,
					8
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#d8c4a0" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					1.35,
					4.4,
					1.35
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [
					.22,
					.5,
					8
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c45c32" })]
			})
		]
	}, i)) });
}
function GateVisual({ ent }) {
	const g = (0, import_react.useRef)(null);
	const mat = (0, import_react.useRef)(null);
	const last = (0, import_react.useRef)(-1);
	useFrame(() => {
		const n = g.current;
		if (!n) return;
		n.visible = ent.active;
		if (!ent.active) return;
		n.position.set(0, 0, ent.z);
		if (last.current !== ent.village) {
			last.current = ent.village;
			const v = villageAt(ent.village);
			const tex = makeSign(v.name, v.urdu, true);
			if (mat.current) {
				mat.current.map = tex;
				mat.current.needsUpdate = true;
			}
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: g,
		visible: false,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					-4.4,
					1.7,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.45,
					3.4,
					.45
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c2414" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					4.4,
					1.7,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.45,
					3.4,
					.45
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c2414" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					3.35,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					9.2,
					.35,
					.45
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#5c2414" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					2.72,
					.12
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [7.2, 1.55] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					ref: mat,
					color: "#ffffff",
					roughness: .6
				})]
			})
		]
	});
}
function BoardVisual({ ent }) {
	const g = (0, import_react.useRef)(null);
	const mat = (0, import_react.useRef)(null);
	const last = (0, import_react.useRef)(-1);
	useFrame(() => {
		const n = g.current;
		if (!n) return;
		n.visible = ent.active;
		if (!ent.active) return;
		n.position.set(ent.x, 0, ent.z);
		const s = ent.scale || 1;
		n.scale.setScalar(s);
		n.rotation.y = ent.x > 0 ? -.12 : .12;
		const id = ent.village * 10 + ent.variant;
		if (last.current !== id) {
			last.current = id;
			const v = villageAt(ent.village);
			const spot = landmarkAt(ent.village, ent.variant);
			const tex = makeBoard(v.name, spot.name, spot.urdu);
			if (mat.current) {
				mat.current.map = tex;
				mat.current.needsUpdate = true;
			}
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: g,
		visible: false,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.55,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.24,
					3.1,
					.24
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#3d4a36" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					3.25,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					5.4,
					2.55,
					.14
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#146c38" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					3.25,
					.09
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [5.1, 2.35] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					ref: mat,
					color: "#ffffff",
					roughness: .45
				})]
			})
		]
	});
}
function Walkers({ sim }) {
	const body = (0, import_react.useRef)(null);
	const lLeg = (0, import_react.useRef)(null);
	const rLeg = (0, import_react.useRef)(null);
	const head = (0, import_react.useRef)(null);
	useFrame(() => {
		if (body.current) parkInstances(body.current, 16);
		if (lLeg.current) parkInstances(lLeg.current, 16);
		if (rLeg.current) parkInstances(rLeg.current, 16);
		if (head.current) parkInstances(head.current, 16);
		let i = 0;
		for (const e of sim.walkers) {
			if (!e.active) continue;
			const s = e.scale;
			const swing = Math.sin(e.z * 2.4) * .55;
			dummy.position.set(e.x, .95 * s, e.z);
			dummy.scale.set(s, s, s);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			body.current?.setMatrixAt(i, dummy.matrix);
			dummy.position.set(e.x, 1.42 * s, e.z);
			dummy.scale.set(s, s, s);
			dummy.updateMatrix();
			head.current?.setMatrixAt(i, dummy.matrix);
			dummy.position.set(e.x - .1 * s, .42 * s, e.z);
			dummy.rotation.set(swing, 0, 0);
			dummy.scale.set(s, s, s);
			dummy.updateMatrix();
			lLeg.current?.setMatrixAt(i, dummy.matrix);
			dummy.position.set(e.x + .1 * s, .42 * s, e.z);
			dummy.rotation.set(-swing, 0, 0);
			dummy.updateMatrix();
			rLeg.current?.setMatrixAt(i, dummy.matrix);
			i++;
		}
		for (const mesh of [
			body.current,
			lLeg.current,
			rLeg.current,
			head.current
		]) {
			if (!mesh) continue;
			mesh.count = i;
			mesh.instanceMatrix.needsUpdate = true;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: body,
			args: [
				void 0,
				void 0,
				16
			],
			castShadow: true,
			frustumCulled: false,
			count: 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.22,
				.55,
				4,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#efe4d2",
				roughness: .8
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: head,
			args: [
				void 0,
				void 0,
				16
			],
			castShadow: true,
			frustumCulled: false,
			count: 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				.16,
				8,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#c9956c",
				roughness: .6
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: lLeg,
			args: [
				void 0,
				void 0,
				16
			],
			frustumCulled: false,
			count: 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.09,
				.38,
				3,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#e8dcc6" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
			ref: rLeg,
			args: [
				void 0,
				void 0,
				16
			],
			frustumCulled: false,
			count: 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.09,
				.38,
				3,
				6
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#e8dcc6" })]
		})
	] });
}
function Dust({ sim }) {
	const ref = (0, import_react.useRef)(null);
	const ages = (0, import_react.useMemo)(() => (/* @__PURE__ */ new Float32Array(40)).fill(0), []);
	useFrame((_, dt) => {
		const mesh = ref.current;
		if (!mesh) return;
		if (!sim.running || sim.dead || sim.paused) {
			mesh.visible = false;
			return;
		}
		mesh.visible = true;
		mesh.count = 40;
		for (let i = 0; i < 40; i++) {
			ages[i] += dt * (1.6 + i % 5 * .2);
			if (ages[i] > 1) ages[i] = 0;
			const a = ages[i];
			dummy.position.set(sim.x + (i % 7 - 3) * .07, .08 + a * .35, .55 + a * 1.8 + i % 4 * .08);
			dummy.scale.set(1, 1, 1);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			40
		],
		frustumCulled: false,
		count: 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			.07,
			5,
			4
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c4a882",
			transparent: true,
			opacity: .35,
			depthWrite: false
		})]
	});
}
function CameraRig({ sim }) {
	const { camera } = useThree();
	useFrame((_, dt) => {
		const k = 1 - Math.exp(-8 * dt);
		const run = sim.running && !sim.dead && sim.grounded ? 1 : 0;
		const bob = Math.abs(Math.sin(sim.distance * 2.05)) * .07 * run;
		const tx = sim.x * .38;
		const ty = 2.72 + sim.y * .22 + bob;
		const tz = 5.55;
		camera.position.x += (tx - camera.position.x) * k;
		camera.position.y += (ty - camera.position.y) * k;
		camera.position.z += (tz - camera.position.z) * k;
		if (sim.shake > 0) {
			const s = sim.shake * sim.shake;
			camera.position.x += (Math.random() - .5) * s * .45;
			camera.position.y += (Math.random() - .5) * s * .25;
		}
		camera.lookAt(sim.x * .55, 1.05 + sim.y * .28, -10.5);
		camera.rotation.z += (-sim.x * .03 - camera.rotation.z) * k;
		const cam = camera;
		if (cam.isPerspectiveCamera) {
			const fov = 62 + Math.min(10, Math.max(0, sim.speed - 13) * .5);
			cam.fov += (fov - cam.fov) * k;
			cam.updateProjectionMatrix();
		}
	});
	return null;
}
function GameWorld({ sim }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: ["#b99262"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				"#c5c48a",
				18,
				120
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sky, {
			sunPosition: [
				90,
				16,
				35
			],
			turbidity: 7,
			rayleigh: .7,
			mieCoefficient: .006,
			mieDirectionalG: .82
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			"#f0d8b0",
			"#5c6b3a",
			.72
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .28 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			castShadow: true,
			position: [
				22,
				30,
				10
			],
			intensity: 1.55,
			color: "#ffd4a0",
			"shadow-mapSize-width": 1024,
			"shadow-mapSize-height": 1024,
			"shadow-camera-near": 2,
			"shadow-camera-far": 70,
			"shadow-camera-left": -18,
			"shadow-camera-right": 18,
			"shadow-camera-top": 18,
			"shadow-camera-bottom": -18
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ground, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LaneMarks, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hills, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trees, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Houses, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fences, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mosques, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Walkers, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dust, { sim }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { sim }),
		sim.obstacles.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObstacleSlot, { ent: e }, i)),
		sim.gates.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GateVisual, { ent: e }, `g${i}`)),
		sim.boards.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardVisual, { ent: e }, `b${i}`))
	] });
}
var GAME_CODES = /* @__PURE__ */ new Set([
	"KeyA",
	"KeyD",
	"KeyS",
	"KeyW",
	"Space",
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"ControlLeft",
	"Escape"
]);
function Game() {
	const simRef = (0, import_react.useRef)(null);
	if (!simRef.current) simRef.current = new RunnerSim();
	const sim = simRef.current;
	const muted = useHud((s) => s.muted);
	const swipe = (0, import_react.useRef)(null);
	const uiAcc = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		useHud.getState().patch({ highScore: loadHighScore() });
	}, []);
	const play = (0, import_react.useCallback)(() => {
		unlockAudio();
		startMusic();
		sim.reset();
		useHud.getState().setScreen("playing");
		useHud.getState().patch({
			score: 0,
			coins: 0,
			distance: 0,
			village: "Shinka",
			villageUrdu: "شینکا",
			entering: "Shinka",
			villagesRun: ["Shinka"]
		});
	}, [sim]);
	const pause = (0, import_react.useCallback)(() => {
		if (sim.dead || !sim.running) return;
		sim.paused = true;
		pauseAnnounce();
		useHud.getState().setScreen("paused");
	}, [sim]);
	const resume = (0, import_react.useCallback)(() => {
		sim.paused = false;
		useHud.getState().setScreen("playing");
		resumeAudio();
		resumeAnnounce();
	}, [sim]);
	const tapLeft = (0, import_react.useCallback)(() => {
		sim.keys.add("KeyA");
		window.setTimeout(() => sim.keys.delete("KeyA"), 90);
	}, [sim]);
	const tapRight = (0, import_react.useCallback)(() => {
		sim.keys.add("KeyD");
		window.setTimeout(() => sim.keys.delete("KeyD"), 90);
	}, [sim]);
	const tapJump = (0, import_react.useCallback)(() => {
		sim.keys.add("Space");
		window.setTimeout(() => sim.keys.delete("Space"), 90);
	}, [sim]);
	const tapSlide = (0, import_react.useCallback)(() => {
		sim.keys.add("KeyS");
		window.setTimeout(() => sim.keys.delete("KeyS"), 90);
	}, [sim]);
	(0, import_react.useEffect)(() => {
		const onDown = (e) => {
			if (GAME_CODES.has(e.code)) e.preventDefault();
			const sc = useHud.getState().screen;
			if (e.code === "Escape") {
				if (sc === "playing") pause();
				else if (sc === "paused") resume();
				return;
			}
			sim.keys.add(e.code);
		};
		const onUp = (e) => {
			sim.keys.delete(e.code);
		};
		const clear = () => sim.keys.clear();
		const vis = () => {
			if (document.hidden && useHud.getState().screen === "playing") pause();
			else resumeAudio();
		};
		window.addEventListener("keydown", onDown);
		window.addEventListener("keyup", onUp);
		window.addEventListener("blur", clear);
		document.addEventListener("visibilitychange", vis);
		return () => {
			window.removeEventListener("keydown", onDown);
			window.removeEventListener("keyup", onUp);
			window.removeEventListener("blur", clear);
			document.removeEventListener("visibilitychange", vis);
		};
	}, [
		pause,
		resume,
		sim
	]);
	(0, import_react.useEffect)(() => {
		const w = window;
		w.__controlsTest = {
			getYaw: () => -sim.x,
			getSpeed: () => sim.running && !sim.paused ? sim.speed : 0,
			getX: () => sim.x,
			getLane: () => sim.lane,
			setKeys: (codes) => {
				sim.setInjected(codes);
				if ((codes.includes("KeyW") || codes.includes("KeyA") || codes.includes("KeyD")) && !sim.running) {
					sim.reset();
					useHud.getState().setScreen("playing");
				}
			},
			setSteer: (v) => {
				if (v > .2) sim.setInjected(["KeyA"]);
				else if (v < -.2) sim.setInjected(["KeyD"]);
				else sim.setInjected([]);
			}
		};
		return () => {
			delete w.__controlsTest;
		};
	}, [sim]);
	const onPointerDown = (e) => {
		if (useHud.getState().screen !== "playing") return;
		swipe.current = {
			x: e.clientX,
			y: e.clientY,
			id: e.pointerId
		};
	};
	const onPointerUp = (e) => {
		const s = swipe.current;
		swipe.current = null;
		if (!s || s.id !== e.pointerId || useHud.getState().screen !== "playing") return;
		const dx = e.clientX - s.x;
		const dy = e.clientY - s.y;
		if (Math.hypot(dx, dy) < 28) return;
		if (Math.abs(dx) > Math.abs(dy)) {
			if (dx < 0) tapLeft();
			else tapRight();
		} else if (dy < 0) tapJump();
		else tapSlide();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		style: { touchAction: "none" },
		onPointerDown,
		onPointerUp,
		onPointerCancel: () => {
			swipe.current = null;
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
			shadows: "percentage",
			dpr: [1, 1.5],
			camera: {
				fov: 64,
				position: [
					0,
					2.75,
					5.6
				],
				near: .1,
				far: 220
			},
			gl: {
				antialias: true,
				alpha: false,
				powerPreference: "high-performance"
			},
			onCreated: ({ gl }) => {
				gl.toneMapping = 4;
				gl.toneMappingExposure = 1.12;
				gl.setClearColor("#b99262");
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimLoop, {
				sim,
				uiAcc
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameWorld, { sim })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudBridge, {
			muted,
			onPlay: play,
			onPause: pause,
			onResume: resume,
			onMute: () => {
				const next = !isMuted();
				setMuted(next);
				useHud.getState().patch({ muted: next });
			},
			onLeft: tapLeft,
			onRight: tapRight,
			onJump: tapJump,
			onSlide: tapSlide
		})]
	});
}
function HudBridge(props) {
	const hud = useHud();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {
		screen: hud.screen,
		score: hud.score,
		coins: hud.coins,
		distance: hud.distance,
		highScore: hud.highScore,
		village: hud.village,
		villageUrdu: hud.villageUrdu,
		entering: hud.entering,
		villagesRun: hud.villagesRun,
		...props
	});
}
function SimLoop({ sim, uiAcc }) {
	useFrame((_, dt) => {
		if (useHud.getState().screen === "playing") sim.step(dt);
		uiAcc.current += dt;
		if (uiAcc.current > .08 || sim.dead || sim.enterPulse > 1.5) {
			uiAcc.current = 0;
			const s = sim.snap();
			useHud.getState().patch({
				score: s.score,
				coins: s.coins,
				distance: s.distance,
				highScore: sim.highScore,
				village: s.village.name,
				villageUrdu: s.village.urdu,
				entering: s.entering,
				villagesRun: s.villagesRun
			});
			if (s.dead && useHud.getState().screen === "playing") useHud.getState().setScreen("dead");
		}
	});
	return null;
}
//#endregion
export { Game };
