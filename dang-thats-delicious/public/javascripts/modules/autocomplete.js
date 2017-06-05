function autocomplete(input, latInput, lngInput) {
  console.log(input, latInput, lngInput);
  if (!input) return; // skip this if there is no input
  const dropdown = new google.maps.places.Autocomplete(input);

  // Now to handle the input
  // This is all the google maps API stuff - must have included/required elsewhere
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    console.log(place);

    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });

  // ATM if someone hits enter on the place selector it will pick it and also try to submit the form.
  // Want to disable that behaviour
  //  http://keycode.info/ from WesBos will tell you what keycode belongs to what key
  input.on('keydown', (e) => {
    if (e.keycode === 13) e.preventDefault();
  });
}

export default autocomplete;
