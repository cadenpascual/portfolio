console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }
  
  // Select all navigation links
navLinks = $$("nav a");
  
  // Find the link matching the current page's host and path
currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);
  
  // If a matching link is found, add the 'current' class
if (currentLink) {
    currentLink?.classList.add('current');
}