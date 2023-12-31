// If something's wrong with the options (generally, if they aren't set yet),
// clear all options and reset to defaults.
// TODO: Updating isn't exactly graceful. Find a better way to do this.
if (!localStorage.imageapathy) localStorage.imageapathy = false;
if (!localStorage.defaultimg) localStorage.defaultimg = undefined;
if (!localStorage.year) localStorage.year = '2023';
if (!localStorage.eventTeams) localStorage.eventTeams = false;
if (!localStorage.event) localStorage.event = undefined;



