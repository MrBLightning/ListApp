
  //sort_array_by is a general sorting function for arrays of objects by any field in the object
  export function sort_array_by (field, reverse, pr){
    reverse = (reverse) ? -1 : 1;
    return function(a,b){
      a = a[field];
      b = b[field];
      if (typeof(pr) != 'undefined'){
        a = pr(a);
        b = pr(b);
      }
      if (a<b) return reverse * -1;
      if (a>b) return reverse * 1;
      return 0;
    }
  }  

  //AlphabeticalSort is a function to sort an array of objects by some specific key alphabetically
  export function AlphabeticalSort(property) {
    let sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder === -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
  }
