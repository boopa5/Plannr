(() => {
  let sortOptionButton = document.getElementById('sort-option-button');
  let sortOptionList = document.getElementById('sort-option-list');

  sortOptionButton.textContent = Plannr.getSort();

  sortOptionList.childNodes.forEach(option => {
    option.addEventListener('click', () => {
      Plannr.setSortType(option.textContent);
      sortOptionButton.textContent = Plannr.getSort();
      Plannr.smartSort();
      updateTasksDisplay(Plannr.getAssignments());
    })
  })

  let sortByClassBox = document.getElementById('group-courses-box')

  sortByClassBox.addEventListener('click', () => {
    Plannr.toggleGroupCourse();
    Plannr.smartSort();
    updateTasksDisplay(Plannr.getAssignments());
  })
})();