export interface SystemState {
  cognitiveLoad: number;
  sysOnline: boolean;
}

let state: SystemState = { cognitiveLoad: 85, sysOnline: true };
type Listener = (state: SystemState) => void;
const listeners = new Set<Listener>();

export const getSystemState = () => state;

export const setSystemState = (newState: Partial<SystemState>) => {
  state = { ...state, ...newState };
  listeners.forEach((l) => l(state));
};

export const subscribeSystemState = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
