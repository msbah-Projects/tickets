const { QuickDB, MySQLDriver } = require("quick.db");
const { Client, GatewayIntentBits, Partials, EmbedBuilder, TextInputStyle, TextInputBuilder, ModalBuilder, PermissionsBitField, ChannelType, WebhookClient, ActivityType, Collection, StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, SlashCommandBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require("./config.json")

let db;
let mysqlDriver;

async function connectToDatabase() {
  if (mysqlDriver && mysqlDriver.connection && mysqlDriver.connection.state !== 'disconnected') {
    console.log("Connection is already open.");
    return;
  }

  try {
    mysqlDriver = new MySQLDriver({
      host: "",
      user: "",
      password: "",
      database: "",
    });

    await mysqlDriver.connect();
    db = new QuickDB({ driver: mysqlDriver });
    console.log("Connected to the database successfully.");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

// Initial connection
(async () => {
  await connectToDatabase();
})();

// Reconnect every 30 minutes
setInterval(async () => {
  await connectToDatabase();
}, 1800000); // 30 minutes


async function getTable(tableName) {
  try {

    return db.table(tableName);
  } catch (error) {
    console.error("Error getting table:", error);
    throw error;
  }
}
  
async function IfAdmin(interaction) {
  const config = interaction.client.config;
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
 
  if (!ticket) {
    interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true});
    return false;
  }

  const tickett = (await config.panels.find(element => element.name == ticket.panel)).tickets.find(element => element.ticket_name == ticket.ticket);
  let t = false;
  
  tickett.admin_roles.forEach(role => {
    if (interaction.member.roles.cache.has(role)) t = true;
  });

  if (!t) {
    interaction.reply({content: "**هاذا الزر مخصص للمسؤولين **", ephemeral: true});
    return false;
  }
  
  return true;
}


async function createEmbed(title,text,interaction ) {
  try {
    const embed = new EmbedBuilder()
    .setTitle(title)
    	.setColor(0x0099FF)

    .setDescription(text)

    .setTimestamp();


    const extension = (interaction.guild.icon && interaction.guild.icon.endsWith(".gif")) ? "gif" : "png";
    const iconUrl = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.${extension}`;
    if(extension){
      embed.setThumbnail(iconUrl);

    }


    return embed;

  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
}



async function CloseTicket(interaction) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;;
  if(!ticket)return interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel}>`, fetchReply: true,ephemeral:true})
  if(ticket.closed)return interaction.reply({content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true ,ephemeral:true})
    
    const processingMessage = await interaction.reply({ content: "جاري اغلاق التذكرة، يرجى الانتظار...", fetchReply: true });
    const all = await db.get(`tickets_${interaction.channel.id}.invited`) || [];

if(all.length > 0){
    for (const user of all) {
 
      let t = false;
      if (user == ticket.creator) t = true;
      if (!t) {
        try {
          await db.pull(`tickets_${interaction.channel.id}.invited`, user);
          await interaction.channel.permissionOverwrites
            .edit(user, {
              SendMessages: false,
              AddReactions: false,
              ReadMessageHistory: false,
              AttachFiles: false,
              ViewChannel: false,
            });
  


        } catch (error) {
          console.error(`Error adding user ${user}:`, error);
        }
      } else {
      }
      // تأخير بسيط بين كل عملية
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    }

    await interaction.channel.permissionOverwrites
    .edit(ticket.creator, {
      SendMessages: false,
      AddReactions: false,
      ReadMessageHistory: false,
      AttachFiles: false,
      ViewChannel: false,
    });

    await db.set(`tickets_${interaction.channel.id}.closed`,true);
    await db.set(`tickets_${interaction.channel.id}.closedBy`,interaction.user.id);
    await db.set(`tickets_${interaction.channel.id}.closedAt`,Date.now());


    await interaction.channel.setName(`closed-${ticket.id}`).catch((e) => console.log(e));
    
		const row = new ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
    .setCustomId('ReOpen')
    .setLabel('اعادة فتح التذكرة')
    .setEmoji("🔓")
    .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
    .setCustomId('transcript')
    .setLabel('اخذ نسخة')
    .setEmoji("🧾")
    .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
    .setCustomId('deleteTicket')
    .setLabel('حذف التذكرة')
    .setEmoji("🗑")
    .setStyle(ButtonStyle.Danger)

    );

    const embed3 = (await createEmbed("Close Ticket", `تم اغلاق التذكرة بنجاح`, interaction)).setColor("Red");
    await processingMessage.edit({content:"", embeds: [embed3],components:[row] ,ephemeral: true });
    const ticket2 = await db.get(`tickets_${interaction.channel.id}`);

    const embed5 = (await createEmbed("Ticket Closed", `** **`, interaction)).setColor("Red");

    let claim = `Not claimed`
    
    if(ticket2.claimed){
      claim = `<@${ticket2.claimedBy}>`
    } 

    let users = "لا يوجد اعضاء خارجين داخل التذكرة"
        if(ticket2.invited.length > 0){
          users = "";
          ticket2.invited.forEach(user => {
      users += `<@${user}>, `;
    });
  }
  embed5.addFields(
    {name:`#️⃣ Id`,value:`${ticket2.id}`,inline:true},
    {name:`🙍‍♂️ Creator`,value:`<@${ticket2.creator}>`,inline:true},
    {name:`✔ Claim`,value:claim,inline:true},
    {name:`🔒 Closed by`,value:`<@${ticket2.closedBy}>`,inline:true},
    {name:`⏲ Closed At`,value:`<t:${ Math.floor(ticket2.closedAt / 1000)}>`,inline:true},
    {name:`🧾 Close reason`,value:`no reason`,inline:true},
    {name:`الأعضاء الخارجين`,value:users,inline:false},

  )

  let member = await interaction.guild.members.fetch(ticket2.creator);
  let log = await interaction.guild.channels.fetch(config.logs.CloseTicket);

  log.send({embeds:[embed5]}).catch(() => {})
  member.send({embeds:[embed5]}).catch(() => {})
    
  }



  async function ClaimTicket(interaction) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if(!ticket)return interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel}>`, fetchReply: true,ephemeral:true})
       const isAdmin = await IfAdmin(interaction);
      if (!isAdmin) return;
    if(ticket.claimed == true)return interaction.reply({content: `لقد تم استلام التذكرة من قبل اداري اخر بالفعل`, fetchReply: true,ephemeral:true})
      if(ticket.creator == interaction.user.id)return interaction.reply({content: `لا يمكنك استلام التذكرة الخاصة بك`, fetchReply: true,ephemeral:true})
  
      await db.set(`tickets_${interaction.channel.id}.claimed`, true);
      await db.set(`tickets_${interaction.channel.id}.claimedBy`, interaction.user.id);
      await db.set(`tickets_${interaction.channel.id}.claimedAt`, Date.now());
      interaction.reply({content: "تم استلام التذكرة بنجاح",ephemeral:true});
  
  
  
      const embedL = await createEmbed('Claim Ticket',`لقد قام الأدارة ${interaction.member} بأستلام التذكرة ${interaction.channel}`,interaction);
    let log = await interaction.guild.channels.fetch(config.logs.ClaimTicket);
  log.send({embeds:[embedL]});
  
      const embed = (await createEmbed("Claim", `تم استلام التذكرة من قبل الأداري: ${interaction.user}`,interaction)).setColor("Green");
  
      interaction.channel.send({embeds:[embed]});


      const tickett = (await config.panels.find((element) => element.name === ticket.panel)).tickets.find((element) => element.ticket_name === ticket.ticket);
    
      if (tickett.open_msg === "") {
          const embeddd = await GetTicketInfo(interaction);
          const msg_id = ticket.Msg;
          const channel = interaction.channel;
          try {
              const msg = await channel.messages.fetch(msg_id);
              msg.edit({embeds: [embeddd]});
          } catch (error) {
              
          }
      }
  }
async function UnClaimTicket(interaction) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if(!ticket)return interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel}>`, fetchReply: true,ephemeral:true})
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  if(!ticket.claimed || ticket.claimedBy != interaction.user.id)return interaction.reply({content: `هاذة التذكرة ليست لك`, fetchReply: true,ephemeral:true})

    await db.set(`tickets_${interaction.channel.id}.claimed`, false);
    await db.set(`tickets_${interaction.channel.id}.claimedBy`, false);
    await db.set(`tickets_${interaction.channel.id}.claimedAt`, false);

    const embedL = await createEmbed('UnClaim Ticket',`لقد قام الأدارة ${interaction.member} بألغاء استلامه التذكرة ${interaction.channel}`,interaction);
  let log = await interaction.guild.channels.fetch(config.logs.ClaimTicket);
