export type Landmark = {
  name: string;
  urdu: string;
  voice?: string;
};

export type Village = {
  name: string;
  urdu: string;
  major: boolean;
  landmarks: Landmark[];
};

function L(name: string, urdu: string, voice?: string): Landmark {
  return voice ? { name, urdu, voice } : { name, urdu };
}

function usual(name: string, urdu: string, extra: Landmark[] = []): Landmark[] {
  return [
    L(`Jamia Masjid ${name}`, `جامع مسجد ${urdu}`),
    L(`${name} Bazaar`, `بازار ${urdu}`),
    L(`${name} Adda`, `اڈا ${urdu}`),
    ...extra,
    L(`${name} School`, `سکول ${urdu}`),
  ].slice(0, 4);
}

export const VILLAGES: Village[] = [
  {
    name: "Shinka",
    urdu: "شینکا",
    major: true,
    landmarks: [
      L("Shinka Welfare Society", "شینکا ویلفیئر سوسائٹی"),
      L("Union Council Shinka", "یونین کونسل شینکا"),
      L("Hamid House", "حمید ہاؤس"),
      L("Chhach Interchange", "چاچ انٹرچینج"),
    ],
  },
  { name: "Yaseen", urdu: "یاسین", major: false, landmarks: usual("Yaseen", "یاسین") },
  { name: "Malak Mala", urdu: "ملک ملا", major: true, landmarks: usual("Malak Mala", "ملک ملا", [L("Garhi Site", "گڑھی سائٹ")]) },
  { name: "Behboodi", urdu: "بہبودی", major: false, landmarks: usual("Behboodi", "بہبودی") },
  { name: "Nartopa", urdu: "نرٹوپا", major: true, landmarks: usual("Nartopa", "نرٹوپا") },
  { name: "Jalalia", urdu: "جلالیہ", major: true, landmarks: usual("Jalalia", "جلالیہ") },
  { name: "Ghorghushti", urdu: "غورغشتی", major: true, landmarks: usual("Ghorghushti", "غورغشتی", [L("Ghorghushti Mandi", "غورغشتی منڈی")]) },
  { name: "Momenpur", urdu: "مومن پور", major: false, landmarks: usual("Momenpur", "مومن پور") },
  { name: "Hameed", urdu: "حمید", major: true, landmarks: usual("Hameed", "حمید") },
  { name: "Pirdad", urdu: "پیر داد", major: false, landmarks: usual("Pirdad", "پیر داد") },
  { name: "Khagwani", urdu: "کھاگوانی", major: false, landmarks: usual("Khagwani", "کھاگوانی") },
  { name: "Kalu Kalan", urdu: "کالو کلاں", major: false, landmarks: usual("Kalu Kalan", "کالو کلاں") },
  { name: "Ababakar", urdu: "ابابکر", major: false, landmarks: usual("Ababakar", "ابابکر") },
  { name: "Barazai", urdu: "برازئی", major: true, landmarks: usual("Barazai", "برازئی") },
  { name: "Daman", urdu: "دامن", major: false, landmarks: usual("Daman", "دامن") },
  { name: "Painda", urdu: "پینڈا", major: false, landmarks: usual("Painda", "پینڈا") },
  { name: "Kamalpur Musa", urdu: "کمال پور موسیٰ", major: false, landmarks: usual("Kamalpur Musa", "کمال پور موسیٰ") },
  { name: "Mosa", urdu: "موسیٰ", major: false, landmarks: usual("Mosa", "موسیٰ") },
  { name: "Malhoo", urdu: "ملو", major: false, landmarks: usual("Malhoo", "ملو") },
  { name: "Tajak", urdu: "تاجک", major: true, landmarks: usual("Tajak", "تاجک") },
  { name: "Rangoo", urdu: "رنگو", major: false, landmarks: usual("Rangoo", "رنگو") },
  { name: "Veero", urdu: "ویرو", major: false, landmarks: usual("Veero", "ویرو") },
  { name: "Taja Baja", urdu: "تاجا باجا", major: false, landmarks: usual("Taja Baja", "تاجا باجا") },
  { name: "Mansar", urdu: "منسر", major: true, landmarks: usual("Mansar", "منسر", [L("Mansar Lake Road", "منسر جھیل روڈ")]) },
  { name: "Haji Shah", urdu: "حاجی شاہ", major: false, landmarks: usual("Haji Shah", "حاجی شاہ", [L("GT Road Stop", "جی ٹی روڈ سٹاپ")]) },
  { name: "Mullan Mansoor", urdu: "ملا منصور", major: false, landmarks: usual("Mullan Mansoor", "ملا منصور") },
  { name: "Khura Khail", urdu: "خورا خیل", major: false, landmarks: usual("Khura Khail", "خورا خیل") },
  { name: "Formuli", urdu: "فارمولی", major: false, landmarks: usual("Formuli", "فارمولی") },
  { name: "Mallaah", urdu: "ملاح", major: false, landmarks: usual("Mallaah", "ملاح") },
  { name: "Shadi Khan", urdu: "شادی خان", major: true, landmarks: usual("Shadi Khan", "شادی خان", [L("Shadi Khan Chowk", "شادی خان چوک")]) },
  { name: "Sirka", urdu: "سرکہ", major: false, landmarks: usual("Sirka", "سرکہ") },
  { name: "Waisa", urdu: "ویسہ", major: true, landmarks: usual("Waisa", "ویسہ") },
  { name: "Waisa Kasi", urdu: "ویسہ کاسی", major: false, landmarks: usual("Waisa Kasi", "ویسہ کاسی") },
  { name: "Shamsabad", urdu: "شمس آباد", major: true, landmarks: usual("Shamsabad", "شمس آباد") },
  { name: "Walia", urdu: "والیہ", major: false, landmarks: usual("Walia", "والیہ") },
  { name: "Kalu Khurd", urdu: "کالو خورد", major: false, landmarks: usual("Kalu Khurd", "کالو خورد") },
  { name: "Basia", urdu: "بسیہ", major: false, landmarks: usual("Basia", "بسیہ") },
  { name: "Noor Pur", urdu: "نور پور", major: false, landmarks: usual("Noor Pur", "نور پور") },
  { name: "Saleem Khan", urdu: "سلیم خان", major: false, landmarks: usual("Saleem Khan", "سلیم خان") },
  { name: "Adal Zai", urdu: "عدل زئی", major: false, landmarks: usual("Adal Zai", "عدل زئی") },
  { name: "Kudlathi", urdu: "کدلتھی", major: false, landmarks: usual("Kudlathi", "کدلتھی") },
  { name: "Musa Kudlathi", urdu: "موسیٰ کدلتھی", major: false, landmarks: usual("Musa Kudlathi", "موسیٰ کدلتھی") },
  { name: "Bahadur Khan", urdu: "بہادر خان", major: false, landmarks: usual("Bahadur Khan", "بہادر خان") },
  { name: "Sarwana", urdu: "سروانہ", major: false, landmarks: usual("Sarwana", "سروانہ") },
  { name: "Shah Dher", urdu: "شاہ ڈھیر", major: false, landmarks: usual("Shah Dher", "شاہ ڈھیر") },
  { name: "Jatial", urdu: "جٹیال", major: false, landmarks: usual("Jatial", "جٹیال") },
  { name: "Hattian", urdu: "ہٹیاں", major: false, landmarks: usual("Hattian", "ہٹیاں") },
  { name: "Chachian", urdu: "چاچیاں", major: false, landmarks: usual("Chachian", "چاچیاں") },
  { name: "Darya Sharif", urdu: "دریا شریف", major: true, landmarks: [L("Darya Sharif Darbar", "دربار دریا شریف"), L("Riverbank", "دریا کنارہ"), L("Jamia Masjid", "جامع مسجد"), L("Darya Sharif Adda", "اڈا دریا شریف")] },
  { name: "Hassanpur", urdu: "حسن پور", major: false, landmarks: usual("Hassanpur", "حسن پور") },
  { name: "Fateh Chak", urdu: "فتح چک", major: false, landmarks: usual("Fateh Chak", "فتح چک") },
  { name: "Delawarabad", urdu: "دلاور آباد", major: false, landmarks: usual("Delawarabad", "دلاور آباد") },
  { name: "Samaan", urdu: "سامان", major: false, landmarks: usual("Samaan", "سامان") },
  { name: "Ghondal", urdu: "گھونڈل", major: false, landmarks: usual("Ghondal", "گھونڈل") },
  { name: "Madrota", urdu: "مدرٹا", major: false, landmarks: usual("Madrota", "مدرٹا") },
  { name: "Lundi", urdu: "لنڈی", major: false, landmarks: usual("Lundi", "لنڈی") },
  { name: "Lakori", urdu: "لاکوری", major: false, landmarks: usual("Lakori", "لاکوری") },
  { name: "Bara", urdu: "باڑہ", major: false, landmarks: usual("Bara", "باڑہ") },
  { name: "Rahmo Mararya", urdu: "رحمو مراریہ", major: false, landmarks: usual("Rahmo Mararya", "رحمو مراریہ") },
  { name: "Pinjwana", urdu: "پنجوانہ", major: false, landmarks: usual("Pinjwana", "پنجوانہ") },
  { name: "Daghra", urdu: "داغرہ", major: false, landmarks: usual("Daghra", "داغرہ") },
  { name: "Dhrabi", urdu: "دھرابی", major: false, landmarks: usual("Dhrabi", "دھرابی") },
  { name: "Shagai", urdu: "شگئی", major: false, landmarks: usual("Shagai", "شگئی") },
  { name: "ThiKrian", urdu: "ٹھکریاں", major: false, landmarks: usual("ThiKrian", "ٹھکریاں") },
  { name: "Shah Por", urdu: "شاہ پور", major: false, landmarks: usual("Shah Por", "شاہ پور") },
  { name: "Raitla Mandi", urdu: "ریتلہ منڈی", major: false, landmarks: usual("Raitla Mandi", "ریتلہ منڈی", [L("Grain Mandi", "اناج منڈی")]) },
  { name: "Kalu Dabb", urdu: "کالو ڈب", major: false, landmarks: usual("Kalu Dabb", "کالو ڈب") },
  { name: "Pehti", urdu: "پہٹی", major: false, landmarks: usual("Pehti", "پہٹی") },
  { name: "Haroon", urdu: "ہارون", major: false, landmarks: usual("Haroon", "ہارون") },
  { name: "Nasozai", urdu: "ناسوزئی", major: false, landmarks: usual("Nasozai", "ناسوزئی") },
  { name: "Said Khail", urdu: "سید خیل", major: false, landmarks: usual("Said Khail", "سید خیل") },
  {
    name: "Hazro",
    urdu: "حضرو",
    major: true,
    landmarks: [
      L("Meena Bazaar", "مینا بازار"),
      L("People's Colony Chowk", "پیپلز کالونی چوک"),
      L("Hari Mandir", "ہری مندر"),
      L("Ghora Chowk", "گھوڑا چوک"),
    ],
  },
];

export function villageAt(index: number): Village {
  const v = VILLAGES[index % VILLAGES.length];
  return v ?? VILLAGES[0]!;
}

export function landmarkAt(villageIndex: number, variant: number): Landmark {
  const v = villageAt(villageIndex);
  const list = v.landmarks;
  if (list.length === 0) return { name: v.name, urdu: v.urdu };
  return list[variant % list.length] ?? list[0]!;
}
