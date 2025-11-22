import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

/**
 * Breadcrumb navigation component
 * @param {Array} items - Array of breadcrumb items with { label, path } or just { label } for current page
 */
export default function Breadcrumb({ items }) {
  return (
    <div className="breadcrumbs text-sm mb-4">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.path ? (
              <Link to={item.path} className="text-base-content/70 hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-base-content">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    }),
  ).isRequired,
}