log.send({embeds:[embedL]});
    interaction.reply({content: "تم الغاء استلام التذكرة بنجاح",ephemeral:true});


    const tickett = (await config.panels.find((element) => element.name === ticket.panel)).tickets.find((element) => element.ticket_name === ticket.ticket);
    
    if (tickett.open_msg === "") {
        const embeddd = await GetTicketInfo(interaction);
        const msg_id = ticket.Msg;
        const channel = interaction.channel;
        try {
            const msg = await channel.messages.fetch(msg_id);
            msg.edit({embeds: [embeddd]});
        } catch (error) {
            
        }
    }
}


const discordTranscripts = require('discord-html-transcripts');

async function Transcript(interaction) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if(!ticket)return interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel}>`, fetchReply: true,ephemeral:true})
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;


    const channel = interaction.channel; // or however you get your TextChannel
    let filename = `ticket-${ticket.id}`

    const save = await discordTranscripts.createTranscript(channel, {
      filename: filename+".html", // Only valid with returnType is 'attachment'. Name of attachment.
      saveImages: true,
      returnType: "attachment", // Download all images and include the image data in the HTML (allows viewing the image even after it has been deleted) (! WILL INCREASE FILE SIZE !)
      footerText: "Exported {number} message{s} ", // Change text at footer, don't forget to put {number} to show how much messages got exported, and {s} for plural

      poweredBy: false, // Whether to include the "Powered by discord-html-transcripts" footer
      hydrate: false, // Whether to hydrate the html server-side
    });


    const wait = await createEmbed("Transcript","جاري اخذ نسخة للتذكرة",interaction);
    wait.setColor(0xA87510)
    const done = await createEmbed("Transcript","تم اخذ نسخة بنجاح",interaction);
    done.setColor(0x44CC00)





    interaction.channel.send({ embeds: [wait] }).then((msg) => {
      setTimeout(async  () => {
        msg.edit({ embeds: [done] });
        await msg.channel.send({ files: [save] });
        const embedL = await createEmbed('Transcript',`لقد قام الأدارة ${interaction.member} بأخذ نسخه للتذكرة ${interaction.channel}`,interaction);
        let log = await interaction.guild.channels.fetch(config.logs.Transcript);
        log.send({embeds:[embedL],files: [save]});
      }, 2000);
    }).catch(error => {
      if(error) return;
    });
}



async function Members_panel(interaction) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if(!ticket)return interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel}>`, fetchReply: true,ephemeral:true})
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;


    if(ticket.closed)return interaction.reply({content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true ,ephemeral:true})



    const members = [{name: `صاحب التذكرة`,value: ` <@${ticket.creator}> `,inline:true}]

    if(ticket.invited.length > 0){
      ticket.invited.forEach(user => {
        members.push({name: `عضو`,value: `<@${user}>`,inline:true })
      });
    }


    const add_member = new ButtonBuilder()
    .setCustomId('add_member')
    .setLabel('اضافة عضو')
    .setEmoji("➕")
    .setStyle(ButtonStyle.Success);
    const remove_member = new ButtonBuilder()
    .setCustomId('remove_member')
    .setLabel('ازالة عضو')
    .setEmoji("➖")
    .setStyle(ButtonStyle.Danger);
   
 const row = new ActionRowBuilder()
 .addComponents(add_member, remove_member);
    const embed = (await createEmbed("Members panel", "** **",interaction))
    .addFields(members);
  interaction.reply({embeds:[embed],components: [row], ephemeral:true})
  }

  async function Add_members(interaction, users,isreq) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true });
    if (ticket.closed) return interaction.reply({ content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true, ephemeral: true });
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
    const embed = await createEmbed("Members panel", "الرجاء اختيار اعضاء حقيقية", interaction);
    if (users.length < 1) return interaction.reply({ embeds: [embed], ephemeral: true });
  
    const all = await db.get(`tickets_${interaction.channel.id}.invited`) || [];
    let invites = "";
    const processingMessage = await interaction.reply({ content: "جاري إضافة الأعضاء، يرجى الانتظار...", fetchReply: true });
  
    for (const user of users) {
      let t = false;
      for (const invited of all) {
        if (user == invited) {
          t = true;
          break;
        }
      }
  
      if (user == ticket.creator) t = true;
      if (!t) {
        try {
          await db.push(`tickets_${interaction.channel.id}.invited`, user);
          await interaction.channel.permissionOverwrites
            .edit(user, {
              SendMessages: true,
              AddReactions: true,
              ReadMessageHistory: true,
              AttachFiles: true,
              ViewChannel: true,
            });
  
          invites += `<@${user}>, `


        } catch (error) {
          console.error(`Error adding user ${user}:`, error);
        }
      } else {
      }
      // تأخير بسيط بين كل عملية
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    const embed3 = await createEmbed("Members panel", `تم إضافة الأعضاء بنجاح \n الأعضاء: ${invites}`, interaction);
    await processingMessage.edit({content:"", embeds: [embed3], ephemeral: true });

    if(!isreq){
      const embedL = await createEmbed('Add Members',`لقد قام الأدارة ${interaction.member} بأضافة اعضاء للتذكرة ${interaction.channel}\n الأعضاء: ${invites}`,interaction);
      let log = await interaction.guild.channels.fetch(config.logs.Add_RemoveMembers);
      log.send({embeds:[embedL]});
    }else {
      const embedL = await createEmbed('Add Members',`لقد قام الأدارة ${interaction.member} بأضافة اعضاء للتذكرة ${interaction.channel} بطلب من صاحب التذكرة\n الأعضاء: ${invites}`,interaction);
      let log = await interaction.guild.channels.fetch(config.logs.Add_RemoveMembers);
      log.send({embeds:[embedL]});
    }
  }
  
  
  
  


  async function Remove_members_select(interaction) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if(!ticket)return interaction.reply({content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel}>`, fetchReply: true,ephemeral:true})
      if(ticket.closed)return interaction.reply({content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true ,ephemeral:true})
         const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
        if(ticket.invited.length < 1)return interaction.reply({content: `لا يوجد اعضاء خارجية داخل التذكرة`, fetchReply: true ,ephemeral:true})
          const select = new StringSelectMenuBuilder()
        .setCustomId('remove_member_select')
        .setPlaceholder('الرجاء اختيار الأعضاء.')
        .setMinValues(1)
        .setMaxValues(ticket.invited.length);


          ticket.invited.forEach(async user => {
            let member = await interaction.guild.members.fetch(user);

            select.addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel(member.user.globalName || member.user.username)
                .setValue(user)
            );
          })
          const row = new ActionRowBuilder()
          .addComponents(select);
          const embed = await createEmbed("Remove member", "الرجاء اختيار الأعضاء من الأسفل",interaction);
          await interaction.reply({
            embeds:[embed],
            components: [row],
            ephemeral:true,
        });
      

  }

  async function Remove_members(interaction, users,isreq) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true });
    if (ticket.closed) return interaction.reply({ content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true, ephemeral: true });
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
    const embed = await createEmbed("Members panel", "الرجاء اختيار اعضاء موجودين في التذكرة", interaction);
    if (users.length < 1) return interaction.reply({ embeds: [embed], ephemeral: true });
  
    const all = await db.get(`tickets_${interaction.channel.id}.invited`) || [];
    let invites = "";

    const processingMessage = await interaction.reply({ content: "جاري إزالة الأعضاء، يرجى الانتظار...", fetchReply: true });
  
    for (const user of users) {
      let t = false;
      for (const userr of all) {
        if (userr == user) {
          t = true;
          break;
        }
      }
  
      if (t) {
        try {
          await db.pull(`tickets_${interaction.channel.id}.invited`, user);
          await interaction.channel.permissionOverwrites
            .edit(user, {
              SendMessages: false,
              AddReactions: false,
              ReadMessageHistory: false,
              AttachFiles: false,
              ViewChannel: false,
            });
  
            invites += `<@${user}>, `

        } catch (error) {
          console.error(`Error removing user ${user}:`, error);
        }
      } else {
      }
      // تأخير بسيط بين كل عملية
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    const embed3 = await createEmbed("Members panel", `تم إزالة الأعضاء بنجاح \n الأعضاء: ${invites}`, interaction);
    await processingMessage.edit({content:"", embeds: [embed3], ephemeral: true });
    if(!isreq){
      const embedL = await createEmbed('Remove Members',`لقد قام الأدارة ${interaction.member} بأزالة اعضاء من التذكرة ${interaction.channel}\n الأعضاء: ${invites}`,interaction);
      let log = await interaction.guild.channels.fetch(config.logs.Add_RemoveMembers);
      log.send({embeds:[embedL]});
    }else {
      const embedL = await createEmbed('Remove Members',`لقد قام الأدارة ${interaction.member} بأزالة اعضاء من التذكرة ${interaction.channel} بطلب من صاحب التذكرة\n الأعضاء: ${invites}`,interaction);
      let log = await interaction.guild.channels.fetch(config.logs.Add_RemoveMembers);
      log.send({embeds:[embedL]});
    }
  }
  
  
  
  async function Rename(interaction, name, isreq) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true });
    if (ticket.closed) return interaction.reply({ content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true, ephemeral: true });
    let differenceSeconds = 0;
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
    if(ticket.warnRename == false){
      const differenceMilliseconds = Date.now() - ticket.lastRename; // الفرق بين الوقتين بالميللي ثانية
      differenceSeconds = differenceMilliseconds / 1000; // الفرق بين الوقتين بالثواني
    
      if(differenceSeconds < 10) {
        return interaction.reply({ content: `الرجاء انتظار ${10 - differenceSeconds}S لتغيير اسم التذكرة مرة اخرى`, fetchReply: true, ephemeral: true });
      }else {
        await db.set(`tickets_${interaction.channel.id}.warnRename`, true);

      }
    } else {
      const differenceMilliseconds = Date.now() - ticket.lastRename; // الفرق بين الوقتين بالميللي ثانية
      differenceSeconds = differenceMilliseconds / 1000; // الفرق بين الوقتين بالثواني
  
      if(differenceSeconds < 600) { // 600 ثانية = 10 دقائق
        const remainingSeconds = 600 - differenceSeconds;

        return interaction.reply({ content: `يجب أن تنتظر ${Math.ceil(remainingSeconds / 60)} دقيقة و ${Math.ceil(remainingSeconds % 60)} ثانية لتغيير اسم التذكرة مرة أخرى`, fetchReply: true, ephemeral: true });
      } else {
        // إذا مرت 10 دقائق، قم بتعيين warnRename إلى false مرة أخرى
        await db.set(`tickets_${interaction.channel.id}.warnRename`, false);
      }
    }
  
    const oldName = interaction.channel.name;
    const newName = name.replace("{id}", ticket.id);
    await interaction.channel.setName(newName).catch((e) => console.log(e));
    await db.set(`tickets_${interaction.channel.id}.lastRename`, Date.now());
  
    const embed = await createEmbed("rename", `تم تغيير اسم التذكرة بنجاح الى: ${newName}`, interaction);
    interaction.reply({ embeds: [embed] });

    if(!isreq){
      const embedL = await createEmbed('Rename Ticket',`لقد قام الأدارة ${interaction.member} بتغير اسم التذكرة ${interaction.channel}`,interaction);
      embedL.addFields({name: "الأسم القديم", value: oldName, inline: true},{name: "الأسم الجديد", value: newName, inline: true},)
      let log = await interaction.guild.channels.fetch(config.logs.Rename);
      log.send({embeds:[embedL]});
    }else {
      const embedL = await createEmbed('Rename Ticket',`لقد قام الأدارة ${interaction.member} بتغير اسم التذكرة ${interaction.channel} بطلب من صاحب التذكرة`,interaction);
      embedL.addFields({name: "الأسم القديم", value: oldName, inline: true},{name: "الأسم الجديد", value: newName, inline: true},)
      
      let log = await interaction.guild.channels.fetch(config.logs.Rename);
      log.send({embeds:[embedL]});
    }
  }
  
  
  async function SendMsg(interaction, text) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true });
    if (ticket.closed) return interaction.reply({ content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true, ephemeral: true });
    let member = await interaction.guild.members.fetch(ticket.creator);
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
    if(text == ""){
      const embed = await createEmbed("رسالة مهمة", `الرجاء مراجعة التذكرة الخاصة بك \n التذكرة:${interaction.channel}`,interaction);
      member.send({embeds:[embed]}).then(async msg => {
        await interaction.reply({
          content:"تم ارسال الرسالة لصاحب التذكرة",
          ephemeral:true,
      });
        
      const embedL = await createEmbed('Send Msg',`لقد قام الأدارة ${interaction.member} بأرسال رسالة لصاحب التذكرة: ${interaction.channel} \n الرسالة: الرجاء مراجعة التذكرة الخاصة بك`,interaction);
      
      let log = await interaction.guild.channels.fetch(config.logs.SendMsg);
      log.send({embeds:[embedL]});
      }).catch(async err => {
        await interaction.reply({
          content:"ان الصاحب التذكرة مانع الرسائل في الخاص",
          ephemeral:true,
      });
      })
    }else {

      const embed = await createEmbed("رسالة مهمة", `${text}\n التذكرة:${interaction.channel}`,interaction);
      member.send({embeds:[embed]}).then(async msg => {
        await interaction.reply({
          content:"تم ارسال الرسالة لصاحب التذكرة",
          ephemeral:true,
      });
    
      const embedL = await createEmbed('Send Msg',`لقد قام الأدارة ${interaction.member} بأرسال رسالة لصاحب التذكرة: ${interaction.channel} \n الرسالة: ${text}`,interaction);
      
      let log = await interaction.guild.channels.fetch(config.logs.SendMsg);
      log.send({embeds:[embedL]});

      }).catch(async err => {
        await interaction.reply({
          content:"ان الصاحب التذكرة مانع الرسائل في الخاص",
          ephemeral:true,
      });
      })
    }


  }
  




  async function AdminTicketInfo(interaction) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true });
    if (ticket.closed) return interaction.reply({ content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true, ephemeral: true });
     const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
    const embed = await createEmbed("Ticket Info","** **", interaction);


    let claim = `Not claimed`
    
      if(ticket.claimed){
        claim = `<@${ticket.claimedBy}>`
      }
    embed.addFields(
      {name:`#️⃣ Id`,value:`${ticket.id}`,inline:true},
      {name:`🙍‍♂️ Creator`,value:`<@${ticket.creator}>`,inline:true},
      {name:`✔ Claim`,value:claim,inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},

      {name:`📩 Ticket Type`,value:ticket.ticket,inline:true},
      {name:`▶ Panel Type`,value:ticket.panel,inline:true},
      {name:`🔓 Opened In`,value:`<t:${ Math.floor(ticket.createdAt / 1000)}>`,inline:true},
    )


    interaction.reply({
      ephemeral:true,
      embeds:[embed]
    })
  }


  async function GetTicketInfo(interaction) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return ;
    const embed = await createEmbed("Ticket Info","** **", interaction);


    let claim = `Not claimed`
    
      if(ticket.claimed){
        claim = `<@${ticket.claimedBy}>`
      }
    embed.addFields(
      {name:`#️⃣ Id`,value:`${ticket.id}`,inline:true},
      {name:`🙍‍♂️ Creator`,value:`<@${ticket.creator}>`,inline:true},
      {name:`✔ Claim`,value:claim,inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},

      {name:`📩 Ticket Type`,value:ticket.ticket,inline:true},
      {name:`▶ Panel Type`,value:ticket.panel,inline:true},
      {name:`🔓 Opened In`,value:`<t:${ Math.floor(ticket.createdAt / 1000)}>`,inline:true},
    )


   return embed;
  }

  async function Ticket_info(interaction) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) return interaction.reply({ content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`, fetchReply: true, ephemeral: true });
    if (ticket.closed) return interaction.reply({ content: `ان هذة التذكرة مغلقة بالفعل`, fetchReply: true, ephemeral: true });
 
    const embed = await createEmbed("Ticket Info","** **", interaction);


    let claim = `Not claimed`
    
      if(ticket.claimed){
        claim = `<@${ticket.claimedBy}>`
      } 

      let users = "لا يوجد اعضاء خارجين داخل التذكرة"
          if(ticket.invited.length > 0){
            users = "";
      ticket.invited.forEach(user => {
        users += `<@${user}>, `;
      });
    }
    embed.addFields(
      {name:`#️⃣ Id`,value:`${ticket.id}`,inline:true},
      {name:`🙍‍♂️ Creator`,value:`<@${ticket.creator}>`,inline:true},
      {name:`✔ Claim`,value:claim,inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`\u200B`,value:"\u200B",inline:true},
      {name:`الأعضاء الخارجين`,value:users,inline:false},

    )


    interaction.reply({
      ephemeral:true,
      embeds:[embed]
    })
  }
 


  async function Req_Add_members(interaction, users) {
    const db = await getTable("ticket");
    const ticket = await db.get(`tickets_${interaction.channel.id}`);
    if (!ticket) {
        return interaction.reply({
            content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
            fetchReply: true,
            ephemeral: true
        });
    }
 
    if (ticket.closed) return interaction.reply({content: `ان هذة التذكرة مغلقة بالفعل`,fetchReply: true,ephemeral: true});
    
    
    if (ticket.reqUsers.length > 0) {
        return interaction.reply({
            content: `الرجاء انتظار الرد على الطلب السابق`,
            fetchReply: true,
            ephemeral: true
        });
    }

    let members = "";
    for (const user of users) {
        await db.push(`tickets_${interaction.channel.id}.reqUsers`, user);
        members += `[ <@${user}> ] `;
    }

    const embed = await createEmbed("Add member", `${interaction.user} يريد اضافة اعضاء الى التذكرة \n الأعضاء: ${members}`, interaction);

    const Accept = new ButtonBuilder()
        .setCustomId('Accept')
        .setLabel('قبول الطلب')
        .setEmoji("➕")
        .setStyle(ButtonStyle.Success);

    const reject = new ButtonBuilder()
        .setCustomId('reject')
        .setLabel('رفض الطلب')
        .setEmoji("✖")
        .setStyle(ButtonStyle.Danger);
        const embedL = await createEmbed('Req Add Members',`لقد قام ${interaction.user} بطلب اضافة اعضاء الى التذكرة: ${interaction.channel} \n الأعضاء: ${members}`,interaction);
      
        let log = await interaction.guild.channels.fetch(config.logs.MemeberReq);
        log.send({embeds:[embedL]});
    const row = new ActionRowBuilder().addComponents(Accept, reject);
    interaction.reply({ content: "لقد تم ارسال طلبك بنجاح", fetchReply: true, ephemeral: true });
    interaction.channel.send({ embeds: [embed], components: [row]});
}



