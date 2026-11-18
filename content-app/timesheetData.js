/*Timesheet data and parse*/
import {getTimesheetTabData} from "./api.js";

export let dailyDetails
export let employeeId
export let csrfToken
export let todayDate
export let isEditable
let pageTimesheet
let timesheetStatus
/*const timesheetStatuses = [
    "future",
    "pending",
    "approved"
]*/

export const isTimesheetParsed = () => dailyDetails && employeeId && csrfToken
export const isDateContainsTimeEntries = (dateData) => !!dailyDetails[dateData]?.clockEntries?.length
export const isDateTodayOrPast = (dateData) => new Date(dateData) <= todayDate
export const isCurrentEditable = () => timesheetStatus === "future" && isEditable
export const isPreviousEditable = () => timesheetStatus === "pending" && isEditable

const extractCsrfToken = () => {
    const tokenRegexp = /CSRF_TOKEN\s*=\s*"([^"]+)"/im
    const collection = document.scripts;
    for (let i = 0; i < collection.length; i++) {
        const text = collection[i].text
        if (!text) continue;
        const match = text.match(tokenRegexp)
        if (!!match?.length) return match[1]
    }
}

// same params Bamboo's own timesheet tab sends
const timesheetTabQuery = () => {
    const params = new URLSearchParams(location.search)
    const employeeTimesheetId = params.get("et_id")
    if (employeeTimesheetId) return new URLSearchParams({employeeTimesheetId})

    const query = new URLSearchParams({employeeId: params.get("id") ?? ""})
    const payCycleId = params.get("pay_cycle_id")
    if (payCycleId) query.set("payCycleId", payCycleId)
    return query
}

const loadTimesheetJson = async () => {
    const timesheetJsonEl = document.getElementById("js-timesheet-data")
    if (timesheetJsonEl) return JSON.parse(timesheetJsonEl.textContent)

    // Bamboo no longer embeds the data in the page (TIME_TWIG_MIGRATE_TIMESHEET) and fetches it from this API instead
    return getTimesheetTabData(timesheetTabQuery())
}

export const parseTimeSheetAndPopulateData = async () => {
    const timesheetJson = await loadTimesheetJson()

    pageTimesheet = timesheetJson?.timesheet
    timesheetStatus = pageTimesheet?.status
    isEditable = !!pageTimesheet?.canEdit
    dailyDetails = pageTimesheet?.dailyDetails
    employeeId = timesheetJson?.employeeId
    csrfToken = extractCsrfToken() //window.CSRF_TOKEN

    todayDate = new Date(timesheetJson?.today?.date ?? Date.now())
    // Set to end of today so today's date is included as "today or past"
    todayDate.setHours(23, 59, 59, 999)
}