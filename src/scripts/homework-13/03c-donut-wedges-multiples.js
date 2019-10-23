import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }

const height = 400 - margin.top - margin.bottom

const width = 1000 - margin.left - margin.right

const svg = d3
  .select('#chart-3c')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const pointScale = d3.scalePoint().range([0, width])

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

const radius = 65
const radiusScale = d3
  .scaleLinear()
  .domain([0, 75])
  .range([0, radius])

const colorScale = d3.scaleLinear().range(['lightblue', 'pink'])

const arc = d3
  .arc()
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))
  .startAngle(d => angleScale(d.month_name))
  .endAngle(d => angleScale(d.month_name) + angleScale.bandwidth())

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  colorScale.domain(d3.extent(datapoints, d => +d.high_temp))

  const cities = datapoints.map(d => d.city)
  pointScale.domain(cities).padding(0.4)

  // Group your data together
  const nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  svg
    .selectAll('g')
    .data(nested)
    .enter()
    .append('g')
    // .attr('transform', function(d) {
    //   return `translate(${pointScale(d.project)},${height / 2})`
    // })
    .attr('transform', function(d) {
      return 'translate(' + pointScale(d.key) + ',' + height / 2 + ')'
    })
    .each(function(d) {
      const svg = d3.select(this)
      const datapoints = d.values

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
        .text(function(d) {
          console.log(d.key)
          return d.key
        })
        // .attr('x', pointScale(d))
        .attr('y', radius) // set it up at the bottom of the chart
        .attr('dy', 40) // give a little offset to push it lower
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 16)

      // svg
      //   .append('text')
      //   .text('NYC high temperatures, by month')
      //   // .attr('x', pointScale(d))
      //   .attr('y', -radius) // set it up at the top of the chart
      //   .attr('dy', 20) // give a little offset to push it higher
      //   .attr('text-anchor', 'middle')
      //   .attr('alignment-baseline', 'middle')
      //   .style('font-size', 32)
      //   .attr('font-weight', '600')
    })
}
