const legacy = {home:"index.html",learn:"how-it-works.html",development:"development.html",terms:"terms.html",done:"contact.html",bought:"script/"};
function followLegacy(){const key=location.hash.slice(1);const target=Object.hasOwn(legacy,key)?legacy[key]:null;if(target)location.replace(new URL(target,location.href));}
followLegacy();window.addEventListener('hashchange',followLegacy);
