export const detectEncoding = (buffer: Uint8Array): string => {
    // BOMによる判定
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return 'utf-8';
    }

    // SJISの特徴的なバイトパターンをチェック
    let sjisCount = 0;
    let utf8Count = 0;

    for (let i = 0; i < buffer.length - 1; i++) {
        // SJISの第1バイト範囲
        if ((buffer[i] >= 0x81 && buffer[i] <= 0x9F) ||
            (buffer[i] >= 0xE0 && buffer[i] <= 0xFC)) {
            // 第2バイト範囲
            if ((buffer[i + 1] >= 0x40 && buffer[i + 1] <= 0x7E) ||
                (buffer[i + 1] >= 0x80 && buffer[i + 1] <= 0xFC)) {
                sjisCount++;
                i++; // 2バイト文字なのでスキップ
            }
        }
        // UTF-8の特徴的なパターン
        else if (buffer[i] >= 0xC0 && buffer[i] <= 0xDF) {
            if (i + 1 < buffer.length &&
                buffer[i + 1] >= 0x80 && buffer[i + 1] <= 0xBF) {
                utf8Count++;
                i++;
            }
        }
    }

    return sjisCount > utf8Count ? 'shift-jis' : 'utf-8';
};