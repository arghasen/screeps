# Screeps - A programming MMO game

Hello World!!! Been a long time. I recently found about the MMO game Screeps, its a game with a unique twist. Its unique in the sense that it is a MMO that needs the players to code to run their empire. There is a CPU limit of 20ms to run all the code on every tick, which means efficiency plays a huge role in this. This is an attempt to make an AI and I will be cronicling the journey on my blog

##  Beginning steps
The tutorial of the game gets us up in a fairly quick manner and it seems simple and easy. Well as we dip our feet in the game, it becomes abundantly clear that there is a lot to learn in the game and we are the bottom of the pile. 

The discord group for the game is a very helpful bunch and I ask a lot of questions. As I get my first bot up, it is a slow and steady progress. 

## Familiarizing with the API and basic tasks

The first iteration of the bot came up as very basic modification of the tutorial and there is not much going on otherwise. The basic bot is a single worker who is jack of all trades- harvesting energy, hauling it to the spawn and then upgrading the structures. While this is very easy to get up and running, it runs into its limitations very soon. More specialized workers is where I reach in a couple of days.

The bot is performing fairly well but coding in Javascript can be errorprone. Also the fact that there is no real way of "running" the code without actually uploading the code makes it hard to catch bugs. 

So we decide to end V0 of our bot and rewrite everything in Typescript to be able to work in the relative safety of OOPS and Type safety. 

The code at this point is [here](https://github.com/arghasen/screeps/tree/2022-02.02-v0.1)