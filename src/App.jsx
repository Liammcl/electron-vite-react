import { useTranslation } from 'react-i18next'; 
import ChangeLang from '@/components/ChangLang'
function App() {
  const { t } = useTranslation();
  return (
    <div>
        <div>{t('t1')}</div>
        <ChangeLang/>
    </div>
  );
}

export default App