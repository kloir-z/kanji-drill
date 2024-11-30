export interface Question {
    text: string;
    kanji: string;
    reading: string;
}

export type ParseError = {
    line: number;
    message: string;
}

export interface StoredCSVFile {
    id: string;
    name: string;
    content: string;
    lastUsed: number;
}

export interface DifficultQuestion extends Question {
    id: string;
    timestamp: number;
}