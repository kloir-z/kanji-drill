import { useState, useCallback } from 'react';
import { DifficultQuestion, Question } from '../types';

const STORAGE_KEY = 'difficult_questions';

export const useDifficultQuestions = () => {
    const [difficultQuestions, setDifficultQuestions] = useState<DifficultQuestion[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const generateQuestionId = (question: Question): string => {
        return `${question.text}-${question.question}-${question.reading}`;
    };

    const isDifficult = useCallback((question: Question): boolean => {
        return difficultQuestions.some(q => generateQuestionId(q) === generateQuestionId(question));
    }, [difficultQuestions]);

    const addDifficultQuestion = useCallback((question: Question) => {
        const difficultQuestion: DifficultQuestion = {
            ...question,
            id: generateQuestionId(question),
            timestamp: Date.now()
        };

        setDifficultQuestions(prev => {
            const updated = [...prev, difficultQuestion];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeDifficultQuestion = useCallback((question: Question) => {
        const id = generateQuestionId(question);
        setDifficultQuestions(prev => {
            const updated = prev.filter(q => generateQuestionId(q) !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return {
        difficultQuestions,
        isDifficult,
        addDifficultQuestion,
        removeDifficultQuestion
    };
};