import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

// At the very least you'll need scales, and
// you'll need to read in the file. And you'll need
// and svg, too, probably.

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .attr('transform', `translate(${width / 2},${height / 2})`)

const pie = d3.pie().value(function(d) {
  return d.minutes
})

const radius = 120

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius)

const labelArc = d3
  .arc()
  .innerRadius(radius + 5)
  .outerRadius(radius + 5)
//   .startAngle(d => angleScale(d))
//   .endAngle(d => angleScale(d) + angleScale.bandwidth())

const colorScale = d3.scaleOrdinal().range(['#7fc97f', '#beaed4', '#fdc086'])

d3.csv(require('/data/time-breakdown.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  console.log(pie(datapoints))
  console.log(arc.centroid(datapoints[0]))

  svg
    .selectAll('path')
    .data(pie(datapoints))
    .enter()
    .append('path')
    .attr('d', d => arc(d))
    .attr('fill', d => colorScale(d.data.task))

  svg
    .selectAll('.outside-label')
    .data(pie(datapoints))
    .enter()
    .append('text')
    .attr('d', d => labelArc(d))
    .text(d => d.data.task)
    // .attr('y', -radius) // set it up at the top of the chart
    // .attr('dy', -10) // give a little offset to push it higher
    .attr('text-anchor', function(d) {
      if (d.startAngle > Math.PI) {
        return 'end'
      } else {
        return 'start'
      }
    })
    .attr('alignment-baseline', 'middle')
    .attr('transform', function(d) {
      return `translate(${labelArc.centroid(d)})`
    })
}
