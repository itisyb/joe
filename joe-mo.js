// Version: 2026-04-05
// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

// Minimap: hide until JS lays out (avoids FOUC). Earliest possible inject; for zero flash before
// this script runs, mirror this in Webflow Head: .minimap_wrap:not(.minimap--ready){opacity:0;pointer-events:none}
(function injectMinimapFoucStyleOnce() {
	if (typeof document === "undefined") return;
	function inject() {
		if (document.getElementById("jjn-minimap-fouc")) return;
		var st = document.createElement("style");
		st.id = "jjn-minimap-fouc";
		var rm =
			typeof matchMedia !== "undefined" &&
			matchMedia("(prefers-reduced-motion: reduce)").matches;
		st.textContent =
			".minimap_wrap:not(.minimap--ready){opacity:0!important;pointer-events:none!important}" +
			".minimap_wrap.minimap--ready{opacity:1!important;pointer-events:auto" +
			(rm ? "" : ";transition:opacity .22s ease") +
			"}";
		var h = document.head || document.getElementsByTagName("head")[0];
		if (h) h.appendChild(st);
		else document.documentElement.appendChild(st);
	}
	if (document.head || document.getElementsByTagName("head")[0]) inject();
	else document.addEventListener("DOMContentLoaded", inject);
})();

// Mobile nav menu: hide until JS primes the closed state to avoid random refresh flashes.
// For zero flash before this file runs, mirror this in Webflow Head.
(function injectNavMenuFoucStyleOnce() {
	if (typeof document === "undefined") return;
	function inject() {
		if (document.getElementById("jjn-nav-menu-fouc")) return;
		var st = document.createElement("style");
		st.id = "jjn-nav-menu-fouc";
		st.textContent =
			".nav_menu_wrap:not(.nav-menu--ready){visibility:hidden!important;pointer-events:none!important;clip-path:inset(0 0 100% 0)!important}" +
			".nav_menu_wrap:not(.nav-menu--ready) .nav_mobile_link_wrap{opacity:0!important;transform:translateY(.75rem)!important}";
		var h = document.head || document.getElementsByTagName("head")[0];
		if (h) h.appendChild(st);
		else document.documentElement.appendChild(st);
	}
	if (document.head || document.getElementsByTagName("head")[0]) inject();
	else document.addEventListener("DOMContentLoaded", inject);
})();

// Hero preload: hide nav + sublines until JS applies the initial preload state.
// For zero flash before this file runs, mirror this in Webflow Head.
(function injectHeroPreloadFoucStyleOnce() {
	if (typeof document === "undefined") return;
	function inject() {
		if (document.getElementById("jjn-hero-preload-fouc")) return;
		var st = document.createElement("style");
		st.id = "jjn-hero-preload-fouc";
		st.textContent =
			"body:has([data-hero-preload-root]) [data-hero-preload-nav]:not([data-hero-preload-primed]){opacity:0!important;visibility:hidden!important;pointer-events:none!important}" +
			"[data-hero-preload-root]:not([data-hero-preload-primed]) [data-hero-preload-headline]," +
			"[data-hero-preload-root]:not([data-hero-preload-primed]) .hero_close_title," +
			"[data-hero-preload-root]:not([data-hero-preload-primed]) [data-hero-timecode]," +
			"[data-hero-preload-root]:not([data-hero-preload-primed]) [data-hero-preload-subline]{opacity:0!important;visibility:hidden!important}";
		var h = document.head || document.getElementsByTagName("head")[0];
		if (h) h.appendChild(st);
		else document.documentElement.appendChild(st);
	}
	if (document.head || document.getElementsByTagName("head")[0]) inject();
	else document.addEventListener("DOMContentLoaded", inject);
})();

// Incoming Barba pages: hide load-animation targets until their JS init has prepared
// the pre-animation state, so the revealed page doesn't show a static snapshot first.
(function injectBarbaEnterPendingStyleOnce() {
	if (typeof document === "undefined") return;
	function inject() {
		if (document.getElementById("jjn-barba-enter-pending")) return;
		var st = document.createElement("style");
		st.id = "jjn-barba-enter-pending";
		st.textContent =
			'[data-barba-enter-pending="true"] [data-anim-glitch],' +
			'[data-barba-enter-pending="true"] [data-scramble="load"]{opacity:0!important;visibility:hidden!important}';
		var h = document.head || document.getElementsByTagName("head")[0];
		if (h) h.appendChild(st);
		else document.documentElement.appendChild(st);
	}
	if (document.head || document.getElementsByTagName("head")[0]) inject();
	else document.addEventListener("DOMContentLoaded", inject);
})();

gsap.registerPlugin(CustomEase);
if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
if (typeof ScrambleTextPlugin !== "undefined")
	gsap.registerPlugin(ScrambleTextPlugin);
if (typeof Draggable !== "undefined") gsap.registerPlugin(Draggable);
if (typeof Flip !== "undefined") gsap.registerPlugin(Flip);
function ensureFlipPluginRegistered() {
	var F = typeof window !== "undefined" ? window.Flip : undefined;
	if (typeof F === "undefined" || typeof gsap === "undefined") return false;
	try {
		gsap.registerPlugin(F);
		return true;
	} catch (_) {
		return false;
	}
}

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", (e) => (reducedMotion = e.matches));
rmMQ.addListener?.((e) => (reducedMotion = e.matches));

function shouldUseCompactHeroPreload() {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function")
		return false;
	return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

const has = (s) => !!nextPage.querySelector(s);

const staggerDefault = 0.05;
const durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

function waitForDocumentFonts() {
	if (
		typeof document === "undefined" ||
		!document.fonts ||
		document.fonts.status === "loaded"
	) {
		return Promise.resolve();
	}
	return new Promise((resolve) => {
		var settled = false;
		function finish() {
			if (settled) return;
			settled = true;
			resolve();
		}
		function pollStatus() {
			if (document.fonts.status === "loaded") {
				finish();
				return;
			}
			requestAnimationFrame(pollStatus);
		}
		if (
			document.fonts.ready &&
			typeof document.fonts.ready.then === "function"
		) {
			document.fonts.ready.then(finish).catch(() => {});
		}
		pollStatus();
	});
}

var _fontsReady = waitForDocumentFonts();
var _resetNavMenuPendingNavigation = null;
const NAV_DEBUG_ENABLED = true;
const NAV_DEBUG_SLOWMO = 1;
var _navDebugSessionId = 0;
var _navDebugSession = null;
var _navDebugObservedMenu = null;
var _navDebugMenuObserver = null;
var _navDebugDocumentListenerAttached = false;
var _navMenuDomNavigationPending = false;
var _lastTransitionLabelText = "";
var _liveNavToggleRepairEl = null;

function resetNavMenuPendingNavigation() {
	_navMenuDomNavigationPending = false;
	navDebugLog("nav:dom:pending-reset", {
		menuState: getNavMenuDebugState(
			typeof document !== "undefined" ? document.getElementById("nav-menu") : null,
		),
	});
	if (typeof _resetNavMenuPendingNavigation === "function") {
		_resetNavMenuPendingNavigation();
	}
}

function slowMs(ms) {
	return Math.round(ms * NAV_DEBUG_SLOWMO);
}

function slowSec(sec) {
	return sec * NAV_DEBUG_SLOWMO;
}

function getNavMenuDebugState(menu) {
	if (!menu) return null;
	return {
		className: menu.className,
		ariaHidden: menu.getAttribute("aria-hidden"),
	};
}

function navDebugLog(event, detail) {
	if (!NAV_DEBUG_ENABLED || typeof console === "undefined") return;
	var now = typeof performance !== "undefined" ? performance.now() : Date.now();
	var prefix = "[NAVDBG";
	if (_navDebugSession) {
		prefix +=
			" #" +
			_navDebugSession.id +
			" +" +
			(now - _navDebugSession.startedAt).toFixed(1) +
			"ms";
	} else {
		prefix += " +" + now.toFixed(1) + "ms";
	}
	prefix += "] " + event;
	if (typeof detail === "undefined") console.log(prefix);
	else console.log(prefix, detail);
}

function beginNavDebugSession(event, detail) {
	if (!NAV_DEBUG_ENABLED) return;
	_navDebugSessionId += 1;
	_navDebugSession = {
		id: _navDebugSessionId,
		startedAt: typeof performance !== "undefined" ? performance.now() : Date.now(),
	};
	navDebugLog(event, detail);
}

function endNavDebugSession(event, detail) {
	if (!_navDebugSession) {
		navDebugLog(event, detail);
		return;
	}
	navDebugLog(event, detail);
	_navDebugSession = null;
}

function isPlainPrimaryClick(e) {
	return (
		e &&
		!e.metaKey &&
		!e.ctrlKey &&
		!e.shiftKey &&
		!e.altKey &&
		(e.button == null || e.button === 0)
	);
}

function getNavMenuNavigableHref(linkEl) {
	if (!linkEl) return null;
	var href = linkEl.getAttribute("href");
	if (!href || href === "#" || href.charAt(0) === "#") return null;
	if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return null;
	if (linkEl.hasAttribute("download")) return null;
	if (linkEl.target && linkEl.target !== "_self") return null;
	try {
		var url = new URL(href, window.location.href);
		if (url.origin !== window.location.origin) return null;
		if (
			url.pathname === window.location.pathname &&
			url.search === window.location.search
		)
			return null;
		return url.href;
	} catch (_) {
		return null;
	}
}

function onNavDebugDocumentClick(e) {
	if (!NAV_DEBUG_ENABLED || !e || !e.target || !e.target.closest) return;
	var target = e.target.closest("#nav-menu a[href]");
	if (!target) return;
	var menu = document.getElementById("nav-menu");
	var href = getNavMenuNavigableHref(target);
	var isPlainClick = isPlainPrimaryClick(e);
	var detail = {
		href: href || target.getAttribute("href"),
		text: (target.textContent || "").trim(),
		isPlainClick: isPlainClick,
		menuState: getNavMenuDebugState(menu),
	};
	if (_navDebugSession) navDebugLog("nav:dom:capture-click", detail);
	else beginNavDebugSession("nav:dom:capture-click", detail);
	if (href && isPlainClick && typeof barba !== "undefined" && barba.go) {
		e.preventDefault();
		e.stopPropagation();
		if (typeof e.stopImmediatePropagation === "function") {
			e.stopImmediatePropagation();
		}
		if (_navMenuDomNavigationPending) {
			navDebugLog("nav:dom:blocked-pending", {
				href: href,
				menuState: getNavMenuDebugState(menu),
			});
			return;
		}
		if (barba.transitions && barba.transitions.isRunning) {
			navDebugLog("nav:dom:blocked-transition-running", {
				href: href,
				menuState: getNavMenuDebugState(menu),
			});
			return;
		}
		_navMenuDomNavigationPending = true;
		navDebugLog("nav:dom:intercept-navigation", {
			href: href,
			text: (target.textContent || "").trim(),
			menuState: getNavMenuDebugState(menu),
		});
		armTransitionScreen((target.textContent || "").trim() || null);
		navDebugLog("nav:dom:before-barba-go", {
			href: href,
			menuState: getNavMenuDebugState(document.getElementById("nav-menu")),
		});
		try {
			var goResult = barba.go(href, target, e);
			navDebugLog("nav:dom:after-barba-go", {
				href: href,
				returnedPromise:
					!!goResult && typeof goResult.then === "function",
			});
			if (goResult && typeof goResult.catch === "function") {
				goResult.catch((error) => {
					_navMenuDomNavigationPending = false;
					navDebugLog("nav:dom:barba-go-rejected", {
						href: href,
						error:
							error && error.message ? error.message : String(error),
					});
					endNavDebugSession("nav:dom:barba-go-rejected", {
						href: href,
					});
				});
			}
		} catch (error) {
			_navMenuDomNavigationPending = false;
			navDebugLog("nav:dom:barba-go-threw", {
				href: href,
				error: error && error.message ? error.message : String(error),
			});
			endNavDebugSession("nav:dom:barba-go-threw", {
				href: href,
			});
		}
		return;
	}
	requestAnimationFrame(() => {
		navDebugLog("nav:dom:post-click-raf", {
			menuState: getNavMenuDebugState(document.getElementById("nav-menu")),
		});
	});
}

function attachNavMenuDebugObserver() {
	if (!NAV_DEBUG_ENABLED || typeof document === "undefined") return;
	if (!_navDebugDocumentListenerAttached) {
		document.addEventListener("click", onNavDebugDocumentClick, true);
		_navDebugDocumentListenerAttached = true;
	}
	if (typeof MutationObserver === "undefined") return;
	var menu = document.getElementById("nav-menu");
	if (!menu || menu === _navDebugObservedMenu) return;
	if (_navDebugMenuObserver) _navDebugMenuObserver.disconnect();
	_navDebugObservedMenu = menu;
	_navDebugMenuObserver = new MutationObserver((mutations) => {
		var changes = mutations.map((mutation) => mutation.attributeName);
		navDebugLog("nav:dom:mutation", {
			attributes: changes,
			menuState: getNavMenuDebugState(menu),
		});
	});
	_navDebugMenuObserver.observe(menu, {
		attributes: true,
		attributeFilter: ["class", "aria-hidden", "style"],
	});
	navDebugLog("nav:observer:attached", {
		menuState: getNavMenuDebugState(menu),
	});
}

function closeNavMenuUnderTransition() {
	if (typeof document === "undefined") return;
	var menu = document.getElementById("nav-menu");
	if (!menu) return;
	menu.classList.remove("is-active", "is-settled");
	menu.setAttribute("aria-hidden", "true");
	menu.style.display = "none";
	menu.style.visibility = "hidden";
	menu.style.opacity = "0";
	menu.style.pointerEvents = "none";
	menu.style.clipPath = "inset(50% 0%)";
	var toggles = document.querySelectorAll(".nav_toggle_wrap");
	toggles.forEach((toggle) => {
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open menu");
	});
	var wordmarks = document.querySelectorAll(".nav_wordmark");
	wordmarks.forEach((wordmark) => {
		wordmark.style.opacity = "0";
	});
	navDebugLog("nav:transition-close", {
		menuState: getNavMenuDebugState(menu),
	});
}

function resetLiveNavMenuClosedState() {
	if (typeof document === "undefined") return;
	var menu = document.getElementById("nav-menu");
	var toggle = document.getElementById("nav-toggle");
	var toggleText = document.getElementById("toggle-text");
	if (!menu) return;
	menu.classList.remove("is-active", "is-settled");
	menu.setAttribute("aria-hidden", "true");
	menu.style.removeProperty("display");
	menu.style.removeProperty("visibility");
	menu.style.removeProperty("opacity");
	menu.style.removeProperty("pointer-events");
	menu.style.clipPath = "inset(50% 0%)";
	if (toggle) {
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open menu");
	}
	if (toggleText) {
		toggleText.textContent = "MENU";
	}
	navDebugLog("nav:live-reset-closed", {
		menuState: getNavMenuDebugState(menu),
	});
}

function attachLiveNavToggleRepair() {
	if (typeof document === "undefined") return;
	var toggle = document.getElementById("nav-toggle");
	var menu = document.getElementById("nav-menu");
	var toggleText = document.getElementById("toggle-text");
	if (!toggle || !menu || toggle === _liveNavToggleRepairEl) return;
	_liveNavToggleRepairEl = toggle;
	toggle.addEventListener("click", () => {
		var wasExpanded = toggle.getAttribute("aria-expanded") === "true";
		requestAnimationFrame(() => {
			var isExpanded = toggle.getAttribute("aria-expanded") === "true";
			if (isExpanded === wasExpanded) {
				isExpanded = !wasExpanded;
				toggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
				toggle.setAttribute(
					"aria-label",
					isExpanded ? "Close menu" : "Open menu",
				);
				if (toggleText) toggleText.textContent = isExpanded ? "CLOSE" : "MENU";
				navDebugLog("nav:live-toggle-fallback", {
					expanded: isExpanded,
				});
			}
			menu.style.removeProperty("display");
			menu.style.removeProperty("visibility");
			menu.style.removeProperty("opacity");
			menu.style.removeProperty("pointer-events");
			menu.removeAttribute("aria-hidden");
			menu.style.clipPath = isExpanded ? "inset(0% 0%)" : "inset(50% 0%)";
			if (!isExpanded) {
				menu.setAttribute("aria-hidden", "true");
			}
			navDebugLog("nav:live-toggle-sync", {
				expanded: isExpanded,
				menuState: getNavMenuDebugState(menu),
			});
		});
	});
}

function resolveTransitionLabelText(transitionLabelText, preferredLabelText) {
	if (!transitionLabelText) return preferredLabelText || _lastTransitionLabelText || "Hi there";
	var nextText = preferredLabelText || transitionLabelText.textContent || _lastTransitionLabelText || "Hi there";
	nextText = String(nextText).trim() || "Hi there";
	transitionLabelText.textContent = nextText;
	_lastTransitionLabelText = nextText;
	return nextText;
}

function primeTransitionLabel(transitionLabel) {
	if (!transitionLabel) return;
	transitionLabel.style.zIndex = "2";
	transitionLabel.style.visibility = "visible";
	transitionLabel.style.pointerEvents = "none";
	transitionLabel.style.whiteSpace = "nowrap";
	gsap.set(transitionLabel, { autoAlpha: 1 });
}

function primeTransitionLayer(transitionWrap, transitionPanel) {
	if (transitionWrap) {
		transitionWrap.style.position = "fixed";
		transitionWrap.style.top = "0";
		transitionWrap.style.left = "0";
		transitionWrap.style.right = "0";
		transitionWrap.style.bottom = "0";
		transitionWrap.style.width = "100vw";
		transitionWrap.style.height = "100vh";
		transitionWrap.style.zIndex = "9999";
		transitionWrap.style.visibility = "visible";
		transitionWrap.style.pointerEvents = "none";
	}
	if (transitionPanel) {
		transitionPanel.style.position = "absolute";
		transitionPanel.style.top = "0";
		transitionPanel.style.left = "0";
		transitionPanel.style.right = "0";
		transitionPanel.style.bottom = "0";
		transitionPanel.style.width = "100%";
		transitionPanel.style.height = "100%";
		transitionPanel.style.overflow = "hidden";
		transitionPanel.style.zIndex = "1";
		transitionPanel.style.visibility = "visible";
		transitionPanel.style.pointerEvents = "none";
	}
}

function resetTransitionLabelStyles(transitionLabel) {
	if (!transitionLabel) return;
	transitionLabel.style.removeProperty("position");
	transitionLabel.style.removeProperty("top");
	transitionLabel.style.removeProperty("left");
	transitionLabel.style.removeProperty("right");
	transitionLabel.style.removeProperty("bottom");
	transitionLabel.style.removeProperty("z-index");
	transitionLabel.style.removeProperty("visibility");
	transitionLabel.style.removeProperty("pointer-events");
	transitionLabel.style.removeProperty("white-space");
	transitionLabel.style.removeProperty("overflow");
	transitionLabel.style.removeProperty("clip-path");
}

function resetTransitionLayerStyles(transitionWrap, transitionPanel) {
	if (transitionWrap) {
		transitionWrap.style.removeProperty("position");
		transitionWrap.style.removeProperty("top");
		transitionWrap.style.removeProperty("left");
		transitionWrap.style.removeProperty("right");
		transitionWrap.style.removeProperty("bottom");
		transitionWrap.style.removeProperty("width");
		transitionWrap.style.removeProperty("height");
		transitionWrap.style.removeProperty("z-index");
		transitionWrap.style.removeProperty("visibility");
		transitionWrap.style.removeProperty("pointer-events");
	}
	if (transitionPanel) {
		transitionPanel.style.removeProperty("position");
		transitionPanel.style.removeProperty("top");
		transitionPanel.style.removeProperty("left");
		transitionPanel.style.removeProperty("right");
		transitionPanel.style.removeProperty("bottom");
		transitionPanel.style.removeProperty("width");
		transitionPanel.style.removeProperty("height");
		transitionPanel.style.removeProperty("overflow");
		transitionPanel.style.removeProperty("clip-path");
		transitionPanel.style.removeProperty("z-index");
		transitionPanel.style.removeProperty("visibility");
		transitionPanel.style.removeProperty("pointer-events");
	}
}

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
	attachNavMenuDebugObserver();
	attachLiveNavToggleRepair();
	initLenis();
	if (onceFunctionsInitialized) return;
	onceFunctionsInitialized = true;

	// Runs once on first load
	initBunnyLightboxPlayer();
	_fontsReady.then(() => {
		if (document.querySelector("[data-anim-glitch]")) initAnimGlitch(document);
		if (
			document.querySelector("[data-scramble='load']") ||
			document.querySelector("[data-scramble='scroll']") ||
			document.querySelector("[data-scramble-hover='link']")
		) {
			initScrambleAll(document);
		}
	});
	if (document.querySelector(".about_contain")) {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				initAboutScroll(document);
				if (hasScrollTrigger) ScrollTrigger.refresh();
			});
		});
	}
	if (document.querySelector("[data-parallax]")) initParallax(document);
	if (document.querySelector(".nav_wrap")) initNavWrapInteractive(document);
	if (document.querySelector(".faq_cms_wrap")) initFaqAccordion(document);
	if (document.querySelector("[data-marquee-scroll-direction-target]"))
		initMarqueeScrollDirection(document);
	initWorkViewToggle();
	initFolioFlipViewToggle();
	if (
		document.querySelector("[data-portfolio-toggle]") ||
		document.querySelector("[data-masonry-list]")
	) {
		initPortfolioPageFeatures(document);
	}
	if (document.querySelector("[data-media-init]")) initMediaSetup();
	initCustomCursor();
	if (document.querySelector(".minimap_wrap")) initMinimapWrap(document);
}

