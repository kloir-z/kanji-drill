import { useState } from 'react';
import { Question } from '../types';

export const QuestionDisplay = ({ question }: { question: Question }) => {
    const [isAnswerShown, setIsAnswerShown] = useState(false);
    const parts = question.text.split(question.kanji);
    const kanjiOnly = /^[\u4E00-\u9FFF]+$/;
    // eslint-disable-next-line no-irregular-whitespace
    const readingText = `　${question.reading}`;
    const isKanjiOnly = kanjiOnly.test(question.kanji);

    const toggleAnswer = () => {
        setIsAnswerShown(!isAnswerShown);
    };

    return (
        <div
            className="min-w-[120px] mx-4 flex justify-center"
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
                                        <span className={`text-4xl mx-auto flex ${!isKanjiOnly ? 'border border-gray-600 px-5 py-9 min-h-[144px] items-center mt-2' : ''}`}>
                                            {isKanjiOnly ? (
                                                Array.from(question.kanji).map((char, idx) => (
                                                    <span key={idx} className="kanji-box flex items-center justify-center">
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
                                                    {isAnswerShown ? question.kanji : Array(question.kanji.length).fill('　').join('')}
                                                </span>
                                            )}
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