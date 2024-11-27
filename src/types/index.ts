export interface Question {
    text: string;
    kanji: string;
    reading: string;
}

export type ParseError = {
    line: number;
    message: string;
}