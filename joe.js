// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(CustomEase);
if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);
if (typeof ScrambleTextPlugin !== "undefined") gsap.registerPlugin(ScrambleTextPlugin);
if (typeof Draggable !== "undefined") gsap.registerPlugin(Draggable);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });



// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Runs once on first load
  initBunnyLightboxPlayer();
  if (document.querySelector("[data-anim-glitch]")) initAnimGlitch(document);
  if (document.querySelector(".about_contain")) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initAboutScroll(document);
        if (hasScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }
  if (document.querySelector("[data-parallax]")) initParallax(document);
  if (document.querySelector("[data-scramble='load']") || document.querySelector("[data-scramble='scroll']") || document.querySelector("[data-scramble-hover='link']")) {
    initScrambleAll(document);
  }
  if (document.querySelector(".nav_comp")) initNavBlend();
  if (document.querySelector("[data-flick-cards-init]")) initFlickCards(document);
  if (document.querySelector(".faq_cms_wrap")) initFaqAccordion(document);
  if (document.querySelector("[data-marquee-scroll-direction-target]")) initMarqueeScrollDirection(document);
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // Close lightbox on page transition
  const wrapper = document.querySelector('[data-bunny-lightbox-status="active"]');
  if (wrapper) {
    wrapper.setAttribute('data-bunny-lightbox-status', 'not-active');
    const video = wrapper.querySelector('video');
    if (video) { try { video.pause(); } catch(_) {} }
  }
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  if (has('[data-typo-scroll-init]')) initTypoScrollPreview();
  if (has("[data-scroll-overlap='trigger']")) initScrollOverlap();
  if (has("[data-anim-glitch]")) initAnimGlitch(nextPage);
  if (has(".about_contain")) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initAboutScroll(document);
        if (hasScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }
  if (has("[data-parallax]")) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initParallax(document);
      });
    });
  }
  if (has("[data-scramble='load']") || has("[data-scramble='scroll']") || has("[data-scramble-hover='link']")) {
    initScrambleAll(nextPage);
  }
  if (has(".nav_comp")) initNavBlend();
  if (has("[data-flick-cards-init]")) initFlickCards(nextPage);
  if (has(".faq_cms_wrap")) initFaqAccordion(nextPage);
  if (has("[data-marquee-scroll-direction-target]")) initMarqueeScrollDirection(nextPage);
  if(hasLenis){
    lenis.resize();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}



// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();
  tl.call(() => {
    resetPage(next);
  }, null, 0);
  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
  const transitionLabel = transitionWrap.querySelector("[data-transition-label]");
  const transitionLabelText = transitionWrap.querySelector("[data-transition-label-text]");

  const nextPageName = next.getAttribute("data-page-name")
  transitionLabelText.innerText = nextPageName || "Hi there";

  const tl = gsap.timeline({
    onComplete: () => { current.remove() }
  });

  if (reducedMotion) {
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.set(transitionPanel, {
    autoAlpha: 1
  }, 0);

  tl.set(next,{
    autoAlpha: 0
  }, 0);

  tl.fromTo(transitionPanel,{
    yPercent: 0
  },{
    yPercent: -100,
    duration: 0.8,
  }, 0);

  tl.fromTo(transitionLabel, {
    autoAlpha: 0
  },{
    autoAlpha: 1
  }, "<+=0.2");

  tl.fromTo(current,{
    y: "0vh"
  },{
    y: "-15vh",
    duration: 0.8,
  }, 0);
}

function runPageEnterAnimation(next){
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
  const transitionLabel = transitionWrap.querySelector("[data-transition-label]");
  const transitionLabelText = transitionWrap.querySelector("[data-transition-label-text]");

  const tl = gsap.timeline();

  if (reducedMotion) {
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady")
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 1.25);

  tl.set(next, {
    autoAlpha: 1,
  }, "startEnter");

  tl.fromTo(transitionPanel, {
    yPercent: -100,
  },{
    yPercent: -200,
    duration: 1,
    overwrite: "auto",
    immediateRender: false
  }, "startEnter");

  tl.set(transitionPanel, {
    autoAlpha: 0
  }, ">");

  tl.fromTo(transitionLabel, {
    autoAlpha: 1
  },{
    autoAlpha: 0,
    duration: 0.4,
    overwrite: "auto",
    immediateRender: false
  }, "startEnter+=0.1");

  tl.from(next, {
    y: "15vh",
    duration: 1,
  }, "startEnter");

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");
  return new Promise(resolve => {
    tl.call(resolve, null, "pageReady");
  });
}


// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });

  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if(hasScrollTrigger){
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
})

barba.hooks.afterEnter(data => {
  initAfterEnterFunctions(data.next.container);

  if(hasLenis){
    lenis.resize();
    lenis.start();
  }

  if(hasScrollTrigger){
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: true,
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,

      async once(data) {
        initOnceFunctions();
        return runPageOnceAnimation(data.next.container);
      },

      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ],
});



// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light"
  },
  dark: {
    nav: "light",
    transition: "dark"
  }
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;

  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
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
      getBoundingClientRect: function () {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container){
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right,transform" });

  if(hasLenis){
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
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}



// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

// -----------------------------------------
// NAV BLEND MODE (ab 101vh Scroll)
// -----------------------------------------
function initNavBlend() {
  var nav = document.querySelector(".nav_comp");
  if (!nav || !hasScrollTrigger) return;
  if (nav._navBlendTrigger) {
    nav._navBlendTrigger.kill();
    nav._navBlendTrigger = null;
  }

  function setBlend(active) {
    nav.style.mixBlendMode = active ? "difference" : "";
  }

  function getThresholdPx() {
    return window.innerHeight * 1.01;
  }

  nav._navBlendTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: function () { return "top -" + getThresholdPx() + "px"; },
    end: function () { return "top -" + (getThresholdPx() + 1) + "px"; },
    invalidateOnRefresh: true,
    onEnter: function () { setBlend(true); },
    onLeaveBack: function () { setBlend(false); },
  });

  var scrollY = (lenis && (lenis.scrollTop != null || lenis.scroll != null))
    ? (lenis.scrollTop != null ? lenis.scrollTop : lenis.scroll)
    : (window.scrollY || window.pageYOffset);
  setBlend(scrollY >= getThresholdPx());
}

