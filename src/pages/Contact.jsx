import { useState } from "react";
import { FiSend, FiCheck, FiMail, FiPhone, FiUser, FiMessageSquare, FiCopy } from "react-icons/fi";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null); // { token }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setError("Email and message are required.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const d = await res.json();
      if (d.success) {
        setSuccess({ token: d.token });
        setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage("");
      } else {
        setError(d.message || "Failed to send. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token).catch(() => {});
  };

  return (
    <section className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact <span className="accent">Us</span></h1>
          <p>Have a question or need a custom quote? Send us a message and we'll get back to you shortly.</p>
        </div>

        <div className="contact-grid">
          {/* ── Info ── */}
          <div className="contact-info-box">
            <h2>Get In Touch</h2>
            <p>Our team is ready to help with any printing needs, custom orders, or general inquiries.</p>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <FiMail className="contact-info-icon" />
                <div>
                  <strong>Email</strong>
                  <a href="mailto:rushprint.store@gmail.com">rushprint.store@gmail.com</a>
                </div>
              </div>
              <div className="contact-info-item">
                <FiPhone className="contact-info-icon" />
                <div>
                  <strong>Response Time</strong>
                  <span>Within a few hours on business days</span>
                </div>
              </div>
            </div>

            <div className="contact-token-info">
              <strong>📋 Reference Token System</strong>
              <p>Every message gets a unique reference token. Keep it to track your inquiry status.</p>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="contact-form-box">
            {success ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <FiCheck />
                </div>
                <h2>Message Sent! 🎉</h2>
                <p>Thank you for reaching out. We'll get back to you at your email address shortly.</p>

                <div className="contact-token-box">
                  <p className="token-label">Your Reference Token</p>
                  <div className="token-display">
                    <span className="token-value">{success.token}</span>
                    <button
                      className="token-copy-btn"
                      onClick={() => copyToken(success.token)}
                      title="Copy token"
                    >
                      <FiCopy />
                    </button>
                  </div>
                  <p className="token-note">Save this token to reference your inquiry when you follow up.</p>
                </div>

                <button
                  className="btn btn-outline-dark"
                  onClick={() => setSuccess(null)}
                  style={{ marginTop: 20 }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Send a Message</h2>

                <div className="contact-form-grid">
                  <div className="cf-field">
                    <label><FiUser /> Full Name</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="cf-field">
                    <label><FiMail /> Email Address *</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="cf-field">
                    <label><FiPhone /> Phone (optional)</label>
                    <input
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="cf-field">
                    <label><FiMessageSquare /> Subject</label>
                    <input
                      type="text"
                      placeholder="General inquiry, custom order…"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="cf-field full">
                  <label>Message *</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="cf-error">{error}</div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary cf-submit"
                  disabled={sending}
                >
                  {sending ? (
                    <><div className="spinner small white" /> Sending…</>
                  ) : (
                    <><FiSend /> Send Message</>
                  )}
                </button>

                <p className="cf-disclaimer">
                  Your message will be sent directly to <strong>rushprint.store@gmail.com</strong>.
                  You'll receive a unique reference token to track your inquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
