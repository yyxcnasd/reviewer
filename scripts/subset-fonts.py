"""把 Noto Serif SC 裁成只含站点实际用到的字，输出 woff2。

用法：
    python scripts/subset-fonts.py            # 用 .work/fonts 下的原字体
    python scripts/subset-fonts.py --check    # 只看要裁多少字

字体来源：Noto Serif CJK SC（SIL OFL 1.1），从 notofonts/noto-cjk 取
Serif/SubsetOTF/SC/NotoSerifSC-{Regular,Bold,Black}.otf，放进 .work/fonts/。
字体文件（woff2）与 fonts.css 会提交进仓库，所以构建站点与 CI 都不需要 Python。
内容新增了字之后，重跑一次这个脚本即可。
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, ".work", "fonts")
OUT_FONT_DIR = os.path.join(ROOT, "src", "assets", "fonts")
CSS_PATH = os.path.join(ROOT, "src", "styles", "fonts.css")

WEIGHTS = [
    ("Regular", 400),
    ("Bold", 700),
    ("Black", 900),
]

SCAN_DIRS = ["content", "src"]
SCAN_EXTS = {".md", ".yml", ".yaml", ".json", ".mjs", ".js", ".css"}
EXTRA = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "　、。〈〉《》「」『』【】〔〕〖〗！？：；，．·—…–－％‰°′″±×÷≠≈≤≥≡∽∞∝∈∉⊂⊆∪∩∅∀∃¬∧∨⇒⇔∵∴∠⊥∥△□○●◇◆★☆√∛∫∬∮∑∏∂∇′″‴ ⁻⁺⁼₀₁₂₃₄₅₆₇₈₉αβγδεζηθικλμνξοπρστυφχψωΓΔΘΛΞΠΣΦΨΩΑΒΕΖΗΙΚΜΝΟΡΤΥΧ←→↑↓↔↕⇐⇑⇓⇔"
)


def collect_chars():
    chars = set(EXTRA)
    for d in SCAN_DIRS:
        base = os.path.join(ROOT, d)
        for dirpath, _, files in os.walk(base):
            for fn in files:
                if os.path.splitext(fn)[1].lower() not in SCAN_EXTS:
                    continue
                p = os.path.join(dirpath, fn)
                try:
                    text = open(p, encoding="utf-8").read()
                except (UnicodeDecodeError, OSError):
                    continue
                chars.update(text)
    # 去掉控制字符与空白
    return {c for c in chars if c.strip() or c == " "}


def main():
    chars = collect_chars()
    cjk = sum(1 for c in chars if "\u4e00" <= c <= "\u9fff")
    print(f"字符集：{len(chars)} 个（其中汉字 {cjk} 个）")
    if "--check" in sys.argv:
        return

    chars_file = os.path.join(ROOT, ".work", "charset.txt")
    os.makedirs(os.path.dirname(chars_file), exist_ok=True)
    with open(chars_file, "w", encoding="utf-8") as f:
        f.write("".join(sorted(chars)))

    os.makedirs(OUT_FONT_DIR, exist_ok=True)
    css = ["/* 由 scripts/subset-fonts.py 生成：Noto Serif SC 的子集，SIL OFL 1.1 */"]
    for name, weight in WEIGHTS:
        src = os.path.join(FONT_DIR, f"NotoSerifSC-{name}.otf")
        if not os.path.exists(src):
            print(f"  跳过 {name}：没有 {src}")
            continue
        out_name = f"noto-serif-sc-{weight}.woff2"
        out = os.path.join(OUT_FONT_DIR, out_name)
        cmd = [
            sys.executable,
            "-m",
            "fontTools.subset",
            src,
            f"--text-file={chars_file}",
            f"--output-file={out}",
            "--flavor=woff2",
            "--layout-features=kern,liga,locl,ccmp,palt,vert",
            "--no-hinting",
            "--desubroutinize",
            "--drop-tables+=DSIG",
        ]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"  失败 {name}: {r.stderr[:400]}")
            continue
        kb = os.path.getsize(out) // 1024
        print(f"  {out_name:28s} {kb:5d} KB")
        css.append(
            f"""@font-face {{
  font-family: "Noto Serif SC";
  font-style: normal;
  font-weight: {weight};
  font-display: swap;
  src: url("./fonts/{out_name}") format("woff2");
}}"""
        )

    with open(CSS_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(css) + "\n")
    print(f"写入 {os.path.relpath(CSS_PATH, ROOT)}")


if __name__ == "__main__":
    main()
