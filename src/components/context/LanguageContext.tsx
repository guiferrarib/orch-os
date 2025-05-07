// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { createContext, useState } from "react";

export const LanguageContext = createContext<{
    language: string;
    setLanguage: (lang: string) => void;
  }>({ language: "pt-BR", setLanguage: () => {} });
  
  export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState("pt-BR");
    return (
      <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
      </LanguageContext.Provider>
    );
  };