'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
}

interface Document {
  type: string;
  label: string;
  required?: boolean;
}

interface FormTemplate {
  program: string;
  fields: FormField[];
  documents: Document[];
}

interface ApplicationFormProps {
  template: FormTemplate;
  applicantId?: number;
  programId: number;
  onSuccess?: () => void;
}

export default function ApplicationForm({
  template,
  applicantId,
  programId,
  onSuccess,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<Record<string, File | null>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, any>>({});
  const [formId, setFormId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Load existing form data
  useEffect(() => {
    const loadExistingForm = async () => {
      if (!applicantId) return;
      try {
        const response = await ApiClient.getForm(applicantId);
        if (response.form) {
          setFormId(response.form.id);
          const data: Record<string, string> = {};
          template.fields.forEach((field) => {
            const key = field.name as keyof typeof response.form;
            if (key in response.form && response.form[key]) {
              data[field.name] = String(response.form[key]);
            }
          });
          setFormData(data);
        }
        if (response.documents && response.documents.length > 0) {
          const docs: Record<string, any> = {};
          response.documents.forEach((doc: any) => {
            docs[doc.document_type] = doc;
          });
          setUploadedDocuments(docs);
        }
      } catch (err) {
        console.error('Error loading form:', err);
      }
    };

    loadExistingForm();
  }, [applicantId, template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError(`File size exceeds 15MB limit for ${documentType}`);
      return;
    }

    setDocuments((prev) => ({ ...prev, [documentType]: file }));
    setError(null);
  };

  const uploadDocument = async (documentType: string, file: File) => {
    if (!formId) {
      throw new Error('Form not saved. Please save form first.');
    }

    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('form_id', formId.toString());
    formDataObj.append('document_type', documentType);

    try {
      setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));

      const response = await ApiClient.uploadDocument(file, formId, documentType);

      setUploadProgress((prev) => ({ ...prev, [documentType]: 100 }));
      setUploadedDocuments((prev) => ({
        ...prev,
        [documentType]: response,
      }));

      return response;
    } catch (err) {
      throw err;
    }
  };

  const saveForm = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      const missingFields = template.fields
        .filter((field) => field.required && !formData[field.name])
        .map((field) => field.label);

      if (missingFields.length > 0) {
        setError(`Please fill in: ${missingFields.join(', ')}`);
        setSaving(false);
        return;
      }

      // Submit form
      const response = await ApiClient.submitForm({
        program_id: programId,
        ...formData,
      });

      if (!formId) {
        setFormId(response.form_id);
      }

      // Upload any new documents
      const documentsToUpload = Object.entries(documents).filter(
        ([docType, file]) => file && !uploadedDocuments[docType]
      );

      for (const [docType, file] of documentsToUpload) {
        if (file) {
          await uploadDocument(docType, file);
        }
      }

      setDocuments({});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save form';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    setError(null);

    // Validate form is saved
    if (!formId) {
      setError('Please save your form first');
      return;
    }

    // Validate all required documents are uploaded
    const missingDocuments = template.documents
      .filter((doc) => doc.required && !uploadedDocuments[doc.type])
      .map((doc) => doc.label);

    if (missingDocuments.length > 0) {
      setError(`Please upload: ${missingDocuments.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      await ApiClient.submitApplication(applicantId || 0);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit application';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Fill out all required fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {template.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>

                {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.label}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    disabled={saving || submitting}
                  />
                ) : field.type === 'date' ? (
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    disabled={saving || submitting}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value) => handleSelectChange(field.name, value)}
                    disabled={saving || submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.label}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    disabled={saving || submitting}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <Button
            onClick={saveForm}
            disabled={saving || submitting}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Form'}
          </Button>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload the necessary documents. Files are automatically compressed to 5KB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {template.documents.map((doc) => (
            <div key={doc.type} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base">
                  {doc.label}
                  {doc.required && <span className="text-destructive">*</span>}
                </Label>
                {uploadedDocuments[doc.type] && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Uploaded</span>
                  </div>
                )}
              </div>

              {uploadedDocuments[doc.type] ? (
                <div className="bg-green-50 p-3 rounded text-sm text-green-800 mb-2">
                  <p className="font-medium">{uploadedDocuments[doc.type].original_filename}</p>
                  <p className="text-xs text-green-700">
                    Original: {(uploadedDocuments[doc.type].original_size / 1024).toFixed(2)}KB
                    {uploadedDocuments[doc.type].is_compressed && (
                      <> → Compressed: {(uploadedDocuments[doc.type].compressed_size / 1024).toFixed(2)}KB</>
                    )}
                  </p>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Input
                  type="file"
                  onChange={(e) => handleFileChange(e, doc.type)}
                  disabled={saving || submitting || !!uploadedDocuments[doc.type]}
                  className="flex-1"
                />
                {documents[doc.type] && (
                  <Button
                    onClick={() => uploadDocument(doc.type, documents[doc.type]!)}
                    disabled={saving || submitting}
                    size="sm"
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadProgress[doc.type] ? `${uploadProgress[doc.type]}%` : 'Upload'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Max 15MB. Supported: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          disabled={saving || submitting}
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          onClick={submitApplication}
          disabled={saving || submitting || !formId}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
}
