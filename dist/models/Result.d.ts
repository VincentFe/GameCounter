/**
 * Result class
 * Represents the outcome of an operation, encapsulating success status, error messages, and optional data objects.
 *
 * Provides a structured way to handle operation results with the following validation rules:
 * - Success status must be set first via parmSuccess()
 * - Error messages can only be set on failed results (success = false), and will throw if attempted on successful results
 * - Data objects can only be set on successful results (success = true), and will throw if attempted on failed results
 *
 * This pattern ensures type-safe result handling throughout the application, preventing logic errors
 * like accessing error messages on successful operations or data on failed operations.
 */
export declare class Result {
    /** Indicates whether the operation was successful */
    private success;
    /** Error message describing what went wrong (only valid when success = false) */
    private errorMessage;
    /** Optional data object returned on successful operations (only valid when success = true) */
    private object;
    /**
     * Creates a new Result instance with undefined success and error message.
     * Call parmSuccess() to initialize the success status.
     */
    constructor();
    /**
     * Sets the success status of the result.
     * Must be called before attempting to set an error message.
     *
     * @param _success - true if the operation succeeded, false if it failed
     * @returns The success status that was set
     */
    parmSuccess(_success?: boolean): boolean;
    /**
     * Sets the error message for a failed result.
     * Can only be called after parmSuccess(false) has been set.
     * Attempting to set an error message on a successful result will throw an error.
     *
     * @param _errorMessage - A descriptive error message explaining the failure
     * @returns The error message that was set
     * @throws Error if success status is true (cannot set error on successful result)
     */
    parmErrorMessage(_errorMessage?: string): string;
    parmObject(_object?: any): any;
}
//# sourceMappingURL=Result.d.ts.map