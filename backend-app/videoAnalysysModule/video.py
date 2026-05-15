# offline_pose_keypoints_and_play.py
import cv2, time, json, math, bisect
import numpy as np
from pathlib import Path
from ultralytics import YOLO

VIDEO = "assets/squat_fixed.mp4"
OUT_JSON = "assets/keypoints_offline.json"
OUT_VIDEO = "assets/videos/output.mp4"

POSE_MODEL = "yolov8m-pose.pt"
IMG_SZ = 960
CONF_KP = 0.35
STEP_FRAMES = 1

DRAW_CONF = 0.50
ALPHA = 0.35 
RADIUS = 5
CLR_PT = (0, 255, 0)
CLR_LINE = (0, 165, 255)
THICK = 2
BOTH_SIDES = False

LEFT = {"hip":11, "knee":13, "ankle":15}
RIGHT= {"hip":12, "knee":14, "ankle":16}

TRACKER_YAML = "bytetrack.yaml"
CONF_DET = 0.25
MAX_DET = 5
HOLD_MAX = 8 
IOU_THR  = 0.40

HIP_DELTA_TRIGGER = 20.0
KNEE_OFF_X       = -6
KNEE_OFF_Y       = -5

def iou_xyxy(a, b):
    if a is None or b is None: return 0.0
    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])
    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])
    iw = max(0.0, x2 - x1); ih = max(0.0, y2 - y1)
    inter = iw * ih
    if inter <= 0: return 0.0
    aa = max(0.0,(a[2]-a[0]))*max(0.0,(a[3]-a[1]))
    ab = max(0.0,(b[2]-b[0]))*max(0.0,(b[3]-b[1]))
    return float(inter / (aa + ab - inter + 1e-9))

def select_main_person(result):
    if len(result.boxes) == 0:
        return 0
    areas = (result.boxes.xyxy[:, 2] - result.boxes.xyxy[:, 0]) * (result.boxes.xyxy[:, 3] - result.boxes.xyxy[:, 1])
    return int(areas.argmax())

def run_offline_pose(video_path: str):
    model = YOLO(POSE_MODEL)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Nie mogę otworzyć: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    rows = []
    processed = 0
    t0 = time.perf_counter()
    steps_total = math.ceil(total / STEP_FRAMES)

    idx = 0

    prev_id = None
    prev_bbox = None
    prev_left = None
    hold_left = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        if idx % STEP_FRAMES == 0:
            res = model.track(
                frame, imgsz=IMG_SZ, conf=CONF_DET, max_det=MAX_DET,
                verbose=False, persist=True, tracker=TRACKER_YAML
            )

            entry = {"frame": idx, "left": None, "right": None}
            if len(res) and res[0].keypoints is not None and res[0].keypoints.xy is not None and res[0].keypoints.xy.shape[0] > 0:
                r = res[0]
                xyxy = r.boxes.xyxy.cpu().numpy() if (r.boxes is not None and r.boxes.xyxy is not None) else None
                ids_t = r.boxes.id if (r.boxes is not None and hasattr(r.boxes, "id")) else None

                main_idx = None
                if ids_t is not None and prev_id is not None:
                    ids = ids_t.cpu().numpy().astype(int)
                    m = np.where(ids == int(prev_id))[0]
                    if m.size > 0:
                        main_idx = int(m[0])

                if main_idx is None and xyxy is not None and prev_bbox is not None and len(xyxy) > 0:
                    ious = np.array([iou_xyxy(b, prev_bbox) for b in xyxy], dtype=float)
                    j = int(np.argmax(ious))
                    if ious[j] >= IOU_THR:
                        main_idx = j
                        if ids_t is not None:
                            prev_id = int(ids_t.cpu().numpy().astype(int)[j])

                if main_idx is None:
                    if prev_left is not None and hold_left < HOLD_MAX:
                        entry["left"] = prev_left
                        hold_left += 1
                        rows.append(entry)
                        idx += 1
                        continue
                    main_idx = select_main_person(r)
                    if ids_t is not None:
                        prev_id = int(ids_t.cpu().numpy().astype(int)[main_idx])
                    hold_left = 0  # reset

                xy = r.keypoints.xy[main_idx].cpu().numpy()
                cf = r.keypoints.conf[main_idx].cpu().numpy()
                bbox = xyxy[main_idx] if xyxy is not None else None

                def pack(side):
                    out = {}
                    for name, k in side.items():
                        out[name] = [float(xy[k,0]), float(xy[k,1]), float(cf[k])]
                    return out

                entry["left"] = pack(LEFT)
                if BOTH_SIDES:
                    entry["right"] = pack(RIGHT)

                prev_bbox = bbox
                prev_left = entry["left"]
                hold_left = 0

                lh = entry["left"]["hip"]
            else:
                if prev_left is not None and hold_left < HOLD_MAX:
                    entry["left"] = prev_left
                    hold_left += 1

            rows.append(entry)
            processed += 1
            if processed % 10 == 0 or processed == 1:
                elapsed = time.perf_counter() - t0
                eta = (elapsed/processed)*(steps_total-processed)

        idx += 1

    cap.release()
    return total, fps, rows

