import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
]
// I give you a month
// you give me back a number of radians
const angleScale = d3
  // .scalePoint()
  // .padding(0.5)
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

const radius = 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 90])
  .range([20, radius])

const line = d3
  .radialArea()
  .angle(d => angleScale(d.month_name))
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))

d3.csv(require('/data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  // Throw January onto the end so it connects
  datapoints.push(datapoints[0])

  svg
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'lightblue')

  svg
    .append('text')
    .text('NYC')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .style('font-size', 32)
    .attr('font-weight', '600')

  const bands = [20, 30, 40, 50, 60, 70, 80, 90]
  const labelbands = [30, 50, 70, 90]
  // Draw a circle for each item in bands
  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('r', d => radiusScale(d))

  // create labels at each band selected
  svg
    .selectAll('.label')
    .data(labelbands)
    .enter()
    .append('text')
    .text(d => d + '°')
    .attr('y', d => -radiusScale(d))
    .attr('dy', -7)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .style('font-size', 10)
}
