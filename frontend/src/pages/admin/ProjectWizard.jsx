import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload, Cpu, X, FileText, CloudUpload, AlertTriangle, ArrowLeft, Rocket } from 'lucide-react';
import api from '../../api/client';
import AppShell from '../../components/AppShell';
import { useToast } from '../../components/Toast';

const LAYER_TYPES = [
  { id: 'ortho',    label: 'Orthomosaic', description: 'RGB Aerial Imagery (.tif)',                          ext: '.tif',                     required: true  },
  { id: 'dtm',      label: 'DTM',         description: 'Digital Terrain Model (.tif)',                       ext: '.tif',                     required: true  },
  { id: 'dsm',      label: 'DSM',         description: 'Digital Surface Model (.tif)',                       ext: '.tif',                     required: false },
  { id: 'boundary', label: 'Boundary',    description: 'Plantation Boundary (.shp + .shx + .dbf + .prj)',    ext: '.shp,.shx,.dbf,.prj',      required: true,  multiple: true },
  { id: 'trees',    label: 'Tree Inventory', description: 'Tree Height & Count (.shp + .shx + .dbf + .prj)', ext: '.shp,.shx,.dbf,.prj',   required: true,  multiple: true },
  { id: 'health',   label: 'Health Data', description: 'Plant Health Analysis (.shp + .shx + .dbf + .prj)', ext: '.shp,.shx,.dbf,.prj',      required: true,  multiple: true },
];

const INITIAL_UPLOAD = () =>
  Object.fromEntries(LAYER_TYPES.map((t) => [t.id, { files: [], progress: 0, status: 'pending' }]));

