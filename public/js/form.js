submitForms = function(){
    setTimeout(function() {
        document.getElementById("form1").submit();    
    }, 1000);
    
    setTimeout(function() {
        document.getElementById("form2").submit();
    }, 10);
    
}

function autocomplete( input ) {
    if(!input) return; // skip this fn from running if there is not input on the page
    const dropdown = new google.maps.places.Autocomplete(input);
    
    dropdown.addListener('place_changed', () => { 
        let pieces = input.value.split(',');
        input.value = pieces[0];   
    });
    // dropdown.addListener('place_changed', () => {
    //   const place = dropdown.getPlace();
    //   latInput.value = place.geometry.location.lat();
    //   lngInput.value = place.geometry.location.lng();
    // });
    // if someone hits enter on the address field, don't submit the form
    input.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) e.preventDefault();
    });
  }
  document.querySelectorAll('.form__input-places').forEach( input => {
      autocomplete( input );
  });