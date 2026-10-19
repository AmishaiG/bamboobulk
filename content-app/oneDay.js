/*One Day buttons - block start*/
import {
    populateClockEntriesFromDefault,
    populateOneDayClockEntriesWithData
} from "./clockEntries.js";
import {
    csrfToken,
    dailyDetails,
    employeeId,
    isCurrentEditable,
    isPreviousEditable,
    isDateContainsTimeEntries,
    isDateTodayOrPast
} from "./timesheetData.js";
import {deleteOneDayEntries, doOneDay} from "./api.js";
import {addZero, skippingDay} from "./utils.js";
import {getClockEntriesFromStorage, getConfigsFromStorage} from "../common/storage";
import {defaultConfigs} from "../common/defaults.js";

const delBtn = (dateData) => {
    const delBtn = document.createElement("div")
    //delBtn.role = "button"
    delBtn.className = "one_day_del_btn"
    delBtn.title = "Delete clock entries"
    delBtn.textContent = "❌" //"🗑" ⏰
    delBtn.onclick = async (event) => {
        event.stopPropagation()
        const clockEntries = dailyDetails[dateData]?.clockEntries?.map(entry => entry.id)
        if (!!clockEntries?.length) {
            await deleteOneDayEntries(csrfToken, clockEntries)
            location.reload()
        }
    }
    //delBtn.dataset.dateData = dateData
    return delBtn
}

const addOneDayTimeEntries = async (dateData) => {
    const storageEntries = await getClockEntriesFromStorage()
    let clockEntries = []
    if(!!storageEntries?.length){
        clockEntries = populateOneDayClockEntriesWithData(storageEntries, dateData, employeeId)
    }
    if(!clockEntries.length){
        clockEntries = populateClockEntriesFromDefault(dateData, employeeId)
    }
    await doOneDay(csrfToken, clockEntries)
    location.reload()
}

const addBtn = (dateData) => {
    const addBtn = document.createElement("div")
    //delBtn.role = "button"
    addBtn.className = "one_day_add_btn"
    addBtn.title = "Add clock entries"
    addBtn.textContent = "🕔" //"⏰"
    addBtn.onclick = () => addOneDayTimeEntries(dateData)
    //delBtn.dataset.dateData = dateData
    return addBtn
}

export const populateEachDay = async () => {
    if (!isCurrentEditable() && !isPreviousEditable()) {
        return;
    }

    let configs = await getConfigsFromStorage()
    if (!configs) {
        configs = defaultConfigs
    }

    const timesheetSlats = document.querySelectorAll(".TimesheetSlat:not([data-bamboobulk])");

    timesheetSlats.forEach((el, index) => {
        el.dataset.bamboobulk = "1"
        const dayDate = el.querySelector(".TimesheetSlat__dayDate");
        if(!dayDate) {
            return;
        }

        const dayDateText = dayDate.textContent;

        //generate date string in format '2023-10-31', equal to the key format in bamboo timesheet
        try {
            const year = new Date().getFullYear();
            const dateTimeData = new Date(dayDateText + " " + year);
            const dateData = `${year}-${addZero(dateTimeData.getMonth()+1)}-${addZero(dateTimeData.getDate())}`;

            const isEditableForDate = isPreviousEditable() || isCurrentEditable();
            
            if (!isEditableForDate) {
                return;
            }

            const oneDay = dailyDetails[dateData];
            
            if(!oneDay) {
                return;
            }

            const shouldSkip = skippingDay(configs, oneDay);
            
            if(shouldSkip) {
                return;
            }

            const hasTimeEntries = isDateContainsTimeEntries(dateData);

            const buttonToAdd = hasTimeEntries ? delBtn(dateData) : addBtn(dateData);
            
            el.appendChild(buttonToAdd);
            
        } catch (e) {
            console.error(`BambooBulk: Error processing day element ${index + 1}:`, e);
            console.error(`BambooBulk: Day date text was: "${dayDateText}"`);
        }
    });
}
