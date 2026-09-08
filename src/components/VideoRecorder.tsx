import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SECONDS = 60;

type Props = {
  onRecorded: (blob: Blob | null) => void;
};

export function VideoRecorder({ onRecorded }: Props) {
  const liveRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<"idle" | "ready" | "recording" | "review">("idle");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl, stopTracks],
  );

  async function enableCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {});
      }
      setPhase("ready");
    } catch {
      setError("Camera and microphone access is required to record your video.");
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      onRecorded(blob);
      setPhase("review");
      stopTracks();
    };
    recorder.start();
    setSeconds(0);
    setPhase("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) {
          stopRecording();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  async function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onRecorded(null);
    setSeconds(0);
    setPhase("idle");
    await enableCamera();
  }

  return (
    <div className="space-y-3">
      <div className="card-metal-frame rounded-xl p-[1px]">
        <div className="card-lacquer relative aspect-3/4 w-full overflow-hidden rounded-xl">
          <video
            ref={liveRef}
            playsInline
            muted
            className={`h-full w-full object-cover ${phase === "review" ? "hidden" : ""}`}
          />
          {phase === "review" && previewUrl && (
            <video
              ref={playbackRef}
              src={previewUrl}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          )}
          {phase === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Record a short “why trust me” video — up to 60 seconds
            </div>
          )}
          {phase === "recording" && (
            <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold">
              ● {MAX_SECONDS - seconds}s left
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        {phase === "idle" && (
          <GoldButton onClick={enableCamera}>Enable Camera</GoldButton>
        )}
        {phase === "ready" && <GoldButton onClick={startRecording}>Start Recording</GoldButton>}
        {phase === "recording" && <GoldButton onClick={stopRecording}>Stop</GoldButton>}
        {phase === "review" && <OutlineButton onClick={retake}>Retake</OutlineButton>}
      </div>
    </div>
  );
}

function GoldButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-md bg-gold px-4 py-3 font-display text-xs uppercase tracking-[0.2em] text-gold-foreground transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  );
}

function OutlineButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-md border border-gold/30 px-4 py-3 font-display text-xs uppercase tracking-[0.2em] text-gold/80 transition-colors hover:border-gold hover:text-gold"
    >
      {children}
    </button>
  );
}
