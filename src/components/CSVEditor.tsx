import { useEffect, useRef, useState } from 'react';

interface CSVEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const CSVEditor = ({ value, onChange }: CSVEditorProps) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const [highlightedContent, setHighlightedContent] = useState<string>('');

    const processContent = (content: string) => {
        const lines = content.split('\n').map((line, lineIndex) => {
            const cells = line.split(/([,])/);
            const processedLine = cells.map((cell, cellIndex) => {
                if (cell === ',') {
                    return cell;
                }

                let className = '';
                if (lineIndex === 0) {
                    className = 'font-bold';
                }
                const colorIndex = Math.floor(cellIndex / 2) % 3;
                switch (colorIndex) {
                    case 0:
                        className += ' text-blue-600';
                        break;
                    case 1:
                        className += ' text-red-600';
                        break;
                    case 2:
                        className += ' text-green-600';
                        break;
                }
                return `<span class="${className}">${cell}</span>`;
            }).join('');

            return `<div>${processedLine}</div>`;
        });

        return lines.join('');
    };

    useEffect(() => {
        setHighlightedContent(processContent(value));
    }, [value]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
    };

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const source = e.currentTarget;
        const target = source === editorRef.current ? preRef.current : editorRef.current;

        if (target && source) {
            target.scrollTop = source.scrollTop;
            target.scrollLeft = source.scrollLeft;
        }
    };

    const commonStyles = `
        w-full h-full p-4 
        font-mono text-base leading-normal
        whitespace-pre-wrap break-all
        border border-gray-300 rounded
        overflow-auto
        tab-size-4
    `;

    const preStyles = `
    ${commonStyles}
    [&>div]:leading-[inherit]
    [&>div]:min-h-[1.2em]
    `;

    return (
        <div className="relative font-mono text-base h-[400px]">
            <textarea
                ref={editorRef}
                value={value}
                onChange={handleInput}
                onScroll={handleScroll}
                className={`${commonStyles} absolute inset-0 bg-transparent text-transparent caret-black z-10 resize-none`}
                spellCheck={false}
            />
            <pre
                ref={preRef}
                onScroll={handleScroll}
                className={preStyles}
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
        </div>
    );
};