// -----------------------------------------
// FAQ ACCORDION (GSAP)
// -----------------------------------------
function initFaqAccordion(scope) {
  if (typeof gsap === "undefined") return;

  var root = scope && scope.querySelector ? scope : document;
  var cmsWraps = root.querySelectorAll(".faq_cms_wrap");
  if (!cmsWraps.length) return;

  cmsWraps.forEach(function (cmsWrap, listIndex) {
    if (cmsWrap.dataset.scriptInitialized) return;
    cmsWrap.dataset.scriptInitialized = "true";

    var closePrevious = cmsWrap.getAttribute("data-close-previous") !== "false";
    var closeOnSecondClick = cmsWrap.getAttribute("data-close-on-second-click") !== "false";
    var openOnHover = cmsWrap.getAttribute("data-open-on-hover") === "true";
    var openByDefaultAttr = cmsWrap.getAttribute("data-open-by-default");
    var openByDefault = openByDefaultAttr !== null && !isNaN(+openByDefaultAttr) ? +openByDefaultAttr : false;

    var previousIndex = null;
    var closeFunctions = [];

    cmsWrap.querySelectorAll(".faq_component").forEach(function (thisCard, cardIndex) {
      var button = thisCard.querySelector(".faq_toggle_button");
      var content = thisCard.querySelector(".faq_content_wrap");
      var icon = thisCard.querySelector(".faq_toggle_icon");

      if (!button || !content || !icon) return;

      button.setAttribute("aria-expanded", "false");
      button.setAttribute("id", "faq_button_" + listIndex + "_" + cardIndex);
      content.setAttribute("id", "faq_content_" + listIndex + "_" + cardIndex);
      button.setAttribute("aria-controls", content.id);
      content.setAttribute("aria-labelledby", button.id);
      content.style.display = "none";

      var scrollToRestore = null;

      function getScrollY() {
        return (lenis && (lenis.scrollTop != null || lenis.scroll != null))
          ? (lenis.scrollTop != null ? lenis.scrollTop : lenis.scroll)
          : (window.scrollY || window.pageYOffset);
      }

      function refresh() {
        tl.invalidate();
        if (scrollToRestore != null) {
          var y = scrollToRestore;
          scrollToRestore = null;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              if (lenis && lenis.scrollTo) lenis.scrollTo(y, { immediate: true });
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
        if (closePrevious && previousIndex !== null && previousIndex !== cardIndex) {
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

      button.addEventListener("click", function (e) {
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
        button.addEventListener("mouseenter", function () {
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
  var marquees = root.querySelectorAll("[data-marquee-scroll-direction-target]");
  if (!marquees.length) return;

  marquees.forEach(function (marquee) {
    if (marquee.dataset.marqueeScrollDirectionInit === "true") return;
    marquee.dataset.marqueeScrollDirectionInit = "true";

    var marqueeContent = marquee.querySelector("[data-marquee-collection-target]");
    var marqueeScroll = marquee.querySelector("[data-marquee-scroll-target]");
    if (!marqueeContent || !marqueeScroll) return;

    var speedAttr = parseFloat(marquee.dataset.marqueeSpeed) || 20;
    var directionAttr = marquee.dataset.marqueeDirection === "right" ? 1 : -1;
    var duplicateAmount = parseInt(marquee.dataset.marqueeDuplicate || "0", 10);
    var scrollSpeedAttr = parseFloat(marquee.dataset.marqueeScrollSpeed) || 0;

    var speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;
    var marqueeSpeed = speedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;

    marqueeScroll.style.marginLeft = (scrollSpeedAttr * -1) + "%";
    marqueeScroll.style.width = (scrollSpeedAttr * 2 + 100) + "%";

    if (duplicateAmount > 0) {
      var fragment = document.createDocumentFragment();
      for (var i = 0; i < duplicateAmount; i++) {
        fragment.appendChild(marqueeContent.cloneNode(true));
      }
      marqueeScroll.appendChild(fragment);
    }

    var marqueeItems = marquee.querySelectorAll("[data-marquee-collection-target]");
    var animation = gsap.to(marqueeItems, {
      xPercent: -100,
      repeat: -1,
      duration: marqueeSpeed,
      ease: "linear",
    }).totalProgress(0.5);

    gsap.set(marqueeItems, { xPercent: directionAttr === 1 ? 100 : -100 });
    animation.timeScale(directionAttr);
    animation.play();

    marquee.setAttribute("data-marquee-status", "normal");

    ScrollTrigger.create({
      trigger: marquee,
      start: "top bottom",
      end: "bottom top",
      onUpdate: function (self) {
        var isInverted = self.direction === 1;
        var currentDirection = isInverted ? -directionAttr : directionAttr;
        animation.timeScale(currentDirection);
        marquee.setAttribute("data-marquee-status", isInverted ? "normal" : "inverted");
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
    tl.fromTo(marqueeScroll, { x: scrollStart + "vw" }, { x: scrollEnd + "vw", ease: "none" });
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

  sliders.forEach(function (slider) {
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
    cards.forEach(function (card) {
      var dragger = document.createElement("div");
      dragger.setAttribute("data-flick-cards-dragger", "");
      card.appendChild(dragger);
      draggers.push(dragger);
    });

    cards.forEach(function (card) {
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
      cards.forEach(function (card, i) {
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
    slider.addEventListener("mouseleave", function () {
      if (isAutoplayEnabled) startAutoplay();
    });

    document.addEventListener("keydown", function (e) {
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

        cards.forEach(function (card, i) {
          var from = getConfig(i, activeIndex);
          var to = getConfig(i, nextIndex);
          function mix(prop) {
            return from[prop] + (to[prop] - from[prop]) * progress;
          }

          card.style.visibility = (from.visible || to.visible) ? "visible" : "hidden";

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
        var dragDistance = Math.hypot(releaseClientX - pressClientX, releaseClientY - pressClientY);

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
          var self = this;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              var el = document.elementFromPoint(releaseClientX, releaseClientY);
              if (el) {
                el.dispatchEvent(
                  new MouseEvent("click", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                  })
                );
              }
              self.target.style.pointerEvents = "auto";
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
  return typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" &&
    typeof ScrambleTextPlugin !== "undefined" && typeof SplitText !== "undefined";
}

function initScrambleOnLoad(scope) {
  if (!scramblePluginsReady() || reducedMotion) return;
  var root = scope && scope.querySelector ? scope : document;
  var targets = root.querySelectorAll("[data-scramble='load']");
  targets.forEach(function (target) {
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
        stagger: function () { return Math.random() * SCRAMBLE.staggerRandomMax; },
        scrambleText: {
          text: "{original}",
          chars: SCRAMBLE.chars,
          speed: SCRAMBLE.speed,
        },
        onComplete: function () {
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
  targets.forEach(function (target) {
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
        stagger: function () { return Math.random() * SCRAMBLE.staggerRandomMax; },
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
        onComplete: function () {
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
  targets.forEach(function (target) {
    if (target.dataset.scrambleHoverDone === "true") return;
    target.dataset.scrambleHoverDone = "true";

    var textEl = target.querySelector("[data-scramble-hover='target']") || target;
    var originalText = (textEl.textContent || "").trim();
    if (!originalText) return;

    var customHoverText = textEl.getAttribute("data-scramble-text");

    try {
      var hoverText = customHoverText || originalText;

      target.addEventListener("mouseenter", function () {
        textEl.textContent = hoverText;
        var splitIn = new SplitText(textEl, { type: "chars", charsClass: "char" });
        gsap.to(splitIn.chars, {
          duration: SCRAMBLE.durationHoverIn,
          stagger: SCRAMBLE.hoverStagger,
          scrambleText: { text: "{original}", chars: SCRAMBLE.chars, speed: 1.2 },
          onComplete: function () { if (splitIn.revert) splitIn.revert(); },
        });
      });

      target.addEventListener("mouseleave", function () {
        textEl.textContent = originalText;
        var splitOut = new SplitText(textEl, { type: "chars", charsClass: "char" });
        gsap.to(splitOut.chars, {
          duration: SCRAMBLE.durationHoverOut,
          stagger: SCRAMBLE.hoverStagger,
          scrambleText: { text: "{original}", chars: SCRAMBLE.chars, speed: 1.2 },
          onComplete: function () { if (splitOut.revert) splitOut.revert(); },
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

  parallaxImages = [];
  parallaxRafRunning = false;

  root.querySelectorAll("[data-parallax]").forEach(function (el) {
    var speed = parseFloat(el.dataset.parallaxSpeed) || 0.2;
    var scale = parseFloat(el.dataset.parallaxScale) || 1.25;
    var rect = el.getBoundingClientRect();
    var scrollY = getParallaxScrollY();
    var boundsTop = rect.top + scrollY;
    var boundsBottom = rect.bottom + scrollY;

    if (!el.dataset.parallaxInitialized) {
      el.dataset.parallaxInitialized = "true";
      el.style.willChange = "transform";
      el.style.transform = "translateY(0px) scale(" + scale + ")";
    }

    parallaxImages.push({
      el: el,
      speed: speed,
      scale: scale,
      currentY: 0,
      targetY: 0,
      boundsTop: boundsTop,
      boundsBottom: boundsBottom,
    });
  });

  if (parallaxImages.length === 0) return;

  if (!window._parallaxResizeAdded) {
    window._parallaxResizeAdded = true;
    window.addEventListener("resize", function () {
      var scrollY = getParallaxScrollY();
      parallaxImages.forEach(function (img) {
        var rect = img.el.getBoundingClientRect();
        img.boundsTop = rect.top + scrollY;
        img.boundsBottom = rect.bottom + scrollY;
      });
    });
  }

  function onParallaxScroll(scrollY) {
    var y = scrollY != null ? scrollY : getParallaxScrollY();
    parallaxImages.forEach(function (img) {
      img.targetY = (y - img.boundsTop) * img.speed;
    });
  }

  if (!window._parallaxScrollAdded) {
    window._parallaxScrollAdded = true;

    if (lenis) {
      lenis.on("scroll", function (e) {
        window._parallaxScrollY = e.scroll != null ? e.scroll : getParallaxScrollY();
        onParallaxScroll(window._parallaxScrollY);
      });
    } else {
      window.addEventListener("scroll", function () {
        onParallaxScroll();
      }, { passive: true });
    }
  }

  onParallaxScroll();

  if (!parallaxRafRunning) {
    parallaxRafRunning = true;

    function parallaxTick() {
      if (!parallaxRafRunning || parallaxImages.length === 0) return;

      parallaxImages.forEach(function (img) {
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
  root.querySelectorAll("[data-anim-glitch]").forEach(function (component) {
    if (component.dataset.scriptInitialized) return;
    component.dataset.scriptInitialized = "true";

    var computedStyle = window.getComputedStyle(component);
    var originalDisplay = computedStyle.display;
    var originalTextAlign = computedStyle.textAlign;

    var split = new SplitText(component, {
      type: "chars",
      charsClass: "split-char",
    });

    split.chars.forEach(function (char) {
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

    chars.forEach(function (char) {
      var randomStart = Math.random() * 0.6;
      var blinks = 2 + Math.floor(Math.random() * 3);
      var blinkDur = 0.04 + Math.random() * 0.04;
      var gapDur = 0.03 + Math.random() * 0.05;
      for (var b = 0; b < blinks; b++) {
        var offset = randomStart + b * (blinkDur + gapDur);
        tl.fromTo(char, { opacity: 0 }, { opacity: 1, duration: blinkDur, ease: "none" }, offset);
        if (b < blinks - 1) {
          tl.to(char, { opacity: 0, duration: gapDur, ease: "none" }, offset + blinkDur);
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
    elements.forEach(function (el) {
      var inner = el.querySelector(".about_visual_inner");
      var imgs = el.querySelectorAll(".about_visual-img");
      if (inner) gsap.set(inner, { y: 0 });
      imgs.forEach(function (img, i) {
        img.style.opacity = i === 0 ? 1 : 0;
      });
    });
    return;
  }

  elements.forEach(function (element) {
    var visualInner = element.querySelector(".about_visual_inner");
    var frames = element.querySelectorAll(".about_visual-img");

    if (!visualInner) return;

    ScrollTrigger.getAll().forEach(function (t) {
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
      frames.forEach(function (f) {
        f.style.opacity = 0;
      });
      frames[0].style.opacity = 1;

      ScrollTrigger.create({
        trigger: visualInner,
        start: "top 80%",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var progress = self.progress;
          var index = progress >= 1 ? n - 1 : Math.min(Math.floor(progress * n), n - 1);
          frames.forEach(function (frame, i) {
            frame.style.opacity = i === index ? 1 : 0;
          });
        },
      });
    }
  });

  setTimeout(function () {
    ScrollTrigger.refresh();
  }, 150);
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
  scope.querySelectorAll("[data-scroll-overlap='trigger']").forEach(function(component) {
    if (component.hasAttribute("data-scroll-overlap-init")) return;
    component.setAttribute("data-scroll-overlap-init", "");
    var target = component.querySelector("[data-scroll-overlap='target']");
    if (!target) return;
    gsap.timeline({
      scrollTrigger: {
        trigger: component,
        start: function() {
          return component.offsetHeight > window.innerHeight ? "bottom bottom" : "top top";
        },
        end: "bottom top",
        scrub: true
      }
    }).to(target, { y: "40vh", opacity: 0, ease: "none" });
  });
}


// -----------------------------------------
// TYPO SCROLL (viewport-center active + hover)
// -----------------------------------------
function initTypoScrollPreview() {
  var scope = nextPage || document;
  if (!scope.querySelector('[data-typo-scroll-init]')) return;

  window._typoScrollHoverLock = false;

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      window.dispatchEvent(new Event('resize'));
    });
  }

  var isTouchDevice =
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0);

  if (!window._typoScrollScrollAdded) {
    window._typoScrollScrollAdded = true;

    var ticking = false;
    function onTypoScroll() {
      if (!ticking) {
        requestAnimationFrame(function() {
          if (!window._typoScrollHoverLock) typoScrollUpdateActive();
          ticking = false;
        });
        ticking = true;
      }
    }

    if (lenis) {
      lenis.on('scroll', onTypoScroll);
    } else {
      window.addEventListener('scroll', onTypoScroll, { passive: true });
    }
  }

  if (!isTouchDevice) {
    var containers = scope.querySelectorAll('[data-typo-scroll-init]');
    containers.forEach(function(container) {
      container.addEventListener('mouseover', function(e) {
        var item = e.target.closest('[data-typo-scroll-item]');
        if (!item || !container.contains(item)) return;
        var from = e.relatedTarget;
        if (from && item.contains(from)) return;

        window._typoScrollHoverLock = true;
        var items = container.querySelectorAll('[data-typo-scroll-item]');
        items.forEach(function(el) {
          el.setAttribute('data-typo-scroll-item', el === item ? 'active' : '');
        });
      }, true);

      container.addEventListener('mouseout', function(e) {
        var item = e.target.closest('[data-typo-scroll-item]');
        if (!item || !container.contains(item)) return;
        var to = e.relatedTarget;
        if (to && container.contains(to) && to.closest('[data-typo-scroll-item]')) return;

        window._typoScrollHoverLock = false;
        typoScrollUpdateActive();
      }, true);
    });
  }

  typoScrollUpdateActive();
}

function typoScrollUpdateActive() {
  var viewportCenterY = window.innerHeight / 2;
  var liveContainers = document.querySelectorAll('[data-typo-scroll-init]');

  liveContainers.forEach(function(container) {
    var items = container.querySelectorAll('[data-typo-scroll-item]');
    if (!items.length) return;

    var containerRect = container.getBoundingClientRect();
    if (viewportCenterY < containerRect.top || viewportCenterY > containerRect.bottom) {
      items.forEach(function(item) { item.setAttribute('data-typo-scroll-item', ''); });
      return;
    }

    var closestItem = null;
    var closestDistance = Infinity;

    items.forEach(function(item) {
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
      items.forEach(function(item) { item.setAttribute('data-typo-scroll-item', ''); });
      return;
    }

    items.forEach(function(item) {
      item.setAttribute('data-typo-scroll-item', item === closestItem ? 'active' : '');
    });
  });
}


// -----------------------------------------
// BUNNY LIGHTBOX PLAYER
// -----------------------------------------

function initBunnyLightboxPlayer() {
  var player = document.querySelector('[data-bunny-lightbox-init]');
  if (!player) return;

  var wrapper = player.closest('[data-bunny-lightbox-status]');
  if (!wrapper) return;

  // Keep the lightbox outside Barba page containers so it survives swaps
  // and fixed positioning remains relative to the viewport.
  if (wrapper.parentNode !== document.body) {
    document.body.appendChild(wrapper);
  }

  var video = player.querySelector('video');
  if (!video) return;

  try { video.pause(); } catch(_) {}
  try { video.removeAttribute('src'); video.load(); } catch(_) {}

  function setAttr(el, name, val) {
    var str = (typeof val === 'boolean') ? (val ? 'true' : 'false') : String(val);
    if (el.getAttribute(name) !== str) el.setAttribute(name, str);
  }
  function setStatus(s) { setAttr(player, 'data-player-status', s); }
  function setMutedState(v) { video.muted = !!v; setAttr(player, 'data-player-muted', video.muted); }
  function setFsAttr(v) { setAttr(player, 'data-player-fullscreen', !!v); }
  function setActivated(v) { setAttr(player, 'data-player-activated', !!v); }
  if (!player.hasAttribute('data-player-activated')) setActivated(false);

  var timeline = player.querySelector('[data-player-timeline]');
  var progressBar = player.querySelector('[data-player-progress]');
  var bufferedBar = player.querySelector('[data-player-buffered]');
  var handle = player.querySelector('[data-player-timeline-handle]');
  var timeDurationEls = player.querySelectorAll('[data-player-time-duration]');
  var timeProgressEls = player.querySelectorAll('[data-player-time-progress]');
  var playerPlaceholderImg = player.querySelector('[data-bunny-lightbox-placeholder]');

  var updateSize = player.getAttribute('data-player-update-size');
  var autoplay = player.getAttribute('data-player-autoplay') === 'true';
  var initialMuted = player.getAttribute('data-player-muted') === 'true';

  var pendingPlay = false;

  video.loop = false;
  setMutedState(initialMuted);

  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.playsInline = true;
  if (typeof video.disableRemotePlayback !== 'undefined') video.disableRemotePlayback = true;
  if (autoplay) video.autoplay = false;

  var isSafariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
  var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

  var isAttached = false;
  var currentSrc = '';
  var lastPauseBy = '';
  var rafId;
  var autoStartOnReady = false;

  function setupLightboxClamp(player, wrapper, video, updateSize) {
    var calcBox = wrapper.querySelector('[data-bunny-lightbox-calc-height]');
    if (!calcBox) return;

    function getRatio() {
      if (updateSize === 'cover') return null;

      if (updateSize === 'true') {
        if (video.videoWidth && video.videoHeight) return video.videoWidth / video.videoHeight;
        var before = player.querySelector('[data-player-before]');
        if (before && before.style && before.style.paddingTop) {
          var pct = parseFloat(before.style.paddingTop);
          if (pct > 0) return 100 / pct;
        }
        var r = player.getBoundingClientRect();
        if (r.height > 0) return r.width / r.height;
        return 16/9;
      }

      var beforeFalse = player.querySelector('[data-player-before]');
      if (beforeFalse && beforeFalse.style && beforeFalse.style.paddingTop) {
        var pad = parseFloat(beforeFalse.style.paddingTop);
        if (pad > 0) return 100 / pad;
      }
      var rb = player.getBoundingClientRect();
      if (rb.height > 0) return rb.width / rb.height;
      return 16/9;
    }

    function applyClamp() {
      if (updateSize === 'cover') {
        calcBox.style.maxWidth = '';
        calcBox.style.maxHeight = '';
        return;
      }

      var parent = wrapper;
      var cs = getComputedStyle(parent);
      var pt = parseFloat(cs.paddingTop)    || 0;
      var pb = parseFloat(cs.paddingBottom) || 0;
      var pl = parseFloat(cs.paddingLeft)   || 0;
      var pr = parseFloat(cs.paddingRight)  || 0;

      var cw = (parent.clientWidth  - pl - pr);
      var ch = (parent.clientHeight - pt - pb);
      if (cw <= 0 || ch <= 0) return;

      var ratio = getRatio();
      if (!ratio) {
        calcBox.style.maxWidth = '';
        calcBox.style.maxHeight = '';
        return;
      }

      var hIfFullWidth = cw / ratio;

      if (hIfFullWidth <= ch) {
        calcBox.style.maxWidth  = '100%';
        calcBox.style.maxHeight = (hIfFullWidth / ch * 100) + '%';
      } else {
        calcBox.style.maxHeight = '100%';
        calcBox.style.maxWidth  = ((ch * ratio) / cw * 100) + '%';
      }
    }

    var rafPending = false;
    function debouncedApply() {
      if (rafPending) return;
      if (wrapper.getAttribute('data-bunny-lightbox-status') !== 'active') return;
      rafPending = true;
      requestAnimationFrame(function(){
        rafPending = false;
        applyClamp();
      });
    }

    var ro = new ResizeObserver(debouncedApply);
    ro.observe(wrapper);

    window.addEventListener('resize', debouncedApply);
    window.addEventListener('orientationchange', debouncedApply);

    if (updateSize === 'true') {
      video.addEventListener('loadedmetadata', debouncedApply);
      video.addEventListener('loadeddata', debouncedApply);
      video.addEventListener('playing', debouncedApply);
    }

    player._applyClamp = debouncedApply;
    debouncedApply();
  }

  setupLightboxClamp(player, wrapper, video, updateSize);

  function withAttach(src, onReady) {
    if (isSafariNative) {
      video.preload = 'auto';
      video.src = src;
      video.addEventListener('loadedmetadata', onReady, { once: true });
      return;
    }
    if (canUseHlsJs) {
      var hls = new Hls({ maxBufferLength: 10 });
      player._hls = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function(){ hls.loadSource(src); });
      hls.on(Hls.Events.MANIFEST_PARSED, function(){ onReady(); });
      hls.on(Hls.Events.LEVEL_LOADED, function(e, data){
        if (data && data.details && isFinite(data.details.totalduration) && timeDurationEls.length) {
          setText(timeDurationEls, formatTime(data.details.totalduration));
        }
      });
      return;
    }
    video.preload = 'auto';
    video.src = src;
    video.addEventListener('loadedmetadata', onReady, { once: true });
  }

  function attachMediaFor(src) {
    if (currentSrc === src && isAttached) return;
    if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }
    if (timeDurationEls.length) setText(timeDurationEls, '00:00');

    currentSrc = src;
    isAttached = true;

    withAttach(src, function onReady(){
      readyIfIdle(player, pendingPlay);
      updateBeforeRatioIOSSafe();
      if (typeof player._applyClamp === 'function') player._applyClamp();
      if (timeDurationEls.length && video.duration) setText(timeDurationEls, formatTime(video.duration));

      if (autoStartOnReady && wrapper.getAttribute('data-bunny-lightbox-status') === 'active') {
        setStatus('loading');
        safePlay(video);
        autoStartOnReady = false;
      }
    });
  }

  function ensureOpenUI(isActive) {
    var state = isActive ? 'active' : 'not-active';
    if (wrapper.getAttribute('data-bunny-lightbox-status') !== state) {
      wrapper.setAttribute('data-bunny-lightbox-status', state);
    }
    if (isActive && typeof player._applyClamp === 'function') player._applyClamp();
  }

  function isSameSrc(next){ return currentSrc && currentSrc === next; }
  function planOnOpen(next) {
    var same = isSameSrc(next);
    if (!same) {
      try { if (!video.paused && !video.ended) video.pause(); } catch(_) {}
      if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }
      isAttached = false; currentSrc = '';
      if (timeDurationEls.length) setText(timeDurationEls, '00:00');
      setActivated(false);
      setStatus('idle');

      attachMediaFor(next);
      autoStartOnReady = !!autoplay;
      pendingPlay = !!autoplay;
      return;
    }
    autoStartOnReady = !!autoplay;
    if (autoplay) {
      setStatus('loading');
      safePlay(video);
    } else {
      try { if (!video.paused && !video.ended) video.pause(); } catch(_) {}
      setActivated(false);
      setStatus('paused');
    }
  }

  function openLightbox(src, placeholderUrl) {
    if (!src) return;

    function activate() {
      ensureOpenUI(true);
      planOnOpen(src);
    }

    if (playerPlaceholderImg && placeholderUrl) {
      var needsSwap = playerPlaceholderImg.getAttribute('src') !== placeholderUrl;
      if (needsSwap || !playerPlaceholderImg.complete || !playerPlaceholderImg.naturalWidth) {
        playerPlaceholderImg.onload = function(){ playerPlaceholderImg.onload = null; activate(); };
        playerPlaceholderImg.onerror = function(){ playerPlaceholderImg.onerror = null; activate(); };
        if (needsSwap) playerPlaceholderImg.setAttribute('src', placeholderUrl);
        else playerPlaceholderImg.dispatchEvent(new Event('load'));
      } else {
        activate();
      }
    } else {
      activate();
    }
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      pendingPlay = true;
      lastPauseBy = '';
      setStatus('loading');
      safePlay(video);
    } else {
      lastPauseBy = 'manual';
      video.pause();
    }
  }
  function toggleMute() { setMutedState(!video.muted); }

  player.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-player-control]');
    if (!btn || !player.contains(btn)) return;
    var type = btn.getAttribute('data-player-control');
    if (type === 'play' || type === 'pause' || type === 'playpause') togglePlay();
    else if (type === 'mute') toggleMute();
    else if (type === 'fullscreen') toggleFullscreen();
  });

  function isFsActive() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function enterFullscreen() {
    if (player.requestFullscreen) return player.requestFullscreen();
    if (video.requestFullscreen) return video.requestFullscreen();
    if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') return video.webkitEnterFullscreen();
  }
  function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') return video.webkitExitFullscreen();
  }
  function toggleFullscreen() { if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen(); else enterFullscreen(); }
  document.addEventListener('fullscreenchange', function() { setFsAttr(isFsActive()); });
  document.addEventListener('webkitfullscreenchange', function() { setFsAttr(isFsActive()); });
  video.addEventListener('webkitbeginfullscreen', function() { setFsAttr(true); });
  video.addEventListener('webkitendfullscreen', function() { setFsAttr(false); });

  function updateTimeTexts() {
    if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
    if (timeProgressEls.length) setText(timeProgressEls, formatTime(video.currentTime));
  }
  video.addEventListener('timeupdate', updateTimeTexts);
  video.addEventListener('loadedmetadata', function(){ updateTimeTexts(); updateBeforeRatioIOSSafe(); });
  video.addEventListener('loadeddata', function(){ updateBeforeRatioIOSSafe(); });
  video.addEventListener('playing', function(){ updateBeforeRatioIOSSafe(); });
  video.addEventListener('durationchange', updateTimeTexts);

  function updateProgressVisuals() {
    if (!video.duration) return;
    var playedPct = (video.currentTime / video.duration) * 100;
    if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + playedPct) + '%)';
    if (handle) handle.style.left = pctClamp(playedPct) + '%';
  }
  function pctClamp(p) { return p < 0 ? 0 : p > 100 ? 100 : p; }
  function loop() {
    updateProgressVisuals();
    if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
  }

  function updateBufferedBar() {
    if (!bufferedBar || !video.duration || !video.buffered.length) return;
    var end = video.buffered.end(video.buffered.length - 1);
    var buffPct = (end / video.duration) * 100;
    bufferedBar.style.transform = 'translateX(' + (-100 + buffPct) + '%)';
  }
  video.addEventListener('progress', updateBufferedBar);
  video.addEventListener('loadedmetadata', updateBufferedBar);
  video.addEventListener('durationchange', updateBufferedBar);

  video.addEventListener('play', function() { setActivated(true); cancelAnimationFrame(rafId); loop(); setStatus('playing'); });
  video.addEventListener('playing', function() { pendingPlay = false; setStatus('playing'); });
  video.addEventListener('pause', function() { pendingPlay = false; cancelAnimationFrame(rafId); updateProgressVisuals(); setStatus('paused'); });
  video.addEventListener('waiting', function() { setStatus('loading'); });
  video.addEventListener('canplay', function() { readyIfIdle(player, pendingPlay); });

  video.addEventListener('ended', function () {
    pendingPlay = false;
    cancelAnimationFrame(rafId);
    updateProgressVisuals();
    setActivated(false);
    video.currentTime = 0;

    if (document.fullscreenElement || document.webkitFullscreenElement || video.webkitDisplayingFullscreen) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (video.webkitExitFullscreen) video.webkitExitFullscreen();
    }

    closeLightbox();
  });

  if (timeline) {
    var dragging = false, wasPlaying = false, targetTime = 0, lastSeekTs = 0, seekThrottle = 180, rect = null;
    window.addEventListener('resize', function() { if (!dragging) rect = null; });
    function getFractionFromX(x) {
      if (!rect) rect = timeline.getBoundingClientRect();
      var f = (x - rect.left) / rect.width; if (f < 0) f = 0; if (f > 1) f = 1; return f;
    }
    function previewAtFraction(f) {
      if (!video.duration) return;
      var pct = f * 100;
      if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + pct) + '%)';
      if (handle) handle.style.left = pct + '%';
      if (timeProgressEls.length) setText(timeProgressEls, formatTime(f * video.duration));
    }
    function maybeSeek(now) {
      if (!video.duration) return;
      if ((now - lastSeekTs) < seekThrottle) return;
      lastSeekTs = now; video.currentTime = targetTime;
    }
    function onPointerDown(e) {
      if (!video.duration) return;
      dragging = true; wasPlaying = !video.paused && !video.ended; if (wasPlaying) video.pause();
      player.setAttribute('data-timeline-drag', 'true'); rect = timeline.getBoundingClientRect();
      var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now());
      timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now()); e.preventDefault();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false; player.setAttribute('data-timeline-drag', 'false'); rect = null; video.currentTime = targetTime;
      if (wasPlaying) safePlay(video); else { updateProgressVisuals(); updateTimeTexts(); }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }
    timeline.addEventListener('pointerdown', onPointerDown, { passive: false });
    if (handle) handle.addEventListener('pointerdown', onPointerDown, { passive: false });
  }

  var hoverTimer;
  var hoverHideDelay = 3000;
  function setHover(state) {
    if (player.getAttribute('data-player-hover') !== state) {
      player.setAttribute('data-player-hover', state);
    }
  }
  function scheduleHide() { clearTimeout(hoverTimer); hoverTimer = setTimeout(function() { setHover('idle'); }, hoverHideDelay); }
  function wakeControls() { setHover('active'); scheduleHide(); }
  player.addEventListener('pointerdown', wakeControls);
  document.addEventListener('fullscreenchange', wakeControls);
  document.addEventListener('webkitfullscreenchange', wakeControls);
  var trackingMove = false;
  function onPointerMoveGlobal(e) {
    var r = player.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) wakeControls();
  }
  player.addEventListener('pointerenter', function() {
    wakeControls();
    if (!trackingMove) { trackingMove = true; window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true }); }
  });
  player.addEventListener('pointerleave', function() {
    setHover('idle'); clearTimeout(hoverTimer);
    if (trackingMove) { trackingMove = false; window.removeEventListener('pointermove', onPointerMoveGlobal); }
  });

  function closeLightbox() {
    ensureOpenUI(false);

    var hasPlayed = false;
    try {
      if (video.played && video.played.length) {
        for (var i = 0; i < video.played.length; i++) {
          if (video.played.end(i) > 0) { hasPlayed = true; break; }
        }
      } else {
        hasPlayed = video.currentTime > 0;
      }
    } catch (_) {}

    try { if (!video.paused && !video.ended) video.pause(); } catch (_) {}

    setActivated(false);
    setStatus(hasPlayed ? 'paused' : 'idle');
  }

  document.addEventListener('click', function(e) {
    var openBtn = e.target.closest('[data-bunny-lightbox-control="open"]');
    if (openBtn) {
      console.log('LIGHTBOX OPEN triggered by:', openBtn, 'during transition:', barba.transitions.isRunning);
      if (barba.transitions.isRunning) return;
      var src = openBtn.getAttribute('data-bunny-lightbox-src') || '';
      if (!src) return;
      var imgEl = openBtn.querySelector('[data-bunny-lightbox-placeholder]');
      var placeholderUrl = imgEl ? imgEl.getAttribute('src') : '';
      openLightbox(src, placeholderUrl);
      return;
    }
    var closeBtn = e.target.closest('[data-bunny-lightbox-control="close"]');
    if (closeBtn) {
      var closeInWrapper = closeBtn.closest('[data-bunny-lightbox-status]');
      if (closeInWrapper === wrapper) closeLightbox();
      return;
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '00:00';
    var s = Math.floor(sec), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return h > 0 ? (h + ':' + pad2(m) + ':' + pad2(r)) : (pad2(m) + ':' + pad2(r));
  }
  function setText(nodes, text) { nodes.forEach(function(n){ n.textContent = text; }); }

  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function(a, b) { return ((b.width||0) > (a.width||0)) ? b : a; }, levels[0]);
  }

  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === 'function') p.catch(function(){});
  }

  function readyIfIdle(player, pendingPlay) {
    if (!pendingPlay &&
        player.getAttribute('data-player-activated') !== 'true' &&
        player.getAttribute('data-player-status') === 'idle') {
      player.setAttribute('data-player-status', 'ready');
    }
  }

  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== 'true' || !w || !h) return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    before.style.paddingTop = (h / w * 100) + '%';
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== '0%';
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  function updateBeforeRatioIOSSafe() {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;

    function apply(w, h) {
      if (!w || !h) return;
      before.style.paddingTop = (h / w * 100) + '%';
      if (typeof player._applyClamp === 'function') player._applyClamp();
    }

    if (video.videoWidth && video.videoHeight) { apply(video.videoWidth, video.videoHeight); return; }

    if (player._hls && player._hls.levels && player._hls.levels.length) {
      var lvls = player._hls.levels;
      var best = lvls.reduce(function(a, b) { return ((b.width||0) > (a.width||0)) ? b : a; }, lvls[0]);
      if (best && best.width && best.height) { apply(best.width, best.height); return; }
    }

    requestAnimationFrame(function () {
      if (video.videoWidth && video.videoHeight) { apply(video.videoWidth, video.videoHeight); return; }

      var master = (typeof currentSrc === 'string' && currentSrc) ? currentSrc : '';
      if (!master || master.indexOf('blob:') === 0) {
        var attrSrc = player.getAttribute('data-bunny-lightbox-src') || player.getAttribute('data-player-src') || '';
        if (attrSrc && attrSrc.indexOf('blob:') !== 0) master = attrSrc;
      }
      if (!master || !/^https?:/i.test(master)) return;
st
      fetch(master, { credentials: 'omit', cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
        .then(function (txt) {
          var lines = txt.split(/\r?\n/);
          var bestW = 0, bestH = 0, last = null;
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf('#EXT-X-STREAM-INF:') === 0) {
              last = line;
            } else if (last && line && line[0] !== '#') {
              var m = /RESOLUTION=(\d+)x(\d+)/.exec(last);
              if (m) {
                var W = parseInt(m[1], 10), H = parseInt(m[2], 10);
                if (W > bestW) { bestW = W; bestH = H; }
              }
              last = null;
            }
          }
          if (bestW && bestH) apply(bestW, bestH);
        })
        .catch(function () {});
    });
  }
}
