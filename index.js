//Getting the canvas and canvas context.
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//Getting the score.
const score = document.querySelector('#score')

//Getting the start game button.
const startGameBTN = document.querySelector('#startGameBTN')

//Getting the modal.
const modal = document.querySelector('#modal')

//Getting the ending score.
const scoreEnd = document.querySelector('#scoreEnd')

//Setting the canvas size to display window size.
canvas.width = innerWidth
canvas.height = innerHeight

//Storing the center of the canvas.
let cx = canvas.width / 2
let cy = canvas.height / 2

//Creating the player class.
class Player {
    constructor(x, y, rad, color) {
        this.x = x
        this.y = y
        this.rad = rad
        this.color = color
    }

    //Creating the players draw function.
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.rad, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

//Creating the projectile class.
class Projectile {
    constructor(x, y, rad, color, vel) {
        this.x = x
        this.y = y
        this.rad = rad
        this.color = color
        this.vel = vel
    }

    //Creating the projectiles draw function.
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.rad, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    
    //Creating the projectiles update function.
    update() {
        this.draw()
        this.x = this.x + this.vel.x
        this.y = this.y + this.vel.y
    }
}

//Creating the enemy class.
class Enemy {
    constructor(x, y, rad, color, vel) {
        this.x = x
        this.y = y
        this.rad = rad
        this.color = color
        this.vel = vel
    }

    //Creating the enemies draw function.
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.rad, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    //Creating the enemies update function.
    update() {
        this.draw()
        this.x = this.x + this.vel.x
        this.y = this.y + this.vel.y
    }
}

const friction = 0.98

//Creating the particle class.
class Particle {
    constructor(x, y, rad, color, vel) {
        this.x = x
        this.y = y
        this.rad = rad
        this.color = color
        this.vel = vel
        this.alpha = 1
    }

    //Creating the enemies draw function.
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.rad, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    //Creating the enemies update function.
    update() {
        this.draw()
        this.vel.x *= friction
        this.vel.y *= friction
        this.x = this.x + this.vel.x
        this.y = this.y + this.vel.y
        this.alpha -= 0.01
    }
}

//Creating the main character in the center of the canvas.
let player = new Player(
    cx,
    cy,
    10,
    'white'
)

//This is the array of all projectiles, enemies and particles.
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(
        cx,
        cy,
        10,
        'white'
    )
    projectiles = []
    enemies = []
    particles = []
    scoreVal = 0
    score.innerHTML = scoreVal
}

//Creating a function to spawn an enemy every interval. (Default: 1 Second)
function spawnEnemy() {
    //Setting the spawn interval.
    setInterval(() => {
        const rad = Math.random() * (50 - 10) + 10
        let x
        let y
        
        //Getting Top, Bottom, Left and Right at random to spawn the enemy at and spawning behind edge out of sight.
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - rad : canvas.width + rad
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - rad : canvas.height + rad
        }

        //Getting a random color for the enemy.
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        //Getting the angle to center of canvas from random edge of screen coords and setting the velocity of the enemy in that direction.
        const a = Math.atan2(cy - y, cx - x)
        const vel = {
            x: Math.cos(a),
            y: Math.sin(a)
        }

        //Adding a new enemy to the enemies array.
        enemies.push(new Enemy(x, y, rad, color, vel))
    }, 2000)
}

//Checking for a mouse click and storing the coords of cursor.
addEventListener('click', (event) => {

    //Getting the angle to cursor from center of canvas and setting the velocity of the projectile in that direction.
    const a = Math.atan2(event.clientY - cy, event.clientX - cx)
    const vel = {
        x: Math.cos(a) * 5,
        y: Math.sin(a) * 5
    }

    //Adding a projectile to the projectiles array.
    projectiles.push(new Projectile(cx, cy, 5, 'white', vel))
})

let animId
let scoreVal = 0

//Setting up the game loop in an animate function.
function animate() {
    
    //Runnng the animate function every frame and setting the frame id.
    animId = requestAnimationFrame(animate)

    //Setting the canvas to black with an opacity of 0.1 to add trailing effect.
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'

    //Clearing the canvas every frame.
    c.fillRect(0, 0, canvas.width, canvas.height)

    //Calling the players draw function.
    player.draw()

    //Calling all projectiles update and draw function from the projectiles array every frame.
    projectiles.forEach((projectile, index) => {
        projectile.update()
        
        //Removing a projectile from the array on collision with edge of canvas.
        if(
            projectile.x + projectile.rad < 0 ||
            projectile.x - projectile.rad > canvas.width ||
            projectile.y + projectile.rad < 0 ||
            projectile.y - projectile.rad > canvas.height
            ) {
            setTimeout(() => {

                //Removing the projectile from projectiles array.
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    //Calling all enemies update and draw function from the enemies array every frame.
    enemies.forEach((enemy, eIndex) => {
        enemy.update()

        //Checking for a collision between the enemy and player.
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.rad - player.rad < 1) {
            
            //Ending the game on collision.
            cancelAnimationFrame(animId)
            modal.style.display = 'flex'
            scoreEnd.innerHTML = scoreVal
        }

        //Checking for collision between every projectile and enemy.
        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if(dist - enemy.rad - projectile.rad < 1) {

                //When a projectile hits an enemy add an explosion particle effect.
                for(let i = 0; i < enemy.rad * 2; i++) {

                    //Adding all particles to the particles array.
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8)}))
                }

                //If the enemys radius is bigger then a size shrink the enemy and remove the projectile. If not then continue with removal.
                if(enemy.rad - 10 > 5) {

                    //Increase the score.
                    scoreVal += 100
                    score.innerHTML = scoreVal

                    gsap.to(enemy, {
                        rad: enemy.rad - 10
                    })
                    setTimeout(() => {
                    
                        //On collision remove the projectile from the enemies array.
                        projectiles.splice(pIndex, 1)
                    }, 0)
                } else {

                    //Increase the score.
                    scoreVal += 250
                    score.innerHTML = scoreVal

                    setTimeout(() => {
                    
                        //On collision remove the enemy and projectile from the specific array.
                        enemies.splice(eIndex, 1)
                        projectiles.splice(pIndex, 1)
                    }, 0)
                }
            }
        })
    })

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
}

startGameBTN.addEventListener('click', () => {
    init()
    modal.style.display = 'none'

    //Calling all loops to start the game.
    animate()
    spawnEnemy()
})