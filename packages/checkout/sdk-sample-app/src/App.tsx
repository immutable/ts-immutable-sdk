import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/connect">Connect</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
