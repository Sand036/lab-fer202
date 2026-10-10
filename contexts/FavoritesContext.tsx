"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useState,
    type ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

// Các hành động mà reducer xử lý
type Action =
    | { type: "SET"; payload: number[] } // nạp toàn bộ danh sách
    | { type: "ADD"; payload: number } // thêm 1 sản phẩm
    | { type: "REMOVE"; payload: number }; // xóa 1 sản phẩm

type FavoritesContextType = {
    favorites: number[];
    favoritesLoading: boolean; // MỚI: true khi danh sách yêu thích chưa tải xong
    isFavorite: (id: number) => boolean;
    toggleFavorite: (id: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
    undefined
);

// Reducer: nhận state cũ + action, trả về state mới
function favoritesReducer(state: number[], action: Action): number[] {
    switch (action.type) {
        case "SET":
            return action.payload;
        case "ADD":
            // Tránh thêm trùng
            return state.includes(action.payload) ? state : [...state, action.payload];
        case "REMOVE":
            return state.filter((id) => id !== action.payload);
        default:
            return state;
    }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const [favorites, dispatch] = useReducer(favoritesReducer, []);

    // MỚI: ID của user mà danh sách yêu thích đã được tải xong (null = chưa tải)
    const [loadedFor, setLoadedFor] = useState<string | null>(null);

    // Tải danh sách yêu thích mỗi khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        let active = true; // tránh cập nhật state khi component đã unmount

        async function loadFavorites() {
            // Đợi AuthContext kiểm tra session xong
            if (loading) return;

            // Chưa đăng nhập -> danh sách rỗng
            if (!user) {
                dispatch({ type: "SET", payload: [] });
                setLoadedFor(null); // MỚI: quên user cũ để lần đăng nhập sau tải lại từ đầu
                return;
            }

            // RLS đảm bảo chỉ lấy được dòng của chính user này
            const { data, error } = await supabase
                .from("favorites")
                .select("product_id");

            if (!active) return;

            if (error) {
                console.error("Failed to load favorites:", error.message);
                dispatch({ type: "SET", payload: [] });
                setLoadedFor(user.id); // MỚI: dù lỗi cũng coi là đã xử lý xong, không kẹt ở Loading
                return;
            }

            dispatch({
                type: "SET",
                payload: data.map((item) => item.product_id),
            });
            setLoadedFor(user.id); // MỚI: đánh dấu đã tải xong cho user này
        }

        void loadFavorites();
        return () => {
            active = false;
        };
    }, [user, loading]);

    // MỚI: tính từ dữ liệu có sẵn, không cần state riêng
    // - Auth đang tải -> chưa biết gì -> true
    // - Đã có user nhưng chưa tải xong danh sách của user đó -> true
    const favoritesLoading = loading || (!!user && loadedFor !== user.id);

    const isFavorite = useCallback(
        (id: number) => favorites.includes(id),
        [favorites]
    );

    const toggleFavorite = useCallback(
        async (id: number) => {
            if (!user) return;

            const alreadyFavorite = favorites.includes(id);

            // Optimistic update: cập nhật giao diện ngay lập tức
            dispatch({
                type: alreadyFavorite ? "REMOVE" : "ADD",
                payload: id,
            });

            if (alreadyFavorite) {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("product_id", id);

                if (error) {
                    console.error("Failed to remove favorite:", error.message);
                    dispatch({ type: "ADD", payload: id }); // hoàn tác
                }
            } else {
                const { error } = await supabase
                    .from("favorites")
                    .insert({ user_id: user.id, product_id: id });

                if (error) {
                    console.error("Failed to add favorite:", error.message);
                    dispatch({ type: "REMOVE", payload: id }); // hoàn tác
                }
            }
        },
        [favorites, user]
    );

    return (
        <FavoritesContext.Provider
            value={{ favorites, favoritesLoading, isFavorite, toggleFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

// Hook tiện dụng để dùng ở các component khác
export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within FavoritesProvider");
    }
    return context;
}