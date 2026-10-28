/**
 * بيانات تمهيدية للمنهاج الجزائري — هيكل عام فقط.
 * لا معاملات ولا أحجام ساعية هنا (تُدخل من لوحة المشرف من المصدر الرسمي).
 * VERIFY: official source — راجع الأسماء والعدد مع وثائق وزارة التربية الوطنية قبل الإنتاج.
 */
export type CycleCode = "PRIMARY" | "MIDDLE" | "SECONDARY";

export interface LevelSeed { code: string; cycle: CycleCode; nameAr: string; nameFr: string; order: number }
export interface StreamSeed { levelCode: string; code: string; nameAr: string; nameFr: string }
export interface SubjectSeed { code: string; nameAr: string; nameFr: string }
export interface WilayaSeed { id: number; nameAr: string; nameFr: string }

export const SEED_SOURCE_NOTE = "VERIFY: official source";

export const LEVELS: LevelSeed[] = [
  { code: "1AP", cycle: "PRIMARY", nameAr: "السنة الأولى ابتدائي", nameFr: "1re année primaire", order: 1 },
  { code: "2AP", cycle: "PRIMARY", nameAr: "السنة الثانية ابتدائي", nameFr: "2e année primaire", order: 2 },
  { code: "3AP", cycle: "PRIMARY", nameAr: "السنة الثالثة ابتدائي", nameFr: "3e année primaire", order: 3 },
  { code: "4AP", cycle: "PRIMARY", nameAr: "السنة الرابعة ابتدائي", nameFr: "4e année primaire", order: 4 },
  { code: "5AP", cycle: "PRIMARY", nameAr: "السنة الخامسة ابتدائي", nameFr: "5e année primaire", order: 5 },
  { code: "1AM", cycle: "MIDDLE", nameAr: "السنة الأولى متوسط", nameFr: "1re année moyenne", order: 6 },
  { code: "2AM", cycle: "MIDDLE", nameAr: "السنة الثانية متوسط", nameFr: "2e année moyenne", order: 7 },
  { code: "3AM", cycle: "MIDDLE", nameAr: "السنة الثالثة متوسط", nameFr: "3e année moyenne", order: 8 },
  { code: "4AM", cycle: "MIDDLE", nameAr: "السنة الرابعة متوسط", nameFr: "4e année moyenne", order: 9 },
  { code: "1AS", cycle: "SECONDARY", nameAr: "السنة الأولى ثانوي", nameFr: "1re année secondaire", order: 10 },
  { code: "2AS", cycle: "SECONDARY", nameAr: "السنة الثانية ثانوي", nameFr: "2e année secondaire", order: 11 },
  { code: "3AS", cycle: "SECONDARY", nameAr: "السنة الثالثة ثانوي", nameFr: "3e année secondaire", order: 12 },
];

const UPPER_STREAMS: Omit<StreamSeed, "levelCode">[] = [
  { code: "SE", nameAr: "علوم تجريبية", nameFr: "Sciences expérimentales" },
  { code: "MA", nameAr: "رياضيات", nameFr: "Mathématiques" },
  { code: "TM_CIVIL", nameAr: "تقني رياضي — هندسة مدنية", nameFr: "Technique math — Génie civil" },
  { code: "TM_ELEC", nameAr: "تقني رياضي — هندسة كهربائية", nameFr: "Technique math — Génie électrique" },
  { code: "TM_MECH", nameAr: "تقني رياضي — هندسة ميكانيكية", nameFr: "Technique math — Génie mécanique" },
  { code: "TM_PROC", nameAr: "تقني رياضي — هندسة الطرائق", nameFr: "Technique math — Génie des procédés" },
  { code: "GE", nameAr: "تسيير واقتصاد", nameFr: "Gestion et économie" },
  { code: "LP", nameAr: "آداب وفلسفة", nameFr: "Lettres et philosophie" },
  { code: "LE", nameAr: "لغات أجنبية", nameFr: "Langues étrangères" },
];

