import { useEffect, useState, useCallback } from 'react'
import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { langList, i18n } from '@/i18n'

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

  const items = langList.map(item => ({
    key: item.code,
    label: (
      <div className="px-4 py-2">
        {item.name}
      </div>
    ),
    onClick: () => handleLanguageChange(item.code)
  }));

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={['hover']}
      overlayClassName="min-w-[150px] rounded-lg shadow-lg dark:bg-gray-800"
    >
      <div className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        <GlobalOutlined className=" text-gray-600 dark:text-gray-400" />
        <span className="text-gray-700 hidden md:block  dark:text-gray-300">
          {langList.find(lang => lang.code === currentLanguage)?.name}
        </span>
        <span className='md:hidden'>{currentLanguage}</span>
      </div>
    </Dropdown>
  )
}
