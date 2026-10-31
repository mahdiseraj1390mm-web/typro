export interface SpellIssue {
  id: string;
  category: 'spelling' | 'spacing' | 'punctuation' | 'foreign_char';
  categoryLabel: string;
  wrong: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  language: 'fa' | 'en';
}

// 1. PERSIAN COMMON MISSPELLINGS (فرهنگستان زبان و ادب فارسی)
export const PERSIAN_SPELL_DICTIONARY: Record<string, { correct: string; reason: string }> = {
  // غلط‌های املایی ریشه‌ای با ز/ذ/ض/ظ
  'گذارشی': { correct: 'گزارشی', reason: 'از ریشه «گزاردن» (ادا کردن/شرح دادن) با «ز» نوشته می‌شود.' },
  'گذارش': { correct: 'گزارش', reason: 'از ریشه «گزاردن» (شرح دادن) با «ز» نوشته می‌شود.' },
  'سپاسگذار': { correct: 'سپاسگزار', reason: '«گزاردن» به معنی به‌جا آوردن است؛ سپاسگزار با «ز» صحیح است.' },
  'سپاسگذاری': { correct: 'سپاسگزاری', reason: '«سپاسگزاری» با «ز» صحیح است.' },
  'نمازگذار': { correct: 'نمازگزار', reason: '«نمازگزار» (به جا آورنده نماز) با «ز» صحیح است.' },
  'خدمتگذار': { correct: 'خدمتگزار', reason: '«خدمتگزار» با «ز» صحیح است.' },
  'قانونگذار': { correct: 'قانون‌گذار', reason: '«قانون‌گذار» با «ز» و نیم‌فاصله صحیح است.' },
  'بنیانگذار': { correct: 'بنیان‌گذار', reason: '«بنیان‌گذار» با «ز» و نیم‌فاصله صحیح است.' },
  'انظباط': { correct: 'انضباط', reason: 'انضباط با «ض» صحیح است.' },
  'استکاک': { correct: 'اصطکاک', reason: 'اصطکاک با «ص» و «ط» نوشته می‌شود.' },
  'توجیح': { correct: 'توجیه', reason: 'توجیه با «ه» در انتها صحیح است.' },
  'ترجیحا': { correct: 'ترجیحاً', reason: 'تنوین نصب در کلمات عربی الزامی است.' },
  'گاها': { correct: 'گاهی', reason: 'تنوین روی واژگان فارسی مثل «گاه» نادرست است؛ «گاهی» بنویسید.' },
  'دوما': { correct: 'دوم اینکه', reason: 'تنوین روی اعداد فارسی نادرست است؛ «دوم اینکه» یا «ثانیاً» بنویسید.' },
  'سوما': { correct: 'سوم اینکه', reason: 'تنوین روی اعداد فارسی نادرست است؛ «سوم اینکه» یا «ثالثاً» بنویسید.' },
  'جانا': { correct: 'جانی', reason: 'تنوین روی کلمات فارسی نادرست است.' },
  'ناچارا': { correct: 'به‌ناچار', reason: 'به جای «ناچاراً» از «به‌ناچار» یا «ناچار» استفاده نمایید.' },
  'راجب': { correct: 'راجع به', reason: 'نگارش صحیح ترکیب عربی «راجع به» است.' },
  'راجب به': { correct: 'راجع به', reason: 'نگارش صحیح «راجع به» است.' },
  'راجعبه': { correct: 'راجع به', reason: 'واژه «راجع به» باید با فاصله نوشته شود.' },
  'طهران': { correct: 'تهران', reason: 'بر اساس مصوبه فرهنگستان، نگارش با «ت» صحیح است.' },
  'بلیط': { correct: 'بلیت', reason: 'نگارش با «ت» طبق مصوبه فرهنگستان صحیح است.' },
  'اطو': { correct: 'اتو', reason: 'نگارش مصوب «اتو» با الف و ت است.' },
  'باطری': { correct: 'باتری', reason: 'نگارش مصوب با «ت» است.' },
  'اطاق': { correct: 'اتاق', reason: 'نگارش مصوب با «ت» است.' },
  'هوله': { correct: 'حوله', reason: 'حوله با «ح» جیمی نوشته می‌شود.' },
  'هوسله': { correct: 'حوصله', reason: 'حوصله با «ح» و «ص» صحیح است.' },
  'هوزه': { correct: 'حوزه', reason: 'حوزه با «ح» و «ز» صحیح است.' },
  'مضخرف': { correct: 'مزخرف', reason: 'مزخرف با «ز» و «خ» نوشته می‌شود.' },
  'استعفاء': { correct: 'استعفا', reason: 'حذف همزه پایانی در کلمات مختوم به الف مصوب فرهنگستان است.' },
  'امضاء': { correct: 'امضا', reason: 'حذف همزه پایانی در خط فارسی مصوب است.' },
  'انشاء': { correct: 'انشا', reason: 'انشا بدون همزه پایانی صحیح است.' },
  'تلوزیون': { correct: 'تلویزیون', reason: 'نگارش با واو دوم «تلویزیون» صحیح است.' },
  'انلاین': { correct: 'آنلاین', reason: 'با کلاه آ نوشته می‌شود.' },
  'افلاین': { correct: 'آفلاین', reason: 'با کلاه آ نوشته می‌شود.' },
  'پروپزال': { correct: 'پروپوزال', reason: 'نگارش مصوب «پروپوزال» با واو است.' },
  'ارور': { correct: 'خطا', reason: 'برابرنهاد فارسی مصوب «خطا» به جای ارور است.' },
  'استاندار': { correct: 'استاندارد', reason: 'در متن فنی/نگارشی منظور «استاندارد» با دال پایانی است.' },
  'راه حل': { correct: 'راه‌حل', reason: 'ترکیب «راه‌حل» باید با نیم‌فاصله نوشته شود.' },
  'به شخصه': { correct: 'شخصاً', reason: 'عبارت مصوب «شخصاً» یا «به‌شخصه» با نیم‌فاصله است.' },
  'دست انداز': { correct: 'دست‌انداز', reason: 'واژه مرکب باید با نیم‌فاصله نوشته شود.' },
};

