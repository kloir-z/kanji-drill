import { Question } from '../types';

interface QuestionDisplayProps {
    question: Question;
    isDifficult: boolean;
    onMarkDifficult: (question: Question) => void;
    onMarkMastered: (question: Question) => void;
    isAnswerShown: boolean;
    onToggleAnswer: (question: Question, isShown: boolean) => void;
}

export const QuestionDisplay = ({
    question,
    isDifficult,
    onMarkDifficult,
    onMarkMastered,
    isAnswerShown,
    onToggleAnswer
}: QuestionDisplayProps) => {
    const parts = question.text.split(question.question);
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;
    const isKanjiOnly = kanjiOnly.test(question.question);

    const readingText = question.isReading
        ? question.reading
        // eslint-disable-next-line no-irregular-whitespace
        : `　${question.reading}`;

    const toggleAnswer = () => {
        onToggleAnswer(question, !isAnswerShown);
    };

    return (
        <div className="min-w-[120px] min-h-full mx-4">
            <div className="h-[28px]">
                <div
                    className={`transition-opacity duration-200 ${isAnswerShown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                >
                    <div className="flex justify-left">
                        {isDifficult ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkMastered(question);
                                }}
                                className="px-2 py-1 text-xs bg-green-500 text-white rounded min-w-[82px]"
                                disabled={!isAnswerShown}
                            >
                                覚えた
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkDifficult(question);
                                }}
                                className="px-2 py-1 text-xs bg-slate-500 text-white rounded min-w-[82px]"
                                disabled={!isAnswerShown}
                            >
                                苦手
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div
                className="writing-vertical inline-flex flex-col items-center text-2xl whitespace-nowrap cursor-default"
                onClick={toggleAnswer}
            >
                <div className="writing-vertical inline-flex flex-col items-center text-2xl whitespace-nowrap">
                    <div className="flex items-center">
                        {parts.map((part, partIndex, array) => (
                            <div key={partIndex} className="writing-vertical relative inline-flex items-center">
                                <span className="mx-auto">{part}</span>
                                {partIndex < array.length - 1 && (
                                    <div className="relative inline-block">
                                        <span className="inline-block relative">
                                            {question.isReading ? (
                                                // 読み方を答える問題の場合
                                                <span className="inline-block relative">
                                                    <span className="text-2xl border-r-2 border-gray-400 pr-1">
                                                        {question.question}
                                                    </span>
                                                    <span
                                                        className={`absolute top-0 -right-7 text-sm ruby-text ${!isAnswerShown
                                                            ? 'invisible'
                                                            : 'text-red-600'
                                                            }`}
                                                    >
                                                        {readingText}
                                                    </span>
                                                </span>
                                            ) : (
                                                // 漢字を答える問題の場合
                                                <span className={`text-4xl mx-auto flex ${!isKanjiOnly ? 'border border-gray-600 bg-white px-5 py-9 min-h-[144px] items-center mt-2' : ''}`}>
                                                    {isKanjiOnly ? (
                                                        Array.from(question.question).map((char, idx) => (
                                                            <span key={idx} className="kanji-box bg-white flex items-center justify-center">
                                                                {isAnswerShown ? (
                                                                    <span className="text-red-600">{char}</span>
                                                                ) : (
                                                                    // eslint-disable-next-line no-irregular-whitespace
                                                                    <span>　</span>
                                                                )}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className={`writing-vertical tracking-[0.22em] ${isAnswerShown ? 'text-red-600' : ''}`}>
                                                            {isAnswerShown ? question.question : Array(question.question.length).fill('　').join('')}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                            {!question.isReading && (
                                                <span className="absolute top-0 -right-7 text-sm ruby-text">
                                                    {readingText}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};