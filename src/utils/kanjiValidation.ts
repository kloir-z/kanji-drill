export const validateKanji = (kanji: string): boolean => {
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;
    const kanjiWithHiragana = /^[\u4E00-\u9FFF]+[\u3040-\u309F]+$/;
    return kanjiOnly.test(kanji) || kanjiWithHiragana.test(kanji);
};

export const convertToBoxes = (kanji: string): string => {
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;
    if (kanjiOnly.test(kanji)) {
        return Array(kanji.length).fill('□').join('');
    }
    return `［${Array(kanji.length + 1).fill('　').join('')}］`;
};