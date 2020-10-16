let displayAssignmentFormBtn = document.querySelector('#show-dialog');

let taskList = document.getElementById("task-list");

let totalTimeLabel = document.getElementById('total-time-label');

let addAssignmentForm = document.getElementById("add-assignment-form");
let addAssignmentName = document.getElementById("add-assignment-name-field");
let addAssignmentCourse = document.getElementById("add-assignment-course-field");
let addAssignmentDate = document.getElementById("add-assignment-date-field");
let addAssignmentETH = document.getElementById("add-assignment-eth-field");
let addAssignmentETM = document.getElementById("add-assignment-etm-field");
let addAssignmentDescription = document.getElementById("add-assignment-description-field");

let editAssignmentForm = document.getElementById("edit-assignment-form");
let editAssignmentName = document.getElementById("edit-assignment-name-field");
let editAssignmentCourse = document.getElementById("edit-assignment-course-field");
let editAssignmentDate = document.getElementById("edit-assignment-date-field");
let editAssignmentETH = document.getElementById("edit-assignment-eth-field");
let editAssignmentETM = document.getElementById("edit-assignment-etm-field");
let editAssignmentDescription = document.getElementById("edit-assignment-description-field");

// Fixing scroll resetting
let scrollPosition;

// Drag and Drop
let dragging, draggedOver;

let editAssignmentDatePicker = new MaterialDatepicker('#edit-assignment-date-field', {
  orientation: 'portrait',
  theme: 'dark',
  color: '#F17063',
  // date: new Date(datum.duedate.split('/')[2] + '-' + datum.duedate.split('/')[0] + '-' + (+datum.duedate.split('/')[1]+1)),
  outputFormat: 'MM/DD/YYYY',
  zIndex: 1000,
});

// Remove is-lowest-value because it doesn't show on dark theme
MaterialSlider.prototype.updateValueStyles_ = function () {
  // Calculate and apply percentages to div structure behind slider.
  let fraction = (this.element_.value - this.element_.min) / (this.element_.max - this.element_.min);
  if (!this.isIE_) {
    this.backgroundLower_.style.flex = fraction;
    this.backgroundLower_.style.webkitFlex = fraction;
    this.backgroundUpper_.style.flex = 1 - fraction;
    this.backgroundUpper_.style.webkitFlex = 1 - fraction;
  }
};

function updateTasksDisplay(list) {
  clearTasks();
  for (let i = 0; i < list.length; ++i) {
    taskList.append(generateTaskHTML(list[i]));
    appendColorBar(taskList.children[i]);
  }
  if (Plannr.calculateTotalTime() !== 0) {
    totalTimeLabel.textContent = 'Total Left ~' + etString(Plannr.calculateTotalTime())
  } else {
    totalTimeLabel.textContent = 'No Tasks Left'
  }
  componentHandler.upgradeAllRegistered();
  if (Plannr.getAssignments().length === 0) {
    let noAssignmentsLabel = document.createElement('h4');
    noAssignmentsLabel.style.opacity = '0.4';
    noAssignmentsLabel.textContent = 'No Assignments Left'
    taskList.appendChild(noAssignmentsLabel);
  }
}

function clearTasks() {
  while(taskList.hasChildNodes()) {
    taskList.removeChild(taskList.lastChild);
  }
}

function minToHourMin(min) {
  return {
    hours: Math.floor(min / 60),
    min: min - (Math.floor(min / 60) * 60)
  }
}

function generateToolTip(elementID, text) {
  let div = document.createElement('div');
  div.setAttribute('class', 'mdl-tooltip');
  div.setAttribute('data-mdl-for', elementID);
  div.textContent = text;
  return div;
}

function formatDate(date) {
  let arr = date.split('/');
  let d = new Date(+arr[2], +arr[0] - 1, +arr[1], 0, 0, 0 // ...at 00:00:00 hours
  );
  let weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return weekday[d.getDay()] + ', ' + month[d.getMonth()] + " "+ +arr[1];
}

