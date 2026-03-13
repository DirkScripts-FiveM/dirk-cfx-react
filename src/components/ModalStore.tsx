import { createContext, useContext, useRef } from "react";
import { create, StoreApi, useStore } from "zustand";
import { Modal } from "./Modal";
import { AnimatePresence } from "framer-motion";
import React from "react";

export type StoreModalProps = {
  children: React.ReactNode;
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  description?: string;
  badge?: { label: string; color: string };
  height?: string;
  width?: string;
  maxHeight?: string;
  zIndex?: number;
  clickOutside?: boolean;
};

type ModalStore = {
  active: StoreModalProps | null;
}

export const ModalContext = createContext<StoreApi<ModalStore> | null>(null);

export function useModal<T>(selector: (state: ModalStore) => T): T {
  const modal = useContext(ModalContext);
  if(!modal){
    throw new Error('useModal must be used within a ModalProvider');
  }
  return useStore(modal, selector);
}

function StoreModal() {
  const active = useModal((state) => state.active);
  const { hideModal } = useModalActions();

  return (
    <AnimatePresence>
      {active && (
        <Modal
          title={active.title}
          icon={active.icon}
          iconColor={active.iconColor}
          description={active.description}
          badge={active.badge}
          onClose={hideModal}
          width={active.width}
          maxHeight={active.maxHeight}
          height={active.height}
          zIndex={active.zIndex}
          clickOutside={active.clickOutside}
        >
          {active.children}
        </Modal>
      )}
    </AnimatePresence>
  );
}

export function ModalProvider({ children }: { children: React.ReactNode }){
  const storeRef = useRef<StoreApi<ModalStore>>(
    create<ModalStore>(() => ({
      active: null,
    }))
  );

  return (
    <ModalContext.Provider value={storeRef.current}>
      <StoreModal/>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalActions() {
  const modal = useContext(ModalContext);
  if (!modal) throw new Error("useModalActions must be used within a ModalProvider");

  const showModal = (openModal: StoreModalProps) => {
    modal.setState({ active: openModal });
  };

  const hideModal = () => {
    modal.setState({ active: null });
  };

  return { showModal, hideModal };
}

