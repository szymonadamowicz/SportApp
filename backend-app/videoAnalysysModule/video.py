import argparse
import json
import math
import sys
import time
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_VIDEO = SCRIPT_DIR / "assets" / "squat_fixed.mp4"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "assets" / "videos"
MODEL_CANDIDATES = [
    SCRIPT_DIR / "yolov8s-pose.pt",
    SCRIPT_DIR / "yolov8m-pose.pt",
]

IMG_SIZE = 960
CONF_DET = 0.25
CONF_KP = 0.32
DRAW_CONF = 0.45
MAX_DET = 5
MAX_GAP_FRAMES = 8

SIDES = {
    "left": {"shoulder": 5, "elbow": 7, "wrist": 9, "hip": 11, "knee": 13, "ankle": 15},
    "right": {"shoulder": 6, "elbow": 8, "wrist": 10, "hip": 12, "knee": 14, "ankle": 16},
}
REQUIRED_JOINTS_BY_EXERCISE = {
    "squat": ("hip", "knee", "ankle"),
    "bench_press": ("shoulder", "elbow", "wrist"),
}
SUPPORTED_EXERCISES = set(REQUIRED_JOINTS_BY_EXERCISE)
SKELETON = (
    ("shoulder", "elbow"),
    ("elbow", "wrist"),
    ("shoulder", "hip"),
    ("hip", "knee"),
    ("knee", "ankle"),
)

COLOR_POINT = (62, 230, 180)
COLOR_LINE = (78, 214, 255)
COLOR_WARN = (0, 183, 255)
COLOR_TEXT = (245, 248, 255)
COLOR_PANEL = (10, 17, 28)


def import_cv2():
    import cv2

    return cv2


def import_numpy():
    import numpy as np

    return np


def clamp(value, lower, upper):
    return max(lower, min(upper, value))


def normalize_exercise(value):
    normalized = (
        (value or "squat")
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
        .replace("\u0142", "l")
        .replace("\u00c5\u201a", "l")
        .replace("\u00e5\u201a", "l")
    )
    aliases = {
        "bench": "bench_press",
        "lawka": "bench_press",
        "wyciskanie": "bench_press",
        "wyciskanie_na_lawce": "bench_press",
        "benchpress": "bench_press",
        "squats": "squat",
        "przysiad": "squat",
        "przysiady": "squat",
    }
    return aliases.get(normalized, normalized)


def exercise_label(exercise):
    return {
        "squat": "Squat",
        "bench_press": "Bench press",
    }.get(exercise, exercise.replace("_", " ").title())


def resolve_model_path(configured_path):
    if configured_path:
        path = Path(configured_path)
        if path.exists():
            return path
        raise FileNotFoundError(f"Pose model not found: {path}")

    for path in MODEL_CANDIDATES:
        if path.exists():
            return path

    candidates = ", ".join(str(path) for path in MODEL_CANDIDATES)
    raise FileNotFoundError(f"No local pose model found. Checked: {candidates}")


def bbox_iou(a, b):
    if a is None or b is None:
        return 0.0

    x1 = max(a[0], b[0])
    y1 = max(a[1], b[1])
    x2 = min(a[2], b[2])
    y2 = min(a[3], b[3])
    width = max(0.0, x2 - x1)
    height = max(0.0, y2 - y1)
    inter = width * height
    if inter <= 0:
        return 0.0

    area_a = max(0.0, a[2] - a[0]) * max(0.0, a[3] - a[1])
    area_b = max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])
    return float(inter / (area_a + area_b - inter + 1e-9))


def choose_person(result, previous_bbox):
    np = import_numpy()

    if result.boxes is None or len(result.boxes) == 0:
        return None, None

    boxes = result.boxes.xyxy.cpu().numpy()
    if len(boxes) == 0:
        return None, None

    if previous_bbox is not None:
        ious = np.array([bbox_iou(box, previous_bbox) for box in boxes], dtype=float)
        best_iou_idx = int(np.argmax(ious))
        if ious[best_iou_idx] >= 0.12:
            return best_iou_idx, boxes[best_iou_idx]

    areas = (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1])
    best_area_idx = int(np.argmax(areas))
    return best_area_idx, boxes[best_area_idx]


