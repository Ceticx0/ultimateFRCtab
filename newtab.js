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

async function displayTeamInfo(teamNum, year=2023) {
    url = `https://api.statbotics.io/v2/team_year/${teamNum}/${year}`
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    doc.number.textContent = data.team;
    doc.name.textContent = data.name;
    doc.end_epa.textContent = data.epa_end;
}
async function getTeamImageSource(teamkey, year=2023) {
    try {
        const response = await fetch('https://www.thebluealliance.com/api/v3/team/' + teamkey +  '/media/' + year + '?X-TBA-Auth-Key=IJ7ECNmOibpHt04EdVs4xS7q5OQkIY5GE7USErbLXK3i4obXAilhJD8VP590o8Ur');
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
            console.log("THIS TEAM DOESN'T HAVE ANY IMAGES:" + teamkey);
            return;
        }
    } catch (error) {
        console.error('Error fetching team media:', error);
        return;
    }
}

async function tryGetImage() {
    const teamKey = 'frc' + teams_2023[Math.floor(Math.random() * teams_2023.length)];
    console.log(teamKey)
    src = await getTeamImageSource(teamKey);
    setBackgroundImage(src)
    displayTeamInfo(teamKey.substring(3))
}

async function GetImages(concurrencyLimit) {
    const teamKeys = Array.from({ length: concurrencyLimit }, () => 'frc' + teams_2023[Math.floor(Math.random() * teams_2023.length)]);

    try {
        const results = await Promise.any(teamKeys.map(async (teamKey) => {
            console.log(teamKey);
            image_src = await getTeamImageSource(teamKey);
            if (image_src) {
                return [image_src, teamKey];
            } else {
                throw new Error("Team does not have images");
            }

        }));

        const [team_image_src, working_team] = results;
        setBackgroundImage(team_image_src);
        displayTeamInfo(working_team.substring(3));

    } catch (AggregateError) {
        console.log("No teams had images, retrying");
        await GetImages(concurrencyLimit);
    }

}

GetImages(3);