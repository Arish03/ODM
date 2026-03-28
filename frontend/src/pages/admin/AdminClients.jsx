import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, X, Eye, EyeOff, Users } from 'lucide-react';
import api from '../../api/client';
import AppShell from '../../components/AppShell';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

/* ── Reusable input/label helpers ────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-subtle text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
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

/* ── Modal shell ─────────────────────────────────────────── */
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-card border border-edge rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <h2 className="text-snow font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-snow transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '', role: 'client' });
  const [formError, setFormError] = useState('');
  const toast = useToast();

  const fetchClients = async () => {
    try { const r = await api.get('/users/clients'); setClients(r.data); }
    catch (e) { console.error(e); }
  };

  const fetchProjects = async () => {
    try { const r = await api.get('/projects'); setAllProjects(r.data.projects); }
    catch (e) { console.error(e); }
  };

  useEffect(() => {
    Promise.all([fetchClients(), fetchProjects()]).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setFormData({ username: '', password: '', full_name: '', role: 'client' });
    setFormError('');
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/users', formData);
      setShowAddModal(false);
      resetForm();
      fetchClients();
      toast.success('Client account created successfully.');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add client');
    }
  };

  const handleEditOpen = (client) => {
    setEditingClient(client);
    setFormData({ username: client.username, password: '', full_name: client.full_name, role: client.role });
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const data = { ...formData };
      if (!data.password) delete data.password;
      await api.put(`/users/${editingClient.id}`, data);
      setShowEditModal(false);
      fetchClients();
      toast.success('Client profile updated successfully.');
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update client');
    }
  };

  const handleDeleteClient = (client) => {
    setConfirmModal({
      show: true,
      title: 'Delete Client',
      message: `Delete "${client.full_name}"? All their project assignments will be removed.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ show: false });
        try {
          await api.delete(`/users/${client.id}`);
          fetchClients(); fetchProjects();
          toast.success(`Client "${client.full_name}" deleted.`);
        } catch {
          toast.error('Failed to delete client.');
        }
      },
      onCancel: () => setConfirmModal({ show: false }),
    });
  };

  const toggleProjectAssignment = async (projectId, clientId) => {
    try {
      await api.put(`/projects/${projectId}`, { client_id: clientId });
      fetchProjects(); fetchClients();
      toast.success(clientId ? 'Project assigned.' : 'Project unassigned.');
    } catch (err) {
      const d = err.response?.data?.detail;
      toast.error(typeof d === 'string' ? d : 'Assignment failed.');
    }
  };

  const SkeletonRow = () => (
    <tr className="border-b border-edge/50">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-elevated rounded-full animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-snow text-2xl font-bold mb-0.5">Client Management</h1>
            <p className="text-muted text-sm">Create and manage client accounts and project access.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-navy text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex-shrink-0"
          >
            <UserPlus size={15} /> Add Client
          </button>
        </div>

        {/* Table */}
        <div className="bg-card border border-edge rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-edge">
            <Users size={15} className="text-primary" />
            <h2 className="text-snow font-semibold text-sm">Client List</h2>
            <span className="ml-auto text-muted text-xs">{clients.length} clients</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge bg-elevated/40">
                  {['Full Name', 'Username', 'Projects', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
                ) : clients.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-muted text-sm">No clients found.</td></tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="border-b border-edge/50 hover:bg-elevated/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-snow">{client.full_name}</td>
                      <td className="px-4 py-3.5 text-subtle font-mono text-xs">{client.username}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          client.project_count > 0
                            ? 'bg-secondary/10 text-secondary border-secondary/20'
                            : 'bg-elevated text-muted border-edge'
                        }`}>
                          {client.project_count} {client.project_count === 1 ? 'project' : 'projects'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted text-xs">{new Date(client.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditOpen(client)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-edge text-subtle hover:text-snow hover:border-subtle text-xs transition-colors"
                          >
                            <Pencil size={11} />Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-edge text-danger/70 hover:text-danger hover:border-danger/40 hover:bg-danger/5 text-xs transition-colors"
                          >
                            <Trash2 size={11} />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <Modal title="Add New Client" onClose={() => { setShowAddModal(false); resetForm(); }}>
          <form onSubmit={handleAddClient} className="space-y-4">
            {formError && <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-2.5">{formError}</p>}
            <Field label="Full Name">
              <TextInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. John Doe" required />
            </Field>
            <Field label="Username">
              <TextInput value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="johndoe123" required />
            </Field>
            <Field label="Password">
              <PasswordInput value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min. 6 characters" required />
            </Field>
            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-4 py-2 rounded-xl border border-edge text-subtle hover:text-snow text-sm transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-navy text-sm font-semibold hover:bg-primary/90 transition-colors">Create Account</button>
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
              <h3 className="text-snow font-semibold text-sm mb-4">Account Details</h3>
              <form onSubmit={handleUpdateClient} className="space-y-4">
                {formError && <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-3.5 py-2.5">{formError}</p>}
                <Field label="Full Name">
                  <TextInput value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </Field>
                <Field label="Username">
                  <TextInput value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                </Field>
                <Field label="New Password (blank = keep current)">
                  <PasswordInput value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current" />
                </Field>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-navy text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Save Changes
                </button>
              </form>
            </div>

            {/* Project assignment */}
            <div className="border-t md:border-t-0 md:border-l border-edge pt-6 md:pt-0 md:pl-6">
              <h3 className="text-snow font-semibold text-sm mb-4">Project Assignments</h3>

              {/* Assigned */}
              <div className="mb-4">
                <p className="text-muted text-xs uppercase tracking-wider mb-2 font-semibold">Currently Assigned</p>
                {allProjects.filter((p) => p.client_id === editingClient.id).length === 0 ? (
                  <p className="text-muted text-sm italic">No projects assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {allProjects.filter((p) => p.client_id === editingClient.id).map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-elevated rounded-xl px-3.5 py-2.5">
                        <span className="text-snow text-sm truncate mr-2">{p.name}</span>
                        <button
                          onClick={() => toggleProjectAssignment(p.id, null)}
                          className="flex-shrink-0 text-xs text-danger/70 hover:text-danger border border-danger/20 hover:border-danger/40 hover:bg-danger/5 px-2 py-1 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign new */}
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-2 font-semibold">Assign Project</p>
                {allProjects.filter((p) => p.client_id !== editingClient.id).length === 0 ? (
                  <p className="text-muted text-sm italic">No other projects available.</p>
                ) : (
                  <div className="space-y-1.5">
                    {allProjects.filter((p) => p.client_id !== editingClient.id).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleProjectAssignment(p.id, editingClient.id)}
                        className="flex items-center justify-between w-full bg-elevated hover:bg-elevated/80 border border-edge hover:border-primary/30 rounded-xl px-3.5 py-2.5 text-left transition-all group"
                      >
                        <span className="text-subtle group-hover:text-snow text-sm truncate mr-2">{p.name}</span>
                        <span className="flex-shrink-0 text-xs text-primary/60 group-hover:text-primary transition-colors">+ Assign</span>
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