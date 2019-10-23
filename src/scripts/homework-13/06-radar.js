import * as d3 from 'd3'

const margin = { top: 20, left: 0, right: 0, bottom: 0 }
const height = 400 - margin.top - margin.bottom
const width = 400 - margin.left - margin.right

const svg = d3
  .select('#chart-6')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const angleScale = d3.scaleBand().range([0, Math.PI * 2]) // measured in radians

const radius = 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 5])
  .range([0, radius])

const line = d3
  .radialLine()
  .angle(d => angleScale(d.category))
  .radius(d => radiusScale(+d.score))

d3.csv(require('/data/ratings.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const categories = datapoints.map(d => d.category)
  angleScale.domain(categories)

  // Throw last cat onto end to connect
  datapoints.push(datapoints[0])

  svg
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'pink')
    .attr('stroke', 'black')
    .attr('opacity', 0.5)

  svg
    .append('circle')
    .attr('r', 3)
    .attr('cx', 0)
    .attr('cy', 0)
    .lower()

  const bands = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  // Draw a circle for each item in bands
  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('fill', 'none')
    .attr('stroke', 'lightgrey')
    .attr('r', function(d) {
      return radiusScale(d)
    })
    .lower()

  // draw one line for every category this scale knows about
  svg
    .selectAll('.radius-line')
    .data(angleScale.domain())
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', -radius)
    .attr('stroke', 'lightgrey')
    .attr('transform', function(d) {
      return `rotate(${(angleScale(d) * 180) / Math.PI})`
    })

  // Add one tex element for every category that angleScale knows about
  svg
    .selectAll('.outside-label')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('y', -radius) // set up at 'bottom' (actually top) of chart
    .attr('dy', -10) // a little offset to push it higher
    .attr('text-anchor', 'middle')
    .attr('transform', function(d) {
      return `rotate(${(angleScale(d) * 180) / Math.PI})`
    })
    .attr('font-weight', '600')
}
