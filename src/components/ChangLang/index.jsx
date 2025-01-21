import  { useEffect,useState,useCallback } from 'react'
import { Select } from 'antd';
import {langList,i18n} from '@/i18n'

export default function ChangeLange() {
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language])
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
    </div>
  )
}
