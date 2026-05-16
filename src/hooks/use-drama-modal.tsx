import React, { createContext, useContext, useState, useCallback } from 'react';
import { Drama } from '@/data/dramas';

interface DramaModalContextType {
    isOpen: boolean;
    activeDrama: Drama | null;
    openModal: (drama: Drama) => void;
    closeModal: () => void;
}

const DramaModalContext = createContext<DramaModalContextType | undefined>(undefined);

export const DramaModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDrama, setActiveDrama] = useState<Drama | null>(null);

    const openModal = useCallback((drama: Drama) => {
        setActiveDrama(drama);
        setIsOpen(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setActiveDrama(null), 300); // Clear after animation
        document.body.style.overflow = 'unset';
    }, []);

    return (
        <DramaModalContext.Provider value={{ isOpen, activeDrama, openModal, closeModal }}>
            {children}
        </DramaModalContext.Provider>
    );
};

export const useDramaModal = () => {
    const context = useContext(DramaModalContext);
    if (!context) {
        throw new Error('useDramaModal must be used within a DramaModalProvider');
    }
    return context;
};
