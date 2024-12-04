import { ChangeEvent, useState, useEffect } from 'react';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { useCSVProcessor } from '../hooks/useCSVProcessor';
import { useDifficultQuestions } from '../hooks/useDifficultQuestions';
import { StoredCSVFile, Question } from '../types';
import { HiPlus, HiOutlineSwitchHorizontal, HiRefresh, HiPencil } from 'react-icons/hi';
import { useIsMobile } from '../hooks/useIsMobile';
import { EditModal } from './EditModal';

const SHUFFLE_STATE_KEY = 'question_shuffle_state';
const DIFFICULT_SHUFFLE_STATE_KEY = 'difficult_question_shuffle_state';

interface ShuffleState {
    [fileId: string]: number[];
}

const KanjiDrill = () => {
    const {
        questions,
        errors,
        storedFiles,
        processCSV,
        loadStoredFile,
        removeStoredFile,
        updateStoredFile,
        createNewFile
    } = useCSVProcessor();
    const {
        difficultQuestions,
        isDifficult,
        addDifficultQuestion,
        removeDifficultQuestion
    } = useDifficultQuestions();
    const isMobile = useIsMobile();
    const [questionsPerRow, setQuestionsPerRow] = useState(5);
    const [selectedFileId, setSelectedFileId] = useState<string>('');
    const [showDifficultOnly, setShowDifficultOnly] = useState(false);
    const [menuOptionDisabled, setMenuOptionDisabled] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<string>('');
    const [showFileButton, setShowFileButton] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewFile, setIsNewFile] = useState(false);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [shuffledDifficultQuestions, setShuffledDifficultQuestions] = useState<Question[]>([]);
    const [shuffleStates, setShuffleStates] = useState<ShuffleState>(() => {
        const stored = localStorage.getItem(SHUFFLE_STATE_KEY);
        return stored ? JSON.parse(stored) : {};
    });
    const [difficultShuffleState, setDifficultShuffleState] = useState<number[]>(() => {
        const stored = localStorage.getItem(DIFFICULT_SHUFFLE_STATE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        if (selectedFileId && questions.length > 0) {
            const savedState = shuffleStates[selectedFileId];
            if (savedState && savedState.length === questions.length) {
                const orderedQuestions = savedState.map(index => questions[index]);
                setCurrentQuestions(orderedQuestions);
            } else {
                setCurrentQuestions(questions);
            }
        } else {
            setCurrentQuestions(questions);
        }
    }, [questions, selectedFileId, shuffleStates]);

    useEffect(() => {
        if (difficultQuestions.length > 0) {
            if (difficultShuffleState.length === difficultQuestions.length) {
                const orderedQuestions = difficultShuffleState.map(index => difficultQuestions[index]);
                setShuffledDifficultQuestions(orderedQuestions);
            } else {
                setShuffledDifficultQuestions(difficultQuestions);
            }
        } else {
            setShuffledDifficultQuestions([]);
        }
    }, [difficultQuestions, difficultShuffleState]);

    const saveShuffleState = (fileId: string, indices: number[]) => {
        const newStates = { ...shuffleStates, [fileId]: indices };
        setShuffleStates(newStates);
        localStorage.setItem(SHUFFLE_STATE_KEY, JSON.stringify(newStates));
    };

    const saveDifficultShuffleState = (indices: number[]) => {
        setDifficultShuffleState(indices);
        localStorage.setItem(DIFFICULT_SHUFFLE_STATE_KEY, JSON.stringify(indices));
    };

    const handleShuffle = () => {
        if (showDifficultOnly) {
            const indices = Array.from({ length: difficultQuestions.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            const shuffled = indices.map(i => difficultQuestions[i]);
            setShuffledDifficultQuestions(shuffled);
            saveDifficultShuffleState(indices);
        } else if (selectedFileId) {
            const indices = Array.from({ length: questions.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            const shuffled = indices.map(i => questions[i]);
            setCurrentQuestions(shuffled);
            saveShuffleState(selectedFileId, indices);
        }
        setResetKey(prev => prev + 1);
    };

    const handleResetOrder = () => {
        if (showDifficultOnly) {
            setShuffledDifficultQuestions([...difficultQuestions]);
            setDifficultShuffleState([]);
            localStorage.removeItem(DIFFICULT_SHUFFLE_STATE_KEY);
        } else if (selectedFileId) {
            setCurrentQuestions([...questions]);
            const newStates = { ...shuffleStates };
            delete newStates[selectedFileId];
            setShuffleStates(newStates);
            localStorage.setItem(SHUFFLE_STATE_KEY, JSON.stringify(newStates));
        }
        setResetKey(prev => prev + 1);
    };

    useEffect(() => {
        setShuffledDifficultQuestions(difficultQuestions);
    }, [difficultQuestions]);

    const handleEditClick = () => {
        setIsNewFile(false);
        setIsEditModalOpen(true);
    };

    const handleSave = (content: string, newFileName: string) => {
        if (isNewFile) {
            const newId = createNewFile(content, newFileName);
            setSelectedFileId(newId);
            setSelectedMenu(newId);
        } else {
            updateStoredFile(selectedFileId, content, newFileName);
        }
    };

    const handleMenuSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setResetKey(prev => prev + 1);

        if (value !== '') {
            setMenuOptionDisabled(true);
        }

        switch (value) {
            case 'new-file':
                setShowFileButton(true);
                document.getElementById('file-input')?.click();
                event.target.value = selectedMenu || '';
                break;
            case 'create-new':
                setIsNewFile(true);
                setIsEditModalOpen(true);
                setSelectedMenu(selectedMenu || '');
                event.target.value = selectedMenu || '';
                break;
            case 'difficult-only':
                setShowFileButton(false);
                setShowDifficultOnly(true);
                setSelectedMenu('difficult-only');
                break;
            case '':
                setShowFileButton(false);
                setSelectedFileId('');
                setSelectedMenu('');
                setShowDifficultOnly(false);
                break;
            default:
                setShowFileButton(false);
                setSelectedFileId(value);
                setSelectedMenu(value);
                loadStoredFile(value);
                setShowDifficultOnly(false);
                break;
        }
    };

    const displayQuestions = showDifficultOnly ? shuffledDifficultQuestions : currentQuestions;

    const updateQuestionsPerRow = () => {
        const width = window.innerWidth;
        const questionWidth = 120 + 32;
        const availableWidth = width - 32;
        const maxQuestions = Math.floor(availableWidth / questionWidth);
        setQuestionsPerRow(Math.max(2, Math.min(20, maxQuestions)));
    };

    useEffect(() => {
        updateQuestionsPerRow();

        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updateQuestionsPerRow, 150);
        };

        window.addEventListener('resize', handleResize);
        if (selectedFileId) {
            loadStoredFile(selectedFileId);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rows = [];
    for (let i = 0; i < displayQuestions.length; i += questionsPerRow) {
        rows.push(displayQuestions.slice(i, i + questionsPerRow));
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileId = await processCSV(file);
            if (fileId) {
                setSelectedFileId(fileId);
                setSelectedMenu(fileId);
                setMenuOptionDisabled(true);
                setShowDifficultOnly(false);
            }
        } else {
            if (showDifficultOnly) {
                setSelectedMenu('difficult-only');
            } else if (selectedFileId) {
                setSelectedMenu(selectedFileId);
            } else {
                setSelectedMenu('');
                setMenuOptionDisabled(false);
            }
        }
        if (event.target instanceof HTMLInputElement) {
            event.target.value = '';
        }
    };

    const handleDeleteFile = () => {
        if (selectedFileId) {
            const selectedFile = storedFiles.find(file => file.id === selectedFileId);
            const fileName = selectedFile?.name || 'このファイル';
            if (window.confirm(`"${fileName}" を削除してもよろしいですか？`)) {
                removeStoredFile(selectedFileId);
                setSelectedFileId('');
                setSelectedMenu('');
                setMenuOptionDisabled(false);
            }
        }
    };

    const handleFileButtonClick = () => {
        document.getElementById('file-input')?.click();
    };

    return (
        <div className="p-2">
            <div className="mb-4 flex items-center gap-2">
                <select
                    onChange={handleMenuSelect}
                    className="block w-54 p-2 border border-gray-300 rounded"
                    value={selectedMenu}
                >
                    <option value="" disabled={menuOptionDisabled}>メニュー</option>
                    <option value="create-new">新規作成...</option>
                    <option value="new-file">新しく読み込み...</option>
                    <option value="difficult-only">苦手な問題のみ表示</option>
                    {storedFiles.length > 0 && (
                        <optgroup label="保存済みファイル">
                            {storedFiles.map((file: StoredCSVFile) => (
                                <option key={file.id} value={file.id}>
                                    {file.name}
                                </option>
                            ))}
                        </optgroup>
                    )}
                </select>

                {showFileButton && isMobile && (
                    <button
                        onClick={handleFileButtonClick}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        <HiPlus className="w-5 h-5" />
                    </button>
                )}

                {selectedFileId && !showDifficultOnly && (
                    <button
                        onClick={handleEditClick}
                        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                        aria-label="編集"
                    >
                        <HiPencil className="w-5 h-5" />
                    </button>
                )}

                {((selectedFileId && currentQuestions.length > 0) || (showDifficultOnly && difficultQuestions.length > 0)) && (
                    <>
                        <button
                            onClick={handleShuffle}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                            aria-label="シャッフル"
                        >
                            <HiOutlineSwitchHorizontal className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleResetOrder}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                            aria-label="元の順序に戻す"
                        >
                            <HiRefresh className="w-5 h-5" />
                        </button>
                    </>
                )}

                <EditModal
                    isOpen={isEditModalOpen}
                    content={isNewFile ? '' : (storedFiles.find(f => f.id === selectedFileId)?.content || '')}
                    fileName={isNewFile ? '' : (storedFiles.find(f => f.id === selectedFileId)?.name || '')}
                    onSave={handleSave}
                    onDelete={isNewFile ? undefined : handleDeleteFile}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setIsNewFile(false);
                    }}
                    isNewFile={isNewFile}
                />

                <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {errors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <ul className="list-none">
                        {errors.map((error, index) => (
                            <li key={index}>行 {error.line}: {error.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-col gap-12">
                {rows.map((row, rowIndex) => (
                    <div key={`${selectedFileId}-${rowIndex}`} className="flex justify-end">
                        <div className="flex flex-row-reverse items-start">
                            {row.map((question) => (
                                <QuestionDisplay
                                    key={`${question.text}-${question.question}-${resetKey}`}
                                    question={question}
                                    isDifficult={isDifficult(question)}
                                    onMarkDifficult={addDifficultQuestion}
                                    onMarkMastered={removeDifficultQuestion}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanjiDrill;