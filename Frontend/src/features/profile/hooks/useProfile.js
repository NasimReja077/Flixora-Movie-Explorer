import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearProfileError,
  fetchCurrentProfile,
  fetchUserProfile,
} from "../store/profile.slice.js";

export function useProfile() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.profile);

  return {
    profile,
    loading,
    error,
    fetchCurrentProfile: useCallback(
      () => dispatch(fetchCurrentProfile()),
      [dispatch]
    ),
    fetchUserProfile: useCallback(
      (userId) => dispatch(fetchUserProfile(userId)),
      [dispatch]
    ),
    clearProfileError: useCallback(
      () => dispatch(clearProfileError()),
      [dispatch]
    ),
  };
}

export default useProfile;