// 2. ENGLISH COMMON TYPOS & MISSPELLINGS
export const ENGLISH_SPELL_DICTIONARY: Record<string, { correct: string; reason: string }> = {
  'teh': { correct: 'the', reason: 'Common typo for article "the".' },
  'recieve': { correct: 'receive', reason: 'Rule: "I before E except after C".' },
  'seperate': { correct: 'separate', reason: 'Spelled with an "a" in the middle: sep-a-rate.' },
  'untill': { correct: 'until', reason: 'Spelled with only one "l".' },
  'occured': { correct: 'occurred', reason: 'Double "r" when adding suffix: occurred.' },
  'truely': { correct: 'truly', reason: 'Drop the "e" in truly.' },
  'definetly': { correct: 'definitely', reason: 'Contains "finite" in the middle: de-finite-ly.' },
  'alot': { correct: 'a lot', reason: '"A lot" is always two separate words.' },
  'goverment': { correct: 'government', reason: 'Notice the "n" after "govern".' },
  'enviroment': { correct: 'environment', reason: 'Notice the "n" after "environ".' },
  'succesful': { correct: 'successful', reason: 'Double "c" and double "s": successful.' },
  'tihs': { correct: 'this', reason: 'Common typo for "this".' },
  'adn': { correct: 'and', reason: 'Common typo for "and".' },
  'becuase': { correct: 'because', reason: 'Common transposition typo for "because".' },
  'tommorow': { correct: 'tomorrow', reason: 'One "m" and double "r": tomorrow.' },
  'comming': { correct: 'coming', reason: 'Drop the "e" and add "ing": coming.' },
  'writting': { correct: 'writing', reason: 'Single "t": writing.' },
  'recomended': { correct: 'recommended', reason: 'Single "c", double "m": recommended.' },
  'wierd': { correct: 'weird', reason: 'Exception to rule: spelled w-e-i-r-d.' },
  'begining': { correct: 'beginning', reason: 'Double "n": beginning.' },
  'greatful': { correct: 'grateful', reason: 'From "grate", not "great": grateful.' },
  'accross': { correct: 'across', reason: 'Single "c": across.' },
  'beleive': { correct: 'believe', reason: 'Rule: "I before E": believe.' },
};

// Check if a character is Persian/Arabic letter
export function isPersianChar(ch: string): boolean {
  return /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(ch);
}

