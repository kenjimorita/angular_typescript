module utils.date {

    /**
     * Get the start time for today (00:00:00.000) but in UTC
     * @returns The first time for the day in UTC/ISO standard
     */
    export function getDateTimeStartISOString(): string {
        var date = new Date();
        date.setHours(0, 0, 0, 0);

        // return date in UTC, ISO format
        return date.toISOString();
    }

    /**
     * Get the last time for today (23:59:59.999) but in UTC
     * @returns The last time for the day in UTC/ISO standard
     */
    export function getDateTimeEndISOString(): string {
        var date = new Date();
        date.setHours(23, 59, 59, 999);

        // return date in UTC, ISO format
        return date.toISOString();
    }

}