import { useNavigate } from 'react-router';
import InterventionPopup from '../components/InterventionPopup';

export default function InterventionPage() {
  const navigate = useNavigate();

  return <InterventionPopup open onClose={() => navigate('/')} />;
}