def pack_side(xy, confidence, side):
    output = {}
    for name, keypoint_idx in side.items():
        output[name] = [
            float(xy[keypoint_idx, 0]),
            float(xy[keypoint_idx, 1]),
            float(confidence[keypoint_idx]),
        ]
    return output


def side_quality(joints, exercise):
    required_joints = REQUIRED_JOINTS_BY_EXERCISE.get(exercise, REQUIRED_JOINTS_BY_EXERCISE["squat"])
    required_scores = [joints[name][2] for name in required_joints if name in joints]
    if len(required_scores) != len(required_joints):
        return 0.0

    if min(required_scores) < CONF_KP:
        return 0.0

    shoulder_bonus = joints.get("shoulder", [0, 0, 0])[2] * 0.15
    return float(sum(required_scores) / len(required_scores) + shoulder_bonus)


def choose_side(xy, confidence, exercise):
    choices = []
    for side_name, mapping in SIDES.items():
        joints = pack_side(xy, confidence, mapping)
        choices.append((side_quality(joints, exercise), side_name, joints))

    quality, side_name, joints = max(choices, key=lambda item: item[0])
    if quality <= 0:
        return None, None, 0.0

    return side_name, joints, quality


def detect_pose(video_path, model_path, step_frames, max_frames, exercise):
    cv2 = import_cv2()
    np = import_numpy()
    from ultralytics import YOLO

    model = YOLO(str(model_path))
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    frame_limit = total_frames if max_frames <= 0 else min(total_frames or max_frames, max_frames)

    rows = []
    frame_idx = 0
    previous_bbox = None
    previous_detection = None
    start = time.perf_counter()

    while True:
        if max_frames > 0 and frame_idx >= max_frames:
            break

        ok, frame = cap.read()
        if not ok:
            break

        entry = {
            "frame": frame_idx,
            "timestamp": round(frame_idx / fps, 4),
            "side": None,
            "bbox": None,
            "joints": None,
            "quality": 0.0,
        }

        if frame_idx % step_frames == 0:
            results = model(
                frame,
                imgsz=IMG_SIZE,
                conf=CONF_DET,
                max_det=MAX_DET,
                verbose=False,
            )

            if (
                len(results)
                and results[0].keypoints is not None
                and results[0].keypoints.xy is not None
                and results[0].keypoints.xy.shape[0] > 0
            ):
                result = results[0]
                person_idx, bbox = choose_person(result, previous_bbox)
                if person_idx is not None:
                    xy = result.keypoints.xy[person_idx].cpu().numpy()
                    if result.keypoints.conf is None:
                        confidence = np.ones(xy.shape[0], dtype=float)
                    else:
                        confidence = result.keypoints.conf[person_idx].cpu().numpy()

                    side_name, joints, quality = choose_side(xy, confidence, exercise)
                    if side_name and joints:
                        entry["side"] = side_name
                        entry["bbox"] = [float(value) for value in bbox]
                        entry["joints"] = joints
                        entry["quality"] = round(float(quality), 4)
                        previous_bbox = bbox
                        previous_detection = entry
                    else:
                        previous_detection = None
                else:
                    previous_detection = None
            else:
                previous_detection = None
        elif previous_detection is not None:
            entry = {
                **previous_detection,
                "frame": frame_idx,
                "timestamp": round(frame_idx / fps, 4),
                "interpolated": True,
            }

        rows.append(entry)
        frame_idx += 1

        if frame_idx % 30 == 0:
            elapsed = max(0.001, time.perf_counter() - start)
            done = frame_idx
            expected = frame_limit if frame_limit else total_frames
            eta = ((elapsed / done) * max(0, expected - done)) if expected else 0.0
            print(f"processed={done} eta={eta:.1f}s", file=sys.stderr, flush=True)

    cap.release()
    return {
        "fps": float(fps),
        "total_frames": frame_idx,
        "source_frames": total_frames,
        "width": width,
        "height": height,
        "rows": rows,
    }


def extract_joint_series(rows, joint, axis):
    np = import_numpy()
    axis_idx = 0 if axis == "x" else 1
    values = np.full(len(rows), np.nan, dtype=float)

    for idx, row in enumerate(rows):
        joints = row.get("joints")
        if not joints or joint not in joints:
            continue

        point = joints[joint]
        if point[2] >= CONF_KP:
            values[idx] = float(point[axis_idx])

    return values