function initBeforeEnterFunctions(next) {
	nextPage = next || document;

	// Ensure a lightbox wrapper lives on document.body.
	// On the first visit, the lightbox may only exist inside the incoming Barba container.
	// We need to rescue ONE copy to body before nuking the rest as duplicates.
	if (next && next !== document) {
		var bodyHasWrapper = document.querySelector(
			"body > [data-bunny-lightbox-status]",
		);
		if (!bodyHasWrapper) {
			var firstWrapper = next.querySelector("[data-bunny-lightbox-status]");
			if (firstWrapper) {
				document.body.appendChild(firstWrapper);
				console.log(
					"[LB BARBA beforeEnter] Rescued lightbox wrapper to document.body (first time)",
				);
				// Init the player now — the guard inside prevents double-init
				initBunnyLightboxPlayer();
			}
		}

		// Remove remaining duplicates from incoming container
		var dupes = next.querySelectorAll("[data-bunny-lightbox-status]");
		console.log(
			"[LB BARBA beforeEnter] Removing",
			dupes.length,
			"duplicate lightbox(es) from incoming container",
		);
		dupes.forEach((el) => {
			el.remove();
		});
	}

	// Log state of the body-level wrapper
	var bodyWrapper = document.querySelector(
		"body > [data-bunny-lightbox-status]",
	);
	console.log("[LB BARBA beforeEnter] Body-level wrapper:", {
		exists: !!bodyWrapper,
		status: bodyWrapper
			? bodyWrapper.getAttribute("data-bunny-lightbox-status")
			: null,
		connected: bodyWrapper ? bodyWrapper.isConnected : false,
	});

	// Close lightbox on page transition — FULL cleanup
	const wrapper = document.querySelector(
		'[data-bunny-lightbox-status="active"]',
	);
	if (wrapper) {
		console.log("[LB BARBA beforeEnter] Active lightbox found — cleaning up");
		wrapper.setAttribute("data-bunny-lightbox-status", "not-active");
		wrapper.style.display = "none";
		wrapper.style.opacity = "0";
		wrapper.style.visibility = "hidden";
		wrapper.style.pointerEvents = "none";

		const player = wrapper.querySelector("[data-bunny-lightbox-init]");
		const video = wrapper.querySelector("video");

		if (player && player._hls) {
			try {
				player._hls.destroy();
			} catch (_) {}
			player._hls = null;
			console.log("[LB BARBA beforeEnter] HLS destroyed");
		}

		if (video) {
			try {
				video.pause();
			} catch (_) {}
			try {
				video.removeAttribute("src");
				video.load();
			} catch (_) {}
			console.log("[LB BARBA beforeEnter] Video teardown complete");
		}

		if (player) {
			player.setAttribute("data-player-status", "idle");
			player.setAttribute("data-player-activated", "false");
		}
	} else {
		// Even if not "active", force-hide the body wrapper during transitions
		var bodyW = document.querySelector("body > [data-bunny-lightbox-status]");
		if (bodyW) {
			bodyW.style.display = "none";
			bodyW.style.opacity = "0";
			bodyW.style.visibility = "hidden";
			bodyW.style.pointerEvents = "none";
			console.log(
				"[LB BARBA beforeEnter] Force-hid body wrapper (was not-active but ensuring hidden)",
			);
		} else {
			console.log("[LB BARBA beforeEnter] No active lightbox to clean up");
		}
	}

	// Portfolio-Bild-Lightbox (Flip): schließen, bevor der alte Container weg ist
	var activePortfolioLightbox = document.querySelector(
		'[data-lightbox="wrapper"].is-active',
	);
	if (activePortfolioLightbox) {
		var plClose = activePortfolioLightbox.querySelector(
			'[data-lightbox="close"]',
		);
		if (plClose) plClose.click();
	}

	if (_heroPreloadCompleted && next && next.querySelector) {
		resetHeroPreloadForRepeatBarbaVisit(next);
	}

	if (next && next.querySelectorAll) {
		var mmWraps = next.querySelectorAll(".minimap_wrap");
		if (mmWraps.length) {
			initMinimapWrap(next);
		}
	}
}

function initAfterEnterFunctions(next) {
	nextPage = next || document;
	var asyncInit = _fontsReady.then(() => {
		if (has("[data-anim-glitch]")) initAnimGlitch(nextPage);
		if (
			has("[data-scramble='load']") ||
			has("[data-scramble='scroll']") ||
			has("[data-scramble-hover='link']")
		) {
			initScrambleAll(nextPage);
		}
	});

	// Runs after enter animation completes
	if (has("[data-typo-scroll-init]")) initTypoScrollPreview();
	if (has("[data-scroll-overlap='trigger']")) initScrollOverlap();
	if (has(".about_contain")) {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				initAboutScroll(document);
				if (hasScrollTrigger) ScrollTrigger.refresh();
			});
		});
	}
	if (has("[data-parallax]")) {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				initParallax(document);
			});
		});
	}
	if (has('[data-scramble-slide="target"]') || has(".hero_title_eb")) {
		scheduleHeroTimecodeAfterPreload(nextPage);
	} else {
		if (_heroTimecodeIntervalId !== null) {
			clearInterval(_heroTimecodeIntervalId);
			_heroTimecodeIntervalId = null;
		}
	}
	if (document.querySelector(".nav_wrap")) initNavWrapInteractive(document);
	if (has("[data-flick-cards-init]")) initFlickCards(nextPage);
	if (has(".faq_cms_wrap")) initFaqAccordion(nextPage);
	if (has("[data-marquee-scroll-direction-target]"))
		initMarqueeScrollDirection(nextPage);
	if (
		has("[data-portfolio-toggle]") ||
		has("[data-masonry-list]")
	) {
		initPortfolioPageFeatures(nextPage);
	}
	if (has("[data-media-init]")) initMediaSetup();
	initCustomCursor();
	if (has(".minimap_wrap")) initMinimapWrap(nextPage);
	if (has("[data-view-default]") || has(".folio_cms_list")) {
		syncFolioFlipViewInitialState();
	}
	if (hasLenis) {
		lenis.resize();
	}

	if (hasScrollTrigger) {
		ScrollTrigger.refresh();
	}

	return asyncInit;
}

// -----------------------------------------
// HERO PRELOADER (first visit, full-hero black cover)
//
// Webflow markup (inside hero, typ. on data-scroll-overlap="target"):
//
// 1) data-hero-preload-root — wrapper um Video + Overlay + Typo (z. B. hero_scroll_target)
// 2) data-hero-preload-cover — schwarze Fläche u-cover-absolute, Z-Index UNTER der Typo
// 3) data-hero-preload-typo — auf hero_title_wrap (position + z-index über dem Cover)
//
// Optional: data-hero-preload-headline am H1 (sonst h1.hero_close_title im root)
// data-hero-timecode: Timecode-Zeile — wird zuerst genommen, dann data-hero-preload-subline (ohne Duplikat)
// Fallback ohne subline-Attrs: alle p[data-scramble-slide="target"]
//
// CSS (Embed), root position:relative:
//   [data-hero-preload-root] { position: relative; }
//   [data-hero-preload-cover] { position: absolute; inset: 0; z-index: 5; background: #000; pointer-events: none; }
//   [data-hero-preload-typo] { position: relative; z-index: 10; }
// Wenn .hero_contain VOR dem Video steht: .hero_contain braucht position:relative; z-index: 15+ (über Cover 5),
// sonst liegt das Full-Bleed-Video darüber — das Script hebt .hero_contain temporär an, du kannst es auch fix im CSS setzen.
// -----------------------------------------

var _heroPreloadCompleted = false;

function markBarbaEnterAnimationPending(container) {
	if (!container || !container.setAttribute) return;
	container.setAttribute("data-barba-enter-pending", "true");
}

function clearBarbaEnterAnimationPending(container) {
	if (!container || !container.removeAttribute) return;
	container.removeAttribute("data-barba-enter-pending");
}

function markHeroPreloadPrimed(root, navPreload) {
	if (root && root.setAttribute)
		root.setAttribute("data-hero-preload-primed", "true");
	if (navPreload && navPreload.setAttribute)
		navPreload.setAttribute("data-hero-preload-primed", "true");
}

function applyHeroHeadlineStableTypography(headline) {
	if (!headline || !headline.style) return;
	headline.style.fontKerning = "none";
	headline.style.fontVariantLigatures = "none";
	headline.style.setProperty("font-feature-settings", '"kern" 0');
}

function setHeroPreloadInitialHiddenState(headline, revealEls, navPreload) {
	if (headline) {
		headline.style.opacity = "0";
		headline.style.visibility = "hidden";
	}
	if (navPreload) {
		navPreload.style.opacity = "0";
		navPreload.style.visibility = "hidden";
	}
	(revealEls || []).forEach((el) => {
		if (!el || !el.style) return;
		el.style.opacity = "0";
		el.style.visibility = "hidden";
	});
}

function scheduleHeroTimecodeAfterPreload(scope) {
	var root = scope && scope.querySelector ? scope : document;
	if (!root.querySelector("[data-hero-preload-cover]")) {
		initHeroTimecodeClock(scope);
		return;
	}
	var frames = 0;
	function tryStart() {
		if (_heroPreloadCompleted) {
			initHeroTimecodeClock(scope);
			return;
		}
		if (++frames > 900) {
			initHeroTimecodeClock(scope);
			return;
		}
		requestAnimationFrame(tryStart);
	}
	tryStart();
}

// After the first visit, runHeroPreloader only runs in barba `once`; incoming Home HTML
// still has the black cover visible — hide it and match the post-preload hero state.
function resetHeroPreloadForRepeatBarbaVisit(container) {
	if (!container || !container.querySelector) return;
	var root = container.querySelector("[data-hero-preload-root]");
	var cover = root && root.querySelector("[data-hero-preload-cover]");
	if (!root || !cover) return;

	var video = root.querySelector("video");
	var headline =
		root.querySelector("[data-hero-preload-headline]") ||
		root.querySelector("h1.hero_close_title");
	var navPreload = container.querySelector("[data-hero-preload-nav]");
	if (!navPreload)
		navPreload = document.querySelector("[data-hero-preload-nav]");

	var revealEls = [];
	var te = root.querySelector("[data-hero-timecode]");
	if (te) revealEls.push(te);
	var sl = root.querySelectorAll("[data-hero-preload-subline]");
	if (sl.length) {
		Array.prototype.forEach.call(sl, (p) => {
			revealEls.push(p);
		});
	} else {
		Array.prototype.forEach.call(
			root.querySelectorAll('p[data-scramble-slide="target"]'),
			(p) => {
				revealEls.push(p);
			},
		);
	}
	if (navPreload) {
		Array.prototype.forEach.call(
			navPreload.querySelectorAll("[data-hero-preload-nav-text]"),
			(el) => {
				revealEls.push(el);
			},
		);
	}

	markHeroPreloadPrimed(root, navPreload);

	gsap.set(cover, {
		autoAlpha: 0,
		pointerEvents: "none",
		yPercent: -100,
		overwrite: "auto",
	});
	if (video) gsap.set(video, { autoAlpha: 1, y: 0, overwrite: "auto" });
	if (headline) {
		applyHeroHeadlineStableTypography(headline);
		gsap.set(headline, { autoAlpha: 1, opacity: 1, visibility: "inherit" });
	}
	if (navPreload) gsap.set(navPreload, { autoAlpha: 1 });
	if (revealEls.length)
		gsap.set(revealEls, { autoAlpha: 1, y: 0, yPercent: 0 });

	if (video) {
		try {
			video.play();
		} catch (_) {}
	}
}

function runHeroPreloader(container) {
	return _fontsReady.then(
		() =>
			new Promise((resolve) => {
				var contentLiftEl = null;
				var contentLiftSave = null;

				var root = container.querySelector("[data-hero-preload-root]");
				var cover = root && root.querySelector("[data-hero-preload-cover]");
				if (!root || !cover) {
					var navFallback = container.querySelector("[data-hero-preload-nav]");
					if (!navFallback)
						navFallback = document.querySelector("[data-hero-preload-nav]");
					markHeroPreloadPrimed(root, navFallback);
					_heroPreloadCompleted = true;
					resolve();
					return;
				}

				var headline =
					root.querySelector("[data-hero-preload-headline]") ||
					root.querySelector("h1.hero_close_title");
				var navTextTypeSave = [];
				var video = root.querySelector("video");
				var timecodeEl = root.querySelector("[data-hero-timecode]");
				var sublines = root.querySelectorAll("[data-hero-preload-subline]");
				var subArr = [];
				function subPushUnique(el) {
					for (var si = 0; si < subArr.length; si++) {
						if (subArr[si] === el) return;
					}
					subArr.push(el);
				}
				if (timecodeEl) subPushUnique(timecodeEl);
				if (sublines.length) {
					Array.prototype.forEach.call(sublines, (p) => {
						subPushUnique(p);
					});
				} else {
					Array.prototype.forEach.call(
						root.querySelectorAll('p[data-scramble-slide="target"]'),
						(p) => {
							subPushUnique(p);
						},
					);
				}

				var navPreload = container.querySelector("[data-hero-preload-nav]");
				if (!navPreload)
					navPreload = document.querySelector("[data-hero-preload-nav]");
				if (navPreload) {
					Array.prototype.forEach.call(
						navPreload.querySelectorAll("[data-hero-preload-nav-text]"),
						(el) => {
							subPushUnique(el);
						},
					);
				}

				setHeroPreloadInitialHiddenState(headline, subArr, navPreload);
				markHeroPreloadPrimed(root, navPreload);

				function finish() {
					if (contentLiftSave && contentLiftEl) {
						contentLiftEl.style.zIndex = contentLiftSave.zIndex;
						contentLiftEl.style.position = contentLiftSave.position;
					}
					gsap.set(cover, { autoAlpha: 0, pointerEvents: "none" });
					_heroPreloadCompleted = true;
					if (video) {
						try {
							video.play();
						} catch (_) {}
					}
					resolve();
				}

				var typoAnchor = root.querySelector("[data-hero-preload-typo]");
				if (typoAnchor) {
					contentLiftEl = typoAnchor.closest(".hero_contain");
					if (contentLiftEl) {
						contentLiftSave = {
							zIndex: contentLiftEl.style.zIndex,
							position: contentLiftEl.style.position,
						};
						if (!contentLiftEl.style.position)
							contentLiftEl.style.position = "relative";
						contentLiftEl.style.zIndex = "20";
					}
				}

				if (reducedMotion) {
					gsap.set(cover, { autoAlpha: 0 });
					if (video) gsap.set(video, { autoAlpha: 1, y: 0 });
					gsap.set(subArr, { autoAlpha: 1 });
					if (headline) gsap.set(headline, { autoAlpha: 1 });
					if (navPreload) gsap.set(navPreload, { autoAlpha: 1 });
					finish();
					return;
				}

				var useCompactPreload = shouldUseCompactHeroPreload();
				var introHoldDuration = useCompactPreload ? 0.12 : 0.35;
				var headlineFadeDuration = useCompactPreload ? 0.32 : 0.55;
				var afterHeadlineDelay = useCompactPreload ? 0.08 : 0.2;
				var wipeDuration = useCompactPreload ? 0.72 : 1;
				var afterWipeDelay = useCompactPreload ? 0.06 : 0.15;
				var sublineStagger = useCompactPreload ? 0.05 : 0.1;
				var sublineScrambleDuration = useCompactPreload ? 0.55 : 1.1;
				var sublineRevealDuration = useCompactPreload ? 0.2 : 0.35;

				gsap.set(cover, { autoAlpha: 1, yPercent: 0 });
				if (video) gsap.set(video, { autoAlpha: 0, y: "15vh" });
				gsap.set(subArr, {
					autoAlpha: 0,
					y: 0,
					yPercent: 0,
					transformOrigin: "50% 50% 0",
				});
				if (navPreload) gsap.set(navPreload, { autoAlpha: 0 });

				if (navPreload) {
					Array.prototype.forEach.call(
						navPreload.querySelectorAll("[data-hero-preload-nav-text]"),
						(el) => {
							navTextTypeSave.push({
								el: el,
								kerning: el.style.getPropertyValue("font-kerning"),
								ligatures: el.style.getPropertyValue("font-variant-ligatures"),
								features: el.style.getPropertyValue("font-feature-settings"),
							});
							el.style.fontKerning = "none";
							el.style.fontVariantLigatures = "none";
							el.style.setProperty("font-feature-settings", '"kern" 0');
						},
					);
				}

				var split = null;
				if (
					headline &&
					typeof SplitText !== "undefined" &&
					!useCompactPreload
				) {
					// SplitText wraps each glyph, so keep the headline on the same kerning model
					// before and after revert to avoid the end-of-animation spacing snap.
					applyHeroHeadlineStableTypography(headline);

					split = new SplitText(headline, {
						type: "chars",
						charsClass: "jjn-preload-char",
					});
					// inline (not inline-block): keeps parent letter-spacing and avoids the
					// “wide during glitch, snap tighter on revert” kerning gap between boxes.
					split.chars.forEach((char) => {
						char.style.display = "inline";
					});
					gsap.set(split.chars, { opacity: 0 });
					gsap.set(headline, { autoAlpha: 1, opacity: 1, visibility: "inherit" });
				} else if (headline) {
					gsap.set(headline, { autoAlpha: 0 });
				}

				var storedSubTexts = subArr.map((el) => (el.textContent || "").trim());
				subArr.forEach((el, i) => {
					el.textContent = "";
				});

				var tl = gsap.timeline({ onComplete: finish });

				tl.to({}, { duration: introHoldDuration });

				if (split && split.chars.length) {
					var glitchTl = gsap.timeline();
					split.chars.forEach((char) => {
						var randomStart = Math.random() * 0.6;
						var blinks = 2 + Math.floor(Math.random() * 3);
						var blinkDur = 0.04 + Math.random() * 0.04;
						var gapDur = 0.03 + Math.random() * 0.05;
						for (var b = 0; b < blinks; b++) {
							var offset = randomStart + b * (blinkDur + gapDur);
							glitchTl.fromTo(
								char,
								{ opacity: 0 },
								{ opacity: 1, duration: blinkDur, ease: "none" },
								offset,
							);
							if (b < blinks - 1) {
								glitchTl.to(
									char,
									{ opacity: 0, duration: gapDur, ease: "none" },
									offset + blinkDur,
								);
							}
						}
					});
					tl.add(glitchTl, ">");
					tl.call(() => {
						if (split && split.revert) {
							try {
								split.revert();
							} catch (_) {}
						}
						split = null;
						if (headline) {
							gsap.set(headline, { autoAlpha: 1, opacity: 1, visibility: "inherit" });
						}
					});
				} else if (headline) {
					tl.fromTo(
						headline,
						{ autoAlpha: 0 },
						{ autoAlpha: 1, duration: headlineFadeDuration },
						">",
					);
				}

				tl.add("afterHeadline", ">+=" + afterHeadlineDelay);

				tl.add("wipe", "afterHeadline+=" + afterHeadlineDelay);
				if (video) {
					tl.set(video, { autoAlpha: 1 }, "wipe");
					tl.to(video, { y: 0, duration: wipeDuration, ease: "osmo" }, "wipe");
				}
				tl.fromTo(
					cover,
					{ yPercent: 0 },
					{
						yPercent: -100,
						duration: wipeDuration,
						overwrite: "auto",
						immediateRender: false,
					},
					"wipe",
				);

				tl.add("afterWipe", ">+=" + afterWipeDelay);

				if (navPreload) {
					tl.set(navPreload, { autoAlpha: 1 }, "afterWipe");
				}

				function restoreNavTextTypography(line) {
					for (var ni = 0; ni < navTextTypeSave.length; ni++) {
						if (navTextTypeSave[ni].el !== line) continue;
						var s = navTextTypeSave[ni];
						if (s.kerning) line.style.fontKerning = s.kerning;
						else line.style.removeProperty("font-kerning");
						if (s.ligatures) line.style.fontVariantLigatures = s.ligatures;
						else line.style.removeProperty("font-variant-ligatures");
						if (s.features)
							line.style.setProperty("font-feature-settings", s.features);
						else line.style.removeProperty("font-feature-settings");
						return;
					}
				}

				if (
					!useCompactPreload &&
					scramblePluginsReady() &&
					subArr.length &&
					typeof ScrambleTextPlugin !== "undefined"
				) {
					subArr.forEach((line, i) => {
						var txt = storedSubTexts[i] || "";
						var pos = "afterWipe+=" + i * sublineStagger;
						tl.set(line, { autoAlpha: 1, y: 0, yPercent: 0 }, pos);
						tl.to(
							line,
							{
								duration: sublineScrambleDuration,
								y: 0,
								yPercent: 0,
								overwrite: "auto",
								scrambleText: {
									text: txt,
									chars: SCRAMBLE.chars,
									speed: SCRAMBLE.speed,
								},
								onComplete: () => {
									if (
										line.hasAttribute &&
										line.hasAttribute("data-hero-preload-nav-text")
									) {
										restoreNavTextTypography(line);
									}
								},
							},
							pos,
						);
					});
				} else {
					subArr.forEach((line, i) => {
						var txt = storedSubTexts[i] || "";
						var pos = "afterWipe+=" + i * sublineStagger;
						tl.set(line, { textContent: txt, y: 0, yPercent: 0 }, pos);
						tl.fromTo(
							line,
							{ autoAlpha: 0, y: 0 },
							{
								autoAlpha: 1,
								duration: sublineRevealDuration,
								y: 0,
								onComplete: () => {
									if (
										line.hasAttribute &&
										line.hasAttribute("data-hero-preload-nav-text")
									) {
										restoreNavTextTypography(line);
									}
								},
							},
							pos,
						);
					});
				}
			}),
	);
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
	const tl = gsap.timeline();
	tl.call(
		() => {
			resetPage(next);
		},
		null,
		0,
	);
	return tl;
}

function armTransitionScreen(labelText) {
	var transitionWrap = document.querySelector("[data-transition-wrap]");
	if (!transitionWrap) return false;
	var transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
	var transitionLabel = transitionWrap.querySelector("[data-transition-label]");
	var coverStartClip = "inset(100% 0% 0% 0%)";

	var transitionLabelText = transitionWrap.querySelector(
		"[data-transition-label-text]",
	);
	if (!transitionLabelText) return false;

	resolveTransitionLabelText(transitionLabelText, labelText);
	primeTransitionLayer(transitionWrap, transitionPanel);
	primeTransitionLabel(transitionLabel);
	gsap.killTweensOf([transitionPanel, transitionLabel]);
	if (transitionPanel) {
		gsap.set(transitionPanel, {
			autoAlpha: 1,
			yPercent: 0,
			clipPath: coverStartClip,
		});
	}
	if (transitionLabel) {
		gsap.set(transitionLabel, {
			autoAlpha: 1,
		});
	}
	transitionWrap.setAttribute("data-transition-armed", "true");
	navDebugLog("transition:armed", {
		labelText: transitionLabelText.textContent || null,
	});

	return true;
}

function consumeArmedTransitionScreen(transitionWrap) {
	if (!transitionWrap || !transitionWrap.hasAttribute("data-transition-armed"))
		return false;
	transitionWrap.removeAttribute("data-transition-armed");
	navDebugLog("transition:consumed-armed-state");
	return true;
}

