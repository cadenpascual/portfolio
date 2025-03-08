let data = [];
let commits = [];
let filteredCommits = [];
let xScale;
let yScale;

// Load the data from loc.csv
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    displayStats();
    updateScatterplot(commits);
    updateCommitTime();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData(); 
});

// Group Commit Data
function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        // First line 
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        // Return Processed Data
        let ret = {
            id: commit,
            url: 'https://github.com/cadenpascual/portfolio/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            // How many lines were modified?
            totalLines: lines.length,
        };
        
        Object.defineProperty(ret, 'lines', {
            value: lines,
            // Hides line data
            enumerable: false,
            writable: false,  
            configurable: false
          });

        return ret;
      });
  }


function roundToOneDecimal(num) {
    return Math.round(num * 10) / 10;
}

function displayStats() {
    // Process commits first
    processCommits();

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('h3').text('Summary')
    
    // Add total commits
    dl.append('dt').text('Commits');
    dl.append('dd').text(commits.length);
    
    // Add total files
    dl.append('dt').html('Files');
    dl.append('dd').text(d3.group(data, d => d.file).size);
    
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);



    // Add Max Lines
    dl.append('dt').html('Max Lines');
    dl.append('dd').text(d3.max(data, d => d.line));

    // Add Average File Length
    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file
      );

    dl.append('dt').html('Avg Lines');
    dl.append('dd').text(roundToOneDecimal(d3.mean(fileLengths, (d) => d[1])));

    // Add Average Depth
    dl.append('dt').html('Max Depth');
    dl.append('dd').text(d3.max(data, d => d.depth));

}

function updateScatterplot(filteredCommits) {
    const width = 1000;
    const height = 600;

    // Sort commits by total lines in descending order
    const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);
    // Creates Margin and Area for Scatterplot
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };

    const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
    const rScale = d3
        .scaleSqrt() // Change only this line
        .domain([minLines, maxLines])
        .range([5, 20]);


    // Clear and create SVG
    d3.select('svg').remove();
    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    xScale = d3
        .scaleTime()
        .domain(d3.extent(filteredCommits, (d) => d.datetime))
        .range([0, width])
        .nice();
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Clear all scatterplot dots and replace them with filtered ones
    svg.selectAll('g').remove(); 
    
    // Create Gridlines
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create Dots
    const dots = svg.append('g').attr('class', 'dots');
    
    dots.selectAll('circle').remove();
    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill-opacity', 0.7) // Add transparency for overlapping dots
        .on('mouseenter', (event, commit) => {
            d3.select(event.currentTarget)
              .style('fill-opacity', 1)
              .classed('selected', true); // Full opacity on hover
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
          })
        .on('mouseleave', () => {
            d3.select(event.currentTarget)
              .style('fill-opacity', 0.7)
              .classed('selected', false); // Reset opacity on mouse leave
            updateTooltipContent({}); // Clear tooltip content
            updateTooltipVisibility(false);
          });
    

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
    // Add X axis
    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);
    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    brushSelector();

}

// Update Tooltip Function
function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full',
    });
  }

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// Brush Functions
let brushSelection = null;
let selectedCommits = [];

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

function brushed(event) {
    brushSelection = event.selection;
    selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter((filteredCommit) => {
      let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
      let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
      let x = xScale(filteredCommit.date);
      let y = yScale(filteredCommit.hourFrac);

      return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });

    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

// Update selections
function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

// update commit data
function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? filteredCommits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }  

// Lab 8
// Create maximum time and scale
let commitProgress = 100;
let timeScale;
let commitMaxTime;

const timeSlider = document.getElementById("time-slider");
const selectedTime = document.getElementById("selected-time");

function updateCommitTime() {
  // update current time scale
  timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
  // Find progress on bar
  commitProgress = Number(timeSlider.value);
  commitMaxTime = timeScale.invert(commitProgress);
  selectedTime.textContent = commitMaxTime.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });

  filterCommitsByTime();
  updateScatterplot(filteredCommits);
  updateFiles();
}

// Change time when slider is moved
timeSlider.addEventListener('input', updateCommitTime);

function filterCommitsByTime() {
  filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
  return filteredCommits;
}


// Step 2
function updateFiles() {
  // Update the shown files
  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = [];
  files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });
  
  // Clear all files
  d3.select('.files').selectAll('div').remove();
  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').append('code').text(d => d.name);
  filesContainer.append('dd').text(d => d.lines.length);
}