export const STREAMS: StreamSeed[] = [
  { levelCode: "1AS", code: "ST", nameAr: "جذع مشترك علوم وتكنولوجيا", nameFr: "Tronc commun sciences et technologie" },
  { levelCode: "1AS", code: "LT", nameAr: "جذع مشترك آداب", nameFr: "Tronc commun lettres" },
  ...(["2AS", "3AS"] as const).flatMap((levelCode) => UPPER_STREAMS.map((s) => ({ levelCode, ...s }))),
];

export const SUBJECTS: SubjectSeed[] = [
  { code: "AR", nameAr: "اللغة العربية", nameFr: "Langue arabe" },
  { code: "AMZ", nameAr: "اللغة الأمازيغية", nameFr: "Tamazight" },
  { code: "FR", nameAr: "اللغة الفرنسية", nameFr: "Français" },
  { code: "EN", nameAr: "اللغة الإنجليزية", nameFr: "Anglais" },
  { code: "ES", nameAr: "اللغة الإسبانية", nameFr: "Espagnol" },
  { code: "DE", nameAr: "اللغة الألمانية", nameFr: "Allemand" },
  { code: "IT", nameAr: "اللغة الإيطالية", nameFr: "Italien" },
  { code: "MATH", nameAr: "الرياضيات", nameFr: "Mathématiques" },
  { code: "PHYS", nameAr: "العلوم الفيزيائية", nameFr: "Sciences physiques" },
  { code: "SVT", nameAr: "علوم الطبيعة والحياة", nameFr: "Sciences naturelles et de la vie" },
  { code: "INFO", nameAr: "الإعلام الآلي", nameFr: "Informatique" },
  { code: "HG", nameAr: "التاريخ والجغرافيا", nameFr: "Histoire-Géographie" },
  { code: "ISL", nameAr: "التربية الإسلامية", nameFr: "Éducation islamique" },
  { code: "CIV", nameAr: "التربية المدنية", nameFr: "Éducation civique" },
  { code: "PHIL", nameAr: "الفلسفة", nameFr: "Philosophie" },
  { code: "ENG_CIVIL", nameAr: "الهندسة المدنية", nameFr: "Génie civil" },
  { code: "ENG_ELEC", nameAr: "الهندسة الكهربائية", nameFr: "Génie électrique" },
  { code: "ENG_MECH", nameAr: "الهندسة الميكانيكية", nameFr: "Génie mécanique" },
  { code: "ENG_PROC", nameAr: "هندسة الطرائق", nameFr: "Génie des procédés" },
  { code: "ECO", nameAr: "الاقتصاد والمناجمنت", nameFr: "Économie et management" },
  { code: "LAW", nameAr: "القانون", nameFr: "Droit" },
  { code: "ACC", nameAr: "المحاسبة والمالية", nameFr: "Comptabilité et finance" },
  { code: "PE", nameAr: "التربية البدنية والرياضية", nameFr: "Éducation physique et sportive" },
  { code: "ART", nameAr: "التربية الفنية", nameFr: "Éducation artistique" },
  { code: "MUS", nameAr: "التربية الموسيقية", nameFr: "Éducation musicale" },
];

