export const VIDEO_CLIP_SECONDS = 15;

export const enforceVideoClipWindow = (video, maxSeconds = VIDEO_CLIP_SECONDS) => {
  if (!video || !Number.isFinite(maxSeconds) || maxSeconds <= 0) return;
  if (video.currentTime >= maxSeconds) {
    video.currentTime = 0;
    if (!video.paused) video.play().catch(() => {});
  }
};