async function AcceptAddMembers(interaction, users) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  if (ticket.closed) {
      return interaction.reply({
          content: `ان هذة التذكرة مغلقة بالفعل`,
          fetchReply: true,
          ephemeral: true
      });
  }
  
  if (ticket.reqUsers.length < 1) {
      return interaction.reply({
          content: `لقد تم الرد على الطلبات مسبقًا`,
          fetchReply: true,
          ephemeral: true
      });


  }
  for (const user of ticket.reqUsers) {
    await db.pull(`tickets_${interaction.channel.id}.reqUsers`, user);
}


const Accept = new ButtonBuilder()
.setCustomId('Accept')
.setLabel('قبول الطلب')
.setEmoji("➕")
.setDisabled(true)
.setStyle(ButtonStyle.Success);

const reject = new ButtonBuilder()
.setCustomId('reject')
.setLabel('رفض الطلب')
.setDisabled(true)
.setEmoji("✖")
.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(Accept, reject);

  interaction.message.edit({content: `تم قبول الطلب من قبل الأداري :${interaction.user}` , components: [row]})
  Add_members(interaction,ticket.reqUsers,true);


  }


async function RejectAddmembers(interaction, users) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  if (ticket.closed) {
      return interaction.reply({
          content: `ان هذة التذكرة مغلقة بالفعل`,
          fetchReply: true,
          ephemeral: true
      });
  }
  
  if (ticket.reqUsers.length < 1) {
      return interaction.reply({
          content: `لقد تم الرد على الطلبات مسبقًا`,
          fetchReply: true,
          ephemeral: true
      });


  }
  for (const user of ticket.reqUsers) {
    await db.pull(`tickets_${interaction.channel.id}.reqUsers`, user);
}