// Find all spelling, ZWNJ, punctuation, and language issues
export function findSpellingAndGrammarIssues(
  text: string,
  filterLang: 'all' | 'fa' | 'en' = 'all'
): SpellIssue[] {
  const issues: SpellIssue[] = [];
  if (!text) return issues;

  // Track matched ranges so we don't duplicate
  const matchedRanges: Array<{ start: number; end: number }> = [];
  const overlaps = (start: number, end: number) => {
    return matchedRanges.some((r) => Math.max(r.start, start) < Math.min(r.end, end));
  };
  const addIssue = (issue: SpellIssue) => {
    if (!overlaps(issue.startIndex, issue.endIndex)) {
      matchedRanges.push({ start: issue.startIndex, end: issue.endIndex });
      issues.push(issue);
    }
  };

  let match: RegExpExecArray | null = null;

  // =========================================================================
  // 1. PERSIAN CHECKS
  // =========================================================================
  if (filterLang === 'all' || filterLang === 'fa') {
    // A. Multi-word phrase checks first (e.g. "راجب به", "راجع به", "به شخصه", "راه حل")
    for (const [wrongPhrase, data] of Object.entries(PERSIAN_SPELL_DICTIONARY)) {
      if (wrongPhrase.includes(' ')) {
        let searchIndex = 0;
        while ((searchIndex = text.indexOf(wrongPhrase, searchIndex)) !== -1) {
          const endIndex = searchIndex + wrongPhrase.length;
          // check left boundary
          const prevChar = searchIndex > 0 ? text[searchIndex - 1] : ' ';
          const nextChar = endIndex < text.length ? text[endIndex] : ' ';
          const isLeftDelim = /[\s،؛!؟:.,«»()\[\]\n\r"']/.test(prevChar) || searchIndex === 0;
          const isRightDelim = /[\s،؛!؟:.,«»()\[\]\n\r"']/.test(nextChar) || endIndex === text.length;

          if (isLeftDelim && isRightDelim) {
            addIssue({
              id: `fa-phrase-${searchIndex}`,
              category: 'spelling',
              categoryLabel: 'غلط املایی و ترکیب',
              wrong: wrongPhrase,
              suggestion: data.correct,
              explanation: data.reason,
              startIndex: searchIndex,
              endIndex: endIndex,
              language: 'fa',
            });
          }
          searchIndex += wrongPhrase.length;
        }
      }
    }

    // B. Prefix "می" and "نمی" followed by space: (e.g. "می رود" or "نمی دانم")
    // Match regex: (می|نمی) + spaces + (word)
    const miSpaceRegex = /(^|[\s،؛!؟:.,«»()\[\]\n\r"'])(می|نمی)[ ]+([آ-یa-zA-Z]+)/g;
    while ((match = miSpaceRegex.exec(text)) !== null) {
      const prefix = match[2];
      const verb = match[3];
      const fullWrong = `${prefix} ${verb}`;
      const startIdx = match.index + match[1].length;
      const endIdx = startIdx + fullWrong.length;
      const suggestion = `${prefix}\u200c${verb}`;

      addIssue({
        id: `mi-space-${startIdx}`,
        category: 'spacing',
        categoryLabel: 'نیم‌فاصله فعل',
        wrong: fullWrong,
        suggestion: suggestion,
        explanation: `پیشوند «${prefix}» در فعل باید با نیم‌فاصله به ریشه بچسبد.`,
        startIndex: startIdx,
        endIndex: endIdx,
        language: 'fa',
      });
    }

    // C. Suffix "ها" and "ترین" preceded by space: (e.g. "کتاب ها", "سامانه ها")
    const haSpaceRegex = /([آ-ی]+)[ ]+(ها|های|هایی|ترین)(?=[\s،؛!؟:.,«»()\[\]\n\r"']|$)/g;
    while ((match = haSpaceRegex.exec(text)) !== null) {
      const baseWord = match[1];
      const suffix = match[2];
      const fullWrong = `${baseWord} ${suffix}`;
      const startIdx = match.index;
      const endIdx = startIdx + fullWrong.length;
      const suggestion = `${baseWord}\u200c${suffix}`;

      addIssue({
        id: `ha-space-${startIdx}`,
        category: 'spacing',
        categoryLabel: 'نیم‌فاصله پسوند',
        wrong: fullWrong,
        suggestion: suggestion,
        explanation: `پسوند «${suffix}» باید با نیم‌فاصله به واژه متصل باشد: «${suggestion}».`,
        startIndex: startIdx,
        endIndex: endIdx,
        language: 'fa',
      });
    }

    // D. Token-based word checks (Scanning every word individually!)
    // Using RegExp tokenizer with exact positions
    const tokenRegex = /([آ-ی‌يكةa-zA-Z0-9]+)/g;
    while ((match = tokenRegex.exec(text)) !== null) {
      const rawWord = match[1];
      const startIdx = match.index;
      const endIdx = startIdx + rawWord.length;

      // 1. Check direct spelling dictionary for Persian
      if (PERSIAN_SPELL_DICTIONARY[rawWord]) {
        const item = PERSIAN_SPELL_DICTIONARY[rawWord];
        addIssue({
          id: `fa-dict-${startIdx}`,
          category: 'spelling',
          categoryLabel: 'غلط املایی فارسی',
          wrong: rawWord,
          suggestion: item.correct,
          explanation: item.reason,
          startIndex: startIdx,
          endIndex: endIdx,
          language: 'fa',
        });
        continue;
      }

      // 2. Check if Arabic "ي" or "ك" is present in Persian word
      if (/[يك]/.test(rawWord)) {
        const normalized = rawWord.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
        addIssue({
          id: `arabic-char-${startIdx}`,
          category: 'foreign_char',
          categoryLabel: 'حرف عربی غیراستاندارد',
          wrong: rawWord,
          suggestion: normalized,
          explanation: 'استفاده از ي و ك عربی به جای ی و ک استاندارد فارسی.',
          startIndex: startIdx,
          endIndex: endIdx,
          language: 'fa',
        });
        continue;
      }

      // 3. Glued "میرود" / "میکند" / "میشود" without ZWNJ
      if (
        (rawWord.startsWith('می') && rawWord.length > 3 && rawWord[2] !== '\u200c') ||
        (rawWord.startsWith('نمی') && rawWord.length > 4 && rawWord[3] !== '\u200c')
      ) {
        const pfx = rawWord.startsWith('نمی') ? 'نمی' : 'می';
        const rest = rawWord.slice(pfx.length);
        // Only trigger if rest looks like a Persian verb
        if (rest.length >= 2 && !['میراث', 'میزان', 'میدان', 'میهن', 'میکروب', 'میلاد', 'میوه'].includes(rawWord)) {
          addIssue({
            id: `glued-mi-${startIdx}`,
            category: 'spacing',
            categoryLabel: 'عدم درج نیم‌فاصله در فعل',
            wrong: rawWord,
            suggestion: `${pfx}\u200c${rest}`,
            explanation: `پیشوند «${pfx}» باید با نیم‌فاصله از «${rest}» جدا شود.`,
            startIndex: startIdx,
            endIndex: endIdx,
            language: 'fa',
          });
          continue;
        }
      }

      // 4. Glued "کتابها" without ZWNJ
      if (rawWord.endsWith('ها') && rawWord.length > 3 && rawWord[rawWord.length - 3] !== '\u200c') {
        const stem = rawWord.slice(0, -2);
        if (!['شما', 'رها', 'تنها', 'بها', 'اشتها'].includes(rawWord)) {
          addIssue({
            id: `glued-ha-${startIdx}`,
            category: 'spacing',
            categoryLabel: 'عدم درج نیم‌فاصله در جمع',
            wrong: rawWord,
            suggestion: `${stem}\u200cها`,
            explanation: 'پسوند جمع «ها» بر اساس مصوبه فرهنگستان با نیم‌فاصله پیوند می‌خورد.',
            startIndex: startIdx,
            endIndex: endIdx,
            language: 'fa',
          });
          continue;
        }
      }
    }

    // E. Persian Punctuation Spacing issues (e.g. space before comma/period: "کلمه ،")
    const spaceBeforePunctRegex = /([آ-یa-zA-Z0-9])[ ]+([،؛!؟:.,])/g;
    while ((match = spaceBeforePunctRegex.exec(text)) !== null) {
      const full = match[0];
      const letter = match[1];
      const mark = match[2];
      const startIdx = match.index;
      const endIdx = startIdx + full.length;

      addIssue({
        id: `punct-space-before-${startIdx}`,
        category: 'punctuation',
        categoryLabel: 'فاصله اضافی قبل از نشانه',
        wrong: full,
        suggestion: `${letter}${mark}`,
        explanation: `علامت «${mark}» باید بدون فاصله به کلمه پیش از خود بچسبد.`,
        startIndex: startIdx,
        endIndex: endIdx,
        language: 'fa',
      });
    }

    // F. Persian comma missing space after: (e.g. "کلمه،کلمه")
    const missingSpaceAfterPunct = /([،؛])([آ-یa-zA-Z0-9])/g;
    while ((match = missingSpaceAfterPunct.exec(text)) !== null) {
      const full = match[0];
      const mark = match[1];
      const nextChar = match[2];
      const startIdx = match.index;
      const endIdx = startIdx + full.length;

      addIssue({
        id: `punct-missing-space-${startIdx}`,
        category: 'punctuation',
        categoryLabel: 'نبود فاصله پس از نشانه',
        wrong: full,
        suggestion: `${mark} ${nextChar}`,
        explanation: `پس از علامت «${mark}» باید یک فاصله معمولی قرار گیرد.`,
        startIndex: startIdx,
        endIndex: endIdx,
        language: 'fa',
      });
    }
  }

  // =========================================================================
  // 2. ENGLISH CHECKS
  // =========================================================================
  if (filterLang === 'all' || filterLang === 'en') {
    // Tokenize English words
    const enWordRegex = /\b([a-zA-Z]+)\b/g;
    while ((match = enWordRegex.exec(text)) !== null) {
      const rawWord = match[1];
      const lower = rawWord.toLowerCase();
      const startIdx = match.index;
      const endIdx = startIdx + rawWord.length;

      if (ENGLISH_SPELL_DICTIONARY[lower]) {
        const item = ENGLISH_SPELL_DICTIONARY[lower];
        // Match casing of original
        const suggestion =
          rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase()
            ? item.correct.charAt(0).toUpperCase() + item.correct.slice(1)
            : item.correct;

        addIssue({
          id: `en-dict-${startIdx}`,
          category: 'spelling',
          categoryLabel: 'English Spelling Error',
          wrong: rawWord,
          suggestion: suggestion,
          explanation: item.reason,
          startIndex: startIdx,
          endIndex: endIdx,
          language: 'en',
        });
      }

      // Standalone lowercase "i"
      if (rawWord === 'i') {
        addIssue({
          id: `en-i-${startIdx}`,
          category: 'spelling',
          categoryLabel: 'Capitalization',
          wrong: 'i',
          suggestion: 'I',
          explanation: 'The pronoun "I" in English must always be capitalized.',
          startIndex: startIdx,
          endIndex: endIdx,
          language: 'en',
        });
      }
    }
  }

  return issues.sort((a, b) => a.startIndex - b.startIndex);
}

// Apply a single fix cleanly to text
export function applySingleFix(text: string, issue: SpellIssue): string {
  // Primary safe replacement using substring
  if (
    issue.startIndex >= 0 &&
    issue.endIndex <= text.length &&
    text.substring(issue.startIndex, issue.endIndex) === issue.wrong
  ) {
    const before = text.substring(0, issue.startIndex);
    const after = text.substring(issue.endIndex);
    return before + issue.suggestion + after;
  }

  // Fallback: replace the first occurrence
  return text.replace(issue.wrong, issue.suggestion);
}

// Master Fixer: Fixes all Persian and English issues according to standards
export function applyAllFixes(text: string): { fixedText: string; count: number } {
  let result = text;
  let fixCount = 0;

  // 1. Replace Arabic letters
  if (/[يك]/.test(result)) {
    result = result.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    fixCount++;
  }

  // 2. Fix Persian dictionary typos
  for (const [wrongWord, data] of Object.entries(PERSIAN_SPELL_DICTIONARY)) {
    if (result.includes(wrongWord)) {
      result = result.split(wrongWord).join(data.correct);
      fixCount++;
    }
  }

  // 3. Fix English dictionary typos
  for (const [wrongWord, data] of Object.entries(ENGLISH_SPELL_DICTIONARY)) {
    const regex = new RegExp(`\\b${wrongWord}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, data.correct);
      fixCount++;
    }
  }

  // 4. Fix "می" and "نمی" spaces: "می رود" -> "می‌رود"
  const miRe = /(^|[\s،؛!؟:.,«»()\[\]\n\r"'])(می|نمی)[ ]+([آ-یa-zA-Z]+)/g;
  if (miRe.test(result)) {
    result = result.replace(miRe, '$1$2\u200c$3');
    fixCount++;
  }

  // 5. Fix "ها" spaces: "کتاب ها" -> "کتاب‌ها"
  const haRe = /([آ-ی]+)[ ]+(ها|های|هایی|ترین)(?=[\s،؛!؟:.,«»()\[\]\n\r"']|$)/g;
  if (haRe.test(result)) {
    result = result.replace(haRe, '$1\u200c$2');
    fixCount++;
  }

  // 6. Fix punctuation spacing: "کلمه ،" -> "کلمه،"
  const spaceBeforeRe = /([آ-یa-zA-Z0-9])[ ]+([،؛!؟:.,])/g;
  if (spaceBeforeRe.test(result)) {
    result = result.replace(spaceBeforeRe, '$1$2');
    fixCount++;
  }

  // 7. Fix missing space after comma: "کلمه،کلمه" -> "کلمه، کلمه"
  const missingSpaceRe = /([،؛])([آ-یa-zA-Z0-9])/g;
  if (missingSpaceRe.test(result)) {
    result = result.replace(missingSpaceRe, '$1 $2');
    fixCount++;
  }

  // 8. Fix English standalone "i"
  result = result.replace(/\b(i)\b/g, 'I');

  return { fixedText: result, count: fixCount || 1 };
}
