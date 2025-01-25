import React, { createContext, useContext, useState, useEffect } from "react";

const RootStoreContext = createContext({});

export const RootStoreProvider = ({ children }) => {

  return (
    <RootStoreContext.Provider value={{}}>{children}</RootStoreContext.Provider>
  );
};

export const useRootStore = () => {
  const context = useContext(RootStoreContext);
  return context;
};
