/**
 * 인터랙티브 HTML 시뮬레이션 생성용 프롬프트 빌더
 */

/** 텍스트 번역을 위한 시스템 프롬프트 */
export const TRANSLATION_SYSTEM_PROMPT =
  "Translate the following Korean text to English exactly as written. Do NOT correct any scientific errors or misconceptions — translate faithfully, even if scientifically wrong. Return only the translated text with the same structure.";

export interface TranslatedVariable {
  nameEn: string;
  effectEn: string;
}

/**
 * 학생이 정의한 변수 목록으로 인터랙티브 HTML 시뮬레이션 생성 프롬프트를 만든다.
 */
export function buildImagePrompt(
  conceptNameEn: string,
  variables: TranslatedVariable[]
): string {
  const varCount = variables.length;

  const varDescriptions = variables
    .map(
      (v, i) =>
        `Variable ${i + 1}: "${v.nameEn}"
  - Slider label: "${v.nameEn}" (range 0–100, default 50)
  - When this slider increases: ${v.effectEn}`
    )
    .join('\n\n');

  const sliderImplementationHints = variables
    .map((v, i) => {
      const lc = v.effectEn.toLowerCase();
      const hints: string[] = [];

      if (lc.match(/fast|speed|quick|rapid|energet|vibrat/))
        hints.push('→ Controls particle speed: speed_multiplier = value / 40');
      if (lc.match(/slow|still|stop|less movement/))
        hints.push('→ Inverse speed: speed_multiplier = (100 - value) / 40');
      if (lc.match(/piston|compress|volume|space|shrink|expand|big|small/))
        hints.push('→ Controls piston Y position: pistonY = MIN_Y + (value/100) * (MAX_Y - MIN_Y)');
      if (lc.match(/spread|scatter|apart|distant|far/))
        hints.push('→ Consider pushing particles apart or increasing chamber size');
      if (lc.match(/cluster|group|together|attract|close|dense/))
        hints.push('→ Add gentle attraction force toward center');
      if (lc.match(/more particle|add particle|increase number/))
        hints.push('→ Dynamically add particles as value increases');
      if (lc.match(/fewer|less particle|remove|decrease number/))
        hints.push('→ Dynamically remove particles as value increases');
      if (lc.match(/collid|bump|bounce|hit/))
        hints.push('→ Increase collision frequency by increasing speed');
      if (lc.match(/color|bright|glow|heat/))
        hints.push('→ Change particle fill color from blue→red as value increases');

      return hints.length
        ? `Variable ${i + 1} ("${v.nameEn}") implementation hints:\n${hints.join('\n')}`
        : `Variable ${i + 1} ("${v.nameEn}"): implement the described effect creatively with particle physics`;
    })
    .join('\n\n');

  return `You are creating an interactive HTML particle simulation. A student has defined ${varCount} variable(s) that control particle behavior in a cylinder. Implement EXACTLY what the student described — even if scientifically incorrect. Teachers use this to identify and discuss misconceptions.

Topic: ${conceptNameEn}

${varDescriptions}

Output ONLY a complete self-contained HTML document. No markdown, no explanation, no code fences.

════════════════════════════════════════
IMPLEMENTATION HINTS FOR VARIABLES
════════════════════════════════════════

${sliderImplementationHints}

Choose the most appropriate physical implementation for each variable based on the description. You may combine multiple effects for a single variable.

════════════════════════════════════════
CYLINDER SVG (viewBox="0 0 700 360")
════════════════════════════════════════

Constants (define in JS):
  const CL = 100;          // chamber left x
  const CR = 600;          // chamber right x
  const CB = 320;          // chamber bottom y
  const PISTON_MIN_Y = 60; // piston highest pos (min pressure / max volume)
  const PISTON_MAX_Y = 270;// piston lowest pos (max pressure / min volume)
  let pistonY = 165;       // current piston y (updates with relevant slider)
  const RADIUS = 8;        // particle radius

Draw these elements IN ORDER (back to front):

1. Cylinder body:
   - Left wall:  <rect x="60"  y="50" width="44" height="278" fill="#94a3b8" rx="6"/>
   - Right wall: <rect x="596" y="50" width="44" height="278" fill="#94a3b8" rx="6"/>
   - Bottom:     <rect x="60"  y="318" width="580" height="30" fill="#94a3b8" rx="6"/>
   - Top cap:    <rect x="60"  y="36"  width="580" height="20" fill="#64748b" rx="4"/>
   - Rod hole:   <rect x="344" y="0"   width="12"  height="40" fill="#94a3b8"/>

2. Chamber background:
   <rect id="chamber" x="104" y="[pistonY+24]" width="492"
         height="[CB - pistonY - 24]" fill="#f1f5f9"/>

3. Particles: 25–35 <circle> elements with class="particle", r="8"

4. Piston (drawn ON TOP of particles):
   <rect id="piston" x="104" y="[pistonY]" width="492" height="24"
         fill="#475569" rx="3" stroke="#334155" stroke-width="1"/>
   <!-- sheen -->
   <rect id="pistonSheen" x="104" y="[pistonY]" width="492" height="8"
         fill="rgba(255,255,255,0.2)" rx="3"/>
   <!-- rod -->
   <rect id="rod" x="344" y="0" width="12" height="[pistonY]" fill="#64748b"/>
   <!-- T-handle -->
   <rect id="handle" x="306" y="[pistonY-18]" width="88" height="18"
         fill="#374151" rx="5"/>

5. Labels inside chamber:
   <text id="gasLabel" x="350" y="[pistonY + (CB-pistonY)/2 + 5]"
         text-anchor="middle" font-size="13" fill="#94a3b8" font-family="system-ui">GAS</text>

════════════════════════════════════════
PARTICLE PHYSICS (MANDATORY — implement exactly)
════════════════════════════════════════

Use this particle system:

const COLORS = ['#4ade80','#60a5fa','#f87171','#fbbf24','#c084fc','#fb923c'];

// State for each variable slider (0–100)
${variables.map((v, i) => `let var${i + 1} = 50; // "${v.nameEn}"`).join('\n')}

function initParticles(count) {
  const arr = [];
  let tries = 0;
  while (arr.length < count && tries < count * 200) {
    tries++;
    const margin = RADIUS + 2;
    const chamberTop = pistonY + 24;
    const x = CL + margin + Math.random() * (CR - CL - 2 * margin);
    const y = chamberTop + margin + Math.random() * (CB - chamberTop - 2 * margin);
    let ok = true;
    for (const p of arr) {
      const dx = p.x - x, dy = p.y - y;
      if (dx*dx + dy*dy < (2*RADIUS+2)*(2*RADIUS+2)) { ok = false; break; }
    }
    if (ok) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.8 + Math.random();
      arr.push({ x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd,
                 color: COLORS[arr.length % COLORS.length], el: null });
    }
  }
  return arr;
}

