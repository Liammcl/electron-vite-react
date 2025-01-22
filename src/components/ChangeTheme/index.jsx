import { useTheme } from '@/context/ThemeContext'
export default function ChangeTheme() {
    const { isDarkMode, toggleTheme } = useTheme();
    return (
        <div
            className="flex-shrink-0  h-9 rounded-full cursor-pointer select-none text-2xl flex justify-center items-center text-dark-50 dark:text-light-50   "
            onClick={toggleTheme}>
            {isDarkMode ? <span className="material-symbols-rounded text-white">
                dark_mode
            </span> : <span className="material-symbols-rounded text-black ">
                light_mode
            </span>}
        </div>
    )
}
