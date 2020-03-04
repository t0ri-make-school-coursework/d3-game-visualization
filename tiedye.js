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
      user_score
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
    this.score = metascore
    this.userAverage = user_score
  }
}


function getData(data) {
  // Get JSON and pass to `handleData()`
  d3.json(data)
    .then(json => handleData(json))
}


function handleData(data) {
  // Create array of Game objects from data
  let games = []
  data.forEach(game => games.push(new Game(game)))

  // Filter for games from just 2010 - 2020
  const newGames = games.filter(game => game.release.slice(-5) > 2010)

  // Filter `newGames` for games for known publishers
  const publishers = ['Jackbox Games, Inc.', 'Bandai Namco Games', 'Blizzard Entertainment', 'Disney Interactive Studios', 'Telltale Games', 'Deep Silver', 'Paradox Interactive', 'NIS America', 'EA Sports', 'PopCap', 'Capcom', 'EA Games', 'Atari', 'Activision', 'Zen Studios', 'Rockstar Games', 'Square Enix', 'Namco Bandai Games', 'Sega', 'Konami', 'Microsoft Game Studios', '2K Sports', 'Ubisoft', 'SCEA', 'Nintendo', 'Electronic Arts', 'Warner Bros. Interactive Entertainment', 'Bethesda Softworks', 'Valve Software']
  const knownGames = newGames.filter((game) => publishers.includes(game.publisher))
  
  // Create visualization with `newGames`
  createVisualization(knownGames)
}


function createVisualization(games) {
  // Set height and width for data visualization
  const height = 1200
  const width = 1200

  // Create function to control color presented in circles based on data
  const color = d3.scaleOrdinal(games.map(d => d.score), d3.schemeCategory10)

  // Create a pack function using `width`, `height`, `games`, and `game.score`
  const pack = games => d3.pack()
    .size([width - 2, height - 2])
    .padding(10)
  
    (d3.hierarchy({children: games})
      .sum(d => d.score))
      
  // Set root to the output of the pack function
  const root = pack(games)

  // Apply attributes and styles to <svg>
  const svg = d3.select(document.querySelector('svg'))
    .style('width', '100%')
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .style('border', '1px solid')

  // Apply many <g>s to create leaves on the root node out of `games`
  const leaf = svg.selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', (d) => `translate(${d.x + 1},${d.y + 1})`) // <-- change location of circles

  // Create a circle on each <g>
  leaf.append('circle')
    .attr('r', d => d.data.score)
    .attr('fill-opacity', 0.1)
    .attr('fill', d => color(d.data.score))
  
  // Apply text to each circle with `game.name`
  leaf.append('text')
    .attr('clip-path', d => d.clipUid)
    .selectAll('tspan')
    .data(d => d.data.name)
    .join('tspan')
    .attr('x', 0)
    .attr('y', (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    .text(d => d)

  // Create tooltip with `game.name` and `game.score`
  leaf.append('title')
    .text(d => `${d.data.name}\n${d.data.score}`)

  // Return the visualization
  return svg.node()
}

getData('./metacritic_games.json')
