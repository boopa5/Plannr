const dateUpdate = () => {
    let today = new Date();
    let lastUpdated = Plannr.getLastUpdatedDate();

    if (today.getDate() !== lastUpdated.getDate() || today.getMonth() !== lastUpdated.getMonth() || today.getFullYear() !== lastUpdated.getFullYear()) {
        clockDatePicker.date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        clockDatePicker.value = '' + (today.getMonth() + 1) + '/' + (today.getDate() + 1) + '/' + today.getFullYear()
        Plannr.setLastUpdateDate(new Date());
        console.log('broken')
    }
    window.requestAnimationFrame(dateUpdate)
}

dateUpdate();