def fill_short_gaps(values, max_gap=MAX_GAP_FRAMES):
    np = import_numpy()
    filled = values.copy()
    valid = np.where(np.isfinite(filled))[0]
    if len(valid) < 2:
        return filled

    for left, right in zip(valid[:-1], valid[1:]):
        gap = right - left - 1
        if 0 < gap <= max_gap:
            span = right - left
            for offset in range(1, gap + 1):
                ratio = offset / span
                filled[left + offset] = filled[left] + (filled[right] - filled[left]) * ratio

    return filled


def smooth_values(values, window=5):
    np = import_numpy()
    if window <= 1:
        return values

    radius = window // 2
    smoothed = values.copy()
    for idx in range(len(values)):
        start = max(0, idx - radius)
        end = min(len(values), idx + radius + 1)
        chunk = values[start:end]
        valid = chunk[np.isfinite(chunk)]
        if len(valid):
            smoothed[idx] = float(np.median(valid))
    return smoothed


def distance(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def angle_at_joint(a_x, a_y, joint_x, joint_y, b_x, b_y):
    v1_x = a_x - joint_x
    v1_y = a_y - joint_y
    v2_x = b_x - joint_x
    v2_y = b_y - joint_y
    mag1 = math.sqrt(v1_x**2 + v1_y**2)
    mag2 = math.sqrt(v2_x**2 + v2_y**2)
    if mag1 <= 1e-6 or mag2 <= 1e-6:
        return float("nan")

    dot = v1_x * v2_x + v1_y * v2_y
    cos_angle = clamp(dot / (mag1 * mag2), -1.0, 1.0)
    return math.degrees(math.acos(cos_angle))


def detect_reps(hip_norm):
    np = import_numpy()
    values = hip_norm[np.isfinite(hip_norm)]
    if len(values) == 0:
        return 0

    saw_bottom = False
    reps = 0
    for value in values:
        if not saw_bottom and value >= 0.72:
            saw_bottom = True
        elif saw_bottom and value <= 0.35:
            reps += 1
            saw_bottom = False

    if reps == 0 and np.nanmax(values) >= 0.72:
        return 1

    return reps


def detect_angle_reps(angles, flexed_threshold, extended_threshold):
    np = import_numpy()
    values = angles[np.isfinite(angles)]
    if len(values) == 0:
        return 0

    saw_bottom = False
    reps = 0
    for value in values:
        if not saw_bottom and value <= flexed_threshold:
            saw_bottom = True
        elif saw_bottom and value >= extended_threshold:
            reps += 1
            saw_bottom = False

    if reps == 0 and np.nanmin(values) <= flexed_threshold and np.nanmax(values) >= extended_threshold:
        return 1

    return reps


def dominant_side(rows):
    sides = [row.get("side") for row in rows if row.get("side")]
    if not sides:
        return "-"
    return Counter(sides).most_common(1)[0][0]


def low_confidence_result(rows, fps, message, exercise="squat"):
    tracked = sum(1 for row in rows if row.get("joints"))
    total = max(1, len(rows))
    coverage = tracked / total
    required = ", ".join(REQUIRED_JOINTS_BY_EXERCISE.get(exercise, ()))
    return {
        "status": "low_confidence",
        "score": min(40, int(round(coverage * 60))),
        "summary": message,
        "findings": [
            "Record from the side with the working joints clearly visible.",
            f"Keep the phone steady and keep these points inside the frame: {required}.",
            "This is a beta analyzer, so treat the result as a rough signal.",
        ],
        "metrics": {
            "Tracked frames": f"{tracked}/{total}",
            "Tracking coverage": f"{coverage * 100:.0f}%",
            "Exercise": exercise_label(exercise),
            "FPS": f"{fps:.1f}",
            "Side used": dominant_side(rows),
        },
    }


def analyze_squat_rows(rows, fps, total_frames):
    np = import_numpy()

    if len(rows) < 8:
        return low_confidence_result(rows, fps, "The recording is too short for a reliable squat check.", "squat")

    hip_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "hip", "x")))
    hip_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "hip", "y")))
    knee_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "knee", "x")))
    knee_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "knee", "y")))
    ankle_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "ankle", "x")))
    ankle_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "ankle", "y")))
    shoulder_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "shoulder", "x")))
    shoulder_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "shoulder", "y")))

    required_mask = (
        np.isfinite(hip_x)
        & np.isfinite(hip_y)
        & np.isfinite(knee_x)
        & np.isfinite(knee_y)
        & np.isfinite(ankle_x)
        & np.isfinite(ankle_y)
    )
    valid_count = int(np.sum(required_mask))
    tracked_ratio = valid_count / max(1, len(rows))

    if valid_count < 8:
        return low_confidence_result(rows, fps, "Not enough reliable squat keypoints were detected.", "squat")

    scale_values = np.array(
        [
            distance(hx, hy, ax, ay)
            for hx, hy, ax, ay in zip(
                hip_x[required_mask],
                hip_y[required_mask],
                ankle_x[required_mask],
                ankle_y[required_mask],
            )
        ],
        dtype=float,
    )
    body_scale = float(np.nanmedian(scale_values))
    if not np.isfinite(body_scale) or body_scale < 40:
        body_scale = max(120.0, float(np.nanmax(hip_y[required_mask]) - np.nanmin(hip_y[required_mask])) * 2)

    hip_valid = hip_y[required_mask]
    top_hip_y = float(np.nanpercentile(hip_valid, 10))
    bottom_hip_y = float(np.nanpercentile(hip_valid, 90))
    hip_travel = max(1.0, bottom_hip_y - top_hip_y)
    hip_travel_pct = hip_travel / body_scale

    hip_norm_all = (hip_y - top_hip_y) / hip_travel
    reps_detected = detect_reps(hip_norm_all)

    bottom_mask = required_mask & (hip_y >= np.nanpercentile(hip_valid, 82))
    if int(np.sum(bottom_mask)) < 3:
        bottom_mask = required_mask & (hip_y >= bottom_hip_y)

    bottom_hip_mean = float(np.nanmedian(hip_y[bottom_mask]))
    bottom_knee_mean = float(np.nanmedian(knee_y[bottom_mask]))
    depth_delta_pct = (bottom_hip_mean - bottom_knee_mean) / body_scale

    knee_over_ankle = (knee_x[required_mask] - ankle_x[required_mask]) / body_scale
    knee_center = float(np.nanmedian(knee_over_ankle))
    knee_drift_pct = float(np.nanpercentile(np.abs(knee_over_ankle - knee_center), 90))
    bottom_knee_over_ankle = float(
        np.nanmedian(np.abs((knee_x[bottom_mask] - ankle_x[bottom_mask]) / body_scale))
    )

    torso_mask = bottom_mask & np.isfinite(shoulder_x) & np.isfinite(shoulder_y)
    if int(np.sum(torso_mask)) >= 3:
        torso_angles = np.degrees(
            np.abs(np.arctan2(shoulder_x[torso_mask] - hip_x[torso_mask], hip_y[torso_mask] - shoulder_y[torso_mask]))
        )
        torso_lean_deg = float(np.nanmedian(torso_angles))
    else:
        torso_lean_deg = float("nan")

    coverage_score = round(clamp((tracked_ratio / 0.85) * 15, 0, 15))
    depth_score = round(clamp(((depth_delta_pct + 0.16) / 0.22) * 30, 0, 30))
    travel_score = round(clamp((hip_travel_pct / 0.32) * 20, 0, 20))

    if knee_drift_pct <= 0.08:
        stability_score = 15
    elif knee_drift_pct <= 0.14:
        stability_score = 12
    elif knee_drift_pct <= 0.22:
        stability_score = 8
    else:
        stability_score = 4

    if bottom_knee_over_ankle <= 0.28:
        balance_score = 10
    elif bottom_knee_over_ankle <= 0.42:
        balance_score = 7
    else:
        balance_score = 4

    if not np.isfinite(torso_lean_deg):
        torso_score = 6
    elif torso_lean_deg <= 25:
        torso_score = 10
    elif torso_lean_deg <= 40:
        torso_score = 7
    else:
        torso_score = 4

    duration_seconds = total_frames / fps if fps else 0.0
    seconds_per_rep = duration_seconds / max(1, reps_detected)
    if reps_detected >= 1 and 1.2 <= seconds_per_rep <= 8.0:
        tempo_score = 10
    elif reps_detected >= 1:
        tempo_score = 7
    else:
        tempo_score = 4

    score = int(
        clamp(
            coverage_score
            + depth_score
            + travel_score
            + stability_score
            + balance_score
            + torso_score
            + tempo_score,
            0,
            100,
        )
    )
    status = "completed"
    if tracked_ratio < 0.35:
        status = "low_confidence"
        score = min(score, 45)

    findings = []
    if tracked_ratio < 0.55:
        findings.append("Tracking was intermittent. Improve lighting and keep the full body in frame.")
    else:
        findings.append("Pose tracking stayed stable enough for a first-pass score.")

    if depth_delta_pct >= 0.0:
        findings.append("Depth looks close to parallel or below from the tracked side.")
    elif depth_delta_pct >= -0.10:
        findings.append("Depth is close, but hips appear slightly above knee height at the bottom.")
    else:
        findings.append("Depth looks shallow. Try to descend further if mobility and comfort allow.")

    if knee_drift_pct <= 0.14:
        findings.append("Knee path looks reasonably consistent through the rep.")
    else:
        findings.append("Knee path moves noticeably. Check stance, balance, and camera angle.")

    if np.isfinite(torso_lean_deg):
        if torso_lean_deg <= 40:
            findings.append("Torso angle stays within a reasonable range for a squat video.")
        else:
            findings.append("Torso lean looks high near the bottom. Brace and keep the bar path controlled.")
    else:
        findings.append("Shoulder tracking was weak, so torso lean was estimated with low confidence.")

    if reps_detected <= 0:
        findings.append("No full squat cycle was detected. Use a short clip with one clear rep.")
    elif reps_detected == 1:
        findings.append("One squat repetition was detected.")
    else:
        findings.append(f"{reps_detected} squat repetitions were detected.")

    summary = "Squat beta analysis completed. Treat this as a rough signal, not a coaching diagnosis."
    if status == "low_confidence":
        summary = "Squat beta analysis completed with low tracking confidence."

    return {
        "status": status,
        "score": score,
        "summary": summary,
        "findings": findings,
        "metrics": {
            "Tracked frames": f"{valid_count}/{len(rows)}",
            "Tracking coverage": f"{tracked_ratio * 100:.0f}%",
            "Detected reps": str(reps_detected),
            "Depth vs knee": f"{depth_delta_pct * 100:+.0f}% leg",
            "Hip travel": f"{hip_travel_pct * 100:.0f}% leg",
            "Knee drift": f"{knee_drift_pct * 100:.0f}% leg",
            "Knee over ankle": f"{bottom_knee_over_ankle * 100:.0f}% leg",
            "Torso lean": "-" if not np.isfinite(torso_lean_deg) else f"{torso_lean_deg:.0f} deg",
            "Side used": dominant_side(rows),
            "FPS": f"{fps:.1f}",
        },
    }


