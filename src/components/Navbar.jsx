import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiPrinter, FiSearch, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <FiPrinter className="logo-icon" />
          Rush<span>Print</span>
        </Link>

        <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
          <li>
            <NavLink to="/" onClick={() => setIsOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <a href="#products" onClick={() => setIsOpen(false)}>
              Products
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setIsOpen(false)}>
              Services
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setIsOpen(false)}>
              About
            </a>
          </li>
          <li>
            <NavLink to="/contact" onClick={() => setIsOpen(false)}>
              Contact
            </NavLink>
          </li>
        </ul>

        <div className="navbar-actions">
          <button className="icon-btn" title="Search">
            <FiSearch />
          </button>
          <button className="icon-btn" title="Cart">
            <FiShoppingCart />
          </button>
          <button
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
