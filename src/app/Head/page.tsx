'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { FormTemplate, FormTemplateFormData } from '@/types/form-template';
import { FormTemplateService } from '@/services/formTemplateService';
import FormTemplateCard from '@/components/FormTemplateCard';
import { useRouter } from "next/navigation";

import FormTemplateModal from '@/components/FormTemplateModal';
import { signOut, useSession } from "next-auth/react";
import { clearStoredToken, handleSignOut } from "../utils/auth";
import { Session } from "next-auth";


export default function HeadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);

  

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!(session as Session)?.accessToken) {
        console.log('No access token in session, redirecting to login');
        router.push('/');
        return;
      }
      const accessToken = (session as Session).accessToken;
      console.log('Fetching templates with access token:', !!accessToken);
      console.log('Access token length:', accessToken?.length);
      console.log('Access token starts with:', accessToken?.substring(0, 20));
      console.log('Session object keys:', session ? Object.keys(session) : 'No session');
      const data = await FormTemplateService.getAll(accessToken!);
      console.log('Templates fetched successfully:', data.length, 'templates');
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        console.log('Unauthorized error detected, redirecting to login...');
        clearStoredToken();
        handleSignOut();
        router.push('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session, router]);

  // Fetch templates on component mount
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      handleSignOut();
      return;
    }
    if (status === 'authenticated' && session) {
      fetchTemplates();
    }
  }, [session, status, fetchTemplates, router]);

  const handleSubmit = async (formData: FormTemplateFormData) => {
    try {
      setError(null);
      
      if (!(session as Session)?.accessToken) {
        throw new Error('No access token available');
      }
      
      const accessToken = (session as Session).accessToken;
      console.log('Session access token present:', !!accessToken);
      console.log('Session access token value:', accessToken?.substring(0, 20) + '...');
      
      // Validate JSON schema
      const schemaJson = FormTemplateService.validateJsonSchema(formData.schemaJson);
      
      const templateData = {
        title: formData.title,
        schemaJson
      };

      if (editingTemplate) {
        console.log('Updating template with ID:', editingTemplate.id);
        await FormTemplateService.update(editingTemplate.id!, templateData, accessToken!);
      } else {
        console.log('Creating new template');
        await FormTemplateService.create(templateData, accessToken!);
      }

      await fetchTemplates();
      handleCloseModal();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        console.log('Unauthorized error detected, redirecting to login...');
        clearStoredToken();
        signOut({ redirect: false });
        router.push('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Invalid JSON or save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setError(null);
      if (!(session as Session)?.accessToken) {
        router.push('/');
        return;
      }
      const accessToken = (session as Session).accessToken;
      await FormTemplateService.delete(id, accessToken!);
      await fetchTemplates();
    } catch (err) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        console.log('Unauthorized error detected, redirecting to login...');
        clearStoredToken();
        signOut({ redirect: false });
        router.push('/');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleEdit = (template: FormTemplate) => {
    setEditingTemplate(template);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setError(null);
  };
  if (!session){
    handleSignOut();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const onSignOut = async () => {
    try {
        // Sign out from NextAuth (local session)
        handleSignOut();
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
  {/* Header */}
  <header className="bg-white shadow-md sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-extrabold text-blue-900">Form Templates</h1>
        <p className="text-sm text-gray-500">Manage and organize your form templates effortlessly</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white border border-red-600 rounded-lg hover:bg-red-600 transition"
        >
          Sign Out
        </button>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Template
        </button>
      </div>
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-6 py-10">
    {error && (
      <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow">
        {error}
      </div>
    )}

    {/* Templates Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div key={template.id} className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-5">
          <FormTemplateCard
            template={template}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ))}
    </div>

    {/* Empty State */}
    {templates.length === 0 && !loading && (
      <div className="text-center py-16">
        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
          <PlusIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">No Templates Found</h3>
        <p className="mt-2 text-gray-500">Start by creating a new form template.</p>
        <div className="mt-6">
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Template
          </button>
        </div>
      </div>
    )}
  </main>

  {/* Modal */}
  <FormTemplateModal
    isOpen={showModal}
    onClose={handleCloseModal}
    onSubmit={handleSubmit}
    template={editingTemplate}
    error={error}
  />
</div>

  );
}
