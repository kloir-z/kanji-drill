import { HiDownload } from 'react-icons/hi';

interface DownloadButtonProps {
    csvContent: string;
    fileName: string;
    disabled?: boolean;
}

const DownloadButton = ({ csvContent, fileName, disabled = false }: DownloadButtonProps) => {
    const handleDownload = () => {
        // CSVデータをBlobに変換
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // BOMを追加してExcelでの文字化けを防ぐ
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const bomBlob = new Blob([bom, blob], { type: 'text/csv;charset=utf-8;' });

        // ダウンロードリンクを作成
        const url = window.URL.createObjectURL(bomBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);

        // リンクをクリックしてダウンロードを開始
        document.body.appendChild(link);
        link.click();

        // クリーンアップ
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleDownload}
            disabled={disabled}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="CSVダウンロード"
            title="CSVダウンロード"
        >
            <HiDownload className="w-5 h-5" />
        </button>
    );
};

export default DownloadButton;