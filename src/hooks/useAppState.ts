import { useEffect, useState } from 'react';
import { Question } from '../types';

interface AppState {
    selectedFileId: string;
    selectedMenu: string;
    showDifficultOnly: boolean;
    difficultSlotId: string;
    shownAnswers: Record<string, boolean>;
    lastUpdated: number;
}

const APP_STATE_KEY = 'kanji_drill_app_state';

export const generateQuestionId = (question: Question): string => {
    return `${question.text}-${question.question}-${question.reading}-${question.isReading ? 1 : 0}`;
};

export const useAppState = () => {
    const [appState, setAppState] = useState<AppState>(() => {
        const storedState = localStorage.getItem(APP_STATE_KEY);
        return storedState
            ? JSON.parse(storedState)
            : {
                selectedFileId: '',
                selectedMenu: '',
                showDifficultOnly: false,
                difficultSlotId: 'slot-1',
                shownAnswers: {},
                lastUpdated: Date.now()
            };
    });

    const { selectedFileId, selectedMenu, showDifficultOnly, difficultSlotId, shownAnswers } = appState;

    useEffect(() => {
        const saveState = () => {
            const updatedState = {
                ...appState,
                lastUpdated: Date.now()
            };
            localStorage.setItem(APP_STATE_KEY, JSON.stringify(updatedState));
        };

        saveState();

        const handleBeforeUnload = () => {
            saveState();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [appState]);

    const updateAnswerState = (question: Question, isShown: boolean) => {
        const questionId = generateQuestionId(question);
        setAppState((prev) => ({
            ...prev,
            shownAnswers: {
                ...prev.shownAnswers,
                [questionId]: isShown,
            },
        }));
    };

    const updateFileSelection = (fileId: string, menuValue: string) => {
        setAppState((prev) => ({
            ...prev,
            selectedFileId: fileId,
            selectedMenu: menuValue,
            showDifficultOnly: false,
            shownAnswers: {},
        }));
    };

    const updateDifficultOnlyState = (showDifficult: boolean, slotId?: string) => {
        setAppState((prev) => ({
            ...prev,
            showDifficultOnly: showDifficult,
            difficultSlotId: slotId || prev.difficultSlotId,
            selectedFileId: showDifficult ? '' : prev.selectedFileId,
            selectedMenu: showDifficult ? 'difficult-only' : prev.selectedMenu,
            shownAnswers: {},
        }));
    };

    const updateCurrentSlot = (slotId: string) => {
        setAppState((prev) => ({
            ...prev,
            difficultSlotId: slotId,
        }));
    };

    const resetAppState = () => {
        setAppState({
            selectedFileId: '',
            selectedMenu: '',
            showDifficultOnly: false,
            difficultSlotId: 'slot-1',
            shownAnswers: {},
            lastUpdated: Date.now()
        });
    };

    const isAnswerShown = (question: Question): boolean => {
        const questionId = generateQuestionId(question);
        return !!shownAnswers[questionId];
    };

    return {
        selectedFileId,
        selectedMenu,
        showDifficultOnly,
        difficultSlotId,
        isAnswerShown,
        updateAnswerState,
        updateFileSelection,
        updateDifficultOnlyState,
        updateCurrentSlot,
        resetAppState,
    };
};