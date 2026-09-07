import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";

import { Check, Sparkles, X } from "./icons";
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: string) => Promise<void>;
}

export function NaturalLanguageRuleBuilder({ isOpen, onClose, onSave }: Props) {
    const [rule, setRule] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed left-[50%] top-[50%] z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2"
                            >
                                <Dialog.Title className="sr-only">Ask Tidy AI</Dialog.Title>
                                <Dialog.Description className="sr-only">
                                    Tell Tidy what to do in plain English — AI will set up your rules automatically
                                </Dialog.Description>

                                <div
                                    className="overflow-hidden rounded-[20px] flex flex-col bg-background/80 backdrop-blur-xl border-[0.5px] border-black/10 dark:border-white/[0.15] shadow-[0_24px_48px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
                                    style={{ fontFamily: "var(--font-sf)" }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/[0.08]">
                                        <div className="flex items-center gap-2 text-foreground/90 dark:text-white/90">
                                            <Sparkles className="w-4 h-4 text-[var(--system-purple)]" aria-hidden="true" />
                                            <span className="text-[13px] font-semibold">Ask Tidy AI</span>
                                            {/* HIG Generative AI: Communicate where your app uses AI */}
                                            <span
                                                className="inline-flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-wider text-[var(--system-purple)]/70 bg-[var(--system-purple)]/10 px-1.5 py-0.5 rounded-sm border border-[var(--system-purple)]/20"
                                                title="This feature uses AI to parse your plain-English request and configure your organization rules automatically"
                                                aria-label="Powered by AI"
                                            >
                                                <Sparkles className="w-2 h-2" aria-hidden="true" />
                                                AI
                                            </span>
                                        </div>
                                        <Dialog.Close asChild>
                                            <button
                                                aria-label="Close dialog"
                                                className="text-foreground/50 hover:text-foreground/80 hover:bg-black/5 dark:text-white/50 dark:hover:text-white/80 transition-colors p-1.5 rounded-[10px] dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
                                            >
                                                <X className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex flex-col gap-4">
                                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                                            Just tell Tidy what you want in plain English — AI will configure your rules automatically.
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[
                                                "Move old PDFs to Archive",
                                                "Organize screenshots by date",
                                                "Find and remove duplicates",
                                                "Rename files with smart names",
                                            ].map((example) => (
                                                <button
                                                    key={example}
                                                    type="button"
                                                    onClick={() => setRule(example)}
                                                    className="text-[11px] px-2 py-1 rounded-md bg-[var(--system-purple)]/10 text-[var(--system-purple)]/80 border border-[var(--system-purple)]/15 hover:bg-[var(--system-purple)]/20 transition-colors"
                                                >
                                                    {example}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="relative group">
                                            <label htmlFor="rule-input" className="sr-only">Rule description</label>
                                            <textarea
                                                id="rule-input"
                                                value={rule}
                                                onChange={(e) => setRule(e.target.value)}
                                                placeholder="Type your rule here..."
                                                className="w-full bg-black/5 dark:bg-black/20 text-foreground dark:text-white/90 text-[13px] rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] placeholder:text-muted-foreground transition-all border border-black/5 dark:border-white/5"
                                                autoFocus
                                            />
                                            {/* Magical glow effect behind textarea when focused */}
                                            <div className="absolute inset-0 -z-10 rounded-xl bg-[var(--system-blue)] opacity-0 transition-opacity duration-300 group-focus-within:opacity-20 blur-xl" aria-hidden="true" />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/5 dark:border-white/[0.08] bg-black/[0.02] dark:bg-black/10">
                                        <button
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                            className="px-4 py-1.5 text-[13px] text-foreground/60 dark:text-white/60 hover:text-foreground/90 hover:bg-black/5 dark:hover:text-white/90 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setIsSubmitting(true);
                                                try {
                                                    await onSave(rule);
                                                    setRule("");
                                                    onClose();
                                                } catch (e) {
                                                    console.error("Rule submission failed", e);
                                                } finally {
                                                    setIsSubmitting(false);
                                                }
                                            }}
                                            disabled={!rule.trim() || isSubmitting}
                                            className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] text-white bg-[var(--system-blue)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px] shadow-lg shadow-[var(--system-blue)]/20 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                            )}
                                            {isSubmitting ? "Thinking..." : "Apply Rule"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