const Accept = new ButtonBuilder()
.setCustomId('Accept')
.setLabel('قبول الطلب')
.setEmoji("➕")
.setDisabled(true)
.setStyle(ButtonStyle.Success);

const reject = new ButtonBuilder()
.setCustomId('reject')
.setLabel('رفض الطلب')
.setDisabled(true)
.setEmoji("✖")
.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(Accept, reject);

  interaction.message.edit({content: `تم رفض الطلب من قبل الأداري :${interaction.user}` , components: [row]})
  interaction.reply({content:"تم رفض الطلب بنجاح", ephemeral:true})
  
  const embedL = await createEmbed('Req Add Members',`لقد قام الأداري ${interaction.user}  برفض الطلب لأضافة الأعضاء الى التذكرة: ${interaction.channel}`,interaction);
      
  let log = await interaction.guild.channels.fetch(config.logs.MemeberReq);
  log.send({embeds:[embedL]});
}
async function RejectRename(interaction, users) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  if (ticket.closed) {
      return interaction.reply({
          content: `ان هذة التذكرة مغلقة بالفعل`,
          fetchReply: true,
          ephemeral: true
      });
  }
  
  if (ticket.reqRename == false) {
      return interaction.reply({
          content: `لقد تم الرد على الطلبات مسبقًا`,
          fetchReply: true,
          ephemeral: true
      });


  }

  await db.set(`tickets_${interaction.channel.id}.reqRename`,false)
  
