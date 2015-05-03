function GetLatestFileByName(name) {
  Logger.log('Looking for file with name: %s', name);
  var files = DriveApp.getFilesByName(name);
  var found_file;
  var moddate;
  while (files.hasNext()) {
    var file = files.next();
    var lastupdate = file.getLastUpdated();
    Logger.log('Found: %s, updated at: %s, with id: %s', file.getName(), lastupdate, file.getId());
    if (moddate === undefined || lastupdate > moddate) {
      found_file = file;
      moddate = lastupdate;
    }
  }
  if (found_file === undefined) {
    throw new Error('File not found.');
  }
  return found_file;
}

function ReadJsonFromFile(file) {
  Logger.log('Attemping to read JSON from file: %s', file);
  var mimetype = file.getMimeType();
  var jsonmimetype = 'application/json';
  if (mimetype != jsonmimetype) {
    Logger.log('Expecting mime type %s, but found %s', jsonmimetype, mimetype);
    throw new Error('Invalid mime type.');
  }
  var jsonString = file.getBlob().getDataAsString();
  return JSON.parse(jsonString);
}
