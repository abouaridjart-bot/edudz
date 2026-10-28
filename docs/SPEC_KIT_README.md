# EduDZ SpecKit — منصة تعليمية على المنهاج الجزائري + جناح تسيير المدارس الخصوصية

حزمة مواصفات محمولة (Portable Spec Kit) تعمل مع أي أداة ذكاء اصطناعي (Claude, ChatGPT, Gemini, Cursor, Windsurf, Replit Agent, Bolt, Lovable, v0, Copilot, Firebase Studio …).

## محتويات الحزمة
| الملف | الغرض |
|---|---|
| `00_MASTER_PROMPT.md` | البرومبت الرئيسي: الصقه كما هو في الأداة |
| `AGENTS.md` | قواعد دائمة (انسخه أيضاً باسم `CLAUDE.md` أو `.cursorrules` أو `.windsurfrules` أو `GEMINI.md` حسب الأداة) |
| `HANDOFF.md` | ملف التسليم: يسجّل المرحلة الحالية وما تبقى، لاستكمال العمل في أداة/جلسة أخرى |
| `docs/01_PLAN.md` | مخطط الخطوات (المراحل 0–9) مع معايير الإنجاز |
| `docs/02_REQUIREMENTS.md` | ملف المتطلبات الوظيفية وغير الوظيفية |
| `docs/03_SPEC.md` | المواصفات التفصيلية: الأدوار، المسارات، قواعد العمل، الواجهات |
| `docs/04_CURRICULUM_SEED.md` | هيكل المنهاج الجزائري كبيانات تمهيدية قابلة للتعديل |
| `docs/05_QA_SECURITY.md` | قائمة الجودة والأمان والنشر |
| `prisma/schema.draft.prisma` | مسودة نموذج البيانات |

## طريقة الاستخدام (دون تنصيب أي برنامج)
1. أنشئ مشروعاً في بيئة سحابية في المتصفح: GitHub Codespaces أو Replit أو Firebase Studio أو StackBlitz/Bolt أو IDX.
2. ارفع محتويات هذا المجلد إلى جذر المشروع (أو الصق الملفات في الدردشة إن كانت الأداة لا تدعم الملفات).
3. أنشئ قاعدة PostgreSQL مجانية مستضافة (Neon أو Supabase) وضع رابطها في `DATABASE_URL`.
4. الصق `00_MASTER_PROMPT.md` في الأداة وأرسله.
5. عند نفاد الرموز (tokens) أو تغيير الأداة: اطلب من الأداة تحديث `HANDOFF.md` ثم ابدأ جلسة جديدة بالجملة:
   «اقرأ AGENTS.md و HANDOFF.md ثم تابع من المرحلة المسجّلة».
6. النشر: Vercel (أو Netlify/Render) مباشرة من GitHub، دون Docker.
