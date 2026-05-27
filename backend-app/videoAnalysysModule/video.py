import argparse
import json
import math
import time
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_VIDEO = SCRIPT_DIR / "assets" / "squat_fixed.mp4"
POSE_MODEL = SCRIPT_DIR / "yolov8m-pose.pt"

IMG_SZ = 960
CONF_DET = 0.25
CONF_KP = 0.35
DRAW_CONF = 0.5
MAX_DET = 5
STEP_FRAMES = 1

LEFT = {"hip": 11, "knee": 13, "ankle": 15}
CLR_PT = (0, 255, 0)
CLR_LINE = (0, 165, 255)


def select_main_person(result):
    if len(result.boxes) == 0:
        return 0

    areas = (
        (result.boxes.xyxy[:, 2] - result.boxes.xyxy[:, 0])
        * (result.boxes.xyxy[:, 3] - result.boxes.xyxy[:, 1])
    )
    return int(areas.argmax())


def pack_side(xy, confidence, side):
    output = {}
    for name, keypoint_idx in side.items():
        output[name] = [
            float(xy[keypoint_idx, 0]),
            float(xy[keypoint_idx, 1]),
            float(confidence[keypoint_idx]),
        ]
    return output


def draw_side(frame, side):
    def ok(point):
        return point is not None and point[2] >= DRAW_CONF

    hip = side.get("hip") if side else None
    knee = side.get("knee") if side else None
    ankle = side.get("ankle") if side else None

    if ok(hip):
        cv2.circle(frame, (int(hip[0]), int(hip[1])), 5, CLR_PT, -1)
    if ok(knee):
        cv2.circle(frame, (int(knee[0]), int(knee[1])), 5, CLR_PT, -1)
    if ok(ankle):
        cv2.circle(frame, (int(ankle[0]), int(ankle[1])), 5, CLR_PT, -1)
    if ok(hip) and ok(knee):
        cv2.line(frame, (int(hip[0]), int(hip[1])), (int(knee[0]), int(knee[1])), CLR_LINE, 2)
    if ok(knee) and ok(ankle):
        cv2.line(frame, (int(knee[0]), int(knee[1])), (int(ankle[0]), int(ankle[1])), CLR_LINE, 2)


def run_pose(video_path, out_video_path, show_preview):
    model = YOLO(str(POSE_MODEL))

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    out_video_path.parent.mkdir(parents=True, exist_ok=True)
    writer = cv2.VideoWriter(
        str(out_video_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    rows = []
    frame_idx = 0
    processed = 0
    start = time.perf_counter()

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        entry = {"frame": frame_idx, "left": None}

        if frame_idx % STEP_FRAMES == 0:
            result = model(
                frame,
                imgsz=IMG_SZ,
                conf=CONF_DET,
                max_det=MAX_DET,
                verbose=False,
            )

            if (
                len(result)
                and result[0].keypoints is not None
                and result[0].keypoints.xy is not None
                and result[0].keypoints.xy.shape[0] > 0
            ):
                model_result = result[0]
                main_idx = select_main_person(model_result)
                xy = model_result.keypoints.xy[main_idx].cpu().numpy()
                confidence = model_result.keypoints.conf[main_idx].cpu().numpy()
                left = pack_side(xy, confidence, LEFT)

                if all(point[2] >= CONF_KP for point in left.values()):
                    entry["left"] = left
                    draw_side(frame, left)

            rows.append(entry)
            processed += 1

            if processed % 30 == 0 and total:
                elapsed = max(0.001, time.perf_counter() - start)
                eta = (elapsed / processed) * (math.ceil(total / STEP_FRAMES) - processed)
                print(f"processed={processed} eta={eta:.1f}s")

        writer.write(frame)

        if show_preview:
            cv2.imshow("Form analysis", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        frame_idx += 1

    cap.release()
    writer.release()
    if show_preview:
        cv2.destroyAllWindows()

    return total, fps, rows


def analyze_squat_rows(rows, fps):
    valid_rows = [
        row
        for row in rows
        if row.get("left")
        and row["left"].get("hip")
        and row["left"].get("knee")
        and row["left"].get("ankle")
    ]

    if len(valid_rows) < 8:
        return {
            "status": "low_confidence",
            "score": 35,
            "summary": "Not enough reliable squat keypoints were detected.",
            "findings": [
                "Record from the side with the full body visible.",
                "Keep the camera steady and make sure hips, knees, and ankles are visible.",
            ],
            "metrics": {
                "tracked_frames": len(valid_rows),
                "fps": round(float(fps), 2),
            },
        }

    hip_y = np.array([row["left"]["hip"][1] for row in valid_rows], dtype=float)
    knee_y = np.array([row["left"]["knee"][1] for row in valid_rows], dtype=float)
    ankle_x = np.array([row["left"]["ankle"][0] for row in valid_rows], dtype=float)
    knee_x = np.array([row["left"]["knee"][0] for row in valid_rows], dtype=float)

    hip_travel = float(np.max(hip_y) - np.min(hip_y))
    bottom_index = int(np.argmax(hip_y))
    bottom_hip_y = float(hip_y[bottom_index])
    bottom_knee_y = float(knee_y[bottom_index])
    knee_forward_px = float(abs(knee_x[bottom_index] - ankle_x[bottom_index]))

    depth_score = min(40, max(0, int((hip_travel / 140.0) * 40)))
    control_score = 30 if hip_travel > 35 else 12
    knee_score = 30 if knee_forward_px < 95 else 18
    score = int(max(0, min(100, depth_score + control_score + knee_score)))

    findings = []
    if hip_travel < 50:
        findings.append("Depth looks shallow. Try to descend a little further if mobility allows.")
    else:
        findings.append("Clear hip descent was detected across the repetition.")

    if bottom_hip_y < bottom_knee_y:
        findings.append("Hip position may still be above knee height at the bottom.")
    else:
        findings.append("Bottom position appears close to parallel from the tracked side.")

    if knee_forward_px > 95:
        findings.append("Knee travel looks high relative to ankle position. Check stance and balance.")
    else:
        findings.append("Knee tracking looks reasonably stable in this recording.")

    return {
        "status": "completed",
        "score": score,
        "summary": "Squat beta analysis completed. Treat this as a rough signal, not a coaching diagnosis.",
        "findings": findings,
        "metrics": {
            "tracked_frames": len(valid_rows),
            "hip_travel_px": round(hip_travel, 1),
            "knee_forward_px": round(knee_forward_px, 1),
            "fps": round(float(fps), 2),
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Analyze exercise form from a video.")
    parser.add_argument("--input", default=str(DEFAULT_VIDEO), help="Input video path.")
    parser.add_argument("--output-dir", default=str(SCRIPT_DIR / "assets" / "videos"), help="Output directory.")
    parser.add_argument("--exercise", default="squat", choices=["squat"], help="Exercise analyzer.")
    parser.add_argument("--no-preview", action="store_true", help="Disable OpenCV preview window.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    keypoints_path = output_dir / "keypoints_offline.json"
    analyzed_video_path = output_dir / "analyzed.mp4"
    result_path = output_dir / "analysis_result.json"

    total, fps, rows = run_pose(input_path, analyzed_video_path, show_preview=not args.no_preview)

    with open(keypoints_path, "w", encoding="utf-8") as file:
        json.dump({"video": str(input_path), "fps": float(fps), "results": rows}, file, indent=2)

    result = analyze_squat_rows(rows, fps)
    result["exercise"] = args.exercise
    result["frames"] = total
    result["analyzed_video"] = str(analyzed_video_path)

    with open(result_path, "w", encoding="utf-8") as file:
        json.dump(result, file, indent=2)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
