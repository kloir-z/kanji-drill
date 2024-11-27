import { Question } from '../types';
import { convertToBoxes } from '../utils/kanjiValidation';

export const QuestionDisplay = ({ question }: { question: Question }) => {
    const parts = question.text.split(question.kanji);
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;

    const readingText = kanjiOnly.test(question.kanji)
        ? question.reading
        // eslint-disable-next-line no-irregular-whitespace
        : `　${question.reading}`;

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
                                        <span className="text-4xl mx-auto">
                                            {convertToBoxes(question.kanji)}
                                        </span>
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