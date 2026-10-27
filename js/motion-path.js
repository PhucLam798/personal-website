/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 02: HIGH-PERFORMANCE MASTER MOTION PATH ENGINE (60-120FPS)
 * - Pre-sampled Lookup Table (pathLUT) eliminates runtime getPointAtLength() calls
 * - Demand-driven requestAnimationFrame (auto-sleeps when scroll is idle)
 * - Cached waypoint states prevent redundant DOM class/attribute mutations
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.MotionPath = (function () {
    let svgEl = null;
    let pathGuide = null;
    let pathEcho = null;
    let pathActive = null;
    let signalGroup = null;
    let signalRotor = null;
    let signalCoordText = null;
    let waypointsGroup = null;
    let hudCoords = null;

    let totalLength = 0;
    let anchorPoints = [];
    let pathLUT = []; // Pre-sampled [{ y, x, len, angle }]
    let waypointCache = []; // [{ el, y, reached }]

    let currentLength = 0;
    let targetLength = 0;
    let lastRenderedLen = -1;
    let lastTextUpdateLen = -999;

    let docHeight = 0;
    let docWidth = 0;
    let isInitialized = false;
    let isAnimating = false;
    let rafId = null;

    /**
     * Collect all [data-path-anchor] elements and build the Cubic Bézier path
     * plus a 240-sample Lookup Table (pathLUT) for O(log N) zero-DOM-cost queries.
     */
    function computeMasterPath() {
        svgEl = document.getElementById('master-story-svg');
        pathGuide = document.getElementById('master-path-guide');
        pathEcho = document.getElementById('master-path-echo');
        pathActive = document.getElementById('master-path-active');
        signalGroup = document.getElementById('master-signal-node');
        signalCoordText = document.getElementById('master-signal-coords');
        waypointsGroup = document.getElementById('master-waypoints-group');
        hudCoords = document.getElementById('hud-telemetry-coords');

        if (!svgEl || !pathActive) return;
        if (signalGroup) {
            signalRotor = signalGroup.querySelector('.signal-rotor');
        }

        const mainEl = document.getElementById('smooth-content') || document.querySelector('main') || document.body;
        docWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        docHeight = Math.max(
            mainEl.scrollHeight,
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );

        svgEl.setAttribute('viewBox', `0 0 ${docWidth} ${docHeight}`);
        svgEl.style.width = `${docWidth}px`;
        svgEl.style.height = `${docHeight}px`;

        const anchorEls = Array.from(document.querySelectorAll('[data-path-anchor]'));
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        const isMobile = docWidth < 768;

        anchorPoints = [];

        for (let i = 0; i < anchorEls.length; i++) {
            const el = anchorEls[i];
            const rect = el.getBoundingClientRect();
            const absY = rect.top + scrollTop + rect.height * 0.5;
            let absX = rect.left + rect.width * 0.5;

            const customBias = el.getAttribute('data-anchor-x');
            if (customBias !== null && customBias !== '') {
                const ratio = parseFloat(customBias);
                if (!isNaN(ratio)) {
                    absX = isMobile
                        ? docWidth * (0.12 + ratio * 0.76)
                        : docWidth * ratio;
                }
            }

            anchorPoints.push({
                x: Math.max(24, Math.min(docWidth - 24, absX)),
                y: Math.max(0, absY),
                label: el.getAttribute('data-path-anchor') || `WP.${String(i).padStart(2, '0')}`
            });
        }

        anchorPoints.sort((a, b) => a.y - b.y);

        const filtered = [];
        for (let i = 0; i < anchorPoints.length; i++) {
            if (i === 0 || anchorPoints[i].y - filtered[filtered.length - 1].y > 60) {
                filtered.push(anchorPoints[i]);
            }
        }
        anchorPoints = filtered;

        if (anchorPoints.length < 2) return;

        let d = `M ${anchorPoints[0].x.toFixed(1)} ${anchorPoints[0].y.toFixed(1)}`;
        let dEcho = `M ${(anchorPoints[0].x + 12).toFixed(1)} ${anchorPoints[0].y.toFixed(1)}`;

        for (let i = 0; i < anchorPoints.length - 1; i++) {
            const p0 = anchorPoints[i];
            const p1 = anchorPoints[i + 1];
            const dy = p1.y - p0.y;
            const dx = p1.x - p0.x;

            const sway = isMobile ? (i % 2 === 0 ? 16 : -16) : (i % 2 === 0 ? 48 : -48);
            const cp1x = Math.max(20, Math.min(docWidth - 20, p0.x + dx * 0.15 + sway));
            const cp1y = p0.y + dy * 0.42;
            const cp2x = Math.max(20, Math.min(docWidth - 20, p1.x - dx * 0.15 - sway * 0.6));
            const cp2y = p0.y + dy * 0.58;

            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
            dEcho += ` C ${(cp1x + 14).toFixed(1)} ${(cp1y + 6).toFixed(1)}, ${(cp2x - 14).toFixed(1)} ${(cp2y - 6).toFixed(1)}, ${(p1.x + 8).toFixed(1)} ${p1.y.toFixed(1)}`;
        }

        pathGuide.setAttribute('d', d);
        pathActive.setAttribute('d', d);
        if (pathEcho) pathEcho.setAttribute('d', dEcho);

        totalLength = pathActive.getTotalLength();
        pathActive.style.strokeDasharray = `${totalLength.toFixed(1)}`;

        // Pre-sample the path ONCE into pathLUT (240 samples)
        buildLookupTable(240);

        // Render Waypoint Markers & cache references
        renderWaypoints();

        // Compute Chapter 01 Trifurcation SVG
        computeTrifurcationPath();

        // Force immediate sync
        lastRenderedLen = -1;
        updateForScroll(window.pageYOffset || document.documentElement.scrollTop || 0, true);
    }

    /**
     * Precompute Lookup Table so scroll frames never touch SVG geometry engine
     */
    function buildLookupTable(samplesCount) {
        pathLUT = [];
        if (!pathActive || totalLength <= 0) return;

        for (let i = 0; i <= samplesCount; i++) {
            const len = (i / samplesCount) * totalLength;
            const pt = pathActive.getPointAtLength(len);
            const prevPt = pathActive.getPointAtLength(Math.max(0, len - 4));
            const nextPt = pathActive.getPointAtLength(Math.min(totalLength, len + 4));
            const angle = Math.atan2(nextPt.y - prevPt.y, nextPt.x - prevPt.x) * (180 / Math.PI);

            pathLUT.push({
                len,
                x: pt.x,
                y: pt.y,
                angle
            });
        }
    }

    /**
     * Fast O(log N) lookup in pathLUT by document Y coordinate
     */
    function lookupByY(targetY) {
        const n = pathLUT.length;
        if (n === 0) return { len: 0, x: 0, y: 0, angle: 90 };
        if (targetY <= pathLUT[0].y) return pathLUT[0];
        if (targetY >= pathLUT[n - 1].y) return pathLUT[n - 1];

        let low = 0;
        let high = n - 1;
        while (low + 1 < high) {
            const mid = (low + high) >> 1;
            if (pathLUT[mid].y < targetY) {
                low = mid;
            } else {
                high = mid;
            }
        }

        const p0 = pathLUT[low];
        const p1 = pathLUT[high];
        const spanY = p1.y - p0.y;
        const t = spanY > 0.001 ? Math.max(0, Math.min(1, (targetY - p0.y) / spanY)) : 0;

        return {
            len: p0.len + (p1.len - p0.len) * t,
            x: p0.x + (p1.x - p0.x) * t,
            y: p0.y + (p1.y - p0.y) * t,
            angle: p0.angle + (p1.angle - p0.angle) * t
        };
    }

    /**
     * Fast O(1) lookup in pathLUT by arc length
     */
    function lookupByLen(len) {
        const n = pathLUT.length;
        if (n === 0 || totalLength <= 0) return { len: 0, x: 0, y: 0, angle: 90 };
        const clamped = Math.max(0, Math.min(totalLength, len));
        const exactIdx = (clamped / totalLength) * (n - 1);
        const i0 = Math.floor(exactIdx);
        const i1 = Math.min(n - 1, i0 + 1);
        const t = exactIdx - i0;

        const p0 = pathLUT[i0];
        const p1 = pathLUT[i1];
        return {
            len: clamped,
            x: p0.x + (p1.x - p0.x) * t,
            y: p0.y + (p1.y - p0.y) * t,
            angle: p0.angle + (p1.angle - p0.angle) * t
        };
    }

    function renderWaypoints() {
        if (!waypointsGroup) return;
        const NS = 'http://www.w3.org/2000/svg';
        waypointsGroup.innerHTML = '';
        waypointCache = [];

        anchorPoints.forEach((pt) => {
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('class', 'master-waypoint');
            g.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

            const outerRing = document.createElementNS(NS, 'circle');
            outerRing.setAttribute('r', '8');
            outerRing.setAttribute('class', 'wp-ring');

            const innerDot = document.createElementNS(NS, 'circle');
            innerDot.setAttribute('r', '3');
            innerDot.setAttribute('class', 'wp-dot');

            const label = document.createElementNS(NS, 'text');
            label.setAttribute('x', '14');
            label.setAttribute('y', '3');
            label.setAttribute('class', 'wp-label');
            label.textContent = pt.label;

            g.appendChild(outerRing);
            g.appendChild(innerDot);
            g.appendChild(label);
            waypointsGroup.appendChild(g);

            waypointCache.push({
                el: g,
                y: pt.y,
                reached: false
            });
        });
    }

    function updateForScroll(scrollY, immediate = false) {
        if (!pathActive || totalLength <= 0 || pathLUT.length === 0) return;

        const vh = window.innerHeight || 800;
        const maxScroll = Math.max(1, docHeight - vh);
        const scrollRatio = Math.max(0, Math.min(1, scrollY / maxScroll));

        const focusOffset = vh * (0.36 + scrollRatio * 0.42);
        const focusY = scrollY + focusOffset;

        const sample = lookupByY(focusY);
        targetLength = sample.len;

        if (immediate) {
            currentLength = targetLength;
            renderFrame();
        } else if (!isAnimating) {
            isAnimating = true;
            rafId = requestAnimationFrame(tick);
        }
    }

    function renderFrame() {
        if (!pathActive || totalLength <= 0) return;

        const diff = targetLength - currentLength;
        if (Math.abs(diff) > 0.6) {
            currentLength += diff * 0.28;
        } else {
            currentLength = targetLength;
        }

        if (Math.abs(currentLength - lastRenderedLen) < 0.25) return;
        lastRenderedLen = currentLength;

        const sample = lookupByLen(currentLength);
        const dashOffset = totalLength - sample.len;
        pathActive.style.strokeDashoffset = `${dashOffset.toFixed(1)}`;

        if (signalGroup) {
            signalGroup.setAttribute('transform', `translate(${sample.x.toFixed(1)}, ${sample.y.toFixed(1)})`);
            if (signalRotor) {
                signalRotor.setAttribute('transform', `rotate(${(sample.angle - 90).toFixed(1)})`);
            }
        }

        // Throttle text node updates so they only fire every ~18px of travel
        if (Math.abs(currentLength - lastTextUpdateLen) > 18 || currentLength === targetLength) {
            lastTextUpdateLen = currentLength;
            if (signalCoordText) {
                signalCoordText.textContent = `[${Math.round(sample.x)}, ${Math.round(sample.y)}]`;
            }
            if (hudCoords) {
                const pct = Math.round((sample.len / totalLength) * 100);
                hudCoords.textContent = `SIG ${String(pct).padStart(3, '0')}% · Y:${Math.round(sample.y)}`;
            }
        }

        // Only mutate waypoint classList when reached state actually flips
        for (let i = 0; i < waypointCache.length; i++) {
            const wp = waypointCache[i];
            const shouldReach = sample.y + 12 >= wp.y;
            if (shouldReach !== wp.reached) {
                wp.reached = shouldReach;
                wp.el.classList.toggle('is-reached', shouldReach);
            }
        }
    }

    function tick() {
        renderFrame();
        if (Math.abs(targetLength - currentLength) > 0.6) {
            rafId = requestAnimationFrame(tick);
        } else {
            currentLength = targetLength;
            renderFrame();
            isAnimating = false;
            rafId = null;
        }
    }

    function computeTrifurcationPath() {
        const triSvg = document.getElementById('trifurcation-svg');
        if (!triSvg) return;

        const w = triSvg.clientWidth || 1000;
        const h = triSvg.clientHeight || 96;
        triSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

        const cx = w * 0.5;
        const leftX = w * 0.166;
        const rightX = w * 0.833;

        const dLeft = `M ${cx} 0 C ${cx} ${h * 0.45}, ${leftX} ${h * 0.45}, ${leftX} ${h}`;
        const dCenter = `M ${cx} 0 L ${cx} ${h}`;
        const dRight = `M ${cx} 0 C ${cx} ${h * 0.45}, ${rightX} ${h * 0.45}, ${rightX} ${h}`;

        ['tri-branch-left', 'tri-branch-left-active'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('d', dLeft);
        });
        ['tri-branch-center', 'tri-branch-center-active'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('d', dCenter);
        });
        ['tri-branch-right', 'tri-branch-right-active'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('d', dRight);
        });
    }

    function init() {
        if (isInitialized) return;
        isInitialized = true;

        computeMasterPath();

        window.addEventListener('scroll', () => {
            updateForScroll(window.pageYOffset || document.documentElement.scrollTop || 0);
        }, { passive: true });

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(computeMasterPath, 180);
        });

        window.addEventListener('load', () => {
            setTimeout(computeMasterPath, 150);
        });
    }

    return {
        init,
        refresh: computeMasterPath,
        updateForScroll
    };
})();
