require("dotenv").config();

const { Client, Collection } = require("discord.js");

const Poker = require("./poker");

const client = new Client();

const games = new Collection();

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (message.author.username === "planning-poker-bot") return;

  if (message.content === "!start") {
    if (games.has(message.channel.id)) {
      message.channel.send("Game is already in progress in this channel!");
      return;
    }
    games.set(message.channel.id, true);
    message.channel.send("Welcome to planning poker");
    message.channel.send("Please start your first round with !play [QUESTION]");
    message.channel.send(
      "For each round you've got 30 seconds to write your guessed number of story points via dm to the bot"
    );
    message.channel.send("You can stop playing by typing !end");

    return;
  }

  if (message.content.startsWith("!play")) {
    if (Poker.isQuestionRunning) return message.channel.send("There is already a question in progress.");

    const question = message.content.split(" ").splice(1).join(" ");

    message.channel.send(`First question: ${question}`);
    message.channel.send("Please provide your guesses");

    Poker.playQuestion(question);

    setTimeout(() => {
      message.channel.send("Time's up!");
      message.channel.send(
        "Please enter the number of storypoints with !storypoints [AMOUNT] when you finished discussing"
      );
      for (const answer of Poker.currentAnswers) {
        message.channel.send(`${answer.user}: ${answer.points}`);
      }
    }, 30 * 1000);

    return;
  }

  if (message.content.startsWith("!storypoints")) {
    if (!Poker.isQuestionRunning) return message.channel.send("You are currently not answering a question.");

    const storypoints = message.content.split(" ")[1];

    message.channel.send(
      `Added ${storypoints} to your question ${Poker.currentQuestion}`
    );

    Poker.finishQuestion(storypoints);
  }

  if (message.content === "!end") {
    message.channel.send("Planning Poker finished");
    message.channel.send("Here is an overview of your game:");
    if (games.has(message.channel.id)) games.delete(message.channel.id);

    for (const question of Poker.questions)
      message.channel.send(
        `Question: ${question.question} Story Points: ${question.storypoints}`
      );

    Poker.finishGame();

    return;
  }

  if (message.channel.type === "dm" && Poker.isQuestionRunning) {
    Poker.addAnswer(message.author.username, message.content);
  }
});

client.login(process.env.DISCORD_SECRET);
