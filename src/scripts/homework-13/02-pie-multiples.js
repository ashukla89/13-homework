import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
// .attr('transform', `translate(${width / 2},${height / 2})`)

const pie = d3.pie().value(function(d) {
  return d.minutes
})

const radius = 80

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius)

const pointScale = d3.scalePoint().range([0, width])
const colorScale = d3.scaleOrdinal().range(['#7fc97f', '#beaed4', '#fdc086'])

d3.csv(require('/data/time-breakdown-all.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  // Group your data together
  const nested = d3
    .nest()
    .key(d => d.project)
    .entries(datapoints)

  const projects = datapoints.map(d => d.project)
  pointScale.domain(projects).padding(0.4)

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
        .selectAll('path')
        .data(pie(datapoints))
        .enter()
        .append('path')
        .attr('d', d => arc(d))
        .attr('fill', d => colorScale(d.data.task))

      svg
        .append('text')
        .text(function(d) {
          console.log(d.key)
          return d.key
        })
        // .attr('x', pointScale(d))
        .attr('y', radius) // set it up at the bottom of the chart
        .attr('dy', 20) // give a little offset to push it lower
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 16)
    })
}
