# UTZLINE Projects — installable app

**Current version: v50 (RC 1.0)** (its own independent version line, separate from Site Measure/Viewer's and both ITP apps' — bump this line every time a new build ships. NOTE: this number, this file's own cache-name counter, and the "(vN, ...)" comment count at the top of `service-worker.js` have never tracked each other 1:1 in this app — e.g. this v29 ships as `utzline-projects-cache-v37` — so don't assume one from another; the README's own number here is the one Andrew-facing release count.)

**v50 (2026-09-30) — RC 1.0: Set up floor plans & report — drop every floor plan at once → levels (and zones), then the report → items + markers.**

- Andrew: *"in the project setup, as well as import levels, lets have a drag and drop where you can drag multiple floor plans in and it creates the zones / levels according to this. then a second tab where we import the report that creates the indicator markers as a secondary step."* A new **Import floor plans & report…** button on the Levels screen (and the same dialog opens by itself after **+ New Project**; dropping files anywhere on the Levels screen opens it too).
- **Tab 1 — Floor plans.** Drag several PDFs / images in (or tap to choose). Every PDF page is a row with a thumbnail, a tick, and **Level / Zone / Code** fields filled in from the drawing's own title block (the biggest text wins: "LEVEL 1", "GROUND FLOOR", "BUILDING H" → code H1, "ZONE A"); a plan with no level text is named from its file and flagged to check. **Create** makes one level per ticked row — the same image and plan labels *Import floor plan* would have made — one at a time (4 GB tablets), then moves on to tab 2. A level that already exists is kept as it is.
- **Levels, then zones** (Andrew: *"have levels then zones, 2 folder breakdown option, zones not shown if there is only one per level"*): the two-tier option, for a level split over several plan sheets. It switches itself on when two plans name the same level. On disk a zone is a level called `Level 1 (Zone A)`, so Site Measure, the ITPs and the schedules keep working unchanged; in this app's Levels list a level with two or more zones is a heading with its zones under it, and a lone zone shows as its level. The grouping and the report codes are kept in `Project Saves/level-zones.json`.
- **Tab 2 — Report.** The Work Order List / Cost Analysis import, started from the dialog: its zone → level choices are pre-filled from the codes typed on tab 1 (then this device's last map, then a guess from the level number / Ground), the items are created, the ones the plan labels are placed straight away, and a done panel counts what is left per level with **Place →** into that level's plan and its *To place* list. The zone → level map confirmed in any import is written back to `level-zones.json`, so the next device maps the report by itself.
- Test: `pdftest-projects/run_projects_v50_plan_setup.js` (the real A-104 plan + a two-page BUILDING H / LEVEL 1 / ZONE A|B set → three levels, the grouped list, the 3756 report pre-mapped to Ground Floor and placed from the plan's labels).

**v49 (2026-09-30) — RC 1.0: builders with logos, status icons on the plan (blue, 25% smaller, zoom buttons), merge pins into one drawing, tick-box status filter, hide / rearrange register columns, day / night mode.**

- **Builders from a list, each with a logo** (Andrew: *"when we start a project the builder name can be a drop down with option to add new, if adding new it asks to drag and drop their logo. this can be used on the project headers"*): the Project info dialog's Builder is a drop-down of the company's builders (`utzline-builders.json` at the Projects root, started from the builders already on your projects); *+ Add a new builder…* asks for the name and the logo (drag and drop, or tap to choose; it can be added without one); *Change logo…* swaps it later. The logo is kept at the root as `utzline-builder-logo - <name>.png`; the project still stores only the builder's name. The logo shows beside the project's name on the levels screen and the register, and in every other app's project header and PDFs.
- Andrew: *"all icons to have this fill colour as default"* + *"make the text and icons 25% smaller"*: the level plan's markers are drawn the Site Measure way (white ring, black ring, **blue #0011ff** fill, whatever colour they were saved with), the dot and the label text 25% smaller, with the item's **status icon** on the dot (🏭 in manufacture, ⚙️ machined, 📦 ready to dispatch, 🚚 delivered, 🏆 installed, 📏 check measured).
- The plan has the same **− / Reset view / +** zoom buttons as the schedules' plans (one finger pans, pinch zooms, as before).
- **Merge pins into one drawing** (Andrew: *"merge option that merges the pins by selection, then you only upload one drawing for that merge and it flags everything on that merge at once"*): right-click / long-press a pin → *Merge with other pins…*, tap the others, **Save group**. Grouped pins wear a gold dashed ring; the item page says *One drawing covers N items*; in the Scheduler a shop drawing or job note dropped on any of them goes onto all of them. *Ungroup* separates them again (nothing already uploaded is touched). One small file per change under Project Saves/Drawing Groups.
- The Joinery Register's status filter is a drop-down of **tick boxes** (Andrew: *"these need to be tick boxes"*), and its **Columns** button hides / rearranges the columns (remembered per device).
- **Day / night mode** (Andrew: *"give me day / night mode for all apps"*): a ☀ / ☾ button at the top right of every screen switches between the dark look and a new light one; with nothing chosen the app follows the device's own setting. The choice is kept per device and shared by the UTZLINE apps on it.
- The plan's marker menu already shows the room (Andrew: *"these menus to show the room number also"*).

**v48 (2026-09-30) — RC 1.0: sign in on open (tablets and phones), Change folder bottom right, Speed up removed, cutting file locked with a PIN.**

- Andrew: *"on next update, when opening the apps, it should as[k] for you to login, currently it just loads to the last user that was logged in, some of these tablets will have multiple users (employees)"*. **On a tablet or phone the app now asks who is using it** -- a full-screen *Who's using this?* list (every name in `utzline-users.csv`, plus *+ Add a new name…*) each time the app is opened, and again when it has been in the background for **10 minutes or more**. Tap your name and enter your 4-digit PIN on the usual numberpad. The name saved on the device is only treated as "the last person" now; if another app on the device signs in as someone else, this one asks again when it comes back to the front. **A PC is unchanged** (it keeps the last user), and the PIN numberpad, the registry and the name stamped on saves are as before.
- Andrew: *"move the change folder to the bottom right of the page, and smaller"*. The **Change folder** control on the project list is now a small button fixed to the bottom-right corner of the screen (its tooltip keeps the full wording, *Choose a different Projects folder*) instead of a full-size button / link in the list.
- The **Speed up this project** card is gone (Andrew: *"speed up is done, i think it can be removed"*); the apps still read both the level folders and any old item folders, so nothing disappears.
- Andrew: *"once a cutting file name is pasted, lock it, can be edited with a pin"*. A saved **cutting file name is locked** (read-only, dashed box) straight after it is pasted -- in the table and on the item's summary page. Tap the **padlock** beside it, enter **your own PIN**, and the box opens for an edit (leave it unchanged and it locks again; after saving it locks again). An empty box is still open for pasting with no PIN. Every change is still a signed, dated event, with the old names kept under *Before:*.


**v47 (2026-09-30) — RC 1.0: records are kept one folder per level — much faster on a tablet.**

- Andrew: *"how can we speed up schedule loading on the app android"* / *"all are slow"*. Every status, schedule date, cut, solid-surface tick, cutting file and note is still one small file per change (nothing is ever rewritten), but they now go in **one folder per level** — `Project Saves/UTZLINE Events/<record type>/<Level>/`, each file named `<Level> - <Room> - <Code> -- <name> - <time> - <kind>.json` — instead of one folder per joinery item. A schedule now lists a handful of level folders instead of hundreds of item folders; on the tablet each folder costs about a quarter of a second.
- Records a project already has in the old item folders are still read, and both places are shown together (a record found in both counts once). UTZLINE Projects shows **Speed up this project** on a project that still has old folders and moves them — each record copied, checked, then its old copy removed.
- **Update every tablet and PC.** An app older than this one doesn't look in the level folders, so it won't see records written by this one — and only press *Speed up this project* once every device is updated.
- **Speed up this project** (on the project page, under the levels, only while old folders remain): the first press asks you to confirm every device is updated; then it moves the records and says how many, and names any file it left where it was (an empty file from a save that never finished stays, and is still read). It can be pressed again at any time.


**v46 (2026-09-29) — RC 1.0: the ITP cards read the ITPs' change files.**

- The three ITPs now write a small change file with every checklist save, as well as the whole checklist (Andrew: *"shouldnt everything run like this. isnt that the ultimate failsafe"*). The joinery item's ITP card and the delivery pin / snapshot read the whole file plus any change files it hasn't taken in yet, so when two tablets saved the same checklist offline, both tablets' changes show here.

**v45 (2026-09-29) — RC 1.0: REV 0, A, B …; Cutting file and Notes on the joinery summary; the Delivery ITP shows properly.**

- **Shop drawing revisions start at REV 0.** Andrew: *"all revisions start at REV 0  Not REV A  It goes 0 A B C D E etc..."*. A drawing's revisions are put in the order they were saved and labelled by position: REV 0, then REV A, B, C … A first revision saved as "REV A" before today now shows as REV 0. Nothing on disk is renamed. A returned copy shows the label of the revision it answers. The same in the Scheduler, Machine Schedule and Site Measure / Viewer.
- **Cutting file and Notes cards.** Andrew: *"schedules needs a column where a cutting filename can be pated into and stored. this becomes part of the joinery summary. also a notes column where notes can be added, saved, deleted one by onr"*. They're the same records the three schedules show. Paste the cutting file's name and it saves; notes are added one at a time, and each has its own Delete (tap twice). History lists both.
- **The ITPs card shows Delivery ITP properly.** Andrew: *"delivery itp does not show up in summary page. it says 5/5 but thats it"*. Every ITP was judged by "both signatures", but Delivery ITP is signed off by the driver (the site supervisor's signature is optional), with no "No", a photo and a delivery pin. A finished delivery now says "Signed off — <name> (<date>)", with its photo count and PDF. An unfinished one says what it still needs. Every ITP now says who has signed.
- Two saves of the same file at once are done one after the other. Marking an order received never re-creates an Orders file that was removed in the meantime.

**v44 (2026-09-29) — RC 1.0: no more random "couldn't read … (still syncing?)".** Andrew, after the Scheduler's job-note fix: *"i am having a similar issue with projects"*.

- **A v43 bug, fixed.** v43's History reader declared its own `READ_RETRY_MS` in the same scope as the app's, which turned every other read's retry wait into 0 ms. So a file that was busy for a moment failed at once, instead of being read again after 0.6 s. It's renamed.
- **Every read that fails is tried twice more,** 0.6 s and then 1.5 s later. Before, it was tried once more. A file another program has open for a moment usually reads fine by then; that could be antivirus, a sync client, or another UTZLINE app.
- **Empty event files are ignored everywhere.** These are 0-byte files in an item's status, schedule, machining or solid-surface folders, left by a save that never finished in any app. They hold nothing, so they no longer make a check fail or show as unreadable. Whole-file lists such as joinery-items.json and level files still refuse to read as empty, so an unreadable list can never be saved over.
- **The last few saves are now retried and checked:** the names & PINs list, level files, plan labels, the company logo and order Received.
- **No message says "still syncing?" any more.** It was a guess, and usually wrong. Messages now say "couldn't read … just now". Move to another level, Remove from plan and Delete name the file they couldn't check.

**v43 (2026-09-29) — RC 1.0: the History "still syncing?" note.** Andrew, with a screenshot of an item's History saying *"Couldn't read everything just now (still syncing?): schedule (1 file still syncing)"*: *"i get this error randomly for no reason its not a syncing issue"*.

- **What it was.** A file in that item's `Project Saves/Joinery Schedule/<item>/` folder couldn't be read, and the app guessed "syncing". The likely file is the PC-date record the app writes when an item is created: on Windows, a sync client or antivirus takes hold of a brand-new file for a moment, the app's write into it can fail as it finishes, and a 0-byte file was left behind with nothing said — the item then shows no delivery date, and History reports the file for ever.
- **Every save now tries again** (0.5 s and 1.5 s later) when it fails or doesn't land, and is read back to check its size: joinery-items.json, project-meta.json, work-orders.json, the project-manager list, every event file (PC date, migrations, deleted items). Only a third failure is reported.
- **History names the file and the reason.** A file that fails is read again (0.6 s and 1.5 s later); one that still fails is listed as, e.g. *Joinery Schedule › "Andrew - 2026-09-29 13-38-12-345 - set.json" — it's empty (a save that never finished)*, or *another program has it open (NotReadableError)*. There's a **Try again** button. Nothing is called "syncing".
- **An empty file** (a save that never finished) holds nothing, so it isn't reported at all. It no longer stops the PC date: when an item's schedule folder holds only an empty file, the item gets the PC date again. Opening that item's page does it straight away and says so (*"This item's PC date hadn't saved properly — it's set again now."*).
- Test: `run_projects_v43_reads.js`.

**v42 (2026-09-29) — RC 1.0: ready for the SharePoint test.** Andrew: *"ok lets do it, make a test run (maybe projects) thats a seperate installable that wont wipe my current setup. add in all the failsafes you need"*.

- **Plan markers 20% smaller.** Andrew: *"on he next projects update, make the indicator dots about 20% smaller (and the icons)"*. Every dot on the plan is drawn at 0.8 × its saved size: the amber check ring, a copy's dashed pin and the pin being placed too. Each code moves up with its dot's edge. Nothing saved changes, and tapping still uses the full size. Site Measure / Viewer v69 and the ITPs draw the same markers, with their status icons, at the same 0.8.
- **Tables: titles always visible, and zoomable.** Andrew: *"these title bars need to be always visable, and the tables need to be zoomable"*. This covers the Joinery Register and the Rework Register (outstanding and delivered).
  - Each table scrolls inside its own card, up to the screen's height. Its column titles stay pinned at the top while the rows scroll under them, across and down.
  - **Text size − 100% +** above each table zooms it from 60% to 200%. Tap the % to go back to 100%. A two-finger pinch on the table, or Ctrl + mouse wheel, zooms too.
  - The size is kept per table on this device.
  - The schedule apps' tables (the screenshot was the Scheduler's) get the same treatment on their own next updates.
- **New names leave out # and %.** A new project folder, level or room made here drops them ("Unit #4" → "Unit 4"). SharePoint takes them now, but links, some sync apps and older tools still trip on them. Existing names are unchanged, and so is every lookup of them.
- **UTZLINE Projects SharePoint Test** is a separate Windows install of this same v42, with the SharePoint test guard (`sharepoint-pilot.js`, kept in `/home/claude/sharepoint-pilot/`) loaded before the app. It has its own name, app ID, install folder, shortcuts, uninstall entry and settings folder (`%APPDATA%\UTZLINE Projects SharePoint Test`), so it never touches this app or its folder. The TEST badge is on its icon. What the guard does:
  - **Folder:** it only uses a folder carrying the marker `UTZLINE SharePoint test folder.txt`. The first time, you type TEST before the marker is written. Dropbox folders are refused.
  - **Saves:** saves, new files and deletes only happen inside that folder.
  - **Look-only switch:** turns off all saving and deleting.
  - **Changed by someone else:** if a list file changed on disk after the app read it, you're asked before it's replaced.
  - **Local backups:** before the first replace of a file each session, and before every delete, a copy is kept on this computer.
  - **Save checks:** every save is read back to check it landed. If not, it's written again once, then reported.
  - **Conflict copies:** OneDrive conflict copies are spotted within minutes.
  - **Check folder:** lists names SharePoint won't take, long paths, the item count, conflict copies, # / % names and Dropbox leftovers.
  - **Check files open:** opens every file in one job, which also downloads online-only files.
  - **Log:** a log you can save.
- Tests: `pdftest-projects/run_sharepoint_pilot_guard.js` (the real pilot build on a real browser file system) and `run_projects_v42_names.js`.

**v41 (2026-09-29) — RC 1.0: more than one in a room (with a double-up warning); the room is editable.** Andrew: *"when importing / dupliccating, we still need the option to drag into the same room, (may be multiples in a room) but warn that this is a double up"* and *"edit joinery item needs the room editable"*.

- **The same room again.**
  - In "Which room?", a room that already has the work order on the plan can be picked now. It's marked in amber: *(already here — another one would be a double-up)*.
  - Picking it asks first: *"⚠ Double-up? J.001 (WO 100) is already in G.01 Waiting. Put another one in the same room? Only if there really is more than one there — its value is then shared 2 ways."*
  - OK adds **"J.001 2"** in that room (the numbered suffix, as Add item does). Cancel adds nothing.
  - This works for dragging a work order again and for Make it multiples' extra pins. Typing an existing room's name gets the same question.
  - A room where it's only *waiting* to be placed just places that one — no warning.
- **Edit joinery item: the room.**
  - The dialog's Room is a select of the level's rooms, plus "+ New room…" to type one.
  - Saving uses the PIN as before, logs a "Room" change in the item's history, moves its marker on the plan with it, adds a typed room to the level, and keeps the PC date.
  - It's refused for a room that already has that Joinery ID.
  - It's also refused for an item that has anything recorded against it (status, job notes, drawings, ITPs, orders, reworks, site measures, its own dates), so none of that is left behind under the old room. Its other fields still save.
  - Level and Joinery ID stay fixed. Use the plan's "Move to another level" for the level.
- **History:** a "Check measured" step written by Site Measure's new *Site measure not required* reads "Check measured — site measure not required".
- Tests: `run_projects_v41_same_room_edit_room.js`; `run_projects_wo_cost_import.js` and `run_edit_joinery_item_pin_traceability.js` updated for the new behaviour.

**v40 (2026-09-29) — RC 1.0: right-click (or press and hold) a placed item.** Andrew, importing joinery items: *"we need the option when dragging and dropping, to change to multiples (maybe right click on a dropped item) and change the qty, then drag the new pin to a new location. this will divide the total value by the amount of splits, and also request you to add the new room code (drop down plus option to type)"*, *"i have had a double up, we need an option to remove on right click in the import page"*, *"and do move to other levels if zoned wrong"*, *"and a remove from plan, that drops it back into the list"*. Still shown as RC 1.0 (*"bring it though as RC 1.0"*).

- **A marker's menu** on a level's plan (right-click; on a tablet, press and hold) has five options:
  - **Open item page.**
  - **Make it multiples…** asks how many; the dialog shows the value each will get (e.g. $900.00 ÷ 3 = $300.00 each).
    - The extra ones appear as dashed pins in a column beside it, and at the top of To place.
    - Drag one to where it goes and pick its room from the room list, or type a new room.
    - A new item is made there, and the work order's sell price is shared equally by all of them, to the cent, logged on each.
    - Right-click a dashed pin to cancel the extra ones.
  - **Move to another level…** is for an item that was zoned wrong. It goes into that level's To place list in the same room, logged in its history as a Level change, and its PC date follows it.
  - **Remove from plan** takes its marker off; the item goes back into the To place list.
  - **Delete — a double-up** asks first and needs your PIN. The item comes out of the project, its share of the work order goes back to the rest, and the record is kept in `Project Saves/Deleted Items/`.
- **Limits on moving and deleting.** Move and Delete only work on an item nothing has happened to yet: no status, job notes, shop drawings, ITPs, orders, reworks, site measures, or schedule dates of its own (the PC date is fine). Otherwise they say what it has and change nothing.
- **Undo.** Every one of these can be undone straight away from the bar under the plan.
- **To place rows** have a menu too:
  - An unplaced item can be moved to another level or deleted.
  - A work order with no room can be **taken off the list**. It sits under "Taken off the list" and can be put back.
  - A work order already in a room can be made multiples.
- **The import page:** right-click (or press and hold) a line and choose **Leave this one out**. It isn't imported (a double-up, or not ours). "Put it back" undoes that before you import.
- Test: `run_projects_v40_marker_menu.js`.

**v39 (2026-09-29) — RC 1.0.** Andrew: *"ok, now change them all to version RC 1.0. and have that on the logos (small)"*.

- The app is now **RC 1.0** (release candidate 1.0) across the UTZLINE family. A small **RC 1.0** tag sits beside the logo in the header.
- The build number (v39) still counts up underneath, so installed copies pick up each update. It's also what the Windows installer "Setup RC 1.0" contains.

**v38 (2026-09-29) — Works offline for PDF imports (and as a desktop app); plan marker text 25% smaller.** Andrew: *"then i need an exe for projects"*, and *"make indicater text 25% smaller"* (the plan markers).

- **pdf.js is in the folder now.** `pdf.min.js` and `pdf.worker.min.js` (2.16.105, the same copies Site Measure ships) replace the cdnjs links. Importing a work order report, a floor plan or its labels no longer needs an internet connection. It's also what the Windows installer (UTZLINE Projects Setup v38.exe) runs.
- **Marker codes are 25% smaller** on the plan (24 instead of 32). They sit a little closer to their dot. Auto-placement uses the same size, so new markers go a little closer to their labels. Nothing saved changes.
- Tests: `run_projects_v35_placement.js` now checks 24; the WO import tests read the real PDFs with the local pdf.js.

**v37 (2026-09-29) — Import work orders: "How to read this report".** Andrew: *"on the import page, we need a way to map out the zones , wo numbers, etc. im thing you give me a selector for the first one where we can tell the app what the codes mean. as some of my imports dont work."* — with the 3749 New Mount Barker Hospital Work Order Cost Analysis, which v36 read as 0 rooms (all 246 work orders "with no room").

- **Why it failed.** v32's Cost Analysis reader only knew one room shape, "1-G.01 - Waiting Room" (a letters-only zone, then " - " before the name), and one joinery-code shape ("code - description"). The 3749 report's items are "2-C1.EQ.002 Dropoff - Cleanup" (zone C1, room EQ.002, no dash) and its work orders "15345-J.001 Stainless Steel Cleanup Bench…" (no dash).
- **Any room code now.** The item's code is read part by part: `C1.EQ.002` → parts C1, EQ and the room number 002; the name is the rest. Also read:
  - lists: "BH.001, 002 CHS" → one room each, the value shared, as before;
  - a list the PDF wrapped mid-number: "MH.036,04 0,044" → MH.036, MH.040, MH.044;
  - ranges, which stay one room: "PH.005-011 Receiving & Dispensing";
  - a number that starts the name ("IA.032 1 Bed Room Typical") stays in the name.
- **Joinery codes.** Read automatically: the v32 "code - description" shapes first, then a first word that looks like a joinery code (J.001, J.T.012/009, LW-01), keeping "J.923 & J.924" together.
- **The new "How to read this report" panel** (between Project info and the zone list) shows the report's first work order split into its parts:
  - The work order's parts: WO #, joinery code, description. The code has a selector: automatic / the first word / before " - " / no joinery codes (use the WO #).
  - The item's parts: item no. (not used), then each code part with a selector — **Zone (the level)**, **Zone, and in the room number**, **Part of the room number** or **Ignore** — then the room number(s) and the room name.
  - A "Reads as:" line: what that first line becomes, e.g. *WO 15345 · J.001 "Stainless Steel Cleanup Bench…" → zone C1, room EQ.002 Dropoff - Cleanup*.
  - Changing a selector re-reads every line of the report straight away (rooms, zones, the preview and the counts). No zone at all puts every room on one level ("All rooms (no zone)").
  - The choice is remembered for the project and used on the next import of a report with the same shape ("your saved choice for this project"); a report of another shape is worked out afresh.
- **How it reads by default.** A two-part code (3756's "G.01") keeps the zone in the room number ("G.01 - Waiting Room", unchanged from v32). A three-part code (3749's "C1.EQ.002") takes the first part as the zone and names the room from the rest ("EQ.002 Dropoff - Cleanup", the Work Order List import's naming). An existing item is still matched by room number.
- **3749 now reads as** 154 room lines holding 240 work orders over zones C1, F1, H1, H2, H3, H4. Only Travel and Allowances have no room (6, to drag onto the plan). 4 $0 Management lines are skipped.
- Test: `run_projects_v37_wo_format.js` (the real 3749 report). The 3756 test is unchanged and passes.

**v36 (2026-09-29) — History card: every edit and every step, with who and when.** Andrew: *"joinery summary page needs to list all edits an progress in date order. with edits show date time and user. we have edit history but that card needs to show all changes , by who and when"*.

- **What replaced it.** The joinery item page's **Edit history** card is now **History**. It lists, oldest first, each with its date and time and who did it:
  - **Created:** how the item was created (imported from the report, dropped on the plan from a work order, or added in Projects).
  - **Edits:** every edit, with each field's old and new value and the note.
  - **Status and job notes:** every status step, and every job note with its file's name.
  - **Schedule:** every schedule change, including the PC date, a date set in the Scheduler, and clearing it.
  - **Machining:** every cut (carcase, colour board, solid surface).
  - **Solid surface:** completion and the solid surface schedule.
  - **Shop drawings:** each sent and returned drawing. Who added it comes from the note the Scheduler v33 keeps beside each one; older drawings say "not recorded".
  - **Orders:** each order attached and received.
  - **Reworks:** every step and comment.
  - **Site measures:** each Site Measure save.
- **Newest first** flips the order, and this device remembers it.
- **Unreadable files.** A file that's still syncing only leaves that part out, and a note says what couldn't be read.
- **New items.** An item added in Projects now records who added it and when.
- The card reads only this one item's folders when the page opens (nothing project-wide), so it stays quick on a 4 GB tablet.
- Tests: `pdftest-projects/run_projects_v36_history.js` is new. `run_edit_joinery_item_pin_traceability.js` is updated for the new card.

**v35 (2026-09-28) — PC date, job details from the report, project manager list, markers beside the labels, Sent / Returned shop drawings.**

- **PC date.** Andrew: *"when setting up a project, ask what the pc date is for the project, then set that as the required delivery date with a comment of 'PC Date'"*.
  - Project info (and New Project) asks for the **PC date (practical completion)**, saved as `pcDate` in `project-meta.json`.
  - Every joinery item with no schedule of its own gets a schedule event in `Project Saves/Joinery Schedule/<item>/` with that date as its required delivery date and the note **"PC Date"**. It uses a 30 business-day lead, so every schedule app shows the date and works out delays with no change of its own.
  - Changing the PC date moves only the items still on "PC Date", keeping any lead time the Scheduler gave them. Items with a date set in the Scheduler are never touched. Clearing the PC date clears only those items, and setting it again brings them back.
  - Items added later get it too: WO import, Add item, and a work order dropped on the plan.
  - An item whose schedule file is mid-sync is skipped, and the toast says so. The next save of Project info catches it up.
  - The register and the item page show a small **PC Date** tag beside the date.
- **Job details from the work order report.** Andrew: *"the import can also give you the job #, (Job Id) Project (Job Description) and Builder (Customer) ignore project manage that will need to be picked from a list"*.
  - **Fill from work order report…** in the Project info / New Project dialog reads the report's first page: Job Id → Job number, Job Description → Project name, Customer → Builder. Both report layouts (Cost Analysis and Work Order List) work.
  - The WO import dialog shows the same three. A blank field is filled in; one that already says something else is only replaced if you tick it. A different Job # gets a warning ("Is it the right report?").
  - The report's Project Manager is never used.
- **Project manager is picked from a list.** It's one company-wide list in `utzline-project-managers.json` in the main folder.
  - It starts off with the PMs already on your projects.
  - **+ Add a project manager…** adds a name; **Remove from list** takes one off (projects that already have it keep it).
  - A project whose PM isn't on the list keeps it, shown as "(not on the list)".
- **Markers beside the plan's labels, not on them.** Andrew: *"the placement worked fantastic, only issue is it placews them directly over the labels, the labels are then unreadable, also the text is a bit small, need it about twice the size"*.
  - Importing a plan PDF now also stores the size of each label and the box of every piece of text on the plan.
  - Each marker goes left, right, above or below its tag (then a step further out). It takes the first spot where the marker, its amber ring and its code cover no text and no other marker. On A-104: 48 on their code tags, 1 by its room label, and none covering any text.
  - The amber markers v34 put on top of the labels move beside them the first time that level's plan is opened; a checked marker is never moved.
  - Marker codes were being drawn at 14 px (a style rule overrode their size). They're now drawn at their saved 32 px, about 2.3 times bigger. The saved markers are unchanged, so the other apps draw them as before.
- **Shop drawings: Sent and Returned.** Andrew: *"shop drawings need a sent and a returned section"*, *"we need the option to open all revisions, not just the latest one"*, *"we call them REV A REV B and so on"*.
  - The item page's Shop drawings card has **Sent** and **Returned** parts. Each shows its latest, with **All revisions (n)** / **All returned (n)** to open any earlier one.
  - Revisions read as REV A, B, C…; files saved as REV 0/1/2 show as A/B/C. Returned copies are kept in the drawing's own `Returned` folder (the Scheduler adds them).
- Tests (all in `pdftest-projects`):
  - New: `run_projects_v35_pc_date.js`, `run_projects_v35_pc_date_new_items.js`, `run_projects_v35_report_header.js`, `run_projects_v35_wo_job_info.js`, `run_projects_v35_pm_list.js`, `run_projects_v35_placement.js`, `run_projects_v35_placement_v34.js`, `run_projects_v35_shop_drawings.js`.
  - Updated: `run_projects_plan_labels_autoplace.js`, `run_project_create_naming.js`, `run_projects_wo_import.js`.

**v34 (2026-09-28) — The floor plan's own labels place the joinery items.** Andrew: *"do you think that the import could scan the floor plans and place the joinery items directly (with option to move if incorrect)"*, with the Jones Radiology plan A-104. A CAD-exported plan PDF keeps its labels as real text. On A-104, 49 of the 51 JG codes in the work order report are on the plan in a tag beside the joinery, and every room number (G.01–G.60) sits in the middle of its room.

- **Importing a floor plan PDF also reads its labels.**
  - Every short code-like word on the page (e.g. JG.31.2 or G.31) is read. Its position is worked out in the plan's own pixels, with rotation taken into account. On A-104 every one lands within 3 px of where it's printed.
  - The labels are saved in `Project Saves/Plan Labels/<Project> - <Level>.json`, not in the level file, so Site Measure's level saves can't drop them.
  - Replacing the plan replaces its labels, and a plan with no text (a scan or a picture) stores none. There's no OCR, so it stays light on 4 GB tablets.
- **Items are placed straight away, whichever order you import in.**
  - Importing a work order report places the new items on levels whose plan has labels.
  - Importing a plan places the items already waiting on that level.
  - Each item goes on its code's tag. If the plan doesn't show its code, it goes on its room number's label, stacked just under it. Anything neither can place stays in "To place".
  - A code shown more than once goes to the copy nearest its room. The work orders with no room still wait for you to drag them in.
  - Jones Radiology: 48 items on their tags, 1 (JG.31.1) on room G.31's label, and the 13 with no room left to place.
- **Checking them.**
  - Anything placed this way has a dashed **amber ring** until someone checks it, and the plan shows **Check placed (N)**.
  - That opens **Move markers** mode. **Drag** a marker if it's in the wrong place (its label moves with it; Undo is offered), **tap** it if it's right, or press **All look right**.
  - Move markers is also a button on every plan, for moving any marker. In Move mode a tap never adds an item, and the device Back button leaves Move mode first.
- **To place** shows **Place from the plan's labels** when there are unplaced items and the plan has labels. If the plan was imported before v34, it says to import the plan PDF again.
- New test: `pdftest-projects/run_projects_plan_labels_autoplace.js`. It uses the real A-104 plan and the 3756 report, checks every label against pdftotext's positions, and covers both import orders, Move mode, check, Undo, and Place from the plan's labels. Every Projects test passes (23/23).

**v33 (2026-09-28) — Rework register and item card show every app's rework changes.** Part of the rework round (Andrew: *"also need to fix this rework conflict. rework pdfs should be user datetime stamped. they should also show the entire status log per rework and have larger photos"*, and *"reworks that are delivered to be green border / text and sent to bottom of page (maybe a separate selectable delivered folder)"*). The apps now record each rework change as its own small file in the item's log folder instead of rewriting the shared rework file; Projects now reads those files (UTZLINE Rework Event Standard v1).

- **Rework Register** (Levels → Rework register):
  - Each rework's **State** comes from the rework file plus its log: Logged, Cut (Machine Schedule), Ready to deliver (Scheduler), Delivered (Delivery ITP, or the file), Closed out (Install ITP).
  - Outstanding reworks are listed first. **Delivered and closed-out reworks are green, in a separate "Delivered (N)" section at the bottom**, opened with its button.
  - New columns: State, Latest (the newest log line, e.g. "Comment: Sent to saw — Mark"). Delivered to site shows the date and who; Signed off date shows the close-out.
  - The State filter (replaces "Delivered to site") offers All (delivered listed at the bottom), Not yet delivered, Logged, Cut, Ready to deliver and Delivered to site. Level filter, search and column sorting work as before.
  - **Tapping a rework opens its rework page:** its details, photos (tap for full size), the full status log from every app, **Add a comment** (quick picks included; saved with your name, date and time as its own file), and **Print / Share**. Print and Share make that rework's own PDF (named with your name and the date-time), which is also saved beside the item's other rework PDFs.
  - **Item** on each row opens the joinery item page (Back returns to the register).
  - Refresh re-reads the reworks. A file still syncing is counted ("couldn't be read — Refresh in a moment"), never shown as empty.
  - Print / Save PDF and Share of the register itself now include State and Latest, outstanding first, then a green "Delivered / closed out" section.
- **Joinery item page, Rework card:** each rework with its state pill, latest log line and an **Open rework** button. Delivered ones are last and green. Below them the item's **rework PDFs**: per-rework ones first (newest first), then the older all-in-one file.
- Projects still never rewrites the shared rework file. A comment or a PDF is a new file of its own.
- 4 GB tablets: the register keeps no photo pixels. Photos are read only for the rework that is open and let go on Back.
- Device Back closes a full-size photo first, then the rework page.
- **Tests:** `pdftest-projects/run_rework_register.js` rewritten for v33 (flat + legacy files, events, filters, comment file, stamped PDF, Item button, item card, device Back, register PDF, shared files untouched). `run_rework_summary_card.js` updated for the new card.

**v32 (2026-09-28) — Import the Work Order Cost Analysis report, and drag the list onto the plan.** Andrew, with the job system's **Work Order Cost Analysis** PDF for 3756 Jones Radiology: *"use this for the work order imports, work order number - joinery code - joinery description, (taken from Work Order) room taken from item (G.01 - Waiting Rooms) etc, sell price is the dollar value"*, then *"the idea is you populate a list for us to drag and drop into position, the same way we do with delivery drop pins, this will be done in projects and set the locations, if the same joinery item is dropped in different rooms, then divide the total value by the number of times it has been dropped."*

- **Reading the Cost Analysis report** (detected by its Work Order / Item / Sell headings; the v31 Work Order List report still imports as before):
  - **Work Order** `15620-JG.01.1 - Island` + `Planter` gives WO 15620, code JG.01.1 and description "Island Planter". Wrapped lines are joined.
  - Finish codes read too: `WLLX-1 ( Natural Oak Ravine )` gives WLLX-1 "Natural Oak Ravine", and `WFSW - 2 (...)` gives WFSW-2. A line with no code gets `WO <number>` as its code.
  - **Item** `1-G.01 - Waiting` + `Room` gives the room "G.01 - Waiting Room" (the "1-" dropped). The zone is the letter before the dot (G), mapped to a level in the dialog as before.
    - A "/" in a room name becomes "&" (room names end up in file names): "G.18 - Bookings & Admin".
    - An existing room with the same number is reused, e.g. "G.02 Reception".
  - **Sell Price** is the item's **dollar value**.
  - The footer that shares a line with a wrapped row is dropped by its text. The report's own total checks out ($579,999.98 shown in the dialog).
  - Items that aren't rooms ("38-Wall Applied Finishes", "39-Additional Items") become work orders **with no room**. You drag them onto the plan and pick the room.
    - A room is suggested where the code says so: JG.01.4 suggests G.01; "G.34 - CT Imaging Control Room - 2 Door Base Cab" suggests G.34.
  - Lines with no code and no value (Project Management / Administration) are skipped.
- **Import** (sign-in and PIN, as v31):
  - Items in rooms are added with their sell price as the dollar value. An existing item gets its WO # and value filled in, logged in its edit history.
  - Every work order is recorded in the project's new work-order list, `Project Saves/Work Orders/work-orders.json`, including the ones with no room.
  - The button says e.g. "Import 50 items + 13 to place". A second import of the same report changes nothing. A re-import with new prices updates the values.
- **"To place (N)" on a level's plan**, the drag list:
  - Items on this level with no marker yet, grouped by room, each with its WO # and value.
  - "No room yet": the work orders with no room.
  - "Already in a room": drag one again to add it to another room.
  - **Dragging:** with a mouse, drag a row onto the plan. On a tablet, drag it by its ⠿ grip, or slide it sideways (sliding up and down scrolls the list). Letting go over the list does nothing. The v31 tap-a-row, tap-the-plan, Place here way still works.
  - Dropping an item places its marker at that exact point, in its own room.
  - Dropping a work order asks **which room**. The room of the nearest marker to the drop is suggested first, then its report room. Rooms it's already in are marked "already here". You can also type a new room.
  - **Dropped in more than one room, its sell price is shared equally, to the cent.** For example, $65,679.59 across 2 rooms is $32,839.80 + $32,839.79, and across 3 rooms is $21,893.20 / $21,893.20 / $21,893.19. Each change is logged in the item's edit history ("split across 2 rooms").
  - **Undo** sits in the bar under the plan for 12 seconds after each drop. It takes the marker off, removes the item that drop added, and re-shares the value.
  - Each drop writes joinery-items.json first, then the level file, so a failure never leaves a marker without its item.
  - Device Back closes the room picker, then the list.
- **Known limit:** the value is re-shared when a work order is dropped, undone or re-imported. Deleting one of its items some other way doesn't re-share until the next drop or import.
- **Tests:**
  - New: `pdftest-projects/run_projects_wo_cost_import.js` (the real 3756 report, 43 checks).
  - `run_projects_wo_import.js` (the v31 report) still passes with the new "To place" label. Every Projects test passes except `smoke_projects_v1_e2e.js`, which was already failing before this version.

**v31 (2026-09-28) — Import work orders (PDF) + pin-drop them on the plan:** Andrew: *"would it be possible to create a button in the projects app that can add this data. we would then pindrop these like we pindrop the delivery location"*. "This data" is the job system's **Work Order List** PDF: per room, each work order's WO #, joinery code and description.

- **Import work orders (PDF)** is on a project's Levels screen, next to Joinery Register. The app reads the PDF's own text by column position (no OCR):
  - The room heading, e.g. "2  C1.EQ.002 Dropoff - Cleanup".
  - Each WO line, e.g. "15345  J.001 Stainless Steel Cleanup…", with a wrapped description joined back up.
  - A heading repeated after a page break counts once.
  - Headings that aren't rooms (Management, Travel, Allowances) and lines without a joinery code are listed as skipped, never imported.
  - Tested on Andrew's real 13-page report: all 244 joinery work orders are accounted for (240 under rooms, 4 under "Travel").
- **Zones to levels.** "H1.AH.002 Reception" is zone H1 (Building H, Level 1), room AH.002. Each zone gets a level picker in the dialog ("— don't import —" by default); the choice is remembered per project on the device.
  - Rooms are named without the zone ("AH.002 Reception") so they match rooms already set up, and an existing room with the same number is reused.
  - A heading covering several rooms ("MH.028,035,039 …") gives one item per room by default (untick to keep it as one room). A range ("PH.005-011") stays one room.
  - The same code twice in one room (two work orders) becomes "J.T.017" and "J.T.017 2", the Add dialog's own suffix rule.
- **Existing items** (same level, room and code):
  - A missing WO # is filled in and logged in the item's edit history ("Imported from <file>", with your name).
  - The same WO # is left alone.
  - A different WO # is never overwritten; the preview shows it instead.
  - The preview shows every line's outcome before anything is written.
  - Import needs sign-in plus a PIN confirmation, like Edit item.
  - joinery-items.json and each level file are re-read strictly and written once each; new rooms are added to the level files.
  - Importing the same PDF again adds nothing.
- **Pin-drop.** A level's plan ("Place joinery items") shows **Unplaced (N)**: the level's items that have no marker yet, grouped by room and searchable.
  - Pick one, tap the plan (tap again to move it), then **Place here**. That's the delivery-location pin flow; it writes the marker to the level file.
  - It then moves straight on to the next unplaced item (same room first), so a whole import can be pinned in one pass. **Skip** and **Stop** are always there.
  - Plan taps still add items as before when you're not placing.
- Test: `pdftest-projects/run_projects_wo_import.js` runs against the real report (`fixture_wo_report_3749.pdf`).

**v30 (2026-09-27):** Hides the **Schedule Backups** folder from the project list. Scheduler v29 now keeps its daily spreadsheet backups in that folder, directly in the main Projects folder (Andrew: *"a schedule backups folder directly in the main folder ... I meant in the main folder. Not the individual projects folder."*). Every app lists every folder in the main folder as a project, so each one now leaves that folder out: `isReservedRootFolderName`, the same one-line rule in every app. Tested across all 11 apps by `pdftest-projects/run_schedule_backups_folder_hidden.js`, which fails on every app's previous build and passes on the new ones. A new project is also never given that folder name: creating a project called "Schedule Backups" gets "Schedule Backups 2", and so on, whether or not the folder exists yet.

**v29 review fix (same build):** the Sub Orders filename now uses Sub Orders' own `"file"` fallback for a blank level/room/code name, where this app's `sanitizeFileBase` falls back to `"plan"` — so an item with a blank room never found its orders (latent since v27; spotted while reviewing Scheduler v27's copy of the same code).

**v29 (2026-09-27) — Mark sub orders as received:** Andrew, verbatim: *"ok now we need all joinery summary pages to show the associated orders. with the option to mark them as recieved."* This app already showed the associated orders (the v27/v28 "Sub orders" card on the Joinery Item page); what was missing was the "mark as received" option. Each order row now has a **Received** tick box + date, the exact interaction Sub Orders' own View Orders list uses: unticked, the date is hidden; ticking fills in today's date if it's empty, shows it and saves straight away; unticking clears the order back to not received (`received: false`, `receivedDate: null`) and saves; changing the date while ticked saves the new date. The tick box's own label *is* the row's status line — "Received 27 Sep 2026" / "Not yet received" — repainted in place from what was actually written, so a row never shows a static indicator beside a control that could disagree with it (and a failed save snaps the controls straight back to the last state known to be on disk).

- **The card's first write, scoped as tightly as possible.** New `setSubOrderReceived` re-reads Sub Orders' own `Project Saves/UTZLINE Sub Orders/Orders/<Level> - <Room> - <JoineryId>.json` fresh (never the card's in-memory copy — Sub Orders itself or another device may have changed it since the page painted), finds the order by `id`, replaces it with a **shallow copy of the raw on-disk entry** with only `received`/`receivedDate` changed, and writes the whole array back in the same `JSON.stringify(data, null, 2)` shape Sub Orders' own `writeJsonFile` uses. Never an explicit field list, and never the card's own `subOrderWithHandle` display object (an allowlist that also carries a non-serialisable file handle): Sub Orders' own `setOrderReceived` was fixed today (Sub Orders v5) precisely because its allowlist silently dropped `typeLabel`, and this app's `subOrderWithHandle` had the same bug class in v28 — a shallow copy carries every field Sub Orders writes, including ones it hasn't invented yet. Sub Orders' `Inbox/` and `Files/` are never written (`Files/` is still only read, for each row's Open button), and simply viewing the card still writes nothing at all.
- **"Unreadable is not empty"** (the v23 rule every read-modify-write in this app follows): a missing folder/file or an order id no longer in the file means the order was unattached in the meantime — the save writes nothing, says "That order isn't attached to this item any more — nothing was changed.", and repaints the card from disk. Any other read failure retries once after 600 ms, then shows the shared "Couldn't read this item's sub orders (still syncing?) — nothing was changed" toast, with no write. The file is re-fetched with `create: false` for the write, so one removed between the read and the write is never re-created.
- **Not PIN-gated, by decision.** The v18 PIN gate protects edits to the item's own register data (description, work order, dollar value, Solid Surface flag — each traced in `editHistory[]`). Marking an order received is an operational receive action, like ticking off a delivery, on data Sub Orders owns rather than this app's register; Sub Orders itself, both ITPs, Site Measure/Viewer and Scheduler all allow it ungated in this same round, and this app has no view-only mode that would otherwise hide the card from anyone. Documented in the card's own top-of-HTML comment.
- Tests: new `run_sub_orders_mark_received.js` (tick/untick/date edit writing through to the real Orders file, every other field — including the custom "Glass" order's `typeLabel` and a made-up future field — preserved, status text updated in place, Inbox/Files byte-for-byte unchanged, viewing alone writes nothing, unreadable file writes nothing, unattached-meanwhile writes nothing); `run_sub_orders_summary_card.js` passes unchanged against the new row shape (the status line it checks is now the tick box's own label) and still proves viewing never writes; its header comment updated to match. Every Projects-app test in `pdftest-projects/` re-run clean (the long-superseded `smoke_projects_v1_e2e.js` still fails as documented in its own header, unchanged).

**v28 (2026-09-27) — Sub orders card follow-up for custom order types:** Sub Orders itself shipped a v4 the same day letting Andrew add custom order-type categories beyond the original fixed four (see that app's own README). This app's read-only "Sub orders" card now renders a custom type gracefully instead of falling back to its raw storage key: it prefers the `typeLabel` Sub Orders snapshots onto each order (so a custom category's real name shows correctly here without this app needing its own copy of the custom-types registry) and gives any non-base type the same neutral, label-forward `.so-type-custom` chip style Sub Orders itself uses, rather than guessing at a colour class that doesn't exist. Caught in testing before shipping: `subOrderWithHandle`'s field allowlist (the function that turns each raw order record into the plain object this card renders) didn't copy `typeLabel` across, so a custom type's real name was silently dropped in favour of its raw key — fixed by adding it to that allowlist alongside the other passthrough fields. No change to what this card reads or when — still read-only, still `readSubOrdersForItem`, still Site Measure/Viewer/ITP queued for their own future rounds.

**v27 (2026-09-27) — Sub orders card (first cross-app wiring for the new Sub Orders app):** Andrew, verbatim, right after the standalone **UTZLINE Sub Orders** app shipped its own v1/v2/v3 the same day: *"now i want to be able to see these orders in the joinery summary pages categorised and openable, do one app first."* This app is that "one app" — a new, read-only **"Sub orders"** card on the Joinery Item page, alongside the existing Shop drawings/Job notes/ITPs/Rework/Delivery location cards.

- Reads Sub Orders' own `Project Saves/UTZLINE Sub Orders/Orders/<Level> - <Room> - <JoineryId>.json` (`readSubOrdersForItem`) — this app never writes order data, only Sub Orders does, exactly like every other cross-app branch on this page (Rework, Solid Surface Completion).
- **"Categorised"** = grouped under a heading per order type (Steel/Upholstery/Timber/Aluminium, the fixed order and the exact colours Sub Orders itself uses — `#3987e5`/`#d95926`/`#199e70`/`#c98500` — for visual consistency between the two apps; every chip still always carries its text label, never colour-only).
- **"Openable"** = the same `docRow`/`openLinkedFileHandle` Open-button pattern every other linked-document card on this page already uses, resolving each order's file straight out of Sub Orders' own `Files/` folder. A file that's gone missing just hides that one row's Open button rather than failing the whole card.
- Each order row also shows required-by date, supplier/PO/notes, and received status (Sub Orders' own v3 "mark as received" field).
- Per the standing per-app process note ("all these notes are to be fixed when we update an app, per app not as a whole long fix"), this is the first of the family's other apps to get this — Site Measure/Viewer/ITP are still queued, one app at a time, on their own future updates (see `NEXT_RUN_NOTES.md`).

**v26 (2026-09-26) — bug fix:** Andrew, verbatim: *"when you put in dollar value in the edit card and press save, it says nothing to save and doesnt put in the dollar value."* Root cause found and fixed: `editItemSaveBtn`'s own success handler copied `description`/`workOrderNo`/`hasSolidSurface`/`editHistory` back onto the in-memory item after a successful save, but `dollarValue` — added in v25 — was missing from that list. The write to `joinery-items.json` itself was always correct; what broke was the on-screen item never picking up the new value afterwards, so the Joinery Item page/Register kept showing "—" right after a successful save. Reopening Edit and saving the exact same value again then hit `applyJoineryItemEdit`'s own fresh-disk diff, which correctly found nothing had actually changed and said so ("No changes to save") — reading, from the value never visibly appearing, as if saving had silently failed both times. Fixed with a one-line addition (`item.dollarValue = result.item.dollarValue;`); confirmed with a targeted repro (type a value, save, dollar value now shows immediately with no navigation needed; reopening Edit pre-fills the saved value; re-saving the same value now correctly and unconfusingly says "No changes to save"). Full relevant regression suite re-run clean (edit/PIN traceability, delivery/work-order backfill, solid surface flag, back-button sweep, IndexedDB single-connection sweep, unreadable-not-empty sweep).

**v25 (2026-09-26):** Andrew's own queued NEXT_RUN_NOTES.md items that apply to this app specifically ("ok now make all the adjustment to projects") — every item below is scoped to UTZLINE Projects only, per the standing process note that a multi-app item ships per-app on that app's own next update, not as one shared cross-app change. Every other still-queued item (Scheduler-family zoom/freeze work, the ITP sign-off PIN gate, the Site Measure/Viewer context-menu restyle, etc.) is untouched — those ship on their own apps' own future rounds.

1. **Icon revert** (Andrew: "revert machined icon to the cog" / "lets revert to the factory icon" for `in_manufacture`) — `joineryStatusIcon`'s `machined` case is back to ⚙️ (was 🪚) and `in_manufacture` is back to 🏭 (was 🔨), undoing this same day's earlier icon-sweep round for this app. The Has-Solid-Surface-badge comment listing every status icon was updated to match.
2. **Rework Register** (Andrew: *"rework register needs these colums, change recieved to delivered to site... also the rewok register to have a closed out column. delivered is blue, signed off is green, red is only for outstanding (not yet)"*) — the "Received" column, its filter, and its options are relabelled "Delivered to site"/"Not yet delivered" (same underlying `entry.received`/`entry.receivedDate` fields; the photo+pin-drop capture requirement is Delivery ITP's own build, still queued there). A new **"Signed off date"** column reads Install ITP's existing `entry.closedAt` ("closed out")/`closedBy`, which this Register never displayed before. Colour scheme: red text for "Not yet delivered" (outstanding), blue for "Delivered to site", green for a set Signed off date — scoped to this table only (the Joinery Item page's own Rework card keeps its existing styling). The Print/Share PDF export gained the same rename + new column + colours.
3. **Room detail page** (Andrew: *"when clicking on rooms in the projects app, the page it opens is empty, it should show a selectable list of joinery items in the room"*) — was a dead end (static explanatory text only). Now reads this project's `joinery-items.json`, filters to the room just opened (level+room match), and renders a selectable list; tapping a row opens the same Joinery Item page every other entry point uses (`openJoineryItemPage(item, "roomDetail")`), so Back returns here, and an edit made there re-reads this room's list on return.
4. **Joinery Item page meta-grid** (Andrew: *"put the status at the top of this card and increase the font and icon... make the text and icon 25px"*) — Status now leads the grid (was 5th of 7 rows) and its row is sized to exactly 25px (text + icon), via a dedicated `.status-cell-lg` class rather than changing the grid's own shared 14px base size.
5. **Dollar value** (Andrew: *"add dollar value to projects, joinery input page"*, confirmed editable, *"we will use this later to build a progress claims app"*) — new "Dollar value ($)" field on both the Add and Edit joinery item dialogs (`dollarValue`, a plain number; blank/invalid reads as 0 rather than blocking Save), fully traceable through the same `editHistory[]` mechanism as Description/Work order #/Has Solid Surface. Also shown on the Joinery Item page's own meta-grid, as a new Joinery Register column (sortable), and as a per-project **total dollar value** line under the Register's own heading (summed across every item in the project, independent of whatever filters are currently applied). Two open questions from the note (whether to display it day-to-day, and whether a per-project total was wanted) are resolved by this build in favour of showing both — reversible if that turns out to be more than wanted. The visibility-restriction idea Andrew raised and then dropped ("lets ignore that one for now") is not part of this build.

Existing regression suite re-run against the relevant tests (rework register, edit/PIN traceability, register sweep tests — back button, hide-tickboxes, IndexedDB connections, instant-paint cache, unreadable-not-empty —, solid surface completion, status history popup, delivery/work-order backfill, delivery ITP pin-drop, project creation naming, overlay card, smoke e2e): all pass. One pre-existing test (`run_delivery_status_and_wo_backfill.js`) had its Register column indices updated for the new Dollar value column (Delivery shifted from index 6 to 7); one pre-existing, unrelated failure (`smoke_projects_v1_e2e.js`, referencing a `#roomPlanStatus` element that hasn't existed in this app since well before this round) is untouched, matching this app's own established "same pre-existing, unrelated failures" convention.

**v24 (2026-09-26):** Read-only side of this round's brand-new, family-wide event-sourced "Solid Surface Completion" file (`BIG_ROUND_SCHEMA.md` sec 1) — two independent, per-item, PIN-locked-after-first-set boolean flags ("Completed"/"Delivered"), owned and written ONLY by the sibling **UTZLINE Solid Surface Schedule** app (built in parallel this same round, same setup as Machine Schedule's carcase-cut tracking), filed under `Project Saves/Solid Surface Completion/<key>/` — one immutable event file per change, folded with `foldSolidSurfaceCompletion` (ported byte-for-byte from the schema doc's own Machine Schedule mirror). This app is strictly read-only here, exactly like every other cross-app branch on the Joinery Item page, and entirely separate from this app's own `joinery-status.json` pipeline (the existing "Actual delivery" Register column is untouched).

Two new read-only surfaces, both built against `readSolidSurfaceCompletionRecordForItem(projectHandle, level, room, joineryId)` — the exact per-item strict reader named in the schema doc, mirroring Solid Surface Schedule's own `readMainScheduleRecordForItem`: every event file for the item must read cleanly or this rejects `read_failed` (one retry first), since a partial fold here would be actively wrong, not just late.

1. A new **"Solid Surface completion"** card on the Joinery Item page (same `<div class="card"><h2 class="section-title">…</h2><div id="…List"></div></div>` pattern as the neighbouring Site Measure overlays/Shop drawings/Job notes/ITPs cards), showing "Completed: <date> — <who>" / "Delivered: <date> — <who>", or "Not yet marked" for either flag never set. Gated on the item's own `hasSolidSurface` flag (this app's own hand-off point to the sibling app) — an item that will never go through that schedule never shows the card at all, rather than showing "Not yet marked" on every ordinary item.
2. Two new Joinery Register columns, **"SS Completed"** and **"SS Delivered"** (after the existing Delivery column — both flags got their own column rather than one combined cell, for the same at-a-glance scanability as the existing Status/Delivery columns), each a compact "✓ <date>" or "—". The Register's own bulk display uses a separate, soft/cached bulk reader (`readSolidSurfaceCompletions`, through the same folded-event cache `readJoineryStatuses`/`readJoinerySchedule` already use) rather than the strict per-item one above — a mid-sync event file for one row is left out of just that row's fold rather than failing the whole Register open over one bad file somewhere in a large project, the same soft/cached treatment this app already gives every other pure-display, project-wide cross-reference (documented at `readSolidSurfaceCompletions`'s own definition).

New regression test `run_solid_surface_completion_card_and_column.js` (`pdftest-projects/`) covers: both flags populated (card + both Register columns); an item with no events at all ("Not yet marked" / "—", the common case); an item NOT flagged `hasSolidSurface` even though a real Completed event sits on disk for it (card stays hidden regardless — gating is purely on the item's own flag); a flag marked done then reverted back to pending (latest event wins, folds back to "Not yet marked", not a stale "done"); and an item with one readable event plus one genuinely unreadable event file, where the Joinery Item page's strict reader rejects the whole card with a "couldn't read" message while the Register's own soft bulk reader shows the one readable flag and "—" for the unreadable one — plus confirming every seeded event file is byte-for-byte unchanged afterward (this app never writes to this branch).

Also, family-wide cosmetic status-icon swap (schema sec 4, cosmetic only): `in_manufacture` ("In manufacture") 🏭→🔨, `machined` ("Machined") ⚙️→🪚, in `joineryStatusIcon` (the only place in this app's `index.html` using either literal glyph, confirmed by grep — the Has Solid Surface diamond badge's own comment listing every status glyph was updated to match). `service-worker.js` cache bumped to `utzline-projects-cache-v32`.

**v23 (2026-09-26):** Family-wide scheduling sweep — Andrew, verbatim: *"ok, now a full sweep of all the scheduling software"*, then *"then do UTZLINE projects"*. Same family fixes as UTZLINE Scheduler v19 / Site Measure v46 / Install ITP v35, applied here where they apply, the same classes of bug audited, the tablet made faster, and ordinary bugs fixed along the way. This app is the family's hub — it WRITES the level files (`Project Saves/Floor Plans/<Project> - <Level>.json`) and `joinery-items.json` that every other app reads — so the "unreadable is not empty" audit was the most important part. No file format or filename that another app reads or writes has changed.

*Unreadable is not empty (data safety).* On a Dropbox-synced Android folder a file mid-sync reads as unreadable or truncated for a moment. Before this build every such read quietly became "nothing there", and these paths then wrote from that empty state: **Import floor plan**, **Add joinery item**, **New Room** and **New Level** each rewrote a level file from `{rooms:[], markers:[]}`, which would wipe every room, marker and Site Measure drawing on that level. Add joinery item also rewrote `joinery-items.json` holding only the new item. The legacy-level migration would re-write every level from the frozen pre-cutover folders if the level files happened to be unreadable. "Add a new name" rewrote `utzline-users.csv` with only the new name. **Edit project info** opened blank and saved blanks over `project-meta.json`. The legacy `joinery-status.json` / `joinery-schedule.json` migrations created an empty events folder, after which no app would ever read those files again. Now every one of those reads tells the two cases apart (`readTextFileStrict` / `readJsonArrayFileStrict`, same shape as Site Measure v46's `readFlatLevelFileByName`). A NotFound file is genuinely absent, so starting fresh is fine. Any other failure is retried once after 600 ms; if it still fails, the app shows "Couldn't read … (still syncing?) — nothing was changed" and **writes nothing**. Add joinery item now reads the level file and `joinery-items.json` together before writing either, and the marker only appears on the plan after both writes land. The legacy-level migration now decides "already migrated?" from whether Floor Plans holds any file at all, and reads every legacy source before writing any (the old "write a bare level on failure" fallback is gone, because that bare file *was* the data loss). The status/schedule migrations read the legacy file first and create the events folder only after a clean read. `writeLevelFile` itself refuses to write an empty level over one with content (`blank_over_real_level`, same guard as Site Measure v46's `saveFlatLevelFile`). A PIN check against an unreadable registry now says it couldn't read it, not "Incorrect PIN". The level list says "Couldn't read this project's info" instead of the misleading "no metadata yet". Pure-display reads (ITP summaries, overlays, shop drawings, job notes, rework, single status events) still fail soft, with a comment saying so, because nothing is ever written from them.

*Family fixes.* **One IndexedDB connection per database** (`idbConnP` / `identityConnP`, Install ITP's shape). The old `idbOpen()` opened a new connection on every call and never closed it, the "slows down after a little use" cause. **The phone / browser Back button walks back through the app** (`navRecord`, `closeAnyOpenOverlay`, `appBackFromDeviceButton`). The project list, setup and reconnect screens are the base (Back leaves the app, as before). Levels, rooms, room, plan canvas, Joinery Register, Rework Register and item page each add one history step. Back closes any open dialog or popover first, through its own Cancel control (topmost first, so the numberpad closes before the Edit dialog under it), and otherwise steps back exactly one screen. Every step back shows its target screen immediately and refreshes it behind, so one press is always one screen. The image-crop dialog gained a **Cancel** button, because without it Back would have imported the photo.

*Speed ("icon caching like we just did").* **Instant paint:** the project list, a project's levels plus project info, and its Joinery Register now paint at once from a device-local IndexedDB snapshot (or, coming Back, from what they already show), with a "refreshing…" note, then refresh from the folder and repaint. A snapshot is display-only and nothing is ever written from one. **Level-name stat cache** (Site Measure v46's `listFlatLevelNames`): listing levels used to parse every multi-MB level file just for its name, on every visit. Now files are stat'ed in parallel and only a new or changed file is read. Opening a level also reads its file once (it used to be read twice), and browsing into an existing room no longer reads it at all. **Directory-handle cache** (`getCachedDir` / `projectDir`): the fixed Project Saves / PDF Files branch walks behind every Joinery Item page card, and the status and schedule readers, resolve once per session. **Folded-event cache** (Scheduler v19's `readFoldedEventBranch`): each item's status/schedule fold is remembered against its immutable event-file names and only re-read when a new event arrives. Item folders are read straight from the listing (no named lookup per item). The legacy migrations are memoised per session. project-meta.json and the level listing are read in parallel. An item page opened from a live Register reuses its statuses and schedules instead of re-reading the whole project. Register and Rework Register searches are debounced. Plan pan and pinch write the SVG transform at most once per animation frame.

*Robustness (Android).* The plan canvas swallows the long-press context menu and is `user-select:none` / `-webkit-touch-callout:none`. Buttons, list rows and Register rows are `touch-action: manipulation`. On a touch screen, tapping a Register status cell used to open the history popover (via the compatibility mouseenter) and close it again (via the click), so it just flickered. Hover is now for a real mouse only, and a click toggles only a popover that a click opened.

*Filter tick boxes (2026-09-26 addendum, same v23 build).* Andrew, mid-sweep, verbatim: *"add in tick boxes for filtering out installed and delivered items. Also machining filter out machined with a tickbox"* (the machined box belongs to UTZLINE Machine Schedule, not here). The Joinery Register now has **"Hide delivered"** and **"Hide installed"** tick boxes under its filters. Ticked means rows whose *current folded status* is exactly that stage are left out. Installed outranks delivered in the pipeline, so each box hides only its own stage, and ticking both hides both. Both default to unticked. Each box is remembered per device in `localStorage` (`utzline-projects:register:hideDelivered` / `…:hideInstalled`). This is best-effort: blocked or cleared storage just reads as unticked. Filtering is purely in memory, never a re-read (the test counts folder calls), and the level/status dropdowns and search still apply on top. A new "Showing N of M items" line follows what's actually visible (plain "M items" when nothing is hidden). The Rework Register lists rework *entries*, which have no pipeline status, so it gets no such boxes.

*Bugs found and fixed along the way:*
- Choosing the Projects folder failed outright (setup screen, "Couldn't open the folder picker") whenever remembering the folder handle in IndexedDB failed. That persist is a convenience, so a failure is now logged and the session carries on. The dir cache and all project-scoped screen state are also reset on a new root.
- The plan canvas briefly showed the previous level's plan (and accepted taps on it) under the new level's title while loading.
- An unreadable level file on "Place joinery items" opened an empty plan that tap-to-add would have written a fresh level from. It now backs out with a toast.
- Unhandled promise rejections: the marker tap, opening the Add joinery item dialog, and Reconnect.
- A new joinery item's marker was drawn before its save; a failed save left a marker that existed nowhere.
- Switching project didn't clear the previous project's Register / item-page state.
- The company logo was re-read (and a new object URL created) on every Back to the project list. It is now read once per root per session.
- The Joinery Item page's "Required delivery" stayed on "Loading…" forever if the schedule read failed.

*Noticed, deliberately left alone:* the Joinery Item page's Shop drawings / Job notes cards list their documents with an empty state rather than offering a "View" button, so Andrew's "only show view shop drawing or view job notes button if there is one applied" rule has nothing to hide here. There is no "Timings"/debug UI in this app. `smoke_projects_v1_e2e.js` (not one of this app's listed tests) fails identically on v22: it looks for a `#roomPlanStatus` element removed in the 2026-09-22 flat-structure cutover.

*Tests (`pdftest-projects/`).* Five new: `run_projects_sweep_back_button.js` (the real `goBack()` walk through every screen, dialogs/popover/numberpad-over-dialog/crop closing first, nothing written), `run_projects_sweep_idb_single_connection.js` (`indexedDB.open` wrapped and counted across a whole session including a PIN-confirmed edit: exactly one open per database), `run_projects_sweep_unreadable_not_empty.js` (11 cases, each a real file that exists but can't be read, byte-for-byte unchanged afterwards, plus a one-off transient failure that the retry gets past), `run_projects_sweep_instant_paint_cache.js` (snapshots saved; zero level-file body reads on the second listing; item page reusing the live Register's statuses; after a reload with every project-level read made to hang, the project list, levels and Register still paint their last-known content) and `run_projects_sweep_hide_tickboxes.js`. The two long-failing tests are fixed as **stale expectations, not app bugs**. `run_solid_surface_flag.js` and `run_delivery_status_and_wo_backfill.js` both drove the inline "Has Solid Surface" checkbox and "Add work order #" backfill button that v18 deliberately replaced with the PIN-gated Edit dialog (v18's own entry records that these assertions were superseded). Both now drive the same outcomes through that dialog; their delivery-column / badge / persistence / sibling-untouched checks are unchanged. All 9 existing tests for this app plus the 5 new ones pass (14/14), and `smoke_projects_v3_flatstructure_e2e.js` passes too. `service-worker.js` cache bumped to `utzline-projects-cache-v31`.

**v22 (2026-09-24):** the Rework card's own "open the rework pdf" row — Round 2 (part 2) of the Joinery Item page overhaul, continuing v21's own request. Andrew, verbatim: "the rework section can open the rework pdf to view. any rework images for this joinery item get attached to that rework pdf." Install ITP now regenerates one cumulative rework PDF per item on every rework change (see its own v22 changelog entry) — this app's Rework card reads that same fixed, un-timestamped filename (`readReworkPdfForItem`, resolving to null both when nothing's been logged yet and once the last entry's been deleted and Install ITP has removed its own PDF again) and shows an "Open" row for it, same `docRow` pattern as every other linked document on this page, right above the entry list. Per-entry photo thumbnails no longer render inline in that entry list — they now live only in the PDF, same reasoning as v21's own Photos-card removal — the cabinet number/text/received-status summary is otherwise unchanged. `run_rework_summary_card.js` (`pdftest-projects/`) updated to seed a rework PDF alongside its existing rework JSON fixture and check for the new "Rework PDF" open row (and its absence for an item with no rework at all), plus confirms the entry summary no longer renders any inline photos. `service-worker.js` cache bumped to `utzline-projects-cache-v30`.

**v21 (2026-09-24):** Andrew, sending two screenshots (this app's own Joinery Item page, and a Site Measure plan view with a pink/magenta tint) together with a large multi-part request. The two parts of it that land in this app: "the joinery status page needs finishing (image attached), it currently does not show the site measure overlay. this should come from joinery item (image)" and "Photos card is not required here, as they are attached to each relevant itp / report." The "Site Measure overlays" card (previously a placeholder saying this would come "in a later step") now reads every permanent overlay Site Measure has saved for this item and shows the single most recent one's flattened preview image — `overlaySnapshotDataURL`, a new field Site Measure itself now writes into each overlay file at Save time (see that app's own v45.14 changelog entry) — with a "who, when" caption, and a note when earlier saves exist too ("open Site Measure to see every layer"). An item saved before that snapshot field existed still shows up, just with a plain fallback line instead of a broken image; an item never measured shows the plain empty state. Read-only, same as every other card here — this app never writes an overlay, only Site Measure does (see `readLatestJoineryOverlayForItem`). The "Photos" card (the other remaining placeholder on this page) has been removed entirely — photos now live inside each item's own ITP/report PDFs instead. Covered by a new `run_site_measure_overlay_card.js` in `pdftest-projects/` (four items: a normal overlay with a snapshot, two overlays where the newer one must win, a legacy overlay with no snapshot field, and never-measured — plus confirming the Photos card heading is gone and this app never writes to the overlay file it reads). `service-worker.js` cache bumped to `utzline-projects-cache-v29`.

**v20 (2026-09-24):** joinery-schedule.json v2 — the third and final round of the safety-net work started with `joinery-status.json` v2 (v19, below) and continued with `machining-flags.json` v2 in UTZLINE Machine Schedule/Solid Surface Schedule. This round's file is UTZLINE Scheduler's own `joinery-schedule.json`, which this app reads (never writes) wherever a Joinery Item references its own delivery/manufacture schedule. Same fix shape as before, but this file's fold rule matches its own original write semantics, not the other two files': a schedule Save always writes every field together as one atomic whole, so there's no per-field merge — reading an item's schedule now means folding its event files (filed under `Project Saves/Joinery Schedule/<key>/`, `key` = this app's own `joineryItemKey(item)`) down to the single latest event by timestamp, with a "Clear" as that latest event meaning no current schedule, exactly as an absent record always meant. The old shared file is migrated automatically and losslessly (once, idempotently, using each historical record's own `updatedAt` timestamp) the first time any app in the family opens a project after this update, and left in place afterward, byte-for-byte untouched — migration is included here too, same reasoning as v19's own note, since this app is very often the first to touch a given project. Every existing display call site here is unchanged, just now folded from events instead of read off a shared array. This closes out the three follow-up rounds Andrew asked for on top of the original safety-net work. `service-worker.js` cache bumped to `utzline-projects-cache-v28`.

**v19 (2026-09-24):** joinery-status.json v2 — Andrew, verbatim, on the coming scale: "we will have 30 people using this app in different stages, all coming back to the same database... needs to be foolproof and nevel lose data. some of this will be done via dropbox upload after the fact." The shared `joinery-status.json` used to be one JSON array file, rewritten whole on every save — risky with up to 15 people across five apps, some syncing in late via Dropbox. Replaced with one small immutable event file per status change, filed under `Project Saves/Joinery Status/<key>/` (`key` = this app's own `joineryItemKey(item)`, the same plain, sanitized level+room+joineryId identity Job Notes already uses here) — two writers can never collide, and a late Dropbox sync can never overwrite a newer save regardless of arrival order. The old file is migrated automatically and losslessly (once, idempotently) the first time any app in the family opens a project after this update, and left in place afterward, untouched. This app is a pure read-only consumer of `joinery-status.json` (never writes it) — every existing display call site is unchanged, just now folded from events instead of read off a shared array; migration itself is included here too since this app, which creates and writes far more of a project's own files than any other in the family, is very often the first one to touch a given project after this update. `service-worker.js` cache bumped to `utzline-projects-cache-v27`.

**v18 (2026-09-24):** Andrew, verbatim: *"in utzline projects, need option to edit joinery item (if wrong information put in) this will need a pin to change for the current user. and changes will be traceable."* A real **Edit joinery item** flow on the Joinery Item page, replacing both the old one-way "Add work order #" backfill prompt and the old always-live, no-attribution "Has Solid Surface" checkbox. A single **"Edit item"** button opens a dialog covering exactly the three fields confirmed editable — **Description, Work order #, Has Solid Surface** — with Level/Room/Joinery ID shown dimmed for context only and never editable anywhere in this dialog (every sibling file in this family is keyed off that exact `(level, room, joineryId)` triple; a wrong one means delete-and-recreate the item, not an in-place fix here).

Saving is gated on **two** things, matching Andrew's own wording exactly ("need a pin to change for the current user" — being signed in on the device isn't by itself enough): (1) the device must already be signed in via this app's existing shared name+PIN identity system (added v10) — the dialog carries its own copy of the exact same "sign in" selector so it can prompt for this inline without leaving the page — and (2) that person's PIN must be **re-entered on the on-screen numberpad at the moment of saving**, every time, even if already signed in. A cancelled or wrong PIN rejects the whole edit with nothing written (same shake-and-retry numberpad UX as every other PIN step in this app family); a save with no actual changes skips the PIN step and the write entirely, so re-opening and re-saving an untouched item never pollutes the log.

A successful edit appends **one** entry to a new `editHistory[]` array on the `joinery-items.json` record: `{ at: <ISO timestamp>, by: <confirmed signed-in name>, changes: [{ field, from, to }, ...] }`, covering every field actually changed in that save (editing two fields at once is one history event with two `changes` entries, not two events) — mirroring `joinery-status.json`'s own established `history[]` convention. A new **"Edit history"** card on the Joinery Item page lists every past edit, newest first (date/time, who, old → new per field); an item never edited shows "No edits yet."

New regression test `run_edit_joinery_item_pin_traceability.js` (`pdftest-projects/`) covers: editing is blocked with a clear toast when nobody is signed in; attempting to save after signing in but cancelling the PIN confirmation writes nothing and shows a "nothing was saved" toast; a wrong PIN on the confirmation numberpad shakes/clears and does not apply the edit; a correct PIN applies exactly the changed fields to `joinery-items.json` and appends exactly one `editHistory` entry with the right `by`/`at`/`changes` (fields left unchanged are excluded); Level/Room/Joinery ID cannot be changed through the dialog (no inputs exist for them, only dimmed display text); the edit-history card renders correctly for an item with several past edits and shows "No edits yet" for a fresh one. `smoke_projects_v3_flatstructure_e2e.js` re-run clean afterward, zero regressions. Note: this intentionally supersedes (and breaks) the older `run_solid_surface_flag.js` and `run_delivery_status_and_wo_backfill.js` regression tests' own assertions about the now-removed inline checkbox/backfill-button UI — those affordances were deliberately replaced by the single gated Edit dialog above, per this same request. `service-worker.js` cache bumped to `utzline-projects-cache-v26`.

**v17 (2026-09-23):** Andrew, verbatim: *"we will also add a Solid Surface schedule that is a separate app. so when putting on the joinery item we can have a tick box for has Solid Surface. this then puts it on its own schedule."* A new plain boolean field on the `joinery-items.json` record, **`hasSolidSurface`** — absent/missing on every item written before this existed, read as `false` wherever it's checked, exactly `{ joineryId, description, level, room, status, workOrderNo, hasSolidSurface }`. Unlike every field the Add Joinery Item dialog itself sets (all set once at creation, never touched again) and unlike the work order # backfill (a narrow, fill-in-once-only exception), this is a genuine **two-way toggle**: a new "Has Solid Surface" checkbox on the Joinery Item page (`setJoineryItemHasSolidSurface`, same find-by-`(level, room, joineryId)`-triple / rewrite-whole-file pattern as `setJoineryItemWorkOrderNo`) can be switched on or off at any time, on any item — old or newly created — and takes effect immediately, with no separate Save step. No `by`/`at` attribution is recorded for this field: this app has no notion of "who is using it" anywhere in its own code (the status-history popup's `by` values come from Site Measure/the ITPs writing `joinery-status.json`, never from anything this app itself captures), and this is a plain item property, not a pipeline status change, so a bare boolean is all that's added here. The Joinery Register's Joinery ID column now shows a small diamond badge (◆) next to the ID for any item with the flag set, so Andrew can see at a glance which items have solid surface without opening each one — a new glyph, distinct from every existing status icon (📏🏭⚙️📦🚚🏆). This field is the hand-off point for the brand-new sibling app **UTZLINE Solid Surface Schedule**, which will read it to build its own per-item schedule; this app remains the sole writer of `joinery-items.json`, same as always.

New regression test `run_solid_surface_flag.js` (`pdftest-projects/`) covers: toggling the checkbox on from the Joinery Item page persists `hasSolidSurface: true` to `joinery-items.json`; the value survives closing and re-opening the item page; toggling it back off persists `hasSolidSurface: false` correctly too. `run_joinery_status_and_job_notes.js` re-run clean afterward as a broader smoke check, zero regressions. `service-worker.js` cache bumped to `utzline-projects-cache-v25`.

**v16 (2026-09-23):** Andrew, verbatim: *"Manufacture status needs to be split up into 2 parts. We need a machined and a manufactured tab. All traceable by user name. Machined to have its own app. Called machine schedule. This is where the machinist can mark off a joinery item as complete. It will add their name and date time to the system."* A new **"machined"** stage is inserted into the shared joinery-status pipeline, between "In manufacture" and "Ready to dispatch": Created → Check measured → In manufacture → **Machined (new, ⚙️)** → Ready to dispatch → Delivered → Installed. It's written exclusively by the brand-new sibling app **UTZLINE Machine Schedule** — the machinist marks an item complete there and it stamps their PIN-verified name plus the date/time into `joinery-status.json`'s `history[]`, same shape as every other stage. This app remains a purely **read-only** consumer of it, exactly as it already is for every other stage: `joineryStatusRank`/`joineryStatusLabel`/`joineryStatusIcon` are the only functions that needed the new case (plus renumbering the three stages after it), and everything downstream — the Joinery Register's status column, its status filter dropdown (built dynamically from whichever statuses are actually present in a project, sorted by rank — no hardcoded option list to update), and the hover/tap status-history popup — picked "Machined" up automatically with no further code changes. Also fixed a now-stale hardcoded rank threshold in `computeDelayInfo`'s "delivery overdue" check, which compared against the old `rank(installed) == 5`; bumped to `6` to match installed's new rank. (`rank(in_manufacture) == 2` was already correct, since that stage's own rank didn't move.) `service-worker.js` cache bumped to `utzline-projects-cache-v24`.

**v15 (2026-09-23):** Andrew, verbatim: *"Where there is a table it needs to open the full width of the screen. To minimise scrolling."* The Joinery Register and Rework Register screens now stretch to the full viewport width instead of being capped to this app's usual 640px centered content column — a new `.wide-table` CSS class (`max-width: none`) applied to just those two screens, following the same override pattern `.plan-canvas-screen` already established for the plan canvas. Their tables already filled their own container at `width:100%`; the container itself was the only thing holding them back. No other screen's width changed. `service-worker.js` cache bumped to `utzline-projects-cache-v23`. The identical fix shipped to UTZLINE Scheduler's own Overall Schedule and per-project Schedule screens the same day — see that app's own README.

**v14 (2026-09-23):** Andrew, verbatim: *"Projects to have a rework section per project where you can press a button and see a status list of all reworks for that project. Sortable, filterable and clicking on a rework takes you to that rework. Also need the ability to print the rework page or email / share it."* A new **Rework register** button on the Levels screen (next to Joinery Register) opens a project-wide table with one row per *rework entry* — not per joinery item, since a single item can log several — built by reading every item's own rework file (the same `readInstallReworkForItem` reader the Joinery Item page's own Rework card already uses, v13) and flattening the results, so no new folder-reading plumbing was needed.

- **Filterable** by level, by received status (yes/no), and free-text search (matches joinery ID, room, cabinet number, detail text, and who logged it).
- **Sortable** on every column (Level, Room, Joinery ID, Cabinet #, Detail, Logged, Received) by clicking its header, same toggle-direction convention as the Joinery Register; defaults to most-recently-logged first.
- **"Clicking on a rework takes you to that rework":** since Projects has no separate rework-detail screen (it's read-only for rework data), a row click opens that entry's own Joinery Item page and scrolls to/flashes the exact card (`pendingReworkHighlightId`, a new `data-rework-id` attribute on each rendered Rework card entry, and a 2.2s flash animation) rather than just landing on the item generically. "Back" from there returns to the Rework Register, not the Levels screen.
- **Print / Save PDF** and **Share…** — this app's first-ever PDF *export* (everything before this only ever *read* PDFs, via `pdf.js`, for importing floor plans). `jsPDF` is vendored locally here for the first time (`jspdf.umd.min.js`, the same file/convention Install/Manufacture/Delivery ITP already ship and precache), rather than a CDN import, so it keeps working fully offline once installed. Print builds a landscape PDF table of the currently filtered/sorted rows and opens it in a new tab — this app family has never had an in-app print stylesheet, so the browser's own PDF viewer handles the actual printing, same as every ITP app's own PDF export. Share ports Site Measure/Viewer's own `isShareSupported()`/`shareFile()`/`browserDownloadBlob()` pattern verbatim — the Share button only appears where the Web Share API can actually take a file, falling back to a plain download with an explanatory toast everywhere else. Neither the new-tab-PDF design for Print nor the Share-with-download-fallback behavior was separately confirmed with Andrew beyond his own wording above; both simply carry over conventions already established elsewhere in this app family.

New regression test `run_rework_register.js` (`pdftest-projects/`) covers: aggregation across multiple items (including one item with zero reworks contributing no rows, and items on two different levels); the level, received-status, and search filters individually; sorting by cabinet number in both directions; the click-through-and-highlight behavior landing on the exact entry clicked, its flash class clearing again afterward, and "Back" returning to the Register; and both Print and Share producing a real, non-empty `application/pdf` blob (spying on `window.open`/`navigator.share` rather than driving an actual OS share sheet or new-tab viewer headlessly). Full suite re-run clean afterward: 86/90 passing, zero regressions (same 4 pre-existing, unrelated `source.html` sandbox flakes as always). `service-worker.js` cache bumped to `utzline-projects-cache-v22`.

**v13 (2026-09-23):** Andrew, on Install ITP's new rework tracker: *"fully trackable via this system and via utzline projects summary pages per project."* The Joinery Item page gains a new, read-only **Rework** card (alongside Shop drawings/Job notes/ITPs/Delivery location) listing every rework entry Install ITP has logged for that item — cabinet number, free-text detail, attached photos, and its own independent "Received back on site" status with date — newest first, matching Install ITP's own history list ordering. Reads Install ITP's own `Project Saves/UTZLINE ITP/Install ITP Rework/` branch via the exact same `readItpChecklistRaw` walk every other ITP branch already uses on this page (`readInstallReworkForItem`), so no new folder-reading plumbing was needed — just one new reader function and one new card. This app never writes rework data; Install ITP is the only app that does. New regression test `run_rework_summary_card.js` (in Install ITP's own `pdftest-itp` suite, `run_rework_tracker.js` covers the tracker itself end to end). Full suite re-run clean afterward: 85/89 passing (same 4 pre-existing, unrelated `source.html` sandbox flakes as always). `service-worker.js` cache bumped to `utzline-projects-cache-v21`.

**v12 (2026-09-23):** Andrew, on the Register's own status-history popup: *"these status windows to show days between each process."* A gap marker now sits between each pair of consecutive history rows in the popup, showing the elapsed time between them — "Same day" for under a day, "1 day" (singular) for exactly one, otherwise "N days" (`formatDaysBetween`, wired into `showStatusHistoryPop`). No gap appears after the oldest (last) row, and an item with only one history entry shows that row with no gap marker at all. The identical change was made the same day to UTZLINE Scheduler's own ported copy of this same popup.

New regression test `run_status_history_popup_gaps.js` — the first dedicated test this popup has had in this suite at all (it shipped in v10/v11 with no test of its own) — covers both the base popup (every history entry newest-first with its icon/label/date/attribution) and the new gaps together: three exact, hand-picked gaps (6 hours → "Same day", 8 days exactly, 1 day exactly), a single-entry item showing no gap, and the pre-existing empty state for an untouched item, unaffected. Full suite re-run clean afterward: 84/84 passing, zero regressions (same 4 pre-existing, unrelated `source.html` sandbox flakes as always).

**v11 (2026-09-23):** Andrew, verbatim: *"in the project app joinery item status, we need to add the following items. Delivery ITP, All itps to be viewable from here (like job notes and shop drawings are)... Pin drop location button that takes you to it on the map / snapshot taken from the delivery itp."* Two changes:
1. The Joinery Item page's ITP card — renamed **ITPs**, was "Manufacture + Install ITP" — now also lists **Delivery ITP**, reading the exact same flat `Project Saves/UTZLINE ITP/Delivery ITP/` checklist + `PDF Files/UTZLINE ITP/Delivery ITP/` exports convention Install ITP and Manufacture ITP were already wired to here, so no new reader code was needed — just one more entry in the list (`readItpChecklistRaw`/`readItpChecklistSummary`/`listItpPdfsForItem` are all unchanged).
2. A new **Delivery location** card reads that same Delivery ITP checklist's own `deliveryLocationPin`/`locationSnapshot` fields (read-only, same file — `readDeliveryLocationForItem`) and, when a pin's been dropped for that item, shows the snapshot thumbnail plus a **Pin drop location** button. Clicking either jumps straight to that exact point on the item's own level plan — `openPlanCanvasForLevel` now accepts a raw `{x, y}` world point as an alternative to its original `{room, joineryId}` marker-lookup shape, since a delivery pin is placed by hand during delivery and isn't guaranteed to sit exactly on the item's own roomlink marker. An item with no pin at all (never touched by Delivery ITP, or its checklist opened but no location ever added) shows a plain "No delivery location pin recorded yet." line and no button, same convention as every other empty-state message on this page.

Also caught up in this release, unversioned until now: `listJobNotesForItem`'s own `jobNoteSortKey` (added the same day Site Measure/Viewer shipped v45.8) — this app only ever reads the shared Job Notes folder, never writes to it, so there was no filename format to change here, only this app's own sort key needed to keep finding the timestamp correctly now that Site Measure moved it from a filename prefix to a suffix.

New regression test `run_delivery_itp_and_pin_drop.js` (`pdftest-projects/`) covers: the ITP card's new title and Delivery ITP row (both "Signed off" with its exported PDF listed, and "Not started" for an item with no Delivery ITP checklist file at all yet); the Delivery location card showing the real thumbnail + button for an item with a genuine pin+snapshot, and the empty state with neither for one without; and — the important correctness check — that clicking "Pin drop location" centres the plan on the **pin's** own coordinates, reconstructed from the plan's post-click pan/zoom transform, and specifically NOT on the item's own roomlink marker's coordinates (seeded deliberately far apart in the test fixture so a wrong-point bug would be obviously caught). Full suite re-run clean afterward: 83/83 passing plus this new one, zero regressions (the pre-existing 4 sandbox SVG-rasterization flakes — `run_dead_backup_picker_removed.js`/`run_flat_structure_interop.js`/`run_level_backup_snapshots.js`/`run_view_snapshot_quality.js` — are unrelated to this app and unaffected, since this round never touches `source.html`).

**v10 (2026-09-23):** added the shared name+PIN identity selector, per
Andrew's own follow-up request, verbatim: *"implement the username as per
the delivery itp throughout the entire system, but instead of it opening a
popup, the button is the selector, when you pick a name it opens a
numberpad to input the pin (4 digit pin)."* Projects had no identity/name
feature of its own before this, so this is a brand-new addition here (not a
replacement of an older, simpler one, unlike the sibling apps this pattern
started on). A new `<select id="identitySelector">` on the Projects screen
— the button IS the selector — lists every known name plus "+ Add a new
name…"; picking an existing name opens an on-screen 0–9 numberpad to enter
its 4-digit PIN (wrong PIN shakes/clears for another attempt, right PIN
signs this device in); picking "+ Add a new name…" prompts for the name as
text, then the same numberpad twice (choose, then confirm) to set its PIN,
then a "show me in" app-tickbox list ("Projects" pre-checked) for Andrew's
own admin reference. Reads and writes the exact same shared registry every
other UTZLINE app in the family uses — the `utzline-identity` IndexedDB
database (one per-device name pointer, same DB/store/key names, since
IndexedDB is scoped per-origin) and `utzline-users.csv` at the Projects-root
level (`Name,PIN,ShowInApps`, plain CSV so Andrew can edit it directly) — so
a name set in Site Measure, Viewer, either ITP app, or here shows up
everywhere else too, and vice versa. This app doesn't yet stamp the signed-
in name into any saved file (nothing here plays Delivery ITP's "savedBy"
role yet), so for now this only gets a name recognised consistently across
the family; the hint text next to the selector says so honestly rather than
implying an attribution this build doesn't do.

**v9 (2026-09-23):** two additions, both requested alongside the new
UTZLINE Delivery ITP app. (1) **Delivery status surfaced read-only from
UTZLINE Scheduler's own `joinery-schedule.json`** — a "Required delivery"
line on the Joinery Item page and a new sortable "Delivery" column on the
Joinery Register, each showing the delivery date plus a delay cue ("On
track" / "Manufacture start overdue" / "Delivery overdue"), computed with
the exact same wording/severity as Scheduler's own delay logic so the two
apps never drift; an item with nothing scheduled yet shows a plain dash,
never an error. Projects never writes to this file — same read-only
relationship Scheduler already has with Projects' own files, just now
symmetric. (2) **A way to backfill a missing work order #** — the
one-and-only, deliberately narrow exception to this app's own
"every joinery-item field is set once at creation, never edited again"
rule: an item currently showing the "—" placeholder (created before the
work order # field existed) gets a small "Add work order #" action on
both the Register and the Joinery Item page; using it saves the value
directly to that item's record. An item that already has one shows no
edit action anywhere, ever — the "set once" guarantee holds for every
other case.

**v8 (2026-09-23):** added a required **Work order #** field to the Add
Joinery Item dialog, per Andrew's request ("Every single joinery item gets
its own work order #also. That we put in manually when as part of the
initial add joinery step"). Like every other field on that dialog
(Level/Room/Joinery ID/Description), it's set once at creation and has no
edit affordance afterward — no joinery item field anywhere in this app
family does. It's required going forward for every new item; an item
created before this field existed simply shows "—" wherever it's
displayed, with no retroactive backfill. It's stored on the item record as
`workOrderNo`, shown on the Joinery Item page and as a new sortable/
searchable column in the Joinery Register, and the same UTZLINE Scheduler
app reads it (display-only) for its own tables and search.

This folder is the self-contained, installable **UTZLINE Projects** app — the
**master application** in the UTZLINE family. It's where a project, its
levels and rooms, its metadata, and (eventually) every joinery item come
into existence; Site Measure, Viewer, Install ITP, Manufacture ITP and the
future Progress Viewer all read what Projects creates, but none of them
create it themselves once Projects has shipped in full (see "What's not
built yet" below — until then, Site Measure keeps its own creation UI).

**Unlike Site Measure/Viewer, this is NOT built from `source.html`.**
Site Measure and Viewer share one canonical source file because they're
really the same app (a plan-drawing canvas) in two modes. Projects is a
different kind of screen entirely — project/level/room setup and joinery-
item management, not a canvas — so, same reasoning as Install ITP's own
original build, it's its own small, purpose-built codebase (`index.html`)
with its own `manifest.json` and `service-worker.js`. There's no `build.py`
here and nothing to "rebuild" when you edit it directly; whatever's in
`index.html` is what ships.

It reads and writes the **same Projects folder** every other app in the
family uses — the same project → level → room folder structure, the same
reserved `saves`/`pdfs`/`backup` convention — so nothing about how a
project is organised has to change for any of the other apps to keep
working. See `index.html`'s own top-of-file comment for the full
folder-layout diagram and data-format rationale, and
`utzline-projects-v1-plan.md` (in the project) for the build plan this app
is being built against.

## What it does

1. Choose the Projects folder (same one as every other app) — the folder
   handle is remembered, same reconnect-after-permission-reset flow as the
   others.
2. Browse Project → Level → Room. Levels and rooms show whether they
   already have a floorplan saved (a simple yes/no status), and a project
   with existing `project-meta.json` shows a read-only preview of its
   metadata (Project No./Name/Client/Builder/Site address/Project manager —
   older projects only have No./Name/Builder, which is all that shows).
3. **Create Project** — types a name, gets a numbered suffix if it collides
   with an existing project, then is prompted straight away for its
   **Project info** (Project name/number/Client/Builder/Site address/
   Project manager — skippable, editable later from the level list via
   "Edit project info"). Writes `project-meta.json` with those six fields
   plus Site Measure's own three original keys (`no`/`name`/`contractor`)
   kept exactly as-is, since Site Measure hasn't been cut over yet and
   still reads/writes that file too.
4. **Company logo** — a single company-wide logo, set once from the
   project list screen ("Choose logo image"), stored as `company-logo.png`
   at the Projects root (a file, not a folder, so it never shows up in
   anyone's project list). Not per-project — the same logo applies to
   every project.

5. **Create Level / Create Room** — same numbered-suffix dedupe as Create
   Project, and the same `ensureWorkFolders` call (making `saves`/`pdfs`/
   `backup` exist) that Site Measure's own `openLevelFromHandle`/`openRoom`
   already make on every open — so a level/room created here looks, to Site
   Measure, Viewer, and both ITP apps, exactly like one Site Measure itself
   would have created.

6. **Import floor plan** — for both a level and a room: pick a photo (crop
   before use, or "Use whole photo") or a PDF (page picker if it has more
   than one page). A genuinely oversized architectural sheet is split into
   tiles exactly like Site Measure's own "Open" already does (same
   `PDF_TILE_MAX_DIM`/`PDF_IMPORT_MAX_DIM` constants), so a large CAD-
   exported scan imported here looks and measures identically once Site
   Measure opens it. Writes the level/room's own save file in exactly Site
   Measure's `projectPayload()` shape — this is the interop contract every
   other app in the family depends on, so it's reproduced byte-for-byte,
   objects always starting empty (annotating a plan stays Site Measure's
   job). Replacing an existing plan asks for confirmation first, same as
   Site Measure's own "Open". A static, non-interactive preview confirms
   the import landed correctly — the real pan/zoom/marker-drop canvas is
   the next build-sequence step.

7. **Place joinery items** — once a level has a floor plan, a "Place
   joinery items" button opens a lightweight, read/write plan viewer: pan
   by dragging, zoom by pinch/scroll wheel, no drawing tools (that stays
   Site Measure's own job — this is a marker-drop screen, not a canvas).
   Tapping an empty spot on the plan opens a dialog to pick an existing
   room or create a new one, then enter a Joinery ID, description, and
   (required) work order #. Creating a new room uses the same
   `ensureWorkFolders` call as every other creation flow here. The marker
   itself is added to the level's own save file's `objects` array in
   exactly Site Measure's own `makeRoomLink()` shape — the level's existing
   image data, style, and any other objects are read and preserved
   untouched, only the new marker is appended — so a level marked up here
   looks, to Site Measure, exactly like one Site Measure itself would have
   marked up. Joinery IDs are deduped against siblings already in the same
   room with the same numbered-suffix convention used everywhere else in
   this app. The joinery item's own record — `{joineryId, description,
   level, room, status: "created", workOrderNo}` — is written to a new
   project-wide `joinery-items.json` file (see "Where things are saved"
   below); a marker and its record correlate by matching `(level, room,
   joineryId)` against the marker's own `(level, roomName, joineryCode)`.

8. **Joinery Register** — a "Joinery Register" button on the level list
   opens a flat table of every joinery item in the current project, pulled
   straight from `joinery-items.json` regardless of which level or room
   each one is on. Filter by level, by status, or search Joinery ID/
   description/work order #; click any column heading to sort by it, click
   again to reverse. Read-only for now — editing a record's status or
   description from here is a Joinery Item Pages job (next).

9. **Joinery Item Pages** — every joinery item now has its own page:
   description, work order #, level, room, and status, plus a "View on
   plan" button that opens the level's plan canvas centred on that item's
   own marker.
   Reachable three ways — clicking a row in the Joinery Register, clicking
   a tile in Status Overview, or tapping the item's own marker on the plan
   canvas (which used to just name it in a toast; now it opens the page).
   "Back" always returns to wherever the page was opened from. Four
   sections on the page — Site Measure overlays, Shop drawings,
   Manufacture + Install ITP, Photos — are placeholders for now, each
   waiting on the sibling app it names being updated to key off joinery
   item records directly instead of its own separate data.

10. **Status Overview** — a "Status Overview" button next to Joinery
    Register on the level list opens a project-wide grid of every joinery
    item, one tile each, with a coloured status dot, its Joinery ID,
    level/room, and description. Every item reads "created" in V1, since
    no app updates status yet, but the grid renders whatever's actually on
    each record — it's not hardcoded to that one value. Clicking a tile
    opens that item's own page.

This completes Projects V1's original 8-item build sequence (see
`utzline-projects-v1-plan.md`) — Create Project, Levels, Rooms, floor plan
import, Place Joinery Markers, Create Joinery Items, the Joinery Register,
and now Joinery Item Pages + Status Overview. Every screen so far is
read/write for its own data but read-only across the others (a Joinery
Item page doesn't yet let you edit its own description or status in
place, for instance) — the next phase of work is the parity check and
cutover: bringing Projects to full parity with Site Measure's current
creation flows, then, in one step, **removing Site Measure's own New
Project/Level/Room, floorplan-import, "Add joinery item here", and Project
Info UI** — not gradually (see the data standard's decision #12).

## Where things are saved

```
<Projects folder>/
  company-logo.png            <- single company-wide logo, set from this
                                  app; a FILE, not a folder, so it's
                                  invisible to every app's own project list
  <Project>/
    project-meta.json          <- {no, name, contractor, client, siteAddress,
                                   projectManager}, read and written by this
                                   app (Site Measure still writes the first
                                   three keys too, until the cutover)
    joinery-items.json          <- flat array of every joinery item record
                                   in this project: {joineryId, description,
                                   level, room, status, workOrderNo} -- no
                                   markerId; a record correlates to its
                                   marker by matching (level, room,
                                   joineryId) against the marker's own
                                   (level, roomName, joineryCode). Storage
                                   location is this app's own choice --
                                   Andrew's approved answer specified the
                                   record shape, not where to keep it.
                                   workOrderNo added 2026-09-23, required
                                   for new items going forward; items
                                   created before then simply lack the key.
    <Level>/
      saves/, pdfs/, backup/   <- this level's own floorplan + objects
      <Room>/
        saves/, pdfs/, backup/ <- same shape, one folder deeper
    itp-install/               <- Install ITP's own project-wide folder (renamed from "itp" 2026-09-22)
    itp-manufacture/           <- Manufacture ITP's own project-wide folder
```

Levels and rooms are read with `{create: false}` throughout — this version
never creates a folder or file, so pointing it at a real, existing Projects
folder is safe to try immediately.

## Getting this installed as its own app

**This app lives in its own separate GitHub repository** — not a
subfolder of Site Measure's, the Viewer's, or any sibling app's repo.
Every app in the UTZLINE family (Site Measure, Viewer, Install ITP,
Manufacture ITP, UTZLINE Projects, UTZLINE Scheduler, UTZLINE Delivery
ITP) is its own repo with its own GitHub Pages URL.

1. In this app's own repo, add every file from this bundle at the repo
   root (not inside a subfolder) — keep the `icons/` folder structure
   intact. It'll go live at that repo's own GitHub Pages URL.
2. Open that URL once in a normal browser tab while online, so the service
   worker can cache it for offline use.
3. Install it: Chrome/Edge's install icon in the address bar ("Install this
   site as an app"). Because it has its own `manifest.json` (its own name
   and icons — red, to tell it apart from every sibling app's own colour),
   Chrome and Windows/Android treat it as a wholly separate, independently
   installable app.
4. On a phone or tablet, "Install this site as an app" is under the
   browser's own menu (Chrome: menu -> "Add to Home screen" / "Install app").

## Updating this app

Same process every time a new build ships: unzip whatever's shared in
chat, upload the files into this app's own repo root (overwriting existing
ones, keeping `icons/` intact), commit, wait for GitHub Pages to redeploy,
then close and reopen the installed app to pick up the change. **Bump the
"Current version" line at the top of this README (with a dated changelog
entry) and `service-worker.js`'s `CACHE_NAME` every single time a change
ships** — both need to move together, or installed copies keep serving a
stale cached build and this README stops being a reliable record of
what's actually live.

## What's in this folder

- `index.html` — the whole app: markup, styles, and logic in one file
- `manifest.json`, `service-worker.js` — what makes this installable and
  offline-capable as its own app
- `jspdf.umd.min.js` — vendored locally (v14) so the Rework Register's
  Print/Share PDF export keeps working fully offline once installed
- `icons/` — this app's own red-accented icon set
