import { r as reactExports, j as jsxRuntimeExports, cX as startOAuthLogin, l as logger, i as useSearchParams, u as useNavigate, cY as useAccount, cA as User, L as Lock, cZ as EyeOff, bs as Eye, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, az as DialogDescription, aA as DialogFooter } from "./index-ymfxQ6bv.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
import { H as Hash } from "./hash-BwbB2SDj.js";
import { U as UserPlus } from "./user-plus-D2AL3YZ6.js";
const GoogleIcon = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4A90E2", d: "M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" })
] });
const AppleIcon = () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" }) });
const GitHubIcon = () => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" }) });
const PROVIDER_CONFIGS = [{
  provider: "google",
  label: "使用 Google 繼續",
  brandColor: "hsl(210, 100%, 60%)",
  glowColor: "rgba(66, 133, 244, 0.5)",
  bgColor: "rgba(255, 255, 255, 0.04)",
  textColor: "hsl(210, 20%, 95%)",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {})
}, {
  provider: "apple",
  label: "使用 Apple 繼續",
  brandColor: "hsl(0, 0%, 85%)",
  glowColor: "rgba(200, 200, 200, 0.4)",
  bgColor: "rgba(0, 0, 0, 0.5)",
  textColor: "hsl(0, 0%, 92%)",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AppleIcon, {})
}, {
  provider: "github",
  label: "使用 GitHub 繼續",
  brandColor: "hsl(220, 15%, 70%)",
  glowColor: "rgba(140, 150, 180, 0.4)",
  bgColor: "rgba(30, 30, 40, 0.6)",
  textColor: "hsl(220, 20%, 92%)",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GitHubIcon, {})
}];
function OAuthLoginButtons({
  disabled = false
}) {
  const [loadingProvider, setLoadingProvider] = reactExports.useState(null);
  const handleOAuthClick = async (provider) => {
    if (disabled || loadingProvider) return;
    setLoadingProvider(provider);
    try {
      const url = await startOAuthLogin(provider);
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "第三方登入啟動失敗";
      logger.error("OAuth login failed to start", {
        provider,
        error: err
      });
      setLoadingProvider(null);
      throw new Error(message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: PROVIDER_CONFIGS.map((config) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: disabled || loadingProvider !== null, onClick: () => {
    void handleOAuthClick(config.provider);
  }, className: "w-full py-2.5 text-sm font-cyber tracking-wide transition-all flex items-center justify-center gap-3 rounded-sm", style: {
    border: `1px solid ${config.brandColor}`,
    color: config.textColor,
    background: config.bgColor,
    boxShadow: `0 0 10px ${config.glowColor}, inset 0 0 8px ${config.glowColor}`,
    textShadow: `0 0 6px ${config.glowColor}`,
    cursor: disabled || loadingProvider ? "not-allowed" : "pointer",
    opacity: disabled || loadingProvider ? 0.5 : 1
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
      display: "inline-flex",
      alignItems: "center"
    }, children: config.icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: loadingProvider === config.provider ? "跳轉中..." : config.label })
  ] }, config.provider)) });
}
const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/;
const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    login,
    register,
    isLoading,
    isLoggedIn,
    updateProfile
  } = useAccount();
  const [tab, setTab] = reactExports.useState("login");
  const [username, setUsername] = reactExports.useState("");
  const [nickname, setNickname] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [submitError, setSubmitError] = reactExports.useState("");
  const [oauthError, setOauthError] = reactExports.useState("");
  const [showNicknameSetup, setShowNicknameSetup] = reactExports.useState(false);
  const [nicknameInput, setNicknameInput] = reactExports.useState("");
  const [nicknameSetupError, setNicknameSetupError] = reactExports.useState("");
  const [isSettingNickname, setIsSettingNickname] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const tabParam = searchParams.get("tab");
    const oauthErrorParam = searchParams.get("oauth_error");
    if (tabParam === "register" || tabParam === "login") {
      setTab(tabParam);
    }
    if (oauthErrorParam) {
      setOauthError(decodeURIComponent(oauthErrorParam));
    }
  }, [searchParams.toString()]);
  reactExports.useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);
  const validateLogin = reactExports.useCallback(() => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = "請輸入帳號";
    } else if (!USERNAME_REGEX.test(username)) {
      newErrors.username = "帳號需為3-20位英文或數字";
    }
    if (!password) {
      newErrors.password = "請輸入密碼";
    } else if (password.length < 6) {
      newErrors.password = "密碼至少6位";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, password]);
  const validateRegister = reactExports.useCallback(() => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = "請輸入帳號";
    } else if (!USERNAME_REGEX.test(username)) {
      newErrors.username = "帳號需為3-20位英文或數字";
    }
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      newErrors.nickname = "請輸入暱稱";
    } else if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      newErrors.nickname = "暱稱需為2-20字";
    }
    if (!password) {
      newErrors.password = "請輸入密碼";
    } else if (password.length < 6) {
      newErrors.password = "密碼至少6位";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "請確認密碼";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "兩次密碼不一致";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, nickname, password, confirmPassword]);
  const handleSubmit = reactExports.useCallback(async (e) => {
    e.preventDefault();
    setSubmitError("");
    const isValid = tab === "login" ? validateLogin() : validateRegister();
    if (!isValid) return;
    try {
      if (tab === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, nickname.trim());
      }
    } catch (err) {
      const msg = err?.response?.data?.message || (err instanceof Error ? err.message : "操作失敗，請重試");
      setSubmitError(msg);
      logger.error("Auth submit failed", {
        error: err,
        tab
      });
    }
  }, [tab, validateLogin, validateRegister, login, register, username, password, nickname]);
  const switchTab = (newTab) => {
    setTab(newTab);
    setErrors({});
    setSubmitError("");
  };
  const handleBack = () => {
    navigate("/");
  };
  const handleGuestContinue = () => {
    navigate("/");
  };
  const handleNicknameSetupSubmit = reactExports.useCallback(async () => {
    const trimmed = nicknameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setNicknameSetupError("暱稱需為2-20字");
      return;
    }
    setIsSettingNickname(true);
    setNicknameSetupError("");
    try {
      await updateProfile({
        nickname: trimmed
      });
      setShowNicknameSetup(false);
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "設置失敗，請重試";
      setNicknameSetupError(message);
      logger.error("Nickname setup failed", {
        error: err
      });
    } finally {
      setIsSettingNickname(false);
    }
  }, [nicknameInput, updateProfile, navigate]);
  const particles = reactExports.useMemo(() => Array.from({
    length: 20
  }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 10,
    color: Math.random() > 0.5 ? "cyan" : "pink"
  })), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none", style: {
      background: "radial-gradient(ellipse at 20% 30%, rgba(0, 80, 120, 0.25), transparent 50%),radial-gradient(ellipse at 80% 70%, rgba(120, 0, 80, 0.2), transparent 50%),radial-gradient(ellipse at 50% 100%, rgba(80, 0, 120, 0.15), transparent 60%),linear-gradient(180deg, hsl(240, 30%, 4%) 0%, hsl(260, 25%, 6%) 50%, hsl(240, 20%, 5%) 100%)",
      zIndex: 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none", style: {
      backgroundImage: "linear-gradient(color-mix(in srgb, var(--cyan) 8%, transparent) 1px, transparent 1px),linear-gradient(90deg, color-mix(in srgb, var(--cyan) 8%, transparent) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
      backgroundPosition: "center bottom",
      maskImage: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 70%)",
      WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 70%)",
      zIndex: 0
    } }),
    particles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed rounded-full pointer-events-none", style: {
      left: `${p.left}%`,
      top: `${p.top}%`,
      width: `${p.size}px`,
      height: `${p.size}px`,
      background: p.color === "cyan" ? "var(--cyan)" : "var(--pink)",
      boxShadow: p.color === "cyan" ? "0 0 6px var(--cyan-glow), 0 0 12px var(--cyan-glow)" : "0 0 6px var(--pink-glow), 0 0 12px var(--pink-glow)",
      opacity: 0.6,
      animation: `float-particle-${p.color} ${p.duration}s ease-in-out ${p.delay}s infinite`,
      zIndex: 1
    } }, p.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none", style: {
      background: "repeating-linear-gradient(0deg,rgba(0, 0, 0, 0.18),rgba(0, 0, 0, 0.18) 1px,transparent 1px,transparent 3px)",
      animation: "scanline-shift 8s linear infinite",
      zIndex: 10
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 pointer-events-none", style: {
      top: 0,
      height: "120px",
      background: "linear-gradient(to bottom, rgba(0, 255, 255, 0.06), transparent)",
      animation: "scan-sweep 6s ease-in-out infinite",
      zIndex: 11
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBack, className: "absolute top-4 left-4 cyber-btn p-2 flex items-center gap-1 z-20 relative", style: {
      borderColor: "var(--text-secondary)",
      color: "var(--text-secondary)",
      background: "rgba(255, 255, 255, 0.03)"
    }, title: "返回", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-px opacity-60 blur-md", style: {
        background: tab === "login" ? "linear-gradient(135deg, var(--cyan), transparent 40%, transparent 60%, var(--pink))" : "linear-gradient(135deg, var(--pink), transparent 40%, transparent 60%, var(--cyan))",
        filter: "blur(12px)",
        transition: "all 0.5s ease"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: {
        background: "linear-gradient(180deg, rgba(15, 15, 25, 0.98), rgba(10, 10, 20, 0.96))",
        border: `1px solid ${tab === "login" ? "var(--cyan)" : "var(--pink)"}`,
        boxShadow: tab === "login" ? "0 0 30px rgba(0, 255, 255, 0.35), 0 0 60px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 255, 255, 0.06)" : "0 0 30px rgba(255, 107, 157, 0.35), 0 0 60px rgba(255, 107, 157, 0.1), inset 0 0 30px rgba(255, 107, 157, 0.06)",
        backdropFilter: "blur(10px)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-px -left-px w-6 h-6", style: {
          borderTop: "2px solid var(--cyan)",
          borderLeft: "2px solid var(--cyan)",
          boxShadow: "-3px -3px 8px rgba(0, 255, 255, 0.6)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-px -right-px w-6 h-6", style: {
          borderTop: "2px solid var(--cyan)",
          borderRight: "2px solid var(--cyan)",
          boxShadow: "3px -3px 8px rgba(0, 255, 255, 0.6)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-px -left-px w-6 h-6", style: {
          borderBottom: "2px solid var(--cyan)",
          borderLeft: "2px solid var(--cyan)",
          boxShadow: "-3px 3px 8px rgba(0, 255, 255, 0.6)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-px -right-px w-6 h-6", style: {
          borderBottom: "2px solid var(--cyan)",
          borderRight: "2px solid var(--cyan)",
          boxShadow: "3px 3px 8px rgba(0, 255, 255, 0.6)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-3xl md:text-5xl font-bold tracking-widest", style: {
              color: "var(--cyan)",
              textShadow: "0 0 10px var(--cyan-glow), 0 0 20px var(--cyan-glow), 0 0 40px var(--cyan-glow), 0 0 80px rgba(0, 255, 255, 0.5)",
              animation: "logo-pulse 3s ease-in-out infinite"
            }, children: "賽博大富翁" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-cyber text-xs md:text-sm tracking-[0.4em] uppercase", style: {
              color: "var(--pink)",
              textShadow: "0 0 8px var(--pink-glow)",
              letterSpacing: "0.35em"
            }, children: "CYBER MONOPOLY" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-3 text-xs font-cyber tracking-wider", style: {
              color: "var(--text-secondary)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-10 bg-gradient-to-r from-transparent to-[var(--cyan)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ACCOUNT" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-10 bg-gradient-to-l from-transparent to-[var(--cyan)]" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex mb-6 border-b", style: {
            borderColor: "rgba(0, 255, 255, 0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => switchTab("login"), className: "flex-1 py-3 text-sm font-cyber tracking-wider transition-all relative", style: {
              color: tab === "login" ? "var(--cyan)" : "var(--text-secondary)"
            }, children: [
              "登入",
              tab === "login" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 left-0 right-0 h-0.5", style: {
                background: "var(--cyan)",
                boxShadow: "0 0 8px var(--cyan-glow)"
              } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => switchTab("register"), className: "flex-1 py-3 text-sm font-cyber tracking-wider transition-all relative", style: {
              color: tab === "register" ? "var(--pink)" : "var(--text-secondary)"
            }, children: [
              "註冊",
              tab === "register" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 left-0 right-0 h-0.5", style: {
                background: "var(--pink)",
                boxShadow: "0 0 8px var(--pink-glow)"
              } })
            ] })
          ] }),
          submitError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 text-sm font-cyber tracking-wide", style: {
            border: "1px solid var(--red)",
            color: "var(--red)",
            background: "rgba(255, 0, 0, 0.08)",
            boxShadow: "0 0 10px rgba(255, 0, 0, 0.3)",
            textShadow: "0 0 5px rgba(255, 0, 0, 0.5)"
          }, children: submitError }),
          oauthError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 text-sm font-cyber tracking-wide", style: {
            border: "1px solid var(--red)",
            color: "var(--red)",
            background: "rgba(255, 0, 0, 0.08)",
            boxShadow: "0 0 10px rgba(255, 0, 0, 0.3)",
            textShadow: "0 0 5px rgba(255, 0, 0, 0.5)"
          }, children: oauthError }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider mb-1.5", style: {
                color: "var(--text-secondary)"
              }, children: "帳號" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex items-center cyber-input-group ${errors.username ? "cyber-input-group-error" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "absolute left-3", style: {
                  color: errors.username ? "var(--red)" : "var(--text-secondary)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "3-20位英文或數字", className: "w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none", style: {
                  color: "var(--text-primary)"
                }, autoComplete: "username" })
              ] }),
              errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-cyber", style: {
                color: "var(--red)",
                textShadow: "0 0 4px rgba(255,0,0,0.5)"
              }, children: errors.username })
            ] }),
            tab === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider mb-1.5", style: {
                color: "var(--text-secondary)"
              }, children: "暱稱" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex items-center cyber-input-group ${errors.nickname ? "cyber-input-group-error" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { size: 16, className: "absolute left-3", style: {
                  color: errors.nickname ? "var(--red)" : "var(--text-secondary)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: nickname, onChange: (e) => setNickname(e.target.value), placeholder: "2-20字", className: "w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none", style: {
                  color: "var(--text-primary)"
                }, autoComplete: "nickname" })
              ] }),
              errors.nickname && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-cyber", style: {
                color: "var(--red)",
                textShadow: "0 0 4px rgba(255,0,0,0.5)"
              }, children: errors.nickname })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider mb-1.5", style: {
                color: "var(--text-secondary)"
              }, children: "密碼" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex items-center cyber-input-group ${errors.password ? "cyber-input-group-error" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 16, className: "absolute left-3", style: {
                  color: errors.password ? "var(--red)" : "var(--text-secondary)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "至少6位", className: "w-full bg-transparent pl-10 pr-10 py-2.5 text-sm outline-none", style: {
                  color: "var(--text-primary)"
                }, autoComplete: tab === "login" ? "current-password" : "new-password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPassword((prev) => !prev), className: "absolute right-3 p-0.5", style: {
                  color: "var(--text-secondary)"
                }, children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16 }) })
              ] }),
              errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-cyber", style: {
                color: "var(--red)",
                textShadow: "0 0 4px rgba(255,0,0,0.5)"
              }, children: errors.password })
            ] }),
            tab === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider mb-1.5", style: {
                color: "var(--text-secondary)"
              }, children: "確認密碼" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex items-center cyber-input-group ${errors.confirmPassword ? "cyber-input-group-error" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 16, className: "absolute left-3", style: {
                  color: errors.confirmPassword ? "var(--red)" : "var(--text-secondary)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: showPassword ? "text" : "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "再次輸入密碼", className: "w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none", style: {
                  color: "var(--text-primary)"
                }, autoComplete: "new-password" })
              ] }),
              errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-cyber", style: {
                color: "var(--red)",
                textShadow: "0 0 4px rgba(255,0,0,0.5)"
              }, children: errors.confirmPassword }),
              !errors.confirmPassword && confirmPassword.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-cyber", style: {
                color: password === confirmPassword ? "var(--green)" : "var(--red)",
                textShadow: password === confirmPassword ? "0 0 4px rgba(0, 255, 128, 0.5)" : "0 0 4px rgba(255, 0, 0, 0.5)"
              }, children: password === confirmPassword ? "確認 密碼一致" : "兩次密碼不一致" })
            ] }),
            tab === "login" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wide cursor-default", style: {
              color: "var(--text-secondary)"
            }, children: "忘記密碼請聯繫管理員" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-3 text-base font-cyber tracking-widest transition-all mt-2 hover:scale-[1.02] active:scale-[0.98]", style: {
              border: `1px solid ${tab === "login" ? "var(--cyan)" : "var(--pink)"}`,
              color: tab === "login" ? "var(--cyan)" : "var(--pink)",
              background: tab === "login" ? "linear-gradient(180deg, rgba(0, 255, 255, 0.15), rgba(0, 255, 255, 0.05))" : "linear-gradient(180deg, rgba(255, 107, 157, 0.15), rgba(255, 107, 157, 0.05))",
              boxShadow: tab === "login" ? "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1)" : "0 0 20px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.2), inset 0 0 15px rgba(255, 107, 157, 0.1)",
              textShadow: `0 0 10px ${tab === "login" ? "var(--cyan-glow)" : "var(--pink-glow)"}`,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1
            }, onMouseEnter: (e) => {
              if (isLoading) return;
              const el = e.currentTarget;
              el.style.boxShadow = tab === "login" ? "0 0 30px rgba(0, 255, 255, 0.7), 0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.15)" : "0 0 30px rgba(255, 107, 157, 0.7), 0 0 60px rgba(255, 107, 157, 0.3), inset 0 0 20px rgba(255, 107, 157, 0.15)";
            }, onMouseLeave: (e) => {
              const el = e.currentTarget;
              el.style.boxShadow = tab === "login" ? "0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1)" : "0 0 20px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.2), inset 0 0 15px rgba(255, 107, 157, 0.1)";
            }, children: isLoading ? "處理中..." : tab === "login" ? "登入" : "註冊" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px flex-1", style: {
              background: "linear-gradient(to right, transparent, rgba(0,255,255,0.3))"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-widest", style: {
              color: "var(--text-secondary)"
            }, children: "或使用第三方登入" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px flex-1", style: {
              background: "linear-gradient(to left, transparent, rgba(0,255,255,0.3))"
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OAuthLoginButtons, { disabled: isLoading }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-4", style: {
            borderTop: "1px solid rgba(255,255,255,0.06)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleGuestContinue, disabled: isLoading, className: "w-full py-2.5 text-sm font-cyber tracking-wide transition-all flex items-center justify-center gap-2 rounded-sm", style: {
              border: "1px dashed var(--text-secondary)",
              color: "var(--text-secondary)",
              background: "rgba(255, 255, 255, 0.02)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              transition: "all 0.2s ease"
            }, onMouseEnter: (e) => {
              if (isLoading) return;
              const el = e.currentTarget;
              el.style.borderColor = "var(--cyan)";
              el.style.color = "var(--cyan)";
              el.style.boxShadow = "0 0 12px rgba(0, 255, 255, 0.3)";
            }, onMouseLeave: (e) => {
              const el = e.currentTarget;
              el.style.borderColor = "var(--text-secondary)";
              el.style.color = "var(--text-secondary)";
              el.style.boxShadow = "none";
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 18 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "遊客試玩" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-xs font-cyber tracking-wide", style: {
              color: "var(--text-secondary)"
            }, children: "無需註冊即可體驗，資料僅保存於本機" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-px left-1/2 -translate-x-1/2 w-3/4 h-px", style: {
        background: tab === "login" ? "linear-gradient(to right, transparent, var(--cyan), transparent)" : "linear-gradient(to right, transparent, var(--pink), transparent)",
        boxShadow: tab === "login" ? "0 0 10px var(--cyan-glow)" : "0 0 10px var(--pink-glow)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-0 right-0 text-center z-20", style: {
      color: "var(--text-muted)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-cyber tracking-widest", children: "© 2026 CYBER MONOPOLY · 賽博大富翁 · ALL RIGHTS RESERVED" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] mt-1 tracking-wide", style: {
        color: "var(--text-muted)",
        opacity: 0.6
      }, children: "本遊戲純屬虛構，請勿沉迷 · 版本 v1.3.0" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showNicknameSetup, onOpenChange: setShowNicknameSetup, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "設定你的暱稱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "這是你在賽博大富翁中的顯示名稱，之後可隨時在個人資料中修改。" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-cyber tracking-wider mb-1.5", style: {
          color: "var(--text-secondary)"
        }, children: "暱稱" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex items-center cyber-input-group ${nicknameSetupError ? "cyber-input-group-error" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { size: 16, className: "absolute left-3", style: {
            color: nicknameSetupError ? "var(--red)" : "var(--text-secondary)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: nicknameInput, onChange: (e) => setNicknameInput(e.target.value), placeholder: "2-20字", className: "w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none", style: {
            color: "var(--text-primary)"
          }, autoFocus: true })
        ] }),
        nicknameSetupError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs font-cyber", style: {
          color: "var(--red)",
          textShadow: "0 0 4px rgba(255,0,0,0.5)"
        }, children: nicknameSetupError })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleNicknameSetupSubmit, disabled: isSettingNickname, className: "px-6 py-2 text-sm font-cyber tracking-wider transition-all", style: {
        border: "1px solid var(--cyan)",
        color: "var(--cyan)",
        background: "rgba(0, 255, 255, 0.1)",
        boxShadow: "0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)",
        textShadow: "0 0 6px var(--cyan-glow)",
        cursor: isSettingNickname ? "not-allowed" : "pointer",
        opacity: isSettingNickname ? 0.6 : 1
      }, children: isSettingNickname ? "設定中..." : "確認並進入" }) })
    ] }) })
  ] });
};
export {
  LoginPage as default
};