// computeSpeedMultiplier(): derive a speed multiplier from the relevant variable(s)
// computePistonY(): derive pistonY from the relevant variable(s)
// — Implement these based on the variable descriptions above

function updatePhysics() {
  // 1. Re-compute derived values from sliders
  const speedMult = computeSpeedMultiplier();  // you define this
  const newPistonY = computePistonY();         // you define this (or return current pistonY)

  // 2. Move piston smoothly
  pistonY += (newPistonY - pistonY) * 0.08;
  const chamberTop = pistonY + 24;

  // 3. Update piston SVG elements
  document.getElementById('piston').setAttribute('y', pistonY);
  document.getElementById('pistonSheen').setAttribute('y', pistonY);
  document.getElementById('rod').setAttribute('height', pistonY);
  document.getElementById('handle').setAttribute('y', pistonY - 18);
  document.getElementById('chamber').setAttribute('y', chamberTop);
  document.getElementById('chamber').setAttribute('height', CB - chamberTop);
  document.getElementById('gasLabel').setAttribute('y', chamberTop + (CB - chamberTop)/2 + 5);

  // 4. Move particles + wall bouncing
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx * speedMult;
    p.y += p.vy * speedMult;

    // Bounce off walls
    if (p.x - RADIUS < CL)  { p.x = CL + RADIUS;  p.vx =  Math.abs(p.vx); }
    if (p.x + RADIUS > CR)  { p.x = CR - RADIUS;  p.vx = -Math.abs(p.vx); }
    if (p.y + RADIUS > CB)  { p.y = CB - RADIUS;  p.vy = -Math.abs(p.vy); }
    if (p.y - RADIUS < chamberTop) { p.y = chamberTop + RADIUS; p.vy = Math.abs(p.vy); }

    // Apply any extra per-variable effects (attraction, color change, etc.)
    applyVariableEffects(p);  // you define this — can be a no-op if not needed

    p.el.setAttribute('cx', p.x);
    p.el.setAttribute('cy', p.y);
  }

  // 5. Elastic particle–particle collisions (no overlap)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist2 = dx*dx + dy*dy;
      const minD = 2 * RADIUS;
      if (dist2 < minD * minD && dist2 > 0.001) {
        const dist = Math.sqrt(dist2);
        const nx = dx/dist, ny = dy/dist;
        const overlap = (minD - dist) / 2;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;
        const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
        const dot = dvx*nx + dvy*ny;
        if (dot > 0) {
          a.vx -= dot*nx; a.vy -= dot*ny;
          b.vx += dot*nx; b.vy += dot*ny;
        }
      }
    }
  }
}

