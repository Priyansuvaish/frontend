import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { FormTemplate, FormTemplateFormData } from '@/types/form-template';

interface FormTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormTemplateFormData) => void;
  template?: FormTemplate | null;
  error?: string | null;
}

export default function FormTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  template,
  error
}: FormTemplateModalProps) {
  const [formData, setFormData] = useState<FormTemplateFormData>({
    title: '',
    schemaJson: '{\n  "type": "object",\n  "properties": {}\n}'
  });

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        schemaJson: JSON.stringify(template.schemaJson, null, 2)
      });
    } else {
      setFormData({
        title: '',
        schemaJson: '{\n  "type": "object",\n  "properties": {}\n}'
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {template ? 'Edit Template' : 'Create Template'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Template Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border text-gray-900 placeholder-gray-500"
                required
                placeholder="Enter template title"
              />

            </div>

            <div>
              <label htmlFor="schemaJson" className="block text-sm font-medium text-gray-700">
                JSON Schema
              </label>
              <textarea
                id="schemaJson"
                value={formData.schemaJson}
                onChange={(e) => setFormData({ ...formData, schemaJson: e.target.value })}
                rows={12}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border font-mono text-sm text-gray-900 placeholder-gray-500"
                required
                placeholder={`{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email"
    }
  },
  "required": ["name", "email"]
}`}
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter a valid JSON schema for your form template
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {template ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 