def analyze_bench_press_rows(rows, fps, total_frames):
    np = import_numpy()

    if len(rows) < 8:
        return low_confidence_result(
            rows,
            fps,
            "The recording is too short for a reliable bench press check.",
            "bench_press",
        )

    shoulder_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "shoulder", "x")))
    shoulder_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "shoulder", "y")))
    elbow_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "elbow", "x")))
    elbow_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "elbow", "y")))
    wrist_x = smooth_values(fill_short_gaps(extract_joint_series(rows, "wrist", "x")))
    wrist_y = smooth_values(fill_short_gaps(extract_joint_series(rows, "wrist", "y")))

    required_mask = (
        np.isfinite(shoulder_x)
        & np.isfinite(shoulder_y)
        & np.isfinite(elbow_x)
        & np.isfinite(elbow_y)
        & np.isfinite(wrist_x)
        & np.isfinite(wrist_y)
    )
    valid_count = int(np.sum(required_mask))
    tracked_ratio = valid_count / max(1, len(rows))

    if valid_count < 8:
        return low_confidence_result(
            rows,
            fps,
            "Not enough reliable shoulder, elbow, and wrist keypoints were detected.",
            "bench_press",
        )

    arm_scale_values = np.array(
        [
            distance(sx, sy, ex, ey) + distance(ex, ey, wx, wy)
            for sx, sy, ex, ey, wx, wy in zip(
                shoulder_x[required_mask],
                shoulder_y[required_mask],
                elbow_x[required_mask],
                elbow_y[required_mask],
                wrist_x[required_mask],
                wrist_y[required_mask],
            )
        ],
        dtype=float,
    )
    arm_scale = float(np.nanmedian(arm_scale_values))
    if not np.isfinite(arm_scale) or arm_scale < 40:
        wrist_range = float(np.nanmax(wrist_y[required_mask]) - np.nanmin(wrist_y[required_mask]))
        arm_scale = max(100.0, wrist_range * 2)

    elbow_angles = np.array(
        [
            angle_at_joint(sx, sy, ex, ey, wx, wy)
            for sx, sy, ex, ey, wx, wy in zip(
                shoulder_x,
                shoulder_y,
                elbow_x,
                elbow_y,
                wrist_x,
                wrist_y,
            )
        ],
        dtype=float,
    )
    elbow_angles = smooth_values(elbow_angles, window=5)
    valid_angles = elbow_angles[required_mask & np.isfinite(elbow_angles)]

    if len(valid_angles) < 8:
        return low_confidence_result(
            rows,
            fps,
            "Elbow angle tracking was too noisy for a bench press score.",
            "bench_press",
        )

    bottom_elbow_angle = float(np.nanpercentile(valid_angles, 10))
    top_elbow_angle = float(np.nanpercentile(valid_angles, 90))
    elbow_range = max(0.0, top_elbow_angle - bottom_elbow_angle)
    flexed_threshold = bottom_elbow_angle + elbow_range * 0.35
    extended_threshold = bottom_elbow_angle + elbow_range * 0.72
    reps_detected = detect_angle_reps(elbow_angles, flexed_threshold, extended_threshold)

    bottom_mask = required_mask & np.isfinite(elbow_angles) & (elbow_angles <= flexed_threshold)
    if int(np.sum(bottom_mask)) < 3:
        bottom_mask = required_mask & np.isfinite(elbow_angles) & (elbow_angles <= bottom_elbow_angle)

    wrist_travel = float(np.nanpercentile(wrist_y[required_mask], 90) - np.nanpercentile(wrist_y[required_mask], 10))
    wrist_travel_pct = wrist_travel / arm_scale
    wrist_over_elbow_bottom = float(
        np.nanmedian(np.abs((wrist_x[bottom_mask] - elbow_x[bottom_mask]) / arm_scale))
    )
    elbow_center = float(np.nanmedian(elbow_x[required_mask]))
    elbow_drift_pct = float(np.nanpercentile(np.abs((elbow_x[required_mask] - elbow_center) / arm_scale), 90))

    full_movement = bottom_elbow_angle <= 115 and top_elbow_angle >= 145 and elbow_range >= 45
    partial_but_clear = bottom_elbow_angle <= 130 and top_elbow_angle >= 135 and elbow_range >= 30

    coverage_score = round(clamp((tracked_ratio / 0.82) * 15, 0, 15))
    range_score = round(clamp((elbow_range / 65) * 25, 0, 25))
    bottom_score = round(clamp(((130 - bottom_elbow_angle) / 35) * 20, 0, 20))
    lockout_score = round(clamp(((top_elbow_angle - 130) / 35) * 15, 0, 15))

    if wrist_over_elbow_bottom <= 0.16:
        stack_score = 10
    elif wrist_over_elbow_bottom <= 0.26:
        stack_score = 7
    else:
        stack_score = 4

    if elbow_drift_pct <= 0.08:
        elbow_path_score = 10
    elif elbow_drift_pct <= 0.16:
        elbow_path_score = 7
    else:
        elbow_path_score = 4

    completion_score = 5 if full_movement else 3 if partial_but_clear else 0
    score = int(
        clamp(
            coverage_score
            + range_score
            + bottom_score
            + lockout_score
            + stack_score
            + elbow_path_score
            + completion_score,
            0,
            100,
        )
    )

    status = "completed"
    if tracked_ratio < 0.35:
        status = "low_confidence"
        score = min(score, 45)

    findings = []
    if full_movement:
        findings.append("Movement looks full: elbows flexed clearly and returned close to extension.")
    elif partial_but_clear:
        findings.append("Movement is visible, but it may be partial. Elbows did not show a strong full range.")
    else:
        findings.append("Movement looks incomplete. Use a short clip with one clear full bench press rep.")

    if bottom_elbow_angle <= 115:
        findings.append("Bottom elbow bend looks deep enough for a first-pass bench check.")
    else:
        findings.append("Bottom position looks shallow. Lower until the elbows show more bend if safe.")

    if top_elbow_angle >= 145:
        findings.append("Top position returns close to arm extension.")
    else:
        findings.append("Top position does not look close to extension. Finish the press more clearly.")

    if wrist_over_elbow_bottom <= 0.26:
        findings.append("Wrist stays reasonably stacked over the elbow near the bottom.")
    else:
        findings.append("Wrist looks far from the elbow line at the bottom. Check grip and elbow position.")

    if elbow_drift_pct <= 0.16:
        findings.append("Elbow path looks fairly stable across the rep.")
    else:
        findings.append("Elbow path drifts noticeably. Keep the press path controlled.")

    if reps_detected <= 0:
        findings.append("No full bench press cycle was detected.")
    elif reps_detected == 1:
        findings.append("One bench press repetition was detected.")
    else:
        findings.append(f"{reps_detected} bench press repetitions were detected.")

    summary = "Bench press beta analysis completed. It checks elbow range and whether the rep looks full."
    if status == "low_confidence":
        summary = "Bench press beta analysis completed with low tracking confidence."

    return {
        "status": status,
        "score": score,
        "summary": summary,
        "findings": findings,
        "metrics": {
            "Full movement": "Yes" if full_movement else "No",
            "Tracked frames": f"{valid_count}/{len(rows)}",
            "Tracking coverage": f"{tracked_ratio * 100:.0f}%",
            "Detected reps": str(reps_detected),
            "Elbow range": f"{elbow_range:.0f} deg",
            "Bottom elbow": f"{bottom_elbow_angle:.0f} deg",
            "Top elbow": f"{top_elbow_angle:.0f} deg",
            "Wrist travel": f"{wrist_travel_pct * 100:.0f}% arm",
            "Wrist over elbow": f"{wrist_over_elbow_bottom * 100:.0f}% arm",
            "Elbow drift": f"{elbow_drift_pct * 100:.0f}% arm",
            "Side used": dominant_side(rows),
            "FPS": f"{fps:.1f}",
        },
    }