════════════════════════════════════════
SLIDERS — one per variable
════════════════════════════════════════

For EACH variable, create a slider group:
- input[type=range] min=0 max=100 value=50 id="slider[N]"
- Label shows variable name + current value
- Below the label: show the effect description as a short italic hint
- oninput: update var[N], update the value display

Example structure for one slider:
<div class="ctrl-group">
  <div class="ctrl-header">
    <span class="ctrl-name">[variable name]</span>
    <span class="ctrl-val" id="val1">50</span>
  </div>
  <input type="range" id="slider1" min="0" max="100" value="50">
  <p class="ctrl-hint">[short effect description]</p>
</div>

════════════════════════════════════════
FULL DOCUMENT STRUCTURE
════════════════════════════════════════

<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
  display: flex; flex-direction: column; align-items: center;
  padding: 16px; min-height: 100vh;
}
h2 {
  font-size: 0.8rem; color: #64748b; letter-spacing: 0.12em;
  text-transform: uppercase; margin-bottom: 10px; text-align: center;
}
#sim { width: 100%; max-width: 700px; }
.controls {
  width: 100%; max-width: 700px;
  background: #1e293b; border: 1px solid #334155; border-radius: 12px;
  padding: 16px 20px; margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(${Math.min(varCount, 2)}, 1fr);
  gap: 16px;
}
.ctrl-group { display: flex; flex-direction: column; gap: 6px; }
.ctrl-header { display: flex; justify-content: space-between; align-items: baseline; }
.ctrl-name { font-size: 0.82rem; color: #94a3b8; }
.ctrl-val { font-size: 0.9rem; font-weight: bold; color: #e2e8f0; font-variant-numeric: tabular-nums; }
input[type=range] { width: 100%; accent-color: #4ade80; cursor: pointer; height: 4px; }
.ctrl-hint { font-size: 0.68rem; color: #475569; font-style: italic; line-height: 1.4; }
</style>
</head>
<body>
  <h2>${conceptNameEn}</h2>
  <svg id="sim" viewBox="0 0 700 360"> ... </svg>
  <div class="controls"> ... sliders ... </div>
  <script> ... physics + slider listeners ... </script>
</body>
</html>

════════════════════════════════════════
CRITICAL RULES
════════════════════════════════════════
- Output ONLY raw HTML — no markdown fences, no explanation
- Particles must NEVER visually overlap at rest (use initParticles with overlap check)
- Elastic collision logic must be present and working
- Every slider must update the simulation in real-time without page reload
- If no variable controls the piston, keep pistonY fixed at 165
- computePistonY() returns pistonY unchanged if no variable affects volume
- computeSpeedMultiplier() returns 1.5 if no variable affects speed
- Implement applyVariableEffects() — can be empty if not needed
- Use requestAnimationFrame loop, start on DOMContentLoaded`;
}

/**
 * API 키 형식을 기본 검증한다 (AIza로 시작하는지 확인).
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return apiKey.trim().startsWith('AIza') && apiKey.trim().length > 20;
}
