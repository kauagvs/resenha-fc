/**
 * Fogos de artifício numa camada de canvas por cima da página (sem bloquear cliques).
 * O canvas só existe enquanto há partícula no ar.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  /** Foguete subindo; explode ao chegar em `targetY`. */
  rocket?: { targetY: number; colors: string[]; sparks: number };
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let frame = 0;
let pixelMode = false;
let dpr = 1;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
}

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "40",
  });
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
}

function teardown() {
  cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener("resize", resize);
  canvas?.remove();
  canvas = null;
  ctx = null;
}

function explode(x: number, y: number, colors: string[], sparks: number) {
  for (let i = 0; i < sparks; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.5 + Math.random() * 4.5) * dpr;
    const maxLife = 55 + Math.random() * 35;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      color: colors[i % colors.length]!,
      size: (pixelMode ? 4 : 2 + Math.random() * 1.5) * dpr,
    });
  }
}

function tick() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const born: Particle[] = [];
  particles = particles.filter((p) => {
    const px = p.x;
    const py = p.y;
    p.x += p.vx;
    p.y += p.vy;

    if (p.rocket) {
      p.vy *= 0.985;
      if (p.y <= p.rocket.targetY || p.vy > -1) {
        born.push(p);
        return false;
      }
    } else {
      p.vx *= 0.975;
      p.vy = p.vy * 0.975 + 0.05 * dpr; // gravidade
      p.life--;
    }

    const alpha = p.rocket ? 1 : Math.max(p.life / p.maxLife, 0);
    ctx!.globalAlpha = alpha;
    ctx!.fillStyle = p.color;
    ctx!.strokeStyle = p.color;
    if (pixelMode) {
      const s = p.size;
      ctx!.fillRect(Math.round(p.x / s) * s, Math.round(p.y / s) * s, s, s);
    } else {
      ctx!.lineWidth = p.size;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.moveTo(px, py);
      ctx!.lineTo(p.x, p.y);
      ctx!.stroke();
    }
    return p.life > 0;
  });
  for (const r of born) explode(r.x, r.y, r.rocket!.colors, r.rocket!.sparks);

  ctx.globalAlpha = 1;
  if (particles.length) frame = requestAnimationFrame(tick);
  else teardown();
}

/** Solta `bursts` foguetes do pé da tela, que explodem nas cores dadas. */
export function fireworks({
  colors,
  bursts = 3,
  sparks = 70,
  pixel = false,
}: {
  colors: string[];
  bursts?: number;
  sparks?: number;
  pixel?: boolean;
}) {
  if (prefersReducedMotion() || colors.length === 0) return;
  pixelMode = pixel;
  ensureCanvas();
  const w = window.innerWidth * dpr;
  const h = window.innerHeight * dpr;

  // O primeiro estoura na hora, junto com o "GOL!"; os outros sobem como foguetes.
  explode(w * (0.25 + Math.random() * 0.5), h * (0.2 + Math.random() * 0.15), colors, sparks);
  if (!frame) frame = requestAnimationFrame(tick);

  for (let i = 1; i < bursts; i++) {
    setTimeout(() => {
      if (!canvas) ensureCanvas();
      const color = colors[i % colors.length]!;
      particles.push({
        x: w * (0.15 + Math.random() * 0.7),
        y: h,
        vx: (Math.random() - 0.5) * 1.5 * dpr,
        vy: -(13 + Math.random() * 4) * dpr,
        life: 1,
        maxLife: 1,
        color,
        size: (pixel ? 4 : 2.5) * dpr,
        rocket: { targetY: h * (0.15 + Math.random() * 0.3), colors, sparks },
      });
      if (!frame) frame = requestAnimationFrame(tick);
    }, (i - 1) * 160);
  }
}

/** Lê uma cor do tema atual (muda no modo 8-bit). */
export function themeColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "#ffffff";
}
