export const detectEncoding = (buffer: Uint8Array): string => {
    // BOMによる判定
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return 'utf-8';
    }

    // 改行コードを検索して2行目以降のデータを取得
    let newlineIndex = -1;
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0x0A) { // LF
            newlineIndex = i;
            break;
        }
        if (buffer[i] === 0x0D) { // CR
            newlineIndex = i;
            if (i + 1 < buffer.length && buffer[i + 1] === 0x0A) { // CRLF
                i++;
            }
            break;
        }
    }

    if (newlineIndex === -1) {
        return 'shift-jis'; // ヘッダーのみの場合はデフォルトをShift-JIS
    }

    // 2行目以降のデータを解析
    const dataBuffer = buffer.slice(newlineIndex + 1);

    let isUtf8 = true;
    let i = 0;

    while (i < dataBuffer.length) {
        const byte = dataBuffer[i];

        if (byte <= 0x7F) { // ASCII
            i++;
            continue;
        }

        // UTF-8の判定
        if (byte >= 0xC0 && byte <= 0xDF) { // 2バイト文字
            if (i + 1 >= dataBuffer.length || (dataBuffer[i + 1] & 0xC0) !== 0x80) {
                isUtf8 = false;
                break;
            }
            i += 2;
        } else if (byte >= 0xE0 && byte <= 0xEF) { // 3バイト文字
            if (i + 2 >= dataBuffer.length ||
                (dataBuffer[i + 1] & 0xC0) !== 0x80 ||
                (dataBuffer[i + 2] & 0xC0) !== 0x80) {
                isUtf8 = false;
                break;
            }
            i += 3;
        } else if ((byte >= 0x81 && byte <= 0x9F) || (byte >= 0xE0 && byte <= 0xFC)) {
            // Shift-JISの文字パターンを検出
            if (i + 1 >= dataBuffer.length) {
                isUtf8 = false;
                break;
            }
            const secondByte = dataBuffer[i + 1];
            if ((secondByte >= 0x40 && secondByte <= 0x7E) ||
                (secondByte >= 0x80 && secondByte <= 0xFC)) {
                // 有効なShift-JISの2バイト文字を検出
                isUtf8 = false;
                break;
            }
            i += 2;
        } else {
            isUtf8 = false;
            break;
        }
    }

    return isUtf8 ? 'utf-8' : 'shift-jis';
};