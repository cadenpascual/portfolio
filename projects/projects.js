import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Week 5 Part 1
// Create Circle using d3
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Color Scale
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Define selected index
let selectedIndex = -1;



// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year }; // TODO
  });
  
  // re-calculate slice generator, arc data, arc, etc.
  let sliceGenerator = d3.pie().value((d) => d.value)
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));
  
  // clear up paths and legends
  let svg = d3.select('svg'); 
  svg.selectAll('path').remove();

  // remove old legend data
  let legend = d3.select('.legend');
  legend.selectAll('li').remove()
  
  
  // update paths and legends
  // Generates the arcs of data for each index
  arcs.forEach((arc, i) => {
    svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))

    // change the css on click
    .on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
      
      svg
        .selectAll('path')
        .classed('selected', (_, idx) => idx === selectedIndex);

      legend
        .selectAll('li')
        .classed('selected', (_, idx) => idx === selectedIndex);
      
      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        let selectedYear = arcData[selectedIndex].data.label;
        
        let filteredProjects = projects.filter(p => p.year === selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
      } 

      
    });
    
  })

  // Add legend next to the pie chart
  data.forEach((d, idx) => {
      legend.append('li')
          .attr('class', 'legend-item') // adds class
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  })
}

renderPieChart(projects);

let query = '';

// Define setQuery function
function setQuery(value) {
  query = value; // Update the global query variable
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
  let filteredProjects = setQuery(event.target.value);
  console.log(filteredProjects);
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});