const Accept = new ButtonBuilder()
.setCustomId('Accept')
.setLabel('قبول الطلب')
.setEmoji("➕")
.setDisabled(true)
.setStyle(ButtonStyle.Success);

const reject = new ButtonBuilder()
.setCustomId('reject')
.setLabel('رفض الطلب')
.setDisabled(true)
.setEmoji("✖")
.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(Accept, reject);

    
const embedL = await createEmbed('Req Rename',`لقد قام الأداري ${interaction.user}  برفض الطلب تغير اسم التذكرة: ${interaction.channel}`,interaction);
      
let log = await interaction.guild.channels.fetch(config.logs.MemeberReq);
log.send({embeds:[embedL]});
interaction.message.edit({content: `تم رفض الطلب من قبل الأداري :${interaction.user}` , components: [row]})
  interaction.reply({content:"تم رفض الطلب بنجاح", ephemeral:true})
}

async function Req_Rename(interaction, name) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
 
  if (ticket.closed) {
      return interaction.reply({
          content: `ان هذة التذكرة مغلقة بالفعل`,
          fetchReply: true,
          ephemeral: true
      });
  }
  if(ticket.reqRename != false) {
         return interaction.reply({
            content: `الرجاء انتظار الرد على الطلب السابق`,
            fetchReply: true,
            ephemeral: true
        });}
        const newName = name.replace("{id}", ticket.id);
        await db.set(`tickets_${interaction.channel.id}.reqRename`,newName)

        const embed = await createEmbed("Rename", `${interaction.user} يريد تغير اسم التذكرة \n الأسم الجديد: ${newName}`, interaction);

        const Accept = new ButtonBuilder()
            .setCustomId('AcceptRename')
            .setLabel('قبول الطلب')
            .setEmoji("🔖")
            .setStyle(ButtonStyle.Success);
    
        const reject = new ButtonBuilder()
            .setCustomId('rejectRename')
            .setLabel('رفض الطلب')
            .setEmoji("✖")
            .setStyle(ButtonStyle.Danger);
            const embedL = await createEmbed('Req Rename',`لقد قام  ${interaction.user} بطلب تغير اسم التذكرة: ${interaction.channel}`,interaction);
            embedL.addFields({name: "الأسم القديم", value: interaction.channel.name, inline: true},{name: "الأسم الجديد", value: newName, inline: true},)
      
            let log = await interaction.guild.channels.fetch(config.logs.MemeberReq);
            log.send({embeds:[embedL]});
        const row = new ActionRowBuilder().addComponents(Accept, reject);
        interaction.reply({ content: "لقد تم ارسال طلبك بنجاح", fetchReply: true, ephemeral: true });
        interaction.channel.send({ embeds: [embed], components: [row]});



}

