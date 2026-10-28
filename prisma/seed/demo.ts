// بيانات تجريبية فقط (`npm run db:seed:demo`) — ليست بيانات رسمية ولا تُستخدم في الإنتاج.
// الهدف: تمرين مسارات المركز/الأستاذ/الولي/الطالب على قاعدة حقيقية.
import { randomUUID } from "node:crypto";
import { PrismaClient, Role, FeeType, PayMethod, SessionStatus, AttendStatus, InvoiceStatus } from "@prisma/client";
import { hashPassword } from "../../src/lib/password";

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Demo12345";
const CENTER_SLUG = "nour-demo";

function d(offsetDays: number): Date {
  const x = new Date();
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCDate(x.getUTCDate() + offsetDays);
  return x;
}

function period(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("seed:demo is disabled in production");
  }

  const existing = await prisma.center.findUnique({ where: { slug: CENTER_SLUG } });
  if (existing) {
    console.log(`seed:demo skipped — center "${CENTER_SLUG}" already exists`);
    return;
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const [level4AP, level5AP, level1AM, level2AM] = await Promise.all(
    ["4AP", "5AP", "1AM", "2AM"].map((code) => prisma.level.findUniqueOrThrow({ where: { code } })),
  );
  const subjects = await prisma.subject.findMany({ where: { code: { in: ["AR", "FR", "MATH", "EN", "PHY"] } } });
  const subjectByCode = new Map(subjects.map((s) => [s.code, s]));
  if (!subjectByCode.has("AR") || !subjectByCode.has("MATH")) {
    throw new Error("seed:demo needs the base seed (subjects) to run first: npm run db:seed");
  }

  const center = await prisma.center.create({
    data: { name: "مركز النور للدعم المدرسي (تجريبي)", slug: CENTER_SLUG },
  });

  const branchSpecs = [
    { name: "فرع غرداية", wilayaId: 47, phone: "029000001" },
    { name: "فرع الجزائر العاصمة", wilayaId: 16, phone: "021000002" },
    { name: "فرع وهران", wilayaId: 31, phone: "041000003" },
    { name: "فرع قسنطينة", wilayaId: 25, phone: "031000004" },
    { name: "فرع عنابة", wilayaId: 23, phone: "038000005" },
    { name: "فرع البليدة", wilayaId: 9, phone: "025000006" },
  ];
  const branches = [];
  for (const spec of branchSpecs) {
    branches.push(
      await prisma.branch.create({
        data: {
          centerId: center.id,
          name: spec.name,
          wilayaId: spec.wilayaId,
          phone: spec.phone,
          address: `${spec.name} — عنوان تجريبي`,
          weekDays: [0, 1, 2, 3, 4, 6],
        },
      }),
    );
  }

  const rooms = [];
  for (const branch of branches) {
    for (const n of [1, 2]) {
      rooms.push(
        await prisma.room.create({
          data: { centerId: center.id, branchId: branch.id, name: `قاعة ${n}`, capacity: 20 },
        }),
      );
    }
  }

  const feePlan = await prisma.feePlan.create({
    data: { centerId: center.id, name: "اشتراك شهري", type: FeeType.MONTHLY, amount: 3500, registrationFee: 500 },
  });

  async function makeUser(email: string, fullName: string, role: Role) {
    return prisma.user.create({
      data: { centerId: center.id, email, fullName, role, passwordHash, isActive: true },
    });
  }

  const owner = await makeUser("owner@demo.edudz.dz", "مالك المركز (تجريبي)", Role.CENTER_OWNER);
  const manager = await makeUser("manager@demo.edudz.dz", "مدير الفرع (تجريبي)", Role.BRANCH_MANAGER);
  await prisma.branchStaff.create({ data: { branchId: branches[0].id, userId: manager.id } });
  const secretary = await makeUser("secretary@demo.edudz.dz", "سكرتير المركز (تجريبي)", Role.SECRETARY);
  await prisma.branchStaff.create({ data: { branchId: branches[0].id, userId: secretary.id } });

  const teacherUsers = [];
  const teachers = [];
  const teacherNames = ["أستاذ العربية (تجريبي)", "أستاذ الرياضيات (تجريبي)", "أستاذ الفرنسية (تجريبي)"];
  const teacherSubjects = [["AR"], ["MATH"], ["FR"]];
  for (let i = 0; i < teacherNames.length; i++) {
    const u = await makeUser(`teacher${i + 1}@demo.edudz.dz`, teacherNames[i], Role.TEACHER);
    teacherUsers.push(u);
    teachers.push(
      await prisma.teacher.create({
        data: { centerId: center.id, userId: u.id, subjects: teacherSubjects[i] },
      }),
    );
  }

  await prisma.teacherContract.create({
    data: { centerId: center.id, teacherId: teachers[0].id, model: "PERCENT", rate: 3750 },
  });

  const groupSpecs = [
    { name: "فوج العربية — 4 ابتدائي", subject: "AR", level: level4AP, teacher: 0, branch: 0 },
    { name: "فوج العربية — 5 ابتدائي", subject: "AR", level: level5AP, teacher: 0, branch: 0 },
    { name: "فوج الرياضيات — 1 متوسط", subject: "MATH", level: level1AM, teacher: 1, branch: 0 },
    { name: "فوج الرياضيات — 2 متوسط", subject: "MATH", level: level2AM, teacher: 1, branch: 1 },
    { name: "فوج الفرنسية — 1 متوسط", subject: "FR", level: level1AM, teacher: 2, branch: 1 },
    { name: "فوج الفرنسية — 2 متوسط", subject: "FR", level: level2AM, teacher: 2, branch: 2 },
    { name: "فوج العربية — 1 متوسط", subject: "AR", level: level1AM, teacher: 0, branch: 2 },
    { name: "فوج الرياضيات — 5 ابتدائي", subject: "MATH", level: level5AP, teacher: 1, branch: 3 },
  ];

  const groups = [];
  for (let i = 0; i < groupSpecs.length; i++) {
    const spec = groupSpecs[i];
    const branch = branches[spec.branch];
    groups.push(
      await prisma.group.create({
        data: {
          centerId: center.id,
          branchId: branch.id,
          subjectId: subjectByCode.get(spec.subject)!.id,
          levelId: spec.level.id,
          teacherId: teachers[spec.teacher].id,
          roomId: rooms[spec.branch * 2].id,
          feePlanId: feePlan.id,
          name: spec.name,
          capacity: 15,
          startDate: d(-30),
          status: "ACTIVE",
        },
      }),
    );
  }

  // حصص أسبوعية: السبت والاثنين والأربعاء
  const slotTimes = [
    { weekday: 6, startTime: "09:00", endTime: "10:30" },
    { weekday: 1, startTime: "16:00", endTime: "17:30" },
    { weekday: 3, startTime: "16:00", endTime: "17:30" },
  ];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const slot = slotTimes[i % slotTimes.length];
    await prisma.scheduleSlot.create({
      data: {
        centerId: center.id,
        groupId: g.id,
        roomId: g.roomId!,
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    });
  }

  const levelsForStudents = [level4AP, level5AP, level1AM, level2AM];
  const firstNames = ["محمد", "أحمد", "يوسف", "إلياس", "أمينة", "سارة", "مريم", "نور", "زينب", "عبد الله"];
  const lastNames = ["بوزيد", "عماري", "بلقاسم", "حمدي", "بوعزة"];
  // كلمة مرور غير معروفة للحسابات غير المفعّلة (طلاب التجربة ما عدا حساب الدخول).
  const lockedPasswordHash = await hashPassword(randomUUID());

  const students = [];
  for (let i = 0; i < 40; i++) {
    const branch = branches[i % branches.length];
    const level = levelsForStudents[i % levelsForStudents.length];
    const name = `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / firstNames.length) % lastNames.length]}`;
    const isDemoLogin = i === 0;
    const u = await prisma.user.create({
      data: {
        centerId: center.id,
        email: isDemoLogin ? "student@demo.edudz.dz" : `student${i + 1}@demo.edudz.dz`,
        fullName: isDemoLogin ? `${name} (طالب تجريبي)` : name,
        role: Role.STUDENT,
        passwordHash: isDemoLogin ? passwordHash : lockedPasswordHash,
        isActive: isDemoLogin,
      },
    });
    students.push(
      await prisma.student.create({
        data: {
          centerId: center.id,
          userId: u.id,
          branchId: branch.id,
          levelId: level.id,
          birthDate: d(-365 * (10 + (i % 6))),
          schoolName: "متوسطة/ابتدائية تجريبية",
        },
      }),
    );
  }

  const parentUser = await makeUser("parent@demo.edudz.dz", "ولي الأمر (تجريبي)", Role.PARENT);
  const parent = await prisma.parent.create({ data: { userId: parentUser.id } });
  for (const child of students.slice(0, 3)) {
    await prisma.parentStudent.create({ data: { parentId: parent.id, studentId: child.id } });
  }

  const currentPeriod = period(new Date());

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const group = groups[i % groups.length];
    const enrollment = await prisma.enrollment.create({
      data: {
        centerId: center.id,
        studentId: student.id,
        groupId: group.id,
        status: "ACTIVE",
        startDate: d(-30),
        discountPct: i % 10 === 0 ? 10 : 0,
      },
    });

    const discounted = i % 10 === 0 ? Math.round((feePlan.amount * 90) / 100) : feePlan.amount;
    const paidInFull = i % 3 !== 0;
    const invoice = await prisma.invoice.create({
      data: {
        centerId: center.id,
        enrollmentId: enrollment.id,
        period: currentPeriod,
        total: discounted,
        paid: paidInFull ? discounted : 0,
        status: paidInFull ? InvoiceStatus.PAID : InvoiceStatus.ISSUED,
        dueDate: d(10),
      },
    });

    if (paidInFull) {
      await prisma.payment.create({
        data: {
          centerId: center.id,
          branchId: group.branchId,
          invoiceId: invoice.id,
          amount: discounted,
          method: PayMethod.CASH,
          receiptNo: `DEMO-${String(i + 1).padStart(4, "0")}`,
          receivedBy: owner.id,
        },
      });
    }
  }

  // حصص ماضية مع حضور + حصص قادمة
  for (let gi = 0; gi < 3; gi++) {
    const group = groups[gi];
    const enrolled = await prisma.enrollment.findMany({ where: { groupId: group.id, status: "ACTIVE" } });
    for (const offset of [-7, -3]) {
      const session = await prisma.session.create({
        data: {
          centerId: center.id,
          groupId: group.id,
          roomId: group.roomId!,
          teacherId: group.teacherId,
          date: d(offset),
          startTime: "16:00",
          endTime: "17:30",
          status: SessionStatus.DONE,
        },
      });
      await prisma.attendance.createMany({
        data: enrolled.map((e, idx) => ({
          centerId: center.id,
          sessionId: session.id,
          studentId: e.studentId,
          status: idx % 7 === 0 ? AttendStatus.ABSENT : idx % 5 === 0 ? AttendStatus.LATE : AttendStatus.PRESENT,
          markedBy: owner.id,
        })),
        skipDuplicates: true,
      });
    }
    await prisma.session.create({
      data: {
        centerId: center.id,
        groupId: group.id,
        roomId: group.roomId!,
        teacherId: group.teacherId,
        date: d(2),
        startTime: "16:00",
        endTime: "17:30",
        status: SessionStatus.PLANNED,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      centerId: center.id,
      actorId: owner.id,
      action: "demo.seed",
      entity: "Center",
      entityId: center.id,
      meta: { note: "بيانات تجريبية" },
    },
  });

  await prisma.notification.create({
    data: {
      centerId: center.id,
      userId: owner.id,
      titleAr: "بيانات تجريبية جاهزة",
      bodyAr: "تم إنشاء مركز تجريبي بفروع وأفواج وطلاب وفواتير.",
    },
  });

  const counts = {
    branches: await prisma.branch.count({ where: { centerId: center.id } }),
    rooms: await prisma.room.count({ where: { centerId: center.id } }),
    teachers: await prisma.teacher.count({ where: { centerId: center.id } }),
    groups: await prisma.group.count({ where: { centerId: center.id } }),
    students: await prisma.student.count({ where: { centerId: center.id } }),
    enrollments: await prisma.enrollment.count({ where: { centerId: center.id } }),
    invoices: await prisma.invoice.count({ where: { centerId: center.id } }),
    payments: await prisma.payment.count({ where: { centerId: center.id } }),
    sessions: await prisma.session.count({ where: { centerId: center.id } }),
    attendance: await prisma.attendance.count({ where: { centerId: center.id } }),
  };
  console.log("seed:demo OK —", JSON.stringify(counts));
  console.log(`demo logins (password: ${DEMO_PASSWORD}):`);
  for (const u of [
    "owner@demo.edudz.dz",
    "manager@demo.edudz.dz",
    "secretary@demo.edudz.dz",
    "teacher1@demo.edudz.dz",
    "student@demo.edudz.dz",
    "parent@demo.edudz.dz",
  ]) {
    console.log(`  - ${u}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
