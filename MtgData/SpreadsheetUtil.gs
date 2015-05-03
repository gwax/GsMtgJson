/**
 * Clean up a magic spreadsheet and set some characteristics.
 * @param {Sheet} sheet The sheet to clean up.
 * @param {number} rows The number of rows in the sheet.
 * @param {number} columns The number of columns in the sheet.
 * @param {number[]} string_columns Columns in the sheet that should be formated as strings (not numbers).
 * @param {number[]} hidden_columns Columns in the sheet that should be hidden.
 */
function CleanUpSheet(sheet, rows, columns, string_columns, hidden_columns) {
  for (var i=0; i<columns; i++) {
    sheet.autoResizeColumn(i + 1);
  }
  
  for (var i=0; i<string_columns.length; i++) {
    var col = string_columns[i];
    var range = sheet.getRange(1, col, rows, 1);
    range.setNumberFormat('@');
  }
  
  for (var i=0; i<hidden_columns.length; i++) {
    var col = hidden_columns[i];
    sheet.hideColumns(col);
  }
  
  sheet.setFrozenRows(1);
}

/**
 * Resize a sheet.
 * @param {Sheet} sheet The sheet to resize.
 * @param {number} rows The desired number of rows.
 * @param {number} columns, The desired number of columns.
 */
function SetSheetSize(sheet, rows, columns) {
  var max_rows = sheet.getMaxRows();
  if (max_rows > rows) {
    sheet.deleteRows(rows + 1, max_rows - rows);
  } else if (max_rows < rows) {
    sheet.insertRowsAfter(max_rows, rows - max_rows);
  }
  
  var max_columns = sheet.getMaxColumns();
  if (max_columns > columns) {
    sheet.deleteColumns(columns + 1, max_columns - columns);
  } else if (max_columns < columns) {
    sheet.insertColumnsAfter(max_columns, columns - max_columns);
  }
}