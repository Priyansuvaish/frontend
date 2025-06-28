import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormTemplate } from '@/types/form-template';

interface FormTemplateCardProps {
  template: FormTemplate;
  onEdit: (template: FormTemplate) => void;
  onDelete: (id: number) => void;
}

export default function FormTemplateCard({ template, onEdit, onDelete }: FormTemplateCardProps) {
  const schemaPreview = JSON.stringify(template.schemaJson, null, 2);
  const isTruncated = schemaPreview.length > 100;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {template.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              ID: {template.id}
            </p>
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <pre className="whitespace-pre-wrap overflow-hidden">
                {isTruncated ? schemaPreview.substring(0, 100) + '...' : schemaPreview}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onEdit(template)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(template.id!)}
            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 