const legacy = {home:"index.html",learn:"how-it-works.html",development:"development.html",terms:"terms.html",done:"contact.html",bought:"script/"};
function followLegacy(){const target=legacy[location.hash.slice(1)];if(target)location.replace(new URL(target,location.href));}
followLegacy();window.addEventListener('hashchange',followLegacy);