function runPageLeaveAnimation(current, next) {
	var coverDuration = slowSec(0.35);
	var labelDelay = slowSec(0.2);
	var coverStartClip = "inset(100% 0% 0% 0%)";
	var coverEndClip = "inset(0% 0% 0% 0%)";
	var coverInEase = "power3.in";
	var nextPageName =
		next && next.getAttribute ? next.getAttribute("data-page-name") : null;
	var nextNamespace =
		next && next.getAttribute
			? next.getAttribute("data-barba-namespace")
			: null;
	const transitionWrap = document.querySelector("[data-transition-wrap]");
	const transitionPanel = transitionWrap.querySelector(
		"[data-transition-panel]",
	);
	const transitionLabel = transitionWrap.querySelector(
		"[data-transition-label]",
	);
	const transitionLabelText = transitionWrap.querySelector(
		"[data-transition-label-text]",
	);
	const transitionWasArmed = consumeArmedTransitionScreen(transitionWrap);
	var resolvedLabelText = resolveTransitionLabelText(
		transitionLabelText,
		nextPageName,
	);
	primeTransitionLayer(transitionWrap, transitionPanel);
	primeTransitionLabel(transitionLabel);

	gsap.killTweensOf([transitionPanel, transitionLabel]);
	navDebugLog("barba:leave:start", {
		currentNamespace: current.getAttribute("data-barba-namespace") || null,
		nextNamespace: nextNamespace,
		transitionWasArmed: transitionWasArmed,
		labelText: resolvedLabelText,
		coverDuration: coverDuration,
	});

	const tl = gsap.timeline({
		onComplete: () => {
			navDebugLog("barba:leave:complete");
			current.remove();
		},
	});

	if (reducedMotion) {
		navDebugLog("barba:leave:reduced-motion");
		tl.set(current, { autoAlpha: 0 });
		return new Promise((resolve) => {
			tl.call(resolve, null, ">");
		});
	}

	tl.call(() => {
		navDebugLog("barba:leave:timeline-start", {
			transitionPanel: {
				autoAlpha: 1,
				yPercent: 0,
			},
		});
	}, null, 0);

	tl.set(
		transitionPanel,
		{
			autoAlpha: 1,
			yPercent: 0,
			clipPath: coverStartClip,
		},
		0,
	);

	tl.set(
		transitionLabel,
		{
			autoAlpha: 1,
		},
		0,
	);

	tl.to(
		transitionPanel,
		{
			clipPath: coverEndClip,
			duration: coverDuration,
			ease: coverInEase,
			overwrite: "auto",
			immediateRender: false,
		},
		0,
	);

	tl.call(() => {
		navDebugLog("barba:leave:covered");
		closeNavMenuUnderTransition();
	}, null, coverDuration);

	if (!transitionWasArmed) {
		tl.set(transitionLabel, { autoAlpha: 0 }, 0);
		tl.fromTo(
			transitionLabel,
			{
				autoAlpha: 0,
			},
			{
				autoAlpha: 1,
			},
			"<+=" + labelDelay,
		);
	}

	tl.to({}, { duration: coverDuration });

	return new Promise((resolve) => {
		tl.call(resolve, null, ">");
	});
}

function runPageEnterAnimation(next) {
	var revealStartDelay = slowSec(0.2);
	var revealDuration = slowSec(1.2);
	var labelFadeDuration = slowSec(0.5);
	var labelFadeStart = slowSec(0.15);
	var coverOutEase = "power3.out";
	var afterRevealSettleDelay = slowSec(0.12);
	const transitionWrap = document.querySelector("[data-transition-wrap]");
	const transitionPanel = transitionWrap.querySelector(
		"[data-transition-panel]",
	);
	const transitionLabel = transitionWrap.querySelector(
		"[data-transition-label]",
	);
	const transitionLabelText = transitionWrap.querySelector(
		"[data-transition-label-text]",
	);
	var resolvedLabelText = resolveTransitionLabelText(transitionLabelText);
	primeTransitionLayer(transitionWrap, transitionPanel);
	primeTransitionLabel(transitionLabel);

	const tl = gsap.timeline();
	navDebugLog("barba:enter:start", {
		nextNamespace: next.getAttribute("data-barba-namespace") || null,
		labelText: resolvedLabelText,
		startEnterAt: revealStartDelay,
		revealDuration: revealDuration,
	});

	if (reducedMotion) {
		navDebugLog("barba:enter:reduced-motion");
		tl.set(next, { autoAlpha: 1 });
		tl.add("pageReady");
		tl.call(resetPage, [next], "pageReady");
		return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
	}

	tl.add("startEnter", revealStartDelay);
	tl.call(() => {
		navDebugLog("barba:enter:reveal-start");
	}, null, "startEnter");

	tl.set(
		next,
		{
			autoAlpha: 1,
			pointerEvents: "auto",
		},
		"startEnter",
	);

	tl.fromTo(
		transitionPanel,
		{
			clipPath: "inset(0% 0% 0% 0%)",
		},
		{
			clipPath: "inset(0% 0% 100% 0%)",
			duration: revealDuration,
			ease: coverOutEase,
			overwrite: "auto",
			immediateRender: false,
		},
		"startEnter",
	);

	tl.set(
		transitionPanel,
		{
			autoAlpha: 0,
		},
		">",
	);

	tl.fromTo(
		transitionLabel,
		{
			autoAlpha: 1,
		},
		{
			autoAlpha: 0,
			duration: labelFadeDuration,
			overwrite: "auto",
			immediateRender: false,
		},
		"startEnter+=" + labelFadeStart,
	);

	tl.add("pageReady");
	tl.call(() => {
		navDebugLog("barba:enter:page-ready");
		resetTransitionLabelStyles(transitionLabel);
		resetTransitionLayerStyles(transitionWrap, transitionPanel);
	}, null, "pageReady");
	tl.call(resetPage, [next], "pageReady");
	tl.to({}, { duration: afterRevealSettleDelay });
	return new Promise((resolve) => {
		tl.call(() => {
			endNavDebugSession("barba:enter:complete", {
				nextNamespace: next.getAttribute("data-barba-namespace") || null,
			});
			resolve();
		}, null, ">");
	});
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
	var isRealPageTransition = !!(data.current && data.current.container);
	attachNavMenuDebugObserver();
	navDebugLog("barba:hook:beforeEnter", {
		nextNamespace: data.next.container.getAttribute("data-barba-namespace") || null,
		isRealPageTransition: isRealPageTransition,
	});
	if (isRealPageTransition) {
		markBarbaEnterAnimationPending(data.next.container);
	}
	gsap.set(data.next.container, {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		autoAlpha: isRealPageTransition ? 0 : 1,
		pointerEvents: isRealPageTransition ? "none" : "auto",
	});

	if (lenis && typeof lenis.stop === "function") {
		lenis.stop();
	}

	initBeforeEnterFunctions(data.next.container);
	applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave((data) => {
	navDebugLog("barba:hook:afterLeave");
	if (hasScrollTrigger) {
		ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
	}
	teardownDetachedMinimapInstances();
	if (data && data.current && data.current.container) {
		data.current.container
			.querySelectorAll("[data-masonry-list]")
			.forEach(function (list) {
				if (list._masonry && typeof list._masonry.destroy === "function") {
					try {
						list._masonry.destroy();
					} catch (_) {}
				}
				delete list.dataset.masonryJsInit;
			});
	}
});

barba.hooks.enter((data) => {
	navDebugLog("barba:hook:enter", {
		nextNamespace: data.next.container.getAttribute("data-barba-namespace") || null,
	});
	initBarbaNavUpdate(data);
});

barba.hooks.afterEnter((data) => {
	attachNavMenuDebugObserver();
	attachLiveNavToggleRepair();
	navDebugLog("barba:hook:afterEnter", {
		nextNamespace: data.next.container.getAttribute("data-barba-namespace") || null,
	});
	resetNavMenuPendingNavigation();
	Promise.resolve(initAfterEnterFunctions(data.next.container)).then(() => {
		requestAnimationFrame(() => {
			clearBarbaEnterAnimationPending(data.next.container);
			if (hasScrollTrigger) {
				ScrollTrigger.refresh();
			}
		});
	});

	if (hasLenis) {
		lenis.resize();
		lenis.start();
	}

	if (hasScrollTrigger) {
		ScrollTrigger.refresh();
	}
});

barba.init({
	debug: true,
	timeout: 7000,
	preventRunning: true,
	prefetchIgnore: false,
	transitions: [
		{
			name: "default",
			sync: false,

			async once(data) {
				initOnceFunctions();
				await runHeroPreloader(data.next.container);
				if (data.next.container.querySelector("[data-flick-cards-init]")) {
					requestAnimationFrame(() => {
						initFlickCards(data.next.container);
					});
				}
				return runPageOnceAnimation(data.next.container);
			},

			async leave(data) {
				return runPageLeaveAnimation(
					data.current.container,
					data.next.container,
				);
			},

			async enter(data) {
				return runPageEnterAnimation(data.next.container);
			},
		},
	],
});

// -----------------------------------------
// HOVER PREFETCH: preload next page on hover / touchstart
// -----------------------------------------
(function initHoverPrefetch() {
	var prefetched = {};
	var origin = window.location.origin;

	function isInternal(href) {
		if (!href) return false;
		if (
			href.startsWith("#") ||
			href.startsWith("mailto:") ||
			href.startsWith("tel:")
		)
			return false;
		try {
			var url = new URL(href, origin);
			return url.origin === origin;
		} catch (_) {
			return false;
		}
	}

	function prefetchUrl(href) {
		if (prefetched[href]) return;
		prefetched[href] = true;
		var link = document.createElement("link");
		link.rel = "prefetch";
		link.href = href;
		link.as = "document";
		document.head.appendChild(link);
	}

	function onIntent(e) {
		var t = e.target;
		if (!t || !t.closest) return;
		var anchor = t.closest("a[href]");
		if (!anchor) return;
		var href = anchor.href;
		if (isInternal(href)) prefetchUrl(href);
	}

	document.addEventListener("mouseover", onIntent, true);
	document.addEventListener("touchstart", onIntent, {
		capture: true,
		passive: true,
	});
	document.addEventListener("focusin", onIntent, true);
})();

// -----------------------------------------
// MEDIA SETUP (autoplay, click, hover)
// -----------------------------------------

function initMediaSetup() {
	const mediaElements = document.querySelectorAll("[data-media-init]");
	if (!mediaElements.length) return;

	const pauseDelay = 200;
	const viewportOffset = 0.1;
	const isHoverDevice = window.matchMedia(
		"(hover: hover) and (pointer: fine)",
	).matches;

	initMediaSetup._cleanup?.forEach((fn) => fn());
	const cleanupFns = [];
	const rootMarginValue = viewportOffset * 100;

	mediaElements.forEach((mediaEl) => {
		const video = mediaEl.querySelector("[data-media-video-src]");
		if (!video) return;

		const mode = mediaEl.dataset.mediaMode || "autoplay";
		const touchMode = mediaEl.dataset.mediaTouchMode;
		const resetAttr = mediaEl.dataset.mediaReset;
		const toggleElements = [...mediaEl.querySelectorAll("[data-media-toggle]")];

		const activeMode = !isHoverDevice
			? touchMode || (mode === "hover" ? "autoplay" : mode)
			: mode;
		const shouldResetOnPause =
			resetAttr === "true"
				? true
				: resetAttr === "false"
					? false
					: activeMode === "hover";

		const clickTargets = toggleElements.length ? toggleElements : [mediaEl];
		const shouldUseClickToggle =
			activeMode === "click" ||
			(activeMode === "autoplay" && toggleElements.length);

		let isInView = false;
		let isHovering = false;
		let hasLoaded = false;
		let userPaused = false;
		let userActivated = false;
		let isActivated = false;
		let shouldBePlaying = false;
		let pauseTimer = null;

		const setStatus = (status) => {
			mediaEl.dataset.mediaStatus = status;
		};

		const clearPauseTimer = () => {
			clearTimeout(pauseTimer);
		};

		const addCleanup = (fn) => {
			cleanupFns.push(fn);
		};

		const on = (target, event, handler) => {
			target.addEventListener(event, handler);
			addCleanup(() => target.removeEventListener(event, handler));
		};

		const playAttempt = () => {
			video
				.play()
				.then(() => {
					if (shouldBePlaying) setStatus("playing");
				})
				.catch(() => {});
		};

		const loadVideo = () => {
			if (hasLoaded) return;

			const src = video.dataset.mediaVideoSrc;
			if (!src) return;

			video.muted = true;
			video.playsInline = true;
			video.setAttribute("muted", "");
			video.setAttribute("playsinline", "");
			video.setAttribute("webkit-playsinline", "");
			video.src = src;
			video.load();
			hasLoaded = true;
		};

		const shouldResume = () => {
			if (!isInView || document.hidden) return false;
			if (activeMode === "autoplay") return !userPaused;
			if (activeMode === "click") return userActivated && !userPaused;
			return isHovering;
		};

		const playVideo = () => {
			if (!isInView || document.hidden) return;

			shouldBePlaying = true;
			clearPauseTimer();
			loadVideo();
			setStatus(video.readyState < 3 ? "loading" : "playing");
			playAttempt();
		};

		const pauseVideo = (delay = 0, reset = false) => {
			shouldBePlaying = false;
			clearPauseTimer();

			pauseTimer = setTimeout(() => {
				video.pause();
				if (reset) video.currentTime = 0;
			}, delay);
		};

		const handleHoverIn = () => {
			if (!isInView || document.hidden) return;

			isHovering = true;
			clearPauseTimer();

			if (!video.paused) {
				shouldBePlaying = true;
				setStatus("playing");
				return;
			}

			playVideo();
		};

		const handleHoverOut = () => {
			if (!isInView) return;

			isHovering = false;
			setStatus("not-active");
			pauseVideo(pauseDelay, shouldResetOnPause);
		};

		const handleClick = () => {
			if (!isInView || document.hidden) return;

			clearPauseTimer();

			if (video.paused) {
				userActivated = true;
				userPaused = false;
				playVideo();
			} else {
				userActivated = true;
				userPaused = true;
				setStatus(activeMode === "click" ? "paused" : "not-active");
				pauseVideo(pauseDelay, shouldResetOnPause);
			}
		};

		const handleViewport = (entries) => {
			entries.forEach((entry) => {
				if (entry.target !== mediaEl) return;

				if (!isActivated && entry.isIntersecting) {
					isActivated = true;

					if (shouldUseClickToggle) {
						clickTargets.forEach((toggleEl) =>
							on(toggleEl, "click", handleClick),
						);
					}

					if (activeMode === "hover") {
						on(mediaEl, "mouseenter", handleHoverIn);
						on(mediaEl, "mouseleave", handleHoverOut);
					}
				}

				isInView = entry.isIntersecting;

				if (isInView) {
					if (shouldResume()) playVideo();
				} else {
					isHovering = false;

					if (!video.paused || shouldBePlaying) {
						setStatus("paused");
						pauseVideo(0, false);
					}
				}
			});
		};

		const handlePageVisibilityChange = () => {
			if (document.hidden) {
				if (!video.paused || shouldBePlaying) {
					setStatus("paused");
					pauseVideo(0, false);
				}
				return;
			}
			if (shouldResume()) playVideo();
		};

		mediaEl.dataset.mediaStatus = "not-active";

		const observer = new IntersectionObserver(handleViewport, {
			rootMargin: `${rootMarginValue}% 0px ${rootMarginValue}% 0px`,
			threshold: 0,
		});

		observer.observe(mediaEl);

		on(video, "playing", () => {
			if (shouldBePlaying) setStatus("playing");
		});
		on(video, "waiting", () => {
			if (shouldBePlaying) setStatus("loading");
		});
		on(video, "canplay", () => {
			if (shouldBePlaying && isInView && !document.hidden) playAttempt();
		});
		on(video, "loadeddata", () => {
			if (shouldBePlaying && isInView && !document.hidden) playAttempt();
		});
		on(video, "ended", () => {
			if (!shouldBePlaying || !isInView || document.hidden) return;
			video.currentTime = 0;
			playAttempt();
		});

		on(document, "visibilitychange", handlePageVisibilityChange);

		addCleanup(() => observer.disconnect());
		addCleanup(() => {
			clearPauseTimer();
			shouldBePlaying = false;
			video.pause();
		});
	});

	initMediaSetup._cleanup = cleanupFns;
}

// -----------------------------------------
// CUSTOM CURSOR
// -----------------------------------------

let cursorMouseX = 0,
	cursorMouseY = 0;

function initCustomCursor() {
	if (initCustomCursor._rafId != null) {
		cancelAnimationFrame(initCustomCursor._rafId);
		initCustomCursor._rafId = null;
	}

	const cursor = document.querySelector('[data-cursor="view"]');
	if (!cursor) return;

	const cards = document.querySelectorAll("[data-cursor-trigger]");
	let cursorX = 0,
		cursorY = 0;

	if (!initCustomCursor._mouseBound) {
		initCustomCursor._mouseBound = true;
		document.addEventListener("mousemove", (e) => {
			cursorMouseX = e.clientX;
			cursorMouseY = e.clientY;
		});
	}

	cards.forEach((card) => {
		card.addEventListener("mouseenter", () => {
			cursor.dataset.cursorActive = "true";
		});
		card.addEventListener("mouseleave", () => {
			cursor.dataset.cursorActive = "false";
		});
	});

	function animate() {
		cursorX += (cursorMouseX - cursorX) * 0.12;
		cursorY += (cursorMouseY - cursorY) * 0.12;
		cursor.style.left = cursorX + "px";
		cursor.style.top = cursorY + "px";
		initCustomCursor._rafId = requestAnimationFrame(animate);
	}
	animate();
}

// -----------------------------------------
// WORK VIEW TOGGLE (Grid / Index)
// -----------------------------------------

let workViewToggleBound = false;

function initWorkViewToggle() {
	if (workViewToggleBound) return;
	workViewToggleBound = true;
	document.addEventListener("click", (e) => {
		var workBtn = e.target.closest("[data-view-work]");
		var indexBtn = e.target.closest("[data-view-index]");
		if (workBtn) {
			e.preventDefault();
			var wrap =
				workBtn.closest(".work_new_wrap") ||
				document.querySelector(".work_new_wrap");
			if (wrap) {
				wrap.classList.remove("is-active");
				document.body.classList.remove("u-theme-brand");
			}
		} else if (indexBtn) {
			e.preventDefault();
			var wrap =
				indexBtn.closest(".work_new_wrap") ||
				document.querySelector(".work_new_wrap");
			if (wrap) {
				wrap.classList.add("is-active");
				document.body.classList.add("u-theme-brand");
			}
		}
	});
}

// -----------------------------------------
// FOLIO GRID / LIST (Flip)
// -----------------------------------------

const FOLIO_FLIP_TARGETS = ".folio_item_visual, .folio_item_desc";
const FOLIO_FLIP_LISTS = ".folio_cms_list, .folio_cms_list_second";

let folioFlipViewToggleBound = false;

function syncFolioFlipViewInitialState() {
	if (!document.querySelector("[data-view-default]")) return;
	document.querySelectorAll("[data-view-default]").forEach((el) => {
		el.classList.add("active");
	});
	document.querySelectorAll("[data-view-list]").forEach((el) => {
		el.classList.remove("active");
	});
	document.querySelectorAll(FOLIO_FLIP_LISTS).forEach((el) => {
		el.classList.remove("list-view");
	});
}

function folioFlipApplyListView(useListView) {
	ensureFlipPluginRegistered();
	var FlipRef = typeof window !== "undefined" ? window.Flip : undefined;
	var lists = document.querySelectorAll(FOLIO_FLIP_LISTS);
	if (typeof FlipRef === "undefined" || !FlipRef || reducedMotion) {
		lists.forEach((list) => {
			list.classList.toggle("list-view", !!useListView);
		});
		return;
	}
	var state = FlipRef.getState(FOLIO_FLIP_TARGETS);
	lists.forEach((list) => {
		list.classList.toggle("list-view", !!useListView);
	});
	FlipRef.from(state, {
		duration: 0.5,
		nested: true,
		ease: "power1.inOut",
	});
}

function initFolioFlipViewToggle() {
	if (folioFlipViewToggleBound) return;
	folioFlipViewToggleBound = true;

	ensureFlipPluginRegistered();
	syncFolioFlipViewInitialState();

	document.addEventListener(
		"click",
		(e) => {
			var defaultBtn = e.target.closest("[data-view-default]");
			var listBtn = e.target.closest("[data-view-list]");
			if (!defaultBtn && !listBtn) return;

			e.preventDefault();
			e.stopPropagation();

			if (defaultBtn) {
				document.querySelectorAll("[data-view-default]").forEach((el) => {
					el.classList.add("active");
				});
				document.querySelectorAll("[data-view-list]").forEach((el) => {
					el.classList.remove("active");
				});
				folioFlipApplyListView(false);
				return;
			}

			document.querySelectorAll("[data-view-list]").forEach((el) => {
				el.classList.add("active");
			});
			document.querySelectorAll("[data-view-default]").forEach((el) => {
				el.classList.remove("active");
			});
			folioFlipApplyListView(true);
		},
		true,
	);
}

function scheduleFolioFlipViewToggleInit() {
	function run() {
		if (!folioFlipViewToggleBound) initFolioFlipViewToggle();
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run, { once: true });
	} else {
		requestAnimationFrame(run);
	}
}
scheduleFolioFlipViewToggleInit();

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
	light: {
		nav: "dark",
		transition: "light",
	},
	dark: {
		nav: "light",
		transition: "dark",
	},
};

function applyThemeFrom(container) {
	const pageTheme = container?.dataset?.pageTheme || "light";
	const config = themeConfig[pageTheme] || themeConfig.light;

	document.body.dataset.pageTheme = pageTheme;
	const transitionEl = document.querySelector("[data-theme-transition]");
	if (transitionEl) {
		transitionEl.dataset.themeTransition = config.transition;
	}

	const nav = document.querySelector("[data-theme-nav]");
	if (nav) {
		nav.dataset.themeNav = config.nav;
	}
}

function initLenis() {
	if (lenis) return;
	if (!hasLenis) return;

	lenis = new Lenis({
		lerp: 0.165,
		wheelMultiplier: 1.25,
	});

	if (hasScrollTrigger) {
		lenis.on("scroll", ScrollTrigger.update);
		ScrollTrigger.scrollerProxy(document.body, {
			scrollTop: function (value) {
				if (arguments.length) lenis.scrollTo(value);
				return lenis.scrollTop != null ? lenis.scrollTop : lenis.scroll;
			},
			getBoundingClientRect: () => ({
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			}),
		});
	}

	gsap.ticker.add((time) => {
		lenis.raf(time * 1000);
	});

	gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
	window.scrollTo(0, 0);
	resetLiveNavMenuClosedState();
	gsap.set(container, {
		clearProps: "position,top,left,right,transform,opacity,visibility,pointerEvents",
	});

	if (hasLenis) {
		lenis.resize();
		lenis.start();
	}
}

