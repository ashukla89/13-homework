import * as d3 from 'd3'

const margin = { top: 20, left: 0, right: 0, bottom: 0 }

const height = 330 - margin.top - margin.bottom
const width = 275 - margin.left - margin.right

const container = d3.select('#chart-9')

const pointScale = d3.scalePoint().range([0, width])
const angleScale = d3.scaleBand().range([0, Math.PI * 2]) // measured in radians

const radius = 100
const radiusScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, radius])

const line = d3
  .radialLine()
  .angle(d => angleScale(d.name))
  .radius(d => radiusScale(+d.value))

const maxMinutes = 60
const maxPts = 30
const maxFg = 10
const max3p = 5
const maxFt = 10
const maxRb = 15
const maxAs = 10
const maxStl = 5
const maxBlk = 5

const longTeamNames = {
  CLE: 'Cleveland Cavaliers',
  GSW: 'Golden State Warriors',
  SAS: 'San Antonio Spurs',
  MIN: 'Minnesota Timberwolves',
  MIL: 'Milwaukee Bucks',
  PHI: 'Philadelphia 76ers',
  OKC: 'Oklahoma City Thunder',
  NOP: 'New Orleans Pelicans',
  HOU: 'Houston Rockets'
}

d3.csv(require('/data/nba.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const players = datapoints.map(d => d.Name)
  pointScale.domain(players).padding(0.4)

  // Group your data together
  const nested = d3
    .nest()
    .key(d => d.Name)
    .entries(datapoints)

  console.log(nested)

  container
    .selectAll('svg')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('transform', `translate(${width / 2},${height / 2 + 20})`)
    .each(function(d) {
      const player = d.values[0]
      console.log('player', player)

      const customDatapoints = [
        { name: 'Minutes', value: player.MP / maxMinutes },
        { name: 'Points', value: player.PTS / maxPts },
        { name: 'Field Goals', value: player.FG / maxFg },
        { name: '3-Point Field Goals', value: player.threeP / max3p },
        { name: 'Free Throws', value: player.FT / maxFt },
        { name: 'Rebounds', value: player.TRB / maxRb },
        { name: 'Assists', value: player.AST / maxAs },
        { name: 'Steals', value: player.STL / maxStl },
        { name: 'Blocks', value: player.BLK / maxBlk }
      ]

      console.log('customDatapoints', customDatapoints)

      const metrics = customDatapoints.map(d => d.name)
      angleScale.domain(metrics)

      // Throw last cat onto end to connect
      customDatapoints.push(customDatapoints[0])

      const svg = d3.select(this)
      svg
        .append('mask')
        .attr('id', `${player.Name.replace(' ', '-')}-mask`)
        .append('path')
        .datum(customDatapoints)
        .attr('d', line)
        .attr('fill', 'white')
        .attr('stroke', 'black')

      svg
        .append('circle')
        .attr('r', 3)
        .attr('cx', 0)
        .attr('cy', 0)
        .lower()

      const bands = [0.2, 0.4, 0.6, 0.8, 1]
      // Draw a circle for each item in bands
      svg
        .append('g')
        .attr('class', player.Team)
        .selectAll('.band')
        .data(bands)
        .enter()
        .append('circle')
        .attr('mask', `url(#${player.Name.replace(' ', '-')}-mask)`)
        // .attr('fill', (d, i) => {
        //   if (i % 2 === 0) {
        //     return '#c94435'
        //   } else {
        //     return '#FFB81C'
        //   }
        // })
        .attr('stroke', 'none')
        .attr('r', function(d) {
          return radiusScale(d)
        })
        .lower()

      svg
        .selectAll('.greyband')
        .data(bands)
        .enter()
        .append('circle')
        .attr('fill', (d, i) => {
          if (i % 2 === 0) {
            return '#e8e7e5'
          } else {
            return '#f6f6f6'
          }
        })
        .attr('stroke', 'none')
        .attr('r', function(d) {
          return radiusScale(d)
        })
        .lower()

      svg
        .append('text')
        .text(player.Name)
        // .attr('x', pointScale(d))
        .attr('y', -radius) // set it up at the top of the chart
        .attr('dy', -60) // give a little offset to push it higher
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 24)
      // .attr('font-weight', '600')

      svg
        .append('text')
        .text(longTeamNames[player.Team])
        // .attr('x', pointScale(d))
        .attr('y', -radius) // set it up at the top of the chart
        .attr('dy', -40) // give a little offset to push it higher
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 14)
      // .attr('font-weight', '600')

      // create labels at each band selected
      svg
        .selectAll('.minlabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxMinutes)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
      // .attr('transform', function(d) {
      //   return `rotate(${(angleScale(d.name) * 180) / Math.PI})`
      // })

      // create labels at each band selected
      svg
        .selectAll('.ptslabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxPts)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Points') * 180) / Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.fglabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxFg)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Field Goals') * 180) / Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.threeplabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * max3p)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('3-Point Field Goals') * 180) /
            Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.ftlabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxFt)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Free Throws') * 180) / Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.rblabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxRb)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Rebounds') * 180) / Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.aslabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxAs)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Assists') * 180) / Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.stllabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxStl)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Steals') * 180) / Math.PI})`
        })

      // create labels at each band selected
      svg
        .selectAll('.blklabel')
        .data(bands)
        .enter()
        .append('text')
        .text(d => d * maxBlk)
        .attr('y', d => -radiusScale(d))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', 10)
        .attr('transform', function(d) {
          return `rotate(${(angleScale('Blocks') * 180) / Math.PI})`
        })

      // Add one text element for every category that angleScale knows about
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
        .style('font-size', 9)
    })
}
