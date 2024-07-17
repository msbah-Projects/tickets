const client = require("../.")
const config = client.config;
const { getTable, createEmbed} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'user_panel',
	permissions: [],
	run: async (client, interaction) => {
        const db = await getTable("ticket");

		const ticket = await db.get(`tickets_${interaction.channel.id}`);


		const embed = await createEmbed("لوحة تحكم الأعضاء", "الرجاء اختيار الزر المناسب لك",interaction)



 
 const req_add_member = new ButtonBuilder()
 .setCustomId('req_add_member')
 .setLabel('طلب اضافة اعضاء')
 .setEmoji("🙋‍♂️")
 .setStyle(ButtonStyle.Secondary);

 const req_rename = new ButtonBuilder()
 .setCustomId('req_rename')
 .setLabel('طلب تغير اسم التذكرة')
 .setEmoji("🔖")
 .setStyle(ButtonStyle.Secondary);

 const Ticket_info = new ButtonBuilder()
 .setCustomId('Ticket_info')
 .setLabel('معلومات التذكرة')
 .setEmoji("🧾")
 .setStyle(ButtonStyle.Secondary);


 const row = new ActionRowBuilder()
 .addComponents(req_add_member,req_rename,Ticket_info);


		await interaction.reply({embeds: [embed],components: [row],ephemeral:true})	
	}
};