function debounceOnWidthChange(fn, ms) {
	let last = innerWidth,
		timer;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (innerWidth !== last) {
				last = innerWidth;
				fn.apply(this, args);
			}
		}, ms);
	};
}

function initBarbaNavUpdate(data) {
	var tpl = document.createElement("template");
	tpl.innerHTML = data.next.html.trim();
	var nextNodes = tpl.content.querySelectorAll("[data-barba-update]");
	var currentNodes = document.querySelectorAll("nav [data-barba-update]");

	currentNodes.forEach((curr, index) => {
		var next = nextNodes[index];
		if (!next) return;

		var newStatus = next.getAttribute("aria-current");
		if (newStatus !== null) {
			curr.setAttribute("aria-current", newStatus);
		} else {
			curr.removeAttribute("aria-current");
		}

		var newClassList = next.getAttribute("class") || "";
		curr.setAttribute("class", newClassList);
	});
}

// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

// -----------------------------------------
// MINIMAP: infinite carousel (.minimap_wrap), orientation via track cursor (ew-resize = mobile)
// -----------------------------------------
var _minimapInstances = [];
var _minimapLagSmoothingSet = false;

function teardownDetachedMinimapInstances() {
	for (var i = _minimapInstances.length - 1; i >= 0; i--) {
		var inst = _minimapInstances[i];
		if (!inst.root || !inst.root.isConnected) {
			if (typeof inst.teardown === "function") inst.teardown();
			_minimapInstances.splice(i, 1);
		}
	}
}

function initMinimapWrap(scope) {
	if (typeof gsap === "undefined" || !gsap.ticker) return;
	var rootEl = scope && scope.querySelectorAll ? scope : document;
	var wraps = rootEl.querySelectorAll(".minimap_wrap");
	if (!wraps.length) return;

	Array.prototype.forEach.call(wraps, (component) => {
		if (component.dataset.scriptInitialized === "true") return;

		var trackWrap = component.querySelector(".minimap_track_wrap");
		var indicator = component.querySelector(".minimap_indicator");
		var itemsEl = component.querySelector(".minimap_items");
		var previewImg = component.querySelector(".minimap_preview_img");
		var counterCur = component.querySelector(".minimap_counter_current");
		var counterTot = component.querySelector(".minimap_counter_total");
		if (
			!trackWrap ||
			!indicator ||
			!itemsEl ||
			!previewImg ||
			!counterCur ||
			!counterTot
		)
			return;

		var itemEls = Array.prototype.slice.call(
			itemsEl.querySelectorAll(".minimap_item"),
		);
		var n = itemEls.length;
		if (!n) return;

		component.dataset.scriptInitialized = "true";

		counterTot.textContent = String(n).padStart(2, "0");

		function getItemSrc(idx) {
			var img = itemEls[idx].querySelector(".minimap_item_img");
			return img ? img.src : "";
		}

		function isMobile() {
			return getComputedStyle(trackWrap).cursor === "ew-resize";
		}

		function getItemSize() {
			return isMobile()
				? itemEls[0].getBoundingClientRect().width
				: itemEls[0].getBoundingClientRect().height;
		}

		function getAxisSize() {
			var r = trackWrap.getBoundingClientRect();
			return isMobile() ? r.width : r.height;
		}

		function setIndicatorPos() {
			var axisSize = getAxisSize();
			var itemSize = getItemSize();
			var centre = axisSize / 2 - itemSize / 2;
			if (isMobile()) {
				indicator.style.left = centre + "px";
				indicator.style.top = "0px";
			} else {
				indicator.style.top = centre + "px";
				indicator.style.left = "0px";
			}
		}

		var off = 0;
		var tgt = 0;
		var activeIdx = -1;

		function initOffset() {
			var axisSize = getAxisSize();
			var itemSize = getItemSize();
			off = axisSize / 2 - itemSize / 2;
			tgt = off;
		}

		function mod(a, b) {
			return ((a % b) + b) % b;
		}

		function renderItems(o) {
			var axisSize = getAxisSize();
			var itemSize = getItemSize();
			var cyclePx = n * itemSize;
			var centre = axisSize / 2 - itemSize / 2 - o;
			var ri = mod(Math.round(centre / itemSize), n);
			itemEls.forEach((el, i) => {
				var naturalPos = i * itemSize;
				var delta = centre - naturalPos;
				var cycles = Math.round(delta / cyclePx);
				var pos = naturalPos + cycles * cyclePx;
				var screenPos = pos + o;
				el.style.transform = isMobile()
					? "translateX(" + screenPos + "px)"
					: "translateY(" + screenPos + "px)";
			});
			if (ri !== activeIdx) {
				activeIdx = ri;
				counterCur.textContent = String(ri + 1).padStart(2, "0");
				previewImg.src = getItemSrc(ri);
			}
		}

		if (!_minimapLagSmoothingSet) {
			gsap.ticker.lagSmoothing(0);
			_minimapLagSmoothingSet = true;
		}

		var inst = { root: component, teardown: null };
		_minimapInstances.push(inst);

		var teardownParts = [];

		function onResize() {
			if (!component.isConnected) return;
			setIndicatorPos();
			initOffset();
			renderItems(off);
		}
		window.addEventListener("resize", onResize);
		teardownParts.push(() => {
			window.removeEventListener("resize", onResize);
		});

		function tickerFn() {
			if (!component.isConnected) return;
			var diff = tgt - off;
			if (Math.abs(diff) > 0.01) {
				off += diff * 0.075;
				renderItems(off);
			}
		}
		gsap.ticker.add(tickerFn);
		teardownParts.push(() => {
			gsap.ticker.remove(tickerFn);
		});

		function onWheel(e) {
			if (!component.isConnected) return;
			e.preventDefault();
			e.stopPropagation();
			tgt -= Math.min(Math.max(e.deltaY * 0.5, -20), 20);
		}
		var wheelOpts = { passive: false, capture: true };
		component.addEventListener("wheel", onWheel, wheelOpts);
		teardownParts.push(() => {
			component.removeEventListener("wheel", onWheel, wheelOpts);
		});

		itemEls.forEach((el, idx) => {
			function onItemClick() {
				if (!component.isConnected) return;
				var axisSize = getAxisSize();
				var itemSize = getItemSize();
				var cyclePx = n * itemSize;
				var centre = axisSize / 2 - itemSize / 2 - off;
				var naturalPos = idx * itemSize;
				var cycles = Math.round((centre - naturalPos) / cyclePx);
				var pos = naturalPos + cycles * cyclePx;
				tgt = axisSize / 2 - itemSize / 2 - pos;
			}
			el.addEventListener("click", onItemClick);
			teardownParts.push(() => {
				el.removeEventListener("click", onItemClick);
			});
		});

		var drag = false;
		var dragStart = 0;
		var dragT = 0;

		function onTrackMouseDown(e) {
			drag = true;
			dragStart = isMobile() ? e.clientX : e.clientY;
			dragT = tgt;
			document.body.style.cursor = isMobile() ? "ew-resize" : "grabbing";
		}
		trackWrap.addEventListener("mousedown", onTrackMouseDown);
		teardownParts.push(() => {
			trackWrap.removeEventListener("mousedown", onTrackMouseDown);
		});

		function onWinMouseMove(e) {
			if (!drag) return;
			tgt = dragT + ((isMobile() ? e.clientX : e.clientY) - dragStart);
		}
		function onWinMouseUp() {
			drag = false;
			document.body.style.cursor = "";
		}
		window.addEventListener("mousemove", onWinMouseMove);
		window.addEventListener("mouseup", onWinMouseUp);
		teardownParts.push(() => {
			window.removeEventListener("mousemove", onWinMouseMove);
			window.removeEventListener("mouseup", onWinMouseUp);
		});

		var touchStart = 0;
		function onTouchStart(e) {
			touchStart = isMobile() ? e.touches[0].clientX : e.touches[0].clientY;
		}
		function onTouchMove(e) {
			if (!component.isConnected) return;
			e.preventDefault();
			var pos = isMobile() ? e.touches[0].clientX : e.touches[0].clientY;
			var delta = touchStart - pos;
			touchStart = pos;
			tgt -= Math.min(Math.max(delta * 0.8, -20), 20);
		}
		component.addEventListener("touchstart", onTouchStart, { passive: true });
		component.addEventListener("touchmove", onTouchMove, { passive: false });
		teardownParts.push(() => {
			component.removeEventListener("touchstart", onTouchStart, {
				passive: true,
			});
			component.removeEventListener("touchmove", onTouchMove, {
				passive: false,
			});
		});

		function onKeyDown(e) {
			if (!component.isConnected) return;
			var itemSize = getItemSize();
			if (e.key === "ArrowDown" || e.key === "ArrowRight") {
				e.preventDefault();
				tgt -= itemSize;
			}
			if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
				e.preventDefault();
				tgt += itemSize;
			}
		}
		window.addEventListener("keydown", onKeyDown);
		teardownParts.push(() => {
			window.removeEventListener("keydown", onKeyDown);
		});

		inst.teardown = () => {
			for (var ti = 0; ti < teardownParts.length; ti++) {
				try {
					teardownParts[ti]();
				} catch (_) {}
			}
		};

		setIndicatorPos();
		initOffset();
		renderItems(off);

		requestAnimationFrame(() => {
			if (component.isConnected) component.classList.add("minimap--ready");
		});
	});
}

// -----------------------------------------
// NAV WRAP: Mobile-Overlay (TV-Static-Canvas), Desktop-Logo- + Link-Scramble
// Erwartet: .nav_wrap, .nav_toggle_wrap, .nav_wordmark, #nav-menu, .nav_static_canvas,
// .nav_mobile_link_wrap, .nav_logo_wrap + .nav_logo_text, .nav_link_wrap + .nav_link_text
// Hinweis: Entferne data-scramble-hover auf denselben Links, sonst doppelte Hover-Logik.
// -----------------------------------------
function initNavWrapInteractive(scope) {
	var rootEl = scope && scope.querySelectorAll ? scope : document;
	var wraps = rootEl.querySelectorAll(".nav_wrap");
	if (!wraps.length) return;

	var menuGlobal =
		typeof document !== "undefined"
			? document.getElementById("nav-menu")
			: null;

	Array.prototype.forEach.call(wraps, (component) => {
		if (component.dataset.scriptInitialized === "true") return;
		component.dataset.scriptInitialized = "true";
		component.style.visibility = "visible";

		var toggle = component.querySelector(".nav_toggle_wrap");
		var wordmark = component.querySelector(".nav_wordmark");
		var menu = menuGlobal;
		if (!toggle || !menu) return;

		var mobileLinks = Array.prototype.slice.call(
			menu.querySelectorAll(".nav_mobile_link_wrap"),
		);

		menu.classList.remove("is-preview", "is-active", "is-settled");
		menu.setAttribute("aria-hidden", "true");
		menu.style.display = "";
		menu.style.visibility = "";
		menu.style.opacity = "";
		menu.style.pointerEvents = "";
		menu.style.clipPath = "";
		if (wordmark) wordmark.style.opacity = "0";
		mobileLinks.forEach((a) => {
			a.setAttribute("tabindex", "-1");
			a.style.opacity = "";
			a.style.transform = "";
			a.style.transition = "";
		});
		menu.classList.add("nav-menu--ready");

		var canvas = menu.querySelector(".nav_static_canvas");
		if (!canvas || !canvas.getContext) return;
		var ctx = canvas.getContext("2d");

		var isOpen = false;
		var rafId = null;
		var scrambleTimers = [];
		var pendingMenuNavigation = false;

		function logMenuEvent(event, extra) {
			navDebugLog(
				event,
				Object.assign(
					{
						isOpen: isOpen,
						pendingMenuNavigation: pendingMenuNavigation,
						menuState: getNavMenuDebugState(menu),
					},
					extra || {},
				),
			);
		}

		logMenuEvent("nav:init", {
			componentClasses: component.className,
		});

		function resizeCanvas() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		var staticFrames = 0;
		var maxStaticFrames = 0;

		function animateStatic() {
			if (reducedMotion) return;
			if (staticFrames >= maxStaticFrames) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				return;
			}
			var t = staticFrames / maxStaticFrames;
			var intensity = 0.4 * (1 - t);
			var w = canvas.width;
			var h = canvas.height;
			var imageData = ctx.createImageData(w, h);
			var data = imageData.data;
			for (var i = 0; i < data.length; i += 4) {
				var v = Math.random() < intensity ? 255 : 0;
				data[i] = data[i + 1] = data[i + 2] = v;
				data[i + 3] = Math.floor(Math.random() * 60 + 10);
			}
			ctx.putImageData(imageData, 0, 0);
			staticFrames++;
			rafId = requestAnimationFrame(animateStatic);
		}

		function startStatic(durationMs) {
			if (reducedMotion) return;
			cancelAnimationFrame(rafId);
			staticFrames = 0;
			maxStaticFrames = Math.round(durationMs / 16.67);
			animateStatic();
		}

		var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

		function setTextNodeOrEl(el, text) {
			if (!el) return;
			if (el.nodeType === 3) el.nodeValue = text;
			else el.textContent = text;
		}

		function getTextFromLinkChild(a) {
			var n = a.childNodes[0];
			if (!n) return "";
			if (n.nodeType === 3) return (n.nodeValue || "").trim();
			return (n.textContent || "").trim();
		}

		function scrambleEl(el, finalText, duration, delay) {
			if (reducedMotion) {
				setTextNodeOrEl(el, finalText);
				return;
			}
			var id = setTimeout(() => {
				var start = performance.now();
				var len = finalText.length;
				function frame(now) {
					var t = Math.min((now - start) / duration, 1);
					var revealed = Math.floor(t * len);
					var out = "";
					for (var j = 0; j < len; j++) {
						out +=
							j < revealed
								? finalText[j]
								: finalText[j] === " "
									? " "
									: CHARS[Math.floor(Math.random() * CHARS.length)];
					}
					setTextNodeOrEl(el, out);
					if (t < 1) requestAnimationFrame(frame);
					else setTextNodeOrEl(el, finalText);
				}
				requestAnimationFrame(frame);
			}, delay || 0);
			scrambleTimers.push(id);
		}

		function clearScrambles() {
			scrambleTimers.forEach((tid) => {
				clearTimeout(tid);
			});
			scrambleTimers = [];
		}

		function getMobileLinkEl(linkWrap) {
			if (!linkWrap || !linkWrap.querySelector) return null;
			if (linkWrap.matches && linkWrap.matches("a[href]")) return linkWrap;
			return linkWrap.querySelector("a[href]");
		}

		function getMobileLinkUrl(linkWrap) {
			var linkEl = getMobileLinkEl(linkWrap);
			var href = linkEl && linkEl.getAttribute("href");
			if (!href || href === "#" || href.charAt(0) === "#") return null;
			if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0)
				return null;
			if (linkEl.hasAttribute("download")) return null;
			if (linkEl.target && linkEl.target !== "_self") return null;

			try {
				var url = new URL(href, window.location.href);
				if (url.origin !== window.location.origin) return null;
				if (
					url.pathname === window.location.pathname &&
					url.search === window.location.search
				)
					return null;
				return url.href;
			} catch (_) {
				return null;
			}
		}

		function openMenu() {
			var openStaticMs = slowMs(650);
			var openLinkOpacityMs = slowMs(10);
			var openLinkMoveMs = slowMs(400);
			var openLinkDelayStep = slowMs(60);
			var openScrambleDuration = slowMs(420);
			var openScrambleDelayStep = slowMs(70);
			var openScrambleDelayBase = slowMs(80);
			var openFocusDelay = slowMs(300);
			logMenuEvent("nav:open:start");
			isOpen = true;
			menu.classList.add("is-active");
			menu.classList.remove("is-settled");
			menu.removeAttribute("aria-hidden");
			toggle.setAttribute("aria-expanded", "true");
			toggle.setAttribute("aria-label", "Close menu");
			if (wordmark) wordmark.style.opacity = "1";
			mobileLinks.forEach((a) => {
				a.setAttribute("tabindex", "0");
			});
			logMenuEvent("nav:open:activated");
			startStatic(openStaticMs);
			setTimeout(() => {
				menu.classList.add("is-settled");
				logMenuEvent("nav:open:settled");
			}, openStaticMs);

			var texts = mobileLinks.map(
				(a) => a.dataset.original || getTextFromLinkChild(a),
			);
			mobileLinks.forEach((a, i) => {
				a.dataset.original = texts[i];
				a.style.opacity = "1";
				a.style.transform = "translateY(0)";
				a.style.transition =
					"opacity " +
					openLinkOpacityMs +
					"ms " +
					i * openLinkDelayStep +
					"ms, transform " +
					openLinkMoveMs +
					"ms cubic-bezier(0.22,1,0.36,1) " +
					i * openLinkDelayStep +
					"ms";
				var textNode = a.childNodes[0];
				if (textNode)
					scrambleEl(
						textNode,
						texts[i],
						openScrambleDuration,
						i * openScrambleDelayStep + openScrambleDelayBase,
					);
			});
			setTimeout(() => {
				if (mobileLinks[0]) mobileLinks[0].focus();
				logMenuEvent("nav:open:focus-first-link");
			}, openFocusDelay);
		}

		function closeMenu(options) {
			options = options || {};
			var immediate = !!options.immediate;
			var restoreFocus = options.restoreFocus !== false;
			var closeOpacityMs = slowMs(220);
			var closeMoveMs = slowMs(280);
			var closeDelayStep = slowMs(35);
			var closeStaticMs = slowMs(400);
			var closeHideDelay = slowMs(200);
			var closeCleanupDelay = slowMs(750);
			logMenuEvent("nav:close:start", {
				immediate: immediate,
				restoreFocus: restoreFocus,
			});

			isOpen = false;
			toggle.setAttribute("aria-expanded", "false");
			toggle.setAttribute("aria-label", "Open menu");
			if (wordmark) wordmark.style.opacity = "0";
			clearScrambles();

			mobileLinks.forEach((a) => {
				a.setAttribute("tabindex", "-1");
			});

			if (immediate) {
				cancelAnimationFrame(rafId);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				menu.classList.remove("is-active", "is-settled");
				menu.setAttribute("aria-hidden", "true");
				mobileLinks.forEach((a) => {
					a.style.transition = "";
					a.style.opacity = "";
					a.style.transform = "";
				});
				if (restoreFocus) toggle.focus();
				logMenuEvent("nav:close:immediate-complete");
				return;
			}

			var reversed = mobileLinks.slice().reverse();
			reversed.forEach((a, i) => {
				a.style.transition =
					"opacity " +
					closeOpacityMs +
					"ms cubic-bezier(0.4,0,1,1) " +
					i * closeDelayStep +
					"ms, transform " +
					closeMoveMs +
					"ms cubic-bezier(0.4,0,1,1) " +
					i * closeDelayStep +
					"ms";
				a.style.opacity = "0";
				a.style.transform = "translateY(0.75rem)";
			});
			startStatic(closeStaticMs);
			setTimeout(() => {
				menu.classList.remove("is-active", "is-settled");
				menu.setAttribute("aria-hidden", "true");
				logMenuEvent("nav:close:hidden");
			}, closeHideDelay);
			setTimeout(() => {
				cancelAnimationFrame(rafId);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				mobileLinks.forEach((a) => {
					a.style.transition = "";
				});
				logMenuEvent("nav:close:cleanup-complete");
			}, closeCleanupDelay);
			if (restoreFocus) toggle.focus();
		}

		_resetNavMenuPendingNavigation = () => {
			pendingMenuNavigation = false;
			logMenuEvent("nav:pending-navigation:reset");
		};

		toggle.addEventListener("click", () => {
			logMenuEvent("nav:toggle:click");
			if (isOpen) closeMenu();
			else openMenu();
		});

		document.addEventListener("keydown", (e) => {
			if (!isOpen) return;
			if (e.key === "Escape") {
				closeMenu();
				return;
			}
			if (e.key === "Tab") {
				var focusable = [toggle].concat(mobileLinks);
				var first = focusable[0];
				var last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		});

		mobileLinks.forEach((a) => {
			a.addEventListener("click", (e) => {
				var href = getMobileLinkUrl(a);
				var label = a.dataset.original || getTextFromLinkChild(a) || null;
				var isPlainClick =
					!e.metaKey &&
					!e.ctrlKey &&
					!e.shiftKey &&
					!e.altKey &&
					(e.button == null || e.button === 0);
				logMenuEvent("nav:link:click", {
					href: href,
					label: label,
					isPlainClick: isPlainClick,
				});

				if (href && isPlainClick && typeof barba !== "undefined" && barba.go) {
					e.preventDefault();
					if (pendingMenuNavigation) {
						logMenuEvent("nav:link:blocked-pending", { href: href });
						return;
					}
					if (barba.transitions && barba.transitions.isRunning) {
						logMenuEvent("nav:link:blocked-transition-running", {
							href: href,
						});
						return;
					}

					beginNavDebugSession("nav:link:barba-navigation", {
						href: href,
						label: label,
						menuState: getNavMenuDebugState(menu),
						slowMo: NAV_DEBUG_SLOWMO,
					});
					pendingMenuNavigation = true;
					logMenuEvent("nav:link:pending-navigation-set", {
						href: href,
					});
					armTransitionScreen(label);
					logMenuEvent("nav:link:before-barba-go", { href: href });
					barba.go(href, a, e);
					return;
				}

				logMenuEvent("nav:link:fallback-close", {
					href: href,
					label: label,
				});
				closeMenu({ immediate: true, restoreFocus: false });
			});
		});

		menu.addEventListener(
			"touchmove",
			(e) => {
				e.preventDefault();
			},
			{ passive: false },
		);

		var logoWrap = component.querySelector(".nav_logo_wrap");
		var logoText = component.querySelector(".nav_logo_text");
		var LOGO_SHORT = "J    N     ";
		var LOGO_FULL = "JAWS NELSON";
		var logoRaf = null;
		var logoActive = false;

		function scrambleLogo(target, duration) {
			if (!logoText) return;
			if (reducedMotion) {
				logoText.textContent = target;
				return;
			}
			cancelAnimationFrame(logoRaf);
			var start = performance.now();
			var len = target.length;
			var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			function frame(now) {
				var t = Math.min((now - start) / duration, 1);
				var revealed = Math.floor(t * len);
				var out = "";
				for (var k = 0; k < len; k++) {
					out +=
						k < revealed
							? target[k]
							: target[k] === " "
								? " "
								: chars[Math.floor(Math.random() * chars.length)];
				}
				logoText.textContent = out;
				if (t < 1) logoRaf = requestAnimationFrame(frame);
				else logoText.textContent = target;
			}
			logoRaf = requestAnimationFrame(frame);
		}

		if (logoWrap && logoText) {
			logoWrap.addEventListener("mouseenter", () => {
				if (!logoActive) {
					logoActive = true;
					scrambleLogo(LOGO_FULL, 380);
				}
			});
			logoWrap.addEventListener("mouseleave", () => {
				logoActive = false;
				scrambleLogo(LOGO_SHORT, 220);
			});
			logoWrap.addEventListener("focus", () => {
				if (!logoActive) {
					logoActive = true;
					scrambleLogo(LOGO_FULL, 380);
				}
			});
			logoWrap.addEventListener("blur", () => {
				logoActive = false;
				scrambleLogo(LOGO_SHORT, 220);
			});
		}

		var desktopLinks = component.querySelectorAll(".nav_link_wrap");
		var linkRafs = new Map();
		var linkChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

		function scrambleLink(el, target, duration) {
			var textEl = el.querySelector(".nav_link_text");
			if (!textEl) return;
			if (reducedMotion) {
				textEl.textContent = target;
				return;
			}
			if (linkRafs.has(el)) cancelAnimationFrame(linkRafs.get(el));
			var start = performance.now();
			var len = target.length;
			function frame(now) {
				var t = Math.min((now - start) / duration, 1);
				var revealed = Math.floor(t * len);
				var out = "";
				for (var m = 0; m < len; m++) {
					out +=
						m < revealed
							? target[m]
							: target[m] === " "
								? " "
								: linkChars[Math.floor(Math.random() * linkChars.length)];
				}
				textEl.textContent = out;
				if (t < 1) linkRafs.set(el, requestAnimationFrame(frame));
				else {
					textEl.textContent = target;
					linkRafs.delete(el);
				}
			}
			linkRafs.set(el, requestAnimationFrame(frame));
		}

		Array.prototype.forEach.call(desktopLinks, (a) => {
			var te = a.querySelector(".nav_link_text");
			if (!te) return;
			var original = (te.textContent || "").trim();
			if (!original) return;
			a.addEventListener("mouseenter", () => {
				scrambleLink(a, original, 320);
			});
			a.addEventListener("mouseleave", () => {
				scrambleLink(a, original, 200);
			});
		});
	});
}

