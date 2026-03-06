import { Link } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <FiPrinter style={{ display: "inline", marginRight: 8 }} />
              print<span>Ngo</span>
            </div>
            <p>
              Your one-stop shop for all printing needs. We deliver premium
              quality prints with fast turnaround and the best prices.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Products</h4>
            <ul>
              <li><a href="#">Business Cards</a></li>
              <li><a href="#">Canvas Prints</a></li>
              <li><a href="#">T-Shirts</a></li>
              <li><a href="#">Stickers</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="#">support@printngo.com</a></li>
              <li><a href="#">+1 (555) 123-4567</a></li>
              <li><a href="#">123 Print Street, NY</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} printNgo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