function etString(et) {
  let hours = (et / 60);
  let rHours = Math.floor(hours);
  let minutes = (hours - rHours) * 60;
  let rMinutes = Math.round(minutes);
  return (rHours > 0 ? rHours + "h " : "") + (rMinutes > 0 ? rMinutes + "m" : "");
}

function hexIsLight(color) {
  const hex = color.replace('#', '');
  const c_r = parseInt(hex.substr(0, 2), 16);
  const c_g = parseInt(hex.substr(2, 2), 16);
  const c_b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
  return brightness > 155;
}

function getToday() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // January is 0
  let yyyy = today.getFullYear();

  if (dd < 10) { dd ='0'+dd }
  if (mm < 10) { mm ='0'+mm }

  return yyyy + '-' + mm + '-' + dd;
}

function appendColorBar(taskHtml) {
  let colorDiv = document.createElement('div');
  let height = getHeight(taskHtml) + 'px';
  // let height = h + 'px'

  colorDiv.style.background = Plannr.getCourse(taskHtml.getAttribute('course-color')).color;
  colorDiv.style.width = '32px';
  colorDiv.style.height = height;
  colorDiv.style.float = 'left';

  let taskId = taskHtml.getAttribute('assignment-id')

  // let downWrapper = document.createElement('div');
  // downWrapper.style.transform = `translate(0px, ${h-96}px)`;
  // let downButton = document.createElement('button');
  // downWrapper.setAttribute('id', taskId + '-down')
  // let downIcon = document.createElement('i');
  // downButton.setAttribute('class', 'mdl-button mdl-js-button mdl-button--icon');
  // downIcon.setAttribute('class', 'material-icons');
  // downIcon.textContent = 'navigate_before';
  // downButton.style.transform = 'rotate(-90deg)'
  // downButton.appendChild(downIcon);
  // downWrapper.appendChild(downButton)
  //
  // let upWrapper = document.createElement('div');
  // let upButton = document.createElement('button');
  // upWrapper.setAttribute('id', taskId + '-up')
  // let upIcon = document.createElement('i');
  // upButton.setAttribute('class', 'mdl-button mdl-js-button mdl-button--icon');
  // upIcon.setAttribute('class', 'material-icons');
  // upIcon.textContent = 'navigate_next';
  // upButton.style.transform = 'rotate(-90deg)'
  // upButton.appendChild(upIcon);
  // upWrapper.appendChild(upButton);

  // let tooltipDown;
  // let tooltipUp
  //
  // if (taskHtml.getAttribute('pinned') === 'false') {
  //   tooltipDown = generateToolTip(taskId + '-down', 'Only pinned assignments may be moved');
  //   tooltipUp = generateToolTip(taskId + '-up', 'Only pinned assignments may be moved');
  //
  //   upWrapper.appendChild(tooltipUp);
  //   downWrapper.appendChild(tooltipDown);
  //
  //   upButton.setAttribute('disabled', '');
  //   downButton.setAttribute('disabled', '');
  // }

  let courseNameDiv = document.createElement('div');
  courseNameDiv.style.width = height;
  courseNameDiv.style.height = '25px';
  courseNameDiv.style.transform = `rotate(-90deg) translate(0px, -${height})`;
  courseNameDiv.style.transformOrigin = 'top right'
  courseNameDiv.style.textAlign = 'center'
  courseNameDiv.textContent = taskHtml.getAttribute('course-name');
  courseNameDiv.style.paddingTop = '5px';

  courseNameDiv.style.color = hexIsLight(Plannr.getCourse(taskHtml.getAttribute('course-color')).color) ? 'black' : 'white';

  // colorDiv.appendChild(upWrapper)
  colorDiv.appendChild(courseNameDiv);
  // colorDiv.appendChild(downWrapper);
  taskHtml.firstChild.prepend(colorDiv);
  taskHtml.style.minWidth = '600px'
  return taskHtml;
}

function swap(arr, n, m) {
  let temp = arr[n];
  arr[n] = arr[m];
  arr[m] = temp;
  return arr;
}

