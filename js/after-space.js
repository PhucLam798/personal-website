/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 08: THE OTHER SIDE OF THE WORMHOLE (FIXED CANVAS BEHIND THE CHAPTERS)
 * - Exit: the camera leaves the throat upside down and the world rolls upright
 * - An inverted corridor: mirrored floor and ceiling grids with a travelling wave
 * - Before each chapter the camera flies through a hexagonal gate with its own wireframe body
 *   (icosahedron, rotating tesseract, double helix, gold trophy, torus)
 * - Scroll drives the camera; fast scrolling stretches the stars into streaks
 * - Each gate takes its chapter's accent colour, and the corridor fades between them
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.AfterSpace = (function () {
    const K = 0.05;          // world units per scrolled pixel
    const HALF_H = 7;        // floor at -HALF_H, ceiling at +HALF_H
    const SPACING = 4;
    const W_HALF = 64;
    const Z_FAR = 150;
    const GATE_R = 6.2;
    const SECTIONS = ['publications', 'projects', 'activities', 'awards', 'contact'];
    const SHAPES = ['ico', 'tesseract', 'helix', 'trophy', 'torus'];

    const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
    const smooth = t => t * t * (3 - 2 * t);
    const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const fog = dz => 1 - smooth(clamp01((dz - Z_FAR * 0.45) / (Z_FAR * 0.55)));

    let canvas = null;
    let ctx = null;
    let vw = 0;
    let vh = 0;
    let dpr = 1;
    let f = 600;
    let lowPower = false;
    let reduceMotion = false;
    let running = false;
    let rafId = null;
    let lastNow = 0;
    let time = 0;

    let startY = 0;
    let camZ = 0;
    let lastTarget = 0;
    let speed = 0;
    let roll = 0;
    let cosR = 1;
    let sinR = 0;
    let camX = 0;
    let mouseX = 0;

    let gates = [];
    let title = null;
    let titleName = null;
    let titleIdx = -1;
    let titleKey = '';
    let gaps = [];      // [top, bottom] in page pixels where nothing but the corridor is on screen
    let rollLen = 1;    // pixels of scroll over which the exit roll rights itself
    let bodies = [];
    let stars = [];

    let accent = '0,229,255';
    let ink = '244,241,234';
    let chapterRGB = [];   // [r, g, b] per chapter, read from each section's --accent-primary
    let mixRGB = [0, 229, 255];
    let corridor = '0,229,255';

    let sx = 0;
    let sy = 0;
    let objAlpha = 1;
    // 0 while a chapter fills the screen (calm background for reading), 1 in the fly-through gaps
    let gapMix = 1;
    let waveAmp = 1;

    function project(x, y, z) {
        const dz = z - camZ;
        if (dz < 0.25) return false;
        const px = (f * (x - camX)) / dz;
        const py = (-f * y) / dz;
        sx = vw * 0.5 + px * cosR - py * sinR;
        sy = vh * 0.5 + px * sinR + py * cosR;
        return true;
    }

    /* ------------------------------------------------------------------------
       WIREFRAME BODIES (unit sized; tesseract keeps a 4th coordinate)
       ------------------------------------------------------------------------ */
    function icosahedron() {
        const t = (1 + Math.sqrt(5)) / 2;
        const raw = [
            [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
            [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
            [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
        ];
        const len = Math.hypot(1, t);
        const verts = raw.map(v => v.map(c => c / len));
        const edges = [];
        for (let i = 0; i < 12; i++) {
            for (let j = i + 1; j < 12; j++) {
                const d = Math.hypot(raw[i][0] - raw[j][0], raw[i][1] - raw[j][1], raw[i][2] - raw[j][2]);
                if (Math.abs(d - 2) < 0.01) edges.push([i, j]);
            }
        }
        // A smaller counter-rotating copy inside: the "latent" core
        const n = verts.length;
        verts.push(...verts.map(v => v.map(c => c * 0.42)));
        edges.push(...edges.map(([a, b]) => [a + n, b + n]));
        return { verts, edges, inner: n, scale: 3.4 };
    }

    function tesseract() {
        const verts = [];
        for (let i = 0; i < 16; i++) {
            verts.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
        }
        const edges = [];
        for (let i = 0; i < 16; i++) {
            for (let b = 0; b < 4; b++) {
                const j = i ^ (1 << b);
                if (j > i) edges.push([i, j]);
            }
        }
        return { verts, edges, fourD: true, scale: 2.6 };
    }

    function helix() {
        const verts = [];
        const edges = [];
        const N = 34;
        for (let i = 0; i < N; i++) {
            const a = i * 0.42;
            const y = (i / (N - 1) - 0.5) * 2.6;
            verts.push([Math.cos(a) * 0.55, y, Math.sin(a) * 0.55]);
            verts.push([Math.cos(a + Math.PI) * 0.55, y, Math.sin(a + Math.PI) * 0.55]);
            if (i > 0) {
                edges.push([2 * i - 2, 2 * i]);
                edges.push([2 * i - 1, 2 * i + 1]);
            }
            if (i % 3 === 0) edges.push([2 * i, 2 * i + 1]);
        }
        return { verts, edges, scale: 3.2 };
    }

    // Trophy: a lathed cup (base, stem, bowl) whose meridians twist both ways so they interlace,
    // plus two looping handles. It stays upright and only spins around its vertical axis.
    function trophy() {
        const profile = [
            [0.62, -1.15], [0.62, -1.02], [0.34, -0.96], [0.14, -0.82], [0.1, -0.55],
            [0.16, -0.36], [0.34, -0.22], [0.55, -0.02], [0.7, 0.22], [0.78, 0.48], [0.8, 0.72], [0.84, 0.8]
        ];
        const M = lowPower ? 14 : 20;
        const verts = [];
        const edges = [];
        const ring = (r, y, twist) => {
            const base = verts.length;
            for (let j = 0; j < M; j++) {
                const th = (j / M) * Math.PI * 2 + twist;
                verts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
            }
            return base;
        };
        // Rings at each profile level
        const rings = profile.map(([r, y], k) => {
            const id = ring(r, y, 0);
            if (k !== 3 && k !== 4 && k !== 5) {
                for (let j = 0; j < M; j++) edges.push([id + j, id + ((j + 1) % M)]);
            }
            return id;
        });
        // Two families of diagonals between consecutive rings: one twists left, the other right
        for (let k = 0; k < rings.length - 1; k++) {
            for (let j = 0; j < M; j++) {
                edges.push([rings[k] + j, rings[k + 1] + ((j + 1) % M)]);
                edges.push([rings[k] + j, rings[k + 1] + ((j - 1 + M) % M)]);
            }
        }
        // Handles: loops on both sides of the bowl
        [-1, 1].forEach(side => {
            const start = verts.length;
            const N = 12;
            for (let i = 0; i <= N; i++) {
                const a = -Math.PI * 0.5 + (i / N) * Math.PI;
                verts.push([side * (0.74 + Math.cos(a) * 0.36), 0.36 + Math.sin(a) * 0.34, 0]);
                if (i) edges.push([start + i - 1, start + i]);
            }
        });
        return { verts, edges, upright: true, scale: 3.3 };
    }

    function torus() {
        const verts = [];
        const edges = [];
        const U = lowPower ? 16 : 22;
        const V = 9;
        const R = 0.78;
        const r = 0.3;
        for (let i = 0; i < U; i++) {
            const u = (i / U) * Math.PI * 2;
            for (let j = 0; j < V; j++) {
                const v = (j / V) * Math.PI * 2;
                verts.push([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]);
                const id = i * V + j;
                edges.push([id, i * V + ((j + 1) % V)]);
                edges.push([id, ((i + 1) % U) * V + j]);
            }
        }
        return { verts, edges, scale: 3.6 };
    }

    const SHAPE_BUILDERS = { ico: icosahedron, tesseract, helix, trophy, torus };

    /* ------------------------------------------------------------------------
       LAYOUT: map each chapter's scroll position to a depth along the corridor
       ------------------------------------------------------------------------ */
    function measure() {
        const intro = document.querySelector('.road-intro');
        const y0 = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (intro) {
            const top = intro.getBoundingClientRect().top + y0;
            const stage = intro.querySelector('.road-intro__stage');
            const span = intro.offsetHeight - (stage ? stage.clientHeight : vh);
            // The corridor begins exactly as the intro's last fade starts
            startY = top + span * 0.965;
        }
        const DATA = window.TPL.DATA;
        const en = document.documentElement.lang === 'en';
        gates = [];
        gaps = [];
        SECTIONS.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            const top = el.getBoundingClientRect().top + y0;
            const prev = el.previousElementSibling;
            const gapTop = i === 0 ? startY : (prev && prev.classList.contains('warp-gap') ? prev.getBoundingClientRect().top + y0 : top);
            gaps.push([gapTop, top]);
            // The camera crosses the gate when the chapter's top edge is 85% down the screen
            const passZ = (top - vh * 0.85 - startY) * K;
            const ch = DATA && DATA.chapters ? DATA.chapters.find(c => c.id === id) : null;
            gates.push({
                z: passZ,
                rot: i * 0.35,
                // Same text as the chapter's own eyebrow, e.g. "01 · Nghiên cứu & công bố"
                name: (() => {
                    const eb = el.querySelector('.eyebrow [data-i18n]');
                    return eb ? eb.textContent.trim() : `${String(i + 1).padStart(2, '0')} · ${ch ? (en ? ch.labelEn : ch.labelVi) : ''}`;
                })(),
                depth: Math.max(1, (top - gapTop) * K)
            });
            if (!bodies[i] || bodies[i].kind !== SHAPES[i]) {
                bodies[i] = Object.assign({ kind: SHAPES[i] }, SHAPE_BUILDERS[SHAPES[i]]());
            }
            // Floats inside the gate, a little behind it, so the camera flies through it right after
            bodies[i].z = passZ + 5;
        });
        rollLen = gates.length ? Math.max(vh * 0.5, (gates[0].z / K) * 0.7) : vh;
    }

    function buildStars() {
        const n = lowPower ? 140 : 280;
        stars = [];
        for (let i = 0; i < n; i++) {
            stars.push({
                x: (Math.random() * 2 - 1) * 34,
                y: (Math.random() * 2 - 1) * (HALF_H - 0.6),
                z: Math.random() * Z_FAR
            });
        }
    }

    function readTheme() {
        const cs = getComputedStyle(document.body);
        const rgb = v => {
            ctx.fillStyle = '#000';
            ctx.fillStyle = (v || '').trim() || '#000';
            const s = ctx.fillStyle;
            if (s[0] === '#') return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)).join(',');
            const m = s.match(/[\d.]+/g);
            return m ? m.slice(0, 3).join(',') : '0,0,0';
        };
        accent = rgb(cs.getPropertyValue('--accent-primary'));
        ink = rgb(cs.getPropertyValue('--text-primary'));
        chapterRGB = SECTIONS.map(id => {
            const el = document.getElementById(id);
            const v = el ? getComputedStyle(el).getPropertyValue('--accent-primary') : '';
            return rgb(v || cs.getPropertyValue('--accent-primary')).split(',').map(Number);
        });
        if (!mixSeeded && chapterRGB[0]) {
            mixRGB = chapterRGB[0].slice();
            mixSeeded = true;
        }
    }
    let mixSeeded = false;

    const colorOf = i => (chapterRGB[i] ? chapterRGB[i].join(',') : accent);

    function resize() {
        lowPower = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
        vw = window.innerWidth;
        vh = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 1.75);
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        f = Math.max(vw, vh * 1.25) * 0.55;
        measure();
    }

    /* ------------------------------------------------------------------------
       DRAWING
       ------------------------------------------------------------------------ */
    function wave(x, z) {
        return 0.8 * waveAmp * Math.sin(z * 0.07 - time * 0.8 + x * 0.045);
    }

    function bandOf(dz) {
        return dz < 45 ? 0 : dz < 95 ? 1 : dz < Z_FAR ? 2 : -1;
    }

    // One grid plane (floor or the mirrored ceiling), batched into three fog bands
    function drawPlane(side, rgb, alpha) {
        const bands = [new Path2D(), new Path2D(), new Path2D()];
        const step = lowPower ? 6 : SPACING;
        const LS = lowPower ? 22 : 34;
        const TS = lowPower ? 26 : 40;
        const zNear = camZ + 0.3;
        const yOf = (x, z) => side * (HALF_H + wave(x, z));

        for (let x = -W_HALF; x <= W_HALF; x += step) {
            let drawn = -1;
            let has = false;
            let px = 0;
            let py = 0;
            for (let k = 0; k < LS; k++) {
                const z = zNear + Z_FAR * Math.pow(k / (LS - 1), 1.6);
                if (!project(x, yOf(x, z), z)) {
                    has = false;
                    drawn = -1;
                    continue;
                }
                const band = bandOf(z - camZ);
                if (has && band >= 0) {
                    if (band !== drawn) bands[band].moveTo(px, py);
                    bands[band].lineTo(sx, sy);
                    drawn = band;
                }
                px = sx;
                py = sy;
                has = true;
            }
        }
        for (let z = Math.ceil(zNear / step) * step; z < camZ + Z_FAR; z += step) {
            const band = bandOf(z - camZ);
            if (band < 0) continue;
            let started = false;
            for (let s = 0; s < TS; s++) {
                const u = (s / (TS - 1)) * 2 - 1;
                const x = Math.sign(u) * W_HALF * u * u;
                if (!project(x, yOf(x, z), z)) {
                    started = false;
                    continue;
                }
                if (started) bands[band].lineTo(sx, sy);
                else bands[band].moveTo(sx, sy);
                started = true;
            }
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgb(${rgb})`;
        [1, 0.5, 0.18].forEach((a, b) => {
            ctx.globalAlpha = alpha * a;
            ctx.stroke(bands[b]);
        });
        ctx.globalAlpha = 1;
    }

    // Throat rings flaring open around the camera right after the exit
    function drawExitRings(alpha) {
        if (alpha <= 0.01) return;
        ctx.strokeStyle = `rgb(${accent})`;
        for (let i = 0; i < 16; i++) {
            const z = 0.6 + i * 1.7;
            const r = 3 + 0.16 * i * i;
            const dz = z - camZ;
            if (dz < 0.3 || dz > Z_FAR) continue;
            ctx.beginPath();
            let started = false;
            for (let s = 0; s <= 64; s++) {
                const th = (s / 64) * Math.PI * 2 + time * 0.2;
                if (!project(Math.cos(th) * r, Math.sin(th) * r, z)) continue;
                if (started) ctx.lineTo(sx, sy);
                else ctx.moveTo(sx, sy);
                started = true;
            }
            ctx.lineWidth = dz < 6 ? 2 : 1.2;
            ctx.globalAlpha = alpha * fog(dz) * (i < 4 ? 1 : 0.75);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function drawStars() {
        const len = Math.max(0.35, Math.min(16, speed * 0.09));
        const path = new Path2D();
        for (let i = 0; i < stars.length; i++) {
            const st = stars[i];
            const z = camZ + 0.5 + ((((st.z - camZ) % Z_FAR) + Z_FAR) % Z_FAR);
            if (!project(st.x, st.y, z)) continue;
            const hx = sx;
            const hy = sy;
            if (!project(st.x, st.y, z + len)) continue;
            path.moveTo(hx, hy);
            path.lineTo(sx, sy);
        }
        ctx.strokeStyle = `rgba(${ink},0.55)`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.stroke(path);
        ctx.lineCap = 'butt';
    }

    function drawGates() {
        ctx.textBaseline = 'alphabetic';
        for (let g = gates.length - 1; g >= 0; g--) {
            const gate = gates[g];
            const dz = gate.z - camZ;
            if (dz < 0.3 || dz > Z_FAR) continue;
            const a = objAlpha * fog(dz) * smooth(clamp01(dz / 4));
            const near = 1 - smooth(clamp01((dz - 2) / 16));
            const spin = gate.rot + time * 0.12;

            const hex = (r, rot) => {
                ctx.beginPath();
                for (let k = 0; k <= 6; k++) {
                    const th = rot + (k / 6) * Math.PI * 2;
                    if (!project(Math.cos(th) * r, Math.sin(th) * r, gate.z)) return false;
                    if (k) ctx.lineTo(sx, sy);
                    else ctx.moveTo(sx, sy);
                }
                return true;
            };

            ctx.strokeStyle = `rgb(${colorOf(g)})`;
            if (hex(GATE_R, spin)) {
                ctx.lineWidth = 1.4 + near * 2.2;
                ctx.globalAlpha = a * (0.55 + 0.45 * near);
                ctx.stroke();
                if (near > 0.05) {
                    ctx.lineWidth = 8;
                    ctx.globalAlpha = a * near * 0.12;
                    ctx.stroke();
                }
            }
            if (hex(GATE_R * 0.64, -spin * 1.6)) {
                ctx.lineWidth = 1;
                ctx.globalAlpha = a * 0.45;
                ctx.stroke();
            }
            // Struts from the gate corners into the floor and the ceiling
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
                const th = spin + (k / 6) * Math.PI * 2;
                const x = Math.cos(th) * GATE_R;
                const y = Math.sin(th) * GATE_R;
                if (!project(x, y, gate.z)) continue;
                const ax = sx;
                const ay = sy;
                if (!project(x, y >= 0 ? HALF_H : -HALF_H, gate.z)) continue;
                ctx.moveTo(ax, ay);
                ctx.lineTo(sx, sy);
            }
            ctx.lineWidth = 1;
            ctx.globalAlpha = a * 0.25;
            ctx.stroke();

        }
        ctx.globalAlpha = 1;
    }

    function drawBodies() {
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            if (!b || b.z === undefined) continue;
            const dz = b.z - camZ;
            if (dz < 0.8 || dz > Z_FAR) continue;
            // Only the body of the next gate shows; ones further down the corridor stay hidden
            const a = objAlpha * fog(dz) * smooth(clamp01((dz - 0.8) / 5)) * (1 - smooth(clamp01((dz - 40) / 22)));
            const ay = time * 0.45 + i + camZ * 0.015;
            // Upright bodies (the trophy) keep a slight fixed tilt instead of tumbling
            const ax = b.upright ? 0.28 : time * 0.27 + i * 0.7;
            const cy = Math.cos(ay);
            const syn = Math.sin(ay);
            const cx = Math.cos(ax);
            const sxn = Math.sin(ax);
            const ox = 0;
            const oy = Math.sin(time * 0.6 + i) * 0.35;

            const pts = b.verts.map((v, idx) => {
                let x = v[0];
                let y = v[1];
                let z = v[2];
                if (b.fourD) {
                    // Rotate the hypercube through the 4th dimension, then project it into 3D
                    const w0 = v[3];
                    const t4 = time * 0.5;
                    const c4 = Math.cos(t4);
                    const s4 = Math.sin(t4);
                    const xw = x * c4 - w0 * s4;
                    const ww = x * s4 + w0 * c4;
                    const k = 1 / (2.4 - ww);
                    x = xw * k * 2.2;
                    y *= k * 2.2;
                    z *= k * 2.2;
                }
                if (b.inner !== undefined && idx >= b.inner) {
                    // The inner core spins the other way
                    const t = -time * 0.9;
                    const c = Math.cos(t);
                    const s = Math.sin(t);
                    [x, z] = [x * c - z * s, x * s + z * c];
                }
                const x1 = x * cy + z * syn;
                const z1 = -x * syn + z * cy;
                const y2 = y * cx - z1 * sxn;
                const z2 = y * sxn + z1 * cx;
                if (!project(ox + x1 * b.scale, oy + y2 * b.scale, b.z + z2 * b.scale)) return null;
                return [sx, sy];
            });

            const path = new Path2D();
            b.edges.forEach(([p, q]) => {
                if (!pts[p] || !pts[q]) return;
                path.moveTo(pts[p][0], pts[p][1]);
                path.lineTo(pts[q][0], pts[q][1]);
            });
            ctx.strokeStyle = `rgb(${colorOf(i)})`;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = a * 0.75;
            ctx.stroke(path);
            ctx.lineWidth = 5;
            ctx.globalAlpha = a * 0.07;
            ctx.stroke(path);
            ctx.fillStyle = `rgb(${ink})`;
            ctx.globalAlpha = a * 0.8;
            pts.forEach(pt => {
                if (pt) ctx.fillRect(pt[0] - 1.2, pt[1] - 1.2, 2.4, 2.4);
            });
        }
        ctx.globalAlpha = 1;
    }

    function render(dt) {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const s = scrollY - startY;
        const target = s * K;
        const vel = Math.abs(target - lastTarget) / Math.max(dt, 0.001);
        lastTarget = target;
        speed += (vel - speed) * (1 - Math.exp(-dt * 4));
        camZ = reduceMotion ? target : camZ + (target - camZ) * (1 - Math.exp(-dt * 6));
        camX += (mouseX * 1.2 * gapMix - camX) * (1 - Math.exp(-dt * 2));

        // Leaving the throat: the view starts upside down and rolls back upright
        const exitK = 1 - clamp01((camZ / K) / rollLen);
        roll = Math.PI * easeInOut(exitK);
        cosR = Math.cos(roll);
        sinR = Math.sin(roll);

        const show = smooth(clamp01((s + vh * 0.35) / (vh * 0.35)));
        canvas.style.opacity = show.toFixed(3);
        if (show <= 0.001) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);

        // Gates and bodies stay bright in the gaps and recede while a chapter fills the screen
        let inGap = 0;
        for (let i = 0; i < gaps.length; i++) {
            const overlap = Math.min(gaps[i][1], scrollY + vh) - Math.max(gaps[i][0], scrollY);
            inGap = Math.max(inGap, overlap / vh);
        }
        const gapTarget = smooth(clamp01(inGap / 0.5));
        gapMix += (gapTarget - gapMix) * (1 - Math.exp(-dt * 3));
        objAlpha = 0.1 + 0.9 * gapMix;
        titleRoom = smooth(clamp01((inGap - 0.55) / 0.3));
        waveAmp = 0.15 + 0.85 * gapMix;

        const open = 1 - exitK;
        const calm = 0.55 + 0.45 * gapMix;
        let ahead = gates.length - 1;
        for (let i = 0; i < gates.length; i++) {
            if (gates[i].z > camZ - 6) { ahead = i; break; }
        }
        const want = chapterRGB[ahead] || mixRGB;
        const kMix = 1 - Math.exp(-dt * 1.6);
        for (let c = 0; c < 3; c++) mixRGB[c] += (want[c] - mixRGB[c]) * kMix;
        corridor = mixRGB.map(Math.round).join(',');
        drawPlane(-1, corridor, 0.34 * (0.35 + 0.65 * open) * calm);
        drawPlane(1, ink, 0.16 * (0.35 + 0.65 * open) * calm);
        if (gapMix > 0.05) {
            ctx.globalAlpha = gapMix;
            drawStars();
            ctx.globalAlpha = 1;
        }
        drawExitRings(smooth(exitK * 1.4 > 1 ? 1 : exitK * 1.4));
        drawGates();
        drawBodies();
        updateTitle();
    }

    // While flying through a gap, the upcoming chapter's name grows toward the viewer, then passes by.
    // It only shows once the previous chapter has scrolled (almost) off screen.
    let titleRoom = 0;
    function updateTitle() {
        if (!title) return;
        let best = -1;
        let k = 0;
        for (let i = 0; i < gates.length; i++) {
            const g = gates[i];
            const dz = g.z - camZ;
            if (dz < -2 || dz > g.depth) continue;
            const t = 1 - dz / g.depth; // 0 at the start of the gap, 1 at the gate
            const a = smooth(clamp01(t / 0.3)) * (1 - smooth(clamp01((t - 0.86) / 0.16))) * titleRoom;
            if (a > k) {
                k = a;
                best = i;
            }
        }
        if (best !== titleIdx && best >= 0) {
            titleIdx = best;
            titleName.textContent = gates[best].name;
            title.style.setProperty('--accent-primary', `rgb(${colorOf(best)})`);
        }
        const g = gates[titleIdx];
        const t = g ? clamp01(1 - (g.z - camZ) / g.depth) : 0;
        const scale = 0.8 + 0.4 * t * t;
        const key = `${k.toFixed(3)}|${scale.toFixed(3)}`;
        if (key === titleKey) return;
        titleKey = key;
        title.style.opacity = k.toFixed(3);
        title.style.visibility = k > 0.005 ? 'visible' : 'hidden';
        title.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
    }

    function loop(now) {
        if (!running) return;
        const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
        lastNow = now;
        if (!reduceMotion) time += dt;
        render(dt);
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
    }

    // Only run while the corridor can be on screen
    function checkActive() {
        const y = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (y > startY - vh * 0.6 && !document.hidden) start();
        else {
            stop();
            canvas.style.opacity = '0';
            if (title) title.style.visibility = 'hidden';
        }
    }

    function init() {
        canvas = document.getElementById('after-space');
        if (!canvas) return;
        title = document.getElementById('warp-title');
        if (title) titleName = title.querySelector('.warp-title__name');
        ctx = canvas.getContext('2d');
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        resize();
        buildStars();
        readTheme();
        camZ = lastTarget = ((window.pageYOffset || 0) - startY) * K;

        window.addEventListener('resize', () => {
            resize();
            checkActive();
        }, { passive: true });
        window.addEventListener('scroll', checkActive, { passive: true });
        document.addEventListener('visibilitychange', checkActive);
        window.addEventListener('pointermove', e => {
            mouseX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
        }, { passive: true });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
        if ('ResizeObserver' in window) {
            const main = document.getElementById('smooth-content');
            if (main) new ResizeObserver(() => measure()).observe(main);
        }
        new MutationObserver(readTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
        checkActive();
    }

    return {
        init,
        refresh: measure
    };
})();
