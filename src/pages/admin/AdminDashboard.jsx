import { useState, useEffect } from "react";
import {
  FiPrinter, FiLogOut, FiLayout, FiBox, FiMail, FiUsers,
  FiEdit2, FiTrash2, FiPlus, FiSave, FiX, FiSend, FiCheck,
  FiAlertCircle, FiUser,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CloudinaryUpload from "../../components/CloudinaryUpload";

// ─── helpers ────────────────────────────────────────────────────────────────
function useAdminFetch(url, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setData(json.data ?? json);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, [url]);
  return { data, loading, reload };
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`admin-toast ${type}`}>
      {type === "success" ? <FiCheck /> : <FiAlertCircle />} {msg}
    </div>
  );
}

// ─── BANNER TAB (up to 4 banners) ────────────────────────────────────────────
function BannerTab({ token, toast }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, {} = edit form
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const d = await res.json();
      setBanners(d.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const EMPTY_BANNER = {
    badge: "", title: "", highlight: "", description: "",
    btn1_text: "Shop Now", btn1_link: "#products",
    btn2_text: "Our Services", btn2_link: "#",
    image_url: "",
    stat1_number: "10K+", stat1_label: "Happy Clients",
    stat2_number: "50+", stat2_label: "Products",
    stat3_number: "24hr", stat3_label: "Delivery",
  };

  const set = (k, v) => setEditing((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/banners" : `/api/admin/banners/${editing.id}`;
    try {
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editing),
      });
      const d = await res.json();
      if (d.success) { toast(isNew ? "Banner created!" : "Banner saved!", "success"); setEditing(null); loadBanners(); }
      else toast(d.message, "error");
    } catch { toast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.success) { toast("Banner deleted.", "success"); loadBanners(); }
    else toast(d.message, "error");
  };

  const F = ({ label, k, placeholder, textarea }) => (
    <div className="admin-field">
      <label>{label}</label>
      {textarea
        ? <textarea rows={3} value={editing[k] || ""} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
        : <input value={editing[k] || ""} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />}
    </div>
  );

  if (editing !== null) {
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2><FiLayout /> {editing.id ? "Edit Banner" : "Add Banner"}</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline-dark" onClick={() => setEditing(null)}><FiX /> Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}><FiSave /> {saving ? "Saving…" : "Save"}</button>
          </div>
        </div>

        <div className="admin-section-card">
          <h3>Banner Image</h3>
          <CloudinaryUpload
            currentUrl={editing.image_url}
            onUpload={(url) => set("image_url", url)}
            label="Banner Image"
            token={token}
          />
          <div className="admin-field" style={{ marginTop: 10 }}>
            <label>Or paste an image URL</label>
            <input value={editing.image_url || ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" />
          </div>
        </div>

        <div className="admin-section-card">
          <h3>Content</h3>
          <div className="admin-grid-2">
            <F label="Badge Text" k="badge" placeholder="🖨️ #1 Online Print Shop" />
            <F label="Title" k="title" placeholder="Your Ideas," />
            <F label="Highlighted Text" k="highlight" placeholder="Perfectly Printed." />
            <F label="Button 1 Text" k="btn1_text" placeholder="Shop Now" />
            <F label="Button 1 Link" k="btn1_link" placeholder="#products" />
            <F label="Button 2 Text" k="btn2_text" placeholder="Our Services" />
            <F label="Button 2 Link" k="btn2_link" placeholder="#" />
          </div>
          <F label="Description" k="description" placeholder="Tagline…" textarea />
        </div>

        <div className="admin-section-card">
          <h3>Stats Bar</h3>
          <div className="admin-grid-3">
            <F label="Stat 1 Number" k="stat1_number" placeholder="10K+" />
            <F label="Stat 1 Label" k="stat1_label" placeholder="Happy Clients" />
            <div />
            <F label="Stat 2 Number" k="stat2_number" placeholder="50+" />
            <F label="Stat 2 Label" k="stat2_label" placeholder="Products" />
            <div />
            <F label="Stat 3 Number" k="stat3_number" placeholder="24hr" />
            <F label="Stat 3 Label" k="stat3_label" placeholder="Delivery" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <h2><FiLayout /> Banners ({banners.length}/4)</h2>
        {banners.length < 4 && (
          <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_BANNER })}>
            <FiPlus /> Add Banner
          </button>
        )}
      </div>

      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="banner-slots-grid">
          {banners.map((b, i) => (
            <div key={b.id} className="banner-slot-card">
              <div className="banner-slot-img">
                {b.image_url
                  ? <img src={b.image_url} alt={`Banner ${i + 1}`} />
                  : <div className="banner-slot-placeholder"><FiLayout /></div>
                }
                <span className="banner-slot-badge">Banner {b.sort_order}</span>
              </div>
              <div className="banner-slot-body">
                <h4>{b.title || "Untitled"} <em>{b.highlight}</em></h4>
                <p>{b.description?.substring(0, 80) || "No description"}…</p>
                <div className="admin-action-btns">
                  <button className="icon-act edit" onClick={() => setEditing({ ...b })}><FiEdit2 /></button>
                  <button className="icon-act del" onClick={() => del(b.id)}><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 4 - banners.length }, (_, i) => (
            <div key={`empty-${i}`} className="banner-slot-card empty" onClick={() => setEditing({ ...EMPTY_BANNER })}>
              <div className="banner-slot-empty-body">
                <FiPlus className="slot-plus" />
                <span>Add Banner {banners.length + i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRODUCTS TAB ────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: "", description: "", price: "", image: "", category: "", rating: "", inStock: true,
  sku: "", lowerQty: "", lowerTotalCost: "", lowerUnitPrice: "",
  higherQty: "", higherTotalCost: "", higherUnitPrice: "", deliveryDays: "3",
  colors: "", colorEnabled: true, colorMode: "single",
};

function ProductsTab({ token, toast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, {} = form
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const d = await res.json();
    setProducts(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
    try {
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editing),
      });
      const d = await res.json();
      if (d.success) { toast(isNew ? "Product added!" : "Product updated!", "success"); setEditing(null); load(); }
      else toast(d.message, "error");
    } catch { toast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) { toast("Product deleted.", "success"); load(); }
      else toast(d.message, "error");
    } catch { toast("Delete failed", "error"); }
    finally { setDeleting(null); }
  };

  const F = ({ label, k, type = "text", textarea }) => (
    <div className="admin-field">
      <label>{label}</label>
      {textarea
        ? <textarea rows={3} value={editing[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
        : <input type={type} value={editing[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />}
    </div>
  );

  if (editing !== null) {
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2><FiBox /> {editing.id ? "Edit Product" : "Add Product"}</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline-dark" onClick={() => setEditing(null)}><FiX /> Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}><FiSave /> {saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
        <div className="admin-section-card">
          <div className="admin-section-card">
            <div className="admin-grid-2">
              <F label="Product Name *" k="name" />
              <F label="Category" k="category" />
              <F label="Price ($) *" k="price" type="number" />
              <F label="Rating (0–5)" k="rating" type="number" />
              <div className="admin-field">
                <label>In Stock</label>
                <select value={editing.inStock ? "true" : "false"} onChange={(e) => setEditing({ ...editing, inStock: e.target.value === "true" })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <F label="Description" k="description" textarea />
            <div className="admin-field" style={{ marginTop: 12 }}>
              <label>Colors <small style={{ color: "#9ca3af" }}>(comma-separated, e.g. Red, Blue, Black)</small></label>
              <input value={editing.colors || ""} onChange={(e) => setEditing({ ...editing, colors: e.target.value })} placeholder="Red, Blue, Green, Black" />
            </div>
            <div className="admin-grid-2" style={{ marginTop: 12 }}>
              <div className="admin-field">
                <label>Enable Color Selection</label>
                <select value={editing.colorEnabled !== false ? "true" : "false"} onChange={(e) => setEditing({ ...editing, colorEnabled: e.target.value === "true" })}>
                  <option value="true">Yes — show color swatches</option>
                  <option value="false">No — hide colors section</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Color Selection Mode</label>
                <select value={editing.colorMode || "single"} onChange={(e) => setEditing({ ...editing, colorMode: e.target.value })}>
                  <option value="single">Single — pick one color</option>
                  <option value="multi">Multi — pick multiple colors</option>
                </select>
              </div>
            </div>
            <div className="admin-section-divider">Product Image</div>
            <CloudinaryUpload
              currentUrl={editing.image}
              onUpload={(url) => setEditing({ ...editing, image: url })}
              label="Product Image"
              token={token}
            />
            <div className="admin-field" style={{ marginTop: 8 }}>
              <label>Or paste image URL</label>
              <input value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://…" />
            </div>
            <hr style={{ margin: "18px 0", borderColor: "#e5e7eb" }} />
            <p style={{ fontWeight: 600, marginBottom: 10, color: "#374151" }}>Pricing Tiers &amp; SKU</p>
            <div className="admin-grid-2">
              <F label="SKU" k="sku" />
              <F label="Delivery Days" k="deliveryDays" type="number" />
            </div>
            <div className="admin-grid-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <F label="Lower Qty" k="lowerQty" type="number" />
              <F label="Lower Total ($)" k="lowerTotalCost" type="number" />
              <F label="Lower Unit Price ($)" k="lowerUnitPrice" type="number" />
            </div>
            <div className="admin-grid-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <F label="Higher Qty" k="higherQty" type="number" />
              <F label="Higher Total ($)" k="higherTotalCost" type="number" />
              <F label="Higher Unit Price ($)" k="higherUnitPrice" type="number" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <h2><FiBox /> Products</h2>
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY_PRODUCT })}>
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <div className="admin-products-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><img src={p.image} alt={p.name} className="admin-table-img" /></td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price}</td>
                  <td>{p.rating}</td>
                  <td><span className={`admin-badge ${p.inStock ? "in" : "out"}`}>{p.inStock ? "In Stock" : "Out"}</span></td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="icon-act edit" onClick={() => setEditing({ ...p })}><FiEdit2 /></button>
                      <button className="icon-act del" onClick={() => del(p.id)} disabled={deleting === p.id}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── EMAIL TAB ───────────────────────────────────────────────────────────────
function EmailTab({ token, toast }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [subCount, setSubCount] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [showSubs, setShowSubs] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [addingStatus, setAddingStatus] = useState("");

  const loadSubscribers = async () => {
    const res = await fetch("/api/admin/subscribers", { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setSubscribers(d.data || []);
    setSubCount(d.count || 0);
  };

  useEffect(() => { loadSubscribers(); }, []);

  const addSubscriber = async () => {
    if (!newSub) return;
    setAddingStatus("Adding...");
    try {
      const res = await fetch("/api/admin/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newSub }),
      });
      const d = await res.json();
      if (d.success) { setAddingStatus("Added!"); setNewSub(""); loadSubscribers(); }
      else setAddingStatus(d.message);
    } catch { setAddingStatus("Failed"); }
    setTimeout(() => setAddingStatus(""), 2500);
  };

  const sendEmail = async (testMode) => {
    if (!subject.trim() || !body.trim()) { toast("Subject and body required", "error"); return; }
    if (testMode && !testEmail.trim()) { toast("Enter test email", "error"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, html: body.replace(/\n/g, "<br/>"), testEmail: testMode ? testEmail : null }),
      });
      const d = await res.json();
      if (d.success) toast(d.message, "success");
      else toast(d.message, "error");
    } catch { toast("Send failed", "error"); }
    finally { setSending(false); }
  };

  const QUICK_TEMPLATE = `<div style="font-family:sans-serif;max-width:600px;margin:auto">
  <div style="background:#1a1a2e;padding:24px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:#ff6b35;margin:0">RushPrint</h1>
    <p style="color:rgba(255,255,255,.6);margin:4px 0 0">Custom Printing Solutions</p>
  </div>
  <div style="padding:32px;background:#fff;border:1px solid #e0e0e0">
    <h2 style="color:#1a1a2e">Hello from RushPrint! 👋</h2>
    <p style="color:#555;line-height:1.7">We have exciting news for you. Premium quality printing at unbeatable prices.</p>
    <a href="http://localhost:3000" style="display:inline-block;background:#ff6b35;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:16px">Shop Now</a>
  </div>
  <div style="padding:20px;text-align:center;color:#999;font-size:13px;background:#f8f9fa">
    © ${new Date().getFullYear()} RushPrint. All rights reserved.
  </div>
</div>`;

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <h2><FiMail /> Email Blast</h2>
        <div className="admin-sub-count">
          <FiUsers /> {subCount ?? "…"} Subscribers
        </div>
      </div>

      {/* Subscriber management */}
      <div className="admin-section-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3>Subscribers</h3>
          <button className="btn-link" onClick={() => setShowSubs(!showSubs)}>{showSubs ? "Hide" : "Show"} list</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="admin-input-inline"
            type="email"
            placeholder="Add subscriber email…"
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubscriber()}
          />
          <button className="btn btn-primary" onClick={addSubscriber} style={{ padding: "10px 20px" }}>
            <FiPlus /> Add
          </button>
          {addingStatus && <span className="admin-status-text">{addingStatus}</span>}
        </div>
        {showSubs && (
          <div className="admin-sub-list">
            {subscribers.length === 0 ? <p style={{ color: "#999" }}>No subscribers yet.</p> : subscribers.map((s) => (
              <div key={s.id} className="admin-sub-item"><FiUser /> {s.email}</div>
            ))}
          </div>
        )}
      </div>

      {/* Compose */}
      <div className="admin-section-card">
        <h3>Compose Email</h3>
        <div className="admin-field">
          <label>Subject *</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Exciting news from RushPrint!" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label className="admin-label">HTML Body *</label>
          <button className="btn-link" onClick={() => setBody(QUICK_TEMPLATE)}>Load Quick Template</button>
        </div>
        <textarea
          className="admin-html-editor"
          rows={14}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="<p>Hello,</p><p>Your message here…</p>"
        />
      </div>

      {/* Test */}
      <div className="admin-section-card">
        <h3>Send Test Email</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="admin-input-inline"
            type="email"
            placeholder="test@email.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => sendEmail(true)} disabled={sending}>
            <FiSend /> Send Test
          </button>
        </div>
      </div>

      {/* Blast */}
      <div className="admin-blast-box">
        <div>
          <h3>Send to All Subscribers</h3>
          <p>Delivers one email to all <strong>{subCount ?? "…"}</strong> subscribers via BCC in a single send.</p>
        </div>
        <button className="btn btn-primary blast-btn" onClick={() => sendEmail(false)} disabled={sending}>
          {sending ? "Sending…" : <><FiSend /> Send Blast Email</>}
        </button>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ token }) {
  const [stats, setStats] = useState({ products: 0, subscribers: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/admin/subscribers", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([prod, subs]) => {
      setStats({ products: prod.count || 0, subscribers: subs.count || 0 });
    });
  }, []);

  const cards = [
    { icon: <FiBox />, label: "Total Products", value: stats.products, color: "#ff6b35" },
    { icon: <FiUsers />, label: "Subscribers", value: stats.subscribers, color: "#3498db" },
    { icon: <FiLayout />, label: "Active Banner", value: "1", color: "#27ae60" },
    { icon: <FiMail />, label: "Email Status", value: "Ready", color: "#9b59b6" },
  ];

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header"><h2>👋 Welcome back, Admin</h2></div>
      <div className="admin-overview-grid">
        {cards.map((c, i) => (
          <div className="admin-stat-card" key={i} style={{ borderTop: `4px solid ${c.color}` }}>
            <div className="admin-stat-icon" style={{ color: c.color }}>{c.icon}</div>
            <div className="admin-stat-value">{c.value}</div>
            <div className="admin-stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="admin-section-card" style={{ marginTop: 28 }}>
        <h3>Quick Links</h3>
        <p style={{ color: "#888", marginTop: 6 }}>Use the sidebar tabs to manage Banner, Products, and send Email blasts.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Website</a>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: <FiLayout /> },
  { key: "banner", label: "Banner", icon: <FiLayout /> },
  { key: "products", label: "Products", icon: <FiBox /> },
  { key: "email", label: "Email", icon: <FiMail /> },
];

function AdminDashboard() {
  const { token, adminEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div className="admin-layout">
      {/* Toasts */}
      <div className="admin-toasts">
        {toasts.map((t) => <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} />)}
      </div>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <FiPrinter /> Rush<span>Print</span>
        </div>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-nav-item ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-email-badge"><FiUser /> {adminEmail}</div>
          <button className="admin-logout-btn" onClick={handleLogout}><FiLogOut /> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {tab === "overview" && <OverviewTab token={token} />}
        {tab === "banner" && <BannerTab token={token} toast={toast} />}
        {tab === "products" && <ProductsTab token={token} toast={toast} />}
        {tab === "email" && <EmailTab token={token} toast={toast} />}
      </main>
    </div>
  );
}

export default AdminDashboard;
