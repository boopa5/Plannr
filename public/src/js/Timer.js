function getObj() {
  return JSON.parse(localStorage.getItem('[Plannr]'));
}

const Timer = {
  msToTime: function(duration) {
    let milliseconds = parseInt((duration % 1000) / 100)
      , seconds = parseInt((duration / 1000) % 60)
      , minutes = parseInt((duration / (1000 * 60)) % 60)
      , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    if (hours === 0) {
      if (minutes === 0) {
        hours = "";
        minutes = "";
        seconds += "s";
      } else {
        hours = "";
        minutes += "m ";
        seconds = ((seconds < 10) ? "0" + seconds : seconds) + "s";
      }
    } else {
      hours += "h ";
      minutes = ((minutes < 10) ? "0" + minutes : minutes) + "m ";
      seconds = ((seconds < 10) ? "0" + seconds : seconds) + "s";
    }

    return hours + minutes + seconds;
  },
  getStart: function() {
    return getObj().timer.start;
  },
  setStart: function(n) {
    let storageObj = getObj();
    storageObj.timer.start = n;
    localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
  },
  getPauseStart: function() {
    return getObj().timer.pauseStart;
  },
  setPauseStart: function(n) {
    let storageObj = getObj();
    storageObj.timer.pauseStart = n;
    localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
  },
  isPaused: function() {
    return getObj().timer.isPaused;
  },
  setIsPaused(bool) {
    let storageObj = getObj();
    storageObj.timer.isPaused = bool;
    localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
  },
  getPauseElapsed() {
    return getObj().timer.pauseElapsed;
  },
  setPauseElapsed(n) {
    let storageObj = getObj();
    storageObj.timer.pauseElapsed = n;
    localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
  },
  getLastPausedTimerValue() {
    return getObj().timer.lastPausedTimerValue;
  },
  setLastPausedTimerValue(n) {
    let storageObj = getObj();
    storageObj.timer.lastPausedTimerValue = n;
    localStorage.setItem('[Plannr]', JSON.stringify(storageObj));
  },
  getTime: function() {
    if (this.getStart() === -1) {
      return 0;
    }
    return (new Date() - new Date(this.getStart())) - this.getPauseElapsed();
  },
  start: function() {
    this.setIsPaused(false);
    this.setStart(new Date());
  },
  stop: function() {
    if (this.getStart() !== -1) {
      this.setIsPaused(false);
      let res = this.getTime();
      this.setStart(-1);
      return res;
    } else {
      return 0;
    }
  },
  pause: function() {
    if (this.getStart() !== -1) {
      this.setIsPaused(true);
      this.setPauseStart(new Date());
      this.setLastPausedTimerValue(this.msToTime(this.getTime()));
    } else {
      console.log('[Timer] Illegal Operation: Cannot pause if not started or is ended');
    }
  },
  unpause: function() {
    if (this.isPaused()) {
      this.setPauseElapsed(this.getPauseElapsed() + (new Date() - new Date(this.getPauseStart())))
      this.setIsPaused(false);
    } else {
      console.log('[Timer] Illegal Operation: Cannot unpause if not paused');
    }
  },
  init: function(startPauseButton, stopButton, label) {
    startPauseButton.addEventListener('click', () => {
      if (!this.isPaused()) {
        if (this.getStart() === -1) {
          this.start();
          startPauseButton.innerText = 'Pause';
          stopButton.innerText = 'Finished';
          return;
        }
        this.pause();
        startPauseButton.innerText = 'Unpause';
      } else {
        this.unpause();
        startPauseButton.innerText = 'Pause';
      }
    });

    stopButton.addEventListener('click', () => {
      console.log(this.msToTime(this.stop()));
      startPauseButton.innerText = 'Start';
      label.innerText = this.msToTime(0);
      stopButton.innerText = 'Skip';
    });

    label.innerText = this.getLastPausedTimerValue();
    if (this.isPaused()) {
      startPauseButton.innerText = 'Unpause'
    } else {
      if (this.getStart() === -1) {
        startPauseButton.innerText = 'Start';
        stopButton.innerText = 'Skip';
      } else {
        startPauseButton.innerText = 'Pause';
      }
    }
    setInterval(() => {
      if (!this.isPaused() && this.startTime !== -1) {
        label.innerText = this.msToTime(this.getTime());
      }
    });
  }
}