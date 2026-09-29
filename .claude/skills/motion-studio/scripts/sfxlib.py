"""motion-studio sound library: synthesised score and sound design with numpy, no samples, no licences.

Typical use (see score_example.py):
    from sfxlib import Mix, whoosh, thump, clank, bell, pad, tick, riser, noise_band, midi
    m = Mix(duration=15)
    m.place(thump(), t0=2.9, gain=.9)
    m.place(pad([50, 57, 62], 4.0), t0=0, gain=.5, reverb=.5)
    m.write('score.wav'); m.report()

Everything is deterministic for a given seed. Times are in seconds; pan is -1 (left) .. 1 (right).
"""
import wave
import numpy as np

SR = 48000
_rng = np.random.default_rng(7)


def seed(s):
    global _rng
    _rng = np.random.default_rng(s)


def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def noise_band(d, lo, hi):
    """Band-limited noise normalised to +-1 (FFT mask - fast, no filter state)."""
    n = int(d * SR)
    X = np.fft.rfft(_rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def env_ar(d, attack, release):
    t = tt(d)
    return np.minimum(1, t / max(attack, 1e-4)) * np.clip((d - t) / max(release, 1e-4), 0, 1)


# ---------- building blocks ----------
def tick(bright=1.0, d=.06):
    """Mechanical click (clocks, UI, counters)."""
    t = tt(d)
    return noise_band(d, 1800, 9000) * np.exp(-t * 320) * .8 + np.sin(2 * np.pi * 3100 * bright * t) * np.exp(-t * 110) * .35


def thump(d=.5, f0=60, decay=8):
    """Pitch-dropping body hit / kick drum."""
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 1.5 * np.exp(-t * 30))) / SR
    return np.sin(ph) * np.exp(-t * decay)


def boom(d=3.0, f0=40):
    """Cinematic low impact with rumble tail."""
    t = tt(d)
    return thump(d, f0, 1.4) + noise_band(d, 20, 300) * np.exp(-t * 3) * .6


def crack(d=.12):
    t = tt(d)
    return noise_band(d, 1500, 12000) * np.exp(-t * 60)


def clank(f=1800, d=.9):
    """Inharmonic metallic strike (blocks, armour, machinery)."""
    t = tt(d)
    parts = ((1, 1, 6), (1.52, .6, 8), (2.37, .45, 10), (3.9, .25, 14), (5.1, .15, 18))
    return sum(a * np.sin(2 * np.pi * f * r * t + _rng.random() * 6) * np.exp(-t * k) for r, a, k in parts) * np.minimum(1, t / .001)


def bell(f, d=4.0, decay=1.0):
    """Soft bell / chime for reveals and titles."""
    t = tt(d)
    parts = ((1, 1, 1.0), (2.0, .5, 1.6), (2.76, .35, 2.2), (5.4, .18, 3.5), (8.9, .08, 5))
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k * decay) for r, a, k in parts) * np.minimum(1, t / .003) / 2.2


def whoosh(d=.3, lo=300, hi=3000, peak=.7):
    """Air movement for swings, transitions, fly-bys."""
    t = tt(d); x = t / d
    env = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.5)
    a, b = noise_band(d, lo, hi * .5), noise_band(d, lo * 2, hi)
    return (a * (1 - x) + b * x) * env


def riser(d=1.2, lo=400, hi=6000):
    t = tt(d)
    return noise_band(d, lo, hi) * (t / d) ** 3


def pad(notes, d, attack=1.5, release=2.0, bright=1.0):
    """Warm string-like chord from additive detuned saws. notes = MIDI numbers."""
    t = tt(d); y = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        for det in (-0.07, 0.0, 0.06):
            ph = 2 * np.pi * f * (1 + det / 12) * t + _rng.random() * 6
            for h in range(1, 7):
                y += np.sin(ph * h) / h ** (1.6 - .3 * bright)
    return y * env_ar(d, attack, release) / (len(notes) * 9)


def drone(d, f=41.2):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t + 1) + .25 * np.sin(2 * np.pi * f * 2.01 * t)) * env_ar(d, 1.0, 1.0) / 1.7


# ---------- mixer ----------
class Mix:
    def __init__(self, duration):
        self.n = int(duration * SR); self.duration = duration
        self.L = np.zeros(self.n); self.R = np.zeros(self.n); self.send = np.zeros(self.n)
        self.auto = None

    def place(self, sig, t0, gain=1.0, pan=0.0, reverb=0.0):
        i0 = int(t0 * SR)
        if i0 < 0: sig, i0 = sig[-i0:], 0
        k = min(len(sig), self.n - i0)
        if k <= 0: return
        s = sig[:k] * gain
        self.L[i0:i0 + k] += s * np.cos((pan + 1) * np.pi / 4) * 1.414
        self.R[i0:i0 + k] += s * np.sin((pan + 1) * np.pi / 4) * 1.414
        self.send[i0:i0 + k] += s * reverb

    def automate(self, points):
        """Master gain automation: [(time, gain), ...] linearly interpolated (e.g. lift quiet acts)."""
        ts, gs = zip(*points); self.auto = np.interp(np.arange(self.n) / SR, ts, gs)

    def _reverb(self, seconds=3.2, decay=2.0, wet=.2):
        ir_t = tt(seconds); out = []
        for _ in range(2):
            ir = _rng.standard_normal(len(ir_t)) * np.exp(-ir_t * decay); ir[:int(.012 * SR)] = 0
            n = self.n + len(ir); nf = 1 << (n - 1).bit_length()
            w = np.fft.irfft(np.fft.rfft(self.send, nf) * np.fft.rfft(ir, nf), nf)[:self.n]
            out.append(w / (np.abs(w).max() + 1e-9))
        m = max(np.abs(self.L).max(), np.abs(self.R).max(), 1e-9)
        return out[0] * wet * m, out[1] * wet * m

    def write(self, path, fade_in=.05, fade_out=.8, drive=1.2, peak=.9):
        wl, wr = self._reverb()
        L, R = self.L + wl, self.R + wr
        if self.auto is not None: L, R = L * self.auto, R * self.auto
        t = np.arange(self.n) / SR
        fade = np.clip(t / max(fade_in, 1e-3), 0, 1) * np.clip((self.duration - t) / max(fade_out, 1e-3), 0, 1)
        m = max(np.abs(L).max(), np.abs(R).max(), 1e-9)
        L, R = np.tanh(L / m * drive) * fade, np.tanh(R / m * drive) * fade
        pk = max(np.abs(L).max(), np.abs(R).max(), 1e-9)
        data = (np.stack([L, R], 1) * peak / pk * 32767).astype('<i2')
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
        self._last = data

    def report(self, step=3):
        """Print RMS per window so dynamics can be checked without listening."""
        d = self._last / 32768.0
        for s in range(0, int(self.duration), step):
            seg = d[s * SR:(s + step) * SR]
            db = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
            print(f'{s:3d}s {db:6.1f} dB ' + '#' * int(max(0, 40 + db)))
