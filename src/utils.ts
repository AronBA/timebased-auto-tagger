import {LSPluginUserEvents} from "@logseq/libs/dist/LSPlugin.user";
import React from "react";
import ICAL from "ical.js"

let _visible = logseq.isMainUIVisible;

export interface Event {
    uid: string;
    name: string;
    start: Date;
    end: Date;
}

const url = "https://calendar.proton.me/api/calendar/v1/url/Dn6nkYyqSDiCH2dmLKxlI1LxWCFkKQdTpKXqIihxKxptftZUeujWsQa3WuKeyInqAstHMhQk5ZXhMbNLt5sJLA==/calendar.ics?CacheKey=BmN2O2IsZffP5zdIAo8GTw%3D%3D&PassphraseKey=BMQIX6vPL_EKA-Eaxquy2cWRrb8lvGO-KNBnZnq-qFk%3D";

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

        }
        console.log(evenD)
        return evenD;
    });
}


export async function getCurrentTag(): Promise<string> {
    let events = await getSchedule()

    const now = new Date();

    events = events.filter(event => {
        return now >= event.start && now <= event.end;
    });

    let string = "Tags: ";
    for (const event of events) {
        string = string + "#" +event.name.replace(/ /g, "_");
    }
    return string;
}
