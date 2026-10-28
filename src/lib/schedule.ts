export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  // times in HH:mm format
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const as = toMin(aStart);
  const ae = toMin(aEnd);
  const bs = toMin(bStart);
  const be = toMin(bEnd);
  if (ae <= as || be <= bs) return false;
  if (ae < bs || be < as) return false;
  return as < be && bs < ae;
}

export interface CandidateSlot {
  weekday: number;
  startTime: string;
  endTime: string;
  roomId: string;
  groupId: string;
  teacherId: string;
}

export function findConflicts(candidate: CandidateSlot, existing: CandidateSlot[]) {
  const conflicts: string[] = [];
  for (const ex of existing) {
    if (ex.weekday !== candidate.weekday) continue;
    if (!rangesOverlap(candidate.startTime, candidate.endTime, ex.startTime, ex.endTime)) continue;
    if (ex.roomId === candidate.roomId) conflicts.push("room_conflict");
    if (ex.teacherId === candidate.teacherId) conflicts.push("teacher_conflict");
    if (ex.groupId === candidate.groupId) conflicts.push("group_conflict");
  }
  return Array.from(new Set(conflicts));
}
