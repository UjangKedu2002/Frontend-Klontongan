import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../api/axios";
import { User, CartItem } from "../types";

interface AppContextType {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  cartCount: number;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  apiUrl: string;
  backendConnected: boolean | null;
  showToaster: (message: string, type?: "success" | "error" | "info") => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateApiUrl: (newUrl: string) => void;
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string | number,
    quantity?: number
  ) => Promise<boolean>;
  updateCartQty: (itemId: string | number, qty: number) => Promise<boolean>;
  removeCartItem: (itemId: string | number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkBackendConnection: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return (
      localStorage.getItem("VITE_API_URL_OVERRIDE") ||
      (import.meta as any).env.VITE_API_URL ||
      "https://backend-klontongan-production.up.railway.app/api"
    );
  });
  const [backendConnected, setBackendConnected] = useState<boolean | null>(
    null
  );

  const showToaster = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const checkBackendConnection = async () => {
    try {
      // Fetch products or health endpoint as a heuristic
      await api.get("/products");
      setBackendConnected(true);
    } catch (err: any) {
      // If unauthorized (401), backend is awake but just requires auth, so still connected!
      if (err.response) {
        setBackendConnected(true);
      } else {
        setBackendConnected(false);
      }
    }
  };

  useEffect(() => {
    checkBackendConnection();
  }, [apiUrl]);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      // Res can be array, or check structure
      if (Array.isArray(res.data)) {
        setCart(res.data);
      } else if (res.data && Array.isArray(res.data.items)) {
        setCart(res.data.items);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Failed to load cart from DB:", err);
      setCart([]);
    }
  };

  const addToCart = async (
    productId: string | number,
    quantity: number = 1
  ): Promise<boolean> => {
    if (!token) {
      showToaster(
        "Please register or login first to unlock shopping features!",
        "info"
      );
      return false;
    }
    try {
      const res = await api.post("/cart", { productId, quantity });
      showToaster(
        "Item successfully registered inside your cart database!",
        "success"
      );
      await fetchCart();
      return true;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || "Failed to edit database cart";
      showToaster(errMsg, "error");
      return false;
    }
  };

  const updateCartQty = async (
    itemId: string | number,
    qty: number
  ): Promise<boolean> => {
    if (qty <= 0) {
      return removeCartItem(itemId);
    }
    try {
      await api.put(`/cart/${itemId}`, { quantity: qty });
      await fetchCart();
      return true;
    } catch (err: any) {
      showToaster(
        err.response?.data?.message || "Database update failed",
        "error"
      );
      return false;
    }
  };

  const removeCartItem = async (itemId: string | number): Promise<boolean> => {
    try {
      await api.delete(`/cart/${itemId}`);
      showToaster("Item cleared from cloud cart!", "info");
      await fetchCart();
      return true;
    } catch (err: any) {
      showToaster(
        err.response?.data?.message || "Deletion from API failed",
        "error"
      );
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      await api.delete("/cart/clear");
      setCart([]);
      return true;
    } catch (err: any) {
      showToaster("Failed to clear cloud cart", "error");
      return false;
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    showToaster(
      `Welcome back, ${newUser.name}! Logged in as ${newUser.role}.`,
      "success"
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setCart([]);
    showToaster("Logged out successfully.", "info");
  };

  const updateApiUrl = (newUrl: string) => {
    localStorage.setItem("VITE_API_URL_OVERRIDE", newUrl);
    setApiUrl(newUrl);
    showToaster(`Client API URL configured to ${newUrl}`, "info");
  };

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        cartCount,
        toast,
        apiUrl,
        backendConnected,
        showToaster,
        login,
        logout,
        updateApiUrl,
        fetchCart,
        addToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
        checkBackendConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
};