export const WILAYAS: WilayaSeed[] = [
  { id: 1, nameAr: "أدرار", nameFr: "Adrar" },
  { id: 2, nameAr: "الشلف", nameFr: "Chlef" },
  { id: 3, nameAr: "الأغواط", nameFr: "Laghouat" },
  { id: 4, nameAr: "أم البواقي", nameFr: "Oum El Bouaghi" },
  { id: 5, nameAr: "باتنة", nameFr: "Batna" },
  { id: 6, nameAr: "بجاية", nameFr: "Béjaïa" },
  { id: 7, nameAr: "بسكرة", nameFr: "Biskra" },
  { id: 8, nameAr: "بشار", nameFr: "Béchar" },
  { id: 9, nameAr: "البليدة", nameFr: "Blida" },
  { id: 10, nameAr: "البويرة", nameFr: "Bouira" },
  { id: 11, nameAr: "تمنراست", nameFr: "Tamanrasset" },
  { id: 12, nameAr: "تبسة", nameFr: "Tébessa" },
  { id: 13, nameAr: "تلمسان", nameFr: "Tlemcen" },
  { id: 14, nameAr: "تيارت", nameFr: "Tiaret" },
  { id: 15, nameAr: "تيزي وزو", nameFr: "Tizi Ouzou" },
  { id: 16, nameAr: "الجزائر", nameFr: "Alger" },
  { id: 17, nameAr: "الجلفة", nameFr: "Djelfa" },
  { id: 18, nameAr: "جيجل", nameFr: "Jijel" },
  { id: 19, nameAr: "سطيف", nameFr: "Sétif" },
  { id: 20, nameAr: "سعيدة", nameFr: "Saïda" },
  { id: 21, nameAr: "سكيكدة", nameFr: "Skikda" },
  { id: 22, nameAr: "سيدي بلعباس", nameFr: "Sidi Bel Abbès" },
  { id: 23, nameAr: "عنابة", nameFr: "Annaba" },
  { id: 24, nameAr: "قالمة", nameFr: "Guelma" },
  { id: 25, nameAr: "قسنطينة", nameFr: "Constantine" },
  { id: 26, nameAr: "المدية", nameFr: "Médéa" },
  { id: 27, nameAr: "مستغانم", nameFr: "Mostaganem" },
  { id: 28, nameAr: "المسيلة", nameFr: "M'Sila" },
  { id: 29, nameAr: "معسكر", nameFr: "Mascara" },
  { id: 30, nameAr: "ورقلة", nameFr: "Ouargla" },
  { id: 31, nameAr: "وهران", nameFr: "Oran" },
  { id: 32, nameAr: "البيض", nameFr: "El Bayadh" },
  { id: 33, nameAr: "إليزي", nameFr: "Illizi" },
  { id: 34, nameAr: "برج بوعريريج", nameFr: "Bordj Bou Arréridj" },
  { id: 35, nameAr: "بومرداس", nameFr: "Boumerdès" },
  { id: 36, nameAr: "الطارف", nameFr: "El Tarf" },
  { id: 37, nameAr: "تندوف", nameFr: "Tindouf" },
  { id: 38, nameAr: "تيسمسيلت", nameFr: "Tissemsilt" },
  { id: 39, nameAr: "الوادي", nameFr: "El Oued" },
  { id: 40, nameAr: "خنشلة", nameFr: "Khenchela" },
  { id: 41, nameAr: "سوق أهراس", nameFr: "Souk Ahras" },
  { id: 42, nameAr: "تيبازة", nameFr: "Tipaza" },
  { id: 43, nameAr: "ميلة", nameFr: "Mila" },
  { id: 44, nameAr: "عين الدفلى", nameFr: "Aïn Defla" },
  { id: 45, nameAr: "النعامة", nameFr: "Naâma" },
  { id: 46, nameAr: "عين تموشنت", nameFr: "Aïn Témouchent" },
  { id: 47, nameAr: "غرداية", nameFr: "Ghardaïa" },
  { id: 48, nameAr: "غليزان", nameFr: "Relizane" },
  { id: 49, nameAr: "تيميمون", nameFr: "Timimoun" },
  { id: 50, nameAr: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar" },
  { id: 51, nameAr: "أولاد جلال", nameFr: "Ouled Djellal" },
  { id: 52, nameAr: "بني عباس", nameFr: "Béni Abbès" },
  { id: 53, nameAr: "عين صالح", nameFr: "In Salah" },
  { id: 54, nameAr: "عين قزام", nameFr: "In Guezzam" },
  { id: 55, nameAr: "تقرت", nameFr: "Touggourt" },
  { id: 56, nameAr: "جانت", nameFr: "Djanet" },
  { id: 57, nameAr: "المغير", nameFr: "El M'Ghair" },
  { id: 58, nameAr: "المنيعة", nameFr: "El Meniaa" },
];
