import { useState, useEffect } from "react";
import filenameReserved from "filename-reserved-regex";
import { CSVEditor } from './CSVEditor';
import { useIsMobile } from '../hooks/useIsMobile';

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
    const isMobile = useIsMobile();

    useEffect(() => {
        const resetState = () => {
            const initialContent = isNewFile ? "text,question,reading\n" : content;
            setEditedContent(initialContent);
            const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            setEditedFileName(nameWithoutExt);
            setFileNameError("");
        };
        if (isOpen) {
            resetState();
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, content, fileName, isNewFile]);

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

    const modalClasses = isMobile
        ? "fixed inset-0 bg-white flex flex-col h-screen w-screen z-50"
        : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const contentClasses = isMobile
        ? "flex flex-col h-full w-full"
        : "bg-white p-6 rounded-lg w-full max-w-4xl mx-4 flex flex-col h-[80vh]";

    const editorContainerClasses = isMobile
        ? "flex-grow overflow-hidden"
        : "flex-grow min-h-0";

    const buttonContainerClasses = isMobile
        ? "p-4 bg-white border-t border-gray-200"
        : "flex justify-end gap-4 mt-4";

    return (
        <div className={modalClasses}>
            <div className={contentClasses}>
                <div className="flex justify-between items-center py-2 px-4 border-b border-gray-200">
                    <h2 className="text-base font-medium text-gray-600">
                        {isNewFile ? '新規作成' : '編集'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-4 pt-3">
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

                <div className={editorContainerClasses}>
                    <CSVEditor
                        value={editedContent}
                        onChange={setEditedContent}
                    />
                </div>

                <div className={buttonContainerClasses}>
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