// -----------------------------------------
// FAQ ACCORDION (GSAP)
// -----------------------------------------
function initFaqAccordion(scope) {
	if (typeof gsap === "undefined") return;

	var root = scope && scope.querySelector ? scope : document;
	var cmsWraps = root.querySelectorAll(".faq_cms_wrap");
	if (!cmsWraps.length) return;

	cmsWraps.forEach((cmsWrap, listIndex) => {
		if (cmsWrap.dataset.scriptInitialized) return;
		cmsWrap.dataset.scriptInitialized = "true";

		var closePrevious = cmsWrap.getAttribute("data-close-previous") !== "false";
		var closeOnSecondClick =
			cmsWrap.getAttribute("data-close-on-second-click") !== "false";
		var openOnHover = cmsWrap.getAttribute("data-open-on-hover") === "true";
		var openByDefaultAttr = cmsWrap.getAttribute("data-open-by-default");
		var openByDefault =
			openByDefaultAttr !== null && !isNaN(+openByDefaultAttr)
				? +openByDefaultAttr
				: false;

		var previousIndex = null;
		var closeFunctions = [];

		cmsWrap
			.querySelectorAll(".faq_component")
			.forEach((thisCard, cardIndex) => {
				var button = thisCard.querySelector(".faq_toggle_button");
				var content = thisCard.querySelector(".faq_content_wrap");
				var icon = thisCard.querySelector(".faq_toggle_icon");

				if (!button || !content || !icon) return;

				button.setAttribute("aria-expanded", "false");
				button.setAttribute("id", "faq_button_" + listIndex + "_" + cardIndex);
				content.setAttribute(
					"id",
					"faq_content_" + listIndex + "_" + cardIndex,
				);
				button.setAttribute("aria-controls", content.id);
				content.setAttribute("aria-labelledby", button.id);
				content.style.display = "none";

				var scrollToRestore = null;

				function getScrollY() {
					return lenis && (lenis.scrollTop != null || lenis.scroll != null)
						? lenis.scrollTop != null
							? lenis.scrollTop
							: lenis.scroll
						: window.scrollY || window.pageYOffset;
				}

				function refresh() {
					tl.invalidate();
					if (scrollToRestore != null) {
						var y = scrollToRestore;
						scrollToRestore = null;
						requestAnimationFrame(() => {
							requestAnimationFrame(() => {
								if (lenis && lenis.scrollTo)
									lenis.scrollTo(y, { immediate: true });
								else window.scrollTo(0, y);
							});
						});
					}
				}

				var tl = gsap.timeline({
					paused: true,
					defaults: { duration: 0.3, ease: "power1.inOut" },
					onComplete: refresh,
					onReverseComplete: refresh,
				});
				tl.set(content, { display: "block" });
				tl.fromTo(content, { height: 0 }, { height: "auto" });
				tl.fromTo(icon, { rotate: 0 }, { rotate: -180 }, "<");

				function closeAccordion() {
					if (!thisCard.classList.contains("is-opened")) return;
					thisCard.classList.remove("is-opened");
					thisCard.classList.remove("u-theme-dark");
					tl.reverse();
					button.setAttribute("aria-expanded", "false");
				}
				closeFunctions[cardIndex] = closeAccordion;

				function openAccordion(instant) {
					if (
						closePrevious &&
						previousIndex !== null &&
						previousIndex !== cardIndex
					) {
						if (closeFunctions[previousIndex]) closeFunctions[previousIndex]();
					}
					previousIndex = cardIndex;
					button.setAttribute("aria-expanded", "true");
					thisCard.classList.add("is-opened");
					thisCard.classList.add("u-theme-dark");
					if (instant) tl.progress(1);
					else tl.play();
				}

				if (openByDefault === cardIndex) openAccordion(true);

				button.addEventListener("click", (e) => {
					e.preventDefault();
					e.stopPropagation();
					scrollToRestore = getScrollY();
					if (thisCard.classList.contains("is-opened") && closeOnSecondClick) {
						closeAccordion();
						previousIndex = null;
					} else {
						openAccordion();
					}
				});

				if (openOnHover) {
					button.addEventListener("mouseenter", () => {
						scrollToRestore = getScrollY();
						openAccordion();
					});
				}
			});
	});
}

// -----------------------------------------
// MARQUEE (Scroll Direction + Scrub)
// -----------------------------------------
function initMarqueeScrollDirection(scope) {
	if (typeof gsap === "undefined" || !hasScrollTrigger || reducedMotion) return;

	var root = scope && scope.querySelector ? scope : document;
	var marquees = root.querySelectorAll(
		"[data-marquee-scroll-direction-target]",
	);
	if (!marquees.length) return;

	marquees.forEach((marquee) => {
		if (marquee.dataset.marqueeScrollDirectionInit === "true") return;
		marquee.dataset.marqueeScrollDirectionInit = "true";

		var marqueeContent = marquee.querySelector(
			"[data-marquee-collection-target]",
		);
		var marqueeScroll = marquee.querySelector("[data-marquee-scroll-target]");
		if (!marqueeContent || !marqueeScroll) return;

		var speedAttr = parseFloat(marquee.dataset.marqueeSpeed) || 20;
		var directionAttr = marquee.dataset.marqueeDirection === "right" ? 1 : -1;
		var duplicateAmount = parseInt(marquee.dataset.marqueeDuplicate || "0", 10);
		var scrollSpeedAttr = parseFloat(marquee.dataset.marqueeScrollSpeed) || 0;

		var speedMultiplier =
			window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;
		var marqueeSpeed =
			speedAttr *
			(marqueeContent.offsetWidth / window.innerWidth) *
			speedMultiplier;

		marqueeScroll.style.marginLeft = scrollSpeedAttr * -1 + "%";
		marqueeScroll.style.width = scrollSpeedAttr * 2 + 100 + "%";

		if (duplicateAmount > 0) {
			var fragment = document.createDocumentFragment();
			for (var i = 0; i < duplicateAmount; i++) {
				fragment.appendChild(marqueeContent.cloneNode(true));
			}
			marqueeScroll.appendChild(fragment);
		}

		var marqueeItems = marquee.querySelectorAll(
			"[data-marquee-collection-target]",
		);
		var animation = gsap
			.to(marqueeItems, {
				xPercent: -100,
				repeat: -1,
				duration: marqueeSpeed,
				ease: "linear",
			})
			.totalProgress(0.5);

		gsap.set(marqueeItems, { xPercent: directionAttr === 1 ? 100 : -100 });
		animation.timeScale(directionAttr);
		animation.play();

		marquee.setAttribute("data-marquee-status", "normal");

		ScrollTrigger.create({
			trigger: marquee,
			start: "top bottom",
			end: "bottom top",
			onUpdate: (self) => {
				var isInverted = self.direction === 1;
				var currentDirection = isInverted ? -directionAttr : directionAttr;
				animation.timeScale(currentDirection);
				marquee.setAttribute(
					"data-marquee-status",
					isInverted ? "normal" : "inverted",
				);
			},
		});

		var scrollStart = directionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
		var scrollEnd = -scrollStart;
		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: marquee,
				start: "0% 100%",
				end: "100% 0%",
				scrub: 0,
			},
		});
		tl.fromTo(
			marqueeScroll,
			{ x: scrollStart + "vw" },
			{ x: scrollEnd + "vw", ease: "none" },
		);
	});
}

// -----------------------------------------
// FLICK CARDS (GSAP Draggable)
// -----------------------------------------
function initFlickCards(scope) {
	if (typeof gsap === "undefined" || typeof Draggable === "undefined") return;

	var root = scope && scope.querySelector ? scope : document;
	var sliders = root.querySelectorAll("[data-flick-cards-init]");
	if (!sliders.length) return;

	sliders.forEach((slider) => {
		if (slider.dataset.flickCardsSetup === "true") return;
		slider.dataset.flickCardsSetup = "true";

		var list = slider.querySelector("[data-flick-cards-list]");
		if (!list) return;

		var cards = Array.from(list.querySelectorAll("[data-flick-cards-item]"));
		var total = cards.length;
		var activeIndex = 0;

		var sliderWidth = slider.offsetWidth;
		var threshold = 0.1;
		var parallaxStrength = 8;
		var autoplayInterval = null;
		var autoplayDelay = 1500;
		var isAutoplayEnabled = true;

		var draggers = [];
		cards.forEach((card) => {
			var dragger = document.createElement("div");
			dragger.setAttribute("data-flick-cards-dragger", "");
			card.appendChild(dragger);
			draggers.push(dragger);
		});

		cards.forEach((card) => {
			var img = card.querySelector("img, [data-flick-cards-media]");
			if (img) {
				img.style.width = "120%";
				img.style.height = "120%";
				img.style.objectFit = "cover";
				img.style.position = "absolute";
				img.style.top = "-10%";
				img.style.left = "-10%";
				img.style.willChange = "transform";
			}
		});

		slider.setAttribute("data-flick-drag-status", "grab");

		function getConfig(i, currentIndex) {
			var diff = i - currentIndex;
			if (diff > total / 2) diff -= total;
			else if (diff < -total / 2) diff += total;

			var step = 100;

			if (diff === 0) {
				return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 10, visible: true, px: 0 };
			}

			var absDiff = Math.abs(diff);
			var dir = diff > 0 ? 1 : -1;
			var opacity = Math.max(0.2, 1 - absDiff * 0.3);

			if (absDiff <= 6) {
				return {
					x: dir * step * absDiff,
					y: 0,
					rot: 0,
					s: 1,
					o: opacity,
					z: 10 - absDiff,
					visible: true,
					px: -dir * parallaxStrength * Math.min(absDiff, 3),
				};
			}

			return {
				x: dir * step * absDiff,
				y: 0,
				rot: 0,
				s: 1,
				o: opacity,
				z: 3,
				visible: false,
				px: -dir * parallaxStrength * 3,
			};
		}

		function applyParallax(card, pxValue) {
			var img = card.querySelector("img, [data-flick-cards-media]");
			if (!img) return;
			gsap.to(img, {
				duration: 0.65,
				ease: "power3.out",
				xPercent: pxValue,
			});
		}

		function setParallaxImmediate(card, pxValue) {
			var img = card.querySelector("img, [data-flick-cards-media]");
			if (!img) return;
			gsap.set(img, { xPercent: pxValue });
		}

		function renderCards(currentIndex) {
			cards.forEach((card, i) => {
				var cfg = getConfig(i, currentIndex);

				var absDiff = Math.abs(i - currentIndex);
				var wrappedDiff = Math.min(absDiff, total - absDiff);
				var status;

				if (wrappedDiff === 0) status = "active";
				else if (cfg.x > 0 && wrappedDiff === 1) status = "2-after";
				else if (cfg.x < 0 && wrappedDiff === 1) status = "2-before";
				else if (cfg.x > 0 && wrappedDiff === 2) status = "3-after";
				else if (cfg.x < 0 && wrappedDiff === 2) status = "3-before";
				else status = "hidden";

				card.setAttribute("data-flick-cards-item-status", status);
				card.style.zIndex = cfg.z;
				card.style.visibility = cfg.visible ? "visible" : "hidden";

				gsap.to(card, {
					duration: 0.65,
					ease: "power3.out",
					xPercent: cfg.x,
					yPercent: cfg.y,
					rotation: cfg.rot,
					scale: cfg.s,
					opacity: cfg.o,
				});

				applyParallax(card, cfg.px);
			});
		}

		function goNext() {
			activeIndex = (activeIndex + 1) % total;
			renderCards(activeIndex);
			resetAutoplay();
		}

		function goPrev() {
			activeIndex = (activeIndex - 1 + total) % total;
			renderCards(activeIndex);
			resetAutoplay();
		}

		function startAutoplay() {
			if (!isAutoplayEnabled) return;
			stopAutoplay();
			autoplayInterval = setInterval(goNext, autoplayDelay);
		}

		function stopAutoplay() {
			if (autoplayInterval) {
				clearInterval(autoplayInterval);
				autoplayInterval = null;
			}
		}

		function resetAutoplay() {
			if (isAutoplayEnabled) startAutoplay();
		}

		slider.addEventListener("mouseenter", stopAutoplay);
		slider.addEventListener("mouseleave", () => {
			if (isAutoplayEnabled) startAutoplay();
		});

		document.addEventListener("keydown", (e) => {
			var rect = slider.getBoundingClientRect();
			var isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
			if (!isInViewport) return;

			switch (e.key) {
				case "ArrowLeft":
					e.preventDefault();
					goPrev();
					break;
				case "ArrowRight":
					e.preventDefault();
					goNext();
					break;
				case " ":
				case "Enter":
					e.preventDefault();
					isAutoplayEnabled = !isAutoplayEnabled;
					if (isAutoplayEnabled) startAutoplay();
					else stopAutoplay();
					break;
			}
		});

		renderCards(activeIndex);

		if (total < 7) return;

		var pressClientX = 0;
		var pressClientY = 0;

		Draggable.create(draggers, {
			type: "x",
			edgeResistance: 0.8,
			bounds: { minX: -sliderWidth / 2, maxX: sliderWidth / 2 },
			inertia: false,

			onPress: function () {
				pressClientX = this.pointerEvent.clientX;
				pressClientY = this.pointerEvent.clientY;
				slider.setAttribute("data-flick-drag-status", "grabbing");
				stopAutoplay();
			},

			onDrag: function () {
				var rawProgress = this.x / sliderWidth;
				var progress = Math.min(1, Math.abs(rawProgress));
				var direction = rawProgress > 0 ? -1 : 1;
				var nextIndex = (activeIndex + direction + total) % total;

				cards.forEach((card, i) => {
					var from = getConfig(i, activeIndex);
					var to = getConfig(i, nextIndex);
					function mix(prop) {
						return from[prop] + (to[prop] - from[prop]) * progress;
					}

					card.style.visibility =
						from.visible || to.visible ? "visible" : "hidden";

					gsap.set(card, {
						xPercent: mix("x"),
						yPercent: mix("y"),
						rotation: mix("rot"),
						scale: mix("s"),
						opacity: mix("o"),
					});

					setParallaxImmediate(card, mix("px"));
				});
			},

			onRelease: function () {
				slider.setAttribute("data-flick-drag-status", "grab");

				var releaseClientX = this.pointerEvent.clientX;
				var releaseClientY = this.pointerEvent.clientY;
				var dragDistance = Math.hypot(
					releaseClientX - pressClientX,
					releaseClientY - pressClientY,
				);

				var raw = this.x / sliderWidth;
				var shift = 0;
				if (raw > threshold) shift = -1;
				else if (raw < -threshold) shift = 1;

				if (shift !== 0) {
					activeIndex = (activeIndex + shift + total) % total;
				}

				renderCards(activeIndex);

				gsap.to(this.target, {
					x: 0,
					duration: 0.3,
					ease: "power1.out",
				});

				if (dragDistance < 4) {
					this.target.style.pointerEvents = "none";

					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							var el = document.elementFromPoint(
								releaseClientX,
								releaseClientY,
							);
							if (el) {
								el.dispatchEvent(
									new MouseEvent("click", {
										view: window,
										bubbles: true,
										cancelable: true,
									}),
								);
							}
							this.target.style.pointerEvents = "auto";
						});
					});
				}

				resetAutoplay();
			},
		});

		startAutoplay();
	});
}

// -----------------------------------------
// SCRAMBLE TEXT (GSAP + ScrollTrigger + ScrambleTextPlugin + SplitText)
// -----------------------------------------
var SCRAMBLE = {
	chars: "upperCase",
	speed: 0.9,
	durationLoad: 1.2,
	durationScroll: 1.4,
	staggerRandomMax: 0.4,
	durationHoverIn: 0.15,
	durationHoverOut: 0.12,
	hoverStagger: 0.012,
};

function scramblePluginsReady() {
	return (
		typeof gsap !== "undefined" &&
		typeof ScrollTrigger !== "undefined" &&
		typeof ScrambleTextPlugin !== "undefined" &&
		typeof SplitText !== "undefined"
	);
}

function initScrambleOnLoad(scope) {
	if (!scramblePluginsReady() || reducedMotion) return;
	var root = scope && scope.querySelector ? scope : document;
	var targets = root.querySelectorAll("[data-scramble='load']");
	targets.forEach((target) => {
		if (target.dataset.scrambleLoadDone === "true") return;
		target.dataset.scrambleLoadDone = "true";

		try {
			var split = new SplitText(target, {
				type: "words, chars",
				wordsClass: "word",
				charsClass: "char",
			});

			gsap.to(split.chars, {
				duration: SCRAMBLE.durationLoad,
				stagger: () => Math.random() * SCRAMBLE.staggerRandomMax,
				scrambleText: {
					text: "{original}",
					chars: SCRAMBLE.chars,
					speed: SCRAMBLE.speed,
				},
				onComplete: () => {
					if (split.revert) split.revert();
				},
			});
		} catch (e) {
			target.dataset.scrambleLoadDone = "false";
		}
	});
}

function initScrambleOnScroll(scope) {
	if (!scramblePluginsReady() || reducedMotion) return;
	var root = scope && scope.querySelector ? scope : document;
	var targets = root.querySelectorAll("[data-scramble='scroll']");
	targets.forEach((target) => {
		if (target.dataset.scrambleScrollDone === "true") return;
		target.dataset.scrambleScrollDone = "true";

		try {
			var isAlternative = target.hasAttribute("data-scramble-alt");
			var split = new SplitText(target, {
				type: "words, chars",
				wordsClass: "word",
				charsClass: "char",
			});

			gsap.to(split.chars, {
				duration: SCRAMBLE.durationScroll,
				stagger: () => Math.random() * SCRAMBLE.staggerRandomMax,
				scrambleText: {
					text: "{original}",
					chars: isAlternative ? "▯|" : SCRAMBLE.chars,
					speed: SCRAMBLE.speed,
				},
				scrollTrigger: {
					trigger: target,
					start: "top bottom",
					once: true,
				},
				onComplete: () => {
					if (split.revert) split.revert();
				},
			});
		} catch (e) {
			target.dataset.scrambleScrollDone = "false";
		}
	});
}

function initScrambleOnHover(scope) {
	if (!scramblePluginsReady() || reducedMotion) return;
	var root = scope && scope.querySelector ? scope : document;
	var targets = root.querySelectorAll("[data-scramble-hover='link']");
	targets.forEach((target) => {
		if (target.dataset.scrambleHoverDone === "true") return;
		target.dataset.scrambleHoverDone = "true";

		var textEl =
			target.querySelector("[data-scramble-hover='target']") || target;
		var originalText = (textEl.textContent || "").trim();
		if (!originalText) return;

		var customHoverText = textEl.getAttribute("data-scramble-text");

		try {
			var hoverText = customHoverText || originalText;

			target.addEventListener("mouseenter", () => {
				textEl.textContent = hoverText;
				var splitIn = new SplitText(textEl, {
					type: "chars",
					charsClass: "char",
				});
				gsap.to(splitIn.chars, {
					duration: SCRAMBLE.durationHoverIn,
					stagger: SCRAMBLE.hoverStagger,
					scrambleText: {
						text: "{original}",
						chars: SCRAMBLE.chars,
						speed: 1.2,
					},
					onComplete: () => {
						if (splitIn.revert) splitIn.revert();
					},
				});
			});

			target.addEventListener("mouseleave", () => {
				textEl.textContent = originalText;
				var splitOut = new SplitText(textEl, {
					type: "chars",
					charsClass: "char",
				});
				gsap.to(splitOut.chars, {
					duration: SCRAMBLE.durationHoverOut,
					stagger: SCRAMBLE.hoverStagger,
					scrambleText: {
						text: "{original}",
						chars: SCRAMBLE.chars,
						speed: 1.2,
					},
					onComplete: () => {
						if (splitOut.revert) splitOut.revert();
					},
				});
			});
		} catch (e) {
			target.dataset.scrambleHoverDone = "false";
		}
	});
}

function initScrambleAll(scope) {
	initScrambleOnLoad(scope);
	initScrambleOnScroll(scope);
	initScrambleOnHover(scope);
}

var _heroTimecodeIntervalId = null;

