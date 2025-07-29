import React from 'react';

export type UserActionsMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function UserActionsMenu({ onEdit, onDelete }: UserActionsMenuProps) {
  return (
    <div className="flex gap-2">
      <button
        className="bg-blue-500 text-white rounded px-3 py-1 text-xs"
        onClick={onEdit}
        style={{ minWidth: 44, minHeight: 44 }}
      >
        Edit
      </button>
      <button
        className="bg-red-500 text-white rounded px-3 py-1 text-xs"
        onClick={onDelete}
        style={{ minWidth: 44, minHeight: 44 }}
      >
        Delete
      </button>
    </div>
  );
}
