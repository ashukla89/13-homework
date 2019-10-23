import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-3')
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
  .domain([0, 75])
  .range([0, radius])

const colorScale = d3.scaleLinear().range(['lightblue', 'pink'])

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(d.high_temp))
  .startAngle(d => angleScale(d.month_name))
  .endAngle(d => angleScale(d.month_name) + angleScale.bandwidth())

d3.csv(require('/data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  colorScale.domain(d3.extent(datapoints, d => d.high_temp))

  svg
    .selectAll('.polar-bar')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => colorScale(d.high_temp))

  svg
    .append('circle')
    .attr('r', 3)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('fill', 'grey')

  svg
    .append('text')
    .text('NYC high temperatures, by month')
    // .attr('x', pointScale(d))
    .attr('y', -radius) // set it up at the top of the chart
    .attr('dy', 20) // give a little offset to push it higher
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .style('font-size', 32)
    .attr('font-weight', '600')
}
