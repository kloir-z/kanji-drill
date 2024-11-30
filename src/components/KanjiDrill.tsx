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

    const displayQuestions = showDifficultOnly ? difficultQuestions : questions;

    const updateQuestionsPerRow = () => {
        const width = window.innerWidth;
        // マージンの分も考慮して計算
        const questionWidth = 120 + 32; // 最小幅 120px + マージン左右合計 32px
        const availableWidth = width - 32; // padding 16px × 2
        const maxQuestions = Math.floor(availableWidth / questionWidth);
        setQuestionsPerRow(Math.max(2, Math.min(20, maxQuestions)));
    };

    useEffect(() => {
        // 初期設定
        updateQuestionsPerRow();

        // リサイズイベントのリスナーを設定
        const handleResize = () => {
            updateQuestionsPerRow();
        };

        // デバウンス処理を追加してパフォーマンスを改善
        let timeoutId: NodeJS.Timeout;
        window.addEventListener('resize', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 150);
        });

        // クリーンアップ関数
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // 設問を段組みに分割
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

    const handleStoredFileSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        const id = event.target.value;
        if (id) {
            setSelectedFileId(id);
            loadStoredFile(id);
        }
    };

    const handleFileRemove = (id: string) => {
        removeStoredFile(id);
        if (selectedFileId === id) {
            setSelectedFileId('');
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <div className="flex gap-4 items-center mb-4">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block text-sm text-gray-500"
                    />
                    {storedFiles.length > 0 && (
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedFileId}
                                onChange={handleStoredFileSelect}
                                className="block w-64 p-2 border border-gray-300 rounded"
                            >
                                <option value="">保存されたファイルを選択...</option>
                                {storedFiles.map((file: StoredCSVFile) => (
                                    <option key={file.id} value={file.id}>
                                        {file.name}
                                    </option>
                                ))}
                            </select>
                            {selectedFileId && (
                                <button
                                    onClick={() => handleFileRemove(selectedFileId)}
                                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                                >
                                    削除
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {errors.length > 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <ul className="list-none">
                            {errors.map((error, index) => (
                                <li key={index}>
                                    行 {error.line}: {error.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-4 flex gap-4">
                <button
                    onClick={() => setShowDifficultOnly(!showDifficultOnly)}
                    className={`px-4 py-2 rounded ${showDifficultOnly
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                >
                    {showDifficultOnly ? '全ての問題を表示' : '苦手な問題のみ表示'}
                </button>
                {showDifficultOnly && (
                    <span className="text-sm text-gray-600 self-center">
                        苦手な問題: {difficultQuestions.length}問
                    </span>
                )}
            </div>

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