import { useAccessibility, PROFILES, type ProfileId } from "./AccessibilityProvider";
import { ThemeToggle } from "./ThemeToggle";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";

import { clsx } from "clsx";
import { useState, useEffect } from "react";

import { Figure as Accessibility, Rotate as RotateCcw, X } from "./icons";
// Group definitions for color vision subtypes
const GROUPS = ["Color Vision"] as const;

function ProfileCard({
    profile,
    enabled,
    onToggle,
}: {
    profile: (typeof PROFILES)[number];
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className={clsx(
                "flex items-center gap-3 p-3.5 rounded-xl transition-all border-[0.5px]",
                enabled
                    ? "bg-[var(--system-blue)]/8 dark:bg-[var(--system-blue)]/[0.06] border-[var(--system-blue)]/25 dark:border-[var(--system-blue)]/20"
                    : "bg-black/5 dark:bg-white/[0.05] border-black/10 dark:border-white/10 hover:bg-black/8 dark:hover:bg-white/[0.07]"
            )}
        >
            {/* Icon */}
            <div
                className={clsx(
                    "w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0 text-lg select-none",
                    enabled
                        ? "bg-[var(--system-blue)]/15"
                        : "bg-black/8 dark:bg-white/[0.08]"
                )}
                aria-hidden="true"
            >
                {profile.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground/90 dark:text-white/90">
                    {profile.name}
                </p>
                <p className="text-[12px] text-foreground/55 dark:text-white/50 mt-0.5 leading-relaxed">
                    {profile.description}
                </p>
            </div>

            {/* Toggle */}
            <Switch.Root
                checked={enabled}
                onCheckedChange={onToggle}
                aria-label={`${enabled ? "Disable" : "Enable"} ${profile.name} accessibility profile`}
                className="shrink-0 rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                style={{
                    width: 38,
                    height: 22,
                    background: enabled ? "var(--system-blue)" : "var(--mac-toggle-off)",
                }}
            >
                <Switch.Thumb
                    className="block rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-200"
                    style={{
                        width: 18,
                        height: 18,
                        transform: enabled ? "translateX(18px)" : "translateX(2px)",
                        marginTop: 2,
                    }}
                />
            </Switch.Root>
        </div>
    );
}

export function AccessibilityPanel({ isCompact = false }: { isCompact?: boolean }) {
    const { hasProfile, toggleProfile, resetAll, profiles } = useAccessibility();
    const [open, setOpen] = useState(false);

    // Allow the Preferences… menu item (⌘,) to open this panel from the main process.
    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener('tidy:open-preferences', handler);
        return () => window.removeEventListener('tidy:open-preferences', handler);
    }, []);

    const activeCount = profiles.size;

    // Separate grouped and ungrouped profiles
    const ungrouped = PROFILES.filter((p) => !p.group);
    const grouped = GROUPS.map((group) => ({
        name: group,
        profiles: PROFILES.filter((p) => p.group === group),
    }));

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    aria-label={`Accessibility settings${activeCount > 0 ? `, ${activeCount} active` : ""}`}
                    className={clsx(
                        "relative flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                        isCompact 
                            ? "w-7 h-7 rounded-[6px] text-foreground/60 dark:text-white/60 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                            : clsx(
                                "gap-1.5 px-2.5 py-2 rounded-lg border-[0.5px]",
                                activeCount > 0
                                    ? "bg-[var(--system-blue)]/10 dark:bg-[var(--system-blue)]/[0.08] border-[var(--system-blue)]/25 dark:border-[var(--system-blue)]/20"
                                    : "bg-black/5 dark:bg-white/[0.08] border-black/10 dark:border-white/[0.10]"
                            )
                    )}
                >
                    <Accessibility className={clsx(isCompact ? "w-[14px] h-[14px]" : "w-3.5 h-3.5", "text-foreground/60 dark:text-white/60")} aria-hidden="true" />
                    {!isCompact && (
                        <span className="text-[12px] text-foreground/70 dark:text-white/60">
                            A11y
                        </span>
                    )}
                    {activeCount > 0 && (
                        <span className={clsx(
                            "absolute rounded-full bg-[var(--system-blue)] text-white font-bold flex items-center justify-center",
                            isCompact ? "-top-1 -right-1 w-3.5 h-3.5 text-[8px]" : "-top-1.5 -right-1.5 w-4 h-4 text-[9px]"
                        )}>
                            {activeCount}
                        </span>
                    )}
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className="fixed left-1/2 top-1/2 z-[71] -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-2xl bg-background/70 backdrop-blur-2xl backdrop-saturate-150 border border-black/10 dark:border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.2),0_12px_24px_rgba(0,0,0,0.1)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    style={{ fontFamily: "var(--font-sf)" }}
                    aria-describedby="a11y-dialog-desc"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-background/40 backdrop-blur-md z-10 border-b border-black/5 dark:border-white/5">
                        <div>
                            <Dialog.Title className="text-[16px] font-bold text-foreground dark:text-white">
                                Preferences
                            </Dialog.Title>
                            <p id="a11y-dialog-desc" className="text-[13px] text-foreground/50 dark:text-white/45 mt-0.5">
                                Appearance and accessibility settings
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeCount > 0 && (
                                <button
                                    onClick={resetAll}
                                    aria-label="Reset all accessibility profiles"
                                    className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-foreground/60 dark:text-white/50 hover:text-foreground/80 dark:hover:text-white/70 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
                                >
                                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                                    Reset
                                </button>
                            )}
                            <Dialog.Close asChild>
                                <button
                                    aria-label="Close accessibility settings"
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-foreground/50 dark:text-white/50 hover:text-foreground/80 dark:hover:text-white/80 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
                                >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>

                    {/* Preferences content */}
                    <div className="px-5 pb-5 space-y-2">

                        {/* ── Appearance ──────────────────────────────────── */}
                        <div className="pt-3 pb-1">
                            <p className="text-[11px] font-semibold text-foreground/40 dark:text-white/35 mb-3 pl-0.5">
                                Appearance
                            </p>
                            <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10">
                                <span className="text-[13px] font-medium text-foreground/90 dark:text-white/90">Theme</span>
                                <ThemeToggle />
                            </div>
                        </div>

                        {/* ── Accessibility ───────────────────────────────── */}
                        <p className="text-[11px] font-semibold text-foreground/40 dark:text-white/35 pt-2 pb-1 pl-0.5">
                            Accessibility
                        </p>

                        {/* Ungrouped profiles */}
                        {ungrouped.map((profile) => (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                enabled={hasProfile(profile.id)}
                                onToggle={() => toggleProfile(profile.id)}
                            />
                        ))}

                        {/* Grouped profiles */}
                        {grouped.map((group) => (
                            <div key={group.name}>
                                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-foreground/40 dark:text-white/35 mt-3 mb-2 pl-1">
                                    {group.name}
                                </p>
                                <div className="space-y-2">
                                    {group.profiles.map((profile) => (
                                        <ProfileCard
                                            key={profile.id}
                                            profile={profile}
                                            enabled={hasProfile(profile.id)}
                                            onToggle={() => toggleProfile(profile.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Footer note */}
                        <p className="text-[11px] text-foreground/35 dark:text-white/30 pt-3 text-center leading-relaxed">
                            Profiles are saved automatically and persist across sessions.<br />
                            Multiple profiles can be combined.
                        </p>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
