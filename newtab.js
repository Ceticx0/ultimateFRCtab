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
async function setTeamImage(teamkey, year=2023) {
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
                    console.log("WE FOUND ONE: " + teamkey)
                    debugger;
                    src = 'https://www.chiefdelphi.com/media/img/' + photo.details.image_partial;
                    break;
            }
            setBackgroundImage(src);
        } else {
            console.log("THIS TEAM DOESN'T HAVE ANY IMAGES:" + teamkey);
        }
    } catch (error) {
        console.error('Error fetching team media:', error);
    }
}


// async function tryGetImage() {
//     const teamKey = 'frc' + teams_2023[Math.floor(Math.random() * teams_2023.length)];
//     // const teamKey = 'frc4336'
//     console.log(teamKey)
//     await setTeamImage(teamKey);
//     const backgroundImage = doc.teamimg.style.backgroundImage;
//     if (backgroundImage === 'none' || backgroundImage === '') {
//         // If the team doesn't have any images, retry
//         await tryGetImage();
//     } else {
//         displayTeamInfo(teamKey.substring(3))
//     }
// }

async function tryGetImages(count) {
    if (count <= 0) {
        console.log("at least 1 at a time pls");
        return;
    }

    const teamKey = 'frc' + teams_2023[Math.floor(Math.random() * teams_2023.length)];
    console.log(teamKey);

    await setTeamImage(teamKey);
    const backgroundImage = doc.teamimg.style.backgroundImage;

    if (backgroundImage === 'none' || backgroundImage === '') {
        // If the team doesn't have any images, retry with reduced count
        await tryGetImages(count - 1);
    } else {
        displayTeamInfo(teamKey.substring(3));
    }
}


tryGetImage(3)