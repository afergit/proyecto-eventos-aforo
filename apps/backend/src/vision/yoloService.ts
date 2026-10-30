// src/vision/yoloService.ts
/**
 * Simple stub for YOLOv8 detection.
 * In a real implementation this would load a model and run inference
 * on an image buffer, returning an array of detections.
 */
export type DetectionResult = {
  label: string;
  confidence: number; // 0‑1
  bbox: [number, number, number, number]; // [x, y, width, height]
};

export async function detectExit(frame: Buffer): Promise<DetectionResult[]> {
  // Placeholder: always return empty array (no exit detected).
  // Replace with actual model inference when the library is added.
  return [];
}
