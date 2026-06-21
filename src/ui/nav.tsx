// A tiny navigation layer. The app is small enough that full navigation
// libraries would be overkill, so this uses React context: an active tab, a
// single modal slot, and a "version" counter. After any change to the data,
// call bump(), and every screen watching version reloads from storage.

import React, { createContext, useContext, useState, useCallback } from "react";

export type TabKey = "home" | "crucible" | "history" | "profile";

export type ModalState =
  | { type: "promote" }
  | { type: "project"; ideaId: string }
  | { type: "decision"; ideaId: string }
  | null;

interface Nav {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  modal: ModalState;
  openPromote: () => void;
  openProject: (ideaId: string) => void;
  openDecision: (ideaId: string) => void;
  closeModal: () => void;
  version: number;
  bump: () => void;
}

const NavContext = createContext<Nav | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabKey>("home");
  const [modal, setModal] = useState<ModalState>(null);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const value: Nav = {
    tab,
    setTab,
    modal,
    openPromote: () => setModal({ type: "promote" }),
    openProject: (ideaId) => setModal({ type: "project", ideaId }),
    openDecision: (ideaId) => setModal({ type: "decision", ideaId }),
    closeModal: () => setModal(null),
    version,
    bump,
  };

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): Nav {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside NavProvider");
  return ctx;
}
