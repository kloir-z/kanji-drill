import { useState, useCallback } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { Question, ParseError, StoredCSVFile } from '../types';
import { detectEncoding } from '../utils/encoding';

const STORAGE_KEY = 'stored_csv_files';

interface CSVRow {
    text: string;
    question: string;
    reading: string;
    isReading?: string;
}

interface CSVProcessorResult {
    questions: Question[];
    errors: ParseError[];
    storedFiles: StoredCSVFile[];
    processCSV: (file: File) => Promise<string | null>;
    loadStoredFile: (id: string) => void;
    removeStoredFile: (id: string) => void;
    updateStoredFile: (id: string, content: string, newFileName: string) => void;
    createNewFile: (content: string, fileName: string) => string;
}

export const useCSVProcessor = (): CSVProcessorResult => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<ParseError[]>([]);
    const [storedFiles, setStoredFiles] = useState<StoredCSVFile[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const createNewFile = (content: string, fileName: string) => {
        const newId = crypto.randomUUID();
        const newFile: StoredCSVFile = {
            id: newId,
            name: `${fileName}.csv`,
            content: content,
            lastUsed: Date.now()
        };

        const updatedFiles = [newFile, ...storedFiles.slice(0, 9)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
        setStoredFiles(updatedFiles);
        processCSVContent(content);

        return newId;
    };

    const processCSVContent = useCallback((content: string) => {
        Papa.parse<CSVRow>(content, {
            header: true,
            skipEmptyLines: true,
            delimiter: ',',
            complete(results: ParseResult<CSVRow>) {
                const newQuestions: Question[] = [];
                const newErrors: ParseError[] = [];

                results.data.forEach((row, index) => {
                    try {
                        if (index === results.data.length - 1 &&
                            !row.text && !row.question && !row.reading &&
                            row.isReading === '0') {
                            return;
                        }

                        if (!row.text || !row.question || !row.reading) {
                            throw new Error(`必要なフィールドが不足しています (text: ${row.text}, kanji: ${row.question}, reading: ${row.reading})`);
                        }

                        newQuestions.push({
                            text: row.text,
                            question: row.question,
                            reading: row.reading,
                            isReading: row.isReading === '1'
                        });
                    } catch (error) {
                        newErrors.push({
                            line: index + 2,
                            message: error instanceof Error ? error.message : '不明なエラーが発生しました'
                        });
                    }
                });

                setQuestions(newQuestions);
                setErrors(newErrors);
            },
            error(err: { message: unknown; }) {
                setErrors([{
                    line: 0,
                    message: `CSVの解析に失敗しました: ${err.message}`
                }]);
            }
        });
    }, []);


    const processCSV = async (file: File) => {
        try {
            const buffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            const encoding = detectEncoding(uint8Array);
            const decoder = new TextDecoder(encoding.toLowerCase());
            const content = decoder.decode(uint8Array);

            const existingFileIndex = storedFiles.findIndex(f => f.name === file.name);
            const fileId = existingFileIndex >= 0 ? storedFiles[existingFileIndex].id : crypto.randomUUID();

            const newStoredFile: StoredCSVFile = {
                id: fileId,
                name: file.name,
                content: content,
                lastUsed: Date.now()
            };

            let updatedFiles: StoredCSVFile[];
            if (existingFileIndex >= 0) {
                updatedFiles = [...storedFiles];
                updatedFiles[existingFileIndex] = newStoredFile;
            } else {
                updatedFiles = [newStoredFile, ...storedFiles.slice(0, 9)];
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
            setStoredFiles(updatedFiles);
            processCSVContent(content);

            return fileId;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setErrors([{
                line: 0,
                message: 'ファイルの読み込みに失敗しました'
            }]);
            return null;
        }
    };
    const loadStoredFile = (id: string) => {
        const file = storedFiles.find(f => f.id === id);
        if (file) {
            const updatedFiles = storedFiles.map(f =>
                f.id === id ? { ...f, lastUsed: Date.now() } : f
            );

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
            setStoredFiles(updatedFiles);

            processCSVContent(file.content);
        }
    };

    const removeStoredFile = (id: string) => {
        const updatedFiles = storedFiles.filter(f => f.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
        setStoredFiles(updatedFiles);
        setQuestions([]);
    };

    const updateStoredFile = (id: string, content: string, newFileName: string) => {
        const updatedFiles = storedFiles.map(f => {
            if (f.id === id) {
                const extension = f.name.split('.').pop() || 'csv';
                const newName = `${newFileName}.${extension}`;
                return { ...f, content, name: newName, lastUsed: Date.now() };
            }
            return f;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
        setStoredFiles(updatedFiles);
        processCSVContent(content);
    };


    return {
        questions,
        errors,
        storedFiles,
        processCSV,
        loadStoredFile,
        removeStoredFile,
        updateStoredFile,
        createNewFile
    };
};