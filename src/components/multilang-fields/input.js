import React, { useEffect, useState } from 'react';
import { Input, Skeleton } from 'antd';
import { DataService } from '../../config/dataService/dataService';
import { MultiLangWrapper } from './styled';

export const MultiLangInput = ({
    onValueChange,
    required = true,
    label = "Event name",
    placeholder = "Type name",
    value = {},
    onChange
}) => {
    const [languages, setLanguages] = useState([]);
    const [languagesLoading, setLanguagesLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [values, setValues] = useState({});

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                setLanguagesLoading(true);
                const res = await DataService.get("/languages");
                const list = res.data?.languages || [];
                setLanguages(list);

                let initialValues = {};
                list.forEach((lang) => {
                    initialValues[lang.code] = value?.[lang.code] || '';
                });
                setValues(initialValues);
                setSelectedLanguage(list[0]?.code || '');
            } catch (error) {
                console.error("Language fetch error:", error);
            } finally {
                setLanguagesLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    const handleValueChange = (e) => {
        const newValue = e.target.value;
        const updatedValues = {
            ...values,
            [selectedLanguage]: newValue,
        };
        setValues(updatedValues);
        onValueChange?.(updatedValues);
        onChange?.(updatedValues);
    };

    const handleLanguageChange = (languageCode) => {
        setSelectedLanguage(languageCode);
    };

    const getPlaceholder = () => {
        if (!selectedLanguage) return placeholder;
        if (selectedLanguage === "en") return `${placeholder} in English`;
        if (selectedLanguage === "ar") return `اكتب الاسم بالعربية`;
        return placeholder;
    };

    return (
        <MultiLangWrapper className="mb-8">
            <label className="font-semibold text-dark dark:text-white87 text-base mb-2 block">
                {label}{required && "*"}
            </label>

            {languagesLoading ? (
                <Skeleton active paragraph={{ rows: 0 }} className="w-full h-[50px]" />
            ) : (
                <>
                    <Input
                        value={values[selectedLanguage] || ''}
                        onChange={handleValueChange}
                        placeholder={getPlaceholder()}
                        style={{ height: '50px' }}
                        className="w-full mb-0"
                        dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    />

                    {/* Language Tabs */}
                    <div className="lang-tabs">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                type="button"
                                onClick={() => handleLanguageChange(language.code)}
                                className={`lang-tab ${selectedLanguage === language.code ? 'active' : ''}`}
                            >
                                {language.name}
                            </button>
                        ))}
                    </div>

                    {/* Completion Status */}
                    <div className="completion-status">
                        {languages.map((lang) => (
                            <div key={lang.code} className="status-item">
                                <div className={`status-dot ${values[lang.code]?.trim() ? 'filled' : ''}`} />
                                <span className="status-label">{lang.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </MultiLangWrapper>
    );
};