async function AcceptRename(interaction, users) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  if (ticket.closed) {
      return interaction.reply({
          content: `ان هذة التذكرة مغلقة بالفعل`,
          fetchReply: true,
          ephemeral: true
      });
  }
  
  if (ticket.reqRename == false) {
      return interaction.reply({
          content: `لقد تم الرد على الطلبات مسبقًا`,
          fetchReply: true,
          ephemeral: true
      });


  }

  Rename(interaction,ticket.reqRename,true);
  await db.set(`tickets_${interaction.channel.id}.reqRename`,false)
  
const Accept = new ButtonBuilder()
.setCustomId('Accept')
.setLabel('قبول الطلب')
.setEmoji("➕")
.setDisabled(true)
.setStyle(ButtonStyle.Success);

const reject = new ButtonBuilder()
.setCustomId('reject')
.setLabel('رفض الطلب')
.setDisabled(true)
.setEmoji("✖")
.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(Accept, reject);

  interaction.message.edit({content: `تم قبول الطلب من قبل الأداري :${interaction.user}` , components: [row]})
  // interaction.reply({content:"تم رفض الطلب بنجاح", ephemeral:true})
}

async function ReOpen(interaction) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  if (!ticket.closed) {
      return interaction.reply({
          content: `ان هذة التذكرة مفتوحة بالفعل`,
          fetchReply: true,
          ephemeral: true
      });
  }

  await interaction.channel.permissionOverwrites
  .edit(ticket.creator, {
    SendMessages: true,
    AddReactions: true,
    ReadMessageHistory: true,
    AttachFiles: true,
    ViewChannel: true,
  });

  await db.set(`tickets_${interaction.channel.id}.closed` ,false)
  await db.set(`tickets_${interaction.channel.id}.closedBy` ,false)
  await db.set(`tickets_${interaction.channel.id}.closedAt` ,false)
  const embed = await (await createEmbed(`ReOpen`, `تم اعادة فتح التذكرة من قبل الأدارة`, interaction)).setColor("Green");
  interaction.message.edit({embeds:[embed], components:[]}).catch(err => {});
  const embedL = await createEmbed('ReOpen',`لقد قام الأداري ${interaction.user} أعادة فتح التذكرة: ${interaction.channel}`,interaction);
      
  let log = await interaction.guild.channels.fetch(config.logs.ReOpen);
  log.send({embeds:[embedL]});
}

