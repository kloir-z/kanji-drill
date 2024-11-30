import { ChangeEvent, useState, useEffect } from 'react';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { useCSVProcessor } from '../hooks/useCSVProcessor';
import { useDifficultQuestions } from '../hooks/useDifficultQuestions';
import { StoredCSVFile } from '../types';

const KanjiDrill = () => {
    const {
        questions,
        errors,
        storedFiles,
        processCSV,
        loadStoredFile,
        removeStoredFile
    } = useCSVProcessor();
    const {
        difficultQuestions,
        isDifficult,
        addDifficultQuestion,
        removeDifficultQuestion
    } = useDifficultQuestions();
    const [questionsPerRow, setQuestionsPerRow] = useState(5);
    const [selectedFileId, setSelectedFileId] = useState<string>('');
    const [showDifficultOnly, setShowDifficultOnly] = useState(false);
    const [menuOptionDisabled, setMenuOptionDisabled] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<string>('');

    const handleMenuSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        if (value !== '') {
            setMenuOptionDisabled(true);
        }

        switch (value) {
            case 'new-file':
                document.getElementById('file-input')?.click();
                setShowDifficultOnly(false);
                setSelectedFileId(value);
                setSelectedMenu(selectedFileId);
                break;
            case 'difficult-only':
                setShowDifficultOnly(true);
                setSelectedMenu('difficult-only');
                break;
            case '':
                setSelectedFileId('');
                setSelectedMenu('');
                setShowDifficultOnly(false);
                break;
            default:
                setSelectedFileId(value);
                setSelectedMenu(value);
                loadStoredFile(value);
                setShowDifficultOnly(false);
                break;
        }
    };

    const displayQuestions = showDifficultOnly ? difficultQuestions : questions;

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

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const rows = [];
    for (let i = 0; i < displayQuestions.length; i += questionsPerRow) {
        rows.push(displayQuestions.slice(i, i + questionsPerRow));
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processCSV(file);
        }
    };

    const handleDeleteFile = () => {
        if (selectedFileId && window.confirm('このファイルを削除してもよろしいですか？')) {
            removeStoredFile(selectedFileId);
            setSelectedFileId('');
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center gap-2">
                <select
                    onChange={handleMenuSelect}
                    className="block w-64 p-2 border border-gray-300 rounded"
                    value={selectedMenu}
                >
                    <option value="" disabled={menuOptionDisabled}>メニュー</option>
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

                {selectedFileId && (
                    <button
                        onClick={handleDeleteFile}
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                    >
                        削除
                    </button>
                )}

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
                    <div key={rowIndex} className="flex justify-end">
                        <div className="flex flex-row-reverse items-start">
                            {row.map((question, index) => (
                                <QuestionDisplay
                                    key={index}
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