export const convertToBoxes = (kanji: string): string => {
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;
    if (kanjiOnly.test(kanji)) {
        return Array(kanji.length).fill('□').join('');
    }
    return `［${Array(kanji.length + 1).fill('　').join('')}］`;
};