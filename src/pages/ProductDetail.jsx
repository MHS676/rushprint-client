import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiStar, FiClock, FiTag, FiMinus, FiPlus, FiSend, FiX, FiCheck } from "react-icons/fi";

// Color name → hex mapping for swatch display
const COLOR_HEX = {
  red: "#ef4444", blue: "#3b82f6", green: "#22c55e", black: "#111827",
  white: "#f9fafb", yellow: "#eab308", orange: "#f97316", purple: "#a855f7",
  pink: "#ec4899", navy: "#1e3a5f", "navy blue": "#1e3a5f", grey: "#6b7280",
  gray: "#6b7280", brown: "#92400e", gold: "#d97706", silver: "#9ca3af",
  maroon: "#7f1d1d", teal: "#14b8a6", cyan: "#06b6d4", lime: "#84cc16",
};

function getHex(name) {
  const key = name.trim().toLowerCase();
  return COLOR_HEX[key] || null;
}

// ── Quote success popup ──────────────────────────────────────────────────────
function QuoteSuccessModal({ product, qty, color, total, onClose }) {
  return (
    <div className="quote-overlay" onClick={onClose}>
      <div className="quote-modal success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrap">
          <FiCheck className="success-icon" />
        </div>
        <h2>Request Sent! 🎉</h2>
        <p className="success-sub">We received your quote request and will contact you shortly.</p>
        <div className="success-detail-box">
          <div className="success-row"><span>Product</span><strong>{product}</strong></div>
          <div className="success-row"><span>Quantity</span><strong>{qty}</strong></div>
          {color && <div className="success-row"><span>Color</span><strong>{color}</strong></div>}
          {total > 0 && <div className="success-row"><span>Est. Total</span><strong className="green">${total.toFixed(2)}</strong></div>}
        </div>
        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 20, width: "100%" }}>
          Close
        </button>
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

  // Quote form state
  const [qty, setQty] = useState(50);
  const [selectedColors, setSelectedColors] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        setQty(data.data.lowerQty || 50);
      } else {
        setError("Product not found");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Compute price based on qty tiers
  const calcPrice = (quantity) => {
    if (!product) return { unitPrice: 0, totalCost: 0 };
    if (product.higherQty && quantity >= product.higherQty) {
      const unitPrice = Number(product.higherUnitPrice);
      return { unitPrice, totalCost: unitPrice * quantity };
    }
    if (product.lowerQty && quantity >= product.lowerQty) {
      const unitPrice = Number(product.lowerUnitPrice);
      return { unitPrice, totalCost: unitPrice * quantity };
    }
    // Below lower qty – use lower unit price as minimum
    const unitPrice = Number(product.lowerUnitPrice) || Number(product.price) || 0;
    return { unitPrice, totalCost: unitPrice * quantity };
  };

  const { unitPrice, totalCost } = calcPrice(qty);

  const handleSendQuote = async () => {
    if (!email.trim()) { setSendError("Please enter your email."); return; }
    if (!qty || qty < 1) { setSendError("Please enter a valid quantity."); return; }
    setSendError("");
    setSending(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone,
          product: product.name,
          sku: product.sku,
          quantity: qty,
          color: selectedColors.join(", "),
          unitPrice,
          totalCost,
          message,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setShowSuccess(true);
        setName(""); setEmail(""); setPhone(""); setMessage("");
      } else {
        setSendError(d.message || "Failed to send. Try again.");
      }
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-state">
        <h2>Product Not Found</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const hasPricing = product.lowerQty && product.lowerUnitPrice;
  const colorList = (product.colorEnabled !== false && product.colors)
    ? product.colors.split(",").map((c) => c.trim()).filter(Boolean)
    : [];
  const isMulti = product.colorMode === "multi";

  const toggleColor = (c) => {
    if (isMulti) {
      setSelectedColors((prev) =>
        prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
      );
    } else {
      setSelectedColors((prev) => (prev[0] === c ? [] : [c]));
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      fill={i < Math.round(product.rating) ? "#f1c40f" : "none"}
      stroke={i < Math.round(product.rating) ? "#f1c40f" : "#ccc"}
    />
  ));

  return (
    <section className="product-detail">
      {showSuccess && (
        <QuoteSuccessModal
          product={product.name}
          qty={qty}
          color={selectedColors.join(", ")}
          total={totalCost}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Products
        </button>

        <div className="product-detail-grid">
          {/* ── Image ── */}
          <div className="product-detail-image">
            <img
              src={product.image || "https://placehold.co/600x500?text=Product"}
              alt={product.name}
            />
          </div>

          {/* ── Info ── */}
          <div className="product-detail-info">
            <div className="pd-meta-row">
              <span className="category">{product.category}</span>
              {product.sku && (
                <span className="pd-sku"><FiTag /> SKU: {product.sku}</span>
              )}
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
                  Available Colors
                  {isMulti ? " — select all that apply" : " — select one"}
                  {selectedColors.length > 0 && (
                    <span className="selected-color-name"> — {selectedColors.join(", ")}</span>
                  )}
                </p>
                <div className="pd-color-swatches">
                  {colorList.map((c) => {
                    const hex = getHex(c);
                    const active = selectedColors.includes(c);
                    return (
                      <button
                        key={c}
                        title={c}
                        className={`color-swatch ${active ? "selected" : ""}`}
                        style={{
                          background: hex || "#e5e7eb",
                          border: active ? "3px solid #1a1a2e" : "2px solid #e5e7eb",
                        }}
                        onClick={() => toggleColor(c)}
                      >
                        {!hex && <span className="swatch-label">{c[0]}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Pricing table ── */}
            {hasPricing ? (
              <div className="pd-pricing-section">
                <h3 className="pd-pricing-title">Quantity Pricing</h3>
                <table className="pd-pricing-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th><span className="tier-label lower">Option 1</span></th>
                      <th><span className="tier-label higher">Option 2</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="row-label">Quantity</td>
                      <td>{product.lowerQty}</td>
                      <td>{product.higherQty || "—"}</td>
                    </tr>
                    <tr>
                      <td className="row-label">Total Cost</td>
                      <td className="cost-cell">${Number(product.lowerTotalCost).toFixed(2)}</td>
                      <td className="cost-cell">${Number(product.higherTotalCost).toFixed(2)}</td>
                    </tr>
                    <tr className="highlight-row">
                      <td className="row-label">Unit Price</td>
                      <td className="unit-cell">${Number(product.lowerUnitPrice).toFixed(2)}</td>
                      <td className="unit-cell">${Number(product.higherUnitPrice).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="pd-pricing-note">* Prices include full-color imprint. Setup fees may apply.</p>
              </div>
            ) : (
              <div className="price">${product.price}</div>
            )}

            <div className={`stock-status ${product.inStock ? "in-stock" : "out-of-stock"}`}>
              <span className="dot"></span>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </div>
          </div>
        </div>

        {/* ── Quote / Order Request Section ──────────────────────────────── */}
        <div className="quote-section">
          <h2 className="quote-title">📋 Request a Quote</h2>
          <p className="quote-sub">Enter your details and we'll send a personalised quote to your inbox.</p>

          <div className="quote-form-grid">
            {/* Left: product config */}
            <div className="quote-config-box">
              <h3>Configure Your Order</h3>

              {/* Quantity */}
              <div className="quote-field">
                <label>Quantity</label>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}><FiMinus /></button>
                  <input
                    type="number"
                    min="1"
                    className="qty-input"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button className="qty-btn" onClick={() => setQty((q) => q + 1)}><FiPlus /></button>
                </div>
              </div>

              {/* Color selector (if available) */}
              {colorList.length > 0 && (
                <div className="quote-field">
                  <label>Color{isMulti ? "s" : ""}</label>
                  {isMulti ? (
                    <div className="quote-multi-colors">
                      {colorList.map((c) => (
                        <label key={c} className="quote-color-check">
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(c)}
                            onChange={() => toggleColor(c)}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select
                      className="quote-select"
                      value={selectedColors[0] || ""}
                      onChange={(e) => setSelectedColors(e.target.value ? [e.target.value] : [])}
                    >
                      <option value="">— Select a color —</option>
                      {colorList.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>
              )}

              {/* Live price estimate */}
              {unitPrice > 0 && (
                <div className="quote-price-estimate">
                  <div className="qpe-row">
                    <span>Unit Price</span>
                    <strong>${unitPrice.toFixed(2)}</strong>
                  </div>
                  <div className="qpe-row">
                    <span>Quantity</span>
                    <strong>× {qty}</strong>
                  </div>
                  <div className="qpe-row total">
                    <span>Estimated Total</span>
                    <strong className="green">${totalCost.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Right: contact info */}
            <div className="quote-contact-box">
              <h3>Your Details</h3>
              <div className="quote-field">
                <label>Full Name</label>
                <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="quote-field">
                <label>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="quote-field">
                <label>Phone (optional)</label>
                <input type="tel" placeholder="+1 555 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="quote-field">
                <label>Message (optional)</label>
                <textarea rows={3} placeholder="Any special requirements, artwork notes…" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            </div>
          </div>

          {sendError && (
            <div className="quote-error">
              <FiX /> {sendError}
            </div>
          )}

          <button
            className="btn btn-primary quote-submit-btn"
            onClick={handleSendQuote}
            disabled={sending}
          >
            {sending ? (
              <><div className="spinner small white" /> Sending…</>
            ) : (
              <><FiSend /> Confirm & Send Request</>
            )}
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