def create_writer(cv2, path, fps, width, height):
    for codec in ("avc1", "mp4v"):
        writer = cv2.VideoWriter(
            str(path),
            cv2.VideoWriter_fourcc(*codec),
            fps,
            (width, height),
        )
        if writer.isOpened():
            return writer
        writer.release()

    raise RuntimeError("Cannot create analyzed video writer.")


def draw_pose(cv2, frame, joints):
    if not joints:
        return

    for a, b in SKELETON:
        pa = joints.get(a)
        pb = joints.get(b)
        if pa and pb and pa[2] >= DRAW_CONF and pb[2] >= DRAW_CONF:
            cv2.line(frame, (int(pa[0]), int(pa[1])), (int(pb[0]), int(pb[1])), COLOR_LINE, 3)

    for point in joints.values():
        if point[2] >= DRAW_CONF:
            cv2.circle(frame, (int(point[0]), int(point[1])), 6, COLOR_POINT, -1)
            cv2.circle(frame, (int(point[0]), int(point[1])), 8, (5, 10, 18), 1)


def draw_overlay(cv2, frame, result, row):
    height, width = frame.shape[:2]
    panel_w = min(width - 24, 520)
    panel_h = 128
    x = 12
    y = 12

    overlay = frame.copy()
    cv2.rectangle(overlay, (x, y), (x + panel_w, y + panel_h), COLOR_PANEL, -1)
    cv2.addWeighted(overlay, 0.72, frame, 0.28, 0, frame)
    cv2.rectangle(frame, (x, y), (x + panel_w, y + panel_h), COLOR_LINE, 1)

    score = result.get("score")
    status = result.get("status", "-").replace("_", " ")
    title = f"{exercise_label(result.get('exercise', 'squat'))} beta form analysis"
    score_text = "No score" if score is None else f"Score {score}/100"

    cv2.putText(frame, title, (x + 16, y + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.72, COLOR_TEXT, 2, cv2.LINE_AA)
    cv2.putText(frame, score_text, (x + 16, y + 64), cv2.FONT_HERSHEY_SIMPLEX, 0.9, COLOR_POINT, 2, cv2.LINE_AA)
    cv2.putText(frame, f"Status: {status}", (x + 16, y + 94), cv2.FONT_HERSHEY_SIMPLEX, 0.58, COLOR_TEXT, 1, cv2.LINE_AA)

    if not row.get("joints"):
        cv2.putText(
            frame,
            "No pose lock on this frame",
            (x + 16, y + 118),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            COLOR_WARN,
            1,
            cv2.LINE_AA,
        )
    else:
        cv2.putText(
            frame,
            f"Side: {row.get('side', '-')}",
            (x + 16, y + 118),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            COLOR_TEXT,
            1,
            cv2.LINE_AA,
        )


def write_analyzed_video(video_path, rows, result, output_path, show_preview):
    cv2 = import_cv2()
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video for overlay: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    writer = create_writer(cv2, output_path, fps, width, height)

    idx = 0
    while True:
        ok, frame = cap.read()
        if not ok or idx >= len(rows):
            break

        row = rows[idx]
        draw_pose(cv2, frame, row.get("joints"))
        draw_overlay(cv2, frame, result, row)
        writer.write(frame)

        if show_preview:
            cv2.imshow("Form analysis", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        idx += 1

    cap.release()
    writer.release()
    if show_preview:
        cv2.destroyAllWindows()


def unsupported_result(exercise):
    return {
        "status": "unsupported_exercise",
        "score": None,
        "summary": "This analyzer currently supports squat and bench press video only.",
        "findings": [
            "Choose squat or bench press for the current beta analyzer.",
            "Other exercise types can be added later behind the same upload flow.",
        ],
        "metrics": {"Supported now": "Squat, bench press"},
        "exercise": exercise,
    }


def failed_result(exercise, message):
    return {
        "status": "script_failed",
        "score": None,
        "summary": message,
        "findings": [
            "The video reached the analyzer, but processing could not complete.",
            "Check Python dependencies, model files, and video codec support.",
        ],
        "metrics": {"Engine": "YOLO pose", "Exercise": exercise},
        "exercise": exercise,
    }


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)


def run(args):
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    result_path = output_dir / "analysis_result.json"
    keypoints_path = output_dir / "keypoints_offline.json"
    analyzed_video_path = output_dir / "analyzed.mp4"

    exercise = normalize_exercise(args.exercise)
    if exercise not in SUPPORTED_EXERCISES:
        result = unsupported_result(exercise)
        write_json(result_path, result)
        return result

    model_path = resolve_model_path(args.model)
    detection = detect_pose(
        Path(args.input),
        model_path,
        max(1, args.step_frames),
        max(0, args.max_frames),
        exercise,
    )
    rows = detection["rows"]

    if exercise == "bench_press":
        result = analyze_bench_press_rows(rows, detection["fps"], detection["total_frames"])
    else:
        result = analyze_squat_rows(rows, detection["fps"], detection["total_frames"])
    result["exercise"] = exercise
    result["frames"] = detection["total_frames"]
    result["source_frames"] = detection["source_frames"]
    result["model"] = str(model_path)

    write_json(
        keypoints_path,
        {
            "video": str(Path(args.input)),
            "fps": detection["fps"],
            "width": detection["width"],
            "height": detection["height"],
            "results": rows,
        },
    )

    try:
        write_analyzed_video(
            Path(args.input),
            rows,
            result,
            analyzed_video_path,
            show_preview=not args.no_preview,
        )
        result["analyzed_video"] = str(analyzed_video_path)
    except Exception as exc:
        result["findings"].append(f"Analyzed video overlay could not be written: {exc}")

    write_json(result_path, result)
    return result


def main():
    parser = argparse.ArgumentParser(description="Analyze exercise form from a workout video.")
    parser.add_argument("--input", default=str(DEFAULT_VIDEO), help="Input video path.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Output directory.")
    parser.add_argument("--exercise", default="squat", help="Exercise analyzer. Supports squat and bench_press.")
    parser.add_argument("--model", default="", help="Optional local YOLO pose model path.")
    parser.add_argument("--step-frames", type=int, default=1, help="Run pose detection every N frames.")
    parser.add_argument("--max-frames", type=int, default=0, help="Optional processing cap for long videos.")
    parser.add_argument("--no-preview", action="store_true", help="Disable OpenCV preview window.")
    args = parser.parse_args()

    try:
        result = run(args)
    except Exception as exc:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        result = failed_result(args.exercise, f"Analyzer failed: {exc}")
        write_json(output_dir / "analysis_result.json", result)

    print(json.dumps(result), flush=True)


if __name__ == "__main__":
    main()
