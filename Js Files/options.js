var options = {
    imageapathy: document.getElementById('imageapathy'),
    defaultimg: document.getElementById('defaultimg'),
    year: document.getElementById('year'),
    eventTeams: document.getElementById('eventTeams'),
    event: document.getElementById('event'),
};
setkeyBtn = document.getElementById('setkey');
setkeyBtn.onclick = saveTeamList;

async function saveTeamList() {
    eventKey = options.event.value
    url = `https://www.thebluealliance.com/api/v3/event/${eventKey}/teams/keys?X-TBA-Auth-Key=` + tba_auth_key;
    const response = await fetch(url);
    if (!response.ok) {
        console.log(response)
        throw new Error('Network response was not ok');
    }
    const data = await response.json()
    localStorage.selectedEventTeams = JSON.stringify(data) 
    console.log("Set Event Key!");
}

if (localStorage.event !== undefined && localStorage.event !== 'undefined' && localStorage.event !== '') {
    options.event.value = localStorage.event;
}
if (localStorage.defaultimg !== undefined && localStorage.defaultimg !== 'undefined' && localStorage.defaultimg !== '') {
    options.defaultimg.value = localStorage.defaultimg;
}

options.imageapathy.checked = JSON.parse(localStorage.imageapathy);
options.year.value = localStorage.year;
options.eventTeams.checked = JSON.parse(localStorage.eventTeams);

function updateOptions() {
    localStorage.imageapathy = options.imageapathy.checked;
    localStorage.defaultimg = options.defaultimg.value;
    localStorage.year = options.year.value;
    localStorage.eventTeams = options.eventTeams.checked;
    localStorage.event = options.event.value;
    console.log('Options updated!');
}

options.defaultimg.oninput = updateOptions;
options.event.oninput = updateOptions;
onchange = updateOptions;