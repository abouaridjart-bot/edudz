import { rangesOverlap } from "@/lib/schedule";

export interface Slot {
  weekday: number;
  startTime: string;
  endTime: string;
  groupId: string;
  teacherId: string;
  roomId: string;
}

export function generateSessions(slots: Slot[], from: Date, to: Date, holidays: Date[] = []) {
  const sessions: Array<{ groupId: string; teacherId: string; roomId: string; date: Date; startTime: string; endTime: string }> = [];
  const holidaySet = new Set(holidays.map((h) => new Date(h).toISOString().slice(0, 10)));
  const cur = new Date(from);
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    if (!holidaySet.has(key)) {
      const wd = cur.getDay(); // 0 Sun? JS: 0 Sun
      for (const s of slots) {
        if (s.weekday === wd) {
          sessions.push({ groupId: s.groupId, teacherId: s.teacherId, roomId: s.roomId, date: new Date(cur), startTime: s.startTime, endTime: s.endTime });
        }
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return sessions;
}

export { rangesOverlap };
