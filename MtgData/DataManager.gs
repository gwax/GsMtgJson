function DataManager(mtg_data) {
  this._raw_data = mtg_data;
  this.mtg_data = this._raw_data;
  
  this.code_to_set = {};
  this.release_and_code_to_set = {};
  this.name_to_cards = {};
  this.setcode_to_localid_to_card = {};
}
DataManager.prototype = {};

DataManager.prototype.VERBOSE_LOGGING = false;

DataManager.prototype.StripOnlineOnly = function() {
  if (this.VERBOSE_LOGGING) Logger.log('BEGIN StripOnlineOnly');
  var new_mtg_data = {};
  for (var set_code in this.mtg_data) {
    var set_data = this.mtg_data[set_code];
    if (set_data['onlineOnly']) continue;
    new_mtg_data[set_code] = set_data;
  }
  this.mtg_data = new_mtg_data;
  if (this.VERBOSE_LOGGING) Logger.log('END StripOnlineOnly');
}

DataManager.prototype.RegisterSet = function(set) {
  this.code_to_set[set.set_code] = set;
  var release_and_code = set.release_date + '_' + set.set_code;
  this.release_and_code_to_set[release_and_code] = set;
}

DataManager.prototype.RegisterCard = function(card) {
  var set_code = card.set_code;
  var localid = card.local_id;
  var localid_to_card = this.setcode_to_localid_to_card[set_code] || {};
  localid_to_card[localid] = card;
  this.setcode_to_localid_to_card[set_code] = localid_to_card;
  
  var name = card.name;
  var cards = this.name_to_cards[name] || [];
  cards.push(card);
  this.name_to_cards[name] = cards;
}

DataManager.prototype.GetCardsByName = function(name) {
  return this.name_to_cards[name] || [];
}

DataManager.prototype.GetCardBySetAndLocalId = function(set_code, local_id) {
  var localid_to_card = this.setcode_to_localid_to_card[set_code] || {};
  return localid_to_card[local_id];
}

DataManager.prototype.GetSetByCode = function(set_code) {
  return this.code_to_set[set_code];
}

DataManager.prototype.BuildSet = function(set_code) {
  if (this.VERBOSE_LOGGING) Logger.log('BEGIN BuildSet(%s)', set_code);
  var set_data = this.mtg_data[set_code];
  var set = new Set(set_data, this);
  if (this.VERBOSE_LOGGING) Logger.log('BEGIN %s.BuildCards()', set_code);
  set.BuildCards();
  if (this.VERBOSE_LOGGING) Logger.log('END %s.BuildCards()', set_code);
  if (this.VERBOSE_LOGGING) Logger.log('END BuildSet(%s)', set_code);
}

DataManager.prototype.BuildAllSets = function() {
  for (var set_code in this.mtg_data) {
    this.BuildSet(set_code);
  }
}

DataManager.prototype.GetSets = function() {
  var release_and_codes = Object.keys(this.release_and_code_to_set)
  release_and_codes.sort();
  var sets = [];
  for (var i=0; i<release_and_codes.length; i++) {
    var release_and_code = release_and_codes[i];
    var set = this.release_and_code_to_set[release_and_code];
    sets.push(set);
  }
  return sets;
}

DataManager.prototype.GetSetCodes = function() {
  var sets = this.GetSets();
  var set_codes = [];
  for (var i=0; i<sets.length; i++) {
    set_codes.push(sets[i].set_code);
  }
  return set_codes;
}

DataManager.prototype.GetSetRowValues = function() {
  var sets = this.GetSets();
  var values = [];
  values.push(Set.prototype.HEADER);
  for (var i=0; i<sets.length; i++) {
    var set = sets[i];
    values.push(set.GetRowData());
  }
  return values;
}

DataManager.prototype.ApplyCardCounts = function(card_counts) {
  for (var set_code in card_counts) {
    var localid_to_card = this.setcode_to_localid_to_card[set_code];
    var localid_to_card_counts = card_counts[set_code];
    for (var localid in localid_to_card_counts) {
      var card = localid_to_card[localid];
      var card_counts = localid_to_card_counts[localid];
      for (var copy_type in card_counts) {
        card[copy_type] = card_counts[copy_type];
      }
    }
  }
}