function getHeight(element) {
  element = element.cloneNode(true);
  // element.style.visibility = "hidden";
  document.body.appendChild(element);
  let height = element.offsetHeight;
  console.log(height)
  document.body.removeChild(element);
  element.style.visibility = "visible";
  return height;
}

function generateTaskHTML(datum) {
  const theme = Plannr.getThemeCss()
  let task = document.createElement('div');
  task.setAttribute('class', 'mdl-card mdl-shadow--2dp task n' + datum.id);
  task.setAttribute('assignment-id', datum.id)
  task.setAttribute('course-color', datum.course.id)
  task.setAttribute('course-name', datum.course.name)
  task.setAttribute('pinned', datum.pinned)
  task.style.marginBottom = '20px'
  task.style.marginTop = '10px'
  task.style.width = '100%'
  task.style.background = theme.bgSecondary
  task.style.color = theme.fontColor

  // Implement Drag and Drop
  // task.setAttribute('draggable', 'true')
  // task.addEventListener('drag', e => {
  //  dragging = Array.from(taskList.childNodes).indexOf(e.target);
  //  console.log(dragging)
  // })
  //
  // task.addEventListener('dragover', e => {
  //   e.preventDefault()
  //   draggedOver = Array.from(taskList.childNodes).indexOf(e.target)
  // })
  //
  // task.addEventListener('drop', e => {
  //   let assignments = Plannr.getAssignments();
  //   assignments.splice(dragging, 1)
  //   assignments.splice(draggedOver, 0, assignments[draggedOver])
  //   console.log(assignments)
  //   Plannr.setAssignments(assignments);
  //   updateTasksDisplay(Plannr.getAssignments());
  // })


  let nameLabel = document.createElement('h5');
  nameLabel.textContent = datum.name;
  nameLabel.style.paddingLeft = '20px';
  nameLabel.style.color = theme.fontColor;
  nameLabel.style.marginTop = '8px';
  nameLabel.style.float = 'left';
  nameLabel.style.marginBottom = '10px';
  nameLabel.style.width = '430px';

  let editButton = document.createElement('button');
  let editIcon = document.createElement('i');
  editButton.setAttribute('class', 'mdl-button mdl-js-button mdl-button--icon');
  editIcon.setAttribute('class', 'material-icons');
  editIcon.innerText = 'edit';
  editButton.appendChild(editIcon);
  editButton.style.float = 'right';
  editButton.addEventListener('click',event => {
    scrollPosition = window.scrollY;
    // editAssignmentDate.value = datum.duedate.split('/')[2] + '-' + datum.duedate.split('/')[0] + '-' + (+datum.duedate.split('/')[1]+1)
    editAssignmentDatePicker.date =  new Date(...[datum.duedate.split('/')[2], +datum.duedate.split('/')[0] - 1, (+datum.duedate.split('/')[1])]);
    editAssignmentDate.value =  datum.duedate

    let et = minToHourMin(datum.et);
    editAssignmentName.value = datum.name;
    editAssignmentETH.value = et.hours;
    editAssignmentETM.value = et.min;
    editAssignmentDescription.value = datum.description;

    document.getElementById('edit-assignment-course-field').textContent = '';
    Plannr.getCourses().forEach(course => {
      let option = document.createElement('option');
      option.setAttribute('value', course.id);
      option.textContent = course.name;
      document.getElementById('edit-assignment-course-field').appendChild(option);
    });
    document.getElementById('edit-assignment-course-div').classList.remove('is-invalid')
    document.getElementById('edit-assignment-course-div').classList.add('is-dirty')

    editAssignmentCourse.value = datum.course.id;

    editAssignmentForm.setAttribute('current-editing-id', datum.id);
    editAssignmentDialog.style.top = 50 + scrollPosition + 'px'
    editAssignmentDialog.show();
  });

  let deleteButton = document.createElement('button');
  let deleteIcon = document.createElement('i');
  deleteButton.setAttribute('class', "mdl-button mdl-js-button mdl-button--icon");
  deleteIcon.setAttribute('class', "material-icons");
  deleteIcon.innerText = 'clear';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', event => {
    let snackbarContainer = document.getElementById('undo-snackbar');
    Plannr.deleteAssignment(datum.id);
    let data = {
      message: `Deleted ${datum.name}`,
      timeout: 5000,
      actionHandler: () => {
        Plannr.addAssignment(datum);
        Plannr.smartSort();
        updateTasksDisplay(Plannr.getAssignments());
      },
      actionText: 'Undo'
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
    updateTasksDisplay(Plannr.getAssignments());
  });
  deleteButton.style.float = 'right';
  deleteButton.style.marginRight = '12px';

  let pinButton = document.createElement('button');

  let pinIcon = document.createElement('i');
  pinButton.setAttribute('class', 'mdl-button mdl-js-button mdl-button--icon');
  pinIcon.setAttribute('class', "material-icons");
  pinIcon.textContent = 'push_pin';
  pinButton.appendChild(pinIcon);
  pinButton.style.float = 'right';
  if (datum.pinned) {
    pinButton.style.color = 'rgb(255, 155, 0)'
  } else {
    pinButton.style.color = 'rgb(255, 255, 255)'
  }
  pinButton.addEventListener('click', e => {
    datum.pinned = !datum.pinned
    Plannr.updateAssignment(datum);
    Plannr.smartSort();
    updateTasksDisplay(Plannr.getAssignments())
  })

  let topDiv = document.createElement('div');
  topDiv.style.marginTop = '15px';
  topDiv.appendChild(nameLabel);
  topDiv.appendChild(deleteButton);
  topDiv.appendChild(editButton);
  topDiv.appendChild(pinButton);

  let middleDiv = document.createElement('div');
  middleDiv.style.paddingLeft = '20px';
  middleDiv.style.paddingRight = '20px';

  let dateDiv = document.createElement('div');
  dateDiv.style.textAlign = 'right';
  dateDiv.style.float = 'right';
  dateDiv.style.fontSize = '14px';

  if (Plannr.dueStatus(datum) === 'overdue') {
    dateDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
    dateDiv.textContent = '[Overdue] ' + formatDate(datum.duedate);
    dateDiv.style.padding = '5px';
    dateDiv.style.borderRadius = '2px';
    nameLabel.textContent = datum.name;
    nameLabel.style.color = 'red';
  } else if (Plannr.dueStatus(datum) === 'due') {
    dateDiv.style.backgroundColor = 'rgb(255 188 0 / 88%)'
    dateDiv.textContent = 'Due today';
    dateDiv.style.padding = '5px';
    dateDiv.style.borderRadius = '2px';
    dateDiv.style.color = 'black';
  } else if (Plannr.dueStatus(datum) === 'tomorrow') {
    dateDiv.style.backgroundColor = 'rgba(255,255,0,0.8)'
    dateDiv.textContent = 'Due tomorrow';
    dateDiv.style.padding = '5px';
    dateDiv.style.borderRadius = '2px';
    dateDiv.style.color = 'black';
  } else {
    dateDiv.textContent = 'Due ' + formatDate(datum.duedate);
  }

  let descriptionDiv = document.createElement('div');
  descriptionDiv.style.fontSize = '14px';
  descriptionDiv.textContent = datum.description;
  descriptionDiv.style.float = 'left';
  descriptionDiv.style.width = '350px';

  middleDiv.appendChild(descriptionDiv);
  middleDiv.appendChild(dateDiv);

  let etDiv = document.createElement('div');
  etDiv.style.paddingRight = '20px';
  etDiv.style.paddingLeft = '20px';
  etDiv.style.textAlign = 'right';
  etDiv.style.fontSize = '14px';
  etDiv.style.lineHeight = '10px';
  etDiv.style.marginTop = '10px';
  etDiv.style.marginBottom = '10px';
  etDiv.textContent = datum.et - ((datum.progress / 100) * datum.et) !== 0 ? '~' + etString(datum.et - ((datum.progress / 100) * datum.et)) : 'Done!';

  let progressSliderContainer = document.createElement('p');
  progressSliderContainer.style.marginBottom = '10px';
  progressSliderContainer.style.marginTop = '5px';
  // progressSliderContainer.style.width = '80%';

  let progressSlider = document.createElement('input');
  progressSlider.setAttribute('class', 'mdl-slider mdl-js-slider');
  progressSliderContainer.appendChild(progressSlider);
  progressSlider.setAttribute('type', 'range');
  progressSlider.setAttribute('min', '0');
  progressSlider.setAttribute('max', '100');
  progressSlider.setAttribute('tab-index', '0');
  document.body.appendChild(progressSliderContainer);
  componentHandler.upgradeAllRegistered();
  progressSlider.MaterialSlider.change(datum.progress);
  document.body.removeChild(progressSliderContainer);
  progressSliderContainer.style.display = 'block';

  let sheet = (() => {
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
  })();

  let colorProgress = Math.floor((datum.progress / 100) * 510);
  let color;
  if (colorProgress <= 255) {
    color = `rgb(255, ${colorProgress}, 0)`
  } else if (colorProgress <= 510) {
    color = `rgb(${255 - (colorProgress - 255)}, 255, 0)`
  }

  sheet.insertRule('#dummy {}', sheet.length)
  sheet.insertRule('#dummy {}', sheet.length)
  sheet.insertRule('#dummy {}', sheet.length)

  sheet.removeRule(sheet.length)
  sheet.removeRule(sheet.length)
  sheet.removeRule(sheet.length)

  sheet.insertRule('.n'+datum.id+' .mdl-slider::-webkit-slider-thumb {background: '+color+' !important;', sheet.length)
  sheet.insertRule('.n'+datum.id+' .mdl-slider:active::-webkit-slider-thumb {background: '+color+' !important;', sheet.length)
  sheet.insertRule('.n'+datum.id+' .mdl-slider__background-lower {background: '+color+' !important;', sheet.length)

  progressSlider.addEventListener('change', event => {
    updateTasksDisplay(Plannr.getAssignments());
    task.setAttribute('draggable', 'true')
    window.scrollTo(0, scrollPosition);
  })

  progressSlider.addEventListener('input', event => {
    if (task.getAttribute('draggable') === 'true') {
      task.setAttribute('draggable','false')
    }

    datum.progress = event.target.value;
    scrollPosition = window.scrollY;

    let colorProgress = Math.floor((datum.progress / 100) * 510);
    let color;
    if (colorProgress <= 255) {
      color = `rgb(255, ${colorProgress}, 0)`
    } else if (colorProgress <= 510) {
      color = `rgb(${255 - (colorProgress - 255)}, 255, 0)`
    }

    sheet.removeRule(sheet.length)
    sheet.removeRule(sheet.length)
    sheet.removeRule(sheet.length)

    sheet.insertRule('.n'+datum.id+' .mdl-slider:active::-webkit-slider-thumb {background: '+color+' !important;', sheet.length)
    sheet.insertRule('.n'+datum.id+' .mdl-slider::-webkit-slider-thumb {background: '+color+' !important;', sheet.length)
    sheet.insertRule('.n'+datum.id+' .mdl-slider__background-lower {background: '+color+' !important;', sheet.length)

    etDiv.textContent = datum.et - ((datum.progress / 100) * datum.et) !== 0 ? '~' + etString(datum.et - ((datum.progress / 100) * datum.et)) : 'Done!';

    if (datum.et - ((datum.progress / 100) * datum.et) !== 0) {
      task.style.opacity = '1';
    } else {
      task.style.opacity = '0.3';
    }
    if (Plannr.calculateTotalTime() !== 0) {
      totalTimeLabel.textContent = 'Total Left ~' + etString(Plannr.calculateTotalTime());
    } else {
      totalTimeLabel.textContent = 'No Tasks Left'
    }

    Plannr.updateAssignment(datum);
    Plannr.smartSort();
  });

  // if assignment is done then gray out
  if (datum.et - ((datum.progress / 100) * datum.et) !== 0) {
    task.style.opacity = '1';
  } else {
    task.style.opacity = '0.3';
  }

  let wrapper = document.createElement('div');
  // wrapper.setAttribute('id', 'wrapper');
  wrapper.setAttribute('class', 'mdl-card ' + datum.id);
  wrapper.style.background = theme.bgSecondary;
  wrapper.style.minHeight = '0';
  wrapper.style.width = 'calc(100% - 32px)';
  wrapper.style.float = 'right';

  wrapper.appendChild(topDiv);
  wrapper.appendChild(middleDiv);
  wrapper.appendChild(etDiv);
  wrapper.appendChild(progressSliderContainer);

  let container = document.createElement('div');
  container.appendChild(wrapper);
  container.style.width = '100%';

  task.appendChild(container);
  task.style.minHeight = '0';

  return task;
}

