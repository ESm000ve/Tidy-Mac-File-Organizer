
import { useTheme } from "next-themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

import { ChevronDown, Display as Monitor, Moon, Sun } from "./icons";
export function ThemeToggle({ isCompact = false }: { isCompact?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[110px] h-[34px]" />;
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    aria-label={`Theme selector, current theme: ${theme || "system"}`}
                    className={clsx(
                        "flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                        isCompact 
                            ? "w-7 h-7 rounded-[6px] text-foreground/60 dark:text-white/60 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                            : "gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/[0.10]"
                    )}
                >
                    {theme === "light" && <Sun className={clsx(isCompact ? "w-[14px] h-[14px]" : "w-3.5 h-3.5", "text-black/60 dark:text-white/60")} aria-hidden="true" />}
                    {theme === "dark" && <Moon className={clsx(isCompact ? "w-[14px] h-[14px]" : "w-3.5 h-3.5", "text-black/60 dark:text-white/60")} aria-hidden="true" />}
                    {theme === "system" && <Monitor className={clsx(isCompact ? "w-[14px] h-[14px]" : "w-3.5 h-3.5", "text-black/60 dark:text-white/60")} aria-hidden="true" />}
                    {!isCompact && (
                        <span className="text-[12px] text-black/70 dark:text-white/60 capitalize flex items-center gap-1">
                            Theme: {theme || 'System'}
                            <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" aria-hidden="true" />
                        </span>
                    )}
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    className={clsx(
                        "z-50 min-w-[120px] rounded-lg p-1",
                        "bg-popover text-popover-foreground shadow-md border border-border"
                    )}
                >
                    <DropdownMenu.Item
                        onClick={() => setTheme("light")}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md outline-none transition-colors",
                            theme === "light" ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                            "focus:bg-accent focus:text-accent-foreground"
                        )}
                    >
                        <Sun className="w-3.5 h-3.5" aria-hidden="true" /> Light
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        onClick={() => setTheme("dark")}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md outline-none transition-colors",
                            theme === "dark" ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                            "focus:bg-accent focus:text-accent-foreground"
                        )}
                    >
                        <Moon className="w-3.5 h-3.5" aria-hidden="true" /> Dark
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-border my-1" />

                    <DropdownMenu.Item
                        onClick={() => setTheme("system")}
                        className={clsx(
                            "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md outline-none transition-colors",
                            theme === "system" ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                            "focus:bg-accent focus:text-accent-foreground"
                        )}
                    >
                        <Monitor className="w-3.5 h-3.5" aria-hidden="true" /> System
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
