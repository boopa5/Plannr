const dateUpdate = () => {
    let today = new Date();
    let lastUpdated = Plannr.getLastUpdatedDate();

    if (today.getDate() !== lastUpdated.getDate() || today.getMonth() !== lastUpdated.getMonth() || today.getFullYear() !== lastUpdated.getFullYear()) {
        clockDatePicker.value = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    }
    window.requestAnimationFrame(dateUpdate)
}

dateUpdate();