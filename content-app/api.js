const bambooURL = () => `https://${location.hostname}/timesheet/clock/entries`

export const getTimesheetTabData = async (query) => {
    const response = await fetch(`https://${location.hostname}/api/v1/time-tracking/timesheets/employee-timesheet-tab?${query}`, {
        credentials: "same-origin",
        headers: {"Accept": "application/json"},
    });
    if (!response.ok) throw new Error(`timesheet data request failed with status ${response.status}`)
    return response.json()
}

export const doOneDay = async (csrfToken, clockEntries) => {
    await fetch(bambooURL(), {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-Csrf-Token": csrfToken,
        },
        body: JSON.stringify({entries: clockEntries}),
    });
}
export const deleteOneDayEntries = async (csrfToken, clockEntries) => {
    await fetch(bambooURL(), {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-Csrf-Token": csrfToken,
        },
        body: JSON.stringify({entries: clockEntries}),
    });
}