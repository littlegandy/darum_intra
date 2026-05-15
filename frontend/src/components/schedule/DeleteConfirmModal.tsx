import { useI18n } from '../../i18n/i18n';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  groupCount: number;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  groupCount,
  onDeleteSingle,
  onDeleteAll,
  onCancel,
}: DeleteConfirmModalProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('schedule.deleteModal.title', { count: groupCount })}
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          {t('schedule.deleteModal.description', { count: groupCount })}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onDeleteSingle}
            className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            {t('schedule.deleteModal.single')}
          </button>

          <button
            onClick={onDeleteAll}
            className="w-full rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            {t('schedule.deleteModal.all', { count: groupCount })}
          </button>

          <button
            onClick={onCancel}
            className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {t('scheduleForm.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