async function DeleteTicket(interaction) {
  const db = await getTable("ticket");
  const ticket = await db.get(`tickets_${interaction.channel.id}`);
  if (!ticket) {
      return interaction.reply({
          content: `هذه القناة ليست تذكرة\nالقناة: <#${interaction.channel.id}>`,
          fetchReply: true,
          ephemeral: true
      });
  }
   const isAdmin = await IfAdmin(interaction);
    if (!isAdmin) return;
  const embed = await createEmbed(`** **`, "سيتم حذف التذكرة بعد بضع ثواني",interaction);

  interaction.channel.send({embeds:[embed]})
  const embedL = await createEmbed('Delete',`لقد قام الأداري ${interaction.user} بحذف التذكرة: ${interaction.channel.name}`,interaction);

  setTimeout(async () => {
    await interaction.channel.delete().catch(() => {});
      
    let log = await interaction.guild.channels.fetch(config.logs.DeleteTicket);
    log.send({embeds:[embedL]});
  },3000)

  }
module.exports = { IfAdmin, DeleteTicket, ReOpen, RejectRename, AcceptRename, getTable, createEmbed, CloseTicket, ClaimTicket, UnClaimTicket, Transcript, Members_panel, Add_members, Remove_members_select, Remove_members, Rename, SendMsg, AdminTicketInfo, Ticket_info, Req_Add_members, AcceptAddMembers, RejectAddmembers, Req_Rename,};
