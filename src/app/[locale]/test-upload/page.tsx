'use client';

import { useState } from 'react';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('Mi CV Profesional');
  const [userId, setUserId] = useState('temp-user');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('userId', userId);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      const endTime = Date.now();
      setDuration((endTime - startTime) / 1000);

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🚀 Test de Upload de CV
        </h1>
        <p className="mb-6 text-gray-600">
          Prueba manual del endpoint de carga de CV
        </p>

        <div className="mb-6 rounded border-l-4 border-blue-500 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ Información:</strong> Este formulario probará el endpoint{' '}
            <code className="rounded bg-blue-100 px-2 py-1">
              /api/cv/upload
            </code>{' '}
            con tu archivo PDF. El proceso puede tomar 10-30 segundos debido al
            parsing con IA.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Título del CV
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition focus:border-purple-500 focus:outline-none"
              placeholder="Ej: Mi CV Profesional 2026"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              User ID (temporal)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition focus:border-purple-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              💡 Usa &quot;temp-user&quot; para pruebas (se crea
              automáticamente)
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Archivo CV (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition focus:border-purple-500 focus:outline-none"
              required
            />
            {file && (
              <p className="mt-1 text-sm text-gray-600">
                📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full transform rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 py-4 font-semibold text-white transition hover:scale-[1.02] hover:from-purple-700 hover:to-purple-800 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '⏳ Procesando...' : '📤 Subir y Procesar CV'}
          </button>
        </form>

        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-600">
              ⏳ Procesando CV... Esto puede tomar 10-30 segundos
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border-2 border-red-500 bg-red-50 p-6">
            <h3 className="mb-2 font-bold text-red-900">❌ Error</h3>
            <pre className="whitespace-pre-wrap text-sm text-red-800">
              {error}
            </pre>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-lg border-2 border-green-500 bg-green-50 p-6">
            <h3 className="mb-2 font-bold text-green-900">
              ✅ CV procesado exitosamente en {duration.toFixed(2)}s
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>
                <strong>ID del CV:</strong> {result.baseCV.id}
              </p>
              <p>
                <strong>Título:</strong> {result.baseCV.title}
              </p>

              <div className="mt-4">
                <strong>📝 Información Personal:</strong>
                <ul className="ml-4 mt-1">
                  <li>Nombre: {result.baseCV.personalInfo.name}</li>
                  <li>Email: {result.baseCV.personalInfo.email}</li>
                  {result.baseCV.personalInfo.phone && (
                    <li>Teléfono: {result.baseCV.personalInfo.phone}</li>
                  )}
                  {result.baseCV.personalInfo.location && (
                    <li>Ubicación: {result.baseCV.personalInfo.location}</li>
                  )}
                </ul>
              </div>

              <div className="mt-4">
                <strong>📊 Estadísticas:</strong>
                <ul className="ml-4 mt-1">
                  <li>💼 Experiencias: {result.baseCV.experience.length}</li>
                  <li>🎓 Educación: {result.baseCV.education.length}</li>
                  <li>
                    🛠️ Categorías de habilidades: {result.baseCV.skills.length}
                  </li>
                  {result.baseCV.projects && (
                    <li>🚀 Proyectos: {result.baseCV.projects.length}</li>
                  )}
                </ul>
              </div>

              {result.baseCV.summary && (
                <div className="mt-4">
                  <strong>📄 Resumen:</strong>
                  <p className="mt-1 text-gray-700">
                    {result.baseCV.summary.substring(0, 200)}...
                  </p>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer font-semibold hover:text-green-700">
                  Ver JSON completo
                </summary>
                <pre className="mt-2 max-h-96 overflow-auto rounded bg-green-100 p-4 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