function initHeroTimecodeClock(scope) {
	if (_heroTimecodeIntervalId !== null) {
		clearInterval(_heroTimecodeIntervalId);
		_heroTimecodeIntervalId = null;
	}
	if (reducedMotion) return;

	var root = scope && scope.querySelector ? scope : document;
	var el =
		root.querySelector('[data-scramble-slide="target"]') ||
		root.querySelector(".hero_title_eb");
	if (!el) return;

	var start = Date.now();
	_heroTimecodeIntervalId = setInterval(() => {
		if (!el.isConnected) {
			clearInterval(_heroTimecodeIntervalId);
			_heroTimecodeIntervalId = null;
			return;
		}
		var elapsed = Date.now() - start;
		var totalSeconds = Math.floor(elapsed / 1000);
		var minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
		var seconds = String(totalSeconds % 60).padStart(2, "0");
		var frames = String(Math.floor((elapsed % 1000) / (1000 / 30))).padStart(
			2,
			"0",
		);
		el.textContent = minutes + ":" + seconds + ":" + frames;
	}, 33);
}

// -----------------------------------------
// PARALLAX IMAGES (Lenis + Barba kompatibel)
// -----------------------------------------
var parallaxImages = [];
var parallaxRafRunning = false;

function lerp(start, end, factor) {
	return start + (end - start) * factor;
}

function getParallaxScrollY() {
	if (lenis) {
		if (window._parallaxScrollY != null) return window._parallaxScrollY;
		var s = lenis.scrollTop != null ? lenis.scrollTop : lenis.scroll;
		if (s != null) return s;
	}
	return window.scrollY || window.pageYOffset;
}

function initParallax(scope) {
	var root = scope || document;

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function syncParallaxBounds(img, scrollY) {
		var y = scrollY != null ? scrollY : getParallaxScrollY();
		var rect = img.boundsEl.getBoundingClientRect();
		var travel = (window.innerHeight + rect.height) * 0.5 * img.speed;
		var autoScale = 1 + (travel * 2) / rect.height;
		img.boundsTop = rect.top + y;
		img.boundsBottom = rect.bottom + y;
		img.scale = Math.max(img.baseScale, autoScale);
		img.maxShift = Math.max(0, rect.height * (img.scale - 1) * 0.5);
	}

	parallaxImages = [];
	parallaxRafRunning = false;

	root.querySelectorAll("[data-parallax]").forEach((el) => {
		var speed = parseFloat(el.dataset.parallaxSpeed) || 0.2;
		var baseScale = parseFloat(el.dataset.parallaxScale) || 1.25;
		var boundsEl = el.parentElement || el;
		var rect = boundsEl.getBoundingClientRect();
		var scrollY = getParallaxScrollY();
		var boundsTop = rect.top + scrollY;
		var boundsBottom = rect.bottom + scrollY;
		var travel = (window.innerHeight + rect.height) * 0.5 * speed;
		var scale = Math.max(baseScale, 1 + (travel * 2) / rect.height);
		var maxShift = Math.max(0, rect.height * (scale - 1) * 0.5);

		if (!el.dataset.parallaxInitialized) {
			el.dataset.parallaxInitialized = "true";
			el.style.willChange = "transform";
			el.style.transformOrigin = "50% 50%";
			el.style.transform = "translateY(0px) scale(" + scale + ")";
		}

		parallaxImages.push({
			el: el,
			boundsEl: boundsEl,
			speed: speed,
			baseScale: baseScale,
			scale: scale,
			currentY: 0,
			targetY: 0,
			boundsTop: boundsTop,
			boundsBottom: boundsBottom,
			maxShift: maxShift,
		});
	});

	if (parallaxImages.length === 0) return;

	if (!window._parallaxResizeAdded) {
		window._parallaxResizeAdded = true;
		window.addEventListener("resize", () => {
			var scrollY = getParallaxScrollY();
			parallaxImages.forEach((img) => {
				syncParallaxBounds(img, scrollY);
			});
			onParallaxScroll(scrollY);
		});
	}

	function onParallaxScroll(scrollY) {
		var y = scrollY != null ? scrollY : getParallaxScrollY();
		var viewportCenter = y + window.innerHeight * 0.5;
		parallaxImages.forEach((img) => {
			var elementCenter = (img.boundsTop + img.boundsBottom) * 0.5;
			var rawY = (viewportCenter - elementCenter) * img.speed;
			img.targetY = clamp(rawY, -img.maxShift, img.maxShift);
		});
	}

	if (!window._parallaxScrollAdded) {
		window._parallaxScrollAdded = true;

		if (lenis) {
			lenis.on("scroll", (e) => {
				window._parallaxScrollY =
					e.scroll != null ? e.scroll : getParallaxScrollY();
				onParallaxScroll(window._parallaxScrollY);
			});
		} else {
			window.addEventListener(
				"scroll",
				() => {
					onParallaxScroll();
				},
				{ passive: true },
			);
		}
	}

	onParallaxScroll();

	if (!parallaxRafRunning) {
		parallaxRafRunning = true;

		function parallaxTick() {
			if (!parallaxRafRunning || parallaxImages.length === 0) return;

			parallaxImages.forEach((img) => {
				img.currentY = lerp(img.currentY, img.targetY, 0.1);
				img.el.style.transform =
					"translateY(" + img.currentY + "px) scale(" + img.scale + ")";
			});

			requestAnimationFrame(parallaxTick);
		}

		parallaxTick();
	}
}

// -----------------------------------------
// ANIM GLITCH (SplitText + ScrollTrigger)
// -----------------------------------------
function initAnimGlitch(scope) {
	var root = scope || document;
	if (typeof SplitText === "undefined" || !hasScrollTrigger) return;
	root.querySelectorAll("[data-anim-glitch]").forEach((component) => {
		if (component.dataset.scriptInitialized) return;
		component.dataset.scriptInitialized = "true";

		var computedStyle = window.getComputedStyle(component);
		var originalDisplay = computedStyle.display;
		var originalTextAlign = computedStyle.textAlign;

		var split = new SplitText(component, {
			type: "chars",
			charsClass: "split-char",
		});

		split.chars.forEach((char) => {
			char.style.display = "inline-block";
			char.style.position = "relative";
			char.style.textAlign = "inherit";
			char.style.letterSpacing = "inherit";
		});

		component.style.display = originalDisplay;
		component.style.textAlign = originalTextAlign;

		var chars = split.chars;
		gsap.set(chars, { opacity: 0 });

		if (reducedMotion) {
			gsap.set(chars, { opacity: 1 });
			return;
		}

		var tl = gsap.timeline({
			scrollTrigger: {
				trigger: component,
				start: "top bottom",
				end: "top 70%",
				toggleActions: "none play none reset",
			},
		});

		chars.forEach((char) => {
			var randomStart = Math.random() * 0.6;
			var blinks = 2 + Math.floor(Math.random() * 3);
			var blinkDur = 0.04 + Math.random() * 0.04;
			var gapDur = 0.03 + Math.random() * 0.05;
			for (var b = 0; b < blinks; b++) {
				var offset = randomStart + b * (blinkDur + gapDur);
				tl.fromTo(
					char,
					{ opacity: 0 },
					{ opacity: 1, duration: blinkDur, ease: "none" },
					offset,
				);
				if (b < blinks - 1) {
					tl.to(
						char,
						{ opacity: 0, duration: gapDur, ease: "none" },
						offset + blinkDur,
					);
				}
			}
		});
	});
}

// -----------------------------------------
// ABOUT CONTAINER SCROLL
// -----------------------------------------
function initAboutScroll(scope) {
	if (typeof gsap === "undefined" || !hasScrollTrigger) return;

	var root = scope && scope.querySelector ? scope : document;
	var elements = root.querySelectorAll(".about_contain");
	if (!elements.length) return;

	if (reducedMotion) {
		elements.forEach((el) => {
			var inner = el.querySelector(".about_visual_inner");
			var imgs = el.querySelectorAll(".about_visual-img");
			if (inner) gsap.set(inner, { y: 0 });
			imgs.forEach((img, i) => {
				img.style.opacity = i === 0 ? 1 : 0;
			});
		});
		return;
	}

	elements.forEach((element) => {
		var visualInner = element.querySelector(".about_visual_inner");
		var frames = element.querySelectorAll(".about_visual-img");

		if (!visualInner) return;

		ScrollTrigger.getAll().forEach((t) => {
			if (t.trigger === visualInner) t.kill();
		});

		element.dataset.scriptInitialized = "true";

		gsap.to(visualInner, {
			y: -100,
			ease: "none",
			scrollTrigger: {
				trigger: visualInner,
				start: "top 85%",
				end: "top 15%",
				scrub: 1,
				invalidateOnRefresh: true,
			},
		});

		if (frames.length > 0) {
			var n = frames.length;
			frames.forEach((f) => {
				f.style.opacity = 0;
			});
			frames[0].style.opacity = 1;

			ScrollTrigger.create({
				trigger: visualInner,
				start: "top 80%",
				end: "bottom top",
				scrub: 1,
				invalidateOnRefresh: true,
				onUpdate: (self) => {
					var progress = self.progress;
					var index =
						progress >= 1 ? n - 1 : Math.min(Math.floor(progress * n), n - 1);
					frames.forEach((frame, i) => {
						frame.style.opacity = i === index ? 1 : 0;
					});
				},
			});
		}
	});

	setTimeout(() => {
		ScrollTrigger.refresh();
	}, 0);
	if (typeof window !== "undefined" && window.addEventListener) {
		window.addEventListener("load", function onAboutLoad() {
			window.removeEventListener("load", onAboutLoad);
			ScrollTrigger.refresh();
		});
	}
}

// -----------------------------------------
// SCROLL OVERLAP
// -----------------------------------------
function initScrollOverlap() {
	var scope = nextPage || document;
	scope
		.querySelectorAll("[data-scroll-overlap='trigger']")
		.forEach((component) => {
			if (component.hasAttribute("data-scroll-overlap-init")) return;
			component.setAttribute("data-scroll-overlap-init", "");
			var target = component.querySelector("[data-scroll-overlap='target']");
			if (!target) return;
			gsap
				.timeline({
					scrollTrigger: {
						trigger: component,
						start: () =>
							component.offsetHeight > window.innerHeight
								? "bottom bottom"
								: "top top",
						end: "bottom top",
						scrub: true,
					},
				})
				.to(target, { y: "40vh", opacity: 0, ease: "none" });
		});
}

// -----------------------------------------
// TYPO SCROLL (viewport-center active + hover)
// -----------------------------------------
function initTypoScrollPreview() {
	var scope = nextPage || document;
	if (!scope.querySelector("[data-typo-scroll-init]")) return;

	window._typoScrollHoverLock = false;

	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(() => {
			window.dispatchEvent(new Event("resize"));
		});
	}

	var isTouchDevice =
		"ontouchstart" in window ||
		navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0;

	if (!window._typoScrollScrollAdded) {
		window._typoScrollScrollAdded = true;

		var ticking = false;
		function onTypoScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					if (!window._typoScrollHoverLock) typoScrollUpdateActive();
					ticking = false;
				});
				ticking = true;
			}
		}

		if (lenis) {
			lenis.on("scroll", onTypoScroll);
		} else {
			window.addEventListener("scroll", onTypoScroll, { passive: true });
		}
	}

	if (!isTouchDevice) {
		var containers = scope.querySelectorAll("[data-typo-scroll-init]");
		containers.forEach((container) => {
			container.addEventListener(
				"mouseover",
				(e) => {
					var item = e.target.closest("[data-typo-scroll-item]");
					if (!item || !container.contains(item)) return;
					var from = e.relatedTarget;
					if (from && item.contains(from)) return;

					window._typoScrollHoverLock = true;
					var items = container.querySelectorAll("[data-typo-scroll-item]");
					items.forEach((el) => {
						el.setAttribute(
							"data-typo-scroll-item",
							el === item ? "active" : "",
						);
					});
				},
				true,
			);

			container.addEventListener(
				"mouseout",
				(e) => {
					var item = e.target.closest("[data-typo-scroll-item]");
					if (!item || !container.contains(item)) return;
					var to = e.relatedTarget;
					if (
						to &&
						container.contains(to) &&
						to.closest("[data-typo-scroll-item]")
					)
						return;

					window._typoScrollHoverLock = false;
					typoScrollUpdateActive();
				},
				true,
			);
		});
	}

	typoScrollUpdateActive();
}

function typoScrollUpdateActive() {
	var viewportCenterY = window.innerHeight / 2;
	var liveContainers = document.querySelectorAll("[data-typo-scroll-init]");

	liveContainers.forEach((container) => {
		var items = container.querySelectorAll("[data-typo-scroll-item]");
		if (!items.length) return;

		var containerRect = container.getBoundingClientRect();
		if (
			viewportCenterY < containerRect.top ||
			viewportCenterY > containerRect.bottom
		) {
			items.forEach((item) => {
				item.setAttribute("data-typo-scroll-item", "");
			});
			return;
		}

		var closestItem = null;
		var closestDistance = Infinity;

		items.forEach((item) => {
			var rect = item.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > window.innerHeight) return;
			var itemCenterY = rect.top + rect.height / 2;
			var distance = Math.abs(viewportCenterY - itemCenterY);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestItem = item;
			}
		});

		if (!closestItem) {
			items.forEach((item) => {
				item.setAttribute("data-typo-scroll-item", "");
			});
			return;
		}

		items.forEach((item) => {
			item.setAttribute(
				"data-typo-scroll-item",
				item === closestItem ? "active" : "",
			);
		});
	});
}

// Bunny-Player-Chrome: Label/Titel aus dem Trigger (Video- + Portfolio-Lightbox).
// Markup: unter .bunny-lightbox-player__desc im Player (yash_latest updatePlayerMeta).
// Wichtig: nicht document.querySelector('[data-bunny-lightbox-init]') — es kann ein zweites,
// verstecktes Player-Duplikat im Barba-Container VOR dem Body-Wrapper im DOM stehen.
// Attribute: data-bunny-lightbox-* oder data-lightbox-* (Webflow/CMS).
function resolveBunnyLightboxPlayerEl(explicitPlayer) {
	if (explicitPlayer && explicitPlayer.nodeType === 1) return explicitPlayer;
	var onBody = document.querySelector(
		"body > [data-bunny-lightbox-status] [data-bunny-lightbox-init]",
	);
	if (onBody) return onBody;
	return document.querySelector("[data-bunny-lightbox-init]");
}

function updateBunnyLightboxPlayMetaFromButton(btn, explicitPlayer) {
	if (!btn) return;
	var label =
		btn.getAttribute("data-bunny-lightbox-label") ||
		btn.getAttribute("data-lightbox-label") ||
		"";
	var title =
		btn.getAttribute("data-bunny-lightbox-title") ||
		btn.getAttribute("data-lightbox-title") ||
		"";

	var playerEl = resolveBunnyLightboxPlayerEl(explicitPlayer);
	if (!playerEl) {
		console.warn("[LB META] no [data-bunny-lightbox-init] player found");
		return;
	}

	var desc = playerEl.querySelector(".bunny-lightbox-player__desc");
	// Explizite Hooks am Player (falls Webflow andere Klassen exportiert)
	var elSmall =
		playerEl.querySelector("[data-bunny-lightbox-meta-label]") ||
		(desc
			? desc.querySelector(".bunny-lightbox-player__play-tsmall")
			: playerEl.querySelector(".bunny-lightbox-player__play-tsmall"));
	var elTitle =
		playerEl.querySelector("[data-bunny-lightbox-meta-title]") ||
		(desc
			? desc.querySelector(".bunny-lightbox-player__play-t")
			: playerEl.querySelector(".bunny-lightbox-player__play-t"));

	if (elSmall) elSmall.textContent = label;
	if (elTitle) elTitle.textContent = title;

	console.log("[LB META] updateBunnyLightboxPlayMetaFromButton", {
		labelLen: label.length,
		titleLen: title.length,
		labelPreview: label ? label.slice(0, 48) : "",
		titlePreview: title ? title.slice(0, 48) : "",
		playerIsBodyChild: !!playerEl.closest("body > [data-bunny-lightbox-status]"),
		hasDesc: !!desc,
		wroteSmall: !!elSmall,
		wroteTitle: !!elTitle,
	});

	if (!label && !title) {
		console.warn(
			"[LB META] Leere Strings — am Open-Button fehlen vermutlich data-bunny-lightbox-label / data-bunny-lightbox-title (oder data-lightbox-label / data-lightbox-title). CMS-Felder prüfen.",
		);
	}

	if (!desc && (!elSmall || !elTitle)) {
		console.warn(
			"[LB META] .bunny-lightbox-player__desc oder Ziel-Knoten nicht gefunden. Optional am Player: [data-bunny-lightbox-meta-label] / [data-bunny-lightbox-meta-title] setzen.",
		);
	}
}

// -----------------------------------------
// PORTFOLIO: MASONRY + FLIP LIGHTBOX + VIDEO/STILL TOGGLE
// (Eigenes Markup: data-lightbox="…", data-gallery — unabhängig von Bunny-Video-Lightbox data-bunny-*)
// -----------------------------------------

function queryMasonryListElements(root) {
	var rootEl = root && root.querySelectorAll ? root : document;
	var out = Array.from(rootEl.querySelectorAll("[data-masonry-list]"));
	if (
		rootEl !== document &&
		rootEl.getAttribute &&
		rootEl.getAttribute("data-masonry-list") !== null
	) {
		out.unshift(rootEl);
	}
	return out;
}

function createPortfolioLightbox(container, options) {
	options = options || {};
	var onStart = options.onStart;
	var onOpen = options.onOpen;
	var onClose = options.onClose;
	var onCloseComplete = options.onCloseComplete;

	var elements = {
		wrapper: container.querySelector('[data-lightbox="wrapper"]'),
		triggers: container.querySelectorAll('[data-lightbox="trigger"]'),
		triggerParents: container.querySelectorAll(
			'[data-lightbox="trigger-parent"]',
		),
		items: container.querySelectorAll('[data-lightbox="item"]'),
		nav: container.querySelectorAll('[data-lightbox="nav"]'),
		counter: {
			current: container.querySelector('[data-lightbox="counter-current"]'),
			total: container.querySelector('[data-lightbox="counter-total"]'),
		},
		buttons: {
			prev: container.querySelector('[data-lightbox="prev"]'),
			next: container.querySelector('[data-lightbox="next"]'),
			close: container.querySelector('[data-lightbox="close"]'),
		},
	};

	var mainTimeline = gsap.timeline();
	var scrollYWhenOpened = 0;

	if (elements.counter.total) {
		elements.counter.total.textContent = String(elements.triggers.length);
	}

	function closeLightbox() {
		if (onClose) onClose();

		mainTimeline.clear();
		gsap.killTweensOf([
			elements.wrapper,
			elements.nav,
			elements.triggerParents,
			elements.items,
			container.querySelector('[data-lightbox="original"]'),
		]);

		container.removeEventListener("click", handleOutsideClick);

		var tl = gsap.timeline({
			defaults: { ease: "power2.inOut" },
			onComplete: function () {
				if (elements.wrapper) elements.wrapper.classList.remove("is-active");

				elements.items.forEach(function (item) {
					item.classList.remove("is-active");
					var lightboxImage = item.querySelector("img");
					if (lightboxImage) lightboxImage.style.display = "";
				});

				var originalImg = container.querySelector('[data-lightbox="original"]');
				if (originalImg) gsap.set(originalImg, { clearProps: "all" });

				var originalParent = container.querySelector(
					'[data-lightbox="original-parent"]',
				);
				if (originalParent) {
					originalParent.parentElement.style.removeProperty("height");
				}

				var masonryList = container.querySelector("[data-masonry-list]");
				if (masonryList && masonryList._masonry)
					masonryList._masonry.recalc();

				var y = scrollYWhenOpened;
				requestAnimationFrame(function () {
					window.scrollTo(0, y);
					requestAnimationFrame(function () {
						window.scrollTo(0, y);
					});
				});

				if (onCloseComplete) onCloseComplete();
			},
		});

		var originalItem = container.querySelector('[data-lightbox="original"]');
		var originalParent = container.querySelector(
			'[data-lightbox="original-parent"]',
		);

		if (originalItem && originalParent) {
			gsap.set(originalItem, { clearProps: "all" });
			originalParent.appendChild(originalItem);
			originalParent.removeAttribute("data-lightbox");
			originalItem.removeAttribute("data-lightbox");
		}

		var activeLightboxSlide = container.querySelector(
			'[data-lightbox="item"].is-active',
		);

		tl.to(elements.triggerParents, {
			autoAlpha: 1,
			duration: 0.5,
			stagger: 0.03,
			overwrite: true,
		})
			.to(
				elements.nav,
				{
					autoAlpha: 0,
					y: "1rem",
					duration: 0.4,
					stagger: 0,
				},
				"<",
			)
			.to(
				elements.wrapper,
				{
					backgroundColor: "rgba(0,0,0,0)",
					duration: 0.4,
				},
				"<",
			)
			.to(
				activeLightboxSlide,
				{
					autoAlpha: 0,
					duration: 0.4,
				},
				"<",
			)
			.set([elements.items, activeLightboxSlide, elements.triggerParents], {
				clearProps: "all",
			});

		mainTimeline.add(tl);
	}

	function handleOutsideClick(event) {
		if (event.detail === 0) return;
		var isOutside = !event.target.closest(
			'[data-lightbox="item"].is-active img, [data-lightbox="nav"], [data-lightbox="close"], [data-lightbox="trigger"]',
		);
		if (isOutside) closeLightbox();
	}

	function updateActiveItem(index) {
		elements.items.forEach(function (item) {
			item.classList.remove("is-active");
		});
		if (elements.items[index]) elements.items[index].classList.add("is-active");
		if (elements.counter.current) {
			elements.counter.current.textContent = String(index + 1);
		}
		var trig = elements.triggers[index];
		if (trig) updateBunnyLightboxPlayMetaFromButton(trig);
	}

	ensureFlipPluginRegistered();
	var FlipRef = typeof window !== "undefined" ? window.Flip : undefined;

	elements.triggers.forEach(function (trigger, index) {
		trigger.addEventListener("click", function () {
			var img = trigger.querySelector("img");
			if (!img || typeof FlipRef === "undefined" || !FlipRef) return;

			if (onStart) onStart();

			mainTimeline.clear();
			gsap.killTweensOf([
				elements.wrapper,
				elements.nav,
				elements.triggerParents,
			]);

			scrollYWhenOpened = window.scrollY;

			var state = FlipRef.getState(img);

			var triggerRect = trigger.getBoundingClientRect();
			trigger.parentElement.style.height = triggerRect.height + "px";

			trigger.setAttribute("data-lightbox", "original-parent");
			img.setAttribute("data-lightbox", "original");

			updateActiveItem(index);

			container.addEventListener("click", handleOutsideClick);

			var tl = gsap.timeline({
				onComplete: function () {
					if (onOpen) onOpen();
				},
			});

			if (elements.wrapper) elements.wrapper.classList.add("is-active");
			var targetItem = elements.items[index];

			var lightboxImage = targetItem ? targetItem.querySelector("img") : null;
			if (lightboxImage) lightboxImage.style.display = "none";

			elements.triggerParents.forEach(function (otherTrigger) {
				if (otherTrigger !== trigger) {
					gsap.to(otherTrigger, {
						autoAlpha: 0,
						duration: 0.4,
						stagger: 0.02,
						overwrite: true,
					});
				}
			});

			if (targetItem && !targetItem.contains(img)) {
				targetItem.appendChild(img);
				tl.add(
					FlipRef.from(state, {
						targets: img,
						absolute: true,
						duration: 0.6,
						ease: "power2.inOut",
					}),
					0,
				);
			}

			tl.to(
				elements.wrapper,
				{
					backgroundColor: "rgba(0,0,0,0.75)",
					duration: 0.6,
				},
				0,
			).fromTo(
				elements.nav,
				{
					autoAlpha: 0,
					y: "1rem",
				},
				{
					autoAlpha: 1,
					y: "0rem",
					duration: 0.6,
					stagger: { each: 0.05, from: "center" },
				},
				0.2,
			);

			mainTimeline.add(tl);

			requestAnimationFrame(function () {
				window.scrollTo(0, scrollYWhenOpened);
			});
		});
	});

	if (elements.buttons.next) {
		elements.buttons.next.addEventListener("click", function () {
			var currentIndex = Array.from(elements.items).findIndex(function (item) {
				return item.classList.contains("is-active");
			});
			updateActiveItem(
				(currentIndex + 1) % elements.items.length,
			);
		});
	}

	if (elements.buttons.prev) {
		elements.buttons.prev.addEventListener("click", function () {
			var currentIndex = Array.from(elements.items).findIndex(function (item) {
				return item.classList.contains("is-active");
			});
			updateActiveItem(
				(currentIndex - 1 + elements.items.length) % elements.items.length,
			);
		});
	}

	if (elements.buttons.close) {
		elements.buttons.close.addEventListener("click", closeLightbox);
	}
}

