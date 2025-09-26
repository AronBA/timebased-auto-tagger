import React, {useEffect, useRef} from "react";
import {getCurrentTag, useAppVisible} from "./utils";
import {EntityID} from "@logseq/libs/dist/LSPlugin";

let knownPages: string[] = [];

async function initKnownPages() {
    const pages = await logseq.Editor.getAllPages();
    if (pages && pages.length > 0) {
        knownPages = pages.map((p: any) => p.id);
    }
    console.log("Initial pages loaded:", knownPages.length);
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
    const innerRef = useRef<HTMLDivElement>(null);
    const visible = useAppVisible();

    useEffect(() => {
        initKnownPages();
        registerPageWatcher();
    }, []);

    if (!visible) return null;

    return (
        <main
            className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
            onClick={(e) => {
                if (!innerRef.current?.contains(e.target as any)) {
                    window.logseq.hideMainUI();
                }
            }}
        >
            <div ref={innerRef} className="text-size-2em">
                <form>
                    <input type="text"></input>
                </form>
            </div>
        </main>
    );
}

export default App;
