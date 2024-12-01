import { useState, useEffect } from "react";
import filenameReserved from "filename-reserved-regex";

interface EditModalProps {
    isOpen: boolean;
    content: string;
    fileName: string;
    onSave: (content: string, fileName: string) => void;
    onDelete?: () => void;
    onClose: () => void;
    isNewFile?: boolean;
}

export const EditModal = ({ isOpen, content, fileName, onSave, onDelete, onClose, isNewFile }: EditModalProps) => {
    const [editedContent, setEditedContent] = useState(content);
    const [editedFileName, setEditedFileName] = useState("");
    const [fileNameError, setFileNameError] = useState("");

    useEffect(() => {
        const resetState = () => {
            setEditedContent(content);
            const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            setEditedFileName(nameWithoutExt);
            setFileNameError("");
        };
        if (isOpen) {
            resetState();
        }
    }, [isOpen, content, fileName]);

    const handleClose = () => {
        setFileNameError("");
        onClose();
    };

    if (!isOpen) return null;

    const validateFileName = (name: string) => {
        if (!name.trim()) {
            return "ファイル名を入力してください";
        }

        if (filenameReserved().test(name)) {
            return "ファイル名に使用できない文字が含まれています";
        }

        if (name.length > 255) {
            return "ファイル名が長すぎます";
        }

        return "";
    };

    const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFileName = e.target.value;
        setEditedFileName(newFileName);
        setFileNameError(validateFileName(newFileName));
    };

    const handleSave = () => {
        const error = validateFileName(editedFileName);
        if (error) {
            setFileNameError(error);
            return;
        }
        onSave(editedContent, editedFileName);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {isNewFile ? '新規ファイルを作成' : 'ファイルを編集'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* ファイル名編集フィールド */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ファイル名
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editedFileName}
                            onChange={handleFileNameChange}
                            className="flex-grow p-2 border border-gray-300 rounded"
                            placeholder="ファイル名を入力"
                        />
                        <span className="text-gray-500">.csv</span>
                    </div>
                    {fileNameError && (
                        <p className="text-red-500 text-sm mt-1">{fileNameError}</p>
                    )}
                </div>

                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="flex-grow w-full p-4 border border-gray-300 rounded mb-4 font-mono"
                />
                <div className="flex justify-end gap-4">
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 text-red-600 hover:text-red-800"
                        >
                            削除
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={!!fileNameError}
                    >
                        {isNewFile ? '作成' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
};