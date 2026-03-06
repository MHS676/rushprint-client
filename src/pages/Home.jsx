import { useState, useEffect } from "react";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      setError("Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Banner />

      <section className="products-section" id="products">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Products</span>
            <h2>Popular Printing Services</h2>
            <p>
              Explore our wide range of custom printing products. Premium quality
              with fast delivery right to your doorstep.
            </p>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <h2>Oops!</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
