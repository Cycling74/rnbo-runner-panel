import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { AppDispatch, RootStateType } from "../lib/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootStateType> = useSelector;
