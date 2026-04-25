# Phase 18 Plan: Spreadsheet/Table View

## 1. Frontend: HTML Structure
- [ ] Update `src/server/public/index.html`:
    - Add "Spreadsheet View" button to sidebar.
    - Add a container section for the table view (`#table-view`).
    - Add a "Export to CSV" button in the table view header.

## 2. Frontend: Styling
- [ ] Update `src/server/public/style.css`:
    - Define styles for `.data-table` (Glassmorphism borders, hover states, sticky header).
    - Style table rows and cells to maintain the premium dashboard aesthetic.
    - Add styles for the "Export" button.

## 3. Frontend: Logic & Rendering
- [ ] Update `src/server/public/app.js`:
    - Implement `renderTableView()` function.
    - Add event listener for the Spreadsheet sidebar button.
    - Implement `downloadCSV()` functionality.
    - Ensure view-switching logic handles the transition to/from the table view.
    - Add sort listeners for table headers.

## 4. Verification
- [ ] Verify that the table view displays the correct filtered data.
- [ ] Verify that clicking a row opens the intelligence report modal.
- [ ] Verify that the "Export to CSV" button generates a valid `.csv` file.
