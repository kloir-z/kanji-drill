interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">CSVファイルの作り方</h2>
                <div className="space-y-4">
                    <h3 className="font-bold mt-2">CSVファイルとは</h3>
                    <p>
                        CSVファイルは、データを表形式で保存するためのテキストファイルです。
                        各行がデータの1行を表し、行内の項目はカンマ（,）で区切られています。
                        エクセルなどの表計算ソフトで作成できるほか、メモ帳などのテキストエディタでも作成できます。
                    </p>

                    <h3 className="font-bold mt-6 mb-2">必要な項目</h3>
                    <p>このアプリでは、以下の3つの項目（列）が必要です：</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>text</strong>: 問題文（例：「今日は晴れた日です。」）</li>
                        <li><strong>question</strong>: 問題にする漢字や語句（例：「晴」）</li>
                        <li><strong>reading</strong>: 漢字や語句の読み方（例：「は」）</li>
                    </ul>

                    <h3 className="font-bold mt-6 mb-2">CSVファイルの例</h3>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        text,question,reading<br />
                        今日は晴れた日です。,晴,は<br />
                        私は本を読みます。,読,よ<br />
                        彼は手紙を書きました。,書,か
                    </div>

                    <h3 className="font-bold mt-6 mb-2">作成方法1: 表計算ソフトを使う場合</h3>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>ExcelやNumbersなどの表計算ソフトを開きます。</li>
                        <li>1行目に「text」「question」「reading」と入力します。</li>
                        <li>2行目以降に問題文、漢字、読み方を入力します。</li>
                        <li>「CSVでエクスポート」や「名前を付けて保存」から、ファイルの種類を「CSV（カンマ区切り）」を選択して保存します。</li>
                    </ol>

                    <h3 className="font-bold mt-6 mb-2">作成方法2: メモ帳を使う場合</h3>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>メモ帳を開きます。</li>
                        <li>1行目に「text,question,reading」と入力します（カンマは半角）。</li>
                        <li>2行目以降に「問題文,漢字,読み方」の形式で1行ずつ入力します。</li>
                        <li>「名前を付けて保存」で、ファイル名の末尾に「.csv」を付けて保存します（例：「漢字ドリル.csv」）。</li>
                    </ol>

                    <p className="mt-6 text-gray-600 border-t pt-4">
                        <span className="font-bold">注意事項：</span><br />
                        ・データの各項目は必ず半角カンマ（,）で区切ってください<br />
                        ・ファイルの文字コードはUTF-8またはShift-JISに対応しています
                    </p>
                </div>
            </div>
        </div>
    );
};