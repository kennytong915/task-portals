import { Link } from "react-router-dom";

const Logo = (props: { url?: string }) => {
  const { url = "/" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url} aria-label="Task Portals Home">
        <svg
          width="24"
          height="24"
          viewBox="0 0 64 64"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="4" y="4" width="56" height="56" rx="12" fill="#000000"/>
          <g fill="#ffffff">
            <rect x="14" y="18" width="8" height="8" rx="2"/>
            <rect x="26" y="20" width="24" height="4" rx="2"/>
            <rect x="14" y="28" width="8" height="8" rx="2"/>
            <rect x="26" y="30" width="24" height="4" rx="2"/>
            <rect x="14" y="38" width="8" height="8" rx="2"/>
            <rect x="26" y="40" width="24" height="4" rx="2"/>
          </g>
          <title>Task Portals</title>
        </svg>
      </Link>
    </div>
  );
};

export default Logo;
