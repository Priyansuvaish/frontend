export interface FormTemplate {
  id?: number;
  title: string;
  schemaJson: Record<string, unknown>;
}

export interface FormTemplateFormData {
  title: string;
  schemaJson: string; // JSON string for form input
} 