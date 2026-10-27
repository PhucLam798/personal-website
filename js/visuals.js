/**
 * ============================================================================
 * TẠ PHÚC LÂM — CINEMATIC INTERACTIVE PORTFOLIO (2026)
 * MODULE 03: PROCEDURAL ENGINEERING VISUALIZERS & SCHEMATICS
 * Interactive SVG/Canvas systems for Skills, Latent LLM Research, and the
 * 6 Featured Engineering Projects.
 * ============================================================================
 */
window.TPL = window.TPL || {};

window.TPL.Visuals = (function () {
    const NS = 'http://www.w3.org/2000/svg';

    function createSvgEl(tag, attrs = {}) {
        const node = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        return node;
    }

    /**
     * 1. Initialize Chapter 01 Technical Capability SVG Visualizers
     */
    function initSkillVisuals() {
        // Neural Tensor SVG (Pillar 02)
        const neural = document.querySelector('[data-viz="neural"]');
        if (neural && neural.children.length === 0) {
            const layers = [
                { x: 56, n: 3, gap: 32 },
                { x: 130, n: 5, gap: 20 },
                { x: 204, n: 4, gap: 24 },
                { x: 274, n: 2, gap: 46 }
            ].map(l => ({
                ...l,
                ys: Array.from({ length: l.n }, (_, i) => 60 + (i - (l.n - 1) / 2) * l.gap)
            }));

            const edges = createSvgEl('g', { class: 'neural-edges' });
            const pulses = createSvgEl('g', { class: 'neural-pulses' });
            layers.slice(0, -1).forEach((l, li) => {
                const next = layers[li + 1];
                l.ys.forEach((y1, i) => next.ys.forEach((y2, j) => {
                    const coords = { x1: l.x, y1, x2: next.x, y2 };
                    edges.appendChild(createSvgEl('line', {
                        ...coords,
                        style: `opacity:${0.2 + ((i * 3 + j * 5) % 4) * 0.12}`
                    }));
                    if ((i * 7 + j * 3 + li) % 3 === 0) {
                        pulses.appendChild(createSvgEl('line', {
                            ...coords,
                            pathLength: 100,
                            style: `--d:${(li * 0.85 + ((i + j) % 3) * 0.1).toFixed(2)}s`
                    }));
                    }
                }));
            });

            const nodes = createSvgEl('g', { class: 'neural-nodes' });
            layers.forEach((l, li) => l.ys.forEach(y => {
                nodes.appendChild(createSvgEl('circle', {
                    cx: l.x,
                    cy: y,
                    r: 4,
                    style: `--d:${(li * 0.85).toFixed(2)}s`
                }));
            }));
            neural.append(edges, pulses, nodes);
        }

        // MCU & PID Response Waveform SVG (Pillar 03)
        const wave = document.querySelector('[data-viz="wave"]');
        if (wave && wave.children.length === 0) {
            const HI = 32, LO = 88, P = 160;
            let square = `M0 ${LO}`, resp = `M0 ${LO}`;
            for (let k = 0; k < 4; k++) {
                const x = k * P;
                square += ` H${x + 40} L${x + 44} ${HI} H${x + 120} L${x + 124} ${LO} H${x + P}`;
                resp += ` H${x + 44} C${x + 54} ${LO} ${x + 56} ${HI - 10} ${x + 68} ${HI - 4} S${x + 82} ${HI + 2} ${x + 94} ${HI}`
                     + ` H${x + 124} C${x + 134} ${HI} ${x + 136} ${LO + 10} ${x + 148} ${LO + 4} S${x + 160} ${LO - 2} ${x + 170} ${LO}`;
            }
            const grid = createSvgEl('g', { class: 'wave-grid' });
            for (let gx = 40; gx < 320; gx += 40) {
                grid.appendChild(createSvgEl('line', { x1: gx, y1: 12, x2: gx, y2: 108 }));
            }
            for (let gy = 32; gy <= 88; gy += 28) {
                grid.appendChild(createSvgEl('line', { x1: 0, y1: gy, x2: 320, y2: gy }));
            }
            const track = createSvgEl('g', { class: 'wave-track' });
            track.append(
                createSvgEl('path', { class: 'wave-resp', d: resp }),
                createSvgEl('path', { class: 'wave-square', d: square })
            );
            wave.append(
                grid,
                track,
                createSvgEl('rect', { class: 'wave-scan', x: 0, y: 10, width: 2, height: 100 })
            );
        }

        // 3D Tilt interaction on desktop hover
        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (canHover && !reduceMotion) {
            document.querySelectorAll('.pillar-card').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    card.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
                    card.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
                });
                card.addEventListener('mouseleave', () => {
                    card.style.setProperty('--rx', '0deg');
                    card.style.setProperty('--ry', '0deg');
                });
            });
        }
    }

    /**
     * 2. Chapter 03 — Interactive Latent Space Trajectory Diagram
     * Visualizes how Vietnamese prompt tokens traverse hidden LLM layers
     * into latent space and where/when they translate back.
     */
    function initLatentResearchVisualizer() {
        const svg = document.getElementById('latent-trajectory-svg');
        if (!svg) return;

        svg.innerHTML = '';
        const w = 900, h = 300;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

        // Layer grid verticals (L0, L8, L16, L24, L32)
        const layerXs = [
            { x: 90, label: 'L₀ // INPUT (VI)', sub: 'Vietnamese Prompt' },
            { x: 270, label: 'L₈ // ENCODING', sub: 'Cross-Lingual Shift' },
            { x: 450, label: 'L₁₆ // LATENT CORE', sub: 'Abstract Reasoning' },
            { x: 630, label: 'L₂₄ // PROJECTION', sub: 'Translate-Back Point' },
            { x: 810, label: 'L₃₂ // OUTPUT (VI)', sub: 'Target Generation' }
        ];

        const gridGroup = createSvgEl('g', { class: 'latent-grid' });
        layerXs.forEach(l => {
            gridGroup.appendChild(createSvgEl('line', {
                x1: l.x, y1: 28, x2: l.x, y2: 256,
                class: 'latent-layer-axis'
            }));
            const txt = createSvgEl('text', { x: l.x, y: 20, 'text-anchor': 'middle', class: 'latent-axis-label' });
            txt.textContent = l.label;
            const sub = createSvgEl('text', { x: l.x, y: 278, 'text-anchor': 'middle', class: 'latent-axis-sub' });
            sub.textContent = l.sub;
            gridGroup.append(txt, sub);
        });
        svg.appendChild(gridGroup);

        // 5 semantic token trajectories converging into the Latent Core (x=450) and diverging back
        const startYs = [58, 100, 142, 184, 226];
        const midYs = [110, 126, 142, 158, 174];
        const pathsGroup = createSvgEl('g', { class: 'latent-curves' });
        const pulsesGroup = createSvgEl('g', { class: 'latent-pulses' });

        startYs.forEach((sy, idx) => {
            const my = midYs[idx];
            const ey = startYs[startYs.length - 1 - idx]; // Cross-inversion in latent space
            const d = `M 90 ${sy} C 190 ${sy}, 220 ${my}, 450 ${my} C 610 ${my}, 680 ${ey}, 810 ${ey}`;

            pathsGroup.appendChild(createSvgEl('path', {
                d,
                class: `latent-curve-base curve-${idx}`
            }));

            pathsGroup.appendChild(createSvgEl('path', {
                d,
                pathLength: 100,
                class: `latent-curve-active curve-active-${idx}`,
                style: `--delay:${(idx * 0.45).toFixed(2)}s`
            }));

            // Nodes at L0, L16, L24, L32
            [
                { x: 90, y: sy },
                { x: 450, y: my },
                { x: 630, y: (my + ey) * 0.5 },
                { x: 810, y: ey }
            ].forEach((pt, pIdx) => {
                pulsesGroup.appendChild(createSvgEl('circle', {
                    cx: pt.x,
                    cy: pt.y,
                    r: pIdx === 2 ? 5.5 : 3.5,
                    class: pIdx === 2 ? 'latent-node-critical' : 'latent-node'
                }));
            });
        });

        // Highlight zone around L24 ("WHERE & WHEN DO LLMs TRANSLATE BACK?")
        const highlightRect = createSvgEl('rect', {
            x: 585, y: 36, width: 90, height: 212, rx: 4,
            class: 'latent-translate-zone'
        });
        svg.appendChild(highlightRect); // pathsGroup is appended after, so the zone renders beneath the curves

        // Interactive Layer Probe Scanner Line
        const probeGroup = createSvgEl('g', { id: 'latent-probe-group', transform: 'translate(630, 0)' });
        probeGroup.appendChild(createSvgEl('line', {
            x1: 0, y1: 30, x2: 0, y2: 254,
            class: 'latent-probe-line'
        }));
        const probeBadge = createSvgEl('rect', {
            x: -88, y: 232, width: 176, height: 22, rx: 2,
            class: 'latent-probe-badge'
        });
        const probeText = createSvgEl('text', {
            x: 0, y: 247, 'text-anchor': 'middle',
            class: 'latent-probe-text'
        });
        probeText.textContent = 'PROBE: L₂₄ // TRANSLATE-BACK';
        probeGroup.append(probeBadge, probeText);

        svg.append(pathsGroup, pulsesGroup, probeGroup);

        // Interactive mousemove scrubbing across transformer layers L0 -> L32
        const readoutEl = document.getElementById('latent-live-readout');
        svg.addEventListener('mousemove', e => {
            const rect = svg.getBoundingClientRect();
            const relX = Math.max(90, Math.min(810, ((e.clientX - rect.left) / rect.width) * w));
            probeGroup.setAttribute('transform', `translate(${relX.toFixed(1)}, 0)`);

            const layerNum = Math.round(((relX - 90) / (810 - 90)) * 32);
            let phaseDesc = '';
            if (layerNum <= 6) {
                probeText.textContent = `LAYER L_${layerNum} // VIETNAMESE TOKENS`;
                phaseDesc = `L_${layerNum} [Lexical Encoding]: "Giải thích tư duy hệ thống..." → Token embeddings (VI)`;
            } else if (layerNum <= 20) {
                probeText.textContent = `LAYER L_${layerNum} // LATENT MANIFOLD`;
                phaseDesc = `L_${layerNum} [Latent Space]: Cross-lingual semantic alignment ⟨system, architecture, control⟩`;
            } else if (layerNum <= 27) {
                probeText.textContent = `LAYER L_${layerNum} // TRANSLATE-BACK`;
                phaseDesc = `L_${layerNum} [Critical Transition]: Latent representation projects back to Vietnamese syntax`;
            } else {
                probeText.textContent = `LAYER L_${layerNum} // TARGET OUTPUT (VI)`;
                phaseDesc = `L_${layerNum} [Generation]: "Tư duy hệ thống là phương pháp tiếp cận toàn diện..."`;
            }
            if (readoutEl) readoutEl.textContent = phaseDesc;
        });
    }

    /**
     * 3. Chapter 04 — Generate Bespoke SVG Blueprint Schematic for Each of the 6 Projects
     */
    function getProjectBlueprintSVG(vizType, indexStr = '01') {
        switch (vizType) {
            case 'gaze':
                return `
                <svg class="proj-blueprint-svg" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Coordinate Grid -->
                    <g class="bp-grid" stroke="currentColor" stroke-opacity="0.12" stroke-width="1">
                        <line x1="0" y1="85" x2="560" y2="85" stroke-dasharray="3 6"/>
                        <line x1="0" y1="170" x2="560" y2="170"/>
                        <line x1="0" y1="255" x2="560" y2="255" stroke-dasharray="3 6"/>
                        <line x1="140" y1="0" x2="140" y2="340" stroke-dasharray="3 6"/>
                        <line x1="280" y1="0" x2="280" y2="340"/>
                        <line x1="420" y1="0" x2="420" y2="340" stroke-dasharray="3 6"/>
                    </g>
                    <!-- Eye Contour -->
                    <path d="M 80 170 Q 190 75 300 170 Q 190 265 80 170 Z" class="bp-stroke-primary" stroke-width="1.75"/>
                    <path d="M 95 170 Q 190 95 285 170 Q 190 245 95 170 Z" class="bp-stroke-dim" stroke-dasharray="4 4"/>
                    <!-- YOLOv8 Bounding Box -->
                    <rect x="142" y="122" width="96" height="96" class="bp-bbox bp-interactive-pupil" stroke-width="1.5" stroke-dasharray="6 3"/>
                    <text x="144" y="114" class="bp-mono-label">YOLOv8: PUPIL 0.98</text>
                    <!-- Iris & Pupil Core -->
                    <g class="bp-interactive-pupil">
                        <circle cx="190" cy="170" r="36" class="bp-stroke-accent" stroke-width="1.5"/>
                        <circle cx="190" cy="170" r="14" class="bp-fill-accent"/>
                        <line x1="166" y1="170" x2="214" y2="170" class="bp-stroke-primary" stroke-width="1"/>
                        <line x1="190" y1="146" x2="190" y2="194" class="bp-stroke-primary" stroke-width="1"/>
                    </g>
                    <!-- Polynomial Regression Mapping Curve -->
                    <path d="M 238 170 C 310 170, 335 96, 460 96" class="bp-signal-path" pathLength="100"/>
                    <path d="M 330 235 Q 395 110 490 85" class="bp-stroke-dim" stroke-dasharray="3 3"/>
                    <!-- Cursor Target Reticle -->
                    <g transform="translate(460, 96)" class="bp-cursor-node">
                        <circle r="22" class="bp-stroke-accent" stroke-dasharray="4 4"/>
                        <circle r="5" class="bp-fill-accent"/>
                        <text x="-42" y="38" class="bp-mono-label">POLY_REG(x,y) → CURSOR</text>
                    </g>
                </svg>`;

            case 'fog':
                return `
                <svg class="proj-blueprint-svg" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g class="bp-grid" stroke="currentColor" stroke-opacity="0.12">
                        <line x1="40" y1="60" x2="520" y2="60"/>
                        <line x1="40" y1="170" x2="520" y2="170"/>
                        <line x1="40" y1="280" x2="520" y2="280"/>
                        <line x1="310" y1="35" x2="310" y2="305" class="bp-stroke-accent" stroke-dasharray="4 4"/>
                    </g>
                    <!-- Normal Gait Harmonic Wave -->
                    <path d="M 40 170 Q 65 95 90 170 T 140 170 T 190 170 T 240 170 T 290 170" class="bp-stroke-primary" stroke-width="2"/>
                    <!-- High-Frequency FoG Tremor Event -->
                    <path d="M 290 170 L 302 125 L 312 215 L 322 118 L 332 222 L 342 130 L 352 210 L 362 122 L 372 215 L 385 170" class="bp-signal-path" stroke-width="2.2" pathLength="100"/>
                    <!-- Stabilized Post-Cue Wave -->
                    <path d="M 385 170 Q 415 110 445 170 T 505 170" class="bp-stroke-dim" stroke-width="1.75"/>
                    <!-- MLP Sliding Window Box -->
                    <rect x="282" y="82" width="112" height="176" rx="4" class="bp-bbox" stroke-width="1.5"/>
                    <text x="286" y="72" class="bp-mono-label">MLP WINDOW // FoG DETECTED</text>
                    <!-- Acoustic Alert Pulse < 1.2s -->
                    <g transform="translate(455, 115)">
                        <circle r="16" class="bp-fill-accent" fill-opacity="0.2"/>
                        <circle r="28" class="bp-stroke-accent" stroke-dasharray="3 4"/>
                        <circle r="6" class="bp-fill-accent"/>
                        <text x="-48" y="-36" class="bp-mono-label">ACOUSTIC CUE &lt; 1.2s</text>
                    </g>
                </svg>`;

            case 'robot':
                return `
                <svg class="proj-blueprint-svg" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Bird's-Eye-View Perspective Trapezoid (Sidewalk Corridor) -->
                    <polygon points="210,45 350,45 480,305 80,305" class="bp-corridor-fill" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5"/>
                    <line x1="178" y1="110" x2="382" y2="110" class="bp-stroke-dim" stroke-dasharray="4 6"/>
                    <line x1="145" y1="175" x2="415" y2="175" class="bp-stroke-dim" stroke-dasharray="4 6"/>
                    <line x1="112" y1="240" x2="448" y2="240" class="bp-stroke-dim" stroke-dasharray="4 6"/>
                    <!-- Ideal Centerline Reference -->
                    <line x1="280" y1="45" x2="280" y2="305" class="bp-stroke-dim" stroke-dasharray="3 5"/>
                    <!-- PID Corrected Robot Trajectory Curve -->
                    <path d="M 325 295 C 320 230, 255 190, 280 135 C 292 100, 280 75, 280 52" class="bp-signal-path" stroke-width="2.5" pathLength="100"/>
                    <!-- Robot Chassis Node -->
                    <g transform="translate(312, 265)">
                        <rect x="-18" y="-24" width="36" height="48" rx="4" class="bp-stroke-accent" stroke-width="1.8"/>
                        <line x1="0" y1="0" x2="-22" y2="-55" class="bp-stroke-primary" stroke-width="1.5"/>
                        <circle r="4" class="bp-fill-accent"/>
                    </g>
                    <!-- Target Waypoint -->
                    <circle cx="280" cy="65" r="9" class="bp-stroke-accent" stroke-width="1.8"/>
                    <circle cx="280" cy="65" r="3" class="bp-fill-accent"/>
                    <text x="56" y="42" class="bp-mono-label">YOLOv8-SEG // BEV MAP</text>
                    <text x="368" y="288" class="bp-mono-label">PID STEERING VECTOR</text>
                </svg>`;

            case 'headhw':
                return `
                <svg class="proj-blueprint-svg" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- 3-Axis MPU6050 Gyroscope Gimbal Rings -->
                    <g transform="translate(185, 170)" class="bp-interactive-pupil">
                        <circle r="92" class="bp-stroke-dim" stroke-dasharray="4 6"/>
                        <ellipse rx="92" ry="38" class="bp-stroke-primary" stroke-width="1.6" transform="rotate(-18)"/>
                        <ellipse rx="38" ry="92" class="bp-stroke-accent" stroke-width="1.6" transform="rotate(14)"/>
                        <rect x="-20" y="-20" width="40" height="40" rx="3" class="bp-bbox"/>
                        <circle r="5" class="bp-fill-accent"/>
                        <text x="-38" y="118" class="bp-mono-label">MPU6050 // 6-DOF IMU</text>
                    </g>
                    <!-- Signal Bus to ATmega32u4 -->
                    <path d="M 280 155 L 355 155 L 380 130 L 495 130" class="bp-signal-path" pathLength="100"/>
                    <path d="M 280 185 L 355 185 L 380 215 L 410 215 L 420 180 L 430 230 L 440 215 L 495 215" class="bp-stroke-primary" stroke-width="1.6"/>
                    <text x="378" y="116" class="bp-mono-label">I2C → ATmega32u4 HID</text>
                    <text x="378" y="252" class="bp-mono-label">BLINK IMPULSE → CLICK</text>
                </svg>`;

            case 'headsw':
                return `
                <svg class="proj-blueprint-svg" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- MediaPipe Face Mesh Tessellation -->
                    <g transform="translate(180, 170)" class="bp-interactive-pupil">
                        <polygon points="0,-95 68,-55 78,25 45,88 0,105 -45,88 -78,25 -68,-55" class="bp-stroke-dim" stroke-width="1.2"/>
                        <polygon points="0,-65 45,-32 38,32 0,72 -38,32 -45,-32" class="bp-stroke-primary" stroke-width="1.2"/>
                        <line x1="-68" y1="-55" x2="68" y2="-55" class="bp-stroke-dim"/>
                        <line x1="-45" y1="-32" x2="45" y2="-32" class="bp-stroke-dim"/>
                        <line x1="-78" y1="25" x2="78" y2="25" class="bp-stroke-dim"/>
                        <line x1="0" y1="-95" x2="0" y2="105" class="bp-stroke-dim"/>
                        <!-- Nose Tip Landmark #1 -->
                        <circle cx="0" cy="8" r="16" class="bp-stroke-accent" stroke-dasharray="3 3"/>
                        <circle cx="0" cy="8" r="5.5" class="bp-fill-accent"/>
                    </g>
                    <!-- Vector Projection to Screen Viewport -->
                    <path d="M 180 178 C 265 178, 310 120, 435 120" class="bp-signal-path" stroke-width="2" pathLength="100"/>
                    <rect x="360" y="68" width="150" height="104" rx="4" class="bp-bbox"/>
                    <circle cx="435" cy="120" r="6" class="bp-fill-accent"/>
                    <text x="95" y="302" class="bp-mono-label">MEDIAPIPE 468 LANDMARKS</text>
                    <text x="362" y="56" class="bp-mono-label">SCREEN CURSOR (X,Y)</text>
                </svg>`;

            case 'llm':
            default:
                return `
                <svg class="proj-blueprint-svg" viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Discrete Character Input Nodes -->
                    <g class="bp-tokens-in">
                        <rect x="42" y="62" width="48" height="32" rx="3" class="bp-bbox"/>
                        <text x="66" y="82" text-anchor="middle" class="bp-mono-label">[t-k]</text>
                        <rect x="42" y="118" width="48" height="32" rx="3" class="bp-bbox"/>
                        <text x="66" y="138" text-anchor="middle" class="bp-mono-label">[h-th]</text>
                        <rect x="42" y="174" width="48" height="32" rx="3" class="bp-bbox"/>
                        <text x="66" y="194" text-anchor="middle" class="bp-mono-label">[n-h]</text>
                        <rect x="42" y="230" width="48" height="32" rx="3" class="bp-bbox"/>
                        <text x="66" y="250" text-anchor="middle" class="bp-mono-label">[a-i]</text>
                    </g>
                    <!-- LoRA Low-Rank Adaptation Diamond (A x B) -->
                    <polygon points="265,70 335,170 265,270 195,170" class="bp-stroke-accent" stroke-width="1.8"/>
                    <circle cx="265" cy="170" r="24" class="bp-bbox"/>
                    <circle cx="265" cy="170" r="6" class="bp-fill-accent"/>
                    <text x="265" y="48" text-anchor="middle" class="bp-mono-label">LoRA ΔW = B · A (RANK r)</text>
                    <!-- Converging & Reconstructing Trajectories -->
                    <path d="M 90 78 C 145 78, 165 170, 241 170" class="bp-stroke-dim"/>
                    <path d="M 90 134 C 145 134, 165 170, 241 170" class="bp-signal-path" pathLength="100"/>
                    <path d="M 90 190 C 145 190, 165 170, 241 170" class="bp-signal-path" pathLength="100"/>
                    <path d="M 90 246 C 145 246, 165 170, 241 170" class="bp-stroke-dim"/>
                    <path d="M 289 170 L 385 170" class="bp-signal-path" stroke-width="2.4" pathLength="100"/>
                    <!-- Reconstructed Sentence Block -->
                    <rect x="385" y="128" width="142" height="84" rx="4" class="bp-stroke-primary" stroke-width="1.6"/>
                    <line x1="402" y1="154" x2="508" y2="154" class="bp-stroke-accent" stroke-width="2"/>
                    <line x1="402" y1="172" x2="492" y2="172" class="bp-stroke-primary" stroke-width="1.5"/>
                    <line x1="402" y1="190" x2="468" y2="190" class="bp-stroke-dim" stroke-width="1.5"/>
                    <text x="456" y="114" text-anchor="middle" class="bp-mono-label">COMPLETE SENTENCE</text>
                </svg>`;
        }
    }

    /**
     * Interactive cursor tracking inside the active Project Blueprint Stage
     */
    function bindBlueprintInteractiveParallax() {
        const stage = document.getElementById('project-stage-visual');
        if (!stage) return;

        stage.addEventListener('mousemove', e => {
            const rect = stage.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

            stage.querySelectorAll('.bp-interactive-pupil').forEach(el => {
                el.style.transform = `translate(${(nx * 12).toFixed(1)}px, ${(ny * 10).toFixed(1)}px)`;
            });
            stage.querySelectorAll('.bp-cursor-node').forEach(el => {
                el.style.transform = `translate(${(460 + nx * 18).toFixed(1)}px, ${(96 + ny * 14).toFixed(1)}px)`;
            });
        });

        stage.addEventListener('mouseleave', () => {
            stage.querySelectorAll('.bp-interactive-pupil').forEach(el => {
                el.style.transform = '';
            });
        });
    }

    function init() {
        initSkillVisuals();
        initLatentResearchVisualizer();
        bindBlueprintInteractiveParallax();
    }

    return {
        init,
        initSkillVisuals,
        initLatentResearchVisualizer,
        getProjectBlueprintSVG
    };
})();
