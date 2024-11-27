import { Question } from '../types';

export const QuestionDisplay = ({ question }: { question: Question }) => {
    const parts = question.text.split(question.kanji);
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;
    // eslint-disable-next-line no-irregular-whitespace
    const readingText = `　${question.reading}`;
    const isKanjiOnly = kanjiOnly.test(question.kanji);

    return (
        <div className="min-w-[120px] flex justify-center">
            <div className="writing-vertical inline-flex flex-col items-center text-2xl whitespace-nowrap">
                <div className="flex items-center">
                    {parts.map((part, partIndex, array) => (
                        <div key={partIndex} className="writing-vertical relative inline-flex items-center">
                            <span className="mx-auto">{part}</span>
                            {partIndex < array.length - 1 && (
                                <div className="relative inline-block">
                                    <span className="inline-block relative">
                                        {isKanjiOnly ? (
                                            <span className="text-4xl mx-auto flex">
                                                {Array.from(question.kanji).map((_, idx) => (
                                                    <span key={idx} className="kanji-box"></span>
                                                ))}
                                            </span>
                                        ) : (
                                            <span className="text-5xl mx-auto flex border border-gray-600 px-4 py-9 min-h-[144px] flex items-center mt-2">
                                                {/* 漢字の文字数分の全角スペースを表示 */}
                                                {Array.from(question.kanji).map((_, idx) => (
                                                    // eslint-disable-next-line no-irregular-whitespace
                                                    <span key={idx} className="writing-vertical">　</span>
                                                ))}
                                            </span>
                                        )}
                                        <span className="absolute top-0 -right-7 text-sm ruby-text">
                                            {readingText}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};