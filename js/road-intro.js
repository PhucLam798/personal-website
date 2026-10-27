/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 06: SCROLL-DRIVEN INTRODUCTION OVER A RUNNING 3D ROAD (CANVAS 2D)
 * - One particle field morphs: cloud → linear-regression scatter → running 3D floor
 * - Introduction pages (about, education, pipeline, skills) fade in card by card
 * - Finale: the floor bends into a wormhole and the camera dives through its throat
 * - Pinned via CSS sticky; progress read once per frame, rAF sleeps off-screen
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.RoadIntro = (function () {
    // World units. Camera sits at z = 0 looking down +z.
    const SPACING = 4;
    const W_HALF = 120;
    const Z_NEAR = 1.5;
    const Z_FAR = 170;
    const Z_SPAN = Z_FAR - Z_NEAR;
    const NL = Math.round((W_HALF * 2) / SPACING);
    const NT = Math.round(Z_SPAN / SPACING);
    const L_SAMPLES = 64;
    const T_SAMPLES = 80;
    const CENTER_LINES = [NL / 2 - 1, NL / 2];

    // Wormhole: a funnel in the floor around (0, 0, WELL_Z) that narrows to a throat of radius WELL_R
    const WELL_Z = 58;
    const WELL_R = 3;
    const WELL_K = 14;
    const WELL_C = 9;
    const WELL_RINGS = [3.04, 3.08, 3.14, 3.22, 3.34, 3.5, 3.75, 4.1, 4.6, 5.3, 6.3, 7.6, 9.3, 11.4, 14, 17, 20.5, 24.5, 29, 34, 40, 47, 55, 64, 74, 86];
    const WELL_SPOKES = 40;
    const SPOKE_RADII = Array.from({ length: 48 }, (_, i) => WELL_R + 0.03 * Math.pow(92 / 0.03, i / 47));

    // World units the floor travels per unit of scroll progress
    const DRIVE = 400;

    // Scroll timeline, expressed as progress (0..1) across the pinned intro
    const T = {
        scatter: [0.035, 0.114],
        chartIn: [0.088, 0.123],
        fit: [0.106, 0.141],
        residual: [0.123, 0.158],
        chartOut: [0.167, 0.194],
        toGrid: [0.176, 0.264],
        dive: [0.194, 0.29],
        lines: [0.229, 0.282],
        solid: [0.264, 0.317],
        // Space starts bending under the last page, then the wormhole holds the screen before the dive
        bend: [0.63, 0.86],
        polar: [0.8, 0.88],
        rise: [0.81, 0.9],
        plunge: [0.91, 0.995],
        fade: [0.975, 1]
    };

    // Fog bands (fraction of Z_FAR → alpha) so the floor batches into a few strokes
    const BAND_EDGES = [0.5, 0.64, 0.76, 0.87, 1.01];
    const BAND_ALPHA = [1, 0.72, 0.46, 0.24, 0.09];

    const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
    const range = (v, ab) => clamp01((v - ab[0]) / (ab[1] - ab[0]));
    const smooth = t => t * t * (3 - 2 * t);
    const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const lerp = (a, b, t) => a + (b - a) * t;
    const sstep = (a, b, v) => smooth(clamp01((v - a) / (b - a)));
    const wrapZ = z => Z_NEAR + (((z - Z_NEAR) % Z_SPAN) + Z_SPAN) % Z_SPAN;
    const fog = z => 1 - sstep(Z_FAR * 0.5, Z_FAR, z);

    function gauss(rand = Math.random) {
        const u = rand() || 1e-6;
        const v = rand();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    // Seeded PRNG so the regression data (and its fitted line) is identical on every load
    function mulberry32(seed) {
        return function () {
            seed |= 0;
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    let section = null;
    let stage = null;
    let canvas = null;
    let ctx = null;
    let blocks = [];
    let scrim = null;
    let scrimLevel = 0;
    let vw = 0;
    let vh = 0;
    let dpr = 1;
    let isMobile = false;
    // Touch devices (any orientation) get a smaller particle and pixel budget
    let lowPower = false;
    let reduceMotion = false;
    let running = false;
    let rafId = null;
    let lastNow = 0;
    let time = 0;
    // Seconds since the preloader finished: the opening fades in on its own, slowly
    let openClock = 0;
    let cloudIn = 0;
    let openIn = 0;

    let p = 0;
    let lastTarget = 0;
    let boost = 0;
    let travel = 0;
    let mouseX = 0;
    let camX = 0;

    // Scene state consumed by deform()/project()
    const st = { well: 0, polar: 0, hills: 0, camH: 6, camZ: 0, cosP: 1, sinP: 0, horizon: 0.56, f: 1000 };

    // Particle field (struct-of-arrays)
    let N = 0;
    let P = null;
    let buckets = [];
    let sxs = null;
    let sys = null;

    // Regression data in unit chart space (x → right, y → up) and its least-squares fit
    const REG = { xs: [], ys: [], slope: 0, intercept: 0, r2: 0 };

    // Theme-resolved colors
    let inkStyles = [];
    let accentStyles = [];
    let accentRGB = [0, 229, 255];
    let inkRGB = [244, 241, 234];

    let comets = [];
    let labels = { title: '', x: '', y: '', forecast: '' };

    /* ------------------------------------------------------------------------
       GEOMETRY: deform the flat floor, then pinhole-project to the screen
       ------------------------------------------------------------------------ */
    let dX = 0;
    let dY = 0;
    let sx = 0;
    let sy = 0;

    function deform(x, z) {
        let Y = 0;
        if (st.hills > 0.001) {
            Y += st.hills * (Math.sin(x * 0.11 + 1.7) * 0.9 + Math.sin(x * 0.043 - z * 0.05) * 1.7) * sstep(45, 150, z);
        }
        if (st.well > 0.001) {
            Y -= st.well * wellDepth(Math.hypot(x, z - WELL_Z));
        }
        dX = x;
        dY = Y;
    }

    // Depth of the funnel below the floor: ~0 far away, growing without bound toward the throat
    function wellDepth(r) {
        const d = Math.max(r - WELL_R, 0.02);
        return WELL_C * Math.log(1 + (WELL_K / d) * (WELL_K / d));
    }

    // Pinhole camera at (camX, camH, camZ) pitched down by asin(sinP)
    function project(X, Y, Z) {
        const rx = X - camX;
        const ry = Y - st.camH;
        const rz = Z - st.camZ;
        const zc = rz * st.cosP - ry * st.sinP;
        if (zc < 0.2) return false;
        const yc = ry * st.cosP + rz * st.sinP;
        sx = vw * 0.5 + (st.f * rx) / zc;
        sy = vh * st.horizon - (st.f * yc) / zc;
        return true;
    }

    /* ------------------------------------------------------------------------
       SETUP
       ------------------------------------------------------------------------ */
    function buildRegression() {
        const rand = mulberry32(2026);
        const n = 96;
        REG.xs = [];
        REG.ys = [];
        for (let k = 0; k < n; k++) {
            const x = 0.03 + 0.94 * rand();
            const y = 0.1 + 0.74 * x + gauss(rand) * 0.075;
            REG.xs.push(x);
            REG.ys.push(Math.max(0.02, Math.min(0.98, y)));
        }
        let mx = 0;
        let my = 0;
        for (let k = 0; k < n; k++) {
            mx += REG.xs[k];
            my += REG.ys[k];
        }
        mx /= n;
        my /= n;
        let sxy = 0;
        let sxx = 0;
        let syy = 0;
        for (let k = 0; k < n; k++) {
            sxy += (REG.xs[k] - mx) * (REG.ys[k] - my);
            sxx += (REG.xs[k] - mx) * (REG.xs[k] - mx);
            syy += (REG.ys[k] - my) * (REG.ys[k] - my);
        }
        REG.slope = sxy / sxx;
        REG.intercept = my - REG.slope * mx;
        REG.r2 = (sxy * sxy) / (sxx * syy);
    }

    function buildParticles() {
        N = lowPower ? 2600 : 5200;
        P = {
            cloudX: new Float32Array(N),
            cloudY: new Float32Array(N),
            point: new Uint16Array(N),
            axisU: new Float32Array(N),
            jitter: new Float32Array(N),
            jitter2: new Float32Array(N),
            axis: new Uint8Array(N),
            gType: new Uint8Array(N),
            gX: new Float32Array(N),
            gZ: new Float32Array(N),
            d1: new Float32Array(N),
            d2: new Float32Array(N),
            arc: new Float32Array(N),
            phase: new Float32Array(N),
            size: new Float32Array(N)
        };

        for (let i = 0; i < N; i++) {
            P.cloudX[i] = Math.max(-1.15, Math.min(1.15, gauss() * 0.46));
            P.cloudY[i] = Math.max(-1.15, Math.min(1.15, gauss() * 0.42));
            P.axis[i] = Math.random() < 0.14 ? 1 : 0;
            P.point[i] = i % REG.xs.length;
            P.axisU[i] = Math.random();
            P.jitter[i] = gauss();
            P.jitter2[i] = gauss();

            if (i % 2 === 0) {
                const line = Math.max(0, Math.min(NL - 1, Math.round(NL / 2 - 0.5 + gauss() * NL * 0.16)));
                P.gType[i] = 0;
                P.gX[i] = -W_HALF + SPACING * (line + 0.5);
                P.gZ[i] = Z_NEAR + Math.random() * Z_SPAN;
            } else {
                P.gType[i] = 1;
                P.gX[i] = Math.max(-W_HALF, Math.min(W_HALF, gauss() * 34));
                P.gZ[i] = Z_NEAR + Math.floor(Math.random() * NT) * SPACING;
            }

            const depth = (P.gZ[i] - Z_NEAR) / Z_SPAN;
            P.d1[i] = Math.random();
            P.d2[i] = 0.6 * (1 - depth) + 0.4 * Math.random();
            P.arc[i] = 50 + Math.random() * 170;
            P.phase[i] = Math.random() * Math.PI * 2;
            P.size[i] = Math.random() < 0.08 ? 2.2 : 1.4;
        }

        sxs = new Float32Array(N);
        sys = new Float32Array(N);
        buckets = [];
        for (let b = 0; b < 10; b++) buckets.push([]);
    }

    function spawnComet(c, initial) {
        c.line = Math.max(0, Math.min(NL - 1, Math.round(NL / 2 - 0.5 + gauss() * 4)));
        c.z = initial ? Z_NEAR + Math.random() * Z_SPAN : Z_FAR;
        c.speed = 26 + Math.random() * 40;
        c.len = 7 + Math.random() * 16;
        return c;
    }

    function readTheme() {
        const cs = getComputedStyle(document.body);
        accentRGB = toRGB(cs.getPropertyValue('--accent-primary')) || accentRGB;
        inkRGB = toRGB(cs.getPropertyValue('--text-primary')) || inkRGB;
        inkStyles = [];
        accentStyles = [];
        for (let b = 0; b < 5; b++) {
            const a = ((b + 1) / 5).toFixed(2);
            inkStyles.push(`rgba(${inkRGB[0]},${inkRGB[1]},${inkRGB[2]},${a})`);
            accentStyles.push(`rgba(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]},${a})`);
        }
    }

    function toRGB(value) {
        const v = (value || '').trim();
        if (!v || !ctx) return null;
        ctx.fillStyle = '#000';
        ctx.fillStyle = v;
        const norm = ctx.fillStyle;
        if (norm[0] === '#') {
            return [parseInt(norm.slice(1, 3), 16), parseInt(norm.slice(3, 5), 16), parseInt(norm.slice(5, 7), 16)];
        }
        const m = norm.match(/[\d.]+/g);
        return m ? [+m[0], +m[1], +m[2]] : null;
    }

    function currentLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'vi';
    }

    function readLabels() {
        const DATA = window.TPL.DATA;
        const lang = currentLang();
        const tr = (DATA && DATA.translations) || {};
        const pick = key => (tr[key] ? tr[key][lang] : '');
        labels.title = pick('intro.chart.title');
        labels.x = pick('intro.chart.x');
        labels.y = pick('intro.chart.y');
        labels.forecast = pick('intro.chart.forecast');
    }

    const phoneQuery = window.matchMedia('(max-width: 767px)');
    const touchQuery = window.matchMedia('(pointer: coarse)');

    // Phones (and rotations) change the layout class: rebuild the particle field for the new budget
    function syncDeviceClass() {
        const phone = phoneQuery.matches;
        const light = phone || touchQuery.matches;
        if (P && isMobile === phone && lowPower === light) return;
        isMobile = phone;
        lowPower = light;
        buildParticles();
        comets = [];
        for (let c = 0; c < (lowPower ? 8 : 16); c++) comets.push(spawnComet({}, true));
    }

    function resize() {
        if (!stage || !canvas) return;
        syncDeviceClass();
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 1.75);
        // Mobile browsers fire resize while the address bar slides; only touch the canvas when its size really changes
        if (w === vw && h === vh && ratio === dpr) return;
        vw = w;
        vh = h;
        dpr = ratio;
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        st.f = Math.max(vw, vh * 1.25) * 0.62;
        if (!running) renderFrame(performance.now());
    }

    /* Split headline text nodes into word spans so they can rise in one by one */
    function splitWords(el) {
        const words = [];
        (function walk(node) {
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === 3) {
                    const parts = child.textContent.split(/(\s+)/);
                    const frag = document.createDocumentFragment();
                    parts.forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) {
                            frag.appendChild(document.createTextNode(' '));
                        } else {
                            const span = document.createElement('span');
                            span.className = 'ri-w';
                            span.textContent = part;
                            frag.appendChild(span);
                            words.push(span);
                        }
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1 && child.classList.contains('ri-w')) {
                    words.push(child);
                } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                    walk(child);
                }
            });
        })(el);
        return words;
    }

    /* ------------------------------------------------------------------------
       PAGES: pipeline cards are rendered from TPL.DATA.systemPipeline
       ------------------------------------------------------------------------ */
    function renderPipelineFlow() {
        const host = section.querySelector('[data-ri-pipeline]');
        const DATA = window.TPL.DATA;
        if (!host || !DATA || !DATA.systemPipeline) return;
        const en = currentLang() === 'en';
        host.innerHTML = DATA.systemPipeline.map(st => `
            <li class="ri-flow__node" data-ri-item>
                <span class="ri-flow__dot"><span>${st.step}</span></span>
                <h3 class="ri-flow__title">${en ? st.titleEn : st.titleVi}</h3>
                <p class="ri-flow__text">${en ? st.descEn : st.descVi}</p>
            </li>`).join('');
    }

    // Every animated piece of a block in document order: whole items, single words of a split title,
    // or a line (data-ri-item="line") that draws itself across the whole entrance
    function collectSequence(block) {
        return Array.from(block.querySelectorAll('[data-ri-item], .ri-w')).map(el => ({
            el,
            word: el.classList.contains('ri-w'),
            line: el.getAttribute('data-ri-item') === 'line',
            last: -1
        }));
    }

    function refreshText() {
        renderPipelineFlow();
        blocks.forEach(b => {
            b.el.querySelectorAll('[data-ri-split]').forEach(splitWords);
            b.seq = collectSequence(b.el);
            b.lastIn = -1;
            b.lastOut = -1;
        });
        readLabels();
        if (!running && vw) renderFrame(performance.now());
    }

    /* ------------------------------------------------------------------------
       RENDER
       ------------------------------------------------------------------------ */
    function drawFloor(alpha, solid) {
        const bandPaths = BAND_ALPHA.map(() => new Path2D());
        const tSamples = lowPower ? 48 : T_SAMPLES;

        // Longitudinal lines (constant x), sampled denser near the camera
        for (let i = 0; i < NL; i++) {
            if (i === CENTER_LINES[0] || i === CENTER_LINES[1]) continue;
            addLongitudinal(bandPaths, -W_HALF + SPACING * (i + 0.5));
        }

        // Transverse lines (constant z) that run toward the camera
        for (let j = 0; j < NT; j++) {
            const z = wrapZ(Z_NEAR + j * SPACING - travel);
            const band = bandOf(z);
            if (band < 0) continue;
            const path = bandPaths[band];
            let started = false;
            for (let s = 0; s < tSamples; s++) {
                const u = (s / (tSamples - 1)) * 2 - 1;
                deform(Math.sign(u) * W_HALF * u * u, z);
                if (!project(dX, dY, z)) {
                    started = false;
                    continue;
                }
                if (started) path.lineTo(sx, sy);
                else path.moveTo(sx, sy);
                started = true;
            }
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = accentStyles[4];
        // Lines fade in beneath the particles (dashed strokes are far too slow to rasterize on phones)
        const lineA = 0.14 + 0.28 * solid;
        for (let b = 0; b < bandPaths.length; b++) {
            ctx.globalAlpha = alpha * BAND_ALPHA[b] * lineA;
            ctx.stroke(bandPaths[b]);
        }
        ctx.globalAlpha = 1;
    }

    function bandOf(z) {
        const r = z / Z_FAR;
        for (let b = 0; b < BAND_EDGES.length; b++) {
            if (r < BAND_EDGES[b]) return b;
        }
        return -1;
    }

    function addLongitudinal(bandPaths, x) {
        let drawnBand = -1;
        let px = 0;
        let py = 0;
        let has = false;
        const samples = lowPower ? 40 : L_SAMPLES;
        for (let k = 0; k < samples; k++) {
            const z = Z_NEAR + Z_SPAN * Math.pow(k / (samples - 1), 1.7);
            deform(x, z);
            if (!project(dX, dY, z)) {
                has = false;
                drawnBand = -1;
                continue;
            }
            const band = bandOf(z);
            if (has && band >= 0) {
                const path = bandPaths[band];
                if (band !== drawnBand) path.moveTo(px, py);
                path.lineTo(sx, sy);
                drawnBand = band;
            }
            px = sx;
            py = sy;
            has = true;
        }
    }

    function strokeLine3D(x, zFrom, zTo, samples) {
        ctx.beginPath();
        let started = false;
        for (let k = 0; k < samples; k++) {
            const z = zFrom + (zTo - zFrom) * Math.pow(k / (samples - 1), 1.7);
            deform(x, z);
            if (!project(dX, dY, z)) continue;
            if (started) ctx.lineTo(sx, sy);
            else ctx.moveTo(sx, sy);
            started = true;
        }
        ctx.stroke();
    }

    function drawHighlights(alpha) {
        if (alpha <= 0.01) return;
        const xs = [-SPACING * 0.5, SPACING * 0.5];
        ctx.strokeStyle = accentStyles[4];
        for (let pass = 0; pass < 2; pass++) {
            ctx.lineWidth = pass === 0 ? 6 : 1.6;
            ctx.globalAlpha = alpha * (pass === 0 ? 0.12 : 0.9);
            xs.forEach(x => strokeLine3D(x, Z_NEAR, Z_FAR * 0.92, 90));
        }

        ctx.globalAlpha = 1;
    }

    // Polar grid of the bent space: rings around the funnel and spokes that twist into the throat
    function drawWormhole(alpha) {
        if (alpha <= 0.01) return;
        const swirl = reduceMotion ? 0 : time * 0.12;
        const ringSteps = lowPower ? 72 : 128;
        const spokeCount = lowPower ? 28 : WELL_SPOKES;
        const radiusStride = lowPower ? 2 : 1;
        const ringBands = [new Path2D(), new Path2D(), new Path2D()];
        WELL_RINGS.forEach(r => {
            const y = -st.well * wellDepth(r);
            const path = ringBands[r < 6 ? 0 : r < 40 ? 1 : 2];
            let started = false;
            for (let s = 0; s <= ringSteps; s++) {
                const th = (s / ringSteps) * Math.PI * 2;
                if (!project(r * Math.cos(th), y, WELL_Z + r * Math.sin(th))) {
                    started = false;
                    continue;
                }
                if (started) path.lineTo(sx, sy);
                else path.moveTo(sx, sy);
                started = true;
            }
        });

        const spokes = new Path2D();
        for (let i = 0; i < spokeCount; i++) {
            const base = (i / spokeCount) * Math.PI * 2 + swirl;
            let started = false;
            for (let k = 0; k < SPOKE_RADII.length; k += radiusStride) {
                const r = SPOKE_RADII[k];
                const th = base + (st.well * 2.2) / (r - WELL_R + 1.2);
                if (!project(r * Math.cos(th), -st.well * wellDepth(r), WELL_Z + r * Math.sin(th))) {
                    started = false;
                    continue;
                }
                if (started) spokes.lineTo(sx, sy);
                else spokes.moveTo(sx, sy);
                started = true;
            }
        }

        ctx.strokeStyle = accentStyles[4];
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha * 0.32;
        ctx.stroke(spokes);
        const ringAlpha = [0.95, 0.55, 0.22];
        ringBands.forEach((path, b) => {
            ctx.lineWidth = b === 0 ? 1.4 : 1;
            ctx.globalAlpha = alpha * ringAlpha[b];
            ctx.stroke(path);
        });
        // Soft glow around the throat
        ctx.lineWidth = 6;
        ctx.globalAlpha = alpha * 0.12;
        ctx.stroke(ringBands[0]);
        ctx.globalAlpha = 1;
    }

    function drawComets(alpha, dt) {
        if (alpha <= 0.01) return;
        ctx.lineCap = 'round';
        for (let c = 0; c < comets.length; c++) {
            const cm = comets[c];
            if (!reduceMotion) {
                cm.z -= cm.speed * dt * (1 + boost * 0.8);
                if (cm.z < Z_NEAR) spawnComet(cm, false);
            }
            const x = -W_HALF + SPACING * (cm.line + 0.5);
            deform(x, cm.z);
            if (!project(dX, dY, cm.z)) continue;
            const hx = sx;
            const hy = sy;
            const tz = Math.min(Z_FAR, cm.z + cm.len);
            deform(x, tz);
            if (!project(dX, dY, tz)) continue;
            const grad = ctx.createLinearGradient(hx, hy, sx, sy);
            grad.addColorStop(0, accentStyles[4]);
            grad.addColorStop(1, `rgba(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]},0)`);
            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha * fog(cm.z);
            ctx.lineWidth = Math.max(1, Math.min(3, 26 / cm.z));
            strokeLine3D(x, cm.z, tz, 8);
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'butt';
    }

    function chartBox() {
        if (isMobile) {
            return { x: vw * 0.14, y: vh * 0.17, w: vw * 0.74, h: vh * 0.3 };
        }
        return { x: vw * 0.08, y: vh * 0.18, w: vw * 0.42, h: vh * 0.5 };
    }

    const chartX = (box, x) => box.x + box.w * x;
    const chartY = (box, y) => box.y + box.h * (1 - y);

    function drawParticles() {
        const c1 = range(p, T.scatter);
        const c2 = range(p, T.toGrid);
        const gridDotA = 1 - 0.5 * range(p, T.solid);
        const box = chartBox();
        const cx0 = vw * 0.5;
        const cy0 = vh * 0.5;

        for (let b = 0; b < 10; b++) buckets[b].length = 0;

        for (let i = 0; i < N; i++) {
            const ph = P.phase[i];
            const spread = 0.55 + 0.45 * cloudIn;
            let x = cx0 + P.cloudX[i] * vw * 0.5 * spread + (reduceMotion ? 0 : Math.sin(time * 0.22 + ph) * 8);
            let y = cy0 + P.cloudY[i] * vh * 0.5 * spread + (reduceMotion ? 0 : Math.cos(time * 0.18 + ph * 1.3) * 6);
            let a = 0.5 * cloudIn;
            let accent = false;

            if (c1 > 0) {
                const k1 = easeInOut(clamp01((c1 - P.d1[i] * 0.45) / 0.55));
                if (k1 > 0) {
                    let tx;
                    let ty;
                    if (P.axis[i]) {
                        if (i % 3 === 0) {
                            tx = box.x - 14;
                            ty = box.y + box.h * P.axisU[i];
                        } else {
                            tx = box.x - 14 + (box.w + 14) * P.axisU[i];
                            ty = box.y + box.h + 14;
                        }
                    } else {
                        // Each data point is a tight cluster of particles
                        const k = P.point[i];
                        const spread = 1.2 + 60 * (1 - k1) * (1 - k1);
                        tx = chartX(box, REG.xs[k]) + P.jitter[i] * spread;
                        ty = chartY(box, REG.ys[k]) + P.jitter2[i] * spread;
                    }
                    x = lerp(x, tx, k1);
                    y = lerp(y, ty, k1);
                    a = lerp(a, P.axis[i] ? 0.45 : 0.9, k1);
                }
            }

            if (c2 > 0) {
                const k2 = easeInOut(clamp01((c2 - P.d2[i] * 0.5) / 0.5));
                if (k2 > 0) {
                    const z = wrapZ(P.gZ[i] - travel);
                    deform(P.gX[i], z);
                    if (project(dX, dY, z)) {
                        x = lerp(x, sx, k2);
                        y = lerp(y, sy, k2) - Math.sin(k2 * Math.PI) * P.arc[i];
                        a = lerp(a, gridDotA * fog(z) * (1 - st.polar), k2);
                    } else {
                        a *= 1 - k2;
                    }
                    if (k2 > 0.35) accent = true;
                }
            }

            if (a < 0.04 || x < -4 || x > vw + 4 || y < -4 || y > vh + 4) continue;
            sxs[i] = x;
            sys[i] = y;
            const bucket = Math.min(4, Math.floor(a * 5));
            buckets[(accent ? 5 : 0) + bucket].push(i);
        }

        for (let b = 0; b < 10; b++) {
            const list = buckets[b];
            if (!list.length) continue;
            ctx.fillStyle = b < 5 ? inkStyles[b] : accentStyles[b - 5];
            for (let n = 0; n < list.length; n++) {
                const i = list[n];
                const s = P.size[i];
                ctx.fillRect(sxs[i] - s * 0.5, sys[i] - s * 0.5, s, s);
            }
        }
    }

    function drawRegressionOverlay() {
        const a = smooth(range(p, T.chartIn)) * (1 - range(p, T.chartOut));
        if (a <= 0.01) return;
        const box = chartBox();
        const ink = `rgba(${inkRGB[0]},${inkRGB[1]},${inkRGB[2]},`;
        const acc = `rgba(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]},`;
        const fitY = x => chartY(box, REG.intercept + REG.slope * x);

        ctx.save();
        ctx.globalAlpha = a;

        // Residuals: each point's vertical distance to the fitted line
        const res = smooth(range(p, T.residual));
        if (res > 0) {
            ctx.strokeStyle = acc + (0.28 * res).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let k = 0; k < REG.xs.length; k++) {
                const px = chartX(box, REG.xs[k]);
                const py = chartY(box, REG.ys[k]);
                const fy = fitY(REG.xs[k]);
                ctx.moveTo(px, py);
                ctx.lineTo(px, lerp(py, fy, res));
            }
            ctx.stroke();
        }

        // Least-squares line, drawn left → right, then a dashed forecast beyond the data
        const fit = easeInOut(range(p, T.fit));
        if (fit > 0) {
            const xEnd = fit;
            ctx.strokeStyle = acc + '0.95)';
            ctx.lineWidth = 2;
            ctx.shadowColor = acc + '0.6)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(chartX(box, 0), fitY(0));
            ctx.lineTo(chartX(box, xEnd), fitY(xEnd));
            ctx.stroke();
            ctx.shadowBlur = 0;

            const fc = smooth(clamp01((fit - 0.8) / 0.2)) * res;
            if (fc > 0) {
                const x2 = 1 + 0.16 * fc;
                ctx.setLineDash([3, 5]);
                ctx.lineWidth = 1.4;
                ctx.strokeStyle = acc + '0.7)';
                ctx.beginPath();
                ctx.moveTo(chartX(box, 1), fitY(1));
                ctx.lineTo(chartX(box, x2), fitY(x2));
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';
        ctx.font = '500 10.5px "JetBrains Mono", monospace';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = ink + '0.62)';
        let title = labels.title;
        if (ctx.measureText(title).width > box.w) title = title.split(' · ')[0];
        ctx.fillText(title, box.x, box.y - 30);

        ctx.fillStyle = ink + '0.38)';
        ctx.fillText(labels.y, box.x - 14, box.y - 10);
        const xw = ctx.measureText(labels.x).width;
        ctx.fillText(labels.x, box.x + box.w - xw, box.y + box.h + 42);

        if (fit > 0.95) {
            const k = smooth(clamp01((res - 0.2) / 0.8));
            if (k > 0) {
                ctx.globalAlpha = a * k;
                if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
                ctx.font = '600 12px "JetBrains Mono", monospace';
                ctx.fillStyle = acc + '1)';
                const sign = REG.intercept < 0 ? '−' : '+';
                const eq = `ŷ = ${REG.slope.toFixed(2)}x ${sign} ${Math.abs(REG.intercept).toFixed(2)}`;
                // Bottom-right of the plot stays empty because the trend rises away from it
                const ex = box.x + box.w - Math.max(ctx.measureText(eq).width, 150);
                const ey = box.y + box.h - 34;
                ctx.fillText(eq, ex, ey);
                ctx.font = '500 11px "JetBrains Mono", monospace';
                ctx.fillStyle = ink + '0.7)';
                ctx.fillText(`R² = ${REG.r2.toFixed(2)} · n = ${REG.xs.length}`, ex, ey + 18);
                ctx.fillStyle = acc + '0.75)';
                const fx = chartX(box, 1.02);
                ctx.fillText(labels.forecast, Math.min(vw - 16 - ctx.measureText(labels.forecast).width, fx), fitY(1.16) - 12);
            }
        }
        ctx.restore();
    }

    // Soft entrance: rise, un-blur and settle; words follow the same curve with a shorter travel
    const WORD_STEP = 0.035;
    const WORD_DUR = 0.35;
    const ITEM_STEP = 0.1;
    const ITEM_DUR = 0.5;

    function updateBlocks() {
        let pageVis = 0;
        for (let k = 0; k < blocks.length; k++) {
            const b = blocks[k];
            const inK = b.from < 0 ? openIn : range(p, [b.from, b.from + 0.045]);
            const outK = range(p, [b.to - 0.03, b.to]);
            const vis = inK * (1 - outK);
            if (b.isPage) pageVis = Math.max(pageVis, smooth(range(p, [b.from - 0.01, b.from + 0.02])) * (1 - smooth(outK)));
            if (inK === b.lastIn && outK === b.lastOut) continue;
            b.lastIn = inK;
            b.lastOut = outK;

            b.el.style.visibility = inK > 0 && outK < 1 ? 'visible' : 'hidden';
            b.el.style.pointerEvents = vis > 0.6 ? 'auto' : 'none';
            b.el.style.opacity = (1 - smooth(outK)).toFixed(3);
            const exit = smooth(outK);
            b.el.style.transform = `translate3d(0, ${(-exit * 48).toFixed(1)}px, 0) scale(${(1 - exit * 0.03).toFixed(4)})`;
            b.el.style.filter = exit > 0.01 && !lowPower ? `blur(${(exit * 6).toFixed(2)}px)` : '';

            // Lay the sequence out on a timeline, then play it with inK
            let t = 0;
            const starts = [];
            for (let i = 0; i < b.seq.length; i++) {
                starts.push(t);
                if (!b.seq[i].line) t += b.seq[i].word ? WORD_STEP : ITEM_STEP;
            }
            const last = b.seq.length ? b.seq[b.seq.length - 1] : null;
            const total = Math.max(0.001, t + (last && last.word ? WORD_DUR : ITEM_DUR));

            for (let i = 0; i < b.seq.length; i++) {
                const it = b.seq[i];
                if (it.line) {
                    const lk = reduceMotion ? (inK > 0 ? 1 : 0) : smooth(clamp01(inK * 1.15));
                    if (Math.abs(lk - it.last) < 0.001) continue;
                    it.last = lk;
                    it.el.style.opacity = lk > 0 ? '1' : '0';
                    it.el.style.setProperty('--k', lk.toFixed(4));
                    continue;
                }
                const dur = it.word ? WORD_DUR : ITEM_DUR;
                const raw = reduceMotion ? (inK > 0 ? 1 : 0) : clamp01((inK * total - starts[i]) / dur);
                const k = 1 - Math.pow(1 - raw, 3);
                if (Math.abs(k - it.last) < 0.001) continue;
                it.last = k;
                const css = it.el.style;
                css.opacity = k.toFixed(3);
                if (it.word) {
                    css.transform = `translate3d(0, ${((1 - k) * 0.55).toFixed(3)}em, 0)`;
                } else {
                    css.transform = k >= 1 ? 'none' : `translate3d(0, ${((1 - k) * 46).toFixed(1)}px, 0) scale(${(0.965 + 0.035 * k).toFixed(4)})`;
                    css.filter = k >= 1 || lowPower ? '' : `blur(${((1 - k) * 9).toFixed(2)}px)`;
                }
            }
        }
        // Darken the road behind content pages so text stays readable
        scrimLevel += (pageVis - scrimLevel) * 0.2;
        if (scrim) scrim.style.opacity = scrimLevel.toFixed(3);
    }

    function renderFrame(now) {
        const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
        lastNow = now;
        if (!reduceMotion) time += dt;
        if (document.body.classList.contains('is-loaded')) openClock += dt;
        cloudIn = reduceMotion ? 1 : smooth(clamp01(openClock / 3.2));
        openIn = reduceMotion ? 1 : clamp01((openClock - 0.6) / 2.6);

        const rect = section.getBoundingClientRect();
        const span = Math.max(1, rect.height - vh);
        const target = clamp01(-rect.top / span);
        const velocity = Math.abs(target - lastTarget) / Math.max(dt, 0.001);
        lastTarget = target;
        // Follow the scroll position lazily so every scene glides instead of snapping
        p = reduceMotion ? target : p + (target - p) * (1 - Math.exp(-dt * 2.4));
        if (Math.abs(target - p) < 0.0002) p = target;

        if (!reduceMotion) {
            boost += (Math.min(velocity * 40, 5) - boost) * (1 - Math.exp(-dt * 3));
            travel += dt * (2.2 + boost * 6);
            camX += (mouseX * 1.4 - camX) * (1 - Math.exp(-dt * 2.5));
        }
        // Scrolling also pushes the floor forward
        const travelNow = travel + p * DRIVE;

        // Space bends more and more behind the last pages, then the camera lifts, tilts and dives through
        st.well = easeInOut(range(p, T.bend));
        st.polar = smooth(range(p, T.polar));
        const gridA = smooth(range(p, T.lines));
        st.hills = gridA * (1 - st.well) * 0.5;
        const rise = easeInOut(range(p, T.rise));
        const plunge = range(p, T.plunge);
        st.camH = lerp(lerp(26, 6, easeInOut(range(p, T.dive))), 30, rise) - 159 * Math.pow(plunge, 2.6);
        st.camZ = WELL_Z * (1 - Math.pow(1 - plunge, 3));
        const pitch = lerp(0, 0.66, rise) + (1.52 - 0.66) * smooth(plunge);
        st.cosP = Math.cos(pitch);
        st.sinP = Math.sin(pitch);
        st.horizon = lerp(isMobile ? 0.6 : 0.56, 0.5, rise);

        const savedTravel = travel;
        travel = travelNow;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);

        if (gridA > 0.01) {
            const flatA = gridA * (1 - st.polar);
            if (flatA > 0.01) {
                drawFloor(flatA, smooth(range(p, T.solid)));
                drawHighlights(flatA * 0.35);
                drawComets(flatA, dt);
            }
            drawWormhole(gridA * st.polar);
        }
        drawParticles();
        drawRegressionOverlay();

        travel = savedTravel;

        updateBlocks();

        const fade = range(p, T.fade);
        stage.style.opacity = (1 - fade).toFixed(3);
        document.body.classList.toggle('is-in-intro', target < 0.985 && rect.bottom > 0);
    }

    function loop(now) {
        if (!running) return;
        renderFrame(now);
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (running) return;
        running = true;
        lastNow = 0;
        rafId = requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        document.body.classList.remove('is-in-intro');
    }

    function init() {
        section = document.querySelector('.road-intro');
        if (!section) return;
        stage = section.querySelector('.road-intro__stage');
        canvas = section.querySelector('.road-intro__canvas');
        scrim = section.querySelector('.road-intro__scrim');
        if (!stage || !canvas) return;
        ctx = canvas.getContext('2d');

        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        blocks = Array.from(section.querySelectorAll('[data-ri-from]')).map(el => ({
            el,
            from: parseFloat(el.getAttribute('data-ri-from')),
            to: parseFloat(el.getAttribute('data-ri-to')),
            isPage: el.classList.contains('ri-page'),
            seq: [],
            lastIn: -1,
            lastOut: -1
        }));

        buildRegression();
        syncDeviceClass();
        readTheme();
        refreshText();
        resize();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('pointermove', e => {
            mouseX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
        }, { passive: true });

        new MutationObserver(() => {
            readTheme();
            if (!running) renderFrame(performance.now());
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                entries.forEach(entry => (entry.isIntersecting ? start() : stop()));
            }).observe(section);
        } else {
            start();
        }
    }

    return {
        init,
        refreshText
    };
})();
