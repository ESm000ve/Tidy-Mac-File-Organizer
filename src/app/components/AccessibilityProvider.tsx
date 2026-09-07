import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { SFIcon } from '@bradleyhodges/sfsymbols-react';
import { sfEye, sfPaintpalette, sfHandRaised, sfPause, sfBrain, sfSunMax, sfEar } from '@bradleyhodges/sfsymbols';

// ─── Profile Definitions ──────────────────────────────────────────────────────
export const PROFILE_IDS = [
    "low-vision",
    "color-vision-deuteranopia",
    "color-vision-protanopia",
    "color-vision-tritanopia",
    "motor",
    "reduced-motion",
    "cognitive",
    "high-contrast",
    "screen-reader",
] as const;

export type ProfileId = (typeof PROFILE_IDS)[number];

export interface ProfileMeta {
    id: ProfileId;
    name: string;
    description: string;
    icon: ReactNode;
    group?: string;
}

export const PROFILES: ProfileMeta[] = [
    {
        id: "low-vision",
        name: "Low Vision",
        description: "Larger text, thicker borders, increased contrast, enlarged icons",
        icon: <SFIcon icon={sfEye} />
    },
    {
        id: "color-vision-deuteranopia",
        name: "Deuteranopia",
        description: "Red-green color blindness — swaps to safe palette (most common type)",
        icon: <SFIcon icon={sfPaintpalette} />,
        group: "Color Vision",
    },
    {
        id: "color-vision-protanopia",
        name: "Protanopia",
        description: "Red-green color blindness — reduced red sensitivity",
        icon: <SFIcon icon={sfPaintpalette} />,
        group: "Color Vision",
    },
    {
        id: "color-vision-tritanopia",
        name: "Tritanopia",
        description: "Blue-yellow color blindness — swaps blue/yellow to safe alternatives",
        icon: <SFIcon icon={sfPaintpalette} />,
        group: "Color Vision",
    },
    {
        id: "motor",
        name: "Motor / Dexterity",
        description: "Larger click targets (48px min), increased spacing, wider interactive regions",
        icon: <SFIcon icon={sfHandRaised} />,
    },
    {
        id: "reduced-motion",
        name: "Reduced Motion",
        description: "Disables all animations and transitions for vestibular comfort",
        icon: <SFIcon icon={sfPause} />,
    },
    {
        id: "cognitive",
        name: "Cognitive / Focus",
        description: "Atkinson Hyperlegible font, reduced density, simplified layout",
        icon: <SFIcon icon={sfBrain} />,
    },
    {
        id: "high-contrast",
        name: "High Contrast",
        description: "Maximum border contrast, solid backgrounds, bold text — great for bright environments",
        icon: <SFIcon icon={sfSunMax} />,
    },
    {
        id: "screen-reader",
        name: "Screen Reader",
        description: "Optimized for VoiceOver and NVDA — verbose labels, no decorative content",
        icon: <SFIcon icon={sfEar} />,
    },
];

// ─── Context ──────────────────────────────────────────────────────────────────
interface AccessibilityContextValue {
    profiles: Set<ProfileId>;
    enableProfile: (id: ProfileId) => void;
    disableProfile: (id: ProfileId) => void;
    toggleProfile: (id: ProfileId) => void;
    hasProfile: (id: ProfileId) => boolean;
    resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = "tidy-a11y-profiles";

function cssClassForProfile(id: ProfileId): string {
    return `a11y-${id}`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [profiles, setProfiles] = useState<Set<ProfileId>>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const arr = JSON.parse(stored) as ProfileId[];
                return new Set(arr.filter((id) => PROFILE_IDS.includes(id)));
            }
        } catch {
            // ignore
        }
        return new Set<ProfileId>();
    });

    // Sync CSS classes to <html>
    useEffect(() => {
        const html = document.documentElement;
        // Remove all a11y classes
        PROFILE_IDS.forEach((id) => html.classList.remove(cssClassForProfile(id)));
        // Add active ones
        profiles.forEach((id) => html.classList.add(cssClassForProfile(id)));
    }, [profiles]);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...profiles]));
    }, [profiles]);

    // Lazy-load Atkinson Hyperlegible only when a profile that uses it is active.
    // This avoids an unconditional network request at app startup.
    useEffect(() => {
        const needsAtkinson = profiles.has("cognitive") || profiles.has("low-vision");
        const existingLink = document.getElementById("font-atkinson");
        if (needsAtkinson && !existingLink) {
            const link = document.createElement("link");
            link.id = "font-atkinson";
            link.rel = "stylesheet";
            link.href =
                "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap";
            document.head.appendChild(link);
        }
    }, [profiles]);

    // Auto-detect OS prefers-reduced-motion
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mq.matches && !profiles.has("reduced-motion")) {
            setProfiles((prev) => new Set([...prev, "reduced-motion"]));
        }
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setProfiles((prev) => new Set([...prev, "reduced-motion"]));
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Auto-detect OS prefers-contrast
    useEffect(() => {
        const mq = window.matchMedia("(prefers-contrast: more)");
        if (mq.matches && !profiles.has("high-contrast")) {
            setProfiles((prev) => new Set([...prev, "high-contrast"]));
        }
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setProfiles((prev) => new Set([...prev, "high-contrast"]));
            } else {
                setProfiles((prev) => { const n = new Set(prev); n.delete("high-contrast"); return n; });
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const enableProfile = useCallback((id: ProfileId) => {
        setProfiles((prev) => new Set([...prev, id]));
    }, []);

    const disableProfile = useCallback((id: ProfileId) => {
        setProfiles((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const toggleProfile = useCallback((id: ProfileId) => {
        setProfiles((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const hasProfile = useCallback(
        (id: ProfileId) => profiles.has(id),
        [profiles]
    );

    const resetAll = useCallback(() => {
        setProfiles(new Set());
    }, []);

    return (
        <AccessibilityContext.Provider
            value={{ profiles, enableProfile, disableProfile, toggleProfile, hasProfile, resetAll }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const ctx = useContext(AccessibilityContext);
    if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
    return ctx;
}
