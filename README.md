# EduDZ

منصة تعليمية على المنهاج الجزائري + جناح تسيير مراكز الدروس الخصوصية الحضورية. تعمل من المتصفح، بلا Docker.

**الحالة:** المرحلتان 0 و1 مكتوبتان وبانتظار أول تحقق في بيئة متصلة. ابدأ من `HANDOFF.md`.

## تشغيل سريع (في Codespaces/Replit/Firebase Studio)
```bash
cp .env.example .env        # املأ DATABASE_URL و DIRECT_URL من Neon أو Supabase
npm install
npx prisma validate
npm run typecheck && npm run lint && npm test
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## الملفات المرجعية
`AGENTS.md` القواعد · `HANDOFF.md` أين توقف العمل · `docs/06_REMAINING_PHASES.md` المتبقي · `docs/01_PLAN.md` المخطط · `docs/02_REQUIREMENTS.md` المتطلبات · `docs/03_SPEC.md` المواصفات · `00_MASTER_PROMPT.md` البرومبت الرئيسي.
