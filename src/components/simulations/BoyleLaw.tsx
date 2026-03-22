import { useState, useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type VolumeChoice = 'increase' | 'decrease' | 'constant';
type SpeedChoice  = 'faster'   | 'slower'   | 'same';

interface Particle { x: number; y: number; vx: number; vy: number; color: string; }

// ─────────────────────────────────────────────
// Geometry & display constants
// ─────────────────────────────────────────────
const CW = 300, CH = 270;              // canvas size
const CYL_L = 48, CYL_R = 252;        // inner cylinder left/right x
const CYL_BTM = 248;                   // inner cylinder bottom y
const PISTON_MIN_Y = 60;              // piston at top (max volume, P=1)
const PISTON_H = 20;                  // piston bar height
const R = 7;                          // particle radius
const P_MIN = 1, P_MAX = 4;
const COLORS = ['#4ade80','#60a5fa','#f87171','#fbbf24','#c084fc','#fb923c','#34d399','#818cf8'];

// ─────────────────────────────────────────────
// Physics helpers
// ─────────────────────────────────────────────
/** Boyle's Law: V ∝ 1/P → pistonY increases as P increases */
function correctPistonY(p: number): number {
  const Href = CYL_BTM - PISTON_MIN_Y - PISTON_H; // max chamber height at P=1
  return CYL_BTM - Href / p;
}

function studentPistonY(p: number, choice: VolumeChoice): number {
  const Href = CYL_BTM - PISTON_MIN_Y - PISTON_H;
  switch (choice) {
    case 'decrease': return correctPistonY(p);                                          // correct
    case 'increase': return Math.max(10, PISTON_MIN_Y - (p - P_MIN) / (P_MAX - P_MIN) * 55); // piston moves UP
    case 'constant': return PISTON_MIN_Y + Href * 0.35;                                 // frozen at mid-height
  }
}

function studentSpeedMult(p: number, choice: SpeedChoice): number {
  const base = 2.2;
  switch (choice) {
    case 'same':    return base;
    case 'faster':  return base * (0.6 + 0.4 * (p - P_MIN) / (P_MAX - P_MIN) * 3);
    case 'slower':  return base * (1.4 - 0.8 * (p - P_MIN) / (P_MAX - P_MIN));
  }
}

// ─────────────────────────────────────────────
// Particle system
// ─────────────────────────────────────────────
function initParticles(n: number, pistonY: number): Particle[] {
  const arr: Particle[] = [];
  let tries = 0;
  const chamberTop = pistonY + PISTON_H;
  while (arr.length < n && tries < n * 400) {
    tries++;
    const m = R + 1;
    const x = CYL_L + m + Math.random() * (CYL_R - CYL_L - 2 * m);
    const y = chamberTop + m + Math.random() * (CYL_BTM - chamberTop - 2 * m);
    let ok = true;
    for (const p of arr) {
      const dx = p.x - x, dy = p.y - y;
      if (dx * dx + dy * dy < (2 * R + 2) ** 2) { ok = false; break; }
    }
    if (ok) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.7 + Math.random() * 0.6;
      arr.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: COLORS[arr.length % COLORS.length] });
    }
  }
  return arr;
}

function updateParticles(particles: Particle[], pistonY: number, speedMult: number) {
  const chamberTop = pistonY + PISTON_H;
  for (const p of particles) {
    p.x += p.vx * speedMult;
    p.y += p.vy * speedMult;
    if (p.x - R < CYL_L)   { p.x = CYL_L + R;   p.vx =  Math.abs(p.vx); }
    if (p.x + R > CYL_R)   { p.x = CYL_R - R;   p.vx = -Math.abs(p.vx); }
    if (p.y + R > CYL_BTM) { p.y = CYL_BTM - R; p.vy = -Math.abs(p.vy); }
    if (p.y - R < chamberTop) { p.y = chamberTop + R; p.vy = Math.abs(p.vy); }
  }
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      const minD = 2 * R;
      if (d2 < minD * minD && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const nx = dx / d, ny = dy / d;
        const ov = (minD - d) / 2;
        a.x -= nx * ov; a.y -= ny * ov;
        b.x += nx * ov; b.y += ny * ov;
        const dv = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (dv > 0) {
          a.vx -= dv * nx; a.vy -= dv * ny;
          b.vx += dv * nx; b.vy += dv * ny;
        }
      }
    }
  }
}

