import React, {useEffect} from "react";
import {getCurrentTag, useAppVisible} from "./utils";
import {EntityID} from "@logseq/libs/dist/LSPlugin";

let knownPages: string[] = [];

async function initKnownPages() {
    const pages = await logseq.Editor.getAllPages();
    if (pages && pages.length > 0) {
        knownPages = pages.map((p: any) => p.id);
    }
}
async function createTag(id: EntityID) {
    const page = await logseq.Editor.getPage(id);
    if (page) {
        if (page["journal?"]) return;
        const blocks = await logseq.Editor.getPageBlocksTree(page.name);
        if (blocks.length > 0) {
            await logseq.Editor.insertBlock(blocks[0].uuid, await getCurrentTag(), {
                before: true,
                sibling: true,
            });
        } else {
            await logseq.Editor.appendBlockInPage(page.name, await getCurrentTag());
        }
        await logseq.Editor.exitEditingMode();
    }
}

function registerPageWatcher() {
    logseq.DB.onChanged(async () => {
        const pages = await logseq.Editor.getAllPages();
        if (pages && pages.length > 0) {
            const currentPages = pages.map((p: any) => p.id);
            const newPages = currentPages.filter(p => !knownPages.includes(p));

            if (newPages.length > 0) {
                newPages.forEach(p => {
                    createTag(p);
                });
            }
            knownPages = currentPages;
        }
    });
}

function App() {
    logseq.useSettingsSchema([
        {
            key:"url",
            title:"iCal URL",
            description:"The URL of the iCal feed to fetch events from.",
            type:"string",
            default:"https://example.com/calendar.ics"
        }

    ]);
    const visible = useAppVisible();

    useEffect(() => {
        initKnownPages();
        registerPageWatcher();
    }, []);

    if (!visible) return null;

    return (<main></main>)
}

export default App;
