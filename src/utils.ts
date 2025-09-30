import {LSPluginUserEvents} from "@logseq/libs/dist/LSPlugin.user";
import React from "react";
import ICAL from "ical.js"

let _visible = logseq.isMainUIVisible;

export interface Event {
    uid: string;
    name: string;
    start: Date;
    end: Date;
    rtype: any;
}


function subscribeLogseqEvent<T extends LSPluginUserEvents>(
    eventName: T,
    handler: (...args: any) => void
) {
    logseq.on(eventName, handler);
    return () => {
        logseq.off(eventName, handler);
    };
}

const subscribeToUIVisible = (onChange: () => void) =>
    subscribeLogseqEvent("ui:visible:changed", ({visible}) => {
        _visible = visible;
        onChange();
    });

export const useAppVisible = () => {
    return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

async function getSchedule() {
    const url :string = await logseq.settings?.url as string;
    console.log(`Fetching iCal from URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(res.statusText);
    }
    const fetchedIcalText = await res.text();
    const parsedIcalText = ICAL.parse(fetchedIcalText);
    const component = new ICAL.Component(parsedIcalText);

    const events = component.getAllSubcomponents("vevent");

    return events.map(eventComp => {
        const event = new ICAL.Event(eventComp);
        const evenD: Event = {
            uid: event.uid,
            name: event.summary,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate(),
            rtype: event?.getRecurrenceTypes(),


        }
        return evenD;
    });
}


function isEventToday(event: Event): boolean {
    const now = new Date();
    if ("DAILY" in event.rtype) {
        return true;
    }
    else if ("WEEKLY" in event.rtype) {
        return event.start.getDay() === now.getDay() || event.end.getDay() === now.getDay()
    }
    else if ("MONTHLY" in event.rtype) {
        return event.start.getDate() === now.getDate() || event.end.getDate() === now.getDate()
    }
     else {
        return now >= event.start && now <= event.end;
    }
}

export async function getCurrentTag(): Promise<string> {
    let events = await getSchedule()
    const now = new Date();

    events = events
        .filter(event => {
        return isEventToday(event)
            && event.start.getHours() <= now.getHours()
            && event.end.getHours() >= now.getHours()
    });

    let string = "Tags: ";
    for (const event of events) {
        string = string + "#" + event.name.replace(/ /g, "_");
    }
    return string;
}
