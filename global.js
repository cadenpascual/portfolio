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
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'highlight/', title: 'Highlight' },

];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
}

const ARE_WE_HOME = document.documentElement.classList.contains('home');
url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
            <option value='light dark'>Automatic</option>
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
          </select>
      </label>`
  );
  