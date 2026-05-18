import e from "node:path";
import { BrowserWindow as t, Menu as n, Tray as r, app as i, desktopCapturer as a, dialog as o, globalShortcut as s, ipcMain as c, nativeImage as l, nativeTheme as u, net as d, protocol as f, screen as p, session as m, shell as h, systemPreferences as g } from "electron";
import _ from "electron-log";
import v from "electron-updater";
import { existsSync as y, readFileSync as b } from "node:fs";
import { copyFile as x, readFile as S, rename as C, writeFile as w } from "node:fs/promises";
import T from "node:os";
import { fileURLToPath as E, pathToFileURL as ee } from "node:url";
import { Readable as D } from "node:stream";
import { StreamingTranscriber as te } from "assemblyai";
import { spawn as ne } from "child_process";
import { EventEmitter as re } from "events";
import ie, { join as O } from "path";
import { fileURLToPath as ae } from "url";
import oe from "node-record-lpcm16";
import k from "@recallai/desktop-sdk";
import { electronAppUniversalProtocolClient as se } from "electron-app-universal-protocol-client";
//#region \0rolldown/runtime.js
var ce = Object.create, le = Object.defineProperty, ue = Object.getOwnPropertyDescriptor, de = Object.getOwnPropertyNames, fe = Object.getPrototypeOf, pe = Object.prototype.hasOwnProperty, A = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), j = (e, t) => {
	let n = {};
	for (var r in e) le(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || le(n, Symbol.toStringTag, { value: "Module" }), n;
}, me = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = de(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !pe.call(e, s) && s !== n && le(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = ue(t, s)) || r.enumerable
	});
	return e;
}, he = (e, t, n) => (n = e == null ? {} : ce(fe(e)), me(t || !e || !e.__esModule ? le(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), M = {
	BASE_URL: "/",
	DEV: !1,
	MODE: "production",
	PROD: !0,
	SSR: !1,
	VITE_CLERK_PUBLISHABLE_KEY: "pk_live_Y2xlcmsuY2x1ZWx5LmNvbSQ",
	VITE_DESKTOP_GLASS_RELEASES_DOMAIN: "desktop-glass-releases.v2.cluely.com",
	VITE_DESKTOP_PRODUCT_NAME: "Cluely",
	VITE_DESKTOP_RELEASES_DOMAIN: "desktop-releases.v2.cluely.com",
	VITE_DESKTOP_SCHEME: "cluely-v2",
	VITE_IS_PROD: "true",
	VITE_POSTHOG_PROJECT_TOKEN: "phc_1H7N4xZ65F4qTKvt0AHNteFM6lS9tz2PNwZEEdivjox",
	VITE_RENDERER_URL: "https://renderer.v2.cluely.com",
	VITE_REVENUECAT_WEB_PUBLIC_API_KEY: "rcb_grFIIrbOEZADTZUPAOTptHACmYDR",
	VITE_SERVER_URL: "https://api.v2.cluely.com",
	VITE_WEB_URL: "https://v2.cluely.com"
}, ge = new URL(M.VITE_RENDERER_URL).hostname === "localhost";
//#endregion
//#region ../../node_modules/.pnpm/radashi@12.7.2/node_modules/radashi/dist/radashi.js
function _e(e, t) {
	if (t) {
		let n = /* @__PURE__ */ new Set();
		return e.reduce((e, r) => {
			let i = t(r);
			return n.has(i) || (n.add(i), e.push(r)), e;
		}, []);
	}
	return [...new Set(e)];
}
async function ve(e, t) {
	let n = e?.times ?? 3, r = e?.delay, i = e?.backoff ?? null, a = e?.signal, o = 0;
	for (;;) {
		let [e, s] = await be(t)((e) => {
			throw { _exited: e };
		});
		if (a?.throwIfAborted(), !e) return s;
		if (e._exited) throw e._exited;
		if (++o >= n) throw e;
		r && await ye(r), i && await ye(i(o));
	}
}
function ye(e) {
	return new Promise((t) => setTimeout(t, e));
}
function be(e) {
	return (...t) => {
		try {
			let n = e(...t);
			return Ce(n) ? n.then((e) => [void 0, e], (e) => [e, void 0]) : [void 0, n];
		} catch (e) {
			return [e, void 0];
		}
	};
}
function xe({ delay: e, leading: t }, n) {
	let r, i = !0, a = (...a) => {
		i ? (clearTimeout(r), r = setTimeout(() => {
			i && n(...a), r = void 0;
		}, e), t &&= (n(...a), !1)) : n(...a);
	};
	return a.isPending = () => r !== void 0, a.cancel = () => {
		i = !1;
	}, a.flush = (...e) => n(...e), a;
}
globalThis.AggregateError, Array.isArray;
function Se(e, t) {
	if (Object.is(e, t)) return !0;
	if (e instanceof Date && t instanceof Date) return e.getTime() === t.getTime();
	if (e instanceof RegExp && t instanceof RegExp) return e.toString() === t.toString();
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = Reflect.ownKeys(e), r = Reflect.ownKeys(t);
	if (n.length !== r.length) return !1;
	for (let r = 0; r < n.length; r++) if (!Reflect.has(t, n[r]) || !Se(e[n[r]], t[n[r]])) return !1;
	return !0;
}
function N(e) {
	return typeof e == "function";
}
Number.isInteger;
function Ce(e) {
	return !!e && N(e.then);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/core.js
var we = Object.freeze({ status: "aborted" });
function P(e, t, n) {
	function r(n, r) {
		if (n._zod || Object.defineProperty(n, "_zod", {
			value: {
				def: r,
				constr: o,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: !1
		}), n._zod.traits.has(e)) return;
		n._zod.traits.add(e), t(n, r);
		let i = o.prototype, a = Object.keys(i);
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			t in n || (n[t] = i[t].bind(n));
		}
	}
	let i = n?.Parent ?? Object;
	class a extends i {}
	Object.defineProperty(a, "name", { value: e });
	function o(e) {
		var t;
		let i = n?.Parent ? new a() : this;
		r(i, e), (t = i._zod).deferred ?? (t.deferred = []);
		for (let e of i._zod.deferred) e();
		return i;
	}
	return Object.defineProperty(o, "init", { value: r }), Object.defineProperty(o, Symbol.hasInstance, { value: (t) => n?.Parent && t instanceof n.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(o, "name", { value: e }), o;
}
var Te = Symbol("zod_brand"), Ee = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, De = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
}, Oe = {};
function F(e) {
	return e && Object.assign(Oe, e), Oe;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/util.js
var ke = /* @__PURE__ */ j({
	BIGINT_FORMAT_RANGES: () => dt,
	Class: () => Nt,
	NUMBER_FORMAT_RANGES: () => ut,
	aborted: () => yt,
	allowsEval: () => $e,
	assert: () => Pe,
	assertEqual: () => Ae,
	assertIs: () => Me,
	assertNever: () => Ne,
	assertNotEqual: () => je,
	assignProp: () => Ue,
	base64ToUint8Array: () => Dt,
	base64urlToUint8Array: () => kt,
	cached: () => Le,
	captureStackTrace: () => Ze,
	cleanEnum: () => Et,
	cleanRegex: () => ze,
	clone: () => st,
	cloneDef: () => Ge,
	createTransparentProxy: () => ct,
	defineLazy: () => L,
	esc: () => Ye,
	escapeRegex: () => ot,
	extend: () => mt,
	finalizeIssue: () => St,
	floatSafeRemainder: () => Be,
	getElementAtPath: () => Ke,
	getEnumValues: () => Fe,
	getLengthableOrigin: () => wt,
	getParsedType: () => rt,
	getSizableOrigin: () => Ct,
	hexToUint8Array: () => jt,
	isObject: () => Qe,
	isPlainObject: () => et,
	issue: () => Tt,
	joinValues: () => I,
	jsonStringifyReplacer: () => Ie,
	merge: () => gt,
	mergeDefs: () => We,
	normalizeParams: () => R,
	nullish: () => Re,
	numKeys: () => nt,
	objectClone: () => He,
	omit: () => pt,
	optionalKeys: () => lt,
	partial: () => _t,
	pick: () => ft,
	prefixIssues: () => bt,
	primitiveTypes: () => at,
	promiseAllObject: () => qe,
	propertyKeyTypes: () => it,
	randomString: () => Je,
	required: () => vt,
	safeExtend: () => ht,
	shallowClone: () => tt,
	slugify: () => Xe,
	stringifyPrimitive: () => z,
	uint8ArrayToBase64: () => Ot,
	uint8ArrayToBase64url: () => At,
	uint8ArrayToHex: () => Mt,
	unwrapMessage: () => xt
});
function Ae(e) {
	return e;
}
function je(e) {
	return e;
}
function Me(e) {}
function Ne(e) {
	throw Error("Unexpected value in exhaustive check");
}
function Pe(e) {}
function Fe(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function I(e, t = "|") {
	return e.map((e) => z(e)).join(t);
}
function Ie(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
function Le(e) {
	return { get value() {
		{
			let t = e();
			return Object.defineProperty(this, "value", { value: t }), t;
		}
		throw Error("cached value already set");
	} };
}
function Re(e) {
	return e == null;
}
function ze(e) {
	let t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function Be(e, t) {
	let n = (e.toString().split(".")[1] || "").length, r = t.toString(), i = (r.split(".")[1] || "").length;
	if (i === 0 && /\d?e-\d?/.test(r)) {
		let e = r.match(/\d?e-(\d?)/);
		e?.[1] && (i = Number.parseInt(e[1]));
	}
	let a = n > i ? n : i;
	return Number.parseInt(e.toFixed(a).replace(".", "")) % Number.parseInt(t.toFixed(a).replace(".", "")) / 10 ** a;
}
var Ve = Symbol("evaluating");
function L(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== Ve) return r === void 0 && (r = Ve, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function He(e) {
	return Object.create(Object.getPrototypeOf(e), Object.getOwnPropertyDescriptors(e));
}
function Ue(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function We(...e) {
	let t = {};
	for (let n of e) Object.assign(t, Object.getOwnPropertyDescriptors(n));
	return Object.defineProperties({}, t);
}
function Ge(e) {
	return We(e._zod.def);
}
function Ke(e, t) {
	return t ? t.reduce((e, t) => e?.[t], e) : e;
}
function qe(e) {
	let t = Object.keys(e), n = t.map((t) => e[t]);
	return Promise.all(n).then((e) => {
		let n = {};
		for (let r = 0; r < t.length; r++) n[t[r]] = e[r];
		return n;
	});
}
function Je(e = 10) {
	let t = "";
	for (let n = 0; n < e; n++) t += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
	return t;
}
function Ye(e) {
	return JSON.stringify(e);
}
function Xe(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var Ze = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Qe(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var $e = Le(() => {
	if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function et(e) {
	if (Qe(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return !(Qe(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function tt(e) {
	return et(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
function nt(e) {
	let t = 0;
	for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && t++;
	return t;
}
var rt = (e) => {
	let t = typeof e;
	switch (t) {
		case "undefined": return "undefined";
		case "string": return "string";
		case "number": return Number.isNaN(e) ? "nan" : "number";
		case "boolean": return "boolean";
		case "function": return "function";
		case "bigint": return "bigint";
		case "symbol": return "symbol";
		case "object": return Array.isArray(e) ? "array" : e === null ? "null" : e.then && typeof e.then == "function" && e.catch && typeof e.catch == "function" ? "promise" : typeof Map < "u" && e instanceof Map ? "map" : typeof Set < "u" && e instanceof Set ? "set" : typeof Date < "u" && e instanceof Date ? "date" : typeof File < "u" && e instanceof File ? "file" : "object";
		default: throw Error(`Unknown data type: ${t}`);
	}
}, it = new Set([
	"string",
	"number",
	"symbol"
]), at = new Set([
	"string",
	"number",
	"bigint",
	"boolean",
	"symbol",
	"undefined"
]);
function ot(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function st(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function R(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function ct(e) {
	let t;
	return new Proxy({}, {
		get(n, r, i) {
			return t ??= e(), Reflect.get(t, r, i);
		},
		set(n, r, i, a) {
			return t ??= e(), Reflect.set(t, r, i, a);
		},
		has(n, r) {
			return t ??= e(), Reflect.has(t, r);
		},
		deleteProperty(n, r) {
			return t ??= e(), Reflect.deleteProperty(t, r);
		},
		ownKeys(n) {
			return t ??= e(), Reflect.ownKeys(t);
		},
		getOwnPropertyDescriptor(n, r) {
			return t ??= e(), Reflect.getOwnPropertyDescriptor(t, r);
		},
		defineProperty(n, r, i) {
			return t ??= e(), Reflect.defineProperty(t, r, i);
		}
	});
}
function z(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function lt(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
var ut = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, dt = {
	int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function ft(e, t) {
	let n = e._zod.def;
	return st(e, We(e._zod.def, {
		get shape() {
			let e = {};
			for (let r in t) {
				if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
				t[r] && (e[r] = n.shape[r]);
			}
			return Ue(this, "shape", e), e;
		},
		checks: []
	}));
}
function pt(e, t) {
	let n = e._zod.def;
	return st(e, We(e._zod.def, {
		get shape() {
			let r = { ...e._zod.def.shape };
			for (let e in t) {
				if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
				t[e] && delete r[e];
			}
			return Ue(this, "shape", r), r;
		},
		checks: []
	}));
}
function mt(e, t) {
	if (!et(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) throw Error("Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.");
	return st(e, We(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t
			};
			return Ue(this, "shape", n), n;
		},
		checks: []
	}));
}
function ht(e, t) {
	if (!et(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return st(e, {
		...e._zod.def,
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t
			};
			return Ue(this, "shape", n), n;
		},
		checks: e._zod.def.checks
	});
}
function gt(e, t) {
	return st(e, We(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t._zod.def.shape
			};
			return Ue(this, "shape", n), n;
		},
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: []
	}));
}
function _t(e, t, n) {
	return st(t, We(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = e ? new e({
					type: "optional",
					innerType: r[t]
				}) : r[t]);
			}
			else for (let t in r) i[t] = e ? new e({
				type: "optional",
				innerType: r[t]
			}) : r[t];
			return Ue(this, "shape", i), i;
		},
		checks: []
	}));
}
function vt(e, t, n) {
	return st(t, We(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = new e({
					type: "nonoptional",
					innerType: r[t]
				}));
			}
			else for (let t in r) i[t] = new e({
				type: "nonoptional",
				innerType: r[t]
			});
			return Ue(this, "shape", i), i;
		},
		checks: []
	}));
}
function yt(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function bt(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function xt(e) {
	return typeof e == "string" ? e : e?.message;
}
function St(e, t, n) {
	let r = {
		...e,
		path: e.path ?? []
	};
	return e.message || (r.message = xt(e.inst?._zod.def?.error?.(e)) ?? xt(t?.error?.(e)) ?? xt(n.customError?.(e)) ?? xt(n.localeError?.(e)) ?? "Invalid input"), delete r.inst, delete r.continue, t?.reportInput || delete r.input, r;
}
function Ct(e) {
	return e instanceof Set ? "set" : e instanceof Map ? "map" : e instanceof File ? "file" : "unknown";
}
function wt(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Tt(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Et(e) {
	return Object.entries(e).filter(([e, t]) => Number.isNaN(Number.parseInt(e, 10))).map((e) => e[1]);
}
function Dt(e) {
	let t = atob(e), n = new Uint8Array(t.length);
	for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e);
	return n;
}
function Ot(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) t += String.fromCharCode(e[n]);
	return btoa(t);
}
function kt(e) {
	let t = e.replace(/-/g, "+").replace(/_/g, "/");
	return Dt(t + "=".repeat((4 - t.length % 4) % 4));
}
function At(e) {
	return Ot(e).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function jt(e) {
	let t = e.replace(/^0x/, "");
	if (t.length % 2 != 0) throw Error("Invalid hex string length");
	let n = new Uint8Array(t.length / 2);
	for (let e = 0; e < t.length; e += 2) n[e / 2] = Number.parseInt(t.slice(e, e + 2), 16);
	return n;
}
function Mt(e) {
	return Array.from(e).map((e) => e.toString(16).padStart(2, "0")).join("");
}
var Nt = class {
	constructor(...e) {}
}, Pt = (e, t) => {
	e.name = "$ZodError", Object.defineProperty(e, "_zod", {
		value: e._zod,
		enumerable: !1
	}), Object.defineProperty(e, "issues", {
		value: t,
		enumerable: !1
	}), e.message = JSON.stringify(t, Ie, 2), Object.defineProperty(e, "toString", {
		value: () => e.message,
		enumerable: !1
	});
}, Ft = P("$ZodError", Pt), It = P("$ZodError", Pt, { Parent: Error });
function Lt(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Rt(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e) => {
		for (let i of e.issues) if (i.code === "invalid_union" && i.errors.length) i.errors.map((e) => r({ issues: e }));
		else if (i.code === "invalid_key") r({ issues: i.issues });
		else if (i.code === "invalid_element") r({ issues: i.issues });
		else if (i.path.length === 0) n._errors.push(t(i));
		else {
			let e = n, r = 0;
			for (; r < i.path.length;) {
				let n = i.path[r];
				r === i.path.length - 1 ? (e[n] = e[n] || { _errors: [] }, e[n]._errors.push(t(i))) : e[n] = e[n] || { _errors: [] }, e = e[n], r++;
			}
		}
	};
	return r(e), n;
}
function zt(e, t = (e) => e.message) {
	let n = { errors: [] }, r = (e, i = []) => {
		var a, o;
		for (let s of e.issues) if (s.code === "invalid_union" && s.errors.length) s.errors.map((e) => r({ issues: e }, s.path));
		else if (s.code === "invalid_key") r({ issues: s.issues }, s.path);
		else if (s.code === "invalid_element") r({ issues: s.issues }, s.path);
		else {
			let e = [...i, ...s.path];
			if (e.length === 0) {
				n.errors.push(t(s));
				continue;
			}
			let r = n, c = 0;
			for (; c < e.length;) {
				let n = e[c], i = c === e.length - 1;
				typeof n == "string" ? (r.properties ??= {}, (a = r.properties)[n] ?? (a[n] = { errors: [] }), r = r.properties[n]) : (r.items ??= [], (o = r.items)[n] ?? (o[n] = { errors: [] }), r = r.items[n]), i && r.errors.push(t(s)), c++;
			}
		}
	};
	return r(e), n;
}
function Bt(e) {
	let t = [], n = e.map((e) => typeof e == "object" ? e.key : e);
	for (let e of n) typeof e == "number" ? t.push(`[${e}]`) : typeof e == "symbol" ? t.push(`[${JSON.stringify(String(e))}]`) : /[^\w$]/.test(e) ? t.push(`[${JSON.stringify(e)}]`) : (t.length && t.push("."), t.push(e));
	return t.join("");
}
function Vt(e) {
	let t = [], n = [...e.issues].sort((e, t) => (e.path ?? []).length - (t.path ?? []).length);
	for (let e of n) t.push(`✖ ${e.message}`), e.path?.length && t.push(`  → at ${Bt(e.path)}`);
	return t.join("\n");
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/parse.js
var Ht = (e) => (t, n, r, i) => {
	let a = r ? Object.assign(r, { async: !1 }) : { async: !1 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise) throw new Ee();
	if (o.issues.length) {
		let t = new (i?.Err ?? e)(o.issues.map((e) => St(e, a, F())));
		throw Ze(t, i?.callee), t;
	}
	return o.value;
}, Ut = /* @__PURE__ */ Ht(It), Wt = (e) => async (t, n, r, i) => {
	let a = r ? Object.assign(r, { async: !0 }) : { async: !0 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise && (o = await o), o.issues.length) {
		let t = new (i?.Err ?? e)(o.issues.map((e) => St(e, a, F())));
		throw Ze(t, i?.callee), t;
	}
	return o.value;
}, Gt = /* @__PURE__ */ Wt(It), Kt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new Ee();
	return a.issues.length ? {
		success: !1,
		error: new (e ?? Ft)(a.issues.map((e) => St(e, i, F())))
	} : {
		success: !0,
		data: a.value
	};
}, qt = /* @__PURE__ */ Kt(It), Jt = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { async: !0 }) : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? {
		success: !1,
		error: new e(a.issues.map((e) => St(e, i, F())))
	} : {
		success: !0,
		data: a.value
	};
}, Yt = /* @__PURE__ */ Jt(It), Xt = (e) => (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Ht(e)(t, n, i);
}, Zt = /* @__PURE__ */ Xt(It), Qt = (e) => (t, n, r) => Ht(e)(t, n, r), $t = /* @__PURE__ */ Qt(It), en = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Wt(e)(t, n, i);
}, tn = /* @__PURE__ */ en(It), nn = (e) => async (t, n, r) => Wt(e)(t, n, r), rn = /* @__PURE__ */ nn(It), an = (e) => (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Kt(e)(t, n, i);
}, on = /* @__PURE__ */ an(It), sn = (e) => (t, n, r) => Kt(e)(t, n, r), cn = /* @__PURE__ */ sn(It), ln = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Jt(e)(t, n, i);
}, un = /* @__PURE__ */ ln(It), dn = (e) => async (t, n, r) => Jt(e)(t, n, r), fn = /* @__PURE__ */ dn(It), pn = /* @__PURE__ */ j({
	base64: () => Bn,
	base64url: () => Vn,
	bigint: () => Zn,
	boolean: () => er,
	browserEmail: () => Mn,
	cidrv4: () => Rn,
	cidrv6: () => zn,
	cuid: () => mn,
	cuid2: () => hn,
	date: () => Kn,
	datetime: () => Yn,
	domain: () => Un,
	duration: () => bn,
	e164: () => Wn,
	email: () => Dn,
	emoji: () => Pn,
	extendedDuration: () => xn,
	guid: () => Sn,
	hex: () => ar,
	hostname: () => Hn,
	html5Email: () => On,
	idnEmail: () => jn,
	integer: () => Qn,
	ipv4: () => Fn,
	ipv6: () => In,
	ksuid: () => vn,
	lowercase: () => rr,
	mac: () => Ln,
	md5_base64: () => lr,
	md5_base64url: () => ur,
	md5_hex: () => cr,
	nanoid: () => yn,
	null: () => tr,
	number: () => $n,
	rfc5322Email: () => kn,
	sha1_base64: () => fr,
	sha1_base64url: () => pr,
	sha1_hex: () => dr,
	sha256_base64: () => hr,
	sha256_base64url: () => gr,
	sha256_hex: () => mr,
	sha384_base64: () => vr,
	sha384_base64url: () => yr,
	sha384_hex: () => _r,
	sha512_base64: () => xr,
	sha512_base64url: () => Sr,
	sha512_hex: () => br,
	string: () => Xn,
	time: () => Jn,
	ulid: () => gn,
	undefined: () => nr,
	unicodeEmail: () => An,
	uppercase: () => ir,
	uuid: () => Cn,
	uuid4: () => wn,
	uuid6: () => Tn,
	uuid7: () => En,
	xid: () => _n
}), mn = /^[cC][^\s-]{8,}$/, hn = /^[0-9a-z]+$/, gn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, _n = /^[0-9a-vA-V]{20}$/, vn = /^[A-Za-z0-9]{27}$/, yn = /^[a-zA-Z0-9_-]{21}$/, bn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, xn = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, Sn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Cn = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, wn = /* @__PURE__ */ Cn(4), Tn = /* @__PURE__ */ Cn(6), En = /* @__PURE__ */ Cn(7), Dn = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, On = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, kn = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, An = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u, jn = An, Mn = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, Nn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Pn() {
	return new RegExp(Nn, "u");
}
var Fn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, In = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Ln = (e) => {
	let t = ot(e ?? ":");
	return RegExp(`^(?:[0-9A-F]{2}${t}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${t}){5}[0-9a-f]{2}$`);
}, Rn = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, zn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Bn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Vn = /^[A-Za-z0-9_-]*$/, Hn = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/, Un = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, Wn = /^\+(?:[0-9]){6,14}[0-9]$/, Gn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Kn = /* @__PURE__ */ RegExp(`^${Gn}$`);
function qn(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Jn(e) {
	return RegExp(`^${qn(e)}$`);
}
function Yn(e) {
	let t = qn({ precision: e.precision }), n = ["Z"];
	e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let r = `${t}(?:${n.join("|")})`;
	return RegExp(`^${Gn}T(?:${r})$`);
}
var Xn = (e) => {
	let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
	return RegExp(`^${t}$`);
}, Zn = /^-?\d+n?$/, Qn = /^-?\d+$/, $n = /^-?\d+(?:\.\d+)?/, er = /^(?:true|false)$/i, tr = /^null$/i, nr = /^undefined$/i, rr = /^[^A-Z]*$/, ir = /^[^a-z]*$/, ar = /^[0-9a-fA-F]*$/;
function or(e, t) {
	return RegExp(`^[A-Za-z0-9+/]{${e}}${t}$`);
}
function sr(e) {
	return RegExp(`^[A-Za-z0-9_-]{${e}}$`);
}
var cr = /^[0-9a-fA-F]{32}$/, lr = /* @__PURE__ */ or(22, "=="), ur = /* @__PURE__ */ sr(22), dr = /^[0-9a-fA-F]{40}$/, fr = /* @__PURE__ */ or(27, "="), pr = /* @__PURE__ */ sr(27), mr = /^[0-9a-fA-F]{64}$/, hr = /* @__PURE__ */ or(43, "="), gr = /* @__PURE__ */ sr(43), _r = /^[0-9a-fA-F]{96}$/, vr = /* @__PURE__ */ or(64, ""), yr = /* @__PURE__ */ sr(64), br = /^[0-9a-fA-F]{128}$/, xr = /* @__PURE__ */ or(86, "=="), Sr = /* @__PURE__ */ sr(86), B = /* @__PURE__ */ P("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Cr = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, wr = /* @__PURE__ */ P("$ZodCheckLessThan", (e, t) => {
	B.init(e, t);
	let n = Cr[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.maximum : n.exclusiveMaximum) ?? Infinity;
		t.value < r && (t.inclusive ? n.maximum = t.value : n.exclusiveMaximum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: n,
			code: "too_big",
			maximum: t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Tr = /* @__PURE__ */ P("$ZodCheckGreaterThan", (e, t) => {
	B.init(e, t);
	let n = Cr[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.minimum : n.exclusiveMinimum) ?? -Infinity;
		t.value > r && (t.inclusive ? n.minimum = t.value : n.exclusiveMinimum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: n,
			code: "too_small",
			minimum: t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Er = /* @__PURE__ */ P("$ZodCheckMultipleOf", (e, t) => {
	B.init(e, t), e._zod.onattach.push((e) => {
		var n;
		(n = e._zod.bag).multipleOf ?? (n.multipleOf = t.value);
	}), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Be(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Dr = /* @__PURE__ */ P("$ZodCheckNumberFormat", (e, t) => {
	B.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = ut[t.format];
	e._zod.onattach.push((e) => {
		let r = e._zod.bag;
		r.format = t.format, r.minimum = i, r.maximum = a, n && (r.pattern = Qn);
	}), e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inst: e
		});
	};
}), Or = /* @__PURE__ */ P("$ZodCheckBigIntFormat", (e, t) => {
	B.init(e, t);
	let [n, r] = dt[t.format];
	e._zod.onattach.push((e) => {
		let i = e._zod.bag;
		i.format = t.format, i.minimum = n, i.maximum = r;
	}), e._zod.check = (i) => {
		let a = i.value;
		a < n && i.issues.push({
			origin: "bigint",
			input: a,
			code: "too_small",
			minimum: n,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), a > r && i.issues.push({
			origin: "bigint",
			input: a,
			code: "too_big",
			maximum: r,
			inst: e
		});
	};
}), kr = /* @__PURE__ */ P("$ZodCheckMaxSize", (e, t) => {
	var n;
	B.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Re(t) && t.size !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		r.size <= t.maximum || n.issues.push({
			origin: Ct(r),
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Ar = /* @__PURE__ */ P("$ZodCheckMinSize", (e, t) => {
	var n;
	B.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Re(t) && t.size !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		r.size >= t.minimum || n.issues.push({
			origin: Ct(r),
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), jr = /* @__PURE__ */ P("$ZodCheckSizeEquals", (e, t) => {
	var n;
	B.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Re(t) && t.size !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.size, n.maximum = t.size, n.size = t.size;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.size;
		if (i === t.size) return;
		let a = i > t.size;
		n.issues.push({
			origin: Ct(r),
			...a ? {
				code: "too_big",
				maximum: t.size
			} : {
				code: "too_small",
				minimum: t.size
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Mr = /* @__PURE__ */ P("$ZodCheckMaxLength", (e, t) => {
	var n;
	B.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Re(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length <= t.maximum) return;
		let i = wt(r);
		n.issues.push({
			origin: i,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Nr = /* @__PURE__ */ P("$ZodCheckMinLength", (e, t) => {
	var n;
	B.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Re(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length >= t.minimum) return;
		let i = wt(r);
		n.issues.push({
			origin: i,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Pr = /* @__PURE__ */ P("$ZodCheckLengthEquals", (e, t) => {
	var n;
	B.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !Re(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.length, n.maximum = t.length, n.length = t.length;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if (i === t.length) return;
		let a = wt(r), o = i > t.length;
		n.issues.push({
			origin: a,
			...o ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Fr = /* @__PURE__ */ P("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	B.init(e, t), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, t.pattern && (n.patterns ??= /* @__PURE__ */ new Set(), n.patterns.add(t.pattern));
	}), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), Ir = /* @__PURE__ */ P("$ZodCheckRegex", (e, t) => {
	Fr.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), Lr = /* @__PURE__ */ P("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= rr, Fr.init(e, t);
}), Rr = /* @__PURE__ */ P("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= ir, Fr.init(e, t);
}), zr = /* @__PURE__ */ P("$ZodCheckIncludes", (e, t) => {
	B.init(e, t);
	let n = ot(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
	t.pattern = r, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(r);
	}), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Br = /* @__PURE__ */ P("$ZodCheckStartsWith", (e, t) => {
	B.init(e, t);
	let n = RegExp(`^${ot(t.prefix)}.*`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Vr = /* @__PURE__ */ P("$ZodCheckEndsWith", (e, t) => {
	B.init(e, t);
	let n = RegExp(`.*${ot(t.suffix)}$`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Hr(e, t, n) {
	e.issues.length && t.issues.push(...bt(n, e.issues));
}
var Ur = /* @__PURE__ */ P("$ZodCheckProperty", (e, t) => {
	B.init(e, t), e._zod.check = (e) => {
		let n = t.schema._zod.run({
			value: e.value[t.property],
			issues: []
		}, {});
		if (n instanceof Promise) return n.then((n) => Hr(n, e, t.property));
		Hr(n, e, t.property);
	};
}), Wr = /* @__PURE__ */ P("$ZodCheckMimeType", (e, t) => {
	B.init(e, t);
	let n = new Set(t.mime);
	e._zod.onattach.push((e) => {
		e._zod.bag.mime = t.mime;
	}), e._zod.check = (r) => {
		n.has(r.value.type) || r.issues.push({
			code: "invalid_value",
			values: t.mime,
			input: r.value.type,
			inst: e,
			continue: !t.abort
		});
	};
}), Gr = /* @__PURE__ */ P("$ZodCheckOverwrite", (e, t) => {
	B.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Kr = class {
	constructor(e = []) {
		this.content = [], this.indent = 0, this && (this.args = e);
	}
	indented(e) {
		this.indent += 1, e(this), --this.indent;
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.args, n = [...(this?.content ?? [""]).map((e) => `  ${e}`)];
		return new e(...t, n.join("\n"));
	}
}, qr = {
	major: 4,
	minor: 2,
	patch: 1
}, V = /* @__PURE__ */ P("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = qr;
	let r = [...e._zod.def.checks ?? []];
	e._zod.traits.has("$ZodCheck") && r.unshift(e);
	for (let t of r) for (let n of t._zod.onattach) n(e);
	if (r.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (e, t, n) => {
			let r = yt(e), i;
			for (let a of t) {
				if (a._zod.def.when) {
					if (!a._zod.def.when(e)) continue;
				} else if (r) continue;
				let t = e.issues.length, o = a._zod.check(e);
				if (o instanceof Promise && n?.async === !1) throw new Ee();
				if (i || o instanceof Promise) i = (i ?? Promise.resolve()).then(async () => {
					await o, e.issues.length !== t && (r ||= yt(e, t));
				});
				else {
					if (e.issues.length === t) continue;
					r ||= yt(e, t);
				}
			}
			return i ? i.then(() => e) : e;
		}, n = (n, i, a) => {
			if (yt(n)) return n.aborted = !0, n;
			let o = t(i, r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new Ee();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (i, a) => {
			if (a.skipChecks) return e._zod.parse(i, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: i.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, i, a)) : n(t, i, a);
			}
			let o = e._zod.parse(i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new Ee();
				return o.then((e) => t(e, r, a));
			}
			return t(o, r, a);
		};
	}
	e["~standard"] = {
		validate: (t) => {
			try {
				let n = qt(e, t);
				return n.success ? { value: n.data } : { issues: n.error?.issues };
			} catch {
				return Yt(e, t).then((e) => e.success ? { value: e.data } : { issues: e.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	};
}), Jr = /* @__PURE__ */ P("$ZodString", (e, t) => {
	V.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? Xn(e._zod.bag), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), H = /* @__PURE__ */ P("$ZodStringFormat", (e, t) => {
	Fr.init(e, t), Jr.init(e, t);
}), Yr = /* @__PURE__ */ P("$ZodGUID", (e, t) => {
	t.pattern ??= Sn, H.init(e, t);
}), Xr = /* @__PURE__ */ P("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= Cn(e);
	} else t.pattern ??= Cn();
	H.init(e, t);
}), Zr = /* @__PURE__ */ P("$ZodEmail", (e, t) => {
	t.pattern ??= Dn, H.init(e, t);
}), Qr = /* @__PURE__ */ P("$ZodURL", (e, t) => {
	H.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = new URL(r);
			t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(i.hostname) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(i.protocol.endsWith(":") ? i.protocol.slice(0, -1) : i.protocol) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.normalize ? n.value = i.href : n.value = r;
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), $r = /* @__PURE__ */ P("$ZodEmoji", (e, t) => {
	t.pattern ??= Pn(), H.init(e, t);
}), ei = /* @__PURE__ */ P("$ZodNanoID", (e, t) => {
	t.pattern ??= yn, H.init(e, t);
}), ti = /* @__PURE__ */ P("$ZodCUID", (e, t) => {
	t.pattern ??= mn, H.init(e, t);
}), ni = /* @__PURE__ */ P("$ZodCUID2", (e, t) => {
	t.pattern ??= hn, H.init(e, t);
}), ri = /* @__PURE__ */ P("$ZodULID", (e, t) => {
	t.pattern ??= gn, H.init(e, t);
}), ii = /* @__PURE__ */ P("$ZodXID", (e, t) => {
	t.pattern ??= _n, H.init(e, t);
}), ai = /* @__PURE__ */ P("$ZodKSUID", (e, t) => {
	t.pattern ??= vn, H.init(e, t);
}), oi = /* @__PURE__ */ P("$ZodISODateTime", (e, t) => {
	t.pattern ??= Yn(t), H.init(e, t);
}), si = /* @__PURE__ */ P("$ZodISODate", (e, t) => {
	t.pattern ??= Kn, H.init(e, t);
}), ci = /* @__PURE__ */ P("$ZodISOTime", (e, t) => {
	t.pattern ??= Jn(t), H.init(e, t);
}), li = /* @__PURE__ */ P("$ZodISODuration", (e, t) => {
	t.pattern ??= bn, H.init(e, t);
}), ui = /* @__PURE__ */ P("$ZodIPv4", (e, t) => {
	t.pattern ??= Fn, H.init(e, t), e._zod.bag.format = "ipv4";
}), di = /* @__PURE__ */ P("$ZodIPv6", (e, t) => {
	t.pattern ??= In, H.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
		try {
			new URL(`http://[${n.value}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), fi = /* @__PURE__ */ P("$ZodMAC", (e, t) => {
	t.pattern ??= Ln(t.delimiter), H.init(e, t), e._zod.bag.format = "mac";
}), pi = /* @__PURE__ */ P("$ZodCIDRv4", (e, t) => {
	t.pattern ??= Rn, H.init(e, t);
}), mi = /* @__PURE__ */ P("$ZodCIDRv6", (e, t) => {
	t.pattern ??= zn, H.init(e, t), e._zod.check = (n) => {
		let r = n.value.split("/");
		try {
			if (r.length !== 2) throw Error();
			let [e, t] = r;
			if (!t) throw Error();
			let n = Number(t);
			if (`${n}` !== t || n < 0 || n > 128) throw Error();
			new URL(`http://[${e}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
});
function hi(e) {
	if (e === "") return !0;
	if (e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var gi = /* @__PURE__ */ P("$ZodBase64", (e, t) => {
	t.pattern ??= Bn, H.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
		hi(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function _i(e) {
	if (!Vn.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return hi(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var vi = /* @__PURE__ */ P("$ZodBase64URL", (e, t) => {
	t.pattern ??= Vn, H.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
		_i(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), yi = /* @__PURE__ */ P("$ZodE164", (e, t) => {
	t.pattern ??= Wn, H.init(e, t);
});
function bi(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var xi = /* @__PURE__ */ P("$ZodJWT", (e, t) => {
	H.init(e, t), e._zod.check = (n) => {
		bi(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Si = /* @__PURE__ */ P("$ZodCustomStringFormat", (e, t) => {
	H.init(e, t), e._zod.check = (n) => {
		t.fn(n.value) || n.issues.push({
			code: "invalid_format",
			format: t.format,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Ci = /* @__PURE__ */ P("$ZodNumber", (e, t) => {
	V.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? $n, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : "Infinity" : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), wi = /* @__PURE__ */ P("$ZodNumberFormat", (e, t) => {
	Dr.init(e, t), Ci.init(e, t);
}), Ti = /* @__PURE__ */ P("$ZodBoolean", (e, t) => {
	V.init(e, t), e._zod.pattern = er, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), Ei = /* @__PURE__ */ P("$ZodBigInt", (e, t) => {
	V.init(e, t), e._zod.pattern = Zn, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = BigInt(n.value);
		} catch {}
		return typeof n.value == "bigint" || n.issues.push({
			expected: "bigint",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), Di = /* @__PURE__ */ P("$ZodBigIntFormat", (e, t) => {
	Or.init(e, t), Ei.init(e, t);
}), Oi = /* @__PURE__ */ P("$ZodSymbol", (e, t) => {
	V.init(e, t), e._zod.parse = (t, n) => {
		let r = t.value;
		return typeof r == "symbol" || t.issues.push({
			expected: "symbol",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), ki = /* @__PURE__ */ P("$ZodUndefined", (e, t) => {
	V.init(e, t), e._zod.pattern = nr, e._zod.values = new Set([void 0]), e._zod.optin = "optional", e._zod.optout = "optional", e._zod.parse = (t, n) => {
		let r = t.value;
		return r === void 0 || t.issues.push({
			expected: "undefined",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), Ai = /* @__PURE__ */ P("$ZodNull", (e, t) => {
	V.init(e, t), e._zod.pattern = tr, e._zod.values = new Set([null]), e._zod.parse = (t, n) => {
		let r = t.value;
		return r === null || t.issues.push({
			expected: "null",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), ji = /* @__PURE__ */ P("$ZodAny", (e, t) => {
	V.init(e, t), e._zod.parse = (e) => e;
}), Mi = /* @__PURE__ */ P("$ZodUnknown", (e, t) => {
	V.init(e, t), e._zod.parse = (e) => e;
}), Ni = /* @__PURE__ */ P("$ZodNever", (e, t) => {
	V.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
}), Pi = /* @__PURE__ */ P("$ZodVoid", (e, t) => {
	V.init(e, t), e._zod.parse = (t, n) => {
		let r = t.value;
		return r === void 0 || t.issues.push({
			expected: "void",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), Fi = /* @__PURE__ */ P("$ZodDate", (e, t) => {
	V.init(e, t), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = new Date(n.value);
		} catch {}
		let i = n.value, a = i instanceof Date;
		return a && !Number.isNaN(i.getTime()) || n.issues.push({
			expected: "date",
			code: "invalid_type",
			input: i,
			...a ? { received: "Invalid Date" } : {},
			inst: e
		}), n;
	};
});
function Ii(e, t, n) {
	e.issues.length && t.issues.push(...bt(n, e.issues)), t.value[n] = e.value;
}
var Li = /* @__PURE__ */ P("$ZodArray", (e, t) => {
	V.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!Array.isArray(i)) return n.issues.push({
			expected: "array",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		n.value = Array(i.length);
		let a = [];
		for (let e = 0; e < i.length; e++) {
			let o = i[e], s = t.element._zod.run({
				value: o,
				issues: []
			}, r);
			s instanceof Promise ? a.push(s.then((t) => Ii(t, n, e))) : Ii(s, n, e);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function Ri(e, t, n, r) {
	e.issues.length && t.issues.push(...bt(n, e.issues)), e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
function zi(e) {
	let t = Object.keys(e.shape);
	for (let n of t) if (!e.shape?.[n]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${n}": expected a Zod schema`);
	let n = lt(e.shape);
	return {
		...e,
		keys: t,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(n)
	};
}
function Bi(e, t, n, r, i, a) {
	let o = [], s = i.keySet, c = i.catchall._zod, l = c.def.type;
	for (let i in t) {
		if (s.has(i)) continue;
		if (l === "never") {
			o.push(i);
			continue;
		}
		let a = c.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => Ri(e, n, i, t))) : Ri(a, n, i, t);
	}
	return o.length && n.issues.push({
		code: "unrecognized_keys",
		keys: o,
		input: t,
		inst: a
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Vi = /* @__PURE__ */ P("$ZodObject", (e, t) => {
	if (V.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
		let e = t.shape;
		Object.defineProperty(t, "shape", { get: () => {
			let n = { ...e };
			return Object.defineProperty(t, "shape", { value: n }), n;
		} });
	}
	let n = Le(() => zi(t));
	L(e._zod, "propValues", () => {
		let e = t.shape, n = {};
		for (let t in e) {
			let r = e[t]._zod;
			if (r.values) {
				n[t] ?? (n[t] = /* @__PURE__ */ new Set());
				for (let e of r.values) n[t].add(e);
			}
		}
		return n;
	});
	let r = Qe, i = t.catchall, a;
	e._zod.parse = (t, o) => {
		a ??= n.value;
		let s = t.value;
		if (!r(s)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: s,
			inst: e
		}), t;
		t.value = {};
		let c = [], l = a.shape;
		for (let e of a.keys) {
			let n = l[e]._zod.run({
				value: s[e],
				issues: []
			}, o);
			n instanceof Promise ? c.push(n.then((n) => Ri(n, t, e, s))) : Ri(n, t, e, s);
		}
		return i ? Bi(c, s, t, o, n.value, e) : c.length ? Promise.all(c).then(() => t) : t;
	};
}), Hi = /* @__PURE__ */ P("$ZodObjectJIT", (e, t) => {
	Vi.init(e, t);
	let n = e._zod.parse, r = Le(() => zi(t)), i = (e) => {
		let t = new Kr([
			"shape",
			"payload",
			"ctx"
		]), n = r.value, i = (e) => {
			let t = Ye(e);
			return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
		};
		t.write("const input = payload.value;");
		let a = Object.create(null), o = 0;
		for (let e of n.keys) a[e] = `key_${o++}`;
		t.write("const newResult = {};");
		for (let e of n.keys) {
			let n = a[e], r = Ye(e);
			t.write(`const ${n} = ${i(e)};`), t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${r}, ...iss.path] : [${r}]
          })));
        }
        
        
        if (${n}.value === undefined) {
          if (${r} in input) {
            newResult[${r}] = undefined;
          }
        } else {
          newResult[${r}] = ${n}.value;
        }
        
      `);
		}
		t.write("payload.value = newResult;"), t.write("return payload;");
		let s = t.compile();
		return (t, n) => s(e, t, n);
	}, a, o = Qe, s = !Oe.jitless, c = s && $e.value, l = t.catchall, u;
	e._zod.parse = (d, f) => {
		u ??= r.value;
		let p = d.value;
		return o(p) ? s && c && f?.async === !1 && f.jitless !== !0 ? (a ||= i(t.shape), d = a(d, f), l ? Bi([], p, d, f, u, e) : d) : n(d, f) : (d.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), d);
	};
});
function Ui(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !yt(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => St(e, r, F())))
	}), t);
}
var Wi = /* @__PURE__ */ P("$ZodUnion", (e, t) => {
	V.init(e, t), L(e._zod, "optin", () => t.options.some((e) => e._zod.optin === "optional") ? "optional" : void 0), L(e._zod, "optout", () => t.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), L(e._zod, "values", () => {
		if (t.options.every((e) => e._zod.values)) return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
	}), L(e._zod, "pattern", () => {
		if (t.options.every((e) => e._zod.pattern)) {
			let e = t.options.map((e) => e._zod.pattern);
			return RegExp(`^(${e.map((e) => ze(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1, r = t.options[0]._zod.run;
	e._zod.parse = (i, a) => {
		if (n) return r(i, a);
		let o = !1, s = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: i.value,
				issues: []
			}, a);
			if (t instanceof Promise) s.push(t), o = !0;
			else {
				if (t.issues.length === 0) return t;
				s.push(t);
			}
		}
		return o ? Promise.all(s).then((t) => Ui(t, i, e, a)) : Ui(s, i, e, a);
	};
});
function Gi(e, t, n, r) {
	let i = e.filter((e) => e.issues.length === 0);
	return i.length === 1 ? (t.value = i[0].value, t) : (i.length === 0 ? t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => St(e, r, F())))
	}) : t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: [],
		inclusive: !1
	}), t);
}
var Ki = /* @__PURE__ */ P("$ZodXor", (e, t) => {
	Wi.init(e, t), t.inclusive = !1;
	let n = t.options.length === 1, r = t.options[0]._zod.run;
	e._zod.parse = (i, a) => {
		if (n) return r(i, a);
		let o = !1, s = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: i.value,
				issues: []
			}, a);
			t instanceof Promise ? (s.push(t), o = !0) : s.push(t);
		}
		return o ? Promise.all(s).then((t) => Gi(t, i, e, a)) : Gi(s, i, e, a);
	};
}), qi = /* @__PURE__ */ P("$ZodDiscriminatedUnion", (e, t) => {
	t.inclusive = !1, Wi.init(e, t);
	let n = e._zod.parse;
	L(e._zod, "propValues", () => {
		let e = {};
		for (let n of t.options) {
			let r = n._zod.propValues;
			if (!r || Object.keys(r).length === 0) throw Error(`Invalid discriminated union option at index "${t.options.indexOf(n)}"`);
			for (let [t, n] of Object.entries(r)) {
				e[t] || (e[t] = /* @__PURE__ */ new Set());
				for (let r of n) e[t].add(r);
			}
		}
		return e;
	});
	let r = Le(() => {
		let e = t.options, n = /* @__PURE__ */ new Map();
		for (let r of e) {
			let e = r._zod.propValues?.[t.discriminator];
			if (!e || e.size === 0) throw Error(`Invalid discriminated union option at index "${t.options.indexOf(r)}"`);
			for (let t of e) {
				if (n.has(t)) throw Error(`Duplicate discriminator value "${String(t)}"`);
				n.set(t, r);
			}
		}
		return n;
	});
	e._zod.parse = (i, a) => {
		let o = i.value;
		if (!Qe(o)) return i.issues.push({
			code: "invalid_type",
			expected: "object",
			input: o,
			inst: e
		}), i;
		let s = r.value.get(o?.[t.discriminator]);
		return s ? s._zod.run(i, a) : t.unionFallback ? n(i, a) : (i.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			discriminator: t.discriminator,
			input: o,
			path: [t.discriminator],
			inst: e
		}), i);
	};
}), Ji = /* @__PURE__ */ P("$ZodIntersection", (e, t) => {
	V.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Xi(e, t, n)) : Xi(e, i, a);
	};
});
function Yi(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (et(e) && et(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = Yi(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = Yi(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function Xi(e, t, n) {
	if (t.issues.length && e.issues.push(...t.issues), n.issues.length && e.issues.push(...n.issues), yt(e)) return e;
	let r = Yi(t.value, n.value);
	if (!r.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);
	return e.value = r.data, e;
}
var Zi = /* @__PURE__ */ P("$ZodTuple", (e, t) => {
	V.init(e, t);
	let n = t.items;
	e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Array.isArray(a)) return r.issues.push({
			input: a,
			inst: e,
			expected: "tuple",
			code: "invalid_type"
		}), r;
		r.value = [];
		let o = [], s = [...n].reverse().findIndex((e) => e._zod.optin !== "optional"), c = s === -1 ? 0 : n.length - s;
		if (!t.rest) {
			let t = a.length > n.length, i = a.length < c - 1;
			if (t || i) return r.issues.push({
				...t ? {
					code: "too_big",
					maximum: n.length
				} : {
					code: "too_small",
					minimum: n.length
				},
				input: a,
				inst: e,
				origin: "array"
			}), r;
		}
		let l = -1;
		for (let e of n) {
			if (l++, l >= a.length && l >= c) continue;
			let t = e._zod.run({
				value: a[l],
				issues: []
			}, i);
			t instanceof Promise ? o.push(t.then((e) => Qi(e, r, l))) : Qi(t, r, l);
		}
		if (t.rest) {
			let e = a.slice(n.length);
			for (let n of e) {
				l++;
				let e = t.rest._zod.run({
					value: n,
					issues: []
				}, i);
				e instanceof Promise ? o.push(e.then((e) => Qi(e, r, l))) : Qi(e, r, l);
			}
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Qi(e, t, n) {
	e.issues.length && t.issues.push(...bt(n, e.issues)), t.value[n] = e.value;
}
var $i = /* @__PURE__ */ P("$ZodRecord", (e, t) => {
	V.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!et(i)) return n.issues.push({
			expected: "record",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		let a = [], o = t.keyType._zod.values;
		if (o) {
			n.value = {};
			let s = /* @__PURE__ */ new Set();
			for (let e of o) if (typeof e == "string" || typeof e == "number" || typeof e == "symbol") {
				s.add(typeof e == "number" ? e.toString() : e);
				let o = t.valueType._zod.run({
					value: i[e],
					issues: []
				}, r);
				o instanceof Promise ? a.push(o.then((t) => {
					t.issues.length && n.issues.push(...bt(e, t.issues)), n.value[e] = t.value;
				})) : (o.issues.length && n.issues.push(...bt(e, o.issues)), n.value[e] = o.value);
			}
			let c;
			for (let e in i) s.has(e) || (c ??= [], c.push(e));
			c && c.length > 0 && n.issues.push({
				code: "unrecognized_keys",
				input: i,
				inst: e,
				keys: c
			});
		} else {
			n.value = {};
			for (let o of Reflect.ownKeys(i)) {
				if (o === "__proto__") continue;
				let s = t.keyType._zod.run({
					value: o,
					issues: []
				}, r);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (s.issues.length) {
					t.mode === "loose" ? n.value[o] = i[o] : n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => St(e, r, F())),
						input: o,
						path: [o],
						inst: e
					});
					continue;
				}
				let c = t.valueType._zod.run({
					value: i[o],
					issues: []
				}, r);
				c instanceof Promise ? a.push(c.then((e) => {
					e.issues.length && n.issues.push(...bt(o, e.issues)), n.value[s.value] = e.value;
				})) : (c.issues.length && n.issues.push(...bt(o, c.issues)), n.value[s.value] = c.value);
			}
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
}), ea = /* @__PURE__ */ P("$ZodMap", (e, t) => {
	V.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!(i instanceof Map)) return n.issues.push({
			expected: "map",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		let a = [];
		n.value = /* @__PURE__ */ new Map();
		for (let [o, s] of i) {
			let c = t.keyType._zod.run({
				value: o,
				issues: []
			}, r), l = t.valueType._zod.run({
				value: s,
				issues: []
			}, r);
			c instanceof Promise || l instanceof Promise ? a.push(Promise.all([c, l]).then(([t, a]) => {
				ta(t, a, n, o, i, e, r);
			})) : ta(c, l, n, o, i, e, r);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function ta(e, t, n, r, i, a, o) {
	e.issues.length && (it.has(typeof r) ? n.issues.push(...bt(r, e.issues)) : n.issues.push({
		code: "invalid_key",
		origin: "map",
		input: i,
		inst: a,
		issues: e.issues.map((e) => St(e, o, F()))
	})), t.issues.length && (it.has(typeof r) ? n.issues.push(...bt(r, t.issues)) : n.issues.push({
		origin: "map",
		code: "invalid_element",
		input: i,
		inst: a,
		key: r,
		issues: t.issues.map((e) => St(e, o, F()))
	})), n.value.set(e.value, t.value);
}
var na = /* @__PURE__ */ P("$ZodSet", (e, t) => {
	V.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!(i instanceof Set)) return n.issues.push({
			input: i,
			inst: e,
			expected: "set",
			code: "invalid_type"
		}), n;
		let a = [];
		n.value = /* @__PURE__ */ new Set();
		for (let e of i) {
			let i = t.valueType._zod.run({
				value: e,
				issues: []
			}, r);
			i instanceof Promise ? a.push(i.then((e) => ra(e, n))) : ra(i, n);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function ra(e, t) {
	e.issues.length && t.issues.push(...e.issues), t.value.add(e.value);
}
var ia = /* @__PURE__ */ P("$ZodEnum", (e, t) => {
	V.init(e, t);
	let n = Fe(t.entries), r = new Set(n);
	e._zod.values = r, e._zod.pattern = RegExp(`^(${n.filter((e) => it.has(typeof e)).map((e) => typeof e == "string" ? ot(e) : e.toString()).join("|")})$`), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), aa = /* @__PURE__ */ P("$ZodLiteral", (e, t) => {
	if (V.init(e, t), t.values.length === 0) throw Error("Cannot create literal schema with no valid values");
	let n = new Set(t.values);
	e._zod.values = n, e._zod.pattern = RegExp(`^(${t.values.map((e) => typeof e == "string" ? ot(e) : e ? ot(e.toString()) : String(e)).join("|")})$`), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), oa = /* @__PURE__ */ P("$ZodFile", (e, t) => {
	V.init(e, t), e._zod.parse = (t, n) => {
		let r = t.value;
		return r instanceof File || t.issues.push({
			expected: "file",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), sa = /* @__PURE__ */ P("$ZodTransform", (e, t) => {
	V.init(e, t), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new De(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new Ee();
		return n.value = i, n;
	};
});
function ca(e, t) {
	return e.issues.length && t === void 0 ? {
		issues: [],
		value: void 0
	} : e;
}
var la = /* @__PURE__ */ P("$ZodOptional", (e, t) => {
	V.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", L(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0), L(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${ze(e.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (t.innerType._zod.optin === "optional") {
			let r = t.innerType._zod.run(e, n);
			return r instanceof Promise ? r.then((t) => ca(t, e.value)) : ca(r, e.value);
		}
		return e.value === void 0 ? e : t.innerType._zod.run(e, n);
	};
}), ua = /* @__PURE__ */ P("$ZodNullable", (e, t) => {
	V.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${ze(e.source)}|null)$`) : void 0;
	}), L(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), da = /* @__PURE__ */ P("$ZodDefault", (e, t) => {
	V.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => fa(e, t)) : fa(r, t);
	};
});
function fa(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var pa = /* @__PURE__ */ P("$ZodPrefault", (e, t) => {
	V.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ma = /* @__PURE__ */ P("$ZodNonOptional", (e, t) => {
	V.init(e, t), L(e._zod, "values", () => {
		let e = t.innerType._zod.values;
		return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => ha(t, e)) : ha(i, e);
	};
});
function ha(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
var ga = /* @__PURE__ */ P("$ZodSuccess", (e, t) => {
	V.init(e, t), e._zod.parse = (e, n) => {
		if (n.direction === "backward") throw new De("ZodSuccess");
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((t) => (e.value = t.issues.length === 0, e)) : (e.value = r.issues.length === 0, e);
	};
}), _a = /* @__PURE__ */ P("$ZodCatch", (e, t) => {
	V.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((r) => (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => St(e, n, F())) },
			input: e.value
		}), e.issues = []), e)) : (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => St(e, n, F())) },
			input: e.value
		}), e.issues = []), e);
	};
}), va = /* @__PURE__ */ P("$ZodNaN", (e, t) => {
	V.init(e, t), e._zod.parse = (t, n) => ((typeof t.value != "number" || !Number.isNaN(t.value)) && t.issues.push({
		input: t.value,
		inst: e,
		expected: "nan",
		code: "invalid_type"
	}), t);
}), ya = /* @__PURE__ */ P("$ZodPipe", (e, t) => {
	V.init(e, t), L(e._zod, "values", () => t.in._zod.values), L(e._zod, "optin", () => t.in._zod.optin), L(e._zod, "optout", () => t.out._zod.optout), L(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => ba(e, t.in, n)) : ba(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => ba(e, t.out, n)) : ba(r, t.out, n);
	};
});
function ba(e, t, n) {
	return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var xa = /* @__PURE__ */ P("$ZodCodec", (e, t) => {
	V.init(e, t), L(e._zod, "values", () => t.in._zod.values), L(e._zod, "optin", () => t.in._zod.optin), L(e._zod, "optout", () => t.out._zod.optout), L(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if ((n.direction || "forward") === "forward") {
			let r = t.in._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Sa(e, t, n)) : Sa(r, t, n);
		} else {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Sa(e, t, n)) : Sa(r, t, n);
		}
	};
});
function Sa(e, t, n) {
	if (e.issues.length) return e.aborted = !0, e;
	if ((n.direction || "forward") === "forward") {
		let r = t.transform(e.value, e);
		return r instanceof Promise ? r.then((r) => Ca(e, r, t.out, n)) : Ca(e, r, t.out, n);
	} else {
		let r = t.reverseTransform(e.value, e);
		return r instanceof Promise ? r.then((r) => Ca(e, r, t.in, n)) : Ca(e, r, t.in, n);
	}
}
function Ca(e, t, n, r) {
	return e.issues.length ? (e.aborted = !0, e) : n._zod.run({
		value: t,
		issues: e.issues
	}, r);
}
var wa = /* @__PURE__ */ P("$ZodReadonly", (e, t) => {
	V.init(e, t), L(e._zod, "propValues", () => t.innerType._zod.propValues), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "optin", () => t.innerType?._zod?.optin), L(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(Ta) : Ta(r);
	};
});
function Ta(e) {
	return e.value = Object.freeze(e.value), e;
}
var Ea = /* @__PURE__ */ P("$ZodTemplateLiteral", (e, t) => {
	V.init(e, t);
	let n = [];
	for (let e of t.parts) if (typeof e == "object" && e) {
		if (!e._zod.pattern) throw Error(`Invalid template literal part, no pattern found: ${[...e._zod.traits].shift()}`);
		let t = e._zod.pattern instanceof RegExp ? e._zod.pattern.source : e._zod.pattern;
		if (!t) throw Error(`Invalid template literal part: ${e._zod.traits}`);
		let r = t.startsWith("^") ? 1 : 0, i = t.endsWith("$") ? t.length - 1 : t.length;
		n.push(t.slice(r, i));
	} else if (e === null || at.has(typeof e)) n.push(ot(`${e}`));
	else throw Error(`Invalid template literal part: ${e}`);
	e._zod.pattern = RegExp(`^${n.join("")}$`), e._zod.parse = (n, r) => typeof n.value == "string" ? (e._zod.pattern.lastIndex = 0, e._zod.pattern.test(n.value) || n.issues.push({
		input: n.value,
		inst: e,
		code: "invalid_format",
		format: t.format ?? "template_literal",
		pattern: e._zod.pattern.source
	}), n) : (n.issues.push({
		input: n.value,
		inst: e,
		expected: "template_literal",
		code: "invalid_type"
	}), n);
}), Da = /* @__PURE__ */ P("$ZodFunction", (e, t) => (V.init(e, t), e._def = t, e._zod.def = t, e.implement = (t) => {
	if (typeof t != "function") throw Error("implement() must be called with a function");
	return function(...n) {
		let r = e._def.input ? Ut(e._def.input, n) : n, i = Reflect.apply(t, this, r);
		return e._def.output ? Ut(e._def.output, i) : i;
	};
}, e.implementAsync = (t) => {
	if (typeof t != "function") throw Error("implementAsync() must be called with a function");
	return async function(...n) {
		let r = e._def.input ? await Gt(e._def.input, n) : n, i = await Reflect.apply(t, this, r);
		return e._def.output ? await Gt(e._def.output, i) : i;
	};
}, e._zod.parse = (t, n) => typeof t.value == "function" ? (e._def.output && e._def.output._zod.def.type === "promise" ? t.value = e.implementAsync(t.value) : t.value = e.implement(t.value), t) : (t.issues.push({
	code: "invalid_type",
	expected: "function",
	input: t.value,
	inst: e
}), t), e.input = (...t) => {
	let n = e.constructor;
	return Array.isArray(t[0]) ? new n({
		type: "function",
		input: new Zi({
			type: "tuple",
			items: t[0],
			rest: t[1]
		}),
		output: e._def.output
	}) : new n({
		type: "function",
		input: t[0],
		output: e._def.output
	});
}, e.output = (t) => {
	let n = e.constructor;
	return new n({
		type: "function",
		input: e._def.input,
		output: t
	});
}, e)), Oa = /* @__PURE__ */ P("$ZodPromise", (e, t) => {
	V.init(e, t), e._zod.parse = (e, n) => Promise.resolve(e.value).then((e) => t.innerType._zod.run({
		value: e,
		issues: []
	}, n));
}), ka = /* @__PURE__ */ P("$ZodLazy", (e, t) => {
	V.init(e, t), L(e._zod, "innerType", () => t.getter()), L(e._zod, "pattern", () => e._zod.innerType?._zod?.pattern), L(e._zod, "propValues", () => e._zod.innerType?._zod?.propValues), L(e._zod, "optin", () => e._zod.innerType?._zod?.optin ?? void 0), L(e._zod, "optout", () => e._zod.innerType?._zod?.optout ?? void 0), e._zod.parse = (t, n) => e._zod.innerType._zod.run(t, n);
}), Aa = /* @__PURE__ */ P("$ZodCustom", (e, t) => {
	B.init(e, t), V.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => ja(t, n, r, e));
		ja(i, n, r, e);
	};
});
function ja(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Tt(e));
	}
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ar.js
var Ma = () => {
	let e = {
		string: {
			unit: "حرف",
			verb: "أن يحوي"
		},
		file: {
			unit: "بايت",
			verb: "أن يحوي"
		},
		array: {
			unit: "عنصر",
			verb: "أن يحوي"
		},
		set: {
			unit: "عنصر",
			verb: "أن يحوي"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "مدخل",
		email: "بريد إلكتروني",
		url: "رابط",
		emoji: "إيموجي",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "تاريخ ووقت بمعيار ISO",
		date: "تاريخ بمعيار ISO",
		time: "وقت بمعيار ISO",
		duration: "مدة بمعيار ISO",
		ipv4: "عنوان IPv4",
		ipv6: "عنوان IPv6",
		cidrv4: "مدى عناوين بصيغة IPv4",
		cidrv6: "مدى عناوين بصيغة IPv6",
		base64: "نَص بترميز base64-encoded",
		base64url: "نَص بترميز base64url-encoded",
		json_string: "نَص على هيئة JSON",
		e164: "رقم هاتف بمعيار E.164",
		jwt: "JWT",
		template_literal: "مدخل"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `مدخلات غير مقبولة: يفترض إدخال ${e.expected}، ولكن تم إدخال ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `مدخلات غير مقبولة: يفترض إدخال ${z(e.values[0])}` : `اختيار غير مقبول: يتوقع انتقاء أحد هذه الخيارات: ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? ` أكبر من اللازم: يفترض أن تكون ${e.origin ?? "القيمة"} ${n} ${e.maximum.toString()} ${r.unit ?? "عنصر"}` : `أكبر من اللازم: يفترض أن تكون ${e.origin ?? "القيمة"} ${n} ${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `أصغر من اللازم: يفترض لـ ${e.origin} أن يكون ${n} ${e.minimum.toString()} ${r.unit}` : `أصغر من اللازم: يفترض لـ ${e.origin} أن يكون ${n} ${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `نَص غير مقبول: يجب أن يبدأ بـ "${e.prefix}"` : t.format === "ends_with" ? `نَص غير مقبول: يجب أن ينتهي بـ "${t.suffix}"` : t.format === "includes" ? `نَص غير مقبول: يجب أن يتضمَّن "${t.includes}"` : t.format === "regex" ? `نَص غير مقبول: يجب أن يطابق النمط ${t.pattern}` : `${r[t.format] ?? e.format} غير مقبول`;
			}
			case "not_multiple_of": return `رقم غير مقبول: يجب أن يكون من مضاعفات ${e.divisor}`;
			case "unrecognized_keys": return `معرف${e.keys.length > 1 ? "ات" : ""} غريب${e.keys.length > 1 ? "ة" : ""}: ${I(e.keys, "، ")}`;
			case "invalid_key": return `معرف غير مقبول في ${e.origin}`;
			case "invalid_union": return "مدخل غير مقبول";
			case "invalid_element": return `مدخل غير مقبول في ${e.origin}`;
			default: return "مدخل غير مقبول";
		}
	};
};
function Na() {
	return { localeError: Ma() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/az.js
var Pa = () => {
	let e = {
		string: {
			unit: "simvol",
			verb: "olmalıdır"
		},
		file: {
			unit: "bayt",
			verb: "olmalıdır"
		},
		array: {
			unit: "element",
			verb: "olmalıdır"
		},
		set: {
			unit: "element",
			verb: "olmalıdır"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Yanlış dəyər: gözlənilən ${e.expected}, daxil olan ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Yanlış dəyər: gözlənilən ${z(e.values[0])}` : `Yanlış seçim: aşağıdakılardan biri olmalıdır: ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Çox böyük: gözlənilən ${e.origin ?? "dəyər"} ${n}${e.maximum.toString()} ${r.unit ?? "element"}` : `Çox böyük: gözlənilən ${e.origin ?? "dəyər"} ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Çox kiçik: gözlənilən ${e.origin} ${n}${e.minimum.toString()} ${r.unit}` : `Çox kiçik: gözlənilən ${e.origin} ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Yanlış mətn: "${t.prefix}" ilə başlamalıdır` : t.format === "ends_with" ? `Yanlış mətn: "${t.suffix}" ilə bitməlidir` : t.format === "includes" ? `Yanlış mətn: "${t.includes}" daxil olmalıdır` : t.format === "regex" ? `Yanlış mətn: ${t.pattern} şablonuna uyğun olmalıdır` : `Yanlış ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Yanlış ədəd: ${e.divisor} ilə bölünə bilən olmalıdır`;
			case "unrecognized_keys": return `Tanınmayan açar${e.keys.length > 1 ? "lar" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `${e.origin} daxilində yanlış açar`;
			case "invalid_union": return "Yanlış dəyər";
			case "invalid_element": return `${e.origin} daxilində yanlış dəyər`;
			default: return "Yanlış dəyər";
		}
	};
};
function Fa() {
	return { localeError: Pa() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/be.js
function Ia(e, t, n, r) {
	let i = Math.abs(e), a = i % 10, o = i % 100;
	return o >= 11 && o <= 19 ? r : a === 1 ? t : a >= 2 && a <= 4 ? n : r;
}
var La = () => {
	let e = {
		string: {
			unit: {
				one: "сімвал",
				few: "сімвалы",
				many: "сімвалаў"
			},
			verb: "мець"
		},
		array: {
			unit: {
				one: "элемент",
				few: "элементы",
				many: "элементаў"
			},
			verb: "мець"
		},
		set: {
			unit: {
				one: "элемент",
				few: "элементы",
				many: "элементаў"
			},
			verb: "мець"
		},
		file: {
			unit: {
				one: "байт",
				few: "байты",
				many: "байтаў"
			},
			verb: "мець"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "лік";
			case "object":
				if (Array.isArray(e)) return "масіў";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "увод",
		email: "email адрас",
		url: "URL",
		emoji: "эмодзі",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO дата і час",
		date: "ISO дата",
		time: "ISO час",
		duration: "ISO працягласць",
		ipv4: "IPv4 адрас",
		ipv6: "IPv6 адрас",
		cidrv4: "IPv4 дыяпазон",
		cidrv6: "IPv6 дыяпазон",
		base64: "радок у фармаце base64",
		base64url: "радок у фармаце base64url",
		json_string: "JSON радок",
		e164: "нумар E.164",
		jwt: "JWT",
		template_literal: "увод"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Няправільны ўвод: чакаўся ${e.expected}, атрымана ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Няправільны ўвод: чакалася ${z(e.values[0])}` : `Няправільны варыянт: чакаўся адзін з ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				if (r) {
					let t = Ia(Number(e.maximum), r.unit.one, r.unit.few, r.unit.many);
					return `Занадта вялікі: чакалася, што ${e.origin ?? "значэнне"} павінна ${r.verb} ${n}${e.maximum.toString()} ${t}`;
				}
				return `Занадта вялікі: чакалася, што ${e.origin ?? "значэнне"} павінна быць ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				if (r) {
					let t = Ia(Number(e.minimum), r.unit.one, r.unit.few, r.unit.many);
					return `Занадта малы: чакалася, што ${e.origin} павінна ${r.verb} ${n}${e.minimum.toString()} ${t}`;
				}
				return `Занадта малы: чакалася, што ${e.origin} павінна быць ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Няправільны радок: павінен пачынацца з "${t.prefix}"` : t.format === "ends_with" ? `Няправільны радок: павінен заканчвацца на "${t.suffix}"` : t.format === "includes" ? `Няправільны радок: павінен змяшчаць "${t.includes}"` : t.format === "regex" ? `Няправільны радок: павінен адпавядаць шаблону ${t.pattern}` : `Няправільны ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Няправільны лік: павінен быць кратным ${e.divisor}`;
			case "unrecognized_keys": return `Нераспазнаны ${e.keys.length > 1 ? "ключы" : "ключ"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Няправільны ключ у ${e.origin}`;
			case "invalid_union": return "Няправільны ўвод";
			case "invalid_element": return `Няправільнае значэнне ў ${e.origin}`;
			default: return "Няправільны ўвод";
		}
	};
};
function Ra() {
	return { localeError: La() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/bg.js
var za = (e) => {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "NaN" : "число";
		case "object":
			if (Array.isArray(e)) return "масив";
			if (e === null) return "null";
			if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
	}
	return t;
}, Ba = () => {
	let e = {
		string: {
			unit: "символа",
			verb: "да съдържа"
		},
		file: {
			unit: "байта",
			verb: "да съдържа"
		},
		array: {
			unit: "елемента",
			verb: "да съдържа"
		},
		set: {
			unit: "елемента",
			verb: "да съдържа"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "вход",
		email: "имейл адрес",
		url: "URL",
		emoji: "емоджи",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO време",
		date: "ISO дата",
		time: "ISO време",
		duration: "ISO продължителност",
		ipv4: "IPv4 адрес",
		ipv6: "IPv6 адрес",
		cidrv4: "IPv4 диапазон",
		cidrv6: "IPv6 диапазон",
		base64: "base64-кодиран низ",
		base64url: "base64url-кодиран низ",
		json_string: "JSON низ",
		e164: "E.164 номер",
		jwt: "JWT",
		template_literal: "вход"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Невалиден вход: очакван ${e.expected}, получен ${za(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Невалиден вход: очакван ${z(e.values[0])}` : `Невалидна опция: очаквано едно от ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Твърде голямо: очаква се ${e.origin ?? "стойност"} да съдържа ${n}${e.maximum.toString()} ${r.unit ?? "елемента"}` : `Твърде голямо: очаква се ${e.origin ?? "стойност"} да бъде ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Твърде малко: очаква се ${e.origin} да съдържа ${n}${e.minimum.toString()} ${r.unit}` : `Твърде малко: очаква се ${e.origin} да бъде ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				if (t.format === "starts_with") return `Невалиден низ: трябва да започва с "${t.prefix}"`;
				if (t.format === "ends_with") return `Невалиден низ: трябва да завършва с "${t.suffix}"`;
				if (t.format === "includes") return `Невалиден низ: трябва да включва "${t.includes}"`;
				if (t.format === "regex") return `Невалиден низ: трябва да съвпада с ${t.pattern}`;
				let r = "Невалиден";
				return t.format === "emoji" && (r = "Невалидно"), t.format === "datetime" && (r = "Невалидно"), t.format === "date" && (r = "Невалидна"), t.format === "time" && (r = "Невалидно"), t.format === "duration" && (r = "Невалидна"), `${r} ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Невалидно число: трябва да бъде кратно на ${e.divisor}`;
			case "unrecognized_keys": return `Неразпознат${e.keys.length > 1 ? "и" : ""} ключ${e.keys.length > 1 ? "ове" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Невалиден ключ в ${e.origin}`;
			case "invalid_union": return "Невалиден вход";
			case "invalid_element": return `Невалидна стойност в ${e.origin}`;
			default: return "Невалиден вход";
		}
	};
};
function Va() {
	return { localeError: Ba() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ca.js
var Ha = () => {
	let e = {
		string: {
			unit: "caràcters",
			verb: "contenir"
		},
		file: {
			unit: "bytes",
			verb: "contenir"
		},
		array: {
			unit: "elements",
			verb: "contenir"
		},
		set: {
			unit: "elements",
			verb: "contenir"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "entrada",
		email: "adreça electrònica",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data i hora ISO",
		date: "data ISO",
		time: "hora ISO",
		duration: "durada ISO",
		ipv4: "adreça IPv4",
		ipv6: "adreça IPv6",
		cidrv4: "rang IPv4",
		cidrv6: "rang IPv6",
		base64: "cadena codificada en base64",
		base64url: "cadena codificada en base64url",
		json_string: "cadena JSON",
		e164: "número E.164",
		jwt: "JWT",
		template_literal: "entrada"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Tipus invàlid: s'esperava ${e.expected}, s'ha rebut ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Valor invàlid: s'esperava ${z(e.values[0])}` : `Opció invàlida: s'esperava una de ${I(e.values, " o ")}`;
			case "too_big": {
				let n = e.inclusive ? "com a màxim" : "menys de", r = t(e.origin);
				return r ? `Massa gran: s'esperava que ${e.origin ?? "el valor"} contingués ${n} ${e.maximum.toString()} ${r.unit ?? "elements"}` : `Massa gran: s'esperava que ${e.origin ?? "el valor"} fos ${n} ${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? "com a mínim" : "més de", r = t(e.origin);
				return r ? `Massa petit: s'esperava que ${e.origin} contingués ${n} ${e.minimum.toString()} ${r.unit}` : `Massa petit: s'esperava que ${e.origin} fos ${n} ${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Format invàlid: ha de començar amb "${t.prefix}"` : t.format === "ends_with" ? `Format invàlid: ha d'acabar amb "${t.suffix}"` : t.format === "includes" ? `Format invàlid: ha d'incloure "${t.includes}"` : t.format === "regex" ? `Format invàlid: ha de coincidir amb el patró ${t.pattern}` : `Format invàlid per a ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Número invàlid: ha de ser múltiple de ${e.divisor}`;
			case "unrecognized_keys": return `Clau${e.keys.length > 1 ? "s" : ""} no reconeguda${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Clau invàlida a ${e.origin}`;
			case "invalid_union": return "Entrada invàlida";
			case "invalid_element": return `Element invàlid a ${e.origin}`;
			default: return "Entrada invàlida";
		}
	};
};
function Ua() {
	return { localeError: Ha() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/cs.js
var Wa = () => {
	let e = {
		string: {
			unit: "znaků",
			verb: "mít"
		},
		file: {
			unit: "bajtů",
			verb: "mít"
		},
		array: {
			unit: "prvků",
			verb: "mít"
		},
		set: {
			unit: "prvků",
			verb: "mít"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "číslo";
			case "string": return "řetězec";
			case "boolean": return "boolean";
			case "bigint": return "bigint";
			case "function": return "funkce";
			case "symbol": return "symbol";
			case "undefined": return "undefined";
			case "object":
				if (Array.isArray(e)) return "pole";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "regulární výraz",
		email: "e-mailová adresa",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "datum a čas ve formátu ISO",
		date: "datum ve formátu ISO",
		time: "čas ve formátu ISO",
		duration: "doba trvání ISO",
		ipv4: "IPv4 adresa",
		ipv6: "IPv6 adresa",
		cidrv4: "rozsah IPv4",
		cidrv6: "rozsah IPv6",
		base64: "řetězec zakódovaný ve formátu base64",
		base64url: "řetězec zakódovaný ve formátu base64url",
		json_string: "řetězec ve formátu JSON",
		e164: "číslo E.164",
		jwt: "JWT",
		template_literal: "vstup"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Neplatný vstup: očekáváno ${e.expected}, obdrženo ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Neplatný vstup: očekáváno ${z(e.values[0])}` : `Neplatná možnost: očekávána jedna z hodnot ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Hodnota je příliš velká: ${e.origin ?? "hodnota"} musí mít ${n}${e.maximum.toString()} ${r.unit ?? "prvků"}` : `Hodnota je příliš velká: ${e.origin ?? "hodnota"} musí být ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Hodnota je příliš malá: ${e.origin ?? "hodnota"} musí mít ${n}${e.minimum.toString()} ${r.unit ?? "prvků"}` : `Hodnota je příliš malá: ${e.origin ?? "hodnota"} musí být ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Neplatný řetězec: musí začínat na "${t.prefix}"` : t.format === "ends_with" ? `Neplatný řetězec: musí končit na "${t.suffix}"` : t.format === "includes" ? `Neplatný řetězec: musí obsahovat "${t.includes}"` : t.format === "regex" ? `Neplatný řetězec: musí odpovídat vzoru ${t.pattern}` : `Neplatný formát ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Neplatné číslo: musí být násobkem ${e.divisor}`;
			case "unrecognized_keys": return `Neznámé klíče: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Neplatný klíč v ${e.origin}`;
			case "invalid_union": return "Neplatný vstup";
			case "invalid_element": return `Neplatná hodnota v ${e.origin}`;
			default: return "Neplatný vstup";
		}
	};
};
function Ga() {
	return { localeError: Wa() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/da.js
var Ka = () => {
	let e = {
		string: {
			unit: "tegn",
			verb: "havde"
		},
		file: {
			unit: "bytes",
			verb: "havde"
		},
		array: {
			unit: "elementer",
			verb: "indeholdt"
		},
		set: {
			unit: "elementer",
			verb: "indeholdt"
		}
	}, t = {
		string: "streng",
		number: "tal",
		boolean: "boolean",
		array: "liste",
		object: "objekt",
		set: "sæt",
		file: "fil"
	};
	function n(t) {
		return e[t] ?? null;
	}
	function r(e) {
		return t[e] ?? e;
	}
	let i = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "tal";
			case "object": return Array.isArray(e) ? "liste" : e === null ? "null" : Object.getPrototypeOf(e) !== Object.prototype && e.constructor ? e.constructor.name : "objekt";
		}
		return t;
	}, a = {
		regex: "input",
		email: "e-mailadresse",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO dato- og klokkeslæt",
		date: "ISO-dato",
		time: "ISO-klokkeslæt",
		duration: "ISO-varighed",
		ipv4: "IPv4-område",
		ipv6: "IPv6-område",
		cidrv4: "IPv4-spektrum",
		cidrv6: "IPv6-spektrum",
		base64: "base64-kodet streng",
		base64url: "base64url-kodet streng",
		json_string: "JSON-streng",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Ugyldigt input: forventede ${r(e.expected)}, fik ${r(i(e.input))}`;
			case "invalid_value": return e.values.length === 1 ? `Ugyldig værdi: forventede ${z(e.values[0])}` : `Ugyldigt valg: forventede en af følgende ${I(e.values, "|")}`;
			case "too_big": {
				let t = e.inclusive ? "<=" : "<", i = n(e.origin), a = r(e.origin);
				return i ? `For stor: forventede ${a ?? "value"} ${i.verb} ${t} ${e.maximum.toString()} ${i.unit ?? "elementer"}` : `For stor: forventede ${a ?? "value"} havde ${t} ${e.maximum.toString()}`;
			}
			case "too_small": {
				let t = e.inclusive ? ">=" : ">", i = n(e.origin), a = r(e.origin);
				return i ? `For lille: forventede ${a} ${i.verb} ${t} ${e.minimum.toString()} ${i.unit}` : `For lille: forventede ${a} havde ${t} ${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ugyldig streng: skal starte med "${t.prefix}"` : t.format === "ends_with" ? `Ugyldig streng: skal ende med "${t.suffix}"` : t.format === "includes" ? `Ugyldig streng: skal indeholde "${t.includes}"` : t.format === "regex" ? `Ugyldig streng: skal matche mønsteret ${t.pattern}` : `Ugyldig ${a[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Ugyldigt tal: skal være deleligt med ${e.divisor}`;
			case "unrecognized_keys": return `${e.keys.length > 1 ? "Ukendte nøgler" : "Ukendt nøgle"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Ugyldig nøgle i ${e.origin}`;
			case "invalid_union": return "Ugyldigt input: matcher ingen af de tilladte typer";
			case "invalid_element": return `Ugyldig værdi i ${e.origin}`;
			default: return "Ugyldigt input";
		}
	};
};
function qa() {
	return { localeError: Ka() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/de.js
var Ja = () => {
	let e = {
		string: {
			unit: "Zeichen",
			verb: "zu haben"
		},
		file: {
			unit: "Bytes",
			verb: "zu haben"
		},
		array: {
			unit: "Elemente",
			verb: "zu haben"
		},
		set: {
			unit: "Elemente",
			verb: "zu haben"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "Zahl";
			case "object":
				if (Array.isArray(e)) return "Array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "Eingabe",
		email: "E-Mail-Adresse",
		url: "URL",
		emoji: "Emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-Datum und -Uhrzeit",
		date: "ISO-Datum",
		time: "ISO-Uhrzeit",
		duration: "ISO-Dauer",
		ipv4: "IPv4-Adresse",
		ipv6: "IPv6-Adresse",
		cidrv4: "IPv4-Bereich",
		cidrv6: "IPv6-Bereich",
		base64: "Base64-codierter String",
		base64url: "Base64-URL-codierter String",
		json_string: "JSON-String",
		e164: "E.164-Nummer",
		jwt: "JWT",
		template_literal: "Eingabe"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Ungültige Eingabe: erwartet ${e.expected}, erhalten ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Ungültige Eingabe: erwartet ${z(e.values[0])}` : `Ungültige Option: erwartet eine von ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Zu groß: erwartet, dass ${e.origin ?? "Wert"} ${n}${e.maximum.toString()} ${r.unit ?? "Elemente"} hat` : `Zu groß: erwartet, dass ${e.origin ?? "Wert"} ${n}${e.maximum.toString()} ist`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Zu klein: erwartet, dass ${e.origin} ${n}${e.minimum.toString()} ${r.unit} hat` : `Zu klein: erwartet, dass ${e.origin} ${n}${e.minimum.toString()} ist`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ungültiger String: muss mit "${t.prefix}" beginnen` : t.format === "ends_with" ? `Ungültiger String: muss mit "${t.suffix}" enden` : t.format === "includes" ? `Ungültiger String: muss "${t.includes}" enthalten` : t.format === "regex" ? `Ungültiger String: muss dem Muster ${t.pattern} entsprechen` : `Ungültig: ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Ungültige Zahl: muss ein Vielfaches von ${e.divisor} sein`;
			case "unrecognized_keys": return `${e.keys.length > 1 ? "Unbekannte Schlüssel" : "Unbekannter Schlüssel"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Ungültiger Schlüssel in ${e.origin}`;
			case "invalid_union": return "Ungültige Eingabe";
			case "invalid_element": return `Ungültiger Wert in ${e.origin}`;
			default: return "Ungültige Eingabe";
		}
	};
};
function Ya() {
	return { localeError: Ja() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/en.js
var Xa = (e) => {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "NaN" : "number";
		case "object":
			if (Array.isArray(e)) return "array";
			if (e === null) return "null";
			if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
	}
	return t;
}, Za = () => {
	let e = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Invalid input: expected ${e.expected}, received ${Xa(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${z(e.values[0])}` : `Invalid option: expected one of ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Too big: expected ${e.origin ?? "value"} to have ${n}${e.maximum.toString()} ${r.unit ?? "elements"}` : `Too big: expected ${e.origin ?? "value"} to be ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Too small: expected ${e.origin} to have ${n}${e.minimum.toString()} ${r.unit}` : `Too small: expected ${e.origin} to be ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Invalid string: must start with "${t.prefix}"` : t.format === "ends_with" ? `Invalid string: must end with "${t.suffix}"` : t.format === "includes" ? `Invalid string: must include "${t.includes}"` : t.format === "regex" ? `Invalid string: must match pattern ${t.pattern}` : `Invalid ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${e.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Qa() {
	return { localeError: Za() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/eo.js
var $a = (e) => {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "NaN" : "nombro";
		case "object":
			if (Array.isArray(e)) return "tabelo";
			if (e === null) return "senvalora";
			if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
	}
	return t;
}, eo = () => {
	let e = {
		string: {
			unit: "karaktrojn",
			verb: "havi"
		},
		file: {
			unit: "bajtojn",
			verb: "havi"
		},
		array: {
			unit: "elementojn",
			verb: "havi"
		},
		set: {
			unit: "elementojn",
			verb: "havi"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "enigo",
		email: "retadreso",
		url: "URL",
		emoji: "emoĝio",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-datotempo",
		date: "ISO-dato",
		time: "ISO-tempo",
		duration: "ISO-daŭro",
		ipv4: "IPv4-adreso",
		ipv6: "IPv6-adreso",
		cidrv4: "IPv4-rango",
		cidrv6: "IPv6-rango",
		base64: "64-ume kodita karaktraro",
		base64url: "URL-64-ume kodita karaktraro",
		json_string: "JSON-karaktraro",
		e164: "E.164-nombro",
		jwt: "JWT",
		template_literal: "enigo"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Nevalida enigo: atendiĝis ${e.expected}, riceviĝis ${$a(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Nevalida enigo: atendiĝis ${z(e.values[0])}` : `Nevalida opcio: atendiĝis unu el ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Tro granda: atendiĝis ke ${e.origin ?? "valoro"} havu ${n}${e.maximum.toString()} ${r.unit ?? "elementojn"}` : `Tro granda: atendiĝis ke ${e.origin ?? "valoro"} havu ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Tro malgranda: atendiĝis ke ${e.origin} havu ${n}${e.minimum.toString()} ${r.unit}` : `Tro malgranda: atendiĝis ke ${e.origin} estu ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Nevalida karaktraro: devas komenciĝi per "${t.prefix}"` : t.format === "ends_with" ? `Nevalida karaktraro: devas finiĝi per "${t.suffix}"` : t.format === "includes" ? `Nevalida karaktraro: devas inkluzivi "${t.includes}"` : t.format === "regex" ? `Nevalida karaktraro: devas kongrui kun la modelo ${t.pattern}` : `Nevalida ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Nevalida nombro: devas esti oblo de ${e.divisor}`;
			case "unrecognized_keys": return `Nekonata${e.keys.length > 1 ? "j" : ""} ŝlosilo${e.keys.length > 1 ? "j" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Nevalida ŝlosilo en ${e.origin}`;
			case "invalid_union": return "Nevalida enigo";
			case "invalid_element": return `Nevalida valoro en ${e.origin}`;
			default: return "Nevalida enigo";
		}
	};
};
function to() {
	return { localeError: eo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/es.js
var no = () => {
	let e = {
		string: {
			unit: "caracteres",
			verb: "tener"
		},
		file: {
			unit: "bytes",
			verb: "tener"
		},
		array: {
			unit: "elementos",
			verb: "tener"
		},
		set: {
			unit: "elementos",
			verb: "tener"
		}
	}, t = {
		string: "texto",
		number: "número",
		boolean: "booleano",
		array: "arreglo",
		object: "objeto",
		set: "conjunto",
		file: "archivo",
		date: "fecha",
		bigint: "número grande",
		symbol: "símbolo",
		undefined: "indefinido",
		null: "nulo",
		function: "función",
		map: "mapa",
		record: "registro",
		tuple: "tupla",
		enum: "enumeración",
		union: "unión",
		literal: "literal",
		promise: "promesa",
		void: "vacío",
		never: "nunca",
		unknown: "desconocido",
		any: "cualquiera"
	};
	function n(t) {
		return e[t] ?? null;
	}
	function r(e) {
		return t[e] ?? e;
	}
	let i = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object": return Array.isArray(e) ? "array" : e === null ? "null" : Object.getPrototypeOf(e) === Object.prototype ? "object" : e.constructor.name;
		}
		return t;
	}, a = {
		regex: "entrada",
		email: "dirección de correo electrónico",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "fecha y hora ISO",
		date: "fecha ISO",
		time: "hora ISO",
		duration: "duración ISO",
		ipv4: "dirección IPv4",
		ipv6: "dirección IPv6",
		cidrv4: "rango IPv4",
		cidrv6: "rango IPv6",
		base64: "cadena codificada en base64",
		base64url: "URL codificada en base64",
		json_string: "cadena JSON",
		e164: "número E.164",
		jwt: "JWT",
		template_literal: "entrada"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Entrada inválida: se esperaba ${r(e.expected)}, recibido ${r(i(e.input))}`;
			case "invalid_value": return e.values.length === 1 ? `Entrada inválida: se esperaba ${z(e.values[0])}` : `Opción inválida: se esperaba una de ${I(e.values, "|")}`;
			case "too_big": {
				let t = e.inclusive ? "<=" : "<", i = n(e.origin), a = r(e.origin);
				return i ? `Demasiado grande: se esperaba que ${a ?? "valor"} tuviera ${t}${e.maximum.toString()} ${i.unit ?? "elementos"}` : `Demasiado grande: se esperaba que ${a ?? "valor"} fuera ${t}${e.maximum.toString()}`;
			}
			case "too_small": {
				let t = e.inclusive ? ">=" : ">", i = n(e.origin), a = r(e.origin);
				return i ? `Demasiado pequeño: se esperaba que ${a} tuviera ${t}${e.minimum.toString()} ${i.unit}` : `Demasiado pequeño: se esperaba que ${a} fuera ${t}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Cadena inválida: debe comenzar con "${t.prefix}"` : t.format === "ends_with" ? `Cadena inválida: debe terminar en "${t.suffix}"` : t.format === "includes" ? `Cadena inválida: debe incluir "${t.includes}"` : t.format === "regex" ? `Cadena inválida: debe coincidir con el patrón ${t.pattern}` : `Inválido ${a[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Número inválido: debe ser múltiplo de ${e.divisor}`;
			case "unrecognized_keys": return `Llave${e.keys.length > 1 ? "s" : ""} desconocida${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Llave inválida en ${r(e.origin)}`;
			case "invalid_union": return "Entrada inválida";
			case "invalid_element": return `Valor inválido en ${r(e.origin)}`;
			default: return "Entrada inválida";
		}
	};
};
function ro() {
	return { localeError: no() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fa.js
var io = () => {
	let e = {
		string: {
			unit: "کاراکتر",
			verb: "داشته باشد"
		},
		file: {
			unit: "بایت",
			verb: "داشته باشد"
		},
		array: {
			unit: "آیتم",
			verb: "داشته باشد"
		},
		set: {
			unit: "آیتم",
			verb: "داشته باشد"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "عدد";
			case "object":
				if (Array.isArray(e)) return "آرایه";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ورودی",
		email: "آدرس ایمیل",
		url: "URL",
		emoji: "ایموجی",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "تاریخ و زمان ایزو",
		date: "تاریخ ایزو",
		time: "زمان ایزو",
		duration: "مدت زمان ایزو",
		ipv4: "IPv4 آدرس",
		ipv6: "IPv6 آدرس",
		cidrv4: "IPv4 دامنه",
		cidrv6: "IPv6 دامنه",
		base64: "base64-encoded رشته",
		base64url: "base64url-encoded رشته",
		json_string: "JSON رشته",
		e164: "E.164 عدد",
		jwt: "JWT",
		template_literal: "ورودی"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `ورودی نامعتبر: می‌بایست ${e.expected} می‌بود، ${n(e.input)} دریافت شد`;
			case "invalid_value": return e.values.length === 1 ? `ورودی نامعتبر: می‌بایست ${z(e.values[0])} می‌بود` : `گزینه نامعتبر: می‌بایست یکی از ${I(e.values, "|")} می‌بود`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `خیلی بزرگ: ${e.origin ?? "مقدار"} باید ${n}${e.maximum.toString()} ${r.unit ?? "عنصر"} باشد` : `خیلی بزرگ: ${e.origin ?? "مقدار"} باید ${n}${e.maximum.toString()} باشد`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `خیلی کوچک: ${e.origin} باید ${n}${e.minimum.toString()} ${r.unit} باشد` : `خیلی کوچک: ${e.origin} باید ${n}${e.minimum.toString()} باشد`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `رشته نامعتبر: باید با "${t.prefix}" شروع شود` : t.format === "ends_with" ? `رشته نامعتبر: باید با "${t.suffix}" تمام شود` : t.format === "includes" ? `رشته نامعتبر: باید شامل "${t.includes}" باشد` : t.format === "regex" ? `رشته نامعتبر: باید با الگوی ${t.pattern} مطابقت داشته باشد` : `${r[t.format] ?? e.format} نامعتبر`;
			}
			case "not_multiple_of": return `عدد نامعتبر: باید مضرب ${e.divisor} باشد`;
			case "unrecognized_keys": return `کلید${e.keys.length > 1 ? "های" : ""} ناشناس: ${I(e.keys, ", ")}`;
			case "invalid_key": return `کلید ناشناس در ${e.origin}`;
			case "invalid_union": return "ورودی نامعتبر";
			case "invalid_element": return `مقدار نامعتبر در ${e.origin}`;
			default: return "ورودی نامعتبر";
		}
	};
};
function ao() {
	return { localeError: io() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fi.js
var oo = () => {
	let e = {
		string: {
			unit: "merkkiä",
			subject: "merkkijonon"
		},
		file: {
			unit: "tavua",
			subject: "tiedoston"
		},
		array: {
			unit: "alkiota",
			subject: "listan"
		},
		set: {
			unit: "alkiota",
			subject: "joukon"
		},
		number: {
			unit: "",
			subject: "luvun"
		},
		bigint: {
			unit: "",
			subject: "suuren kokonaisluvun"
		},
		int: {
			unit: "",
			subject: "kokonaisluvun"
		},
		date: {
			unit: "",
			subject: "päivämäärän"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "säännöllinen lauseke",
		email: "sähköpostiosoite",
		url: "URL-osoite",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-aikaleima",
		date: "ISO-päivämäärä",
		time: "ISO-aika",
		duration: "ISO-kesto",
		ipv4: "IPv4-osoite",
		ipv6: "IPv6-osoite",
		cidrv4: "IPv4-alue",
		cidrv6: "IPv6-alue",
		base64: "base64-koodattu merkkijono",
		base64url: "base64url-koodattu merkkijono",
		json_string: "JSON-merkkijono",
		e164: "E.164-luku",
		jwt: "JWT",
		template_literal: "templaattimerkkijono"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Virheellinen tyyppi: odotettiin ${e.expected}, oli ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Virheellinen syöte: täytyy olla ${z(e.values[0])}` : `Virheellinen valinta: täytyy olla yksi seuraavista: ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Liian suuri: ${r.subject} täytyy olla ${n}${e.maximum.toString()} ${r.unit}`.trim() : `Liian suuri: arvon täytyy olla ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Liian pieni: ${r.subject} täytyy olla ${n}${e.minimum.toString()} ${r.unit}`.trim() : `Liian pieni: arvon täytyy olla ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Virheellinen syöte: täytyy alkaa "${t.prefix}"` : t.format === "ends_with" ? `Virheellinen syöte: täytyy loppua "${t.suffix}"` : t.format === "includes" ? `Virheellinen syöte: täytyy sisältää "${t.includes}"` : t.format === "regex" ? `Virheellinen syöte: täytyy vastata säännöllistä lauseketta ${t.pattern}` : `Virheellinen ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Virheellinen luku: täytyy olla luvun ${e.divisor} monikerta`;
			case "unrecognized_keys": return `${e.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return "Virheellinen avain tietueessa";
			case "invalid_union": return "Virheellinen unioni";
			case "invalid_element": return "Virheellinen arvo joukossa";
			default: return "Virheellinen syöte";
		}
	};
};
function so() {
	return { localeError: oo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fr.js
var co = () => {
	let e = {
		string: {
			unit: "caractères",
			verb: "avoir"
		},
		file: {
			unit: "octets",
			verb: "avoir"
		},
		array: {
			unit: "éléments",
			verb: "avoir"
		},
		set: {
			unit: "éléments",
			verb: "avoir"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "nombre";
			case "object":
				if (Array.isArray(e)) return "tableau";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "entrée",
		email: "adresse e-mail",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "date et heure ISO",
		date: "date ISO",
		time: "heure ISO",
		duration: "durée ISO",
		ipv4: "adresse IPv4",
		ipv6: "adresse IPv6",
		cidrv4: "plage IPv4",
		cidrv6: "plage IPv6",
		base64: "chaîne encodée en base64",
		base64url: "chaîne encodée en base64url",
		json_string: "chaîne JSON",
		e164: "numéro E.164",
		jwt: "JWT",
		template_literal: "entrée"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Entrée invalide : ${e.expected} attendu, ${n(e.input)} reçu`;
			case "invalid_value": return e.values.length === 1 ? `Entrée invalide : ${z(e.values[0])} attendu` : `Option invalide : une valeur parmi ${I(e.values, "|")} attendue`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Trop grand : ${e.origin ?? "valeur"} doit ${r.verb} ${n}${e.maximum.toString()} ${r.unit ?? "élément(s)"}` : `Trop grand : ${e.origin ?? "valeur"} doit être ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Trop petit : ${e.origin} doit ${r.verb} ${n}${e.minimum.toString()} ${r.unit}` : `Trop petit : ${e.origin} doit être ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Chaîne invalide : doit commencer par "${t.prefix}"` : t.format === "ends_with" ? `Chaîne invalide : doit se terminer par "${t.suffix}"` : t.format === "includes" ? `Chaîne invalide : doit inclure "${t.includes}"` : t.format === "regex" ? `Chaîne invalide : doit correspondre au modèle ${t.pattern}` : `${r[t.format] ?? e.format} invalide`;
			}
			case "not_multiple_of": return `Nombre invalide : doit être un multiple de ${e.divisor}`;
			case "unrecognized_keys": return `Clé${e.keys.length > 1 ? "s" : ""} non reconnue${e.keys.length > 1 ? "s" : ""} : ${I(e.keys, ", ")}`;
			case "invalid_key": return `Clé invalide dans ${e.origin}`;
			case "invalid_union": return "Entrée invalide";
			case "invalid_element": return `Valeur invalide dans ${e.origin}`;
			default: return "Entrée invalide";
		}
	};
};
function lo() {
	return { localeError: co() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/fr-CA.js
var uo = () => {
	let e = {
		string: {
			unit: "caractères",
			verb: "avoir"
		},
		file: {
			unit: "octets",
			verb: "avoir"
		},
		array: {
			unit: "éléments",
			verb: "avoir"
		},
		set: {
			unit: "éléments",
			verb: "avoir"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "entrée",
		email: "adresse courriel",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "date-heure ISO",
		date: "date ISO",
		time: "heure ISO",
		duration: "durée ISO",
		ipv4: "adresse IPv4",
		ipv6: "adresse IPv6",
		cidrv4: "plage IPv4",
		cidrv6: "plage IPv6",
		base64: "chaîne encodée en base64",
		base64url: "chaîne encodée en base64url",
		json_string: "chaîne JSON",
		e164: "numéro E.164",
		jwt: "JWT",
		template_literal: "entrée"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Entrée invalide : attendu ${e.expected}, reçu ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Entrée invalide : attendu ${z(e.values[0])}` : `Option invalide : attendu l'une des valeurs suivantes ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "≤" : "<", r = t(e.origin);
				return r ? `Trop grand : attendu que ${e.origin ?? "la valeur"} ait ${n}${e.maximum.toString()} ${r.unit}` : `Trop grand : attendu que ${e.origin ?? "la valeur"} soit ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? "≥" : ">", r = t(e.origin);
				return r ? `Trop petit : attendu que ${e.origin} ait ${n}${e.minimum.toString()} ${r.unit}` : `Trop petit : attendu que ${e.origin} soit ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Chaîne invalide : doit commencer par "${t.prefix}"` : t.format === "ends_with" ? `Chaîne invalide : doit se terminer par "${t.suffix}"` : t.format === "includes" ? `Chaîne invalide : doit inclure "${t.includes}"` : t.format === "regex" ? `Chaîne invalide : doit correspondre au motif ${t.pattern}` : `${r[t.format] ?? e.format} invalide`;
			}
			case "not_multiple_of": return `Nombre invalide : doit être un multiple de ${e.divisor}`;
			case "unrecognized_keys": return `Clé${e.keys.length > 1 ? "s" : ""} non reconnue${e.keys.length > 1 ? "s" : ""} : ${I(e.keys, ", ")}`;
			case "invalid_key": return `Clé invalide dans ${e.origin}`;
			case "invalid_union": return "Entrée invalide";
			case "invalid_element": return `Valeur invalide dans ${e.origin}`;
			default: return "Entrée invalide";
		}
	};
};
function fo() {
	return { localeError: uo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/he.js
var po = () => {
	let e = {
		string: {
			label: "מחרוזת",
			gender: "f"
		},
		number: {
			label: "מספר",
			gender: "m"
		},
		boolean: {
			label: "ערך בוליאני",
			gender: "m"
		},
		bigint: {
			label: "BigInt",
			gender: "m"
		},
		date: {
			label: "תאריך",
			gender: "m"
		},
		array: {
			label: "מערך",
			gender: "m"
		},
		object: {
			label: "אובייקט",
			gender: "m"
		},
		null: {
			label: "ערך ריק (null)",
			gender: "m"
		},
		undefined: {
			label: "ערך לא מוגדר (undefined)",
			gender: "m"
		},
		symbol: {
			label: "סימבול (Symbol)",
			gender: "m"
		},
		function: {
			label: "פונקציה",
			gender: "f"
		},
		map: {
			label: "מפה (Map)",
			gender: "f"
		},
		set: {
			label: "קבוצה (Set)",
			gender: "f"
		},
		file: {
			label: "קובץ",
			gender: "m"
		},
		promise: {
			label: "Promise",
			gender: "m"
		},
		NaN: {
			label: "NaN",
			gender: "m"
		},
		unknown: {
			label: "ערך לא ידוע",
			gender: "m"
		},
		value: {
			label: "ערך",
			gender: "m"
		}
	}, t = {
		string: {
			unit: "תווים",
			shortLabel: "קצר",
			longLabel: "ארוך"
		},
		file: {
			unit: "בייטים",
			shortLabel: "קטן",
			longLabel: "גדול"
		},
		array: {
			unit: "פריטים",
			shortLabel: "קטן",
			longLabel: "גדול"
		},
		set: {
			unit: "פריטים",
			shortLabel: "קטן",
			longLabel: "גדול"
		},
		number: {
			unit: "",
			shortLabel: "קטן",
			longLabel: "גדול"
		}
	}, n = (t) => t ? e[t] : void 0, r = (t) => {
		let r = n(t);
		return r ? r.label : t ?? e.unknown.label;
	}, i = (e) => `ה${r(e)}`, a = (e) => (n(e)?.gender ?? "m") === "f" ? "צריכה להיות" : "צריך להיות", o = (e) => e ? t[e] ?? null : null, s = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object": return Array.isArray(e) ? "array" : e === null ? "null" : Object.getPrototypeOf(e) !== Object.prototype && e.constructor ? e.constructor.name : "object";
			default: return t;
		}
	}, c = {
		regex: {
			label: "קלט",
			gender: "m"
		},
		email: {
			label: "כתובת אימייל",
			gender: "f"
		},
		url: {
			label: "כתובת רשת",
			gender: "f"
		},
		emoji: {
			label: "אימוג'י",
			gender: "m"
		},
		uuid: {
			label: "UUID",
			gender: "m"
		},
		nanoid: {
			label: "nanoid",
			gender: "m"
		},
		guid: {
			label: "GUID",
			gender: "m"
		},
		cuid: {
			label: "cuid",
			gender: "m"
		},
		cuid2: {
			label: "cuid2",
			gender: "m"
		},
		ulid: {
			label: "ULID",
			gender: "m"
		},
		xid: {
			label: "XID",
			gender: "m"
		},
		ksuid: {
			label: "KSUID",
			gender: "m"
		},
		datetime: {
			label: "תאריך וזמן ISO",
			gender: "m"
		},
		date: {
			label: "תאריך ISO",
			gender: "m"
		},
		time: {
			label: "זמן ISO",
			gender: "m"
		},
		duration: {
			label: "משך זמן ISO",
			gender: "m"
		},
		ipv4: {
			label: "כתובת IPv4",
			gender: "f"
		},
		ipv6: {
			label: "כתובת IPv6",
			gender: "f"
		},
		cidrv4: {
			label: "טווח IPv4",
			gender: "m"
		},
		cidrv6: {
			label: "טווח IPv6",
			gender: "m"
		},
		base64: {
			label: "מחרוזת בבסיס 64",
			gender: "f"
		},
		base64url: {
			label: "מחרוזת בבסיס 64 לכתובות רשת",
			gender: "f"
		},
		json_string: {
			label: "מחרוזת JSON",
			gender: "f"
		},
		e164: {
			label: "מספר E.164",
			gender: "m"
		},
		jwt: {
			label: "JWT",
			gender: "m"
		},
		ends_with: {
			label: "קלט",
			gender: "m"
		},
		includes: {
			label: "קלט",
			gender: "m"
		},
		lowercase: {
			label: "קלט",
			gender: "m"
		},
		starts_with: {
			label: "קלט",
			gender: "m"
		},
		uppercase: {
			label: "קלט",
			gender: "m"
		}
	};
	return (t) => {
		switch (t.code) {
			case "invalid_type": {
				let n = t.expected, i = r(n), a = s(t.input);
				return `קלט לא תקין: צריך להיות ${i}, התקבל ${e[a]?.label ?? a}`;
			}
			case "invalid_value": {
				if (t.values.length === 1) return `ערך לא תקין: הערך חייב להיות ${z(t.values[0])}`;
				let e = t.values.map((e) => z(e));
				if (t.values.length === 2) return `ערך לא תקין: האפשרויות המתאימות הן ${e[0]} או ${e[1]}`;
				let n = e[e.length - 1];
				return `ערך לא תקין: האפשרויות המתאימות הן ${e.slice(0, -1).join(", ")} או ${n}`;
			}
			case "too_big": {
				let e = o(t.origin), n = i(t.origin ?? "value");
				if (t.origin === "string") return `${e?.longLabel ?? "ארוך"} מדי: ${n} צריכה להכיל ${t.maximum.toString()} ${e?.unit ?? ""} ${t.inclusive ? "או פחות" : "לכל היותר"}`.trim();
				if (t.origin === "number") return `גדול מדי: ${n} צריך להיות ${t.inclusive ? `קטן או שווה ל-${t.maximum}` : `קטן מ-${t.maximum}`}`;
				if (t.origin === "array" || t.origin === "set") return `גדול מדי: ${n} ${t.origin === "set" ? "צריכה" : "צריך"} להכיל ${t.inclusive ? `${t.maximum} ${e?.unit ?? ""} או פחות` : `פחות מ-${t.maximum} ${e?.unit ?? ""}`}`.trim();
				let r = t.inclusive ? "<=" : "<", s = a(t.origin ?? "value");
				return e?.unit ? `${e.longLabel} מדי: ${n} ${s} ${r}${t.maximum.toString()} ${e.unit}` : `${e?.longLabel ?? "גדול"} מדי: ${n} ${s} ${r}${t.maximum.toString()}`;
			}
			case "too_small": {
				let e = o(t.origin), n = i(t.origin ?? "value");
				if (t.origin === "string") return `${e?.shortLabel ?? "קצר"} מדי: ${n} צריכה להכיל ${t.minimum.toString()} ${e?.unit ?? ""} ${t.inclusive ? "או יותר" : "לפחות"}`.trim();
				if (t.origin === "number") return `קטן מדי: ${n} צריך להיות ${t.inclusive ? `גדול או שווה ל-${t.minimum}` : `גדול מ-${t.minimum}`}`;
				if (t.origin === "array" || t.origin === "set") {
					let r = t.origin === "set" ? "צריכה" : "צריך";
					return t.minimum === 1 && t.inclusive ? `קטן מדי: ${n} ${r} להכיל ${t.origin, "לפחות פריט אחד"}` : `קטן מדי: ${n} ${r} להכיל ${t.inclusive ? `${t.minimum} ${e?.unit ?? ""} או יותר` : `יותר מ-${t.minimum} ${e?.unit ?? ""}`}`.trim();
				}
				let r = t.inclusive ? ">=" : ">", s = a(t.origin ?? "value");
				return e?.unit ? `${e.shortLabel} מדי: ${n} ${s} ${r}${t.minimum.toString()} ${e.unit}` : `${e?.shortLabel ?? "קטן"} מדי: ${n} ${s} ${r}${t.minimum.toString()}`;
			}
			case "invalid_format": {
				let e = t;
				if (e.format === "starts_with") return `המחרוזת חייבת להתחיל ב "${e.prefix}"`;
				if (e.format === "ends_with") return `המחרוזת חייבת להסתיים ב "${e.suffix}"`;
				if (e.format === "includes") return `המחרוזת חייבת לכלול "${e.includes}"`;
				if (e.format === "regex") return `המחרוזת חייבת להתאים לתבנית ${e.pattern}`;
				let n = c[e.format];
				return `${n?.label ?? e.format} לא ${(n?.gender ?? "m") === "f" ? "תקינה" : "תקין"}`;
			}
			case "not_multiple_of": return `מספר לא תקין: חייב להיות מכפלה של ${t.divisor}`;
			case "unrecognized_keys": return `מפתח${t.keys.length > 1 ? "ות" : ""} לא מזוה${t.keys.length > 1 ? "ים" : "ה"}: ${I(t.keys, ", ")}`;
			case "invalid_key": return "שדה לא תקין באובייקט";
			case "invalid_union": return "קלט לא תקין";
			case "invalid_element": return `ערך לא תקין ב${i(t.origin ?? "array")}`;
			default: return "קלט לא תקין";
		}
	};
};
function mo() {
	return { localeError: po() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/hu.js
var ho = () => {
	let e = {
		string: {
			unit: "karakter",
			verb: "legyen"
		},
		file: {
			unit: "byte",
			verb: "legyen"
		},
		array: {
			unit: "elem",
			verb: "legyen"
		},
		set: {
			unit: "elem",
			verb: "legyen"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "szám";
			case "object":
				if (Array.isArray(e)) return "tömb";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "bemenet",
		email: "email cím",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO időbélyeg",
		date: "ISO dátum",
		time: "ISO idő",
		duration: "ISO időintervallum",
		ipv4: "IPv4 cím",
		ipv6: "IPv6 cím",
		cidrv4: "IPv4 tartomány",
		cidrv6: "IPv6 tartomány",
		base64: "base64-kódolt string",
		base64url: "base64url-kódolt string",
		json_string: "JSON string",
		e164: "E.164 szám",
		jwt: "JWT",
		template_literal: "bemenet"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Érvénytelen bemenet: a várt érték ${e.expected}, a kapott érték ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Érvénytelen bemenet: a várt érték ${z(e.values[0])}` : `Érvénytelen opció: valamelyik érték várt ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Túl nagy: ${e.origin ?? "érték"} mérete túl nagy ${n}${e.maximum.toString()} ${r.unit ?? "elem"}` : `Túl nagy: a bemeneti érték ${e.origin ?? "érték"} túl nagy: ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Túl kicsi: a bemeneti érték ${e.origin} mérete túl kicsi ${n}${e.minimum.toString()} ${r.unit}` : `Túl kicsi: a bemeneti érték ${e.origin} túl kicsi ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Érvénytelen string: "${t.prefix}" értékkel kell kezdődnie` : t.format === "ends_with" ? `Érvénytelen string: "${t.suffix}" értékkel kell végződnie` : t.format === "includes" ? `Érvénytelen string: "${t.includes}" értéket kell tartalmaznia` : t.format === "regex" ? `Érvénytelen string: ${t.pattern} mintának kell megfelelnie` : `Érvénytelen ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Érvénytelen szám: ${e.divisor} többszörösének kell lennie`;
			case "unrecognized_keys": return `Ismeretlen kulcs${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Érvénytelen kulcs ${e.origin}`;
			case "invalid_union": return "Érvénytelen bemenet";
			case "invalid_element": return `Érvénytelen érték: ${e.origin}`;
			default: return "Érvénytelen bemenet";
		}
	};
};
function go() {
	return { localeError: ho() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/id.js
var _o = () => {
	let e = {
		string: {
			unit: "karakter",
			verb: "memiliki"
		},
		file: {
			unit: "byte",
			verb: "memiliki"
		},
		array: {
			unit: "item",
			verb: "memiliki"
		},
		set: {
			unit: "item",
			verb: "memiliki"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "input",
		email: "alamat email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "tanggal dan waktu format ISO",
		date: "tanggal format ISO",
		time: "jam format ISO",
		duration: "durasi format ISO",
		ipv4: "alamat IPv4",
		ipv6: "alamat IPv6",
		cidrv4: "rentang alamat IPv4",
		cidrv6: "rentang alamat IPv6",
		base64: "string dengan enkode base64",
		base64url: "string dengan enkode base64url",
		json_string: "string JSON",
		e164: "angka E.164",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Input tidak valid: diharapkan ${e.expected}, diterima ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Input tidak valid: diharapkan ${z(e.values[0])}` : `Pilihan tidak valid: diharapkan salah satu dari ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Terlalu besar: diharapkan ${e.origin ?? "value"} memiliki ${n}${e.maximum.toString()} ${r.unit ?? "elemen"}` : `Terlalu besar: diharapkan ${e.origin ?? "value"} menjadi ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Terlalu kecil: diharapkan ${e.origin} memiliki ${n}${e.minimum.toString()} ${r.unit}` : `Terlalu kecil: diharapkan ${e.origin} menjadi ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `String tidak valid: harus dimulai dengan "${t.prefix}"` : t.format === "ends_with" ? `String tidak valid: harus berakhir dengan "${t.suffix}"` : t.format === "includes" ? `String tidak valid: harus menyertakan "${t.includes}"` : t.format === "regex" ? `String tidak valid: harus sesuai pola ${t.pattern}` : `${r[t.format] ?? e.format} tidak valid`;
			}
			case "not_multiple_of": return `Angka tidak valid: harus kelipatan dari ${e.divisor}`;
			case "unrecognized_keys": return `Kunci tidak dikenali ${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Kunci tidak valid di ${e.origin}`;
			case "invalid_union": return "Input tidak valid";
			case "invalid_element": return `Nilai tidak valid di ${e.origin}`;
			default: return "Input tidak valid";
		}
	};
};
function vo() {
	return { localeError: _o() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/is.js
var yo = (e) => {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "NaN" : "númer";
		case "object":
			if (Array.isArray(e)) return "fylki";
			if (e === null) return "null";
			if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
	}
	return t;
}, bo = () => {
	let e = {
		string: {
			unit: "stafi",
			verb: "að hafa"
		},
		file: {
			unit: "bæti",
			verb: "að hafa"
		},
		array: {
			unit: "hluti",
			verb: "að hafa"
		},
		set: {
			unit: "hluti",
			verb: "að hafa"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "gildi",
		email: "netfang",
		url: "vefslóð",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO dagsetning og tími",
		date: "ISO dagsetning",
		time: "ISO tími",
		duration: "ISO tímalengd",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded strengur",
		base64url: "base64url-encoded strengur",
		json_string: "JSON strengur",
		e164: "E.164 tölugildi",
		jwt: "JWT",
		template_literal: "gildi"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Rangt gildi: Þú slóst inn ${yo(e.input)} þar sem á að vera ${e.expected}`;
			case "invalid_value": return e.values.length === 1 ? `Rangt gildi: gert ráð fyrir ${z(e.values[0])}` : `Ógilt val: má vera eitt af eftirfarandi ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Of stórt: gert er ráð fyrir að ${e.origin ?? "gildi"} hafi ${n}${e.maximum.toString()} ${r.unit ?? "hluti"}` : `Of stórt: gert er ráð fyrir að ${e.origin ?? "gildi"} sé ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Of lítið: gert er ráð fyrir að ${e.origin} hafi ${n}${e.minimum.toString()} ${r.unit}` : `Of lítið: gert er ráð fyrir að ${e.origin} sé ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ógildur strengur: verður að byrja á "${t.prefix}"` : t.format === "ends_with" ? `Ógildur strengur: verður að enda á "${t.suffix}"` : t.format === "includes" ? `Ógildur strengur: verður að innihalda "${t.includes}"` : t.format === "regex" ? `Ógildur strengur: verður að fylgja mynstri ${t.pattern}` : `Rangt ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Röng tala: verður að vera margfeldi af ${e.divisor}`;
			case "unrecognized_keys": return `Óþekkt ${e.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Rangur lykill í ${e.origin}`;
			case "invalid_union": return "Rangt gildi";
			case "invalid_element": return `Rangt gildi í ${e.origin}`;
			default: return "Rangt gildi";
		}
	};
};
function xo() {
	return { localeError: bo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/it.js
var So = () => {
	let e = {
		string: {
			unit: "caratteri",
			verb: "avere"
		},
		file: {
			unit: "byte",
			verb: "avere"
		},
		array: {
			unit: "elementi",
			verb: "avere"
		},
		set: {
			unit: "elementi",
			verb: "avere"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "numero";
			case "object":
				if (Array.isArray(e)) return "vettore";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "input",
		email: "indirizzo email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data e ora ISO",
		date: "data ISO",
		time: "ora ISO",
		duration: "durata ISO",
		ipv4: "indirizzo IPv4",
		ipv6: "indirizzo IPv6",
		cidrv4: "intervallo IPv4",
		cidrv6: "intervallo IPv6",
		base64: "stringa codificata in base64",
		base64url: "URL codificata in base64",
		json_string: "stringa JSON",
		e164: "numero E.164",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Input non valido: atteso ${e.expected}, ricevuto ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Input non valido: atteso ${z(e.values[0])}` : `Opzione non valida: atteso uno tra ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Troppo grande: ${e.origin ?? "valore"} deve avere ${n}${e.maximum.toString()} ${r.unit ?? "elementi"}` : `Troppo grande: ${e.origin ?? "valore"} deve essere ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Troppo piccolo: ${e.origin} deve avere ${n}${e.minimum.toString()} ${r.unit}` : `Troppo piccolo: ${e.origin} deve essere ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Stringa non valida: deve iniziare con "${t.prefix}"` : t.format === "ends_with" ? `Stringa non valida: deve terminare con "${t.suffix}"` : t.format === "includes" ? `Stringa non valida: deve includere "${t.includes}"` : t.format === "regex" ? `Stringa non valida: deve corrispondere al pattern ${t.pattern}` : `Invalid ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Numero non valido: deve essere un multiplo di ${e.divisor}`;
			case "unrecognized_keys": return `Chiav${e.keys.length > 1 ? "i" : "e"} non riconosciut${e.keys.length > 1 ? "e" : "a"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Chiave non valida in ${e.origin}`;
			case "invalid_union": return "Input non valido";
			case "invalid_element": return `Valore non valido in ${e.origin}`;
			default: return "Input non valido";
		}
	};
};
function Co() {
	return { localeError: So() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ja.js
var wo = () => {
	let e = {
		string: {
			unit: "文字",
			verb: "である"
		},
		file: {
			unit: "バイト",
			verb: "である"
		},
		array: {
			unit: "要素",
			verb: "である"
		},
		set: {
			unit: "要素",
			verb: "である"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "数値";
			case "object":
				if (Array.isArray(e)) return "配列";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "入力値",
		email: "メールアドレス",
		url: "URL",
		emoji: "絵文字",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO日時",
		date: "ISO日付",
		time: "ISO時刻",
		duration: "ISO期間",
		ipv4: "IPv4アドレス",
		ipv6: "IPv6アドレス",
		cidrv4: "IPv4範囲",
		cidrv6: "IPv6範囲",
		base64: "base64エンコード文字列",
		base64url: "base64urlエンコード文字列",
		json_string: "JSON文字列",
		e164: "E.164番号",
		jwt: "JWT",
		template_literal: "入力値"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `無効な入力: ${e.expected}が期待されましたが、${n(e.input)}が入力されました`;
			case "invalid_value": return e.values.length === 1 ? `無効な入力: ${z(e.values[0])}が期待されました` : `無効な選択: ${I(e.values, "、")}のいずれかである必要があります`;
			case "too_big": {
				let n = e.inclusive ? "以下である" : "より小さい", r = t(e.origin);
				return r ? `大きすぎる値: ${e.origin ?? "値"}は${e.maximum.toString()}${r.unit ?? "要素"}${n}必要があります` : `大きすぎる値: ${e.origin ?? "値"}は${e.maximum.toString()}${n}必要があります`;
			}
			case "too_small": {
				let n = e.inclusive ? "以上である" : "より大きい", r = t(e.origin);
				return r ? `小さすぎる値: ${e.origin}は${e.minimum.toString()}${r.unit}${n}必要があります` : `小さすぎる値: ${e.origin}は${e.minimum.toString()}${n}必要があります`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `無効な文字列: "${t.prefix}"で始まる必要があります` : t.format === "ends_with" ? `無効な文字列: "${t.suffix}"で終わる必要があります` : t.format === "includes" ? `無効な文字列: "${t.includes}"を含む必要があります` : t.format === "regex" ? `無効な文字列: パターン${t.pattern}に一致する必要があります` : `無効な${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `無効な数値: ${e.divisor}の倍数である必要があります`;
			case "unrecognized_keys": return `認識されていないキー${e.keys.length > 1 ? "群" : ""}: ${I(e.keys, "、")}`;
			case "invalid_key": return `${e.origin}内の無効なキー`;
			case "invalid_union": return "無効な入力";
			case "invalid_element": return `${e.origin}内の無効な値`;
			default: return "無効な入力";
		}
	};
};
function To() {
	return { localeError: wo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ka.js
var Eo = (e) => {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "NaN" : "რიცხვი";
		case "object":
			if (Array.isArray(e)) return "მასივი";
			if (e === null) return "null";
			if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
	}
	return {
		string: "სტრინგი",
		boolean: "ბულეანი",
		undefined: "undefined",
		bigint: "bigint",
		symbol: "symbol",
		function: "ფუნქცია"
	}[t] ?? t;
}, Do = () => {
	let e = {
		string: {
			unit: "სიმბოლო",
			verb: "უნდა შეიცავდეს"
		},
		file: {
			unit: "ბაიტი",
			verb: "უნდა შეიცავდეს"
		},
		array: {
			unit: "ელემენტი",
			verb: "უნდა შეიცავდეს"
		},
		set: {
			unit: "ელემენტი",
			verb: "უნდა შეიცავდეს"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "შეყვანა",
		email: "ელ-ფოსტის მისამართი",
		url: "URL",
		emoji: "ემოჯი",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "თარიღი-დრო",
		date: "თარიღი",
		time: "დრო",
		duration: "ხანგრძლივობა",
		ipv4: "IPv4 მისამართი",
		ipv6: "IPv6 მისამართი",
		cidrv4: "IPv4 დიაპაზონი",
		cidrv6: "IPv6 დიაპაზონი",
		base64: "base64-კოდირებული სტრინგი",
		base64url: "base64url-კოდირებული სტრინგი",
		json_string: "JSON სტრინგი",
		e164: "E.164 ნომერი",
		jwt: "JWT",
		template_literal: "შეყვანა"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `არასწორი შეყვანა: მოსალოდნელი ${e.expected}, მიღებული ${Eo(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `არასწორი შეყვანა: მოსალოდნელი ${z(e.values[0])}` : `არასწორი ვარიანტი: მოსალოდნელია ერთ-ერთი ${I(e.values, "|")}-დან`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `ზედმეტად დიდი: მოსალოდნელი ${e.origin ?? "მნიშვნელობა"} ${r.verb} ${n}${e.maximum.toString()} ${r.unit}` : `ზედმეტად დიდი: მოსალოდნელი ${e.origin ?? "მნიშვნელობა"} იყოს ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `ზედმეტად პატარა: მოსალოდნელი ${e.origin} ${r.verb} ${n}${e.minimum.toString()} ${r.unit}` : `ზედმეტად პატარა: მოსალოდნელი ${e.origin} იყოს ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `არასწორი სტრინგი: უნდა იწყებოდეს "${t.prefix}"-ით` : t.format === "ends_with" ? `არასწორი სტრინგი: უნდა მთავრდებოდეს "${t.suffix}"-ით` : t.format === "includes" ? `არასწორი სტრინგი: უნდა შეიცავდეს "${t.includes}"-ს` : t.format === "regex" ? `არასწორი სტრინგი: უნდა შეესაბამებოდეს შაბლონს ${t.pattern}` : `არასწორი ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `არასწორი რიცხვი: უნდა იყოს ${e.divisor}-ის ჯერადი`;
			case "unrecognized_keys": return `უცნობი გასაღებ${e.keys.length > 1 ? "ები" : "ი"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `არასწორი გასაღები ${e.origin}-ში`;
			case "invalid_union": return "არასწორი შეყვანა";
			case "invalid_element": return `არასწორი მნიშვნელობა ${e.origin}-ში`;
			default: return "არასწორი შეყვანა";
		}
	};
};
function Oo() {
	return { localeError: Do() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/km.js
var ko = () => {
	let e = {
		string: {
			unit: "តួអក្សរ",
			verb: "គួរមាន"
		},
		file: {
			unit: "បៃ",
			verb: "គួរមាន"
		},
		array: {
			unit: "ធាតុ",
			verb: "គួរមាន"
		},
		set: {
			unit: "ធាតុ",
			verb: "គួរមាន"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "មិនមែនជាលេខ (NaN)" : "លេខ";
			case "object":
				if (Array.isArray(e)) return "អារេ (Array)";
				if (e === null) return "គ្មានតម្លៃ (null)";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ទិន្នន័យបញ្ចូល",
		email: "អាសយដ្ឋានអ៊ីមែល",
		url: "URL",
		emoji: "សញ្ញាអារម្មណ៍",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "កាលបរិច្ឆេទ និងម៉ោង ISO",
		date: "កាលបរិច្ឆេទ ISO",
		time: "ម៉ោង ISO",
		duration: "រយៈពេល ISO",
		ipv4: "អាសយដ្ឋាន IPv4",
		ipv6: "អាសយដ្ឋាន IPv6",
		cidrv4: "ដែនអាសយដ្ឋាន IPv4",
		cidrv6: "ដែនអាសយដ្ឋាន IPv6",
		base64: "ខ្សែអក្សរអ៊ិកូដ base64",
		base64url: "ខ្សែអក្សរអ៊ិកូដ base64url",
		json_string: "ខ្សែអក្សរ JSON",
		e164: "លេខ E.164",
		jwt: "JWT",
		template_literal: "ទិន្នន័យបញ្ចូល"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${e.expected} ប៉ុន្តែទទួលបាន ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${z(e.values[0])}` : `ជម្រើសមិនត្រឹមត្រូវ៖ ត្រូវជាមួយក្នុងចំណោម ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `ធំពេក៖ ត្រូវការ ${e.origin ?? "តម្លៃ"} ${n} ${e.maximum.toString()} ${r.unit ?? "ធាតុ"}` : `ធំពេក៖ ត្រូវការ ${e.origin ?? "តម្លៃ"} ${n} ${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `តូចពេក៖ ត្រូវការ ${e.origin} ${n} ${e.minimum.toString()} ${r.unit}` : `តូចពេក៖ ត្រូវការ ${e.origin} ${n} ${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវចាប់ផ្តើមដោយ "${t.prefix}"` : t.format === "ends_with" ? `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវបញ្ចប់ដោយ "${t.suffix}"` : t.format === "includes" ? `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវមាន "${t.includes}"` : t.format === "regex" ? `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវតែផ្គូផ្គងនឹងទម្រង់ដែលបានកំណត់ ${t.pattern}` : `មិនត្រឹមត្រូវ៖ ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `លេខមិនត្រឹមត្រូវ៖ ត្រូវតែជាពហុគុណនៃ ${e.divisor}`;
			case "unrecognized_keys": return `រកឃើញសោមិនស្គាល់៖ ${I(e.keys, ", ")}`;
			case "invalid_key": return `សោមិនត្រឹមត្រូវនៅក្នុង ${e.origin}`;
			case "invalid_union": return "ទិន្នន័យមិនត្រឹមត្រូវ";
			case "invalid_element": return `ទិន្នន័យមិនត្រឹមត្រូវនៅក្នុង ${e.origin}`;
			default: return "ទិន្នន័យមិនត្រឹមត្រូវ";
		}
	};
};
function Ao() {
	return { localeError: ko() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/kh.js
function jo() {
	return Ao();
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ko.js
var Mo = () => {
	let e = {
		string: {
			unit: "문자",
			verb: "to have"
		},
		file: {
			unit: "바이트",
			verb: "to have"
		},
		array: {
			unit: "개",
			verb: "to have"
		},
		set: {
			unit: "개",
			verb: "to have"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "입력",
		email: "이메일 주소",
		url: "URL",
		emoji: "이모지",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO 날짜시간",
		date: "ISO 날짜",
		time: "ISO 시간",
		duration: "ISO 기간",
		ipv4: "IPv4 주소",
		ipv6: "IPv6 주소",
		cidrv4: "IPv4 범위",
		cidrv6: "IPv6 범위",
		base64: "base64 인코딩 문자열",
		base64url: "base64url 인코딩 문자열",
		json_string: "JSON 문자열",
		e164: "E.164 번호",
		jwt: "JWT",
		template_literal: "입력"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `잘못된 입력: 예상 타입은 ${e.expected}, 받은 타입은 ${n(e.input)}입니다`;
			case "invalid_value": return e.values.length === 1 ? `잘못된 입력: 값은 ${z(e.values[0])} 이어야 합니다` : `잘못된 옵션: ${I(e.values, "또는 ")} 중 하나여야 합니다`;
			case "too_big": {
				let n = e.inclusive ? "이하" : "미만", r = n === "미만" ? "이어야 합니다" : "여야 합니다", i = t(e.origin), a = i?.unit ?? "요소";
				return i ? `${e.origin ?? "값"}이 너무 큽니다: ${e.maximum.toString()}${a} ${n}${r}` : `${e.origin ?? "값"}이 너무 큽니다: ${e.maximum.toString()} ${n}${r}`;
			}
			case "too_small": {
				let n = e.inclusive ? "이상" : "초과", r = n === "이상" ? "이어야 합니다" : "여야 합니다", i = t(e.origin), a = i?.unit ?? "요소";
				return i ? `${e.origin ?? "값"}이 너무 작습니다: ${e.minimum.toString()}${a} ${n}${r}` : `${e.origin ?? "값"}이 너무 작습니다: ${e.minimum.toString()} ${n}${r}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `잘못된 문자열: "${t.prefix}"(으)로 시작해야 합니다` : t.format === "ends_with" ? `잘못된 문자열: "${t.suffix}"(으)로 끝나야 합니다` : t.format === "includes" ? `잘못된 문자열: "${t.includes}"을(를) 포함해야 합니다` : t.format === "regex" ? `잘못된 문자열: 정규식 ${t.pattern} 패턴과 일치해야 합니다` : `잘못된 ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `잘못된 숫자: ${e.divisor}의 배수여야 합니다`;
			case "unrecognized_keys": return `인식할 수 없는 키: ${I(e.keys, ", ")}`;
			case "invalid_key": return `잘못된 키: ${e.origin}`;
			case "invalid_union": return "잘못된 입력";
			case "invalid_element": return `잘못된 값: ${e.origin}`;
			default: return "잘못된 입력";
		}
	};
};
function No() {
	return { localeError: Mo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/lt.js
var Po = (e) => Fo(typeof e, e), Fo = (e, t = void 0) => {
	switch (e) {
		case "number": return Number.isNaN(t) ? "NaN" : "skaičius";
		case "bigint": return "sveikasis skaičius";
		case "string": return "eilutė";
		case "boolean": return "loginė reikšmė";
		case "undefined":
		case "void": return "neapibrėžta reikšmė";
		case "function": return "funkcija";
		case "symbol": return "simbolis";
		case "object": return t === void 0 ? "nežinomas objektas" : t === null ? "nulinė reikšmė" : Array.isArray(t) ? "masyvas" : Object.getPrototypeOf(t) !== Object.prototype && t.constructor ? t.constructor.name : "objektas";
		case "null": return "nulinė reikšmė";
	}
	return e;
}, Io = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function Lo(e) {
	let t = Math.abs(e), n = t % 10, r = t % 100;
	return r >= 11 && r <= 19 || n === 0 ? "many" : n === 1 ? "one" : "few";
}
var Ro = () => {
	let e = {
		string: {
			unit: {
				one: "simbolis",
				few: "simboliai",
				many: "simbolių"
			},
			verb: {
				smaller: {
					inclusive: "turi būti ne ilgesnė kaip",
					notInclusive: "turi būti trumpesnė kaip"
				},
				bigger: {
					inclusive: "turi būti ne trumpesnė kaip",
					notInclusive: "turi būti ilgesnė kaip"
				}
			}
		},
		file: {
			unit: {
				one: "baitas",
				few: "baitai",
				many: "baitų"
			},
			verb: {
				smaller: {
					inclusive: "turi būti ne didesnis kaip",
					notInclusive: "turi būti mažesnis kaip"
				},
				bigger: {
					inclusive: "turi būti ne mažesnis kaip",
					notInclusive: "turi būti didesnis kaip"
				}
			}
		},
		array: {
			unit: {
				one: "elementą",
				few: "elementus",
				many: "elementų"
			},
			verb: {
				smaller: {
					inclusive: "turi turėti ne daugiau kaip",
					notInclusive: "turi turėti mažiau kaip"
				},
				bigger: {
					inclusive: "turi turėti ne mažiau kaip",
					notInclusive: "turi turėti daugiau kaip"
				}
			}
		},
		set: {
			unit: {
				one: "elementą",
				few: "elementus",
				many: "elementų"
			},
			verb: {
				smaller: {
					inclusive: "turi turėti ne daugiau kaip",
					notInclusive: "turi turėti mažiau kaip"
				},
				bigger: {
					inclusive: "turi turėti ne mažiau kaip",
					notInclusive: "turi turėti daugiau kaip"
				}
			}
		}
	};
	function t(t, n, r, i) {
		let a = e[t] ?? null;
		return a === null ? a : {
			unit: a.unit[n],
			verb: a.verb[i][r ? "inclusive" : "notInclusive"]
		};
	}
	let n = {
		regex: "įvestis",
		email: "el. pašto adresas",
		url: "URL",
		emoji: "jaustukas",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO data ir laikas",
		date: "ISO data",
		time: "ISO laikas",
		duration: "ISO trukmė",
		ipv4: "IPv4 adresas",
		ipv6: "IPv6 adresas",
		cidrv4: "IPv4 tinklo prefiksas (CIDR)",
		cidrv6: "IPv6 tinklo prefiksas (CIDR)",
		base64: "base64 užkoduota eilutė",
		base64url: "base64url užkoduota eilutė",
		json_string: "JSON eilutė",
		e164: "E.164 numeris",
		jwt: "JWT",
		template_literal: "įvestis"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Gautas tipas ${Po(e.input)}, o tikėtasi - ${Fo(e.expected)}`;
			case "invalid_value": return e.values.length === 1 ? `Privalo būti ${z(e.values[0])}` : `Privalo būti vienas iš ${I(e.values, "|")} pasirinkimų`;
			case "too_big": {
				let n = Fo(e.origin), r = t(e.origin, Lo(Number(e.maximum)), e.inclusive ?? !1, "smaller");
				if (r?.verb) return `${Io(n ?? e.origin ?? "reikšmė")} ${r.verb} ${e.maximum.toString()} ${r.unit ?? "elementų"}`;
				let i = e.inclusive ? "ne didesnis kaip" : "mažesnis kaip";
				return `${Io(n ?? e.origin ?? "reikšmė")} turi būti ${i} ${e.maximum.toString()} ${r?.unit}`;
			}
			case "too_small": {
				let n = Fo(e.origin), r = t(e.origin, Lo(Number(e.minimum)), e.inclusive ?? !1, "bigger");
				if (r?.verb) return `${Io(n ?? e.origin ?? "reikšmė")} ${r.verb} ${e.minimum.toString()} ${r.unit ?? "elementų"}`;
				let i = e.inclusive ? "ne mažesnis kaip" : "didesnis kaip";
				return `${Io(n ?? e.origin ?? "reikšmė")} turi būti ${i} ${e.minimum.toString()} ${r?.unit}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Eilutė privalo prasidėti "${t.prefix}"` : t.format === "ends_with" ? `Eilutė privalo pasibaigti "${t.suffix}"` : t.format === "includes" ? `Eilutė privalo įtraukti "${t.includes}"` : t.format === "regex" ? `Eilutė privalo atitikti ${t.pattern}` : `Neteisingas ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Skaičius privalo būti ${e.divisor} kartotinis.`;
			case "unrecognized_keys": return `Neatpažint${e.keys.length > 1 ? "i" : "as"} rakt${e.keys.length > 1 ? "ai" : "as"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return "Rastas klaidingas raktas";
			case "invalid_union": return "Klaidinga įvestis";
			case "invalid_element": return `${Io(Fo(e.origin) ?? e.origin ?? "reikšmė")} turi klaidingą įvestį`;
			default: return "Klaidinga įvestis";
		}
	};
};
function zo() {
	return { localeError: Ro() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/mk.js
var Bo = () => {
	let e = {
		string: {
			unit: "знаци",
			verb: "да имаат"
		},
		file: {
			unit: "бајти",
			verb: "да имаат"
		},
		array: {
			unit: "ставки",
			verb: "да имаат"
		},
		set: {
			unit: "ставки",
			verb: "да имаат"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "број";
			case "object":
				if (Array.isArray(e)) return "низа";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "внес",
		email: "адреса на е-пошта",
		url: "URL",
		emoji: "емоџи",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO датум и време",
		date: "ISO датум",
		time: "ISO време",
		duration: "ISO времетраење",
		ipv4: "IPv4 адреса",
		ipv6: "IPv6 адреса",
		cidrv4: "IPv4 опсег",
		cidrv6: "IPv6 опсег",
		base64: "base64-енкодирана низа",
		base64url: "base64url-енкодирана низа",
		json_string: "JSON низа",
		e164: "E.164 број",
		jwt: "JWT",
		template_literal: "внес"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Грешен внес: се очекува ${e.expected}, примено ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${z(e.values[0])}` : `Грешана опција: се очекува една ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Премногу голем: се очекува ${e.origin ?? "вредноста"} да има ${n}${e.maximum.toString()} ${r.unit ?? "елементи"}` : `Премногу голем: се очекува ${e.origin ?? "вредноста"} да биде ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Премногу мал: се очекува ${e.origin} да има ${n}${e.minimum.toString()} ${r.unit}` : `Премногу мал: се очекува ${e.origin} да биде ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Неважечка низа: мора да започнува со "${t.prefix}"` : t.format === "ends_with" ? `Неважечка низа: мора да завршува со "${t.suffix}"` : t.format === "includes" ? `Неважечка низа: мора да вклучува "${t.includes}"` : t.format === "regex" ? `Неважечка низа: мора да одгоара на патернот ${t.pattern}` : `Invalid ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Грешен број: мора да биде делив со ${e.divisor}`;
			case "unrecognized_keys": return `${e.keys.length > 1 ? "Непрепознаени клучеви" : "Непрепознаен клуч"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Грешен клуч во ${e.origin}`;
			case "invalid_union": return "Грешен внес";
			case "invalid_element": return `Грешна вредност во ${e.origin}`;
			default: return "Грешен внес";
		}
	};
};
function Vo() {
	return { localeError: Bo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ms.js
var Ho = () => {
	let e = {
		string: {
			unit: "aksara",
			verb: "mempunyai"
		},
		file: {
			unit: "bait",
			verb: "mempunyai"
		},
		array: {
			unit: "elemen",
			verb: "mempunyai"
		},
		set: {
			unit: "elemen",
			verb: "mempunyai"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "nombor";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "input",
		email: "alamat e-mel",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "tarikh masa ISO",
		date: "tarikh ISO",
		time: "masa ISO",
		duration: "tempoh ISO",
		ipv4: "alamat IPv4",
		ipv6: "alamat IPv6",
		cidrv4: "julat IPv4",
		cidrv6: "julat IPv6",
		base64: "string dikodkan base64",
		base64url: "string dikodkan base64url",
		json_string: "string JSON",
		e164: "nombor E.164",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Input tidak sah: dijangka ${e.expected}, diterima ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Input tidak sah: dijangka ${z(e.values[0])}` : `Pilihan tidak sah: dijangka salah satu daripada ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Terlalu besar: dijangka ${e.origin ?? "nilai"} ${r.verb} ${n}${e.maximum.toString()} ${r.unit ?? "elemen"}` : `Terlalu besar: dijangka ${e.origin ?? "nilai"} adalah ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Terlalu kecil: dijangka ${e.origin} ${r.verb} ${n}${e.minimum.toString()} ${r.unit}` : `Terlalu kecil: dijangka ${e.origin} adalah ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `String tidak sah: mesti bermula dengan "${t.prefix}"` : t.format === "ends_with" ? `String tidak sah: mesti berakhir dengan "${t.suffix}"` : t.format === "includes" ? `String tidak sah: mesti mengandungi "${t.includes}"` : t.format === "regex" ? `String tidak sah: mesti sepadan dengan corak ${t.pattern}` : `${r[t.format] ?? e.format} tidak sah`;
			}
			case "not_multiple_of": return `Nombor tidak sah: perlu gandaan ${e.divisor}`;
			case "unrecognized_keys": return `Kunci tidak dikenali: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Kunci tidak sah dalam ${e.origin}`;
			case "invalid_union": return "Input tidak sah";
			case "invalid_element": return `Nilai tidak sah dalam ${e.origin}`;
			default: return "Input tidak sah";
		}
	};
};
function Uo() {
	return { localeError: Ho() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/nl.js
var Wo = () => {
	let e = {
		string: {
			unit: "tekens",
			verb: "te hebben"
		},
		file: {
			unit: "bytes",
			verb: "te hebben"
		},
		array: {
			unit: "elementen",
			verb: "te hebben"
		},
		set: {
			unit: "elementen",
			verb: "te hebben"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "getal";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "invoer",
		email: "emailadres",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datum en tijd",
		date: "ISO datum",
		time: "ISO tijd",
		duration: "ISO duur",
		ipv4: "IPv4-adres",
		ipv6: "IPv6-adres",
		cidrv4: "IPv4-bereik",
		cidrv6: "IPv6-bereik",
		base64: "base64-gecodeerde tekst",
		base64url: "base64 URL-gecodeerde tekst",
		json_string: "JSON string",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "invoer"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Ongeldige invoer: verwacht ${e.expected}, ontving ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Ongeldige invoer: verwacht ${z(e.values[0])}` : `Ongeldige optie: verwacht één van ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Te groot: verwacht dat ${e.origin ?? "waarde"} ${r.verb} ${n}${e.maximum.toString()} ${r.unit ?? "elementen"}` : `Te groot: verwacht dat ${e.origin ?? "waarde"} ${n}${e.maximum.toString()} is`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Te klein: verwacht dat ${e.origin} ${r.verb} ${n}${e.minimum.toString()} ${r.unit}` : `Te klein: verwacht dat ${e.origin} ${n}${e.minimum.toString()} is`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ongeldige tekst: moet met "${t.prefix}" beginnen` : t.format === "ends_with" ? `Ongeldige tekst: moet op "${t.suffix}" eindigen` : t.format === "includes" ? `Ongeldige tekst: moet "${t.includes}" bevatten` : t.format === "regex" ? `Ongeldige tekst: moet overeenkomen met patroon ${t.pattern}` : `Ongeldig: ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Ongeldig getal: moet een veelvoud van ${e.divisor} zijn`;
			case "unrecognized_keys": return `Onbekende key${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Ongeldige key in ${e.origin}`;
			case "invalid_union": return "Ongeldige invoer";
			case "invalid_element": return `Ongeldige waarde in ${e.origin}`;
			default: return "Ongeldige invoer";
		}
	};
};
function Go() {
	return { localeError: Wo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/no.js
var Ko = () => {
	let e = {
		string: {
			unit: "tegn",
			verb: "å ha"
		},
		file: {
			unit: "bytes",
			verb: "å ha"
		},
		array: {
			unit: "elementer",
			verb: "å inneholde"
		},
		set: {
			unit: "elementer",
			verb: "å inneholde"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "tall";
			case "object":
				if (Array.isArray(e)) return "liste";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "input",
		email: "e-postadresse",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO dato- og klokkeslett",
		date: "ISO-dato",
		time: "ISO-klokkeslett",
		duration: "ISO-varighet",
		ipv4: "IPv4-område",
		ipv6: "IPv6-område",
		cidrv4: "IPv4-spekter",
		cidrv6: "IPv6-spekter",
		base64: "base64-enkodet streng",
		base64url: "base64url-enkodet streng",
		json_string: "JSON-streng",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Ugyldig input: forventet ${e.expected}, fikk ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Ugyldig verdi: forventet ${z(e.values[0])}` : `Ugyldig valg: forventet en av ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `For stor(t): forventet ${e.origin ?? "value"} til å ha ${n}${e.maximum.toString()} ${r.unit ?? "elementer"}` : `For stor(t): forventet ${e.origin ?? "value"} til å ha ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `For lite(n): forventet ${e.origin} til å ha ${n}${e.minimum.toString()} ${r.unit}` : `For lite(n): forventet ${e.origin} til å ha ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ugyldig streng: må starte med "${t.prefix}"` : t.format === "ends_with" ? `Ugyldig streng: må ende med "${t.suffix}"` : t.format === "includes" ? `Ugyldig streng: må inneholde "${t.includes}"` : t.format === "regex" ? `Ugyldig streng: må matche mønsteret ${t.pattern}` : `Ugyldig ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Ugyldig tall: må være et multiplum av ${e.divisor}`;
			case "unrecognized_keys": return `${e.keys.length > 1 ? "Ukjente nøkler" : "Ukjent nøkkel"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Ugyldig nøkkel i ${e.origin}`;
			case "invalid_union": return "Ugyldig input";
			case "invalid_element": return `Ugyldig verdi i ${e.origin}`;
			default: return "Ugyldig input";
		}
	};
};
function qo() {
	return { localeError: Ko() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ota.js
var Jo = () => {
	let e = {
		string: {
			unit: "harf",
			verb: "olmalıdır"
		},
		file: {
			unit: "bayt",
			verb: "olmalıdır"
		},
		array: {
			unit: "unsur",
			verb: "olmalıdır"
		},
		set: {
			unit: "unsur",
			verb: "olmalıdır"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "numara";
			case "object":
				if (Array.isArray(e)) return "saf";
				if (e === null) return "gayb";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "giren",
		email: "epostagâh",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO hengâmı",
		date: "ISO tarihi",
		time: "ISO zamanı",
		duration: "ISO müddeti",
		ipv4: "IPv4 nişânı",
		ipv6: "IPv6 nişânı",
		cidrv4: "IPv4 menzili",
		cidrv6: "IPv6 menzili",
		base64: "base64-şifreli metin",
		base64url: "base64url-şifreli metin",
		json_string: "JSON metin",
		e164: "E.164 sayısı",
		jwt: "JWT",
		template_literal: "giren"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Fâsit giren: umulan ${e.expected}, alınan ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Fâsit giren: umulan ${z(e.values[0])}` : `Fâsit tercih: mûteberler ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Fazla büyük: ${e.origin ?? "value"}, ${n}${e.maximum.toString()} ${r.unit ?? "elements"} sahip olmalıydı.` : `Fazla büyük: ${e.origin ?? "value"}, ${n}${e.maximum.toString()} olmalıydı.`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Fazla küçük: ${e.origin}, ${n}${e.minimum.toString()} ${r.unit} sahip olmalıydı.` : `Fazla küçük: ${e.origin}, ${n}${e.minimum.toString()} olmalıydı.`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Fâsit metin: "${t.prefix}" ile başlamalı.` : t.format === "ends_with" ? `Fâsit metin: "${t.suffix}" ile bitmeli.` : t.format === "includes" ? `Fâsit metin: "${t.includes}" ihtivâ etmeli.` : t.format === "regex" ? `Fâsit metin: ${t.pattern} nakşına uymalı.` : `Fâsit ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Fâsit sayı: ${e.divisor} katı olmalıydı.`;
			case "unrecognized_keys": return `Tanınmayan anahtar ${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `${e.origin} için tanınmayan anahtar var.`;
			case "invalid_union": return "Giren tanınamadı.";
			case "invalid_element": return `${e.origin} için tanınmayan kıymet var.`;
			default: return "Kıymet tanınamadı.";
		}
	};
};
function Yo() {
	return { localeError: Jo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ps.js
var Xo = () => {
	let e = {
		string: {
			unit: "توکي",
			verb: "ولري"
		},
		file: {
			unit: "بایټس",
			verb: "ولري"
		},
		array: {
			unit: "توکي",
			verb: "ولري"
		},
		set: {
			unit: "توکي",
			verb: "ولري"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "عدد";
			case "object":
				if (Array.isArray(e)) return "ارې";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ورودي",
		email: "بریښنالیک",
		url: "یو آر ال",
		emoji: "ایموجي",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "نیټه او وخت",
		date: "نېټه",
		time: "وخت",
		duration: "موده",
		ipv4: "د IPv4 پته",
		ipv6: "د IPv6 پته",
		cidrv4: "د IPv4 ساحه",
		cidrv6: "د IPv6 ساحه",
		base64: "base64-encoded متن",
		base64url: "base64url-encoded متن",
		json_string: "JSON متن",
		e164: "د E.164 شمېره",
		jwt: "JWT",
		template_literal: "ورودي"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `ناسم ورودي: باید ${e.expected} وای, مګر ${n(e.input)} ترلاسه شو`;
			case "invalid_value": return e.values.length === 1 ? `ناسم ورودي: باید ${z(e.values[0])} وای` : `ناسم انتخاب: باید یو له ${I(e.values, "|")} څخه وای`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `ډیر لوی: ${e.origin ?? "ارزښت"} باید ${n}${e.maximum.toString()} ${r.unit ?? "عنصرونه"} ولري` : `ډیر لوی: ${e.origin ?? "ارزښت"} باید ${n}${e.maximum.toString()} وي`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `ډیر کوچنی: ${e.origin} باید ${n}${e.minimum.toString()} ${r.unit} ولري` : `ډیر کوچنی: ${e.origin} باید ${n}${e.minimum.toString()} وي`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `ناسم متن: باید د "${t.prefix}" سره پیل شي` : t.format === "ends_with" ? `ناسم متن: باید د "${t.suffix}" سره پای ته ورسيږي` : t.format === "includes" ? `ناسم متن: باید "${t.includes}" ولري` : t.format === "regex" ? `ناسم متن: باید د ${t.pattern} سره مطابقت ولري` : `${r[t.format] ?? e.format} ناسم دی`;
			}
			case "not_multiple_of": return `ناسم عدد: باید د ${e.divisor} مضرب وي`;
			case "unrecognized_keys": return `ناسم ${e.keys.length > 1 ? "کلیډونه" : "کلیډ"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `ناسم کلیډ په ${e.origin} کې`;
			case "invalid_union": return "ناسمه ورودي";
			case "invalid_element": return `ناسم عنصر په ${e.origin} کې`;
			default: return "ناسمه ورودي";
		}
	};
};
function Zo() {
	return { localeError: Xo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/pl.js
var Qo = () => {
	let e = {
		string: {
			unit: "znaków",
			verb: "mieć"
		},
		file: {
			unit: "bajtów",
			verb: "mieć"
		},
		array: {
			unit: "elementów",
			verb: "mieć"
		},
		set: {
			unit: "elementów",
			verb: "mieć"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "liczba";
			case "object":
				if (Array.isArray(e)) return "tablica";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "wyrażenie",
		email: "adres email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data i godzina w formacie ISO",
		date: "data w formacie ISO",
		time: "godzina w formacie ISO",
		duration: "czas trwania ISO",
		ipv4: "adres IPv4",
		ipv6: "adres IPv6",
		cidrv4: "zakres IPv4",
		cidrv6: "zakres IPv6",
		base64: "ciąg znaków zakodowany w formacie base64",
		base64url: "ciąg znaków zakodowany w formacie base64url",
		json_string: "ciąg znaków w formacie JSON",
		e164: "liczba E.164",
		jwt: "JWT",
		template_literal: "wejście"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Nieprawidłowe dane wejściowe: oczekiwano ${e.expected}, otrzymano ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Nieprawidłowe dane wejściowe: oczekiwano ${z(e.values[0])}` : `Nieprawidłowa opcja: oczekiwano jednej z wartości ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Za duża wartość: oczekiwano, że ${e.origin ?? "wartość"} będzie mieć ${n}${e.maximum.toString()} ${r.unit ?? "elementów"}` : `Zbyt duż(y/a/e): oczekiwano, że ${e.origin ?? "wartość"} będzie wynosić ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Za mała wartość: oczekiwano, że ${e.origin ?? "wartość"} będzie mieć ${n}${e.minimum.toString()} ${r.unit ?? "elementów"}` : `Zbyt mał(y/a/e): oczekiwano, że ${e.origin ?? "wartość"} będzie wynosić ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Nieprawidłowy ciąg znaków: musi zaczynać się od "${t.prefix}"` : t.format === "ends_with" ? `Nieprawidłowy ciąg znaków: musi kończyć się na "${t.suffix}"` : t.format === "includes" ? `Nieprawidłowy ciąg znaków: musi zawierać "${t.includes}"` : t.format === "regex" ? `Nieprawidłowy ciąg znaków: musi odpowiadać wzorcowi ${t.pattern}` : `Nieprawidłow(y/a/e) ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Nieprawidłowa liczba: musi być wielokrotnością ${e.divisor}`;
			case "unrecognized_keys": return `Nierozpoznane klucze${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Nieprawidłowy klucz w ${e.origin}`;
			case "invalid_union": return "Nieprawidłowe dane wejściowe";
			case "invalid_element": return `Nieprawidłowa wartość w ${e.origin}`;
			default: return "Nieprawidłowe dane wejściowe";
		}
	};
};
function $o() {
	return { localeError: Qo() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/pt.js
var es = () => {
	let e = {
		string: {
			unit: "caracteres",
			verb: "ter"
		},
		file: {
			unit: "bytes",
			verb: "ter"
		},
		array: {
			unit: "itens",
			verb: "ter"
		},
		set: {
			unit: "itens",
			verb: "ter"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "número";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "nulo";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "padrão",
		email: "endereço de e-mail",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "data e hora ISO",
		date: "data ISO",
		time: "hora ISO",
		duration: "duração ISO",
		ipv4: "endereço IPv4",
		ipv6: "endereço IPv6",
		cidrv4: "faixa de IPv4",
		cidrv6: "faixa de IPv6",
		base64: "texto codificado em base64",
		base64url: "URL codificada em base64",
		json_string: "texto JSON",
		e164: "número E.164",
		jwt: "JWT",
		template_literal: "entrada"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Tipo inválido: esperado ${e.expected}, recebido ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Entrada inválida: esperado ${z(e.values[0])}` : `Opção inválida: esperada uma das ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Muito grande: esperado que ${e.origin ?? "valor"} tivesse ${n}${e.maximum.toString()} ${r.unit ?? "elementos"}` : `Muito grande: esperado que ${e.origin ?? "valor"} fosse ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Muito pequeno: esperado que ${e.origin} tivesse ${n}${e.minimum.toString()} ${r.unit}` : `Muito pequeno: esperado que ${e.origin} fosse ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Texto inválido: deve começar com "${t.prefix}"` : t.format === "ends_with" ? `Texto inválido: deve terminar com "${t.suffix}"` : t.format === "includes" ? `Texto inválido: deve incluir "${t.includes}"` : t.format === "regex" ? `Texto inválido: deve corresponder ao padrão ${t.pattern}` : `${r[t.format] ?? e.format} inválido`;
			}
			case "not_multiple_of": return `Número inválido: deve ser múltiplo de ${e.divisor}`;
			case "unrecognized_keys": return `Chave${e.keys.length > 1 ? "s" : ""} desconhecida${e.keys.length > 1 ? "s" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Chave inválida em ${e.origin}`;
			case "invalid_union": return "Entrada inválida";
			case "invalid_element": return `Valor inválido em ${e.origin}`;
			default: return "Campo inválido";
		}
	};
};
function ts() {
	return { localeError: es() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ru.js
function ns(e, t, n, r) {
	let i = Math.abs(e), a = i % 10, o = i % 100;
	return o >= 11 && o <= 19 ? r : a === 1 ? t : a >= 2 && a <= 4 ? n : r;
}
var rs = () => {
	let e = {
		string: {
			unit: {
				one: "символ",
				few: "символа",
				many: "символов"
			},
			verb: "иметь"
		},
		file: {
			unit: {
				one: "байт",
				few: "байта",
				many: "байт"
			},
			verb: "иметь"
		},
		array: {
			unit: {
				one: "элемент",
				few: "элемента",
				many: "элементов"
			},
			verb: "иметь"
		},
		set: {
			unit: {
				one: "элемент",
				few: "элемента",
				many: "элементов"
			},
			verb: "иметь"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "число";
			case "object":
				if (Array.isArray(e)) return "массив";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ввод",
		email: "email адрес",
		url: "URL",
		emoji: "эмодзи",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO дата и время",
		date: "ISO дата",
		time: "ISO время",
		duration: "ISO длительность",
		ipv4: "IPv4 адрес",
		ipv6: "IPv6 адрес",
		cidrv4: "IPv4 диапазон",
		cidrv6: "IPv6 диапазон",
		base64: "строка в формате base64",
		base64url: "строка в формате base64url",
		json_string: "JSON строка",
		e164: "номер E.164",
		jwt: "JWT",
		template_literal: "ввод"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Неверный ввод: ожидалось ${e.expected}, получено ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Неверный ввод: ожидалось ${z(e.values[0])}` : `Неверный вариант: ожидалось одно из ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				if (r) {
					let t = ns(Number(e.maximum), r.unit.one, r.unit.few, r.unit.many);
					return `Слишком большое значение: ожидалось, что ${e.origin ?? "значение"} будет иметь ${n}${e.maximum.toString()} ${t}`;
				}
				return `Слишком большое значение: ожидалось, что ${e.origin ?? "значение"} будет ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				if (r) {
					let t = ns(Number(e.minimum), r.unit.one, r.unit.few, r.unit.many);
					return `Слишком маленькое значение: ожидалось, что ${e.origin} будет иметь ${n}${e.minimum.toString()} ${t}`;
				}
				return `Слишком маленькое значение: ожидалось, что ${e.origin} будет ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Неверная строка: должна начинаться с "${t.prefix}"` : t.format === "ends_with" ? `Неверная строка: должна заканчиваться на "${t.suffix}"` : t.format === "includes" ? `Неверная строка: должна содержать "${t.includes}"` : t.format === "regex" ? `Неверная строка: должна соответствовать шаблону ${t.pattern}` : `Неверный ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Неверное число: должно быть кратным ${e.divisor}`;
			case "unrecognized_keys": return `Нераспознанн${e.keys.length > 1 ? "ые" : "ый"} ключ${e.keys.length > 1 ? "и" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Неверный ключ в ${e.origin}`;
			case "invalid_union": return "Неверные входные данные";
			case "invalid_element": return `Неверное значение в ${e.origin}`;
			default: return "Неверные входные данные";
		}
	};
};
function is() {
	return { localeError: rs() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/sl.js
var as = () => {
	let e = {
		string: {
			unit: "znakov",
			verb: "imeti"
		},
		file: {
			unit: "bajtov",
			verb: "imeti"
		},
		array: {
			unit: "elementov",
			verb: "imeti"
		},
		set: {
			unit: "elementov",
			verb: "imeti"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "število";
			case "object":
				if (Array.isArray(e)) return "tabela";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "vnos",
		email: "e-poštni naslov",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datum in čas",
		date: "ISO datum",
		time: "ISO čas",
		duration: "ISO trajanje",
		ipv4: "IPv4 naslov",
		ipv6: "IPv6 naslov",
		cidrv4: "obseg IPv4",
		cidrv6: "obseg IPv6",
		base64: "base64 kodiran niz",
		base64url: "base64url kodiran niz",
		json_string: "JSON niz",
		e164: "E.164 številka",
		jwt: "JWT",
		template_literal: "vnos"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Neveljaven vnos: pričakovano ${e.expected}, prejeto ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Neveljaven vnos: pričakovano ${z(e.values[0])}` : `Neveljavna možnost: pričakovano eno izmed ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Preveliko: pričakovano, da bo ${e.origin ?? "vrednost"} imelo ${n}${e.maximum.toString()} ${r.unit ?? "elementov"}` : `Preveliko: pričakovano, da bo ${e.origin ?? "vrednost"} ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Premajhno: pričakovano, da bo ${e.origin} imelo ${n}${e.minimum.toString()} ${r.unit}` : `Premajhno: pričakovano, da bo ${e.origin} ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Neveljaven niz: mora se začeti z "${t.prefix}"` : t.format === "ends_with" ? `Neveljaven niz: mora se končati z "${t.suffix}"` : t.format === "includes" ? `Neveljaven niz: mora vsebovati "${t.includes}"` : t.format === "regex" ? `Neveljaven niz: mora ustrezati vzorcu ${t.pattern}` : `Neveljaven ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Neveljavno število: mora biti večkratnik ${e.divisor}`;
			case "unrecognized_keys": return `Neprepoznan${e.keys.length > 1 ? "i ključi" : " ključ"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Neveljaven ključ v ${e.origin}`;
			case "invalid_union": return "Neveljaven vnos";
			case "invalid_element": return `Neveljavna vrednost v ${e.origin}`;
			default: return "Neveljaven vnos";
		}
	};
};
function os() {
	return { localeError: as() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/sv.js
var ss = () => {
	let e = {
		string: {
			unit: "tecken",
			verb: "att ha"
		},
		file: {
			unit: "bytes",
			verb: "att ha"
		},
		array: {
			unit: "objekt",
			verb: "att innehålla"
		},
		set: {
			unit: "objekt",
			verb: "att innehålla"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "antal";
			case "object":
				if (Array.isArray(e)) return "lista";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "reguljärt uttryck",
		email: "e-postadress",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO-datum och tid",
		date: "ISO-datum",
		time: "ISO-tid",
		duration: "ISO-varaktighet",
		ipv4: "IPv4-intervall",
		ipv6: "IPv6-intervall",
		cidrv4: "IPv4-spektrum",
		cidrv6: "IPv6-spektrum",
		base64: "base64-kodad sträng",
		base64url: "base64url-kodad sträng",
		json_string: "JSON-sträng",
		e164: "E.164-nummer",
		jwt: "JWT",
		template_literal: "mall-literal"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Ogiltig inmatning: förväntat ${e.expected}, fick ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Ogiltig inmatning: förväntat ${z(e.values[0])}` : `Ogiltigt val: förväntade en av ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `För stor(t): förväntade ${e.origin ?? "värdet"} att ha ${n}${e.maximum.toString()} ${r.unit ?? "element"}` : `För stor(t): förväntat ${e.origin ?? "värdet"} att ha ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `För lite(t): förväntade ${e.origin ?? "värdet"} att ha ${n}${e.minimum.toString()} ${r.unit}` : `För lite(t): förväntade ${e.origin ?? "värdet"} att ha ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ogiltig sträng: måste börja med "${t.prefix}"` : t.format === "ends_with" ? `Ogiltig sträng: måste sluta med "${t.suffix}"` : t.format === "includes" ? `Ogiltig sträng: måste innehålla "${t.includes}"` : t.format === "regex" ? `Ogiltig sträng: måste matcha mönstret "${t.pattern}"` : `Ogiltig(t) ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Ogiltigt tal: måste vara en multipel av ${e.divisor}`;
			case "unrecognized_keys": return `${e.keys.length > 1 ? "Okända nycklar" : "Okänd nyckel"}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Ogiltig nyckel i ${e.origin ?? "värdet"}`;
			case "invalid_union": return "Ogiltig input";
			case "invalid_element": return `Ogiltigt värde i ${e.origin ?? "värdet"}`;
			default: return "Ogiltig input";
		}
	};
};
function cs() {
	return { localeError: ss() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ta.js
var ls = () => {
	let e = {
		string: {
			unit: "எழுத்துக்கள்",
			verb: "கொண்டிருக்க வேண்டும்"
		},
		file: {
			unit: "பைட்டுகள்",
			verb: "கொண்டிருக்க வேண்டும்"
		},
		array: {
			unit: "உறுப்புகள்",
			verb: "கொண்டிருக்க வேண்டும்"
		},
		set: {
			unit: "உறுப்புகள்",
			verb: "கொண்டிருக்க வேண்டும்"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "எண் அல்லாதது" : "எண்";
			case "object":
				if (Array.isArray(e)) return "அணி";
				if (e === null) return "வெறுமை";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "உள்ளீடு",
		email: "மின்னஞ்சல் முகவரி",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO தேதி நேரம்",
		date: "ISO தேதி",
		time: "ISO நேரம்",
		duration: "ISO கால அளவு",
		ipv4: "IPv4 முகவரி",
		ipv6: "IPv6 முகவரி",
		cidrv4: "IPv4 வரம்பு",
		cidrv6: "IPv6 வரம்பு",
		base64: "base64-encoded சரம்",
		base64url: "base64url-encoded சரம்",
		json_string: "JSON சரம்",
		e164: "E.164 எண்",
		jwt: "JWT",
		template_literal: "input"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${e.expected}, பெறப்பட்டது ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${z(e.values[0])}` : `தவறான விருப்பம்: எதிர்பார்க்கப்பட்டது ${I(e.values, "|")} இல் ஒன்று`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${e.origin ?? "மதிப்பு"} ${n}${e.maximum.toString()} ${r.unit ?? "உறுப்புகள்"} ஆக இருக்க வேண்டும்` : `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${e.origin ?? "மதிப்பு"} ${n}${e.maximum.toString()} ஆக இருக்க வேண்டும்`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${e.origin} ${n}${e.minimum.toString()} ${r.unit} ஆக இருக்க வேண்டும்` : `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${e.origin} ${n}${e.minimum.toString()} ஆக இருக்க வேண்டும்`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `தவறான சரம்: "${t.prefix}" இல் தொடங்க வேண்டும்` : t.format === "ends_with" ? `தவறான சரம்: "${t.suffix}" இல் முடிவடைய வேண்டும்` : t.format === "includes" ? `தவறான சரம்: "${t.includes}" ஐ உள்ளடக்க வேண்டும்` : t.format === "regex" ? `தவறான சரம்: ${t.pattern} முறைபாட்டுடன் பொருந்த வேண்டும்` : `தவறான ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `தவறான எண்: ${e.divisor} இன் பலமாக இருக்க வேண்டும்`;
			case "unrecognized_keys": return `அடையாளம் தெரியாத விசை${e.keys.length > 1 ? "கள்" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `${e.origin} இல் தவறான விசை`;
			case "invalid_union": return "தவறான உள்ளீடு";
			case "invalid_element": return `${e.origin} இல் தவறான மதிப்பு`;
			default: return "தவறான உள்ளீடு";
		}
	};
};
function us() {
	return { localeError: ls() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/th.js
var ds = () => {
	let e = {
		string: {
			unit: "ตัวอักษร",
			verb: "ควรมี"
		},
		file: {
			unit: "ไบต์",
			verb: "ควรมี"
		},
		array: {
			unit: "รายการ",
			verb: "ควรมี"
		},
		set: {
			unit: "รายการ",
			verb: "ควรมี"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "ไม่ใช่ตัวเลข (NaN)" : "ตัวเลข";
			case "object":
				if (Array.isArray(e)) return "อาร์เรย์ (Array)";
				if (e === null) return "ไม่มีค่า (null)";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ข้อมูลที่ป้อน",
		email: "ที่อยู่อีเมล",
		url: "URL",
		emoji: "อิโมจิ",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "วันที่เวลาแบบ ISO",
		date: "วันที่แบบ ISO",
		time: "เวลาแบบ ISO",
		duration: "ช่วงเวลาแบบ ISO",
		ipv4: "ที่อยู่ IPv4",
		ipv6: "ที่อยู่ IPv6",
		cidrv4: "ช่วง IP แบบ IPv4",
		cidrv6: "ช่วง IP แบบ IPv6",
		base64: "ข้อความแบบ Base64",
		base64url: "ข้อความแบบ Base64 สำหรับ URL",
		json_string: "ข้อความแบบ JSON",
		e164: "เบอร์โทรศัพท์ระหว่างประเทศ (E.164)",
		jwt: "โทเคน JWT",
		template_literal: "ข้อมูลที่ป้อน"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น ${e.expected} แต่ได้รับ ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `ค่าไม่ถูกต้อง: ควรเป็น ${z(e.values[0])}` : `ตัวเลือกไม่ถูกต้อง: ควรเป็นหนึ่งใน ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "ไม่เกิน" : "น้อยกว่า", r = t(e.origin);
				return r ? `เกินกำหนด: ${e.origin ?? "ค่า"} ควรมี${n} ${e.maximum.toString()} ${r.unit ?? "รายการ"}` : `เกินกำหนด: ${e.origin ?? "ค่า"} ควรมี${n} ${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? "อย่างน้อย" : "มากกว่า", r = t(e.origin);
				return r ? `น้อยกว่ากำหนด: ${e.origin} ควรมี${n} ${e.minimum.toString()} ${r.unit}` : `น้อยกว่ากำหนด: ${e.origin} ควรมี${n} ${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `รูปแบบไม่ถูกต้อง: ข้อความต้องขึ้นต้นด้วย "${t.prefix}"` : t.format === "ends_with" ? `รูปแบบไม่ถูกต้อง: ข้อความต้องลงท้ายด้วย "${t.suffix}"` : t.format === "includes" ? `รูปแบบไม่ถูกต้อง: ข้อความต้องมี "${t.includes}" อยู่ในข้อความ` : t.format === "regex" ? `รูปแบบไม่ถูกต้อง: ต้องตรงกับรูปแบบที่กำหนด ${t.pattern}` : `รูปแบบไม่ถูกต้อง: ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `ตัวเลขไม่ถูกต้อง: ต้องเป็นจำนวนที่หารด้วย ${e.divisor} ได้ลงตัว`;
			case "unrecognized_keys": return `พบคีย์ที่ไม่รู้จัก: ${I(e.keys, ", ")}`;
			case "invalid_key": return `คีย์ไม่ถูกต้องใน ${e.origin}`;
			case "invalid_union": return "ข้อมูลไม่ถูกต้อง: ไม่ตรงกับรูปแบบยูเนียนที่กำหนดไว้";
			case "invalid_element": return `ข้อมูลไม่ถูกต้องใน ${e.origin}`;
			default: return "ข้อมูลไม่ถูกต้อง";
		}
	};
};
function fs() {
	return { localeError: ds() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/tr.js
var ps = (e) => {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "NaN" : "number";
		case "object":
			if (Array.isArray(e)) return "array";
			if (e === null) return "null";
			if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
	}
	return t;
}, ms = () => {
	let e = {
		string: {
			unit: "karakter",
			verb: "olmalı"
		},
		file: {
			unit: "bayt",
			verb: "olmalı"
		},
		array: {
			unit: "öğe",
			verb: "olmalı"
		},
		set: {
			unit: "öğe",
			verb: "olmalı"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "girdi",
		email: "e-posta adresi",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO tarih ve saat",
		date: "ISO tarih",
		time: "ISO saat",
		duration: "ISO süre",
		ipv4: "IPv4 adresi",
		ipv6: "IPv6 adresi",
		cidrv4: "IPv4 aralığı",
		cidrv6: "IPv6 aralığı",
		base64: "base64 ile şifrelenmiş metin",
		base64url: "base64url ile şifrelenmiş metin",
		json_string: "JSON dizesi",
		e164: "E.164 sayısı",
		jwt: "JWT",
		template_literal: "Şablon dizesi"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Geçersiz değer: beklenen ${e.expected}, alınan ${ps(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Geçersiz değer: beklenen ${z(e.values[0])}` : `Geçersiz seçenek: aşağıdakilerden biri olmalı: ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Çok büyük: beklenen ${e.origin ?? "değer"} ${n}${e.maximum.toString()} ${r.unit ?? "öğe"}` : `Çok büyük: beklenen ${e.origin ?? "değer"} ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Çok küçük: beklenen ${e.origin} ${n}${e.minimum.toString()} ${r.unit}` : `Çok küçük: beklenen ${e.origin} ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Geçersiz metin: "${t.prefix}" ile başlamalı` : t.format === "ends_with" ? `Geçersiz metin: "${t.suffix}" ile bitmeli` : t.format === "includes" ? `Geçersiz metin: "${t.includes}" içermeli` : t.format === "regex" ? `Geçersiz metin: ${t.pattern} desenine uymalı` : `Geçersiz ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Geçersiz sayı: ${e.divisor} ile tam bölünebilmeli`;
			case "unrecognized_keys": return `Tanınmayan anahtar${e.keys.length > 1 ? "lar" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `${e.origin} içinde geçersiz anahtar`;
			case "invalid_union": return "Geçersiz değer";
			case "invalid_element": return `${e.origin} içinde geçersiz değer`;
			default: return "Geçersiz değer";
		}
	};
};
function hs() {
	return { localeError: ms() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/uk.js
var gs = () => {
	let e = {
		string: {
			unit: "символів",
			verb: "матиме"
		},
		file: {
			unit: "байтів",
			verb: "матиме"
		},
		array: {
			unit: "елементів",
			verb: "матиме"
		},
		set: {
			unit: "елементів",
			verb: "матиме"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "число";
			case "object":
				if (Array.isArray(e)) return "масив";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "вхідні дані",
		email: "адреса електронної пошти",
		url: "URL",
		emoji: "емодзі",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "дата та час ISO",
		date: "дата ISO",
		time: "час ISO",
		duration: "тривалість ISO",
		ipv4: "адреса IPv4",
		ipv6: "адреса IPv6",
		cidrv4: "діапазон IPv4",
		cidrv6: "діапазон IPv6",
		base64: "рядок у кодуванні base64",
		base64url: "рядок у кодуванні base64url",
		json_string: "рядок JSON",
		e164: "номер E.164",
		jwt: "JWT",
		template_literal: "вхідні дані"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Неправильні вхідні дані: очікується ${e.expected}, отримано ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Неправильні вхідні дані: очікується ${z(e.values[0])}` : `Неправильна опція: очікується одне з ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Занадто велике: очікується, що ${e.origin ?? "значення"} ${r.verb} ${n}${e.maximum.toString()} ${r.unit ?? "елементів"}` : `Занадто велике: очікується, що ${e.origin ?? "значення"} буде ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Занадто мале: очікується, що ${e.origin} ${r.verb} ${n}${e.minimum.toString()} ${r.unit}` : `Занадто мале: очікується, що ${e.origin} буде ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Неправильний рядок: повинен починатися з "${t.prefix}"` : t.format === "ends_with" ? `Неправильний рядок: повинен закінчуватися на "${t.suffix}"` : t.format === "includes" ? `Неправильний рядок: повинен містити "${t.includes}"` : t.format === "regex" ? `Неправильний рядок: повинен відповідати шаблону ${t.pattern}` : `Неправильний ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Неправильне число: повинно бути кратним ${e.divisor}`;
			case "unrecognized_keys": return `Нерозпізнаний ключ${e.keys.length > 1 ? "і" : ""}: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Неправильний ключ у ${e.origin}`;
			case "invalid_union": return "Неправильні вхідні дані";
			case "invalid_element": return `Неправильне значення у ${e.origin}`;
			default: return "Неправильні вхідні дані";
		}
	};
};
function _s() {
	return { localeError: gs() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ua.js
function vs() {
	return _s();
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/ur.js
var ys = () => {
	let e = {
		string: {
			unit: "حروف",
			verb: "ہونا"
		},
		file: {
			unit: "بائٹس",
			verb: "ہونا"
		},
		array: {
			unit: "آئٹمز",
			verb: "ہونا"
		},
		set: {
			unit: "آئٹمز",
			verb: "ہونا"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "نمبر";
			case "object":
				if (Array.isArray(e)) return "آرے";
				if (e === null) return "نل";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ان پٹ",
		email: "ای میل ایڈریس",
		url: "یو آر ایل",
		emoji: "ایموجی",
		uuid: "یو یو آئی ڈی",
		uuidv4: "یو یو آئی ڈی وی 4",
		uuidv6: "یو یو آئی ڈی وی 6",
		nanoid: "نینو آئی ڈی",
		guid: "جی یو آئی ڈی",
		cuid: "سی یو آئی ڈی",
		cuid2: "سی یو آئی ڈی 2",
		ulid: "یو ایل آئی ڈی",
		xid: "ایکس آئی ڈی",
		ksuid: "کے ایس یو آئی ڈی",
		datetime: "آئی ایس او ڈیٹ ٹائم",
		date: "آئی ایس او تاریخ",
		time: "آئی ایس او وقت",
		duration: "آئی ایس او مدت",
		ipv4: "آئی پی وی 4 ایڈریس",
		ipv6: "آئی پی وی 6 ایڈریس",
		cidrv4: "آئی پی وی 4 رینج",
		cidrv6: "آئی پی وی 6 رینج",
		base64: "بیس 64 ان کوڈڈ سٹرنگ",
		base64url: "بیس 64 یو آر ایل ان کوڈڈ سٹرنگ",
		json_string: "جے ایس او این سٹرنگ",
		e164: "ای 164 نمبر",
		jwt: "جے ڈبلیو ٹی",
		template_literal: "ان پٹ"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `غلط ان پٹ: ${e.expected} متوقع تھا، ${n(e.input)} موصول ہوا`;
			case "invalid_value": return e.values.length === 1 ? `غلط ان پٹ: ${z(e.values[0])} متوقع تھا` : `غلط آپشن: ${I(e.values, "|")} میں سے ایک متوقع تھا`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `بہت بڑا: ${e.origin ?? "ویلیو"} کے ${n}${e.maximum.toString()} ${r.unit ?? "عناصر"} ہونے متوقع تھے` : `بہت بڑا: ${e.origin ?? "ویلیو"} کا ${n}${e.maximum.toString()} ہونا متوقع تھا`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `بہت چھوٹا: ${e.origin} کے ${n}${e.minimum.toString()} ${r.unit} ہونے متوقع تھے` : `بہت چھوٹا: ${e.origin} کا ${n}${e.minimum.toString()} ہونا متوقع تھا`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `غلط سٹرنگ: "${t.prefix}" سے شروع ہونا چاہیے` : t.format === "ends_with" ? `غلط سٹرنگ: "${t.suffix}" پر ختم ہونا چاہیے` : t.format === "includes" ? `غلط سٹرنگ: "${t.includes}" شامل ہونا چاہیے` : t.format === "regex" ? `غلط سٹرنگ: پیٹرن ${t.pattern} سے میچ ہونا چاہیے` : `غلط ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `غلط نمبر: ${e.divisor} کا مضاعف ہونا چاہیے`;
			case "unrecognized_keys": return `غیر تسلیم شدہ کی${e.keys.length > 1 ? "ز" : ""}: ${I(e.keys, "، ")}`;
			case "invalid_key": return `${e.origin} میں غلط کی`;
			case "invalid_union": return "غلط ان پٹ";
			case "invalid_element": return `${e.origin} میں غلط ویلیو`;
			default: return "غلط ان پٹ";
		}
	};
};
function bs() {
	return { localeError: ys() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/vi.js
var xs = () => {
	let e = {
		string: {
			unit: "ký tự",
			verb: "có"
		},
		file: {
			unit: "byte",
			verb: "có"
		},
		array: {
			unit: "phần tử",
			verb: "có"
		},
		set: {
			unit: "phần tử",
			verb: "có"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "số";
			case "object":
				if (Array.isArray(e)) return "mảng";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "đầu vào",
		email: "địa chỉ email",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ngày giờ ISO",
		date: "ngày ISO",
		time: "giờ ISO",
		duration: "khoảng thời gian ISO",
		ipv4: "địa chỉ IPv4",
		ipv6: "địa chỉ IPv6",
		cidrv4: "dải IPv4",
		cidrv6: "dải IPv6",
		base64: "chuỗi mã hóa base64",
		base64url: "chuỗi mã hóa base64url",
		json_string: "chuỗi JSON",
		e164: "số E.164",
		jwt: "JWT",
		template_literal: "đầu vào"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Đầu vào không hợp lệ: mong đợi ${e.expected}, nhận được ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Đầu vào không hợp lệ: mong đợi ${z(e.values[0])}` : `Tùy chọn không hợp lệ: mong đợi một trong các giá trị ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Quá lớn: mong đợi ${e.origin ?? "giá trị"} ${r.verb} ${n}${e.maximum.toString()} ${r.unit ?? "phần tử"}` : `Quá lớn: mong đợi ${e.origin ?? "giá trị"} ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Quá nhỏ: mong đợi ${e.origin} ${r.verb} ${n}${e.minimum.toString()} ${r.unit}` : `Quá nhỏ: mong đợi ${e.origin} ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Chuỗi không hợp lệ: phải bắt đầu bằng "${t.prefix}"` : t.format === "ends_with" ? `Chuỗi không hợp lệ: phải kết thúc bằng "${t.suffix}"` : t.format === "includes" ? `Chuỗi không hợp lệ: phải bao gồm "${t.includes}"` : t.format === "regex" ? `Chuỗi không hợp lệ: phải khớp với mẫu ${t.pattern}` : `${r[t.format] ?? e.format} không hợp lệ`;
			}
			case "not_multiple_of": return `Số không hợp lệ: phải là bội số của ${e.divisor}`;
			case "unrecognized_keys": return `Khóa không được nhận dạng: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Khóa không hợp lệ trong ${e.origin}`;
			case "invalid_union": return "Đầu vào không hợp lệ";
			case "invalid_element": return `Giá trị không hợp lệ trong ${e.origin}`;
			default: return "Đầu vào không hợp lệ";
		}
	};
};
function Ss() {
	return { localeError: xs() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/zh-CN.js
var Cs = () => {
	let e = {
		string: {
			unit: "字符",
			verb: "包含"
		},
		file: {
			unit: "字节",
			verb: "包含"
		},
		array: {
			unit: "项",
			verb: "包含"
		},
		set: {
			unit: "项",
			verb: "包含"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "非数字(NaN)" : "数字";
			case "object":
				if (Array.isArray(e)) return "数组";
				if (e === null) return "空值(null)";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "输入",
		email: "电子邮件",
		url: "URL",
		emoji: "表情符号",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO日期时间",
		date: "ISO日期",
		time: "ISO时间",
		duration: "ISO时长",
		ipv4: "IPv4地址",
		ipv6: "IPv6地址",
		cidrv4: "IPv4网段",
		cidrv6: "IPv6网段",
		base64: "base64编码字符串",
		base64url: "base64url编码字符串",
		json_string: "JSON字符串",
		e164: "E.164号码",
		jwt: "JWT",
		template_literal: "输入"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `无效输入：期望 ${e.expected}，实际接收 ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `无效输入：期望 ${z(e.values[0])}` : `无效选项：期望以下之一 ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `数值过大：期望 ${e.origin ?? "值"} ${n}${e.maximum.toString()} ${r.unit ?? "个元素"}` : `数值过大：期望 ${e.origin ?? "值"} ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `数值过小：期望 ${e.origin} ${n}${e.minimum.toString()} ${r.unit}` : `数值过小：期望 ${e.origin} ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `无效字符串：必须以 "${t.prefix}" 开头` : t.format === "ends_with" ? `无效字符串：必须以 "${t.suffix}" 结尾` : t.format === "includes" ? `无效字符串：必须包含 "${t.includes}"` : t.format === "regex" ? `无效字符串：必须满足正则表达式 ${t.pattern}` : `无效${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `无效数字：必须是 ${e.divisor} 的倍数`;
			case "unrecognized_keys": return `出现未知的键(key): ${I(e.keys, ", ")}`;
			case "invalid_key": return `${e.origin} 中的键(key)无效`;
			case "invalid_union": return "无效输入";
			case "invalid_element": return `${e.origin} 中包含无效值(value)`;
			default: return "无效输入";
		}
	};
};
function ws() {
	return { localeError: Cs() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/zh-TW.js
var Ts = () => {
	let e = {
		string: {
			unit: "字元",
			verb: "擁有"
		},
		file: {
			unit: "位元組",
			verb: "擁有"
		},
		array: {
			unit: "項目",
			verb: "擁有"
		},
		set: {
			unit: "項目",
			verb: "擁有"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "number";
			case "object":
				if (Array.isArray(e)) return "array";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "輸入",
		email: "郵件地址",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO 日期時間",
		date: "ISO 日期",
		time: "ISO 時間",
		duration: "ISO 期間",
		ipv4: "IPv4 位址",
		ipv6: "IPv6 位址",
		cidrv4: "IPv4 範圍",
		cidrv6: "IPv6 範圍",
		base64: "base64 編碼字串",
		base64url: "base64url 編碼字串",
		json_string: "JSON 字串",
		e164: "E.164 數值",
		jwt: "JWT",
		template_literal: "輸入"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `無效的輸入值：預期為 ${e.expected}，但收到 ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `無效的輸入值：預期為 ${z(e.values[0])}` : `無效的選項：預期為以下其中之一 ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `數值過大：預期 ${e.origin ?? "值"} 應為 ${n}${e.maximum.toString()} ${r.unit ?? "個元素"}` : `數值過大：預期 ${e.origin ?? "值"} 應為 ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `數值過小：預期 ${e.origin} 應為 ${n}${e.minimum.toString()} ${r.unit}` : `數值過小：預期 ${e.origin} 應為 ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `無效的字串：必須以 "${t.prefix}" 開頭` : t.format === "ends_with" ? `無效的字串：必須以 "${t.suffix}" 結尾` : t.format === "includes" ? `無效的字串：必須包含 "${t.includes}"` : t.format === "regex" ? `無效的字串：必須符合格式 ${t.pattern}` : `無效的 ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `無效的數字：必須為 ${e.divisor} 的倍數`;
			case "unrecognized_keys": return `無法識別的鍵值${e.keys.length > 1 ? "們" : ""}：${I(e.keys, "、")}`;
			case "invalid_key": return `${e.origin} 中有無效的鍵值`;
			case "invalid_union": return "無效的輸入值";
			case "invalid_element": return `${e.origin} 中有無效的值`;
			default: return "無效的輸入值";
		}
	};
};
function Es() {
	return { localeError: Ts() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/yo.js
var Ds = () => {
	let e = {
		string: {
			unit: "àmi",
			verb: "ní"
		},
		file: {
			unit: "bytes",
			verb: "ní"
		},
		array: {
			unit: "nkan",
			verb: "ní"
		},
		set: {
			unit: "nkan",
			verb: "ní"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = (e) => {
		let t = typeof e;
		switch (t) {
			case "number": return Number.isNaN(e) ? "NaN" : "nọ́mbà";
			case "object":
				if (Array.isArray(e)) return "akopọ";
				if (e === null) return "null";
				if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name;
		}
		return t;
	}, r = {
		regex: "ẹ̀rọ ìbáwọlé",
		email: "àdírẹ́sì ìmẹ́lì",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "àkókò ISO",
		date: "ọjọ́ ISO",
		time: "àkókò ISO",
		duration: "àkókò tó pé ISO",
		ipv4: "àdírẹ́sì IPv4",
		ipv6: "àdírẹ́sì IPv6",
		cidrv4: "àgbègbè IPv4",
		cidrv6: "àgbègbè IPv6",
		base64: "ọ̀rọ̀ tí a kọ́ ní base64",
		base64url: "ọ̀rọ̀ base64url",
		json_string: "ọ̀rọ̀ JSON",
		e164: "nọ́mbà E.164",
		jwt: "JWT",
		template_literal: "ẹ̀rọ ìbáwọlé"
	};
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Ìbáwọlé aṣìṣe: a ní láti fi ${e.expected}, àmọ̀ a rí ${n(e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Ìbáwọlé aṣìṣe: a ní láti fi ${z(e.values[0])}` : `Àṣàyàn aṣìṣe: yan ọ̀kan lára ${I(e.values, "|")}`;
			case "too_big": {
				let n = e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Tó pọ̀ jù: a ní láti jẹ́ pé ${e.origin ?? "iye"} ${r.verb} ${n}${e.maximum} ${r.unit}` : `Tó pọ̀ jù: a ní láti jẹ́ ${n}${e.maximum}`;
			}
			case "too_small": {
				let n = e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Kéré ju: a ní láti jẹ́ pé ${e.origin} ${r.verb} ${n}${e.minimum} ${r.unit}` : `Kéré ju: a ní láti jẹ́ ${n}${e.minimum}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ bẹ̀rẹ̀ pẹ̀lú "${t.prefix}"` : t.format === "ends_with" ? `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ parí pẹ̀lú "${t.suffix}"` : t.format === "includes" ? `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ ní "${t.includes}"` : t.format === "regex" ? `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ bá àpẹẹrẹ mu ${t.pattern}` : `Aṣìṣe: ${r[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Nọ́mbà aṣìṣe: gbọ́dọ̀ jẹ́ èyà pípín ti ${e.divisor}`;
			case "unrecognized_keys": return `Bọtìnì àìmọ̀: ${I(e.keys, ", ")}`;
			case "invalid_key": return `Bọtìnì aṣìṣe nínú ${e.origin}`;
			case "invalid_union": return "Ìbáwọlé aṣìṣe";
			case "invalid_element": return `Iye aṣìṣe nínú ${e.origin}`;
			default: return "Ìbáwọlé aṣìṣe";
		}
	};
};
function Os() {
	return { localeError: Ds() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/locales/index.js
var ks = /* @__PURE__ */ j({
	ar: () => Na,
	az: () => Fa,
	be: () => Ra,
	bg: () => Va,
	ca: () => Ua,
	cs: () => Ga,
	da: () => qa,
	de: () => Ya,
	en: () => Qa,
	eo: () => to,
	es: () => ro,
	fa: () => ao,
	fi: () => so,
	fr: () => lo,
	frCA: () => fo,
	he: () => mo,
	hu: () => go,
	id: () => vo,
	is: () => xo,
	it: () => Co,
	ja: () => To,
	ka: () => Oo,
	kh: () => jo,
	km: () => Ao,
	ko: () => No,
	lt: () => zo,
	mk: () => Vo,
	ms: () => Uo,
	nl: () => Go,
	no: () => qo,
	ota: () => Yo,
	pl: () => $o,
	ps: () => Zo,
	pt: () => ts,
	ru: () => is,
	sl: () => os,
	sv: () => cs,
	ta: () => us,
	th: () => fs,
	tr: () => hs,
	ua: () => vs,
	uk: () => _s,
	ur: () => bs,
	vi: () => Ss,
	yo: () => Os,
	zhCN: () => ws,
	zhTW: () => Es
}), As, js = Symbol("ZodOutput"), Ms = Symbol("ZodInput"), Ns = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		if (this._map.set(e, n), n && typeof n == "object" && "id" in n) {
			if (this._idmap.has(n.id)) throw Error(`ID ${n.id} already exists in the registry`);
			this._idmap.set(n.id, e);
		}
		return this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function Ps() {
	return new Ns();
}
(As = globalThis).__zod_globalRegistry ?? (As.__zod_globalRegistry = Ps());
var Fs = globalThis.__zod_globalRegistry;
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/api.js
function Is(e, t) {
	return new e({
		type: "string",
		...R(t)
	});
}
function Ls(e, t) {
	return new e({
		type: "string",
		coerce: !0,
		...R(t)
	});
}
function Rs(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function zs(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Bs(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Vs(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...R(t)
	});
}
function Hs(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...R(t)
	});
}
function Us(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...R(t)
	});
}
function Ws(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Gs(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Ks(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function qs(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Js(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Ys(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Xs(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Zs(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function Qs(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function $s(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function ec(e, t) {
	return new e({
		type: "string",
		format: "mac",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function tc(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function nc(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function rc(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function ic(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function ac(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
function oc(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...R(t)
	});
}
var sc = {
	Any: null,
	Minute: -1,
	Second: 0,
	Millisecond: 3,
	Microsecond: 6
};
function cc(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...R(t)
	});
}
function lc(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...R(t)
	});
}
function uc(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...R(t)
	});
}
function dc(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...R(t)
	});
}
function fc(e, t) {
	return new e({
		type: "number",
		checks: [],
		...R(t)
	});
}
function pc(e, t) {
	return new e({
		type: "number",
		coerce: !0,
		checks: [],
		...R(t)
	});
}
function mc(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...R(t)
	});
}
function hc(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "float32",
		...R(t)
	});
}
function gc(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "float64",
		...R(t)
	});
}
function _c(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "int32",
		...R(t)
	});
}
function vc(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "uint32",
		...R(t)
	});
}
function yc(e, t) {
	return new e({
		type: "boolean",
		...R(t)
	});
}
function bc(e, t) {
	return new e({
		type: "boolean",
		coerce: !0,
		...R(t)
	});
}
function xc(e, t) {
	return new e({
		type: "bigint",
		...R(t)
	});
}
function Sc(e, t) {
	return new e({
		type: "bigint",
		coerce: !0,
		...R(t)
	});
}
function Cc(e, t) {
	return new e({
		type: "bigint",
		check: "bigint_format",
		abort: !1,
		format: "int64",
		...R(t)
	});
}
function wc(e, t) {
	return new e({
		type: "bigint",
		check: "bigint_format",
		abort: !1,
		format: "uint64",
		...R(t)
	});
}
function Tc(e, t) {
	return new e({
		type: "symbol",
		...R(t)
	});
}
function Ec(e, t) {
	return new e({
		type: "undefined",
		...R(t)
	});
}
function Dc(e, t) {
	return new e({
		type: "null",
		...R(t)
	});
}
function Oc(e) {
	return new e({ type: "any" });
}
function kc(e) {
	return new e({ type: "unknown" });
}
function Ac(e, t) {
	return new e({
		type: "never",
		...R(t)
	});
}
function jc(e, t) {
	return new e({
		type: "void",
		...R(t)
	});
}
function Mc(e, t) {
	return new e({
		type: "date",
		...R(t)
	});
}
function Nc(e, t) {
	return new e({
		type: "date",
		coerce: !0,
		...R(t)
	});
}
function Pc(e, t) {
	return new e({
		type: "nan",
		...R(t)
	});
}
function Fc(e, t) {
	return new wr({
		check: "less_than",
		...R(t),
		value: e,
		inclusive: !1
	});
}
function Ic(e, t) {
	return new wr({
		check: "less_than",
		...R(t),
		value: e,
		inclusive: !0
	});
}
function Lc(e, t) {
	return new Tr({
		check: "greater_than",
		...R(t),
		value: e,
		inclusive: !1
	});
}
function Rc(e, t) {
	return new Tr({
		check: "greater_than",
		...R(t),
		value: e,
		inclusive: !0
	});
}
function zc(e) {
	return Lc(0, e);
}
function Bc(e) {
	return Fc(0, e);
}
function Vc(e) {
	return Ic(0, e);
}
function Hc(e) {
	return Rc(0, e);
}
function Uc(e, t) {
	return new Er({
		check: "multiple_of",
		...R(t),
		value: e
	});
}
function Wc(e, t) {
	return new kr({
		check: "max_size",
		...R(t),
		maximum: e
	});
}
function Gc(e, t) {
	return new Ar({
		check: "min_size",
		...R(t),
		minimum: e
	});
}
function Kc(e, t) {
	return new jr({
		check: "size_equals",
		...R(t),
		size: e
	});
}
function qc(e, t) {
	return new Mr({
		check: "max_length",
		...R(t),
		maximum: e
	});
}
function Jc(e, t) {
	return new Nr({
		check: "min_length",
		...R(t),
		minimum: e
	});
}
function Yc(e, t) {
	return new Pr({
		check: "length_equals",
		...R(t),
		length: e
	});
}
function Xc(e, t) {
	return new Ir({
		check: "string_format",
		format: "regex",
		...R(t),
		pattern: e
	});
}
function Zc(e) {
	return new Lr({
		check: "string_format",
		format: "lowercase",
		...R(e)
	});
}
function Qc(e) {
	return new Rr({
		check: "string_format",
		format: "uppercase",
		...R(e)
	});
}
function $c(e, t) {
	return new zr({
		check: "string_format",
		format: "includes",
		...R(t),
		includes: e
	});
}
function el(e, t) {
	return new Br({
		check: "string_format",
		format: "starts_with",
		...R(t),
		prefix: e
	});
}
function tl(e, t) {
	return new Vr({
		check: "string_format",
		format: "ends_with",
		...R(t),
		suffix: e
	});
}
function nl(e, t, n) {
	return new Ur({
		check: "property",
		property: e,
		schema: t,
		...R(n)
	});
}
function rl(e, t) {
	return new Wr({
		check: "mime_type",
		mime: e,
		...R(t)
	});
}
function il(e) {
	return new Gr({
		check: "overwrite",
		tx: e
	});
}
function al(e) {
	return il((t) => t.normalize(e));
}
function ol() {
	return il((e) => e.trim());
}
function sl() {
	return il((e) => e.toLowerCase());
}
function cl() {
	return il((e) => e.toUpperCase());
}
function ll() {
	return il((e) => Xe(e));
}
function ul(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...R(n)
	});
}
function dl(e, t, n) {
	return new e({
		type: "union",
		options: t,
		...R(n)
	});
}
function fl(e, t, n) {
	return new e({
		type: "union",
		options: t,
		inclusive: !1,
		...R(n)
	});
}
function pl(e, t, n, r) {
	return new e({
		type: "union",
		options: n,
		discriminator: t,
		...R(r)
	});
}
function ml(e, t, n) {
	return new e({
		type: "intersection",
		left: t,
		right: n
	});
}
function hl(e, t, n, r) {
	let i = n instanceof V;
	return new e({
		type: "tuple",
		items: t,
		rest: i ? n : null,
		...R(i ? r : n)
	});
}
function gl(e, t, n, r) {
	return new e({
		type: "record",
		keyType: t,
		valueType: n,
		...R(r)
	});
}
function _l(e, t, n, r) {
	return new e({
		type: "map",
		keyType: t,
		valueType: n,
		...R(r)
	});
}
function vl(e, t, n) {
	return new e({
		type: "set",
		valueType: t,
		...R(n)
	});
}
function yl(e, t, n) {
	return new e({
		type: "enum",
		entries: Array.isArray(t) ? Object.fromEntries(t.map((e) => [e, e])) : t,
		...R(n)
	});
}
function bl(e, t, n) {
	return new e({
		type: "enum",
		entries: t,
		...R(n)
	});
}
function xl(e, t, n) {
	return new e({
		type: "literal",
		values: Array.isArray(t) ? t : [t],
		...R(n)
	});
}
function Sl(e, t) {
	return new e({
		type: "file",
		...R(t)
	});
}
function Cl(e, t) {
	return new e({
		type: "transform",
		transform: t
	});
}
function wl(e, t) {
	return new e({
		type: "optional",
		innerType: t
	});
}
function Tl(e, t) {
	return new e({
		type: "nullable",
		innerType: t
	});
}
function El(e, t, n) {
	return new e({
		type: "default",
		innerType: t,
		get defaultValue() {
			return typeof n == "function" ? n() : tt(n);
		}
	});
}
function Dl(e, t, n) {
	return new e({
		type: "nonoptional",
		innerType: t,
		...R(n)
	});
}
function Ol(e, t) {
	return new e({
		type: "success",
		innerType: t
	});
}
function kl(e, t, n) {
	return new e({
		type: "catch",
		innerType: t,
		catchValue: typeof n == "function" ? n : () => n
	});
}
function Al(e, t, n) {
	return new e({
		type: "pipe",
		in: t,
		out: n
	});
}
function jl(e, t) {
	return new e({
		type: "readonly",
		innerType: t
	});
}
function Ml(e, t, n) {
	return new e({
		type: "template_literal",
		parts: t,
		...R(n)
	});
}
function Nl(e, t) {
	return new e({
		type: "lazy",
		getter: t
	});
}
function Pl(e, t) {
	return new e({
		type: "promise",
		innerType: t
	});
}
function Fl(e, t, n) {
	let r = R(n);
	return r.abort ??= !0, new e({
		type: "custom",
		check: "custom",
		fn: t,
		...r
	});
}
function Il(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...R(n)
	});
}
function Ll(e) {
	let t = Rl((n) => (n.addIssue = (e) => {
		if (typeof e == "string") n.issues.push(Tt(e, n.value, t._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", r.input ??= n.value, r.inst ??= t, r.continue ??= !t._zod.def.abort, n.issues.push(Tt(r));
		}
	}, e(n.value, n)));
	return t;
}
function Rl(e, t) {
	let n = new B({
		check: "custom",
		...R(t)
	});
	return n._zod.check = e, n;
}
function zl(e) {
	let t = new B({ check: "describe" });
	return t._zod.onattach = [(t) => {
		let n = Fs.get(t) ?? {};
		Fs.add(t, {
			...n,
			description: e
		});
	}], t._zod.check = () => {}, t;
}
function Bl(e) {
	let t = new B({ check: "meta" });
	return t._zod.onattach = [(t) => {
		let n = Fs.get(t) ?? {};
		Fs.add(t, {
			...n,
			...e
		});
	}], t._zod.check = () => {}, t;
}
function Vl(e, t) {
	let n = R(t), r = n.truthy ?? [
		"true",
		"1",
		"yes",
		"on",
		"y",
		"enabled"
	], i = n.falsy ?? [
		"false",
		"0",
		"no",
		"off",
		"n",
		"disabled"
	];
	n.case !== "sensitive" && (r = r.map((e) => typeof e == "string" ? e.toLowerCase() : e), i = i.map((e) => typeof e == "string" ? e.toLowerCase() : e));
	let a = new Set(r), o = new Set(i), s = e.Codec ?? xa, c = e.Boolean ?? Ti, l = new s({
		type: "pipe",
		in: new (e.String ?? Jr)({
			type: "string",
			error: n.error
		}),
		out: new c({
			type: "boolean",
			error: n.error
		}),
		transform: ((e, t) => {
			let r = e;
			return n.case !== "sensitive" && (r = r.toLowerCase()), a.has(r) ? !0 : o.has(r) ? !1 : (t.issues.push({
				code: "invalid_value",
				expected: "stringbool",
				values: [...a, ...o],
				input: t.value,
				inst: l,
				continue: !1
			}), {});
		}),
		reverseTransform: ((e, t) => e === !0 ? r[0] || "true" : i[0] || "false"),
		error: n.error
	});
	return l;
}
function Hl(e, t, n, r = {}) {
	let i = R(r), a = {
		...R(r),
		check: "string_format",
		type: "string",
		format: t,
		fn: typeof n == "function" ? n : (e) => n.test(e),
		...i
	};
	return n instanceof RegExp && (a.pattern = n), new e(a);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/to-json-schema.js
function Ul(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Fs,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		external: e?.external ?? void 0
	};
}
function U(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o);
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		}, a = e._zod.parent;
		if (a) o.ref = a, U(a, t, r), t.seen.get(a).isParent = !0;
		else if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
	}
	let c = t.metadataRegistry.get(e);
	return c && Object.assign(o.schema, c), t.io === "input" && Kl(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && o.schema._prefault && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Wl(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${a}`
			};
		}
		if (t[1] === n) return { ref: "#" };
		let i = `#/${r}/`, a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + a
		};
	}, i = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: i } = r(e);
		t.def = { ...t.schema }, i && (t.defId = i);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			i(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				i(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			i(n);
			continue;
		}
		if (r.cycle) {
			i(n);
			continue;
		}
		if (r.count > 1 && e.reused === "ref") {
			i(n);
			continue;
		}
	}
}
function Gl(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t), i = n.def ?? n.schema, a = { ...i };
		if (n.ref === null) return;
		let o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let t = e.seen.get(o).schema;
			t.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(t)) : (Object.assign(i, t), Object.assign(i, a));
		}
		n.isParent || e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	for (let t of [...e.seen.entries()].reverse()) r(t[0]);
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Object.assign(i, n.def ?? n.schema);
	let a = e.external?.defs ?? {};
	for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (a[e.defId] = e.def);
	}
	e.external || Object.keys(a).length > 0 && (e.target === "draft-2020-12" ? i.$defs = a : i.definitions = a);
	try {
		let e = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(e, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Jl(t, "input"),
					output: Jl(t, "output")
				}
			},
			enumerable: !1,
			writable: !1
		}), e;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function Kl(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return Kl(r.element, n);
	if (r.type === "set") return Kl(r.valueType, n);
	if (r.type === "lazy") return Kl(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return Kl(r.innerType, n);
	if (r.type === "intersection") return Kl(r.left, n) || Kl(r.right, n);
	if (r.type === "record" || r.type === "map") return Kl(r.keyType, n) || Kl(r.valueType, n);
	if (r.type === "pipe") return Kl(r.in, n) || Kl(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (Kl(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (Kl(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (Kl(e, n)) return !0;
		return !!(r.rest && Kl(r.rest, n));
	}
	return !1;
}
var ql = (e, t = {}) => (n) => {
	let r = Ul({
		...n,
		processors: t
	});
	return U(e, r), Wl(r, e), Gl(r, e);
}, Jl = (e, t) => (n) => {
	let { libraryOptions: r, target: i } = n ?? {}, a = Ul({
		...r ?? {},
		target: i,
		io: t,
		processors: {}
	});
	return U(e, a), Wl(a, e), Gl(a, e);
}, Yl = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, Xl = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = Yl[s] ?? s, i.format === "" && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c];
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, Zl = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, format: s, multipleOf: c, exclusiveMaximum: l, exclusiveMinimum: u } = e._zod.bag;
	typeof s == "string" && s.includes("int") ? i.type = "integer" : i.type = "number", typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (i.minimum = u, i.exclusiveMinimum = !0) : i.exclusiveMinimum = u), typeof a == "number" && (i.minimum = a, typeof u == "number" && t.target !== "draft-04" && (u >= a ? delete i.minimum : delete i.exclusiveMinimum)), typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (i.maximum = l, i.exclusiveMaximum = !0) : i.exclusiveMaximum = l), typeof o == "number" && (i.maximum = o, typeof l == "number" && t.target !== "draft-04" && (l <= o ? delete i.maximum : delete i.exclusiveMaximum)), typeof c == "number" && (i.multipleOf = c);
}, Ql = (e, t, n, r) => {
	n.type = "boolean";
}, $l = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("BigInt cannot be represented in JSON Schema");
}, eu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Symbols cannot be represented in JSON Schema");
}, tu = (e, t, n, r) => {
	t.target === "openapi-3.0" ? (n.type = "string", n.nullable = !0, n.enum = [null]) : n.type = "null";
}, nu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Undefined cannot be represented in JSON Schema");
}, ru = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Void cannot be represented in JSON Schema");
}, iu = (e, t, n, r) => {
	n.not = {};
}, au = (e, t, n, r) => {}, ou = (e, t, n, r) => {}, su = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Date cannot be represented in JSON Schema");
}, cu = (e, t, n, r) => {
	let i = e._zod.def, a = Fe(i.entries);
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, lu = (e, t, n, r) => {
	let i = e._zod.def, a = [];
	for (let e of i.values) if (e === void 0) {
		if (t.unrepresentable === "throw") throw Error("Literal `undefined` cannot be represented in JSON Schema");
	} else if (typeof e == "bigint") {
		if (t.unrepresentable === "throw") throw Error("BigInt literals cannot be represented in JSON Schema");
		a.push(Number(e));
	} else a.push(e);
	if (a.length !== 0) if (a.length === 1) {
		let e = a[0];
		n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
	} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
}, uu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("NaN cannot be represented in JSON Schema");
}, du = (e, t, n, r) => {
	let i = n, a = e._zod.pattern;
	if (!a) throw Error("Pattern not found in template literal");
	i.type = "string", i.pattern = a.source;
}, fu = (e, t, n, r) => {
	let i = n, a = {
		type: "string",
		format: "binary",
		contentEncoding: "binary"
	}, { minimum: o, maximum: s, mime: c } = e._zod.bag;
	o !== void 0 && (a.minLength = o), s !== void 0 && (a.maxLength = s), c ? c.length === 1 ? (a.contentMediaType = c[0], Object.assign(i, a)) : i.anyOf = c.map((e) => ({
		...a,
		contentMediaType: e
	})) : Object.assign(i, a);
}, pu = (e, t, n, r) => {
	n.type = "boolean";
}, mu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
}, hu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Function types cannot be represented in JSON Schema");
}, gu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
}, _u = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Map cannot be represented in JSON Schema");
}, vu = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Set cannot be represented in JSON Schema");
}, yu = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = e._zod.bag;
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = U(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
}, bu = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object", i.properties = {};
	let o = a.shape;
	for (let e in o) i.properties[e] = U(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	});
	let s = new Set(Object.keys(o)), c = new Set([...s].filter((e) => {
		let n = a.shape[e]._zod;
		return t.io === "input" ? n.optin === void 0 : n.optout === void 0;
	}));
	c.size > 0 && (i.required = Array.from(c)), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = U(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, xu = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => U(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Su = (e, t, n, r) => {
	let i = e._zod.def, a = U(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = U(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1;
	n.allOf = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
}, Cu = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "array";
	let o = t.target === "draft-2020-12" ? "prefixItems" : "items", s = t.target === "draft-2020-12" || t.target === "openapi-3.0" ? "items" : "additionalItems", c = a.items.map((e, n) => U(e, t, {
		...r,
		path: [
			...r.path,
			o,
			n
		]
	})), l = a.rest ? U(a.rest, t, {
		...r,
		path: [
			...r.path,
			s,
			...t.target === "openapi-3.0" ? [a.items.length] : []
		]
	}) : null;
	t.target === "draft-2020-12" ? (i.prefixItems = c, l && (i.items = l)) : t.target === "openapi-3.0" ? (i.items = { anyOf: c }, l && i.items.anyOf.push(l), i.minItems = c.length, l || (i.maxItems = c.length)) : (i.items = c, l && (i.additionalItems = l));
	let { minimum: u, maximum: d } = e._zod.bag;
	typeof u == "number" && (i.minItems = u), typeof d == "number" && (i.maxItems = d);
}, wu = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object", (t.target === "draft-07" || t.target === "draft-2020-12") && (i.propertyNames = U(a.keyType, t, {
		...r,
		path: [...r.path, "propertyNames"]
	})), i.additionalProperties = U(a.valueType, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	});
}, Tu = (e, t, n, r) => {
	let i = e._zod.def, a = U(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Eu = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Du = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.default = JSON.parse(JSON.stringify(i.defaultValue));
}, Ou = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue)));
}, ku = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		throw Error("Dynamic catch values are not supported in JSON Schema");
	}
	n.default = o;
}, Au = (e, t, n, r) => {
	let i = e._zod.def, a = t.io === "input" ? i.in._zod.def.type === "transform" ? i.out : i.in : i.out;
	U(a, t, r);
	let o = t.seen.get(e);
	o.ref = a;
}, ju = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Mu = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Nu = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Pu = (e, t, n, r) => {
	let i = e._zod.innerType;
	U(i, t, r);
	let a = t.seen.get(e);
	a.ref = i;
}, Fu = {
	string: Xl,
	number: Zl,
	boolean: Ql,
	bigint: $l,
	symbol: eu,
	null: tu,
	undefined: nu,
	void: ru,
	never: iu,
	any: au,
	unknown: ou,
	date: su,
	enum: cu,
	literal: lu,
	nan: uu,
	template_literal: du,
	file: fu,
	success: pu,
	custom: mu,
	function: hu,
	transform: gu,
	map: _u,
	set: vu,
	array: yu,
	object: bu,
	union: xu,
	intersection: Su,
	tuple: Cu,
	record: wu,
	nullable: Tu,
	nonoptional: Eu,
	default: Du,
	prefault: Ou,
	catch: ku,
	pipe: Au,
	readonly: ju,
	promise: Mu,
	optional: Nu,
	lazy: Pu
};
function Iu(e, t) {
	if ("_idmap" in e) {
		let n = e, r = Ul({
			...t,
			processors: Fu
		}), i = {};
		for (let e of n._idmap.entries()) {
			let [t, n] = e;
			U(n, r);
		}
		let a = {};
		r.external = {
			registry: n,
			uri: t?.uri,
			defs: i
		};
		for (let e of n._idmap.entries()) {
			let [t, n] = e;
			Wl(r, n), a[t] = Gl(r, n);
		}
		return Object.keys(i).length > 0 && (a.__shared = { [r.target === "draft-2020-12" ? "$defs" : "definitions"]: i }), { schemas: a };
	}
	let n = Ul({
		...t,
		processors: Fu
	});
	return U(e, n), Wl(n, e), Gl(n, e);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/core/json-schema-generator.js
var Lu = class {
	get metadataRegistry() {
		return this.ctx.metadataRegistry;
	}
	get target() {
		return this.ctx.target;
	}
	get unrepresentable() {
		return this.ctx.unrepresentable;
	}
	get override() {
		return this.ctx.override;
	}
	get io() {
		return this.ctx.io;
	}
	get counter() {
		return this.ctx.counter;
	}
	set counter(e) {
		this.ctx.counter = e;
	}
	get seen() {
		return this.ctx.seen;
	}
	constructor(e) {
		let t = e?.target ?? "draft-2020-12";
		t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), this.ctx = Ul({
			processors: Fu,
			target: t,
			...e?.metadata && { metadata: e.metadata },
			...e?.unrepresentable && { unrepresentable: e.unrepresentable },
			...e?.override && { override: e.override },
			...e?.io && { io: e.io }
		});
	}
	process(e, t = {
		path: [],
		schemaPath: []
	}) {
		return U(e, this.ctx, t);
	}
	emit(e, t) {
		t && (t.cycles && (this.ctx.cycles = t.cycles), t.reused && (this.ctx.reused = t.reused), t.external && (this.ctx.external = t.external)), Wl(this.ctx, e);
		let { "~standard": n, ...r } = Gl(this.ctx, e);
		return r;
	}
}, Ru = /* @__PURE__ */ j({}), zu = /* @__PURE__ */ j({
	$ZodAny: () => ji,
	$ZodArray: () => Li,
	$ZodAsyncError: () => Ee,
	$ZodBase64: () => gi,
	$ZodBase64URL: () => vi,
	$ZodBigInt: () => Ei,
	$ZodBigIntFormat: () => Di,
	$ZodBoolean: () => Ti,
	$ZodCIDRv4: () => pi,
	$ZodCIDRv6: () => mi,
	$ZodCUID: () => ti,
	$ZodCUID2: () => ni,
	$ZodCatch: () => _a,
	$ZodCheck: () => B,
	$ZodCheckBigIntFormat: () => Or,
	$ZodCheckEndsWith: () => Vr,
	$ZodCheckGreaterThan: () => Tr,
	$ZodCheckIncludes: () => zr,
	$ZodCheckLengthEquals: () => Pr,
	$ZodCheckLessThan: () => wr,
	$ZodCheckLowerCase: () => Lr,
	$ZodCheckMaxLength: () => Mr,
	$ZodCheckMaxSize: () => kr,
	$ZodCheckMimeType: () => Wr,
	$ZodCheckMinLength: () => Nr,
	$ZodCheckMinSize: () => Ar,
	$ZodCheckMultipleOf: () => Er,
	$ZodCheckNumberFormat: () => Dr,
	$ZodCheckOverwrite: () => Gr,
	$ZodCheckProperty: () => Ur,
	$ZodCheckRegex: () => Ir,
	$ZodCheckSizeEquals: () => jr,
	$ZodCheckStartsWith: () => Br,
	$ZodCheckStringFormat: () => Fr,
	$ZodCheckUpperCase: () => Rr,
	$ZodCodec: () => xa,
	$ZodCustom: () => Aa,
	$ZodCustomStringFormat: () => Si,
	$ZodDate: () => Fi,
	$ZodDefault: () => da,
	$ZodDiscriminatedUnion: () => qi,
	$ZodE164: () => yi,
	$ZodEmail: () => Zr,
	$ZodEmoji: () => $r,
	$ZodEncodeError: () => De,
	$ZodEnum: () => ia,
	$ZodError: () => Ft,
	$ZodFile: () => oa,
	$ZodFunction: () => Da,
	$ZodGUID: () => Yr,
	$ZodIPv4: () => ui,
	$ZodIPv6: () => di,
	$ZodISODate: () => si,
	$ZodISODateTime: () => oi,
	$ZodISODuration: () => li,
	$ZodISOTime: () => ci,
	$ZodIntersection: () => Ji,
	$ZodJWT: () => xi,
	$ZodKSUID: () => ai,
	$ZodLazy: () => ka,
	$ZodLiteral: () => aa,
	$ZodMAC: () => fi,
	$ZodMap: () => ea,
	$ZodNaN: () => va,
	$ZodNanoID: () => ei,
	$ZodNever: () => Ni,
	$ZodNonOptional: () => ma,
	$ZodNull: () => Ai,
	$ZodNullable: () => ua,
	$ZodNumber: () => Ci,
	$ZodNumberFormat: () => wi,
	$ZodObject: () => Vi,
	$ZodObjectJIT: () => Hi,
	$ZodOptional: () => la,
	$ZodPipe: () => ya,
	$ZodPrefault: () => pa,
	$ZodPromise: () => Oa,
	$ZodReadonly: () => wa,
	$ZodRealError: () => It,
	$ZodRecord: () => $i,
	$ZodRegistry: () => Ns,
	$ZodSet: () => na,
	$ZodString: () => Jr,
	$ZodStringFormat: () => H,
	$ZodSuccess: () => ga,
	$ZodSymbol: () => Oi,
	$ZodTemplateLiteral: () => Ea,
	$ZodTransform: () => sa,
	$ZodTuple: () => Zi,
	$ZodType: () => V,
	$ZodULID: () => ri,
	$ZodURL: () => Qr,
	$ZodUUID: () => Xr,
	$ZodUndefined: () => ki,
	$ZodUnion: () => Wi,
	$ZodUnknown: () => Mi,
	$ZodVoid: () => Pi,
	$ZodXID: () => ii,
	$ZodXor: () => Ki,
	$brand: () => Te,
	$constructor: () => P,
	$input: () => Ms,
	$output: () => js,
	Doc: () => Kr,
	JSONSchema: () => Ru,
	JSONSchemaGenerator: () => Lu,
	NEVER: () => we,
	TimePrecision: () => sc,
	_any: () => Oc,
	_array: () => ul,
	_base64: () => rc,
	_base64url: () => ic,
	_bigint: () => xc,
	_boolean: () => yc,
	_catch: () => kl,
	_check: () => Rl,
	_cidrv4: () => tc,
	_cidrv6: () => nc,
	_coercedBigint: () => Sc,
	_coercedBoolean: () => bc,
	_coercedDate: () => Nc,
	_coercedNumber: () => pc,
	_coercedString: () => Ls,
	_cuid: () => qs,
	_cuid2: () => Js,
	_custom: () => Fl,
	_date: () => Mc,
	_decode: () => Qt,
	_decodeAsync: () => nn,
	_default: () => El,
	_discriminatedUnion: () => pl,
	_e164: () => ac,
	_email: () => Rs,
	_emoji: () => Gs,
	_encode: () => Xt,
	_encodeAsync: () => en,
	_endsWith: () => tl,
	_enum: () => yl,
	_file: () => Sl,
	_float32: () => hc,
	_float64: () => gc,
	_gt: () => Lc,
	_gte: () => Rc,
	_guid: () => zs,
	_includes: () => $c,
	_int: () => mc,
	_int32: () => _c,
	_int64: () => Cc,
	_intersection: () => ml,
	_ipv4: () => Qs,
	_ipv6: () => $s,
	_isoDate: () => lc,
	_isoDateTime: () => cc,
	_isoDuration: () => dc,
	_isoTime: () => uc,
	_jwt: () => oc,
	_ksuid: () => Zs,
	_lazy: () => Nl,
	_length: () => Yc,
	_literal: () => xl,
	_lowercase: () => Zc,
	_lt: () => Fc,
	_lte: () => Ic,
	_mac: () => ec,
	_map: () => _l,
	_max: () => Ic,
	_maxLength: () => qc,
	_maxSize: () => Wc,
	_mime: () => rl,
	_min: () => Rc,
	_minLength: () => Jc,
	_minSize: () => Gc,
	_multipleOf: () => Uc,
	_nan: () => Pc,
	_nanoid: () => Ks,
	_nativeEnum: () => bl,
	_negative: () => Bc,
	_never: () => Ac,
	_nonnegative: () => Hc,
	_nonoptional: () => Dl,
	_nonpositive: () => Vc,
	_normalize: () => al,
	_null: () => Dc,
	_nullable: () => Tl,
	_number: () => fc,
	_optional: () => wl,
	_overwrite: () => il,
	_parse: () => Ht,
	_parseAsync: () => Wt,
	_pipe: () => Al,
	_positive: () => zc,
	_promise: () => Pl,
	_property: () => nl,
	_readonly: () => jl,
	_record: () => gl,
	_refine: () => Il,
	_regex: () => Xc,
	_safeDecode: () => sn,
	_safeDecodeAsync: () => dn,
	_safeEncode: () => an,
	_safeEncodeAsync: () => ln,
	_safeParse: () => Kt,
	_safeParseAsync: () => Jt,
	_set: () => vl,
	_size: () => Kc,
	_slugify: () => ll,
	_startsWith: () => el,
	_string: () => Is,
	_stringFormat: () => Hl,
	_stringbool: () => Vl,
	_success: () => Ol,
	_superRefine: () => Ll,
	_symbol: () => Tc,
	_templateLiteral: () => Ml,
	_toLowerCase: () => sl,
	_toUpperCase: () => cl,
	_transform: () => Cl,
	_trim: () => ol,
	_tuple: () => hl,
	_uint32: () => vc,
	_uint64: () => wc,
	_ulid: () => Ys,
	_undefined: () => Ec,
	_union: () => dl,
	_unknown: () => kc,
	_uppercase: () => Qc,
	_url: () => Ws,
	_uuid: () => Bs,
	_uuidv4: () => Vs,
	_uuidv6: () => Hs,
	_uuidv7: () => Us,
	_void: () => jc,
	_xid: () => Xs,
	_xor: () => fl,
	clone: () => st,
	config: () => F,
	createStandardJSONSchemaMethod: () => Jl,
	createToJSONSchemaMethod: () => ql,
	decode: () => $t,
	decodeAsync: () => rn,
	describe: () => zl,
	encode: () => Zt,
	encodeAsync: () => tn,
	extractDefs: () => Wl,
	finalize: () => Gl,
	flattenError: () => Lt,
	formatError: () => Rt,
	globalConfig: () => Oe,
	globalRegistry: () => Fs,
	initializeContext: () => Ul,
	isValidBase64: () => hi,
	isValidBase64URL: () => _i,
	isValidJWT: () => bi,
	locales: () => ks,
	meta: () => Bl,
	parse: () => Ut,
	parseAsync: () => Gt,
	prettifyError: () => Vt,
	process: () => U,
	regexes: () => pn,
	registry: () => Ps,
	safeDecode: () => cn,
	safeDecodeAsync: () => fn,
	safeEncode: () => on,
	safeEncodeAsync: () => un,
	safeParse: () => qt,
	safeParseAsync: () => Yt,
	toDotPath: () => Bt,
	toJSONSchema: () => Iu,
	treeifyError: () => zt,
	util: () => ke,
	version: () => qr
}), Bu = /* @__PURE__ */ j({
	endsWith: () => tl,
	gt: () => Lc,
	gte: () => Rc,
	includes: () => $c,
	length: () => Yc,
	lowercase: () => Zc,
	lt: () => Fc,
	lte: () => Ic,
	maxLength: () => qc,
	maxSize: () => Wc,
	mime: () => rl,
	minLength: () => Jc,
	minSize: () => Gc,
	multipleOf: () => Uc,
	negative: () => Bc,
	nonnegative: () => Hc,
	nonpositive: () => Vc,
	normalize: () => al,
	overwrite: () => il,
	positive: () => zc,
	property: () => nl,
	regex: () => Xc,
	size: () => Kc,
	slugify: () => ll,
	startsWith: () => el,
	toLowerCase: () => sl,
	toUpperCase: () => cl,
	trim: () => ol,
	uppercase: () => Qc
}), Vu = /* @__PURE__ */ j({
	ZodISODate: () => Wu,
	ZodISODateTime: () => Hu,
	ZodISODuration: () => Ju,
	ZodISOTime: () => Ku,
	date: () => Gu,
	datetime: () => Uu,
	duration: () => Yu,
	time: () => qu
}), Hu = /* @__PURE__ */ P("ZodISODateTime", (e, t) => {
	oi.init(e, t), G.init(e, t);
});
function Uu(e) {
	return cc(Hu, e);
}
var Wu = /* @__PURE__ */ P("ZodISODate", (e, t) => {
	si.init(e, t), G.init(e, t);
});
function Gu(e) {
	return lc(Wu, e);
}
var Ku = /* @__PURE__ */ P("ZodISOTime", (e, t) => {
	ci.init(e, t), G.init(e, t);
});
function qu(e) {
	return uc(Ku, e);
}
var Ju = /* @__PURE__ */ P("ZodISODuration", (e, t) => {
	li.init(e, t), G.init(e, t);
});
function Yu(e) {
	return dc(Ju, e);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/errors.js
var Xu = (e, t) => {
	Ft.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
		format: { value: (t) => Rt(e, t) },
		flatten: { value: (t) => Lt(e, t) },
		addIssue: { value: (t) => {
			e.issues.push(t), e.message = JSON.stringify(e.issues, Ie, 2);
		} },
		addIssues: { value: (t) => {
			e.issues.push(...t), e.message = JSON.stringify(e.issues, Ie, 2);
		} },
		isEmpty: { get() {
			return e.issues.length === 0;
		} }
	});
}, Zu = P("ZodError", Xu), Qu = P("ZodError", Xu, { Parent: Error }), $u = /* @__PURE__ */ Ht(Qu), ed = /* @__PURE__ */ Wt(Qu), td = /* @__PURE__ */ Kt(Qu), nd = /* @__PURE__ */ Jt(Qu), rd = /* @__PURE__ */ Xt(Qu), id = /* @__PURE__ */ Qt(Qu), ad = /* @__PURE__ */ en(Qu), od = /* @__PURE__ */ nn(Qu), sd = /* @__PURE__ */ an(Qu), cd = /* @__PURE__ */ sn(Qu), ld = /* @__PURE__ */ ln(Qu), ud = /* @__PURE__ */ dn(Qu), dd = /* @__PURE__ */ j({
	ZodAny: () => Mf,
	ZodArray: () => Hf,
	ZodBase64: () => Zd,
	ZodBase64URL: () => $d,
	ZodBigInt: () => xf,
	ZodBigIntFormat: () => Cf,
	ZodBoolean: () => yf,
	ZodCIDRv4: () => qd,
	ZodCIDRv6: () => Yd,
	ZodCUID: () => jd,
	ZodCUID2: () => Nd,
	ZodCatch: () => Fp,
	ZodCodec: () => Vp,
	ZodCustom: () => $p,
	ZodCustomStringFormat: () => of,
	ZodDate: () => Bf,
	ZodDefault: () => Dp,
	ZodDiscriminatedUnion: () => $f,
	ZodE164: () => tf,
	ZodEmail: () => hd,
	ZodEmoji: () => Dd,
	ZodEnum: () => pp,
	ZodFile: () => vp,
	ZodFunction: () => Zp,
	ZodGUID: () => _d,
	ZodIPv4: () => Vd,
	ZodIPv6: () => Gd,
	ZodIntersection: () => tp,
	ZodJWT: () => rf,
	ZodKSUID: () => zd,
	ZodLazy: () => qp,
	ZodLiteral: () => gp,
	ZodMAC: () => Ud,
	ZodMap: () => lp,
	ZodNaN: () => Lp,
	ZodNanoID: () => kd,
	ZodNever: () => If,
	ZodNonOptional: () => jp,
	ZodNull: () => Af,
	ZodNullable: () => wp,
	ZodNumber: () => df,
	ZodNumberFormat: () => pf,
	ZodObject: () => Gf,
	ZodOptional: () => Sp,
	ZodPipe: () => zp,
	ZodPrefault: () => kp,
	ZodPromise: () => Yp,
	ZodReadonly: () => Up,
	ZodRecord: () => ap,
	ZodSet: () => dp,
	ZodString: () => pd,
	ZodStringFormat: () => G,
	ZodSuccess: () => Np,
	ZodSymbol: () => Ef,
	ZodTemplateLiteral: () => Gp,
	ZodTransform: () => bp,
	ZodTuple: () => rp,
	ZodType: () => W,
	ZodULID: () => Fd,
	ZodURL: () => wd,
	ZodUUID: () => yd,
	ZodUndefined: () => Of,
	ZodUnion: () => Yf,
	ZodUnknown: () => Pf,
	ZodVoid: () => Rf,
	ZodXID: () => Ld,
	ZodXor: () => Zf,
	_ZodString: () => fd,
	_default: () => Op,
	_function: () => Qp,
	any: () => Nf,
	array: () => Uf,
	base64: () => Qd,
	base64url: () => ef,
	bigint: () => Sf,
	boolean: () => bf,
	catch: () => Ip,
	check: () => em,
	cidrv4: () => Jd,
	cidrv6: () => Xd,
	codec: () => Hp,
	cuid: () => Md,
	cuid2: () => Pd,
	custom: () => tm,
	date: () => Vf,
	describe: () => im,
	discriminatedUnion: () => ep,
	e164: () => nf,
	email: () => gd,
	emoji: () => Od,
	enum: () => mp,
	file: () => yp,
	float32: () => hf,
	float64: () => gf,
	function: () => Qp,
	guid: () => vd,
	hash: () => uf,
	hex: () => lf,
	hostname: () => cf,
	httpUrl: () => Ed,
	instanceof: () => om,
	int: () => mf,
	int32: () => _f,
	int64: () => wf,
	intersection: () => np,
	ipv4: () => Hd,
	ipv6: () => Kd,
	json: () => cm,
	jwt: () => af,
	keyof: () => Wf,
	ksuid: () => Bd,
	lazy: () => Jp,
	literal: () => _p,
	looseObject: () => Jf,
	looseRecord: () => cp,
	mac: () => Wd,
	map: () => up,
	meta: () => am,
	nan: () => Rp,
	nanoid: () => Ad,
	nativeEnum: () => hp,
	never: () => Lf,
	nonoptional: () => Mp,
	null: () => jf,
	nullable: () => Tp,
	nullish: () => Ep,
	number: () => ff,
	object: () => Kf,
	optional: () => Cp,
	partialRecord: () => sp,
	pipe: () => Bp,
	prefault: () => Ap,
	preprocess: () => lm,
	promise: () => Xp,
	readonly: () => Wp,
	record: () => op,
	refine: () => nm,
	set: () => fp,
	strictObject: () => qf,
	string: () => md,
	stringFormat: () => sf,
	stringbool: () => sm,
	success: () => Pp,
	superRefine: () => rm,
	symbol: () => Df,
	templateLiteral: () => Kp,
	transform: () => xp,
	tuple: () => ip,
	uint32: () => vf,
	uint64: () => Tf,
	ulid: () => Id,
	undefined: () => kf,
	union: () => Xf,
	unknown: () => Ff,
	url: () => Td,
	uuid: () => bd,
	uuidv4: () => xd,
	uuidv6: () => Sd,
	uuidv7: () => Cd,
	void: () => zf,
	xid: () => Rd,
	xor: () => Qf
}), W = /* @__PURE__ */ P("ZodType", (e, t) => (V.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
	input: Jl(e, "input"),
	output: Jl(e, "output")
} }), e.toJSONSchema = ql(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(We(t, { checks: [...t.checks ?? [], ...n.map((e) => typeof e == "function" ? { _zod: {
	check: e,
	def: { check: "custom" },
	onattach: []
} } : e)] })), e.clone = (t, n) => st(e, t, n), e.brand = () => e, e.register = ((t, n) => (t.add(e, n), e)), e.parse = (t, n) => $u(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => td(e, t, n), e.parseAsync = async (t, n) => ed(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => nd(e, t, n), e.spa = e.safeParseAsync, e.encode = (t, n) => rd(e, t, n), e.decode = (t, n) => id(e, t, n), e.encodeAsync = async (t, n) => ad(e, t, n), e.decodeAsync = async (t, n) => od(e, t, n), e.safeEncode = (t, n) => sd(e, t, n), e.safeDecode = (t, n) => cd(e, t, n), e.safeEncodeAsync = async (t, n) => ld(e, t, n), e.safeDecodeAsync = async (t, n) => ud(e, t, n), e.refine = (t, n) => e.check(nm(t, n)), e.superRefine = (t) => e.check(rm(t)), e.overwrite = (t) => e.check(il(t)), e.optional = () => Cp(e), e.nullable = () => Tp(e), e.nullish = () => Cp(Tp(e)), e.nonoptional = (t) => Mp(e, t), e.array = () => Uf(e), e.or = (t) => Xf([e, t]), e.and = (t) => np(e, t), e.transform = (t) => Bp(e, xp(t)), e.default = (t) => Op(e, t), e.prefault = (t) => Ap(e, t), e.catch = (t) => Ip(e, t), e.pipe = (t) => Bp(e, t), e.readonly = () => Wp(e), e.describe = (t) => {
	let n = e.clone();
	return Fs.add(n, { description: t }), n;
}, Object.defineProperty(e, "description", {
	get() {
		return Fs.get(e)?.description;
	},
	configurable: !0
}), e.meta = (...t) => {
	if (t.length === 0) return Fs.get(e);
	let n = e.clone();
	return Fs.add(n, t[0]), n;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e)), fd = /* @__PURE__ */ P("_ZodString", (e, t) => {
	Jr.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xl(e, t, n, r);
	let n = e._zod.bag;
	e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...t) => e.check(Xc(...t)), e.includes = (...t) => e.check($c(...t)), e.startsWith = (...t) => e.check(el(...t)), e.endsWith = (...t) => e.check(tl(...t)), e.min = (...t) => e.check(Jc(...t)), e.max = (...t) => e.check(qc(...t)), e.length = (...t) => e.check(Yc(...t)), e.nonempty = (...t) => e.check(Jc(1, ...t)), e.lowercase = (t) => e.check(Zc(t)), e.uppercase = (t) => e.check(Qc(t)), e.trim = () => e.check(ol()), e.normalize = (...t) => e.check(al(...t)), e.toLowerCase = () => e.check(sl()), e.toUpperCase = () => e.check(cl()), e.slugify = () => e.check(ll());
}), pd = /* @__PURE__ */ P("ZodString", (e, t) => {
	Jr.init(e, t), fd.init(e, t), e.email = (t) => e.check(Rs(hd, t)), e.url = (t) => e.check(Ws(wd, t)), e.jwt = (t) => e.check(oc(rf, t)), e.emoji = (t) => e.check(Gs(Dd, t)), e.guid = (t) => e.check(zs(_d, t)), e.uuid = (t) => e.check(Bs(yd, t)), e.uuidv4 = (t) => e.check(Vs(yd, t)), e.uuidv6 = (t) => e.check(Hs(yd, t)), e.uuidv7 = (t) => e.check(Us(yd, t)), e.nanoid = (t) => e.check(Ks(kd, t)), e.guid = (t) => e.check(zs(_d, t)), e.cuid = (t) => e.check(qs(jd, t)), e.cuid2 = (t) => e.check(Js(Nd, t)), e.ulid = (t) => e.check(Ys(Fd, t)), e.base64 = (t) => e.check(rc(Zd, t)), e.base64url = (t) => e.check(ic($d, t)), e.xid = (t) => e.check(Xs(Ld, t)), e.ksuid = (t) => e.check(Zs(zd, t)), e.ipv4 = (t) => e.check(Qs(Vd, t)), e.ipv6 = (t) => e.check($s(Gd, t)), e.cidrv4 = (t) => e.check(tc(qd, t)), e.cidrv6 = (t) => e.check(nc(Yd, t)), e.e164 = (t) => e.check(ac(tf, t)), e.datetime = (t) => e.check(Uu(t)), e.date = (t) => e.check(Gu(t)), e.time = (t) => e.check(qu(t)), e.duration = (t) => e.check(Yu(t));
});
function md(e) {
	return Is(pd, e);
}
var G = /* @__PURE__ */ P("ZodStringFormat", (e, t) => {
	H.init(e, t), fd.init(e, t);
}), hd = /* @__PURE__ */ P("ZodEmail", (e, t) => {
	Zr.init(e, t), G.init(e, t);
});
function gd(e) {
	return Rs(hd, e);
}
var _d = /* @__PURE__ */ P("ZodGUID", (e, t) => {
	Yr.init(e, t), G.init(e, t);
});
function vd(e) {
	return zs(_d, e);
}
var yd = /* @__PURE__ */ P("ZodUUID", (e, t) => {
	Xr.init(e, t), G.init(e, t);
});
function bd(e) {
	return Bs(yd, e);
}
function xd(e) {
	return Vs(yd, e);
}
function Sd(e) {
	return Hs(yd, e);
}
function Cd(e) {
	return Us(yd, e);
}
var wd = /* @__PURE__ */ P("ZodURL", (e, t) => {
	Qr.init(e, t), G.init(e, t);
});
function Td(e) {
	return Ws(wd, e);
}
function Ed(e) {
	return Ws(wd, {
		protocol: /^https?$/,
		hostname: Un,
		...R(e)
	});
}
var Dd = /* @__PURE__ */ P("ZodEmoji", (e, t) => {
	$r.init(e, t), G.init(e, t);
});
function Od(e) {
	return Gs(Dd, e);
}
var kd = /* @__PURE__ */ P("ZodNanoID", (e, t) => {
	ei.init(e, t), G.init(e, t);
});
function Ad(e) {
	return Ks(kd, e);
}
var jd = /* @__PURE__ */ P("ZodCUID", (e, t) => {
	ti.init(e, t), G.init(e, t);
});
function Md(e) {
	return qs(jd, e);
}
var Nd = /* @__PURE__ */ P("ZodCUID2", (e, t) => {
	ni.init(e, t), G.init(e, t);
});
function Pd(e) {
	return Js(Nd, e);
}
var Fd = /* @__PURE__ */ P("ZodULID", (e, t) => {
	ri.init(e, t), G.init(e, t);
});
function Id(e) {
	return Ys(Fd, e);
}
var Ld = /* @__PURE__ */ P("ZodXID", (e, t) => {
	ii.init(e, t), G.init(e, t);
});
function Rd(e) {
	return Xs(Ld, e);
}
var zd = /* @__PURE__ */ P("ZodKSUID", (e, t) => {
	ai.init(e, t), G.init(e, t);
});
function Bd(e) {
	return Zs(zd, e);
}
var Vd = /* @__PURE__ */ P("ZodIPv4", (e, t) => {
	ui.init(e, t), G.init(e, t);
});
function Hd(e) {
	return Qs(Vd, e);
}
var Ud = /* @__PURE__ */ P("ZodMAC", (e, t) => {
	fi.init(e, t), G.init(e, t);
});
function Wd(e) {
	return ec(Ud, e);
}
var Gd = /* @__PURE__ */ P("ZodIPv6", (e, t) => {
	di.init(e, t), G.init(e, t);
});
function Kd(e) {
	return $s(Gd, e);
}
var qd = /* @__PURE__ */ P("ZodCIDRv4", (e, t) => {
	pi.init(e, t), G.init(e, t);
});
function Jd(e) {
	return tc(qd, e);
}
var Yd = /* @__PURE__ */ P("ZodCIDRv6", (e, t) => {
	mi.init(e, t), G.init(e, t);
});
function Xd(e) {
	return nc(Yd, e);
}
var Zd = /* @__PURE__ */ P("ZodBase64", (e, t) => {
	gi.init(e, t), G.init(e, t);
});
function Qd(e) {
	return rc(Zd, e);
}
var $d = /* @__PURE__ */ P("ZodBase64URL", (e, t) => {
	vi.init(e, t), G.init(e, t);
});
function ef(e) {
	return ic($d, e);
}
var tf = /* @__PURE__ */ P("ZodE164", (e, t) => {
	yi.init(e, t), G.init(e, t);
});
function nf(e) {
	return ac(tf, e);
}
var rf = /* @__PURE__ */ P("ZodJWT", (e, t) => {
	xi.init(e, t), G.init(e, t);
});
function af(e) {
	return oc(rf, e);
}
var of = /* @__PURE__ */ P("ZodCustomStringFormat", (e, t) => {
	Si.init(e, t), G.init(e, t);
});
function sf(e, t, n = {}) {
	return Hl(of, e, t, n);
}
function cf(e) {
	return Hl(of, "hostname", Hn, e);
}
function lf(e) {
	return Hl(of, "hex", ar, e);
}
function uf(e, t) {
	let n = `${e}_${t?.enc ?? "hex"}`, r = pn[n];
	if (!r) throw Error(`Unrecognized hash format: ${n}`);
	return Hl(of, n, r, t);
}
var df = /* @__PURE__ */ P("ZodNumber", (e, t) => {
	Ci.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Zl(e, t, n, r), e.gt = (t, n) => e.check(Lc(t, n)), e.gte = (t, n) => e.check(Rc(t, n)), e.min = (t, n) => e.check(Rc(t, n)), e.lt = (t, n) => e.check(Fc(t, n)), e.lte = (t, n) => e.check(Ic(t, n)), e.max = (t, n) => e.check(Ic(t, n)), e.int = (t) => e.check(mf(t)), e.safe = (t) => e.check(mf(t)), e.positive = (t) => e.check(Lc(0, t)), e.nonnegative = (t) => e.check(Rc(0, t)), e.negative = (t) => e.check(Fc(0, t)), e.nonpositive = (t) => e.check(Ic(0, t)), e.multipleOf = (t, n) => e.check(Uc(t, n)), e.step = (t, n) => e.check(Uc(t, n)), e.finite = () => e;
	let n = e._zod.bag;
	e.minValue = Math.max(n.minimum ?? -Infinity, n.exclusiveMinimum ?? -Infinity) ?? null, e.maxValue = Math.min(n.maximum ?? Infinity, n.exclusiveMaximum ?? Infinity) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
});
function ff(e) {
	return fc(df, e);
}
var pf = /* @__PURE__ */ P("ZodNumberFormat", (e, t) => {
	wi.init(e, t), df.init(e, t);
});
function mf(e) {
	return mc(pf, e);
}
function hf(e) {
	return hc(pf, e);
}
function gf(e) {
	return gc(pf, e);
}
function _f(e) {
	return _c(pf, e);
}
function vf(e) {
	return vc(pf, e);
}
var yf = /* @__PURE__ */ P("ZodBoolean", (e, t) => {
	Ti.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ql(e, t, n, r);
});
function bf(e) {
	return yc(yf, e);
}
var xf = /* @__PURE__ */ P("ZodBigInt", (e, t) => {
	Ei.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => $l(e, t, n, r), e.gte = (t, n) => e.check(Rc(t, n)), e.min = (t, n) => e.check(Rc(t, n)), e.gt = (t, n) => e.check(Lc(t, n)), e.gte = (t, n) => e.check(Rc(t, n)), e.min = (t, n) => e.check(Rc(t, n)), e.lt = (t, n) => e.check(Fc(t, n)), e.lte = (t, n) => e.check(Ic(t, n)), e.max = (t, n) => e.check(Ic(t, n)), e.positive = (t) => e.check(Lc(BigInt(0), t)), e.negative = (t) => e.check(Fc(BigInt(0), t)), e.nonpositive = (t) => e.check(Ic(BigInt(0), t)), e.nonnegative = (t) => e.check(Rc(BigInt(0), t)), e.multipleOf = (t, n) => e.check(Uc(t, n));
	let n = e._zod.bag;
	e.minValue = n.minimum ?? null, e.maxValue = n.maximum ?? null, e.format = n.format ?? null;
});
function Sf(e) {
	return xc(xf, e);
}
var Cf = /* @__PURE__ */ P("ZodBigIntFormat", (e, t) => {
	Di.init(e, t), xf.init(e, t);
});
function wf(e) {
	return Cc(Cf, e);
}
function Tf(e) {
	return wc(Cf, e);
}
var Ef = /* @__PURE__ */ P("ZodSymbol", (e, t) => {
	Oi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => eu(e, t, n, r);
});
function Df(e) {
	return Tc(Ef, e);
}
var Of = /* @__PURE__ */ P("ZodUndefined", (e, t) => {
	ki.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => nu(e, t, n, r);
});
function kf(e) {
	return Ec(Of, e);
}
var Af = /* @__PURE__ */ P("ZodNull", (e, t) => {
	Ai.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => tu(e, t, n, r);
});
function jf(e) {
	return Dc(Af, e);
}
var Mf = /* @__PURE__ */ P("ZodAny", (e, t) => {
	ji.init(e, t), W.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Nf() {
	return Oc(Mf);
}
var Pf = /* @__PURE__ */ P("ZodUnknown", (e, t) => {
	Mi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Ff() {
	return kc(Pf);
}
var If = /* @__PURE__ */ P("ZodNever", (e, t) => {
	Ni.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => iu(e, t, n, r);
});
function Lf(e) {
	return Ac(If, e);
}
var Rf = /* @__PURE__ */ P("ZodVoid", (e, t) => {
	Pi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => ru(e, t, n, r);
});
function zf(e) {
	return jc(Rf, e);
}
var Bf = /* @__PURE__ */ P("ZodDate", (e, t) => {
	Fi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => su(e, t, n, r), e.min = (t, n) => e.check(Rc(t, n)), e.max = (t, n) => e.check(Ic(t, n));
	let n = e._zod.bag;
	e.minDate = n.minimum ? new Date(n.minimum) : null, e.maxDate = n.maximum ? new Date(n.maximum) : null;
});
function Vf(e) {
	return Mc(Bf, e);
}
var Hf = /* @__PURE__ */ P("ZodArray", (e, t) => {
	Li.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => yu(e, t, n, r), e.element = t.element, e.min = (t, n) => e.check(Jc(t, n)), e.nonempty = (t) => e.check(Jc(1, t)), e.max = (t, n) => e.check(qc(t, n)), e.length = (t, n) => e.check(Yc(t, n)), e.unwrap = () => e.element;
});
function Uf(e, t) {
	return ul(Hf, e, t);
}
function Wf(e) {
	let t = e._zod.def.shape;
	return mp(Object.keys(t));
}
var Gf = /* @__PURE__ */ P("ZodObject", (e, t) => {
	Hi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => bu(e, t, n, r), L(e, "shape", () => t.shape), e.keyof = () => mp(Object.keys(e._zod.def.shape)), e.catchall = (t) => e.clone({
		...e._zod.def,
		catchall: t
	}), e.passthrough = () => e.clone({
		...e._zod.def,
		catchall: Ff()
	}), e.loose = () => e.clone({
		...e._zod.def,
		catchall: Ff()
	}), e.strict = () => e.clone({
		...e._zod.def,
		catchall: Lf()
	}), e.strip = () => e.clone({
		...e._zod.def,
		catchall: void 0
	}), e.extend = (t) => mt(e, t), e.safeExtend = (t) => ht(e, t), e.merge = (t) => gt(e, t), e.pick = (t) => ft(e, t), e.omit = (t) => pt(e, t), e.partial = (...t) => _t(Sp, e, t[0]), e.required = (...t) => vt(jp, e, t[0]);
});
function Kf(e, t) {
	return new Gf({
		type: "object",
		shape: e ?? {},
		...R(t)
	});
}
function qf(e, t) {
	return new Gf({
		type: "object",
		shape: e,
		catchall: Lf(),
		...R(t)
	});
}
function Jf(e, t) {
	return new Gf({
		type: "object",
		shape: e,
		catchall: Ff(),
		...R(t)
	});
}
var Yf = /* @__PURE__ */ P("ZodUnion", (e, t) => {
	Wi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => xu(e, t, n, r), e.options = t.options;
});
function Xf(e, t) {
	return new Yf({
		type: "union",
		options: e,
		...R(t)
	});
}
var Zf = /* @__PURE__ */ P("ZodXor", (e, t) => {
	Yf.init(e, t), Ki.init(e, t), e._zod.processJSONSchema = (t, n, r) => xu(e, t, n, r), e.options = t.options;
});
function Qf(e, t) {
	return new Zf({
		type: "union",
		options: e,
		inclusive: !1,
		...R(t)
	});
}
var $f = /* @__PURE__ */ P("ZodDiscriminatedUnion", (e, t) => {
	Yf.init(e, t), qi.init(e, t);
});
function ep(e, t, n) {
	return new $f({
		type: "union",
		options: t,
		discriminator: e,
		...R(n)
	});
}
var tp = /* @__PURE__ */ P("ZodIntersection", (e, t) => {
	Ji.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Su(e, t, n, r);
});
function np(e, t) {
	return new tp({
		type: "intersection",
		left: e,
		right: t
	});
}
var rp = /* @__PURE__ */ P("ZodTuple", (e, t) => {
	Zi.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Cu(e, t, n, r), e.rest = (t) => e.clone({
		...e._zod.def,
		rest: t
	});
});
function ip(e, t, n) {
	let r = t instanceof V;
	return new rp({
		type: "tuple",
		items: e,
		rest: r ? t : null,
		...R(r ? n : t)
	});
}
var ap = /* @__PURE__ */ P("ZodRecord", (e, t) => {
	$i.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => wu(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function op(e, t, n) {
	return new ap({
		type: "record",
		keyType: e,
		valueType: t,
		...R(n)
	});
}
function sp(e, t, n) {
	let r = st(e);
	return r._zod.values = void 0, new ap({
		type: "record",
		keyType: r,
		valueType: t,
		...R(n)
	});
}
function cp(e, t, n) {
	return new ap({
		type: "record",
		keyType: e,
		valueType: t,
		mode: "loose",
		...R(n)
	});
}
var lp = /* @__PURE__ */ P("ZodMap", (e, t) => {
	ea.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => _u(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function up(e, t, n) {
	return new lp({
		type: "map",
		keyType: e,
		valueType: t,
		...R(n)
	});
}
var dp = /* @__PURE__ */ P("ZodSet", (e, t) => {
	na.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => vu(e, t, n, r), e.min = (...t) => e.check(Gc(...t)), e.nonempty = (t) => e.check(Gc(1, t)), e.max = (...t) => e.check(Wc(...t)), e.size = (...t) => e.check(Kc(...t));
});
function fp(e, t) {
	return new dp({
		type: "set",
		valueType: e,
		...R(t)
	});
}
var pp = /* @__PURE__ */ P("ZodEnum", (e, t) => {
	ia.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => cu(e, t, n, r), e.enum = t.entries, e.options = Object.values(t.entries);
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new pp({
			...t,
			checks: [],
			...R(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new pp({
			...t,
			checks: [],
			...R(r),
			entries: i
		});
	};
});
function mp(e, t) {
	return new pp({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...R(t)
	});
}
function hp(e, t) {
	return new pp({
		type: "enum",
		entries: e,
		...R(t)
	});
}
var gp = /* @__PURE__ */ P("ZodLiteral", (e, t) => {
	aa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => lu(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function _p(e, t) {
	return new gp({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...R(t)
	});
}
var vp = /* @__PURE__ */ P("ZodFile", (e, t) => {
	oa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => fu(e, t, n, r), e.min = (t, n) => e.check(Gc(t, n)), e.max = (t, n) => e.check(Wc(t, n)), e.mime = (t, n) => e.check(rl(Array.isArray(t) ? t : [t], n));
});
function yp(e) {
	return Sl(vp, e);
}
var bp = /* @__PURE__ */ P("ZodTransform", (e, t) => {
	sa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => gu(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new De(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Tt(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", t.input ??= n.value, t.inst ??= e, n.issues.push(Tt(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function xp(e) {
	return new bp({
		type: "transform",
		transform: e
	});
}
var Sp = /* @__PURE__ */ P("ZodOptional", (e, t) => {
	la.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Nu(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Cp(e) {
	return new Sp({
		type: "optional",
		innerType: e
	});
}
var wp = /* @__PURE__ */ P("ZodNullable", (e, t) => {
	ua.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Tu(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Tp(e) {
	return new wp({
		type: "nullable",
		innerType: e
	});
}
function Ep(e) {
	return Cp(Tp(e));
}
var Dp = /* @__PURE__ */ P("ZodDefault", (e, t) => {
	da.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Du(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Op(e, t) {
	return new Dp({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : tt(t);
		}
	});
}
var kp = /* @__PURE__ */ P("ZodPrefault", (e, t) => {
	pa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ou(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ap(e, t) {
	return new kp({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : tt(t);
		}
	});
}
var jp = /* @__PURE__ */ P("ZodNonOptional", (e, t) => {
	ma.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Eu(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Mp(e, t) {
	return new jp({
		type: "nonoptional",
		innerType: e,
		...R(t)
	});
}
var Np = /* @__PURE__ */ P("ZodSuccess", (e, t) => {
	ga.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => pu(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Pp(e) {
	return new Np({
		type: "success",
		innerType: e
	});
}
var Fp = /* @__PURE__ */ P("ZodCatch", (e, t) => {
	_a.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => ku(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ip(e, t) {
	return new Fp({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : () => t
	});
}
var Lp = /* @__PURE__ */ P("ZodNaN", (e, t) => {
	va.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => uu(e, t, n, r);
});
function Rp(e) {
	return Pc(Lp, e);
}
var zp = /* @__PURE__ */ P("ZodPipe", (e, t) => {
	ya.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Au(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Bp(e, t) {
	return new zp({
		type: "pipe",
		in: e,
		out: t
	});
}
var Vp = /* @__PURE__ */ P("ZodCodec", (e, t) => {
	zp.init(e, t), xa.init(e, t);
});
function Hp(e, t, n) {
	return new Vp({
		type: "pipe",
		in: e,
		out: t,
		transform: n.decode,
		reverseTransform: n.encode
	});
}
var Up = /* @__PURE__ */ P("ZodReadonly", (e, t) => {
	wa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => ju(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Wp(e) {
	return new Up({
		type: "readonly",
		innerType: e
	});
}
var Gp = /* @__PURE__ */ P("ZodTemplateLiteral", (e, t) => {
	Ea.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => du(e, t, n, r);
});
function Kp(e, t) {
	return new Gp({
		type: "template_literal",
		parts: e,
		...R(t)
	});
}
var qp = /* @__PURE__ */ P("ZodLazy", (e, t) => {
	ka.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Pu(e, t, n, r), e.unwrap = () => e._zod.def.getter();
});
function Jp(e) {
	return new qp({
		type: "lazy",
		getter: e
	});
}
var Yp = /* @__PURE__ */ P("ZodPromise", (e, t) => {
	Oa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mu(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Xp(e) {
	return new Yp({
		type: "promise",
		innerType: e
	});
}
var Zp = /* @__PURE__ */ P("ZodFunction", (e, t) => {
	Da.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => hu(e, t, n, r);
});
function Qp(e) {
	return new Zp({
		type: "function",
		input: Array.isArray(e?.input) ? ip(e?.input) : e?.input ?? Uf(Ff()),
		output: e?.output ?? Ff()
	});
}
var $p = /* @__PURE__ */ P("ZodCustom", (e, t) => {
	Aa.init(e, t), W.init(e, t), e._zod.processJSONSchema = (t, n, r) => mu(e, t, n, r);
});
function em(e) {
	let t = new B({ check: "custom" });
	return t._zod.check = e, t;
}
function tm(e, t) {
	return Fl($p, e ?? (() => !0), t);
}
function nm(e, t = {}) {
	return Il($p, e, t);
}
function rm(e) {
	return Ll(e);
}
var im = zl, am = Bl;
function om(e, t = { error: `Input not instance of ${e.name}` }) {
	let n = new $p({
		type: "custom",
		check: "custom",
		fn: (t) => t instanceof e,
		abort: !0,
		...R(t)
	});
	return n._zod.bag.Class = e, n;
}
var sm = (...e) => Vl({
	Codec: Vp,
	Boolean: yf,
	String: pd
}, ...e);
function cm(e) {
	let t = Jp(() => Xf([
		md(e),
		ff(),
		bf(),
		jf(),
		Uf(t),
		op(md(), t)
	]));
	return t;
}
function lm(e, t) {
	return Bp(xp(e), t);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/compat.js
var um = {
	invalid_type: "invalid_type",
	too_big: "too_big",
	too_small: "too_small",
	invalid_format: "invalid_format",
	not_multiple_of: "not_multiple_of",
	unrecognized_keys: "unrecognized_keys",
	invalid_union: "invalid_union",
	invalid_key: "invalid_key",
	invalid_element: "invalid_element",
	invalid_value: "invalid_value",
	custom: "custom"
};
function dm(e) {
	F({ customError: e });
}
function fm() {
	return F().customError;
}
var pm;
(function(e) {})(pm ||= {});
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/from-json-schema.js
var K = {
	...dd,
	...Bu,
	iso: Vu
};
function mm(e, t) {
	let n = e.$schema;
	return n === "https://json-schema.org/draft/2020-12/schema" ? "draft-2020-12" : n === "http://json-schema.org/draft-07/schema#" ? "draft-7" : n === "http://json-schema.org/draft-04/schema#" ? "draft-4" : t ?? "draft-2020-12";
}
function hm(e, t) {
	if (!e.startsWith("#")) throw Error("External $ref is not supported, only local refs (#/...) are allowed");
	let n = e.slice(1).split("/").filter(Boolean);
	if (n.length === 0) return t.rootSchema;
	let r = t.version === "draft-2020-12" ? "$defs" : "definitions";
	if (n[0] === r) {
		let r = n[1];
		if (!r || !t.defs[r]) throw Error(`Reference not found: ${e}`);
		return t.defs[r];
	}
	throw Error(`Reference not found: ${e}`);
}
function gm(e, t) {
	if (e.not !== void 0) {
		if (typeof e.not == "object" && Object.keys(e.not).length === 0) return K.never();
		throw Error("not is not supported in Zod (except { not: {} } for never)");
	}
	if (e.unevaluatedItems !== void 0) throw Error("unevaluatedItems is not supported");
	if (e.unevaluatedProperties !== void 0) throw Error("unevaluatedProperties is not supported");
	if (e.if !== void 0 || e.then !== void 0 || e.else !== void 0) throw Error("Conditional schemas (if/then/else) are not supported");
	if (e.dependentSchemas !== void 0 || e.dependentRequired !== void 0) throw Error("dependentSchemas and dependentRequired are not supported");
	if (e.$ref) {
		let n = e.$ref;
		if (t.refs.has(n)) return t.refs.get(n);
		if (t.processing.has(n)) return K.lazy(() => {
			if (!t.refs.has(n)) throw Error(`Circular reference not resolved: ${n}`);
			return t.refs.get(n);
		});
		t.processing.add(n);
		let r = _m(hm(n, t), t);
		return t.refs.set(n, r), t.processing.delete(n), r;
	}
	if (e.enum !== void 0) {
		let n = e.enum;
		if (t.version === "openapi-3.0" && e.nullable === !0 && n.length === 1 && n[0] === null) return K.null();
		if (n.length === 0) return K.never();
		if (n.length === 1) return K.literal(n[0]);
		if (n.every((e) => typeof e == "string")) return K.enum(n);
		let r = n.map((e) => K.literal(e));
		return r.length < 2 ? r[0] : K.union([
			r[0],
			r[1],
			...r.slice(2)
		]);
	}
	if (e.const !== void 0) return K.literal(e.const);
	let n = e.type;
	if (Array.isArray(n)) {
		let r = n.map((n) => gm({
			...e,
			type: n
		}, t));
		return r.length === 0 ? K.never() : r.length === 1 ? r[0] : K.union(r);
	}
	if (!n) return K.any();
	let r;
	switch (n) {
		case "string": {
			let t = K.string();
			if (e.format) {
				let n = e.format;
				n === "email" ? t = t.check(K.email()) : n === "uri" || n === "uri-reference" ? t = t.check(K.url()) : n === "uuid" || n === "guid" ? t = t.check(K.uuid()) : n === "date-time" ? t = t.check(K.iso.datetime()) : n === "date" ? t = t.check(K.iso.date()) : n === "time" ? t = t.check(K.iso.time()) : n === "duration" ? t = t.check(K.iso.duration()) : n === "ipv4" ? t = t.check(K.ipv4()) : n === "ipv6" ? t = t.check(K.ipv6()) : n === "mac" ? t = t.check(K.mac()) : n === "cidr" ? t = t.check(K.cidrv4()) : n === "cidr-v6" ? t = t.check(K.cidrv6()) : n === "base64" ? t = t.check(K.base64()) : n === "base64url" ? t = t.check(K.base64url()) : n === "e164" ? t = t.check(K.e164()) : n === "jwt" ? t = t.check(K.jwt()) : n === "emoji" ? t = t.check(K.emoji()) : n === "nanoid" ? t = t.check(K.nanoid()) : n === "cuid" ? t = t.check(K.cuid()) : n === "cuid2" ? t = t.check(K.cuid2()) : n === "ulid" ? t = t.check(K.ulid()) : n === "xid" ? t = t.check(K.xid()) : n === "ksuid" && (t = t.check(K.ksuid()));
			}
			typeof e.minLength == "number" && (t = t.min(e.minLength)), typeof e.maxLength == "number" && (t = t.max(e.maxLength)), e.pattern && (t = t.regex(new RegExp(e.pattern))), r = t;
			break;
		}
		case "number":
		case "integer": {
			let t = n === "integer" ? K.number().int() : K.number();
			typeof e.minimum == "number" && (t = t.min(e.minimum)), typeof e.maximum == "number" && (t = t.max(e.maximum)), typeof e.exclusiveMinimum == "number" ? t = t.gt(e.exclusiveMinimum) : e.exclusiveMinimum === !0 && typeof e.minimum == "number" && (t = t.gt(e.minimum)), typeof e.exclusiveMaximum == "number" ? t = t.lt(e.exclusiveMaximum) : e.exclusiveMaximum === !0 && typeof e.maximum == "number" && (t = t.lt(e.maximum)), typeof e.multipleOf == "number" && (t = t.multipleOf(e.multipleOf)), r = t;
			break;
		}
		case "boolean":
			r = K.boolean();
			break;
		case "null":
			r = K.null();
			break;
		case "object": {
			let n = {}, i = e.properties || {}, a = new Set(e.required || []);
			for (let [e, r] of Object.entries(i)) {
				let i = _m(r, t);
				n[e] = a.has(e) ? i : i.optional();
			}
			if (e.propertyNames) {
				let i = _m(e.propertyNames, t), a = e.additionalProperties && typeof e.additionalProperties == "object" ? _m(e.additionalProperties, t) : K.any();
				if (Object.keys(n).length === 0) {
					r = K.record(i, a);
					break;
				}
				let o = K.object(n).passthrough(), s = K.looseRecord(i, a);
				r = K.intersection(o, s);
				break;
			}
			if (e.patternProperties) {
				let i = e.patternProperties, a = Object.keys(i), o = [];
				for (let e of a) {
					let n = _m(i[e], t), r = K.string().regex(new RegExp(e));
					o.push(K.looseRecord(r, n));
				}
				let s = [];
				if (Object.keys(n).length > 0 && s.push(K.object(n).passthrough()), s.push(...o), s.length === 0) r = K.object({}).passthrough();
				else if (s.length === 1) r = s[0];
				else {
					let e = K.intersection(s[0], s[1]);
					for (let t = 2; t < s.length; t++) e = K.intersection(e, s[t]);
					r = e;
				}
				break;
			}
			let o = K.object(n);
			r = e.additionalProperties === !1 ? o.strict() : typeof e.additionalProperties == "object" ? o.catchall(_m(e.additionalProperties, t)) : o.passthrough();
			break;
		}
		case "array": {
			let n = e.prefixItems, i = e.items;
			if (n && Array.isArray(n)) {
				let a = n.map((e) => _m(e, t)), o = i && typeof i == "object" && !Array.isArray(i) ? _m(i, t) : void 0;
				r = o ? K.tuple(a).rest(o) : K.tuple(a), typeof e.minItems == "number" && (r = r.check(K.minLength(e.minItems))), typeof e.maxItems == "number" && (r = r.check(K.maxLength(e.maxItems)));
			} else if (Array.isArray(i)) {
				let n = i.map((e) => _m(e, t)), a = e.additionalItems && typeof e.additionalItems == "object" ? _m(e.additionalItems, t) : void 0;
				r = a ? K.tuple(n).rest(a) : K.tuple(n), typeof e.minItems == "number" && (r = r.check(K.minLength(e.minItems))), typeof e.maxItems == "number" && (r = r.check(K.maxLength(e.maxItems)));
			} else if (i !== void 0) {
				let n = _m(i, t), a = K.array(n);
				typeof e.minItems == "number" && (a = a.min(e.minItems)), typeof e.maxItems == "number" && (a = a.max(e.maxItems)), r = a;
			} else r = K.array(K.any());
			break;
		}
		default: throw Error(`Unsupported type: ${n}`);
	}
	return e.description && (r = r.describe(e.description)), e.default !== void 0 && (r = r.default(e.default)), r;
}
function _m(e, t) {
	if (typeof e == "boolean") return e ? K.any() : K.never();
	let n = gm(e, t), r = e.type || e.enum !== void 0 || e.const !== void 0;
	if (e.anyOf && Array.isArray(e.anyOf)) {
		let i = e.anyOf.map((e) => _m(e, t)), a = K.union(i);
		n = r ? K.intersection(n, a) : a;
	}
	if (e.oneOf && Array.isArray(e.oneOf)) {
		let i = e.oneOf.map((e) => _m(e, t)), a = K.xor(i);
		n = r ? K.intersection(n, a) : a;
	}
	if (e.allOf && Array.isArray(e.allOf)) if (e.allOf.length === 0) n = r ? n : K.any();
	else {
		let i = r ? n : _m(e.allOf[0], t), a = r ? 0 : 1;
		for (let n = a; n < e.allOf.length; n++) i = K.intersection(i, _m(e.allOf[n], t));
		n = i;
	}
	return e.nullable === !0 && t.version === "openapi-3.0" && (n = K.nullable(n)), e.readOnly === !0 && (n = K.readonly(n)), n;
}
function vm(e, t) {
	return typeof e == "boolean" ? e ? K.any() : K.never() : _m(e, {
		version: mm(e, t?.defaultTarget),
		defs: e.$defs || e.definitions || {},
		refs: /* @__PURE__ */ new Map(),
		processing: /* @__PURE__ */ new Set(),
		rootSchema: e
	});
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/coerce.js
var ym = /* @__PURE__ */ j({
	bigint: () => Cm,
	boolean: () => Sm,
	date: () => wm,
	number: () => xm,
	string: () => bm
});
function bm(e) {
	return Ls(pd, e);
}
function xm(e) {
	return pc(df, e);
}
function Sm(e) {
	return bc(yf, e);
}
function Cm(e) {
	return Sc(xf, e);
}
function wm(e) {
	return Nc(Bf, e);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/v4/classic/external.js
var Tm = /* @__PURE__ */ j({
	$brand: () => Te,
	$input: () => Ms,
	$output: () => js,
	NEVER: () => we,
	TimePrecision: () => sc,
	ZodAny: () => Mf,
	ZodArray: () => Hf,
	ZodBase64: () => Zd,
	ZodBase64URL: () => $d,
	ZodBigInt: () => xf,
	ZodBigIntFormat: () => Cf,
	ZodBoolean: () => yf,
	ZodCIDRv4: () => qd,
	ZodCIDRv6: () => Yd,
	ZodCUID: () => jd,
	ZodCUID2: () => Nd,
	ZodCatch: () => Fp,
	ZodCodec: () => Vp,
	ZodCustom: () => $p,
	ZodCustomStringFormat: () => of,
	ZodDate: () => Bf,
	ZodDefault: () => Dp,
	ZodDiscriminatedUnion: () => $f,
	ZodE164: () => tf,
	ZodEmail: () => hd,
	ZodEmoji: () => Dd,
	ZodEnum: () => pp,
	ZodError: () => Zu,
	ZodFile: () => vp,
	ZodFirstPartyTypeKind: () => pm,
	ZodFunction: () => Zp,
	ZodGUID: () => _d,
	ZodIPv4: () => Vd,
	ZodIPv6: () => Gd,
	ZodISODate: () => Wu,
	ZodISODateTime: () => Hu,
	ZodISODuration: () => Ju,
	ZodISOTime: () => Ku,
	ZodIntersection: () => tp,
	ZodIssueCode: () => um,
	ZodJWT: () => rf,
	ZodKSUID: () => zd,
	ZodLazy: () => qp,
	ZodLiteral: () => gp,
	ZodMAC: () => Ud,
	ZodMap: () => lp,
	ZodNaN: () => Lp,
	ZodNanoID: () => kd,
	ZodNever: () => If,
	ZodNonOptional: () => jp,
	ZodNull: () => Af,
	ZodNullable: () => wp,
	ZodNumber: () => df,
	ZodNumberFormat: () => pf,
	ZodObject: () => Gf,
	ZodOptional: () => Sp,
	ZodPipe: () => zp,
	ZodPrefault: () => kp,
	ZodPromise: () => Yp,
	ZodReadonly: () => Up,
	ZodRealError: () => Qu,
	ZodRecord: () => ap,
	ZodSet: () => dp,
	ZodString: () => pd,
	ZodStringFormat: () => G,
	ZodSuccess: () => Np,
	ZodSymbol: () => Ef,
	ZodTemplateLiteral: () => Gp,
	ZodTransform: () => bp,
	ZodTuple: () => rp,
	ZodType: () => W,
	ZodULID: () => Fd,
	ZodURL: () => wd,
	ZodUUID: () => yd,
	ZodUndefined: () => Of,
	ZodUnion: () => Yf,
	ZodUnknown: () => Pf,
	ZodVoid: () => Rf,
	ZodXID: () => Ld,
	ZodXor: () => Zf,
	_ZodString: () => fd,
	_default: () => Op,
	_function: () => Qp,
	any: () => Nf,
	array: () => Uf,
	base64: () => Qd,
	base64url: () => ef,
	bigint: () => Sf,
	boolean: () => bf,
	catch: () => Ip,
	check: () => em,
	cidrv4: () => Jd,
	cidrv6: () => Xd,
	clone: () => st,
	codec: () => Hp,
	coerce: () => ym,
	config: () => F,
	core: () => zu,
	cuid: () => Md,
	cuid2: () => Pd,
	custom: () => tm,
	date: () => Vf,
	decode: () => id,
	decodeAsync: () => od,
	describe: () => im,
	discriminatedUnion: () => ep,
	e164: () => nf,
	email: () => gd,
	emoji: () => Od,
	encode: () => rd,
	encodeAsync: () => ad,
	endsWith: () => tl,
	enum: () => mp,
	file: () => yp,
	flattenError: () => Lt,
	float32: () => hf,
	float64: () => gf,
	formatError: () => Rt,
	fromJSONSchema: () => vm,
	function: () => Qp,
	getErrorMap: () => fm,
	globalRegistry: () => Fs,
	gt: () => Lc,
	gte: () => Rc,
	guid: () => vd,
	hash: () => uf,
	hex: () => lf,
	hostname: () => cf,
	httpUrl: () => Ed,
	includes: () => $c,
	instanceof: () => om,
	int: () => mf,
	int32: () => _f,
	int64: () => wf,
	intersection: () => np,
	ipv4: () => Hd,
	ipv6: () => Kd,
	iso: () => Vu,
	json: () => cm,
	jwt: () => af,
	keyof: () => Wf,
	ksuid: () => Bd,
	lazy: () => Jp,
	length: () => Yc,
	literal: () => _p,
	locales: () => ks,
	looseObject: () => Jf,
	looseRecord: () => cp,
	lowercase: () => Zc,
	lt: () => Fc,
	lte: () => Ic,
	mac: () => Wd,
	map: () => up,
	maxLength: () => qc,
	maxSize: () => Wc,
	meta: () => am,
	mime: () => rl,
	minLength: () => Jc,
	minSize: () => Gc,
	multipleOf: () => Uc,
	nan: () => Rp,
	nanoid: () => Ad,
	nativeEnum: () => hp,
	negative: () => Bc,
	never: () => Lf,
	nonnegative: () => Hc,
	nonoptional: () => Mp,
	nonpositive: () => Vc,
	normalize: () => al,
	null: () => jf,
	nullable: () => Tp,
	nullish: () => Ep,
	number: () => ff,
	object: () => Kf,
	optional: () => Cp,
	overwrite: () => il,
	parse: () => $u,
	parseAsync: () => ed,
	partialRecord: () => sp,
	pipe: () => Bp,
	positive: () => zc,
	prefault: () => Ap,
	preprocess: () => lm,
	prettifyError: () => Vt,
	promise: () => Xp,
	property: () => nl,
	readonly: () => Wp,
	record: () => op,
	refine: () => nm,
	regex: () => Xc,
	regexes: () => pn,
	registry: () => Ps,
	safeDecode: () => cd,
	safeDecodeAsync: () => ud,
	safeEncode: () => sd,
	safeEncodeAsync: () => ld,
	safeParse: () => td,
	safeParseAsync: () => nd,
	set: () => fp,
	setErrorMap: () => dm,
	size: () => Kc,
	slugify: () => ll,
	startsWith: () => el,
	strictObject: () => qf,
	string: () => md,
	stringFormat: () => sf,
	stringbool: () => sm,
	success: () => Pp,
	superRefine: () => rm,
	symbol: () => Df,
	templateLiteral: () => Kp,
	toJSONSchema: () => Iu,
	toLowerCase: () => sl,
	toUpperCase: () => cl,
	transform: () => xp,
	treeifyError: () => zt,
	trim: () => ol,
	tuple: () => ip,
	uint32: () => vf,
	uint64: () => Tf,
	ulid: () => Id,
	undefined: () => kf,
	union: () => Xf,
	unknown: () => Ff,
	uppercase: () => Qc,
	url: () => Td,
	util: () => ke,
	uuid: () => bd,
	uuidv4: () => xd,
	uuidv6: () => Sd,
	uuidv7: () => Cd,
	void: () => zf,
	xid: () => Rd,
	xor: () => Qf
});
F(Qa());
//#endregion
//#region ../../node_modules/.pnpm/zod@4.2.1/node_modules/zod/index.js
var q = Tm, Em = q.object({
	toggleVisibility: q.string().default("CommandOrControl+\\"),
	ask: q.string().default("CommandOrControl+Enter"),
	clear: q.string().default("CommandOrControl+R"),
	toggleSession: q.string().default("CommandOrControl+Shift+\\"),
	moveUp: q.string().default("CommandOrControl+Up"),
	moveDown: q.string().default("CommandOrControl+Down"),
	moveLeft: q.string().default("CommandOrControl+Left"),
	moveRight: q.string().default("CommandOrControl+Right"),
	scrollUp: q.string().default("CommandOrControl+Shift+Up"),
	scrollDown: q.string().default("CommandOrControl+Shift+Down")
}), Dm = Em.parse({}), Om = q.object({
	didMigrateV1State: q.boolean().default(!1),
	didSetOpenAtLogin: q.boolean().default(ge),
	finishedOnboarding: q.boolean().default(!1),
	permissions: q.object({
		microphone: q.enum([
			"unknown",
			"granted",
			"denied"
		]),
		screen: q.enum([
			"unknown",
			"granted",
			"denied"
		]),
		accessibility: q.enum([
			"unknown",
			"granted",
			"denied"
		])
	}).default({
		microphone: "unknown",
		screen: "unknown",
		accessibility: "unknown"
	}),
	isInvisible: q.boolean().default(!1),
	noFocusWhenInvisible: q.boolean().default(!1),
	isAmbientEnabled: q.boolean().default(!1),
	hideChatHidesControlWindow: q.boolean().default(!1),
	screenUse: q.enum(["off", "required"]).default("required"),
	smartMode: q.boolean().default(!1),
	shortcuts: Em.default(Dm),
	theme: q.enum([
		"system",
		"light",
		"dark"
	]).default("system"),
	revenueCatEntitlements: q.string().array().default([])
}), km = Om.parse({}), J = /* @__PURE__ */ ((e) => (e[e.None = 0] = "None", e[e.Mutable = 1] = "Mutable", e[e.Watching = 2] = "Watching", e[e.RecursedCheck = 4] = "RecursedCheck", e[e.Recursed = 8] = "Recursed", e[e.Dirty = 16] = "Dirty", e[e.Pending = 32] = "Pending", e))(J || {});
function Am({ update: e, notify: t, unwatched: n }) {
	return {
		link: r,
		unlink: i,
		propagate: a,
		checkDirty: o,
		shallowPropagate: s
	};
	function r(e, t, n) {
		let r = t.depsTail;
		if (r !== void 0 && r.dep === e) return;
		let i = r === void 0 ? t.deps : r.nextDep;
		if (i !== void 0 && i.dep === e) {
			i.version = n, t.depsTail = i;
			return;
		}
		let a = e.subsTail;
		if (a !== void 0 && a.version === n && a.sub === t) return;
		let o = t.depsTail = e.subsTail = {
			version: n,
			dep: e,
			sub: t,
			prevDep: r,
			nextDep: i,
			prevSub: a,
			nextSub: void 0
		};
		i !== void 0 && (i.prevDep = o), r === void 0 ? t.deps = o : r.nextDep = o, a === void 0 ? e.subs = o : a.nextSub = o;
	}
	function i(e, t = e.sub) {
		let r = e.dep, i = e.prevDep, a = e.nextDep, o = e.nextSub, s = e.prevSub;
		return a === void 0 ? t.depsTail = i : a.prevDep = i, i === void 0 ? t.deps = a : i.nextDep = a, o === void 0 ? r.subsTail = s : o.prevSub = s, s === void 0 ? (r.subs = o) === void 0 && n(r) : s.nextSub = o, a;
	}
	function a(e) {
		let n = e.nextSub, r;
		top: do {
			let i = e.sub, a = i.flags;
			if (a & 60 ? a & 12 ? a & 4 ? !(a & 48) && c(e, i) ? (i.flags = a | 40, a &= 1) : a = 0 : i.flags = a & -9 | 32 : a = 0 : i.flags = a | 32, a & 2 && t(i), a & 1) {
				let t = i.subs;
				if (t !== void 0) {
					let i = (e = t).nextSub;
					i !== void 0 && (r = {
						value: n,
						prev: r
					}, n = i);
					continue;
				}
			}
			if ((e = n) !== void 0) {
				n = e.nextSub;
				continue;
			}
			for (; r !== void 0;) if (e = r.value, r = r.prev, e !== void 0) {
				n = e.nextSub;
				continue top;
			}
			break;
		} while (!0);
	}
	function o(t, n) {
		let r, i = 0, a = !1;
		top: do {
			let o = t.dep, c = o.flags;
			if (n.flags & 16) a = !0;
			else if ((c & 17) == 17) {
				if (e(o)) {
					let e = o.subs;
					e.nextSub !== void 0 && s(e), a = !0;
				}
			} else if ((c & 33) == 33) {
				(t.nextSub !== void 0 || t.prevSub !== void 0) && (r = {
					value: t,
					prev: r
				}), t = o.deps, n = o, ++i;
				continue;
			}
			if (!a) {
				let e = t.nextDep;
				if (e !== void 0) {
					t = e;
					continue;
				}
			}
			for (; i--;) {
				let i = n.subs, o = i.nextSub !== void 0;
				if (o ? (t = r.value, r = r.prev) : t = i, a) {
					if (e(n)) {
						o && s(i), n = t.sub;
						continue;
					}
					a = !1;
				} else n.flags &= -33;
				n = t.sub;
				let c = t.nextDep;
				if (c !== void 0) {
					t = c;
					continue top;
				}
			}
			return a;
		} while (!0);
	}
	function s(e) {
		do {
			let n = e.sub, r = n.flags;
			(r & 48) == 32 && (n.flags = r | 16, (r & 6) == 2 && t(n));
		} while ((e = e.nextSub) !== void 0);
	}
	function c(e, t) {
		let n = t.depsTail;
		for (; n !== void 0;) {
			if (n === e) return !0;
			n = n.prevDep;
		}
		return !1;
	}
}
var jm = 0, Mm = 0, Nm = 0, Pm = [], { link: Fm, unlink: Im, propagate: Lm, checkDirty: Rm, shallowPropagate: zm } = Am({
	update(e) {
		return e.depsTail === void 0 ? Wm(e) : Um(e);
	},
	notify(e) {
		let t = Nm, n = t;
		do
			if (Pm[t++] = e, e.flags &= -3, e = e.subs?.sub, e === void 0 || !(e.flags & 2)) break;
		while (!0);
		for (Nm = t; n < --t;) {
			let e = Pm[n];
			Pm[n++] = Pm[t], Pm[t] = e;
		}
	},
	unwatched(e) {
		e.flags & 1 ? e.depsTail !== void 0 && (e.depsTail = void 0, e.flags = 17, Jm(e)) : qm.call(e);
	}
});
function Bm() {
	return jm;
}
function Vm() {
	++jm;
}
function Hm() {
	--jm || Km();
}
function Um(e) {
	e.depsTail = void 0, e.flags = 5;
	try {
		let t = e.value;
		return t !== (e.value = e.getter(t));
	} finally {
		e.flags &= -5, Jm(e);
	}
}
function Wm(e) {
	return e.flags = 1, e.currentValue !== (e.currentValue = e.pendingValue);
}
function Gm(e) {
	let t = e.flags;
	if (t & 16 || t & 32 && Rm(e.deps, e)) {
		e.depsTail = void 0, e.flags = 6;
		try {
			e.fn();
		} finally {
			e.flags &= -5, Jm(e);
		}
	} else e.flags = 2;
}
function Km() {
	try {
		for (; Mm < Nm;) {
			let e = Pm[Mm];
			Pm[Mm++] = void 0, Gm(e);
		}
	} finally {
		for (; Mm < Nm;) {
			let e = Pm[Mm];
			Pm[Mm++] = void 0, e.flags |= 10;
		}
		Mm = 0, Nm = 0;
	}
}
function qm() {
	this.depsTail = void 0, this.flags = 0, Jm(this);
	let e = this.subs;
	e !== void 0 && Im(e);
}
function Jm(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = Im(n, e);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+store@0.9.2/node_modules/@tanstack/store/dist/esm/atom.js
function Ym(e, t, n) {
	let r = typeof e == "object", i = r ? e : void 0;
	return {
		next: (r ? e.next : e)?.bind(i),
		error: (r ? e.error : t)?.bind(i),
		complete: (r ? e.complete : n)?.bind(i)
	};
}
var Xm = [], Zm = 0, { link: Qm, unlink: $m, propagate: eh, checkDirty: th, shallowPropagate: nh } = Am({
	update(e) {
		return e._update();
	},
	notify(e) {
		Xm[ih++] = e, e.flags &= ~J.Watching;
	},
	unwatched(e) {
		e.depsTail !== void 0 && (e.depsTail = void 0, e.flags = J.Mutable | J.Dirty, oh(e));
	}
}), rh = 0, ih = 0, ah;
function oh(e) {
	let t = e.depsTail, n = t === void 0 ? e.deps : t.nextDep;
	for (; n !== void 0;) n = $m(n, e);
}
function sh() {
	if (!(Bm() > 0)) {
		for (; rh < ih;) {
			let e = Xm[rh];
			Xm[rh++] = void 0, e.notify();
		}
		rh = 0, ih = 0;
	}
}
function ch(e, t) {
	let n = typeof e == "function", r = e, i = {
		_snapshot: n ? void 0 : e,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: n ? J.None : J.Mutable,
		get() {
			return ah !== void 0 && Qm(i, ah, Zm), i._snapshot;
		},
		subscribe(e) {
			let t = Ym(e), n = { current: !1 }, r = lh(() => {
				i.get(), n.current ? t.next?.(i._snapshot) : n.current = !0;
			});
			return { unsubscribe: () => {
				r.stop();
			} };
		},
		_update(e) {
			let a = ah, o = t?.compare ?? Object.is;
			if (n) ah = i, ++Zm, i.depsTail = void 0;
			else if (e === void 0) return !1;
			n && (i.flags = J.Mutable | J.RecursedCheck);
			try {
				let t = i._snapshot, a = typeof e == "function" ? e(t) : e === void 0 && n ? r(t) : e;
				return t === void 0 || !o(t, a) ? (i._snapshot = a, !0) : !1;
			} finally {
				ah = a, n && (i.flags &= ~J.RecursedCheck), oh(i);
			}
		}
	};
	return n ? (i.flags = J.Mutable | J.Dirty, i.get = function() {
		let e = i.flags;
		if (e & J.Dirty || e & J.Pending && th(i.deps, i)) {
			if (i._update()) {
				let e = i.subs;
				e !== void 0 && nh(e);
			}
		} else e & J.Pending && (i.flags = e & ~J.Pending);
		return ah !== void 0 && Qm(i, ah, Zm), i._snapshot;
	}) : i.set = function(e) {
		if (i._update(e)) {
			let e = i.subs;
			e !== void 0 && (eh(e), nh(e), sh());
		}
	}, i;
}
function lh(e) {
	let t = () => {
		let t = ah;
		ah = n, ++Zm, n.depsTail = void 0, n.flags = J.Watching | J.RecursedCheck;
		try {
			return e();
		} finally {
			ah = t, n.flags &= ~J.RecursedCheck, oh(n);
		}
	}, n = {
		deps: void 0,
		depsTail: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: J.Watching | J.RecursedCheck,
		notify() {
			let e = this.flags;
			e & J.Dirty || e & J.Pending && th(this.deps, this) ? t() : this.flags = J.Watching;
		},
		stop() {
			this.flags = J.None, this.depsTail = void 0, oh(this);
		}
	};
	return t(), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+store@0.9.2/node_modules/@tanstack/store/dist/esm/store.js
var uh = class {
	constructor(e) {
		this.atom = ch(e);
	}
	setState(e) {
		this.atom.set(e);
	}
	get state() {
		return this.atom.get();
	}
	get() {
		return this.state;
	}
	subscribe(e) {
		return this.atom.subscribe(Ym(e));
	}
}, dh = class {
	constructor(e) {
		this.atom = ch(e);
	}
	get state() {
		return this.atom.get();
	}
	get() {
		return this.state;
	}
	subscribe(e) {
		return this.atom.subscribe(Ym(e));
	}
};
function fh(e) {
	return typeof e == "function" ? new dh(e) : new uh(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+store@0.9.2/node_modules/@tanstack/store/dist/esm/batch.js
function ph(e) {
	try {
		Vm(), e();
	} finally {
		Hm(), sh();
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+history@1.161.4/node_modules/@tanstack/history/dist/esm/index.js
var mh = "__TSR_index", hh = "popstate", gh = "beforeunload";
function _h(e) {
	let t = e.getLocation(), n = /* @__PURE__ */ new Set(), r = (r) => {
		t = e.getLocation(), n.forEach((e) => e({
			location: t,
			action: r
		}));
	}, i = (n) => {
		e.notifyOnIndexChange ?? !0 ? r(n) : t = e.getLocation();
	}, a = async ({ task: n, navigateOpts: r, ...i }) => {
		if (r?.ignoreBlocker ?? !1) {
			n();
			return;
		}
		let a = e.getBlockers?.() ?? [], o = i.type === "PUSH" || i.type === "REPLACE";
		if (typeof document < "u" && a.length && o) for (let n of a) {
			let r = Sh(i.path, i.state);
			if (await n.blockerFn({
				currentLocation: t,
				nextLocation: r,
				action: i.type
			})) {
				e.onBlocked?.();
				return;
			}
		}
		n();
	};
	return {
		get location() {
			return t;
		},
		get length() {
			return e.getLength();
		},
		subscribers: n,
		subscribe: (e) => (n.add(e), () => {
			n.delete(e);
		}),
		push: (n, i, o) => {
			let s = t.state[mh];
			i = vh(s + 1, i), a({
				task: () => {
					e.pushState(n, i), r({ type: "PUSH" });
				},
				navigateOpts: o,
				type: "PUSH",
				path: n,
				state: i
			});
		},
		replace: (n, i, o) => {
			let s = t.state[mh];
			i = vh(s, i), a({
				task: () => {
					e.replaceState(n, i), r({ type: "REPLACE" });
				},
				navigateOpts: o,
				type: "REPLACE",
				path: n,
				state: i
			});
		},
		go: (t, n) => {
			a({
				task: () => {
					e.go(t), i({
						type: "GO",
						index: t
					});
				},
				navigateOpts: n,
				type: "GO"
			});
		},
		back: (t) => {
			a({
				task: () => {
					e.back(t?.ignoreBlocker ?? !1), i({ type: "BACK" });
				},
				navigateOpts: t,
				type: "BACK"
			});
		},
		forward: (t) => {
			a({
				task: () => {
					e.forward(t?.ignoreBlocker ?? !1), i({ type: "FORWARD" });
				},
				navigateOpts: t,
				type: "FORWARD"
			});
		},
		canGoBack: () => t.state[mh] !== 0,
		createHref: (t) => e.createHref(t),
		block: (t) => {
			if (!e.setBlockers) return () => {};
			let n = e.getBlockers?.() ?? [];
			return e.setBlockers([...n, t]), () => {
				let n = e.getBlockers?.() ?? [];
				e.setBlockers?.(n.filter((e) => e !== t));
			};
		},
		flush: () => e.flush?.(),
		destroy: () => e.destroy?.(),
		notify: r
	};
}
function vh(e, t) {
	t ||= {};
	let n = Ch();
	return {
		...t,
		key: n,
		__TSR_key: n,
		[mh]: e
	};
}
function yh(e) {
	let t = e?.window ?? (typeof document < "u" ? window : void 0), n = t.history.pushState, r = t.history.replaceState, i = [], a = () => i, o = (e) => i = e, s = e?.createHref ?? ((e) => e), c = e?.parseLocation ?? (() => Sh(`${t.location.pathname}${t.location.search}${t.location.hash}`, t.history.state));
	if (!t.history.state?.__TSR_key && !t.history.state?.key) {
		let e = Ch();
		t.history.replaceState({
			[mh]: 0,
			key: e,
			__TSR_key: e
		}, "");
	}
	let l = c(), u, d = !1, f = !1, p = !1, m = !1, h = () => l, g, _, v = () => {
		g && (C._ignoreSubscribers = !0, (g.isPush ? t.history.pushState : t.history.replaceState)(g.state, "", g.href), C._ignoreSubscribers = !1, g = void 0, _ = void 0, u = void 0);
	}, y = (e, t, n) => {
		let r = s(t);
		_ || (u = l), l = Sh(t, n), g = {
			href: r,
			state: n,
			isPush: g?.isPush || e === "push"
		}, _ ||= Promise.resolve().then(() => v());
	}, b = (e) => {
		l = c(), C.notify({ type: e });
	}, x = async () => {
		if (f) {
			f = !1;
			return;
		}
		let e = c(), n = e.state[mh] - l.state[mh], r = n === 1, i = n === -1, o = !r && !i || d;
		d = !1;
		let s = o ? "GO" : i ? "BACK" : "FORWARD", u = o ? {
			type: "GO",
			index: n
		} : { type: i ? "BACK" : "FORWARD" };
		if (p) p = !1;
		else {
			let n = a();
			if (typeof document < "u" && n.length) {
				for (let r of n) if (await r.blockerFn({
					currentLocation: l,
					nextLocation: e,
					action: s
				})) {
					f = !0, t.history.go(1), C.notify(u);
					return;
				}
			}
		}
		l = c(), C.notify(u);
	}, S = (e) => {
		if (m) {
			m = !1;
			return;
		}
		let t = !1, n = a();
		if (typeof document < "u" && n.length) for (let e of n) {
			let n = e.enableBeforeUnload ?? !0;
			if (n === !0) {
				t = !0;
				break;
			}
			if (typeof n == "function" && n() === !0) {
				t = !0;
				break;
			}
		}
		if (t) return e.preventDefault(), e.returnValue = "";
	}, C = _h({
		getLocation: h,
		getLength: () => t.history.length,
		pushState: (e, t) => y("push", e, t),
		replaceState: (e, t) => y("replace", e, t),
		back: (e) => (e && (p = !0), m = !0, t.history.back()),
		forward: (e) => {
			e && (p = !0), m = !0, t.history.forward();
		},
		go: (e) => {
			d = !0, t.history.go(e);
		},
		createHref: (e) => s(e),
		flush: v,
		destroy: () => {
			t.history.pushState = n, t.history.replaceState = r, t.removeEventListener(gh, S, { capture: !0 }), t.removeEventListener(hh, x);
		},
		onBlocked: () => {
			u && l !== u && (l = u);
		},
		getBlockers: a,
		setBlockers: o,
		notifyOnIndexChange: !1
	});
	return t.addEventListener(gh, S, { capture: !0 }), t.addEventListener(hh, x), t.history.pushState = function(...e) {
		let r = n.apply(t.history, e);
		return C._ignoreSubscribers || b("PUSH"), r;
	}, t.history.replaceState = function(...e) {
		let n = r.apply(t.history, e);
		return C._ignoreSubscribers || b("REPLACE"), n;
	}, C;
}
function bh(e = { initialEntries: ["/"] }) {
	let t = e.initialEntries, n = e.initialIndex ? Math.min(Math.max(e.initialIndex, 0), t.length - 1) : t.length - 1, r = t.map((e, t) => vh(t, void 0)), i = () => Sh(t[n], r[n]), a = [];
	return _h({
		getLocation: i,
		getLength: () => t.length,
		pushState: (e, i) => {
			n < t.length - 1 && (t.splice(n + 1), r.splice(n + 1)), r.push(i), t.push(e), n = Math.max(t.length - 1, 0);
		},
		replaceState: (e, i) => {
			r[n] = i, t[n] = e;
		},
		back: () => {
			n = Math.max(n - 1, 0);
		},
		forward: () => {
			n = Math.min(n + 1, t.length - 1);
		},
		go: (e) => {
			n = Math.min(Math.max(n + e, 0), t.length - 1);
		},
		createHref: (e) => e,
		getBlockers: () => a,
		setBlockers: (e) => a = e
	});
}
function xh(e) {
	let t = e.replace(/[\x00-\x1f\x7f]/g, "");
	return t.startsWith("//") && (t = "/" + t.replace(/^\/+/, "")), t;
}
function Sh(e, t) {
	let n = xh(e), r = n.indexOf("#"), i = n.indexOf("?"), a = Ch();
	return {
		href: n,
		pathname: n.substring(0, r > 0 ? i > 0 ? Math.min(r, i) : r : i > 0 ? i : n.length),
		hash: r > -1 ? n.substring(r) : "",
		search: i > -1 ? n.slice(i, r === -1 ? void 0 : r) : "",
		state: t || {
			[mh]: 0,
			key: a,
			__TSR_key: a
		}
	};
}
function Ch() {
	return (Math.random() + 1).toString(36).substring(7);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/isServer/server.js
var Y = process.env.NODE_ENV === "test" ? void 0 : !0;
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/utils/batch.js
function wh(e) {
	if (Y) return e();
	let t;
	return ph(() => {
		t = e();
	}), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/utils.js
function Th(e) {
	return e[e.length - 1];
}
function Eh(e) {
	return typeof e == "function";
}
function Dh(e, t) {
	return Eh(e) ? e(t) : e;
}
var Oh = Object.prototype.hasOwnProperty, kh = Object.prototype.propertyIsEnumerable, Ah = () => /* @__PURE__ */ Object.create(null), jh = (e, t) => Mh(e, t, Ah);
function Mh(e, t, n = () => ({}), r = 0) {
	if (Y) return t;
	if (e === t) return e;
	if (r > 500) return t;
	let i = t, a = Ih(e) && Ih(i);
	if (!a && !(Ph(e) && Ph(i))) return i;
	let o = a ? e : Nh(e);
	if (!o) return i;
	let s = a ? i : Nh(i);
	if (!s) return i;
	let c = o.length, l = s.length, u = a ? Array(l) : n(), d = 0;
	for (let t = 0; t < l; t++) {
		let o = a ? t : s[t], l = e[o], f = i[o];
		if (l === f) {
			u[o] = l, (a ? t < c : Oh.call(e, o)) && d++;
			continue;
		}
		if (l === null || f === null || typeof l != "object" || typeof f != "object") {
			u[o] = f;
			continue;
		}
		let p = Mh(l, f, n, r + 1);
		u[o] = p, p === l && d++;
	}
	return c === l && d === c ? e : u;
}
function Nh(e) {
	let t = Object.getOwnPropertyNames(e);
	for (let n of t) if (!kh.call(e, n)) return !1;
	let n = Object.getOwnPropertySymbols(e);
	if (n.length === 0) return t;
	let r = t;
	for (let t of n) {
		if (!kh.call(e, t)) return !1;
		r.push(t);
	}
	return r;
}
function Ph(e) {
	if (!Fh(e)) return !1;
	let t = e.constructor;
	if (t === void 0) return !0;
	let n = t.prototype;
	return !(!Fh(n) || !n.hasOwnProperty("isPrototypeOf"));
}
function Fh(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
function Ih(e) {
	return Array.isArray(e) && e.length === Object.keys(e).length;
}
function Lh(e, t, n) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return !1;
		for (let r = 0, i = e.length; r < i; r++) if (!Lh(e[r], t[r], n)) return !1;
		return !0;
	}
	if (Ph(e) && Ph(t)) {
		let r = n?.ignoreUndefined ?? !0;
		if (n?.partial) {
			for (let i in t) if ((!r || t[i] !== void 0) && !Lh(e[i], t[i], n)) return !1;
			return !0;
		}
		let i = 0;
		if (!r) i = Object.keys(e).length;
		else for (let t in e) e[t] !== void 0 && i++;
		let a = 0;
		for (let o in t) if ((!r || t[o] !== void 0) && (a++, a > i || !Lh(e[o], t[o], n))) return !1;
		return i === a;
	}
	return !1;
}
function Rh(e) {
	let t, n, r = new Promise((e, r) => {
		t = e, n = r;
	});
	return r.status = "pending", r.resolve = (n) => {
		r.status = "resolved", r.value = n, t(n), e?.(n);
	}, r.reject = (e) => {
		r.status = "rejected", n(e);
	}, r;
}
function zh(e) {
	return !!(e && typeof e == "object" && typeof e.then == "function");
}
function Bh(e, t) {
	for (let n = e.length - 1; n >= 0; n--) {
		let r = e[n];
		if (t(r)) return r;
	}
}
function Vh(e) {
	return e.replace(/[\x00-\x1f\x7f]/g, "");
}
function Hh(e) {
	let t;
	try {
		t = decodeURI(e);
	} catch {
		t = e.replaceAll(/%[0-9A-F]{2}/gi, (e) => {
			try {
				return decodeURI(e);
			} catch {
				return e;
			}
		});
	}
	return Vh(t);
}
var Uh = [
	"http:",
	"https:",
	"mailto:",
	"tel:"
];
function Wh(e, t) {
	if (!e) return !1;
	try {
		let n = new URL(e);
		return !t.has(n.protocol);
	} catch {
		return !1;
	}
}
function Gh(e) {
	if (!e || !/[%\\\x00-\x1f\x7f]/.test(e) && !e.startsWith("//")) return {
		path: e,
		handledProtocolRelativeURL: !1
	};
	let t = /%25|%5C/gi, n = 0, r = "", i;
	for (; (i = t.exec(e)) !== null;) r += Hh(e.slice(n, i.index)) + i[0], n = t.lastIndex;
	r += Hh(n ? e.slice(n) : e);
	let a = !1;
	return r.startsWith("//") && (a = !0, r = "/" + r.replace(/^\/+/, "")), {
		path: r,
		handledProtocolRelativeURL: a
	};
}
function Kh(e) {
	return /\s|[^\u0000-\u007F]/.test(e) ? e.replace(/\s|[^\u0000-\u007F]/gu, encodeURIComponent) : e;
}
//#endregion
//#region ../../node_modules/.pnpm/tiny-invariant@1.3.3/node_modules/tiny-invariant/dist/esm/tiny-invariant.js
var qh = process.env.NODE_ENV === "production", Jh = "Invariant failed";
function Yh(e, t) {
	if (!e) {
		if (qh) throw Error(Jh);
		var n = typeof t == "function" ? t() : t, r = n ? `${Jh}: ${n}` : Jh;
		throw Error(r);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/lru-cache.js
function Xh(e) {
	let t = /* @__PURE__ */ new Map(), n, r, i = (e) => {
		e.next && (e.prev ? (e.prev.next = e.next, e.next.prev = e.prev, e.next = void 0, r && (r.next = e, e.prev = r)) : (e.next.prev = void 0, n = e.next, e.next = void 0, r && (e.prev = r, r.next = e)), r = e);
	};
	return {
		get(e) {
			let n = t.get(e);
			if (n) return i(n), n.value;
		},
		set(a, o) {
			if (t.size >= e && n) {
				let e = n;
				t.delete(e.key), e.next && (n = e.next, e.next.prev = void 0), e === r && (r = void 0);
			}
			let s = t.get(a);
			if (s) s.value = o, i(s);
			else {
				let e = {
					key: a,
					value: o,
					prev: r
				};
				r && (r.next = e), r = e, n ||= e, t.set(a, e);
			}
		},
		clear() {
			t.clear(), n = void 0, r = void 0;
		}
	};
}
var Zh = 4, Qh = 5;
function $h(e) {
	let t = e.indexOf("{");
	if (t === -1) return null;
	let n = e.indexOf("}", t);
	return n === -1 || t + 1 >= e.length ? null : [t, n];
}
function eg(e, t, n = new Uint16Array(6)) {
	let r = e.indexOf("/", t), i = r === -1 ? e.length : r, a = e.substring(t, i);
	if (!a || !a.includes("$")) return n[0] = 0, n[1] = t, n[2] = t, n[3] = i, n[4] = i, n[5] = i, n;
	if (a === "$") {
		let r = e.length;
		return n[0] = 2, n[1] = t, n[2] = t, n[3] = r, n[4] = r, n[5] = r, n;
	}
	if (a.charCodeAt(0) === 36) return n[0] = 1, n[1] = t, n[2] = t + 1, n[3] = i, n[4] = i, n[5] = i, n;
	let o = $h(a);
	if (o) {
		let [r, s] = o, c = a.charCodeAt(r + 1);
		if (c === 45) {
			if (r + 2 < a.length && a.charCodeAt(r + 2) === 36) {
				let e = r + 3, a = s;
				if (e < a) return n[0] = 3, n[1] = t + r, n[2] = t + e, n[3] = t + a, n[4] = t + s + 1, n[5] = i, n;
			}
		} else if (c === 36) {
			let a = r + 1, o = r + 2;
			return o === s ? (n[0] = 2, n[1] = t + r, n[2] = t + a, n[3] = t + o, n[4] = t + s + 1, n[5] = e.length, n) : (n[0] = 1, n[1] = t + r, n[2] = t + o, n[3] = t + s, n[4] = t + s + 1, n[5] = i, n);
		}
	}
	return n[0] = 0, n[1] = t, n[2] = t, n[3] = i, n[4] = i, n[5] = i, n;
}
function tg(e, t, n, r, i, a, o) {
	o?.(n);
	let s = r;
	{
		let r = n.fullPath ?? n.from, o = r.length, c = n.options?.caseSensitive ?? e, l = !!(n.options?.params?.parse && n.options?.skipRouteOnParseError?.params);
		for (; s < o;) {
			let e = eg(r, s, t), o, u = s, d = e[5];
			switch (s = d + 1, a++, e[0]) {
				case 0: {
					let t = r.substring(e[2], e[3]);
					if (c) {
						let e = i.static?.get(t);
						if (e) o = e;
						else {
							i.static ??= /* @__PURE__ */ new Map();
							let e = ig(n.fullPath ?? n.from);
							e.parent = i, e.depth = a, o = e, i.static.set(t, e);
						}
					} else {
						let e = t.toLowerCase(), r = i.staticInsensitive?.get(e);
						if (r) o = r;
						else {
							i.staticInsensitive ??= /* @__PURE__ */ new Map();
							let t = ig(n.fullPath ?? n.from);
							t.parent = i, t.depth = a, o = t, i.staticInsensitive.set(e, t);
						}
					}
					break;
				}
				case 1: {
					let t = r.substring(u, e[1]), s = r.substring(e[4], d), f = c && !!(t || s), p = t ? f ? t : t.toLowerCase() : void 0, m = s ? f ? s : s.toLowerCase() : void 0, h = !l && i.dynamic?.find((e) => !e.skipOnParamError && e.caseSensitive === f && e.prefix === p && e.suffix === m);
					if (h) o = h;
					else {
						let e = ag(1, n.fullPath ?? n.from, f, p, m);
						o = e, e.depth = a, e.parent = i, i.dynamic ??= [], i.dynamic.push(e);
					}
					break;
				}
				case 3: {
					let t = r.substring(u, e[1]), s = r.substring(e[4], d), f = c && !!(t || s), p = t ? f ? t : t.toLowerCase() : void 0, m = s ? f ? s : s.toLowerCase() : void 0, h = !l && i.optional?.find((e) => !e.skipOnParamError && e.caseSensitive === f && e.prefix === p && e.suffix === m);
					if (h) o = h;
					else {
						let e = ag(3, n.fullPath ?? n.from, f, p, m);
						o = e, e.parent = i, e.depth = a, i.optional ??= [], i.optional.push(e);
					}
					break;
				}
				case 2: {
					let t = r.substring(u, e[1]), s = r.substring(e[4], d), l = c && !!(t || s), f = t ? l ? t : t.toLowerCase() : void 0, p = s ? l ? s : s.toLowerCase() : void 0, m = ag(2, n.fullPath ?? n.from, l, f, p);
					o = m, m.parent = i, m.depth = a, i.wildcard ??= [], i.wildcard.push(m);
				}
			}
			i = o;
		}
		if (l && n.children && !n.isRoot && n.id && n.id.charCodeAt(n.id.lastIndexOf("/") + 1) === 95) {
			let e = ig(n.fullPath ?? n.from);
			e.kind = Qh, e.parent = i, a++, e.depth = a, i.pathless ??= [], i.pathless.push(e), i = e;
		}
		let u = (n.path || !n.children) && !n.isRoot;
		if (u && r.endsWith("/")) {
			let e = ig(n.fullPath ?? n.from);
			e.kind = Zh, e.parent = i, a++, e.depth = a, i.index = e, i = e;
		}
		i.parse = n.options?.params?.parse ?? null, i.skipOnParamError = l, i.parsingPriority = n.options?.skipRouteOnParseError?.priority ?? 0, u && !i.route && (i.route = n, i.fullPath = n.fullPath ?? n.from);
	}
	if (n.children) for (let r of n.children) tg(e, t, r, s, i, a, o);
}
function ng(e, t) {
	if (e.skipOnParamError && !t.skipOnParamError) return -1;
	if (!e.skipOnParamError && t.skipOnParamError) return 1;
	if (e.skipOnParamError && t.skipOnParamError && (e.parsingPriority || t.parsingPriority)) return t.parsingPriority - e.parsingPriority;
	if (e.prefix && t.prefix && e.prefix !== t.prefix) {
		if (e.prefix.startsWith(t.prefix)) return -1;
		if (t.prefix.startsWith(e.prefix)) return 1;
	}
	if (e.suffix && t.suffix && e.suffix !== t.suffix) {
		if (e.suffix.endsWith(t.suffix)) return -1;
		if (t.suffix.endsWith(e.suffix)) return 1;
	}
	return e.prefix && !t.prefix ? -1 : !e.prefix && t.prefix ? 1 : e.suffix && !t.suffix ? -1 : !e.suffix && t.suffix ? 1 : e.caseSensitive && !t.caseSensitive ? -1 : !e.caseSensitive && t.caseSensitive ? 1 : 0;
}
function rg(e) {
	if (e.pathless) for (let t of e.pathless) rg(t);
	if (e.static) for (let t of e.static.values()) rg(t);
	if (e.staticInsensitive) for (let t of e.staticInsensitive.values()) rg(t);
	if (e.dynamic?.length) {
		e.dynamic.sort(ng);
		for (let t of e.dynamic) rg(t);
	}
	if (e.optional?.length) {
		e.optional.sort(ng);
		for (let t of e.optional) rg(t);
	}
	if (e.wildcard?.length) {
		e.wildcard.sort(ng);
		for (let t of e.wildcard) rg(t);
	}
}
function ig(e) {
	return {
		kind: 0,
		depth: 0,
		pathless: null,
		index: null,
		static: null,
		staticInsensitive: null,
		dynamic: null,
		optional: null,
		wildcard: null,
		route: null,
		fullPath: e,
		parent: null,
		parse: null,
		skipOnParamError: !1,
		parsingPriority: 0
	};
}
function ag(e, t, n, r, i) {
	return {
		kind: e,
		depth: 0,
		pathless: null,
		index: null,
		static: null,
		staticInsensitive: null,
		dynamic: null,
		optional: null,
		wildcard: null,
		route: null,
		fullPath: t,
		parent: null,
		parse: null,
		skipOnParamError: !1,
		parsingPriority: 0,
		caseSensitive: n,
		prefix: r,
		suffix: i
	};
}
function og(e, t) {
	let n = ig("/"), r = new Uint16Array(6);
	for (let t of e) tg(!1, r, t, 1, n, 0);
	rg(n), t.masksTree = n, t.flatCache = Xh(1e3);
}
function sg(e, t) {
	e ||= "/";
	let n = t.flatCache.get(e);
	if (n) return n;
	let r = fg(e, t.masksTree);
	return t.flatCache.set(e, r), r;
}
function cg(e, t, n, r, i) {
	e ||= "/", r ||= "/";
	let a = t ? `case\0${e}` : e, o = i.singleCache.get(a);
	return o || (o = ig("/"), tg(t, new Uint16Array(6), { from: e }, 1, o, 0), i.singleCache.set(a, o)), fg(r, o, n);
}
function lg(e, t, n = !1) {
	let r = n ? e : `nofuzz\0${e}`, i = t.matchCache.get(r);
	if (i !== void 0) return i;
	e ||= "/";
	let a;
	try {
		a = fg(e, t.segmentTree, n);
	} catch (e) {
		if (e instanceof URIError) a = null;
		else throw e;
	}
	return a && (a.branch = mg(a.route)), t.matchCache.set(r, a), a;
}
function ug(e) {
	return e === "/" ? e : e.replace(/\/{1,}$/, "");
}
function dg(e, t = !1, n) {
	let r = ig(e.fullPath), i = new Uint16Array(6), a = {}, o = {}, s = 0;
	return tg(t, i, e, 1, r, 0, (e) => {
		if (n?.(e, s), Yh(!(e.id in a), `Duplicate routes found with id: ${String(e.id)}`), a[e.id] = e, s !== 0 && e.path) {
			let t = ug(e.fullPath);
			(!o[t] || e.fullPath.endsWith("/")) && (o[t] = e);
		}
		s++;
	}), rg(r), {
		processedTree: {
			segmentTree: r,
			singleCache: Xh(1e3),
			matchCache: Xh(1e3),
			flatCache: null,
			masksTree: null
		},
		routesById: a,
		routesByPath: o
	};
}
function fg(e, t, n = !1) {
	let r = e.split("/"), i = gg(e, r, t, n);
	if (!i) return null;
	let [a] = pg(e, r, i);
	return {
		route: i.node.route,
		rawParams: a,
		parsedParams: i.parsedParams
	};
}
function pg(e, t, n) {
	let r = hg(n.node), i = null, a = /* @__PURE__ */ Object.create(null), o = n.extract?.part ?? 0, s = n.extract?.node ?? 0, c = n.extract?.path ?? 0, l = n.extract?.segment ?? 0;
	for (; s < r.length; o++, s++, c++, l++) {
		let u = r[s];
		if (u.kind === Zh) break;
		if (u.kind === Qh) {
			l--, o--, c--;
			continue;
		}
		let d = t[o], f = c;
		if (d && (c += d.length), u.kind === 1) {
			i ??= n.node.fullPath.split("/");
			let e = i[l], t = u.prefix?.length ?? 0;
			if (e.charCodeAt(t) === 123) {
				let n = u.suffix?.length ?? 0, r = e.substring(t + 2, e.length - n - 1), i = d.substring(t, d.length - n);
				a[r] = decodeURIComponent(i);
			} else {
				let t = e.substring(1);
				a[t] = decodeURIComponent(d);
			}
		} else if (u.kind === 3) {
			if (n.skipped & 1 << s) {
				o--, c = f - 1;
				continue;
			}
			i ??= n.node.fullPath.split("/");
			let e = i[l], t = u.prefix?.length ?? 0, r = u.suffix?.length ?? 0, p = e.substring(t + 3, e.length - r - 1), m = u.suffix || u.prefix ? d.substring(t, d.length - r) : d;
			m && (a[p] = decodeURIComponent(m));
		} else if (u.kind === 2) {
			let t = u, n = e.substring(f + (t.prefix?.length ?? 0), e.length - (t.suffix?.length ?? 0)), r = decodeURIComponent(n);
			a["*"] = r, a._splat = r;
			break;
		}
	}
	return n.rawParams && Object.assign(a, n.rawParams), [a, {
		part: o,
		node: s,
		path: c,
		segment: l
	}];
}
function mg(e) {
	let t = [e];
	for (; e.parentRoute;) e = e.parentRoute, t.push(e);
	return t.reverse(), t;
}
function hg(e) {
	let t = Array(e.depth + 1);
	do
		t[e.depth] = e, e = e.parent;
	while (e);
	return t;
}
function gg(e, t, n, r) {
	if (e === "/" && n.index) return {
		node: n.index,
		skipped: 0
	};
	let i = !Th(t), a = i && e !== "/", o = t.length - (i ? 1 : 0), s = [{
		node: n,
		index: 1,
		skipped: 0,
		depth: 1,
		statics: 1,
		dynamics: 0,
		optionals: 0
	}], c = null, l = null, u = null;
	for (; s.length;) {
		let n = s.pop(), { node: i, index: d, skipped: f, depth: p, statics: m, dynamics: h, optionals: g } = n, { extract: _, rawParams: v, parsedParams: y } = n;
		if (i.skipOnParamError) {
			if (!_g(e, t, n)) continue;
			v = n.rawParams, _ = n.extract, y = n.parsedParams;
		}
		r && i.route && i.kind !== Zh && vg(l, n) && (l = n);
		let b = d === o;
		if (b && (i.route && !a && vg(u, n) && (u = n), !i.optional && !i.wildcard && !i.index && !i.pathless)) continue;
		let x = b ? void 0 : t[d], S;
		if (b && i.index) {
			let n = {
				node: i.index,
				index: d,
				skipped: f,
				depth: p + 1,
				statics: m,
				dynamics: h,
				optionals: g,
				extract: _,
				rawParams: v,
				parsedParams: y
			}, r = !0;
			if (i.index.skipOnParamError && (_g(e, t, n) || (r = !1)), r) {
				if (m === o && !h && !g && !f) return n;
				vg(u, n) && (u = n);
			}
		}
		if (i.wildcard && vg(c, n)) for (let n of i.wildcard) {
			let { prefix: r, suffix: i } = n;
			if (r && (b || !(n.caseSensitive ? x : S ??= x.toLowerCase()).startsWith(r))) continue;
			if (i) {
				if (b) continue;
				let e = t.slice(d).join("/").slice(-i.length);
				if ((n.caseSensitive ? e : e.toLowerCase()) !== i) continue;
			}
			let a = {
				node: n,
				index: o,
				skipped: f,
				depth: p,
				statics: m,
				dynamics: h,
				optionals: g,
				extract: _,
				rawParams: v,
				parsedParams: y
			};
			if (!(n.skipOnParamError && !_g(e, t, a))) {
				c = a;
				break;
			}
		}
		if (i.optional) {
			let e = f | 1 << p, t = p + 1;
			for (let n = i.optional.length - 1; n >= 0; n--) {
				let r = i.optional[n];
				s.push({
					node: r,
					index: d,
					skipped: e,
					depth: t,
					statics: m,
					dynamics: h,
					optionals: g,
					extract: _,
					rawParams: v,
					parsedParams: y
				});
			}
			if (!b) for (let e = i.optional.length - 1; e >= 0; e--) {
				let n = i.optional[e], { prefix: r, suffix: a } = n;
				if (r || a) {
					let e = n.caseSensitive ? x : S ??= x.toLowerCase();
					if (r && !e.startsWith(r) || a && !e.endsWith(a)) continue;
				}
				s.push({
					node: n,
					index: d + 1,
					skipped: f,
					depth: t,
					statics: m,
					dynamics: h,
					optionals: g + 1,
					extract: _,
					rawParams: v,
					parsedParams: y
				});
			}
		}
		if (!b && i.dynamic && x) for (let e = i.dynamic.length - 1; e >= 0; e--) {
			let t = i.dynamic[e], { prefix: n, suffix: r } = t;
			if (n || r) {
				let e = t.caseSensitive ? x : S ??= x.toLowerCase();
				if (n && !e.startsWith(n) || r && !e.endsWith(r)) continue;
			}
			s.push({
				node: t,
				index: d + 1,
				skipped: f,
				depth: p + 1,
				statics: m,
				dynamics: h + 1,
				optionals: g,
				extract: _,
				rawParams: v,
				parsedParams: y
			});
		}
		if (!b && i.staticInsensitive) {
			let e = i.staticInsensitive.get(S ??= x.toLowerCase());
			e && s.push({
				node: e,
				index: d + 1,
				skipped: f,
				depth: p + 1,
				statics: m + 1,
				dynamics: h,
				optionals: g,
				extract: _,
				rawParams: v,
				parsedParams: y
			});
		}
		if (!b && i.static) {
			let e = i.static.get(x);
			e && s.push({
				node: e,
				index: d + 1,
				skipped: f,
				depth: p + 1,
				statics: m + 1,
				dynamics: h,
				optionals: g,
				extract: _,
				rawParams: v,
				parsedParams: y
			});
		}
		if (i.pathless) {
			let e = p + 1;
			for (let t = i.pathless.length - 1; t >= 0; t--) {
				let n = i.pathless[t];
				s.push({
					node: n,
					index: d,
					skipped: f,
					depth: e,
					statics: m,
					dynamics: h,
					optionals: g,
					extract: _,
					rawParams: v,
					parsedParams: y
				});
			}
		}
	}
	if (u && c) return vg(c, u) ? u : c;
	if (u) return u;
	if (c) return c;
	if (r && l) {
		let n = l.index;
		for (let e = 0; e < l.index; e++) n += t[e].length;
		let r = n === e.length ? "/" : e.slice(n);
		return l.rawParams ??= /* @__PURE__ */ Object.create(null), l.rawParams["**"] = decodeURIComponent(r), l;
	}
	return null;
}
function _g(e, t, n) {
	try {
		let [r, i] = pg(e, t, n);
		n.rawParams = r, n.extract = i;
		let a = n.node.parse(r);
		return n.parsedParams = Object.assign(/* @__PURE__ */ Object.create(null), n.parsedParams, a), !0;
	} catch {
		return null;
	}
}
function vg(e, t) {
	return e ? t.statics > e.statics || t.statics === e.statics && (t.dynamics > e.dynamics || t.dynamics === e.dynamics && (t.optionals > e.optionals || t.optionals === e.optionals && ((t.node.kind === Zh) > (e.node.kind === Zh) || t.node.kind === Zh == (e.node.kind === Zh) && t.depth > e.depth))) : !0;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/path.js
function yg(e) {
	return bg(e.filter((e) => e !== void 0).join("/"));
}
function bg(e) {
	return e.replace(/\/{2,}/g, "/");
}
function xg(e) {
	return e === "/" ? e : e.replace(/^\/{1,}/, "");
}
function Sg(e) {
	let t = e.length;
	return t > 1 && e[t - 1] === "/" ? e.replace(/\/{1,}$/, "") : e;
}
function Cg(e) {
	return Sg(xg(e));
}
function wg(e, t) {
	return e?.endsWith("/") && e !== "/" && e !== `${t}/` ? e.slice(0, -1) : e;
}
function Tg(e, t, n) {
	return wg(e, n) === wg(t, n);
}
function Eg({ base: e, to: t, trailingSlash: n = "never", cache: r }) {
	let i = t.startsWith("/"), a = !i && t === ".", o;
	if (r) {
		o = i ? t : a ? e : e + "\0" + t;
		let n = r.get(o);
		if (n) return n;
	}
	let s;
	if (a) s = e.split("/");
	else if (i) s = t.split("/");
	else {
		for (s = e.split("/"); s.length > 1 && Th(s) === "";) s.pop();
		let n = t.split("/");
		for (let e = 0, t = n.length; e < t; e++) {
			let r = n[e];
			r === "" ? e ? e === t - 1 && s.push(r) : s = [r] : r === ".." ? s.pop() : r === "." || s.push(r);
		}
	}
	s.length > 1 && (Th(s) === "" ? n === "never" && s.pop() : n === "always" && s.push(""));
	let c, l = "";
	for (let e = 0; e < s.length; e++) {
		e > 0 && (l += "/");
		let t = s[e];
		if (!t) continue;
		c = eg(t, 0, c);
		let n = c[0];
		if (n === 0) {
			l += t;
			continue;
		}
		let r = c[5], i = t.substring(0, c[1]), a = t.substring(c[4], r), o = t.substring(c[2], c[3]);
		n === 1 ? l += i || a ? `${i}{$${o}}${a}` : `$${o}` : n === 2 ? l += i || a ? `${i}{$}${a}` : "$" : l += `${i}{-$${o}}${a}`;
	}
	l = bg(l);
	let u = l || "/";
	return o && r && r.set(o, u), u;
}
function Dg(e) {
	let t = new Map(e.map((e) => [encodeURIComponent(e), e])), n = Array.from(t.keys()).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), r = new RegExp(n, "g");
	return (e) => e.replace(r, (e) => t.get(e) ?? e);
}
function Og(e, t, n) {
	let r = t[e];
	return typeof r == "string" ? e === "_splat" ? /^[a-zA-Z0-9\-._~!/]*$/.test(r) ? r : r.split("/").map((e) => Ag(e, n)).join("/") : Ag(r, n) : r;
}
function kg({ path: e, params: t, decoder: n, ...r }) {
	let i = !1, a = /* @__PURE__ */ Object.create(null);
	if (!e || e === "/") return {
		interpolatedPath: "/",
		usedParams: a,
		isMissingParams: i
	};
	if (!e.includes("$")) return {
		interpolatedPath: e,
		usedParams: a,
		isMissingParams: i
	};
	if ((Y ?? r.server) && e.indexOf("{") === -1) {
		let r = e.length, o = 0, s = "";
		for (; o < r;) {
			for (; o < r && e.charCodeAt(o) === 47;) o++;
			if (o >= r) break;
			let c = o, l = e.indexOf("/", o);
			l === -1 && (l = r), o = l;
			let u = e.substring(c, l);
			if (u) if (u.charCodeAt(0) === 36) if (u.length === 1) {
				let e = t._splat;
				if (a._splat = e, a["*"] = e, !e) {
					i = !0;
					continue;
				}
				let r = Og("_splat", t, n);
				s += "/" + r;
			} else {
				let e = u.substring(1);
				!i && !(e in t) && (i = !0), a[e] = t[e];
				let r = Og(e, t, n) ?? "undefined";
				s += "/" + r;
			}
			else s += "/" + u;
		}
		return e.endsWith("/") && (s += "/"), {
			usedParams: a,
			interpolatedPath: s || "/",
			isMissingParams: i
		};
	}
	let o = e.length, s = 0, c, l = "";
	for (; s < o;) {
		let r = s;
		c = eg(e, r, c);
		let o = c[5];
		if (s = o + 1, r === o) continue;
		let u = c[0];
		if (u === 0) {
			l += "/" + e.substring(r, o);
			continue;
		}
		if (u === 2) {
			let s = t._splat;
			a._splat = s, a["*"] = s;
			let u = e.substring(r, c[1]), d = e.substring(c[4], o);
			if (!s) {
				i = !0, (u || d) && (l += "/" + u + d);
				continue;
			}
			let f = Og("_splat", t, n);
			l += "/" + u + f + d;
			continue;
		}
		if (u === 1) {
			let s = e.substring(c[2], c[3]);
			!i && !(s in t) && (i = !0), a[s] = t[s];
			let u = e.substring(r, c[1]), d = e.substring(c[4], o), f = Og(s, t, n) ?? "undefined";
			l += "/" + u + f + d;
			continue;
		}
		if (u === 3) {
			let i = e.substring(c[2], c[3]), s = t[i];
			if (s == null) continue;
			a[i] = s;
			let u = e.substring(r, c[1]), d = e.substring(c[4], o), f = Og(i, t, n) ?? "";
			l += "/" + u + f + d;
			continue;
		}
	}
	return e.endsWith("/") && (l += "/"), {
		usedParams: a,
		interpolatedPath: l || "/",
		isMissingParams: i
	};
}
function Ag(e, t) {
	let n = encodeURIComponent(e);
	return t?.(n) ?? n;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/not-found.js
function jg(e) {
	return !!e?.isNotFound;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/scroll-restoration.js
function Mg() {
	try {
		if (typeof window < "u" && typeof window.sessionStorage == "object") return window.sessionStorage;
	} catch {}
}
var Ng = "tsr-scroll-restoration-v1_3", Pg = (e, t) => {
	let n;
	return (...r) => {
		n ||= setTimeout(() => {
			e(...r), n = null;
		}, t);
	};
};
function Fg() {
	let e = Mg();
	if (!e) return null;
	let t = e.getItem(Ng), n = t ? JSON.parse(t) : {};
	return {
		state: n,
		set: (t) => {
			n = Dh(t, n) || n;
			try {
				e.setItem(Ng, JSON.stringify(n));
			} catch {
				console.warn("[ts-router] Could not persist scroll restoration state to sessionStorage.");
			}
		}
	};
}
var Ig = Fg(), Lg = (e) => e.state.__TSR_key || e.href;
function Rg(e) {
	let t = [], n;
	for (; n = e.parentNode;) t.push(`${e.tagName}:nth-child(${Array.prototype.indexOf.call(n.children, e) + 1})`), e = n;
	return `${t.reverse().join(" > ")}`.toLowerCase();
}
var zg = !1;
function Bg({ storageKey: e, key: t, behavior: n, shouldScrollRestoration: r, scrollToTopSelectors: i, location: a }) {
	let o;
	try {
		o = JSON.parse(sessionStorage.getItem(e) || "{}");
	} catch (e) {
		console.error(e);
		return;
	}
	let s = t || window.history.state?.__TSR_key, c = o[s];
	zg = !0;
	scroll: {
		if (r && c && Object.keys(c).length > 0) {
			for (let e in c) {
				let t = c[e];
				if (e === "window") window.scrollTo({
					top: t.scrollY,
					left: t.scrollX,
					behavior: n
				});
				else if (e) {
					let n = document.querySelector(e);
					n && (n.scrollLeft = t.scrollX, n.scrollTop = t.scrollY);
				}
			}
			break scroll;
		}
		let e = (a ?? window.location).hash.split("#", 2)[1];
		if (e) {
			let t = window.history.state?.__hashScrollIntoViewOptions ?? !0;
			if (t) {
				let n = document.getElementById(e);
				n && n.scrollIntoView(t);
			}
			break scroll;
		}
		let t = {
			top: 0,
			left: 0,
			behavior: n
		};
		if (window.scrollTo(t), i) for (let e of i) {
			if (e === "window") continue;
			let n = typeof e == "function" ? e() : document.querySelector(e);
			n && n.scrollTo(t);
		}
	}
	zg = !1;
}
function Vg(e, t) {
	if (!Ig && !(Y ?? e.isServer) || ((t ?? e.options.scrollRestoration ?? !1) && (e.isScrollRestoring = !0), (Y ?? e.isServer) || e.isScrollRestorationSetup || !Ig)) return;
	e.isScrollRestorationSetup = !0, zg = !1;
	let n = e.options.getScrollRestorationKey || Lg;
	window.history.scrollRestoration = "manual", typeof document < "u" && document.addEventListener("scroll", Pg((t) => {
		if (zg || !e.isScrollRestoring) return;
		let r = "";
		if (t.target === document || t.target === window) r = "window";
		else {
			let e = t.target.getAttribute("data-scroll-restoration-id");
			r = e ? `[data-scroll-restoration-id="${e}"]` : Rg(t.target);
		}
		let i = n(e.state.location);
		Ig.set((e) => {
			let t = e[i] ||= {}, n = t[r] ||= {};
			if (r === "window") n.scrollX = window.scrollX || 0, n.scrollY = window.scrollY || 0;
			else if (r) {
				let e = document.querySelector(r);
				e && (n.scrollX = e.scrollLeft || 0, n.scrollY = e.scrollTop || 0);
			}
			return e;
		});
	}, 100), !0), e.subscribe("onRendered", (t) => {
		let r = n(t.toLocation);
		if (!e.resetNextScroll) {
			e.resetNextScroll = !0;
			return;
		}
		typeof e.options.scrollRestoration == "function" && !e.options.scrollRestoration({ location: e.latestLocation }) || (Bg({
			storageKey: Ng,
			key: r,
			behavior: e.options.scrollRestorationBehavior,
			shouldScrollRestoration: e.isScrollRestoring,
			scrollToTopSelectors: e.options.scrollToTopSelectors,
			location: e.history.location
		}), e.isScrollRestoring && Ig.set((e) => (e[r] ||= {}, e)));
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/qss.js
function Hg(e, t = String) {
	let n = new URLSearchParams();
	for (let r in e) {
		let i = e[r];
		i !== void 0 && n.set(r, t(i));
	}
	return n.toString();
}
function Ug(e) {
	return e ? e === "false" ? !1 : e === "true" ? !0 : e * 0 == 0 && +e + "" === e ? +e : e : "";
}
function Wg(e) {
	let t = new URLSearchParams(e), n = /* @__PURE__ */ Object.create(null);
	for (let [e, r] of t.entries()) {
		let t = n[e];
		t == null ? n[e] = Ug(r) : Array.isArray(t) ? t.push(Ug(r)) : n[e] = [t, Ug(r)];
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/searchParams.js
var Gg = qg(JSON.parse), Kg = Jg(JSON.stringify, JSON.parse);
function qg(e) {
	return (t) => {
		t[0] === "?" && (t = t.substring(1));
		let n = Wg(t);
		for (let t in n) {
			let r = n[t];
			if (typeof r == "string") try {
				n[t] = e(r);
			} catch {}
		}
		return n;
	};
}
function Jg(e, t) {
	let n = typeof t == "function";
	function r(r) {
		if (typeof r == "object" && r) try {
			return e(r);
		} catch {}
		else if (n && typeof r == "string") try {
			return t(r), e(r);
		} catch {}
		return r;
	}
	return (e) => {
		let t = Hg(e, r);
		return t ? `?${t}` : "";
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/root.js
var Yg = "__root__";
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/redirect.js
function Xg(e) {
	if (e.statusCode = e.statusCode || e.code || 307, !e._builtLocation && !e.reloadDocument && typeof e.href == "string") try {
		new URL(e.href), e.reloadDocument = !0;
	} catch {}
	let t = new Headers(e.headers);
	e.href && t.get("Location") === null && t.set("Location", e.href);
	let n = new Response(null, {
		status: e.statusCode,
		headers: t
	});
	if (n.options = e, e.throw) throw n;
	return n;
}
function Zg(e) {
	return e instanceof Response && !!e.options;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/load-matches.js
var Qg = (e) => {
	if (!e.rendered) return e.rendered = !0, e.onReady?.();
}, $g = (e, t) => !!(e.preload && !e.router.state.matches.some((e) => e.id === t)), e_ = (e, t, n = !0) => {
	let r = { ...e.router.options.context ?? {} }, i = n ? t : t - 1;
	for (let t = 0; t <= i; t++) {
		let n = e.matches[t];
		if (!n) continue;
		let i = e.router.getMatch(n.id);
		i && Object.assign(r, i.__routeContext, i.__beforeLoadContext);
	}
	return r;
}, t_ = (e, t) => {
	if (!e.matches.length) return;
	let n = t.routeId, r = e.matches.findIndex((t) => t.routeId === e.router.routeTree.id), i = r >= 0 ? r : 0, a = n ? e.matches.findIndex((e) => e.routeId === n) : e.firstBadMatchIndex ?? e.matches.length - 1;
	a < 0 && (a = i);
	for (let t = a; t >= 0; t--) {
		let n = e.matches[t];
		if (e.router.looseRoutesById[n.routeId].options.notFoundComponent) return t;
	}
	return n ? a : i;
}, n_ = (e, t, n) => {
	if (!(!Zg(n) && !jg(n))) throw Zg(n) && n.redirectHandled && !n.options.reloadDocument ? n : (t && (t._nonReactive.beforeLoadPromise?.resolve(), t._nonReactive.loaderPromise?.resolve(), t._nonReactive.beforeLoadPromise = void 0, t._nonReactive.loaderPromise = void 0, t._nonReactive.error = n, e.updateMatch(t.id, (r) => ({
		...r,
		status: Zg(n) ? "redirected" : r.status === "pending" ? "success" : r.status,
		context: e_(e, t.index),
		isFetching: !1,
		error: n
	})), jg(n) && !n.routeId && (n.routeId = t.routeId), t._nonReactive.loadPromise?.resolve()), Zg(n) && (e.rendered = !0, n.options._fromLocation = e.location, n.redirectHandled = !0, n = e.router.resolveRedirect(n)), n);
}, r_ = (e, t) => {
	let n = e.router.getMatch(t);
	return !!(!n || !(Y ?? e.router.isServer) && n._nonReactive.dehydrated || (Y ?? e.router.isServer) && n.ssr === !1);
}, i_ = (e, t, n) => {
	let r = e_(e, n);
	e.updateMatch(t, (e) => ({
		...e,
		context: r
	}));
}, a_ = (e, t, n, r) => {
	let { id: i, routeId: a } = e.matches[t], o = e.router.looseRoutesById[a];
	if (n instanceof Promise) throw n;
	n.routerCode = r, e.firstBadMatchIndex ??= t, n_(e, e.router.getMatch(i), n);
	try {
		o.options.onError?.(n);
	} catch (t) {
		n = t, n_(e, e.router.getMatch(i), n);
	}
	e.updateMatch(i, (e) => (e._nonReactive.beforeLoadPromise?.resolve(), e._nonReactive.beforeLoadPromise = void 0, e._nonReactive.loadPromise?.resolve(), {
		...e,
		error: n,
		status: "error",
		isFetching: !1,
		updatedAt: Date.now(),
		abortController: new AbortController()
	})), !e.preload && !Zg(n) && !jg(n) && (e.serialError ??= n);
}, o_ = (e, t, n, r) => {
	let i = e.router.getMatch(t), a = e.matches[n - 1]?.id, o = a ? e.router.getMatch(a) : void 0;
	if (e.router.isShell()) {
		i.ssr = r.id === Yg;
		return;
	}
	if (o?.ssr === !1) {
		i.ssr = !1;
		return;
	}
	let s = (e) => e === !0 && o?.ssr === "data-only" ? "data-only" : e, c = e.router.options.defaultSsr ?? !0;
	if (r.options.ssr === void 0) {
		i.ssr = s(c);
		return;
	}
	if (typeof r.options.ssr != "function") {
		i.ssr = s(r.options.ssr);
		return;
	}
	let { search: l, params: u } = i, d = {
		search: v_(l, i.searchError),
		params: v_(u, i.paramsError),
		location: e.location,
		matches: e.matches.map((e) => ({
			index: e.index,
			pathname: e.pathname,
			fullPath: e.fullPath,
			staticData: e.staticData,
			id: e.id,
			routeId: e.routeId,
			search: v_(e.search, e.searchError),
			params: v_(e.params, e.paramsError),
			ssr: e.ssr
		}))
	}, f = r.options.ssr(d);
	if (zh(f)) return f.then((e) => {
		i.ssr = s(e ?? c);
	});
	i.ssr = s(f ?? c);
}, s_ = (e, t, n, r) => {
	if (r._nonReactive.pendingTimeout !== void 0) return;
	let i = n.options.pendingMs ?? e.router.options.defaultPendingMs;
	if (e.onReady && !(Y ?? e.router.isServer) && !$g(e, t) && (n.options.loader || n.options.beforeLoad || y_(n)) && typeof i == "number" && i !== Infinity && (n.options.pendingComponent ?? e.router.options?.defaultPendingComponent)) {
		let t = setTimeout(() => {
			Qg(e);
		}, i);
		r._nonReactive.pendingTimeout = t;
	}
}, c_ = (e, t, n) => {
	let r = e.router.getMatch(t);
	if (!r._nonReactive.beforeLoadPromise && !r._nonReactive.loaderPromise) return;
	s_(e, t, n, r);
	let i = () => {
		let n = e.router.getMatch(t);
		n.preload && (n.status === "redirected" || n.status === "notFound") && n_(e, n, n.error);
	};
	return r._nonReactive.beforeLoadPromise ? r._nonReactive.beforeLoadPromise.then(i) : i();
}, l_ = (e, t, n, r) => {
	let i = e.router.getMatch(t), a = i._nonReactive.loadPromise;
	i._nonReactive.loadPromise = Rh(() => {
		a?.resolve();
	});
	let { paramsError: o, searchError: s } = i;
	o && a_(e, n, o, "PARSE_PARAMS"), s && a_(e, n, s, "VALIDATE_SEARCH"), s_(e, t, r, i);
	let c = new AbortController(), l = !1, u = () => {
		l || (l = !0, e.updateMatch(t, (e) => ({
			...e,
			isFetching: "beforeLoad",
			fetchCount: e.fetchCount + 1,
			abortController: c
		})));
	}, d = () => {
		i._nonReactive.beforeLoadPromise?.resolve(), i._nonReactive.beforeLoadPromise = void 0, e.updateMatch(t, (e) => ({
			...e,
			isFetching: !1
		}));
	};
	if (!r.options.beforeLoad) {
		wh(() => {
			u(), d();
		});
		return;
	}
	i._nonReactive.beforeLoadPromise = Rh();
	let f = {
		...e_(e, n, !1),
		...i.__routeContext
	}, { search: p, params: m, cause: h } = i, g = $g(e, t), _ = {
		search: p,
		abortController: c,
		params: m,
		preload: g,
		context: f,
		location: e.location,
		navigate: (t) => e.router.navigate({
			...t,
			_fromLocation: e.location
		}),
		buildLocation: e.router.buildLocation,
		cause: g ? "preload" : h,
		matches: e.matches,
		routeId: r.id,
		...e.router.options.additionalContext
	}, v = (r) => {
		if (r === void 0) {
			wh(() => {
				u(), d();
			});
			return;
		}
		(Zg(r) || jg(r)) && (u(), a_(e, n, r, "BEFORE_LOAD")), wh(() => {
			u(), e.updateMatch(t, (e) => ({
				...e,
				__beforeLoadContext: r
			})), d();
		});
	}, y;
	try {
		if (y = r.options.beforeLoad(_), zh(y)) return u(), y.catch((t) => {
			a_(e, n, t, "BEFORE_LOAD");
		}).then(v);
	} catch (t) {
		u(), a_(e, n, t, "BEFORE_LOAD");
	}
	v(y);
}, u_ = (e, t) => {
	let { id: n, routeId: r } = e.matches[t], i = e.router.looseRoutesById[r], a = () => {
		if (Y ?? e.router.isServer) {
			let r = o_(e, n, t, i);
			if (zh(r)) return r.then(s);
		}
		return s();
	}, o = () => l_(e, n, t, i), s = () => {
		if (r_(e, n)) return;
		let t = c_(e, n, i);
		return zh(t) ? t.then(o) : o();
	};
	return a();
}, d_ = (e, t, n) => {
	let r = e.router.getMatch(t);
	if (!r || !n.options.head && !n.options.scripts && !n.options.headers) return;
	let i = {
		ssr: e.router.options.ssr,
		matches: e.matches,
		match: r,
		params: r.params,
		loaderData: r.loaderData
	};
	return Promise.all([
		n.options.head?.(i),
		n.options.scripts?.(i),
		n.options.headers?.(i)
	]).then(([e, t, n]) => ({
		meta: e?.meta,
		links: e?.links,
		headScripts: e?.scripts,
		headers: n,
		scripts: t,
		styles: e?.styles
	}));
}, f_ = (e, t, n, r, i) => {
	let a = t[r - 1], { params: o, loaderDeps: s, abortController: c, cause: l } = e.router.getMatch(n), u = e_(e, r), d = $g(e, n);
	return {
		params: o,
		deps: s,
		preload: !!d,
		parentMatchPromise: a,
		abortController: c,
		context: u,
		location: e.location,
		navigate: (t) => e.router.navigate({
			...t,
			_fromLocation: e.location
		}),
		cause: d ? "preload" : l,
		route: i,
		...e.router.options.additionalContext
	};
}, p_ = async (e, t, n, r, i) => {
	try {
		let a = e.router.getMatch(n);
		try {
			(!(Y ?? e.router.isServer) || a.ssr === !0) && __(i);
			let o = i.options.loader?.(f_(e, t, n, r, i)), s = i.options.loader && zh(o);
			if ((s || i._lazyPromise || i._componentsPromise || i.options.head || i.options.scripts || i.options.headers || a._nonReactive.minPendingPromise) && e.updateMatch(n, (e) => ({
				...e,
				isFetching: "loader"
			})), i.options.loader) {
				let t = s ? await o : o;
				n_(e, e.router.getMatch(n), t), t !== void 0 && e.updateMatch(n, (e) => ({
					...e,
					loaderData: t
				}));
			}
			i._lazyPromise && await i._lazyPromise;
			let c = a._nonReactive.minPendingPromise;
			c && await c, i._componentsPromise && await i._componentsPromise, e.updateMatch(n, (t) => ({
				...t,
				error: void 0,
				context: e_(e, r),
				status: "success",
				isFetching: !1,
				updatedAt: Date.now()
			}));
		} catch (t) {
			let o = t;
			if (o?.name === "AbortError") {
				if (a.abortController.signal.aborted) {
					a._nonReactive.loaderPromise?.resolve(), a._nonReactive.loaderPromise = void 0;
					return;
				}
				e.updateMatch(n, (t) => ({
					...t,
					status: t.status === "pending" ? "success" : t.status,
					isFetching: !1,
					context: e_(e, r)
				}));
				return;
			}
			let s = a._nonReactive.minPendingPromise;
			s && await s, jg(t) && await i.options.notFoundComponent?.preload?.(), n_(e, e.router.getMatch(n), t);
			try {
				i.options.onError?.(t);
			} catch (t) {
				o = t, n_(e, e.router.getMatch(n), t);
			}
			!Zg(o) && !jg(o) && await __(i, ["errorComponent"]), e.updateMatch(n, (t) => ({
				...t,
				error: o,
				context: e_(e, r),
				status: "error",
				isFetching: !1
			}));
		}
	} catch (t) {
		let r = e.router.getMatch(n);
		r && (r._nonReactive.loaderPromise = void 0), n_(e, r, t);
	}
}, m_ = async (e, t, n) => {
	async function r(r, a, c, l, u) {
		let d = Date.now() - a.updatedAt, f = r ? u.options.preloadStaleTime ?? e.router.options.defaultPreloadStaleTime ?? 3e4 : u.options.staleTime ?? e.router.options.defaultStaleTime ?? 0, p = u.options.shouldReload, m = typeof p == "function" ? p(f_(e, t, i, n, u)) : p, { status: h, invalid: g } = l, _ = d > f && (!!e.forceStaleReload || l.cause === "enter" || c !== void 0 && c !== l.id);
		o = h === "success" && (g || (m ?? _)), r && u.options.preload === !1 || (o && !e.sync ? (s = !0, (async () => {
			try {
				await p_(e, t, i, n, u);
				let r = e.router.getMatch(i);
				r._nonReactive.loaderPromise?.resolve(), r._nonReactive.loadPromise?.resolve(), r._nonReactive.loaderPromise = void 0;
			} catch (t) {
				Zg(t) && await e.router.navigate(t.options);
			}
		})()) : h !== "success" || o && e.sync ? await p_(e, t, i, n, u) : i_(e, i, n));
	}
	let { id: i, routeId: a } = e.matches[n], o = !1, s = !1, c = e.router.looseRoutesById[a];
	if (r_(e, i)) {
		if (!e.router.getMatch(i)) return e.matches[n];
		if (i_(e, i, n), Y ?? e.router.isServer) return e.router.getMatch(i);
	} else {
		let t = e.router.getMatch(i), o = e.router.state.matches[n]?.routeId === a ? e.router.state.matches[n].id : e.router.state.matches.find((e) => e.routeId === a)?.id, s = $g(e, i);
		if (t._nonReactive.loaderPromise) {
			if (t.status === "success" && !e.sync && !t.preload) return t;
			await t._nonReactive.loaderPromise;
			let n = e.router.getMatch(i), a = n._nonReactive.error || n.error;
			a && n_(e, n, a), n.status === "pending" && await r(s, t, o, n, c);
		} else {
			let n = s && !e.router.state.matches.some((e) => e.id === i), a = e.router.getMatch(i);
			a._nonReactive.loaderPromise = Rh(), n !== a.preload && e.updateMatch(i, (e) => ({
				...e,
				preload: n
			})), await r(s, t, o, a, c);
		}
	}
	let l = e.router.getMatch(i);
	s || (l._nonReactive.loaderPromise?.resolve(), l._nonReactive.loadPromise?.resolve()), clearTimeout(l._nonReactive.pendingTimeout), l._nonReactive.pendingTimeout = void 0, s || (l._nonReactive.loaderPromise = void 0), l._nonReactive.dehydrated = void 0;
	let u = s ? l.isFetching : !1;
	return u !== l.isFetching || l.invalid !== !1 ? (e.updateMatch(i, (e) => ({
		...e,
		isFetching: u,
		invalid: !1
	})), e.router.getMatch(i)) : l;
};
async function h_(e) {
	let t = e, n = [];
	!(Y ?? t.router.isServer) && t.router.state.matches.some((e) => e._forcePending) && Qg(t);
	let r;
	for (let e = 0; e < t.matches.length; e++) {
		try {
			let n = u_(t, e);
			zh(n) && await n;
		} catch (e) {
			if (Zg(e)) throw e;
			if (jg(e)) r = e;
			else if (!t.preload) throw e;
			break;
		}
		if (t.serialError) break;
	}
	let i = t.firstBadMatchIndex ?? t.matches.length, a = r && !t.preload ? t_(t, r) : void 0, o = r && t.preload ? 0 : a === void 0 ? i : Math.min(a + 1, i), s, c;
	for (let e = 0; e < o; e++) n.push(m_(t, n, e));
	try {
		await Promise.all(n);
	} catch {
		let e = await Promise.allSettled(n);
		for (let t of e) {
			if (t.status !== "rejected") continue;
			let e = t.reason;
			if (Zg(e)) throw e;
			jg(e) ? s ??= e : c ??= e;
		}
		if (c !== void 0) throw c;
	}
	let l = s ?? (r && !t.preload ? r : void 0), u = t.serialError ? t.firstBadMatchIndex ?? 0 : t.matches.length - 1;
	if (!l && r && t.preload) return t.matches;
	if (l) {
		let e = t_(t, l);
		Yh(e !== void 0, "Could not find match for notFound boundary");
		let n = t.matches[e], r = t.router.looseRoutesById[n.routeId], i = t.router.options?.defaultNotFoundComponent;
		!r.options.notFoundComponent && i && (r.options.notFoundComponent = i), l.routeId = n.routeId;
		let a = n.routeId === t.router.routeTree.id;
		t.updateMatch(n.id, (e) => ({
			...e,
			...a ? {
				status: "success",
				globalNotFound: !0,
				error: void 0
			} : {
				status: "notFound",
				error: l
			},
			isFetching: !1
		})), u = e, await __(r, ["notFoundComponent"]);
	} else if (!t.preload) {
		let e = t.matches[0];
		e.globalNotFound || t.router.getMatch(e.id)?.globalNotFound && t.updateMatch(e.id, (e) => ({
			...e,
			globalNotFound: !1,
			error: void 0
		}));
	}
	if (t.serialError && t.firstBadMatchIndex !== void 0) {
		let e = t.router.looseRoutesById[t.matches[t.firstBadMatchIndex].routeId];
		await __(e, ["errorComponent"]);
	}
	for (let e = 0; e <= u; e++) {
		let { id: n, routeId: r } = t.matches[e], i = t.router.looseRoutesById[r];
		try {
			let e = d_(t, n, i);
			if (e) {
				let r = await e;
				t.updateMatch(n, (e) => ({
					...e,
					...r
				}));
			}
		} catch (e) {
			console.error(`Error executing head for route ${r}:`, e);
		}
	}
	let d = Qg(t);
	if (zh(d) && await d, l) throw l;
	if (t.serialError && !t.preload && !t.onReady) throw t.serialError;
	return t.matches;
}
function g_(e, t) {
	let n = t.map((t) => e.options[t]?.preload?.()).filter(Boolean);
	if (n.length !== 0) return Promise.all(n);
}
function __(e, t = b_) {
	!e._lazyLoaded && e._lazyPromise === void 0 && (e.lazyFn ? e._lazyPromise = e.lazyFn().then((t) => {
		let { id: n, ...r } = t.options;
		Object.assign(e.options, r), e._lazyLoaded = !0, e._lazyPromise = void 0;
	}) : e._lazyLoaded = !0);
	let n = () => e._componentsLoaded ? void 0 : t === b_ ? (() => {
		if (e._componentsPromise === void 0) {
			let t = g_(e, b_);
			t ? e._componentsPromise = t.then(() => {
				e._componentsLoaded = !0, e._componentsPromise = void 0;
			}) : e._componentsLoaded = !0;
		}
		return e._componentsPromise;
	})() : g_(e, t);
	return e._lazyPromise ? e._lazyPromise.then(n) : n();
}
function v_(e, t) {
	return t ? {
		status: "error",
		error: t
	} : {
		status: "success",
		value: e
	};
}
function y_(e) {
	for (let t of b_) if (e.options[t]?.preload) return !0;
	return !1;
}
var b_ = [
	"component",
	"errorComponent",
	"pendingComponent",
	"notFoundComponent"
];
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/rewrite.js
function x_(e) {
	return {
		input: ({ url: t }) => {
			for (let n of e) t = C_(n, t);
			return t;
		},
		output: ({ url: t }) => {
			for (let n = e.length - 1; n >= 0; n--) t = w_(e[n], t);
			return t;
		}
	};
}
function S_(e) {
	let t = Cg(e.basepath), n = `/${t}`, r = `${n}/`, i = e.caseSensitive ? n : n.toLowerCase(), a = e.caseSensitive ? r : r.toLowerCase();
	return {
		input: ({ url: t }) => {
			let r = e.caseSensitive ? t.pathname : t.pathname.toLowerCase();
			return r === i ? t.pathname = "/" : r.startsWith(a) && (t.pathname = t.pathname.slice(n.length)), t;
		},
		output: ({ url: e }) => (e.pathname = yg([
			"/",
			t,
			e.pathname
		]), e)
	};
}
function C_(e, t) {
	let n = e?.input?.({ url: t });
	if (n) {
		if (typeof n == "string") return new URL(n);
		if (n instanceof URL) return n;
	}
	return t;
}
function w_(e, t) {
	let n = e?.output?.({ url: t });
	if (n) {
		if (typeof n == "string") return new URL(n);
		if (n instanceof URL) return n;
	}
	return t;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/router.js
function T_(e) {
	let t = e.resolvedLocation, n = e.location;
	return {
		fromLocation: t,
		toLocation: n,
		pathChanged: t?.pathname !== n.pathname,
		hrefChanged: t?.href !== n.href,
		hashChanged: t?.hash !== n.hash
	};
}
function E_(e) {
	let t = e.filter((e) => e.status !== "redirected");
	return t.length === e.length ? e : t;
}
function D_(e) {
	let t = {
		state: e,
		setState: (e) => {
			t.state = e(t.state);
		}
	};
	return t;
}
var O_ = class {
	constructor(e) {
		this.tempLocationKey = `${Math.round(Math.random() * 1e7)}`, this.resetNextScroll = !0, this.shouldViewTransition = void 0, this.isViewTransitionTypesSupported = void 0, this.subscribers = /* @__PURE__ */ new Set(), this.isScrollRestoring = !1, this.isScrollRestorationSetup = !1, this.startTransition = (e) => e(), this.update = (e) => {
			process.env.NODE_ENV !== "production" && e.notFoundRoute && console.warn("The notFoundRoute API is deprecated and will be removed in the next major version. See https://tanstack.com/router/v1/docs/framework/react/guide/not-found-errors#migrating-from-notfoundroute for more info.");
			let t = this.options, n = this.basepath ?? t?.basepath ?? "/", r = this.basepath === void 0, i = t?.rewrite;
			if (this.options = {
				...t,
				...e
			}, this.isServer = this.options.isServer ?? typeof document > "u", this.protocolAllowlist = new Set(this.options.protocolAllowlist), this.options.pathParamsAllowedCharacters && (this.pathParamsDecoder = Dg(this.options.pathParamsAllowedCharacters)), (!this.history || this.options.history && this.options.history !== this.history) && (this.options.history ? this.history = this.options.history : (Y ?? this.isServer) || (this.history = yh())), this.origin = this.options.origin, this.origin || (!(Y ?? this.isServer) && window?.origin && window.origin !== "null" ? this.origin = window.origin : this.origin = "http://localhost"), this.history && this.updateLatestLocation(), this.options.routeTree !== this.routeTree) {
				this.routeTree = this.options.routeTree;
				let e;
				if ((Y ?? this.isServer) && process.env.NODE_ENV !== "development" && globalThis.__TSR_CACHE__ && globalThis.__TSR_CACHE__.routeTree === this.routeTree) {
					let t = globalThis.__TSR_CACHE__;
					this.resolvePathCache = t.resolvePathCache, e = t.processRouteTreeResult;
				} else this.resolvePathCache = Xh(1e3), e = this.buildRouteTree(), (Y ?? this.isServer) && process.env.NODE_ENV !== "development" && globalThis.__TSR_CACHE__ === void 0 && (globalThis.__TSR_CACHE__ = {
					routeTree: this.routeTree,
					processRouteTreeResult: e,
					resolvePathCache: this.resolvePathCache
				});
				this.setRoutes(e);
			}
			!this.__store && this.latestLocation && (Y ?? this.isServer ? this.__store = D_(N_(this.latestLocation)) : (this.__store = fh(N_(this.latestLocation)), Vg(this)));
			let a = !1, o = this.options.basepath ?? "/", s = this.options.rewrite;
			if (r || n !== o || i !== s) {
				this.basepath = o;
				let e = [], t = Cg(o);
				t && t !== "/" && e.push(S_({ basepath: o })), s && e.push(s), this.rewrite = e.length === 0 ? void 0 : e.length === 1 ? e[0] : x_(e), this.history && this.updateLatestLocation(), a = !0;
			}
			a && this.__store && this.__store.setState((e) => ({
				...e,
				location: this.latestLocation
			})), typeof window < "u" && "CSS" in window && typeof window.CSS?.supports == "function" && (this.isViewTransitionTypesSupported = window.CSS.supports("selector(:active-view-transition-type(a)"));
		}, this.updateLatestLocation = () => {
			this.latestLocation = this.parseLocation(this.history.location, this.latestLocation);
		}, this.buildRouteTree = () => {
			let e = dg(this.routeTree, this.options.caseSensitive, (e, t) => {
				e.init({ originalIndex: t });
			});
			return this.options.routeMasks && og(this.options.routeMasks, e.processedTree), e;
		}, this.subscribe = (e, t) => {
			let n = {
				eventType: e,
				fn: t
			};
			return this.subscribers.add(n), () => {
				this.subscribers.delete(n);
			};
		}, this.emit = (e) => {
			this.subscribers.forEach((t) => {
				t.eventType === e.type && t.fn(e);
			});
		}, this.parseLocation = (e, t) => {
			let n = ({ pathname: e, search: n, hash: r, href: i, state: a }) => {
				if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(e)) {
					let o = this.options.parseSearch(n), s = this.options.stringifySearch(o);
					return {
						href: e + s + r,
						publicHref: i,
						pathname: Gh(e).path,
						external: !1,
						searchStr: s,
						search: jh(t?.search, o),
						hash: Gh(r.slice(1)).path,
						state: Mh(t?.state, a)
					};
				}
				let o = new URL(i, this.origin), s = C_(this.rewrite, o), c = this.options.parseSearch(s.search), l = this.options.stringifySearch(c);
				return s.search = l, {
					href: s.href.replace(s.origin, ""),
					publicHref: i,
					pathname: Gh(s.pathname).path,
					external: !!this.rewrite && s.origin !== this.origin,
					searchStr: l,
					search: jh(t?.search, c),
					hash: Gh(s.hash.slice(1)).path,
					state: Mh(t?.state, a)
				};
			}, r = n(e), { __tempLocation: i, __tempKey: a } = r.state;
			if (i && (!a || a === this.tempLocationKey)) {
				let e = n(i);
				return e.state.key = r.state.key, e.state.__TSR_key = r.state.__TSR_key, delete e.state.__tempLocation, {
					...e,
					maskedLocation: r
				};
			}
			return r;
		}, this.resolvePathWithBase = (e, t) => Eg({
			base: e,
			to: bg(t),
			trailingSlash: this.options.trailingSlash,
			cache: this.resolvePathCache
		}), this.matchRoutes = (e, t, n) => typeof e == "string" ? this.matchRoutesInternal({
			pathname: e,
			search: t
		}, n) : this.matchRoutesInternal(e, t), this.getMatchedRoutes = (e) => F_({
			pathname: e,
			routesById: this.routesById,
			processedTree: this.processedTree
		}), this.cancelMatch = (e) => {
			let t = this.getMatch(e);
			t && (t.abortController.abort(), clearTimeout(t._nonReactive.pendingTimeout), t._nonReactive.pendingTimeout = void 0);
		}, this.cancelMatches = () => {
			let e = this.state.matches.filter((e) => e.status === "pending"), t = this.state.matches.filter((e) => e.isFetching === "loader");
			(/* @__PURE__ */ new Set([
				...this.state.pendingMatches ?? [],
				...e,
				...t
			])).forEach((e) => {
				this.cancelMatch(e.id);
			});
		}, this.buildLocation = (e) => {
			let t = (t = {}) => {
				let n = t._fromLocation || this.pendingBuiltLocation || this.latestLocation, r = this.matchRoutesLightweight(n);
				if (t.from && process.env.NODE_ENV !== "production" && t._isNavigate) {
					let e = this.getMatchedRoutes(t.from).matchedRoutes, n = Bh(r.matchedRoutes, (e) => M_(e.fullPath, t.from)), i = Bh(e, (e) => M_(e.fullPath, r.fullPath));
					!n && !i && console.warn(`Could not find match for from: ${t.from}`);
				}
				let i = t.unsafeRelative === "path" ? n.pathname : t.from ?? r.fullPath, a = this.resolvePathWithBase(i, "."), o = r.search, s = Object.assign(/* @__PURE__ */ Object.create(null), r.params), c = t.to ? this.resolvePathWithBase(a, `${t.to}`) : this.resolvePathWithBase(a, "."), l = t.params === !1 || t.params === null ? /* @__PURE__ */ Object.create(null) : (t.params ?? !0) === !0 ? s : Object.assign(s, Dh(t.params, s)), u = this.getMatchedRoutes(c), d = u.matchedRoutes;
				if ((!u.foundRoute || u.foundRoute.path !== "/" && u.routeParams["**"]) && this.options.notFoundRoute && (d = [...d, this.options.notFoundRoute]), Object.keys(l).length > 0) for (let e of d) {
					let t = e.options.params?.stringify ?? e.options.stringifyParams;
					if (t) try {
						Object.assign(l, t(l));
					} catch {}
				}
				let f = e.leaveParams ? c : Gh(kg({
					path: c,
					params: l,
					decoder: this.pathParamsDecoder,
					server: this.isServer
				}).interpolatedPath).path, p = o;
				if (e._includeValidateSearch && this.options.search?.strict) {
					let e = {};
					d.forEach((t) => {
						if (t.options.validateSearch) try {
							Object.assign(e, P_(t.options.validateSearch, {
								...e,
								...p
							}));
						} catch {}
					}), p = e;
				}
				p = I_({
					search: p,
					dest: t,
					destRoutes: d,
					_includeValidateSearch: e._includeValidateSearch
				}), p = jh(o, p);
				let m = this.options.stringifySearch(p), h = t.hash === !0 ? n.hash : t.hash ? Dh(t.hash, n.hash) : void 0, g = h ? `#${h}` : "", _ = t.state === !0 ? n.state : t.state ? Dh(t.state, n.state) : {};
				_ = Mh(n.state, _);
				let v = `${f}${m}${g}`, y, b, x = !1;
				if (this.rewrite) {
					let e = new URL(v, this.origin), t = w_(this.rewrite, e);
					y = e.href.replace(e.origin, ""), t.origin === this.origin ? b = t.pathname + t.search + t.hash : (b = t.href, x = !0);
				} else y = Kh(v), b = y;
				return {
					publicHref: b,
					href: y,
					pathname: f,
					search: p,
					searchStr: m,
					state: _,
					hash: h ?? "",
					external: x,
					unmaskOnReload: t.unmaskOnReload
				};
			}, n = (n = {}, r) => {
				let i = t(n), a = r ? t(r) : void 0;
				if (!a) {
					let n = /* @__PURE__ */ Object.create(null);
					if (this.options.routeMasks) {
						let o = sg(i.pathname, this.processedTree);
						if (o) {
							Object.assign(n, o.rawParams);
							let { from: i, params: s, ...c } = o.route, l = s === !1 || s === null ? /* @__PURE__ */ Object.create(null) : (s ?? !0) === !0 ? n : Object.assign(n, Dh(s, n));
							r = {
								from: e.from,
								...c,
								params: l
							}, a = t(r);
						}
					}
				}
				return a && (i.maskedLocation = a), i;
			};
			return e.mask ? n(e, {
				from: e.from,
				...e.mask
			}) : n(e);
		}, this.commitLocation = async ({ viewTransition: e, ignoreBlocker: t, ...n }) => {
			let r = () => {
				let e = [
					"key",
					"__TSR_key",
					"__TSR_index",
					"__hashScrollIntoViewOptions"
				];
				e.forEach((e) => {
					n.state[e] = this.latestLocation.state[e];
				});
				let t = Lh(n.state, this.latestLocation.state);
				return e.forEach((e) => {
					delete n.state[e];
				}), t;
			}, i = Sg(this.latestLocation.href) === Sg(n.href), a = this.commitLocationPromise;
			if (this.commitLocationPromise = Rh(() => {
				a?.resolve();
			}), i && r()) this.load();
			else {
				let { maskedLocation: r, hashScrollIntoView: i, ...a } = n;
				r && (a = {
					...r,
					state: {
						...r.state,
						__tempKey: void 0,
						__tempLocation: {
							...a,
							search: a.searchStr,
							state: {
								...a.state,
								__tempKey: void 0,
								__tempLocation: void 0,
								__TSR_key: void 0,
								key: void 0
							}
						}
					}
				}, (a.unmaskOnReload ?? this.options.unmaskOnReload ?? !1) && (a.state.__tempKey = this.tempLocationKey)), a.state.__hashScrollIntoViewOptions = i ?? this.options.defaultHashScrollIntoView ?? !0, this.shouldViewTransition = e, this.history[n.replace ? "replace" : "push"](a.publicHref, a.state, { ignoreBlocker: t });
			}
			return this.resetNextScroll = n.resetScroll ?? !0, this.history.subscribers.size || this.load(), this.commitLocationPromise;
		}, this.buildAndCommitLocation = ({ replace: e, resetScroll: t, hashScrollIntoView: n, viewTransition: r, ignoreBlocker: i, href: a, ...o } = {}) => {
			if (a) {
				let t = this.history.location.state.__TSR_index, n = Sh(a, { __TSR_index: e ? t : t + 1 }), r = new URL(n.pathname, this.origin);
				o.to = C_(this.rewrite, r).pathname, o.search = this.options.parseSearch(n.search), o.hash = n.hash.slice(1);
			}
			let s = this.buildLocation({
				...o,
				_includeValidateSearch: !0
			});
			this.pendingBuiltLocation = s;
			let c = this.commitLocation({
				...s,
				viewTransition: r,
				replace: e,
				resetScroll: t,
				hashScrollIntoView: n,
				ignoreBlocker: i
			});
			return Promise.resolve().then(() => {
				this.pendingBuiltLocation === s && (this.pendingBuiltLocation = void 0);
			}), c;
		}, this.navigate = async ({ to: e, reloadDocument: t, href: n, publicHref: r, ...i }) => {
			let a = !1;
			if (n) try {
				new URL(`${n}`), a = !0;
			} catch {}
			if (a && !t && (t = !0), t) {
				if (e !== void 0 || !n) {
					let t = this.buildLocation({
						to: e,
						...i
					});
					n ??= t.publicHref, r ??= t.publicHref;
				}
				let t = !a && r ? r : n;
				if (Wh(t, this.protocolAllowlist)) return process.env.NODE_ENV !== "production" && console.warn(`Blocked navigation to dangerous protocol: ${t}`), Promise.resolve();
				if (!i.ignoreBlocker) {
					let e = this.history.getBlockers?.() ?? [];
					for (let t of e) if (t?.blockerFn && await t.blockerFn({
						currentLocation: this.latestLocation,
						nextLocation: this.latestLocation,
						action: "PUSH"
					})) return Promise.resolve();
				}
				return i.replace ? window.location.replace(t) : window.location.href = t, Promise.resolve();
			}
			return this.buildAndCommitLocation({
				...i,
				href: n,
				to: e,
				_isNavigate: !0
			});
		}, this.beforeLoad = () => {
			if (this.cancelMatches(), this.updateLatestLocation(), Y ?? this.isServer) {
				let e = this.buildLocation({
					to: this.latestLocation.pathname,
					search: !0,
					params: !0,
					hash: !0,
					state: !0,
					_includeValidateSearch: !0
				});
				if (this.latestLocation.publicHref !== e.publicHref) {
					let t = this.getParsedLocationHref(e);
					throw e.external ? Xg({ href: t }) : Xg({
						href: t,
						_builtLocation: e
					});
				}
			}
			let e = this.matchRoutes(this.latestLocation);
			this.__store.setState((t) => ({
				...t,
				status: "pending",
				statusCode: 200,
				isLoading: !0,
				location: this.latestLocation,
				pendingMatches: e,
				cachedMatches: t.cachedMatches.filter((t) => !e.some((e) => e.id === t.id))
			}));
		}, this.load = async (e) => {
			let t, n, r, i = this.state.resolvedLocation ?? this.state.location;
			for (r = new Promise((a) => {
				this.startTransition(async () => {
					try {
						this.beforeLoad();
						let t = this.latestLocation, n = this.state.resolvedLocation;
						this.state.redirect || this.emit({
							type: "onBeforeNavigate",
							...T_({
								resolvedLocation: n,
								location: t
							})
						}), this.emit({
							type: "onBeforeLoad",
							...T_({
								resolvedLocation: n,
								location: t
							})
						}), await h_({
							router: this,
							sync: e?.sync,
							forceStaleReload: i.href === t.href,
							matches: this.state.pendingMatches,
							location: t,
							updateMatch: this.updateMatch,
							onReady: async () => {
								this.startTransition(() => {
									this.startViewTransition(async () => {
										let e = [], t = [], n = [], r = [];
										wh(() => {
											this.__store.setState((i) => {
												let a = i.matches, o = i.pendingMatches || i.matches;
												return e = a.filter((e) => !o.some((t) => t.id === e.id)), t = a.filter((e) => !o.some((t) => t.routeId === e.routeId)), n = o.filter((e) => !a.some((t) => t.routeId === e.routeId)), r = o.filter((e) => a.some((t) => t.routeId === e.routeId)), {
													...i,
													isLoading: !1,
													loadedAt: Date.now(),
													matches: o,
													pendingMatches: void 0,
													cachedMatches: [...i.cachedMatches, ...e.filter((e) => e.status !== "error" && e.status !== "notFound" && e.status !== "redirected")]
												};
											}), this.clearExpiredCache();
										}), [
											[t, "onLeave"],
											[n, "onEnter"],
											[r, "onStay"]
										].forEach(([e, t]) => {
											e.forEach((e) => {
												this.looseRoutesById[e.routeId].options[t]?.(e);
											});
										});
									});
								});
							}
						});
					} catch (e) {
						Zg(e) ? (t = e, (Y ?? this.isServer) || this.navigate({
							...t.options,
							replace: !0,
							ignoreBlocker: !0
						})) : jg(e) && (n = e), this.__store.setState((e) => ({
							...e,
							statusCode: t ? t.status : n ? 404 : e.matches.some((e) => e.status === "error") ? 500 : 200,
							redirect: t
						}));
					}
					this.latestLoadPromise === r && (this.commitLocationPromise?.resolve(), this.latestLoadPromise = void 0, this.commitLocationPromise = void 0), a();
				});
			}), this.latestLoadPromise = r, await r; this.latestLoadPromise && r !== this.latestLoadPromise;) await this.latestLoadPromise;
			let a;
			this.hasNotFoundMatch() ? a = 404 : this.__store.state.matches.some((e) => e.status === "error") && (a = 500), a !== void 0 && this.__store.setState((e) => ({
				...e,
				statusCode: a
			}));
		}, this.startViewTransition = (e) => {
			let t = this.shouldViewTransition ?? this.options.defaultViewTransition;
			if (this.shouldViewTransition = void 0, t && typeof document < "u" && "startViewTransition" in document && typeof document.startViewTransition == "function") {
				let n;
				if (typeof t == "object" && this.isViewTransitionTypesSupported) {
					let r = this.latestLocation, i = this.state.resolvedLocation, a = typeof t.types == "function" ? t.types(T_({
						resolvedLocation: i,
						location: r
					})) : t.types;
					if (a === !1) {
						e();
						return;
					}
					n = {
						update: e,
						types: a
					};
				} else n = e;
				document.startViewTransition(n);
			} else e();
		}, this.updateMatch = (e, t) => {
			this.startTransition(() => {
				let n = this.state.pendingMatches?.some((t) => t.id === e) ? "pendingMatches" : this.state.matches.some((t) => t.id === e) ? "matches" : this.state.cachedMatches.some((t) => t.id === e) ? "cachedMatches" : "";
				n && (n === "cachedMatches" ? this.__store.setState((n) => ({
					...n,
					cachedMatches: E_(n.cachedMatches.map((n) => n.id === e ? t(n) : n))
				})) : this.__store.setState((r) => ({
					...r,
					[n]: r[n]?.map((n) => n.id === e ? t(n) : n)
				})));
			});
		}, this.getMatch = (e) => {
			let t = (t) => t.id === e;
			return this.state.cachedMatches.find(t) ?? this.state.pendingMatches?.find(t) ?? this.state.matches.find(t);
		}, this.invalidate = (e) => {
			let t = (t) => e?.filter?.(t) ?? !0 ? {
				...t,
				invalid: !0,
				...e?.forcePending || t.status === "error" || t.status === "notFound" ? {
					status: "pending",
					error: void 0
				} : void 0
			} : t;
			return this.__store.setState((e) => ({
				...e,
				matches: e.matches.map(t),
				cachedMatches: e.cachedMatches.map(t),
				pendingMatches: e.pendingMatches?.map(t)
			})), this.shouldViewTransition = !1, this.load({ sync: e?.sync });
		}, this.getParsedLocationHref = (e) => e.publicHref || "/", this.resolveRedirect = (e) => {
			let t = e.headers.get("Location");
			if (!e.options.href || e.options._builtLocation) {
				let t = e.options._builtLocation ?? this.buildLocation(e.options), n = this.getParsedLocationHref(t);
				e.options.href = n, e.headers.set("Location", n);
			} else if (t) try {
				let n = new URL(t);
				if (this.origin && n.origin === this.origin) {
					let t = n.pathname + n.search + n.hash;
					e.options.href = t, e.headers.set("Location", t);
				}
			} catch {}
			if (e.options.href && !e.options._builtLocation && Wh(e.options.href, this.protocolAllowlist)) throw Error(process.env.NODE_ENV === "production" ? "Redirect blocked: unsafe protocol" : `Redirect blocked: unsafe protocol in href "${e.options.href}". Allowed protocols: ${Array.from(this.protocolAllowlist).join(", ")}.`);
			return e.headers.get("Location") || e.headers.set("Location", e.options.href), e;
		}, this.clearCache = (e) => {
			let t = e?.filter;
			t === void 0 ? this.__store.setState((e) => ({
				...e,
				cachedMatches: []
			})) : this.__store.setState((e) => ({
				...e,
				cachedMatches: e.cachedMatches.filter((e) => !t(e))
			}));
		}, this.clearExpiredCache = () => {
			this.clearCache({ filter: (e) => {
				let t = this.looseRoutesById[e.routeId];
				if (!t.options.loader) return !0;
				let n = (e.preload ? t.options.preloadGcTime ?? this.options.defaultPreloadGcTime : t.options.gcTime ?? this.options.defaultGcTime) ?? 300 * 1e3;
				return e.status === "error" ? !0 : Date.now() - e.updatedAt >= n;
			} });
		}, this.loadRouteChunk = __, this.preloadRoute = async (e) => {
			let t = e._builtLocation ?? this.buildLocation(e), n = this.matchRoutes(t, {
				throwOnError: !0,
				preload: !0,
				dest: e
			}), r = new Set([...this.state.matches, ...this.state.pendingMatches ?? []].map((e) => e.id)), i = /* @__PURE__ */ new Set([...r, ...this.state.cachedMatches.map((e) => e.id)]);
			wh(() => {
				n.forEach((e) => {
					i.has(e.id) || this.__store.setState((t) => ({
						...t,
						cachedMatches: [...t.cachedMatches, e]
					}));
				});
			});
			try {
				return n = await h_({
					router: this,
					matches: n,
					location: t,
					preload: !0,
					updateMatch: (e, t) => {
						r.has(e) ? n = n.map((n) => n.id === e ? t(n) : n) : this.updateMatch(e, t);
					}
				}), n;
			} catch (e) {
				if (Zg(e)) return e.options.reloadDocument ? void 0 : await this.preloadRoute({
					...e.options,
					_fromLocation: t
				});
				jg(e) || console.error(e);
				return;
			}
		}, this.matchRoute = (e, t) => {
			let n = {
				...e,
				to: e.to ? this.resolvePathWithBase(e.from || "", e.to) : void 0,
				params: e.params || {},
				leaveParams: !0
			}, r = this.buildLocation(n);
			if (t?.pending && this.state.status !== "pending") return !1;
			let i = (t?.pending === void 0 ? !this.state.isLoading : t.pending) ? this.latestLocation : this.state.resolvedLocation || this.state.location, a = cg(r.pathname, t?.caseSensitive ?? !1, t?.fuzzy ?? !1, i.pathname, this.processedTree);
			return !a || e.params && !Lh(a.rawParams, e.params, { partial: !0 }) ? !1 : t?.includeSearch ?? !0 ? Lh(i.search, r.search, { partial: !0 }) ? a.rawParams : !1 : a.rawParams;
		}, this.hasNotFoundMatch = () => this.__store.state.matches.some((e) => e.status === "notFound" || e.globalNotFound), this.update({
			defaultPreloadDelay: 50,
			defaultPendingMs: 1e3,
			defaultPendingMinMs: 500,
			context: void 0,
			...e,
			caseSensitive: e.caseSensitive ?? !1,
			notFoundMode: e.notFoundMode ?? "fuzzy",
			stringifySearch: e.stringifySearch ?? Kg,
			parseSearch: e.parseSearch ?? Gg,
			protocolAllowlist: e.protocolAllowlist ?? Uh
		}), typeof document < "u" && (self.__TSR_ROUTER__ = this);
	}
	isShell() {
		return !!this.options.isShell;
	}
	isPrerendering() {
		return !!this.options.isPrerendering;
	}
	get state() {
		return this.__store.state;
	}
	setRoutes({ routesById: e, routesByPath: t, processedTree: n }) {
		this.routesById = e, this.routesByPath = t, this.processedTree = n;
		let r = this.options.notFoundRoute;
		r && (r.init({ originalIndex: 99999999999 }), this.routesById[r.id] = r);
	}
	get looseRoutesById() {
		return this.routesById;
	}
	getParentContext(e) {
		return e?.id ? e.context ?? this.options.context ?? void 0 : this.options.context ?? void 0;
	}
	matchRoutesInternal(e, t) {
		let n = this.getMatchedRoutes(e.pathname), { foundRoute: r, routeParams: i, parsedParams: a } = n, { matchedRoutes: o } = n, s = !1;
		(r ? r.path !== "/" && i["**"] : Sg(e.pathname)) && (this.options.notFoundRoute ? o = [...o, this.options.notFoundRoute] : s = !0);
		let c = s ? R_(this.options.notFoundMode, o) : void 0, l = Array(o.length), u = new Map(this.state.matches.map((e) => [e.routeId, e]));
		for (let n = 0; n < o.length; n++) {
			let r = o[n], s = l[n - 1], d, f, p;
			{
				let n = s?.search ?? e.search, i = s?._strictSearch ?? void 0;
				try {
					let e = P_(r.options.validateSearch, { ...n }) ?? void 0;
					d = {
						...n,
						...e
					}, f = {
						...i,
						...e
					}, p = void 0;
				} catch (e) {
					let r = e;
					if (e instanceof k_ || (r = new k_(e.message, { cause: e })), t?.throwOnError) throw r;
					d = n, f = {}, p = r;
				}
			}
			let m = r.options.loaderDeps?.({ search: d }) ?? "", h = m ? JSON.stringify(m) : "", { interpolatedPath: g, usedParams: _ } = kg({
				path: r.fullPath,
				params: i,
				decoder: this.pathParamsDecoder,
				server: this.isServer
			}), v = r.id + g + h, y = this.getMatch(v), b = u.get(r.id), x = y?._strictParams ?? _, S;
			if (!y) try {
				z_(r, _, a, x);
			} catch (e) {
				if (S = jg(e) || Zg(e) ? e : new A_(e.message, { cause: e }), t?.throwOnError) throw S;
			}
			Object.assign(i, x);
			let C = b ? "stay" : "enter", w;
			if (y) w = {
				...y,
				cause: C,
				params: b?.params ?? i,
				_strictParams: x,
				search: jh(b ? b.search : y.search, d),
				_strictSearch: f
			};
			else {
				let e = r.options.loader || r.options.beforeLoad || r.lazyFn || y_(r) ? "pending" : "success";
				w = {
					id: v,
					ssr: Y ?? this.isServer ? void 0 : r.options.ssr,
					index: n,
					routeId: r.id,
					params: b?.params ?? i,
					_strictParams: x,
					pathname: g,
					updatedAt: Date.now(),
					search: b ? jh(b.search, d) : d,
					_strictSearch: f,
					searchError: void 0,
					status: e,
					isFetching: !1,
					error: void 0,
					paramsError: S,
					__routeContext: void 0,
					_nonReactive: { loadPromise: Rh() },
					__beforeLoadContext: void 0,
					context: {},
					abortController: new AbortController(),
					fetchCount: 0,
					cause: C,
					loaderDeps: b ? Mh(b.loaderDeps, m) : m,
					invalid: !1,
					preload: !1,
					links: void 0,
					scripts: void 0,
					headScripts: void 0,
					meta: void 0,
					staticData: r.options.staticData || {},
					fullPath: r.fullPath
				};
			}
			t?.preload || (w.globalNotFound = c === r.id), w.searchError = p;
			let T = this.getParentContext(s);
			w.context = {
				...T,
				...w.__routeContext,
				...w.__beforeLoadContext
			}, l[n] = w;
		}
		for (let t = 0; t < l.length; t++) {
			let n = l[t], r = this.looseRoutesById[n.routeId], a = this.getMatch(n.id), o = u.get(n.routeId);
			if (n.params = o ? jh(o.params, i) : i, !a) {
				let i = l[t - 1], a = this.getParentContext(i);
				if (r.options.context) {
					let t = {
						deps: n.loaderDeps,
						params: n.params,
						context: a ?? {},
						location: e,
						navigate: (t) => this.navigate({
							...t,
							_fromLocation: e
						}),
						buildLocation: this.buildLocation,
						cause: n.cause,
						abortController: n.abortController,
						preload: !!n.preload,
						matches: l,
						routeId: r.id
					};
					n.__routeContext = r.options.context(t) ?? void 0;
				}
				n.context = {
					...a,
					...n.__routeContext,
					...n.__beforeLoadContext
				};
			}
		}
		return l;
	}
	matchRoutesLightweight(e) {
		let { matchedRoutes: t, routeParams: n, parsedParams: r } = this.getMatchedRoutes(e.pathname), i = Th(t), a = { ...e.search };
		for (let e of t) try {
			Object.assign(a, P_(e.options.validateSearch, a));
		} catch {}
		let o = Th(this.state.matches), s = o && o.routeId === i.id && e.pathname === this.state.location.pathname, c;
		if (s) c = o.params;
		else {
			let e = Object.assign(/* @__PURE__ */ Object.create(null), n);
			for (let i of t) try {
				z_(i, n, r ?? {}, e);
			} catch {}
			c = e;
		}
		return {
			matchedRoutes: t,
			fullPath: i.fullPath,
			search: a,
			params: c
		};
	}
}, k_ = class extends Error {}, A_ = class extends Error {}, j_ = (e) => e.endsWith("/") && e.length > 1 ? e.slice(0, -1) : e;
function M_(e, t) {
	return j_(e) === j_(t);
}
function N_(e) {
	return {
		loadedAt: 0,
		isLoading: !1,
		isTransitioning: !1,
		status: "idle",
		resolvedLocation: void 0,
		location: e,
		matches: [],
		pendingMatches: [],
		cachedMatches: [],
		statusCode: 200
	};
}
function P_(e, t) {
	if (e == null) return {};
	if ("~standard" in e) {
		let n = e["~standard"].validate(t);
		if (n instanceof Promise) throw new k_("Async validation not supported");
		if (n.issues) throw new k_(JSON.stringify(n.issues, void 0, 2), { cause: n });
		return n.value;
	}
	return "parse" in e ? e.parse(t) : typeof e == "function" ? e(t) : {};
}
function F_({ pathname: e, routesById: t, processedTree: n }) {
	let r = /* @__PURE__ */ Object.create(null), i = Sg(e), a, o, s = lg(i, n, !0);
	return s && (a = s.route, Object.assign(r, s.rawParams), o = Object.assign(/* @__PURE__ */ Object.create(null), s.parsedParams)), {
		matchedRoutes: s?.branch || [t.__root__],
		routeParams: r,
		foundRoute: a,
		parsedParams: o
	};
}
function I_({ search: e, dest: t, destRoutes: n, _includeValidateSearch: r }) {
	return L_(n)(e, t, r ?? !1);
}
function L_(e) {
	let t = {
		dest: null,
		_includeValidateSearch: !1,
		middlewares: []
	};
	for (let n of e) "search" in n.options ? n.options.search?.middlewares && t.middlewares.push(...n.options.search.middlewares) : (n.options.preSearchFilters || n.options.postSearchFilters) && t.middlewares.push(({ search: e, next: t }) => {
		let r = e;
		"preSearchFilters" in n.options && n.options.preSearchFilters && (r = n.options.preSearchFilters.reduce((e, t) => t(e), e));
		let i = t(r);
		return "postSearchFilters" in n.options && n.options.postSearchFilters ? n.options.postSearchFilters.reduce((e, t) => t(e), i) : i;
	}), n.options.validateSearch && t.middlewares.push(({ search: e, next: r }) => {
		let i = r(e);
		if (!t._includeValidateSearch) return i;
		try {
			return {
				...i,
				...P_(n.options.validateSearch, i) ?? void 0
			};
		} catch {
			return i;
		}
	});
	t.middlewares.push(({ search: e }) => {
		let n = t.dest;
		return n.search ? n.search === !0 ? e : Dh(n.search, e) : {};
	});
	let n = (e, t, r) => {
		if (e >= r.length) return t;
		let i = r[e];
		return i({
			search: t,
			next: (t) => n(e + 1, t, r)
		});
	};
	return function(e, r, i) {
		return t.dest = r, t._includeValidateSearch = i, n(0, e, t.middlewares);
	};
}
function R_(e, t) {
	if (e !== "root") for (let e = t.length - 1; e >= 0; e--) {
		let n = t[e];
		if (n.children) return n.id;
	}
	return Yg;
}
function z_(e, t, n, r) {
	let i = e.options.params?.parse ?? e.options.parseParams;
	if (i) if (e.options.skipRouteOnParseError) for (let e in t) e in n && (r[e] = n[e]);
	else {
		let e = i(r);
		Object.assign(r, e);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+router-core@1.166.7/node_modules/@tanstack/router-core/dist/esm/link.js
var B_ = "Error preloading route! ☝️", V_ = class {
	constructor(e) {
		if (this.init = (e) => {
			this.originalIndex = e.originalIndex;
			let t = this.options, n = !t?.path && !t?.id;
			this.parentRoute = this.options.getParentRoute?.(), n ? this._path = Yg : this.parentRoute || Yh(!1, "Child Route instances must pass a 'getParentRoute: () => ParentRoute' option that returns a Route instance.");
			let r = n ? Yg : t?.path;
			r && r !== "/" && (r = xg(r));
			let i = t?.id || r, a = n ? Yg : yg([this.parentRoute.id === "__root__" ? "" : this.parentRoute.id, i]);
			r === "__root__" && (r = "/"), a !== "__root__" && (a = yg(["/", a]));
			let o = a === "__root__" ? "/" : yg([this.parentRoute.fullPath, r]);
			this._path = r, this._id = a, this._fullPath = o, this._to = Sg(o);
		}, this.addChildren = (e) => this._addFileChildren(e), this._addFileChildren = (e) => (Array.isArray(e) && (this.children = e), typeof e == "object" && e && (this.children = Object.values(e)), this), this._addFileTypes = () => this, this.updateLoader = (e) => (Object.assign(this.options, e), this), this.update = (e) => (Object.assign(this.options, e), this), this.lazy = (e) => (this.lazyFn = e, this), this.redirect = (e) => Xg({
			from: this.fullPath,
			...e
		}), this.options = e || {}, this.isRoot = !e?.getParentRoute, e?.id && e?.path) throw Error("Route cannot have both an 'id' and a 'path' option.");
	}
	get to() {
		return this._to;
	}
	get id() {
		return this._id;
	}
	get path() {
		return this._path;
	}
	get fullPath() {
		return this._fullPath;
	}
}, H_ = class extends V_ {
	constructor(e) {
		super(e);
	}
}, U_ = /* @__PURE__ */ A(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), W_ = /* @__PURE__ */ A(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.iterator;
	function m(e) {
		return typeof e != "object" || !e ? null : (e = p && e[p] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var h = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, g = Object.assign, _ = {};
	function v(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	v.prototype.isReactComponent = {}, v.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, v.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function y() {}
	y.prototype = v.prototype;
	function b(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	var x = b.prototype = new y();
	x.constructor = b, g(x, v.prototype), x.isPureReactComponent = !0;
	var S = Array.isArray;
	function C() {}
	var w = {
		H: null,
		A: null,
		T: null,
		S: null
	}, T = Object.prototype.hasOwnProperty;
	function E(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function ee(e, t) {
		return E(e.type, t, e.props);
	}
	function D(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function te(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var ne = /\/+/g;
	function re(e, t) {
		return typeof e == "object" && e && e.key != null ? te("" + e.key) : t.toString(36);
	}
	function ie(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(C, C) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function O(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, O(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + re(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(ne, "$&/") + "/"), O(o, r, i, "", function(e) {
			return e;
		})) : o != null && (D(o) && (o = ee(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ne, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + re(a, u), c += O(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + re(a, u++), c += O(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return O(ie(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ae(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return O(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function oe(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var k = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, se = {
		map: ae,
		forEach: function(e, t, n) {
			ae(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ae(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ae(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!D(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = se, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return w.H.useMemoCache(e);
		}
	}, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = g({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !T.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return E(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) T.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return E(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = D, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: oe
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = w.T, n = {};
		w.T = n;
		try {
			var r = e(), i = w.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, k);
		} catch (e) {
			k(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), w.T = t;
		}
	}, e.unstable_useCacheRefresh = function() {
		return w.H.useCacheRefresh();
	}, e.use = function(e) {
		return w.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return w.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return w.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return w.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return w.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return w.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return w.H.useEffectEvent(e);
	}, e.useId = function() {
		return w.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return w.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return w.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return w.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return w.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return w.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return w.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return w.H.useRef(e);
	}, e.useState = function(e) {
		return w.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return w.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return w.H.useTransition();
	}, e.version = "19.2.4";
})), G_ = /* @__PURE__ */ A(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = M && e[M] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			ge[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), ge[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = ye, this.updater = n || _e;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = ye, this.updater = n || _e;
		}
		function c() {}
		function l(e) {
			return "" + e;
		}
		function u(e) {
			try {
				l(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var n = t.error, r = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return n.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", r), l(e);
			}
		}
		function d(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === Se ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case se: return "Fragment";
				case le: return "Profiler";
				case ce: return "StrictMode";
				case pe: return "Suspense";
				case A: return "SuspenseList";
				case he: return "Activity";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case k: return "Portal";
				case de: return e.displayName || "Context";
				case ue: return (e._context.displayName || "Context") + ".Consumer";
				case fe:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case j: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case me:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === se) return "<>";
			if (typeof e == "object" && e && e.$$typeof === me) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = N.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Ce.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				P || (P = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function _() {
			var e = d(this.type);
			return Ee[e] || (Ee[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function v(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: oe,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: _
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function y(e, t) {
			return t = v(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function b(e) {
			x(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === me && (e._payload.status === "fulfilled" ? x(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function x(e) {
			return typeof e == "object" && !!e && e.$$typeof === oe;
		}
		function S(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function C(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), S("" + e.key)) : t.toString(36);
		}
		function w(e) {
			switch (e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
				default: switch (typeof e.status == "string" ? e.then(c, c) : (e.status = "pending", e.then(function(t) {
					e.status === "pending" && (e.status = "fulfilled", e.value = t);
				}, function(t) {
					e.status === "pending" && (e.status = "rejected", e.reason = t);
				})), e.status) {
					case "fulfilled": return e.value;
					case "rejected": throw e.reason;
				}
			}
			throw e;
		}
		function T(e, t, n, i, a) {
			var o = typeof e;
			(o === "undefined" || o === "boolean") && (e = null);
			var s = !1;
			if (e === null) s = !0;
			else switch (o) {
				case "bigint":
				case "string":
				case "number":
					s = !0;
					break;
				case "object": switch (e.$$typeof) {
					case oe:
					case k:
						s = !0;
						break;
					case me: return s = e._init, T(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + C(s, 0) : i;
				return xe(a) ? (n = "", c != null && (n = c.replace(ke, "$&/") + "/"), T(a, t, n, "", function(e) {
					return e;
				})) : a != null && (x(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = y(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(ke, "$&/") + "/") + c), i !== "" && s != null && x(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", xe(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + C(i, l), s += T(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (F || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), F = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + C(i, l++), s += T(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return T(w(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function E(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return T(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function ee(e) {
			if (e._status === -1) {
				var t = e._ioInfo;
				t != null && (t.start = t.end = performance.now()), t = e._result;
				var n = t();
				if (n.then(function(t) {
					if (e._status === 0 || e._status === -1) {
						e._status = 1, e._result = t;
						var r = e._ioInfo;
						r != null && (r.end = performance.now()), n.status === void 0 && (n.status = "fulfilled", n.value = t);
					}
				}, function(t) {
					if (e._status === 0 || e._status === -1) {
						e._status = 2, e._result = t;
						var r = e._ioInfo;
						r != null && (r.end = performance.now()), n.status === void 0 && (n.status = "rejected", n.reason = t);
					}
				}), t = e._ioInfo, t != null) {
					t.value = n;
					var r = n.displayName;
					typeof r == "string" && (t.name = r);
				}
				e._status === -1 && (e._status = 0, e._result = n);
			}
			if (e._status === 1) return t = e._result, t === void 0 && console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", t), "default" in t || console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", t), t.default;
			throw e._result;
		}
		function D() {
			var e = N.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function te() {
			N.asyncTransitions--;
		}
		function ne(e) {
			if (Me === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Me = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Me = function(e) {
					!1 === je && (je = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Me(e);
		}
		function re(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function ie(e, t) {
			t !== Ne - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ne = t;
		}
		function O(e, t, n) {
			var r = N.actQueue;
			if (r !== null) if (r.length !== 0) try {
				ae(r), ne(function() {
					return O(e, t, n);
				});
				return;
			} catch (e) {
				N.thrownErrors.push(e);
			}
			else N.actQueue = null;
			0 < N.thrownErrors.length ? (r = re(N.thrownErrors), N.thrownErrors.length = 0, n(r)) : t(e);
		}
		function ae(e) {
			if (!Fe) {
				Fe = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							N.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (N.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), N.thrownErrors.push(n);
				} finally {
					Fe = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var oe = Symbol.for("react.transitional.element"), k = Symbol.for("react.portal"), se = Symbol.for("react.fragment"), ce = Symbol.for("react.strict_mode"), le = Symbol.for("react.profiler"), ue = Symbol.for("react.consumer"), de = Symbol.for("react.context"), fe = Symbol.for("react.forward_ref"), pe = Symbol.for("react.suspense"), A = Symbol.for("react.suspense_list"), j = Symbol.for("react.memo"), me = Symbol.for("react.lazy"), he = Symbol.for("react.activity"), M = Symbol.iterator, ge = {}, _e = {
			isMounted: function() {
				return !1;
			},
			enqueueForceUpdate: function(e) {
				i(e, "forceUpdate");
			},
			enqueueReplaceState: function(e) {
				i(e, "replaceState");
			},
			enqueueSetState: function(e) {
				i(e, "setState");
			}
		}, ve = Object.assign, ye = {};
		Object.freeze(ye), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var be = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Ie in be) be.hasOwnProperty(Ie) && n(Ie, be[Ie]);
		o.prototype = a.prototype, be = s.prototype = new o(), be.constructor = s, ve(be, a.prototype), be.isPureReactComponent = !0;
		var xe = Array.isArray, Se = Symbol.for("react.client.reference"), N = {
			H: null,
			A: null,
			T: null,
			S: null,
			actQueue: null,
			asyncTransitions: 0,
			isBatchingLegacy: !1,
			didScheduleLegacyUpdate: !1,
			didUsePromise: !1,
			thrownErrors: [],
			getCurrentStack: null,
			recentlyCreatedOwnerStacks: 0
		}, Ce = Object.prototype.hasOwnProperty, we = console.createTask ? console.createTask : function() {
			return null;
		};
		be = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var P, Te, Ee = {}, De = be.react_stack_bottom_frame.bind(be, m)(), Oe = we(f(m)), F = !1, ke = /\/+/g, Ae = typeof reportError == "function" ? reportError : function(e) {
			if (typeof window == "object" && typeof window.ErrorEvent == "function") {
				var t = new window.ErrorEvent("error", {
					bubbles: !0,
					cancelable: !0,
					message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
					error: e
				});
				if (!window.dispatchEvent(t)) return;
			} else if (typeof process == "object" && typeof process.emit == "function") {
				process.emit("uncaughtException", e);
				return;
			}
			console.error(e);
		}, je = !1, Me = null, Ne = 0, Pe = !1, Fe = !1, I = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : ne;
		be = Object.freeze({
			__proto__: null,
			c: function(e) {
				return D().useMemoCache(e);
			}
		});
		var Ie = {
			map: E,
			forEach: function(e, t, n) {
				E(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return E(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return E(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!x(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = he, e.Children = Ie, e.Component = a, e.Fragment = se, e.Profiler = le, e.PureComponent = s, e.StrictMode = ce, e.Suspense = pe, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = N, e.__COMPILER_RUNTIME = be, e.act = function(e) {
			var t = N.actQueue, n = Ne;
			Ne++;
			var r = N.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				N.thrownErrors.push(e);
			}
			if (0 < N.thrownErrors.length) throw ie(t, n), e = re(N.thrownErrors), N.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return I(function() {
					i || Pe || (Pe = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (ie(t, n), n === 0) {
							try {
								ae(r), ne(function() {
									return O(i, e, a);
								});
							} catch (e) {
								N.thrownErrors.push(e);
							}
							if (0 < N.thrownErrors.length) {
								var o = re(N.thrownErrors);
								N.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						ie(t, n), 0 < N.thrownErrors.length ? (e = re(N.thrownErrors), N.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (ie(t, n), n === 0 && (ae(r), r.length !== 0 && I(function() {
				i || Pe || (Pe = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), N.actQueue = null), 0 < N.thrownErrors.length) throw e = re(N.thrownErrors), N.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (N.actQueue = r, ne(function() {
					return O(s, e, t);
				})) : e(s);
			} };
		}, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = N.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = ve({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Ce.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Ce.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = v(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) b(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: de,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: ue,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) b(arguments[r]);
			r = {};
			var i = null;
			if (t != null) for (c in Te || !("__self" in t) || "key" in t || (Te = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), i = "" + t.key), t) Ce.call(t, c) && c !== "key" && c !== "__self" && c !== "__source" && (r[c] = t[c]);
			var a = arguments.length - 2;
			if (a === 1) r.children = n;
			else if (1 < a) {
				for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
				Object.freeze && Object.freeze(o), r.children = o;
			}
			if (e && e.defaultProps) for (c in a = e.defaultProps, a) r[c] === void 0 && (r[c] = a[c]);
			i && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e);
			var c = 1e4 > N.recentlyCreatedOwnerStacks++;
			return v(e, i, r, p(), c ? Error("react-stack-top-frame") : De, c ? we(f(e)) : Oe);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === j ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: fe,
				render: e
			}, n;
			return Object.defineProperty(t, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return n;
				},
				set: function(t) {
					n = t, e.name || e.displayName || (Object.defineProperty(e, "name", { value: t }), e.displayName = t);
				}
			}), t;
		}, e.isValidElement = x, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: me,
				_payload: e,
				_init: ee
			}, n = {
				name: "lazy",
				start: -1,
				end: -1,
				value: null,
				owner: null,
				debugStack: Error("react-stack-top-frame"),
				debugTask: console.createTask ? console.createTask("lazy()") : null
			};
			return e._ioInfo = n, t._debugInfo = [{ awaited: n }], t;
		}, e.memo = function(e, t) {
			e ?? console.error("memo: The first argument must be a component. Instead received: %s", e === null ? "null" : typeof e), t = {
				$$typeof: j,
				type: e,
				compare: t === void 0 ? null : t
			};
			var n;
			return Object.defineProperty(t, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return n;
				},
				set: function(t) {
					n = t, e.name || e.displayName || (Object.defineProperty(e, "name", { value: t }), e.displayName = t);
				}
			}), t;
		}, e.startTransition = function(e) {
			var t = N.T, n = {};
			n._updatedFibers = /* @__PURE__ */ new Set(), N.T = n;
			try {
				var r = e(), i = N.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (N.asyncTransitions++, r.then(te, te), r.then(c, Ae));
			} catch (e) {
				Ae(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), N.T = t;
			}
		}, e.unstable_useCacheRefresh = function() {
			return D().useCacheRefresh();
		}, e.use = function(e) {
			return D().use(e);
		}, e.useActionState = function(e, t, n) {
			return D().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return D().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = D();
			return e.$$typeof === ue && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return D().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return D().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), D().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return D().useEffectEvent(e);
		}, e.useId = function() {
			return D().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return D().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), D().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), D().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return D().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return D().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return D().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return D().useRef(e);
		}, e.useState = function(e) {
			return D().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return D().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return D().useTransition();
		}, e.version = "19.2.4", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), K_ = /* @__PURE__ */ A(((e, t) => {
	process.env.NODE_ENV === "production" ? t.exports = W_() : t.exports = G_();
})), q_ = /* @__PURE__ */ A(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === D ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case _: return "Fragment";
				case y: return "Profiler";
				case v: return "StrictMode";
				case C: return "Suspense";
				case w: return "SuspenseList";
				case ee: return "Activity";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case g: return "Portal";
				case x: return e.displayName || "Context";
				case b: return (e._context.displayName || "Context") + ".Consumer";
				case S:
					var n = e.render;
					return e = e.displayName, e ||= (e = n.displayName || n.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case T: return n = e.displayName || null, n === null ? t(e.type) || "Memo" : n;
				case E:
					n = e._payload, e = e._init;
					try {
						return t(e(n));
					} catch {}
			}
			return null;
		}
		function n(e) {
			return "" + e;
		}
		function r(e) {
			try {
				n(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var r = t.error, i = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return r.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", i), n(e);
			}
		}
		function i(e) {
			if (e === _) return "<>";
			if (typeof e == "object" && e && e.$$typeof === E) return "<...>";
			try {
				var n = t(e);
				return n ? "<" + n + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function a() {
			var e = te.A;
			return e === null ? null : e.getOwner();
		}
		function o() {
			return Error("react-stack-top-frame");
		}
		function s(e) {
			if (ne.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function c(e, t) {
			function n() {
				O || (O = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function l() {
			var e = t(this.type);
			return ae[e] || (ae[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function u(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: h,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: l
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function d(e, n, i, o, l, d) {
			var p = n.children;
			if (p !== void 0) if (o) if (re(p)) {
				for (o = 0; o < p.length; o++) f(p[o]);
				Object.freeze && Object.freeze(p);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else f(p);
			if (ne.call(n, "key")) {
				p = t(e);
				var m = Object.keys(n).filter(function(e) {
					return e !== "key";
				});
				o = 0 < m.length ? "{key: someKey, " + m.join(": ..., ") + ": ...}" : "{key: someKey}", se[p + o] || (m = 0 < m.length ? "{" + m.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", o, p, m, p), se[p + o] = !0);
			}
			if (p = null, i !== void 0 && (r(i), p = "" + i), s(n) && (r(n.key), p = "" + n.key), "key" in n) for (var h in i = {}, n) h !== "key" && (i[h] = n[h]);
			else i = n;
			return p && c(i, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), u(e, p, i, a(), l, d);
		}
		function f(e) {
			p(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === E && (e._payload.status === "fulfilled" ? p(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function p(e) {
			return typeof e == "object" && !!e && e.$$typeof === h;
		}
		var m = K_(), h = Symbol.for("react.transitional.element"), g = Symbol.for("react.portal"), _ = Symbol.for("react.fragment"), v = Symbol.for("react.strict_mode"), y = Symbol.for("react.profiler"), b = Symbol.for("react.consumer"), x = Symbol.for("react.context"), S = Symbol.for("react.forward_ref"), C = Symbol.for("react.suspense"), w = Symbol.for("react.suspense_list"), T = Symbol.for("react.memo"), E = Symbol.for("react.lazy"), ee = Symbol.for("react.activity"), D = Symbol.for("react.client.reference"), te = m.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ne = Object.prototype.hasOwnProperty, re = Array.isArray, ie = console.createTask ? console.createTask : function() {
			return null;
		};
		m = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var O, ae = {}, oe = m.react_stack_bottom_frame.bind(m, o)(), k = ie(i(o)), se = {};
		e.Fragment = _, e.jsx = function(e, t, n) {
			var r = 1e4 > te.recentlyCreatedOwnerStacks++;
			return d(e, t, n, !1, r ? Error("react-stack-top-frame") : oe, r ? ie(i(e)) : k);
		}, e.jsxs = function(e, t, n) {
			var r = 1e4 > te.recentlyCreatedOwnerStacks++;
			return d(e, t, n, !0, r ? Error("react-stack-top-frame") : oe, r ? ie(i(e)) : k);
		};
	})();
})), J_ = /* @__PURE__ */ A(((e, t) => {
	process.env.NODE_ENV === "production" ? t.exports = U_() : t.exports = q_();
})), X = /* @__PURE__ */ he(K_(), 1);
X.use, typeof window < "u" ? X.useLayoutEffect : X.useEffect;
function Y_(e, t, n = {}, r = {}) {
	X.useEffect(() => {
		if (!e.current || r.disabled || typeof IntersectionObserver != "function") return;
		let i = new IntersectionObserver(([e]) => {
			t(e);
		}, n);
		return i.observe(e.current), () => {
			i.disconnect();
		};
	}, [
		t,
		n,
		r.disabled,
		e
	]);
}
function X_(e) {
	let t = X.useRef(null);
	return X.useImperativeHandle(e, () => t.current, []), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/ClientOnly.js
var Z_ = J_();
function Q_() {
	return X.useSyncExternalStore($_, () => !0, () => !1);
}
function $_() {
	return () => {};
}
//#endregion
//#region ../../node_modules/.pnpm/tiny-warning@1.0.3/node_modules/tiny-warning/dist/tiny-warning.esm.js
var ev = process.env.NODE_ENV === "production";
function tv(e, t) {
	if (!ev) {
		if (e) return;
		var n = "Warning: " + t;
		typeof console < "u" && console.warn(n);
		try {
			throw Error(n);
		} catch {}
	}
}
//#endregion
//#region ../../node_modules/.pnpm/use-sync-external-store@1.6.0_react@19.2.4/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var nv = /* @__PURE__ */ A(((e) => {
	var t = K_();
	function n(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var r = typeof Object.is == "function" ? Object.is : n, i = t.useState, a = t.useEffect, o = t.useLayoutEffect, s = t.useDebugValue;
	function c(e, t) {
		var n = t(), r = i({ inst: {
			value: n,
			getSnapshot: t
		} }), c = r[0].inst, u = r[1];
		return o(function() {
			c.value = n, c.getSnapshot = t, l(c) && u({ inst: c });
		}, [
			e,
			n,
			t
		]), a(function() {
			return l(c) && u({ inst: c }), e(function() {
				l(c) && u({ inst: c });
			});
		}, [e]), s(n), n;
	}
	function l(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !r(e, n);
		} catch {
			return !0;
		}
	}
	function u(e, t) {
		return t();
	}
	var d = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? u : c;
	e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? d : t.useSyncExternalStore;
})), rv = /* @__PURE__ */ A(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e, t) {
			return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
		}
		function n(e, t) {
			d || a.startTransition === void 0 || (d = !0, console.error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));
			var n = t();
			if (!f) {
				var i = t();
				o(n, i) || (console.error("The result of getSnapshot should be cached to avoid an infinite loop"), f = !0);
			}
			i = s({ inst: {
				value: n,
				getSnapshot: t
			} });
			var p = i[0].inst, m = i[1];
			return l(function() {
				p.value = n, p.getSnapshot = t, r(p) && m({ inst: p });
			}, [
				e,
				n,
				t
			]), c(function() {
				return r(p) && m({ inst: p }), e(function() {
					r(p) && m({ inst: p });
				});
			}, [e]), u(n), n;
		}
		function r(e) {
			var t = e.getSnapshot;
			e = e.value;
			try {
				var n = t();
				return !o(e, n);
			} catch {
				return !0;
			}
		}
		function i(e, t) {
			return t();
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var a = K_(), o = typeof Object.is == "function" ? Object.is : t, s = a.useState, c = a.useEffect, l = a.useLayoutEffect, u = a.useDebugValue, d = !1, f = !1, p = typeof window > "u" || window.document === void 0 || window.document.createElement === void 0 ? i : n;
		e.useSyncExternalStore = a.useSyncExternalStore === void 0 ? p : a.useSyncExternalStore, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), iv = /* @__PURE__ */ A(((e, t) => {
	process.env.NODE_ENV === "production" ? t.exports = nv() : t.exports = rv();
})), av = /* @__PURE__ */ A(((e) => {
	var t = K_(), n = iv();
	function r(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var i = typeof Object.is == "function" ? Object.is : r, a = n.useSyncExternalStore, o = t.useRef, s = t.useEffect, c = t.useMemo, l = t.useDebugValue;
	e.useSyncExternalStoreWithSelector = function(e, t, n, r, u) {
		var d = o(null);
		if (d.current === null) {
			var f = {
				hasValue: !1,
				value: null
			};
			d.current = f;
		} else f = d.current;
		d = c(function() {
			function e(e) {
				if (!a) {
					if (a = !0, o = e, e = r(e), u !== void 0 && f.hasValue) {
						var t = f.value;
						if (u(t, e)) return s = t;
					}
					return s = e;
				}
				if (t = s, i(o, e)) return t;
				var n = r(e);
				return u !== void 0 && u(t, n) ? (o = e, t) : (o = e, s = n);
			}
			var a = !1, o, s, c = n === void 0 ? null : n;
			return [function() {
				return e(t());
			}, c === null ? void 0 : function() {
				return e(c());
			}];
		}, [
			t,
			n,
			r,
			u
		]);
		var p = a(e, d[0], d[1]);
		return s(function() {
			f.hasValue = !0, f.value = p;
		}, [p]), l(p), p;
	};
})), ov = /* @__PURE__ */ A(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e, t) {
			return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var n = K_(), r = iv(), i = typeof Object.is == "function" ? Object.is : t, a = r.useSyncExternalStore, o = n.useRef, s = n.useEffect, c = n.useMemo, l = n.useDebugValue;
		e.useSyncExternalStoreWithSelector = function(e, t, n, r, u) {
			var d = o(null);
			if (d.current === null) {
				var f = {
					hasValue: !1,
					value: null
				};
				d.current = f;
			} else f = d.current;
			d = c(function() {
				function e(e) {
					if (!a) {
						if (a = !0, o = e, e = r(e), u !== void 0 && f.hasValue) {
							var t = f.value;
							if (u(t, e)) return s = t;
						}
						return s = e;
					}
					if (t = s, i(o, e)) return t;
					var n = r(e);
					return u !== void 0 && u(t, n) ? (o = e, t) : (o = e, s = n);
				}
				var a = !1, o, s, c = n === void 0 ? null : n;
				return [function() {
					return e(t());
				}, c === null ? void 0 : function() {
					return e(c());
				}];
			}, [
				t,
				n,
				r,
				u
			]);
			var p = a(e, d[0], d[1]);
			return s(function() {
				f.hasValue = !0, f.value = p;
			}, [p]), l(p), p;
		}, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), sv = (/* @__PURE__ */ A(((e, t) => {
	process.env.NODE_ENV === "production" ? t.exports = av() : t.exports = ov();
})))();
function cv(e, t) {
	return e === t;
}
function lv(e, t, n = cv) {
	let r = (0, X.useCallback)((t) => {
		if (!e) return () => {};
		let { unsubscribe: n } = e.subscribe(t);
		return n;
	}, [e]), i = (0, X.useCallback)(() => e?.get(), [e]);
	return (0, sv.useSyncExternalStoreWithSelector)(r, i, i, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/routerContext.js
var uv = X.createContext(null);
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useRouter.js
function dv(e) {
	let t = X.useContext(uv);
	return tv(!((e?.warn ?? !0) && !t), "useRouter must be used inside a <RouterProvider> component!"), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useRouterState.js
function fv(e) {
	let t = dv({ warn: e?.router === void 0 }), n = e?.router || t;
	if (Y ?? n.isServer) {
		let t = n.state;
		return e?.select ? e.select(t) : t;
	}
	let r = (0, X.useRef)(void 0);
	return lv(n.__store, (t) => {
		if (e?.select) {
			if (e.structuralSharing ?? n.options.defaultStructuralSharing) {
				let n = Mh(r.current, e.select(t));
				return r.current = n, n;
			}
			return e.select(t);
		}
		return t;
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/matchContext.js
var pv = X.createContext(void 0), mv = X.createContext(void 0);
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useMatch.js
function hv(e) {
	let t = X.useContext(e.from ? mv : pv);
	return fv({
		select: (n) => {
			let r = n.matches.find((n) => e.from ? e.from === n.routeId : n.id === t);
			if (Yh(!((e.shouldThrow ?? !0) && !r), `Could not find ${e.from ? `an active match from "${e.from}"` : "a nearest match!"}`), r !== void 0) return e.select ? e.select(r) : r;
		},
		structuralSharing: e.structuralSharing
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useLoaderData.js
function gv(e) {
	return hv({
		from: e.from,
		strict: e.strict,
		structuralSharing: e.structuralSharing,
		select: (t) => e.select ? e.select(t.loaderData) : t.loaderData
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useLoaderDeps.js
function _v(e) {
	let { select: t, ...n } = e;
	return hv({
		...n,
		select: (e) => t ? t(e.loaderDeps) : e.loaderDeps
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useParams.js
function vv(e) {
	return hv({
		from: e.from,
		shouldThrow: e.shouldThrow,
		structuralSharing: e.structuralSharing,
		strict: e.strict,
		select: (t) => {
			let n = e.strict === !1 ? t.params : t._strictParams;
			return e.select ? e.select(n) : n;
		}
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useSearch.js
function yv(e) {
	return hv({
		from: e.from,
		strict: e.strict,
		shouldThrow: e.shouldThrow,
		structuralSharing: e.structuralSharing,
		select: (t) => e.select ? e.select(t.search) : t.search
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useNavigate.js
function bv(e) {
	let t = dv();
	return X.useCallback((n) => t.navigate({
		...n,
		from: n.from ?? e?.from
	}), [e?.from, t]);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/useRouteContext.js
function xv(e) {
	return hv({
		...e,
		select: (t) => e.select ? e.select(t.context) : t.context
	});
}
//#endregion
//#region ../../node_modules/.pnpm/react-dom@19.2.4_react@19.2.4/node_modules/react-dom/cjs/react-dom.production.js
var Sv = /* @__PURE__ */ A(((e) => {
	var t = K_();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal");
	function o(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var s = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function c(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return o(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = s.T, n = i.p;
		try {
			if (s.T = null, i.p = 2, e) return e();
		} finally {
			s.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = c(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") if (typeof t == "object" && t) {
			if (t.as == null || t.as === "script") {
				var n = c(t.as, t.crossOrigin);
				i.d.M(e, {
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0
				});
			}
		} else t ?? i.d.M(e);
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = c(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") if (t) {
			var n = c(t.as, t.crossOrigin);
			i.d.m(e, {
				as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0
			});
		} else i.d.m(e);
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return s.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return s.H.useHostTransitionStatus();
	}, e.version = "19.2.4";
})), Cv = /* @__PURE__ */ A(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t() {}
		function n(e) {
			return "" + e;
		}
		function r(e, t, r) {
			var i = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
			try {
				n(i);
				var a = !1;
			} catch {
				a = !0;
			}
			return a && (console.error("The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", typeof Symbol == "function" && Symbol.toStringTag && i[Symbol.toStringTag] || i.constructor.name || "Object"), n(i)), {
				$$typeof: u,
				key: i == null ? null : "" + i,
				children: e,
				containerInfo: t,
				implementation: r
			};
		}
		function i(e, t) {
			if (e === "font") return "";
			if (typeof t == "string") return t === "use-credentials" ? t : "";
		}
		function a(e) {
			return e === null ? "`null`" : e === void 0 ? "`undefined`" : e === "" ? "an empty string" : "something with type \"" + typeof e + "\"";
		}
		function o(e) {
			return e === null ? "`null`" : e === void 0 ? "`undefined`" : e === "" ? "an empty string" : typeof e == "string" ? JSON.stringify(e) : typeof e == "number" ? "`" + e + "`" : "something with type \"" + typeof e + "\"";
		}
		function s() {
			var e = d.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var c = K_(), l = {
			d: {
				f: t,
				r: function() {
					throw Error("Invalid form element. requestFormReset must be passed a form that was rendered by React.");
				},
				D: t,
				C: t,
				L: t,
				m: t,
				X: t,
				S: t,
				M: t
			},
			p: 0,
			findDOMNode: null
		}, u = Symbol.for("react.portal"), d = c.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
		typeof Map == "function" && Map.prototype != null && typeof Map.prototype.forEach == "function" && typeof Set == "function" && Set.prototype != null && typeof Set.prototype.clear == "function" && typeof Set.prototype.forEach == "function" || console.error("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"), e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = l, e.createPortal = function(e, t) {
			var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
			if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error("Target container is not a DOM element.");
			return r(e, t, null, n);
		}, e.flushSync = function(e) {
			var t = d.T, n = l.p;
			try {
				if (d.T = null, l.p = 2, e) return e();
			} finally {
				d.T = t, l.p = n, l.d.f() && console.error("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.");
			}
		}, e.preconnect = function(e, t) {
			typeof e == "string" && e ? t != null && typeof t != "object" ? console.error("ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.", o(t)) : t != null && typeof t.crossOrigin != "string" && console.error("ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.", a(t.crossOrigin)) : console.error("ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", a(e)), typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, l.d.C(e, t));
		}, e.prefetchDNS = function(e) {
			if (typeof e != "string" || !e) console.error("ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", a(e));
			else if (1 < arguments.length) {
				var t = arguments[1];
				typeof t == "object" && t.hasOwnProperty("crossOrigin") ? console.error("ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.", o(t)) : console.error("ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.", o(t));
			}
			typeof e == "string" && l.d.D(e);
		}, e.preinit = function(e, t) {
			if (typeof e == "string" && e ? typeof t != "object" || !t ? console.error("ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.", o(t)) : t.as !== "style" && t.as !== "script" && console.error("ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are \"style\" and \"script\".", o(t.as)) : console.error("ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", a(e)), typeof e == "string" && t && typeof t.as == "string") {
				var n = t.as, r = i(n, t.crossOrigin), s = typeof t.integrity == "string" ? t.integrity : void 0, c = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
				n === "style" ? l.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
					crossOrigin: r,
					integrity: s,
					fetchPriority: c
				}) : n === "script" && l.d.X(e, {
					crossOrigin: r,
					integrity: s,
					fetchPriority: c,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0
				});
			}
		}, e.preinitModule = function(e, t) {
			var n = "";
			if (typeof e == "string" && e || (n += " The `href` argument encountered was " + a(e) + "."), t !== void 0 && typeof t != "object" ? n += " The `options` argument encountered was " + a(t) + "." : t && "as" in t && t.as !== "script" && (n += " The `as` option encountered was " + o(t.as) + "."), n) console.error("ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s", n);
			else switch (n = t && typeof t.as == "string" ? t.as : "script", n) {
				case "script": break;
				default: n = o(n), console.error("ReactDOM.preinitModule(): Currently the only supported \"as\" type for this function is \"script\" but received \"%s\" instead. This warning was generated for `href` \"%s\". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)", n, e);
			}
			typeof e == "string" && (typeof t == "object" && t ? (t.as == null || t.as === "script") && (n = i(t.as, t.crossOrigin), l.d.M(e, {
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			})) : t ?? l.d.M(e));
		}, e.preload = function(e, t) {
			var n = "";
			if (typeof e == "string" && e || (n += " The `href` argument encountered was " + a(e) + "."), typeof t != "object" || !t ? n += " The `options` argument encountered was " + a(t) + "." : typeof t.as == "string" && t.as || (n += " The `as` option encountered was " + a(t.as) + "."), n && console.error("ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel=\"preload\" as=\"...\" />` tag.%s", n), typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
				n = t.as;
				var r = i(n, t.crossOrigin);
				l.d.L(e, n, {
					crossOrigin: r,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					type: typeof t.type == "string" ? t.type : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
					referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
					imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
					imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
					media: typeof t.media == "string" ? t.media : void 0
				});
			}
		}, e.preloadModule = function(e, t) {
			var n = "";
			typeof e == "string" && e || (n += " The `href` argument encountered was " + a(e) + "."), t !== void 0 && typeof t != "object" ? n += " The `options` argument encountered was " + a(t) + "." : t && "as" in t && typeof t.as != "string" && (n += " The `as` option encountered was " + a(t.as) + "."), n && console.error("ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel=\"modulepreload\" as=\"...\" />` tag.%s", n), typeof e == "string" && (t ? (n = i(t.as, t.crossOrigin), l.d.m(e, {
				as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0
			})) : l.d.m(e));
		}, e.requestFormReset = function(e) {
			l.d.r(e);
		}, e.unstable_batchedUpdates = function(e, t) {
			return e(t);
		}, e.useFormState = function(e, t, n) {
			return s().useFormState(e, t, n);
		}, e.useFormStatus = function() {
			return s().useHostTransitionStatus();
		}, e.version = "19.2.4", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), wv = (/* @__PURE__ */ A(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) {
			if (process.env.NODE_ENV !== "production") throw Error("^_^");
			try {
				__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
			} catch (e) {
				console.error(e);
			}
		}
	}
	process.env.NODE_ENV === "production" ? (n(), t.exports = Sv()) : t.exports = Cv();
})))();
function Tv(e, t) {
	let n = dv(), r = X_(t), i = Y ?? n.isServer, { activeProps: a, inactiveProps: o, activeOptions: s, to: c, preload: l, preloadDelay: u, hashScrollIntoView: d, replace: f, startTransition: p, resetScroll: m, viewTransition: h, children: g, target: _, disabled: v, style: y, className: b, onClick: x, onBlur: S, onFocus: C, onMouseEnter: w, onMouseLeave: T, onTouchStart: E, ignoreBlocker: ee, params: D, search: te, hash: ne, state: re, mask: ie, reloadDocument: O, unsafeRelative: ae, from: oe, _fromLocation: k, ...se } = e;
	if (i) {
		let t = Fv(c);
		if (typeof c == "string" && !t && c.indexOf(":") > -1) try {
			return new URL(c), Wh(c, n.protocolAllowlist) ? (process.env.NODE_ENV !== "production" && console.warn(`Blocked Link with dangerous protocol: ${c}`), {
				...se,
				ref: r,
				href: void 0,
				...g && { children: g },
				..._ && { target: _ },
				...v && { disabled: v },
				...y && { style: y },
				...b && { className: b }
			}) : {
				...se,
				ref: r,
				href: c,
				...g && { children: g },
				..._ && { target: _ },
				...v && { disabled: v },
				...y && { style: y },
				...b && { className: b }
			};
		} catch {}
		let i = n.buildLocation({
			...e,
			from: e.from
		}), l = Pv(i.maskedLocation ? i.maskedLocation.publicHref : i.publicHref, i.maskedLocation ? i.maskedLocation.external : i.external, n.history, v), u = (() => {
			if (l?.external) {
				if (Wh(l.href, n.protocolAllowlist)) {
					process.env.NODE_ENV !== "production" && console.warn(`Blocked Link with dangerous protocol: ${l.href}`);
					return;
				}
				return l.href;
			}
			if (!t && typeof c == "string" && c.indexOf(":") > -1) try {
				if (new URL(c), Wh(c, n.protocolAllowlist)) {
					process.env.NODE_ENV !== "production" && console.warn(`Blocked Link with dangerous protocol: ${c}`);
					return;
				}
				return c;
			} catch {}
		})(), d = (() => {
			if (u) return !1;
			let e = n.state.location, t = s?.exact ?? !1;
			if (t) {
				if (!Tg(e.pathname, i.pathname, n.basepath)) return !1;
			} else {
				let t = wg(e.pathname, n.basepath), r = wg(i.pathname, n.basepath);
				if (!(t.startsWith(r) && (t.length === r.length || t[r.length] === "/"))) return !1;
			}
			if ((s?.includeSearch ?? !0) && e.search !== i.search) {
				let n = !e.search || typeof e.search == "object" && Object.keys(e.search).length === 0, r = !i.search || typeof i.search == "object" && Object.keys(i.search).length === 0;
				if (!(n && r) && !Lh(e.search, i.search, {
					partial: !t,
					ignoreUndefined: !s?.explicitUndefined
				})) return !1;
			}
			return !s?.includeHash;
		})();
		if (u) return {
			...se,
			ref: r,
			href: u,
			...g && { children: g },
			..._ && { target: _ },
			...v && { disabled: v },
			...y && { style: y },
			...b && { className: b }
		};
		let f = d ? Dh(a, {}) ?? Dv : Ev, p = d ? Ev : Dh(o, {}) ?? Ev, m = (() => {
			let e = y, t = f.style, n = p.style;
			if (!(!e && !t && !n)) return e && !t && !n ? e : !e && t && !n ? t : !e && !t && n ? n : {
				...e,
				...t,
				...n
			};
		})(), h = (() => {
			let e = b, t = f.className, n = p.className;
			if (!e && !t && !n) return "";
			let r = "";
			return e && (r = e), t && (r = r ? `${r} ${t}` : t), n && (r = r ? `${r} ${n}` : n), r;
		})();
		return {
			...se,
			...f,
			...p,
			href: l?.href,
			ref: r,
			disabled: !!v,
			target: _,
			...m && { style: m },
			...h && { className: h },
			...v && Ov,
			...d && kv
		};
	}
	let ce = Q_(), le = fv({
		select: (e) => {
			let t = e.matches[e.matches.length - 1];
			return {
				search: t?.search,
				hash: e.location.hash,
				path: t?.pathname
			};
		},
		structuralSharing: !0
	}), ue = e.from, de = X.useMemo(() => ({
		...e,
		from: ue
	}), [
		n,
		le,
		ue,
		e._fromLocation,
		e.hash,
		e.to,
		e.search,
		e.params,
		e.state,
		e.mask,
		e.unsafeRelative
	]), fe = X.useMemo(() => n.buildLocation({ ...de }), [n, de]), pe = fe.maskedLocation ? fe.maskedLocation.publicHref : fe.publicHref, A = fe.maskedLocation ? fe.maskedLocation.external : fe.external, j = X.useMemo(() => Pv(pe, A, n.history, v), [
		v,
		A,
		pe,
		n.history
	]), me = X.useMemo(() => {
		if (j?.external) {
			if (Wh(j.href, n.protocolAllowlist)) {
				process.env.NODE_ENV !== "production" && console.warn(`Blocked Link with dangerous protocol: ${j.href}`);
				return;
			}
			return j.href;
		}
		if (!Fv(c) && !(typeof c != "string" || c.indexOf(":") === -1)) try {
			if (new URL(c), Wh(c, n.protocolAllowlist)) {
				process.env.NODE_ENV !== "production" && console.warn(`Blocked Link with dangerous protocol: ${c}`);
				return;
			}
			return c;
		} catch {}
	}, [
		c,
		j,
		n.protocolAllowlist
	]), he = fv({ select: (e) => {
		if (me) return !1;
		if (s?.exact) {
			if (!Tg(e.location.pathname, fe.pathname, n.basepath)) return !1;
		} else {
			let t = wg(e.location.pathname, n.basepath), r = wg(fe.pathname, n.basepath);
			if (!(t.startsWith(r) && (t.length === r.length || t[r.length] === "/"))) return !1;
		}
		return (s?.includeSearch ?? !0) && !Lh(e.location.search, fe.search, {
			partial: !s?.exact,
			ignoreUndefined: !s?.explicitUndefined
		}) ? !1 : s?.includeHash ? ce && e.location.hash === fe.hash : !0;
	} }), M = he ? Dh(a, {}) ?? Dv : Ev, ge = he ? Ev : Dh(o, {}) ?? Ev, _e = [
		b,
		M.className,
		ge.className
	].filter(Boolean).join(" "), ve = (y || M.style || ge.style) && {
		...y,
		...M.style,
		...ge.style
	}, [ye, be] = X.useState(!1), xe = X.useRef(!1), Se = e.reloadDocument || me ? !1 : l ?? n.options.defaultPreload, N = u ?? n.options.defaultPreloadDelay ?? 0, Ce = X.useCallback(() => {
		n.preloadRoute({
			...de,
			_builtLocation: fe
		}).catch((e) => {
			console.warn(e), console.warn(B_);
		});
	}, [
		n,
		de,
		fe
	]);
	Y_(r, X.useCallback((e) => {
		e?.isIntersecting && Ce();
	}, [Ce]), Mv, { disabled: !!v || Se !== "viewport" }), X.useEffect(() => {
		xe.current || !v && Se === "render" && (Ce(), xe.current = !0);
	}, [
		v,
		Ce,
		Se
	]);
	let we = (e) => {
		let t = e.currentTarget.getAttribute("target"), r = _ === void 0 ? t : _;
		if (!v && !Lv(e) && !e.defaultPrevented && (!r || r === "_self") && e.button === 0) {
			e.preventDefault(), (0, wv.flushSync)(() => {
				be(!0);
			});
			let t = n.subscribe("onResolved", () => {
				t(), be(!1);
			});
			n.navigate({
				...de,
				replace: f,
				resetScroll: m,
				hashScrollIntoView: d,
				startTransition: p,
				viewTransition: h,
				ignoreBlocker: ee
			});
		}
	};
	if (me) return {
		...se,
		ref: r,
		href: me,
		...g && { children: g },
		..._ && { target: _ },
		...v && { disabled: v },
		...y && { style: y },
		...b && { className: b },
		...x && { onClick: x },
		...S && { onBlur: S },
		...C && { onFocus: C },
		...w && { onMouseEnter: w },
		...T && { onMouseLeave: T },
		...E && { onTouchStart: E }
	};
	let P = (e) => {
		if (v || Se !== "intent") return;
		if (!N) {
			Ce();
			return;
		}
		let t = e.currentTarget;
		if (jv.has(t)) return;
		let n = setTimeout(() => {
			jv.delete(t), Ce();
		}, N);
		jv.set(t, n);
	}, Te = (e) => {
		v || Se !== "intent" || Ce();
	}, Ee = (e) => {
		if (v || !Se || !N) return;
		let t = e.currentTarget, n = jv.get(t);
		n && (clearTimeout(n), jv.delete(t));
	};
	return {
		...se,
		...M,
		...ge,
		href: j?.href,
		ref: r,
		onClick: Nv([x, we]),
		onBlur: Nv([S, Ee]),
		onFocus: Nv([C, P]),
		onMouseEnter: Nv([w, P]),
		onMouseLeave: Nv([T, Ee]),
		onTouchStart: Nv([E, Te]),
		disabled: !!v,
		target: _,
		...ve && { style: ve },
		..._e && { className: _e },
		...v && Ov,
		...he && kv,
		...ce && ye && Av
	};
}
var Ev = {}, Dv = { className: "active" }, Ov = {
	role: "link",
	"aria-disabled": !0
}, kv = {
	"data-status": "active",
	"aria-current": "page"
}, Av = { "data-transitioning": "transitioning" }, jv = /* @__PURE__ */ new WeakMap(), Mv = { rootMargin: "100px" }, Nv = (e) => (t) => {
	for (let n of e) if (n) {
		if (t.defaultPrevented) return;
		n(t);
	}
};
function Pv(e, t, n, r) {
	if (!r) return t ? {
		href: e,
		external: !0
	} : {
		href: n.createHref(e) || "/",
		external: !1
	};
}
function Fv(e) {
	if (typeof e != "string") return !1;
	let t = e.charCodeAt(0);
	return t === 47 ? e.charCodeAt(1) !== 47 : t === 46;
}
var Iv = X.forwardRef((e, t) => {
	let { _asChild: n, ...r } = e, { type: i, ...a } = Tv(r, t), o = typeof r.children == "function" ? r.children({ isActive: a["data-status"] === "active" }) : r.children;
	if (!n) {
		let { disabled: e, ...t } = a;
		return X.createElement("a", t, o);
	}
	return X.createElement(n, a, o);
});
function Lv(e) {
	return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/route.js
var Rv = class extends V_ {
	constructor(e) {
		super(e), this.useMatch = (e) => hv({
			select: e?.select,
			from: this.id,
			structuralSharing: e?.structuralSharing
		}), this.useRouteContext = (e) => xv({
			...e,
			from: this.id
		}), this.useSearch = (e) => yv({
			select: e?.select,
			structuralSharing: e?.structuralSharing,
			from: this.id
		}), this.useParams = (e) => vv({
			select: e?.select,
			structuralSharing: e?.structuralSharing,
			from: this.id
		}), this.useLoaderDeps = (e) => _v({
			...e,
			from: this.id
		}), this.useLoaderData = (e) => gv({
			...e,
			from: this.id
		}), this.useNavigate = () => bv({ from: this.fullPath }), this.Link = X.forwardRef((e, t) => /* @__PURE__ */ (0, Z_.jsx)(Iv, {
			ref: t,
			from: this.fullPath,
			...e
		})), this.$$typeof = /* @__PURE__ */ Symbol.for("react.memo");
	}
};
function zv(e) {
	return new Rv(e);
}
var Bv = class extends H_ {
	constructor(e) {
		super(e), this.useMatch = (e) => hv({
			select: e?.select,
			from: this.id,
			structuralSharing: e?.structuralSharing
		}), this.useRouteContext = (e) => xv({
			...e,
			from: this.id
		}), this.useSearch = (e) => yv({
			select: e?.select,
			structuralSharing: e?.structuralSharing,
			from: this.id
		}), this.useParams = (e) => vv({
			select: e?.select,
			structuralSharing: e?.structuralSharing,
			from: this.id
		}), this.useLoaderDeps = (e) => _v({
			...e,
			from: this.id
		}), this.useLoaderData = (e) => gv({
			...e,
			from: this.id
		}), this.useNavigate = () => bv({ from: this.fullPath }), this.Link = X.forwardRef((e, t) => /* @__PURE__ */ (0, Z_.jsx)(Iv, {
			ref: t,
			from: this.fullPath,
			...e
		})), this.$$typeof = /* @__PURE__ */ Symbol.for("react.memo");
	}
};
function Vv(e) {
	return new Bv(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/fileRoute.js
function Hv(e) {
	return typeof e == "object" ? new Uv(e, { silent: !0 }).createRoute(e) : new Uv(e, { silent: !0 }).createRoute;
}
var Uv = class {
	constructor(e, t) {
		this.path = e, this.createRoute = (e) => {
			process.env.NODE_ENV !== "production" && tv(this.silent, "FileRoute is deprecated and will be removed in the next major version. Use the createFileRoute(path)(options) function instead.");
			let t = zv(e);
			return t.isRoot = !1, t;
		}, this.silent = t?.silent;
	}
}, Wv = class {
	constructor(e) {
		this.useMatch = (e) => hv({
			select: e?.select,
			from: this.options.id,
			structuralSharing: e?.structuralSharing
		}), this.useRouteContext = (e) => xv({
			...e,
			from: this.options.id
		}), this.useSearch = (e) => yv({
			select: e?.select,
			structuralSharing: e?.structuralSharing,
			from: this.options.id
		}), this.useParams = (e) => vv({
			select: e?.select,
			structuralSharing: e?.structuralSharing,
			from: this.options.id
		}), this.useLoaderDeps = (e) => _v({
			...e,
			from: this.options.id
		}), this.useLoaderData = (e) => gv({
			...e,
			from: this.options.id
		}), this.useNavigate = () => bv({ from: dv().routesById[this.options.id].fullPath }), this.options = e, this.$$typeof = /* @__PURE__ */ Symbol.for("react.memo");
	}
};
function Gv(e) {
	return typeof e == "object" ? new Wv(e) : (t) => new Wv({
		id: e,
		...t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-router@1.166.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@tanstack/react-router/dist/esm/router.js
var Kv = (e) => new qv(e), qv = class extends O_ {
	constructor(e) {
		super(e);
	}
};
typeof globalThis < "u" ? (globalThis.createFileRoute = Hv, globalThis.createLazyFileRoute = Gv) : typeof window < "u" && (window.createFileRoute = Hv, window.createLazyFileRoute = Gv);
//#endregion
//#region electron/constants.ts
var Jv = e.dirname(E(import.meta.url));
new URL(M.VITE_RENDERER_URL);
var Yv = e.join(Jv, "..", "dist"), Xv = e.join(Jv, "preload.mjs"), Zv = ge ? e.join(Jv, "..", "..", "public") : e.join(Jv, "..", "dist"), Qv = ge ? e.join(Jv, "..", "..", "mac-extra-resources") : e.join(process.resourcesPath, "mac-extra-resources"), Z;
(function(n) {
	let r = null;
	function a() {
		ge || (ae(), oe()), i.on("activate", () => {
			Q.patchSharedState({ showDashboard: !0 });
		}), i.on("second-instance", () => {
			Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
			}), i.focus();
		}), i.on("before-quit", () => {
			for (let e of t.getAllWindows()) e.destroy();
		}), i.on("window-all-closed", () => {}), p.on("display-added", S), p.on("display-removed", S), p.on("display-metrics-changed", S), u.on("updated", () => {
			o(Q.getSharedState());
		}), ne.init(), o(Q.getSharedState());
	}
	n.init = a;
	function o(e) {
		u.themeSource = e.theme, D.update(e), te.update(e), C.update(e), w.update(e), T.update(e), E.update(e), x();
	}
	n.update = o;
	let s = n.broadcastIpc = (e, ...t) => {
		for (let n of [
			C.getWindow(),
			w.getWindow(),
			T.getWindow(),
			E.getWindow(),
			D.getWindow(),
			te.getWindow(),
			ne.getWindow()
		]) n?.webContents.send(e, ...t);
	};
	function c(e) {
		return e.permissions.microphone !== "granted" || e.permissions.screen !== "granted" || e.permissions.accessibility !== "granted" || !e.finishedOnboarding || e.signInStatus === "signed-out" ? "onboarding" : e.signInStatus === "loading" ? "splash" : "app";
	}
	n.getPhase = c;
	function l(e) {
		return e.isControlWindowLoaded && e.isChatWindowLoaded && e.isDashboardWindowLoaded;
	}
	n.areAppWindowsLoaded = l;
	let g = Kv({
		routeTree: Vv(),
		history: bh()
	});
	function v(e, t) {
		let n = g.buildLocation(t), r = new URL(`/#${n.href}`, re);
		e.loadURL(r.toString());
	}
	n.navigate = v;
	function b() {
		let e = C.getWindow();
		if (!e) return;
		let t = e.getBounds(), n = p.getDisplayMatching(t), r = n.bounds.y + n.bounds.height - t.height - 150;
		t.y > r && e.setPosition(t.x, r), x();
	}
	n.normalizeControlAndChatWindowPosition = b;
	function x(e = !1) {
		let t = C.getWindow(), n = w.getWindow();
		if (!t || !n) return;
		let r = t.getBounds(), i = n.getBounds(), a = {
			x: r.x + Math.round((r.width - i.width) / 2),
			y: r.y + r.height + 6,
			width: i.width,
			height: i.height
		}, o = p.getDisplayMatching(a);
		process.platform === "darwin" && a.y < o.workArea.y && (a.y = o.workArea.y), (i.x !== a.x || i.y !== a.y) && n.setPosition(a.x, a.y), process.platform !== "darwin" && e && (C.restoreSize(), w.restoreSize());
	}
	function S() {
		r && clearTimeout(r), r = setTimeout(() => {
			r = null, b();
		}, 50);
	}
	let C;
	(function(e) {
		let n = null;
		function r(e) {
			if (c(e) !== "app") {
				n?.destroy(), n = null;
				return;
			}
			n ||= f(e), n.setContentProtection(k(e));
			let t = l(e) && (!!e.session || e.isAmbientEnabled) && (e.showChat || !e.hideChatHidesControlWindow);
			t !== n.isVisible() && (t ? ce(n) : (n.hide(), e.hideChatHidesControlWindow && !e.showDashboard && process.platform === "darwin" && i.hide()));
			let r = g(e);
			r !== n.isFocusable() && (n.setFocusable(r), n.setSkipTaskbar(!0));
		}
		e.update = r;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o({ x: e, y: t }) {
			if (!n) return;
			let r = n.getBounds(), i = h({
				...r,
				x: e,
				y: t
			});
			i.x === r.x && i.y === r.y || (n.setPosition(i.x, i.y), x(!0));
		}
		e.setPosition = o;
		function s() {
			n && (n.setResizable(!0), n.setSize(163, 50), n.setResizable(!1));
		}
		e.restoreSize = s;
		function u({ deltaX: e = 0, deltaY: t = 0 }) {
			if (!n) return;
			let { x: r, y: i } = n.getBounds();
			o({
				x: r + e,
				y: i + t
			});
		}
		e.moveBy = u;
		function d() {
			if (!n) return;
			let { width: e } = n.getBounds(), { x: t, y: r } = m({
				targetDisplay: p.getDisplayMatching(n.getBounds()),
				width: e
			});
			o({
				x: t,
				y: r
			});
		}
		e.resetPosition = d;
		function f(e) {
			let { x: n, y: r } = m({
				targetDisplay: p.getPrimaryDisplay(),
				width: 163
			}), i = new t({
				...ie,
				alwaysOnTop: !0,
				closable: !1,
				focusable: g(e),
				frame: !1,
				fullscreenable: !1,
				hasShadow: !1,
				hiddenInMissionControl: !0,
				height: 50,
				minimizable: !1,
				resizable: !1,
				skipTaskbar: !0,
				show: !1,
				title: "Cluely",
				transparent: !0,
				type: "panel",
				width: 163,
				x: n,
				y: r
			});
			return O(i), v(i, { to: "/control" }), i;
		}
		function m({ targetDisplay: e, width: t }) {
			let n = e.bounds, r = e.workArea;
			return {
				x: n.x + Math.round((n.width - t) / 2),
				y: r.y + 25
			};
		}
		function h(e) {
			let t = (e, t, n) => Math.min(Math.max(e, t), n), n = p.getDisplayMatching(e), r = { ...e };
			return r.x = t(e.x, n.workArea.x, n.workArea.x + n.workArea.width - e.width), r.y = t(e.y, n.workArea.y, n.workArea.y + n.workArea.height - e.height), r;
		}
		function g(e) {
			return !(e.isInvisible && e.noFocusWhenInvisible);
		}
	})(C ||= n.Control ||= {});
	let w;
	(function(e) {
		let n = null, r = 500;
		function i(e) {
			if (c(e) !== "app") {
				n?.destroy(), n = null, r = 500;
				return;
			}
			n ||= p(e), n.setContentProtection(k(e)), h(e);
			let t = l(e) && (!!e.session || e.isAmbientEnabled) && e.showChat;
			t !== n.isVisible() && (t ? ce(n) : n.hide());
			let i = g(e);
			i !== n.isFocusable() && (n.setFocusable(i), n.setSkipTaskbar(!0));
		}
		e.update = i;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o() {
			n && (s("chat-clear-input"), Q.patchSharedState({ chatWindowIsExpanded: !1 }));
		}
		e.clearInputAndCollapse = o;
		function u(e) {
			if (!n) return;
			let t = Q.getSharedState();
			t.chatWindowIsExpanded && (r = Math.max(e, 350), h(t));
		}
		e.setHeight = u;
		function d() {
			r = 500, h(Q.getSharedState());
		}
		e.resetHeight = d;
		function f() {
			h(Q.getSharedState());
		}
		e.restoreSize = f;
		function p(e) {
			let n = new t({
				...ie,
				alwaysOnTop: !0,
				closable: !1,
				focusable: g(e),
				frame: !1,
				fullscreenable: !1,
				hasShadow: !1,
				height: m(e),
				hiddenInMissionControl: !0,
				maxWidth: 540,
				minWidth: 540,
				minimizable: !1,
				movable: !1,
				resizable: !1,
				skipTaskbar: !0,
				show: !1,
				title: "Cluely",
				transparent: !0,
				type: "panel",
				width: 540
			});
			return O(n), v(n, { to: "/chat" }), n;
		}
		function m(e) {
			let t = e.isInvisible ? 152 : 140;
			return e.chatWindowIsExpanded ? r : e.isChatMoreMenuOpen || e.isChatModesMenuOpen ? 500 : t;
		}
		function h(e) {
			n && (n.setResizable(!0), n.setMinimumSize(0, 0), n.setSize(540, m(e)), n.setResizable(!1));
		}
		function g(e) {
			return !(e.isInvisible && e.noFocusWhenInvisible);
		}
	})(w ||= n.Chat ||= {});
	let T;
	(function(e) {
		let n = null, r = 0;
		function i(e) {
			if (c(e) !== "app") {
				n?.destroy(), n = null, r = e.dashboardFocusCount;
				return;
			}
			n ||= o(), n.setBackgroundColor(s()), n.setContentProtection(k(e)), process.platform !== "darwin" && n.setTitleBarOverlay(d());
			let t = l(e) && e.showDashboard;
			t !== n.isVisible() && (t ? n.show() : n.hide());
			let i = e.dashboardFocusCount !== r;
			t && i && n.focus(), r = e.dashboardFocusCount;
		}
		e.update = i;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o() {
			let e = process.platform === "darwin" ? {
				titleBarStyle: "hiddenInset",
				trafficLightPosition: {
					x: 12,
					y: 12
				}
			} : {
				titleBarOverlay: d(),
				titleBarStyle: "hidden"
			}, n = new t({
				...ie,
				backgroundColor: s(),
				...e,
				height: 700,
				minHeight: 600,
				minWidth: 800,
				show: !1,
				title: "Cluely",
				width: 1050
			});
			return n.on("close", (e) => {
				e.preventDefault(), Q.patchSharedState({ showDashboard: !1 });
			}), O(n), v(n, { to: "/dashboard" }), n;
		}
		function s() {
			return u.shouldUseDarkColors ? "#09090B" : "#FFFFFF";
		}
		function d() {
			return u.shouldUseDarkColors ? {
				color: "#00000000",
				height: 38,
				symbolColor: "#FFFFFF"
			} : {
				color: "#00000000",
				height: 38,
				symbolColor: "#000000"
			};
		}
	})(T ||= n.Dashboard ||= {});
	let E;
	(function(e) {
		let n = null, r = null;
		function i(e) {
			if (!(c(e) === "app" && e.meetingNotification !== null)) {
				n?.destroy(), n = null, r = null;
				return;
			}
			n ||= o(e);
			let t = s(e);
			r !== t && (n.setSize(360, t), r = t), n.setContentProtection(k(e));
		}
		e.update = i;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o(e) {
			let n = s(e);
			r = n;
			let { workArea: i } = p.getPrimaryDisplay(), a = i.x + i.width - 360 - 15, o = i.y + 15, c = new t({
				...ie,
				alwaysOnTop: !0,
				backgroundColor: "#ffffff",
				closable: !1,
				frame: !1,
				height: n,
				movable: !1,
				resizable: !1,
				skipTaskbar: !0,
				show: !1,
				title: "Upcoming Meeting",
				type: "panel",
				width: 360,
				x: a,
				y: o
			});
			return c.once("ready-to-show", () => {
				c.isDestroyed() || c.show();
			}), O(c), v(c, { to: "/notification" }), c;
		}
		function s(e) {
			return e.meetingNotification?.source === "calendar" ? 300 : 70;
		}
	})(E ||= n.MeetingNotification ||= {});
	let D;
	(function(e) {
		let n = null;
		function r(e) {
			if (c(e) !== "onboarding") {
				n?.destroy(), n = null;
				return;
			}
			n ||= o();
		}
		e.update = r;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o() {
			let e = process.platform === "darwin" ? {
				titleBarStyle: "hiddenInset",
				trafficLightPosition: {
					x: 12,
					y: 12
				}
			} : {
				titleBarOverlay: { color: "#00000000" },
				titleBarStyle: "hidden"
			}, n = new t({
				...ie,
				...e,
				height: 720,
				resizable: !1,
				show: !1,
				title: "Cluely",
				width: 1100
			});
			return n.once("ready-to-show", () => {
				n.isDestroyed() || n.show();
			}), n.on("close", () => {
				i.quit();
			}), O(n), v(n, { to: "/onboarding" }), n;
		}
	})(D ||= n.Onboarding ||= {});
	let te;
	(function(e) {
		let n = null;
		function r(e) {
			let t = c(e);
			if (!(t === "splash" || t === "app" && !l(e))) {
				n?.destroy(), n = null;
				return;
			}
			n ||= o();
		}
		e.update = r;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o() {
			let e = new t({
				...ie,
				alwaysOnTop: !0,
				backgroundColor: "#64647E",
				frame: !1,
				height: 400,
				resizable: !1,
				show: !1,
				title: "Cluely",
				width: 320
			});
			return e.once("ready-to-show", () => {
				e.isDestroyed() || e.show();
			}), e.on("close", () => {
				i.quit();
			}), O(e), v(e, { to: "/splash" }), e;
		}
	})(te ||= n.Splash ||= {});
	let ne;
	(function(e) {
		let n = null;
		function r() {
			n ||= o();
		}
		e.init = r;
		async function i() {
			if (!n) return null;
			try {
				let e = await n.webContents.executeJavaScript("window._globalGetToken ? window._globalGetToken() : null");
				return typeof e == "string" ? e : null;
			} catch (e) {
				return _.error("Error getting token from auth window:", e), null;
			}
		}
		e.getToken = i;
		function a() {
			return n;
		}
		e.getWindow = a;
		function o() {
			let e = new t({
				...ie,
				closable: !1,
				show: !1
			});
			return O(e), v(e, { to: "/auth" }), e;
		}
	})(ne ||= n.Auth ||= {});
	let re = new URL(M.VITE_RENDERER_URL), ie = {
		acceptFirstMouse: !0,
		webPreferences: { preload: Xv }
	};
	function O(e) {
		let t = re.origin;
		e.webContents.on("will-navigate", (e, n) => {
			new URL(n).origin !== t && (_.warn("Blocked window navigation:", n), e.preventDefault());
		}), e.webContents.on("will-redirect", (e, n) => {
			new URL(n).origin !== t && (_.warn("Blocked window redirect:", n), e.preventDefault());
		}), e.webContents.setWindowOpenHandler(({ url: e }) => {
			if (URL.canParse(e)) {
				let t = new URL(e).protocol;
				if (t === "https:" || t === "mailto:") return h.openExternal(e), { action: "deny" };
			}
			return _.warn("Blocked window open:", e), { action: "deny" };
		});
	}
	function ae() {
		f.handle("https", (t) => {
			let n = new URL(t.url);
			if (n.origin !== re.origin) return d.fetch(t, { bypassCustomProtocolHandlers: !0 });
			if (n.pathname !== "" && !n.pathname.startsWith("/")) return new Response("Not found", { status: 404 });
			let r = decodeURIComponent(n.pathname.slice(1));
			if (r.includes("..")) return new Response("Not found", { status: 404 });
			let i = e.resolve(Yv, r);
			if (e.extname(r) !== "") return y(i) ? d.fetch(ee(i).toString()) : new Response("Not found", { status: 404 });
			let a = e.join(Yv, "index.html");
			return d.fetch(ee(a).toString());
		});
	}
	function oe() {
		m.defaultSession.webRequest.onBeforeSendHeaders((e, t) => {
			t({ requestHeaders: {
				...e.requestHeaders,
				Origin: re.origin
			} });
		});
	}
	function k(e) {
		return e.isInvisible || e.isCapturingScreenshot;
	}
	let se = /* @__PURE__ */ new WeakMap();
	function ce(e) {
		if (process.platform === "darwin") {
			e.show();
			return;
		}
		e.setOpacity(0), e.show(), clearTimeout(se.get(e));
		let t = setTimeout(() => {
			e.isDestroyed() || e.setOpacity(1);
		}, 30);
		se.set(e, t);
	}
})(Z ||= {});
//#endregion
//#region electron/domains/dock.ts
var $v;
(function(e) {
	let n = null;
	function r() {
		a(Q.getSharedState());
	}
	e.init = r;
	function a(e) {
		let t = o(e);
		n !== t && (n = t, s(t));
	}
	e.update = a;
	function o(e) {
		return Z.areAppWindowsLoaded(e) ? !e.isInvisible : !0;
	}
	let s = xe({
		delay: 1e3,
		leading: !0
	}, (e) => {
		if (!(process.platform !== "darwin" || !i.dock)) if (e) i.dock.show();
		else {
			let e = t.getFocusedWindow(), n = Z.Dashboard.getWindow(), r = e != null && n != null && e === n;
			i.dock.hide(), r && c(n);
		}
	});
	function c(e) {
		setTimeout(() => {
			e.isDestroyed() || e.focus();
		}, 0);
	}
})($v ||= {});
//#endregion
//#region electron/domains/login.ts
var ey;
(function(e) {
	let t = !1;
	function n() {
		if (!Q.getSharedState().didSetOpenAtLogin) {
			i.setLoginItemSettings({ openAtLogin: !0 }), t = !0, Q.patchSharedState({
				didSetOpenAtLogin: !0,
				openAtLogin: !0
			});
			return;
		}
		let { openAtLogin: e } = i.getLoginItemSettings();
		t = e, Q.patchSharedState({ openAtLogin: e });
	}
	e.init = n;
	function r(e) {
		t !== e.openAtLogin && (i.setLoginItemSettings({ openAtLogin: e.openAtLogin }), t = e.openAtLogin);
	}
	e.update = r;
})(ey ||= {});
//#endregion
//#region ../../node_modules/.pnpm/audiotee@0.0.7/node_modules/audiotee/dist/index.js
var ty = ie.dirname(ae(import.meta.url)), ny = class {
	events = new re();
	process = null;
	isRunning = !1;
	options;
	constructor(e = {}) {
		this.options = e;
	}
	on(e, t) {
		return this.events.on(e, t), this;
	}
	once(e, t) {
		return this.events.once(e, t), this;
	}
	off(e, t) {
		return this.events.off(e, t), this;
	}
	removeAllListeners(e) {
		return this.events.removeAllListeners(e), this;
	}
	emit(e, ...t) {
		return this.events.emit(e, ...t);
	}
	buildArguments() {
		let e = [];
		return this.options.sampleRate !== void 0 && e.push("--sample-rate", this.options.sampleRate.toString()), this.options.chunkDurationMs !== void 0 && e.push("--chunk-duration", (this.options.chunkDurationMs / 1e3).toString()), this.options.mute && e.push("--mute"), this.options.includeProcesses && this.options.includeProcesses.length > 0 && e.push("--include-processes", ...this.options.includeProcesses.map((e) => e.toString())), this.options.excludeProcesses && this.options.excludeProcesses.length > 0 && e.push("--exclude-processes", ...this.options.excludeProcesses.map((e) => e.toString())), e;
	}
	handleStderr(e) {
		let t = e.toString("utf8").split("\n").filter((e) => e.trim());
		for (let e of t) try {
			let t = JSON.parse(e);
			(t.message_type === "debug" || t.message_type === "info") && this.emit("log", t.message_type, t.data), t.message_type === "stream_start" ? this.emit("start") : t.message_type === "stream_stop" ? this.emit("stop") : t.message_type === "error" && this.emit("error", Error(t.data.message));
		} catch (e) {
			console.error("Error parsing log message:", e);
		}
	}
	start() {
		return new Promise((e, t) => {
			if (this.isRunning) {
				t(/* @__PURE__ */ Error("AudioTee is already running"));
				return;
			}
			if (process.platform !== "darwin") {
				t(/* @__PURE__ */ Error(`AudioTee currently only supports macOS (darwin). Current platform: ${process.platform}`));
				return;
			}
			this.process = ne(this.options.binaryPath ?? O(ty, "..", "bin", "audiotee"), this.buildArguments()), this.process.on("error", (e) => {
				this.isRunning = !1, this.emit("error", e), t(e);
			}), this.process.on("exit", (e, t) => {
				if (this.isRunning = !1, e !== 0 && e !== null) {
					let t = /* @__PURE__ */ Error(`AudioTee process exited with code ${e}`);
					this.emit("error", t);
				}
			}), this.process.stdout?.on("data", (e) => {
				this.emit("data", { data: e });
			}), this.process.stderr?.on("data", (e) => {
				this.handleStderr(e);
			}), this.isRunning = !0, e();
		});
	}
	stop() {
		return new Promise((e) => {
			if (!this.isRunning || !this.process) {
				e();
				return;
			}
			let t = setTimeout(() => {
				this.process && this.isRunning && this.process.kill("SIGKILL");
			}, 5e3);
			this.process.once("exit", () => {
				clearTimeout(t), this.isRunning = !1, this.process = null, e();
			}), this.process.kill("SIGTERM");
		});
	}
	isActive() {
		return this.isRunning;
	}
};
//#endregion
//#region ../../node_modules/.pnpm/@orpc+shared@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/shared/dist/index.mjs
function ry(e) {
	return e[0] ?? {};
}
function iy(e) {
	return Array.isArray(e) ? e : e == null ? [] : [e];
}
var ay = "orpc", oy = "@orpc/shared", sy = "1.13.6", cy = class extends Error {
	constructor(...e) {
		super(...e), this.name = "AbortError";
	}
};
function ly(e) {
	let t;
	return () => {
		if (t) return t.result;
		let n = e();
		return t = { result: n }, n;
	};
}
function uy(e) {
	let t = Promise.resolve();
	return (...n) => t = t.catch(() => {}).then(() => e(...n));
}
var dy = 2, fy = `__${oy}@${sy}/otel/config__`;
function py() {
	return globalThis[fy];
}
function my(e, t = {}, n) {
	return (py()?.tracer)?.startSpan(e, t, n);
}
function hy(e, t, n = {}) {
	if (!e) return;
	let r = gy(t);
	e.recordException(r), (!n.signal?.aborted || n.signal.reason !== t) && e.setStatus({
		code: dy,
		message: r.message
	});
}
function gy(e) {
	if (e instanceof Error) {
		let t = {
			message: e.message,
			name: e.name,
			stack: e.stack
		};
		return "code" in e && (typeof e.code == "string" || typeof e.code == "number") && (t.code = e.code), t;
	}
	return { message: String(e) };
}
async function _y({ name: e, context: t, ...n }, r) {
	let i = py()?.tracer;
	if (!i) return r();
	let a = async (e) => {
		try {
			return await r(e);
		} catch (t) {
			throw hy(e, t, n), t;
		} finally {
			e.end();
		}
	};
	return t ? i.startActiveSpan(e, n, t, a) : i.startActiveSpan(e, n, a);
}
async function vy(e, t) {
	let n = py();
	if (!e || !n) return t();
	let r = n.trace.setSpan(n.context.active(), e);
	return n.context.with(r, t);
}
function yy(e) {
	return !e || typeof e != "object" ? !1 : "next" in e && typeof e.next == "function" && Symbol.asyncIterator in e && typeof e[Symbol.asyncIterator] == "function";
}
var by = Symbol.asyncDispose ?? Symbol.for("asyncDispose"), xy = class {
	#e = !1;
	#t = !1;
	#n;
	#r;
	constructor(e, t) {
		this.#n = t, this.#r = uy(async () => {
			if (this.#e) return {
				done: !0,
				value: void 0
			};
			try {
				let t = await e();
				return t.done && (this.#e = !0), t;
			} catch (e) {
				throw this.#e = !0, e;
			} finally {
				this.#e && !this.#t && (this.#t = !0, await this.#n("next"));
			}
		});
	}
	next() {
		return this.#r();
	}
	async return(e) {
		return this.#e = !0, this.#t || (this.#t = !0, await this.#n("return")), {
			done: !0,
			value: e
		};
	}
	async throw(e) {
		throw this.#e = !0, this.#t || (this.#t = !0, await this.#n("throw")), e;
	}
	async [by]() {
		this.#e = !0, this.#t || (this.#t = !0, await this.#n("dispose"));
	}
	[Symbol.asyncIterator]() {
		return this;
	}
};
function Sy({ name: e, ...t }, n) {
	let r;
	return new xy(async () => {
		r ??= my(e);
		try {
			let e = await vy(r, () => n.next());
			return r?.addEvent(e.done ? "completed" : "yielded"), e;
		} catch (e) {
			throw hy(r, e, t), e;
		}
	}, async (e) => {
		try {
			e !== "next" && await vy(r, () => n.return?.());
		} catch (e) {
			throw hy(r, e, t), e;
		} finally {
			r?.end();
		}
	});
}
function Cy(e, t, n) {
	let r = (t, i) => {
		let a = e[i];
		return a ? a({
			...t,
			next: (e = t) => r(e, i + 1)
		}) : n(t);
	};
	return r(t, 0);
}
function wy(e) {
	if (e) return JSON.parse(e);
}
function Ty(e) {
	return JSON.stringify(e);
}
function Ey(e) {
	return Oy(e) ? Object.getPrototypeOf(e)?.constructor : null;
}
function Dy(e) {
	if (!e || typeof e != "object") return !1;
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || !t || !t.constructor;
}
function Oy(e) {
	return !!e && (typeof e == "object" || typeof e == "function");
}
function ky(e, ...t) {
	return typeof e == "function" ? e(...t) : e;
}
function Ay(e) {
	return new Proxy(e, { get(e, t, n) {
		let r = Reflect.get(e, t, n);
		return t !== "then" || typeof r != "function" ? r : new Proxy(r, { apply(t, n, r) {
			if (r.length !== 2 || r.some((e) => !My(e))) return Reflect.apply(t, n, r);
			let i = !0;
			r[0].call(n, Ay(new Proxy(e, { get: (e, t, n) => {
				if (i && t === "then") {
					i = !1;
					return;
				}
				return Reflect.get(e, t, n);
			} })));
		} });
	} });
}
var jy = /^\s*function\s*\(\)\s*\{\s*\[native code\]\s*\}\s*$/;
function My(e) {
	return typeof e == "function" && jy.test(e.toString());
}
function Ny(e) {
	try {
		return decodeURIComponent(e);
	} catch {
		return e;
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@orpc+client@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/client/dist/shared/client.BKHdcV-f.mjs
var Py = "@orpc/client", Fy = "1.13.6", Iy = {
	BAD_REQUEST: {
		status: 400,
		message: "Bad Request"
	},
	UNAUTHORIZED: {
		status: 401,
		message: "Unauthorized"
	},
	FORBIDDEN: {
		status: 403,
		message: "Forbidden"
	},
	NOT_FOUND: {
		status: 404,
		message: "Not Found"
	},
	METHOD_NOT_SUPPORTED: {
		status: 405,
		message: "Method Not Supported"
	},
	NOT_ACCEPTABLE: {
		status: 406,
		message: "Not Acceptable"
	},
	TIMEOUT: {
		status: 408,
		message: "Request Timeout"
	},
	CONFLICT: {
		status: 409,
		message: "Conflict"
	},
	PRECONDITION_FAILED: {
		status: 412,
		message: "Precondition Failed"
	},
	PAYLOAD_TOO_LARGE: {
		status: 413,
		message: "Payload Too Large"
	},
	UNSUPPORTED_MEDIA_TYPE: {
		status: 415,
		message: "Unsupported Media Type"
	},
	UNPROCESSABLE_CONTENT: {
		status: 422,
		message: "Unprocessable Content"
	},
	TOO_MANY_REQUESTS: {
		status: 429,
		message: "Too Many Requests"
	},
	CLIENT_CLOSED_REQUEST: {
		status: 499,
		message: "Client Closed Request"
	},
	INTERNAL_SERVER_ERROR: {
		status: 500,
		message: "Internal Server Error"
	},
	NOT_IMPLEMENTED: {
		status: 501,
		message: "Not Implemented"
	},
	BAD_GATEWAY: {
		status: 502,
		message: "Bad Gateway"
	},
	SERVICE_UNAVAILABLE: {
		status: 503,
		message: "Service Unavailable"
	},
	GATEWAY_TIMEOUT: {
		status: 504,
		message: "Gateway Timeout"
	}
};
function Ly(e, t) {
	return t ?? Iy[e]?.status ?? 500;
}
function Ry(e, t) {
	return t || Iy[e]?.message || e;
}
var zy = Symbol.for(`__${Py}@${Fy}/error/ORPC_ERROR_CONSTRUCTORS__`);
globalThis[zy] ??= /* @__PURE__ */ new WeakSet();
var By = globalThis[zy], Vy = class extends Error {
	defined;
	code;
	status;
	data;
	constructor(e, ...t) {
		let n = ry(t);
		if (n.status !== void 0 && !Uy(n.status)) throw Error("[ORPCError] Invalid error status code.");
		let r = Ry(e, n.message);
		super(r, n), this.code = e, this.status = Ly(e, n.status), this.defined = n.defined ?? !1, this.data = n.data;
	}
	toJSON() {
		return {
			defined: this.defined,
			code: this.code,
			status: this.status,
			message: this.message,
			data: this.data
		};
	}
	static [Symbol.hasInstance](e) {
		if (By.has(this)) {
			let t = Ey(e);
			if (t && By.has(t)) return !0;
		}
		return super[Symbol.hasInstance](e);
	}
};
By.add(Vy);
function Hy(e) {
	return e instanceof Vy ? e : new Vy("INTERNAL_SERVER_ERROR", {
		message: "Internal server error",
		cause: e
	});
}
function Uy(e) {
	return e < 200 || e >= 400;
}
function Wy(e) {
	if (!Dy(e)) return !1;
	let t = [
		"defined",
		"code",
		"status",
		"message",
		"data"
	];
	return Object.keys(e).some((e) => !t.includes(e)) ? !1 : "defined" in e && typeof e.defined == "boolean" && "code" in e && typeof e.code == "string" && "status" in e && typeof e.status == "number" && Uy(e.status) && "message" in e && typeof e.message == "string";
}
function Gy(e, t = {}) {
	return new Vy(e.code, {
		...t,
		...e
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@orpc+standard-server@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/standard-server/dist/index.mjs
var Ky = class extends TypeError {}, qy = class extends TypeError {}, Jy = class extends Error {
	data;
	constructor(e) {
		super(e?.message ?? "An error event was received", e), this.data = e?.data;
	}
};
function Yy(e) {
	let t = e.replace(/\n+$/, "").split(/\n/), n = {
		data: void 0,
		event: void 0,
		id: void 0,
		retry: void 0,
		comments: []
	};
	for (let e of t) {
		let t = e.indexOf(":"), r = t === -1 ? e : e.slice(0, t), i = t === -1 ? "" : e.slice(t + 1).replace(/^\s/, "");
		if (t === 0) n.comments.push(i);
		else if (r === "data") n.data ??= "", n.data += `${i}
`;
		else if (r === "event") n.event = i;
		else if (r === "id") n.id = i;
		else if (r === "retry") {
			let e = Number.parseInt(i);
			Number.isInteger(e) && e >= 0 && e.toString() === i && (n.retry = e);
		}
	}
	return n.data = n.data?.replace(/\n$/, ""), n;
}
var Xy = class {
	constructor(e = {}) {
		this.options = e;
	}
	incomplete = "";
	feed(e) {
		this.incomplete += e;
		let t = this.incomplete.lastIndexOf("\n\n");
		if (t === -1) return;
		let n = this.incomplete.slice(0, t).split(/\n\n/);
		this.incomplete = this.incomplete.slice(t + 2);
		for (let e of n) {
			let t = Yy(`${e}

`);
			this.options.onEvent && this.options.onEvent(t);
		}
	}
	end() {
		if (this.incomplete) throw new qy("Event Iterator ended before complete");
	}
}, Zy = class extends TransformStream {
	constructor() {
		let e;
		super({
			start(t) {
				e = new Xy({ onEvent: (e) => {
					t.enqueue(e);
				} });
			},
			transform(t) {
				e.feed(t);
			},
			flush() {
				e.end();
			}
		});
	}
};
function Qy(e) {
	if (e.includes("\n")) throw new Ky("Event's id must not contain a newline character");
}
function $y(e) {
	if (e.includes("\n")) throw new Ky("Event's event must not contain a newline character");
}
function eb(e) {
	if (!Number.isInteger(e) || e < 0) throw new Ky("Event's retry must be a integer and >= 0");
}
function tb(e) {
	if (e.includes("\n")) throw new Ky("Event's comment must not contain a newline character");
}
function nb(e) {
	let t = e?.split(/\n/) ?? [], n = "";
	for (let e of t) n += `data: ${e}
`;
	return n;
}
function rb(e) {
	let t = "";
	for (let n of e ?? []) tb(n), t += `: ${n}
`;
	return t;
}
function ib(e) {
	let t = "";
	return t += rb(e.comments), e.event !== void 0 && ($y(e.event), t += `event: ${e.event}
`), e.retry !== void 0 && (eb(e.retry), t += `retry: ${e.retry}
`), e.id !== void 0 && (Qy(e.id), t += `id: ${e.id}
`), t += nb(e.data), t += "\n", t;
}
var ab = Symbol("ORPC_EVENT_SOURCE_META");
function ob(e, t) {
	if (t.id === void 0 && t.retry === void 0 && !t.comments?.length) return e;
	if (t.id !== void 0 && Qy(t.id), t.retry !== void 0 && eb(t.retry), t.comments !== void 0) for (let e of t.comments) tb(e);
	return new Proxy(e, { get(e, n, r) {
		return n === ab ? t : Reflect.get(e, n, r);
	} });
}
function sb(e) {
	return Oy(e) ? Reflect.get(e, ab) : void 0;
}
function cb(e) {
	return `inline; filename="${e.replace(/"/g, "\\\"")}"; filename*=utf-8''${encodeURIComponent(e).replace(/['()*]/g, (e) => `%${e.charCodeAt(0).toString(16).toUpperCase()}`).replace(/%(7C|60|5E)/g, (e, t) => String.fromCharCode(Number.parseInt(t, 16)))}`;
}
function lb(e) {
	let t = e.match(/filename\*=(UTF-8'')?([^;]*)/i);
	if (t && typeof t[2] == "string") return Ny(t[2]);
	let n = e.match(/filename="((?:\\"|[^"])*)"/i);
	if (n && typeof n[1] == "string") return n[1].replace(/\\"/g, "\"");
}
function ub(e, t) {
	let n = { ...e };
	for (let e in t) Array.isArray(t[e]) ? n[e] = [...iy(n[e]), ...t[e]] : t[e] !== void 0 && (Array.isArray(n[e]) ? n[e] = [...n[e], t[e]] : n[e] === void 0 ? n[e] = t[e] : n[e] = [n[e], t[e]]);
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@orpc+client@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/client/dist/shared/client.BLtwTQUg.mjs
function db(e, t) {
	let n = async (e) => {
		let n = await t.error(e);
		if (n !== e) {
			let t = sb(e);
			t && Oy(n) && (n = ob(n, t));
		}
		return n;
	};
	return new xy(async () => {
		let { done: r, value: i } = await (async () => {
			try {
				return await e.next();
			} catch (e) {
				throw await n(e);
			}
		})(), a = await t.value(i, r);
		if (a !== i) {
			let e = sb(i);
			e && Oy(a) && (a = ob(a, e));
		}
		return {
			done: r,
			value: a
		};
	}, async () => {
		try {
			await e.return?.();
		} catch (e) {
			throw await n(e);
		}
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@orpc+client@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/client/dist/index.mjs
function fb(e) {
	return {
		...e,
		context: e.context ?? {}
	};
}
function pb(e, t = {}) {
	let n = t.path ?? [];
	return Ay(new Proxy(async (...[t, r = {}]) => await e.call(n, t, fb(r)), { get(r, i) {
		return typeof i == "string" ? pb(e, {
			...t,
			path: [...n, i]
		}) : Reflect.get(r, i);
	} }));
}
//#endregion
//#region ../../node_modules/.pnpm/@orpc+standard-server-fetch@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/standard-server-fetch/dist/index.mjs
function mb(e, t = {}) {
	let n = (e?.pipeThrough(new TextDecoderStream()).pipeThrough(new Zy()))?.getReader(), r, i = !1;
	return new xy(async () => {
		r ??= my("consume_event_iterator_stream");
		try {
			for (;;) {
				if (n === void 0) return {
					done: !0,
					value: void 0
				};
				let { done: e, value: t } = await vy(r, () => n.read());
				if (e) {
					if (i) throw new cy("Stream was cancelled");
					return {
						done: !0,
						value: void 0
					};
				}
				switch (t.event) {
					case "message": {
						let e = wy(t.data);
						return Oy(e) && (e = ob(e, t)), r?.addEvent("message"), {
							done: !1,
							value: e
						};
					}
					case "error": {
						let e = new Jy({ data: wy(t.data) });
						throw e = ob(e, t), r?.addEvent("error"), e;
					}
					case "done": {
						let e = wy(t.data);
						return Oy(e) && (e = ob(e, t)), r?.addEvent("done"), {
							done: !0,
							value: e
						};
					}
					default: r?.addEvent("maybe_keepalive");
				}
			}
		} catch (e) {
			throw e instanceof Jy || hy(r, e, t), e;
		}
	}, async (e) => {
		try {
			e !== "next" && (i = !0, r?.addEvent("cancelled")), await vy(r, () => n?.cancel());
		} catch (e) {
			throw hy(r, e, t), e;
		} finally {
			r?.end();
		}
	});
}
function hb(e, t = {}) {
	let n = t.eventIteratorKeepAliveEnabled ?? !0, r = t.eventIteratorKeepAliveInterval ?? 5e3, i = t.eventIteratorKeepAliveComment ?? "", a = t.eventIteratorInitialCommentEnabled ?? !0, o = t.eventIteratorInitialComment ?? "", s = !1, c, l;
	return new ReadableStream({
		start(e) {
			l = my("stream_event_iterator"), a && e.enqueue(ib({ comments: [o] }));
		},
		async pull(t) {
			try {
				n && (c = setInterval(() => {
					t.enqueue(ib({ comments: [i] })), l?.addEvent("keepalive");
				}, r));
				let a = await vy(l, () => e.next());
				if (clearInterval(c), s) return;
				let o = sb(a.value);
				if (!a.done || a.value !== void 0 || o !== void 0) {
					let e = a.done ? "done" : "message";
					t.enqueue(ib({
						...o,
						event: e,
						data: Ty(a.value)
					})), l?.addEvent(e);
				}
				a.done && (t.close(), l?.end());
			} catch (e) {
				if (clearInterval(c), s) return;
				e instanceof Jy ? (t.enqueue(ib({
					...sb(e),
					event: "error",
					data: Ty(e.data)
				})), l?.addEvent("error"), t.close()) : (hy(l, e), t.error(e)), l?.end();
			}
		},
		async cancel() {
			try {
				s = !0, clearInterval(c), l?.addEvent("cancelled"), await vy(l, () => e.return?.());
			} catch (e) {
				throw hy(l, e), e;
			} finally {
				l?.end();
			}
		}
	}).pipeThrough(new TextEncoderStream());
}
function gb(e, t = {}) {
	return _y({
		name: "parse_standard_body",
		signal: t.signal
	}, async () => {
		let n = e.headers.get("content-disposition");
		if (typeof n == "string") {
			let t = lb(n) ?? "blob", r = await e.blob();
			return new File([r], t, { type: r.type });
		}
		let r = e.headers.get("content-type");
		if (!r || r.startsWith("application/json")) return wy(await e.text());
		if (r.startsWith("multipart/form-data")) return await e.formData();
		if (r.startsWith("application/x-www-form-urlencoded")) {
			let t = await e.text();
			return new URLSearchParams(t);
		}
		if (r.startsWith("text/event-stream")) return mb(e.body, t);
		if (r.startsWith("text/plain")) return await e.text();
		let i = await e.blob();
		return new File([i], "blob", { type: i.type });
	});
}
function _b(e, t, n = {}) {
	let r = t.get("content-disposition");
	if (t.delete("content-type"), t.delete("content-disposition"), e !== void 0) return e instanceof Blob ? (t.set("content-type", e.type), t.set("content-length", e.size.toString()), t.set("content-disposition", r ?? cb(e instanceof File ? e.name : "blob")), e) : e instanceof FormData || e instanceof URLSearchParams ? e : yy(e) ? (t.set("content-type", "text/event-stream"), hb(e, n)) : (t.set("content-type", "application/json"), Ty(e));
}
function vb(e, t = {}) {
	return e.forEach((e, n) => {
		Array.isArray(t[n]) ? t[n].push(e) : t[n] === void 0 ? t[n] = e : t[n] = [t[n], e];
	}), t;
}
function yb(e, t = new Headers()) {
	for (let [n, r] of Object.entries(e)) if (Array.isArray(r)) for (let e of r) t.append(n, e);
	else r !== void 0 && t.append(n, r);
	return t;
}
function bb(e, t = {}) {
	let n = yb(e.headers), r = _b(e.body, n, t);
	return new Request(e.url, {
		signal: e.signal,
		method: e.method,
		headers: n,
		body: r
	});
}
function xb(e, t = {}) {
	return {
		body: ly(() => gb(e, t)),
		status: e.status,
		get headers() {
			let t = vb(e.headers);
			return Object.defineProperty(this, "headers", {
				value: t,
				writable: !0
			}), t;
		},
		set headers(e) {
			Object.defineProperty(this, "headers", {
				value: e,
				writable: !0
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@orpc+client@1.13.6_@opentelemetry+api@1.9.0/node_modules/@orpc/client/dist/shared/client.vZdLqpTj.mjs
var Sb = class {
	plugins;
	constructor(e = []) {
		this.plugins = [...e].sort((e, t) => (e.order ?? 0) - (t.order ?? 0));
	}
	init(e) {
		for (let t of this.plugins) t.init?.(e);
	}
}, Cb = class {
	constructor(e, t, n = {}) {
		this.codec = e, this.sender = t, new Sb(n.plugins).init(n), this.interceptors = iy(n.interceptors), this.clientInterceptors = iy(n.clientInterceptors);
	}
	interceptors;
	clientInterceptors;
	call(e, t, n) {
		return _y({
			name: `${ay}.${e.join("/")}`,
			signal: n.signal
		}, (r) => (r?.setAttribute("rpc.system", ay), r?.setAttribute("rpc.method", e.join(".")), yy(t) && (t = Sy({
			name: "consume_event_iterator_input",
			signal: n.signal
		}, t)), Cy(this.interceptors, {
			...n,
			path: e,
			input: t
		}, async ({ path: e, input: t, ...n }) => {
			let i = py(), a, o = i?.trace.getActiveSpan() ?? r;
			o && i && (a = i?.trace.setSpan(i.context.active(), o));
			let s = await _y({
				name: "encode_request",
				context: a
			}, () => this.codec.encode(e, t, n)), c = await Cy(this.clientInterceptors, {
				...n,
				input: t,
				path: e,
				request: s
			}, ({ input: e, path: t, request: n, ...r }) => _y({
				name: "send_request",
				signal: r.signal,
				context: a
			}, () => this.sender.call(n, r, t, e))), l = await _y({
				name: "decode_response",
				context: a
			}, () => this.codec.decode(c, n, e, t));
			return yy(l) ? Sy({
				name: "consume_event_iterator_output",
				signal: n.signal
			}, l) : l;
		})));
	}
}, wb = {
	BIGINT: 0,
	DATE: 1,
	NAN: 2,
	UNDEFINED: 3,
	URL: 4,
	REGEXP: 5,
	SET: 6,
	MAP: 7
}, Tb = class {
	customSerializers;
	constructor(e = {}) {
		if (this.customSerializers = e.customJsonSerializers ?? [], this.customSerializers.length !== new Set(this.customSerializers.map((e) => e.type)).size) throw Error("Custom serializer type must be unique.");
	}
	serialize(e, t = [], n = [], r = [], i = []) {
		for (let a of this.customSerializers) if (a.condition(e)) {
			let o = this.serialize(a.serialize(e), t, n, r, i);
			return n.push([a.type, ...t]), o;
		}
		if (e instanceof Blob) return r.push(t), i.push(e), [
			e,
			n,
			r,
			i
		];
		if (typeof e == "bigint") return n.push([wb.BIGINT, ...t]), [
			e.toString(),
			n,
			r,
			i
		];
		if (e instanceof Date) return n.push([wb.DATE, ...t]), Number.isNaN(e.getTime()) ? [
			null,
			n,
			r,
			i
		] : [
			e.toISOString(),
			n,
			r,
			i
		];
		if (Number.isNaN(e)) return n.push([wb.NAN, ...t]), [
			null,
			n,
			r,
			i
		];
		if (e instanceof URL) return n.push([wb.URL, ...t]), [
			e.toString(),
			n,
			r,
			i
		];
		if (e instanceof RegExp) return n.push([wb.REGEXP, ...t]), [
			e.toString(),
			n,
			r,
			i
		];
		if (e instanceof Set) {
			let a = this.serialize(Array.from(e), t, n, r, i);
			return n.push([wb.SET, ...t]), a;
		}
		if (e instanceof Map) {
			let a = this.serialize(Array.from(e.entries()), t, n, r, i);
			return n.push([wb.MAP, ...t]), a;
		}
		if (Array.isArray(e)) return [
			e.map((e, a) => e === void 0 ? (n.push([
				wb.UNDEFINED,
				...t,
				a
			]), e) : this.serialize(e, [...t, a], n, r, i)[0]),
			n,
			r,
			i
		];
		if (Dy(e)) {
			let a = {};
			for (let o in e) o === "toJSON" && typeof e[o] == "function" || (a[o] = this.serialize(e[o], [...t, o], n, r, i)[0]);
			return [
				a,
				n,
				r,
				i
			];
		}
		return [
			e,
			n,
			r,
			i
		];
	}
	deserialize(e, t, n, r) {
		let i = { data: e };
		n && r && n.forEach((e, t) => {
			let n = i, a = "data";
			e.forEach((e) => {
				if (n = n[a], a = e, !Object.hasOwn(n, a)) throw Error(`Security error: accessing non-existent path during deserialization. Path segment: ${a}`);
			}), n[a] = r(t);
		});
		for (let e of t) {
			let t = e[0], n = i, r = "data";
			for (let t = 1; t < e.length; t++) if (n = n[r], r = e[t], !Object.hasOwn(n, r)) throw Error(`Security error: accessing non-existent path during deserialization. Path segment: ${r}`);
			for (let e of this.customSerializers) if (e.type === t) {
				n[r] = e.deserialize(n[r]);
				break;
			}
			switch (t) {
				case wb.BIGINT:
					n[r] = BigInt(n[r]);
					break;
				case wb.DATE:
					n[r] = new Date(n[r] ?? "Invalid Date");
					break;
				case wb.NAN:
					n[r] = NaN;
					break;
				case wb.UNDEFINED:
					n[r] = void 0;
					break;
				case wb.URL:
					n[r] = new URL(n[r]);
					break;
				case wb.REGEXP: {
					let [, e, t] = n[r].match(/^\/(.*)\/([a-z]*)$/);
					n[r] = new RegExp(e, t);
					break;
				}
				case wb.SET:
					n[r] = new Set(n[r]);
					break;
				case wb.MAP:
					n[r] = new Map(n[r]);
					break;
			}
		}
		return i.data;
	}
};
function Eb(e) {
	return `/${e.map(encodeURIComponent).join("/")}`;
}
function Db(e) {
	return typeof e.forEach == "function" ? vb(e) : e;
}
function Ob(e) {
	return Object.entries(Iy).find(([, t]) => t.status === e)?.[0] ?? "MALFORMED_ORPC_ERROR_RESPONSE";
}
var kb = class {
	constructor(e, t) {
		this.serializer = e, this.baseUrl = t.url, this.maxUrlLength = t.maxUrlLength ?? 2083, this.fallbackMethod = t.fallbackMethod ?? "POST", this.expectedMethod = t.method ?? this.fallbackMethod, this.headers = t.headers ?? {};
	}
	baseUrl;
	maxUrlLength;
	fallbackMethod;
	expectedMethod;
	headers;
	async encode(e, t, n) {
		let r = Db(await ky(this.headers, n, e, t));
		n.lastEventId !== void 0 && (r = ub(r, { "last-event-id": n.lastEventId }));
		let i = await ky(this.expectedMethod, n, e, t), a = await ky(this.baseUrl, n, e, t), o = new URL(a);
		o.pathname = `${o.pathname.replace(/\/$/, "")}${Eb(e)}`;
		let s = this.serializer.serialize(t);
		if (i === "GET" && !(s instanceof FormData) && !yy(s)) {
			let a = await ky(this.maxUrlLength, n, e, t), c = new URL(o);
			if (c.searchParams.append("data", Ty(s)), c.toString().length <= a) return {
				body: void 0,
				method: i,
				headers: r,
				url: c,
				signal: n.signal
			};
		}
		return {
			url: o,
			method: i === "GET" ? this.fallbackMethod : i,
			headers: r,
			body: s,
			signal: n.signal
		};
	}
	async decode(e) {
		let t = !Uy(e.status), n = await (async () => {
			let t = !1;
			try {
				let n = await e.body();
				return t = !0, this.serializer.deserialize(n);
			} catch (e) {
				throw Error(t ? "Invalid RPC response format." : "Cannot parse response body, please check the response body and content-type.", { cause: e });
			}
		})();
		if (!t) throw Wy(n) ? Gy(n) : new Vy(Ob(e.status), {
			status: e.status,
			data: {
				...e,
				body: n
			}
		});
		return n;
	}
}, Ab = class {
	constructor(e) {
		this.jsonSerializer = e;
	}
	serialize(e) {
		return yy(e) ? db(e, {
			value: async (e) => this.#e(e, !1),
			error: async (e) => new Jy({
				data: this.#e(Hy(e).toJSON(), !1),
				cause: e
			})
		}) : this.#e(e, !0);
	}
	#e(e, t) {
		let [n, r, i, a] = this.jsonSerializer.serialize(e), o = r.length === 0 ? void 0 : r;
		if (!t || a.length === 0) return {
			json: n,
			meta: o
		};
		let s = new FormData();
		return s.set("data", Ty({
			json: n,
			meta: o,
			maps: i
		})), a.forEach((e, t) => {
			s.set(t.toString(), e);
		}), s;
	}
	deserialize(e) {
		return yy(e) ? db(e, {
			value: async (e) => this.#t(e),
			error: async (e) => {
				if (!(e instanceof Jy)) return e;
				let t = this.#t(e.data);
				return Wy(t) ? Gy(t, { cause: e }) : new Jy({
					data: t,
					cause: e
				});
			}
		}) : this.#t(e);
	}
	#t(e) {
		if (e === void 0) return;
		if (!(e instanceof FormData)) return this.jsonSerializer.deserialize(e.json, e.meta ?? []);
		let t = JSON.parse(e.get("data"));
		return this.jsonSerializer.deserialize(t.json, t.meta ?? [], t.maps, (t) => e.get(t.toString()));
	}
}, jb = class extends Cb {
	constructor(e, t) {
		let n = new kb(new Ab(new Tb(t)), t);
		super(n, e, t);
	}
}, Mb = class extends Sb {
	initRuntimeAdapter(e) {
		for (let t of this.plugins) t.initRuntimeAdapter?.(e);
	}
}, Nb = class {
	fetch;
	toFetchRequestOptions;
	adapterInterceptors;
	constructor(e) {
		new Mb(e.plugins).initRuntimeAdapter(e), this.fetch = e.fetch ?? globalThis.fetch.bind(globalThis), this.toFetchRequestOptions = e, this.adapterInterceptors = iy(e.adapterInterceptors);
	}
	async call(e, t, n, r) {
		let i = bb(e, this.toFetchRequestOptions);
		return xb(await Cy(this.adapterInterceptors, {
			...t,
			request: i,
			path: n,
			input: r,
			init: { redirect: "manual" }
		}, ({ request: e, path: t, input: n, init: r, ...i }) => this.fetch(e, r, i, t, n)), { signal: i.signal });
	}
}, Pb = pb(new class extends jb {
	constructor(e) {
		let t = new Nb(e);
		super(t, e);
	}
}({
	url: `${M.VITE_SERVER_URL}/rpc`,
	headers: async () => {
		let e = await Z.Auth.getToken();
		return e ? { Authorization: `Bearer ${e}` } : {};
	}
})), Fb;
(function(e) {
	let t = !1, n = !1;
	function r() {
		i.on("before-quit", () => {
			t = !0;
		});
	}
	e.init = r;
	function a() {
		t || n || (n = !0, o.showMessageBox({
			type: "error",
			title: "Something went wrong",
			message: "Cluely ran into a problem and needs to restart.",
			detail: "If this keeps happening, please contact support.",
			buttons: ["Quit", "Restart"],
			defaultId: 1,
			cancelId: 0,
			noLink: !0
		}).then((e) => {
			if (e.response === 1) {
				i.relaunch(), i.exit(0);
				return;
			}
			i.quit();
		}));
	}
	e.requireErrorRestart = a;
})(Fb ||= {});
//#endregion
//#region electron/domains/recall.ts
var Ib;
(function(e) {
	let t = null, n = Promise.resolve(), r = !1, i = /* @__PURE__ */ new Set();
	function a() {
		s() && (k.addEventListener("recording-ended", (e) => {
			i.has(e.window.id) || Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1,
				session: null,
				showSessionDisconnectedModal: !0
			});
		}), k.addEventListener("error", (e) => {
			_.error("Recall SDK error event:", e);
		}), k.addEventListener("realtime-event", p), k.addEventListener("meeting-detected", (e) => {
			let t = Q.getSharedState(), n = e.window.platform?.trim();
			n && !t.session && !t.meetingNotification && Q.patchSharedState({ meetingNotification: {
				source: "detection",
				recallWindow: { platform: n }
			} });
		}), o(Q.getSharedState()));
	}
	e.init = a;
	function o(e) {
		s() && (!r && Z.areAppWindowsLoaded(e) && (r = !0, l().catch((e) => {
			_.error("Failed to initialize Recall SDK:", e), Fb.requireErrorRestart();
		})), e.recallSdkInitialized && (n = n.then(async () => {
			await u(e);
		}).catch((e) => {
			_.error("Failed to sync Recall recording state:", e), Fb.requireErrorRestart();
		})));
	}
	e.update = o;
	function s() {
		return !(process.platform === "darwin" && (T.arch() === "x64" || !c()) || process.env.CLUELY_TEST_NATIVE_AUDIO);
	}
	e.isSupported = s;
	function c() {
		let e = T.release(), t = Number.parseInt(e.split(".")[0] ?? "", 10);
		return Number.isFinite(t) ? t >= 22 : !1;
	}
	async function l() {
		_.info("Initializing Recall SDK..."), await k.init({
			apiUrl: "https://us-west-2.recall.ai",
			restartOnError: !0,
			acquirePermissionsOnStartup: []
		}), Q.patchSharedState({ recallSdkInitialized: !0 }), _.info("Recall SDK initialized successfully.");
	}
	async function u(e) {
		let n = e.session;
		if (!n) {
			await f();
			return;
		}
		if (t?.sessionId === n.id) return;
		await f();
		let r = await k.prepareDesktopAudioRecording();
		await k.startRecording({
			windowId: r,
			uploadToken: n.recallSdkRecording.uploadToken
		}), t = {
			windowId: r,
			sessionId: n.id
		}, _.info("Started Recall recording for window", r);
	}
	let d = /* @__PURE__ */ new Map();
	async function f() {
		d.clear(), t &&= (i.add(t.windowId), await k.stopRecording({ windowId: t.windowId }), _.info("Stopped Recall recording for window", t.windowId), null);
	}
	function p(e) {
		let t = Q.getSharedState().session;
		if (!t) return;
		let n = m.safeParse(e.data);
		if (!n.success) return;
		let { participant: r, words: i } = n.data.data, a = i[0];
		if (!a) return;
		let o = d.get(a.start_timestamp.absolute) ?? /* @__PURE__ */ new Date();
		d.set(a.start_timestamp.absolute, o);
		let s = {
			createdAt: a.start_timestamp.absolute,
			relativeMs: o.getTime() - new Date(t.createdOrResumedAt).getTime(),
			role: r.is_host ? "me" : "them",
			text: i.map((e) => e.text).join(" ")
		}, c = t.transcript;
		t.partialTranscriptEntry && t.partialTranscriptEntry.createdAt !== s.createdAt && (c = [...t.transcript, t.partialTranscriptEntry], c = _e(c, (e) => e.createdAt)), Q.patchSharedState({ session: {
			...t,
			transcript: c,
			partialTranscriptEntry: s
		} });
	}
	let m = q.object({ data: q.object({
		participant: q.object({ is_host: q.boolean() }),
		words: q.object({
			text: q.string(),
			start_timestamp: q.object({ absolute: q.string() })
		}).array()
	}) });
})(Ib ||= {});
//#endregion
//#region electron/domains/native-audio.ts
var Lb;
(function(t) {
	let n = null, r = null, i = null, a = null, o = null, s = null;
	function c() {
		Ib.isSupported() || (process.env.PATH = [e.join(Qv, "sox-14.4.2-macosx"), process.env.PATH].join(e.delimiter), l(Q.getSharedState()));
	}
	t.init = c;
	function l(e) {
		if (!Ib.isSupported()) try {
			if (!e.session) {
				n?.destroy(), n = null, r?.destroy(), r = null, i &&= (clearTimeout(i), null), a?.destroy(), a = null, o?.destroy(), o = null, s &&= (clearTimeout(s), null);
				return;
			}
			let t = e.session.recallSdkRecording.assemblyAiSpeechModel, c = new Date(e.session.createdOrResumedAt);
			n ||= new d(), r ||= new p(t, "me", c, n.stream(), () => {
				i ||= (_.info("Retrying mic assembly service in 5 seconds..."), setTimeout(() => {
					i = null, n?.destroy(), n = null, r?.destroy(), r = null, l(Q.getSharedState());
				}, 5e3));
			}), a ||= new f(), o ||= new p(t, "them", c, a.stream(), () => {
				s ||= (_.info("Retrying system assembly service in 5 seconds..."), setTimeout(() => {
					s = null, a?.destroy(), a = null, o?.destroy(), o = null, l(Q.getSharedState());
				}, 5e3));
			});
		} catch (e) {
			_.error("Error initializing NativeAudio services:", e), Fb.requireErrorRestart();
		}
	}
	t.update = l;
	let u = 48e3;
	class d {
		recording;
		constructor() {
			this.recording = oe.record({
				channels: 1,
				sampleRate: u,
				audioType: "wav"
			});
		}
		destroy() {
			try {
				this.recording.stop();
			} catch (e) {
				_.error("[MicRecordingService] Error stopping:", e);
			}
		}
		stream() {
			return this.recording.stream();
		}
	}
	class f {
		readable;
		audiotee;
		constructor() {
			this.audiotee = new ny({
				sampleRate: u,
				chunkDurationMs: 50,
				binaryPath: e.join(Qv, "audiotee-0.0.7", "audiotee")
			}), this.readable = new D({ read() {} }), this.audiotee.on("data", ({ data: e }) => {
				this.readable.push(e);
			}), this.audiotee.on("error", (e) => {
				_.error("[SystemRecordingService] Error:", e), this.readable.destroy(e);
			}), this.audiotee.start().catch((e) => {
				_.error("[SystemRecordingService] Error starting:", e), this.readable.destroy(e);
			});
		}
		destroy() {
			this.readable.push(null), this.audiotee.stop().catch((e) => {
				_.error("[SystemRecordingService] Error stopping:", e);
			});
		}
		stream() {
			return this.readable;
		}
	}
	class p {
		tag;
		transcriber = null;
		transcriberPingInterval = null;
		transcriberLastSeenAtMs = Date.now();
		currentTurnStartMs = null;
		isDestroyed = !1;
		emittedError = !1;
		constructor(e, t, n, r, i) {
			this.speechModel = e, this.role = t, this.sessionCreatedOrResumedAt = n, this.recordingStream = r, this.onError = i, this.tag = `[AssemblyService:${this.role}]`, _.info(`${this.tag} Connecting...`), this.connect().then(() => {
				_.info(`${this.tag} Connected!`);
			}).catch((e) => {
				_.error(`${this.tag} Failed to connect:`, e), this.emitError();
			});
		}
		destroy() {
			this.isDestroyed || (_.info(`${this.tag} Destroying...`), this.isDestroyed = !0, this.transcriberPingInterval && clearInterval(this.transcriberPingInterval), this.transcriber?.close().catch((e) => {
				_.error(`${this.tag} Error closing during destroy:`, e);
			}));
		}
		async connect() {
			let { token: e } = await Pb.assemblyAi.createStreamingToken();
			if (_.info(`${this.tag} Obtained token`), !this.isDestroyed) {
				if (this.transcriber = this.createTranscriber(e), await this.transcriber.connect(), this.setUpHeartbeat(this.transcriber), this.isDestroyed) {
					this.transcriber.close().catch(() => {});
					return;
				}
				D.toWeb(this.recordingStream).pipeTo(this.transcriber.stream()).catch((e) => {
					_.error(`${this.tag} Recording stream error:`, e), this.emitError();
				});
			}
		}
		createTranscriber(e) {
			let t = new te({
				token: e,
				speechModel: this.speechModel,
				sampleRate: u
			});
			return t.on("turn", (e) => {
				this.handleTurn(e);
			}), t.on("error", (e) => {
				_.error(`${this.tag} Error:`, e), this.emitError();
			}), t.on("close", () => {
				_.info(`${this.tag} Closed`), this.emitError();
			}), t;
		}
		setUpHeartbeat(e) {
			let t = e.socket;
			t.on("pong", () => {
				this.transcriberLastSeenAtMs = Date.now();
			}), this.transcriberPingInterval = setInterval(() => {
				if (t.readyState === t.OPEN && t.ping(), Date.now() - this.transcriberLastSeenAtMs > 15e3) {
					if (this.emittedError) return;
					_.warn(`${this.tag} No pong received in 15 seconds, terminating`), this.emitError();
				}
			}, 3e3);
		}
		emitError() {
			this.isDestroyed || this.emittedError || (this.emittedError = !0, this.onError());
		}
		handleTurn(e) {
			if (this.isDestroyed) return;
			let { session: t } = Q.getSharedState();
			if (!t) return;
			let n = t.partialTranscriptEntry?.role === "them" && this.role === "me";
			this.currentTurnStartMs ||= Date.now();
			let r = new Date(this.currentTurnStartMs).toISOString(), i = this.currentTurnStartMs - this.sessionCreatedOrResumedAt.getTime();
			if (e.end_of_turn) {
				Q.patchSharedState({ session: {
					...t,
					transcript: [...t.transcript, {
						createdAt: r,
						relativeMs: i,
						role: this.role,
						text: e.transcript
					}],
					partialTranscriptEntry: n ? t.partialTranscriptEntry : void 0
				} }), this.currentTurnStartMs = null;
				return;
			}
			if (!n) {
				Q.patchSharedState({ session: {
					...t,
					partialTranscriptEntry: {
						createdAt: r,
						relativeMs: i,
						role: this.role,
						text: e.transcript
					}
				} });
				return;
			}
		}
	}
})(Lb ||= {});
//#endregion
//#region electron/domains/session.ts
var Rb;
(function(e) {
	let t = null, n = null;
	function r() {
		i(Q.getSharedState());
	}
	e.init = r;
	function i(e) {
		let t = e.session;
		if (!t || e.showSessionInactivityModal) {
			o(), n = null;
			return;
		}
		let r = {
			sessionId: t.id,
			transcriptLength: t.transcript.length,
			partialTranscriptText: t.partialTranscriptEntry?.text,
			messagesLength: t.messagesLength
		};
		n && Se(n, r) || (n = r, a());
	}
	e.update = i;
	function a() {
		o(), t = setTimeout(() => {
			t = null, Q.patchSharedState({
				showChat: !1,
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1,
				showSessionInactivityModal: !0
			});
		}, 6e5);
	}
	function o() {
		t &&= (clearTimeout(t), null);
	}
})(Rb ||= {});
//#endregion
//#region electron/domains/shortcuts.ts
var zb;
(function(e) {
	let t = {
		toggleVisibility: null,
		ask: null,
		clear: null,
		toggleSession: null,
		moveUp: null,
		moveDown: null,
		moveLeft: null,
		moveRight: null,
		scrollUp: null,
		scrollDown: null
	}, n = {
		toggleVisibility: () => {
			let e = Q.getSharedState(), t = !e.showChat;
			Q.patchSharedState({ showChat: t }), t && !e.isInvisible && Z.broadcastIpc("chat-focus-input"), t || Z.broadcastIpc("chat-blur-input");
		},
		ask: () => {
			Z.broadcastIpc("chat-submit");
		},
		clear: () => {
			Z.Chat.clearInputAndCollapse();
		},
		toggleSession: () => {
			Q.getSharedState().session ? Z.broadcastIpc("control-end-session") : Z.broadcastIpc("control-start-session");
		},
		moveUp: () => {
			Z.Control.moveBy({ deltaY: -80 });
		},
		moveDown: () => {
			Z.Control.moveBy({ deltaY: 80 });
		},
		moveLeft: () => {
			Z.Control.moveBy({ deltaX: -80 });
		},
		moveRight: () => {
			Z.Control.moveBy({ deltaX: 80 });
		},
		scrollUp: () => {
			Z.broadcastIpc("chat-scroll", { deltaY: -240 });
		},
		scrollDown: () => {
			Z.broadcastIpc("chat-scroll", { deltaY: 240 });
		}
	};
	function r() {
		i(Q.getSharedState());
	}
	e.init = r;
	function i(e) {
		let t = a(e);
		for (let n of Object.keys(e.shortcuts)) o({
			key: n,
			accelerator: e.shortcuts[n],
			shouldRegister: t[n]
		});
	}
	e.update = i;
	function a(e) {
		if (e.isRecordingShortcut) return {
			toggleVisibility: !1,
			ask: !1,
			clear: !1,
			toggleSession: !1,
			moveUp: !1,
			moveDown: !1,
			moveLeft: !1,
			moveRight: !1,
			scrollUp: !1,
			scrollDown: !1
		};
		let t = Z.areAppWindowsLoaded(e), n = t && (!!e.session || e.isAmbientEnabled), r = n && e.showChat;
		return {
			toggleVisibility: n,
			ask: r,
			clear: r,
			toggleSession: t,
			moveUp: n,
			moveDown: n,
			moveLeft: n,
			moveRight: n,
			scrollUp: r,
			scrollDown: r
		};
	}
	function o({ key: e, accelerator: r, shouldRegister: i }) {
		let a = t[e];
		if (a && a !== r && (s.unregister(a), t[e] = null, a = null), !i) {
			a && s.unregister(a), t[e] = null;
			return;
		}
		t[e] !== r && (s.register(r, n[e]) || _.error(`Failed to register global shortcut: ${r}`), t[e] = r);
	}
})(zb ||= {});
//#endregion
//#region electron/domains/tray.ts
var Bb;
(function(t) {
	let a = null, o = null, s = null;
	function c() {
		u(Q.getSharedState());
	}
	t.init = c;
	function u(t) {
		if (!Z.areAppWindowsLoaded(t) || t.isInvisible) {
			d();
			return;
		}
		let i = e.join(Zv, t.session ? "tray-active-template.png" : "tray-template.png");
		if (a && o !== i) {
			let e = l.createFromPath(i);
			e.setTemplateImage(!0), a.setImage(e), o = i;
		} else if (!a) {
			let e = l.createFromPath(i);
			e.setTemplateImage(!0), a = new r(e), a.setToolTip("Cluely"), process.platform !== "darwin" && a.on("click", () => {
				Q.patchSharedState({
					showDashboard: !0,
					dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
				});
			}), o = i;
		}
		let c = p(t);
		s && Se(s, c) || (a.setContextMenu(n.buildFromTemplate(f(c))), s = c);
	}
	t.update = u;
	function d() {
		a?.destroy(), a = null, o = null, s = null;
	}
	function f(e) {
		let t = {
			label: `${e.showChat ? "Hide" : "Show"} Cluely`,
			click: () => {
				let { showChat: e } = Q.getSharedState();
				Q.patchSharedState({ showChat: !e });
			}
		}, n = {
			label: e.isInvisible ? "Disable Invisibility" : "Enable Invisibility",
			click: () => {
				Q.patchSharedState({ isInvisible: !e.isInvisible });
			}
		}, r = {
			label: "View Sessions",
			click: () => {
				let e = Z.Dashboard.getWindow();
				e && (Z.navigate(e, { to: "/dashboard" }), Q.patchSharedState({
					showDashboard: !0,
					dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
				}));
			}
		}, a = {
			label: "Preferences",
			click: () => {
				let e = Z.Dashboard.getWindow();
				e && (Z.navigate(e, {
					to: "/dashboard",
					search: { settings: "general" }
				}), Q.patchSharedState({
					showDashboard: !0,
					dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
				}));
			}
		}, o = {
			label: "Start Listening",
			click: () => {
				Z.broadcastIpc("control-start-session");
			}
		}, s = {
			label: "Stop Listening",
			click: () => {
				Z.broadcastIpc("control-end-session");
			}
		}, c = {
			label: `Quit ${M.VITE_DESKTOP_PRODUCT_NAME}`,
			click: () => {
				i.quit();
			}
		}, l = { type: "separator" };
		return [
			e.hasSession ? null : o,
			e.isControlWindowShown ? t : null,
			e.isControlWindowShown ? n : null,
			l,
			r,
			a,
			l,
			e.hasSession ? s : null,
			c
		].filter((e) => e != null);
	}
	function p(e) {
		return {
			hasSession: e.session != null,
			showChat: e.showChat,
			isInvisible: e.isInvisible,
			isControlWindowShown: e.session != null || e.isAmbientEnabled
		};
	}
})(Bb ||= {});
//#endregion
//#region electron/domains/v1-migration.ts
var Vb;
(function(t) {
	let n;
	(function(t) {
		let n = e.join(i.getPath("userData"), "..", "cluely"), r = {
			invisible: e.join(n, "undetectability.enabled"),
			keybindings: e.join(n, "keybindings"),
			theme: e.join(n, "theme"),
			useScreenEnabled: e.join(n, "use_screen.enabled")
		};
		function a() {
			if (!y(n)) return {};
			let e = c(r.keybindings, l);
			return {
				permissions: {
					microphone: "granted",
					screen: "granted",
					accessibility: "granted"
				},
				isInvisible: o(r.invisible),
				shortcuts: e ? {
					clear: e.start_over,
					ask: e.trigger_ai,
					toggleVisibility: e.hide,
					moveUp: e.move_window_up,
					moveDown: e.move_window_down,
					moveLeft: e.move_window_left,
					moveRight: e.move_window_right,
					scrollUp: e.scroll_response_up,
					scrollDown: e.scroll_response_down,
					toggleSession: e.toggle_session
				} : Dm,
				finishedOnboarding: !0,
				theme: c(r.theme, u) ?? "system",
				screenUse: s(r.useScreenEnabled) ? "required" : "off"
			};
		}
		t.read = a;
		function o(e) {
			try {
				return y(e);
			} catch {
				return !1;
			}
		}
		function s(e) {
			try {
				return y(e) ? b(e, "utf-8").trim() === "true" : !0;
			} catch {
				return !0;
			}
		}
		function c(e, t) {
			try {
				let n = b(e).toString(), r = JSON.parse(n);
				return t.parse(r);
			} catch {
				return null;
			}
		}
		let l = q.object({
			start_over: q.string(),
			trigger_ai: q.string(),
			hide: q.string(),
			move_window_up: q.string(),
			move_window_down: q.string(),
			move_window_left: q.string(),
			move_window_right: q.string(),
			scroll_response_up: q.string(),
			scroll_response_down: q.string(),
			toggle_session: q.string()
		}), u = q.enum([
			"system",
			"light",
			"dark"
		]);
	})(n ||= t.OldState ||= {});
})(Vb ||= {});
//#endregion
//#region electron/domains/state.ts
var Q;
(function(t) {
	let n = "shared-state.json", r = {
		appVersion: i.getVersion(),
		systemInfo: {
			platform: process.platform,
			arch: process.arch,
			osRelease: T.release(),
			cpus: T.cpus().map((e) => e.model),
			cpuCount: T.cpus().length
		},
		autoUpdate: { status: "idle" },
		openAtLogin: !1,
		signInStatus: "loading",
		recallSdkInitialized: !1,
		isControlWindowLoaded: !1,
		isChatWindowLoaded: !1,
		isDashboardWindowLoaded: !1,
		isRecordingShortcut: !1,
		isChatRunning: !1,
		showChat: !0,
		showDashboard: !0,
		chatWindowIsExpanded: !1,
		isChatMoreMenuOpen: !1,
		isChatModesMenuOpen: !1,
		authRefreshCount: 0,
		dashboardFocusCount: 0,
		dashboardErrorMessage: null,
		session: null,
		lastSessionId: null,
		showSessionDisconnectedModal: !1,
		showSessionInactivityModal: !1,
		meetingNotification: null,
		handledMeetingNotificationIds: [],
		isCapturingScreenshot: !1
	}, a = {
		...km,
		...r
	}, o = a, s = !1, c = null, l = !1;
	async function u() {
		if (await ee(), await v(), !o.didMigrateV1State) {
			let e = Vb.OldState.read();
			p({
				didMigrateV1State: !0,
				...e
			}), console.log("Migrated V1 state:", JSON.stringify(e, null, 2));
		}
	}
	t.init = u;
	function d() {
		l = !0;
	}
	t.onFinishInit = d;
	function f() {
		return o;
	}
	t.getSharedState = f;
	function p(e) {
		Object.keys(e).length !== 0 && h({
			...o,
			...e
		});
	}
	t.patchSharedState = p;
	function m() {
		h({
			...km,
			...r
		});
	}
	t.resetAllState = m;
	function h(e) {
		let t = g(e);
		Se(o, t) || (o = t, b(), l && ($v.update(o), ey.update(o), Bb.update(o), Rb.update(o), Z.update(o), zb.update(o), Ib.update(o), Lb.update(o), Z.broadcastIpc("shared-state-updated", o)));
	}
	function g(e) {
		let t = { ...e };
		return Z.getPhase(t) !== "app" && (t.isControlWindowLoaded = !1, t.isChatWindowLoaded = !1, t.isDashboardWindowLoaded = !1, t.isRecordingShortcut = !1, t.isChatRunning = !1, t.showChat = !0, t.showDashboard = !0, t.chatWindowIsExpanded = !1, t.isChatMoreMenuOpen = !1, t.isChatModesMenuOpen = !1, t.dashboardErrorMessage = null, t.session = null, t.lastSessionId = null, t.meetingNotification = null, t.handledMeetingNotificationIds = [], t.isCapturingScreenshot = !1), t.session ? (t.meetingNotification = null, t.showSessionDisconnectedModal = !1) : t.showSessionInactivityModal = !1, t.lastSessionId || (t.showSessionDisconnectedModal = !1), t.showChat || (t.isChatMoreMenuOpen = !1, t.isChatModesMenuOpen = !1), t;
	}
	async function v() {
		let e = E();
		if (!y(e)) {
			o = a, await b();
			return;
		}
		let t;
		try {
			t = await S(e, "utf8");
		} catch (e) {
			_.error("Failed to read shared state from disk. Resetting.", e), o = a, await b();
			return;
		}
		let n;
		try {
			n = JSON.parse(t);
		} catch (e) {
			_.error("Failed to parse shared state JSON. Resetting.", e), o = a, await b();
			return;
		}
		let i = Om.safeParse(n);
		if (!i.success) {
			_.error("Shared state failed schema validation. Resetting.", i.error), o = a, await b();
			return;
		}
		o = {
			...i.data,
			...r
		};
	}
	function b() {
		return s = !0, c || (c = (async () => {
			let e = E(), t = `${e}.tmp`;
			try {
				for (; s;) {
					s = !1;
					let n = Om.parse(o);
					await w(t, `${JSON.stringify(n, null, 2)}\n`, "utf8"), await C(t, e);
				}
			} catch (e) {
				_.error("Failed to save shared state to disk.", e);
			} finally {
				c = null;
			}
		})(), c);
	}
	function E() {
		return e.join(i.getPath("userData"), n);
	}
	async function ee() {
		if (process.platform !== "darwin") return;
		let t = e.join(i.getPath("userData"), "..", "cluely-v2", n), r = E();
		if (y(t) && !y(r)) try {
			await x(t, r), _.info("Copied shared state to temp app data dir");
		} catch (e) {
			_.error("Failed to copy shared state to temp app data dir", e);
		}
	}
})(Q ||= {});
//#endregion
//#region electron/domains/auto-update.ts
var Hb;
(function(e) {
	let n = o();
	function r() {
		ge || (n.logger = _, n.setFeedURL(`https://${M.VITE_DESKTOP_RELEASES_DOMAIN}`), n.on("update-available", (e) => {
			Q.patchSharedState({ autoUpdate: {
				status: "update-available",
				version: e.version
			} });
		}), n.on("update-downloaded", (e) => {
			Q.patchSharedState({ autoUpdate: {
				status: "update-downloaded",
				version: e.version
			} });
		}), n.on("error", () => {
			Q.patchSharedState({ autoUpdate: { status: "idle" } });
		}), i(), setInterval(() => {
			i();
		}, 36e5));
	}
	e.init = r;
	async function i() {
		return ge ? !1 : (await n.checkForUpdates())?.isUpdateAvailable ?? !1;
	}
	e.checkForUpdates = i;
	function a() {
		for (let e of t.getAllWindows()) e.destroy();
		n.quitAndInstall();
	}
	e.restartToUpdate = a;
	function o() {
		let { autoUpdater: e } = v;
		return e;
	}
})(Hb ||= {});
//#endregion
//#region electron/domains/deep-link.ts
var Ub;
(function(e) {
	function t() {
		se.on("request", a), se.initialize({
			protocol: M.VITE_DESKTOP_SCHEME,
			mode: ge ? "development" : "production"
		}), _.info(`Initialized handler for for scheme: ${M.VITE_DESKTOP_SCHEME}://`), ge && (console.log("If you see errors like 'bootstrap_look_up XXX: Permission denied (1100)', run the following in repo root:"), console.log("sudo xattr -r -d com.apple.quarantine ./"));
	}
	e.init = t;
	let n = null;
	function r() {
		let e = n;
		return n = null, e;
	}
	e.consumeLastAuthToken = r;
	function a(e) {
		if (!URL.canParse(e)) return;
		let t = new URL(e);
		Q.patchSharedState({
			showDashboard: !0,
			dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
		}), process.platform !== "darwin" && i.focus();
		let r = Z.Auth.getWindow();
		if (t.hostname === "auth" && t.pathname === "/success" && r) {
			if (Q.getSharedState().signInStatus === "signed-in") return;
			n = t.searchParams.get("token"), Z.navigate(r, {
				to: "/auth/success",
				search: { key: crypto.randomUUID() }
			});
			return;
		}
		if (t.hostname === "auth" && t.pathname === "/refresh") {
			Q.patchSharedState({ authRefreshCount: Q.getSharedState().authRefreshCount + 1 });
			return;
		}
		if (t.hostname === "dashboard" && t.pathname === "/calendar-connected") {
			Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
			}), Z.broadcastIpc("dashboard-calendar-connected");
			return;
		}
	}
})(Ub ||= {});
//#endregion
//#region common/ipc.ts
var $;
(function(e) {
	function t(e, t) {
		c.on(e, (e, n) => {
			Gb(e.senderFrame), t(n);
		});
	}
	e.on = t;
	function n(e, t) {
		c.handle(e, (e, n) => (Gb(e.senderFrame), t(n)));
	}
	e.handle = n;
})($ ||= {});
var Wb = new URL(M.VITE_RENDERER_URL).origin;
function Gb(e) {
	if (!Kb(e)) throw Error(`Rejected IPC sender with invalid origin: ${e?.url}`);
}
function Kb(e) {
	return !e || !URL.canParse(e.url) ? !1 : new URL(e.url).origin === Wb;
}
//#endregion
//#region electron/domains/permissions.ts
var qb;
(function(e) {
	function t() {
		r();
	}
	e.init = t;
	async function n(e) {
		switch (e) {
			case "microphone":
				i(e, await g.askForMediaAccess("microphone") ? "granted" : "denied");
				break;
			case "screen":
				i(e, await s() ? "granted" : "denied");
				break;
			case "accessibility":
				i(e, g.isTrustedAccessibilityClient(!0) ? "granted" : "denied");
				break;
		}
	}
	e.askForAccess = n;
	function r() {
		if (process.platform !== "darwin") {
			Q.patchSharedState({ permissions: {
				microphone: "granted",
				screen: "granted",
				accessibility: "granted"
			} });
			return;
		}
		let e = Q.getSharedState(), t = { ...e.permissions };
		e.permissions.microphone !== "unknown" && (t.microphone = o(g.getMediaAccessStatus("microphone"))), e.permissions.screen !== "unknown" && (t.screen = o(g.getMediaAccessStatus("screen"))), e.permissions.accessibility !== "unknown" && (t.accessibility = g.isTrustedAccessibilityClient(!1) ? "granted" : "denied"), Q.patchSharedState({ permissions: t });
	}
	e.check = r;
	function i(e, t) {
		let n = Q.getSharedState();
		Q.patchSharedState({ permissions: {
			...n.permissions,
			[e]: t
		} });
	}
	function o(e) {
		return e === "granted" ? "granted" : e === "denied" || e === "restricted" ? "denied" : "unknown";
	}
	async function s() {
		try {
			return await a.getSources({ types: ["screen"] }), !0;
		} catch {
			return !1;
		}
	}
})(qb ||= {});
//#endregion
//#region electron/domains/screenshot.ts
var Jb;
(function(e) {
	let t = null;
	async function n() {
		let e = t;
		if (e) return await e;
		let n = (async () => {
			try {
				return Q.patchSharedState({ isCapturingScreenshot: !0 }), await ve({
					times: 3,
					delay: 500
				}, r);
			} finally {
				Q.patchSharedState({ isCapturingScreenshot: !1 }), t = null;
			}
		})();
		return t = n, await n;
	}
	e.capture = n;
	async function r() {
		let e = Z.Chat.getWindow(), t = e ? p.getDisplayMatching(e.getBounds()) : p.getPrimaryDisplay(), n = await a.getSources({
			types: ["screen"],
			thumbnailSize: {
				width: t.bounds.width,
				height: t.bounds.height
			}
		}), r = n.find((e) => e.display_id === t.id.toString()) ?? n[0];
		if (!r) throw Error(`Unable to capture screenshot: no display source found for display ${t.id}`);
		if (r.thumbnail.isEmpty()) throw Error("Unable to capture screenshot: thumbnail is empty");
		return {
			data: r.thumbnail.toPNG(),
			contentType: "image/png"
		};
	}
})(Jb ||= {});
//#endregion
//#region electron/domains/ipc.ts
var Yb;
(function(e) {
	function t() {
		$.on("quit-app", () => {
			i.quit();
		}), $.on("relaunch-app", () => {
			i.relaunch(), i.exit(0);
		}), $.on("reset-all-state", () => {
			Q.resetAllState();
		}), $.on("restart-to-update", () => {
			Hb.restartToUpdate();
		}), $.on("open-dashboard-session", ({ sessionId: e, createdAt: t, openDashboard: n }) => {
			let r = Z.Dashboard.getWindow();
			r && (Z.navigate(r, {
				to: "/dashboard/sessions/$sessionId",
				params: { sessionId: e },
				search: { createdAt: t }
			}), n && Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
			}));
		}), $.on("open-dashboard-billing", () => {
			let e = Z.Dashboard.getWindow();
			e && (Z.navigate(e, {
				to: "/dashboard",
				search: { settings: "billing" }
			}), Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
			}));
		}), $.on("open-dashboard-modes", () => {
			let e = Z.Dashboard.getWindow();
			e && (Z.navigate(e, {
				to: "/dashboard",
				search: { showModes: !0 }
			}), Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
			}));
		}), $.on("open-dashboard-shortcuts", () => {
			let e = Z.Dashboard.getWindow();
			e && (Z.navigate(e, {
				to: "/dashboard",
				search: { settings: "shortcuts" }
			}), Q.patchSharedState({
				showDashboard: !0,
				dashboardFocusCount: Q.getSharedState().dashboardFocusCount + 1
			}));
		}), $.on("control-window-drag", ({ x: e, y: t }) => {
			Z.Control.setPosition({
				x: e,
				y: t
			});
		}), $.on("control-window-drag-end", () => {
			Z.normalizeControlAndChatWindowPosition();
		}), $.on("control-window-reset-position", () => {
			Z.Control.resetPosition(), Z.Chat.resetHeight();
		}), $.on("control-window-toggle-chat", () => {
			let e = Q.getSharedState(), t = !e.showChat;
			Q.patchSharedState({ showChat: t }), t && !e.isInvisible && Z.broadcastIpc("chat-focus-input"), t || Z.broadcastIpc("chat-blur-input");
		}), $.on("chat-window-resize", ({ height: e }) => {
			Z.Chat.setHeight(e);
		}), $.on("chat-window-reset-size", () => {
			Z.Chat.resetHeight();
		}), $.on("permissions-check", () => {
			qb.check();
		}), $.on("permissions-ask-for-access", ({ device: e }) => {
			qb.askForAccess(e);
		}), $.on("mac-open-system-settings", ({ device: e }) => {
			r(e);
		}), $.handle("get-shared-state", async () => Q.getSharedState()), $.handle("patch-shared-state", (e) => {
			Q.patchSharedState(e);
		}), $.handle("consume-last-deep-link-auth-token", () => ({ token: Ub.consumeLastAuthToken() })), $.handle("check-for-updates", async () => ({ updateAvailable: await Hb.checkForUpdates() })), $.handle("capture-screenshot", async () => await Jb.capture());
	}
	e.init = t;
	function n(e) {
		switch (e) {
			case "microphone": return "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone";
			case "screen": return "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture";
			case "accessibility": return "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility";
		}
	}
	async function r(e) {
		e === "screen" && await qb.askForAccess(e), await h.openExternal(n(e));
	}
})(Yb ||= {});
//#endregion
//#region electron/domains/menu.ts
var Xb;
(function(e) {
	function t() {
		let e = n.buildFromTemplate([
			{
				role: "appMenu",
				submenu: [
					{ role: "about" },
					{ type: "separator" },
					{ role: "services" },
					{ type: "separator" },
					{
						label: "Hide Cluely",
						accelerator: "Cmd+H",
						click: () => {
							let e = Q.getSharedState();
							Z.areAppWindowsLoaded(e) ? r() : i.hide();
						}
					},
					{ role: "hideOthers" },
					{ role: "unhide" },
					{ type: "separator" },
					...M.VITE_IS_PROD === "true" ? [] : [{
						label: "Developer Tools",
						submenu: [
							{
								label: "Toggle DevTools: Auth",
								click: () => a(Z.Auth.getWindow(), { mode: "detach" })
							},
							{
								label: "Toggle DevTools: Onboarding",
								click: () => a(Z.Onboarding.getWindow(), { mode: "detach" })
							},
							{
								label: "Toggle DevTools: Control",
								click: () => a(Z.Control.getWindow(), { mode: "detach" })
							},
							{
								label: "Toggle DevTools: Chat",
								click: () => a(Z.Chat.getWindow(), { mode: "detach" })
							},
							{
								label: "Toggle DevTools: Dashboard",
								click: () => a(Z.Dashboard.getWindow())
							},
							{
								label: "Toggle DevTools: Notification",
								click: () => a(Z.MeetingNotification.getWindow(), { mode: "detach" })
							}
						]
					}, { type: "separator" }],
					{
						label: "Quit Cluely",
						accelerator: "Cmd+Q",
						click: () => {
							let e = Q.getSharedState();
							Z.areAppWindowsLoaded(e) ? r() : i.quit();
						}
					}
				]
			},
			{ role: "fileMenu" },
			{ role: "editMenu" }
		]);
		n.setApplicationMenu(e);
	}
	e.init = t;
	function r() {
		Q.patchSharedState({
			showChat: !1,
			showDashboard: !1
		}), i.hide();
	}
	function a(e, t) {
		e && (e.webContents.isDevToolsOpened() ? e.webContents.closeDevTools() : e.webContents.openDevTools(t));
	}
})(Xb ||= {});
//#endregion
//#region electron/utils/log.ts
var Zb = Qb("error", (e) => {
	Z.broadcastIpc("electron-main-error-log", { message: e.data.map($b).join(" ") });
});
function Qb(e, t) {
	return Object.assign(t, {
		level: e,
		transforms: []
	});
}
function $b(e) {
	if (e instanceof Error) return e.stack ?? e.message;
	if (typeof e == "object") try {
		return JSON.stringify(e);
	} catch {}
	return String(e);
}
!ge && process.platform === "darwin" && !i.isInApplicationsFolder() && i.moveToApplicationsFolder(), i.requestSingleInstanceLock() || i.quit(), i.setName(M.VITE_DESKTOP_PRODUCT_NAME);
var ex = e.join(i.getPath("appData"), process.platform === "darwin" ? `${M.VITE_DESKTOP_SCHEME}-april22` : M.VITE_DESKTOP_SCHEME);
i.setPath("userData", ex), _.transports.ipc.level = !1, process.platform === "darwin" && (_.transports.file.resolvePathFn = ({ libraryDefaultDir: t }) => e.join(t, "..", M.VITE_DESKTOP_SCHEME, "main.log")), _.transports.forwardToRenderer = Zb, _.initialize(), _.errorHandler.startCatching({ showDialog: !1 }), _.info("Writing logs to:", _.transports.file.getFile().path), i.whenReady().then(async () => {
	await Q.init(), Fb.init(), Yb.init(), ey.init(), $v.init(), Bb.init(), Xb.init(), qb.init(), zb.init(), Rb.init(), Z.init(), Ub.init(), Hb.init(), Ib.init(), Lb.init(), Q.onFinishInit();
}).catch((e) => {
	_.error("Failed during Electron startup:", e), Fb.requireErrorRestart();
});
//#endregion
