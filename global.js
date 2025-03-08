// global.js

console.log("IT'S ALIVE!");

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
  { url: 'meta/', title: 'Meta'},
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
    url = '/portfolio/' + url;
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

// Lab 4
// Part 1
// Find JSON
export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data; 
      

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }

}

// Render from json file
// Render from JSON file
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = ''; // Clear existing content

  // Loop through each project and create an article for each
  for (let project of projects) {
    const article = document.createElement('article'); // Create a new article for each project
    article.innerHTML = `
      <div><${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p></div>
      <div><i>year: ${project.year}</i></div>
    `;
    
    containerElement.appendChild(article); // Append the article to the container
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

