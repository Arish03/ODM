import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, X, Eye, EyeOff, Users } from 'lucide-react';
import api from '../../api/client';
import AppShell from '../../components/AppShell';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

/* ── Reusable helpers ─────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-subtle text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, required, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="input-base px-3.5 py-2.5 rounded-xl"
    />
  );
}

function PasswordInput({ value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-base px-3.5 pr-10 py-2.5 rounded-xl"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-snow transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

/* ── Glass Modal ─────────────────────────────────────────── */
function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,46,22,0.25)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-2xl relative`}
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(34,197,94,0.22)',
          boxShadow: '0 24px 64px rgba(34,197,94,0.15), 0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
             style={{ background: 'linear-gradient(90deg, #22c55e, #86efac, transparent)' }} />
        <div className="flex items-center justify-between px-6 py-4"
             style={{ borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
          <h2 className="text-snow font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-snow transition-colors p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminClients() {
  const [clients, setClients]       = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '', role: 'client' });
  const [formError, setFormError] = useState('');
  const toast = useToast();

  const fetchClients  = async () => { try { const r = await api.get('/users/clients');  setClients(r.data); } catch (e) { console.error(e); } };
  const fetchProjects = async () => { try { const r = await api.get('/projects'); setAllProjects(r.data.projects); } catch (e) { console.error(e); } };

  useEffect(() => {
    Promise.all([fetchClients(), fetchProjects()]).finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setFormData({ username: '', password: '', full_name: '', role: 'client' }); setFormError(''); };

  const handleAddClient = async (e) => {
    e.preventDefault(); setFormError('');
    try { await api.post('/users', formData); setShowAddModal(false); resetForm(); fetchClients(); toast.success('Client account created.'); }
    catch (err) { setFormError(err.response?.data?.detail || 'Failed to add client'); }
  };

  const handleEditOpen = (client) => {
    setEditingClient(client);
    setFormData({ username: client.username, password: '', full_name: client.full_name, role: client.role });
    setFormError(''); setShowEditModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault(); setFormError('');
    try {
      const data = { ...formData }; if (!data.password) delete data.password;
      await api.put(`/users/${editingClient.id}`, data); setShowEditModal(false); fetchClients(); toast.success('Client updated.');
    } catch (err) { setFormError(err.response?.data?.detail || 'Failed to update'); }
  };

  const handleDeleteClient = (client) => {
    setConfirmModal({
      show: true, title: 'Delete Client', type: 'danger',
      message: `Delete "${client.full_name}"? All project assignments will be removed.`,
      confirmLabel: 'Delete', cancelLabel: 'Cancel',
      onConfirm: async () => {
        setConfirmModal({ show: false });
        try { await api.delete(`/users/${client.id}`); fetchClients(); fetchProjects(); toast.success('Client deleted.'); }
        catch { toast.error('Failed to delete client.'); }
      },
      onCancel: () => setConfirmModal({ show: false }),
    });
  };

  const toggleProjectAssignment = async (projectId, clientId) => {
    try {
      await api.put(`/projects/${projectId}`, { client_id: clientId }); fetchProjects(); fetchClients();
      toast.success(clientId ? 'Project assigned.' : 'Project unassigned.');
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === 'string' ? d : 'Assignment failed.');
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-snow text-2xl sm:text-3xl font-black mb-1 leading-tight">Client Hub</h1>
            <p className="text-muted text-xs sm:text-sm font-medium">Manage project access and client credentials.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 20px rgba(34,197,94,0.30)' }}
          >
            <UserPlus size={18} /> Add New Client
          </button>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2.5">
          <Users size={15} className="text-primary" />
          <h2 className="text-snow font-bold text-sm">All Clients</h2>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#16a34a' }}>
            {clients.length} accounts
          </span>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl h-44 animate-pulse"
                   style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(34,197,94,0.15)' }} />
            ))
          ) : clients.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl text-muted text-sm"
                 style={{ border: '2px dashed rgba(34,197,94,0.22)', background: 'rgba(34,197,94,0.03)' }}>
              No clients found.
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className="group relative rounded-2xl p-6 flex flex-col cursor-pointer transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(34,197,94,0.18)',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.07)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.40)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.18)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => handleEditOpen(client)}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                     style={{ background: 'linear-gradient(90deg, #22c55e, transparent)' }} />

                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.20), rgba(22,163,74,0.15))', border: '1px solid rgba(34,197,94,0.30)', color: '#16a34a' }}
                  >
                    {client.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-snow font-bold text-base truncate pr-8">{client.full_name}</h3>
                    <p className="text-muted text-xs font-mono truncate">{client.username}</p>
                    <p className="text-muted text-[10px] mt-1">Joined {new Date(client.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between"
                     style={{ borderTop: '1px solid rgba(34,197,94,0.12)' }}>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                    style={
                      client.project_count > 0
                        ? { background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)', color: '#15803d' }
                        : { background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.20)', color: '#6b7280' }
                    }
                  >
                    {client.project_count} {client.project_count === 1 ? 'project' : 'projects'}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteClient(client); }}
                    className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.10)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-muted hover:text-snow"
                    onClick={(e) => { e.stopPropagation(); handleEditOpen(client); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.10)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <Modal title="Add New Client" onClose={() => { setShowAddModal(false); resetForm(); }}>
          <form onSubmit={handleAddClient} className="space-y-4">
            {formError && (
              <p className="text-danger text-sm px-3.5 py-2.5 rounded-xl"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                {formError}
              </p>
            )}
            <Field label="Full Name"><TextInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. John Doe" required /></Field>
            <Field label="Username"><TextInput value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="johndoe123" required /></Field>
            <Field label="Password"><PasswordInput value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min. 6 characters" required /></Field>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-snow transition-colors"
                style={{ border: '1px solid rgba(34,197,94,0.20)' }}>
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 rounded-xl text-white text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.30)' }}>
                Create Account
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <Modal title={`Edit — ${editingClient.full_name}`} onClose={() => setShowEditModal(false)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile form */}
            <div>
              <h3 className="text-snow font-bold text-sm mb-4">Account Details</h3>
              <form onSubmit={handleUpdateClient} className="space-y-4">
                {formError && (
                  <p className="text-danger text-sm px-3.5 py-2.5 rounded-xl"
                     style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                    {formError}
                  </p>
                )}
                <Field label="Full Name"><TextInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required /></Field>
                <Field label="Username"><TextInput value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></Field>
                <Field label="New Password (blank = keep current)"><PasswordInput value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current" /></Field>
                <button type="submit"
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.30)' }}>
                  Save Changes
                </button>
              </form>
            </div>

            {/* Project assignment */}
            <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6"
                 style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
              <h3 className="text-snow font-bold text-sm mb-4">Project Assignments</h3>

              <div className="mb-4">
                <p className="text-muted text-xs uppercase tracking-wider mb-2 font-bold">Currently Assigned</p>
                {allProjects.filter((p) => p.client_id === editingClient.id).length === 0 ? (
                  <p className="text-muted text-sm italic">No projects assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {allProjects.filter((p) => p.client_id === editingClient.id).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                           style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <span className="text-snow text-sm truncate mr-2">{p.name}</span>
                        <button
                          onClick={() => toggleProjectAssignment(p.id, null)}
                          className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                          style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.20)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-2 font-bold">Assign Project</p>
                {allProjects.filter((p) => p.client_id !== editingClient.id).length === 0 ? (
                  <p className="text-muted text-sm italic">No other projects available.</p>
                ) : (
                  <div className="space-y-1.5">
                    {allProjects.filter((p) => p.client_id !== editingClient.id).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleProjectAssignment(p.id, editingClient.id)}
                        className="flex items-center justify-between w-full rounded-xl px-3.5 py-2.5 text-left transition-all group"
                        style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.10)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.30)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.04)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)'; }}
                      >
                        <span className="text-snow text-sm truncate mr-2">{p.name}</span>
                        <span className="flex-shrink-0 text-xs font-bold text-primary">+ Assign</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal {...confirmModal} />
    </AppShell>
  );
}