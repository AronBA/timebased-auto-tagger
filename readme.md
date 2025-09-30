# Timebased Auto Tagger

A Logseq plugin that automatically tags pages based on your iCal events and the current time.

## Features

- Fetches events from a configurable iCal URL.  
- Determines which events are active based on the current date and time.  
- Automatically adds tags to new pages in Logseq based on active events.  
- Supports recurring events (daily, weekly, monthly).

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure the iCal URL:**
   - Open the plugin settings in Logseq.
   - Set the `iCal URL` to your calendar feed.

3. **Build and run:**
   ```bash
   npm run build
   ```

## Development

- Main code: `src/`  
- Entry point: `src/main.tsx`  
- React UI: `src/App.tsx`  
- Utility functions: `src/utils.ts`

## Usage

- The plugin watches for new pages in Logseq.  
- When a new page is created, it checks for active events and adds corresponding tags to the page.

## License

MIT
