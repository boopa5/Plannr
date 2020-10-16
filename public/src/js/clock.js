let clockDatePicker = document.getElementById('clock-datepicker');
let timeToCompletionLabel = document.getElementById('time-of-completion-label');
let showUpTo = Plannr.parseDate(clockDatePicker.value);

(() => {
  let canvas = document.getElementById('clock-canvas');
  let ctx = canvas.getContext("2d");


  canvas.width = 400;
  canvas.height = 400;

  let PIXEL_RATIO = (function (ctx) {
    let dpr = window.devicePixelRatio || 1,
      bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  })(ctx);

  ctx.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
  ctx.scale(1/2, 1/2)

  ctx.webkitImageSmoothingEnabled = true;
  let centerX = canvas.width / 2;
  let centerY = (canvas.height / 2);
  const radius = 200;
  const tickMarkLength = 10;
  const barRadius = radius - tickMarkLength - 10;
  const hourHandLength = 90;

  const drawLine = (x, y, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, y + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
  }

  function drawPieSlice(centerX, centerY, radius, startAngle, endAngle, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.shadowBlur = 0;
    ctx.closePath();
    ctx.fill();
  }

  function calcTimeOfCompletion() {
    let etSum = 0;
    Plannr.getAssignments().forEach(a => {
      if (Plannr.parseDate(a.duedate) <= showUpTo){
        etSum += +(a.et * (1 - (a.progress / 100)));
      }
    })
    return new Date(Date.now() + (etSum * 60000));
  }


  function updateClock() {
    let now = new Date();
    let hour = now.getHours() + (now.getMinutes() / 60);
    let startAngle = (-(((hour % 12) / 12) * 360) + 90) * Math.PI / 180;
    let accumulated = 0;
    let tOfC = calcTimeOfCompletion();

    //Update time of completion label
    timeToCompletionLabel.textContent = 'Time of Completion ~ ' + (tOfC.getHours() % 12  === 0 ? 12 : (tOfC.getHours() > 12 ? tOfC.getHours() % 12 : tOfC.getHours())) + ':'+ (tOfC.getMinutes() < 10 ? '0' + tOfC.getMinutes() : tOfC.getMinutes()) + (tOfC.getHours() >= 12 ? ' PM': ' AM');

    ctx.fillStyle = '#272727';
    ctx.shadowColor = "black";
    // ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw tick marks
    for (let i = 0; i < 12; ++i) {
      let angle = 30 * i * Math.PI / 180;
      let x = centerX + (radius * Math.cos(angle));
      let y = centerY - (radius * Math.sin(angle));
      let x1 = x - (tickMarkLength * Math.cos(angle))
      let y1 = y + (tickMarkLength * Math.sin(angle))
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      drawLine(x, y, x1, y1);
    }

    // Draw pie shadow
    if (tOfC - new Date() > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1;
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 8;
      console.log(tOfC - new Date())
      ctx.arc(centerX, centerY, barRadius - 1, -startAngle, -startAngle + (((tOfC - new Date()) / 3600000) / 12) * 2 * Math.PI, false)
      ctx.fill()
      ctx.stroke()
    }

    //Init courses to loop through
    showUpTo = Plannr.parseDate(clockDatePicker.value);
    let courses = {};
    Plannr.getCourses().forEach(c => {
      courses[c.id] = 0;
    })
    Plannr.getAssignments().forEach(a => {
      if (Plannr.parseDate(a.duedate) <= showUpTo){
        courses[a.course.id] += +(+a.et * (1 - (+a.progress / 100)));
      }
    });

    //Add shadow to side of chunks
    if (Plannr.getAssignments().length !== 0) {
      let lastColor;
      let firstColor;
      for (const course in courses) {
        firstColor ??= Plannr.getCourse(course).color
        if (courses[course] !== 0) {
          lastColor = Plannr.getCourse(course).color
        }
      }
      ctx.beginPath();
      ctx.strokeStyle = firstColor;
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 20;
      ctx.lineWidth = .5;
      drawLine(centerX, centerY, centerX + (barRadius * Math.cos(startAngle)), centerY - (barRadius * Math.sin(startAngle)));
      ctx.fill()
      ctx.stroke()
      ctx.beginPath();
      ctx.strokeStyle = lastColor;
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 20;
      ctx.lineWidth = .5;
      drawLine(centerX, centerY, centerX + (barRadius * Math.cos(startAngle - (((tOfC - new Date()) / 3600000) / 12) * 2 * Math.PI)), centerY - (barRadius * Math.sin(startAngle - (((tOfC - new Date()) / 3600000) / 12) * 2 * Math.PI)));
      ctx.fill()
      ctx.stroke()
    }
    //Draw Chunks
    for (const course in courses) {
      drawPieSlice(centerX, centerY, barRadius, (-1 * startAngle) + accumulated, (-1 * startAngle) + accumulated + (((courses[course] / 720) * 360) * Math.PI / 180), Plannr.getCourse(course).color);
      accumulated += (((courses[course] / 720) * 360) * Math.PI / 180);
    }

    ctx.beginPath();
    ctx.shadowColor = '#111111'
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#F17063';
    ctx.lineWidth = 6;
    drawLine(centerX, centerY, centerX + (hourHandLength * Math.cos(startAngle)), centerY - (hourHandLength * Math.sin(startAngle)));
    ctx.stroke();
    ctx.fill();
    ctx.shadowBlur = 0;

    //Round out hour hand
    ctx.beginPath();
    ctx.fillStyle = '#F17063'
    ctx.arc(centerX + ((hourHandLength - 1) * Math.cos(startAngle)), centerY - ((hourHandLength - 1) * Math.sin(startAngle)), 3, startAngle, startAngle + Math.PI);
    ctx.fill()

    ctx.beginPath();
    ctx.fillStyle = '#F17063'
    ctx.arc(centerX, centerY, 3, startAngle, startAngle - Math.PI, true)
    ctx.fill()

    requestAnimationFrame(updateClock)
  }

  requestAnimationFrame(updateClock);
})();