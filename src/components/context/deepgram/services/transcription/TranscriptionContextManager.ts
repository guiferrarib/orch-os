// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TranscriptionContextManager.ts
// Manages the temporary context of transcriptions

/**
 * Context manager that maintains the temporaryContext between calls
 * and ensures it is not lost when dynamic objects are modified
 */
export class TranscriptionContextManager {
    // Singleton instance
    private static instance: TranscriptionContextManager;

    // Stores the current temporary context
    private currentTemporaryContext: string = '';

    // Stores the memory associated with the temporary context
    private temporaryContextMemory: string = '';

    // Stores the last temporary context queried in Pinecone
    // to avoid repeated queries with the same context
    private lastQueriedTemporaryContext: string = '';

    // Use the getInstance() method to obtain the unique instance
    private constructor() { }

    /**
     * Gets the unique instance of the context manager
     */
    public static getInstance(): TranscriptionContextManager {
        if (!TranscriptionContextManager.instance) {
            TranscriptionContextManager.instance = new TranscriptionContextManager();
        }

        return TranscriptionContextManager.instance;
    }

    /**
     * Sets or updates the temporary context
     * @param context The new temporary context
     */
    public setTemporaryContext(context: string | undefined): void {
        if (context === undefined) {
            return; // Does not clear the context if undefined is passed
        }

        // Updates the temporary context with the new value, even if it is an empty string
        // (Note: an empty string does not clear the context, it only serves to replace
        // the previous context with an empty context)
        this.currentTemporaryContext = context;
    }

    /**
     * Gets the current temporary context
     * @returns The current temporary context or empty string
     */
    public getTemporaryContext(): string {
        return this.currentTemporaryContext;
    }

    /**
     * Sets the memory associated with the temporary context
     * @param memory The memory associated with the context
     */
    public setTemporaryContextMemory(memory: string): void {
        this.temporaryContextMemory = memory;
    }

    /**
     * Gets the memory associated with the temporary context
     * @returns The memory associated with the temporary context
     */
    public getTemporaryContextMemory(): string {
        return this.temporaryContextMemory;
    }

    /**
     * Checks if the current temporary context is different from the last queried context
     * @param context The temporary context to be verified
     * @returns true if the context is different from the last queried context, false otherwise
     */
    public hasTemporaryContextChanged(context: string): boolean {
        // Normalize the context (remove extra spaces)
        const normalizedContext = (context || "").trim();
        
        // If the context is empty, we don't consider it as a change
        // Always returns false to avoid unnecessary new queries
        if (!normalizedContext) {
            return false;
        }
        
        // If we get here, the context is non-empty and needs to be compared
        const normalizedLastContext = (this.lastQueriedTemporaryContext || "").trim();
        
        // Only returns true if it is different from the last (to make a new query)
        return normalizedContext !== normalizedLastContext;
    }

    /**
     * Updates the last queried temporary context
     * @param context The temporary context consulted
     */
    public updateLastQueriedTemporaryContext(context: string): void {
        this.lastQueriedTemporaryContext = context;
    }

    /**
     * Clears the stored temporary context
     */
    public clearTemporaryContext(): void {
        this.currentTemporaryContext = '';
        this.temporaryContextMemory = '';
        this.lastQueriedTemporaryContext = '';
    }

    /**
     * Checks if there is a defined temporary context
     */
    public hasTemporaryContext(): boolean {
        return this.currentTemporaryContext.trim().length > 0;
    }
} 