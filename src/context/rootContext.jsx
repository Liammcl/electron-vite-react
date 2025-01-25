import React, { createContext, useContext, useState, useEffect } from "react";
import { createSupabase } from "@/utils/supabase";

const RootStoreContext = createContext({});

export const RootStoreProvider = ({ children }) => {
  const [supabase] = useState(() => createSupabase());

  return (
    <RootStoreContext.Provider value={{ supabase }}>
      {children}
    </RootStoreContext.Provider>
  );
};

export const useRootStore = () => {
  const context = useContext(RootStoreContext);
  return context;
};
