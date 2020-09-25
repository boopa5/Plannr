let editCourseList = document.getElementById('settings-course-list');
let idCounter = 0;

function updateCourseDisplay(list) {
  clearCourses();
  for (let i = 0; i < list.length; ++i) {
    editCourseList.append(createCourseEditor(list[i]));
    idCounter++;
  }
  componentHandler.upgradeAllRegistered();
  if (Plannr.getCourses().length === 0) {
    let noAssignmentsLabel = document.createElement('h4');
    noAssignmentsLabel.style.opacity = '0.4';
    noAssignmentsLabel.textContent = 'No Courses Added'
    noAssignmentsLabel.style.marginTop = '10px';
    editCourseList.appendChild(noAssignmentsLabel);
  }
}

function clearCourses() {
  while(editCourseList.hasChildNodes()) {
    editCourseList.removeChild(editCourseList.lastChild);
  }
  idCounter = 0;
}

function createCourseEditor(course) {
  let styles = Plannr.getThemeCss();
  let wrapper = document.createElement('div');
  wrapper.setAttribute('class', 'mdl-card mdl-shadow--2dp');
  wrapper.style.minHeight = '0';
  wrapper.style.backgroundColor = styles.bgSecondary;
  wrapper.style.width = '500px';
  wrapper.style.color = styles.fontColor;
  wrapper.style.marginBottom = '10px';

  let colorPickerWrapper = document.createElement('div');
  colorPickerWrapper.setAttribute('id', 'color-picker-wrapper');
  let colorPicker = document.createElement('input');
  colorPicker.setAttribute('id', 'color-picker');
  colorPicker.setAttribute('type', 'color');
  colorPickerWrapper.style.width = '34px';
  colorPickerWrapper.style.marginLeft = '12px';
  colorPickerWrapper.style.marginTop = '15px';
  // colorPicker.onchange = function() {
  //   colorPickerWrapper.style.backgroundColor = colorPicker.value;
  //   Plannr.updateCourse({name: courseNameInput.value.trim(), color: colorPicker.value, id: course.id}, 'id');
  // }
  colorPicker.value = course.color;
  colorPickerWrapper.style.backgroundColor = colorPicker.value;
  colorPickerWrapper.appendChild(colorPicker);

  let source = colorPicker;
  let picker = new CP(source, {textInput: false});

  // Prevent showing native color picker panel
  source.addEventListener('click', function(e) {
    e.preventDefault();
  }, false);

  picker.on('change', function(r, g, b) {
    this.source.value = this.color(r, g, b, 1); // There is no alpha channel support in HTML5 color input
    colorPickerWrapper.style.backgroundColor = colorPicker.value;
    if (!picker.state.textInput){
      document.getElementById('hex-input').value = colorPicker.value;
    }
    Plannr.updateCourse({name: courseNameInput.value.trim(), color: colorPicker.value, id: course.id}, 'id');
  });

  colorPicker.addEventListener('click', e => {
    let inputDiv = document.createElement('div');
    inputDiv.setAttribute('id', 'input-div')
    inputDiv.setAttribute('class', 'mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty has-placeholder is-upgraded')
    inputDiv.setAttribute('style', 'width: auto;')

    let hexInput = document.createElement('input');
    hexInput.setAttribute('type', 'text');
    hexInput.setAttribute('id', 'hex-input')
    hexInput.setAttribute('class', 'mdl-textfield__input');
    // hexInput.setAttribute('pattern', '^#([A-Fa-f0-9]{1,2}){3}$')
    hexInput.value = colorPicker.value;

    let inputLabel = document.createElement('label');
    inputLabel.setAttribute('class', 'mdl-textfield__label');
    inputLabel.setAttribute('for', 'hex-input');
    inputLabel.textContent = 'Hex code'

    inputDiv.appendChild(hexInput);
    inputDiv.appendChild(inputLabel);

    hexInput.addEventListener('input', e => {
      picker.state.textInput = true;
      if (/^#[0-9A-F]{6}$/i.test('#AABBCC')) {
        picker.value(...CP.HEX(hexInput.value));
      }
    });

    hexInput.addEventListener('focusout', e => {
      picker.state.textInput = false;
    })



    let pickerDiv = document.querySelector('.color-picker');
    pickerDiv.childNodes.forEach(node => {
      if (node.getAttribute('id') === 'input-div') {
        pickerDiv.removeChild(node);
      }
    })
    pickerDiv.appendChild(inputDiv);

    componentHandler.upgradeAllRegistered();
  })



  let deleteButton = document.createElement('button');
  let deleteIcon = document.createElement('i');
  deleteButton.setAttribute('class', "mdl-button mdl-js-button mdl-button--icon");
  deleteIcon.setAttribute('class', "material-icons");
  deleteIcon.innerText = 'clear';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', event => {
    for (const a of Plannr.getAssignments()) {
      if (a.course.id === course.id) {
        alert('Cannot delete as there is currently have an existing assignment under this course');
        return;
      }
    }
    Plannr.deleteCourse(course.id);
    updateCourseDisplay(Plannr.getCourses());
  });
  deleteButton.style.float = 'right';
  deleteButton.style.marginRight = '12px';
  deleteButton.style.marginTop = '16px';

  let courseNameDiv = document.createElement('div');
  if (course.name !== '') {
    courseNameDiv.setAttribute('class', 'mdl-textfield mdl-js-textfield is-dirty');
  } else {
    courseNameDiv.setAttribute('class', 'mdl-textfield mdl-js-textfield');
  }
  courseNameDiv.style.paddingTop = '1';
  courseNameDiv.style.marginLeft = '14px';
  courseNameDiv.style.width = '350px';
  let courseNameInput = document.createElement('input');
  courseNameInput.setAttribute('type', 'text');
  courseNameInput.setAttribute('class', 'mdl-textfield__input');
  courseNameInput.setAttribute('id', course.id)
  courseNameInput.value = course.name;
  let courseNameLabel = document.createElement('label');
  courseNameLabel.setAttribute('for', course.id);
  courseNameLabel.setAttribute('class', 'mdl-textfield__label');
  courseNameLabel.textContent = 'Course Name';
  courseNameDiv.appendChild(courseNameInput);
  courseNameDiv.appendChild(courseNameLabel);

  courseNameInput.addEventListener('change', event => {
    courseNameInput.value = courseNameInput.value.trim();
    Plannr.updateCourse({name: courseNameInput.value.trim(), color: colorPicker.value, id: course.id}, 'id');
  });

  let wrapper2 = document.createElement('div');

  wrapper2.appendChild(colorPickerWrapper);
  wrapper2.appendChild(courseNameDiv);
  wrapper2.appendChild(deleteButton);

  wrapper.appendChild(wrapper2);

  return wrapper;
}

// TODO: New section for how due dates are evaluated

document.getElementById('add-course').addEventListener('click', event => {
  let newCourse = {
    name: '',
    color: '#808080',
    id: Plannr.makeId()
  }
  Plannr.addCourse(newCourse);
  updateCourseDisplay(Plannr.getCourses());
  componentHandler.upgradeAllRegistered();
});


// Copy Export Code
document.getElementById('export-btn').addEventListener('click', e => {
  navigator.clipboard.writeText(JSON.stringify(getObj())).then(() => {
    let snackbarContainer = document.querySelector('#copied-toast');
    let data = {message: 'Copied Export Data!'};
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  })
})

// Import Code
document.getElementById('import-btn').addEventListener('click', e => {
  let importString = document.getElementById('import-textarea').value
    try {
      let storage = JSON.parse(importString);
      if (Plannr.validateStorage(storage)) {
        Plannr.setStorage(storage);
        location.reload()
      } else {
        alert('String structure does not match current version');
      }
    } catch (e) {
      alert('Not valid import string format');
    }
})

updateCourseDisplay(Plannr.getCourses());