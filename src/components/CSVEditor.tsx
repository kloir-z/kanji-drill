import { useEffect, useState } from 'react';
import Papa from 'papaparse';

interface CSVEditorProps {
    value: string;
    onChange: (value: string) => void;
}

interface Row {
    text: string;
    question: string;
    reading: string;
    isReading: boolean;
}

interface CSVRow {
    text: string;
    question: string;
    reading: string;
    isReading?: string;
}

export const CSVEditor = ({ value, onChange }: CSVEditorProps) => {
    const [rows, setRows] = useState<Row[]>([]);

    useEffect(() => {
        const parseResult = Papa.parse<CSVRow>(value, {
            header: true,
            skipEmptyLines: true
        });

        const initialRows = parseResult.data.map(row => ({
            text: row.text || '',
            question: row.question || '',
            reading: row.reading || '',
            isReading: row.isReading === '1'
        }));

        if (initialRows.length === 0) {
            initialRows.push({ text: '', question: '', reading: '', isReading: false });
        }

        setRows(initialRows);
    }, [value]);

    const handleRowUpdate = (index: number, field: keyof Row, newValue: string | boolean) => {
        const newRows = rows.map((row, i) => {
            if (i === index) {
                return { ...row, [field]: newValue };
            }
            return row;
        });

        setRows(newRows);

        const csvData = newRows.map(row => ({
            text: row.text,
            question: row.question,
            reading: row.reading,
            isReading: row.isReading ? '1' : '0'
        }));

        const csv = Papa.unparse(csvData, {
            header: true,
            columns: ['text', 'question', 'reading', 'isReading']
        });

        onChange(csv);
    };

    const addRow = () => {
        const newRows = [...rows, { text: '', question: '', reading: '', isReading: false }];
        setRows(newRows);

        const csvData = newRows.map(row => ({
            text: row.text,
            question: row.question,
            reading: row.reading,
            isReading: row.isReading ? '1' : '0'
        }));

        const csv = Papa.unparse(csvData, {
            header: true,
            columns: ['text', 'question', 'reading', 'isReading']
        });

        onChange(csv);
    };

    const removeRow = (index: number) => {
        if (rows.length > 1) {
            const newRows = rows.filter((_, i) => i !== index);
            setRows(newRows);

            const csvData = newRows.map(row => ({
                text: row.text,
                question: row.question,
                reading: row.reading,
                isReading: row.isReading ? '1' : '0'
            }));

            const csv = Papa.unparse(csvData, {
                header: true,
                columns: ['text', 'question', 'reading', 'isReading']
            });

            onChange(csv);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="min-w-[600px]">
                <div className="flex mb-1 px-1 text-xs text-gray-600">
                    <div className="w-[190px] px-1">本文</div>
                    <div className="w-[120px] px-1">問題</div>
                    <div className="w-[120px] px-1">読み方</div>
                    <div className="w-12 text-center">読み</div>
                    <div className="w-8"></div>
                </div>
                <div className="h-full">
                    <div className="flex-1">
                        {rows.map((row, index) => (
                            <div key={index} className="flex mb-1 px-1 gap-1">
                                <input
                                    type="text"
                                    value={row.text}
                                    onChange={(e) => handleRowUpdate(index, 'text', e.target.value)}
                                    className="w-[190px] p-1 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                    placeholder="本文"
                                />
                                <input
                                    type="text"
                                    value={row.question}
                                    onChange={(e) => handleRowUpdate(index, 'question', e.target.value)}
                                    className="w-[120px] p-1 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                    placeholder="問題"
                                />
                                <input
                                    type="text"
                                    value={row.reading}
                                    onChange={(e) => handleRowUpdate(index, 'reading', e.target.value)}
                                    className="w-[120px] p-1 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                                    placeholder="読み方"
                                />
                                <div className="w-12 flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={row.isReading}
                                        onChange={(e) => handleRowUpdate(index, 'isReading', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={() => removeRow(index)}
                                    className="w-8 text-red-500 hover:text-red-700 focus:outline-none text-center"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-2 px-1">
                <button
                    onClick={addRow}
                    className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                    + 行を追加
                </button>
            </div>
        </div>
    );
};

export default CSVEditor;