// ─────────────────────────────────────────────
// Canvas drawing
// ─────────────────────────────────────────────
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  pistonY: number,
  label: string,
  accentColor: string
) {
  const chamberTop = pistonY + PISTON_H;
  const rodX = (CYL_L + CYL_R) / 2;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CW, CH);

  // Gas chamber background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(CYL_L, chamberTop, CYL_R - CYL_L, CYL_BTM - chamberTop);

  // Particles
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  // Cylinder walls (over particles)
  ctx.fillStyle = '#64748b';
  ctx.fillRect(CYL_L - 22, 36, 22, CYL_BTM - 36 + 18); // left wall
  ctx.fillRect(CYL_R,      36, 22, CYL_BTM - 36 + 18); // right wall
  ctx.fillRect(CYL_L - 22, CYL_BTM, CYL_R - CYL_L + 44, 18); // bottom

  // Top cap
  ctx.fillStyle = '#475569';
  ctx.fillRect(CYL_L - 22, 28, CYL_R - CYL_L + 44, 14);

  // Rod hole in top cap
  ctx.fillStyle = '#64748b';
  ctx.fillRect(rodX - 5, 24, 10, 20);

  // Piston rod
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(rodX - 5, 0, 10, pistonY);

  // T-handle
  ctx.fillStyle = '#1e293b';
  rr(ctx, rodX - 36, 1, 72, 18, 5);
  ctx.fill();
  ctx.fillStyle = '#475569';
  rr(ctx, rodX - 34, 2, 68, 16, 4);
  ctx.fill();

  // Piston body
  ctx.fillStyle = '#475569';
  rr(ctx, CYL_L, pistonY, CYL_R - CYL_L, PISTON_H, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  rr(ctx, CYL_L, pistonY, CYL_R - CYL_L, 8, 3);
  ctx.fill();

  // Panel label at bottom
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, CW / 2, CH - 5);

  // GAS label inside chamber
  const chamberH = CYL_BTM - chamberTop;
  if (chamberH > 18) {
    ctx.fillStyle = 'rgba(148,163,184,0.35)';
    ctx.font = `${Math.min(14, chamberH * 0.25)}px system-ui`;
    ctx.fillText('GAS', rodX, chamberTop + chamberH / 2 + 5);
  }
}

// ─────────────────────────────────────────────
// P-V Graph (SVG)
// ─────────────────────────────────────────────
const GW = 280, GH = 110;
const GP = { t: 12, r: 12, b: 28, l: 36 };

function pvX(p: number) { return GP.l + ((p - P_MIN) / (P_MAX - P_MIN)) * (GW - GP.l - GP.r); }
function pvY(v: number) { return GP.t + (1 - v) * (GH - GP.t - GP.b); }

// Normalize volume to 0–1 for graphing
function correctVNorm(p: number) { return (1 / p) / (1 / P_MIN); }
function studentVNorm(p: number, choice: VolumeChoice) {
  const Href = CYL_BTM - PISTON_MIN_Y - PISTON_H;
  const py = studentPistonY(p, choice);
  const ch = CYL_BTM - py - PISTON_H;
  const maxCh = Href;
  return Math.max(0, ch / maxCh);
}

