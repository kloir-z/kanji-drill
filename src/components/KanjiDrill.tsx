import { ChangeEvent } from 'react';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { useCSVProcessor } from '../hooks/useCSVProcessor';

const KanjiDrill = () => {
    const { questions, errors, processCSV } = useCSVProcessor();

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

            <div className="flex justify-end">
                <div className="flex flex-row-reverse">
                    {questions.map((question, index) => (
                        <QuestionDisplay key={index} question={question} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanjiDrill;
