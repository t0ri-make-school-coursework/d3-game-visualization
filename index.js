class Game {
  constructor(game) {
    const {
      name,
      platform,
      developer,
      publisher,
      rating,
      release_date,
      critic_positive: criticPositive,
      critic_neutral: criticNeutral,
      critic_negative: criticNegative,
      metascore,
      user_score: userScore,
      user_positive: userPositive,
      user_negative: userNegative,
      user_neutral: userNeutral
    } = game
    
    this.name = name
    this.platform = platform
    this.developer = developer
    this.publisher = publisher
    this.esrb = rating
    this.release = release_date
    this.critic = {
      positive: criticPositive,
      negative: criticNegative,
      neutral: criticNeutral
    }
    this.user = {
      positive: userPositive,
      negative: userNegative,
      neutral: userNeutral,
      total: userPositive + userNegative + userNeutral
    }
    this.score = metascore
    this.userAverage = userScore
  }
}


function getData(data) {
  // Get JSON and pass to `handleData()`
  d3.json(data).then(json => handleData(json))
}


function handleData(data) {
  // Create array of Game objects from data
  let games = []
  data.forEach(game => games.push(new Game(game)))

  // Filter for games from just 2018
  const newGames = games.filter(game => game.release.slice(-5) > 2017)

  // Filter `newGames` for games for known publishers
  const publishers = ['Blizzard Entertainment', 'Disney Interactive Studios', 'EA Sports', 'Capcom', 'EA Games', 'Activision', 'Rockstar Games', 'Square Enix', 'Namco Bandai Games', 'Sega', 'Microsoft Game Studios', 'Ubisoft', 'Nintendo', 'Electronic Arts', 'Bethesda Softworks', 'Valve Software']
  const knownGames = newGames.filter(game => publishers.includes(game.publisher))

  // Filter `knownGames` for games with more than 20 user reviews
  const reviewedByUsers = knownGames.filter(game => game.user.total > 20)

  // Create visualization with `newGames`
  createVisualization(reviewedByUsers.slice(0, reviewedByUsers.length - 1)) // hardcode: remove "The Quiet Man"
}


function createVisualization(games) {
  // Set height and width for data visualization
  const margin = 60
  const width = 3500 - 2 * margin
  const height = 925 - 2 * margin

  const svg = d3.select('svg')

  svg.append('text')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('MetaCritic Score')

  svg.append('text')
    .attr('x', width / 4 + margin)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .text('Popular Game Releases in 2018')

  svg.append('text')
    .attr('class', 'label')
    .attr('x', width / 4 + margin)
    .attr('y', height + margin * 1.7)
    .attr('text-anchor', 'middle')
    .text('Games')
  
  const chart = svg.append('g')
    .attr('transform', `translate(${margin}, ${margin})`)

  const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([50, 100])

  const xScale = d3.scaleBand()
    .range([0, width])
    .domain(games.map((game) => game.name))

  const color = d3.scaleOrdinal(games.map(game => game.platform), d3.schemeSet2)

  chart.append('g').call(d3.axisLeft(yScale))

  chart.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom()
      .scale(xScale)
      .tickSize(-height, 0, 0)
      .tickFormat(''))

  chart.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(-width, 0, 0)
      .tickFormat(''))

  chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))

  chart.selectAll()
    .data(games)
    .enter()
    .append('rect')
    .style('stroke', (game) => d3.rgb(color(game.score)).darker(1))
    .style('stroke-width', 3)
    .style('fill', (game) => color(game.score))
    .attr('x', (game) => xScale(game.name) + (xScale.bandwidth() / 4))
    .attr('y', (game) => yScale(game.score))
    .attr('height', (game) => height - yScale(game.score))
    .attr('width', (xScale.bandwidth() / 2) + 10) 
    .append('title')
    .text((game) => `${game.name}\n${game.score}\n${game.platform}`)
}

getData('./metacritic_games.json')