editAssignmentForm.addEventListener('submit', event => {
  event.preventDefault();
  if (editAssignmentName.value.trim() === "" || editAssignmentCourse.value.trim() === "" || editAssignmentETH.value.trim() === "" || editAssignmentETM.value.trim() === "") {
    alert("Please fill in all required fields!");
    return;
  }
  if ((editAssignmentETH.value.length !== 1 && editAssignmentETH.value[0] === "0") || (editAssignmentETM.value.length !== 1 && editAssignmentETM.value[0] === "0")) {
    alert("Estimated Time Invalid");
    return;
  }

  let editingAssignment = Plannr.getAssignment(editAssignmentForm.getAttribute('current-editing-id'));

  let assignment = new Assignment({
    id: editingAssignment.id,
    name: editAssignmentName.value.trim(),
    course: Plannr.getCourse(editAssignmentCourse.value),
    dueDate: editAssignmentDate.value.trim(),
    et: (+editAssignmentETH.value.trim() * 60) + +editAssignmentETM.value.trim(),
    description: editAssignmentDescription.value.trim(),
    progress: (((editingAssignment.progress / 100) * editingAssignment.et) / ((+editAssignmentETH.value.trim() * 60) + +editAssignmentETM.value.trim())) * 100,
    pinned: editingAssignment.pinned
  });

  Plannr.updateAssignment(assignment);
  Plannr.smartSort();
  updateTasksDisplay(Plannr.getAssignments());
  editAssignmentDialog.close();
});