/* ── Step indicator ──────────────────────────────────────── */
function StepBar({ step }) {
  const steps = [
    { n: 1, label: 'Details' },
    { n: 2, label: 'Upload Data' },
    { n: 3, label: 'Processing' },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === s.n
              ? 'bg-primary/15 border border-primary/40 text-primary'
              : step > s.n
              ? 'text-secondary'
              : 'text-muted'
          }`}>
            {step > s.n
              ? <CheckCircle2 size={13} />
              : <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${step === s.n ? 'border-primary bg-primary/20' : 'border-muted'}`}>{s.n}</span>
            }
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 ${step > s.n ? 'bg-secondary/50' : 'bg-edge'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Upload layer card ───────────────────────────────────── */
function UploadCard({ layer, state, onSelectFiles, onUpload, onRemoveFile }) {
  const isCompleted  = state.status === 'completed';
  const isUploading  = state.status === 'uploading';
  const isError      = state.status === 'error';
  const hasMissing   = layer.multiple && state.files.length > 0 && (() => {
    const exts = state.files.map((f) => f.name.split('.').pop().toLowerCase());
    return ['dbf', 'shx', 'prj'].some((e) => !exts.includes(e));
  })();

  const borderCls = isCompleted
    ? 'border-secondary/30 bg-secondary/3'
    : isError
    ? 'border-danger/30 bg-danger/3'
    : isUploading
    ? 'border-primary/30'
    : 'border-edge';

  return (
    <div className={`bg-card border ${borderCls} rounded-2xl p-4 flex flex-col gap-3 transition-colors`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-snow text-sm font-semibold flex items-center gap-1.5">
            {layer.label}
            {layer.required && <span className="text-danger text-xs">*</span>}
          </h3>
          <p className="text-muted text-xs mt-0.5">{layer.description}</p>
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isCompleted ? 'bg-secondary/15' : 'bg-elevated'
        }`}>
          {isCompleted
            ? <CheckCircle2 size={14} className="text-secondary" />
            : <FileText size={14} className="text-muted" />
          }
        </div>
      </div>

      {/* File list or dropzone */}
      {state.files.length > 0 ? (
        <div className="space-y-1.5">
          {state.files.map((file) => (
            <div key={file.name} className="flex items-center gap-2 bg-elevated rounded-lg px-2.5 py-1.5">
              <FileText size={11} className="text-primary flex-shrink-0" />
              <span className="text-subtle text-xs truncate flex-1">{file.name}</span>
              {!isUploading && (
                <button onClick={() => onRemoveFile(layer.id, file.name)} className="text-muted hover:text-danger transition-colors flex-shrink-0">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {hasMissing && (
            <p className="text-warning text-[10px] flex items-center gap-1">
              <AlertTriangle size={10} />Missing shapefile components (.dbf / .shx / .prj)
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => onSelectFiles(layer.id)}
          className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-edge hover:border-primary/50 hover:bg-elevated/50 rounded-xl py-5 text-center transition-all group"
        >
          <Upload size={18} className="text-muted group-hover:text-primary transition-colors" />
          <span className="text-muted text-xs group-hover:text-subtle transition-colors">Click to select files</span>
          <span className="text-[10px] text-muted/60">{layer.ext}</span>
        </button>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div>
          <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="text-muted text-[10px] text-right mt-1">{state.progress}%</p>
        </div>
      )}

      {/* Action buttons */}
      {state.files.length > 0 && !isUploading && (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onSelectFiles(layer.id)}
            className="flex-1 py-1.5 rounded-lg border border-edge text-subtle hover:text-snow text-xs transition-colors"
          >
            {isCompleted ? 'Change Files' : 'Add More'}
          </button>
          {!isCompleted && (
            <button
              onClick={() => onUpload(layer.id)}
              className="flex-1 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 text-xs font-semibold transition-colors"
            >
              Upload
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        id={`file-${layer.id}`}
        multiple={layer.multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = '';
          if (files.length) onSelectFiles(layer.id, files);
        }}
      />
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function ProjectWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', location: '', description: '', client_id: '' });
  const [projectId, setProjectId] = useState(null);
  const [uploadStates, setUploadStates] = useState(INITIAL_UPLOAD());
  const [processingStatus, setProcessingStatus] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/users/clients').then((r) => setClients(r.data)).catch(console.error);
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/projects', formData);
      setProjectId(res.data.id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type, newFiles) => {
    const fileArray = newFiles || [];
    setUploadStates((prev) => {
      const layer = LAYER_TYPES.find((t) => t.id === type);
      const existing = prev[type].files;
      const merged = layer?.multiple ? [...existing, ...fileArray] : fileArray;
      const unique = merged.filter((f, i, s) => i === s.findIndex((x) => x.name === f.name));
      return { ...prev, [type]: { ...prev[type], files: unique, status: 'pending', progress: 0 } };
    });
    // trigger native file picker if no files passed
    if (!newFiles) document.getElementById(`file-${type}`)?.click();
  };

  const handleRemoveFile = async (type, fileName) => {
    const isUploaded = uploadStates[type].status === 'completed';
    if (isUploaded) {
      try { await api.delete(`/projects/${projectId}/upload/${type}/${fileName}`); }
      catch { toast.error(`Failed to remove ${fileName} from server.`); return; }
    }
    setUploadStates((prev) => {
      const remaining = prev[type].files.filter((f) => f.name !== fileName);
      return { ...prev, [type]: { ...prev[type], files: remaining, status: remaining.length === 0 ? 'pending' : (isUploaded ? 'pending' : prev[type].status) } };
    });
  };

  const uploadLayer = async (type) => {
    const state = uploadStates[type];
    if (!state.files.length || state.status === 'completed' || state.status === 'uploading') return;
    setUploadStates((p) => ({ ...p, [type]: { ...p[type], status: 'uploading', progress: 0 } }));
    const fd = new FormData();
    state.files.forEach((f) => fd.append('files', f));
    try {
      await api.post(`/projects/${projectId}/upload/${type}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setUploadStates((p) => ({ ...p, [type]: { ...p[type], progress: pct } }));
        },
      });
      setUploadStates((p) => ({ ...p, [type]: { ...p[type], status: 'completed', progress: 100 } }));
      toast.success(`${type.toUpperCase()} layer uploaded.`);
    } catch (err) {
      setUploadStates((p) => ({ ...p, [type]: { ...p[type], status: 'error' } }));
      toast.error(`Upload failed for ${type}.`);
    }
  };

  const uploadAllPending = async () => {
    const pending = LAYER_TYPES.filter((t) => uploadStates[t.id].files.length > 0 && uploadStates[t.id].status === 'pending');
    for (const layer of pending) await uploadLayer(layer.id);
  };

  const triggerProcessing = async () => {
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/process`);
      setStep(3);
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/projects/${projectId}/status`);
          setProcessingStatus(res.data.status);
          if (res.data.status === 'ready' || res.data.status === 'error') {
            clearInterval(interval);
            setLoading(false);
            if (res.data.status === 'ready') toast.success('Project processed and ready!');
            else toast.error('Processing failed. Check your shapefiles.');
          }
        } catch { console.error('Polling failed'); }
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start processing');
      setLoading(false);
    }
  };

  const canProcess = LAYER_TYPES.every((t) => !t.required || uploadStates[t.id].status === 'completed');
  const hasPendingFiles = LAYER_TYPES.some((t) => uploadStates[t.id].files.length > 0 && uploadStates[t.id].status === 'pending');

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-snow text-2xl font-bold">{step === 2 ? `Draft: ${formData.name}` : 'Create New Project'}</h1>
            <div className="mt-2"><StepBar step={step} /></div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-edge text-subtle hover:text-snow text-sm transition-colors flex-shrink-0"
          >
            <ArrowLeft size={14} />Cancel
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm">
            <AlertTriangle size={14} className="flex-shrink-0" />{error}
          </div>
        )}

        {/* ── Step 1: Details ──────────────────── */}
        {step === 1 && (
          <div className="bg-card border border-edge rounded-2xl p-6 max-w-lg mx-auto">
            <form onSubmit={handleCreateProject} className="space-y-4">
              {[
                { label: 'Project Name', key: 'name', placeholder: 'e.g. Pine Plantation Block A', required: true },
                { label: 'Location', key: 'location', placeholder: 'e.g. North Ridge, Oregon' },
              ].map(({ label, key, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-subtle text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={placeholder}
                    required={required}
                    className="input-base px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              ))}

              <div>
                <label className="block text-subtle text-xs font-semibold uppercase tracking-wider mb-1.5">Assigned Client</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                  className="input-base px-3.5 py-2.5 rounded-xl appearance-none cursor-pointer"
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-subtle text-xs font-semibold uppercase tracking-wider mb-1.5">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="input-base px-3.5 py-2.5 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-navy text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />Creating…</>
                    : <>Next: Upload Data →</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 2: Upload ───────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* top action bar */}
            <div className="flex items-center justify-between">
              <p className="text-muted text-sm">Upload files for each required layer, then process.</p>
              <button
                onClick={uploadAllPending}
                disabled={!hasPendingFiles}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-edge text-subtle hover:text-snow disabled:opacity-40 text-sm transition-colors"
              >
                <CloudUpload size={14} />Upload All Pending
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LAYER_TYPES.map((layer) => (
                <UploadCard
                  key={layer.id}
                  layer={layer}
                  state={uploadStates[layer.id]}
                  onSelectFiles={(type, files) => files ? handleFileSelect(type, files) : document.getElementById(`file-${type}`)?.click()}
                  onUpload={uploadLayer}
                  onRemoveFile={handleRemoveFile}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-edge">
              <div>
                <p className="text-muted text-xs">Formats: GeoTIFF (.tif) for rasters · Shapefiles (.shp/.shx/.dbf/.prj) for vectors</p>
                {!canProcess && (
                  <p className="text-warning text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} />
                    Missing required: {LAYER_TYPES.filter((t) => t.required && uploadStates[t.id].status !== 'completed').map((t) => t.label).join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={triggerProcessing}
                disabled={!canProcess || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-navy text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
              >
                <Rocket size={15} />{loading ? 'Starting…' : 'Process Project'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Processing ───────────────── */}
        {step === 3 && (
          <div className="bg-card border border-edge rounded-2xl p-12 text-center space-y-5 max-w-lg mx-auto">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              processingStatus === 'ready'  ? 'bg-secondary/15'
              : processingStatus === 'error' ? 'bg-danger/15' : 'bg-primary/15'
            }`}>
              {processingStatus === 'ready'
                ? <CheckCircle2 size={32} className="text-secondary" />
                : processingStatus === 'error'
                ? <X size={32} className="text-danger" />
                : <Cpu size={32} className="text-primary animate-pulse" />
              }
            </div>

            <div>
              <h2 className="text-snow text-xl font-bold mb-2">
                {processingStatus === 'ready' ? 'Project Ready!' : processingStatus === 'error' ? 'Processing Failed' : 'Processing GIS Data…'}
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {processingStatus === 'ready'
                  ? 'Tiles generated and health analysis complete. The project is now available to clients.'
                  : processingStatus === 'error'
                  ? 'An error occurred during GIS processing. Verify your shapefiles contain the required columns.'
                  : 'Generating XYZ map tiles and running spatial health analysis. This may take several minutes for large datasets.'}
              </p>
            </div>

            {!processingStatus || processingStatus === 'processing' ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-edge border-t-primary rounded-full animate-spin" />
              </div>
            ) : null}

            <button
              onClick={() => navigate('/admin')}
              disabled={processingStatus !== 'ready' && processingStatus !== 'error'}
              className="px-6 py-2.5 rounded-xl bg-primary text-navy font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}