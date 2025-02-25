import { useState, useCallback, useEffect } from 'react';
import { DifficultQuestion, Question, DifficultSlot } from '../types';

const OLD_STORAGE_KEY = 'difficult_questions';
const STORAGE_KEY = 'difficult_slots';
const CURRENT_SLOT_KEY = 'current_difficult_slot';
const DEFAULT_SLOTS: DifficultSlot[] = Array(5).fill(null).map((_, index) => ({
    id: `slot-${index + 1}`,
    name: `苦手 ${index + 1}`,
    questions: []
}));

export const useDifficultQuestions = () => {
    const migrateOldData = (): DifficultSlot[] => {
        const oldData = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldData) {
            try {
                const oldQuestions = JSON.parse(oldData) as DifficultQuestion[];
                if (oldQuestions.length > 0) {
                    console.log(`古いデータを移行します: ${oldQuestions.length}件の苦手問題`);
                    const newSlots = [...DEFAULT_SLOTS];
                    newSlots[0].questions = oldQuestions;

                    localStorage.removeItem(OLD_STORAGE_KEY);

                    return newSlots;
                }
            } catch (e) {
                console.error('Failed to migrate old difficult questions data', e);
            }
        }
        return DEFAULT_SLOTS;
    };

    const [difficultSlots, setDifficultSlots] = useState<DifficultSlot[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : migrateOldData();
    });

    const [currentSlotId, setCurrentSlotId] = useState<string>(() => {
        const stored = localStorage.getItem(CURRENT_SLOT_KEY);
        return stored || DEFAULT_SLOTS[0].id;
    });

    const difficultQuestions = difficultSlots.find(slot => slot.id === currentSlotId)?.questions || [];

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(difficultSlots));
    }, [difficultSlots]);

    useEffect(() => {
        localStorage.setItem(CURRENT_SLOT_KEY, currentSlotId);
    }, [currentSlotId]);

    const generateQuestionId = (question: Question): string => {
        return `${question.text}-${question.question}-${question.reading}-${question.isReading ? 1 : 0}`;
    };

    const isDifficult = useCallback((question: Question): boolean => {
        const id = generateQuestionId(question);
        return difficultSlots.some(slot =>
            slot.questions.some(q => generateQuestionId(q) === id)
        );
    }, [difficultSlots]);

    const addDifficultQuestion = useCallback((question: Question, slotId?: string) => {
        const targetSlotId = slotId || currentSlotId;
        const difficultQuestion: DifficultQuestion = {
            ...question,
            id: generateQuestionId(question),
            timestamp: Date.now()
        };

        setDifficultSlots(prev => {
            const updated = prev.map(slot => {
                if (slot.id === targetSlotId) {
                    if (slot.questions.some(q => generateQuestionId(q) === difficultQuestion.id)) {
                        return slot;
                    }
                    return {
                        ...slot,
                        questions: [...slot.questions, difficultQuestion]
                    };
                }
                return slot;
            });
            return updated;
        });
    }, [currentSlotId]);

    const removeDifficultQuestion = useCallback((question: Question, slotId?: string) => {
        const id = generateQuestionId(question);
        const targetSlotId = slotId || currentSlotId;

        setDifficultSlots(prev => {
            const updated = prev.map(slot => {
                if (slot.id === targetSlotId) {
                    return {
                        ...slot,
                        questions: slot.questions.filter(q => generateQuestionId(q) !== id)
                    };
                }
                return slot;
            });
            return updated;
        });
    }, [currentSlotId]);

    const setCurrentSlot = useCallback((slotId: string) => {
        setCurrentSlotId(slotId);
    }, []);

    const clearSlot = useCallback((slotId: string) => {
        setDifficultSlots(prev => {
            return prev.map(slot =>
                slot.id === slotId ? { ...slot, questions: [] } : slot
            );
        });
    }, []);

    return {
        difficultQuestions,
        difficultSlots,
        currentSlotId,
        isDifficult,
        addDifficultQuestion,
        removeDifficultQuestion,
        setCurrentSlot,
        clearSlot
    };
};