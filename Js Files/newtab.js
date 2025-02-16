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

function getRandomTeamKeyFromEvent(excludedTeams = []) {
    keys_list = JSON.parse(localStorage.selectedEventTeams);
    for (const team of excludedTeams) {
        index = keys_list.indexOf(team);
        if (index > -1) {
            keys_list.splice(index, 1);
        }
    }
    return keys_list[Math.floor(Math.random() * keys_list.length)];
}

function getRandomTeamKeyFromYear(year) {
    switch (year) {
        case 2022:
            teams_list = teams_2022;
        case 2023:
            teams_list = teams_2023;
        case 2024:
            teams_list = teams_2024;
    }

    return 'frc' + teams_list[Math.floor(Math.random() * teams_list.length)];
}

async function fetchAndCacheImage(src) {
    try {
        const response = await fetch(src, {
            method: 'GET',
            redirect: 'manual',
            cache: 'default',
        });

        if (response.status >= 300 && response.status < 400) {
            // console.warn(`Redirect detected for URL: ${src} -> ${response.headers.get('Location')}`);
            return null;
        }

        if (response.ok) {
            return src;
        } else {
            // console.warn(`Failed to load image: ${src} (Status: ${response.status})`);
            return null;
        }

    } catch (error) {
        // console.error(`Error fetching image ${src}: ${error.message}`);
        return null;
    }
}

async function getValidImageSrc(photos) {
    for (const photo of photos) {
        const src = getPhotoSrc(photo);
        const isValid = await fetchAndCacheImage(src);
        if (isValid) {
            return src;
        }
    }
    return null;
}

async function displayTeamInfo(teamNum, year) {
    url = `https://api.statbotics.io/v3/team_year/${teamNum}/${year}`
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    doc.number.textContent = data.team;
    doc.name.textContent = data.name;
    doc.end_epa.textContent = data.epa.total_points.mean + " End EPA";
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

        if (photo && photo.src) {
            validSrc = await fetchAndCacheImage(photo.src);
            if (validSrc) return validSrc;
        }
        if (photos.length > 0) {
            validSrc = await getValidImageSrc(photos);
            if (validSrc) return validSrc;
        }
        console.log("Team has no images:" + teamkey);
        return;

    } catch (error) {
        console.error(error);
        throw new Error("Error fetching team media");
    }
}

function getPhotoSrc(photo){
    switch (photo.type) {
        case 'imgur':
            src = photo.direct_url;
            break;
        case 'cdphotothread':
            console.log("WE FOUND ONE: " + teamkey);
            debugger;
            src = 'https://www.chiefdelphi.com/media/img/' + photo.details.image_partial;
            break;
        default:
            src = photo.direct_url
    }
    return src;
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

async function GetImages(concurrencyLimit, year, excludedTeams = []) {
    if (JSON.parse(localStorage.eventTeams)) {
        var teamKeys = Array.from({ length: concurrencyLimit }, () => (getRandomTeamKeyFromEvent(excludedTeams)));
    } else {
        var teamKeys = Array.from({ length: concurrencyLimit }, () => (getRandomTeamKeyFromYear(year)));
    }
    if (teamKeys.length === 0) {
        console.log("No teams with images found");
        tryGetImage(year);
        return;
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
        await GetImages(concurrencyLimit, year, excludedTeams.concat(teamKeys));
    }

}

selected_year = JSON.parse(localStorage.year);
if (JSON.parse(localStorage.imageapathy)) {
    tryGetImage(selected_year)
} else {
    GetImages(3, selected_year);
}