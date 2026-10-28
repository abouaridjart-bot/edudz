import { describe, expect, it } from "vitest";
import { findConflicts, rangesOverlap } from "@/lib/schedule";

describe("schedule", () => {
  it("يتحقق من تداخل الأوقات", () => {
    expect(rangesOverlap("08:00", "09:30", "09:00", "10:00")).toBe(true);
    expect(rangesOverlap("08:00", "09:00", "09:00", "10:00")).toBe(false);
    expect(rangesOverlap("08:00", "10:00", "08:30", "09:00")).toBe(true);
  });

  it("يكتشف تعارض القاعة", () => {
    const conflicts = findConflicts(
      { weekday: 0, startTime: "08:00", endTime: "09:30", roomId: "r1", groupId: "g1", teacherId: "t1" },
      [{ weekday: 0, startTime: "09:00", endTime: "10:00", roomId: "r1", groupId: "g2", teacherId: "t2" }],
    );
    expect(conflicts).toContain("room_conflict");
  });

  it("يكتشف تعارض الأستاذ", () => {
    const conflicts = findConflicts(
      { weekday: 1, startTime: "08:00", endTime: "09:30", roomId: "r1", groupId: "g1", teacherId: "t1" },
      [{ weekday: 1, startTime: "08:30", endTime: "09:30", roomId: "r2", groupId: "g2", teacherId: "t1" }],
    );
    expect(conflicts).toContain("teacher_conflict");
  });

  it("لا يتعارض مع قاعة مختلفة وأستاذ مختلف في نفس الوقت", () => {
    const conflicts = findConflicts(
      { weekday: 2, startTime: "08:00", endTime: "09:30", roomId: "r1", groupId: "g1", teacherId: "t1" },
      [{ weekday: 2, startTime: "08:30", endTime: "09:30", roomId: "r2", groupId: "g2", teacherId: "t2" }],
    );
    expect(conflicts.length).toBe(0);
  });
});
