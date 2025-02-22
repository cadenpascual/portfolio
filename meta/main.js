let data = [];
let commits = [];

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
    createScatterplot();

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

function createScatterplot() {
    const width = 1000;
    const height = 600;
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



    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();
    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Create Gridlines
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));


    // Plot the dots on the chart
    const dots = svg.append('g').attr('class', 'dots');
    dots
        .selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseenter', (event, commit) => {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
          })
        .on('mouseleave', () => {
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
