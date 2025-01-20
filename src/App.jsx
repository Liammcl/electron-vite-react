
import  { useEffect,useState,useCallback } from 'react';
import { useTranslation } from 'react-i18next'; 
import {langList,i18n} from './i18n'
import { Select } from 'antd';
function App() {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language])
  // 语言切换处理函数
  const handleLanguageChange = useCallback((lang) => {
    try {
      if (i18n && typeof i18n.changeLanguage === 'function') {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);
  return (
    <div>
      <Select
          value={currentLanguage}
          onChange={handleLanguageChange}
          options={langList.map(item=>({label:item.name,value:item.iso}))}
          style={{ width: '100%' }}
        />
        <div>{i18n.language}</div>
        <div>{t('t1')}</div>
    </div>
  );
}

export default App