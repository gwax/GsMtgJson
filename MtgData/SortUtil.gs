/**
  * Compare two values involving a mix of letters and numbers. First comparing numbers, then letters. Useful for sorting.
  * @param {string|number} a The first value.
  * @param {string|number} b The second value.
  * @return {number} >0 if a is larger than b, <0 if b is larger than a, 0 if a and b are equal.
  */
function NumThenLetterSort(a, b) {
  var numA = '';
  var alA = '';
  var numB = '';
  var alB = '';
  if (typeof a == 'number') {
    numA = a;
  } else {
    numA = String(a).replace(/\D/g,'');
    alA = String(a).replace(/\d/g,'');
  }
  if (typeof b == 'number') {
    numB = b;
  } else {
    numB = String(b).replace(/\D/g,'');
    alB = String(b).replace(/\d/g,'');
  }

  if (numA != numB) {
    return numA - numB;
  } else if (alA < alB) {
    return -1;
  } else if (alA > alB) {
    return 1;
  } else {
    return 0;
  }
}
