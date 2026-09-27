#!/usr/bin/env python3
"""
Render Viva Nova 500ml PET sports bottles (front, angled and back views) for every flavour.

    python3 tools/render_bottles.py

Outputs transparent WebP images to images/bottles/. Same 520x1000 canvas as the cans, so a
bottle drops into any slot a can uses. Flavours, colours, fonts and text helpers come from
render_cans.py, so edit the flavour list there.
"""
import math
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_cans import FLAVOURS, FONT_TEXT, VIEWS, fit_text, font, rgb, star, tracked  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "bottles"

S = 2                       # supersampling factor
W, H = 520, 1000            # output size (matches the cans)
WW, HH = W * S, H * S
CX = WW / 2
E = 0.17                    # ellipse ratio (camera slightly above)
R = 145 * S                 # body radius

# vertical layout, top to bottom
H_NOZ0, H_NOZ1 = 28 * S, 80 * S         # push-pull nozzle
H_COL0, H_COL1 = 80 * S, 102 * S        # nozzle collar
H_CAP0, H_CAP1 = 102 * S, 196 * S       # ribbed cap
H_TAMP0, H_TAMP1 = 199 * S, 214 * S     # tamper band
H_RING0, H_RING1 = 218 * S, 226 * S     # neck support ring
H_NECK0, H_NECK1 = 226 * S, 246 * S
H_B0, H_SH1 = 240 * S, 380 * S          # shoulder
H_BODY_END, H_BOT = 915 * S, 975 * S
H_L0, H_L1 = 420 * S, 780 * S           # wrap label
H_FILL = 300 * S                        # liquid level
R_NECK = 74 * S
RIBS = (815 * S, 850 * S, 885 * S)

LIGHT = np.array([-0.55, 0.45, 0.70])
LIGHT = LIGHT / np.linalg.norm(LIGHT)


def lin(hexcol):
    return (np.array(rgb(hexcol), np.float32) / 255.0) ** 2.2


# --------------------------------------------------------------------------- geometry
def body_radius(h):
    h = np.asarray(h, dtype=float)
    r = np.full_like(h, R)
    m = h < H_SH1
    k = np.clip((h[m] - H_B0) / (H_SH1 - H_B0), 0, 1)
    k = k * k * (3 - 2 * k)
    r[m] = R_NECK + (R - R_NECK) * k
    for hc in RIBS:
        r -= 5 * S * np.exp(-((h - hc) / (6 * S)) ** 2)
    m = h > H_BODY_END
    k = np.clip((h[m] - H_BODY_END) / (H_BOT - H_BODY_END), 0, 1)
    r[m] = R - 0.14 * R * k * k
    return r


def cylinder(xs, ys, h0, h1, r):
    """Side and top-face masks for a plain cylinder from height h0 to h1."""
    dx = xs - CX
    u_raw = dx / r
    u = np.clip(u_raw, -1, 1)
    nz = np.sqrt(1 - u * u)
    hh = ys - E * r * nz
    side = (np.abs(u_raw) <= 1) & (hh >= h0) & (hh <= h1)
    px, py = dx / r, (ys - h0) / (E * r)
    top = (px * px + py * py <= 1) & ~side
    return side, top, u, nz, hh, px, py


def strips(u):
    """Studio strip-light reflections across a vertical cylinder."""
    return (0.95 * np.exp(-((u + 0.50) / 0.06) ** 2) + 0.40 * np.exp(-((u - 0.64) / 0.035) ** 2)
            + 0.10 * np.exp(-((u + 0.05) / 0.30) ** 2) + 0.22 * np.exp(-((np.abs(u) - 0.975) / 0.015) ** 2))


