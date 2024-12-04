import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';

interface CSVEditorProps {
    value: string;
    onChange: (value: string) => void;
    containerRef: React.RefObject<HTMLDivElement>;
    onScrollRequest?: () => void;
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

const CSVEditor = ({ value, onChange, containerRef, onScrollRequest }: CSVEditorProps) => {
    const [rows, setRows] = useState<Row[]>([]);
    const scrollTimeoutRef = useRef<number | null>(null);

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

    const scrollToBottom = () => {
        if (onScrollRequest) {
            onScrollRequest();
        } else if (containerRef.current) {
            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = window.setTimeout(() => {
                const container = containerRef.current;
                if (container) {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 50);
        }
    };

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

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
        scrollToBottom();
    };

    const handleRowUpdate = (index: number, field: keyof Row, newValue: string | boolean) => {
        const newRows = rows.map((row, i) => {
            if (i === index) {
                return { ...row, [field]: newValue };
            }
            return row;
        });

        if (field === 'reading' &&
            typeof newValue === 'string' &&
            newValue !== '' &&
            index === rows.length - 1) {
            newRows.push({ text: '', question: '', reading: '', isReading: false });
            scrollToBottom();
        }

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
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex mb-1 text-xs text-gray-600">
                <div className="w-[190px] px-1">本文</div>
                <div className="w-[120px] px-1">問題</div>
                <div className="w-[120px] px-1">読み方</div>
                <div className="w-8 text-center">読</div>
                <div className="w-8"></div>
            </div>

            <div className="min-h-0">
                {rows.map((row, index) => (
                    <div key={index} className="flex mb-1 gap-1">
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
                        <div className="w-8 flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={row.isReading}
                                onChange={(e) => handleRowUpdate(index, 'isReading', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => removeRow(index)}
                            className="w-8 mr-4 text-red-500 hover:text-red-700 focus:outline-none text-center"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-8 left-0 right-0 py-2 w-24">
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