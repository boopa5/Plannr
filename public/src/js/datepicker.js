(() => {
  let newAssignmentDatePicker = new MaterialDatepicker('#add-assignment-date-field', {
    orientation: 'portrait',
    theme: 'dark',
    color: '#F17063',
    date: new Date(),
    outputFormat: 'MM/DD/YYYY',
    zIndex: 1000
  });

  let clockDatePicker = new MaterialDatepicker("#clock-datepicker", {
    orientation: 'portrait',
    theme: 'dark',
    color: '#F17063',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
    outputFormat: 'MM/DD/YYYY',
    zIndex: 1000
  });
})();