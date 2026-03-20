import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiStar, FiClock, FiTag, FiSend, FiX, FiCheck, FiZoomIn } from "react-icons/fi";

// Color name → hex mapping for swatch display
const COLOR_HEX = {
  red: "#ef4444", blue: "#3b82f6", green: "#22c55e", black: "#111827",
  white: "#f9fafb", yellow: "#eab308", orange: "#f97316", purple: "#a855f7",
  pink: "#ec4899", navy: "#1e3a5f", "navy blue": "#1e3a5f", grey: "#6b7280",
  gray: "#6b7280", brown: "#92400e", gold: "#d97706", silver: "#9ca3af",
  maroon: "#7f1d1d", teal: "#14b8a6", cyan: "#06b6d4", lime: "#84cc16",
};

function getHex(name) {
  return COLOR_HEX[name.trim().toLowerCase()] || null;
}

// ── Image Lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({ src, alt, onClose }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><FiX /></button>
      <img src={src} alt={alt} className="lightbox-img" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ── Quote success popup ──────────────────────────────────────────────────────
function QuoteSuccessModal({ product, qty, color, total, onClose }) {
  return (
    <div className="quote-overlay" onClick={onClose}>
      <div className="quote-modal success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrap"><FiCheck className="success-icon" /></div>
        <h2>Request Sent! 🎉</h2>
        <p className="success-sub">We received your quote request and will contact you shortly.</p>
        <div className="success-detail-box">
          <div className="success-row"><span>Product</span><strong>{product}</strong></div>
          {qty && <div className="success-row"><span>Quantity</span><strong>{qty}</strong></div>}
          {color && <div className="success-row"><span>Color</span><strong>{color}</strong></div>}
          {total > 0 && <div className="success-row"><span>Est. Total</span><strong className="green">${total.toFixed(2)}</strong></div>}
        </div>
        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 20, width: "100%" }}>Close</button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTier, setSelectedTier] = useState(null); // null | 'lower' | 'higher'
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) { setProduct(data.data); }
      else { setError("Product not found"); }
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  };

  const handleSendQuote = async () => {
    if (!email.trim()) { setSendError("Please enter your email address."); return; }
    const hp = product.lowerQty && product.lowerUnitPrice;
    if (hp && !selectedTier) { setSendError("Please select Option 1 or Option 2 from the pricing section above."); return; }
    setSendError(""); setSending(true);
    const tQty  = selectedTier === "higher" ? product.higherQty       : product.lowerQty;
    const tUnit = selectedTier === "higher" ? Number(product.higherUnitPrice) : Number(product.lowerUnitPrice);
    const tTotal= selectedTier === "higher" ? Number(product.higherTotalCost) : Number(product.lowerTotalCost);
    try {
      const res = await fetch("/api/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, product: product.name, sku: product.sku,
          quantity: hp ? tQty : null,
          color: selectedColors.join(", "),
          unitPrice: hp ? tUnit : Number(product.price),
          totalCost: hp ? tTotal : Number(product.price),
          message,
        }),
      });
      const d = await res.json();
      if (d.success) { setShowSuccess(true); setName(""); setEmail(""); setPhone(""); setMessage(""); }
      else { setSendError(d.message || "Failed to send. Try again."); }
    } catch { setSendError("Network error. Please try again."); }
    finally { setSending(false); }
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading product...</p></div>;
  if (error || !product) return (
    <div className="error-state">
      <h2>Product Not Found</h2><p>{error}</p>
      <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );

  const hasPricing = product.lowerQty && product.lowerUnitPrice;
  const colorList = (product.colorEnabled !== false && product.colors)
    ? product.colors.split(",").map((c) => c.trim()).filter(Boolean) : [];
  const isMulti = product.colorMode === "multi";

  const toggleColor = (c) => {
    if (isMulti) setSelectedColors((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
    else setSelectedColors((p) => (p[0] === c ? [] : [c]));
  };

  const tierQty   = selectedTier === "higher" ? product.higherQty : product.lowerQty;
  const tierUnit  = selectedTier === "higher" ? Number(product.higherUnitPrice)  : Number(product.lowerUnitPrice);
  const tierTotal = selectedTier === "higher" ? Number(product.higherTotalCost)  : Number(product.lowerTotalCost);

  const stars = Array.from({ length: 5 }, (_, i) => (
    <FiStar key={i}
      fill={i < Math.round(product.rating) ? "#f1c40f" : "none"}
      stroke={i < Math.round(product.rating) ? "#f1c40f" : "#ccc"} />
  ));
  const imgSrc = product.image || "https://placehold.co/600x500?text=Product";

  return (
    <section className="product-detail">
      {lightboxOpen && <ImageLightbox src={imgSrc} alt={product.name} onClose={() => setLightboxOpen(false)} />}
      {showSuccess && (
        <QuoteSuccessModal
          product={product.name} qty={hasPricing ? tierQty : null}
          color={selectedColors.join(", ")} total={hasPricing ? tierTotal : 0}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Products</button>

        <div className="product-detail-grid">
          {/* ── Image — click to zoom ── */}
          <div className="product-detail-image clickable-image" onClick={() => setLightboxOpen(true)}>
            <img src={imgSrc} alt={product.name} />
            <div className="image-zoom-hint"><FiZoomIn /> Click to zoom</div>
          </div>

          {/* ── Info ── */}
          <div className="product-detail-info">
            <div className="pd-meta-row">
              <span className="category">{product.category}</span>
              {product.sku && <span className="pd-sku"><FiTag /> SKU: {product.sku}</span>}
            </div>

            <h1>{product.name}</h1>

            {product.rating > 0 && (
              <div className="rating-row">
                <div className="stars">{stars}</div>
                <span className="rating-text">{product.rating} out of 5</span>
              </div>
            )}

            {product.deliveryDays && (
              <div className="pd-delivery-badge">
                <FiClock />
                <span>Production & Delivery: <strong>{product.deliveryDays} Business Days</strong></span>
              </div>
            )}

            <p className="description">{product.description}</p>

            {/* ── Colors ── */}
            {colorList.length > 0 && (
              <div className="pd-colors-section">
                <p className="pd-section-label">
                  Available Colors{isMulti ? " — select all that apply" : " — select one"}
                  {selectedColors.length > 0 && <span className="selected-color-name"> — {selectedColors.join(", ")}</span>}
                </p>
                <div className="pd-color-swatches">
                  {colorList.map((c) => {
                    const hex = getHex(c); const active = selectedColors.includes(c);
                    return (
                      <button key={c} title={c} className={`color-swatch ${active ? "selected" : ""}`}
                        style={{ background: hex || "#e5e7eb", border: active ? "3px solid #1a1a2e" : "2px solid #e5e7eb" }}
                        onClick={() => toggleColor(c)}>
                        {!hex && <span className="swatch-label">{c[0]}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Pricing tier cards ── */}
            {hasPricing ? (
              <div className="pd-pricing-section">
                <h3 className="pd-pricing-title">Select Your Option</h3>
                <div className="pd-tier-cards">
                  <div className={`pd-tier-card ${selectedTier === "lower" ? "selected" : ""}`} onClick={() => setSelectedTier("lower")}>
                    {selectedTier === "lower" && <div className="pd-tier-check"><FiCheck /></div>}
                    <div className="pd-tier-badge lower">Option 1</div>
                    <div className="pd-tier-qty">{product.lowerQty}<span>units</span></div>
                    <div className="pd-tier-unit">${Number(product.lowerUnitPrice).toFixed(2)} / unit</div>
                    <div className="pd-tier-total">${Number(product.lowerTotalCost).toFixed(2)}</div>
                    <div className="pd-tier-cta">{selectedTier === "lower" ? "✓ Selected" : "Tap to Select"}</div>
                  </div>

                  {product.higherQty > 0 && (
                    <div className={`pd-tier-card ${selectedTier === "higher" ? "selected" : ""}`} onClick={() => setSelectedTier("higher")}>
                      {selectedTier === "higher" && <div className="pd-tier-check"><FiCheck /></div>}
                      <div className="pd-tier-badge higher">Option 2</div>
                      <div className="pd-tier-qty">{product.higherQty}<span>units</span></div>
                      <div className="pd-tier-unit">${Number(product.higherUnitPrice).toFixed(2)} / unit</div>
                      <div className="pd-tier-total">${Number(product.higherTotalCost).toFixed(2)}</div>
                      <div className="pd-tier-cta">{selectedTier === "higher" ? "✓ Selected" : "Tap to Select"}</div>
                    </div>
                  )}
                </div>
                <p className="pd-pricing-note">* Prices include full-color imprint. Setup fees may apply.</p>
              </div>
            ) : (
              <div className="price">${product.price}</div>
            )}

            <div className={`stock-status ${product.inStock ? "in-stock" : "out-of-stock"}`}>
              <span className="dot" />{product.inStock ? "In Stock" : "Out of Stock"}
            </div>
          </div>
        </div>

        {/* ── Quote Request ── */}
        <div className="quote-section">
          <h2 className="quote-title">📋 Request a Quote</h2>
          <p className="quote-sub">Enter your details and we'll send a personalised quote to your inbox.</p>

          {hasPricing && (selectedTier ? (
            <div className="quote-tier-summary">
              <span>Selected:</span>
              <strong>Option {selectedTier === "lower" ? "1" : "2"}</strong>
              <span className="qts-sep">·</span>
              <span>{tierQty} units</span>
              <span className="qts-sep">·</span>
              <span>${tierUnit.toFixed(2)} / unit</span>
              <span className="qts-sep">·</span>
              <strong className="green">${tierTotal.toFixed(2)} total</strong>
              <button className="qts-change-btn" onClick={() => setSelectedTier(null)}>Change</button>
            </div>
          ) : (
            <div className="quote-tier-prompt">
              ⬆️ Please select <strong>Option 1</strong> or <strong>Option 2</strong> from the pricing section above before submitting.
            </div>
          ))}

          <div className="quote-contact-solo">
            <div className="quote-form-row">
              <div className="quote-field">
                <label>Full Name</label>
                <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="quote-field">
                <label>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="quote-form-row">
              <div className="quote-field">
                <label>Phone (optional)</label>
                <input type="tel" placeholder="+1 555 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="quote-field" />
            </div>
            <div className="quote-field">
              <label>Message (optional)</label>
              <textarea rows={3} placeholder="Any special requirements, artwork notes…" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>

          {sendError && <div className="quote-error"><FiX /> {sendError}</div>}

          <button className="btn btn-primary quote-submit-btn" onClick={handleSendQuote} disabled={sending}>
            {sending ? <><div className="spinner small white" /> Sending…</> : <><FiSend /> Confirm & Send Request</>}
          </button>

          <p className="quote-disclaimer">
            Your request will be sent to our team at <strong>rushprint.store@gmail.com</strong>. We typically respond within a few hours.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