addAssignmentForm.addEventListener('submit', event => {
  event.preventDefault();
  if (addAssignmentName.value.trim() === "" || addAssignmentCourse.value.trim() === "" || addAssignmentETH.value.trim() === "" || addAssignmentETM.value.trim() === "") {
    alert("Please fill in all required fields!");
    return;
  }
  if ((addAssignmentETH.value.length !== 1 && addAssignmentETH.value[0] === "0") || (addAssignmentETM.value.length !== 1 && addAssignmentETM.value[0] === "0")) {
    alert("Estimated Time Invalid");
    return;
  }

  let assignment = new Assignment({
    id: Plannr.makeId(),
    name: addAssignmentName.value.trim(),
    course: Plannr.getCourse(addAssignmentCourse.value),
    dueDate: addAssignmentDate.value.trim(),
    et: (+addAssignmentETH.value.trim() * 60) + +addAssignmentETM.value.trim(),
    description: addAssignmentDescription.value.trim(),
    progress: 0,
    pinned: false,
  });

  Plannr.setLastSelectedCourse(addAssignmentCourse.value);

  Plannr.addAssignment(assignment);
  Plannr.smartSort();
  updateTasksDisplay(Plannr.getAssignments());

  addAssignmentName.value = "";
  addAssignmentCourse.value = "";
  addAssignmentDescription.value = "";
  addAssignmentETH.value = "0";
  addAssignmentETM.value = "0";

  dialog.close();
});

