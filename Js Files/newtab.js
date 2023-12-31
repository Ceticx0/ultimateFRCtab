doc = {
    backdrop: document.getElementById("backdrop"),
    teamimg: document.getElementById("teamimg"),
    number: document.getElementById("number"),
    name: document.getElementById("name"),
    end_epa: document.getElementById("epa"),
}

function setBackgroundImage(src) {
    doc.backdrop.style.backgroundImage = `url("${src}")`;
    doc.teamimg.style.backgroundImage = `url("${src}")`;
}

function getRandomTeamKeyFromEvent() {
    keys_list = JSON.parse(localStorage.selectedEventTeams);
    return keys_list[Math.floor(Math.random() * keys_list.length)];
}

function getRandomTeamKeyFromYear(year) {
    switch (year) {
        case 2022:
            teams_list = teams_2022;
        case 2023:
            teams_list = teams_2023;
    }

    return 'frc' + teams_list[Math.floor(Math.random() * teams_list.length)];
}


async function displayTeamInfo(teamNum, year) {
    url = `https://api.statbotics.io/v2/team_year/${teamNum}/${year}`
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    doc.number.textContent = data.team;
    doc.name.textContent = data.name;
    doc.end_epa.textContent = data.epa_end + " End EPA";
}

async function getTeamImageSource(teamkey, year) {
    try {
        const response = await fetch('https://www.thebluealliance.com/api/v3/team/' + teamkey +  '/media/' + year + '?X-TBA-Auth-Key=' + tba_auth_key);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        let src = '';
        let photo = null;
        let photos = []
        data.forEach(item => {
            if (item.type === 'imgur' || item.type === 'cdphotothread') {
                if (item.preferred) {
                    photo = item;
                }
                photos.push(item)
            }
        });
        if (!photo && photos.length > 0) {
            photo = photos[0];
        }
        if (photo) {
            switch (photo.type) {
                case 'imgur':
                    src = photo.direct_url;
                    break;
                case 'cdphotothread':
                    console.log("WE FOUND ONE: " + teamkey);
                    debugger;
                    src = 'https://www.chiefdelphi.com/media/img/' + photo.details.image_partial;
                    break;
            }
            return src;
        } else {
            console.log("Team has no images:" + teamkey);
            return;
        }
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching team media");
    }
}

async function tryGetImage(year) {
    if (JSON.parse(localStorage.eventTeams)) {
        var teamKey = getRandomTeamKeyFromEvent();
    } else {
        var teamKey = getRandomTeamKeyFromYear(year)
    }
    src = await getTeamImageSource(teamKey, year);
    if (!src) src = localStorage.defaultimg;
    setBackgroundImage(src)
    displayTeamInfo(teamKey.substring(3), year)
}

async function GetImages(concurrencyLimit, year) {
    if (JSON.parse(localStorage.eventTeams)) {
        var teamKeys = Array.from({ length: concurrencyLimit }, () => (getRandomTeamKeyFromEvent()));
    } else {
        var teamKeys = Array.from({ length: concurrencyLimit }, () => (getRandomTeamKeyFromYear(year)));
    }
    try {
        const results = await Promise.any(teamKeys.map(async (teamKey) => {
            image_src = await getTeamImageSource(teamKey, year);
            if (image_src) {
                return [image_src, teamKey];
            } else {
                throw new Error("Team does not have images");
            }

        }));

        const [team_image_src, working_team] = results;
        setBackgroundImage(team_image_src);
        displayTeamInfo(working_team.substring(3), year);

    } catch (AggregateError) {
        console.log("No teams had images, retrying");
        await GetImages(concurrencyLimit, year);
    }

}

selected_year = JSON.parse(localStorage.year);
if (JSON.parse(localStorage.imageapathy)) {
    tryGetImage(selected_year)
} else {
    GetImages(3, selected_year);
}