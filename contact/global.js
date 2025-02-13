// Select Function
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2
const navLinks = $$("nav a")
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
  // or if (currentLink !== undefined)
  currentLink?.classList.add('current');
}

// Step 3
// Create Page Links
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact'},
  { url: 'resume/', title: 'Resume'},
  { url: 'highlight/', title: 'Highlight'}
];

// Add nav to beginning of html
let nav = document.createElement('nav');
document.body.prepend(nav);

// Checks if current link is home
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Adds links to nav
for (let p of pages) {
  let url = p.url;

  // Checks if we are on home page
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = '../' + url;
  }
  let title = p.title;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  nav.append(a);
}

// Step 4
// Insert Button HTML
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
  
          </select>
      </label>`
  );
  
  const select = document.querySelector('.color-scheme select')
  
  // saves color scheme 
  if ('colorScheme' in localStorage) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme; // Update the dropdown to match
  }
  
  // Add Listener to Event
  select.addEventListener('input', function (event) {
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value
  });
  