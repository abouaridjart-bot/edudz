import { cookies } from "next/headers";

/**
 * رسالة متطفّرة (flash) عبر كوكي قصير العمر: بogn عن !ok/?error في الرابط،
 * لأن Next.js يعيد فرض عنوانه بعد توجيه server actions فلا يثبت تنظيف الرابط.
 * `FlashToaster` (عميل) يقرأ الكوكي ويعرضه كـ toast ثم يحذفه.
 */
export const FLASH_COOKIE = "edudz_flash";

export async function setFlash(tone: "success" | "error", message: string) {
  const store = await cookies();
  store.set(FLASH_COOKIE, encodeURIComponent(JSON.stringify({ tone, text: message })), {
    path: "/",
    maxAge: 30,
    sameSite: "lax",
  });
}
