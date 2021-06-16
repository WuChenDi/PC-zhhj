import { useStore } from "vuex";
import { RootState } from "../store";
import { Getters, Dispatch, Commit } from "../store/utils";

interface UseStoreHooks {
  state: RootState;
  getters: Getters;
  dispatch: Dispatch;
  commit: Commit;
}

const useStoreHooks = (): UseStoreHooks => {
  const { state, getters, dispatch, commit }: UseStoreHooks =
    useStore<RootState>();
  return { state, getters, dispatch, commit };
};

export { useStoreHooks };
export default useStoreHooks;