def save_json(video_path, fps, rows, out_json):
    Path(out_json).parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({"video": str(video_path), "fps": float(fps), "results": rows}, f, indent=2)

def lerp(a, b, t): return a + (b - a) * t

def interpolate_rows(frame_count, rows):
    by_f = {r["frame"]: r for r in rows}
    keys = sorted(by_f.keys())

    def interp_side(i, side_name):
        pos = bisect.bisect_right(keys, i)
        lf = keys[pos-1] if pos>0 else None
        rf = keys[pos] if pos<len(keys) else None
        def get(entry, j):
            if entry is None or entry.get(side_name) is None: return None
            return entry[side_name].get(j)
        out = {}
        for joint in ("hip","knee","ankle"):
            pl = get(by_f.get(lf), joint)
            pr = get(by_f.get(rf), joint)
            if pl is None and pr is None:
                out[joint] = None
            elif pl is None:
                out[joint] = pr
            elif pr is None:
                out[joint] = pl
            else:
                if rf == lf:
                    out[joint] = pl
                else:
                    t = (i - lf) / (rf - lf)
                    out[joint] = [lerp(pl[0],pr[0],t), lerp(pl[1],pr[1],t), lerp(pl[2],pr[2],t)]
        return out if any(v is not None for v in out.values()) else None

    interp = []
    for i in range(frame_count):
        interp.append({"frame": i, "left": interp_side(i, "left")})
    return interp

def playback_and_save(video_path, interp_rows, out_path, fps_target):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Nie mogę otworzyć: {video_path}")

    W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps_in = cap.get(cv2.CAP_PROP_FPS) or 30.0
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    out = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*'mp4v'), fps_in, (W,H))

    ema = {"hip":None,"knee":None,"ankle":None}

    def ema_update(ema_dict, side):
        for j in ("hip","knee","ankle"):
            v = side.get(j) if side else None
            if v is None: continue
            x,y,c = v
            if ema_dict[j] is None:
                ema_dict[j] = [x,y,c]
            else:
                ex,ey,ec = ema_dict[j]
                ema_dict[j] = [ALPHA*x+(1-ALPHA)*ex, ALPHA*y+(1-ALPHA)*ey, ALPHA*c+(1-ALPHA)*ec]

    def draw_side(img, side, clr):
        def ok(p): return (p is not None and p[2] >= DRAW_CONF)
        h=side.get("hip");k=side.get("knee");a=side.get("ankle")
        if ok(h): cv2.circle(img,(int(h[0]),int(h[1])),RADIUS,clr,-1)
        if ok(k): cv2.circle(img,(int(k[0]),int(k[1])),RADIUS,clr,-1)
        if ok(a): cv2.circle(img,(int(a[0]),int(a[1])),RADIUS,clr,-1)
        if ok(h) and ok(k): cv2.line(img,(int(h[0]),int(h[1])),(int(k[0]),int(k[1])),CLR_LINE,THICK)
        if ok(k) and ok(a): cv2.line(img,(int(k[0]),int(k[1])),(int(a[0]),int(a[1])),CLR_LINE,THICK)

    dt = 1.0 / fps_target
    t = time.perf_counter()
    i = 0
    total = len(interp_rows)

    min_hip_y = None
    for r in interp_rows:
        left = r.get("left")
        if not left or not left.get("hip"):
            continue
        hx, hy, hc = left["hip"]
        if hc is None or hc < DRAW_CONF:
            continue
        if min_hip_y is None or hy < min_hip_y:
            min_hip_y = hy

    while True:
        ok, frame = cap.read()
        if not ok or i >= total:
            break

        row = interp_rows[i]
        ema_update(ema, row.get("left"))

        if min_hip_y is not None and ema.get("hip") is not None and ema.get("knee") is not None:
            hx, hy, hc = ema["hip"]
            kx, ky, kc = ema["knee"]
            if (hc is None or hc >= DRAW_CONF) and (kc is None or kc >= DRAW_CONF):
                if hy >= (min_hip_y + HIP_DELTA_TRIGGER):
                    ema["knee"] = [kx + KNEE_OFF_X, ky + KNEE_OFF_Y, kc]

        draw_side(frame, ema, CLR_PT)

        out.write(frame)

        cv2.imshow("Playback (saving…)", frame)
        time.sleep(max(0, t + dt - time.perf_counter()))
        t += dt
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        i += 1

    cap.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    total, fps, rows = run_offline_pose(VIDEO)
    save_json(VIDEO, fps, rows, OUT_JSON)
    interp = interpolate_rows(total, rows)
    playback_and_save(VIDEO, interp, OUT_VIDEO, TARGET_FPS := 30)


