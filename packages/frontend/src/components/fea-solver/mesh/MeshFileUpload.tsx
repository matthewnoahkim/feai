/**
 * MeshFileUpload Component
 * Upload mesh files (MSH, VTK, INP formats)
 */

import React, { useCallback, useState } from 'react';
import { Button } from '../ui/Button';
import type { FileMesh } from '../../../lib/fea-solver/types';

interface MeshFileUploadProps {
  value?: FileMesh;
  onChange: (mesh: FileMesh) => void;
}

export function MeshFileUpload({ value, onChange }: MeshFileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['msh', 'vtk', 'inp'].includes(ext)) {
        throw new Error('Invalid file format. Supported formats: .msh, .vtk, .inp');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      // Read file as base64
      const reader = new FileReader();
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      setFileName(file.name);
      setFileSize(file.size);

      onChange({
        type: 'file',
        format: ext as 'msh' | 'vtk' | 'inp',
        data: base64Data
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Create a synthetic event
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      handleFileChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearFile = () => {
    setFileName(null);
    setFileSize(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed p-8 text-center transition-colors cursor-pointer
          ${error ? 'border-red-300 bg-red-50' : 'border-cad-border hover:border-cad-accent hover:bg-blue-50/50'}
        `}
      >
        <input
          type="file"
          accept=".msh,.vtk,.inp"
          onChange={handleFileChange}
          className="hidden"
          id="mesh-file-input"
          disabled={isLoading}
        />
        
        <label htmlFor="mesh-file-input" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            {isLoading ? (
              <>
                <svg className="animate-spin h-10 w-10 text-cad-accent" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-cad-text-dim">Processing file...</span>
              </>
            ) : fileName ? (
              <>
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-cad-text">{fileName}</p>
                  {fileSize && (
                    <p className="text-xs text-cad-text-dim">{formatFileSize(fileSize)}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-cad-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-cad-text">
                    Drop mesh file here or click to browse
                  </p>
                  <p className="text-xs text-cad-text-dim mt-1">
                    Supports .msh, .vtk, .inp (max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Clear Button */}
      {fileName && !isLoading && (
        <Button variant="outline" size="sm" onClick={clearFile}>
          Clear File
        </Button>
      )}

      {/* Format Info */}
      <div className="text-xs text-cad-text-dim bg-gray-50 p-3 border border-cad-border">
        <strong className="text-cad-text">Supported Formats:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li><strong>.msh</strong> - Gmsh mesh format</li>
          <li><strong>.vtk</strong> - VTK unstructured grid</li>
          <li><strong>.inp</strong> - Abaqus input file</li>
        </ul>
      </div>
    </div>
  );
}