# --------------------------------------------------------------------------- label artwork
def build_label(name, c, dk, t, accent):
    TH = int(H_L1 - H_L0)
    TW = int(2 * math.pi * R)
    c, dk, t, accent = rgb(c), rgb(dk), rgb(t), rgb(accent)
    img = Image.new("RGB", (TW, TH), c)
    grad = Image.linear_gradient("L").resize((TW, TH)).point(lambda v: int(v * 0.28))
    img = Image.composite(Image.new("RGB", (TW, TH), dk), img, grad)
    d = ImageDraw.Draw(img, "RGBA")
    X0 = TW / 2

    # halftone dots
    for gy in range(0, int(TH * 0.4), 22):
        for gx in range(int(X0 + 90), int(X0 + 620), 22):
            fade = 1 - (gx - X0 - 90) / 530
            r = 6 * fade * (1 - gy / (TH * 0.4))
            if r > 0.8:
                d.ellipse([gx - r, gy - r, gx + r, gy + r], fill=dk + (90,))

    # speed lines
    rnd = random.Random(name + "bottle")
    for _ in range(22):
        y = rnd.uniform(0.05, 0.95) * TH
        x = rnd.uniform(0, TW)
        ln = rnd.uniform(60, 260)
        d.line([(x, y), (x + ln, y - ln * 0.12)], fill=dk + (60,), width=rnd.choice([3, 4, 6]))

    # diagonal energy swoosh
    y0, slope, band = TH * 0.42, 0.12, 64

    def yat(x, off=0):
        return y0 - (x - X0) * slope + off

    d.polygon([(0, yat(0)), (TW, yat(TW)), (TW, yat(TW, band)), (0, yat(0, band))], fill=accent)
    d.polygon([(0, yat(0, band + 16)), (TW, yat(TW, band + 16)), (TW, yat(TW, band + 28)), (0, yat(0, band + 28))], fill=accent + (170,))
    d.polygon([(0, yat(0, -20)), (TW, yat(TW, -20)), (TW, yat(TW, -12)), (0, yat(0, -12))], fill=accent + (140,))

    # wordmark and flavour name
    star(d, X0, TH * 0.085, 30, t)
    fit_text(d, "VIVA NOVA", X0, TH * 0.16, 430, 130, t)
    top = TH * 0.585
    for w in name.upper().split():
        top += fit_text(d, w, X0, top, 400, 76, t) + 12
    tracked(d, (X0, TH * 0.84), "ELECTROLYTE HYDRATION", font(30, 0), t, 6)
    tracked(d, (X0, TH * 0.915), "500ml ℮", font(28, 2), t, 4)

    # side stats
    for sx, rows in ((X0 - 0.225 * TW, (("5", "ELECTROLYTES"), ("25", "KCAL"), ("0", "CAFFEINE"))),
                     (X0 + 0.225 * TW, (("10%", "COCONUT WATER"), ("B", "VITAMINS"), ("3g", "SUGAR")))):
        ty = TH * 0.16
        for big, small in rows:
            fit_text(d, big, sx, ty, 260, 92, t)
            tracked(d, (sx, ty + 86), small, font(24, 0), t, 3)
            ty += 170

    # back panel (wraps around s = 0)
    PW = 860
    panel = Image.new("RGBA", (PW, TH), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    cxp = PW / 2
    ink = (14, 14, 20)
    bx0, bx1, by0 = cxp - 400, cxp + 10, TH * 0.1
    rows = [("Energy", "105kJ / 25kcal"), ("Carbohydrate", "6.0g"), ("of which sugars", "3.0g"),
            ("Salt", "0.90g"), ("Potassium", "200mg"), ("Magnesium", "60mg")]
    by1 = by0 + 92 + len(rows) * 40
    pd.rounded_rectangle([bx0, by0, bx1, by1], 20, fill=(255, 255, 255, 245))
    pd.text((bx0 + 24, by0 + 16), "NUTRITION", font=font(46, 9), fill=ink)
    pd.text((bx1 - 24, by0 + 32), "per 500ml", font=font(22, 2, FONT_TEXT), fill=ink, anchor="ra")
    pd.line([(bx0 + 24, by0 + 76), (bx1 - 24, by0 + 76)], fill=ink, width=5)
    ry = by0 + 88
    for label, val in rows:
        pd.text((bx0 + 24, ry), label, font=font(22, 7, FONT_TEXT), fill=ink)
        pd.text((bx1 - 24, ry), val, font=font(22, 2, FONT_TEXT), fill=ink, anchor="ra")
        ry += 40
        pd.line([(bx0 + 24, ry - 7), (bx1 - 24, ry - 7)], fill=ink + (60,), width=2)
    pd.text((bx0 + 4, by1 + 22), "Best served ice-cold. Refrigerate once opened", font=font(20, 7, FONT_TEXT), fill=t)
    pd.text((bx0 + 4, by1 + 50), "and drink within 24 hours.", font=font(20, 7, FONT_TEXT), fill=t)

    ingr = ("INGREDIENTS: Water, coconut water from concentrate (10%), citric acid, electrolytes "
            "(sodium citrate, potassium citrate, magnesium lactate, calcium lactate, sodium chloride), "
            "natural flavourings, sweetener (steviol glycosides), vitamins (niacin, B6, B12).")
    fnt = font(19, 7, FONT_TEXT)
    ix0, line, ly = cxp + 40, "", by0
    for word in ingr.split():
        trial = f"{line} {word}".strip()
        if pd.textlength(trial, font=fnt) > 340:
            pd.text((ix0, ly), line, font=fnt, fill=t)
            ly += 26
            line = word
        else:
            line = trial
    pd.text((ix0, ly), line, font=fnt, fill=t)
    bar_top = ly + 44
    pd.rounded_rectangle([ix0, bar_top, ix0 + 260, bar_top + 112], 10, fill=(255, 255, 255, 255))
    bx = ix0 + 20
    br = random.Random(name + "bottlebar")
    while bx < ix0 + 236:
        w = br.choice([2, 3, 4, 6])
        pd.rectangle([bx, bar_top + 12, bx + w, bar_top + 84], fill=ink)
        bx += w + br.choice([2, 3, 5])
    pd.text((ix0 + 130, bar_top + 88), "5 060000 000017", font=font(18, 2, FONT_TEXT), fill=ink, anchor="ma")
    tracked(pd, (cxp, TH * 0.93), "PLEASE RECYCLE  ·  CAP ON  ·  500ml ℮", font(24, 0), t + (255,), 4)
    img.paste(panel, (int(-PW / 2), 0), panel)
    img.paste(panel, (int(TW - PW / 2), 0), panel)

    return np.asarray(img, dtype=np.float32) / 255.0


# --------------------------------------------------------------------------- renderer
def render(label, rot, seed, c, dk, accent):
    TH, TW = label.shape[:2]
    lin_label = label ** 2.2
    ys, xs = np.mgrid[0:HH, 0:WW].astype(np.float32)
    dx = xs - CX
    col = np.zeros((HH, WW, 3), np.float32)
    alpha = np.zeros((HH, WW), np.float32)
    white = np.array([0.94, 0.96, 1.0], np.float32)

    # ---- body: solve for the front-surface height under each pixel
    h = ys.copy()
    for _ in range(6):
        r = body_radius(np.clip(h, H_B0, H_BOT))
        u = np.clip(dx / r, -1, 1)
        h = ys - E * r * np.sqrt(1 - u * u)
    hc = np.clip(h, H_B0, H_BOT)
    r = body_radius(hc)
    u_raw = dx / r
    side = (np.abs(u_raw) <= 1) & (h >= H_B0) & (h <= H_BOT)
    u = np.clip(u_raw, -1, 1)
    nz = np.sqrt(1 - u * u)
    up = (body_radius(np.clip(hc + 2, H_B0, H_BOT)) - body_radius(np.clip(hc - 2, H_B0, H_BOT))) / 4
    norm = np.sqrt(u * u + up * up + nz * nz)
    nxn, nyn, nzn = u / norm, up / norm, nz / norm
    diffuse = np.clip(nxn * LIGHT[0] + nyn * LIGHT[1] + nzn * LIGHT[2], 0, 1)
    spec = strips(u) * (0.8 + 0.4 * np.clip(nyn, 0, 1))

    label_mask = side & (h >= H_L0) & (h <= H_L1)
    rf = body_radius(np.array([H_FILL]))[0]
    in_surface = (dx / rf) ** 2 + ((ys - H_FILL) / (E * rf)) ** 2 <= 1
    liquid_body = side & (h >= H_FILL) & ~label_mask
    liquid_top = side & (h < H_FILL) & in_surface
    clear = side & ~label_mask & ~liquid_body & ~liquid_top

    # coloured drink seen through PET: brighter where the light passes through more liquid
    liq = lin(c) * 0.72 + lin(dk) * 0.28
    glow = lin(c)
    trans = (0.42 + 0.62 * nz ** 0.5)[..., None]
    liquid_col = liq * trans + glow * (0.35 * nz ** 4)[..., None]
    liquid_col *= (0.72 + 0.4 * diffuse)[..., None]
    liquid_col += white * (0.28 * (1 - nz) ** 3)[..., None]
    col[liquid_body] = liquid_col[liquid_body]
    alpha[liquid_body] = 0.95

    surf = liq * 1.15 + white * 0.12
    col[liquid_top] = surf
    alpha[liquid_top] = 0.92

    # empty PET above the liquid
    col[clear] = white * 0.9
    alpha[clear] = (0.08 + 0.6 * (1 - nz) ** 2.5)[clear]

    # printed wrap label
    s = (0.5 + np.arcsin(u) / (2 * math.pi) + rot) % 1.0
    tt = (h - H_L0) / (H_L1 - H_L0)
    ix = np.clip((s * TW).astype(int), 0, TW - 1)
    iy = np.clip((tt * TH).astype(int), 0, TH - 1)
    lit = (0.36 + 0.86 * diffuse) * (0.52 + 0.48 * nz ** 0.6)
    edge = 1 - 0.28 * (np.exp(-((h - H_L0) / (2.5 * S)) ** 2) + np.exp(-((h - H_L1) / (2.5 * S)) ** 2))
    col[label_mask] = (lin_label[iy, ix] * (lit * edge)[..., None])[label_mask]
    alpha[label_mask] = 1.0

    # gloss over the whole body (PET and label lacquer)
    gloss = np.where(label_mask, 0.6, 1.0) * spec
    col[side] += (white * gloss[..., None])[side]
    alpha[side] = np.clip(alpha[side] + 0.7 * gloss[side], 0, 1)

    # condensation on the cold, filled part
    rng = np.random.default_rng(seed)
    wet = side & (h > H_FILL + 30 * S) & (h < H_BODY_END) & (nz > 0.25)
    for _ in range(420):
        x0 = rng.uniform(CX - 0.95 * R, CX + 0.95 * R)
        y0 = rng.uniform(H_FILL + 40 * S, H_BODY_END)
        xi, yi = int(x0), int(y0)
        if not wet[yi, xi]:
            continue
        size = rng.choice([1.6, 2.2, 3.0, 4.2, 6.0, 8.5], p=[0.3, 0.26, 0.2, 0.13, 0.08, 0.03]) * S
        rx, ry = size * max(nz[yi, xi], 0.3), size * rng.uniform(1.0, 1.25)
        x1, x2 = max(int(x0 - rx - 3), 0), min(int(x0 + rx + 4), WW)
        y1, y2 = max(int(y0 - ry - 3), 0), min(int(y0 + ry + 6), HH)
        X, Y = np.meshgrid(np.arange(x1, x2), np.arange(y1, y2))
        dd = ((X - x0) / rx) ** 2 + ((Y - y0) / ry) ** 2
        inside = (dd <= 1) & wet[y1:y2, x1:x2]
        shadow = (((X - x0 - 0.3 * rx) / rx) ** 2 + ((Y - y0 - 0.5 * ry) / ry) ** 2 <= 1.1) & ~inside & wet[y1:y2, x1:x2]
        patch = col[y1:y2, x1:x2]
        patch[shadow] *= 0.82
        e = np.clip((dd - 0.45) / 0.55, 0, 1)
        patch[inside] *= (1.05 - 0.55 * e[inside])[:, None]
        hl = np.exp(-(((X - (x0 - 0.35 * rx)) / (0.28 * rx + 0.5)) ** 2 + ((Y - (y0 - 0.4 * ry)) / (0.25 * ry + 0.5)) ** 2))
        patch[inside] += (1.1 * hl[inside])[:, None]

    # ---- neck and closure, painted bottom to top so higher parts sit in front
    cap = lin(accent)
    cap = np.maximum(cap, 0.012)
    nozzle = np.array([0.80, 0.81, 0.84], np.float32)

    def paint(h0, h1, rad, base, a=1.0, ribs=0, slits=0, gloss_k=0.45, top_hole=False):
        sd, tp, cu, cnz, hh, px, py = cylinder(xs, ys, h0, h1, rad)
        dif = np.clip(cu * LIGHT[0] + cnz * LIGHT[2], 0, 1)
        shade = 0.28 + 0.85 * dif
        ang = np.arcsin(cu)
        if ribs:
            shade *= 0.82 + 0.18 * np.cos(ang * ribs)
        if slits:
            mid = np.abs((hh - h0) / (h1 - h0) - 0.5) < 0.3
            gap = ((ang / math.pi * slits) % 1) < 0.14
            shade = np.where(mid & gap, shade * 0.45, shade)
        # soft seam shadow at the bottom edge
        shade *= 1 - 0.3 * np.exp(-((hh - h1) / (2 * S)) ** 2)
        sc = base * shade[..., None] + white * (gloss_k * strips(cu))[..., None]
        col[sd] = sc[sd]
        alpha[sd] = np.clip(a + 0.6 * strips(cu)[sd] * (1 - a), 0, 1)
        tv = 0.95 - 0.22 * px - 0.12 * py
        tv = np.where(np.sqrt(px * px + py * py) > 0.9, tv * 0.8, tv)
        if top_hole:
            tv = np.where(px * px + py * py < 0.3 ** 2, 0.15, tv)
        tc = base * tv[..., None]
        col[tp] = tc[tp]
        alpha[tp] = a

    paint(H_NECK0, H_NECK1, R_NECK, white * 0.85, a=0.35)
    paint(H_RING0, H_RING1, 92 * S, white * 0.85, a=0.55)
    paint(H_TAMP0, H_TAMP1, 79 * S, cap, slits=18)
    paint(H_CAP0, H_CAP1, 80 * S, cap, ribs=64)
    paint(H_COL0, H_COL1, 52 * S, cap, gloss_k=0.35)
    paint(H_NOZ0, H_NOZ1, 34 * S, nozzle, gloss_k=0.3, top_hole=True)

    col = np.clip(col, 0, 1) ** (1 / 2.2)
    rgba = np.dstack([col, np.clip(alpha, 0, 1)])
    img = Image.fromarray((rgba * 255).astype(np.uint8)).convert("RGBa")
    return img.resize((W, H), Image.LANCZOS).convert("RGBA")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (fid, name, c, dk, t, accent) in enumerate(FLAVOURS):
        label = build_label(name, c, dk, t, accent)
        for j, (view, rot) in enumerate(VIEWS.items()):
            img = render(label, rot, i * 10 + j + 100, c, dk, accent)
            path = OUT / f"{fid}-{view}.webp"
            img.save(path, "WEBP", quality=90, method=6)
            print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
