import { ChangeEvent, useState, useEffect } from 'react';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { useCSVProcessor } from '../hooks/useCSVProcessor';

const KanjiDrill = () => {
    const { questions, errors, processCSV } = useCSVProcessor();
    const [questionsPerRow, setQuestionsPerRow] = useState(5);

    const updateQuestionsPerRow = () => {
        const width = window.innerWidth;
        // 120px（設問の最小幅）をベースに計算
        // paddingの8px × 2も考慮
        const availableWidth = width - 16;
        const maxQuestions = Math.floor(availableWidth / 120);

        // 2問から20問の間で設定
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
    for (let i = 0; i < questions.length; i += questionsPerRow) {
        rows.push(questions.slice(i, i + questionsPerRow));
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processCSV(file);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 mb-4"
                />
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

            <div className="flex flex-col gap-8">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-end">
                        <div className="flex flex-row-reverse items-start">
                            {row.map((question, index) => (
                                <QuestionDisplay key={index} question={question} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanjiDrill;