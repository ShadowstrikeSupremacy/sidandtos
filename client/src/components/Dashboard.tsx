import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface FileItem {
  id: number;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/files/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data.files);
    } catch (error) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: globalThis.File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/files/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('File uploaded successfully!');
      fetchFiles();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const downloadFile = async (fileId: number, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download file');
    }
  };

  const deleteFile = async (fileId: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/delete/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('File deleted successfully!');
      fetchFiles();
    } catch (error) {
      setError('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortFiles = (filesToSort: FileItem[]) => {
    return [...filesToSort].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.original_name.toLowerCase().localeCompare(b.original_name.toLowerCase());
      } else if (sortBy === 'date') {
        comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSortChange = (newSortBy: 'name' | 'date') => {
    if (sortBy === newSortBy) {
      // If clicking the same sort option, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different sort option, set it and default to ascending
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const sortedFiles = sortFiles(files);

  return (
    <div className="container">
      <div style={{ minHeight: '100vh', padding: '20px 0' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ color: 'white', marginBottom: '8px' }}>Welcome, {user?.username}!</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Manage your personal files</p>
          </div>
          <button onClick={logout} className="btn btn-secondary">
            Sign Out
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              onClick={() => setError('')} 
              style={{ 
                float: 'right', 
                background: 'none', 
                border: 'none', 
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
            <button 
              onClick={() => setSuccess('')} 
              style={{ 
                float: 'right', 
                background: 'none', 
                border: 'none', 
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div className="card">
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <h3 style={{ marginBottom: '8px', color: '#333' }}>
              {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '16px' }}>
              Maximum file size: 100MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {uploading && <div className="spinner" style={{ margin: '0 auto' }}></div>}
          </div>
        </div>

        {/* Files List */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h2 style={{ margin: 0, color: '#333' }}>Your Files</h2>
            
            {files.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#6c757d', fontSize: '14px' }}>Sort by:</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleSortChange('name')}
                    className={`btn ${sortBy === 'name' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Name
                    {sortBy === 'name' && (
                      <span style={{ fontSize: '10px' }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleSortChange('date')}
                    className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Date
                    {sortBy === 'date' && (
                      <span style={{ fontSize: '10px' }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p>No files uploaded yet. Upload your first file above!</p>
            </div>
          ) : (
            <div>
              {sortedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-name">{file.original_name}</div>
                    <div className="file-details">
                      {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      onClick={() => downloadFile(file.id, file.original_name)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
