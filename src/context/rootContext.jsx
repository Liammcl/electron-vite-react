import React, { createContext, useContext, useState, useEffect } from "react";
import { createSupabase } from "@/utils/supabase";

const RootStoreContext = createContext({});

export const RootStoreProvider = ({ children }) => {
  const [supabase] = useState(() => createSupabase());
  const [photos, setPhotos] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState(null);

  return (
    <RootStoreContext.Provider
      value={{
        supabase,
        setPhotos,
        photos,
        hasPermission,
        setHasPermission,
        isCameraOn,
        setIsCameraOn,
        error,
        setError,
      }}
    >
      {children}
    </RootStoreContext.Provider>
  );
};

export const useRootStore = () => {
  const context = useContext(RootStoreContext);
  return context;
};