// Prepare Form
displayAssignmentFormBtn.addEventListener('click', () => {

  addAssignmentName.value = "";
  addAssignmentCourse.value = "";
  addAssignmentDescription.value = "";
  addAssignmentETH.value = "0";
  addAssignmentETM.value = "0";

  // init date picker
  let datePicker = document.getElementById('add-assignment-date-field');
  let today = getToday().split('-')
  datePicker.value = `${today[1]}/${today[2]}/${today[0]}`;

  // init course list
  document.getElementById('add-assignment-course-field').textContent = '';
  let blank = document.createElement('option');
  blank.setAttribute('value', '');
  blank.textContent = '';
  document.getElementById('add-assignment-course-field').appendChild(blank)
  Plannr.getCourses().forEach(course => {
    let option = document.createElement('option');
    option.setAttribute('value', course.id);
    option.textContent = course.name;

    document.getElementById('add-assignment-course-field').appendChild(option);
  });
  document.getElementById('add-assignment-course-field').value = Plannr.getLastSelectedCourse();
  document.getElementById('add-assignment-course-div').classList.remove('is-invalid')
  if (document.getElementById('add-assignment-course-field').value !== '') {
    document.getElementById('add-assignment-course-div').classList.add('is-dirty')
  }
});

// Estimated time fields

