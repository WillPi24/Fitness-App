#!/usr/bin/env python3
"""Simple GUI tool to edit muscle mask alpha channels quickly.

Usage:
  cd frontend
  python scripts/mask_editor.py
  python scripts/mask_editor.py --variant female
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path
import tkinter as tk
from tkinter import messagebox, ttk

from PIL import Image, ImageTk


OVERLAY_COLOR = (255, 64, 64)
OVERLAY_ALPHA = 185
MAX_UNDO = 25
WALL_ALPHA_THRESHOLD = 2


@dataclass
class MaskDocument:
    path: Path
    rgba: Image.Image
    alpha: Image.Image
    dirty: bool = False


class MaskEditorApp:
    def __init__(self, root: tk.Tk, variant: str = "male", base_image_name: str | None = None) -> None:
        self.root = root
        self.root.title("Muscle Mask Editor")
        self.root.geometry("1400x900")
        self.root.minsize(1080, 720)

        self.project_dir = Path(__file__).resolve().parents[1]
        self.assets_dir = self.project_dir / "assets"
        self.mask_variant = variant
        self.masks_dir = self.assets_dir / "muscle-masks" / self.mask_variant
        default_base_name = "Male_Transparent.png" if self.mask_variant == "male" else "Female_Transparent.png"
        self.base_image_path = self.assets_dir / (base_image_name or default_base_name)

        if not self.base_image_path.exists():
            raise FileNotFoundError(f"Missing base image: {self.base_image_path}")
        if not self.masks_dir.exists():
            raise FileNotFoundError(f"Missing masks directory: {self.masks_dir}")

        self.mask_paths = sorted(self.masks_dir.glob("*.png"))
        if not self.mask_paths:
            raise RuntimeError(f"No mask PNG files found in {self.masks_dir}")

        self.base_image = Image.open(self.base_image_path).convert("RGBA")
        self.base_size = self.base_image.size
        self.base_alpha_data = list(self.base_image.getchannel("A").getdata())

        self.current_index = -1
        self.docs: dict[int, MaskDocument] = {}
        self.undo_stack: list[Image.Image] = []
        self.photo_image: ImageTk.PhotoImage | None = None
        self.display_scale = 1.0
        self.display_offset = (0, 0)
        self.display_size = (1, 1)
        self.fill_index_ready = False
        self.fill_section_id_by_index: list[int] = []
        self.fill_sections: list[list[int]] = []

        self.show_base = tk.BooleanVar(value=True)
        self.tool_mode = tk.StringVar(value="fill")
        self.status_text = tk.StringVar(value="Ready")

        self._build_ui()
        self._bind_shortcuts()
        self._refresh_mask_list()
        self._select_index(0)
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_ui(self) -> None:
        main = ttk.Frame(self.root, padding=10)
        main.pack(fill=tk.BOTH, expand=True)
        main.columnconfigure(1, weight=1)
        main.rowconfigure(0, weight=1)

        left = ttk.Frame(main, width=230)
        left.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        left.rowconfigure(1, weight=1)

        ttk.Label(left, text="Masks").grid(row=0, column=0, sticky="w")
        self.mask_list = tk.Listbox(left, exportselection=False, height=20)
        self.mask_list.grid(row=1, column=0, sticky="nsew")
        self.mask_list.bind("<<ListboxSelect>>", self._on_mask_select)

        left_buttons = ttk.Frame(left)
        left_buttons.grid(row=2, column=0, sticky="ew", pady=(8, 0))
        left_buttons.columnconfigure(0, weight=1)
        left_buttons.columnconfigure(1, weight=1)
        ttk.Button(left_buttons, text="Save", command=self._save_current).grid(
            row=0, column=0, sticky="ew", padx=(0, 4)
        )
        ttk.Button(left_buttons, text="Save All", command=self._save_all).grid(
            row=0, column=1, sticky="ew", padx=(4, 0)
        )

        controls = ttk.Frame(main)
        controls.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(10, 0))
        controls.columnconfigure(8, weight=1)

        self.base_button = ttk.Button(controls, command=self._toggle_base)
        self.base_button.grid(row=0, column=0, padx=(0, 10))
        self._update_base_button_label()

        ttk.Radiobutton(
            controls, text="Fill Section", value="fill", variable=self.tool_mode, command=self._update_status
        ).grid(row=0, column=1, padx=(0, 6))
        ttk.Radiobutton(
            controls, text="Erase Section", value="erase", variable=self.tool_mode, command=self._update_status
        ).grid(row=0, column=2, padx=(0, 12))

        ttk.Button(controls, text="Undo", command=self._undo).grid(row=0, column=3, padx=(0, 6))
        ttk.Button(controls, text="Clear", command=self._clear_mask).grid(row=0, column=4, padx=(0, 6))
        ttk.Button(controls, text="Reload", command=self._reload_current).grid(row=0, column=5, padx=(0, 12))
        ttk.Label(
            controls,
            text="Shortcuts: Click=apply | B toggle base | F fill | E erase | Ctrl+S save | Ctrl+Z undo",
        ).grid(row=0, column=8, sticky="e")

        right = ttk.Frame(main)
        right.grid(row=0, column=1, sticky="nsew")
        right.rowconfigure(0, weight=1)
        right.columnconfigure(0, weight=1)

        self.canvas = tk.Canvas(right, background="#d6d8db", highlightthickness=0, cursor="crosshair")
        self.canvas.grid(row=0, column=0, sticky="nsew")
        self.canvas.bind("<Configure>", lambda _e: self._render())
        self.canvas.bind("<ButtonPress-1>", self._on_click)

        status_bar = ttk.Label(self.root, textvariable=self.status_text, anchor="w", padding=(10, 6))
        status_bar.pack(fill=tk.X)

    def _bind_shortcuts(self) -> None:
        self.root.bind("<Control-s>", lambda _e: self._save_current())
        self.root.bind("<Control-z>", lambda _e: self._undo())
        self.root.bind("<Key-b>", lambda _e: self._toggle_base())
        self.root.bind("<Key-B>", lambda _e: self._toggle_base())
        self.root.bind("<Key-f>", lambda _e: self._set_mode("fill"))
        self.root.bind("<Key-F>", lambda _e: self._set_mode("fill"))
        self.root.bind("<Key-e>", lambda _e: self._set_mode("erase"))
        self.root.bind("<Key-E>", lambda _e: self._set_mode("erase"))

    def _refresh_mask_list(self) -> None:
        selected = self.current_index
        self.mask_list.delete(0, tk.END)
        for idx, mask_path in enumerate(self.mask_paths):
            dirty = self.docs.get(idx).dirty if idx in self.docs else False
            label = f"{mask_path.name}{' *' if dirty else ''}"
            self.mask_list.insert(tk.END, label)
        if 0 <= selected < len(self.mask_paths):
            self.mask_list.selection_set(selected)

    def _load_doc(self, index: int) -> MaskDocument:
        if index in self.docs:
            return self.docs[index]
        rgba = Image.open(self.mask_paths[index]).convert("RGBA")
        if rgba.size != self.base_size:
            rgba = rgba.resize(self.base_size, Image.Resampling.NEAREST)
        alpha = rgba.getchannel("A").copy()
        doc = MaskDocument(path=self.mask_paths[index], rgba=rgba, alpha=alpha)
        self.docs[index] = doc
        return doc

    def _current_doc(self) -> MaskDocument | None:
        if self.current_index < 0:
            return None
        return self._load_doc(self.current_index)

    def _select_index(self, index: int) -> None:
        if index == self.current_index:
            return
        if self.current_index >= 0 and not self._confirm_discard_if_dirty():
            self.mask_list.selection_clear(0, tk.END)
            self.mask_list.selection_set(self.current_index)
            return
        self.current_index = index
        self.undo_stack.clear()
        self.mask_list.selection_clear(0, tk.END)
        self.mask_list.selection_set(index)
        self.mask_list.activate(index)
        self._update_status()
        self._render()

    def _on_mask_select(self, _event: object) -> None:
        selection = self.mask_list.curselection()
        if not selection:
            return
        self._select_index(selection[0])

    def _set_mode(self, mode: str) -> None:
        self.tool_mode.set(mode)
        self._update_status()

    def _toggle_base(self) -> None:
        self.show_base.set(not self.show_base.get())
        self._update_base_button_label()
        self._render()
        self._update_status()

    def _update_base_button_label(self) -> None:
        self.base_button.configure(
            text="Hide Male Base" if self.show_base.get() else "Show Male Base"
        )

    def _update_status(self) -> None:
        doc = self._current_doc()
        mask_name = doc.path.name if doc else "-"
        dirty = " (unsaved)" if doc and doc.dirty else ""
        base_state = "ON" if self.show_base.get() else "OFF"
        self.status_text.set(
            f"Mask: {mask_name}{dirty} | Mode: {self.tool_mode.get()} | Male base: {base_state}"
        )

    def _render(self) -> None:
        doc = self._current_doc()
        if doc is None:
            return

        canvas_w = max(self.canvas.winfo_width(), 1)
        canvas_h = max(self.canvas.winfo_height(), 1)
        src_w, src_h = self.base_size
        scale = min(canvas_w / src_w, canvas_h / src_h)
        display_w = max(1, int(src_w * scale))
        display_h = max(1, int(src_h * scale))
        offset_x = (canvas_w - display_w) // 2
        offset_y = (canvas_h - display_h) // 2

        self.display_scale = scale
        self.display_offset = (offset_x, offset_y)
        self.display_size = (display_w, display_h)

        if self.show_base.get():
            preview = self.base_image.copy()
        else:
            preview = Image.new("RGBA", self.base_size, (0, 0, 0, 0))

        overlay_alpha = doc.alpha.point(lambda px: int(px * OVERLAY_ALPHA / 255))
        overlay = Image.new("RGBA", self.base_size, (*OVERLAY_COLOR, 0))
        overlay.putalpha(overlay_alpha)
        preview.alpha_composite(overlay)

        display = preview.resize((display_w, display_h), Image.Resampling.BILINEAR)
        self.photo_image = ImageTk.PhotoImage(display)

        self.canvas.delete("all")
        self.canvas.create_image(offset_x, offset_y, anchor=tk.NW, image=self.photo_image)
        self.canvas.create_rectangle(
            offset_x,
            offset_y,
            offset_x + display_w,
            offset_y + display_h,
            outline="#3a3d40",
            width=1,
        )

    def _canvas_to_image(self, canvas_x: int, canvas_y: int) -> tuple[int, int] | None:
        off_x, off_y = self.display_offset
        disp_w, disp_h = self.display_size
        if not (off_x <= canvas_x < off_x + disp_w and off_y <= canvas_y < off_y + disp_h):
            return None
        scale = self.display_scale
        image_x = int((canvas_x - off_x) / scale)
        image_y = int((canvas_y - off_y) / scale)
        image_x = max(0, min(self.base_size[0] - 1, image_x))
        image_y = max(0, min(self.base_size[1] - 1, image_y))
        return image_x, image_y

    def _push_undo(self) -> None:
        doc = self._current_doc()
        if doc is None:
            return
        self.undo_stack.append(doc.alpha.copy())
        if len(self.undo_stack) > MAX_UNDO:
            self.undo_stack.pop(0)

    def _collect_mask_component(self, alpha_bytes: bytearray, seed_index: int) -> list[int]:
        if alpha_bytes[seed_index] == 0:
            return []
        width, height = self.base_size
        visited = bytearray(len(alpha_bytes))
        region: list[int] = []
        queue: deque[int] = deque([seed_index])
        visited[seed_index] = 1

        while queue:
            idx = queue.popleft()
            if alpha_bytes[idx] == 0:
                continue
            region.append(idx)

            x = idx % width
            if x > 0:
                left = idx - 1
                if not visited[left]:
                    visited[left] = 1
                    queue.append(left)
            if x < width - 1:
                right = idx + 1
                if not visited[right]:
                    visited[right] = 1
                    queue.append(right)
            up = idx - width
            if up >= 0 and not visited[up]:
                visited[up] = 1
                queue.append(up)
            down = idx + width
            if down < width * height and not visited[down]:
                visited[down] = 1
                queue.append(down)
        return region

    def _rebuild_fill_index(self) -> None:
        width, height = self.base_size
        total = width * height

        def is_wall(idx: int) -> bool:
            return self.base_alpha_data[idx] >= WALL_ALPHA_THRESHOLD

        exterior = bytearray(total)
        queue: deque[int] = deque()

        for x in range(width):
            top = x
            bottom = (height - 1) * width + x
            if not is_wall(top) and not exterior[top]:
                exterior[top] = 1
                queue.append(top)
            if not is_wall(bottom) and not exterior[bottom]:
                exterior[bottom] = 1
                queue.append(bottom)
        for y in range(height):
            left = y * width
            right = left + (width - 1)
            if not is_wall(left) and not exterior[left]:
                exterior[left] = 1
                queue.append(left)
            if not is_wall(right) and not exterior[right]:
                exterior[right] = 1
                queue.append(right)

        while queue:
            idx = queue.popleft()
            x = idx % width
            if x > 0:
                left = idx - 1
                if not is_wall(left) and not exterior[left]:
                    exterior[left] = 1
                    queue.append(left)
            if x < width - 1:
                right = idx + 1
                if not is_wall(right) and not exterior[right]:
                    exterior[right] = 1
                    queue.append(right)
            up = idx - width
            if up >= 0 and not is_wall(up) and not exterior[up]:
                exterior[up] = 1
                queue.append(up)
            down = idx + width
            if down < total and not is_wall(down) and not exterior[down]:
                exterior[down] = 1
                queue.append(down)

        section_id_by_index = [-1] * total
        sections: list[list[int]] = []

        for seed_index in range(total):
            if is_wall(seed_index) or exterior[seed_index] or section_id_by_index[seed_index] != -1:
                continue

            section_id = len(sections)
            queue = deque([seed_index])
            section_id_by_index[seed_index] = section_id
            section_pixels: list[int] = []

            while queue:
                idx = queue.popleft()
                if is_wall(idx) or exterior[idx]:
                    continue
                section_pixels.append(idx)

                x = idx % width
                if x > 0:
                    left = idx - 1
                    if (not is_wall(left)) and (not exterior[left]) and section_id_by_index[left] == -1:
                        section_id_by_index[left] = section_id
                        queue.append(left)
                if x < width - 1:
                    right = idx + 1
                    if (not is_wall(right)) and (not exterior[right]) and section_id_by_index[right] == -1:
                        section_id_by_index[right] = section_id
                        queue.append(right)
                up = idx - width
                if up >= 0 and (not is_wall(up)) and (not exterior[up]) and section_id_by_index[up] == -1:
                    section_id_by_index[up] = section_id
                    queue.append(up)
                down = idx + width
                if down < total and (not is_wall(down)) and (not exterior[down]) and section_id_by_index[down] == -1:
                    section_id_by_index[down] = section_id
                    queue.append(down)

            sections.append(section_pixels)

        self.fill_section_id_by_index = section_id_by_index
        self.fill_sections = sections
        self.fill_index_ready = True

    def _ensure_fill_index(self) -> None:
        if not self.fill_index_ready:
            self._rebuild_fill_index()

    def _resolve_fill_section_id(self, seed_index: int) -> int:
        section_id = self.fill_section_id_by_index[seed_index]
        if section_id >= 0:
            return section_id

        width, height = self.base_size
        seed_x = seed_index % width
        seed_y = seed_index // width
        best: dict[int, int] = {}

        for radius in (1, 2, 3):
            best.clear()
            for dy in range(-radius, radius + 1):
                y = seed_y + dy
                if y < 0 or y >= height:
                    continue
                for dx in range(-radius, radius + 1):
                    x = seed_x + dx
                    if x < 0 or x >= width:
                        continue
                    idx = y * width + x
                    sid = self.fill_section_id_by_index[idx]
                    if sid >= 0:
                        best[sid] = best.get(sid, 0) + 1
            if best:
                return max(best.items(), key=lambda item: item[1])[0]

        return -1

    def _on_click(self, event: tk.Event) -> None:
        point = self._canvas_to_image(event.x, event.y)
        if point is None:
            return

        doc = self._current_doc()
        if doc is None:
            return

        image_x, image_y = point
        width, _height = self.base_size
        seed_index = image_y * width + image_x
        alpha_bytes = bytearray(doc.alpha.tobytes())

        if self.tool_mode.get() == "erase":
            region = self._collect_mask_component(alpha_bytes, seed_index)
            fill_value = 0
        else:
            self._ensure_fill_index()
            section_id = self._resolve_fill_section_id(seed_index)
            if section_id < 0:
                self.status_text.set("Fill Section: click inside a closed outlined body section.")
                return
            region = self.fill_sections[section_id]
            fill_value = 255

        if not region:
            return
        if all(alpha_bytes[idx] == fill_value for idx in region):
            return

        self._push_undo()
        for idx in region:
            alpha_bytes[idx] = fill_value

        doc.alpha = Image.frombytes("L", self.base_size, bytes(alpha_bytes))
        doc.dirty = True
        self._refresh_mask_list()
        self._update_status()
        self._render()

    def _undo(self) -> None:
        doc = self._current_doc()
        if doc is None or not self.undo_stack:
            return
        doc.alpha = self.undo_stack.pop()
        doc.dirty = True
        self._refresh_mask_list()
        self._update_status()
        self._render()

    def _clear_mask(self) -> None:
        doc = self._current_doc()
        if doc is None:
            return
        if not messagebox.askyesno("Clear Mask", f"Clear all pixels in {doc.path.name}?"):
            return
        self._push_undo()
        doc.alpha.paste(0)
        doc.dirty = True
        self._refresh_mask_list()
        self._update_status()
        self._render()

    def _reload_current(self) -> None:
        doc = self._current_doc()
        if doc is None:
            return
        if doc.dirty and not messagebox.askyesno(
            "Reload Mask", f"Discard unsaved changes to {doc.path.name}?"
        ):
            return
        rgba = Image.open(doc.path).convert("RGBA")
        if rgba.size != self.base_size:
            rgba = rgba.resize(self.base_size, Image.Resampling.NEAREST)
        doc.rgba = rgba
        doc.alpha = rgba.getchannel("A").copy()
        doc.dirty = False
        self.undo_stack.clear()
        self._refresh_mask_list()
        self._update_status()
        self._render()

    def _save_doc(self, doc: MaskDocument) -> None:
        r, g, b, _a = doc.rgba.split()
        merged = Image.merge("RGBA", (r, g, b, doc.alpha))
        merged.save(doc.path)
        doc.rgba = merged
        doc.dirty = False

    def _save_current(self) -> None:
        doc = self._current_doc()
        if doc is None:
            return
        self._save_doc(doc)
        self._refresh_mask_list()
        self._update_status()

    def _save_all(self) -> None:
        dirty_docs = [doc for doc in self.docs.values() if doc.dirty]
        if not dirty_docs:
            return
        for doc in dirty_docs:
            self._save_doc(doc)
        self._refresh_mask_list()
        self._update_status()

    def _confirm_discard_if_dirty(self) -> bool:
        doc = self._current_doc()
        if doc is None or not doc.dirty:
            return True
        answer = messagebox.askyesnocancel(
            "Unsaved Changes",
            f"Save changes to {doc.path.name} before switching?",
        )
        if answer is None:
            return False
        if answer:
            self._save_current()
        return True

    def _on_close(self) -> None:
        dirty = [doc.path.name for doc in self.docs.values() if doc.dirty]
        if dirty:
            answer = messagebox.askyesnocancel(
                "Unsaved Changes",
                "Save all unsaved masks before closing?",
            )
            if answer is None:
                return
            if answer:
                self._save_all()
        self.root.destroy()


def main() -> None:
    parser = argparse.ArgumentParser(description="Edit muscle mask alpha channels.")
    parser.add_argument(
        "--variant",
        choices=("male", "female"),
        default="male",
        help="Mask set variant to edit.",
    )
    parser.add_argument(
        "--base-image",
        default=None,
        help="Optional base image filename under frontend/assets (e.g. Female_Transparent.png).",
    )
    args = parser.parse_args()

    root = tk.Tk()
    app = MaskEditorApp(root, variant=args.variant, base_image_name=args.base_image)
    try:
        root.mainloop()
    finally:
        # Keep a reference alive for Tk image lifecycle.
        del app


if __name__ == "__main__":
    main()
