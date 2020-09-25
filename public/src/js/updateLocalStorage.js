(() => {
  let storage = getObj();

  storage.sort.groupCourses ??= false;
  storage.lastSelectedCourse ??= '';
  storage.lastUpdatedDate ??= new Date();

  Plannr.setStorage(storage);
})();