// global.js

console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2: Automatic Current Page Link
function highlightCurrentPage() {
  const navLinks = $$("nav a");
  const currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );
  currentLink?.classList.add("current");
}

// Step 3: Automatic Navigation Menu
function createNavigation() {
  const pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "about/", title: "About" },
    { url: "contact/", title: "Contact" },
    { url: "highlight", title: "Highlight"}
  ];

  const nav = document.createElement("nav");
  document.body.prepend(nav);

  const ARE_WE_HOME = document.documentElement.classList.contains("home");

  for (let p of pages) {
    let url = p.url;
    if (!ARE_WE_HOME && !url.startsWith("http")) {
      url = "../" + url;
    }

    const a = document.createElement("a");
    a.href = url;
    a.textContent = p.title;

    a.classList.toggle(
      "current",
      a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
      a.target = "_blank";
    }

    nav.append(a);
  }
}

// Step 4: Dark Mode Toggle
function setupDarkModeToggle() {
  document.body.insertAdjacentHTML(
    "afterbegin",
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

  const select = document.querySelector(".color-scheme select");
  const savedScheme = localStorage.colorScheme;

  if (savedScheme) {
    document.documentElement.style.setProperty("color-scheme", savedScheme);
    select.value = savedScheme;
  }

  select.addEventListener("input", (event) => {
    const scheme = event.target.value;
    document.documentElement.style.setProperty("color-scheme", scheme);
    localStorage.colorScheme = scheme;
  });
}

// Initialize all features
createNavigation();
highlightCurrentPage();
setupDarkModeToggle();
