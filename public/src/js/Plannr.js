function getObj() {
  return JSON.parse(localStorage.getItem('[Plannr]'));
}

const Plannr = (() => {
  return {
    setStorage: function(storageObj) {
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    getLastUpdatedDate: function() {
      return new Date(getObj().lastUpdatedDate);
    },
    setLastUpdateDate: function(date) {
      let storage = getObj();
      storage.lastUpdatedDate = date;
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
    },
    validateStorage: function(storage) {
      const storageKeys = ['theme', 'assignments', 'reminders', 'courses', 'coursesSet', 'sort', 'deleted', 'lastUpdatedDate'];
      for (const key of storageKeys) {
        if (storage[key] === undefined) {
          console.log('Storage structure does not match');
          return false;
        }
      }
      return true;
    },
    getSort: function() {
      return getObj().sort.type;
    },
    setSortType: function(sort) {
      let storage = getObj();
      storage.sort.type = sort;
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
    },
    toggleSortEnable: function() {
      let storage = getObj();
      storage.sort.enabled = !storage.sort.enabled;
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
    },
    getSortEnable: function() {
      return getObj().sort.enabled;
    },
    toggleGroupCourse: function() {
      let storage = getObj();
      storage.sort.groupCourses = !storage.sort.groupCourses;
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
    },
    getGroupCourses: function() {
      return getObj().sort.groupCourses;
    },
    // Modifies the assignments array in storage
    smartSort: function() {
      console.log('SORT')
      if (getObj().sort.enabled) {
        let assignments = this.getAssignments();
        let compareFunc; // a is greater than b => -1
        let today = new Date();
        let type = Plannr.getSort();
        switch (type) {
          case 'Due Date':
            compareFunc = (a, b) => {
              let aDate = a.duedate.split('/');
              [aDate[0], aDate[1], aDate[2]] = [+aDate[2], +aDate[0] - 1, +aDate[1]];
              aDate = today - new Date(...aDate);
              let bDate = b.duedate.split('/');
              [bDate[0], bDate[1], bDate[2]] = [+bDate[2], +bDate[0] - 1, +bDate[1]];
              bDate = today - new Date(...bDate);
              if (b.pinned) {
                return 1;
              } else if (a.pinned) {
                return -1;
              }
              if (+b.progress === 100) {
                  return -1;
              } else if (+a.progress === 100) {
                return 1;
              } else {
                return bDate - aDate;
              }
            }
            break;
          case 'Longest Time':
            compareFunc = (a, b) => {
              if (b.pinned) {
                return 1;
              } else if (a.pinned) {
                return -1;
              }
              if (+b.progress === 100) {
                return -1;
              } else if (+a.progress === 100) {
                return 1;
              }
              return -1 * ((a.et * (1 - (a.progress / 100))) - (b.et * (1 - (b.progress / 100))))
            }
            break;
          case 'Shortest Time':
            compareFunc = (a, b) => {
              if (b.pinned) {
                return 1;
              } else if (a.pinned) {
                return -1;
              }
              if (+b.progress === 100) {
                return -1;
              } else if (+a.progress === 100) {
                return 1;
              }
              return (a.et * (1 - (a.progress / 100))) - (b.et * (1 - (b.progress / 100)));
            }
            break;
          default:
            break;
        }
        if (this.getGroupCourses()) {
          let res = [];
          let courses = {};
          Plannr.getCourses().forEach(c => {
            courses[c.id] = [];
          });
          // Partition
          assignments.forEach(a => {
            courses[a.course.id].push(a);
          })

          for (let assignmentArr in courses) {
            courses[assignmentArr] = courses[assignmentArr].sort(compareFunc);
            courses[assignmentArr].forEach(a => {
              res.push(a);
            })
          }
          this.setAssignments(res);
          return this.getAssignments();
        }
        assignments.sort(compareFunc);
        this.setAssignments(assignments);
        return this.getAssignments();
      } else {
        console.log('Sort is not enabled');
      }
    },
    safeContains: function(list, item) {
      for (const thing of list)  {
        if (thing.name.toLowerCase().trim() === item.toLowerCase().trim()) {
          return true;
        }
      }
      return false;
    },
    addAssignment: function(assignment) {
      let storageObj = getObj();
      // Prevent Duplication
      for (const a of storageObj.assignments) {
        if (a.id === assignment.id) {
          console.log('[Error] Assignment with id already exists')
          return;
        }
      }
      storageObj.assignments.push(assignment);
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    setAssignments: function(list) {
      let storageObj = getObj();
      storageObj.assignments = list;
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    getAssignments: function() {
      return getObj().assignments;
    },
    getAssignment: function(id) {
      for (const assignment of this.getAssignments()) {
        if (assignment.id === id) {
          return assignment;
        }
      }
    },
    updateAssignment: function(assignment) {
      let assignments = this.getAssignments();
      assignments = assignments.map(a => {
        return a.id === assignment.id ? assignment : a;
      });
      this.setAssignments(assignments);
    },
    deleteAssignment: function(id) {
      let assignments = this.getAssignments();
      assignments = assignments.filter(assignment => assignment.id !== id);
      this.setAssignments(assignments);
    },
    parseDate: function(date) {
      // FORMAT: MM/DD/YYYY
      date = date.split('/');
      [date[0], date[1], date[2]] = [+date[2], +date[0] - 1, +date[1]];
      return new Date(...date);
    },
    dueStatus: function(assignment) {
      let dueDate = this.parseDate(assignment.duedate);
      let today = new Date();
      let progress = +assignment.progress;

      if (progress !== 100) {
        if (today - dueDate > 86400000) {
          return 'overdue';
        } else if (today - dueDate > 0) {
          return 'due';
        } else if (today - dueDate > -86400000) {
          return 'tomorrow'
        }
      }
    },
    updateAssignmentList: function() {
      // Clearing completed assignments
      let assignments = this.getAssignments()
      assignments = assignments.filter(a => +a.progress !== 100);
      this.setAssignments(assignments);
    },
    addReminder: function(reminder) {
      let storageObj = getObj();
      storageObj.reminders.push(reminder);
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    setReminders: function(list) {
      let storageObj = getObj();
      storageObj.reminders = list;
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    getReminders: function() {
      return getObj().reminders.sort();
    },
    addCourse: function(course) {
      let storageObj = getObj();
      storageObj.courses.unshift(course);
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    updateCourse: function(course, attribute) {
      let courses = this.getCourses();
      // Update all assignments with altered course
      this.setAssignments(this.getAssignments().map(assignment => {
        if (course.id === assignment.course.id) {
          assignment.course = course;
        }
        return assignment;
      }));
      this.setCourses(courses.map(c => c[attribute] === course[attribute] ? course : c));

    },
    setCourses: function(list) {
      let storageObj = getObj();
      storageObj.courses = list;
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    deleteCourse: function(id) {
      let courses = this.getCourses();
      courses = courses.filter(course => course.id !== id);
      this.setCourses(courses);
    },
    getCourses: function() {
      return getObj().courses.sort();
    },
    getCourse: function(id) {
      for (const course of this.getCourses()) {
        // console.log(course);
        // console.log('[get call] ' + course.id + " passedin "+ id);
        if (course.id === id) {
          return course;
        }
      }
      console.log('could not find');
    },
    getCourseByName: function(name) {
      for (const course of this.getCourses()) {
        if (course.name === name) {
          return course;
        }
      }
      console.log('could not find');
    },
    setCoursesSet: function(bool) {
      let storageObj = getObj();
      storageObj.coursesSet = bool;
      localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
    },
    getLastSelectedCourse: function() {
      return getObj().lastSelectedCourse;
    },
    setLastSelectedCourse: function(id) {
      let storage = getObj();
      storage.lastSelectedCourse = id;
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
    },
    getTheme: function() {
      return getObj().theme;
    },
    setTheme: function(theme) {
      let storageObj = getObj();
      storageObj.theme = theme;
      localStorage.setItem('[Plannr]', storageObj);
    },
    getThemeCss: function() {
      return this.getTheme() === 'light' ? {
          bgColor: '#FFFFFF',
          bgSecondary: '#FFFFFF',
          colorPrimary: '#17ed90',
          colorSecondary: '#243133',
          fontColor: '#121212'
        } : {
          bgColor: '#121212',
          bgSecondary: '#272727',
          colorPrimary: '#17ed90',
          colorSecondary: '#243133',
          fontColor: "#FFFFFF"
        }
    },
    makeId: function() {
      return new Date().getTime() + "";
    },
    getDeleted: function() {
      return getObj().deleted;
    },
    addDeleted: function(assignment) {
      let storage = getObj();
      if (storage.deleted.length < 5) {
        storage.deleted.push(assignment);
      } else {
        storage.deleted.shift();
        storage.deleted.push(assignment);
      }
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
    },
    getLastDeleted: function() {
      let storage = getObj()
      let res = storage.deleted.pop();
      localStorage.setItem('[Plannr]', JSON.stringify(storage));
      return res;
    },
    calculateTotalTime: function() {
      let res = 0;
      Plannr.getAssignments().forEach(assignment => {
        res += assignment.et - ((assignment.progress / 100) * assignment.et);
      });
      return res;
    }
  }
})();