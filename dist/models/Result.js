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
export class Result {
    /**
     * Creates a new Result instance with undefined success and error message.
     * Call parmSuccess() to initialize the success status.
     */
    constructor() {
        /** Indicates whether the operation was successful */
        this.success = false;
    }
    /**
     * Sets the success status of the result.
     * Must be called before attempting to set an error message.
     *
     * @param _success - true if the operation succeeded, false if it failed
     * @returns The success status that was set
     */
    parmSuccess(_success) {
        if (_success !== undefined) {
            this.success = _success;
            return this.success;
        }
        return this.success;
    }
    /**
     * Sets the error message for a failed result.
     * Can only be called after parmSuccess(false) has been set.
     * Attempting to set an error message on a successful result will throw an error.
     *
     * @param _errorMessage - A descriptive error message explaining the failure
     * @returns The error message that was set
     * @throws Error if success status is true (cannot set error on successful result)
     */
    parmErrorMessage(_errorMessage) {
        if (this.success) {
            throw new Error("Cannot set error message on successful result.");
        }
        if (_errorMessage !== undefined) {
            this.errorMessage = _errorMessage;
            return this.errorMessage;
        }
        return this.errorMessage;
    }
    parmObject(_object) {
        if (!this.success) {
            throw new Error("Cannot set object on unsuccessful result.");
        }
        if (_object !== undefined) {
            this.object = _object;
            return this.object;
        }
        return this.object;
    }
}
//# sourceMappingURL=Result.js.map