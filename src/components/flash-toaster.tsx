"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const DURATION_MS = 6000;
const POLL_MS = 400;
const COOKIE_NAME = "edudz_flash";

type Flash = { tone: "success" | "error"; text: string };

function readFlash(): Flash | null {
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(COOKIE_NAME + "="));
  if (!entry) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)));
    if (typeof parsed?.text !== "string" || parsed.text.length === 0) return null;
    return { tone: parsed.tone === "error" ? "error" : "success", text: parsed.text };
  } catch {
    return null;
  }
}

/** حذف الكوكي فوراً كي لا تتكرر الرسالة عند التحديث اليدوي أو الرجوع. */
function dropFlash() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * تنبيهات تفاعلية: يراقب كوكي الرسائل القصيرة العمر الذي تضبطه Server Actions،
 * ويعرضها كـ toast معتم يختفي تلقائياً بعد 6 ثوانٍ (أو بالإغلاق اليدوي).
 */
export function FlashToaster() {
  const [flash, setFlash] = useState<Flash | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const show = (next: Flash) => {
    setFlash(next);
    setVisible(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(false), DURATION_MS);
  };

  useEffect(() => {
    const poll = window.setInterval(() => {
      const incoming = readFlash();
      if (incoming) {
        dropFlash();
        show(incoming);
      }
    }, POLL_MS);
    return () => {
      window.clearInterval(poll);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!flash) return null;
  const isError = flash.tone === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="pointer-events-none fixed bottom-6 start-6 z-50 w-[min(22rem,calc(100vw-3rem))]"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur transition-all duration-300 ${
          isError
            ? "border-rose-300/60 bg-rose-50/95 text-rose-900"
            : "border-emerald-300/60 bg-emerald-50/95 text-emerald-900"
        } ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">{flash.text}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="إغلاق التنبيه"
          className="rounded-md p-0.5 opacity-60 transition-colors hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
