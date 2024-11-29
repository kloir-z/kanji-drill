import { useState, useCallback } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { Question, ParseError, StoredCSVFile } from '../types';
import { detectEncoding } from '../utils/encoding';

const STORAGE_KEY = 'stored_csv_files';

export const useCSVProcessor = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<ParseError[]>([]);
    const [storedFiles, setStoredFiles] = useState<StoredCSVFile[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const processCSVContent = useCallback((content: string) => {
        Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            delimiter: ',',
            complete(results: ParseResult<Partial<Question>>) {
                const newQuestions: Question[] = [];
                const newErrors: ParseError[] = [];

                results.data.forEach((row, index) => {
                    try {
                        if (!row.text || !row.kanji || !row.reading) {
                            throw new Error(`必要なフィールドが不足しています (text: ${row.text}, kanji: ${row.kanji}, reading: ${row.reading})`);
                        }

                        newQuestions.push({
                            text: row.text,
                            kanji: row.kanji,
                            reading: row.reading
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

            // 同じ名前のファイルが存在するか確認
            const existingFileIndex = storedFiles.findIndex(f => f.name === file.name);

            let updatedFiles: StoredCSVFile[];
            const newStoredFile: StoredCSVFile = {
                id: existingFileIndex >= 0 ? storedFiles[existingFileIndex].id : crypto.randomUUID(),
                name: file.name,
                content: content,
                lastUsed: Date.now()
            };

            if (existingFileIndex >= 0) {
                // 同じ名前のファイルが存在する場合は上書き
                updatedFiles = [...storedFiles];
                updatedFiles[existingFileIndex] = newStoredFile;
            } else {
                // 新規ファイルの場合は先頭に追加（最大10件まで）
                updatedFiles = [newStoredFile, ...storedFiles.slice(0, 9)];
            }

            // 最終使用日時でソート
            updatedFiles.sort((a, b) => b.lastUsed - a.lastUsed);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
            setStoredFiles(updatedFiles);

            processCSVContent(content);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setErrors([{
                line: 0,
                message: 'ファイルの読み込みに失敗しました'
            }]);
        }
    };
    const loadStoredFile = (id: string) => {
        const file = storedFiles.find(f => f.id === id);
        if (file) {
            // 最終使用日時を更新
            const updatedFiles = storedFiles.map(f =>
                f.id === id ? { ...f, lastUsed: Date.now() } : f
            ).sort((a, b) => b.lastUsed - a.lastUsed);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
            setStoredFiles(updatedFiles);

            processCSVContent(file.content);
        }
    };

    const removeStoredFile = (id: string) => {
        const updatedFiles = storedFiles.filter(f => f.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
        setStoredFiles(updatedFiles);
    };

    return {
        questions,
        errors,
        storedFiles,
        processCSV,
        loadStoredFile,
        removeStoredFile
    };
};