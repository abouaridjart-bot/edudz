import { describe, expect, it } from "vitest";
import { generateSessions } from "@/lib/sessions-generate";

describe("generateSessions", () => {
  it("يولد حصص وفق أيام الأسبوع ويستثني العطل", () => {
    const from = new Date("2026-10-26"); // Mon? adjust
    const to = new Date("2026-10-27");
    const slots = [{ weekday: from.getDay(), startTime: "08:00", endTime: "09:30", groupId: "g1", teacherId: "t1", roomId: "r1" }];
    const res = generateSessions(slots, from, to, []);
    expect(res.length).toBe(1);
  });
  it("يستثني العطلة", () => {
    const from = new Date("2026-10-26T00:00:00.000Z");
    const to = new Date("2026-10-26T00:00:00.000Z");
    const slots = [{ weekday: new Date("2026-10-26T12:00:00.000Z").getDay(), startTime: "08:00", endTime: "09:30", groupId: "g1", teacherId: "t1", roomId: "r1" }];
    const res = generateSessions(slots, from, to, [from]);
    expect(res.length).toBe(0);
  });
});