(function bindPortfolioImageLightboxKeysOnce() {
	if (bindPortfolioImageLightboxKeysOnce.done) return;
	bindPortfolioImageLightboxKeysOnce.done = true;
	document.addEventListener("keydown", function (event) {
		var w = document.querySelector('[data-lightbox="wrapper"].is-active');
		if (!w) return;
		switch (event.key) {
			case "Escape": {
				var c = w.querySelector('[data-lightbox="close"]');
				if (c) c.click();
				break;
			}
			case "ArrowRight": {
				var n = w.querySelector('[data-lightbox="next"]');
				if (n) n.click();
				break;
			}
			case "ArrowLeft": {
				var p = w.querySelector('[data-lightbox="prev"]');
				if (p) p.click();
				break;
			}
			default:
				break;
		}
	});
})();

function initMasonryGrid(root) {
	queryMasonryListElements(root).forEach(function (container) {
		if (container.offsetParent === null) return;
		if (container.dataset.masonryJsInit) return;
		container.dataset.masonryJsInit = "true";

		var shuffle = container.dataset.masonryShuffle !== "false";
		var cols;
		var gapPx;
		var colHeights;

		var getVars = function () {
			var cs = getComputedStyle(container);
			cols = parseInt(cs.getPropertyValue("--masonry-col"), 10);
			var rawGap = cs.getPropertyValue("--masonry-gap").trim();
			if (rawGap.endsWith("px")) {
				gapPx = parseFloat(rawGap);
			} else if (rawGap.endsWith("em")) {
				gapPx = parseFloat(rawGap) * parseFloat(cs.fontSize);
			} else if (rawGap.endsWith("rem")) {
				gapPx =
					parseFloat(rawGap) *
					parseFloat(getComputedStyle(document.documentElement).fontSize);
			} else {
				gapPx = parseFloat(rawGap);
			}
		};

		var layout = function () {
			getVars();
			var wCalc = "(100% - " + (cols - 1) + "*var(--masonry-gap)) / " + cols;
			colHeights = Array(cols).fill(0);
			container.style.position = "relative";
			var items = Array.from(container.children);
			items.forEach(function (el) {
				el.style.position = "absolute";
				el.style.width = "calc(" + wCalc + ")";
			});
			items.forEach(function (el, i) {
				var h = el.offsetHeight;
				var idx = shuffle
					? colHeights.indexOf(Math.min.apply(null, colHeights))
					: i % cols;
				el.style.top = colHeights[idx] + "px";
				el.style.left =
					"calc(" + wCalc + "*" + idx + " + var(--masonry-gap)*" + idx + ")";
				colHeights[idx] += h + gapPx;
			});
			container.style.height = Math.max.apply(null, colHeights) + "px";
		};

		var debounce = function (fn, delay) {
			var t;
			return function () {
				clearTimeout(t);
				t = setTimeout(fn, delay);
			};
		};

		var onResize = debounce(layout, 100);
		window.addEventListener("resize", onResize);

		var debouncedLayout = debounce(layout, 50);
		var imgLoad = function () {
			container.querySelectorAll("img").forEach(function (img) {
				if (!img.complete) {
					img.addEventListener("load", debouncedLayout, { once: true });
					img.addEventListener("error", debouncedLayout, { once: true });
				}
			});
		};

		layout();
		imgLoad();

		container._masonry = {
			recalc: function () {
				layout();
				imgLoad();
			},
			destroy: function () {
				window.removeEventListener("resize", onResize);
				Array.from(container.children).forEach(function (el) {
					el.style.position =
						el.style.width =
						el.style.top =
						el.style.left =
							"";
				});
				container.style.position = container.style.height = "";
				delete container.dataset.masonryJsInit;
			},
		};
	});
}

function initPortfolioPageFeatures(root) {
	var scope = root && root.querySelector ? root : document;
	if (scope.querySelector("[data-portfolio-toggle]")) {
		initPortfolioMasonryAndToggle(scope);
	} else {
		initMasonryGrid(scope);
	}
}

function initPortfolioMasonryAndToggle(scopeRoot) {
	var scope = scopeRoot && scopeRoot.querySelector ? scopeRoot : document;
	var wrapper = scope.querySelector("[data-portfolio-toggle]");
	if (!wrapper || wrapper.dataset.portfolioScriptInitialized) return;
	wrapper.dataset.portfolioScriptInitialized = "true";

	var btns = wrapper.querySelectorAll("[data-portfolio-toggle-btn]");
	var views = {
		video:
			wrapper.querySelector(".folio_videos") ||
			document.querySelector(".folio_videos"),
		still:
			wrapper.querySelector(".folio_stills") ||
			document.querySelector(".folio_stills"),
	};

	var initialized = {
		video: false,
		still: false,
	};

	function initLightboxesIn(view) {
		if (!view) return;
		var galleries = view.matches("[data-gallery]")
			? [view]
			: Array.from(view.querySelectorAll("[data-gallery]"));
		galleries.forEach(function (gallery) {
			if (!gallery.dataset.lightboxInitialized) {
				gallery.dataset.lightboxInitialized = "true";
				createPortfolioLightbox(gallery);
			}
		});
	}

	function activateView(viewKey) {
		btns.forEach(function (b) {
			b.classList.remove("is-active");
		});
		var activeBtn = scope.querySelector(
			'[data-portfolio-toggle-btn][data-view="' + viewKey + '"]',
		);
		if (activeBtn) activeBtn.classList.add("is-active");

		Object.keys(views).forEach(function (k) {
			var el = views[k];
			if (el) el.classList.remove("is-active");
		});
		var activeView = views[viewKey];
		if (activeView) activeView.classList.add("is-active");

		var masonryList = activeView
			? activeView.querySelector("[data-masonry-list]")
			: null;
		if (masonryList && masonryList._masonry) {
			masonryList._masonry.recalc();
		} else {
			initMasonryGrid(activeView || scope);
		}

		if (activeView && activeView.querySelector("[data-media-init]")) {
			requestAnimationFrame(() => {
				initMediaSetup();
			});
		}

		if (!initialized[viewKey]) {
			initialized[viewKey] = true;
			initLightboxesIn(activeView);
		}
	}

	btns.forEach(function (btn) {
		btn.addEventListener("click", function () {
			var v = btn.getAttribute("data-view");
			if (v) activateView(v);
		});
	});

	var defaultBtn = wrapper.querySelector("[data-portfolio-toggle-btn].is-active");
	var defaultView = defaultBtn && defaultBtn.getAttribute("data-view");
	activateView(defaultView || "video");
}

// -----------------------------------------
// BUNNY LIGHTBOX PLAYER
// -----------------------------------------

