#!/usr/bin/env python3
"""
Render realistic Viva Nova cans (front, angled and back views) for every flavour.

    python3 tools/render_cans.py

Outputs transparent WebP images to images/cans/. Swap these for product photography
once you have it — the site only references images/cans/<flavour>-<view>.webp.
"""
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "cans"
FONT_COND = "/System/Library/Fonts/Avenir Next Condensed.ttc"   # 9 = Heavy Italic, 0 = Bold, 2 = Demi Bold
FONT_TEXT = "/System/Library/Fonts/Avenir Next.ttc"             # 2 = Demi Bold, 7 = Regular

# id, name, colour, deep shade, text colour, accent
FLAVOURS = [
    ("citrus-surge", "Citrus Surge", "#C8FF1A", "#4F7A00", "#0E0E14", "#0E0E14"),
    ("blue-voltage", "Blue Voltage", "#1FB6FF", "#0050A8", "#0E0E14", "#C8FF1A"),
    ("tropical-rush", "Tropical Rush", "#FF9A1F", "#B83A00", "#0E0E14", "#FFFFFF"),
    ("berry-blitz", "Berry Blitz", "#FF2E88", "#990046", "#0E0E14", "#C8FF1A"),
    ("watermelon-sprint", "Watermelon Sprint", "#FF5468", "#A30F26", "#0E0E14", "#7CFFB2"),
    ("glacier-grape", "Glacier Grape", "#8B5CFF", "#35139E", "#FFFFFF", "#1FFFE0"),
]
VIEWS = {"front": 0.0, "angle": 0.085, "back": 0.5}

S = 2                       # supersampling factor
W, H = 520, 1000            # output size
WW, HH = W * S, H * S
CX = WW / 2
R = 188 * S                 # body radius
E = 0.17                    # ellipse ratio (camera slightly above)
H_TOP, H_RIM, H_NECK = 64 * S, 82 * S, 150 * S
H_BODY_END, H_BOT = 872 * S, 920 * S
H_LABEL0, H_LABEL1 = H_NECK, H_BODY_END


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def font(size, idx=9, path=FONT_COND):
    return ImageFont.truetype(path, max(8, int(size)), index=idx)


# --------------------------------------------------------------------------- geometry
def radius(h):
    h = np.asarray(h, dtype=float)
    r = np.full_like(h, R)
    m = h < H_RIM                                    # rolled rim bead
    k = np.clip((h[m] - H_TOP) / (H_RIM - H_TOP), 0, 1)
    r[m] = 0.84 * R + 0.03 * R * np.sin(k * math.pi)
    m = (h >= H_RIM) & (h < H_NECK)                  # necked shoulder
    k = (h[m] - H_RIM) / (H_NECK - H_RIM)
    k = k * k * (3 - 2 * k)
    r[m] = 0.84 * R + 0.16 * R * k
    m = h > H_BODY_END                               # bottom taper
    k = np.clip((h[m] - H_BODY_END) / (H_BOT - H_BODY_END), 0, 1)
    r[m] = R - 0.17 * R * k * k
    return r


# --------------------------------------------------------------------------- label artwork
def tracked(d, xy, text, fnt, fill, tracking):
    x, y = xy
    total = sum(d.textlength(ch, font=fnt) for ch in text) + tracking * (len(text) - 1)
    x -= total / 2
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill)
        x += d.textlength(ch, font=fnt) + tracking


def fit_text(d, text, cx, top, max_w, size, fill, idx=9, path=FONT_COND):
    fnt = font(size, idx, path)
    while d.textlength(text, font=fnt) > max_w and size > 12:
        size -= 4
        fnt = font(size, idx, path)
    bb = d.textbbox((0, 0), text, font=fnt)
    d.text((cx - (bb[0] + bb[2]) / 2, top - bb[1]), text, font=fnt, fill=fill)
    return bb[3] - bb[1]


def star(d, cx, cy, s, fill):
    k = s * 0.26
    d.polygon([(cx, cy - s), (cx + k, cy - k), (cx + s, cy), (cx + k, cy + k),
               (cx, cy + s), (cx - k, cy + k), (cx - s, cy), (cx - k, cy - k)], fill=fill)


