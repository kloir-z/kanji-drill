import React from 'react';
import { DifficultSlot } from '../types';

interface SlotSelectorProps {
    slots: DifficultSlot[];
    currentSlotId: string;
    onChange: (slotId: string) => void;
    compact?: boolean;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
    slots,
    currentSlotId,
    onChange,
    compact = false
}) => {
    return (
        <select
            value={currentSlotId}
            onChange={(e) => onChange(e.target.value)}
            className={`block ${compact ? 'w-32' : 'w-48'} p-2 border border-gray-300 rounded`}
        >
            {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                    {slot.name} ({slot.questions.length})
                </option>
            ))}
        </select>
    );
};

export default SlotSelector;