var _bunnyLightboxInitialized = false;
function initBunnyLightboxPlayer() {
	console.log(
		"[LB INIT] initBunnyLightboxPlayer() called, alreadyInit:",
		_bunnyLightboxInitialized,
	);
	if (_bunnyLightboxInitialized) {
		console.log("[LB INIT] Already initialized, skipping");
		return;
	}
	var player = document.querySelector("[data-bunny-lightbox-init]");
	if (!player) {
		console.warn(
			"[LB INIT] No player element found [data-bunny-lightbox-init]",
		);
		return;
	}

	var wrapper = player.closest("[data-bunny-lightbox-status]");
	if (!wrapper) {
		console.warn("[LB INIT] No wrapper found [data-bunny-lightbox-status]");
		return;
	}

	console.log(
		"[LB INIT] wrapper parent before move:",
		wrapper.parentNode?.tagName,
		wrapper.parentNode?.getAttribute?.("data-barba"),
	);

	// Keep the lightbox outside Barba page containers so it survives swaps
	// and fixed positioning remains relative to the viewport.
	if (wrapper.parentNode !== document.body) {
		document.body.appendChild(wrapper);
		console.log("[LB INIT] Moved wrapper to document.body");
	} else {
		console.log("[LB INIT] Wrapper already on document.body");
	}

	var video = player.querySelector("video");
	if (!video) {
		console.warn("[LB INIT] No video element found");
		return;
	}

	console.log("[LB INIT] Setup complete — player, wrapper, video all found");

	// Force-hide wrapper on init (it starts as not-active)
	wrapper.style.display = "none";
	wrapper.style.opacity = "0";
	wrapper.style.visibility = "hidden";
	wrapper.style.pointerEvents = "none";

	try {
		video.pause();
	} catch (_) {}
	try {
		video.removeAttribute("src");
		video.load();
	} catch (_) {}

	function setAttr(el, name, val) {
		var str = typeof val === "boolean" ? (val ? "true" : "false") : String(val);
		if (el.getAttribute(name) !== str) el.setAttribute(name, str);
	}
	function setStatus(s) {
		setAttr(player, "data-player-status", s);
	}
	function setMutedState(v) {
		video.muted = !!v;
		setAttr(player, "data-player-muted", video.muted);
	}
	function setFsAttr(v) {
		setAttr(player, "data-player-fullscreen", !!v);
	}
	function setActivated(v) {
		setAttr(player, "data-player-activated", !!v);
	}
	if (!player.hasAttribute("data-player-activated")) setActivated(false);

	var timeline = player.querySelector("[data-player-timeline]");
	var progressBar = player.querySelector("[data-player-progress]");
	var bufferedBar = player.querySelector("[data-player-buffered]");
	var handle = player.querySelector("[data-player-timeline-handle]");
	var timeDurationEls = player.querySelectorAll("[data-player-time-duration]");
	var timeProgressEls = player.querySelectorAll("[data-player-time-progress]");
	var playerPlaceholderImg = player.querySelector(
		"[data-bunny-lightbox-placeholder]",
	);

	var updateSize = player.getAttribute("data-player-update-size");
	var autoplay = player.getAttribute("data-player-autoplay") === "true";
	var initialMuted = player.getAttribute("data-player-muted") === "true";

	var pendingPlay = false;

	// === OBSERVABILITY: Track wrapper attribute changes and DOM removal ===
	var _lbObserver = new MutationObserver((mutations) => {
		mutations.forEach((m) => {
			if (
				m.type === "attributes" &&
				m.attributeName === "data-bunny-lightbox-status"
			) {
				console.log(
					"[LB OBSERVER] wrapper status changed to:",
					wrapper.getAttribute("data-bunny-lightbox-status"),
					"(was:",
					m.oldValue,
					") — stack:",
					new Error().stack.split("\n").slice(1, 4).join(" <- "),
				);
			}
		});
	});
	_lbObserver.observe(wrapper, {
		attributes: true,
		attributeOldValue: true,
		attributeFilter: ["data-bunny-lightbox-status"],
	});

	// Track if wrapper gets removed from body
	var _bodyObserver = new MutationObserver((mutations) => {
		mutations.forEach((m) => {
			m.removedNodes.forEach((node) => {
				if (node === wrapper) {
					console.error("[LB OBSERVER] ⚠️ WRAPPER REMOVED FROM DOM!", {
						parent: m.target.tagName,
						connected: wrapper.isConnected,
					});
				}
			});
		});
	});
	_bodyObserver.observe(document.body, { childList: true });

	// Track video element errors
	video.addEventListener("error", (e) => {
		console.error("[LB VIDEO ERROR]", {
			code: video.error?.code,
			message: video.error?.message,
			src: video.src,
			readyState: video.readyState,
			networkState: video.networkState,
		});
	});

	// Track video key lifecycle events
	[
		"loadstart",
		"loadeddata",
		"loadedmetadata",
		"canplay",
		"playing",
		"pause",
		"ended",
		"waiting",
		"stalled",
		"suspend",
		"emptied",
		"abort",
	].forEach((evt) => {
		video.addEventListener(evt, () => {
			console.log("[LB VIDEO EVENT]", evt, {
				readyState: video.readyState,
				currentTime: video.currentTime,
				paused: video.paused,
				src: video.src?.substring(0, 60),
			});
		});
	});

	console.log("[LB INIT] Observers attached — wrapper, body, video events");

	video.loop = false;
	setMutedState(initialMuted);

	video.setAttribute("playsinline", "");
	video.setAttribute("webkit-playsinline", "");
	video.playsInline = true;
	if (typeof video.disableRemotePlayback !== "undefined")
		video.disableRemotePlayback = true;
	if (autoplay) video.autoplay = false;

	var isSafariNative = !!video.canPlayType("application/vnd.apple.mpegurl");
	var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

	var isAttached = false;
	var currentSrc = "";
	var lastPauseBy = "";
	var rafId;
	var autoStartOnReady = false;

	function setupLightboxClamp(player, wrapper, video, updateSize) {
		var calcBox = wrapper.querySelector("[data-bunny-lightbox-calc-height]");
		if (!calcBox) return;

		function getRatio() {
			if (updateSize === "cover") return null;

			if (updateSize === "true") {
				if (video.videoWidth && video.videoHeight)
					return video.videoWidth / video.videoHeight;
				var before = player.querySelector("[data-player-before]");
				if (before && before.style && before.style.paddingTop) {
					var pct = parseFloat(before.style.paddingTop);
					if (pct > 0) return 100 / pct;
				}
				var r = player.getBoundingClientRect();
				if (r.height > 0) return r.width / r.height;
				return 16 / 9;
			}

			var beforeFalse = player.querySelector("[data-player-before]");
			if (beforeFalse && beforeFalse.style && beforeFalse.style.paddingTop) {
				var pad = parseFloat(beforeFalse.style.paddingTop);
				if (pad > 0) return 100 / pad;
			}
			var rb = player.getBoundingClientRect();
			if (rb.height > 0) return rb.width / rb.height;
			return 16 / 9;
		}

		function applyClamp() {
			if (updateSize === "cover") {
				calcBox.style.maxWidth = "";
				calcBox.style.maxHeight = "";
				return;
			}

			var parent = wrapper;
			var cs = getComputedStyle(parent);
			var pt = parseFloat(cs.paddingTop) || 0;
			var pb = parseFloat(cs.paddingBottom) || 0;
			var pl = parseFloat(cs.paddingLeft) || 0;
			var pr = parseFloat(cs.paddingRight) || 0;

			var cw = parent.clientWidth - pl - pr;
			var ch = parent.clientHeight - pt - pb;
			if (cw <= 0 || ch <= 0) return;

			var ratio = getRatio();
			if (!ratio) {
				calcBox.style.maxWidth = "";
				calcBox.style.maxHeight = "";
				return;
			}

			var hIfFullWidth = cw / ratio;

			if (hIfFullWidth <= ch) {
				calcBox.style.maxWidth = "100%";
				calcBox.style.maxHeight = (hIfFullWidth / ch) * 100 + "%";
			} else {
				calcBox.style.maxHeight = "100%";
				calcBox.style.maxWidth = ((ch * ratio) / cw) * 100 + "%";
			}
		}

		var rafPending = false;
		function debouncedApply() {
			if (rafPending) return;
			if (wrapper.getAttribute("data-bunny-lightbox-status") !== "active")
				return;
			rafPending = true;
			requestAnimationFrame(() => {
				rafPending = false;
				applyClamp();
			});
		}

		var ro = new ResizeObserver(debouncedApply);
		ro.observe(wrapper);

		window.addEventListener("resize", debouncedApply);
		window.addEventListener("orientationchange", debouncedApply);

		if (updateSize === "true") {
			video.addEventListener("loadedmetadata", debouncedApply);
			video.addEventListener("loadeddata", debouncedApply);
			video.addEventListener("playing", debouncedApply);
		}

		player._applyClamp = debouncedApply;
		debouncedApply();
	}

	setupLightboxClamp(player, wrapper, video, updateSize);

	function withAttach(src, onReady) {
		console.log("[LB withAttach]", {
			src,
			isSafariNative,
			canUseHlsJs,
			videoConnected: video.isConnected,
		});
		if (isSafariNative) {
			console.log("[LB withAttach] Safari native HLS path");
			video.preload = "auto";
			video.src = src;
			video.addEventListener(
				"loadedmetadata",
				() => {
					console.log("[LB withAttach] Safari loadedmetadata fired");
					onReady();
				},
				{ once: true },
			);
			return;
		}
		if (canUseHlsJs) {
			console.log("[LB withAttach] HLS.js path");
			var hls = new Hls({ maxBufferLength: 10 });
			player._hls = hls;
			hls.attachMedia(video);
			hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				console.log("[LB withAttach] HLS MEDIA_ATTACHED, loading source");
				hls.loadSource(src);
			});
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				console.log("[LB withAttach] HLS MANIFEST_PARSED — calling onReady");
				onReady();
			});
			hls.on(Hls.Events.ERROR, (event, data) => {
				console.error("[LB withAttach] HLS ERROR", {
					type: data.type,
					details: data.details,
					fatal: data.fatal,
					reason: data.reason,
				});
			});
			hls.on(Hls.Events.LEVEL_LOADED, (e, data) => {
				console.log("[LB withAttach] HLS LEVEL_LOADED", {
					duration: data?.details?.totalduration,
				});
				if (
					data &&
					data.details &&
					isFinite(data.details.totalduration) &&
					timeDurationEls.length
				) {
					setText(timeDurationEls, formatTime(data.details.totalduration));
				}
			});
			return;
		}
		console.log("[LB withAttach] Generic fallback path");
		video.preload = "auto";
		video.src = src;
		video.addEventListener(
			"loadedmetadata",
			() => {
				console.log("[LB withAttach] Generic loadedmetadata fired");
				onReady();
			},
			{ once: true },
		);
	}

	function attachMediaFor(src) {
		console.log("[LB attachMediaFor]", {
			src,
			currentSrc,
			isAttached,
			earlyBail: currentSrc === src && isAttached,
		});
		if (currentSrc === src && isAttached) {
			console.log("[LB attachMediaFor] Early bail — already attached");
			return;
		}
		if (player._hls) {
			try {
				player._hls.destroy();
			} catch (_) {}
			player._hls = null;
		}
		if (timeDurationEls.length) setText(timeDurationEls, "00:00");

		currentSrc = src;
		isAttached = true;

		withAttach(src, function onReady() {
			console.log("[LB attachMediaFor:onReady]", {
				pendingPlay,
				autoStartOnReady,
				wrapperStatus: wrapper.getAttribute("data-bunny-lightbox-status"),
				videoDuration: video.duration,
				videoReadyState: video.readyState,
			});
			readyIfIdle(player, pendingPlay);
			updateBeforeRatioIOSSafe();
			if (typeof player._applyClamp === "function") player._applyClamp();
			if (timeDurationEls.length && video.duration)
				setText(timeDurationEls, formatTime(video.duration));

			if (
				autoStartOnReady &&
				wrapper.getAttribute("data-bunny-lightbox-status") === "active"
			) {
				console.log("[LB attachMediaFor:onReady] Auto-starting playback");
				setStatus("loading");
				safePlay(video);
				autoStartOnReady = false;
			} else {
				console.log("[LB attachMediaFor:onReady] NOT auto-starting", {
					autoStartOnReady,
					wrapperStatus: wrapper.getAttribute("data-bunny-lightbox-status"),
				});
			}
		});
	}

	// Force inline styles to guarantee visibility state regardless of Webflow CSS.
	// When the wrapper lives outside the Webflow page container (on document.body),
	// Webflow's attribute selectors may not apply correctly.
	function applyWrapperVisibility(isActive) {
		if (isActive) {
			wrapper.style.display = "";
			wrapper.style.opacity = "1";
			wrapper.style.visibility = "visible";
			wrapper.style.pointerEvents = "auto";
		} else {
			wrapper.style.display = "none";
			wrapper.style.opacity = "0";
			wrapper.style.visibility = "hidden";
			wrapper.style.pointerEvents = "none";
		}
	}

	function ensureOpenUI(isActive) {
		var state = isActive ? "active" : "not-active";
		var currentState = wrapper.getAttribute("data-bunny-lightbox-status");
		console.log("[LB ensureOpenUI]", {
			isActive,
			targetState: state,
			currentState,
			wrapperConnected: wrapper.isConnected,
			wrapperParent: wrapper.parentNode?.tagName,
			wrapperDisplay: getComputedStyle(wrapper).display,
			wrapperVisibility: getComputedStyle(wrapper).visibility,
			wrapperOpacity: getComputedStyle(wrapper).opacity,
			wrapperZIndex: getComputedStyle(wrapper).zIndex,
			wrapperPointerEvents: getComputedStyle(wrapper).pointerEvents,
		});
		if (currentState !== state) {
			wrapper.setAttribute("data-bunny-lightbox-status", state);
			console.log("[LB ensureOpenUI] Status changed to:", state);
		} else {
			console.log("[LB ensureOpenUI] Status already correct:", state);
		}
		applyWrapperVisibility(isActive);
		if (isActive && typeof player._applyClamp === "function")
			player._applyClamp();
	}

	function isSameSrc(next) {
		return currentSrc && currentSrc === next;
	}
	function planOnOpen(next) {
		var same = isSameSrc(next);
		var videoUsable = same && video.readyState >= 1;

		console.log("[LB planOnOpen]", {
			nextSrc: next,
			currentSrc,
			same,
			videoUsable,
			videoReadyState: video.readyState,
			videoPaused: video.paused,
			videoSrc: video.src,
			isAttached,
			autoplay,
			hlsExists: !!player._hls,
			videoConnected: video.isConnected,
		});

		if (!same || !videoUsable) {
			console.log("[LB planOnOpen] Full teardown + reattach path");
			try {
				if (!video.paused && !video.ended) video.pause();
			} catch (_) {}
			if (player._hls) {
				try {
					player._hls.destroy();
				} catch (_) {}
				player._hls = null;
			}

			isAttached = false;
			currentSrc = "";

			if (timeDurationEls.length) setText(timeDurationEls, "00:00");
			setActivated(false);
			setStatus("idle");

			attachMediaFor(next);
			autoStartOnReady = !!autoplay;
			pendingPlay = !!autoplay;
			return;
		}

		console.log("[LB planOnOpen] Same src + usable path, autoplay:", autoplay);
		autoStartOnReady = !!autoplay;
		if (autoplay) {
			setStatus("loading");
			safePlay(video);
		} else {
			try {
				if (!video.paused && !video.ended) video.pause();
			} catch (_) {}
			setActivated(false);
			setStatus("paused");
		}
	}

	function openLightbox(src, placeholderUrl, metaFromBtn) {
		console.log("[LB DEBUG] openLightbox called", {
			src,
			placeholderUrl,
			wrapperConnected: wrapper.isConnected,
		});
		if (!src) return;

		function activate() {
			console.log("[LB DEBUG] activate() called, about to ensureOpenUI(true)");
			ensureOpenUI(true);
			// Nach sichtbarem UI: Textziele sitzen unter .bunny-lightbox-player__desc im Player
			if (metaFromBtn) updateBunnyLightboxPlayMetaFromButton(metaFromBtn, player);
			planOnOpen(src);
		}

		if (playerPlaceholderImg && placeholderUrl) {
			var needsSwap =
				playerPlaceholderImg.getAttribute("src") !== placeholderUrl;
			console.log("[LB DEBUG] placeholder path", {
				needsSwap,
				complete: playerPlaceholderImg.complete,
				naturalWidth: playerPlaceholderImg.naturalWidth,
			});
			if (
				needsSwap ||
				!playerPlaceholderImg.complete ||
				!playerPlaceholderImg.naturalWidth
			) {
				playerPlaceholderImg.onload = () => {
					playerPlaceholderImg.onload = null;
					activate();
				};
				playerPlaceholderImg.onerror = () => {
					playerPlaceholderImg.onerror = null;
					activate();
				};
				if (needsSwap) playerPlaceholderImg.setAttribute("src", placeholderUrl);
				else playerPlaceholderImg.dispatchEvent(new Event("load"));
			} else {
				activate();
			}
		} else {
			console.log("[LB DEBUG] no placeholder, direct activate");
			activate();
		}
	}

	function togglePlay() {
		if (video.paused || video.ended) {
			pendingPlay = true;
			lastPauseBy = "";
			setStatus("loading");
			safePlay(video);
		} else {
			lastPauseBy = "manual";
			video.pause();
		}
	}
	function toggleMute() {
		setMutedState(!video.muted);
	}

	player.addEventListener("click", (e) => {
		var btn = e.target.closest("[data-player-control]");
		if (!btn || !player.contains(btn)) return;
		var type = btn.getAttribute("data-player-control");
		if (type === "play" || type === "pause" || type === "playpause")
			togglePlay();
		else if (type === "mute") toggleMute();
		else if (type === "fullscreen") toggleFullscreen();
	});

	function isFsActive() {
		return !!(document.fullscreenElement || document.webkitFullscreenElement);
	}
	function enterFullscreen() {
		if (player.requestFullscreen) return player.requestFullscreen();
		if (video.requestFullscreen) return video.requestFullscreen();
		if (
			video.webkitSupportsFullscreen &&
			typeof video.webkitEnterFullscreen === "function"
		)
			return video.webkitEnterFullscreen();
	}
	function exitFullscreen() {
		if (document.exitFullscreen) return document.exitFullscreen();
		if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
		if (
			video.webkitDisplayingFullscreen &&
			typeof video.webkitExitFullscreen === "function"
		)
			return video.webkitExitFullscreen();
	}
	function toggleFullscreen() {
		if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen();
		else enterFullscreen();
	}
	document.addEventListener("fullscreenchange", () => {
		setFsAttr(isFsActive());
	});
	document.addEventListener("webkitfullscreenchange", () => {
		setFsAttr(isFsActive());
	});
	video.addEventListener("webkitbeginfullscreen", () => {
		setFsAttr(true);
	});
	video.addEventListener("webkitendfullscreen", () => {
		setFsAttr(false);
	});

	function updateTimeTexts() {
		if (timeDurationEls.length)
			setText(timeDurationEls, formatTime(video.duration));
		if (timeProgressEls.length)
			setText(timeProgressEls, formatTime(video.currentTime));
	}
	video.addEventListener("timeupdate", updateTimeTexts);
	video.addEventListener("loadedmetadata", () => {
		updateTimeTexts();
		updateBeforeRatioIOSSafe();
	});
	video.addEventListener("loadeddata", () => {
		updateBeforeRatioIOSSafe();
	});
	video.addEventListener("playing", () => {
		updateBeforeRatioIOSSafe();
	});
	video.addEventListener("durationchange", updateTimeTexts);

	function updateProgressVisuals() {
		if (!video.duration) return;
		var playedPct = (video.currentTime / video.duration) * 100;
		if (progressBar)
			progressBar.style.transform = "translateX(" + (-100 + playedPct) + "%)";
		if (handle) handle.style.left = pctClamp(playedPct) + "%";
	}
	function pctClamp(p) {
		return p < 0 ? 0 : p > 100 ? 100 : p;
	}
	function loop() {
		updateProgressVisuals();
		if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
	}

	function updateBufferedBar() {
		if (!bufferedBar || !video.duration || !video.buffered.length) return;
		var end = video.buffered.end(video.buffered.length - 1);
		var buffPct = (end / video.duration) * 100;
		bufferedBar.style.transform = "translateX(" + (-100 + buffPct) + "%)";
	}
	video.addEventListener("progress", updateBufferedBar);
	video.addEventListener("loadedmetadata", updateBufferedBar);
	video.addEventListener("durationchange", updateBufferedBar);

	video.addEventListener("play", () => {
		setActivated(true);
		cancelAnimationFrame(rafId);
		loop();
		setStatus("playing");
	});
	video.addEventListener("playing", () => {
		pendingPlay = false;
		setStatus("playing");
	});
	video.addEventListener("pause", () => {
		pendingPlay = false;
		cancelAnimationFrame(rafId);
		updateProgressVisuals();
		setStatus("paused");
	});
	video.addEventListener("waiting", () => {
		setStatus("loading");
	});
	video.addEventListener("canplay", () => {
		readyIfIdle(player, pendingPlay);
	});

	video.addEventListener("ended", () => {
		pendingPlay = false;
		cancelAnimationFrame(rafId);
		updateProgressVisuals();
		setActivated(false);
		video.currentTime = 0;

		if (
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			video.webkitDisplayingFullscreen
		) {
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			else if (video.webkitExitFullscreen) video.webkitExitFullscreen();
		}

		closeLightbox();
	});

	if (timeline) {
		var dragging = false,
			wasPlaying = false,
			targetTime = 0,
			lastSeekTs = 0,
			seekThrottle = 180,
			rect = null;
		window.addEventListener("resize", () => {
			if (!dragging) rect = null;
		});
		function getFractionFromX(x) {
			if (!rect) rect = timeline.getBoundingClientRect();
			var f = (x - rect.left) / rect.width;
			if (f < 0) f = 0;
			if (f > 1) f = 1;
			return f;
		}
		function previewAtFraction(f) {
			if (!video.duration) return;
			var pct = f * 100;
			if (progressBar)
				progressBar.style.transform = "translateX(" + (-100 + pct) + "%)";
			if (handle) handle.style.left = pct + "%";
			if (timeProgressEls.length)
				setText(timeProgressEls, formatTime(f * video.duration));
		}
		function maybeSeek(now) {
			if (!video.duration) return;
			if (now - lastSeekTs < seekThrottle) return;
			lastSeekTs = now;
			video.currentTime = targetTime;
		}
		function onPointerDown(e) {
			if (!video.duration) return;
			dragging = true;
			wasPlaying = !video.paused && !video.ended;
			if (wasPlaying) video.pause();
			player.setAttribute("data-timeline-drag", "true");
			rect = timeline.getBoundingClientRect();
			var f = getFractionFromX(e.clientX);
			targetTime = f * video.duration;
			previewAtFraction(f);
			maybeSeek(performance.now());
			timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
			window.addEventListener("pointermove", onPointerMove, { passive: false });
			window.addEventListener("pointerup", onPointerUp, { passive: true });
			e.preventDefault();
		}
		function onPointerMove(e) {
			if (!dragging) return;
			var f = getFractionFromX(e.clientX);
			targetTime = f * video.duration;
			previewAtFraction(f);
			maybeSeek(performance.now());
			e.preventDefault();
		}
		function onPointerUp() {
			if (!dragging) return;
			dragging = false;
			player.setAttribute("data-timeline-drag", "false");
			rect = null;
			video.currentTime = targetTime;
			if (wasPlaying) safePlay(video);
			else {
				updateProgressVisuals();
				updateTimeTexts();
			}
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
		}
		timeline.addEventListener("pointerdown", onPointerDown, { passive: false });
		if (handle)
			handle.addEventListener("pointerdown", onPointerDown, { passive: false });
	}

	var hoverTimer;
	var hoverHideDelay = 3000;
	function setHover(state) {
		if (player.getAttribute("data-player-hover") !== state) {
			player.setAttribute("data-player-hover", state);
		}
	}
	function scheduleHide() {
		clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			setHover("idle");
		}, hoverHideDelay);
	}
	function wakeControls() {
		setHover("active");
		scheduleHide();
	}
	player.addEventListener("pointerdown", wakeControls);
	document.addEventListener("fullscreenchange", wakeControls);
	document.addEventListener("webkitfullscreenchange", wakeControls);
	var trackingMove = false;
	function onPointerMoveGlobal(e) {
		var r = player.getBoundingClientRect();
		if (
			e.clientX >= r.left &&
			e.clientX <= r.right &&
			e.clientY >= r.top &&
			e.clientY <= r.bottom
		)
			wakeControls();
	}
	player.addEventListener("pointerenter", () => {
		wakeControls();
		if (!trackingMove) {
			trackingMove = true;
			window.addEventListener("pointermove", onPointerMoveGlobal, {
				passive: true,
			});
		}
	});
	player.addEventListener("pointerleave", () => {
		setHover("idle");
		clearTimeout(hoverTimer);
		if (trackingMove) {
			trackingMove = false;
			window.removeEventListener("pointermove", onPointerMoveGlobal);
		}
	});

	function closeLightbox() {
		console.log("[LB closeLightbox] called", {
			wrapperStatus: wrapper.getAttribute("data-bunny-lightbox-status"),
			videoTime: video.currentTime,
		});
		ensureOpenUI(false);

		var hasPlayed = false;
		try {
			if (video.played && video.played.length) {
				for (var i = 0; i < video.played.length; i++) {
					if (video.played.end(i) > 0) {
						hasPlayed = true;
						break;
					}
				}
			} else {
				hasPlayed = video.currentTime > 0;
			}
		} catch (_) {}

		try {
			if (!video.paused && !video.ended) video.pause();
		} catch (_) {}

		setActivated(false);
		setStatus(hasPlayed ? "paused" : "idle");
		console.log("[LB closeLightbox] done", {
			hasPlayed,
			finalStatus: player.getAttribute("data-player-status"),
		});
	}

	document.addEventListener("click", (e) => {
		var openBtn = e.target.closest('[data-bunny-lightbox-control="open"]');
		if (openBtn) {
			console.log("[LB DEBUG] open btn clicked", {
				src: openBtn.getAttribute("data-bunny-lightbox-src"),
				wrapperInDOM: !!document.querySelector("[data-bunny-lightbox-status]"),
				wrapperParent: wrapper ? wrapper.parentNode?.tagName : "no wrapper",
				wrapperConnected: wrapper ? wrapper.isConnected : false,
				playerConnected: player ? player.isConnected : false,
				videoConnected: video ? video.isConnected : false,
				btnInBarbaContainer: !!openBtn.closest('[data-barba="container"]'),
			});

			// Block clicks during Barba transitions entirely.
			// The open button may live in the OLD container that's being animated out.
			if (
				typeof barba !== "undefined" &&
				barba.transitions &&
				barba.transitions.isRunning
			) {
				console.log("[LB DEBUG] Barba transition running — ignoring click");
				return;
			}

			var currentContainer = document.querySelector('[data-barba="container"]');
			if (currentContainer && currentContainer.style.position === "fixed") {
				console.log("[LB DEBUG] container is fixed, deferring");
				var src = openBtn.getAttribute("data-bunny-lightbox-src") || "";
				if (!src) return;
				var imgEl = openBtn.querySelector("[data-bunny-lightbox-placeholder]");
				var placeholderUrl = imgEl ? imgEl.getAttribute("src") : "";

				var checkInterval = setInterval(() => {
					var container = document.querySelector('[data-barba="container"]');
					if (!container || container.style.position !== "fixed") {
						clearInterval(checkInterval);
						openLightbox(src, placeholderUrl, openBtn);
					}
				}, 100);

				setTimeout(() => {
					clearInterval(checkInterval);
				}, 3000);
				return;
			}

			var src = openBtn.getAttribute("data-bunny-lightbox-src") || "";
			if (!src) {
				console.log("[LB DEBUG] no src, aborting");
				return;
			}
			var imgEl = openBtn.querySelector("[data-bunny-lightbox-placeholder]");
			var placeholderUrl = imgEl ? imgEl.getAttribute("src") : "";
			console.log("[LB DEBUG] calling openLightbox", src, placeholderUrl);
			openLightbox(src, placeholderUrl, openBtn);
			return;
		}

		var closeBtn = e.target.closest('[data-bunny-lightbox-control="close"]');
		if (closeBtn) {
			var closeInWrapper = closeBtn.closest("[data-bunny-lightbox-status]");
			console.log("[LB CLICK] Close btn clicked", {
				inCorrectWrapper: closeInWrapper === wrapper,
				wrapperMatch: !!closeInWrapper,
			});
			if (closeInWrapper === wrapper) closeLightbox();
			return;
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeLightbox();
	});

	function pad2(n) {
		return (n < 10 ? "0" : "") + n;
	}
	function formatTime(sec) {
		if (!isFinite(sec) || sec < 0) return "00:00";
		var s = Math.floor(sec),
			h = Math.floor(s / 3600),
			m = Math.floor((s % 3600) / 60),
			r = s % 60;
		return h > 0 ? h + ":" + pad2(m) + ":" + pad2(r) : pad2(m) + ":" + pad2(r);
	}
	function setText(nodes, text) {
		nodes.forEach((n) => {
			n.textContent = text;
		});
	}

	function bestLevel(levels) {
		if (!levels || !levels.length) return null;
		return levels.reduce(
			(a, b) => ((b.width || 0) > (a.width || 0) ? b : a),
			levels[0],
		);
	}

	function safePlay(video) {
		console.log("[LB safePlay] Attempting play", {
			readyState: video.readyState,
			paused: video.paused,
			src: video.src?.substring(0, 60),
		});
		var p = video.play();
		if (p && typeof p.then === "function") {
			p.then(() => {
				console.log("[LB safePlay] Play succeeded");
			}).catch((err) => {
				console.warn("[LB safePlay] Play rejected:", err.name, err.message);
			});
		}
	}

	function readyIfIdle(player, pendingPlay) {
		if (
			!pendingPlay &&
			player.getAttribute("data-player-activated") !== "true" &&
			player.getAttribute("data-player-status") === "idle"
		) {
			player.setAttribute("data-player-status", "ready");
		}
	}

	function setBeforeRatio(player, updateSize, w, h) {
		if (updateSize !== "true" || !w || !h) return;
		var before = player.querySelector("[data-player-before]");
		if (!before) return;
		before.style.paddingTop = (h / w) * 100 + "%";
	}
	function maybeSetRatioFromVideo(player, updateSize, video) {
		if (updateSize !== "true") return;
		var before = player.querySelector("[data-player-before]");
		if (!before) return;
		var hasPad = before.style.paddingTop && before.style.paddingTop !== "0%";
		if (!hasPad && video.videoWidth && video.videoHeight) {
			setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
		}
	}

	function updateBeforeRatioIOSSafe() {
		if (updateSize !== "true") return;
		var before = player.querySelector("[data-player-before]");
		if (!before) return;

		function apply(w, h) {
			if (!w || !h) return;
			before.style.paddingTop = (h / w) * 100 + "%";
			if (typeof player._applyClamp === "function") player._applyClamp();
		}

		if (video.videoWidth && video.videoHeight) {
			apply(video.videoWidth, video.videoHeight);
			return;
		}

		if (player._hls && player._hls.levels && player._hls.levels.length) {
			var lvls = player._hls.levels;
			var best = lvls.reduce(
				(a, b) => ((b.width || 0) > (a.width || 0) ? b : a),
				lvls[0],
			);
			if (best && best.width && best.height) {
				apply(best.width, best.height);
				return;
			}
		}

		requestAnimationFrame(() => {
			if (video.videoWidth && video.videoHeight) {
				apply(video.videoWidth, video.videoHeight);
				return;
			}

			var master =
				typeof currentSrc === "string" && currentSrc ? currentSrc : "";
			if (!master || master.indexOf("blob:") === 0) {
				var attrSrc =
					player.getAttribute("data-bunny-lightbox-src") ||
					player.getAttribute("data-player-src") ||
					"";
				if (attrSrc && attrSrc.indexOf("blob:") !== 0) master = attrSrc;
			}
			if (!master || !/^https?:/i.test(master)) return;
			st;
			fetch(master, { credentials: "omit", cache: "no-store" })
				.then((r) => {
					if (!r.ok) throw new Error();
					return r.text();
				})
				.then((txt) => {
					var lines = txt.split(/\r?\n/);
					var bestW = 0,
						bestH = 0,
						last = null;
					for (var i = 0; i < lines.length; i++) {
						var line = lines[i];
						if (line.indexOf("#EXT-X-STREAM-INF:") === 0) {
							last = line;
						} else if (last && line && line[0] !== "#") {
							var m = /RESOLUTION=(\d+)x(\d+)/.exec(last);
							if (m) {
								var W = parseInt(m[1], 10),
									H = parseInt(m[2], 10);
								if (W > bestW) {
									bestW = W;
									bestH = H;
								}
							}
							last = null;
						}
					}
					if (bestW && bestH) apply(bestW, bestH);
				})
				.catch(() => {});
		});
	}

	// === GLOBAL DEBUG HELPER ===
	// Call window.__lbDebug() in the console at any time to see full lightbox state
	window.__lbDebug = () => {
		var wrapperInBody = document.querySelector(
			"body > [data-bunny-lightbox-status]",
		);
		var allWrappers = document.querySelectorAll("[data-bunny-lightbox-status]");
		var allOpenBtns = document.querySelectorAll(
			'[data-bunny-lightbox-control="open"]',
		);
		var barbaContainers = document.querySelectorAll('[data-barba="container"]');

		var info = {
			"=== WRAPPER STATE ===": "",
			closuredWrapperConnected: wrapper.isConnected,
			closuredWrapperParent: wrapper.parentNode?.tagName,
			closuredWrapperStatus: wrapper.getAttribute("data-bunny-lightbox-status"),
			bodyWrapperExists: !!wrapperInBody,
			bodyWrapperSameAsClosure: wrapperInBody === wrapper,
			totalWrappersInDOM: allWrappers.length,
			"=== PLAYER STATE ===": "",
			closuredPlayerConnected: player.isConnected,
			playerStatus: player.getAttribute("data-player-status"),
			playerActivated: player.getAttribute("data-player-activated"),
			"=== VIDEO STATE ===": "",
			closuredVideoConnected: video.isConnected,
			videoSrc: video.src?.substring(0, 80),
			videoReadyState: video.readyState,
			videoPaused: video.paused,
			videoCurrentTime: video.currentTime,
			videoDuration: video.duration,
			videoNetworkState: video.networkState,
			videoError: video.error
				? { code: video.error.code, message: video.error.message }
				: null,
			"=== INTERNAL STATE ===": "",
			isAttached,
			currentSrc: currentSrc?.substring(0, 80),
			autoplay,
			autoStartOnReady,
			pendingPlay,
			hlsInstance: !!player._hls,
			isSafariNative,
			canUseHlsJs,
			"=== BARBA STATE ===": "",
			barbaContainerCount: barbaContainers.length,
			barbaContainerPositions: Array.from(barbaContainers).map(
				(c) => c.style.position || "static",
			),
			barbaIsRunning:
				typeof barba !== "undefined" && barba.transitions
					? barba.transitions.isRunning
					: "unknown",
			"=== OPEN BUTTONS ===": "",
			openBtnCount: allOpenBtns.length,
			openBtns: Array.from(allOpenBtns).map((btn) => ({
				src: btn.getAttribute("data-bunny-lightbox-src")?.substring(0, 60),
				connected: btn.isConnected,
				inBarba: !!btn.closest('[data-barba="container"]'),
				visible: btn.offsetParent !== null,
			})),
		};
		console.table
			? console.log(info)
			: console.log(JSON.stringify(info, null, 2));
		return info;
	};

	_bunnyLightboxInitialized = true;
	console.log(
		"[LB INIT] ✅ initBunnyLightboxPlayer complete. Call window.__lbDebug() anytime for full state dump.",
	);
}
