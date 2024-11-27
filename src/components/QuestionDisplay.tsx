import { Question } from '../types';
import { convertToBoxes } from '../utils/kanjiValidation';

export const QuestionDisplay = ({ question }: { question: Question }) => {
    const parts = question.text.split(question.kanji);
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;

    // ルビテキストの前に全角スペースを追加するかどうかを判定
    const readingText = kanjiOnly.test(question.kanji)
        ? question.reading
        // eslint-disable-next-line no-irregular-whitespace
        : `　${question.reading}`;

    return (
        <div className="min-w-[100px] flex justify-center">
            <div className="writing-vertical inline-flex flex-col items-start text-2xl whitespace-nowrap">
                <div className="flex items-start">
                    {parts.map((part, partIndex, array) => (
                        <div key={partIndex} className="writing-vertical relative inline-flex">
                            {part}
                            {partIndex < array.length - 1 && (
                                <div className="relative inline-block">
                                    <span className="inline-block relative">
                                        {convertToBoxes(question.kanji)}
                                        <span className="absolute top-0 -right-6 text-sm ruby-text">
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
