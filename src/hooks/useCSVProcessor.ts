import { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { Question, ParseError } from '../types';
import { detectEncoding } from '../utils/encoding';
import { validateKanji } from '../utils/kanjiValidation';

export const useCSVProcessor = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<ParseError[]>([]);


    const processCSV = async (file: File) => {
        try {
            const buffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);

            const encoding = detectEncoding(uint8Array);
            const decoder = new TextDecoder(encoding.toLowerCase());
            const text = decoder.decode(uint8Array);

            Papa.parse(text, {
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

                            if (!validateKanji(row.kanji)) {
                                throw new Error('漢字部分に想定外の文字が含まれています');
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setErrors([{
                line: 0,
                message: 'ファイルの読み込みに失敗しました'
            }]);
        }
    };

    return {
        questions,
        errors,
        processCSV
    };
};