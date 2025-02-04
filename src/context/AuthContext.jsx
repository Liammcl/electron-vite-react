import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/config/supabase";
import { message } from "antd";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useRootStore } from "@/context/rootContext";
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  
  const {setHasPermission,setError,setIsCameraOn}=useRootStore()

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function checkCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setHasPermission(true);
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Camera error:", err);
        setError(err.message);
        setHasPermission(false);
        setIsCameraOn(false);
      }
    }

    checkCameraPermission();
  }, []);
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    if (accessToken && refreshToken) {
      (async () => {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      })();
    }
  }, [navigate]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        const role = await checkInTeam(session?.user ?? null);
        const menukey = await fetchMenuList(role);
        setUser({ ...session?.user, adminRole: role, menukeys: menukey });
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const redirectTo = searchParams.get("redirectTo") || "/home";
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        message.error(error.message || "Google 登录失败,请稍后重试");
        return;
      }

      return data;
    } catch (error) {
      message.error(error.message || "Google 登录失败,请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
      message.success("注册成功！请查收验证邮件。");
      return data;
    } catch (error) {
      message.error(error.message || "注册失败");
      throw error;
    } finally {
      setLoading(false);
    }
  };
 
  // 登出
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });
      if (error) {
        message.error(error.message || "登出失败,请稍后重试");
        return;
      }
      setUser({});
      message.success("已成功登出");
      // 保存当前完整路径作为重定向 URL
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
    } catch (error) {
      message.error(error.message || "登出失败,请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
