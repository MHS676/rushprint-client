import { useNavigate } from "react-router-dom";
import { FiClock, FiTag } from "react-icons/fi";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const hasPricing = product.lowerQty && product.lowerUnitPrice;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-card-image">
        <img src={product.image || "https://placehold.co/400x300?text=Product"} alt={product.name} />
        {!product.inStock && (
          <span className="product-card-badge out-of-stock">Out of Stock</span>
        )}
        {product.deliveryDays && (
          <span className="product-card-delivery">
            <FiClock /> {product.deliveryDays} Day
          </span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-top-row">
          <div className="product-card-category">{product.category}</div>
          {product.sku && (
            <div className="product-card-sku">
              <FiTag /> {product.sku}
            </div>
          )}
        </div>
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>

        {hasPricing ? (
          <div className="product-card-pricing">
            <div className="pricing-tier">
              <span className="tier-qty">{product.lowerQty} qty</span>
              <span className="tier-unit">${Number(product.lowerUnitPrice).toFixed(2)}<small>/unit</small></span>
            </div>
            {product.higherQty && (
              <div className="pricing-tier alt">
                <span className="tier-qty">{product.higherQty} qty</span>
                <span className="tier-unit">${Number(product.higherUnitPrice).toFixed(2)}<small>/unit</small></span>
              </div>
            )}
          </div>
        ) : (
          <div className="product-card-footer">
            <span className="price">${product.price}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
