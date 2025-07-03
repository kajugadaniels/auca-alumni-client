// Utility: convert ISO date → “1 October 2025”
export function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
