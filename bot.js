const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (message.content === '!info') {
    	message.channel.send({embed:{
            title:"Info",
            description:"Researched and developed with funding from the US Department of Technology by <@317619987311230976>",
            color: 0xFF3939
        }})
  	}
});

client.on('message', message => {
    if (message.content === '!help') {
    	message.channel.send({embed:{
            title:"Need help?",
            description:"Send a PM to <@317619987311230976>",
            color: 0x70f1f4
        }})
  	}
});

client.on('message', message => {
    if (message.content === 'Tragic') {
    	message.channel.send('xoxo');
  	}
});

client.on('message', message => {
    if (message.content === 'tragic') {
    	message.channel.send('xoxo');
  	}
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.channel.send("Permission denied.");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    let member = message.mentions.members.first();
    if(!member)
      return message.channel.send("Please mention a user.");
    if(!member.kickable) 
      return message.channel.send("Unable to kick user. Check role hierarchy.");
    
    // slice(1) removes the first part, which here should be the user mention!
    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.channel.send("Indicate valid reason.");
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.channel.send(`:ok_hand: kicked ${member.user.tag} (${reason})`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.channel.send("Permission denied.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a user.");
    if(!member.bannable) 
      return message.channel.send("Unable to ban user. Check role hierarchy.");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Invalid reason.");
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.channel.send(`:ok_hand: ${member.user.tag} has been banned by ${message.author.tag} (${reason})`);
  }
 
  if(command === "mute") {
      if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.sendMessage("Insufficient permissions.");
   
      let toMute = message.mentions.members.first() || message.guild.members.get(args[0]);
      if(!toMute) return message.channel.sendMessage("Please specify a user or ID");
   
      let role = message.guild.roles.find(r => r.name === "Muted");
      if(!role) {
          try{
             role = await message.guild.createRole({
             name: "Muted",
             color: "#000000",
             permissions: []
         });
    
         message.guild.channels.forEach(async (channel, id) => {
             await channel.overwritePermissions(role, {
                 SEND_MESSAGES: false,
                 ADD_REACTIONS: false
             });
            });
        } catch(e) {
            console.log(e.stack);
        } 
   }
   
   if(toMute.roles.has(role.id)) return message.channel.sendMessage("This user is already muted.");
   
   await toMute.addRole(role);
   message.channel.sendMessage("Done.")
    
   return;
   
  }
 
    if(command === "unmute") {
       if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.sendMessage("Insufficient permissions.");
   
       let toMute = message.mentions.members.first() || message.guild.members.get(args[0]);
       if(!toMute) return message.channel.sendMessage("Please specify a user or ID");
   
       let role = message.guild.roles.find(r => r.name === "Muted");
   
       if(!role || !toMute.roles.has(role.id)) return message.channel.sendMessage("This user is not muted.");
   
       await toMute.removeRole(role);
       message.channel.sendMessage("Done.")
    
       return;
   
  }
   
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({count: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
