import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }

const height = 450 - margin.top - margin.bottom

const width = 1100 - margin.left - margin.right

const svg = d3
  .select('#chart-5')
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
  .range([35, radius])

const line = d3
  .radialArea()
  .angle(d => angleScale(d.month_name))
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
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
      datapoints.push(datapoints[0])

      svg
        .append('path')
        .datum(datapoints)
        .attr('d', line)
        .attr('fill', 'pink')

      svg
        .append('text')
        .text(d.key)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 16)
        .attr('font-weight', '600')

      const bands = [20, 40, 60, 80, 100]
      const labelbands = [20, 60, 100]
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
        .attr('dy', -5)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
    })

  svg
    .append('text')
    .text('Average Monthly Temperatures')
    .attr('x', width / 2)
    .attr('dy', 10)
    .style('font-size', 32)
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

  svg
    .append('text')
    .text('in cities around the world')
    .attr('x', width / 2)
    .attr('dy', 40)
    .style('font-size', 16)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
}
