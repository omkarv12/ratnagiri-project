import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
// Put your audio file at src/assets/Ratnagiri-Welcome.mp3
import musicSrc from "../assets/Ratnagiri-Welcome.mp3";

/*
  Background music button — a small square icon fixed to the side of the screen.

  - Tries to start the audio as soon as the site opens.
  - Browsers (Chrome, Safari, Firefox) BLOCK sound until the visitor clicks, taps
    or presses a key once. So if autoplay is blocked, the music starts on the
    first click / tap / key anywhere on the page (for example the first button
    they press in the "How did you hear about us" popup).
  - The icon turns the music off/on. If the visitor turns it off, it stays off
    for the rest of that visit.
  - Pauses while the browser tab is hidden.

  Mount it ONCE in App.jsx, next to <HowDidYouHearModal />, so it starts when the
  website starts and keeps playing while people move between pages:
      import MusicToggle from "./components/MusicToggle";
      ...
      <MusicToggle />
*/

const VOLUME = 0.5; // 0 to 1
const LOOP = true; // set to false for a voice-over that should play only once
const OFF_KEY = "rt-music-off";

const readOff = () => {
  try {
    return sessionStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
};
const saveOff = (off) => {
  try {
    sessionStorage.setItem(OFF_KEY, off ? "1" : "0");
  } catch {
    /* ignore */
  }
};

export default function MusicToggle() {
  const audioRef = useRef(null);
  const btnRef = useRef(null);
  const wantPlay = useRef(!readOff()); // false once the visitor turns music off
  const resumeAfterHidden = useRef(false);
  // waiting = autoplay blocked, will start on first click; playing; paused
  const [status, setStatus] = useState(wantPlay.current ? "waiting" : "paused");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = VOLUME;

    const events = ["pointerdown", "keydown", "touchstart"];
    const removeUnlock = () => events.forEach((e) => window.removeEventListener(e, unlock));

    function unlock(e) {
      // a click on the music button is handled by the button itself
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (!wantPlay.current) return;
      audio
        .play()
        .then(() => {
          setStatus("playing");
          removeUnlock();
        })
        .catch(() => {});
    }

    events.forEach((e) => window.addEventListener(e, unlock));

    if (wantPlay.current) {
      audio
        .play()
        .then(() => {
          setStatus("playing");
          removeUnlock();
        })
        .catch(() => setStatus("waiting"));
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (!audio.paused) {
          resumeAfterHidden.current = true;
          audio.pause();
        }
      } else if (resumeAfterHidden.current) {
        resumeAfterHidden.current = false;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      removeUnlock();
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (status === "playing") {
      audio.pause();
      wantPlay.current = false;
      saveOff(true);
      setStatus("paused");
    } else {
      wantPlay.current = true;
      saveOff(false);
      audio
        .play()
        .then(() => setStatus("playing"))
        .catch(() => setStatus("waiting"));
    }
  };

  const playing = status === "playing";

  return (
    <div className="fixed bottom-6 right-3 z-40 flex items-center sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
      <audio ref={audioRef} src={musicSrc} loop={LOOP} preload="auto" onEnded={() => setStatus("paused")} />

      {status === "waiting" && (
        <span className="mr-2 hidden bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--rt-ink)] shadow-lg sm:block">
          Tap anywhere to play music
        </span>
      )}

      <button
        ref={btnRef}
        onClick={toggle}
        aria-label={playing ? "Turn music off" : "Turn music on"}
        aria-pressed={playing}
        title={playing ? "Music on — click to turn off" : "Music off — click to turn on"}
        className="relative flex h-12 w-12 items-center justify-center bg-[color:var(--rt-ink)]/85 text-white shadow-lg ring-1 ring-white/30 backdrop-blur transition hover:bg-[color:var(--rt-laterite)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--rt-gold)]"
      >
        {playing && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping border border-[color:var(--rt-gold)] motion-reduce:hidden"
          />
        )}
        {playing ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}
