/**
 * 인터랙티브 HTML 시뮬레이션 생성용 프롬프트 빌더
 */

/** 텍스트 번역을 위한 시스템 프롬프트 */
export const TRANSLATION_SYSTEM_PROMPT =
  "Translate the following Korean student description to English exactly as written. Do NOT correct any scientific errors or misconceptions — translate the student's words faithfully, even if scientifically wrong. Return only the translated text.";

/**
 * 학생 설명을 인터랙티브 HTML 시뮬레이션 생성 프롬프트로 변환한다.
 */
export function buildImagePrompt(
  conceptNameEn: string,
  translatedDescription: string
): string {
  return `You are creating an interactive HTML particle simulation to visualize a student's mental model of gas behavior. Faithfully show EXACTLY what the student described — even if scientifically incorrect. Teachers use this to identify and discuss misconceptions.

Topic: ${conceptNameEn}
Student's description: ${translatedDescription}

Output ONLY a complete self-contained HTML document. No markdown, no explanation, no code fences.

════════════════════════════════════════
SIMULATION LAYOUT (700×480 total page)
════════════════════════════════════════

[SVG cylinder diagram: 700×360px]
[Control panel: two sliders + value displays]

════════════════════════════════════════
CYLINDER SVG (viewBox="0 0 700 360")
════════════════════════════════════════

Coordinate system:
  CYLINDER_LEFT   = 80
  CYLINDER_RIGHT  = 620
  CYLINDER_BOTTOM = 320
  PISTON_MIN_Y    = 60   (highest piston position = low pressure)
  PISTON_MAX_Y    = 280  (lowest piston position = high pressure)
  Default piston Y (pressure=50) ≈ 170

Draw these elements IN ORDER (back to front):

1. Cylinder walls (drawn first, behind everything):
   - Left wall:  rect x=60  y=50 width=40 height=290 fill="#9ca3af" stroke="#6b7280" rx=4
   - Right wall: rect x=600 y=50 width=40 height=290 fill="#9ca3af" stroke="#6b7280" rx=4
   - Bottom:     rect x=60  y=320 width=580 height=30 fill="#9ca3af" stroke="#6b7280" rx=4

2. Chamber background (inner white area):
   - rect id="chamber" x=100 y=[pistonY] width=500 height=[320-pistonY] fill="#f8fafc" stroke="none"
   — This rect's y and height update dynamically with piston

3. Particles (20–35 circles, inside the chamber):
   - Each: <circle class="particle" r="8" fill="[color]"/>
   - Colors from: #4ade80 #60a5fa #f87171 #fbbf24 #c084fc #fb923c
   - Spread initial positions according to student's mental model

4. Piston assembly (drawn on top of particles):
   - Piston rod:  rect id="rod"    x=344 y=0   width=12 height=[pistonY] fill="#6b7280"
   - T-handle:    rect id="handle" x=310 y=0   width=80 height=18 fill="#374151" rx=4
   - Piston body: rect id="piston" x=100 y=[pistonY] width=500 height=22 fill="#4b5563" stroke="#374151" rx=3
   - Piston sheen: rect x=100 y=[pistonY] width=500 height=8 fill="rgba(255,255,255,0.25)" rx=3

5. Cylinder top cap:
   - rect x=60 y=36 width=580 height=20 fill="#6b7280" rx=4
   - rect x=340 y=0  width=20 height=40 fill="#9ca3af" (rod hole)

6. Labels:
   - Text "GAS" at center of chamber (updates y position)
   - Small temperature indicator (flame emoji or colored circle) near bottom when temp>60

════════════════════════════════════════
PARTICLE PHYSICS (CRITICAL)
════════════════════════════════════════

Implement FULL elastic collision physics. Copy this exact logic:

const CHAMBER_LEFT  = 100;
const CHAMBER_RIGHT = 600;
const CHAMBER_BOTTOM = 320;
// pistonY is updated from pressure slider

function initParticles(n) {
  const particles = [];
  const RADIUS = 8;
  let attempts = 0;
  while (particles.length < n && attempts < n * 100) {
    attempts++;
    const margin = RADIUS + 2;
    const x = CHAMBER_LEFT + margin + Math.random() * (CHAMBER_RIGHT - CHAMBER_LEFT - 2*margin);
    const y = pistonY + margin + Math.random() * (CHAMBER_BOTTOM - pistonY - 2*margin - 10);
    // Check no overlap with existing particles
    let overlaps = false;
    for (const p of particles) {
      const dx = p.x - x, dy = p.y - y;
      if (Math.sqrt(dx*dx + dy*dy) < 2*RADIUS + 2) { overlaps = true; break; }
    }
    if (!overlaps) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 1.5;
      particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
                       r: RADIUS, color: COLORS[particles.length % COLORS.length],
                       el: null });
    }
  }
  return particles;
}

function updateParticles() {
  const tempFactor = temperature / 40;   // temperature slider 0–100 → speed multiplier
  const RADIUS = 8;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx * tempFactor;
    p.y += p.vy * tempFactor;

    // Wall bouncing
    if (p.x - RADIUS < CHAMBER_LEFT)  { p.x = CHAMBER_LEFT + RADIUS;  p.vx = Math.abs(p.vx); }
    if (p.x + RADIUS > CHAMBER_RIGHT) { p.x = CHAMBER_RIGHT - RADIUS; p.vx = -Math.abs(p.vx); }
    if (p.y + RADIUS > CHAMBER_BOTTOM){ p.y = CHAMBER_BOTTOM - RADIUS; p.vy = -Math.abs(p.vy); }
    if (p.y - RADIUS < pistonY + 22)  { p.y = pistonY + 22 + RADIUS;  p.vy = Math.abs(p.vy); }

    // Elastic particle–particle collisions (no overlap)
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = q.x - p.x, dy = q.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const minDist = 2 * RADIUS;
      if (dist < minDist && dist > 0) {
        // Separate overlapping particles
        const overlap = (minDist - dist) / 2;
        const nx = dx / dist, ny = dy / dist;
        p.x -= nx * overlap; p.y -= ny * overlap;
        q.x += nx * overlap; q.y += ny * overlap;
        // Exchange velocity components along collision normal
        const dvx = p.vx - q.vx, dvy = p.vy - q.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot > 0) {
          p.vx -= dot * nx; p.vy -= dot * ny;
          q.vx += dot * nx; q.vy += dot * ny;
        }
      }
    }

    // Update DOM
    p.el.setAttribute('cx', p.x);
    p.el.setAttribute('cy', p.y);
  }
}

════════════════════════════════════════
SLIDERS — VARIABLE CONTROLS
════════════════════════════════════════

Temperature slider:
  id="tempSlider" min=0 max=100 default=50
  → Directly controls particle speed via tempFactor = temperature / 40
  → Display: "🌡️ Temperature: [value]°"
  → When temperature changes, update label AND animation speed (no re-init needed)
  → Show effect description from student's model near the slider

Pressure slider:
  id="pressSlider" min=0 max=100 default=50
  → Controls pistonY: pistonY = PISTON_MIN_Y + (pressure/100) * (PISTON_MAX_Y - PISTON_MIN_Y)
  → Display: "⚖️ Pressure: [value] atm"
  → When pressure changes:
     1. Update pistonY
     2. Update piston/rod/chamber SVG positions:
        piston.setAttribute('y', pistonY)
        rod.setAttribute('height', pistonY)
        handle.setAttribute('y', pistonY - 16)
        chamber.setAttribute('y', pistonY + 22)
        chamber.setAttribute('height', CHAMBER_BOTTOM - pistonY - 22)
     3. Push any particles above new piston down
  → Show effect description from student's model near the slider

════════════════════════════════════════
INITIAL PARTICLE BEHAVIOR
════════════════════════════════════════

Based on the student's description, set the INITIAL velocity profile:
- If student says particles are slow/still: initialSpeed = 0.3
- If student says particles are fast/energetic: initialSpeed = 2.5
- If student says particles cluster together: initialize them close to center
- If student says particles spread out: initialize them spread evenly
- If student says particles don't move: vx=vy=0 (or very small jitter)
- Reflect any other described behavior in initial state

════════════════════════════════════════
STYLING
════════════════════════════════════════

body {
  margin: 0; padding: 16px;
  background: #0f172a;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  display: flex; flex-direction: column; align-items: center;
}

h2 { font-size: 1rem; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }

#sim { width: 100%; max-width: 700px; height: 360px; display: block; }

.controls {
  width: 100%; max-width: 700px;
  background: #1e293b; border: 1px solid #334155;
  border-radius: 12px; padding: 16px 24px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-top: 12px;
}

.ctrl-group label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px; }
.ctrl-group .val  { font-weight: bold; color: #e2e8f0; }
.ctrl-group input[type=range] { width: 100%; accent-color: #4ade80; cursor: pointer; }
.ctrl-group .effect { font-size: 0.7rem; color: #64748b; margin-top: 4px; font-style: italic; }

════════════════════════════════════════
ANIMATION LOOP
════════════════════════════════════════

let animId;
function loop() {
  updateParticles();
  animId = requestAnimationFrame(loop);
}
// Start on page load
window.addEventListener('load', () => {
  initAndRender();
  loop();
});

════════════════════════════════════════
IMPORTANT REMINDERS
════════════════════════════════════════
- Output ONLY raw HTML, nothing else
- Particles must NEVER visually overlap (use the separation logic above)
- The student's mental model is reflected in initial particle behavior and speed
- Both sliders must work in real time without page reload
- The piston must visually move when pressure changes
- Keep all elements within SVG bounds`;
}

/**
 * API 키 형식을 기본 검증한다 (AIza로 시작하는지 확인).
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return apiKey.trim().startsWith('AIza') && apiKey.trim().length > 20;
}
