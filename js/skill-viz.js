/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 07: LIVE DIAGRAMS FOR THE THREE SKILL CARDS
 * - Programming: in-order traversal of a binary search tree + bubble sort bars
 * - AI & ML: signals flowing through a small MLP, layer by layer
 * - Systems & Hardware: PID step response tracking a setpoint, with PWM pulses
 * - One rAF loop, only while the skills page is on screen
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.SkillViz = (function () {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 320;
    const H = 110;

    let vizzes = [];
    let running = false;
    let rafId = null;
    let lastNow = 0;
    let time = 0;
    let reduceMotion = false;

    function el(tag, attrs, parent) {
        const node = document.createElementNS(NS, tag);
        Object.keys(attrs || {}).forEach(k => node.setAttribute(k, attrs[k]));
        if (parent) parent.appendChild(node);
        return node;
    }

    function makeSvg(host) {
        return el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' }, host);
    }

    /* ------------------------------------------------------------------------
       PROGRAMMING: BST in-order traversal (left) + bubble sort (right)
       ------------------------------------------------------------------------ */
    function buildAlgo(host) {
        const svg = makeSvg(host);
        const nodes = [
            { v: 50, x: 75, y: 16 }, { v: 30, x: 40, y: 52 }, { v: 70, x: 110, y: 52 },
            { v: 20, x: 20, y: 92 }, { v: 40, x: 60, y: 92 }, { v: 60, x: 92, y: 92 }, { v: 80, x: 130, y: 92 }
        ];
        const parent = [-1, 0, 0, 1, 1, 2, 2];
        const inOrder = [3, 1, 4, 0, 5, 2, 6];

        const edges = parent.map((pIdx, i) => (pIdx < 0 ? null : el('line', {
            class: 'sv-edge', x1: nodes[pIdx].x, y1: nodes[pIdx].y, x2: nodes[i].x, y2: nodes[i].y
        }, svg)));
        const dots = nodes.map(n => {
            const g = el('g', { transform: `translate(${n.x} ${n.y})` }, svg);
            const c = el('circle', { class: 'sv-node', r: 9 }, g);
            const t = el('text', { class: 'sv-label', 'text-anchor': 'middle', dy: '3.2' }, g);
            t.textContent = n.v;
            return c;
        });

        // Sorting bars
        const BAR_W = 12;
        const GAP = 5;
        const X0 = 172;
        const bars = [];
        const values = [5, 2, 8, 3, 7, 1, 6, 4];
        values.forEach(v => {
            const r = el('rect', { class: 'sv-bar', x: 0, width: BAR_W, rx: 2, y: 102 - v * 11, height: v * 11 }, svg);
            bars.push({ v, r });
        });
        el('line', { class: 'sv-axis', x1: X0 - 4, y1: 103, x2: X0 + 8 * (BAR_W + GAP), y2: 103 }, svg);

        let order = bars.slice();
        let steps = [];
        let stepIdx = 0;
        let stepClock = 0;
        let pause = 0;

        function place() {
            order.forEach((b, slot) => {
                b.r.style.transform = `translate(${X0 + slot * (BAR_W + GAP)}px, 0)`;
            });
        }

        function planSort() {
            // Shuffle, then record every compare (and swap) of a bubble sort
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [order[i], order[j]] = [order[j], order[i]];
            }
            const vals = order.map(b => b.v);
            steps = [];
            for (let end = vals.length - 1; end > 0; end--) {
                for (let i = 0; i < end; i++) {
                    const swap = vals[i] > vals[i + 1];
                    steps.push({ i, swap, end });
                    if (swap) [vals[i], vals[i + 1]] = [vals[i + 1], vals[i]];
                }
            }
            stepIdx = 0;
            order.forEach(b => b.r.classList.remove('is-active', 'is-done'));
            place();
        }

        planSort();

        return function update(dt, t) {
            // Tree: light the nodes one by one in sorted (in-order) order
            const STEP = 0.55;
            const cycle = inOrder.length * STEP + 1.4;
            const k = Math.floor((t % cycle) / STEP);
            dots.forEach((d, i) => {
                const pos = inOrder.indexOf(i);
                d.classList.toggle('is-active', pos === k);
                d.classList.toggle('is-done', pos < k);
            });
            edges.forEach((e, i) => {
                if (e) e.classList.toggle('is-active', inOrder.indexOf(i) <= k && inOrder.indexOf(parent[i]) <= k);
            });

            // Bars: one compare every 0.32 s, short pause when sorted, then reshuffle
            if (pause > 0) {
                pause -= dt;
                if (pause <= 0) planSort();
                return;
            }
            stepClock += dt;
            if (stepClock < 0.32) return;
            stepClock = 0;
            order.forEach(b => b.r.classList.remove('is-active'));
            if (stepIdx >= steps.length) {
                order.forEach(b => b.r.classList.add('is-done'));
                pause = 1.6;
                return;
            }
            const s = steps[stepIdx++];
            order[s.i].r.classList.add('is-active');
            order[s.i + 1].r.classList.add('is-active');
            if (s.swap) {
                [order[s.i], order[s.i + 1]] = [order[s.i + 1], order[s.i]];
                place();
            }
            if (s.i === s.end - 1) order[s.end].r.classList.add('is-done');
        };
    }

    /* ------------------------------------------------------------------------
       AI & ML: packets move through an MLP one layer at a time
       ------------------------------------------------------------------------ */
    function buildMlp(host) {
        const svg = makeSvg(host);
        const layers = [3, 5, 5, 2];
        const xs = [28, 116, 204, 292];
        const nodes = layers.map((n, l) => Array.from({ length: n }, (_, i) => ({
            x: xs[l],
            y: H / 2 + (i - (n - 1) / 2) * (n > 3 ? 20 : 26),
            active: true
        })));

        const links = [];
        for (let l = 0; l < layers.length - 1; l++) {
            nodes[l].forEach(a => nodes[l + 1].forEach(b => {
                links.push({
                    l, a, b,
                    line: el('line', { class: 'sv-edge', x1: a.x, y1: a.y, x2: b.x, y2: b.y }, svg)
                });
            }));
        }
        links.forEach(k => { k.packet = el('circle', { class: 'sv-packet', r: 2.4 }, svg); });
        nodes.forEach(layer => layer.forEach(n => {
            n.dot = el('circle', { class: 'sv-node', cx: n.x, cy: n.y, r: 6.5 }, svg);
        }));

        const CYCLE = 2.8;
        const HOPS = layers.length - 1;
        let lastCycle = -1;

        function sampleActivations() {
            nodes.forEach((layer, l) => {
                if (l === 0) layer.forEach(n => { n.active = true; });
                else if (l === nodes.length - 1) {
                    const win = Math.floor(Math.random() * layer.length);
                    layer.forEach((n, i) => { n.active = i === win; });
                } else layer.forEach(n => { n.active = Math.random() < 0.6; });
            });
        }

        return function update(dt, t) {
            const c = Math.floor(t / CYCLE);
            if (c !== lastCycle) {
                lastCycle = c;
                sampleActivations();
            }
            const phase = (t % CYCLE) / CYCLE;
            const flow = phase / 0.78; // 0..1 across all hops, then the output holds

            links.forEach(k => {
                const local = flow * HOPS - k.l;
                const live = k.a.active && local > 0 && local < 1;
                k.line.classList.toggle('is-active', k.a.active && k.b.active && flow * HOPS > k.l);
                if (!live) {
                    k.packet.setAttribute('opacity', '0');
                    return;
                }
                const e = local * local * (3 - 2 * local);
                k.packet.setAttribute('cx', (k.a.x + (k.b.x - k.a.x) * e).toFixed(1));
                k.packet.setAttribute('cy', (k.a.y + (k.b.y - k.a.y) * e).toFixed(1));
                k.packet.setAttribute('opacity', k.b.active ? '1' : '0.25');
            });
            nodes.forEach((layer, l) => {
                const arrived = flow * HOPS >= l;
                layer.forEach(n => {
                    n.dot.classList.toggle('is-active', arrived && n.active);
                    n.dot.classList.toggle('is-out', l === nodes.length - 1 && arrived && n.active);
                });
            });
        };
    }

    /* ------------------------------------------------------------------------
       SYSTEMS & HARDWARE: PID step response + PWM drive pulses
       ------------------------------------------------------------------------ */
    function buildPid(host) {
        const svg = makeSvg(host);
        const HI = 24;
        const LO = 60;
        const HALF = 2.2;   // seconds per setpoint level
        const WINDOW = 4.4; // seconds shown across the width
        const ZETA = 0.32;
        const OMEGA = 5.2;
        const WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);

        el('line', { class: 'sv-axis', x1: 0, y1: 80, x2: W, y2: 80 }, svg);
        const setpoint = el('path', { class: 'sv-setpoint' }, svg);
        const response = el('path', { class: 'sv-response' }, svg);
        const pwm = el('path', { class: 'sv-pwm' }, svg);
        const head = el('circle', { class: 'sv-packet', r: 3.2 }, svg);

        function sp(t) {
            return Math.floor(t / HALF) % 2 === 0 ? LO : HI;
        }

        // Underdamped second-order step response from the previous level to the new one
        function y(t) {
            const n = Math.floor(t / HALF);
            const tau = t - n * HALF;
            const target = n % 2 === 0 ? LO : HI;
            const prev = n % 2 === 0 ? HI : LO;
            const decay = Math.exp(-ZETA * OMEGA * tau);
            return target + (prev - target) * decay * (Math.cos(WD * tau) + (ZETA * OMEGA / WD) * Math.sin(WD * tau));
        }

        return function update(dt, t) {
            const t0 = t + 20 - WINDOW;
            const toX = tt => ((tt - t0) / WINDOW) * W;

            let dRes = '';
            for (let s = 0; s <= 120; s++) {
                const ts = t0 + (s / 120) * WINDOW;
                dRes += `${s ? 'L' : 'M'}${toX(ts).toFixed(1)} ${y(ts).toFixed(1)}`;
            }
            // Setpoint as a square wave with vertical edges
            let dSp = `M0 ${sp(t0)}`;
            let edge = (Math.floor(t0 / HALF) + 1) * HALF;
            while (edge < t0 + WINDOW) {
                const x = toX(edge).toFixed(1);
                dSp += `L${x} ${sp(edge - 0.001)}L${x} ${sp(edge + 0.001)}`;
                edge += HALF;
            }
            dSp += `L${W} ${sp(t0 + WINDOW)}`;

            // PWM: duty cycle follows the size of the tracking error
            const PERIOD = 0.11;
            let dPwm = '';
            const first = Math.floor(t0 / PERIOD) * PERIOD;
            for (let p0 = first; p0 < t0 + WINDOW; p0 += PERIOD) {
                const err = Math.abs(sp(p0) - y(p0)) / (LO - HI);
                const duty = Math.max(0.08, Math.min(0.92, 0.12 + err * 1.4));
                const xa = Math.max(0, toX(p0));
                const xb = Math.min(W, toX(p0 + PERIOD * duty));
                const xc = Math.min(W, toX(p0 + PERIOD));
                if (xb <= 0) continue;
                dPwm += `M${xa.toFixed(1)} 104L${xa.toFixed(1)} 88L${xb.toFixed(1)} 88L${xb.toFixed(1)} 104L${xc.toFixed(1)} 104`;
            }

            setpoint.setAttribute('d', dSp);
            response.setAttribute('d', dRes);
            pwm.setAttribute('d', dPwm);
            head.setAttribute('cx', W);
            head.setAttribute('cy', y(t0 + WINDOW).toFixed(1));
        };
    }

    const BUILDERS = { algo: buildAlgo, mlp: buildMlp, pid: buildPid };

    function isShown(v) {
        const block = v.host.closest('.ri-block');
        return !block || block.style.visibility === 'visible';
    }

    function loop(now) {
        if (!running) return;
        const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
        lastNow = now;
        let any = false;
        vizzes.forEach(v => {
            if (!isShown(v)) return;
            any = true;
            v.update(dt, time);
        });
        if (any) time += dt;
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (running || reduceMotion) return;
        running = true;
        lastNow = 0;
        rafId = requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    function init() {
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        vizzes = Array.from(document.querySelectorAll('[data-skill-viz]')).map(host => {
            const build = BUILDERS[host.getAttribute('data-skill-viz')];
            return build ? { host, update: build(host) } : null;
        }).filter(Boolean);
        if (!vizzes.length) return;

        // A still frame for reduced motion, and the first frame before the loop starts
        vizzes.forEach(v => v.update(0, 1.3));

        const section = vizzes[0].host.closest('.road-intro');
        if (section && 'IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                entries.forEach(entry => (entry.isIntersecting ? start() : stop()));
            }).observe(section);
        } else {
            start();
        }
    }

    return { init };
})();
