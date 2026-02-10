from __future__ import annotations

from collections import deque, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


CANONICAL_PARTS = (
    "chest",
    "back",
    "shoulders",
    "quads",
    "hamsGlutes",
    "calves",
    "triceps",
    "biceps",
    "absCore",
)

# Deterministic ID overrides for this exact `Male_Transparent.png` segmentation.
# IDs are stable for this image because connected-components are scanned row-major.
# This is used to correct groups that are hard to classify geometrically.
ID_OVERRIDES: dict[int, str | None] = {
    # Biceps: force the two front upper-arm bellies.
    188: "biceps",
    192: "biceps",
    # Remove false-positive biceps strips near obliques/forearm.
    229: None,
    240: None,
    254: None,
    287: None,
    314: None,
    # Front-left triceps compartment (missing in prior pass).
    258: "triceps",
    # Triceps: remove hand/forearm compartments that looked wrong.
    421: None,
    423: None,
    # Shoulders: add missing rear-delt shoulder compartments.
    183: "shoulders",
    184: "shoulders",
    186: "shoulders",
    # Quads vs calves split: lower-front leg strips should be calves.
    508: "calves",
    509: "calves",
    510: "calves",
    511: "calves",
    # Abs/Core: restore right-side oblique/serratus compartments.
    229: "absCore",
    240: "absCore",
    254: "absCore",
    287: "absCore",
    297: "absCore",
    314: "absCore",
    401: "absCore",
    # Calves: drop upper-shin strips for cleaner calf-only fill.
    508: None,
    509: None,
    510: None,
    511: None,
}


def classify_component(
    cx_norm: float,
    cy_norm: float,
    area: int,
) -> str | None:
    if area < 180:
        return None

    front = cx_norm < 0.5

    # Skip neck/head/noise.
    if cy_norm < 0.16 or cy_norm > 0.98:
        return None

    if front:
        # Front torso.
        if 0.18 <= cy_norm <= 0.32 and 0.17 <= cx_norm <= 0.33:
            return "chest"
        if 0.28 <= cy_norm <= 0.58 and 0.13 <= cx_norm <= 0.31:
            return "absCore"

        # Front shoulder caps.
        if 0.17 <= cy_norm <= 0.30 and (
            0.09 <= cx_norm <= 0.17 or 0.33 <= cx_norm <= 0.40
        ):
            return "shoulders"

        # Front upper arm split.
        if 0.27 <= cy_norm <= 0.46 and (
            0.10 <= cx_norm <= 0.19 or 0.26 <= cx_norm <= 0.36
        ):
            return "biceps"
        if 0.27 <= cy_norm <= 0.50 and (
            0.06 <= cx_norm < 0.11 or 0.35 < cx_norm <= 0.42
        ):
            return "triceps"

        if 0.50 <= cy_norm <= 0.84 and 0.14 <= cx_norm <= 0.35:
            return "quads"
        if 0.79 <= cy_norm <= 0.98 and 0.14 <= cx_norm <= 0.35:
            return "calves"
    else:
        if 0.17 <= cy_norm <= 0.30:
            if cx_norm <= 0.66 or cx_norm >= 0.83:
                return "shoulders"
            return "back"
        if 0.30 <= cy_norm <= 0.56:
            if 0.64 <= cx_norm <= 0.86:
                return "back"
            if 0.56 <= cx_norm < 0.64 or 0.86 < cx_norm <= 0.95:
                return "triceps"
        if 0.50 <= cy_norm <= 0.88 and 0.64 <= cx_norm <= 0.86:
            return "hamsGlutes"
        if 0.77 <= cy_norm <= 0.97 and 0.65 <= cx_norm <= 0.84:
            return "calves"

    return None


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    src_path = repo_root / "frontend" / "assets" / "Male_Transparent.png"
    out_dir = repo_root / "frontend" / "assets" / "muscle-masks"
    out_dir.mkdir(parents=True, exist_ok=True)

    src = np.array(Image.open(src_path).convert("RGBA"))
    alpha = src[:, :, 3]
    h, w = alpha.shape

    # Use alpha edges as line boundaries and slightly dilate to close tiny gaps.
    boundary = (alpha > 24).astype(np.uint8) * 255
    boundary = np.array(Image.fromarray(boundary).filter(ImageFilter.MaxFilter(5))) > 0
    open_space = ~boundary

    # Flood-fill outside space from the canvas border.
    outside = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        if open_space[0, x]:
            outside[0, x] = True
            q.append((0, x))
        if open_space[h - 1, x] and not outside[h - 1, x]:
            outside[h - 1, x] = True
            q.append((h - 1, x))
    for y in range(h):
        if open_space[y, 0] and not outside[y, 0]:
            outside[y, 0] = True
            q.append((y, 0))
        if open_space[y, w - 1] and not outside[y, w - 1]:
            outside[y, w - 1] = True
            q.append((y, w - 1))

    directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
    while q:
        y, x = q.popleft()
        for dy, dx in directions:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and open_space[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True
                q.append((ny, nx))

    inside = open_space & (~outside)

    labels = np.zeros((h, w), dtype=np.int32)
    component_id = 0
    masks = {part: np.zeros((h, w), dtype=np.uint8) for part in CANONICAL_PARTS}
    stats_counts: defaultdict[str, int] = defaultdict(int)
    stats_area: defaultdict[str, int] = defaultdict(int)

    for y in range(h):
        xs = np.where(inside[y] & (labels[y] == 0))[0]
        for x in xs:
            component_id += 1
            labels[y, x] = component_id
            q = deque([(y, x)])

            area = 0
            sum_x = 0
            sum_y = 0
            pixels: list[tuple[int, int]] = []

            while q:
                cy, cx = q.popleft()
                area += 1
                sum_x += cx
                sum_y += cy
                pixels.append((cy, cx))
                for dy, dx in directions:
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and inside[ny, nx] and labels[ny, nx] == 0:
                        labels[ny, nx] = component_id
                        q.append((ny, nx))

            cx_norm = (sum_x / area) / w
            cy_norm = (sum_y / area) / h
            part = classify_component(cx_norm, cy_norm, area)
            if component_id in ID_OVERRIDES:
                part = ID_OVERRIDES[component_id]
            if not part:
                continue

            for py, px in pixels:
                masks[part][py, px] = 255
            stats_counts[part] += 1
            stats_area[part] += area

    for part in CANONICAL_PARTS:
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[:, :, 3] = masks[part]
        Image.fromarray(rgba, mode="RGBA").save(out_dir / f"{part}.png")

    print("Saved masks to", out_dir)
    print("Component counts:", dict(stats_counts))
    print("Pixel areas:", {k: int(v) for k, v in stats_area.items()})


if __name__ == "__main__":
    main()
