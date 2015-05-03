function MockDataManager() {}
MockDataManager.prototype = {
  'RegisterSet': function(set) {},
  'RegisterCard': function(card) {},
  'GetCardsByName': function(name) {return []},
  'GetCardBySetCodeAndLocalId': function(set_code, local_id) {return undefined},
  'BuildSet': function(set_code) {},
  'BuildAllSets': function() {},
  'StripOnlineOnly': function() {}
}