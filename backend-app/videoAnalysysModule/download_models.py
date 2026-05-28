import argparse
import hashlib
import sys
import urllib.request
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent

MODELS = {
    "yolov8s-pose": {
        "file": "yolov8s-pose.pt",
        "url": "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8s-pose.pt",
        "sha256": "234314CD8BAF62616791ACEB9EA6AD5C19F26CF6C0D8F3A1BFCE1E23B186CFB3",
    },
    "yolov8m-pose": {
        "file": "yolov8m-pose.pt",
        "url": "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8m-pose.pt",
        "sha256": "DBE539EA268DB2534390942CFDF206E521F376F19E5415967A57F6A2DDFA3C90",
    },
    "yolov8m": {
        "file": "yolov8m.pt",
        "url": "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8m.pt",
        "sha256": "5D4A90CDC7A21786CC59CD19778E9EAFFF836DF9E2DA32524737C7EE6EFE4FE5",
    },
}


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def download_model(name, output_dir, force):
    model = MODELS[name]
    output_dir.mkdir(parents=True, exist_ok=True)
    target = output_dir / model["file"]

    if target.exists() and not force:
        current_hash = sha256(target)
        if current_hash == model["sha256"]:
            print(f"{target.name} already exists and checksum is valid.")
            return

        raise RuntimeError(
            f"{target.name} already exists but checksum differs. Re-run with --force to replace it."
        )

    tmp = target.with_suffix(target.suffix + ".tmp")
    if tmp.exists():
        tmp.unlink()

    print(f"Downloading {target.name}...")
    urllib.request.urlretrieve(model["url"], tmp)

    downloaded_hash = sha256(tmp)
    if downloaded_hash != model["sha256"]:
        tmp.unlink(missing_ok=True)
        raise RuntimeError(
            f"Checksum mismatch for {target.name}. Expected {model['sha256']}, got {downloaded_hash}."
        )

    tmp.replace(target)
    print(f"Saved {target}")


def parse_models(values):
    if "all" in values:
        return list(MODELS)

    unknown = [value for value in values if value not in MODELS]
    if unknown:
        valid = ", ".join(sorted([*MODELS, "all"]))
        raise ValueError(f"Unknown model(s): {', '.join(unknown)}. Valid values: {valid}.")

    return values


def main():
    parser = argparse.ArgumentParser(description="Download YOLO model weights for form analysis.")
    parser.add_argument(
        "--models",
        nargs="+",
        default=["yolov8s-pose"],
        help="Models to download: yolov8s-pose, yolov8m-pose, yolov8m, or all.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(SCRIPT_DIR),
        help="Directory where .pt files should be stored.",
    )
    parser.add_argument("--force", action="store_true", help="Replace existing model files.")
    args = parser.parse_args()

    try:
        for name in parse_models(args.models):
            download_model(name, Path(args.output_dir), args.force)
    except Exception as exc:
        print(f"Model download failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