function PVGraph({ pressure, volumeChoice }: { pressure: number; volumeChoice: VolumeChoice }) {
  const steps = 60;
  const correctPath = Array.from({ length: steps }, (_, i) => {
    const p = P_MIN + i * (P_MAX - P_MIN) / (steps - 1);
    return `${pvX(p)},${pvY(correctVNorm(p))}`;
  }).join(' ');

  const studentPath = Array.from({ length: steps }, (_, i) => {
    const p = P_MIN + i * (P_MAX - P_MIN) / (steps - 1);
    return `${pvX(p)},${pvY(studentVNorm(p, volumeChoice))}`;
  }).join(' ');

  const cx = pvX(pressure);
  const cy_c = pvY(correctVNorm(pressure));
  const cy_s = pvY(studentVNorm(pressure, volumeChoice));

  return (
    <svg width={GW} height={GH} className="overflow-visible">
      {/* Axes */}
      <line x1={GP.l} y1={GP.t} x2={GP.l} y2={GH - GP.b} stroke="#475569" strokeWidth={1} />
      <line x1={GP.l} y1={GH - GP.b} x2={GW - GP.r} y2={GH - GP.b} stroke="#475569" strokeWidth={1} />
      {/* Axis labels */}
      <text x={GW / 2} y={GH - 2} textAnchor="middle" fontSize={9} fill="#64748b">압력 (P)</text>
      <text x={10} y={(GP.t + GH - GP.b) / 2} textAnchor="middle" fontSize={9} fill="#64748b"
        transform={`rotate(-90, 10, ${(GP.t + GH - GP.b) / 2})`}>부피 (V)</text>
      {/* Tick marks */}
      {[1,2,3,4].map(p => (
        <g key={p}>
          <line x1={pvX(p)} y1={GH - GP.b} x2={pvX(p)} y2={GH - GP.b + 3} stroke="#475569" strokeWidth={1} />
          <text x={pvX(p)} y={GH - GP.b + 10} textAnchor="middle" fontSize={8} fill="#64748b">{p}</text>
        </g>
      ))}
      {/* Student curve */}
      {volumeChoice !== 'decrease' && (
        <polyline points={studentPath} fill="none" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5,3" />
      )}
      {/* Correct curve */}
      <polyline points={correctPath} fill="none" stroke="#4ade80" strokeWidth={2} />
      {/* Pressure indicator line */}
      <line x1={cx} y1={GP.t} x2={cx} y2={GH - GP.b} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
      {/* Current point dots */}
      <circle cx={cx} cy={cy_c} r={4} fill="#4ade80" />
      {volumeChoice !== 'decrease' && (
        <circle cx={cx} cy={cy_s} r={4} fill="#60a5fa" />
      )}
      {/* Legend */}
      <circle cx={GP.l + 2} cy={GP.t + 4} r={3} fill="#4ade80" />
      <text x={GP.l + 8} y={GP.t + 8} fontSize={8} fill="#4ade80">실제</text>
      {volumeChoice !== 'decrease' && (
        <>
          <line x1={GP.l + 28} y1={GP.t + 4} x2={GP.l + 38} y2={GP.t + 4} stroke="#60a5fa" strokeWidth={2} strokeDasharray="3,2" />
          <text x={GP.l + 42} y={GP.t + 8} fontSize={8} fill="#60a5fa">예측</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Choice card helper
// ─────────────────────────────────────────────
function ChoiceCard({
  label, sub, selected, onClick,
}: {
  label: string; sub?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
        selected
          ? 'border-scigreen-500 bg-scigreen-600 bg-opacity-20 text-white'
          : 'border-navy-600 bg-navy-900 text-gray-300 hover:border-navy-500 hover:text-white'
      }`}
    >
      <span className="font-sans text-sm">{label}</span>
      {sub && <span className="block font-mono text-xs text-gray-500 mt-0.5">{sub}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────
// Feedback message
// ─────────────────────────────────────────────
const VOLUME_FEEDBACK: Record<VolumeChoice, { icon: string; title: string; body: string }> = {
  decrease: {
    icon: '✓',
    title: '부피 예측 정확!',
    body: '보일의 법칙: 온도가 일정할 때 압력이 증가하면 부피는 반비례하여 감소합니다. (P × V = 일정)',
  },
  increase: {
    icon: '✗',
    title: '부피 예측 오류',
    body: '압력이 기체를 밀어 붙이므로 부피는 작아집니다. 입자들이 더 좁은 공간에 갇힙니다. (P × V = 일정)',
  },
  constant: {
    icon: '✗',
    title: '부피 예측 오류',
    body: '압력이 달라지면 부피도 반드시 달라집니다. 피스톤이 기체를 압축하거나 팽창시킵니다.',
  },
};

const SPEED_FEEDBACK: Record<SpeedChoice, { icon: string; title: string; body: string }> = {
  same: {
    icon: '✓',
    title: '입자 속도 예측 정확!',
    body: '보일의 법칙은 온도가 일정한(등온) 과정입니다. 온도 = 평균 운동 에너지이므로 속도는 변하지 않습니다.',
  },
  faster: {
    icon: '✗',
    title: '입자 속도 예측 오류',
    body: '입자 속도는 온도에 의해 결정됩니다. 온도가 일정하면 속도도 일정합니다. 압력이 올라도 속도는 그대로입니다.',
  },
  slower: {
    icon: '✗',
    title: '입자 속도 예측 오류',
    body: '입자 속도는 온도에 의해 결정됩니다. 온도가 일정하면 속도도 일정합니다. 압력이 올라도 속도는 그대로입니다.',
  },
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function BoyleLaw() {
  const [phase, setPhase] = useState<'predict' | 'simulate' | 'feedback'>('predict');
  const [step, setStep] = useState<1 | 2>(1);
  const [volumeChoice, setVolumeChoice] = useState<VolumeChoice | null>(null);
  const [speedChoice, setSpeedChoice]   = useState<SpeedChoice  | null>(null);
  const [pressure, setPressure] = useState(P_MIN);

  const leftRef  = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const animRef  = useRef(0);

  // Use refs to avoid stale closures in RAF loop
  const pressureRef     = useRef(pressure);
  const volumeChoiceRef = useRef(volumeChoice);
  const speedChoiceRef  = useRef(speedChoice);
  useEffect(() => { pressureRef.current = pressure; },         [pressure]);
  useEffect(() => { volumeChoiceRef.current = volumeChoice; }, [volumeChoice]);
  useEffect(() => { speedChoiceRef.current  = speedChoice;  }, [speedChoice]);

  // Animation loop (only active during 'simulate' phase)
  useEffect(() => {
    if (phase !== 'simulate') return;
    cancelAnimationFrame(animRef.current);

    const initP = P_MIN;
    const initPistonY = correctPistonY(initP);
    const leftParticles  = initParticles(22, initPistonY);
    const rightParticles = initParticles(22, initPistonY);

    let leftPY  = initPistonY;
    let rightPY = initPistonY;

    const loop = () => {
      const p   = pressureRef.current;
      const vc  = volumeChoiceRef.current!;
      const sc  = speedChoiceRef.current!;

      const targetLeft  = studentPistonY(p, vc);
      const targetRight = correctPistonY(p);

      // Smooth piston movement
      leftPY  += (targetLeft  - leftPY)  * 0.06;
      rightPY += (targetRight - rightPY) * 0.06;

      const leftSpeed  = studentSpeedMult(p, sc);
      const rightSpeed = 2.2; // correct: isothermal → constant speed

      updateParticles(leftParticles,  leftPY,  leftSpeed);
      updateParticles(rightParticles, rightPY, rightSpeed);

      const lCtx = leftRef.current?.getContext('2d');
      const rCtx = rightRef.current?.getContext('2d');
      if (lCtx) drawPanel(lCtx, leftParticles,  leftPY,  '내 예측', '#60a5fa');
      if (rCtx) drawPanel(rCtx, rightParticles, rightPY, '실제 결과', '#4ade80');

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const handleStartSimulation = useCallback(() => {
    setPressure(P_MIN);
    setPhase('simulate');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('predict');
    setStep(1);
    setVolumeChoice(null);
    setSpeedChoice(null);
    setPressure(P_MIN);
  }, []);

  // ── Phase 1: Prediction ─────────────────────
  if (phase === 'predict') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-scigreen-600 bg-opacity-20 border border-scigreen-600 flex items-center justify-center">
              <span className="text-scigreen-400 font-mono text-xs font-bold">B</span>
            </div>
            <div>
              <h2 className="font-mono text-sm text-white font-bold">보일의 법칙</h2>
              <p className="font-mono text-xs text-gray-500">Boyle's Law · 압력-부피 관계</p>
            </div>
          </div>
          <p className="font-sans text-sm text-gray-300 leading-relaxed">
            온도가 일정한 실린더 안에 기체가 있습니다. 피스톤으로 <strong className="text-white">압력을 변화</strong>시킬 때
            어떤 일이 일어날지 예측해보세요.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 items-center font-mono text-xs text-gray-600">
          <span className={step === 1 ? 'text-scigreen-400 font-bold' : ''}>① 부피 예측</span>
          <span>→</span>
          <span className={step === 2 ? 'text-scigreen-400 font-bold' : ''}>② 입자 속도 예측</span>
          <span>→</span>
          <span>결과 확인</span>
        </div>

        {/* Step 1: Volume */}
        {step === 1 && (
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 space-y-4">
            <p className="font-sans text-sm text-white font-semibold">
              압력이 증가하면 기체의 <span className="text-scigreen-400">부피</span>는 어떻게 될까요?
            </p>
            <div className="space-y-2">
              <ChoiceCard
                label="부피가 커진다 (압력 ↑ → 부피 ↑)"
                sub="압력이 클수록 기체가 더 팽창한다"
                selected={volumeChoice === 'increase'}
                onClick={() => setVolumeChoice('increase')}
              />
              <ChoiceCard
                label="부피가 작아진다 (압력 ↑ → 부피 ↓)"
                sub="압력이 클수록 기체가 압축된다"
                selected={volumeChoice === 'decrease'}
                onClick={() => setVolumeChoice('decrease')}
              />
              <ChoiceCard
                label="부피는 변하지 않는다"
                sub="압력이 변해도 부피는 일정하다"
                selected={volumeChoice === 'constant'}
                onClick={() => setVolumeChoice('constant')}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!volumeChoice}
              className="w-full bg-scigreen-600 hover:bg-scigreen-500 disabled:bg-navy-700 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-mono text-sm py-3 rounded-xl transition-colors"
            >
              다음 →
            </button>
          </div>
        )}

        {/* Step 2: Particle speed */}
        {step === 2 && (
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 space-y-4">
            <p className="font-sans text-sm text-white font-semibold">
              압력이 증가할 때 입자들의 <span className="text-scigreen-400">운동 속도</span>는 어떻게 될까요?
            </p>
            <p className="font-sans text-xs text-gray-500">
              (온도는 변하지 않는다고 가정합니다)
            </p>
            <div className="space-y-2">
              <ChoiceCard
                label="입자들이 더 빠르게 움직인다"
                sub="압력이 높을수록 에너지가 많아진다"
                selected={speedChoice === 'faster'}
                onClick={() => setSpeedChoice('faster')}
              />
              <ChoiceCard
                label="입자들의 속도는 변하지 않는다"
                sub="온도가 같으므로 운동 에너지도 같다"
                selected={speedChoice === 'same'}
                onClick={() => setSpeedChoice('same')}
              />
              <ChoiceCard
                label="입자들이 더 느리게 움직인다"
                sub="압력을 받으면 입자가 느려진다"
                selected={speedChoice === 'slower'}
                onClick={() => setSpeedChoice('slower')}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-navy-600 hover:border-navy-500 text-gray-400 hover:text-white font-mono text-sm py-3 rounded-xl transition-colors"
              >
                ← 이전
              </button>
              <button
                onClick={handleStartSimulation}
                disabled={!speedChoice}
                className="flex-1 bg-scigreen-600 hover:bg-scigreen-500 disabled:bg-navy-700 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-mono text-sm py-3 rounded-xl transition-colors"
              >
                시뮬레이션 시작
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Phase 2 & 3: Simulation (+ optional feedback overlay) ──
  const vFb = VOLUME_FEEDBACK[volumeChoice!];
  const sFb = SPEED_FEEDBACK[speedChoice!];
  const bothCorrect = volumeChoice === 'decrease' && speedChoice === 'same';

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm text-white font-bold">보일의 법칙 — 시뮬레이션</h2>
          <p className="font-mono text-xs text-gray-500">슬라이더로 압력을 변화시켜 보세요</p>
        </div>
        <button
          onClick={handleReset}
          className="font-mono text-xs text-gray-500 hover:text-scigreen-400 border border-navy-600 hover:border-scigreen-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          ← 다시 예측
        </button>
      </div>

      {/* Two simulation panels */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Left: student model */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-mono text-xs text-blue-400">내 예측 모델</span>
          </div>
          <canvas
            ref={leftRef}
            width={CW} height={CH}
            className="rounded-xl border border-navy-600"
          />
          <div className="w-full">
            <PVGraph pressure={pressure} volumeChoice={volumeChoice!} />
          </div>
        </div>

        {/* Right: correct model */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-scigreen-400" />
            <span className="font-mono text-xs text-scigreen-400">실제 결과 (보일의 법칙)</span>
          </div>
          <canvas
            ref={rightRef}
            width={CW} height={CH}
            className="rounded-xl border border-navy-600"
          />
          <div className="w-full">
            {/* Correct reference curve only */}
            <PVGraph pressure={pressure} volumeChoice="decrease" />
          </div>
        </div>
      </div>

      {/* Shared pressure slider */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-gray-400">⚖️ 압력 조절</span>
          <span className="font-mono text-sm text-white font-bold">{pressure.toFixed(1)} atm</span>
        </div>
        <input
          type="range"
          min={P_MIN} max={P_MAX} step={0.05}
          value={pressure}
          onChange={(e) => setPressure(Number(e.target.value))}
          className="w-full accent-scigreen-500 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="font-mono text-xs text-gray-600">저압 (1 atm)</span>
          <span className="font-mono text-xs text-gray-600">고압 (4 atm)</span>
        </div>
      </div>

      {/* Feedback / Check button */}
      {phase === 'simulate' && (
        <button
          onClick={() => setPhase('feedback')}
          className="w-full bg-navy-700 hover:bg-navy-600 border border-navy-500 hover:border-scigreen-600 text-gray-300 hover:text-white font-mono text-sm py-3 rounded-xl transition-all"
        >
          내 예측이 맞는지 확인하기 →
        </button>
      )}

      {/* Feedback panel */}
      {phase === 'feedback' && (
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-2xl ${bothCorrect ? 'text-scigreen-400' : 'text-yellow-400'}`}>
              {bothCorrect ? '🎉' : '💡'}
            </span>
            <h3 className="font-mono text-sm text-white font-bold">
              {bothCorrect ? '완벽한 예측입니다!' : '확인해볼 내용이 있어요'}
            </h3>
          </div>

          {/* Volume feedback */}
          <div className={`rounded-xl p-4 border ${
            vFb.icon === '✓'
              ? 'bg-scigreen-600 bg-opacity-10 border-scigreen-600 border-opacity-30'
              : 'bg-red-600 bg-opacity-10 border-red-600 border-opacity-30'
          }`}>
            <p className={`font-mono text-xs font-bold mb-1 ${vFb.icon === '✓' ? 'text-scigreen-400' : 'text-red-400'}`}>
              {vFb.icon} 부피 예측 — {vFb.title}
            </p>
            <p className="font-sans text-sm text-gray-300 leading-relaxed">{vFb.body}</p>
          </div>

          {/* Speed feedback */}
          <div className={`rounded-xl p-4 border ${
            sFb.icon === '✓'
              ? 'bg-scigreen-600 bg-opacity-10 border-scigreen-600 border-opacity-30'
              : 'bg-red-600 bg-opacity-10 border-red-600 border-opacity-30'
          }`}>
            <p className={`font-mono text-xs font-bold mb-1 ${sFb.icon === '✓' ? 'text-scigreen-400' : 'text-red-400'}`}>
              {sFb.icon} 입자 속도 — {sFb.title}
            </p>
            <p className="font-sans text-sm text-gray-300 leading-relaxed">{sFb.body}</p>
          </div>

          {/* Key formula */}
          <div className="bg-navy-900 rounded-xl p-4 text-center">
            <p className="font-mono text-xs text-gray-500 mb-1">보일의 법칙 핵심 공식</p>
            <p className="font-mono text-lg text-scigreen-400 font-bold">P × V = 일정 (온도 T 고정)</p>
            <p className="font-sans text-xs text-gray-500 mt-1">압력이 2배 → 부피는 1/2배 · 압력이 3배 → 부피는 1/3배</p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-scigreen-600 hover:bg-scigreen-500 text-white font-mono text-sm py-3 rounded-xl transition-colors"
          >
            다시 예측해보기
          </button>
        </div>
      )}
    </div>
  );
}