def build_label(name, c, dk, t, accent):
    TH = int(H_LABEL1 - H_LABEL0)
    TW = int(2 * math.pi * R)
    c, dk, t, accent = rgb(c), rgb(dk), rgb(t), rgb(accent)
    img = Image.new("RGB", (TW, TH), c)

    # depth gradient
    grad = Image.linear_gradient("L").resize((TW, TH)).point(lambda v: int(v * 0.28))
    img = Image.composite(Image.new("RGB", (TW, TH), dk), img, grad)
    d = ImageDraw.Draw(img, "RGBA")
    X0 = TW / 2

    # halftone dots, top right of the logo
    for gy in range(0, int(TH * 0.45), 26):
        for gx in range(int(X0 + 120), int(X0 + 900), 26):
            fade = 1 - (gx - X0 - 120) / 780
            r = 7 * fade * (1 - gy / (TH * 0.45))
            if r > 0.8:
                d.ellipse([gx - r, gy - r, gx + r, gy + r], fill=dk + (90,))

    # speed lines
    rnd = random.Random(name)
    for _ in range(26):
        y = rnd.uniform(0.05, 0.95) * TH
        x = rnd.uniform(0, TW)
        ln = rnd.uniform(80, 360)
        d.line([(x, y), (x + ln, y - ln * 0.17)], fill=dk + (60,), width=rnd.choice([3, 5, 8]))

    # diagonal energy swoosh
    y0, slope = TH * 0.555, 0.165
    band = 104

    def yat(x, off=0):
        return y0 - (x - X0) * slope + off

    d.polygon([(0, yat(0)), (TW, yat(TW)), (TW, yat(TW, band)), (0, yat(0, band))], fill=accent)
    d.polygon([(0, yat(0, band + 26)), (TW, yat(TW, band + 26)), (TW, yat(TW, band + 44)), (0, yat(0, band + 44))], fill=accent + (170,))
    d.polygon([(0, yat(0, -30)), (TW, yat(TW, -30)), (TW, yat(TW, -18)), (0, yat(0, -18))], fill=accent + (140,))

    # wordmark
    star(d, X0, TH * 0.075, 58, t)
    fit_text(d, "VIVA", X0 - 10, TH * 0.13, 560, 330, t)
    fit_text(d, "NOVA", X0 + 10, TH * 0.13 + 238, 560, 330, t)

    # flavour name
    words = name.upper().split()
    top = TH * 0.675
    for w in words:
        hgt = fit_text(d, w, X0, top, 540, 118, t)
        top += hgt + 18
    tracked(d, (X0, TH * 0.885), "ELECTROLYTE HYDRATION", font(38, 0), t, 7)
    tracked(d, (X0, TH * 0.935), "500ml ℮", font(34, 2), t, 4)

    # vertical side text
    side = Image.new("RGBA", (1300, 90), (0, 0, 0, 0))
    sd = ImageDraw.Draw(side)
    tracked(sd, (650, 14), "5 ELECTROLYTES  ·  25 KCAL  ·  ZERO CAFFEINE", font(46, 0), t + (255,), 6)
    for sx, rot in ((X0 - 0.19 * TW, 90), (X0 + 0.19 * TW, 270)):
        rs = side.rotate(rot, expand=True)
        img.paste(rs, (int(sx - rs.width / 2), int(TH / 2 - rs.height / 2)), rs)

    # back panel (wraps around s = 0)
    PW = 1000
    panel = Image.new("RGBA", (PW, TH), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    cxp = PW / 2
    star(pd, cxp, TH * 0.06, 34, t)
    fit_text(pd, "VIVA NOVA", cxp, TH * 0.095, 520, 110, t)
    bx0, bx1, by0, by1 = cxp - 330, cxp + 330, TH * 0.2, TH * 0.6
    pd.rounded_rectangle([bx0, by0, bx1, by1], 26, fill=(255, 255, 255, 245))
    ink = (14, 14, 20)
    pd.text((bx0 + 34, by0 + 26), "NUTRITION", font=font(64, 9), fill=ink)
    pd.text((bx1 - 34, by0 + 50), "per 500ml", font=font(30, 2, FONT_TEXT), fill=ink, anchor="ra")
    pd.line([(bx0 + 34, by0 + 110), (bx1 - 34, by0 + 110)], fill=ink, width=6)
    rows = [("Energy", "105kJ / 25kcal"), ("Fat", "0g"), ("Carbohydrate", "6.0g"), ("of which sugars", "3.0g"),
            ("Protein", "0g"), ("Salt", "0.90g"), ("Potassium", "200mg"), ("Magnesium", "60mg")]
    ry = by0 + 130
    for label, val in rows:
        pd.text((bx0 + 34, ry), label, font=font(30, 7, FONT_TEXT), fill=ink)
        pd.text((bx1 - 34, ry), val, font=font(30, 2, FONT_TEXT), fill=ink, anchor="ra")
        ry += 50
        pd.line([(bx0 + 34, ry - 8), (bx1 - 34, ry - 8)], fill=ink + (60,), width=2)
    ingr = ("INGREDIENTS: Water, coconut water from concentrate (10%), citric acid, electrolytes "
            "(sodium citrate, potassium citrate, magnesium lactate, calcium lactate, sodium chloride), "
            "natural flavourings, sweetener (steviol glycosides), vitamins (niacin, B6, B12).")
    fnt = font(25, 7, FONT_TEXT)
    line, ly = "", TH * 0.63
    for word in ingr.split():
        trial = f"{line} {word}".strip()
        if pd.textlength(trial, font=fnt) > 640:
            pd.text((bx0, ly), line, font=fnt, fill=t)
            ly += 34
            line = word
        else:
            line = trial
    pd.text((bx0, ly), line, font=fnt, fill=t)
    bar_top = TH * 0.83
    pd.rounded_rectangle([cxp - 170, bar_top, cxp + 170, bar_top + 130], 12, fill=(255, 255, 255, 255))
    bx = cxp - 145
    br = random.Random(name + "bar")
    while bx < cxp + 140:
        w = br.choice([3, 3, 5, 7])
        pd.rectangle([bx, bar_top + 16, bx + w, bar_top + 100], fill=ink)
        bx += w + br.choice([3, 4, 6])
    pd.text((cxp, bar_top + 104), "5 060000 000000", font=font(22, 2, FONT_TEXT), fill=ink, anchor="ma")
    tracked(pd, (cxp, TH * 0.955), "PLEASE RECYCLE  ·  500ml ℮", font(30, 0), t + (255,), 5)
    img.paste(panel, (int(-PW / 2), 0), panel)
    img.paste(panel, (int(TW - PW / 2), 0), panel)

    return np.asarray(img, dtype=np.float32) / 255.0


# --------------------------------------------------------------------------- renderer
def render(label, rot, seed):
    TH, TW = label.shape[:2]
    lin_label = label ** 2.2
    ys, xs = np.mgrid[0:HH, 0:WW].astype(np.float32)
    dx = xs - CX

    # solve for surface height h under each pixel (front of the cylinder)
    h = ys.copy()
    for _ in range(5):
        r = radius(np.clip(h, H_TOP, H_BOT))
        u = np.clip(dx / r, -1, 1)
        h = ys - E * r * np.sqrt(1 - u * u)
    hc = np.clip(h, H_TOP, H_BOT)
    r = radius(hc)
    u_raw = dx / r
    side = (np.abs(u_raw) <= 1) & (h >= H_TOP) & (h <= H_BOT)
    u = np.clip(u_raw, -1, 1)
    nz = np.sqrt(1 - u * u)
    up = (radius(np.clip(hc + 2, H_TOP, H_BOT)) - radius(np.clip(hc - 2, H_TOP, H_BOT))) / 4
    norm = np.sqrt(u * u + up * up + nz * nz)
    nxn, nyn, nzn = u / norm, up / norm, nz / norm

    col = np.zeros((HH, WW, 3), np.float32)
    label_mask = side & (h >= H_LABEL0) & (h <= H_LABEL1)

    s = (0.5 + np.arcsin(u) / (2 * math.pi) + rot) % 1.0
    tt = (h - H_LABEL0) / (H_LABEL1 - H_LABEL0)
    ix = np.clip((s * TW).astype(int), 0, TW - 1)
    iy = np.clip((tt * TH).astype(int), 0, TH - 1)
    col[label_mask] = lin_label[iy[label_mask], ix[label_mask]]

    L = np.array([-0.55, 0.45, 0.70])
    L = L / np.linalg.norm(L)
    diffuse = np.clip(nxn * L[0] + nyn * L[1] + nzn * L[2], 0, 1)

    # printed label: glossy lacquer
    lit = 0.34 + 0.90 * diffuse
    lit *= 0.50 + 0.50 * nz ** 0.6
    lit *= 1 - 0.12 * np.clip((h - 560 * S) / (312 * S), 0, 1)
    col *= lit[..., None]

    # bare aluminium (rim, shoulder, base): environment bands
    metal = side & ~label_mask
    env = (0.30 + 0.55 * np.exp(-((u + 0.45) / 0.16) ** 2) + 0.28 * np.exp(-((u - 0.62) / 0.08) ** 2)
           - 0.12 * np.exp(-((u - 0.15) / 0.22) ** 2) + 0.30 * np.clip(nyn, 0, 1))
    env = np.clip(env * (0.75 + 0.25 * nz), 0.05, 1.2)
    metal_col = env[..., None] * np.array([0.80, 0.82, 0.86], np.float32)
    col[metal] = metal_col[metal]

    # studio strip reflections
    spec = (0.95 * np.exp(-((u + 0.50) / 0.07) ** 2) + 0.38 * np.exp(-((u - 0.66) / 0.04) ** 2)
            + 0.10 * np.exp(-((u + 0.05) / 0.30) ** 2))
    spec += 0.25 * np.exp(-((np.abs(u) - 0.975) / 0.015) ** 2)
    gloss = np.where(label_mask, 0.62, 1.0)
    col += (spec * gloss)[..., None] * np.where(side, 1.0, 0.0)[..., None]

    # lid
    rT = radius(np.array([H_TOP]))[0]
    ryT = E * rT
    px = dx / rT
    py = (ys - H_TOP) / ryT
    rho = np.sqrt(px * px + py * py)
    lid = (rho <= 1) & ~side
    v = 0.52 - 0.18 * px - 0.06 * py
    v = np.where(rho > 0.90, 0.80 - 0.25 * px + 0.1 * np.clip(-py, 0, 1), v)
    v = np.where((rho > 0.84) & (rho <= 0.90), 0.26, v)
    v = np.where((rho > 0.77) & (rho <= 0.84), 0.40 + 1.8 * (rho - 0.77) - 0.1 * px, v)
    op = ((px / 0.36) ** 2 + ((py - 0.50) / 0.26) ** 2)
    v = np.where(np.abs(op - 1) < 0.12, v * 0.72, v)
    tab_in = (np.abs(px) < 0.21) & (py > -0.52) & (py < 0.30)
    tab_edge = tab_in & ((np.abs(px) > 0.17) | (py < -0.46) | (py > 0.25))
    v = np.where(tab_in, 0.74 - 0.2 * px, v)
    v = np.where(tab_edge, 0.50, v)
    hole = (px / 0.11) ** 2 + ((py + 0.26) / 0.11) ** 2 < 1
    v = np.where(hole, 0.16, v)
    rivet = (px / 0.07) ** 2 + ((py - 0.12) / 0.07) ** 2 < 1
    v = np.where(rivet, 0.88, v)
    lid_col = v[..., None] * np.array([0.84, 0.86, 0.90], np.float32)
    col[lid] = lid_col[lid] ** 1.4

    # condensation
    rng = np.random.default_rng(seed)
    body = side & (h > H_NECK + 12 * S) & (h < H_BODY_END) & (nz > 0.25)
    mist = (rng.random((HH, WW)) < 0.035) & body
    col[mist] += 0.06
    col[body] = col[body] * 0.98 + 0.008
    for _ in range(520):
        x0 = rng.uniform(CX - 0.95 * R, CX + 0.95 * R)
        y0 = rng.uniform(H_NECK + 30 * S, H_BODY_END + 20 * S)
        xi, yi = int(x0), int(y0)
        if not body[yi, xi]:
            continue
        size = rng.choice([1.6, 2.2, 3.0, 4.2, 6.0, 8.5], p=[0.3, 0.26, 0.2, 0.13, 0.08, 0.03]) * S
        rx, ry = size * max(nz[yi, xi], 0.3), size * rng.uniform(1.0, 1.25)
        x1, x2 = max(int(x0 - rx - 3), 0), min(int(x0 + rx + 4), WW)
        y1, y2 = max(int(y0 - ry - 3), 0), min(int(y0 + ry + 6), HH)
        X, Y = np.meshgrid(np.arange(x1, x2), np.arange(y1, y2))
        dd = ((X - x0) / rx) ** 2 + ((Y - y0) / ry) ** 2
        inside = (dd <= 1) & body[y1:y2, x1:x2]
        shadow = (((X - x0 - 0.3 * rx) / rx) ** 2 + ((Y - y0 - 0.5 * ry) / ry) ** 2 <= 1.1) & ~inside & body[y1:y2, x1:x2]
        patch = col[y1:y2, x1:x2]
        patch[shadow] *= 0.82
        edge = np.clip((dd - 0.45) / 0.55, 0, 1)
        patch[inside] *= (1.05 - 0.55 * edge[inside])[:, None]
        hl = np.exp(-(((X - (x0 - 0.35 * rx)) / (0.28 * rx + 0.5)) ** 2 + ((Y - (y0 - 0.4 * ry)) / (0.25 * ry + 0.5)) ** 2))
        ca = np.exp(-(((X - (x0 + 0.15 * rx)) / (0.4 * rx + 0.5)) ** 2 + ((Y - (y0 + 0.55 * ry)) / (0.2 * ry + 0.5)) ** 2))
        patch[inside] += (1.1 * hl[inside] + 0.35 * ca[inside])[:, None]

    col = np.clip(col, 0, 1) ** (1 / 2.2)
    alpha = (side | lid).astype(np.float32)
    rgba = np.dstack([col, alpha])
    img = Image.fromarray((rgba * 255).astype(np.uint8)).convert("RGBa")
    return img.resize((W, H), Image.LANCZOS).convert("RGBA")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (fid, name, c, dk, t, accent) in enumerate(FLAVOURS):
        label = build_label(name, c, dk, t, accent)
        for j, (view, rot) in enumerate(VIEWS.items()):
            img = render(label, rot, seed=i * 10 + j)
            path = OUT / f"{fid}-{view}.webp"
            img.save(path, "WEBP", quality=90, method=6)
            print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