addAssignmentETH.addEventListener('focusin', e => {
  if (e.target.value === '0') {
    e.target.value = '';
  }
  e.target.parentNode.classList.add('is-dirty');
})

addAssignmentETH.addEventListener('focusout', e => {
  if (e.target.value === '') {
    e.target.value = '0';
  }
  e.target.parentNode.classList.add('is-dirty');
})

addAssignmentETM.addEventListener('focusin', e => {
  if (e.target.value === '0') {
    e.target.value = '';
  }
  e.target.parentNode.classList.add('is-dirty');
})

addAssignmentETM.addEventListener('focusout', e => {
  if (e.target.value === '') {
    e.target.value = '0';
  }
  e.target.parentNode.classList.add('is-dirty');
})

editAssignmentETH.addEventListener('focusin', e => {
  if (e.target.value === '0') {
    e.target.value = '';
  }
  e.target.parentNode.classList.add('is-dirty');
})

editAssignmentETH.addEventListener('focusout', e => {
  if (e.target.value === '') {
    e.target.value = '0';
  }
})

editAssignmentETM.addEventListener('focusin', e => {
  if (e.target.value === '0') {
    e.target.value = '';
  }
  e.target.parentNode.classList.add('is-dirty');
})

editAssignmentETM.addEventListener('focusout', e => {
  if (e.target.value === '') {
    e.target.value = '0';
  }
  e.target.parentNode.classList.add('is-dirty');
})

const refreshList = () => {
  // Notifications
  Plannr.getAssignments().forEach((assignment, index) => {
    let today = getToday().split('-');
    let dueDate = assignment.duedate.split('-');

    // TODO: Add notification support
    // if (today[0] === dueDate[0] && today[1] === dueDate[1] && today[2] === dueDate[2]) {
    //   console.log('notif set')
    //   let now = new Date();
    //   let night = new Date(
    //     now.getFullYear(),
    //     now.getMonth(),
    //     now.getDate(), // the next day, ...
    //     0, 0, 0 // ...at 00:00:00 hours
    //   );
    //   let msTill9 = night.getTime() - now.getTime();
    //   // setTimeout(() => {
    //   //   new Notification(assignment.name + ' due in 3 hours');
    //   // }, night + (index * 6000));
    // }

  });

  let now = new Date();
  let night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // the next day, ...
      0, 0, 0 // ...at 00:00:00 hours
  );
  let msTillMidnight = night.getTime() - now.getTime();
  setTimeout(() => {
    Plannr.updateAssignmentList();
    refreshList();
  }, 10000000);
  Plannr.smartSort();
  updateTasksDisplay(Plannr.getAssignments())
  console.log("Assignments refreshed");
}

refreshList();
