function CreateBatchManager() {
  Logger.log('BEGIN CreateBatchManager');
  var allsetsfile = Util.GetLatestFileByName('AllSets.json');
  var mtg_data = Util.ReadJsonFromFile(allsetsfile);
  var data_manager = new MtgData.DataManager(mtg_data);

  var sheetname = 'Magic Collection';
  var spreadsheet = null;
  try {
    var sheetfile = Util.GetLatestFileByName(sheetname);
    spreadsheet = SpreadsheetApp.openById(sheetfile.getId());
  } catch (err) {
    if (err.message == 'File not found.') {
      var spreadsheet = SpreadsheetApp.create(sheetname, 200, 8);
    } else {
      throw err;
    }
  }

  var batch_manager = new MtgData.BatchManager(spreadsheet, data_manager);
  batch_manager.data_manager.VERBOSE_LOGGING = true;
  batch_manager.spreadsheet_manager.VERBOSE_LOGGING = true;
  batch_manager.InitializeData();
  Logger.log('END CreateBatchManager');
  return batch_manager;
}

function GetTimer(seconds) {
  var start = new Date();
  return function() {
    var now = new Date();
    return (now.getTime() - start.getTime()) / 1000 < seconds;
  };
}

function CreateBatchWithoutRunning() {
  var batch_manager = CreateBatchManager();
  batch_manager.SetUpBatchJob();
}

function StartBatchProcessing() {
  var timer = GetTimer(300);
  var batch_manager = CreateBatchManager();
  batch_manager.SetUpBatchJob();
  batch_manager.ProcessWithContinuationCallback(timer);
}

function ResumeBatchProcessing() {
  var timer = GetTimer(300);
  var batch_manager = CreateBatchManager();
  batch_manager.ProcessWithContinuationCallback(timer);
}
