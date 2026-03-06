import { useState, useEffect, useRef } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Banner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d) => {
        const data = d.data || [];
        if (data.length > 0) setBanners(data);
      })
      .catch(() => { });
  }, []);

  // Auto-advance every 5 s
  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [banners]);

  const goTo = (idx) => { clearInterval(timerRef.current); setCurrent(idx); };
  const prev = () => goTo((current - 1 + banners.length) % banners.length);
  const next = () => goTo((current + 1) % banners.length);

  const fallback = {
    badge: "🖨️ #1 Online Print Shop",
    title: "Your Ideas,",
    highlight: "Perfectly Printed.",
    description: "From business cards to canvas art, we bring your creative vision to life with premium quality printing. Fast turnaround, vibrant colors, unmatched quality.",
    btn1_text: "Shop Now", btn1_link: "#products",
    btn2_text: "Our Services", btn2_link: "#",
    image_url: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&q=80",
    stat1_number: "10K+", stat1_label: "Happy Clients",
    stat2_number: "50+", stat2_label: "Products",
    stat3_number: "24hr", stat3_label: "Delivery",
  };

  const data = banners.length > 0 ? banners : [fallback];
  const b = data[current] || fallback;

  return (
    <section className="banner banner-carousel">
      <div className="container">
        <div className="banner-content">
          <span className="banner-badge">{b.badge}</span>
          <h1>
            {b.title}
            <br />
            <span>{b.highlight}</span>
          </h1>
          <p>{b.description}</p>
          <div className="banner-buttons">
            <a href={b.btn1_link} className="btn btn-primary">{b.btn1_text} <FiArrowRight /></a>
            <a href={b.btn2_link} className="btn btn-outline">{b.btn2_text}</a>
          </div>
          <div className="banner-stats">
            <div className="stat-item"><div className="stat-number">{b.stat1_number}</div><div className="stat-label">{b.stat1_label}</div></div>
            <div className="stat-item"><div className="stat-number">{b.stat2_number}</div><div className="stat-label">{b.stat2_label}</div></div>
            <div className="stat-item"><div className="stat-number">{b.stat3_number}</div><div className="stat-label">{b.stat3_label}</div></div>
          </div>
        </div>

        <div className="banner-image">
          <div className="banner-image-wrapper">
            <img key={current} className="main-img banner-img-fade"
              src={b.image_url || "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&q=80"}
              alt="Printing services" />
          </div>
        </div>
      </div>

      {data.length > 1 && (
        <div className="banner-carousel-nav">
          <button className="carousel-arrow" onClick={prev}><FiChevronLeft /></button>
          <div className="carousel-dots">
            {data.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === current ? "active" : ""}`} onClick={() => goTo(i)} />
            ))}
          </div>
          <button className="carousel-arrow" onClick={next}><FiChevronRight /></button>
        </div>
      )}
    </section>
  );
}

export default Banner;
